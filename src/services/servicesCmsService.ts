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

const isValidUuid = (str: string | null | undefined): boolean =>
  typeof str === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str.trim());

function getStorageServices(): ServiceCmsItem[] {
  if (typeof localStorage === 'undefined') return INITIAL_SERVICES;
  const data = localStorage.getItem("cms_data:services_cms");
  if (!data) {
    localStorage.setItem("cms_data:services_cms", JSON.stringify(INITIAL_SERVICES));
    return INITIAL_SERVICES;
  }
  return JSON.parse(data);
}

function setStorageServices(data: ServiceCmsItem[]): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem("cms_data:services_cms", JSON.stringify(data));
}

export const servicesCmsService = {
  async getServices(): Promise<ServiceCmsItem[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("municipal_services")
          .select("*, departments:office_responsible_id(id, name)")
          .is("deleted_at", null)
          .order("name", { ascending: true });
        if (error) throw error;
        if (data) {
          return data.map((d: any) => ({
            id: d.id,
            name: d.name,
            slug: d.slug,
            description: d.description,
            purpose: d.purpose || "",
            requirements: Array.isArray(d.requirements) ? d.requirements : [],
            processing_time: d.processing_time || "3 to 5 business days",
            fees: d.fees || "None",
            office_responsible_id: d.office_responsible_id || null,
            office_responsible: d.departments?.name || d.office_responsible || "Municipal Office",
            office_hours: d.office_hours || "Monday to Friday, 8:00 AM - 5:00 PM",
            contact_info: d.contact_info || "",
            physical_address: d.physical_address || "",
            status: d.status || "available",
            downloadable_forms: Array.isArray(d.downloadable_forms) ? d.downloadable_forms : [],
            created_at: d.created_at
          })) as ServiceCmsItem[];
        }
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
    const officeRespId = isValidUuid(item.office_responsible_id)
      ? item.office_responsible_id
      : isValidUuid(item.office_responsible)
      ? item.office_responsible
      : null;

    const payload = {
      name: item.name,
      slug: item.slug || item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      description: item.description,
      purpose: item.purpose || null,
      requirements: item.requirements || [],
      processing_time: item.processing_time || null,
      fees: item.fees || null,
      office_responsible_id: officeRespId,
      office_responsible: item.office_responsible || "Municipal Office",
      office_hours: item.office_hours || "Monday to Friday, 8:00 AM - 5:00 PM",
      contact_info: item.contact_info || null,
      physical_address: item.physical_address || null,
      status: item.status || "available",
      downloadable_forms: item.downloadable_forms || []
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("municipal_services")
          .insert([payload])
          .select("*, departments:office_responsible_id(id, name)")
          .maybeSingle();
        if (error) throw error;
        if (data) {
          await logCmsAction(userEmail, "CREATE", "municipal_services", data.id);
          return {
            id: data.id,
            name: data.name,
            slug: data.slug,
            description: data.description,
            purpose: data.purpose || "",
            requirements: Array.isArray(data.requirements) ? data.requirements : [],
            processing_time: data.processing_time || "",
            fees: data.fees || "",
            office_responsible_id: data.office_responsible_id || null,
            office_responsible: data.departments?.name || data.office_responsible || "Municipal Office",
            office_hours: data.office_hours || "",
            contact_info: data.contact_info || "",
            physical_address: data.physical_address || "",
            status: data.status || "available",
            downloadable_forms: Array.isArray(data.downloadable_forms) ? data.downloadable_forms : [],
            created_at: data.created_at
          } as ServiceCmsItem;
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
    await logCmsAction(userEmail, "CREATE", "municipal_services", id);
    return newItem;
  },

  async updateService(id: string, item: Partial<ServiceCmsItem>, userEmail: string): Promise<ServiceCmsItem> {
    const payload: any = {};
    if (item.name !== undefined) payload.name = item.name;
    if (item.slug !== undefined) payload.slug = item.slug;
    if (item.description !== undefined) payload.description = item.description;
    if (item.purpose !== undefined) payload.purpose = item.purpose || null;
    if (item.requirements !== undefined) payload.requirements = item.requirements;
    if (item.processing_time !== undefined) payload.processing_time = item.processing_time || null;
    if (item.fees !== undefined) payload.fees = item.fees || null;
    if (item.office_responsible !== undefined || item.office_responsible_id !== undefined) {
      const candidate = item.office_responsible_id || item.office_responsible;
      payload.office_responsible_id = isValidUuid(candidate) ? candidate : null;
      if (item.office_responsible) payload.office_responsible = item.office_responsible;
    }
    if (item.office_hours !== undefined) payload.office_hours = item.office_hours || null;
    if (item.contact_info !== undefined) payload.contact_info = item.contact_info || null;
    if (item.physical_address !== undefined) payload.physical_address = item.physical_address || null;
    if (item.status !== undefined) payload.status = item.status;
    if (item.downloadable_forms !== undefined) payload.downloadable_forms = item.downloadable_forms;

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("municipal_services")
          .update(payload)
          .eq("id", id)
          .select("*, departments:office_responsible_id(id, name)")
          .maybeSingle();
        if (error) throw error;
        if (data) {
          await logCmsAction(userEmail, "UPDATE", "municipal_services", id);
          return {
            id: data.id,
            name: data.name,
            slug: data.slug,
            description: data.description,
            purpose: data.purpose || "",
            requirements: Array.isArray(data.requirements) ? data.requirements : [],
            processing_time: data.processing_time || "",
            fees: data.fees || "",
            office_responsible_id: data.office_responsible_id || null,
            office_responsible: data.departments?.name || data.office_responsible || "Municipal Office",
            office_hours: data.office_hours || "",
            contact_info: data.contact_info || "",
            physical_address: data.physical_address || "",
            status: data.status || "available",
            downloadable_forms: Array.isArray(data.downloadable_forms) ? data.downloadable_forms : [],
            created_at: data.created_at
          } as ServiceCmsItem;
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
      await logCmsAction(userEmail, "UPDATE", "municipal_services", id);
      return list[index];
    }
    throw new Error("Service item not found");
  },

  async deleteService(id: string, userEmail: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from("municipal_services")
          .update({ deleted_at: new Date().toISOString() })
          .eq("id", id);
        if (error) throw error;
        await logCmsAction(userEmail, "DELETE", "municipal_services", id);
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
    await logCmsAction(userEmail, "DELETE", "municipal_services", id);
    return true;
  }
};
