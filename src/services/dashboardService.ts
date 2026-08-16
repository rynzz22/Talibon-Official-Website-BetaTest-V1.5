import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { isMockAllowed } from "../lib/mode";

export interface DashboardAggregates {
  total_news: number;
  total_downloadables: number;
  total_tourism: number;
  total_officials: number;
  total_departments: number;
  total_services: number;
  total_events: number;
  pending_applications: number;
  total_gad_beneficiaries: number;
}

export interface MonthlyRequestStat {
  month: string;
  document_type: string;
  status: string;
  total_requests: number;
}

export interface GADSectoralStat {
  sex: string;
  civil_status: string;
  count: number;
}

export const dashboardService = {
  /**
   * Get main aggregates from view_dashboard_aggregates (or direct base table counts)
   */
  async getDashboardAggregates(): Promise<DashboardAggregates> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("view_dashboard_aggregates")
          .select("*")
          .maybeSingle();

        if (!error && data) return data as DashboardAggregates;

        // Fallback: Query base tables directly
        const [
          newsRes,
          downRes,
          tourRes,
          offRes,
          deptRes,
          servRes,
          evRes,
          reqRes,
          gadRes
        ] = await Promise.all([
          supabase.from("news").select("id", { count: "exact", head: true }).is("deleted_at", null),
          supabase.from("downloadables").select("id", { count: "exact", head: true }).is("deleted_at", null),
          supabase.from("tourism_spots").select("id", { count: "exact", head: true }).is("deleted_at", null),
          supabase.from("officials").select("id", { count: "exact", head: true }).is("deleted_at", null),
          supabase.from("departments").select("id", { count: "exact", head: true }).is("deleted_at", null),
          supabase.from("municipal_services").select("id", { count: "exact", head: true }).is("deleted_at", null),
          supabase.from("events").select("id", { count: "exact", head: true }).is("deleted_at", null),
          supabase.from("service_requests").select("id", { count: "exact", head: true }).eq("status", "Pending"),
          supabase.from("gad_beneficiaries").select("id", { count: "exact", head: true })
        ]);

        return {
          total_news: newsRes.count || 0,
          total_downloadables: downRes.count || 0,
          total_tourism: tourRes.count || 0,
          total_officials: offRes.count || 0,
          total_departments: deptRes.count || 0,
          total_services: servRes.count || 0,
          total_events: evRes.count || 0,
          pending_applications: reqRes.count || 0,
          total_gad_beneficiaries: gadRes.count || 0
        };
      } catch {
        // Fallback to base table counts if optional view is missing
      }
    }

    // Default Fallback
    return {
      total_news: 0,
      total_downloadables: 0,
      total_tourism: 0,
      total_officials: 0,
      total_departments: 0,
      total_services: 0,
      total_events: 0,
      pending_applications: 0,
      total_gad_beneficiaries: 0
    };
  },

  /**
   * Get monthly stats from view_monthly_request_stats (or service_requests)
   */
  async getMonthlyRequestStats(): Promise<MonthlyRequestStat[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("view_monthly_request_stats")
          .select("*");

        if (!error && data && data.length > 0) return data as MonthlyRequestStat[];

        // Fallback: Query service_requests directly
        const { data: reqs, error: reqsError } = await supabase
          .from("service_requests")
          .select("created_at, document_type, status")
          .is("deleted_at", null);

        if (!reqsError && reqs && reqs.length > 0) {
          const statsMap = new Map<string, MonthlyRequestStat>();

          for (const req of reqs) {
            const month = req.created_at ? req.created_at.slice(0, 7) : new Date().toISOString().slice(0, 7);
            const docType = req.document_type || "General Service";
            const status = req.status || "Pending";
            const key = `${month}:${docType}:${status}`;

            if (statsMap.has(key)) {
              statsMap.get(key)!.total_requests += 1;
            } else {
              statsMap.set(key, {
                month,
                document_type: docType,
                status,
                total_requests: 1
              });
            }
          }

          return Array.from(statsMap.values());
        }
      } catch {
        // Fallback to default if table query fails
      }
    }

    const currentMonth = new Date().toISOString().slice(0, 7);
    return [
      { month: currentMonth, document_type: "Barangay Clearance", status: "Approved", total_requests: 2 }
    ];
  },

  /**
   * Get GAD stats from view_gad_sectoral_stats (or gad_beneficiaries)
   */
  async getGADSectoralStats(): Promise<GADSectoralStat[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("view_gad_sectoral_stats")
          .select("*");

        if (!error && data && data.length > 0) return data as GADSectoralStat[];

        // Fallback: Query gad_beneficiaries directly using canonical columns (gender, sector)
        const { data: bens, error: bensError } = await supabase
          .from("gad_beneficiaries")
          .select("gender, sector");

        if (!bensError && bens && bens.length > 0) {
          const statsMap = new Map<string, GADSectoralStat>();

          for (const b of bens as any[]) {
            const sex = b.gender || "Unspecified";
            const civilStatus = b.sector || "General";
            const key = `${sex}:${civilStatus}`;

            if (statsMap.has(key)) {
              statsMap.get(key)!.count += 1;
            } else {
              statsMap.set(key, {
                sex,
                civil_status: civilStatus,
                count: 1
              });
            }
          }

          return Array.from(statsMap.values());
        }
      } catch {
        // Suppress expected fallback exception
      }
    }

    return [];
  }
};
