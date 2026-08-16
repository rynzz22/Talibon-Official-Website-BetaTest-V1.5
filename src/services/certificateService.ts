import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { logCmsAction } from "./cmsService";
import { isMockAllowed } from "../lib/mode";

export interface TimelineEvent {
  id?: string;
  status: string;
  remarks: string | null;
  createdAt: string;
}

export interface CertificateRequest {
  id?: string;
  ticketId: string;
  documentType: string;
  barangay: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  purpose: string;
  attachments: string[];
  submittedAt: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  history?: TimelineEvent[];
}

// Local Storage key for fallback requests when Supabase is unreachable or for citizen tracking convenience
const LOCAL_REQUESTS_KEY = "talibon_local_certificate_requests";
const LEGACY_REQUESTS_KEY = "talibon_citizen_requests";
const REQUEST_RETENTION_MS = 30 * 24 * 60 * 60 * 1000; // 30-day retention under privacy compliance

export function getLocalRequests(): CertificateRequest[] {
  try {
    const raw = localStorage.getItem(LOCAL_REQUESTS_KEY);
    if (!raw) return [];
    
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      localStorage.removeItem(LOCAL_REQUESTS_KEY);
      return [];
    }

    const now = Date.now();
    let hasExpired = false;

    // Filter valid, non-expired entries
    const validRequests: CertificateRequest[] = parsed.filter((item: any) => {
      if (!item || typeof item !== "object" || !item.ticketId) return false;
      const submittedTime = item.submittedAt ? new Date(item.submittedAt).getTime() : 0;
      const isExpired = item.expiresAt ? now > item.expiresAt : (submittedTime > 0 && now - submittedTime > REQUEST_RETENTION_MS);
      if (isExpired) {
        hasExpired = true;
        return false;
      }
      return true;
    });

    // Write back sanitized non-expired data if any were pruned
    if (hasExpired || validRequests.length !== parsed.length) {
      localStorage.setItem(LOCAL_REQUESTS_KEY, JSON.stringify(validRequests));
    }

    // Clean legacy key if exists
    if (localStorage.getItem(LEGACY_REQUESTS_KEY)) {
      localStorage.removeItem(LEGACY_REQUESTS_KEY);
    }

    return validRequests;
  } catch {
    return [];
  }
}

export function saveLocalRequest(req: CertificateRequest): void {
  try {
    if (!req || !req.ticketId) return;

    // Data minimization: Do NOT persist citizen sensitive personally identifiable info (PII) like full name, email, phone, purpose details, or attachments in localStorage
    const sanitizedStub: CertificateRequest & { expiresAt: number } = {
      ticketId: req.ticketId,
      documentType: req.documentType || "Municipal Request",
      barangay: req.barangay || "Poblacion",
      fullName: "", // PII stripped for browser storage privacy
      email: "",    // PII stripped
      mobileNumber: "", // PII stripped
      purpose: "",  // PII stripped
      attachments: [], // PII stripped
      submittedAt: req.submittedAt || new Date().toISOString(),
      status: req.status || "Submitted",
      history: req.history || [],
      expiresAt: Date.now() + REQUEST_RETENTION_MS
    };

    const existing = getLocalRequests();
    const filtered = existing.filter(r => r.ticketId !== sanitizedStub.ticketId);
    filtered.unshift(sanitizedStub);
    
    // Cap stored tickets to 20 most recent
    const capped = filtered.slice(0, 20);
    localStorage.setItem(LOCAL_REQUESTS_KEY, JSON.stringify(capped));
  } catch (e) {
    console.warn("[CertificateService] Failed to save local request fallback:", e);
  }
}

export function clearLocalRequests(): void {
  try {
    localStorage.removeItem(LOCAL_REQUESTS_KEY);
    localStorage.removeItem(LEGACY_REQUESTS_KEY);
  } catch (e) {
    console.warn("[CertificateService] Failed to clear local requests:", e);
  }
}

// Generate unique Ticket ID matching custom format per document type
function generateTicketId(documentType: string): string {
  const prefix = documentType.toLowerCase().includes("cedula") 
    ? "CTC" 
    : documentType.toLowerCase().includes("business")
    ? "BPLO"
    : documentType.toLowerCase().includes("building")
    ? "ENG"
    : documentType.toLowerCase().includes("zoning")
    ? "MPDO"
    : documentType.toLowerCase().includes("barangay")
    ? "BRGY"
    : "TLB";
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000); // 6-digit random number
  return `${prefix}-${year}-${random}`;
}

// Map the DB snake_case columns back to the frontend CertificateRequest interface
function mapDbToRequest(row: any, history: any[] = []): CertificateRequest {
  return {
    id: row.id,
    ticketId: row.ticket_id,
    documentType: row.document_type,
    barangay: row.barangay_id || "Poblacion",
    fullName: row.full_name,
    email: row.email,
    mobileNumber: row.mobile_number || "",
    purpose: row.purpose || "",
    attachments: row.attachments || [],
    submittedAt: row.submitted_at || row.created_at,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
    history: history.map((h: any) => ({
      id: h.id,
      status: h.status,
      remarks: h.remarks,
      createdAt: h.created_at
    }))
  };
}

// Map frontend status string to official PostgreSQL Enum type status values
function mapStatusToDb(status: string): string {
  const upper = status.trim().toUpperCase();
  if (upper === "SUBMITTED" || upper === "PENDING") return "Submitted";
  if (upper === "ASSIGNED") return "Assigned";
  if (upper === "PROCESSING" || upper === "PREPARING" || upper === "IN_PROGRESS") return "Processing";
  if (upper === "RETURNED") return "Returned";
  if (upper === "APPROVED" || upper === "READY") return "Approved";
  if (upper === "REJECTED") return "Rejected";
  if (upper === "CLAIMED" || upper === "COMPLETED") return "Completed";
  return "Submitted";
}

// Helper to log email notification attempts inside audit_logs table
async function logEmailAttempt(
  userEmail: string,
  action: "EMAIL_SENT" | "EMAIL_FAILED",
  requestId: string,
  ticketId: string,
  recipient: string,
  status: string,
  errorMessage?: string
): Promise<void> {
  const email = userEmail || "system@talibon.gov.ph";
  const dataPayload = {
    request_id: requestId,
    ticket_id: ticketId,
    recipient: recipient,
    status: status,
    ...(errorMessage ? { error_message: errorMessage } : {})
  };

  try {
    const { error } = await supabase.from("audit_logs").insert([{
      user_email: email,
      action: action as any,
      target_table: "certificate_requests",
      target_id: requestId,
      new_data: dataPayload
    }]);
    if (error) throw error;
  } catch (err: any) {
    console.warn("[CertificateService] Failed to insert email audit log:", err.message || err);
  }
}

export const certificateService = {
  /**
   * Submit a certificate request directly to public.certificate_requests
   */
  async submitRequest(payload: Omit<CertificateRequest, "ticketId" | "submittedAt" | "status">): Promise<CertificateRequest> {
    const ticketId = generateTicketId(payload.documentType);
    const now = new Date().toISOString();

    if (!isSupabaseConfigured) {
      throw new Error("Supabase is unconfigured. Production application requires an active database connection.");
    }

    const insertPayload = {
      ticket_id: ticketId,
      document_type: payload.documentType,
      barangay_id: payload.barangay || "Poblacion",
      full_name: payload.fullName,
      email: payload.email || "",
      mobile_number: payload.mobileNumber || "",
      purpose: payload.purpose || "",
      attachments: payload.attachments || [],
      status: "Submitted",
      submitted_at: now
    };

    console.log(`[CertificateService] Submitting request to public.certificate_requests with tracking code: ${ticketId}`);

    // Insert directly into public.certificate_requests (V4 primary interface)
    let createdData: any = null;
    const { data: crData, error: crError } = await supabase
      .from("certificate_requests")
      .insert([insertPayload])
      .select()
      .maybeSingle();

    if (crData) {
      createdData = crData;
      console.log(`[CertificateService] Successfully inserted into public.certificate_requests (ID: ${crData.id})`);
    } else {
      console.warn("[CertificateService] Insert to public.certificate_requests returned empty or error:", crError?.message || crError);
      // Fallback insert to service_requests table
      const { data: srData, error: srError } = await supabase
        .from("service_requests")
        .insert([insertPayload])
        .select()
        .maybeSingle();

      if (srError || !srData) {
        console.error("[CertificateService] Failed to insert into service_requests fallback:", srError);
        throw new Error(crError?.message || srError?.message || "Failed to save application to database.");
      }
      createdData = srData;
    }

    // Insert initial history record if supported
    if (createdData?.id) {
      try {
        await supabase.from("service_request_history").insert({
          request_id: createdData.id,
          status: "Submitted",
          remarks: "Application received and registered in municipal e-services queue."
        });
      } catch (srhErr: any) {
        // Handled silently if client lacks direct table insert permissions (managed by backend)
      }
    }

    const mapped = mapDbToRequest(createdData, [{
      id: "hist-1",
      status: "Submitted",
      remarks: "Application received and registered in municipal e-services queue.",
      createdAt: now
    }]);

    saveLocalRequest(mapped);
    return mapped;
  },

  /**
   * Get request details by tracking_code / ticket ID from public.certificate_requests with workflow_history
   */
  async getRequestStatus(trackingCode: string): Promise<CertificateRequest | null> {
    const code = trackingCode ? trackingCode.trim() : "";
    if (!code) {
      console.warn("[Tracking Audit] Empty tracking code supplied.");
      return null;
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(code);
    console.log(`[Tracking Audit] Searching public.certificate_requests for tracking code: "${code}" (isUuid=${isUuid})`);

    if (!isSupabaseConfigured) {
      console.error("[Tracking Audit] Supabase client is not configured.");
      throw new Error("Database connection unconfigured. Live tracking requires database access.");
    }

    let requestData: any = null;

    // Query 1: Search public.certificate_requests by ticket_id column
    try {
      const { data, error } = await supabase
        .from("certificate_requests")
        .select("*")
        .or(`ticket_id.ilike.${code},ticket_id.eq.${code}`)
        .maybeSingle();

      if (error) {
        console.warn(`[Tracking Audit] ticket_id query error on public.certificate_requests:`, {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
      } else if (data) {
        requestData = data;
        console.log(`[Tracking Audit] Match found in public.certificate_requests via ticket_id:`, data.id);
      }
    } catch (e: any) {
      console.warn(`[Tracking Audit] Exception during ticket_id query:`, e.message || e);
    }

    // Query 2: Try tracking_code column if ticket_id produced no match
    if (!requestData) {
      try {
        const { data, error } = await supabase
          .from("certificate_requests")
          .select("*")
          .or(`tracking_code.ilike.${code},tracking_code.eq.${code}`)
          .maybeSingle();

        if (error) {
          console.warn(`[Tracking Audit] tracking_code query error on public.certificate_requests:`, {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
        } else if (data) {
          requestData = data;
          console.log(`[Tracking Audit] Match found in public.certificate_requests via tracking_code:`, data.id);
        }
      } catch (e: any) {
        console.warn(`[Tracking Audit] Exception during tracking_code query:`, e.message || e);
      }
    }

    // Query 3: Search service_requests table directly if public.certificate_requests view missed
    if (!requestData) {
      try {
        const { data, error } = await supabase
          .from("service_requests")
          .select("*")
          .or(`ticket_id.ilike.${code},ticket_id.eq.${code}`)
          .maybeSingle();

        if (!error && data) {
          requestData = data;
          console.log(`[Tracking Audit] Match found in service_requests table via ticket_id:`, data.id);
        }
      } catch (e: any) {
        console.warn(`[Tracking Audit] Exception during service_requests search:`, e.message || e);
      }
    }

    // Query 4: Search by UUID id if code matches UUID pattern
    if (!requestData && isUuid) {
      try {
        const { data, error } = await supabase
          .from("certificate_requests")
          .select("*")
          .eq("id", code)
          .maybeSingle();

        if (data) {
          requestData = data;
          console.log(`[Tracking Audit] Match found in public.certificate_requests via UUID id:`, data.id);
        }
      } catch (e: any) {
        console.warn(`[Tracking Audit] Exception during UUID search:`, e.message || e);
      }
    }

    // Diagnostic logging if record is not found
    if (!requestData) {
      console.warn(`[Tracking Audit] Result: Not Found for tracking code "${code}". Possible causes: 1) No record matches this code, 2) Row Level Security (RLS) policy on public.certificate_requests is restricting public read access, 3) Code typo.`);
      return null;
    }

    // Query related service_request_history records
    let historyData: any[] = [];
    try {
      const { data: srhData, error: srhError } = await supabase
        .from("service_request_history")
        .select("*")
        .eq("request_id", requestData.id)
        .order("created_at", { ascending: false });

      if (!srhError && srhData && srhData.length > 0) {
        historyData = srhData;
      }
    } catch {
      // Ignore if history read fails
    }

    return mapDbToRequest(requestData, historyData);
  },

  /**
   * Fetch all requests from Supabase certificate_requests table (for Admin view)
   */
  async getAllRequests(): Promise<CertificateRequest[]> {
    if (!isSupabaseConfigured) {
      console.warn("[CertificateService] Supabase not configured for getAllRequests");
      return [];
    }

    try {
      const { data, error } = await supabase
        .from("certificate_requests")
        .select("*")
        .order("created_at", { ascending: false });

      let listData = data;
      if (error || !listData) {
        const { data: srData } = await supabase
          .from("service_requests")
          .select("*")
          .order("created_at", { ascending: false });
        listData = srData;
      }

      if (listData && Array.isArray(listData)) {
        let historyData: any[] = [];
        const { data: srhData } = await supabase
          .from("service_request_history")
          .select("*")
          .order("created_at", { ascending: false });
        if (srhData) historyData = srhData;

        return listData.map((requestData: any) => {
          const itemHistory = historyData 
            ? historyData.filter((h: any) => h.request_id === requestData.id)
            : [];
          return mapDbToRequest(requestData, itemHistory);
        });
      }
    } catch (e: any) {
      console.error("[CertificateService] getAllRequests failed:", e.message || e);
    }

    return [];
  },

  /**
   * Transition request status and log updates directly in Supabase & NestJS API
   */
  async updateRequestStatus(
    requestId: string,
    status: string,
    remarks: string,
    userEmail: string,
    notifyEmail: boolean = true,
    notifySms: boolean = false,
    saveTimeline: boolean = true
  ): Promise<boolean> {
    // 1. First attempt authoritative NestJS backend API (which securely dispatches server-side email notifications)
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/forms/certificate/${encodeURIComponent(requestId)}/status`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          status,
          remarks,
          notifyCitizen: true,
          notifyEmail,
          saveTimeline
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result && result.success) {
          await logCmsAction(userEmail, `UPDATE_STATUS_${status}`, "certificate_requests", requestId);
          return true;
        }
      }
    } catch (apiErr: any) {
      console.warn("[CertificateService] Server API update error, falling back to direct DB update:", apiErr.message || apiErr);
    }

    // 2. Direct Supabase Client fallback
    try {
      const dbStatus = mapStatusToDb(status);
      const now = new Date().toISOString();

      let updateError: any = null;

      const { error: srError } = await supabase
        .from("service_requests")
        .update({
          status: dbStatus as any,
          updated_at: now
        })
        .eq("id", requestId);

      if (srError) {
        const { error: crError } = await supabase
          .from("certificate_requests")
          .update({
            status: dbStatus as any
          })
          .eq("id", requestId);

        updateError = crError;
      }

      if (saveTimeline) {
        try {
          await supabase.from("service_request_history").insert({
            request_id: requestId,
            status: dbStatus,
            remarks: remarks || `Status updated to ${status}`
          });
        } catch {
          // Handled if client lacks direct table insert permissions
        }
      }

      if (updateError) {
        throw updateError;
      }

      await logCmsAction(userEmail, `UPDATE_STATUS_${status}`, "certificate_requests", requestId);

      return true;
    } catch (e: any) {
      console.warn("[CertificateService] updateRequestStatus remote update failed, updating local fallback:", e.message || e);
      // Fallback: update in local storage if present
      const localReqs = getLocalRequests();
      const localMatch = localReqs.find(r => r.id === requestId || r.ticketId === requestId);
      if (localMatch) {
        localMatch.status = status;
        localMatch.history = localMatch.history || [];
        localMatch.history.unshift({
          id: "hist-" + Date.now(),
          status: status,
          remarks: remarks || `Status updated to ${status}`,
          createdAt: new Date().toISOString()
        });
        saveLocalRequest(localMatch);
        return true;
      }
    }
    return false;
  }
};
