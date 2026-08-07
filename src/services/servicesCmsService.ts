import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { logCmsAction, ServiceCmsItem } from "./cmsService";
import { isMockAllowed } from "../lib/mode";

const INITIAL_SERVICES: ServiceCmsItem[] = [
  {
    id: "apply-permit",
    name: "Apply for Permit",
    slug: "apply-permit",
    description: "Secure municipal permits, zoning clearance, and construction approvals required for business operations and physical structures.",
    purpose: "To regulate, monitor, and support business establishment and infrastructure development within Talibon in compliance with local ordinances, the National Building Code, and zoning regulations.",
    requirements: [
      "Unified Application Form (properly accomplished and notarized)",
      "Barangay Clearance for Business or Construction",
      "Valid Government-issued ID of the owner/applicant",
      "Occupancy Permit / Zoning Clearance",
      "Contract of Lease (if renting) or Land Title / Tax Declaration (if owned)",
      "Fire Safety Inspection Certificate (FSIC)"
    ],
    processing_time: "3 to 5 business days from submission of complete requirements",
    fees: "Varies based on assessment (BPLO / Engineering rules)",
    office_responsible: "Business Permits and Licensing Office (BPLO)",
    office_hours: "Monday to Friday, 8:00 AM - 5:00 PM (except holidays)",
    contact_info: "Phone: (038) 422-2895 | Email: bplo-talibon@gov.ph",
    physical_address: "Ground Floor, Executive Building, Talibon Municipal Hall, Bohol, Philippines",
    status: "available",
    downloadable_forms: [
      { title: "Business Permit Application Form", url: "http://talibon.gov.ph/wp-content/uploads/2025/10/BUSINESS-PERMIT-APPLICATION-FORM.pdf", fileSize: "1.4 MB" },
      { title: "Unified Application Form for Building Permit", url: "http://talibon.gov.ph/wp-content/uploads/2025/10/UNIFIED-APPLICATION-FORM-FOR-BUILDING-PERMIT.pdf", fileSize: "2.1 MB" }
    ]
  },
  {
    id: "request-certificate",
    name: "Request Certificate",
    slug: "request-certificate",
    description: "Obtain official civil registry documents, local clearances, residency certifications, and other municipal vital records.",
    purpose: "To provide legal certifications, civil registry records, and citizen clearances required for employment, legal purposes, travel, identification, or financial services.",
    requirements: [
      "Duly accomplished Request Slip / Application Form",
      "Valid Government-issued Identification Card (original and photocopy)",
      "Proof of Payment (Official Receipt from the Municipal Treasurer)"
    ],
    processing_time: "Same day processing (15 to 45 minutes for walk-in requests)",
    fees: "₱100.00 standard certification fee",
    office_responsible: "Local Civil Registry Office (LCRO) / Mayor's Office",
    office_hours: "Monday to Friday, 8:00 AM - 5:00 PM (except holidays)",
    contact_info: "Phone: (038) 422-2023 | Email: civilregistry-talibon@gov.ph",
    physical_address: "First Floor, Legislative Annex, Talibon Municipal Hall, Bohol, Philippines",
    status: "available",
    downloadable_forms: [
      { title: "Barangay Residency Request Form", url: "#", fileSize: "450 KB" }
    ]
  }
];

function getStorageServices(): ServiceCmsItem[] {
  const data = localStorage.getItem("cms_data:services_cms");
  if (!data) {
    localStorage.setItem("cms_data:services_cms", JSON.stringify(INITIAL_SERVICES));
    return INITIAL_SERVICES;
  }
  return JSON.parse(data);
}

function setStorageServices(data: ServiceCmsItem[]): void {
  localStorage.setItem("cms_data:services_cms", JSON.stringify(data));
}

export const servicesCmsService = {
  async getServices(): Promise<ServiceCmsItem[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("services_cms")
          .select("*")
          .order("name", { ascending: true });
        if (error) throw error;
        if (data) return data as ServiceCmsItem[];
      } catch (e: any) {
        if (!isMockAllowed()) {
          throw new Error(`[ServicesCmsService] Failed to load services: ${e.message}`);
        }
        console.warn("[ServicesCmsService] Supabase Services fetch failed, falling back to LocalStorage:", e.message || e);
      }
    }

    if (!isMockAllowed()) {
      throw new Error("[ServicesCmsService] Supabase is unconfigured. Production Mode requires a live database connection.");
    }
    return getStorageServices();
  },

  async createService(item: Omit<ServiceCmsItem, "id">, userEmail: string): Promise<ServiceCmsItem> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("services_cms")
          .insert([item])
          .select()
          .maybeSingle();
        if (error) throw error;
        if (data) {
          await logCmsAction(userEmail, "CREATE", "services_cms", data.id);
          return data as ServiceCmsItem;
        }
      } catch (e: any) {
        console.error("[ServicesCmsService] Supabase Services insert failed:", e.message || e);
        throw e;
      }
    }

    if (!isMockAllowed()) {
      throw new Error("[ServicesCmsService] Supabase is unconfigured. Production Mode requires a live database connection to save services.");
    }

    const id = "mock-" + Math.random().toString(36).substring(2, 9);
    const newItem = { ...item, id } as ServiceCmsItem;
    const list = getStorageServices();
    list.push(newItem);
    setStorageServices(list);
    await logCmsAction(userEmail, "CREATE", "services_cms", id);
    return newItem;
  },

  async updateService(id: string, item: Partial<ServiceCmsItem>, userEmail: string): Promise<ServiceCmsItem> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("services_cms")
          .update(item)
          .eq("id", id)
          .select()
          .maybeSingle();
        if (error) throw error;
        if (data) {
          await logCmsAction(userEmail, "UPDATE", "services_cms", id);
          return data as ServiceCmsItem;
        }
      } catch (e: any) {
        console.error("[ServicesCmsService] Supabase Services update failed:", e.message || e);
        throw e;
      }
    }

    if (!isMockAllowed()) {
      throw new Error("[ServicesCmsService] Supabase is unconfigured. Production Mode requires a live database connection to update data.");
    }

    const list = getStorageServices();
    const index = list.findIndex(n => n.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...item };
      setStorageServices(list);
      await logCmsAction(userEmail, "UPDATE", "services_cms", id);
      return list[index];
    }
    throw new Error("Service item not found");
  },

  async deleteService(id: string, userEmail: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from("services_cms")
          .delete()
          .eq("id", id);
        if (error) throw error;
        await logCmsAction(userEmail, "DELETE", "services_cms", id);
        return true;
      } catch (e: any) {
        console.error("[ServicesCmsService] Supabase Services delete failed:", e.message || e);
        throw e;
      }
    }

    if (!isMockAllowed()) {
      throw new Error("[ServicesCmsService] Supabase is unconfigured. Production Mode requires a live database connection to delete data.");
    }

    const list = getStorageServices();
    const filtered = list.filter(n => n.id !== id);
    setStorageServices(filtered);
    await logCmsAction(userEmail, "DELETE", "services_cms", id);
    return true;
  }
};
