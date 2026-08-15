/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Link, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import Navbar from "./components/Navbar";
import ErrorBoundary from "./components/ErrorBoundary";
import Home from "./pages/Home";
import ContentPage from "./pages/ContentPage";
import OfficialSealPage from "./pages/OfficialSealPage";
import EnactedOrdinancesPage from "./pages/EnactedOrdinancesPage";
import ResolutionsPage from "./pages/ResolutionsPage";
import CitizenCharterPage from "./pages/CitizenCharterPage";
import FullDisclosurePage from "./pages/FullDisclosurePage";
import BusinessPermitPage from "./pages/BusinessPermitPage";
import BuildingPermitPage from "./pages/BuildingPermitPage";
import ZoningClearancePage from "./pages/ZoningClearancePage";
import OrganizationalChartPage from "./pages/OrganizationalChartPage";
import UpdatesPage from "./pages/UpdatesPage";
import NewsCategoryPage from "./pages/NewsCategoryPage";
import NewsDetailPage from "./pages/NewsDetailPage";
import DownloadsPage from "./pages/DownloadsPage";
import ServiceInfoPage from "./pages/ServiceInfoPage";
import { cmsService } from "./services/cmsService";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import EServicesPage from "./pages/EServicesPage";
import AdminDashboard from "./pages/AdminDashboard";
import AccessDenied from "./pages/AccessDenied";
import NotFound from "./pages/NotFound";
import TourismMapPage from "./pages/TourismMapPage";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import Footer from "./components/Footer";
import GeminiAssistant from "./components/GeminiAssistant";
import ScrollToTop from "./components/ScrollToTop";
import { aboutApi, executiveApi, legislativeApi, transparencyApi, tourismApi, formsApi } from "./services/api";
import { AuthProvider, useAuth } from "./contexts/SupabaseAuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";

// Modular Page/View Components
import ProfileView from "./pages/about/ProfileView";
import HistoryView from "./pages/about/HistoryView";
import MayorsView from "./pages/about/MayorsView";
import DepartmentsView from "./pages/about/DepartmentsView";
import BarangaysView from "./pages/about/BarangaysView";
import DemographicsView from "./pages/about/DemographicsView";
import LocationView from "./pages/about/LocationView";
import VicinityView from "./pages/about/VicinityView";
import IndustryView from "./pages/about/IndustryView";
import GovernmentServicesView from "./pages/about/GovernmentServicesView";
import HymnView from "./pages/about/HymnView";

import ExecutiveMandateView from "./pages/executive/MandateView";
import VisionMissionView from "./pages/executive/VisionMissionView";
import DirectoryView from "./pages/executive/DirectoryView";
import GadImsView from "./pages/executive/GadImsView";

import LegislativeMandateView from "./pages/legislative/MandateView";
import LegislativeStructureView from "./pages/legislative/StructureView";

import InfrastructureView from "./pages/transparency/InfrastructureView";
import FinanceView from "./pages/transparency/FinanceView";
import OrdersView from "./pages/transparency/OrdersView";
import BudgetView from "./pages/transparency/BudgetView";
import BiddingsView from "./pages/transparency/BiddingsView";

import SpotsView from "./pages/tourism/SpotsView";
import FestivitiesView from "./pages/tourism/FestivitiesView";
import DelicaciesView from "./pages/tourism/DelicaciesView";


function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, state } = useAuth();

  if (state === "INITIALIZING") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-bg gap-4">
        <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Loading System Core...</span>
      </div>
    );
  }

  if (state === "UNAUTHENTICATED" || state === "ERROR" || !user || !profile) {
    sessionStorage.setItem("auth_notification", "Your session has ended. Please sign in again.");
    return <Navigate to="/" replace />;
  }

  if (!profile.is_verified) {
    sessionStorage.setItem("auth_notification", "Insufficient permissions to access this page.");
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, state } = useAuth();

  if (state === "INITIALIZING") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-bg gap-4">
        <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Loading System Core...</span>
      </div>
    );
  }

  if (state === "AUTHENTICATED" && user && profile && profile.is_verified) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}

function StaffRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, state } = useAuth();

  if (state === "INITIALIZING") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-bg gap-4">
        <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Loading System Core...</span>
      </div>
    );
  }

  if (state === "UNAUTHENTICATED" || state === "ERROR" || !user || !profile) {
    sessionStorage.setItem("auth_notification", "Your session has ended. Please sign in again.");
    return <Navigate to="/" replace />;
  }

  const staffRoles = ["super_admin", "admin", "municipal_admin", "department_admin", "barangay_admin", "editor"];
  if (!profile.is_verified || !staffRoles.includes(profile.role)) {
    sessionStorage.setItem("auth_notification", "Insufficient permissions to access the staff panel.");
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, state } = useAuth();

  if (state === "INITIALIZING") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-bg gap-4">
        <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Loading System Core...</span>
      </div>
    );
  }

  if (state === "UNAUTHENTICATED" || state === "ERROR" || !user || !profile) {
    sessionStorage.setItem("auth_notification", "Your session has ended. Please sign in again.");
    return <Navigate to="/" replace />;
  }

  const adminRoles = ["super_admin", "admin", "municipal_admin"];
  if (!profile.is_verified || !adminRoles.includes(profile.role)) {
    sessionStorage.setItem("auth_notification", "Insufficient permissions to access the administrator panel.");
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function SuperAdminRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, state } = useAuth();

  if (state === "INITIALIZING") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-bg gap-4">
        <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Loading System Core...</span>
      </div>
    );
  }

  if (state === "UNAUTHENTICATED" || state === "ERROR" || !user || !profile) {
    sessionStorage.setItem("auth_notification", "Your session has ended. Please sign in again.");
    return <Navigate to="/" replace />;
  }

  if (!profile.is_verified || profile.role !== "super_admin") {
    sessionStorage.setItem("auth_notification", "Insufficient permissions to access the super-administrator panel.");
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppLayout() {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isLogin = location.pathname === "/login";
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [notification, setNotification] = useState<{ message: string; type: "error" | "info" } | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Listen for navigation-related or auth status messages in sessionStorage
  useEffect(() => {
    const authNotif = sessionStorage.getItem("auth_notification");
    const logoutErr = sessionStorage.getItem("logout_error");

    if (authNotif) {
      setNotification({ message: authNotif, type: "info" });
      sessionStorage.removeItem("auth_notification");
    } else if (logoutErr) {
      setNotification({ message: logoutErr, type: "error" });
      sessionStorage.removeItem("logout_error");
    }
  }, [location.pathname]);

  // Automatically dismiss notifications after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  return (
    <div className="min-h-screen bg-brand-bg font-sans selection:bg-brand-primary selection:text-white relative overflow-hidden">
        {/* Minimal Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-0 left-0 w-full h-full opacity-[0.2]" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
        </div>

        {/* Global Toast Notification */}
        <AnimatePresence>
          {notification && (
            <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] max-w-md w-[calc(100%-2rem)]">
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className={`p-4 rounded-2xl shadow-2xl border backdrop-blur-md flex items-start gap-3 text-left ${
                  notification.type === "error"
                    ? "bg-red-50/95 border-red-200 text-red-900"
                    : "bg-blue-50/95 border-blue-200 text-blue-900"
                }`}
              >
                <span className="text-base mt-0.5 select-none">
                  {notification.type === "error" ? "⚠️" : "ℹ️"}
                </span>
                <div className="flex-1">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">
                    {notification.type === "error" ? "System Notification" : "Security Notice"}
                  </p>
                  <p className="text-xs font-bold mt-0.5 leading-relaxed">
                    {notification.message}
                  </p>
                </div>
                <button
                  onClick={() => setNotification(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 text-xs font-black"
                >
                  ✕
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Offline Indicator */}
        {isOffline && (
          <div className="fixed bottom-4 right-4 z-50 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-2xl shadow-lg flex items-center gap-3 animate-pulse">
            <span className="text-sm">⚠️</span>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-black uppercase tracking-widest">Offline Mode</span>
              <span className="text-[9px] font-medium text-amber-600">Please check your internet connection.</span>
            </div>
          </div>
        )}

        <div className="relative z-10">
          {!isLogin && <Navbar />}
          <div className={isHome || isLogin ? "" : "pt-[125px] lg:pt-[142px]"}>
            <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/e-services" element={<EServicesPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          
          {/* Protected CMS Control Core */}
          <Route path="/admin" element={<StaffRoute><AdminDashboard /></StaffRoute>} />
          <Route path="/dashboard" element={<StaffRoute><AdminDashboard /></StaffRoute>} />
          <Route path="/cms" element={<StaffRoute><AdminDashboard /></StaffRoute>} />
          <Route path="/manage/*" element={<StaffRoute><AdminDashboard /></StaffRoute>} />
          
          <Route path="/downloads" element={<DownloadsPage />} />
          <Route path="/services/:slug" element={<ServiceInfoPage />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/cancel" element={<PaymentCancel />} />
          <Route path="/tourism/map" element={<TourismMapPage />} />
          <Route path="/news/updates" element={<UpdatesPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          
          {/* About Talibon */}
          <Route path="/about/profile" element={<ContentPage title="Brief Profile" fetchData={aboutApi.getProfile} renderContent={(data) => <ProfileView data={data} />} />} />
          <Route path="/about/seal" element={<OfficialSealPage />} />
          <Route path="/about/history" element={<ContentPage title="Brief History" fetchData={aboutApi.getHistory} renderContent={(data) => <HistoryView data={data} />} />} />
          <Route path="/about/mayors" element={<ContentPage title="List of Mayors" fetchData={aboutApi.getMayors} renderContent={(data) => <MayorsView data={data} />} />} />
          <Route path="/about/departments" element={<ContentPage title="Departments" fetchData={aboutApi.getDepartments} renderContent={(data) => <DepartmentsView data={data} />} />} />
          <Route path="/about/barangays" element={<ContentPage title="Barangay Profiles" fetchData={async () => cmsService.getBarangays()} renderContent={(data) => <BarangaysView data={data} />} />} />
          <Route path="/about/demographics" element={<ContentPage title="Demographics" fetchData={aboutApi.getDemographics} renderContent={(data) => <DemographicsView data={data} />} />} />
          <Route path="/about/location" element={<ContentPage title="Location" fetchData={aboutApi.getLocation} renderContent={(data) => <LocationView data={data} />} />} />
          <Route path="/about/vicinity" element={<ContentPage title="Vicinity Map" fetchData={aboutApi.getVicinityMap} renderContent={(data) => <VicinityView data={data} />} />} />
          <Route path="/about/industry" element={<ContentPage title="Industry" fetchData={aboutApi.getIndustry} renderContent={(data) => <IndustryView data={data} />} />} />
          <Route path="/about/services" element={<ContentPage title="Government Services" fetchData={aboutApi.getServices} renderContent={(data) => <GovernmentServicesView data={data} />} />} />
          <Route path="/about/hymn" element={<ContentPage title="Talibon Hymn" fetchData={aboutApi.getHymn} renderContent={(data) => <HymnView data={data} />} />} />

          {/* Executive */}
          <Route path="/executive/mandate" element={<ContentPage title="Executive Mandate" fetchData={executiveApi.getMandate} renderContent={(data) => <ExecutiveMandateView data={data} />} />} />
          <Route path="/executive/vision-mission" element={<ContentPage title="Vision & Mission" fetchData={executiveApi.getVisionMission} renderContent={(data) => <VisionMissionView data={data} />} />} />
          <Route path="/executive/chart" element={<OrganizationalChartPage />} />
          <Route path="/executive/directory" element={<ContentPage title="Directory of Departments" fetchData={executiveApi.getDirectory} renderContent={(data) => <DirectoryView data={data} />} />} />
          <Route path="/executive/gad-ims" element={<ContentPage title="Talibon GAD-IMS" fetchData={executiveApi.getGadIms} renderContent={(data) => <GadImsView data={data} />} />} />

          {/* Legislative */}
          <Route path="/legislative/mandate" element={<ContentPage title="Legislative Mandate" fetchData={legislativeApi.getMandate} renderContent={(data) => <LegislativeMandateView data={data} />} />} />
          <Route path="/legislative/structure" element={<ContentPage title="Organizational Structure" fetchData={legislativeApi.getStructure} renderContent={(data) => <LegislativeStructureView data={data} />} />} />
          <Route path="/legislative/ordinances" element={<EnactedOrdinancesPage />} />
          <Route path="/legislative/resolutions" element={<ResolutionsPage />} />

          {/* News */}
          <Route path="/news/view/:id" element={<NewsDetailPage />} />
          <Route path="/news/:category" element={<NewsCategoryPage />} />

          {/* Transparency */}
          <Route path="/transparency/charter" element={<CitizenCharterPage />} />
          <Route path="/transparency/disclosure" element={<FullDisclosurePage />} />
          <Route path="/transparency/infrastructure" element={<ContentPage title="Infrastructure Projects" fetchData={transparencyApi.getInfrastructure} renderContent={(data) => <InfrastructureView data={data} />} />} />
          <Route path="/transparency/finance" element={<ContentPage title="Finance Reports" fetchData={transparencyApi.getFinanceReports} renderContent={(data) => <FinanceView data={data} />} />} />
          <Route path="/transparency/orders" element={<ContentPage title="Executive Orders" fetchData={transparencyApi.getExecutiveOrders} renderContent={(data) => <OrdersView data={data} />} />} />
          <Route path="/transparency/budget" element={<ContentPage title="Budget and Finances" fetchData={transparencyApi.getBudget} renderContent={(data) => <BudgetView data={data} />} />} />
          <Route path="/transparency/biddings" element={<ContentPage title="Biddings" fetchData={transparencyApi.getBiddings} renderContent={(data) => <BiddingsView data={data} />} />} />

          {/* Tourism */}
          <Route path="/tourism/spots" element={<ContentPage title="Tourist Spots" fetchData={tourismApi.getSpots} renderContent={(data) => <SpotsView data={data} />} />} />
          <Route path="/tourism/festivities" element={<ContentPage title="Festivities" fetchData={tourismApi.getFestivities} renderContent={(data) => <FestivitiesView data={data} />} />} />
          <Route path="/tourism/delicacies" element={<ContentPage title="Local Delicacies" fetchData={tourismApi.getDelicacies} renderContent={(data) => <DelicaciesView data={data} />} />} />

          {/* Forms */}
          <Route path="/forms/business" element={<BusinessPermitPage />} />
          <Route path="/forms/building" element={<BuildingPermitPage />} />
          <Route path="/forms/zoning" element={<ZoningClearancePage />} />

          {/* Access Control & Fallback Routes */}
          <Route path="/access-denied" element={<AccessDenied />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
          </div>
          <Footer />
          <GeminiAssistant />
        </div>
      </div>
  );
}

export default function App() {
  const globalFallback = (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
      <div className="w-16 h-16 bg-red-50 text-red-600 rounded-[1.5rem] flex items-center justify-center text-2xl font-black mb-4 shadow-xs">
        ⚠️
      </div>
      <h1 className="text-sm font-black uppercase tracking-widest text-slate-800">System Core Interruption</h1>
      <p className="text-[10px] font-mono text-slate-500 mt-2 max-w-xs leading-relaxed uppercase">
        An unexpected error occurred in the Municipal digital core runtime.
      </p>
      <button 
        onClick={() => window.location.reload()} 
        className="mt-6 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black text-[9px] rounded-full uppercase tracking-widest shadow-xs transition-all"
      >
        Reboot Digital Core
      </button>
    </div>
  );

  return (
    <LanguageProvider>
      <AuthProvider>
        <ErrorBoundary fallback={globalFallback} componentName="GlobalSystemCore">
          <Router>
            <ScrollToTop />
            <AppLayout />
          </Router>
        </ErrorBoundary>
      </AuthProvider>
    </LanguageProvider>
  );
}

