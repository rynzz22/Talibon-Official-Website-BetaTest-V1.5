import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { logCmsAction, NewsItem } from "./cmsService";
import { isMockAllowed } from "../lib/mode";

const INITIAL_NEWS: NewsItem[] = [
  {
    id: "news-1",
    title: "Talibon Secures Outstanding Ranking in National Competitiveness Index",
    slug: "talibon-national-competitiveness-ranking",
    summary: "The Municipality of Talibon ranks 17th among 1st and 2nd class municipalities nationwide on the Cities and Municipalities Competitiveness Index (CMCI).",
    content: "The Department of Trade and Industry (DTI) recognized Talibon for its outstanding performance in economic dynamism, government efficiency, infrastructure development, and resiliency. Mayor Janette Aurestila-Garcia expressed her appreciation to the local municipal staff and citizens who worked tirelessly to implement modernization reforms.",
    category: "UPDATE",
    author: "Municipal Administrator",
    date: new Date().toISOString().split("T")[0],
    status: "published",
  }
];

function getStorageNews(): NewsItem[] {
  const data = localStorage.getItem("cms_data:news");
  if (!data) {
    localStorage.setItem("cms_data:news", JSON.stringify(INITIAL_NEWS));
    return INITIAL_NEWS;
  }
  return JSON.parse(data);
}

function setStorageNews(data: NewsItem[]): void {
  localStorage.setItem("cms_data:news", JSON.stringify(data));
}

export const newsService = {
  async getNews(): Promise<NewsItem[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("news")
          .select("*")
          .is("deleted_at", null)
          .order("date", { ascending: false });
        if (error) throw error;
        if (data) return data as NewsItem[];
      } catch (e: any) {
        if (!isMockAllowed()) {
          throw new Error(`[NewsService] Failed to load news items: ${e.message}`);
        }
        console.warn("[NewsService] Supabase News fetch failed, falling back to LocalStorage:", e.message || e);
      }
    }

    if (!isMockAllowed()) {
      throw new Error("[NewsService] Supabase is unconfigured. Production Mode requires a live database connection.");
    }
    return getStorageNews();
  },

  async getNewsById(identifier: string): Promise<NewsItem | null> {
    if (!identifier) return null;

    let cleanId = identifier.trim();
    try {
      cleanId = decodeURIComponent(cleanId).trim();
    } catch {
      // ignore decoding error and use raw
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId);
    const identifierType = isUuid ? "UUID (id)" : "SLUG / STRING ID";

    console.log(`[NewsService:Detail] Fetching news. Route param: "${identifier}", Decoded: "${cleanId}", Identifier Type: ${identifierType}`);

    if (isSupabaseConfigured) {
      try {
        // 1. Primary lookup based on UUID or matching ID
        if (isUuid) {
          const { data, error } = await supabase
            .from("news")
            .select("*")
            .eq("id", cleanId)
            .is("deleted_at", null)
            .maybeSingle();

          if (error) {
            console.warn(`[NewsService:Detail] Supabase query error for ID "${cleanId}":`, error.message || error);
          } else if (data) {
            console.log(`[NewsService:Detail] Found record by ID: "${data.id}" - Title: "${data.title}"`);
            return data as NewsItem;
          }
        } else {
          // 2. Lookup for non-UUID strings: try slug first, then fallback to id if string id column
          const { data: slugData, error: slugError } = await supabase
            .from("news")
            .select("*")
            .eq("slug", cleanId)
            .is("deleted_at", null)
            .maybeSingle();

          if (slugError) {
            console.warn(`[NewsService:Detail] Supabase query error for slug "${cleanId}":`, slugError.message || slugError);
          } else if (slugData) {
            console.log(`[NewsService:Detail] Found record by slug: "${slugData.id}" - Title: "${slugData.title}"`);
            return slugData as NewsItem;
          }

          // Fallback: in case non-UUID format is an ID in string format
          try {
            const { data: idData, error: idError } = await supabase
              .from("news")
              .select("*")
              .eq("id", cleanId)
              .is("deleted_at", null)
              .maybeSingle();

            if (!idError && idData) {
              console.log(`[NewsService:Detail] Found record by string ID: "${idData.id}"`);
              return idData as NewsItem;
            }
          } catch {
            // Ignore type error if UUID mismatch
          }
        }

        console.log(`[NewsService:Detail] No database record returned for "${cleanId}"`);
      } catch (err: any) {
        console.warn(`[NewsService:Detail] Exception querying Supabase:`, err.message || err);
      }
    }

    // Fallback for offline/mock development
    const list = getStorageNews();
    const found = list.find((n) => n.id === cleanId || n.slug === cleanId || n.title.toLowerCase() === cleanId.toLowerCase());
    if (found) {
      console.log(`[NewsService:Detail] Found record in mock/local storage: "${found.id}"`);
      return found;
    }

    const initFound = INITIAL_NEWS.find(n => n.id === cleanId || n.slug === cleanId);
    if (initFound) {
      return initFound;
    }

    return null;
  },

  async createNews(item: Omit<NewsItem, "id">, userEmail: string): Promise<NewsItem> {
    if (isSupabaseConfigured) {
      try {
        const now = new Date().toISOString();
        const insertPayload = {
          ...item,
          published_at: item.status === "published" ? now : null,
          updated_at: now
        };

        const { data, error } = await supabase
          .from("news")
          .insert([insertPayload])
          .select()
          .maybeSingle();
        if (error) throw error;
        if (data) {
          await logCmsAction(userEmail, "CREATE", "news", data.id);
          return data as NewsItem;
        }
      } catch (e: any) {
        console.error("[NewsService] Supabase News insert failed:", e.message || e);
        throw e;
      }
    }

    if (!isMockAllowed()) {
      throw new Error("[NewsService] Supabase is unconfigured. Production Mode requires a live database connection to save news.");
    }

    const id = "mock-" + Math.random().toString(36).substring(2, 9);
    const newItem = { ...item, id } as NewsItem;
    const list = getStorageNews();
    list.unshift(newItem);
    setStorageNews(list);
    await logCmsAction(userEmail, "CREATE", "news", id);
    return newItem;
  },

  async updateNews(id: string, item: Partial<NewsItem>, userEmail: string): Promise<NewsItem> {
    if (isSupabaseConfigured) {
      try {
        const now = new Date().toISOString();
        const updatePayload: any = {
          ...item,
          updated_at: now
        };

        if (item.status === "published") {
          updatePayload.published_at = now;
        }

        const { data, error } = await supabase
          .from("news")
          .update(updatePayload)
          .eq("id", id)
          .select()
          .maybeSingle();
        if (error) throw error;
        if (data) {
          await logCmsAction(userEmail, "UPDATE", "news", id);
          return data as NewsItem;
        }
      } catch (e: any) {
        console.error("[NewsService] Supabase News update failed:", e.message || e);
        throw e;
      }
    }

    if (!isMockAllowed()) {
      throw new Error("[NewsService] Supabase is unconfigured. Production Mode requires a live database connection to update news.");
    }

    const list = getStorageNews();
    const index = list.findIndex(n => n.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...item };
      setStorageNews(list);
      await logCmsAction(userEmail, "UPDATE", "news", id);
      return list[index];
    }
    throw new Error("News item not found");
  },

  async deleteNews(id: string, userEmail: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from("news")
          .delete()
          .eq("id", id);
        if (error) throw error;
        await logCmsAction(userEmail, "DELETE", "news", id);
        return true;
      } catch (e: any) {
        console.error("[NewsService] Supabase News delete failed:", e.message || e);
        throw e;
      }
    }

    if (!isMockAllowed()) {
      throw new Error("[NewsService] Supabase is unconfigured. Production Mode requires a live database connection to delete news.");
    }

    const list = getStorageNews();
    const filtered = list.filter(n => n.id !== id);
    setStorageNews(filtered);
    await logCmsAction(userEmail, "DELETE", "news", id);
    return true;
  },

  /**
   * Directly publish news by updating status, published_at, and updated_at
   */
  async publishNewsRpc(newsId: string, userEmail: string): Promise<any> {
    if (isSupabaseConfigured) {
      try {
        const now = new Date().toISOString();
        const { data, error } = await supabase
          .from("news")
          .update({
            status: "published",
            published_at: now,
            updated_at: now
          })
          .eq("id", newsId)
          .select()
          .maybeSingle();

        if (error) throw error;
        await logCmsAction(userEmail, "PUBLISH", "news", newsId);
        return data;
      } catch (e: any) {
        console.error("[NewsService] Direct publish news failed:", e.message || e);
        throw e;
      }
    }
    if (!isMockAllowed()) {
      throw new Error("[NewsService] Supabase is unconfigured. Production Mode requires a live database connection to publish news.");
    }
    return this.updateNews(newsId, { status: "published" }, userEmail);
  }
};
