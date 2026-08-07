import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { logCmsAction, EventItem } from "./cmsService";
import { isMockAllowed } from "../lib/mode";

const INITIAL_EVENTS: EventItem[] = [
  {
    id: "evt-1",
    title: "Talibon Annual Town Fiesta",
    description: "A grand cultural and religious celebration in honor of Blessed Virgin Mary, featuring local pageantry, sports leagues, and sea-sports competitions on Danajon Bank.",
    date: "2026-10-08",
    time: "8:00 AM - 11:00 PM",
    venue: "Talibon Town Plaza & Cultural Center",
    banner_image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=800"
  }
];

function getStorageEvents(): EventItem[] {
  const data = localStorage.getItem("cms_data:events");
  if (!data) {
    localStorage.setItem("cms_data:events", JSON.stringify(INITIAL_EVENTS));
    return INITIAL_EVENTS;
  }
  return JSON.parse(data);
}

function setStorageEvents(data: EventItem[]): void {
  localStorage.setItem("cms_data:events", JSON.stringify(data));
}

export const eventService = {
  async getEvents(): Promise<EventItem[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .order("date", { ascending: true });
        if (error) throw error;
        if (data) return data as EventItem[];
      } catch (e: any) {
        if (!isMockAllowed()) {
          throw new Error(`[EventService] Failed to load events: ${e.message}`);
        }
        console.warn("[EventService] Supabase Events fetch failed, falling back to LocalStorage:", e.message || e);
      }
    }

    if (!isMockAllowed()) {
      throw new Error("[EventService] Supabase is unconfigured. Production Mode requires a live database connection.");
    }
    return getStorageEvents();
  },

  async createEvent(item: Omit<EventItem, "id">, userEmail: string): Promise<EventItem> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("events")
          .insert([item])
          .select()
          .maybeSingle();
        if (error) throw error;
        if (data) {
          await logCmsAction(userEmail, "CREATE", "events", data.id);
          return data as EventItem;
        }
      } catch (e: any) {
        console.error("[EventService] Supabase Events insert failed:", e.message || e);
        throw e;
      }
    }

    if (!isMockAllowed()) {
      throw new Error("[EventService] Supabase is unconfigured. Production Mode requires a live database connection to save events.");
    }

    const id = "mock-" + Math.random().toString(36).substring(2, 9);
    const newItem = { ...item, id } as EventItem;
    const list = getStorageEvents();
    list.unshift(newItem);
    setStorageEvents(list);
    await logCmsAction(userEmail, "CREATE", "events", id);
    return newItem;
  },

  async updateEvent(id: string, item: Partial<EventItem>, userEmail: string): Promise<EventItem> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("events")
          .update(item)
          .eq("id", id)
          .select()
          .maybeSingle();
        if (error) throw error;
        if (data) {
          await logCmsAction(userEmail, "UPDATE", "events", id);
          return data as EventItem;
        }
      } catch (e: any) {
        console.error("[EventService] Supabase Events update failed:", e.message || e);
        throw e;
      }
    }

    if (!isMockAllowed()) {
      throw new Error("[EventService] Supabase is unconfigured. Production Mode requires a live database connection to update data.");
    }

    const list = getStorageEvents();
    const index = list.findIndex(n => n.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...item };
      setStorageEvents(list);
      await logCmsAction(userEmail, "UPDATE", "events", id);
      return list[index];
    }
    throw new Error("Event item not found");
  },

  async deleteEvent(id: string, userEmail: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from("events")
          .delete()
          .eq("id", id);
        if (error) throw error;
        await logCmsAction(userEmail, "DELETE", "events", id);
        return true;
      } catch (e: any) {
        console.error("[EventService] Supabase Events delete failed:", e.message || e);
        throw e;
      }
    }

    if (!isMockAllowed()) {
      throw new Error("[EventService] Supabase is unconfigured. Production Mode requires a live database connection to delete data.");
    }

    const list = getStorageEvents();
    const filtered = list.filter(n => n.id !== id);
    setStorageEvents(filtered);
    await logCmsAction(userEmail, "DELETE", "events", id);
    return true;
  }
};
