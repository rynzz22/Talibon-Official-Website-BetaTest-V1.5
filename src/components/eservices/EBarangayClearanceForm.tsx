import React, { useState } from "react";
import { motion } from "motion/react";
import { FileCheck, AlertCircle, ShieldCheck, File, ArrowRight } from "lucide-react";
import { certificateService, saveLocalRequest } from "../../services/certificateService";
import { BARANGAYS } from "../../constants/barangayConfig";
import { notificationService } from "../../services/notificationService";
import { isMockAllowed } from "../../lib/mode";

interface EBarangayClearanceFormProps {
  onSuccess: (result: any) => void;
}

export default function EBarangayClearanceForm({ onSuccess }: EBarangayClearanceFormProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    barangay: "poblacion",
    sitioPurok: "",
    yearsOfResidency: "",
    purpose: "Local Employment",
    email: "",
    mobileNumber: ""
  });

  const [idFile, setIdFile] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIdFile(e.target.files[0].name);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!formData.fullName.trim()) return setValidationError("Full legal name is required.");
    if (!formData.sitioPurok.trim()) return setValidationError("Sitio / Purok is required.");
    if (!formData.yearsOfResidency.trim()) return setValidationError("Years of residency is required.");
    if (!formData.purpose.trim()) return setValidationError("Purpose of clearance is required.");
    
    // Contact details validation (must provide at least one)
    const emailVal = formData.email.trim();
    const mobileVal = formData.mobileNumber.trim();
    if (!emailVal && !mobileVal) {
      return setValidationError("At least one contact method (Email or Mobile Number) must be provided to receive request status notifications.");
    }

    if (emailVal) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailVal)) {
        return setValidationError("Please provide a valid email address.");
      }
    }

    if (mobileVal) {
      // Allow spaces/dashes, then count digits
      const digits = mobileVal.replace(/\D/g, "");
      if (digits.length < 10 || digits.length > 12) {
        return setValidationError("Please enter a valid PH mobile number (e.g. 09123456789).");
      }
    }

    if (!idFile) return setValidationError("Please upload a valid Government-issued ID.");

    setIsSubmitting(true);

    try {
      // Serialize form fields as JSON to keep structure inside `purpose`
      const serializedPurpose = JSON.stringify({
        purposeText: formData.purpose,
        form_data: {
          fullName: formData.fullName,
          barangay: formData.barangay,
          sitioPurok: formData.sitioPurok,
          yearsOfResidency: formData.yearsOfResidency
        }
      });

      const payload = {
        documentType: "Barangay Clearance",
        barangay: formData.barangay,
        fullName: formData.fullName,
        email: emailVal || "",
        mobileNumber: mobileVal || "",
        purpose: serializedPurpose,
        attachments: [idFile].filter(Boolean) as string[]
      };

      const response = await certificateService.submitRequest(payload);
      
      if (response) {
        // Trigger Barangay staff notification
        try {
          await notificationService.createNotification({
            title: "New Municipal Service Request",
            message: `${formData.fullName} submitted a new Barangay Clearance application for Barangay ${formData.barangay}.`,
            category: "Citizen Applications",
            department_id: "barangay_admin",
            action_url: "workflows"
          });
        } catch (notifErr) {
          console.warn("Failed to create barangay notification", notifErr);
        }

        onSuccess(response);
      }
    } catch (error) {
      if (!isMockAllowed()) {
        throw error;
      }
      console.info("[BarangayClearanceForm] Submit using offline local storage fallback");
      
      // Client-side fallback
      const generatedId = `TAL-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(Math.floor(Math.random() * 8999) + 1000)}`;
      const fallbackRequest = {
        ticketId: generatedId,
        documentType: "Barangay Clearance",
        barangay: formData.barangay,
        fullName: formData.fullName,
        email: emailVal || "citizen-fallback@talibon.gov.ph",
        mobileNumber: mobileVal || "09123456789",
        purpose: JSON.stringify({
          purposeText: formData.purpose,
          form_data: {
            fullName: formData.fullName,
            barangay: formData.barangay,
            sitioPurok: formData.sitioPurok,
            yearsOfResidency: formData.yearsOfResidency
          }
        }),
        attachments: [idFile].filter(Boolean) as string[],
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
        <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
          <FileCheck size={20} />
        </div>
        <div>
          <h2 className="text-base font-black text-brand-text uppercase font-display tracking-tight">Barangay Clearance Application</h2>
          <p className="text-[10px] text-brand-muted font-bold uppercase tracking-widest mt-0.5">Submit online application to Concerned Barangay Office</p>
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
            <label className="form-label">Full Legal Name *</label>
            <input
              type="text"
              name="fullName"
              placeholder="e.g. Bernardo Carpio Jr."
              value={formData.fullName}
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
            <label className="form-label">Sitio / Purok *</label>
            <input
              type="text"
              name="sitioPurok"
              placeholder="e.g. Sitio San Roque, Purok 3"
              value={formData.sitioPurok}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-brand-border rounded-xl py-2 px-3 sm:px-3.5 font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-xs sm:text-sm"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="form-label">Years of Residency in Talibon *</label>
            <input
              type="number"
              name="yearsOfResidency"
              placeholder="e.g. 15"
              value={formData.yearsOfResidency}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-brand-border rounded-xl py-2 px-3 sm:px-3.5 font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-xs sm:text-sm"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="form-label">Purpose of Clearance *</label>
          <input
            type="text"
            name="purpose"
            placeholder="e.g. Local Employment, Bank Requirement, School Enrollment"
            value={formData.purpose}
            onChange={handleChange}
            className="w-full bg-gray-50 border border-brand-border rounded-xl py-2 px-3 sm:px-3.5 font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-xs sm:text-sm"
            required
          />
        </div>

        <div className="space-y-3 pt-3 border-t border-brand-border">
          <div className="flex items-center gap-2">
            <span className="text-sm">🔔</span>
            <span className="form-label !mb-0">Status Notification Channels (At least one required)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="e.g. joshua@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-brand-border rounded-xl py-2 px-3 sm:px-3.5 font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-xs sm:text-sm"
              />
              <p className="text-[9px] text-brand-muted font-medium">Primary channel for status updates and certificates.</p>
            </div>

            <div className="space-y-1.5">
              <label className="form-label">PH Mobile Number</label>
              <input
                type="tel"
                name="mobileNumber"
                placeholder="e.g. 09123456789"
                value={formData.mobileNumber}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-brand-border rounded-xl py-2 px-3 sm:px-3.5 font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-xs sm:text-sm"
              />
              <p className="text-[9px] text-brand-muted font-medium">Optional mobile backup for SMS reminders.</p>
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-3 border-t border-brand-border">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-brand-primary" />
            <span className="form-label !mb-0">Required Verification Attachments</span>
          </div>

          <div className="space-y-1.5">
            <label className="form-label">Valid Government-issued ID *</label>
            <div className="relative border-2 border-dashed border-brand-border rounded-xl p-4 text-center bg-gray-50/50 hover:bg-gray-50 transition-colors flex flex-col items-center justify-center cursor-pointer max-w-md">
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                required={!idFile}
              />
              <File size={24} className="text-brand-primary/40 mb-1" />
              <p className="text-xs font-bold text-brand-text">
                {idFile ? "Government ID Uploaded Successfully" : "Upload Government ID card Scan"}
              </p>
              <p className="text-[10px] text-brand-muted mt-0.5">PNG, JPG, PDF up to 5MB</p>
              {idFile && (
                <span className="mt-2 px-2.5 py-0.5 bg-white rounded-lg border border-brand-border text-[9px] font-bold uppercase tracking-wider text-brand-primary">
                  {idFile}
                </span>
              )}
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
            <>Submit Barangay Clearance Application <ArrowRight size={14} /></>
          )}
        </button>
      </form>
    </div>
  );
}
