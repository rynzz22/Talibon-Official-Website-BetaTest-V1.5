import React, { useState } from "react";
import { motion } from "motion/react";
import { Briefcase, AlertCircle, ShieldAlert, File, ArrowRight, ShieldCheck } from "lucide-react";
import { certificateService, saveLocalRequest } from "../../services/certificateService";
import { BARANGAYS } from "../../constants/barangayConfig";
import { notificationService } from "../../services/notificationService";
import { isMockAllowed } from "../../lib/mode";

interface EBusinessPermitFormProps {
  onSuccess: (result: any) => void;
}

export default function EBusinessPermitForm({ onSuccess }: EBusinessPermitFormProps) {
  const [formData, setFormData] = useState({
    businessName: "",
    ownerName: "",
    businessAddress: "",
    barangay: "poblacion",
    natureOfBusiness: "",
    dtiSecRegNo: "",
    contactNumber: "",
    email: "",
    purpose: "New Business Permit Registration"
  });

  const [dtiFile, setDtiFile] = useState<string | null>(null);
  const [idFile, setIdFile] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fileType: "dti" | "id") => {
    if (e.target.files && e.target.files.length > 0) {
      const fileName = e.target.files[0].name;
      if (fileType === "dti") {
        setDtiFile(fileName);
      } else {
        setIdFile(fileName);
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Form validation
    if (!formData.businessName.trim()) return setValidationError("Business name is required.");
    if (!formData.ownerName.trim()) return setValidationError("Owner / Applicant name is required.");
    if (!formData.businessAddress.trim()) return setValidationError("Business location address is required.");
    if (!formData.natureOfBusiness.trim()) return setValidationError("Nature of business is required.");
    if (!formData.contactNumber.trim()) return setValidationError("Contact number is required.");
    if (!formData.email.trim() || !formData.email.includes("@")) return setValidationError("A valid email address is required.");
    if (!dtiFile) return setValidationError("Please upload your DTI/SEC Registration Certificate.");
    if (!idFile) return setValidationError("Please upload a valid government-issued ID.");

    setIsSubmitting(true);

    try {
      // Serialize form fields as JSON to keep structure inside `purpose`
      const serializedPurpose = JSON.stringify({
        purposeText: formData.purpose,
        form_data: {
          businessName: formData.businessName,
          ownerName: formData.ownerName,
          businessAddress: formData.businessAddress,
          barangay: formData.barangay,
          natureOfBusiness: formData.natureOfBusiness,
          dtiSecRegNo: formData.dtiSecRegNo,
          contactNumber: formData.contactNumber,
          email: formData.email
        }
      });

      const payload = {
        documentType: "Business Permit",
        barangay: formData.barangay,
        fullName: formData.ownerName,
        email: formData.email,
        mobileNumber: formData.contactNumber,
        purpose: serializedPurpose,
        attachments: [dtiFile, idFile].filter(Boolean) as string[]
      };

      const response = await certificateService.submitRequest(payload);
      
      if (response) {
        // Trigger BPLO staff notification
        try {
          await notificationService.createNotification({
            title: "New Municipal Service Request",
            message: `${formData.ownerName} submitted a new Business Permit application for ${formData.businessName}.`,
            category: "Citizen Applications",
            department_id: "bplo",
            action_url: "workflows"
          });
        } catch (notifErr) {
          console.warn("Failed to create BPLO notification", notifErr);
        }

        onSuccess(response);
      }
    } catch (error) {
      if (!isMockAllowed()) {
        throw error;
      }
      console.info("[BusinessPermitForm] Submit using offline local storage fallback");
      
      // Client-side fallback
      const generatedId = `TAL-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(Math.floor(Math.random() * 8999) + 1000)}`;
      const fallbackRequest = {
        ticketId: generatedId,
        documentType: "Business Permit",
        barangay: formData.barangay,
        fullName: formData.ownerName,
        email: formData.email,
        mobileNumber: formData.contactNumber,
        purpose: JSON.stringify({
          purposeText: formData.purpose,
          form_data: {
            businessName: formData.businessName,
            ownerName: formData.ownerName,
            businessAddress: formData.businessAddress,
            barangay: formData.barangay,
            natureOfBusiness: formData.natureOfBusiness,
            dtiSecRegNo: formData.dtiSecRegNo,
            contactNumber: formData.contactNumber,
            email: formData.email
          }
        }),
        attachments: [dtiFile, idFile].filter(Boolean) as string[],
        submittedAt: new Date().toISOString(),
        status: "Submitted"
      };

      saveLocalRequest(fallbackRequest);
      onSuccess(fallbackRequest);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-brand-border rounded-2xl overflow-hidden shadow-xs">
      <div className="p-4 sm:p-5 border-b border-brand-border bg-gray-50 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
          <Briefcase size={20} />
        </div>
        <div>
          <h2 className="text-base font-black text-brand-text uppercase font-display tracking-tight">Business Permit Unified Application</h2>
          <p className="text-[10px] text-brand-muted font-bold uppercase tracking-widest mt-0.5">Submit online application to BPLO</p>
        </div>
      </div>

      <form onSubmit={handleFormSubmit} className="p-4 sm:p-5 space-y-4">
        {validationError && (
          <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold uppercase tracking-wide flex items-center gap-2.5">
            <AlertCircle size={16} className="shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div className="space-y-1.5">
            <label className="form-label">Registered Business Name *</label>
            <input
              type="text"
              name="businessName"
              placeholder="e.g. Bohol Divers Beach Resort"
              value={formData.businessName}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-brand-border rounded-xl py-2 px-3 sm:px-3.5 font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-xs sm:text-sm"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="form-label">Owner / Registrant Full Name *</label>
            <input
              type="text"
              name="ownerName"
              placeholder="e.g. Jose Rizal Macalinao"
              value={formData.ownerName}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-brand-border rounded-xl py-2 px-3 sm:px-3.5 font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-xs sm:text-sm"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div className="space-y-1.5">
            <label className="form-label">Nature of Business *</label>
            <input
              type="text"
              name="natureOfBusiness"
              placeholder="e.g. Resort & Hotel Operations, Retail Store"
              value={formData.natureOfBusiness}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-brand-border rounded-xl py-2 px-3 sm:px-3.5 font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-xs sm:text-sm"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="form-label">DTI or SEC Registration Number</label>
            <input
              type="text"
              name="dtiSecRegNo"
              placeholder="e.g. DTI-BHL-481903 (Optional)"
              value={formData.dtiSecRegNo}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-brand-border rounded-xl py-2 px-3 sm:px-3.5 font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-xs sm:text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div className="space-y-1.5">
            <label className="form-label">Business Physical Address *</label>
            <input
              type="text"
              name="businessAddress"
              placeholder="e.g. Sitio Divers, Sandingan Coast"
              value={formData.businessAddress}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-brand-border rounded-xl py-2 px-3 sm:px-3.5 font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-xs sm:text-sm"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="form-label">Registered Barangay *</label>
            <select
              name="barangay"
              value={formData.barangay}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-brand-border rounded-xl py-2 px-3 sm:px-3.5 font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-xs sm:text-sm"
            >
              {BARANGAYS.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div className="space-y-1.5">
            <label className="form-label">Mobile Contact Number *</label>
            <input
              type="tel"
              name="contactNumber"
              placeholder="e.g. 09123456789"
              value={formData.contactNumber}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-brand-border rounded-xl py-2 px-3 sm:px-3.5 font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-xs sm:text-sm"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              name="email"
              placeholder="e.g. owner@email.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-brand-border rounded-xl py-2 px-3 sm:px-3.5 font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-xs sm:text-sm"
              required
            />
          </div>
        </div>

        <div className="space-y-3 pt-3 border-t border-brand-border">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-brand-primary" />
            <span className="form-label !mb-0">Required Attachments (Identity & Business Legitimacy)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="form-label">DTI or SEC Registration Certificate *</label>
              <div className="relative border-2 border-dashed border-brand-border rounded-xl p-3 text-center bg-gray-50/50 hover:bg-gray-50 transition-colors flex flex-col items-center justify-center cursor-pointer">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileUpload(e, "dti")}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  required={!dtiFile}
                />
                <File size={20} className="text-brand-primary/40 mb-1" />
                <p className="text-xs font-bold text-brand-text">
                  {dtiFile ? "Certificate Selected" : "Upload DTI / SEC Registration"}
                </p>
                <p className="text-[9px] text-brand-muted">PDF or Image up to 5MB</p>
                {dtiFile && (
                  <span className="mt-1.5 px-2 py-0.5 bg-white rounded border border-brand-border text-[8px] font-bold text-brand-primary truncate max-w-full">
                    {dtiFile}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Valid Government-issued ID *</label>
              <div className="relative border-2 border-dashed border-brand-border rounded-xl p-3 text-center bg-gray-50/50 hover:bg-gray-50 transition-colors flex flex-col items-center justify-center cursor-pointer">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileUpload(e, "id")}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  required={!idFile}
                />
                <File size={20} className="text-brand-primary/40 mb-1" />
                <p className="text-xs font-bold text-brand-text">
                  {idFile ? "ID Uploaded Successfully" : "Upload Owner Valid ID"}
                </p>
                <p className="text-[9px] text-brand-muted">Passport, Driver's, National ID</p>
                {idFile && (
                  <span className="mt-1.5 px-2 py-0.5 bg-white rounded border border-brand-border text-[8px] font-bold text-brand-primary truncate max-w-full">
                    {idFile}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 bg-brand-primary hover:bg-brand-primary/95 text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>Submit Business Application <ArrowRight size={14} /></>
          )}
        </button>
      </form>
    </div>
  );
}
