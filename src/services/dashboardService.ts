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
   * Get main aggregates from view_dashboard_aggregates
   */
  async getDashboardAggregates(): Promise<DashboardAggregates> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("view_dashboard_aggregates")
          .select("*")
          .maybeSingle();

        if (error) throw error;
        if (data) return data as DashboardAggregates;
      } catch (e: any) {
        if (!isMockAllowed()) {
          throw new Error(`[DashboardService] Failed to load dashboard aggregates: ${e.message}`);
        }
        console.warn("[DashboardService] Failed to fetch view_dashboard_aggregates:", e.message || e);
      }
    }

    if (!isMockAllowed()) {
      throw new Error("[DashboardService] Supabase is unconfigured. Production Mode requires a live database connection.");
    }

    // Default Fallback
    return {
      total_news: 1,
      total_downloadables: 2,
      total_tourism: 2,
      total_officials: 2,
      total_departments: 2,
      total_services: 2,
      total_events: 1,
      pending_applications: 1,
      total_gad_beneficiaries: 12
    };
  },

  /**
   * Get monthly stats from view_monthly_request_stats
   */
  async getMonthlyRequestStats(): Promise<MonthlyRequestStat[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("view_monthly_request_stats")
          .select("*");

        if (error) throw error;
        if (data) return data as MonthlyRequestStat[];
      } catch (e: any) {
        if (!isMockAllowed()) {
          throw new Error(`[DashboardService] Failed to load monthly request stats: ${e.message}`);
        }
        console.warn("[DashboardService] Failed to fetch view_monthly_request_stats:", e.message || e);
      }
    }

    if (!isMockAllowed()) {
      throw new Error("[DashboardService] Supabase is unconfigured. Production Mode requires a live database connection.");
    }

    // Default Fallback
    const currentMonth = new Date().toISOString().slice(0, 7);
    return [
      { month: currentMonth, document_type: "Barangay Clearance", status: "Submitted", total_requests: 5 },
      { month: currentMonth, document_type: "Business Permit Clearance", status: "Approved", total_requests: 12 },
      { month: currentMonth, document_type: "Certificate of Indigency", status: "Released", total_requests: 8 }
    ];
  },

  /**
   * Get GAD stats from view_gad_sectoral_stats
   */
  async getGADSectoralStats(): Promise<GADSectoralStat[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("view_gad_sectoral_stats")
          .select("*");

        if (error) throw error;
        if (data) return data as GADSectoralStat[];
      } catch (e: any) {
        if (!isMockAllowed()) {
          throw new Error(`[DashboardService] Failed to load GAD sectoral stats: ${e.message}`);
        }
        console.warn("[DashboardService] Failed to fetch view_gad_sectoral_stats:", e.message || e);
      }
    }

    if (!isMockAllowed()) {
      throw new Error("[DashboardService] Supabase is unconfigured. Production Mode requires a live database connection.");
    }

    // Default Fallback
    return [
      { sex: "Female", civil_status: "Single", count: 12 },
      { sex: "Female", civil_status: "Married", count: 24 },
      { sex: "Male", civil_status: "Single", count: 8 },
      { sex: "Male", civil_status: "Married", count: 18 }
    ];
  }
};
