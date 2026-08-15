import React, { useState } from "react";
import { motion } from "motion/react";
import { MapPin, AlertCircle, ShieldCheck, File, ArrowRight } from "lucide-react";
import { certificateService, saveLocalRequest } from "../../services/certificateService";
import { BARANGAYS } from "../../constants/barangayConfig";
import { notificationService } from "../../services/notificationService";
import { isMockAllowed } from "../../lib/mode";

interface EZoningClearanceFormProps {
  onSuccess: (result: any) => void;
}

export default function EZoningClearanceForm({ onSuccess }: EZoningClearanceFormProps) {
  const [formData, setFormData] = useState({
    applicantName: () => "", // Using initial empty state
    propertyAddress: "",
    barangay: "poblacion",
    lotNumber: "",
    taxDeclarationNo: "",
    purpose: "Residential Zoning Locational Clearance"
  });

  // Since React prefers standard state initializers over functional ones for pure strings
  const [applicant, setApplicant] = useState("");

  const [sketchFile, setSketchFile] = useState<string | null>(null);
  const [taxDecFile, setTaxDecFile] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fileType: "sketch" | "taxdec") => {
    if (e.target.files && e.target.files.length > 0) {
      const fileName = e.target.files[0].name;
      if (fileType === "sketch") {
        setSketchFile(fileName);
      } else {
        setTaxDecFile(fileName);
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Form validation
    if (!applicant.trim()) return setValidationError("Applicant name is required.");
    if (!formData.propertyAddress.trim()) return setValidationError("Property location address is required.");
    if (!formData.lotNumber.trim()) return setValidationError("Lot number is required.");
    if (!formData.taxDeclarationNo.trim()) return setValidationError("Tax Declaration number is required.");
    if (!sketchFile) return setValidationError("Please upload your Lot Site Sketch Plan.");
    if (!taxDecFile) return setValidationError("Please upload your RPT Tax Declaration Certificate.");

    setIsSubmitting(true);

    try {
      // Serialize form fields as JSON to keep structure inside `purpose`
      const serializedPurpose = JSON.stringify({
        purposeText: formData.purpose,
        form_data: {
          applicantName: applicant,
          propertyAddress: formData.propertyAddress,
          barangay: formData.barangay,
          lotNumber: formData.lotNumber,
          taxDeclarationNo: formData.taxDeclarationNo
        }
      });

      const payload = {
        documentType: "Zoning Clearance",
        barangay: formData.barangay,
        fullName: applicant,
        email: "mpdo-planning@talibon.gov.ph", // Internal planning email
        mobileNumber: "09123456789",
        purpose: serializedPurpose,
        attachments: [sketchFile, taxDecFile].filter(Boolean) as string[]
      };

      const response = await certificateService.submitRequest(payload);
      
      if (response) {
        // Trigger MPDO staff notification
        try {
          await notificationService.createNotification({
            title: "New Municipal Service Request",
            message: `${applicant} submitted a new Zoning Locational Clearance application in Barangay ${formData.barangay}.`,
            category: "Citizen Applications",
            department_id: "mpdo",
            action_url: "workflows"
          });
        } catch (notifErr) {
          console.warn("Failed to create MPDO notification", notifErr);
        }

        onSuccess(response);
      }
    } catch (error) {
      if (!isMockAllowed()) {
        throw error;
      }
      console.info("[ZoningClearanceForm] Submit using offline local storage fallback");
      
      // Client-side fallback
      const generatedId = `TAL-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(Math.floor(Math.random() * 8999) + 1000)}`;
      const fallbackRequest = {
        ticketId: generatedId,
        documentType: "Zoning Clearance",
        barangay: formData.barangay,
        fullName: applicant,
        email: "mpdo-planning@talibon.gov.ph",
        mobileNumber: "09123456789",
        purpose: JSON.stringify({
          purposeText: formData.purpose,
          form_data: {
            applicantName: applicant,
            propertyAddress: formData.propertyAddress,
            barangay: formData.barangay,
            lotNumber: formData.lotNumber,
            taxDeclarationNo: formData.taxDeclarationNo
          }
        }),
        attachments: [sketchFile, taxDecFile].filter(Boolean) as string[],
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
        <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
          <MapPin size={20} />
        </div>
        <div>
          <h2 className="text-base font-black text-brand-text uppercase font-display tracking-tight">Zoning clearance Locational Application</h2>
          <p className="text-[10px] text-brand-muted font-bold uppercase tracking-widest mt-0.5">Submit online application to Municipal Planning & Development Office</p>
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
            <label className="form-label">Applicant / Property Owner Full Name *</label>
            <input
              type="text"
              name="applicant"
              placeholder="e.g. Bernardo Carpio Jr."
              value={applicant}
              onChange={(e) => setApplicant(e.target.value)}
              className="w-full bg-gray-50 border border-brand-border rounded-xl py-2 px-3 sm:px-3.5 font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-xs sm:text-sm"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="form-label">Locational Purpose of Clearance *</label>
            <select
              name="purpose"
              value={formData.purpose}
              onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
              className="w-full bg-gray-50 border border-brand-border rounded-xl py-2 px-3 sm:px-3.5 font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-xs sm:text-sm"
            >
              <option value="Residential Zoning Locational Clearance">Residential Construction Locational Clearance</option>
              <option value="Commercial Zoning Locational Clearance">Commercial Locational Clearance</option>
              <option value="Industrial Zoning Locational Clearance">Industrial Zoning locational Clearance</option>
              <option value="Institutional Zoning Locational Clearance">Institutional / School Clearance</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div className="space-y-1.5">
            <label className="form-label">Lot / Survey Block Number *</label>
            <input
              type="text"
              name="lotNumber"
              placeholder="e.g. Lot 15, Block 3-B"
              value={formData.lotNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, lotNumber: e.target.value }))}
              className="w-full bg-gray-50 border border-brand-border rounded-xl py-2 px-3 sm:px-3.5 font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-xs sm:text-sm"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="form-label">Tax Declaration Certificate Number *</label>
            <input
              type="text"
              name="taxDeclarationNo"
              placeholder="e.g. TD-2026-4820-A"
              value={formData.taxDeclarationNo}
              onChange={(e) => setFormData(prev => ({ ...prev, taxDeclarationNo: e.target.value }))}
              className="w-full bg-gray-50 border border-brand-border rounded-xl py-2 px-3 sm:px-3.5 font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-xs sm:text-sm"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div className="space-y-1.5">
            <label className="form-label">Property Physical Address *</label>
            <input
              type="text"
              name="propertyAddress"
              placeholder="e.g. Sitio San Juan Crossroads"
              value={formData.propertyAddress}
              onChange={(e) => setFormData(prev => ({ ...prev, propertyAddress: e.target.value }))}
              className="w-full bg-gray-50 border border-brand-border rounded-xl py-2 px-3 sm:px-3.5 font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-xs sm:text-sm"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="form-label">Registered Barangay *</label>
            <select
              name="barangay"
              value={formData.barangay}
              onChange={(e) => setFormData(prev => ({ ...prev, barangay: e.target.value }))}
              className="w-full bg-gray-50 border border-brand-border rounded-xl py-2 px-3 sm:px-3.5 font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-xs sm:text-sm"
            >
              {BARANGAYS.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-3 pt-3 border-t border-brand-border">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-brand-primary" />
            <span className="form-label !mb-0">Required Site Maps & Property Title Certificates</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="form-label">Property Lot site Sketch Map *</label>
              <div className="relative border-2 border-dashed border-brand-border rounded-xl p-3 text-center bg-gray-50/50 hover:bg-gray-50 transition-colors flex flex-col items-center justify-center cursor-pointer">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileUpload(e, "sketch")}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  required={!sketchFile}
                />
                <File size={20} className="text-brand-primary/40 mb-1" />
                <p className="text-xs font-bold text-brand-text">
                  {sketchFile ? "Site Sketch Selected" : "Upload Lot Survey Sketch Map"}
                </p>
                <p className="text-[9px] text-brand-muted">PDF or Image of property site map</p>
                {sketchFile && (
                  <span className="mt-1.5 px-2 py-0.5 bg-white rounded border border-brand-border text-[8px] font-bold text-brand-primary truncate max-w-full">
                    {sketchFile}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="form-label">RPT Tax Declaration Certificate *</label>
              <div className="relative border-2 border-dashed border-brand-border rounded-xl p-3 text-center bg-gray-50/50 hover:bg-gray-50 transition-colors flex flex-col items-center justify-center cursor-pointer">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileUpload(e, "taxdec")}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  required={!taxDecFile}
                />
                <File size={20} className="text-brand-primary/40 mb-1" />
                <p className="text-xs font-bold text-brand-text">
                  {taxDecFile ? "Tax Declaration Uploaded" : "Upload RPT Tax Declaration"}
                </p>
                <p className="text-[9px] text-brand-muted">Official Treasurer's Tax Assessment Document</p>
                {taxDecFile && (
                  <span className="mt-1.5 px-2 py-0.5 bg-white rounded border border-brand-border text-[8px] font-bold text-brand-primary truncate max-w-full">
                    {taxDecFile}
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
            <>Submit Zoning Locational Application <ArrowRight size={14} /></>
          )}
        </button>
      </form>
    </div>
  );
}
