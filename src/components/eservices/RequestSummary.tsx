import React from "react";
import { Shield, FileText, Calendar, Landmark, MapPin, DollarSign, Briefcase, Users, FileCheck } from "lucide-react";

interface RequestSummaryProps {
  documentType: string;
  purposeJson: string;
  ticketId: string;
  submittedAt?: string;
  compact?: boolean;
  requirements?: string[];
}

export const RequestSummary: React.FC<RequestSummaryProps> = ({
  documentType,
  purposeJson,
  ticketId,
  submittedAt,
  compact = false,
  requirements = []
}) => {
  // Safe parsing helper
  const parseData = (): { purposeText?: string; form_data?: Record<string, any> } => {
    if (!purposeJson || typeof purposeJson !== "string") {
      return { purposeText: purposeJson || "Not provided" };
    }
    const trimmed = purposeJson.trim();
    if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) {
      return { purposeText: trimmed };
    }
    try {
      return JSON.parse(trimmed);
    } catch (e) {
      console.warn("[RequestSummary] Failed to parse JSON purpose data:", e);
      return { purposeText: trimmed };
    }
  };

  const parsed = parseData();
  const purposeText = parsed.purposeText || "Not provided";
  const formData = parsed.form_data || {};

  // Utility to convert keys (camelCase or snake_case) to Title Case human labels
  const formatLabel = (key: string): string => {
    // Add spaces before capitals, replace underscores with spaces
    let label = key
      .replace(/([A-Z])/g, " $1")
      .replace(/_/g, " ")
      .trim();
    // Capitalize first letter of each word
    return label
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Utility to format barangay name
  const formatBarangay = (val: any): string => {
    if (!val) return "Not provided";
    const str = String(val).trim();
    return str
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Safe value retriever with fallback
  const getVal = (key: string): string => {
    const val = formData[key] !== undefined ? formData[key] : "Not provided";
    if (typeof val === "boolean") return val ? "Yes" : "No";
    if (key.toLowerCase().includes("barangay")) return formatBarangay(val);
    return String(val);
  };

  const formattedDate = submittedAt
    ? new Date(submittedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    : "Not provided";

  // Build key-value groups depending on documentType
  const renderDocumentFields = () => {
    const docTypeLower = documentType.toLowerCase();

    if (docTypeLower.includes("clearance") && docTypeLower.includes("barangay")) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3 py-1">
          <div className="col-span-1 sm:col-span-2 pb-2.5 border-b border-slate-100">
            <span className="text-[9.5px] uppercase font-black text-blue-600 tracking-wider block mb-0.5">
              Purpose
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-900">{purposeText}</span>
          </div>
          <div>
            <span className="text-[9.5px] uppercase font-black text-slate-400 tracking-wider block mb-0.5">
              Barangay
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-900">{getVal("barangay")}</span>
          </div>
          <div>
            <span className="text-[9.5px] uppercase font-black text-slate-400 tracking-wider block mb-0.5">
              Sitio / Purok
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-800">{getVal("sitioPurok")}</span>
          </div>
          <div>
            <span className="text-[9.5px] uppercase font-black text-slate-400 tracking-wider block mb-0.5">
              Years of Residency
            </span>
            <span className="text-xs sm:text-sm font-bold text-blue-600">{getVal("yearsOfResidency")} Years</span>
          </div>
        </div>
      );
    }

    if (docTypeLower.includes("business")) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3 py-1">
          <div className="col-span-1 sm:col-span-2 pb-2.5 border-b border-slate-100">
            <span className="text-[9.5px] uppercase font-black text-blue-600 tracking-wider block mb-0.5">
              Business Name
            </span>
            <span className="text-xs sm:text-sm font-black text-slate-900">{getVal("businessName")}</span>
          </div>
          <div>
            <span className="text-[9.5px] uppercase font-black text-slate-400 tracking-wider block mb-0.5">
              Owner / Applicant
            </span>
            <span className="text-xs font-bold text-slate-900">{getVal("ownerName")}</span>
          </div>
          <div>
            <span className="text-[9.5px] uppercase font-black text-slate-400 tracking-wider block mb-0.5">
              Nature of Business
            </span>
            <span className="text-xs font-bold text-slate-800">{getVal("natureOfBusiness")}</span>
          </div>
          <div>
            <span className="text-[9.5px] uppercase font-black text-slate-400 tracking-wider block mb-0.5">
              Business Address
            </span>
            <span className="text-xs font-bold text-slate-800">{getVal("businessAddress")}</span>
          </div>
          <div>
            <span className="text-[9.5px] uppercase font-black text-slate-400 tracking-wider block mb-0.5">
              Barangay
            </span>
            <span className="text-xs font-bold text-slate-900">{getVal("barangay")}</span>
          </div>
          <div>
            <span className="text-[9.5px] uppercase font-black text-slate-400 tracking-wider block mb-0.5">
              DTI / SEC Registration No
            </span>
            <span className="text-xs font-mono font-bold text-slate-800">{getVal("dtiSecRegNo")}</span>
          </div>
          <div>
            <span className="text-[9.5px] uppercase font-black text-slate-400 tracking-wider block mb-0.5">
              Contact / Phone
            </span>
            <span className="text-xs font-bold text-slate-900">{getVal("contactNumber")}</span>
          </div>
          <div className="col-span-1 sm:col-span-2 pt-2 border-t border-slate-100">
            <span className="text-[9.5px] uppercase font-black text-slate-400 tracking-wider block mb-0.5">
              Purpose
            </span>
            <span className="text-xs text-slate-700">{purposeText}</span>
          </div>
        </div>
      );
    }

    if (docTypeLower.includes("building")) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3 py-1">
          <div className="col-span-1 sm:col-span-2 pb-2.5 border-b border-slate-100">
            <span className="text-[9.5px] uppercase font-black text-teal-700 tracking-wider block mb-0.5">
              Project / Construction Type
            </span>
            <span className="text-xs font-black text-slate-900">{getVal("constructionType")}</span>
          </div>
          <div>
            <span className="text-[9.5px] uppercase font-black text-slate-400 tracking-wider block mb-0.5">
              Property Owner
            </span>
            <span className="text-xs font-bold text-slate-900">{getVal("propertyOwner")}</span>
          </div>
          <div>
            <span className="text-[9.5px] uppercase font-black text-slate-400 tracking-wider block mb-0.5">
              Location / Address
            </span>
            <span className="text-xs font-bold text-slate-800">{getVal("propertyAddress")}</span>
          </div>
          <div>
            <span className="text-[9.5px] uppercase font-black text-slate-400 tracking-wider block mb-0.5">
              Barangay
            </span>
            <span className="text-xs font-bold text-slate-900">{getVal("barangay")}</span>
          </div>
          <div>
            <span className="text-[9.5px] uppercase font-black text-slate-400 tracking-wider block mb-0.5">
              Lot Number
            </span>
            <span className="text-xs font-mono font-bold text-slate-900">{getVal("lotNumber")}</span>
          </div>
          <div>
            <span className="text-[9.5px] uppercase font-black text-slate-400 tracking-wider block mb-0.5">
              Tax Declaration No
            </span>
            <span className="text-xs font-mono font-bold text-slate-900">{getVal("taxDeclarationNo")}</span>
          </div>
          <div>
            <span className="text-[9.5px] uppercase font-black text-slate-400 tracking-wider block mb-0.5">
              Estimated Cost
            </span>
            <span className="text-xs font-bold text-emerald-600">₱{getVal("estimatedCost")}</span>
          </div>
          <div>
            <span className="text-[9.5px] uppercase font-black text-slate-400 tracking-wider block mb-0.5">
              Total Floor Area
            </span>
            <span className="text-xs font-bold text-slate-900">{getVal("floorArea")} sqm</span>
          </div>
          <div className="col-span-1 sm:col-span-2 pt-2 border-t border-slate-100">
            <span className="text-[9.5px] uppercase font-black text-slate-400 tracking-wider block mb-0.5">
              Responsible Engineer / Architect
            </span>
            <span className="text-xs font-bold text-slate-800">{getVal("engineerArchitect")}</span>
          </div>
        </div>
      );
    }

    if (docTypeLower.includes("cedula") || docTypeLower.includes("ctc") || docTypeLower.includes("community tax")) {
      const fn = formData.firstName;
      const mn = formData.middleName;
      const ln = formData.lastName;
      let taxpayerName = "Not provided";
      if (fn || ln) {
        taxpayerName = [fn, mn, ln].filter(Boolean).join(" ");
      } else if (formData.taxpayerName || formData.fullName) {
        taxpayerName = String(formData.taxpayerName || formData.fullName);
      }

      const birthInfo = (formData.dateOfBirth || formData.placeOfBirth)
        ? [formData.dateOfBirth, formData.placeOfBirth].filter(Boolean).join(" | ")
        : "Not provided";

      const civilGenderInfo = (formData.civilStatus || formData.gender)
        ? [formData.civilStatus, formData.gender].filter(Boolean).join(" | ")
        : "Not provided";

      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3 py-1">
          <div className="col-span-1 sm:col-span-2 pb-2.5 border-b border-slate-100">
            <span className="text-[9.5px] uppercase font-black text-indigo-600 tracking-wider block mb-0.5">
              Taxpayer Legal Name
            </span>
            <span className="text-xs sm:text-sm font-black text-slate-900 leading-snug block">
              {taxpayerName}
            </span>
          </div>
          <div>
            <span className="text-[9.5px] uppercase font-black text-slate-400 tracking-wider block mb-0.5">
              Date & Place of Birth
            </span>
            <span className="text-xs font-bold text-slate-800 leading-snug block">
              {birthInfo}
            </span>
          </div>
          <div>
            <span className="text-[9.5px] uppercase font-black text-slate-400 tracking-wider block mb-0.5">
              Civil Status & Gender
            </span>
            <span className="text-xs font-bold text-slate-800 leading-snug block">
              {civilGenderInfo}
            </span>
          </div>
          <div>
            <span className="text-[9.5px] uppercase font-black text-slate-400 tracking-wider block mb-0.5">
              Profession / Occupation
            </span>
            <span className="text-xs font-bold text-slate-900">{getVal("profession")}</span>
          </div>
          <div>
            <span className="text-[9.5px] uppercase font-black text-slate-400 tracking-wider block mb-0.5">
              Citizenship
            </span>
            <span className="text-xs font-bold text-slate-800">{getVal("citizenship")}</span>
          </div>
          <div className="col-span-1 sm:col-span-2">
            <span className="text-[9.5px] uppercase font-black text-slate-400 tracking-wider block mb-0.5">
              Address
            </span>
            <span className="text-xs text-slate-700">
              {getVal("purokSitio")}, {getVal("barangay")}, {getVal("municipality")}, {getVal("province")} {getVal("zipCode")}
            </span>
          </div>
          
          {/* CTC Taxes clean row without background card */}
          <div className="col-span-1 sm:col-span-2 pt-2.5 border-t border-slate-100 grid grid-cols-3 gap-2">
            <div>
              <span className="text-[8.5px] uppercase font-black text-slate-400 tracking-wider block">Basic Tax</span>
              <span className="text-xs font-bold text-slate-900">₱{parseFloat(getVal("basicTax") || "0").toFixed(2)}</span>
            </div>
            <div>
              <span className="text-[8.5px] uppercase font-black text-slate-400 tracking-wider block">Additional Tax</span>
              <span className="text-xs font-bold text-slate-900">₱{parseFloat(getVal("additionalTax") || "0").toFixed(2)}</span>
            </div>
            <div className="border-l border-slate-200/80 pl-2.5">
              <span className="text-[8.5px] uppercase font-black text-emerald-700 tracking-wider block">Total Assessment</span>
              <span className="text-xs sm:text-sm font-black text-emerald-700">₱{parseFloat(getVal("totalTax") || "0").toFixed(2)}</span>
            </div>
          </div>
        </div>
      );
    }

    if (docTypeLower.includes("indigency")) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3 py-1">
          <div className="col-span-1 sm:col-span-2 pb-2.5 border-b border-slate-100">
            <span className="text-[9.5px] uppercase font-black text-purple-600 tracking-wider block mb-0.5">
              Purpose / Reason
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-900">{purposeText}</span>
          </div>
          <div>
            <span className="text-[9.5px] uppercase font-black text-slate-400 tracking-wider block mb-0.5">
              Applicant Full Name
            </span>
            <span className="text-xs font-bold text-slate-900">{getVal("fullName")}</span>
          </div>
          <div>
            <span className="text-[9.5px] uppercase font-black text-slate-400 tracking-wider block mb-0.5">
              Residence Barangay
            </span>
            <span className="text-xs font-bold text-slate-900">{getVal("barangay")}</span>
          </div>
          <div>
            <span className="text-[9.5px] uppercase font-black text-slate-400 tracking-wider block mb-0.5">
              Household / Family Members
            </span>
            <span className="text-xs font-bold text-slate-900">{getVal("familyMembers")} members</span>
          </div>
          <div>
            <span className="text-[9.5px] uppercase font-black text-slate-400 tracking-wider block mb-0.5">
              Reported Monthly Income
            </span>
            <span className="text-xs font-bold text-purple-600">₱{getVal("monthlyIncome")}</span>
          </div>
          <div className="col-span-1 sm:col-span-2 pt-2 border-t border-slate-100">
            <span className="text-[9.5px] uppercase font-black text-slate-400 tracking-wider block mb-0.5">
              Detailed Case Explanation / Reason
            </span>
            <span className="text-xs text-slate-700 block whitespace-pre-line">{getVal("reason")}</span>
          </div>
        </div>
      );
    }

    if (docTypeLower.includes("zoning")) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3 py-1">
          <div className="col-span-1 sm:col-span-2 pb-2.5 border-b border-slate-100">
            <span className="text-[9.5px] uppercase font-black text-rose-600 tracking-wider block mb-0.5">
              Applicant Name
            </span>
            <span className="text-xs font-bold text-slate-900">{getVal("applicantName")}</span>
          </div>
          <div>
            <span className="text-[9.5px] uppercase font-black text-slate-400 tracking-wider block mb-0.5">
              Barangay
            </span>
            <span className="text-xs font-bold text-slate-900">{getVal("barangay")}</span>
          </div>
          <div className="col-span-1 sm:col-span-2">
            <span className="text-[9.5px] uppercase font-black text-slate-400 tracking-wider block mb-0.5">
              Property Location / Address
            </span>
            <span className="text-xs font-bold text-slate-800">{getVal("propertyAddress")}</span>
          </div>
          <div>
            <span className="text-[9.5px] uppercase font-black text-slate-400 tracking-wider block mb-0.5">
              Lot Number
            </span>
            <span className="text-xs font-mono font-bold text-slate-900">{getVal("lotNumber")}</span>
          </div>
          <div>
            <span className="text-[9.5px] uppercase font-black text-slate-400 tracking-wider block mb-0.5">
              Tax Declaration No
            </span>
            <span className="text-xs font-mono font-bold text-slate-900">{getVal("taxDeclarationNo")}</span>
          </div>
          <div className="col-span-1 sm:col-span-2 pt-2 border-t border-slate-100">
            <span className="text-[9.5px] uppercase font-black text-slate-400 tracking-wider block mb-0.5">
              Clearance Purpose
            </span>
            <span className="text-xs text-slate-700">{purposeText}</span>
          </div>
        </div>
      );
    }

    // Generic Fallback when properties are nested directly or if no specific type is detected
    const keys = Object.keys(formData);
    if (keys.length > 0) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3 py-1">
          <div className="col-span-1 sm:col-span-2 pb-2.5 border-b border-slate-100">
            <span className="text-[9.5px] uppercase font-black text-slate-400 tracking-wider block mb-0.5">
              Core Purpose / Statement
            </span>
            <span className="text-xs text-slate-900 font-bold">{purposeText}</span>
          </div>
          {keys.map(key => {
            if (key === "purposeText" || key === "form_data") return null;
            return (
              <div key={key}>
                <span className="text-[9.5px] uppercase font-black text-slate-400 tracking-wider block mb-0.5">
                  {formatLabel(key)}
                </span>
                <span className="text-xs font-bold text-slate-900 break-words block">
                  {getVal(key)}
                </span>
              </div>
            );
          })}
        </div>
      );
    }

    // Absolutely no nested properties
    return (
      <div className="py-1">
        <span className="text-[9.5px] uppercase font-black text-amber-700 tracking-wider block mb-0.5">
          Detailed Purpose / Notes
        </span>
        <p className="text-xs font-bold text-slate-900 whitespace-pre-wrap leading-relaxed">
          {purposeText}
        </p>
      </div>
    );
  };

  if (compact) {
    const renderCompactFields = () => {
      const docTypeLower = documentType.toLowerCase();

      if (docTypeLower.includes("clearance") && docTypeLower.includes("barangay")) {
        return (
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
            <div className="col-span-2">
              <span className="text-[8.5px] uppercase font-bold text-blue-600 tracking-wider block">Purpose</span>
              <span className="font-bold text-slate-900 leading-tight block">{purposeText}</span>
            </div>
            <div>
              <span className="text-[8.5px] uppercase font-bold text-slate-400 tracking-wider block">Barangay</span>
              <span className="font-bold text-slate-900 truncate block">{getVal("barangay")}</span>
            </div>
            <div>
              <span className="text-[8.5px] uppercase font-bold text-slate-400 tracking-wider block">Sitio / Purok</span>
              <span className="font-semibold text-slate-800 truncate block">{getVal("sitioPurok")}</span>
            </div>
            <div>
              <span className="text-[8.5px] uppercase font-bold text-slate-400 tracking-wider block">Residency</span>
              <span className="font-bold text-blue-600 block">{getVal("yearsOfResidency")} Years</span>
            </div>
          </div>
        );
      }

      if (docTypeLower.includes("business")) {
        return (
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
            <div className="col-span-2">
              <span className="text-[8.5px] uppercase font-bold text-blue-600 tracking-wider block">Business Name</span>
              <span className="font-extrabold text-slate-900 leading-tight block">{getVal("businessName")}</span>
            </div>
            <div>
              <span className="text-[8.5px] uppercase font-bold text-slate-400 tracking-wider block">Owner / Applicant</span>
              <span className="font-bold text-slate-800 truncate block">{getVal("ownerName")}</span>
            </div>
            <div>
              <span className="text-[8.5px] uppercase font-bold text-slate-400 tracking-wider block">Nature of Business</span>
              <span className="font-semibold text-slate-800 truncate block">{getVal("natureOfBusiness")}</span>
            </div>
            <div>
              <span className="text-[8.5px] uppercase font-bold text-slate-400 tracking-wider block">Business Address</span>
              <span className="font-semibold text-slate-800 truncate block">{getVal("businessAddress")}</span>
            </div>
            <div>
              <span className="text-[8.5px] uppercase font-bold text-slate-400 tracking-wider block">Barangay</span>
              <span className="font-bold text-slate-900 truncate block">{getVal("barangay")}</span>
            </div>
            <div>
              <span className="text-[8.5px] uppercase font-bold text-slate-400 tracking-wider block">DTI / SEC Reg</span>
              <span className="font-mono font-bold text-slate-800 truncate block">{getVal("dtiSecRegNo")}</span>
            </div>
            <div>
              <span className="text-[8.5px] uppercase font-bold text-slate-400 tracking-wider block">Contact Phone</span>
              <span className="font-bold text-slate-900 truncate block">{getVal("contactNumber")}</span>
            </div>
          </div>
        );
      }

      if (docTypeLower.includes("cedula") || docTypeLower.includes("ctc") || docTypeLower.includes("community tax")) {
        const birthInfo = (formData.dateOfBirth || formData.placeOfBirth)
          ? [formData.dateOfBirth, formData.placeOfBirth].filter(Boolean).join(" | ")
          : "Not provided";

        const civilGenderInfo = (formData.civilStatus || formData.gender)
          ? [formData.civilStatus, formData.gender].filter(Boolean).join(" | ")
          : "Not provided";

        return (
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
            <div>
              <span className="text-[8.5px] uppercase font-bold text-slate-400 tracking-wider block">Date & Place of Birth</span>
              <span className="font-semibold text-slate-800 truncate block">{birthInfo}</span>
            </div>
            <div>
              <span className="text-[8.5px] uppercase font-bold text-slate-400 tracking-wider block">Civil Status & Gender</span>
              <span className="font-semibold text-slate-800 truncate block">{civilGenderInfo}</span>
            </div>
            <div>
              <span className="text-[8.5px] uppercase font-bold text-slate-400 tracking-wider block">Profession / Occupation</span>
              <span className="font-bold text-slate-900 truncate block">{getVal("profession")}</span>
            </div>
            <div>
              <span className="text-[8.5px] uppercase font-bold text-slate-400 tracking-wider block">Citizenship</span>
              <span className="font-semibold text-slate-800 truncate block">{getVal("citizenship")}</span>
            </div>
            <div className="col-span-2">
              <span className="text-[8.5px] uppercase font-bold text-slate-400 tracking-wider block">Address</span>
              <span className="text-slate-700 font-medium truncate block">
                {getVal("purokSitio")}, {getVal("barangay")}, {getVal("municipality")}, {getVal("province")} {getVal("zipCode")}
              </span>
            </div>
            
            {/* Total Assessment Bar */}
            <div className="col-span-2 mt-0.5 bg-emerald-50/90 border border-emerald-200/70 rounded-md px-2 py-1 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[8.5px] uppercase font-bold text-slate-500">Basic: ₱{parseFloat(getVal("basicTax") || "0").toFixed(2)}</span>
                <span className="text-[8.5px] uppercase font-bold text-slate-500">Add'l: ₱{parseFloat(getVal("additionalTax") || "0").toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[8.5px] uppercase font-bold text-emerald-800">Total:</span>
                <span className="font-black text-emerald-700 text-xs">₱{parseFloat(getVal("totalTax") || "0").toFixed(2)}</span>
              </div>
            </div>
          </div>
        );
      }

      if (docTypeLower.includes("building")) {
        return (
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
            <div className="col-span-2">
              <span className="text-[8.5px] uppercase font-bold text-teal-700 tracking-wider block">Project / Construction Type</span>
              <span className="font-extrabold text-slate-900 leading-tight block">{getVal("constructionType")}</span>
            </div>
            <div>
              <span className="text-[8.5px] uppercase font-bold text-slate-400 tracking-wider block">Property Owner</span>
              <span className="font-bold text-slate-900 truncate block">{getVal("propertyOwner")}</span>
            </div>
            <div>
              <span className="text-[8.5px] uppercase font-bold text-slate-400 tracking-wider block">Barangay</span>
              <span className="font-bold text-slate-900 truncate block">{getVal("barangay")}</span>
            </div>
            <div>
              <span className="text-[8.5px] uppercase font-bold text-slate-400 tracking-wider block">Lot Number</span>
              <span className="font-mono font-bold text-slate-800 truncate block">{getVal("lotNumber")}</span>
            </div>
            <div>
              <span className="text-[8.5px] uppercase font-bold text-slate-400 tracking-wider block">Tax Dec No</span>
              <span className="font-mono font-bold text-slate-800 truncate block">{getVal("taxDeclarationNo")}</span>
            </div>
            <div>
              <span className="text-[8.5px] uppercase font-bold text-slate-400 tracking-wider block">Estimated Cost</span>
              <span className="font-bold text-emerald-600 block">₱{getVal("estimatedCost")}</span>
            </div>
            <div>
              <span className="text-[8.5px] uppercase font-bold text-slate-400 tracking-wider block">Floor Area</span>
              <span className="font-bold text-slate-800 block">{getVal("floorArea")} sqm</span>
            </div>
          </div>
        );
      }

      if (docTypeLower.includes("indigency")) {
        return (
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
            <div className="col-span-2">
              <span className="text-[8.5px] uppercase font-bold text-purple-700 tracking-wider block">Purpose / Reason</span>
              <span className="font-bold text-slate-900 leading-tight block">{purposeText}</span>
            </div>
            <div>
              <span className="text-[8.5px] uppercase font-bold text-slate-400 tracking-wider block">Barangay</span>
              <span className="font-bold text-slate-900 truncate block">{getVal("barangay")}</span>
            </div>
            <div>
              <span className="text-[8.5px] uppercase font-bold text-slate-400 tracking-wider block">Monthly Income</span>
              <span className="font-bold text-purple-700 block">₱{getVal("monthlyIncome")}</span>
            </div>
          </div>
        );
      }

      if (docTypeLower.includes("zoning")) {
        return (
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
            <div>
              <span className="text-[8.5px] uppercase font-bold text-slate-400 tracking-wider block">Barangay</span>
              <span className="font-bold text-slate-900 truncate block">{getVal("barangay")}</span>
            </div>
            <div>
              <span className="text-[8.5px] uppercase font-bold text-slate-400 tracking-wider block">Lot Number</span>
              <span className="font-mono font-bold text-slate-800 truncate block">{getVal("lotNumber")}</span>
            </div>
            <div>
              <span className="text-[8.5px] uppercase font-bold text-slate-400 tracking-wider block">Tax Dec No</span>
              <span className="font-mono font-bold text-slate-800 truncate block">{getVal("taxDeclarationNo")}</span>
            </div>
            <div>
              <span className="text-[8.5px] uppercase font-bold text-slate-400 tracking-wider block">Property Address</span>
              <span className="font-semibold text-slate-800 truncate block">{getVal("propertyAddress")}</span>
            </div>
            <div className="col-span-2">
              <span className="text-[8.5px] uppercase font-bold text-slate-400 tracking-wider block">Clearance Purpose</span>
              <span className="text-slate-800 font-medium leading-tight block">{purposeText}</span>
            </div>
          </div>
        );
      }

      // Generic fallback
      return renderDocumentFields();
    };

    return (
      <div className="relative font-sans text-left">
        {/* Dynamic Form Fields Grid */}
        <div className="bg-slate-50/70 rounded-lg p-2 border border-slate-200/60">
          {renderCompactFields()}
        </div>
      </div>
    );
  }

  return (
    <div className="relative font-sans text-left border border-slate-200/80 bg-white rounded-2xl p-4 sm:p-5 shadow-2xs">
      {/* Official Top Header Bar */}
      <div className="flex items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Landmark size={16} />
          </div>
          <div className="min-w-0">
            <span className="text-[8.5px] font-semibold uppercase tracking-wider text-slate-400 block leading-none mb-0.5">
              Republic of the Philippines
            </span>
            <h3 className="text-xs font-bold tracking-tight text-slate-900 uppercase leading-snug truncate font-display">
              Municipality of Talibon, Bohol
            </h3>
            <p className="text-[8.5px] font-mono font-semibold text-blue-600 uppercase tracking-wider mt-0.5 leading-none">
              Official E-Services Portal
            </p>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-md tracking-tight inline-block">
            {ticketId}
          </span>
        </div>
      </div>

      {/* Quick Certificate & Date Ribbon */}
      <div className="pb-3 mb-3 border-b border-slate-100 grid grid-cols-2 gap-3 text-xs">
        <div className="flex items-start gap-2 min-w-0">
          <FileText size={15} className="text-blue-600 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 block leading-none mb-1">
              Document Type
            </span>
            <span className="font-bold text-slate-900 uppercase text-xs block leading-snug truncate">
              {documentType}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2 min-w-0">
          <Calendar size={15} className="text-slate-500 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 block leading-none mb-1">
              Submission Date
            </span>
            <span className="font-semibold text-slate-800 text-xs block leading-snug">
              {formattedDate}
            </span>
          </div>
        </div>
      </div>

      {/* Main Document Dynamic Fields Grid */}
      <div className="relative z-10 space-y-2">
        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <FileCheck size={13} className="text-blue-600 shrink-0" />
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-600">
              Submitted Form Data
            </span>
          </div>
          <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest">
            Cloud Record
          </span>
        </div>

        <div className="bg-slate-50/70 rounded-xl p-3 border border-slate-100">
          {renderDocumentFields()}
        </div>

        {/* Dynamic Database Requirements / Notes */}
        {requirements && requirements.length > 0 && (
          <div className="bg-amber-50/60 rounded-xl p-3 border border-amber-200/60 space-y-1.5">
            <div className="flex items-center gap-1.5 text-amber-800">
              <FileCheck size={12} className="shrink-0 text-amber-600" />
              <span className="text-[9px] font-black uppercase tracking-wider">
                Service Requirements Checklist
              </span>
            </div>
            <ul className="space-y-1 pl-1">
              {requirements.map((req, idx) => (
                <li key={idx} className="text-xs text-slate-800 font-medium flex items-start gap-1.5">
                  <span className="text-amber-600 font-bold leading-none">•</span>
                  <span className="leading-tight">{req}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Official Footnote */}
      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[8px] text-slate-400 font-mono uppercase tracking-widest">
        <span>TALIBON LGU E-SERVICES</span>
        <span>SECURED CLOUD RECORD</span>
      </div>
    </div>
  );
};
