import React, { useState } from "react";
import { motion } from "motion/react";
import { Sparkles, AlertCircle, ShieldCheck, File, ArrowRight } from "lucide-react";
import { certificateService, saveLocalRequest } from "../../services/certificateService";
import { BARANGAYS } from "../../constants/barangayConfig";
import { notificationService } from "../../services/notificationService";
import { isMockAllowed } from "../../lib/mode";

interface ECertificateOfIndigencyFormProps {
  onSuccess: (result: any) => void;
}

export default function ECertificateOfIndigencyForm({ onSuccess }: ECertificateOfIndigencyFormProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    address: "",
    barangay: "poblacion",
    monthlyIncome: "",
    familyMembers: "",
    purpose: "Medical Financial Assistance",
    reason: ""
  });

  const [certFile, setCertFile] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCertFile(e.target.files[0].name);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!formData.fullName.trim()) return setValidationError("Full legal name is required.");
    if (!formData.address.trim()) return setValidationError("Home address is required.");
    if (!formData.monthlyIncome.trim()) return setValidationError("Monthly family income is required.");
    if (!formData.purpose.trim()) return setValidationError("Purpose of indigency claim is required.");
    if (!certFile) return setValidationError("Please upload your signed Barangay Certificate of Indigency.");

    setIsSubmitting(true);

    try {
      // Serialize form fields as JSON to keep structure inside `purpose`
      const serializedPurpose = JSON.stringify({
        purposeText: formData.purpose,
        form_data: {
          fullName: formData.fullName,
          address: formData.address,
          barangay: formData.barangay,
          monthlyIncome: formData.monthlyIncome,
          familyMembers: formData.familyMembers,
          reason: formData.reason
        }
      });

      const payload = {
        documentType: "Certificate of Indigency",
        barangay: formData.barangay,
        fullName: formData.fullName,
        email: "mswdo-social@talibon.gov.ph",
        mobileNumber: "09123456789",
        purpose: serializedPurpose,
        attachments: [certFile].filter(Boolean) as string[]
      };

      const response = await certificateService.submitRequest(payload);
      
      if (response) {
        // Trigger MSWDO staff notification
        try {
          await notificationService.createNotification({
            title: "New Municipal Service Request",
            message: `${formData.fullName} submitted a new Certificate of Indigency application in Barangay ${formData.barangay}.`,
            category: "Citizen Applications",
            department_id: "mswdo",
            action_url: "workflows"
          });
        } catch (notifErr) {
          console.warn("Failed to create MSWDO notification", notifErr);
        }

        onSuccess(response);
      }
    } catch (error) {
      if (!isMockAllowed()) {
        throw error;
      }
      console.info("[IndigencyForm] Submit using offline local storage fallback");
      
      // Client-side fallback
      const generatedId = `TAL-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(Math.floor(Math.random() * 8999) + 1000)}`;
      const fallbackRequest = {
        ticketId: generatedId,
        documentType: "Certificate of Indigency",
        barangay: formData.barangay,
        fullName: formData.fullName,
        email: "mswdo-social@talibon.gov.ph",
        mobileNumber: "09123456789",
        purpose: JSON.stringify({
          purposeText: formData.purpose,
          form_data: {
            fullName: formData.fullName,
            address: formData.address,
            barangay: formData.barangay,
            monthlyIncome: formData.monthlyIncome,
            familyMembers: formData.familyMembers,
            reason: formData.reason
          }
        }),
        attachments: [certFile].filter(Boolean) as string[],
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
      <div className="p-5 border-b border-slate-100 bg-slate-50/60 flex items-center gap-3.5">
        <div className="w-10 h-10 bg-brand-primary/10 text-brand-primary rounded-xl flex items-center justify-center shrink-0">
          <Sparkles size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 font-display">Certificate of Indigency Application</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Submit your application online to the Municipal Social Welfare and Development Office (MSWDO)</p>
        </div>
      </div>

      <form onSubmit={handleFormSubmit} className="p-5 space-y-5">
        {validationError && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2.5">
            <AlertCircle size={16} className="shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Full Legal Name of Applicant <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="fullName"
              placeholder="e.g. Juan De La Cruz Jr."
              value={formData.fullName}
              onChange={handleChange}
              className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-3.5 text-sm text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all shadow-xs"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Registered Barangay <span className="text-red-500">*</span>
            </label>
            <select
              name="barangay"
              value={formData.barangay}
              onChange={handleChange}
              className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-3.5 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all shadow-xs"
            >
              {BARANGAYS.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Home Physical Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="address"
              placeholder="e.g. Sitio San Roque, Poblacion"
              value={formData.address}
              onChange={handleChange}
              className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-3.5 text-sm text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all shadow-xs"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Estimated Monthly Family Income (PHP) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="monthlyIncome"
              placeholder="e.g. 5000"
              value={formData.monthlyIncome}
              onChange={handleChange}
              className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-3.5 text-sm text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all shadow-xs"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Purpose of Request <span className="text-red-500">*</span>
            </label>
            <select
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-3.5 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all shadow-xs"
            >
              <option value="Medical Financial Assistance">Medical / Health Financial Assistance</option>
              <option value="Educational Scholarship Program">Educational / Scholarship Assistance</option>
              <option value="Burial Social Service Support">Burial & Funeral Social Support</option>
              <option value="Legal Court Defense Support">PAO / Legal Court Assistance</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Dependent Family Members
            </label>
            <input
              type="text"
              name="familyMembers"
              placeholder="e.g. Spouse (40), Child (12), Child (9)"
              value={formData.familyMembers}
              onChange={handleChange}
              className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-3.5 text-sm text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all shadow-xs"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 block">
            Reason for Request / Additional Details
          </label>
          <textarea
            name="reason"
            rows={3}
            placeholder="Please detail any specific emergency or situational need to support MSWDO evaluation (e.g. Currently hospitalized at Bohol Provincial Hospital, needing dialysis subsidy)"
            value={formData.reason}
            onChange={handleChange}
            className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-3.5 text-sm text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all resize-none shadow-xs"
          />
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs">
            <ShieldCheck size={16} className="text-brand-primary" />
            <span>Required Barangay Verification Attachments</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Barangay Indigency Certification <span className="text-red-500">*</span>
            </label>
            <div className="relative border-2 border-dashed border-slate-300 hover:border-brand-primary/60 rounded-xl p-4 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col items-center justify-center cursor-pointer max-w-md">
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                required={!certFile}
              />
              <File size={22} className="text-brand-primary/60 mb-1.5" />
              <p className="text-xs font-semibold text-slate-800">
                {certFile ? "Certification Selected Successfully" : "Upload Signed Barangay Certification file"}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">Signed by Barangay Captain, up to 5MB (PDF, JPG, PNG)</p>
              {certFile && (
                <span className="mt-2 px-2.5 py-1 bg-white rounded-lg border border-slate-200 text-xs font-medium text-brand-primary truncate max-w-full shadow-xs">
                  {certFile}
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-brand-primary hover:bg-brand-primary/95 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none mt-2"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>Submit Indigency Application <ArrowRight size={15} /></>
          )}
        </button>
      </form>
    </div>
  );
}
