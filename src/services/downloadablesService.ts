import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { logCmsAction, DownloadableItem } from "./cmsService";
import { isMockAllowed } from "../lib/mode";

const INITIAL_DOWNLOADS: DownloadableItem[] = [
  {
    id: "dl-1",
    title: "Unified Business Permit Application Form 2026",
    description: "Standard application form for new business registrations and renewals.",
    category: "forms",
    file_url: "http://talibon.gov.ph/wp-content/uploads/2025/10/BUSINESS-PERMIT-APPLICATION-FORM.pdf",
    file_size: "1.4 MB",
    status: "published",
  },
  {
    id: "dl-2",
    title: "Unified Application Form for Building Permit",
    description: "Required for all structural and civil engineering construction clearances.",
    category: "forms",
    file_url: "http://talibon.gov.ph/wp-content/uploads/2025/10/UNIFIED-APPLICATION-FORM-FOR-BUILDING-PERMIT.pdf",
    file_size: "2.1 MB",
    status: "published",
  }
];

function getStorageDownloads(): DownloadableItem[] {
  const data = localStorage.getItem("cms_data:downloadables");
  if (!data) {
    localStorage.setItem("cms_data:downloadables", JSON.stringify(INITIAL_DOWNLOADS));
    return INITIAL_DOWNLOADS;
  }
  return JSON.parse(data);
}

function setStorageDownloads(data: DownloadableItem[]): void {
  localStorage.setItem("cms_data:downloadables", JSON.stringify(data));
}

function mapDocumentToDownloadable(d: any): DownloadableItem {
  return {
    id: d.id,
    title: d.title,
    description: d.description || (d.department ? `Office: ${d.department}` : (d.category || '')),
    category: d.category || 'forms',
    file_url: d.file_url || '',
    file_size: d.file_size || '1.2 MB',
    status: d.status || 'published',
    created_at: d.created_at
  };
}

export const downloadablesService = {
  async getDownloadables(): Promise<DownloadableItem[]> {
    if (isSupabaseConfigured) {
      try {
        // Query transparency_documents primary table
        const { data, error } = await supabase
          .from("transparency_documents")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data) {
          return data.map(mapDocumentToDownloadable);
        }

        // Secondary fallback to downloadables view if transparency_documents query throws
        if (error) {
          const { data: viewData, error: viewError } = await supabase
            .from("downloadables")
            .select("*")
            .order("created_at", { ascending: false });
          if (viewError) throw viewError;
          if (viewData) return viewData.map(mapDocumentToDownloadable);
        }
      } catch (e: any) {
        if (!isMockAllowed()) {
          throw new Error(`[DownloadablesService] Failed to load downloadables: ${e.message}`);
        }
        console.warn("[DownloadablesService] Supabase Downloadables fetch failed, falling back to LocalStorage:", e.message || e);
      }
    }

    if (!isMockAllowed()) {
      throw new Error("[DownloadablesService] Supabase is unconfigured. Production Mode requires a live database connection.");
    }
    return getStorageDownloads();
  },

  async createDownloadable(item: Omit<DownloadableItem, "id">, userEmail: string): Promise<DownloadableItem> {
    if (isSupabaseConfigured) {
      try {
        // Map payload strictly to matching columns of transparency_documents
        const payload = {
          title: item.title,
          category: item.category || 'forms',
          department: (item as any).department || null,
          fiscal_year: (item as any).fiscal_year || new Date().getFullYear(),
          quarter: (item as any).quarter || 'Q1',
          file_url: item.file_url || null,
          file_size: item.file_size || '1.2 MB',
          status: item.status || 'published',
          downloads_count: 0
        };

        const { data, error } = await supabase
          .from("transparency_documents")
          .insert([payload])
          .select()
          .maybeSingle();

        if (error) {
          // If direct table insert fails, attempt view insert
          const { data: viewData, error: viewErr } = await supabase
            .from("downloadables")
            .insert([payload])
            .select()
            .maybeSingle();
          if (viewErr) throw error;
          if (viewData) {
            await logCmsAction(userEmail, "CREATE", "downloadables", viewData.id);
            return mapDocumentToDownloadable(viewData);
          }
        }

        if (data) {
          await logCmsAction(userEmail, "CREATE", "downloadables", data.id);
          return mapDocumentToDownloadable(data);
        }
      } catch (e: any) {
        console.error("[DownloadablesService] Supabase Downloadables insert failed:", e.message || e);
        throw e;
      }
    }

    if (!isMockAllowed()) {
      throw new Error("[DownloadablesService] Supabase is unconfigured. Production Mode requires a live database connection to save downloadable items.");
    }

    const id = "mock-" + Math.random().toString(36).substring(2, 9);
    const newItem = { ...item, id } as DownloadableItem;
    const list = getStorageDownloads();
    list.unshift(newItem);
    setStorageDownloads(list);
    await logCmsAction(userEmail, "CREATE", "downloadables", id);
    return newItem;
  },

  async updateDownloadable(id: string, item: Partial<DownloadableItem>, userEmail: string): Promise<DownloadableItem> {
    if (isSupabaseConfigured) {
      try {
        const updatePayload: any = {
          updated_at: new Date().toISOString()
        };
        if (item.title !== undefined) updatePayload.title = item.title;
        if (item.category !== undefined) updatePayload.category = item.category;
        if ((item as any).department !== undefined) updatePayload.department = (item as any).department;
        if ((item as any).fiscal_year !== undefined) updatePayload.fiscal_year = (item as any).fiscal_year;
        if ((item as any).quarter !== undefined) updatePayload.quarter = (item as any).quarter;
        if (item.file_url !== undefined) updatePayload.file_url = item.file_url;
        if (item.file_size !== undefined) updatePayload.file_size = item.file_size;
        if (item.status !== undefined) updatePayload.status = item.status;

        const { data, error } = await supabase
          .from("transparency_documents")
          .update(updatePayload)
          .eq("id", id)
          .select()
          .maybeSingle();

        if (error) {
          const { data: viewData, error: viewErr } = await supabase
            .from("downloadables")
            .update(updatePayload)
            .eq("id", id)
            .select()
            .maybeSingle();
          if (viewErr) throw error;
          if (viewData) {
            await logCmsAction(userEmail, "UPDATE", "downloadables", id);
            return mapDocumentToDownloadable(viewData);
          }
        }

        if (data) {
          await logCmsAction(userEmail, "UPDATE", "downloadables", id);
          return mapDocumentToDownloadable(data);
        }
      } catch (e: any) {
        console.error("[DownloadablesService] Supabase Downloadables update failed:", e.message || e);
        throw e;
      }
    }

    if (!isMockAllowed()) {
      throw new Error("[DownloadablesService] Supabase is unconfigured. Production Mode requires a live database connection to update data.");
    }

    const list = getStorageDownloads();
    const index = list.findIndex(n => n.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...item };
      setStorageDownloads(list);
      await logCmsAction(userEmail, "UPDATE", "downloadables", id);
      return list[index];
    }
    throw new Error("Downloadable item not found");
  },

  async deleteDownloadable(id: string, userEmail: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from("transparency_documents")
          .delete()
          .eq("id", id);

        if (error) {
          const { error: viewErr } = await supabase
            .from("downloadables")
            .delete()
            .eq("id", id);
          if (viewErr) throw error;
        }

        await logCmsAction(userEmail, "DELETE", "downloadables", id);
        return true;
      } catch (e: any) {
        console.error("[DownloadablesService] Supabase Downloadables delete failed:", e.message || e);
        throw e;
      }
    }

    if (!isMockAllowed()) {
      throw new Error("[DownloadablesService] Supabase is unconfigured. Production Mode requires a live database connection to delete data.");
    }

    const list = getStorageDownloads();
    const filtered = list.filter(n => n.id !== id);
    setStorageDownloads(filtered);
    await logCmsAction(userEmail, "DELETE", "downloadables", id);
    return true;
  }
};
