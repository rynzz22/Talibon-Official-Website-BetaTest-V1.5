import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { logCmsAction, UserProfileItem } from "./cmsService";
import { isMockAllowed } from "../lib/mode";

const INITIAL_USERS: UserProfileItem[] = [
  {
    id: "usr-1",
    email: "superadmin@talibon.gov.ph",
    full_name: "Municipal Admin",
    role: "super_admin",
    is_verified: true,
    department_id: null,
    barangay_id: null,
  },
  {
    id: "usr-2",
    email: "editor1@talibon.gov.ph",
    full_name: "Municipal Editor",
    role: "editor",
    is_verified: true,
    department_id: "dept-1", // BPLO
    barangay_id: null,
  },
  {
    id: "usr-3",
    email: "bplostaff@talibon.gov.ph",
    full_name: "BPLO Licensing Clerk",
    role: "municipal_admin",
    is_verified: true,
    department_id: "dept-1", // BPLO
    barangay_id: null,
  },
  {
    id: "usr-4",
    email: "treasurystaff@talibon.gov.ph",
    full_name: "MTO Cashier",
    role: "editor",
    is_verified: true,
    department_id: "dept-2", // MTO (Treasury)
    barangay_id: null,
  },
  {
    id: "usr-5",
    email: "sanpedroadmin@talibon.gov.ph",
    full_name: "San Pedro Brgy Secretary",
    role: "barangay_admin",
    is_verified: true,
    department_id: null,
    barangay_id: "san_pedro",
  }
];

function getStorageUsers(): UserProfileItem[] {
  const data = localStorage.getItem("cms_data:users");
  if (!data) {
    localStorage.setItem("cms_data:users", JSON.stringify(INITIAL_USERS));
    return INITIAL_USERS;
  }
  return JSON.parse(data);
}

function setStorageUsers(data: UserProfileItem[]): void {
  localStorage.setItem("cms_data:users", JSON.stringify(data));
}

export const profileService = {
  /**
   * Get all user profiles
   */
  async getProfiles(): Promise<UserProfileItem[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        if (data) return data as UserProfileItem[];
      } catch (e: any) {
        if (!isMockAllowed()) {
          throw new Error(`[ProfileService] Failed to load profiles: ${e.message}`);
        }
        console.warn("[ProfileService] Supabase profiles query failed, falling back to LocalStorage:", e.message || e);
      }
    }

    if (!isMockAllowed()) {
      throw new Error("[ProfileService] Supabase is unconfigured. Production Mode requires a live database connection.");
    }
    return getStorageUsers();
  },

  /**
   * Get a single user profile by ID
   */
  async getProfile(id: string): Promise<UserProfileItem | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", id)
          .maybeSingle();
        if (error) throw error;
        return data as UserProfileItem;
      } catch (e: any) {
        if (!isMockAllowed()) {
          throw new Error(`[ProfileService] Failed to load profile: ${e.message}`);
        }
        console.error(`[ProfileService] Fetch profile ${id} failed:`, e.message || e);
      }
    }

    if (!isMockAllowed()) {
      throw new Error("[ProfileService] Supabase is unconfigured. Production Mode requires a live database connection.");
    }
    const list = getStorageUsers();
    return list.find(u => u.id === id) || null;
  },

  /**
   * Update a user profile directly
   */
  async updateProfile(id: string, updates: Partial<UserProfileItem>, userEmail: string): Promise<UserProfileItem> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .update(updates)
          .eq("id", id)
          .select()
          .maybeSingle();
        if (error) throw error;
        if (data) {
          await logCmsAction(userEmail, "UPDATE_PROFILE", "profiles", id);
          return data as UserProfileItem;
        }
      } catch (e: any) {
        console.error("[ProfileService] Supabase profile update failed:", e.message || e);
        throw e;
      }
    }

    if (!isMockAllowed()) {
      throw new Error("[ProfileService] Supabase is unconfigured. Production Mode requires a live database connection to update profile.");
    }

    const list = getStorageUsers();
    const index = list.findIndex(u => u.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updates };
      setStorageUsers(list);
      await logCmsAction(userEmail, "UPDATE_PROFILE", "profiles", id);
      return list[index];
    }
    throw new Error("User profile not found");
  },

  /**
   * Update user role and verification status directly via Supabase CRUD
   */
  async updateUserRole(
    id: string,
    role: string,
    isVerified: boolean,
    userEmail: string,
    departmentId?: string | null,
    barangayId?: string | null
  ): Promise<UserProfileItem> {
    const updatePayload: Partial<UserProfileItem> = {
      role: role as any,
      is_verified: isVerified
    };
    if (departmentId !== undefined) updatePayload.department_id = departmentId;
    if (barangayId !== undefined) updatePayload.barangay_id = barangayId;

    return await this.updateProfile(id, updatePayload, userEmail);
  }
};
