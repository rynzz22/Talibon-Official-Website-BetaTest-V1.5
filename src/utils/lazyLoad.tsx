import React, { Suspense } from "react";
import { SkeletonLoader } from "../components/SkeletonLoader";

export const lazyLoad = (importFunc: () => Promise<{ default: React.ComponentType<any> }>) => {
  const Component = React.lazy(importFunc);
  
  return (
    <Suspense fallback={<SkeletonLoader count={3} type="card" />}>
      <Component />
    </Suspense>
  );
};

// Lazy load page components
export const LazyHome = React.lazy(() => import("../pages/Home"));
export const LazyLogin = React.lazy(() => import("../pages/Login"));
export const LazyAuthCallback = React.lazy(() => import("../pages/AuthCallback"));
export const LazyAdminDashboard = React.lazy(() => import("../pages/AdminDashboard"));
export const LazyDownloadsPage = React.lazy(() => import("../pages/DownloadsPage"));
export const LazyPaymentSuccess = React.lazy(() => import("../pages/PaymentSuccess"));
export const LazyPaymentCancel = React.lazy(() => import("../pages/PaymentCancel"));
export const LazyOfficialSealPage = React.lazy(() => import("../pages/OfficialSealPage"));
export const LazyEnactedOrdinancesPage = React.lazy(() => import("../pages/EnactedOrdinancesPage"));
export const LazyResolutionsPage = React.lazy(() => import("../pages/ResolutionsPage"));
export const LazyCitizenCharterPage = React.lazy(() => import("../pages/CitizenCharterPage"));
export const LazyFullDisclosurePage = React.lazy(() => import("../pages/FullDisclosurePage"));
export const LazyOrganizationalChartPage = React.lazy(() => import("../pages/OrganizationalChartPage"));
export const LazyNewsCategoryPage = React.lazy(() => import("../pages/NewsCategoryPage"));
export const LazyNewsDetailPage = React.lazy(() => import("../pages/NewsDetailPage"));
