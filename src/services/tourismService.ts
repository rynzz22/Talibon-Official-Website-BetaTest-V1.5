import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { logCmsAction, TourismSpotItem } from "./cmsService";
import { isMockAllowed } from "../lib/mode";

const INITIAL_TOURISM: TourismSpotItem[] = [
  {
    id: "tour-1",
    name: "Danajon Bank Double Barrier Reef",
    description: "The only double barrier reef in the Philippines and one of only six in the entire world. It offers magnificent underwater biodiversity and stunning sandbars like Calituban Island.",
    gallery_images: ["https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=800"],
    location: "Camotes Sea, Off northern coast of Talibon",
    opening_hours: "24/7 (Boat schedules vary)",
    contact_details: "Municipal Tourism Office: tourism@talibon.gov.ph",
    featured_image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "tour-2",
    name: "San Pedro Calungsod Beach",
    description: "A serene public beach offering golden sand shoreline, crystal clear waters, and local food stalls. Ideal for weekend family picnics.",
    gallery_images: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800"],
    location: "Brgy. San Pedro, Talibon, Bohol",
    opening_hours: "6:00 AM - 10:00 PM",
    contact_details: "Barangay San Pedro Secretariat",
    featured_image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800",
  }
];

function getStorageTourism(): TourismSpotItem[] {
  const data = localStorage.getItem("cms_data:tourism_spots");
  if (!data) {
    localStorage.setItem("cms_data:tourism_spots", JSON.stringify(INITIAL_TOURISM));
    return INITIAL_TOURISM;
  }
  return JSON.parse(data);
}

function setStorageTourism(data: TourismSpotItem[]): void {
  localStorage.setItem("cms_data:tourism_spots", JSON.stringify(data));
}

export const tourismService = {
  async getTourismSpots(): Promise<TourismSpotItem[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("tourism_spots")
          .select("*")
          .order("name", { ascending: true });
        if (error) throw error;
        if (data) return data as TourismSpotItem[];
      } catch (e: any) {
        if (!isMockAllowed()) {
          throw new Error(`[TourismService] Failed to load tourism spots: ${e.message}`);
        }
        console.warn("[TourismService] Supabase Tourism spots fetch failed, falling back to LocalStorage:", e.message || e);
      }
    }

    if (!isMockAllowed()) {
      throw new Error("[TourismService] Supabase is unconfigured. Production Mode requires a live database connection.");
    }
    return getStorageTourism();
  },

  async getDelicacies(): Promise<TourismSpotItem[]> {
    const spots = await this.getTourismSpots();
    // Filter items that represent food/delicacies or return all spots if none explicitly flagged
    const delicacies = spots.filter(s =>
      (s.description && (s.description.toLowerCase().includes("delicacy") || s.description.toLowerCase().includes("food") || s.description.toLowerCase().includes("calamay") || s.description.toLowerCase().includes("seafood"))) ||
      (s.name && (s.name.toLowerCase().includes("delicacy") || s.name.toLowerCase().includes("calamay") || s.name.toLowerCase().includes("seafood") || s.name.toLowerCase().includes("crab")))
    );
    return delicacies.length > 0 ? delicacies : spots;
  },

  async createTourismSpot(item: Omit<TourismSpotItem, "id">, userEmail: string): Promise<TourismSpotItem> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("tourism_spots")
          .insert([item])
          .select()
          .maybeSingle();
        if (error) throw error;
        if (data) {
          await logCmsAction(userEmail, "CREATE", "tourism_spots", data.id);
          return data as TourismSpotItem;
        }
      } catch (e: any) {
        console.error("[TourismService] Supabase Tourism insert failed:", e.message || e);
        throw e;
      }
    }

    if (!isMockAllowed()) {
      throw new Error("[TourismService] Supabase is unconfigured. Production Mode requires a live database connection to save data.");
    }

    const id = "mock-" + Math.random().toString(36).substring(2, 9);
    const newItem = { ...item, id } as TourismSpotItem;
    const list = getStorageTourism();
    list.unshift(newItem);
    setStorageTourism(list);
    await logCmsAction(userEmail, "CREATE", "tourism_spots", id);
    return newItem;
  },

  async updateTourismSpot(id: string, item: Partial<TourismSpotItem>, userEmail: string): Promise<TourismSpotItem> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("tourism_spots")
          .update(item)
          .eq("id", id)
          .select()
          .maybeSingle();
        if (error) throw error;
        if (data) {
          await logCmsAction(userEmail, "UPDATE", "tourism_spots", id);
          return data as TourismSpotItem;
        }
      } catch (e: any) {
        console.error("[TourismService] Supabase Tourism update failed:", e.message || e);
        throw e;
      }
    }

    if (!isMockAllowed()) {
      throw new Error("[TourismService] Supabase is unconfigured. Production Mode requires a live database connection to update data.");
    }

    const list = getStorageTourism();
    const index = list.findIndex(n => n.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...item };
      setStorageTourism(list);
      await logCmsAction(userEmail, "UPDATE", "tourism_spots", id);
      return list[index];
    }
    throw new Error("Tourism spot not found");
  },

  async deleteTourismSpot(id: string, userEmail: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from("tourism_spots")
          .delete()
          .eq("id", id);
        if (error) throw error;
        await logCmsAction(userEmail, "DELETE", "tourism_spots", id);
        return true;
      } catch (e: any) {
        console.error("[TourismService] Supabase Tourism delete failed:", e.message || e);
        throw e;
      }
    }

    if (!isMockAllowed()) {
      throw new Error("[TourismService] Supabase is unconfigured. Production Mode requires a live database connection to delete data.");
    }

    const list = getStorageTourism();
    const filtered = list.filter(n => n.id !== id);
    setStorageTourism(filtered);
    await logCmsAction(userEmail, "DELETE", "tourism_spots", id);
    return true;
  }
};
