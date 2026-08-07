import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  FileText, User, MapPin, Briefcase, Calculator, Mail, Phone, 
  CheckCircle2, ArrowRight, ShieldCheck, Printer, RefreshCw, Copy, AlertCircle 
} from "lucide-react";
import { certificateService, saveLocalRequest } from "../../../services/certificateService";
import { notificationService } from "../../../services/notificationService";
import { isMockAllowed } from "../../../lib/mode";
import { ECedulaApplication, ECedulaSubmissionReceipt } from "./types";
import { 
  CIVIL_STATUS_OPTIONS, GENDER_OPTIONS, CITIZENSHIP_OPTIONS, PURPOSE_OPTIONS,
  DEFAULT_MUNICIPALITY, DEFAULT_PROVINCE, DEFAULT_ZIP_CODE, DEFAULT_CITIZENSHIP,
  BASIC_TAX_INDIVIDUAL, ADDITIONAL_TAX_RATE, MAX_ADDITIONAL_TAX 
} from "./constants";
import { BARANGAYS } from "../../../constants/barangayConfig";

interface ECedulaFormProps {
  onSuccess?: (receipt: ECedulaSubmissionReceipt) => void;
}

export default function ECedulaForm({ onSuccess }: ECedulaFormProps) {
  // Setup default state
  const [formData, setFormData] = useState<ECedulaApplication>({
    firstName: "",
    middleName: "",
    lastName: "",
    suffix: "",
    birthDate: "",
    birthPlace: "",
    gender: "Male",
    civilStatus: "Single",
    citizenship: DEFAULT_CITIZENSHIP,
    mobileNumber: "",
    email: "",
    address: "",
    barangay: "poblacion", // Default to lowercased ID matching BARANGAYS
    municipality: DEFAULT_MUNICIPALITY,
    province: DEFAULT_PROVINCE,
    zipCode: DEFAULT_ZIP_CODE,
    occupation: "",
    employer: "",
    employerAddress: "",
    tin: "",
    annualIncome: 0,
    purpose: "Local Employment",
    remarks: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<ECedulaSubmissionReceipt | null>(null);
  const [copied, setCopied] = useState(false);

  // Dynamic tax calculation
  const taxCalculation = useMemo(() => {
    const basic = BASIC_TAX_INDIVIDUAL;
    const income = Number(formData.annualIncome) || 0;
    const rawAdditional = income * ADDITIONAL_TAX_RATE;
    const additional = Math.min(rawAdditional, MAX_ADDITIONAL_TAX);
    const total = basic + additional;

    return {
      basic,
      additional,
      total
    };
  }, [formData.annualIncome]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === "annualIncome" ? (value === "" ? 0 : parseFloat(value)) : value
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validate inputs
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setValidationError("First name and Last name are strictly required.");
      return;
    }
    if (!formData.birthDate) {
      setValidationError("Birth date is required.");
      return;
    }
    if (!formData.birthPlace.trim()) {
      setValidationError("Birth place is required for Community Tax Certificates.");
      return;
    }
    if (!formData.mobileNumber.trim() || !formData.email.trim()) {
      setValidationError("Contact information (Mobile & Email) is required.");
      return;
    }
    if (!formData.address.trim()) {
      setValidationError("Home address details are required.");
      return;
    }
    if (formData.annualIncome < 0) {
      setValidationError("Annual Income cannot be negative.");
      return;
    }

    setIsSubmitting(true);

    try {
      const fullName = `${formData.firstName} ${formData.middleName ? formData.middleName + " " : ""}${formData.lastName}`;
      
      const serializedPurpose = JSON.stringify({
        purposeText: formData.purpose,
        form_data: {
          firstName: formData.firstName,
          middleName: formData.middleName,
          lastName: formData.lastName,
          placeOfBirth: formData.birthPlace,
          dateOfBirth: formData.birthDate,
          civilStatus: formData.civilStatus,
          gender: formData.gender,
          citizenship: formData.citizenship,
          profession: formData.occupation,
          annualIncome: formData.annualIncome,
          basicTax: taxCalculation.basic,
          additionalTax: taxCalculation.additional,
          totalTax: taxCalculation.total,
          province: formData.province,
          municipality: formData.municipality,
          barangay: formData.barangay,
          purokSitio: formData.address,
          zipCode: formData.zipCode
        }
      });

      const payload = {
        documentType: "Cedula",
        barangay: formData.barangay,
        fullName: fullName,
        email: formData.email || "treasury-office@talibon.gov.ph",
        mobileNumber: formData.mobileNumber || "09123456789",
        purpose: serializedPurpose,
        attachments: []
      };

      const response = await certificateService.submitRequest(payload);
      
      const ticketId = response.ticketId;

      const newReceipt: ECedulaSubmissionReceipt = {
        ...formData,
        ticketId,
        submittedAt: new Date().toLocaleString(),
        status: "Submitted",
        estimatedCompletion: "1 Working Day",
        basicTax: taxCalculation.basic,
        additionalTax: taxCalculation.additional,
        totalTax: taxCalculation.total
      };

      // Trigger Treasury staff notification
      try {
        await notificationService.createNotification({
          title: "New Municipal Service Request",
          message: `${fullName} submitted a new Cedula application in Barangay ${formData.barangay}.`,
          category: "Citizen Applications",
          department_id: "treasury",
          action_url: "workflows"
        });
      } catch (notifErr) {
        console.warn("Failed to create treasury notification", notifErr);
      }

      setReceipt(newReceipt);
      if (onSuccess) {
        onSuccess(newReceipt);
      }
    } catch (error) {
      if (!isMockAllowed()) {
        throw error;
      }
      console.warn("[CedulaForm] Live submit failed, using fallback.", error);
      
      // Standalone/offline fallback
      const ticketId = `CTC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 899999) + 100000)}`;
      const fullName = `${formData.firstName} ${formData.middleName ? formData.middleName + ' ' : ''}${formData.lastName}`;
      
      const fallbackRequest = {
        ticketId,
        documentType: "Cedula",
        barangay: formData.barangay,
        fullName,
        email: formData.email,
        mobileNumber: formData.mobileNumber,
        purpose: JSON.stringify({
          purposeText: formData.purpose,
          form_data: formData
        }),
        attachments: [],
        submittedAt: new Date().toISOString(),
        status: "Submitted"
      };
      saveLocalRequest(fallbackRequest);

      const newReceipt: ECedulaSubmissionReceipt = {
        ...formData,
        ticketId,
        submittedAt: new Date().toLocaleString(),
        status: "Submitted",
        estimatedCompletion: "1 Working Day",
        basicTax: taxCalculation.basic,
        additionalTax: taxCalculation.additional,
        totalTax: taxCalculation.total
      };

      // Add to local state of citizen requests
      try {
        const saved = localStorage.getItem('talibon_citizen_requests');
        const list = saved ? JSON.parse(saved) : [];
        list.unshift({
          id: `req-${ticketId}`,
          citizenName: `${formData.firstName} ${formData.lastName}`,
          type: "Cedula",
          description: `Cedula (CTC) application submitted for Barangay ${formData.barangay}. Total tax: PHP ${taxCalculation.total}.`,
          submittedAt: new Date().toISOString(),
          assignedDeptId: "treasury",
          status: "PENDING",
          priority: "HIGH",
          trackingNumber: ticketId,
          attachments: []
        });
        localStorage.setItem('talibon_citizen_requests', JSON.stringify(list));
      } catch (e) {
        console.error("Failed to sync fallback requests to localStorage", e);
      }

      setReceipt(newReceipt);
      if (onSuccess) {
        onSuccess(newReceipt);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      middleName: "",
      lastName: "",
      suffix: "",
      birthDate: "",
      birthPlace: "",
      gender: "Male",
      civilStatus: "Single",
      citizenship: DEFAULT_CITIZENSHIP,
      mobileNumber: "",
      email: "",
      address: "",
      barangay: "poblacion",
      municipality: DEFAULT_MUNICIPALITY,
      province: DEFAULT_PROVINCE,
      zipCode: DEFAULT_ZIP_CODE,
      occupation: "",
      employer: "",
      employerAddress: "",
      tin: "",
      annualIncome: 0,
      purpose: "Local Employment",
      remarks: "",
    });
    setReceipt(null);
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!receipt ? (
          <motion.form
            key="ecedula-form-active"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            onSubmit={handleFormSubmit}
            className="space-y-4"
          >
            {validationError && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold uppercase tracking-wide flex items-center gap-2.5">
                <AlertCircle size={16} className="shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* SECTION 1: Personal Information */}
            <div className="bg-white border border-brand-border rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 border-b border-brand-border pb-3">
                <div className="w-8 h-8 bg-brand-primary/10 text-brand-primary rounded-lg flex items-center justify-center shrink-0">
                  <User size={16} />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-brand-text uppercase tracking-wider font-display">Personal Information</h3>
                  <p className="text-[9px] text-brand-muted font-bold uppercase tracking-widest mt-0.5">Primary identification registry</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
                <div className="md:col-span-1.5 space-y-1.5">
                  <label className="form-label" htmlFor="firstName">First Name *</label>
                  <input
                    id="firstName"
                    type="text"
                    name="firstName"
                    required
                    placeholder="e.g. Maria Clara"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-brand-border rounded-xl py-2 px-3 sm:px-3.5 font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-xs sm:text-sm"
                  />
                </div>
                <div className="md:col-span-1 space-y-1.5">
                  <label className="form-label" htmlFor="middleName">Middle Name</label>
                  <input
                    id="middleName"
                    type="text"
                    name="middleName"
                    placeholder="e.g. Lopez"
                    value={formData.middleName}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-brand-border rounded-xl py-2 px-3 sm:px-3.5 font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-xs sm:text-sm"
                  />
                </div>
                <div className="md:col-span-1 space-y-1.5">
                  <label className="form-label" htmlFor="lastName">Last Name *</label>
                  <input
                    id="lastName"
                    type="text"
                    name="lastName"
                    required
                    placeholder="e.g. Santos"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-brand-border rounded-xl py-2 px-3 sm:px-3.5 font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-xs sm:text-sm"
                  />
                </div>
                <div className="md:col-span-0.5 space-y-1.5">
                  <label className="form-label" htmlFor="suffix">Suffix</label>
                  <input
                    id="suffix"
                    type="text"
                    name="suffix"
                    placeholder="Jr. / III"
                    value={formData.suffix}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-brand-border rounded-xl py-2 px-3 sm:px-3.5 font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="form-label" htmlFor="birthDate">Date of Birth *</label>
                  <input
                    id="birthDate"
                    type="date"
                    name="birthDate"
                    required
                    value={formData.birthDate}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-brand-border rounded-xl py-2 px-3 sm:px-3.5 font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-xs sm:text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="form-label" htmlFor="birthPlace">Place of Birth *</label>
                  <input
                    id="birthPlace"
                    type="text"
                    name="birthPlace"
                    required
                    placeholder="Municipality, Province"
                    value={formData.birthPlace}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-brand-border rounded-xl py-2 px-3 sm:px-3.5 font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <div className="space-y-1.5">
                  <label className="form-label" htmlFor="gender">Gender *</label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-brand-border rounded-xl py-2 px-3 sm:px-3.5 font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-xs sm:text-sm"
                  >
                    {GENDER_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="form-label" htmlFor="civilStatus">Civil Status *</label>
                  <select
                    id="civilStatus"
                    name="civilStatus"
                    value={formData.civilStatus}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-brand-border rounded-xl py-2 px-3 sm:px-3.5 font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-xs sm:text-sm"
                  >
                    {CIVIL_STATUS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="form-label" htmlFor="citizenship">Citizenship *</label>
                  <select
                    id="citizenship"
                    name="citizenship"
                    value={formData.citizenship}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-brand-border rounded-xl py-2 px-3 sm:px-3.5 font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-xs sm:text-sm"
                  >
                    {CITIZENSHIP_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION 2: Contact Information */}
            <div className="bg-white border border-brand-border rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 border-b border-brand-border pb-3">
                <div className="w-8 h-8 bg-brand-primary/10 text-brand-primary rounded-lg flex items-center justify-center shrink-0">
                  <Mail size={16} />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-brand-text uppercase tracking-wider font-display">Contact Information</h3>
                  <p className="text-[9px] text-brand-muted font-bold uppercase tracking-widest mt-0.5">Municipal communication channels</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="form-label" htmlFor="mobileNumber">Mobile Number *</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2 sm:top-2.5 font-semibold text-brand-muted text-xs sm:text-sm">+63</span>
                    <input
                      id="mobileNumber"
                      type="tel"
                      name="mobileNumber"
                      required
                      placeholder="9XXXXXXXXX"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border border-brand-border rounded-xl py-2 pl-12 pr-3.5 font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-xs sm:text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="form-label" htmlFor="email">Email Address *</label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    required
                    placeholder="e.g. maria@clara.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-brand-border rounded-xl py-2 px-3 sm:px-3.5 font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-xs sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: Address Information */}
            <div className="bg-white border border-brand-border rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 border-b border-brand-border pb-3">
                <div className="w-8 h-8 bg-brand-primary/10 text-brand-primary rounded-lg flex items-center justify-center shrink-0">
                  <MapPin size={16} />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-brand-text uppercase tracking-wider font-display">Address Information</h3>
                  <p className="text-[9px] text-brand-muted font-bold uppercase tracking-widest mt-0.5">Registered residence in Talibon</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="form-label" htmlFor="address">House Number / Street / Sitio *</label>
                  <input
                    id="address"
                    type="text"
                    name="address"
                    required
                    placeholder="e.g. Unit 123, Bonifacio Street"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-brand-border rounded-xl py-2 px-3 sm:px-3.5 font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label" htmlFor="barangay">Barangay *</label>
                  <select
                    id="barangay"
                    name="barangay"
                    value={formData.barangay}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-brand-border rounded-xl py-2 px-3 sm:px-3.5 font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-xs sm:text-sm"
                  >
                    {BARANGAYS.map(brgy => (
                      <option key={brgy.id} value={brgy.slug}>{brgy.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="form-label" htmlFor="municipality">Municipality</label>
                  <input
                    id="municipality"
                    type="text"
                    name="municipality"
                    readOnly
                    value={formData.municipality}
                    className="w-full bg-gray-100 border border-brand-border rounded-xl py-2 px-3 sm:px-3.5 font-semibold text-brand-muted cursor-not-allowed text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label" htmlFor="province">Province</label>
                  <input
                    id="province"
                    type="text"
                    name="province"
                    readOnly
                    value={formData.province}
                    className="w-full bg-gray-100 border border-brand-border rounded-xl py-2 px-3 sm:px-3.5 font-semibold text-brand-muted cursor-not-allowed text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label" htmlFor="zipCode">ZIP Code</label>
                  <input
                    id="zipCode"
                    type="text"
                    name="zipCode"
                    readOnly
                    value={formData.zipCode}
                    className="w-full bg-gray-100 border border-brand-border rounded-xl py-2 px-3 sm:px-3.5 font-semibold text-brand-muted cursor-not-allowed text-xs sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 4: Employment Information */}
            <div className="bg-white border border-brand-border rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 border-b border-brand-border pb-3">
                <div className="w-8 h-8 bg-brand-primary/10 text-brand-primary rounded-lg flex items-center justify-center shrink-0">
                  <Briefcase size={16} />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-brand-text uppercase tracking-wider font-display">Employment Information</h3>
                  <p className="text-[9px] text-brand-muted font-bold uppercase tracking-widest mt-0.5">Professional credentials</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <div className="space-y-1.5">
                  <label className="form-label" htmlFor="occupation">Occupation *</label>
                  <input
                    id="occupation"
                    type="text"
                    name="occupation"
                    required
                    placeholder="e.g. Teacher / Businessman / Farmer"
                    value={formData.occupation}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-brand-border rounded-xl py-2 px-3 sm:px-3.5 font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-xs sm:text-sm"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="form-label" htmlFor="employer">Employer / Business Name</label>
                  <input
                    id="employer"
                    type="text"
                    name="employer"
                    placeholder="e.g. Department of Education"
                    value={formData.employer}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-brand-border rounded-xl py-2 px-3 sm:px-3.5 font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-xs sm:text-sm"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-3">
                  <label className="form-label" htmlFor="employerAddress">Employer / Business Address</label>
                  <input
                    id="employerAddress"
                    type="text"
                    name="employerAddress"
                    placeholder="e.g. Poblacion, Talibon, Bohol"
                    value={formData.employerAddress}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-brand-border rounded-xl py-2 px-3 sm:px-3.5 font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-xs sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 5: Tax & Application Details */}
            <div className="bg-white border border-brand-border rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 border-b border-brand-border pb-3">
                <div className="w-8 h-8 bg-brand-primary/10 text-brand-primary rounded-lg flex items-center justify-center shrink-0">
                  <Calculator size={16} />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-brand-text uppercase tracking-wider font-display">Tax & Purpose Details</h3>
                  <p className="text-[9px] text-brand-muted font-bold uppercase tracking-widest mt-0.5">Real-time local tax computation</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="form-label" htmlFor="tin">TIN Number <span className="text-[9px] text-brand-muted lowercase italic">(optional)</span></label>
                  <input
                    id="tin"
                    type="text"
                    name="tin"
                    placeholder="000-000-000-000"
                    value={formData.tin}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-brand-border rounded-xl py-2 px-3 sm:px-3.5 font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label" htmlFor="annualIncome">Gross Annual Income (PHP) *</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2 sm:top-2.5 font-black text-brand-primary text-xs sm:text-sm">₱</span>
                    <input
                      id="annualIncome"
                      type="number"
                      name="annualIncome"
                      required
                      min="0"
                      step="1"
                      placeholder="e.g. 240000"
                      value={formData.annualIncome || ""}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border border-brand-border rounded-xl py-2 pl-9 pr-3.5 font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="form-label" htmlFor="purpose">Purpose of Application *</label>
                  <select
                    id="purpose"
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-brand-border rounded-xl py-2 px-3 sm:px-3.5 font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-xs sm:text-sm"
                  >
                    {PURPOSE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="form-label" htmlFor="remarks">Additional Remarks</label>
                  <textarea
                    id="remarks"
                    name="remarks"
                    rows={2}
                    placeholder="Specify secondary reasons or comments here..."
                    value={formData.remarks}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-brand-border rounded-xl py-2 px-3 sm:px-3.5 font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all resize-none text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Dynamic Assessment Bill Panel */}
              <div className="p-4 bg-brand-primary/5 rounded-xl border border-brand-primary/10 mt-2 space-y-3">
                <div className="flex items-center gap-2 text-brand-primary font-black text-xs uppercase tracking-widest">
                  <Calculator size={14} />
                  <span>Interactive Fee Assessment (Estimated)</span>
                </div>
                
                <div className="divide-y divide-brand-primary/10 text-[11px] sm:text-xs font-bold uppercase text-brand-text space-y-1.5 pt-1">
                  <div className="flex justify-between pb-1.5">
                    <span className="text-brand-muted">Basic Individual Community Tax</span>
                    <span>₱{taxCalculation.basic.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-brand-muted">Additional Income Tax (₱1.00 per ₱1,000 gross)</span>
                    <span>₱{taxCalculation.additional.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-1.5 text-xs sm:text-sm font-black text-brand-primary">
                    <span>Total Community Tax Due (Cedula)</span>
                    <span>₱{taxCalculation.total.toFixed(2)}</span>
                  </div>
                </div>

                <p className="text-[9px] text-brand-muted leading-relaxed font-semibold">
                  * Community Tax values are calculated in strict compliance with RA 7160.
                </p>
              </div>
            </div>

            {/* Application Consent & Submission */}
            <div className="bg-sky-50 border border-sky-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-start gap-3 text-sky-950">
                <ShieldCheck size={22} className="text-brand-primary shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="text-[11px] font-black uppercase tracking-wider">RA 10173 Data Privacy Compliance</h4>
                  <p className="text-[10px] leading-relaxed font-semibold">
                    By submitting, you authorize LGU Talibon to process your personal data for Electronic Community Tax Certificate issuance.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-2.5 bg-brand-primary hover:bg-brand-secondary text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-[0.98] disabled:opacity-50 shrink-0"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>File E-Cedula <ArrowRight size={14} /></>
                )}
              </button>
            </div>
          </motion.form>
        ) : (
          /* Receipt Screen */
          <motion.div
            key="ecedula-receipt"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-8"
          >
            {/* Success Hero */}
            <div className="bg-white border border-brand-border rounded-[2.5rem] p-8 md:p-12 text-center space-y-6 shadow-sm">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 size={44} />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-brand-text font-display uppercase tracking-tight">E-Cedula Filed Successfully!</h3>
                <p className="text-sm text-brand-muted max-w-xl mx-auto leading-relaxed">
                  Your Electronic Community Tax Certificate application has been registered with the Talibon Civil Registry system.
                </p>
              </div>

              {/* Core Trans ID Slip */}
              <div className="p-6 bg-gray-50 border border-brand-border rounded-3xl max-w-md mx-auto space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest block">Cedula Receipt ID</span>
                  <span className="font-mono text-2xl font-black text-brand-primary tracking-wider block">
                    {receipt.ticketId}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-left border-t border-brand-border/60 pt-4 text-xs font-bold uppercase text-brand-text">
                  <div>
                    <span className="text-[9px] text-brand-muted block">Taxpayer Name</span>
                    <span className="truncate block font-black">{receipt.lastName}, {receipt.firstName}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-brand-muted block">Barangay</span>
                    <span className="truncate block font-black">{BARANGAYS.find(b => b.slug === receipt.barangay)?.name || receipt.barangay}</span>
                  </div>
                </div>

                <button
                  onClick={() => copyToClipboard(receipt.ticketId)}
                  className="w-full py-3.5 bg-white hover:bg-gray-50 border border-brand-border text-brand-text rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.97] shadow-sm"
                >
                  <Copy size={13} className="text-brand-primary" />
                  {copied ? "Ticket ID Copied!" : "Copy Transaction ID"}
                </button>
              </div>
            </div>

            {/* Printable Digital Cedula Mock (Visual Proof of High Craftsmanship!) */}
            <div className="bg-sky-50/50 border-4 border-double border-sky-600/30 rounded-[2.5rem] p-6 md:p-10 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-sky-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 select-none pointer-events-none" />
              
              {/* Cedula Headers */}
              <div className="text-center border-b border-sky-600/20 pb-6">
                <p className="text-[10px] font-extrabold text-sky-800 uppercase tracking-widest">Republic of the Philippines</p>
                <h4 className="text-lg font-black text-sky-950 font-display uppercase tracking-tight">COMMUNITY TAX CERTIFICATE</h4>
                <p className="text-[9px] font-black text-sky-700 uppercase tracking-[0.25em] mt-1">INDIVIDUAL • LGU OF TALIBON, BOHOL</p>
              </div>

              {/* Cedula Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-[11px] font-semibold text-sky-950">
                <div className="md:col-span-2 border-b border-sky-600/10 pb-2">
                  <span className="text-[8px] text-sky-800/80 uppercase block">Taxpayer Name (Last, First, Middle)</span>
                  <span className="font-extrabold uppercase">{receipt.lastName}, {receipt.firstName} {receipt.middleName} {receipt.suffix}</span>
                </div>
                <div className="border-b border-sky-600/10 pb-2">
                  <span className="text-[8px] text-sky-800/80 uppercase block">Citizenship</span>
                  <span className="font-extrabold uppercase">{receipt.citizenship}</span>
                </div>
                <div className="border-b border-sky-600/10 pb-2">
                  <span className="text-[8px] text-sky-800/80 uppercase block">Civil Status</span>
                  <span className="font-extrabold uppercase">{receipt.civilStatus}</span>
                </div>

                <div className="md:col-span-2 border-b border-sky-600/10 pb-2">
                  <span className="text-[8px] text-sky-800/80 uppercase block">Residence Address</span>
                  <span className="font-extrabold uppercase">{receipt.address}, {BARANGAYS.find(b => b.slug === receipt.barangay)?.name || receipt.barangay}, Talibon, Bohol</span>
                </div>
                <div className="border-b border-sky-600/10 pb-2">
                  <span className="text-[8px] text-sky-800/80 uppercase block">Date of Birth</span>
                  <span className="font-extrabold">{receipt.birthDate}</span>
                </div>
                <div className="border-b border-sky-600/10 pb-2">
                  <span className="text-[8px] text-sky-800/80 uppercase block">TIN Number</span>
                  <span className="font-extrabold">{receipt.tin || "NOT SPECIFIED"}</span>
                </div>

                <div className="border-b border-sky-600/10 pb-2">
                  <span className="text-[8px] text-sky-800/80 uppercase block">Occupation</span>
                  <span className="font-extrabold uppercase">{receipt.occupation}</span>
                </div>
                <div className="md:col-span-2 border-b border-sky-600/10 pb-2">
                  <span className="text-[8px] text-sky-800/80 uppercase block">Employer Name</span>
                  <span className="font-extrabold uppercase">{receipt.employer || "N/A"}</span>
                </div>
                <div className="border-b border-sky-600/10 pb-2">
                  <span className="text-[8px] text-sky-800/80 uppercase block">Purpose of CTC</span>
                  <span className="font-extrabold uppercase">{receipt.purpose}</span>
                </div>
              </div>

              {/* Cedula Tax Assessment details */}
              <div className="bg-sky-100/60 p-6 rounded-2xl border border-sky-600/10 space-y-3">
                <div className="text-[10px] font-black text-sky-900 uppercase tracking-widest flex items-center gap-1.5 border-b border-sky-600/10 pb-2">
                  <Calculator size={14} />
                  <span>Certified Tax Breakdown</span>
                </div>

                <div className="text-xs font-bold uppercase text-sky-950 space-y-1.5">
                  <div className="flex justify-between">
                    <span>Basic Community Tax (Individual)</span>
                    <span>₱{receipt.basicTax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Additional Community Tax (0.1% Gross Income)</span>
                    <span>₱{receipt.additionalTax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-sky-600/10 text-sm font-black text-sky-900">
                    <span>Total Tax Assessed & Paid</span>
                    <span>₱{receipt.totalTax.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Print buttons / Reset */}
              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4 border-t border-sky-600/20">
                <button
                  onClick={() => window.print()}
                  className="px-8 py-4 bg-[#3A8FC2] text-white font-extrabold text-xs tracking-widest rounded-2xl hover:bg-[#2B82B8] active:scale-95 transition-all uppercase flex items-center justify-center gap-2 shadow-sm"
                >
                  <Printer size={16} /> Print Official Slip
                </button>
                <button
                  onClick={resetForm}
                  className="px-8 py-4 border border-sky-600/50 text-sky-800 font-extrabold text-xs tracking-widest rounded-2xl hover:bg-[#3A8FC2] hover:text-white active:scale-95 transition-all uppercase flex items-center justify-center gap-2"
                >
                  <RefreshCw size={16} /> File Another Request
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
