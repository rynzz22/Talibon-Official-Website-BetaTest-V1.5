import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { logCmsAction } from "./cmsService";
import { isMockAllowed } from "../lib/mode";

export interface NavigationItem {
  id: string;
  name: string;
  href: string;
  section: string;
  order: number;
  is_external: boolean;
  created_at?: string;
  updated_at?: string;
}

const INITIAL_NAVIGATION: NavigationItem[] = [
  { id: "nav-1", name: "History & Profile", href: "/about/history", section: "about", order: 1, is_external: false },
  { id: "nav-2", name: "The Mayor", href: "/about/mayor", section: "about", order: 2, is_external: false },
  { id: "nav-3", name: "Official Seal", href: "/about/seal", section: "about", order: 3, is_external: false },
  { id: "nav-4", name: "Business Permits", href: "/e-services/business-permits", section: "services", order: 1, is_external: false },
  { id: "nav-5", name: "Building Permits", href: "/e-services/building-permits", section: "services", order: 2, is_external: false }
];

function getStorageNavigation(): NavigationItem[] {
  const data = localStorage.getItem("cms_data:navigation");
  if (!data) {
    localStorage.setItem("cms_data:navigation", JSON.stringify(INITIAL_NAVIGATION));
    return INITIAL_NAVIGATION;
  }
  return JSON.parse(data);
}

function setStorageNavigation(data: NavigationItem[]): void {
  localStorage.setItem("cms_data:navigation", JSON.stringify(data));
}

export const navigationService = {
  async getNavigationItems(): Promise<NavigationItem[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("navigation")
          .select("*")
          .order("section", { ascending: true })
          .order("order", { ascending: true });
        if (error) throw error;
        if (data) return data as NavigationItem[];
      } catch (e: any) {
        if (!isMockAllowed()) {
          throw new Error(`[NavigationService] Failed to load navigation items: ${e.message}`);
        }
        console.warn("[NavigationService] Supabase Navigation fetch failed, falling back to LocalStorage:", e.message || e);
      }
    }

    if (!isMockAllowed()) {
      throw new Error("[NavigationService] Supabase is unconfigured. Production Mode requires a live database connection.");
    }
    return getStorageNavigation();
  },

  async createNavigationItem(item: Omit<NavigationItem, "id">, userEmail: string): Promise<NavigationItem> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("navigation")
          .insert([item])
          .select()
          .maybeSingle();
        if (error) throw error;
        if (data) {
          await logCmsAction(userEmail, "CREATE", "navigation", data.id);
          return data as NavigationItem;
        }
      } catch (e: any) {
        console.error("[NavigationService] Supabase Navigation insert failed:", e.message || e);
        throw e;
      }
    }

    if (!isMockAllowed()) {
      throw new Error("[NavigationService] Supabase is unconfigured. Production Mode requires a live database connection to save navigation.");
    }

    const id = "mock-" + Math.random().toString(36).substring(2, 9);
    const newItem = { ...item, id } as NavigationItem;
    const list = getStorageNavigation();
    list.push(newItem);
    setStorageNavigation(list);
    await logCmsAction(userEmail, "CREATE", "navigation", id);
    return newItem;
  },

  async updateNavigationItem(id: string, item: Partial<NavigationItem>, userEmail: string): Promise<NavigationItem> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("navigation")
          .update(item)
          .eq("id", id)
          .select()
          .maybeSingle();
        if (error) throw error;
        if (data) {
          await logCmsAction(userEmail, "UPDATE", "navigation", id);
          return data as NavigationItem;
        }
      } catch (e: any) {
        console.error("[NavigationService] Supabase Navigation update failed:", e.message || e);
        throw e;
      }
    }

    if (!isMockAllowed()) {
      throw new Error("[NavigationService] Supabase is unconfigured. Production Mode requires a live database connection to update data.");
    }

    const list = getStorageNavigation();
    const index = list.findIndex(n => n.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...item };
      setStorageNavigation(list);
      await logCmsAction(userEmail, "UPDATE", "navigation", id);
      return list[index];
    }
    throw new Error("Navigation item not found");
  },

  async deleteNavigationItem(id: string, userEmail: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from("navigation")
          .delete()
          .eq("id", id);
        if (error) throw error;
        await logCmsAction(userEmail, "DELETE", "navigation", id);
        return true;
      } catch (e: any) {
        console.error("[NavigationService] Supabase Navigation delete failed:", e.message || e);
        throw e;
      }
    }

    if (!isMockAllowed()) {
      throw new Error("[NavigationService] Supabase is unconfigured. Production Mode requires a live database connection to delete data.");
    }

    const list = getStorageNavigation();
    const filtered = list.filter(n => n.id !== id);
    setStorageNavigation(filtered);
    await logCmsAction(userEmail, "DELETE", "navigation", id);
    return true;
  }
};
