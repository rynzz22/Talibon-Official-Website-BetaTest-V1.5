import { Injectable, Inject, Logger } from "@nestjs/common";
import { SupabaseService } from "../../supabase.service";
import { EmailProvider } from "./email-provider.interface";
import { ResendEmailProvider } from "./providers/resend-email.provider";
import { ConsoleEmailProvider } from "./providers/console-email.provider";
import { generateEmailForEvent, EmailTemplateData } from "./email-templates";

export interface NotificationRequestSource {
  id?: string;
  ticketId: string;
  documentType: string;
  fullName: string;
  email: string;
  mobileNumber?: string;
  barangay?: string;
  status?: string;
  submittedAt?: string;
  updatedAt?: string;
}

export interface DispatchNotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
  skipped?: boolean;
  status: "sent" | "failed" | "skipped";
}

@Injectable()
export class EmailNotificationService {
  private readonly logger = new Logger("EmailNotification");
  private provider: EmailProvider;
  private recentNotifications: Map<string, number> = new Map(); // Dedup / Idempotency tracker

  constructor(@Inject(SupabaseService) private readonly supabaseService: SupabaseService) {
    const resend = new ResendEmailProvider();
    if (resend.isConfigured()) {
      this.provider = resend;
      this.logger.log(`[EMAIL] Initialized with active provider: ${this.provider.name}`);
    } else {
      this.provider = new ConsoleEmailProvider();
      this.logger.log(`[EMAIL] No third-party email API key configured. Active provider: ${this.provider.name} (Console fallback)`);
    }

    // Periodically clean stale idempotency records (every 10 minutes)
    setInterval(() => {
      const now = Date.now();
      for (const [key, time] of this.recentNotifications.entries()) {
        if (now - time > 15 * 60 * 1000) {
          this.recentNotifications.delete(key);
        }
      }
    }, 10 * 60 * 1000);
  }

  /**
   * Helper to mask email address in logs
   */
  private maskEmail(email: string): string {
    if (!email || !email.includes("@")) return "invalid-email";
    const [user, domain] = email.split("@");
    if (user.length <= 2) return `${user[0]}*@${domain}`;
    return `${user[0]}${"*".repeat(user.length - 2)}${user[user.length - 1]}@${domain}`;
  }

  /**
   * Validate standard email address format
   */
  private isValidEmail(email?: string): boolean {
    if (!email) return false;
    const trimmed = email.trim();
    return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(trimmed);
  }

  /**
   * Fetch live municipal service requirements dynamically from public.municipal_services
   */
  private async fetchServiceRequirements(documentType: string): Promise<string[]> {
    try {
      const client = this.supabaseService.getClient();
      if (!client || !documentType) return [];

      const docClean = documentType.toLowerCase().trim();
      const { data, error } = await client
        .from("municipal_services")
        .select("name, requirements")
        .is("deleted_at", null);

      if (!error && data && data.length > 0) {
        // Find best match by name
        const match = data.find((s: any) => {
          const sName = (s.name || "").toLowerCase();
          return sName.includes(docClean) || docClean.includes(sName);
        });

        if (match && Array.isArray(match.requirements)) {
          return match.requirements;
        }
      }
    } catch (err: any) {
      this.logger.warn(`[EmailNotification] Could not fetch live service requirements: ${err?.message || err}`);
    }
    return [];
  }

  /**
   * Check idempotency to prevent duplicate notifications (re-renders, double-clicks, retries)
   */
  private async isDuplicate(ticketId: string, eventType: string, status: string): Promise<boolean> {
    const dedupKey = `${ticketId.trim().toUpperCase()}:${eventType.toUpperCase()}:${status.toUpperCase()}`;
    const now = Date.now();

    // 1. In-memory check within last 5 minutes
    const lastSentTime = this.recentNotifications.get(dedupKey);
    if (lastSentTime && now - lastSentTime < 5 * 60 * 1000) {
      return true;
    }

    // 2. Database check in public.notification_delivery_logs
    try {
      const client = this.supabaseService.getClient();
      if (client) {
        const tenMinutesAgo = new Date(now - 10 * 60 * 1000).toISOString();
        const { data, error } = await client
          .from("notification_delivery_logs")
          .select("id")
          .eq("ticket_id", ticketId)
          .eq("notification_type", eventType)
          .eq("channel", "email")
          .eq("status", "sent")
          .gte("created_at", tenMinutesAgo)
          .limit(1);

        if (!error && data && data.length > 0) {
          return true;
        }
      }
    } catch (dbErr) {
      // Non-fatal, fallback to in-memory check
    }

    return false;
  }

  /**
   * Record notification result into database audit log (public.notification_delivery_logs)
   */
  private async logDelivery(
    requestId: string | undefined,
    ticketId: string,
    recipient: string,
    notificationType: string,
    status: "sent" | "failed" | "skipped",
    messageId?: string,
    errorMessage?: string
  ): Promise<void> {
    try {
      const client = this.supabaseService.getClient();
      if (!client) return;

      const logPayload: Record<string, any> = {
        ticket_id: ticketId,
        channel: "email",
        recipient: recipient,
        notification_type: notificationType,
        status: status,
        provider_message_id: messageId || null,
        error_message: errorMessage || null
      };

      // Only attach request_id if it is a valid UUID
      const isUuid = requestId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(requestId);
      if (isUuid) {
        logPayload.request_id = requestId;
      }

      const { error } = await client.from("notification_delivery_logs").insert([logPayload]);
      if (error) {
        this.logger.warn(`[EmailNotification] notification_delivery_logs insert notice: ${error.message}`);
      }
    } catch (err: any) {
      this.logger.warn(`[EmailNotification] Could not log delivery record: ${err?.message || err}`);
    }
  }

  /**
   * Core dispatching pipeline with full validation, templating, error handling, and logging
   */
  async dispatchNotification(
    request: NotificationRequestSource,
    eventType: string,
    remarks?: string | null,
    customRequirements?: string[]
  ): Promise<DispatchNotificationResult> {
    const ticketId = (request.ticketId || "TLB-UNKNOWN").trim();
    const recipientEmail = (request.email || "").trim();
    const documentType = request.documentType || "Certificate Request";
    const status = request.status || eventType;

    // 1. Validate recipient email
    if (!this.isValidEmail(recipientEmail)) {
      this.logger.warn(`[EMAIL] Skipped notification for Ticket ${ticketId}: Recipient email is ${recipientEmail ? "INVALID (" + this.maskEmail(recipientEmail) + ")" : "ABSENT/MISSING"}.`);
      await this.logDelivery(request.id, ticketId, recipientEmail || "NONE", eventType, "skipped", undefined, "Missing or invalid email address");
      return { success: false, skipped: true, status: "skipped", error: "Missing or invalid email address." };
    }

    this.logger.log(`[EMAIL] Recipient email PRESENT (${this.maskEmail(recipientEmail)}). Evaluating notification for Ticket: ${ticketId}`);

    // 2. Check Idempotency / Duplicate
    const isDup = await this.isDuplicate(ticketId, eventType, status);
    if (isDup) {
      this.logger.log(`[EMAIL] Idempotent skip: Duplicate notification event "${eventType}" already sent recently for ${ticketId}.`);
      return { success: true, skipped: true, status: "skipped" };
    }

    // 3. Fetch live dynamic requirements if this is an additional requirements notice
    let requirements = customRequirements || [];
    const isReqsEvent = ["RETURNED", "ADDITIONAL REQUIREMENTS NEEDED", "ADDITIONAL_REQUIREMENTS"].includes(eventType.toUpperCase()) ||
      ["RETURNED", "ADDITIONAL REQUIREMENTS NEEDED", "ADDITIONAL_REQUIREMENTS"].includes(status.toUpperCase());
    
    if (isReqsEvent && requirements.length === 0) {
      requirements = await this.fetchServiceRequirements(documentType);
    }

    // 4. Construct tracking URL
    const appUrl = (process.env.APP_URL || process.env.VITE_APP_URL || "http://localhost:3000").replace(/\/$/, "");
    const trackingUrl = `${appUrl}/e-services?track=${encodeURIComponent(ticketId)}`;

    // 5. Generate Email Payload
    const templateData: EmailTemplateData = {
      citizenName: request.fullName || "Citizen",
      ticketId,
      documentType,
      status,
      statusLabel: status,
      statusColor: "#2563eb",
      remarks,
      requirements,
      submittedAt: request.submittedAt,
      updatedAt: request.updatedAt || new Date().toISOString(),
      trackingUrl,
      barangay: request.barangay
    };

    const { subject, html, text } = generateEmailForEvent(eventType, templateData);
    this.logger.log(`[EMAIL] Selected template event: "${eventType}" -> Subject: "${subject}"`);

    // 6. Attempt provider delivery
    try {
      this.logger.log(`[EMAIL_PROVIDER] Invoking ${this.provider.name} provider for Ticket: ${ticketId}, Recipient: ${this.maskEmail(recipientEmail)}`);
      const sendResult = await this.provider.sendEmail({
        to: recipientEmail,
        subject,
        html,
        text,
        tags: {
          ticket_id: ticketId,
          event_type: eventType,
          app: "digital-talibon"
        }
      });

      if (sendResult.success) {
        // Record in dedup tracker
        const dedupKey = `${ticketId.toUpperCase()}:${eventType.toUpperCase()}:${status.toUpperCase()}`;
        this.recentNotifications.set(dedupKey, Date.now());

        this.logger.log(`[EMAIL] Delivery SUCCESS for ticket ${ticketId}. Message ID: ${sendResult.messageId || "ok"}`);
        await this.logDelivery(request.id, ticketId, recipientEmail, eventType, "sent", sendResult.messageId);
        
        return {
          success: true,
          messageId: sendResult.messageId,
          status: "sent"
        };
      } else {
        this.logger.warn(`[EMAIL] Delivery FAILED for ticket ${ticketId}. Provider error: ${sendResult.error}`);
        await this.logDelivery(request.id, ticketId, recipientEmail, eventType, "failed", undefined, sendResult.error);
        
        return {
          success: false,
          error: sendResult.error,
          status: "failed"
        };
      }
    } catch (err: any) {
      const errMsg = err?.message || "Internal email provider error";
      this.logger.error(`[EMAIL] Exception during email delivery for ${ticketId}: ${errMsg}`);
      await this.logDelivery(request.id, ticketId, recipientEmail, eventType, "failed", undefined, errMsg);
      
      return {
        success: false,
        error: errMsg,
        status: "failed"
      };
    }
  }

  // ==========================================
  // CONVENIENCE SERVICE METHODS
  // ==========================================

  /**
   * Event 1: Application Submitted
   */
  async sendRequestSubmitted(request: NotificationRequestSource): Promise<DispatchNotificationResult> {
    return this.dispatchNotification(request, "SUBMITTED", "Application received and queued for review.");
  }

  /**
   * Event 2: Request Assigned / Routed to Department
   */
  async sendRequestAssigned(request: NotificationRequestSource, remarks?: string): Promise<DispatchNotificationResult> {
    return this.dispatchNotification(request, "ASSIGNED", remarks);
  }

  /**
   * Event 3: Request Under Review / Processing
   */
  async sendRequestUnderReview(request: NotificationRequestSource, remarks?: string): Promise<DispatchNotificationResult> {
    return this.dispatchNotification(request, "PROCESSING", remarks);
  }

  /**
   * Event 4: Additional Requirements Required
   */
  async sendAdditionalRequirements(
    request: NotificationRequestSource,
    remarks?: string,
    requirements?: string[]
  ): Promise<DispatchNotificationResult> {
    return this.dispatchNotification(request, "RETURNED", remarks, requirements);
  }

  /**
   * Event 5: Request Approved
   */
  async sendRequestApproved(request: NotificationRequestSource, remarks?: string): Promise<DispatchNotificationResult> {
    return this.dispatchNotification(request, "APPROVED", remarks);
  }

  /**
   * Event 6: Document Preparing
   */
  async sendPreparingDocument(request: NotificationRequestSource, remarks?: string): Promise<DispatchNotificationResult> {
    return this.dispatchNotification(request, "PREPARING", remarks);
  }

  /**
   * Event 7: Ready for Collection / Pickup
   */
  async sendReadyForClaim(request: NotificationRequestSource, remarks?: string): Promise<DispatchNotificationResult> {
    return this.dispatchNotification(request, "READY", remarks);
  }

  /**
   * Event 8: Transaction Completed
   */
  async sendRequestCompleted(request: NotificationRequestSource, remarks?: string): Promise<DispatchNotificationResult> {
    return this.dispatchNotification(request, "COMPLETED", remarks);
  }

  /**
   * Event 9: Request Rejected
   */
  async sendRequestRejected(request: NotificationRequestSource, remarks?: string): Promise<DispatchNotificationResult> {
    return this.dispatchNotification(request, "REJECTED", remarks);
  }

  /**
   * Event 10: Request Cancelled
   */
  async sendRequestCancelled(request: NotificationRequestSource, remarks?: string): Promise<DispatchNotificationResult> {
    return this.dispatchNotification(request, "CANCELLED", remarks);
  }

  /**
   * Generic Status Update
   */
  async sendStatusUpdate(
    request: NotificationRequestSource,
    status: string,
    remarks?: string
  ): Promise<DispatchNotificationResult> {
    return this.dispatchNotification(request, status, remarks);
  }
}
