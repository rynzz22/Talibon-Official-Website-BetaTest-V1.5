import { Injectable, BadRequestException, Inject } from "@nestjs/common";
import { SupabaseService } from "../../supabase.service";
import { EmailNotificationService } from "../notifications/email-notification.service";

export interface CertificateRequestPayload {
  id?: string;
  ticketId?: string;
  documentType: string;
  barangay: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  purpose: string;
  attachments?: string[];
  submittedAt?: string;
  status?: string;
  history?: {
    id?: string;
    status: string;
    remarks: string | null;
    createdAt: string;
  }[];
}

@Injectable()
export class FormsService {
  private requests: CertificateRequestPayload[] = [];

  constructor(
    @Inject(SupabaseService) private readonly supabaseService: SupabaseService,
    @Inject(EmailNotificationService) private readonly emailNotificationService: EmailNotificationService
  ) {
    // Try fetching from Supabase if connected
    this.loadFromSupabase();
  }

  private async loadFromSupabase() {
    try {
      const client = this.supabaseService.getClient();
      if (client) {
        const { data, error } = await client
          .from("certificate_requests")
          .select("*");
        if (!error && data && data.length > 0) {
          this.requests = data.map(item => ({
            id: item.id,
            ticketId: item.ticket_id || item.ticketId,
            documentType: item.document_type || item.documentType,
            barangay: item.barangay_id || item.barangay || "Poblacion",
            fullName: item.full_name || item.fullName,
            email: item.email,
            mobileNumber: item.mobile_number || item.mobileNumber,
            purpose: item.purpose,
            attachments: item.attachments || [],
            submittedAt: item.submitted_at || item.submittedAt,
            status: item.status || "Submitted"
          }));
          console.log(`[FormsService] Successfully loaded ${this.requests.length} requests from Supabase.`);
        }
      }
    } catch (err) {
      console.log("[FormsService] Supabase not connected or table 'certificate_requests' does not exist yet. Using local in-memory storage.");
    }
  }

  async getAllRequests(): Promise<CertificateRequestPayload[]> {
    try {
      const client = this.supabaseService.getClient();
      if (client) {
        const { data, error } = await client
          .from("certificate_requests")
          .select("*")
          .order("submitted_at", { ascending: false });

        if (!error && data) {
          return data.map(item => ({
            id: item.id,
            ticketId: item.ticket_id || item.ticketId,
            documentType: item.document_type || item.documentType,
            barangay: item.barangay_id || item.barangay || "Poblacion",
            fullName: item.full_name || item.fullName,
            email: item.email,
            mobileNumber: item.mobile_number || item.mobileNumber,
            purpose: item.purpose,
            attachments: item.attachments || [],
            submittedAt: item.submitted_at || item.submittedAt,
            status: item.status || "Submitted"
          }));
        }
      }
    } catch (err) {
      console.error("[FormsService] Failed to fetch all requests from Supabase, returning memory cached:", err);
    }
    return this.requests;
  }

  async updateRequestStatus(
    requestId: string,
    status: string,
    remarks: string,
    notifyCitizen: boolean = true,
    saveTimeline: boolean = true,
    notifyEmail: boolean = true,
    requirements?: string[]
  ): Promise<boolean> {
    try {
      const client = this.supabaseService.getClient();
      if (client) {
        // Map UI status to DB status
        let dbStatus = "Submitted";
        const upper = status.toUpperCase();
        if (upper === "SUBMITTED") {
          dbStatus = "Submitted";
        } else if (upper === "ASSIGNED TO DEPARTMENT" || upper === "ASSIGNED") {
          dbStatus = "Assigned";
        } else if (upper === "UNDER REVIEW" || upper === "PROCESSING") {
          dbStatus = "Processing";
        } else if (upper === "ADDITIONAL REQUIREMENTS NEEDED" || upper === "RETURNED" || upper === "RETURN") {
          dbStatus = "Returned";
        } else if (upper === "APPROVED") {
          dbStatus = "Approved";
        } else if (upper === "PREPARING DOCUMENT" || upper === "PREPARING") {
          dbStatus = "Approved"; // same DB status as Approved
        } else if (upper === "READY FOR CLAIM" || upper === "READY") {
          dbStatus = "Completed";
        } else if (upper === "CLAIMED / COMPLETED" || upper === "CLAIMED" || upper === "COMPLETED") {
          dbStatus = "Completed"; // same DB status as Completed
        } else if (upper === "REJECTED") {
          dbStatus = "Rejected";
        }

        // Get current request to check its current DB status and retrieve citizen data
        const { data: currentReq, error: fetchError } = await client
          .from("certificate_requests")
          .select("id, ticket_id, document_type, full_name, email, mobile_number, barangay_id, status")
          .eq("id", requestId)
          .maybeSingle();

        const currentDbStatus = currentReq?.status || "";

        if (currentDbStatus === dbStatus) {
          // If DB status is the same, trigger won't run. Manually insert history if requested
          if (saveTimeline) {
            try {
              await client.from("service_request_history").insert({
                request_id: requestId,
                status: dbStatus,
                remarks: remarks || `Status updated in portal: ${status}`
              });
            } catch (histErr: any) {
              console.warn("[FormsService] Failed to insert service_request_history:", histErr.message || histErr);
            }
          }
        } else {
          // Perform direct table update first
          let updateSuccess = false;
          const now = new Date().toISOString();

          try {
            const { error: srError } = await client
              .from("service_requests")
              .update({ status: dbStatus, updated_at: now })
              .eq("id", requestId);

            if (!srError) {
              updateSuccess = true;
            } else {
              const { error: crError } = await client
                .from("certificate_requests")
                .update({ status: dbStatus })
                .eq("id", requestId);

              if (!crError) updateSuccess = true;
            }
          } catch (updateErr) {
            console.warn("[FormsService] Direct table update error:", updateErr);
          }

          if (updateSuccess) {
            if (saveTimeline) {
              try {
                await client.from("service_request_history").insert({
                  request_id: requestId,
                  status: dbStatus,
                  remarks: remarks || `Status updated via Admin Dashboard: ${status}`
                });
              } catch (histErr: any) {
                console.warn("[FormsService] service_request_history insert error:", histErr?.message || histErr);
              }
            }
          } else {
            // Fallback to RPC if direct table update failed
            try {
              await client.rpc("update_request_status", {
                p_request_id: requestId,
                p_status: dbStatus,
                p_remarks: remarks || `Status updated via Admin Dashboard: ${status}`
              });
            } catch (rpcErr) {
              console.warn("[FormsService] RPC update_request_status failed:", rpcErr);
            }
          }
        }

        // Update local memory list
        const found = this.requests.find(r => r.id === requestId);
        if (found) {
          found.status = status;
        }

        // Handle Email Notification
        if (notifyEmail && currentReq?.email) {
          const reqDataForEmail = {
            id: currentReq.id || requestId,
            ticketId: currentReq.ticket_id || found?.ticketId || "TLB-REQUEST",
            documentType: currentReq.document_type || found?.documentType || "Certificate Request",
            fullName: currentReq.full_name || found?.fullName || "Citizen",
            email: currentReq.email,
            mobileNumber: currentReq.mobile_number,
            barangay: currentReq.barangay_id,
            status: status
          };

          const isReqs = ["RETURNED", "ADDITIONAL REQUIREMENTS NEEDED", "ADDITIONAL_REQUIREMENTS"].includes(upper);
          if (isReqs) {
            this.emailNotificationService
              .sendAdditionalRequirements(reqDataForEmail, remarks, requirements)
              .catch((e: unknown) => console.warn("[FormsService] Email notification error (additional reqs):", e));
          } else {
            this.emailNotificationService
              .sendStatusUpdate(reqDataForEmail, status, remarks)
              .catch((e: unknown) => console.warn("[FormsService] Email notification error (status update):", e));
          }
        }

        // In-app Notification Creation
        if (notifyCitizen && currentReq) {
          const citizenEmail = currentReq.email;
          const ticketId = currentReq.ticket_id;
          const docType = currentReq.document_type;

          if (citizenEmail) {
            // Find the profile of the citizen using email
            const { data: citizenProfile } = await client
              .from("profiles")
              .select("id")
              .eq("email", citizenEmail)
              .maybeSingle();

            if (citizenProfile) {
              // Build citizen-friendly title and message matching the specs
              let notifTitle = `Status Update: ${status}`;
              let notifMsg = `Your application for ${docType} (Ticket: ${ticketId}) is now ${status}.`;

              if (upper === "SUBMITTED") {
                notifTitle = "✅ Application Submitted";
                notifMsg = `Your ${docType} application has been received successfully. We will notify you whenever your application progresses. [Ticket: ${ticketId}]`;
              } else if (upper === "ASSIGNED TO DEPARTMENT" || upper === "ASSIGNED") {
                notifTitle = "📂 Assigned to Department";
                notifMsg = `Your application has been assigned to: Municipal Engineering Office. Our staff has begun reviewing your request. [Ticket: ${ticketId}]`;
              } else if (upper === "UNDER REVIEW" || upper === "PROCESSING") {
                notifTitle = "🔍 Under Review";
                notifMsg = `Your application is currently being reviewed. No action is required at this time. [Ticket: ${ticketId}]`;
              } else if (upper === "ADDITIONAL REQUIREMENTS NEEDED" || upper === "RETURNED" || upper === "RETURN") {
                notifTitle = "⚠ Additional Requirements Required";
                notifMsg = `Please submit a clearer copy of your Valid ID. Remarks from Staff: "${remarks || "No remarks provided"}". Please return to your request and upload the required document. [Ticket: ${ticketId}]`;
              } else if (upper === "APPROVED") {
                notifTitle = "✅ Approved";
                notifMsg = `Your application has been approved. The municipality is now preparing your official document. [Ticket: ${ticketId}]`;
              } else if (upper === "PREPARING DOCUMENT" || upper === "PREPARING") {
                notifTitle = "🖨 Preparing Document";
                notifMsg = `Your document is currently being prepared and signed. You will receive another notification once it is ready for pickup. [Ticket: ${ticketId}]`;
              } else if (upper === "READY FOR CLAIM" || upper === "READY") {
                notifTitle = "🏛 Ready for Claim";
                notifMsg = `Your request has been processed successfully. Please visit: Municipality of Talibon. Bring: • Tracking Number (${ticketId}) • Valid Government ID • Required payment (if applicable). Office Hours: Monday-Friday 8:00 AM - 5:00 PM. Location: Treasury Office. [Ticket: ${ticketId}]`;
              } else if (upper === "CLAIMED / COMPLETED" || upper === "CLAIMED" || upper === "COMPLETED") {
                notifTitle = "🎉 Transaction Completed";
                notifMsg = `Your document has been successfully claimed. Thank you for using Talibon Digital Core. [Ticket: ${ticketId}]`;
              } else if (upper === "REJECTED") {
                notifTitle = "❌ Request Rejected";
                notifMsg = `Verification declined. Remarks: "${remarks || "Incomplete details"}". Please submit a new claim with valid files. [Ticket: ${ticketId}]`;
              }

              // Insert into public.notifications with try-catch fallback
              try {
                await client.from("notifications").insert({
                  title: notifTitle,
                  message: notifMsg,
                  category: "Workflow Updates",
                  user_id: citizenProfile.id,
                  action_url: `/e-services?track=${ticketId}`
                });
              } catch (notifErr: any) {
                console.warn("[FormsService] Failed to insert notification (table may not exist):", notifErr.message || notifErr);
              }
            }
          }
        }

        return true;
      }
    } catch (err) {
      console.error("[FormsService] Failed to update request status in Supabase:", err);
    }

    // In-memory fallback
    const found = this.requests.find(r => r.id === requestId);
    if (found) {
      found.status = status;
      if (notifyEmail && found.email) {
        this.emailNotificationService
          .sendStatusUpdate(
            {
              id: found.id || requestId,
              ticketId: found.ticketId || "TLB-REQUEST",
              documentType: found.documentType,
              fullName: found.fullName,
              email: found.email,
              mobileNumber: found.mobileNumber,
              barangay: found.barangay,
              status: status
            },
            status,
            remarks
          )
          .catch((e: unknown) => console.warn("[FormsService] Email notification error (in-memory):", e));
      }
      return true;
    }
    return false;
  }

  async submitRequest(payload: CertificateRequestPayload): Promise<CertificateRequestPayload> {
    // Validation
    if (!payload.documentType || !payload.barangay || !payload.fullName || !payload.email || !payload.mobileNumber || !payload.purpose) {
      throw new BadRequestException("All required fields must be provided.");
    }

    let ticketId = `TLB-2026-${String(this.requests.length + 1).padStart(4, "0")}`;
    let dbStatus = "Submitted";
    let submittedAt = new Date().toISOString();
    let requestId = "mock-" + Math.random().toString(36).substring(2, 9);

    const barangayId = payload.barangay.toLowerCase().replace(/\s+/g, "_");

    // Store in Supabase if database is available
    let success = false;
    try {
      const client = this.supabaseService.getClient();
      if (client) {
        // Try direct insert first as it is standard and matches our inspected schema
        const generatedId = `TAL-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(Math.floor(Math.random() * 8999) + 1000)}`;
        
        console.log("[FormsService] Attempting direct insert into certificate_requests with column 'barangay'");
        const { data, error } = await client.from("certificate_requests").insert({
          ticket_id: generatedId,
          document_type: payload.documentType,
          barangay: payload.barangay, // Live DB has 'barangay' column
          full_name: payload.fullName,
          email: payload.email,
          mobile_number: payload.mobileNumber,
          purpose: payload.purpose,
          attachments: payload.attachments || [],
          status: "Submitted"
        }).select().maybeSingle();

        if (!error && data) {
          const requestData = data as any;
          ticketId = requestData.ticket_id || generatedId;
          dbStatus = requestData.status || dbStatus;
          submittedAt = requestData.submitted_at || requestData.created_at || submittedAt;
          requestId = requestData.id || requestId;
          success = true;
          console.log("[FormsService] Direct insert succeeded!");
        } else {
          if (error) {
            console.warn("[FormsService] Direct insert with 'barangay' column failed, trying 'barangay_id' column fallback", error.message);
          }
          // Try with barangay_id instead
          const { data: fallbackData, error: fallbackError } = await client.from("certificate_requests").insert({
            ticket_id: generatedId,
            document_type: payload.documentType,
            barangay_id: barangayId,
            full_name: payload.fullName,
            email: payload.email,
            mobile_number: payload.mobileNumber,
            purpose: payload.purpose,
            attachments: payload.attachments || [],
            status: "Submitted"
          }).select().maybeSingle();

          if (!fallbackError && fallbackData) {
            const requestData = fallbackData as any;
            ticketId = requestData.ticket_id || generatedId;
            dbStatus = requestData.status || dbStatus;
            submittedAt = requestData.submitted_at || requestData.created_at || submittedAt;
            requestId = requestData.id || requestId;
            success = true;
            console.log("[FormsService] Fallback direct insert with 'barangay_id' succeeded!");
          } else if (fallbackError) {
            throw fallbackError;
          }
        }
      }
    } catch (err: any) {
      console.warn("[FormsService] Direct insert failed, attempting RPC fallback:", err.message || err);
      try {
        const client = this.supabaseService.getClient();
        if (client) {
          const { data, error } = await client.rpc("submit_certificate_request", {
            p_document_type: payload.documentType,
            p_barangay_id: barangayId,
            p_full_name: payload.fullName,
            p_email: payload.email,
            p_mobile_number: payload.mobileNumber,
            p_purpose: payload.purpose,
            p_attachments: payload.attachments || []
          });

          if (error) throw error;

          if (data) {
            const requestData = data as any;
            ticketId = requestData.ticket_id || ticketId;
            dbStatus = requestData.status || dbStatus;
            submittedAt = requestData.submitted_at || requestData.created_at || submittedAt;
            requestId = requestData.id || requestId;
            success = true;
            console.log("[FormsService] RPC submit succeeded!");
          }
        }
      } catch (rpcErr: any) {
        console.warn("[FormsService] RPC fallback failed as well:", rpcErr.message || rpcErr);
      }
    }

    const newRequest: CertificateRequestPayload = {
      id: requestId,
      ticketId,
      documentType: payload.documentType,
      barangay: payload.barangay,
      fullName: payload.fullName,
      email: payload.email,
      mobileNumber: payload.mobileNumber,
      purpose: payload.purpose,
      attachments: payload.attachments || [],
      submittedAt,
      status: dbStatus
    };

    // Store in memory
    this.requests.unshift(newRequest);

    // Dispatch asynchronous submission email notification
    if (newRequest.email) {
      this.emailNotificationService
        .sendRequestSubmitted({
          id: newRequest.id,
          ticketId: newRequest.ticketId || "TLB-REQUEST",
          documentType: newRequest.documentType,
          fullName: newRequest.fullName,
          email: newRequest.email,
          mobileNumber: newRequest.mobileNumber,
          barangay: newRequest.barangay,
          status: newRequest.status,
          submittedAt: newRequest.submittedAt
        })
        .catch((e: unknown) => console.warn("[FormsService] Submission email dispatch error:", e));
    }

    return newRequest;
  }

  async getRequestStatus(ticketId: string): Promise<CertificateRequestPayload | null> {
    const code = ticketId ? ticketId.trim() : "";
    if (!code) return null;

    try {
      const client = this.supabaseService.getClient();
      if (client) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(code);
        let data: any = null;

        if (isUuid) {
          const { data: idRes } = await client.from("certificate_requests").select("*").eq("id", code).maybeSingle();
          if (idRes) data = idRes;
        }

        if (!data) {
          const { data: ticketRes, error: ticketErr } = await client
            .from("certificate_requests")
            .select("*")
            .or(`ticket_id.ilike.${code},ticket_id.eq.${code}`)
            .maybeSingle();

          if (ticketRes) {
            data = ticketRes;
          } else if (ticketErr) {
            console.warn("[FormsService] Query error searching ticket_id on certificate_requests:", ticketErr.message);
          }
        }

        if (!data) {
          const { data: codeRes, error: codeErr } = await client
            .from("certificate_requests")
            .select("*")
            .or(`tracking_code.ilike.${code},tracking_code.eq.${code}`)
            .maybeSingle();

          if (codeRes) {
            data = codeRes;
          } else if (codeErr) {
            console.warn("[FormsService] Query error searching tracking_code on certificate_requests:", codeErr.message);
          }
        }

        if (data) {
          // Fetch status history chronological timeline
          let historyData: any[] = [];
          try {
            const { data: srh, error: histError } = await client
              .from("service_request_history")
              .select("*")
              .eq("request_id", data.id)
              .order("created_at", { ascending: true });
            
            if (!histError && srh && srh.length > 0) {
              historyData = srh;
            }
          } catch (histErr: any) {
            console.warn("[FormsService] Could not fetch service_request_history from Supabase:", histErr?.message || histErr);
          }

          return {
            id: data.id,
            ticketId: data.ticket_id || data.tracking_code || data.ticketId || data.id,
            documentType: data.document_type || data.documentType || "Certificate Request",
            barangay: data.barangay_id || data.barangay || "Poblacion",
            fullName: data.full_name || data.fullName,
            email: data.email,
            mobileNumber: data.mobile_number || data.mobileNumber,
            purpose: data.purpose,
            attachments: data.attachments || [],
            submittedAt: data.submitted_at || data.created_at,
            status: data.status || "Submitted",
            history: (historyData || []).map(h => ({
              id: h.id,
              status: h.status,
              remarks: h.remarks,
              createdAt: h.created_at
            }))
          };
        }
      }
    } catch (err) {
      console.error("[FormsService] Failed to lookup request status from Supabase:", err);
    }

    const found = this.requests.find(
      r => r.ticketId?.trim().toUpperCase() === ticketId.trim().toUpperCase() || 
           r.id?.trim() === ticketId.trim()
    );
    return found || null;
  }

  getBusinessPermits() {
    return [
      { id: 1, title: "Business Permit Application Form", url: "#" },
      { id: 2, title: "Business Permit Renewal Form", url: "#" },
    ];
  }

  getBuildingPermits() {
    return [
      { id: 1, title: "Building Permit Application Form", url: "#" },
      { id: 2, title: "Electrical Permit Form", url: "#" },
      { id: 3, title: "Plumbing Permit Form", url: "#" },
    ];
  }

  getZoningClearance() {
    return [
      { id: 1, title: "Zoning Clearance Application Form", url: "#" },
    ];
  }

  getDownloadable() {
    return [
      ...this.getBusinessPermits(),
      ...this.getBuildingPermits(),
      ...this.getZoningClearance(),
    ];
  }
}

