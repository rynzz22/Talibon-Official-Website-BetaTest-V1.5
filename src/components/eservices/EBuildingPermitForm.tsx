import React, { useState } from "react";
import { motion } from "motion/react";
import { HardHat, AlertCircle, ShieldCheck, File, ArrowRight } from "lucide-react";
import { certificateService, saveLocalRequest } from "../../services/certificateService";
import { BARANGAYS } from "../../constants/barangayConfig";
import { notificationService } from "../../services/notificationService";
import { isMockAllowed } from "../../lib/mode";

interface EBuildingPermitFormProps {
  onSuccess: (result: any) => void;
}

export default function EBuildingPermitForm({ onSuccess }: EBuildingPermitFormProps) {
  const [formData, setFormData] = useState({
    propertyOwner: "",
    lotNumber: "",
    taxDeclarationNo: "",
    propertyAddress: "",
    barangay: "poblacion",
    constructionType: "Residential",
    estimatedCost: "",
    floorArea: "",
    engineerArchitect: "",
    purpose: "Building Permit Application Clearance"
  });

  const [planFile, setPlanFile] = useState<string | null>(null);
  const [sketchFile, setSketchFile] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fileType: "plan" | "sketch") => {
    if (e.target.files && e.target.files.length > 0) {
      const fileName = e.target.files[0].name;
      if (fileType === "plan") {
        setPlanFile(fileName);
      } else {
        setSketchFile(fileName);
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Form validation
    if (!formData.propertyOwner.trim()) return setValidationError("Property owner name is required.");
    if (!formData.propertyAddress.trim()) return setValidationError("Property physical location address is required.");
    if (!formData.estimatedCost.trim()) return setValidationError("Estimated construction cost is required.");
    if (!formData.floorArea.trim()) return setValidationError("Total proposed floor area is required.");
    if (!formData.engineerArchitect.trim()) return setValidationError("Supervising Engineer or Architect name is required.");
    if (!planFile) return setValidationError("Please upload your blueprints/Building Plans.");
    if (!sketchFile) return setValidationError("Please upload your Lot Site Sketch Plan.");

    setIsSubmitting(true);

    try {
      // Serialize form fields as JSON to keep structure inside `purpose`
      const serializedPurpose = JSON.stringify({
        purposeText: formData.purpose,
        form_data: {
          propertyOwner: formData.propertyOwner,
          lotNumber: formData.lotNumber,
          taxDeclarationNo: formData.taxDeclarationNo,
          propertyAddress: formData.propertyAddress,
          barangay: formData.barangay,
          constructionType: formData.constructionType,
          estimatedCost: formData.estimatedCost,
          floorArea: formData.floorArea,
          engineerArchitect: formData.engineerArchitect
        }
      });

      const payload = {
        documentType: "Building Permit",
        barangay: formData.barangay,
        fullName: formData.propertyOwner,
        email: "engineering-office@talibon.gov.ph", // Internal tracking default email
        mobileNumber: "09123456789", // Mock or user input default
        purpose: serializedPurpose,
        attachments: [planFile, sketchFile].filter(Boolean) as string[]
      };

      const response = await certificateService.submitRequest(payload);
      
      if (response) {
        // Trigger Engineering staff notification
        try {
          await notificationService.createNotification({
            title: "New Municipal Service Request",
            message: `${formData.propertyOwner} submitted a new Building Permit application (${formData.constructionType}) in Barangay ${formData.barangay}.`,
            category: "Citizen Applications",
            department_id: "engineering",
            action_url: "workflows"
          });
        } catch (notifErr) {
          console.warn("Failed to create engineering notification", notifErr);
        }

        onSuccess(response);
      }
    } catch (error) {
      if (!isMockAllowed()) {
        throw error;
      }
      console.info("[BuildingPermitForm] Submit using offline local storage fallback");
      
      // Client-side fallback
      const generatedId = `TAL-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(Math.floor(Math.random() * 8999) + 1000)}`;
      const fallbackRequest = {
        ticketId: generatedId,
        documentType: "Building Permit",
        barangay: formData.barangay,
        fullName: formData.propertyOwner,
        email: "engineering-office@talibon.gov.ph",
        mobileNumber: "09123456789",
        purpose: JSON.stringify({
          purposeText: formData.purpose,
          form_data: {
            propertyOwner: formData.propertyOwner,
            lotNumber: formData.lotNumber,
            taxDeclarationNo: formData.taxDeclarationNo,
            propertyAddress: formData.propertyAddress,
            barangay: formData.barangay,
            constructionType: formData.constructionType,
            estimatedCost: formData.estimatedCost,
            floorArea: formData.floorArea,
            engineerArchitect: formData.engineerArchitect
          }
        }),
        attachments: [planFile, sketchFile].filter(Boolean) as string[],
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
        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
          <HardHat size={20} />
        </div>
        <div>
          <h2 className="text-base font-black text-brand-text uppercase font-display tracking-tight">Building Permit Application</h2>
          <p className="text-[10px] text-brand-muted font-bold uppercase tracking-widest mt-0.5">Submit online application to Municipal Engineering Office</p>
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
            <label className="form-label">Property Owner Name *</label>
            <input
              type="text"
              name="propertyOwner"
              placeholder="e.g. Bernardo Carpio Jr."
              value={formData.propertyOwner}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-brand-border rounded-xl py-2 px-3 sm:px-3.5 font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-xs sm:text-sm"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="form-label">Supervising Architect / Engineer *</label>
            <input
              type="text"
              name="engineerArchitect"
              placeholder="e.g. Engr. Gabriel A. Santos"
              value={formData.engineerArchitect}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-brand-border rounded-xl py-2 px-3 sm:px-3.5 font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-xs sm:text-sm"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          <div className="space-y-1.5">
            <label className="form-label">Lot / Block Number</label>
            <input
              type="text"
              name="lotNumber"
              placeholder="e.g. Lot 14, Block 2-A"
              value={formData.lotNumber}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-brand-border rounded-xl py-2 px-3 sm:px-3.5 font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-xs sm:text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="form-label">Tax Declaration Number</label>
            <input
              type="text"
              name="taxDeclarationNo"
              placeholder="e.g. TD-2026-481"
              value={formData.taxDeclarationNo}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-brand-border rounded-xl py-2 px-3 sm:px-3.5 font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-xs sm:text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="form-label">Type of Construction *</label>
            <select
              name="constructionType"
              value={formData.constructionType}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-brand-border rounded-xl py-2 px-3 sm:px-3.5 font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-xs sm:text-sm"
            >
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
              <option value="Industrial">Industrial</option>
              <option value="Institutional">Institutional</option>
              <option value="Renovation / Alteration">Renovation / Alteration</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div className="space-y-1.5">
            <label className="form-label">Estimated Cost (PHP) *</label>
            <input
              type="text"
              name="estimatedCost"
              placeholder="e.g. 1,500,000"
              value={formData.estimatedCost}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-brand-border rounded-xl py-2 px-3 sm:px-3.5 font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-xs sm:text-sm"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="form-label">Total Floor Area (sqm) *</label>
            <input
              type="text"
              name="floorArea"
              placeholder="e.g. 120"
              value={formData.floorArea}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-brand-border rounded-xl py-2 px-3 sm:px-3.5 font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-xs sm:text-sm"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div className="space-y-1.5">
            <label className="form-label">Property Location Address *</label>
            <input
              type="text"
              name="propertyAddress"
              placeholder="e.g. Sitio San Jose Crossroads"
              value={formData.propertyAddress}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-brand-border rounded-xl py-2 px-3 sm:px-3.5 font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-xs sm:text-sm"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="form-label">Property Barangay *</label>
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

        <div className="space-y-3 pt-3 border-t border-brand-border">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-brand-primary" />
            <span className="form-label !mb-0">Required Blueprints & Lot Survey Attachments</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="form-label">Complete Building Blueprint Plan *</label>
              <div className="relative border-2 border-dashed border-brand-border rounded-xl p-3 text-center bg-gray-50/50 hover:bg-gray-50 transition-colors flex flex-col items-center justify-center cursor-pointer">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileUpload(e, "plan")}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  required={!planFile}
                />
                <File size={20} className="text-brand-primary/40 mb-1" />
                <p className="text-xs font-bold text-brand-text">
                  {planFile ? "Blueprint Selected" : "Upload Architect Blueprint File"}
                </p>
                <p className="text-[9px] text-brand-muted">PDF blueprint design up to 10MB</p>
                {planFile && (
                  <span className="mt-1.5 px-2 py-0.5 bg-white rounded border border-brand-border text-[8px] font-bold text-brand-primary truncate max-w-full">
                    {planFile}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Lot Survey Site Sketch Plan *</label>
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
                  {sketchFile ? "Lot Sketch Selected" : "Upload Lot Site Sketch Plan"}
                </p>
                <p className="text-[9px] text-brand-muted">PDF or Image of Lot boundaries</p>
                {sketchFile && (
                  <span className="mt-1.5 px-2 py-0.5 bg-white rounded border border-brand-border text-[8px] font-bold text-brand-primary truncate max-w-full">
                    {sketchFile}
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
            <>Submit Building Permit Application <ArrowRight size={14} /></>
          )}
        </button>
      </form>
    </div>
  );
}
