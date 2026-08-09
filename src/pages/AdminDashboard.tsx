import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { isMockAllowed } from '../lib/mode';
import { motion, AnimatePresence } from 'motion/react';
import {
  LogIn, LogOut, Trash2, FileText, CheckCircle,
  AlertCircle, ShieldCheck, Plus, X, Search,
  Newspaper, Users, Gavel, LayoutDashboard,
  Edit3, Save, Globe, Building2, Mic, Eye,
  Folder, Image, Clock, Landmark, Calendar,
  Shield, Activity, RefreshCw, HelpCircle, Key, ListCollapse, Lock, Workflow,
  ChevronDown, ChevronUp, ArrowUpDown, ArrowUp, ArrowDown
} from 'lucide-react';
import { notificationService, AppNotification } from '../services/notificationService';
import { certificateService } from '../services/certificateService';
import { dashboardService } from '../services/dashboardService';
import MeetingAssistant from '../components/MeetingAssistant';
import FileUpload from '../components/FileUpload';
import { BARANGAYS } from '../constants/barangayConfig';
import SearchFilterToolbar from '../components/SearchFilterToolbar';
import StatusBadge from '../components/StatusBadge';
import { RequestSummary } from '../components/eservices/RequestSummary';
import {
  cmsService,
  NewsItem,
  DownloadableItem,
  TourismSpotItem,
  OfficialItem,
  DepartmentItem,
  BarangayItem,
  ServiceCmsItem,
  CitizensCharterCmsItem,
  EventItem,
  AuditLogItem,
  UserProfileItem
} from '../services/cmsService';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell
} from 'recharts';

const AdminDashboard: React.FC = () => {
  const { user, profile, loading, signOut, refreshProfile } = useAuth();
  
  // Tabs & Navigation
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'news'
    | 'downloadables'
    | 'tourism'
    | 'officials'
    | 'departments'
    | 'barangays'
    | 'services'
    | 'charter'
    | 'events'
    | 'media'
    | 'users'
    | 'logs'
    | 'meeting-assistant'
    | 'workflows'
  >('overview');

  const [workflowExpandedIds, setWorkflowExpandedIds] = useState<Set<string>>(new Set());
  const [workflowSortField, setWorkflowSortField] = useState<'date' | 'ticket'>('date');
  const [workflowSortOrder, setWorkflowSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Notification and Active Tab URL sync states
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const loadNotifications = useCallback(async () => {
    if (!profile) return;
    try {
      const data = await notificationService.getNotifications(profile);
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("[AdminDashboard] Error fetching notifications:", err);
      setNotifications([]);
    }
  }, [profile]);

  // Synchronize Tab from Query Parameter & Listen to Bell Clicks
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam) {
      const validTabs = ['overview', 'news', 'downloadables', 'tourism', 'officials', 'departments', 'services', 'charter', 'events', 'media', 'users', 'logs', 'meeting-assistant', 'workflows'];
      if (validTabs.includes(tabParam)) {
        setActiveTab(tabParam as any);
      }
    }

    const handleTabChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setActiveTab(customEvent.detail);
      }
    };
    window.addEventListener("talibon_tab_changed", handleTabChange);
    return () => window.removeEventListener("talibon_tab_changed", handleTabChange);
  }, []);

  // Update query string when activeTab changes
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('tab') !== activeTab) {
      searchParams.set('tab', activeTab);
      window.history.replaceState(null, "", `${window.location.pathname}?${searchParams.toString()}`);
    }
  }, [activeTab]);

  // Load and Subscribe to Notifications inside Dashboard
  useEffect(() => {
    if (!profile) return;
    loadNotifications();

    let unsubscribe: (() => void) | null = null;
    try {
      unsubscribe = notificationService.subscribeToNotifications(profile, () => {
        loadNotifications();
      });
    } catch (err) {
      console.error("[AdminDashboard] Live notifications subscription failed:", err);
    }

    return () => {
      if (unsubscribe) {
        try {
          unsubscribe();
        } catch (unsubErr) {
          console.warn("[AdminDashboard] Error during unsubscribe cleanup:", unsubErr);
        }
      }
    };
  }, [profile, loadNotifications]);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formStep, setFormStep] = useState(1);
  
  // Feedback Messages
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(false);

  // Analytics State
  const [aggregates, setAggregates] = useState<any>(null);
  const [monthlyStats, setMonthlyStats] = useState<any[]>([]);
  const [gadStats, setGadStats] = useState<any[]>([]);

  // Stats State
  const [stats, setStats] = useState({
    totalNews: 0,
    totalDownloadables: 0,
    totalTourism: 0,
    totalOfficials: 0,
    totalDepartments: 0,
    totalServices: 0,
    totalEvents: 0
  });

  // Database lists
  const [news, setNews] = useState<NewsItem[]>([]);
  const [downloadables, setDownloadables] = useState<DownloadableItem[]>([]);
  const [tourismSpots, setTourismSpots] = useState<TourismSpotItem[]>([]);
  const [officials, setOfficials] = useState<OfficialItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [barangaysList, setBarangaysList] = useState<BarangayItem[]>([]);
  const [services, setServices] = useState<ServiceCmsItem[]>([]);
  const [charters, setCharters] = useState<CitizensCharterCmsItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [usersList, setUsersList] = useState<UserProfileItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);

  // Database-backed citizen workflow requests state
  const [citizenRequests, setCitizenRequests] = useState<any[]>([]);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Pagination, Detailed View, and Custom Delete Confirmation states
  const [currentPage, setCurrentPage] = useState(1);
  const [viewingItem, setViewingItem] = useState<any>(null);
  const [viewingTab, setViewingTab] = useState<string | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<{ id: string; tab: string; name: string } | null>(null);
  const [statusUpdateReq, setStatusUpdateReq] = useState<{ id: string; status: string; trackingNumber: string; citizenName: string; email?: string; mobileNumber?: string } | null>(null);
  const [statusRemarks, setStatusRemarks] = useState('');
  const [notifyCitizen, setNotifyCitizen] = useState(true);
  const [saveTimeline, setSaveTimeline] = useState(true);
  const [sendEmail, setSendEmail] = useState(false);
  const [sendSms, setSendSms] = useState(false);
  const itemsPerPage = 8;

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm, categoryFilter]);

  // Media Library Files State
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaSearch, setMediaSearch] = useState('');

  // Form states
  const [newsForm, setNewsForm] = useState<Omit<NewsItem, 'id'>>({
    title: '', slug: '', summary: '', content: '', category: 'ARTICLE',
    image_url: '', file_url: '', date: new Date().toISOString().split('T')[0], status: 'published',
    author: 'Municipal Admin', barangay_id: null
  });

  const [downloadForm, setDownloadForm] = useState<Omit<DownloadableItem, 'id'>>({
    title: '', description: '', category: 'forms', file_url: '', file_size: '1.2 MB', status: 'published'
  });

  const [tourismForm, setTourismForm] = useState<Omit<TourismSpotItem, 'id'>>({
    name: '', description: '', gallery_images: [], location: '', google_maps_link: '',
    opening_hours: 'Always Open', contact_details: '', featured_image: ''
  });

  const [officialForm, setOfficialForm] = useState<Omit<OfficialItem, 'id'>>({
    name: '', role: '', level: 3, display_order: 1, image_url: '', biography: '',
    contact_info: '', department_id: '', department: ''
  });

  const [departmentForm, setDepartmentForm] = useState<Omit<DepartmentItem, 'id'>>({
    name: '', description: '', head_of_office: '', contact_number: '', email: '',
    office_hours: 'Monday to Friday, 8:00 AM - 5:00 PM', location: ''
  });

  const [barangayForm, setBarangayForm] = useState<Omit<BarangayItem, 'id'>>({
    name: '', captain: '', population: 0, contact_number: '', office_address: '',
    office_hours: 'Monday to Friday, 8:00 AM - 5:00 PM', cover_image: ''
  });

  const [serviceForm, setServiceForm] = useState<Omit<ServiceCmsItem, 'id'>>({
    name: '', slug: '', description: '', purpose: '', requirements: [],
    processing_time: '3 to 5 business days', fees: 'None', office_responsible_id: '', office_responsible: '',
    office_hours: 'Monday to Friday, 8:00 AM - 5:00 PM', contact_info: '',
    physical_address: '', status: 'available', downloadable_forms: []
  });

  const [charterForm, setCharterForm] = useState<Omit<CitizensCharterCmsItem, 'id'>>({
    office_id: '', office: '', service_name: '', requirements: [], processing_time: '',
    fees: 'No Fees', steps: [], downloadable_forms: []
  });

  const [eventForm, setEventForm] = useState<Omit<EventItem, 'id'>>({
    title: '', description: '', date: new Date().toISOString().split('T')[0], time: '', venue: '', banner_image: ''
  });

  // Dynamic Array Fields Input States (Temporary holder)
  const [tempReqInput, setTempReqInput] = useState('');
  const [tempFormTitle, setTempFormTitle] = useState('');
  const [tempFormUrl, setTempFormUrl] = useState('');
  const [tempFormSize, setTempFormSize] = useState('1.0 MB');

  const [tempStepNum, setTempStepNum] = useState(1);
  const [tempStepActivity, setTempStepActivity] = useState('');
  const [tempStepOffice, setTempStepOffice] = useState('');
  const [tempStepDuration, setTempStepDuration] = useState('');
  const [tempStepClient, setTempStepClient] = useState('');

  // Access constraints
  const canAccessManagement =
    profile && profile.is_verified &&
    ['super_admin', 'admin', 'editor', 'municipal_admin', 'barangay_admin'].includes(profile.role);

  const isSuperAdminOrAdmin =
    profile && ['super_admin', 'admin'].includes(profile.role);

  const isTabVisible = (tabId: string): boolean => {
    if (!profile) return false;
    const role = profile.role;
    
    // Super Admins have absolute visibility over all tabs
    if (role === 'super_admin') return true;
    
    // Department-restricted staff
    if (profile.department_id && !['super_admin', 'admin'].includes(role)) {
      return ['overview', 'news', 'downloadables', 'departments', 'services', 'workflows', 'media', 'meeting-assistant'].includes(tabId);
    }
    
    // Standard role-based visibility
    if (role === 'admin') return true;
    
    if (role === 'editor') {
      return ['overview', 'news', 'downloadables', 'tourism', 'events', 'media', 'meeting-assistant', 'workflows'].includes(tabId);
    }
    
    if (role === 'municipal_admin') {
      return !['users', 'logs'].includes(tabId) || tabId === 'workflows';
    }
    
    if (role === 'barangay_admin') {
      return ['overview', 'news', 'downloadables', 'workflows', 'media'].includes(tabId);
    }
    
    return false;
  };

  const canWriteTab = (tabId: string, item?: any): boolean => {
    if (!profile) return false;
    const role = profile.role;
    
    if (role === 'super_admin') return true;
    
    if (role === 'admin') {
      if (tabId === 'users' && item && item.role === 'super_admin') {
        return false;
      }
      return true;
    }
    
    // Department-restricted write permissions
    if (profile.department_id && !['super_admin', 'admin'].includes(role)) {
      // For departments, they can only edit their own department info
      if (tabId === 'departments') {
        if (!item) return false; // non-admins cannot create new departments
        return item.id === profile.department_id;
      }
      // For services, they can only modify services belonging to their department
      if (tabId === 'services') {
        if (!item) return true; // can create services
        const myDeptName = departments.find(d => d.id === profile.department_id)?.name;
        return !myDeptName || item.office_responsible === myDeptName;
      }
      // Can write to standard communication tabs, workflows, and media
      if (['news', 'downloadables', 'workflows', 'media', 'meeting-assistant'].includes(tabId)) {
        return true;
      }
      return false;
    }
    
    if (role === 'editor') {
      return ['news', 'downloadables', 'tourism', 'events', 'media', 'meeting-assistant'].includes(tabId);
    }
    
    if (role === 'municipal_admin') {
      return !['users', 'logs'].includes(tabId) || tabId === 'workflows';
    }
    
    if (role === 'barangay_admin') {
      if (tabId === 'news') {
        if (!item) {
          return true;
        }
        return item.barangay_id === profile.barangay_id;
      }
      return false;
    }
    
    return false;
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 6000);
  };

  // Central fetcher
  const loadAllCmsData = useCallback(async () => {
    if (!canAccessManagement) {
      setIsTableLoading(false);
      return;
    }
    setIsTableLoading(true);
    try {
      // 1. Dashboard statistics
      const statsData = await cmsService.getDashboardStats();
      setStats(statsData);

      // Load analytics stats from live views
      try {
        const aggs = await dashboardService.getDashboardAggregates();
        setAggregates(aggs);
        
        const mStats = await dashboardService.getMonthlyRequestStats();
        setMonthlyStats(mStats);

        const gStats = await dashboardService.getGADSectoralStats();
        setGadStats(gStats);
      } catch (analErr) {
        console.error("Failed to load dashboard analytics:", analErr);
      }

      // 2. Tab-specific data fetches
      const newsData = await cmsService.getNews();
      setNews(newsData);

      const downloadData = await cmsService.getDownloadables();
      setDownloadables(downloadData);

      const spotsData = await cmsService.getTourismSpots();
      setTourismSpots(spotsData);

      const officialsData = await cmsService.getOfficials();
      setOfficials(officialsData);

      const deptsData = await cmsService.getDepartments();
      setDepartments(deptsData);

      const brgysData = await cmsService.getBarangays();
      setBarangaysList(brgysData);

      const srvData = await cmsService.getServices();
      setServices(srvData);

      const ccData = await cmsService.getCitizensCharter();
      setCharters(ccData);

      const evData = await cmsService.getEvents();
      setEvents(evData);

      const logsData = await cmsService.getAuditLogs();
      setAuditLogs(logsData);

      // Load real certificate requests from Supabase
      try {
        const getDepartmentForDocumentType = (docType: string): string | null => {
          if (!docType) return null;
          const lower = docType.toLowerCase();
          if (lower.includes("business")) return "bplo";
          if (lower.includes("cedula") || lower.includes("community tax") || lower.includes("ctc")) return "treasury";
          if (lower.includes("building") || lower.includes("electrical") || lower.includes("plumbing")) return "eng";
          if (lower.includes("zoning")) return "mpdo";
          if (lower.includes("barangay")) return "barangay_admin";
          if (lower.includes("indigency")) return "social";
          return null;
        };

        const certRequests = await certificateService.getAllRequests();
        const mappedRequests = certRequests.map(req => {
          const autoDept = getDepartmentForDocumentType(req.documentType);
          return {
            id: req.id || `req-${req.ticketId}`,
            citizenName: req.fullName,
            type: req.documentType,
            description: req.purpose || `${req.documentType} application submitted for barangay ${req.barangay}.`,
            submittedAt: req.submittedAt || new Date().toISOString(),
            assignedDeptId: autoDept,
            status: (req.status || "PENDING").toUpperCase(),
            priority: req.documentType.toLowerCase().includes("urgent") || req.purpose.toLowerCase().includes("urgent") ? "HIGH" : "MEDIUM",
            trackingNumber: req.ticketId,
            attachments: req.attachments || [],
            email: req.email || "",
            mobileNumber: req.mobileNumber || ""
          };
        });
        setCitizenRequests(mappedRequests);
      } catch (certErr) {
        console.error("Failed to load certificate requests:", certErr);
      }

      if (isSuperAdminOrAdmin) {
        const usersData = await cmsService.getUsers();
        setUsersList(usersData);
      }
    } catch (err: any) {
      console.error("[AdminCMS] Fetch error:", err);
      showError("Error loading CMS data. Please make sure database is initialized.");
    } finally {
      setIsTableLoading(false);
    }
  }, [canAccessManagement, profile?.role]);

  // Media Library Fetcher
  const fetchMediaFiles = async () => {
    if (!isSupabaseConfigured) {
      if (!isMockAllowed()) {
        showError("Media Library bucket unavailable. Supabase is not configured.");
        setMediaFiles([]);
        return;
      }
      setMediaFiles([
        { name: "sample_permit_form.pdf", id: "pdf-1", updated_at: new Date().toISOString(), size: 1400000, metadata: { mimetype: "application/pdf" } },
        { name: "tourism_spot_danajon.jpg", id: "img-1", updated_at: new Date().toISOString(), size: 850000, metadata: { mimetype: "image/jpeg" } }
      ]);
      return;
    }
    setMediaLoading(true);
    try {
      const { data, error } = await supabase.storage.from('public-cms').list('', {
        limit: 100,
        sortBy: { column: 'name', order: 'asc' }
      });
      if (error) throw error;
      if (data) {
        setMediaFiles(data);
      }
    } catch (err: any) {
      console.error("[Media Library] Fetch error:", err.message);
      if (err?.message?.toLowerCase().includes("bucket") || err?.message?.toLowerCase().includes("not found")) {
        if (!isMockAllowed()) {
          showError("Storage bucket unavailable. Reference: public-cms bucket missing.");
          setMediaFiles([]);
          return;
        }
        console.warn("[Media Library] Falling back to mock media files due to missing storage bucket.");
        setMediaFiles([
          { name: "sample_permit_form.pdf", id: "pdf-1", updated_at: new Date().toISOString(), size: 1400000, metadata: { mimetype: "application/pdf" } },
          { name: "tourism_spot_danajon.jpg", id: "img-1", updated_at: new Date().toISOString(), size: 850000, metadata: { mimetype: "image/jpeg" } }
        ]);
      } else {
        showError("Could not retrieve media files: " + err.message);
      }
    } finally {
      setMediaLoading(false);
    }
  };

  useEffect(() => {
    loadAllCmsData();
  }, [loadAllCmsData]);

  useEffect(() => {
    if (activeTab === 'media') {
      fetchMediaFiles();
    }
  }, [activeTab]);

  // RESET FORMS
  const resetAllForms = () => {
    setEditingId(null);
    setFormStep(1);
    setNewsForm({
      title: '', slug: '', summary: '', content: '', category: 'ARTICLE',
      image_url: '', file_url: '', date: new Date().toISOString().split('T')[0], status: 'published',
      author: 'Municipal Admin', barangay_id: null
    });
    setDownloadForm({
      title: '', description: '', category: 'forms', file_url: '', file_size: '1.2 MB', status: 'published'
    });
    setTourismForm({
      name: '', description: '', gallery_images: [], location: '', google_maps_link: '',
      opening_hours: 'Always Open', contact_details: '', featured_image: ''
    });
    setOfficialForm({
      name: '', role: '', level: 3, display_order: 1, image_url: '', biography: '',
      contact_info: '', department_id: '', department: ''
    });
    setDepartmentForm({
      name: '', description: '', head_of_office: '', contact_number: '', email: '',
      office_hours: 'Monday to Friday, 8:00 AM - 5:00 PM', location: ''
    });
    setBarangayForm({
      name: '', captain: '', population: 0, contact_number: '', office_address: '',
      office_hours: 'Monday to Friday, 8:00 AM - 5:00 PM', cover_image: ''
    });
    setServiceForm({
      name: '', slug: '', description: '', purpose: '', requirements: [],
      processing_time: '3 to 5 business days', fees: 'None', office_responsible_id: '', office_responsible: '',
      office_hours: 'Monday to Friday, 8:00 AM - 5:00 PM', contact_info: '',
      physical_address: '', status: 'available', downloadable_forms: []
    });
    setCharterForm({
      office_id: '', office: '', service_name: '', requirements: [], processing_time: '',
      fees: 'No Fees', steps: [], downloadable_forms: []
    });
    setEventForm({
      title: '', description: '', date: new Date().toISOString().split('T')[0], time: '', venue: '', banner_image: ''
    });

    // Reset arrays
    setTempReqInput('');
    setTempFormTitle('');
    setTempFormUrl('');
    setTempStepActivity('');
    setTempStepOffice('');
    setTempStepDuration('');
    setTempStepClient('');
  };

  // OPEN EDIT FOR ENTITIES
  const openEditEntity = (tab: typeof activeTab, item: any) => {
    resetAllForms();
    setEditingId(item.id);
    setIsModalOpen(true);

    if (tab === 'news') {
      setNewsForm({
        title: item.title, slug: item.slug, summary: item.summary, content: item.content,
        category: item.category, image_url: item.image_url || '', file_url: item.file_url || '',
        date: item.date, status: item.status || 'published', author: item.author || 'Municipal Admin',
        barangay_id: item.barangay_id || null
      });
    } else if (tab === 'downloadables') {
      setDownloadForm({
        title: item.title, description: item.description, category: item.category,
        file_url: item.file_url, file_size: item.file_size || '1.2 MB', status: item.status || 'published'
      });
    } else if (tab === 'tourism') {
      setTourismForm({
        name: item.name, description: item.description, gallery_images: item.gallery_images || [],
        location: item.location, google_maps_link: item.google_maps_link || '',
        opening_hours: item.opening_hours || 'Always Open', contact_details: item.contact_details || '',
        featured_image: item.featured_image || ''
      });
    } else if (tab === 'officials') {
      setOfficialForm({
        name: item.name, role: item.role, level: item.level || 3, display_order: item.display_order && item.display_order >= 1 ? item.display_order : 1,
        image_url: item.image_url || '', biography: item.biography || '',
        contact_info: item.contact_info || '', department_id: item.department_id || item.department || '', department: item.department_id || item.department || ''
      });
    } else if (tab === 'departments') {
      setDepartmentForm({
        name: item.name, description: item.description, head_of_office: item.head_of_office || '',
        contact_number: item.contact_number || '', email: item.email || '',
        office_hours: item.office_hours || 'Monday to Friday, 8:00 AM - 5:00 PM', location: item.location || ''
      });
    } else if (tab === 'barangays') {
      setBarangayForm({
        name: item.name, captain: item.captain || '', population: item.population || 0,
        contact_number: item.contact_number || '', office_address: item.office_address || '',
        office_hours: item.office_hours || 'Monday to Friday, 8:00 AM - 5:00 PM', cover_image: item.cover_image || ''
      });
    } else if (tab === 'services') {
      setServiceForm({
        name: item.name, slug: item.slug, description: item.description, purpose: item.purpose || '',
        requirements: item.requirements || [], processing_time: item.processing_time || '3 to 5 business days',
        fees: item.fees || 'None', office_responsible_id: item.office_responsible_id || item.office_responsible || '', office_responsible: item.office_responsible_id || item.office_responsible || '',
        office_hours: item.office_hours || 'Monday to Friday, 8:00 AM - 5:00 PM',
        contact_info: item.contact_info || '', physical_address: item.physical_address || '',
        status: item.status || 'available', downloadable_forms: item.downloadable_forms || []
      });
    } else if (tab === 'charter') {
      setCharterForm({
        office_id: item.office_id || item.office || '', office: item.office_id || item.office || '', service_name: item.service_name, requirements: item.requirements || [],
        processing_time: item.processing_time || '', fees: item.fees || 'No Fees',
        steps: item.steps || [], downloadable_forms: item.downloadable_forms || []
      });
    } else if (tab === 'events') {
      setEventForm({
        title: item.title, description: item.description, date: item.date,
        time: item.time, venue: item.venue, banner_image: item.banner_image || ''
      });
    }
  };

  // Workflow update handlers for citizen applications
  const handleUpdateReqStatus = async (
    reqId: string,
    newStatus: string,
    customRemarks?: string,
    notifyEmail: boolean = true,
    notifySms: boolean = false,
    saveTimeline: boolean = true
  ) => {
    // Optimistic local update
    setCitizenRequests(prev => prev.map(req => {
      if (req.id === reqId) {
        return { ...req, status: newStatus };
      }
      return req;
    }));

    try {
      const reqItem = citizenRequests.find(r => r.id === reqId);
      const remarks = customRemarks || `Status updated to ${newStatus} in portal.`;
      
      if (reqItem) {
        await certificateService.updateRequestStatus(
          reqId,
          newStatus,
          remarks,
          profile?.email || "admin@talibon.gov.ph",
          notifyEmail,
          notifySms,
          saveTimeline
        );
        showSuccess(`Request ${reqItem.trackingNumber} status updated to ${newStatus} on live database!`);
        loadAllCmsData();
      } else {
        showSuccess(`Request status updated to ${newStatus}!`);
      }

      if (notifyEmail || notifySms) {
        notificationService.createNotification({
          title: "Workflow Status Update",
          message: `Citizen request ${reqItem?.trackingNumber || ""} (${reqItem?.type || "Application"}) status was changed to ${newStatus}.`,
          category: "Workflow Updates",
          department_id: reqItem?.assignedDeptId,
          action_url: "workflows"
        });
      }
    } catch (e: any) {
      console.error("Error updating request status in live DB:", e);
      showError("Could not persist status change to live database.");
    }
  };

  const openStatusUpdatePrompt = (req: any, newStatus: string) => {
    let defaultRemarks = `Status updated to ${newStatus} in portal.`;
    const upper = newStatus.toUpperCase();
    if (upper === "SUBMITTED") {
      defaultRemarks = "Application received successfully. Awaiting review.";
    } else if (upper === "ROUTED" || upper === "ASSIGNED") {
      defaultRemarks = "Request has been successfully routed to the responsible department.";
    } else if (upper === "PROCESSING" || upper === "UNDER REVIEW") {
      defaultRemarks = "Our municipal clerks are currently verifying the information on your request.";
    } else if (upper === "RETURNED" || upper === "ADDITIONAL REQUIREMENTS NEEDED") {
      defaultRemarks = "The uploaded ID is unreadable. Please submit a clearer copy of your Valid ID.";
    } else if (upper === "APPROVED") {
      defaultRemarks = "Your application has been approved. The municipality is now preparing your official document.";
    } else if (upper === "PREPARING" || upper === "PREPARING DOCUMENT") {
      defaultRemarks = "Your official municipal document is currently being prepared, generated, and signed.";
    } else if (upper === "READY" || upper === "READY FOR CLAIM") {
      defaultRemarks = "Your municipal certificate is complete and ready for physical collection at our Treasury Office. Please bring your tracking ID and a valid ID.";
    } else if (upper === "COMPLETED" || upper === "CLAIMED" || upper === "CLAIMED / COMPLETED") {
      defaultRemarks = "The requested municipal document has been successfully generated, signed, and collected. Closing ticket.";
    } else if (upper === "REJECTED") {
      defaultRemarks = "Application rejected due to incomplete or unverified identification files.";
    }
    
    setStatusUpdateReq({
      id: req.id,
      status: newStatus,
      trackingNumber: req.trackingNumber,
      citizenName: req.citizenName,
      email: req.email || "",
      mobileNumber: req.mobileNumber || ""
    });
    setStatusRemarks(defaultRemarks);
    setNotifyCitizen(true);
    setSaveTimeline(true);
    setSendEmail(!!req.email);
    setSendSms(false);
  };

  // DELETE ENTITY
  const handleDeleteEntity = async (tab: typeof activeTab, id: string) => {
    setIsActionLoading(true);
    const userEmail = user?.email || "unknown@talibon.gov.ph";
    try {
      let success = false;
      if (tab === 'news') success = await cmsService.deleteNews(id, userEmail);
      else if (tab === 'downloadables') success = await cmsService.deleteDownloadable(id, userEmail);
      else if (tab === 'tourism') success = await cmsService.deleteTourismSpot(id, userEmail);
      else if (tab === 'officials') success = await cmsService.deleteOfficial(id, userEmail);
      else if (tab === 'departments') success = await cmsService.deleteDepartment(id, userEmail);
      else if (tab === 'barangays') success = await cmsService.deleteBarangay(id, userEmail);
      else if (tab === 'services') success = await cmsService.deleteService(id, userEmail);
      else if (tab === 'charter') success = await cmsService.deleteCitizensCharter(id, userEmail);
      else if (tab === 'events') success = await cmsService.deleteEvent(id, userEmail);

      if (success) {
        showSuccess("Item deleted successfully.");
        loadAllCmsData();
      } else {
        showError("Failed to delete item.");
      }
    } catch (err: any) {
      showError(err.message || "Delete error.");
    } finally {
      setIsActionLoading(false);
    }
  };

  // SAVE SUBMISSION FOR ALL ENTITIES
  const handleSaveEntity = async (e: React.FormEvent) => {
    e.preventDefault();

    // FIELD-LEVEL CMS VALIDATIONS
    if (activeTab === 'news') {
      if (newsForm.title.trim().length < 3) {
        showError("Validation Error: Title must be at least 3 characters.");
        return;
      }
      if (newsForm.summary.trim().length < 10) {
        showError("Validation Error: Summary must be at least 10 characters.");
        return;
      }
      if (newsForm.content.trim().length < 20) {
        showError("Validation Error: Full Content must be at least 20 characters.");
        return;
      }
    } else if (activeTab === 'downloadables') {
      if (downloadForm.title.trim().length < 3) {
        showError("Validation Error: Document Name must be at least 3 characters.");
        return;
      }
      if (!downloadForm.file_url) {
        showError("Validation Error: Please upload a file attachment.");
        return;
      }
    } else if (activeTab === 'tourism') {
      if (tourismForm.name.trim().length < 3) {
        showError("Validation Error: Tourism Spot Name must be at least 3 characters.");
        return;
      }
      if (tourismForm.description.trim().length < 10) {
        showError("Validation Error: Description must be at least 10 characters.");
        return;
      }
      if (tourismForm.location.trim().length < 3) {
        showError("Validation Error: Location must be at least 3 characters.");
        return;
      }
    } else if (activeTab === 'officials') {
      if (officialForm.name.trim().length < 3) {
        showError("Validation Error: Official Name must be at least 3 characters.");
        return;
      }
      if (officialForm.role.trim().length < 2) {
        showError("Validation Error: Position / Title must be at least 2 characters.");
        return;
      }
    } else if (activeTab === 'departments') {
      if (departmentForm.name.trim().length < 3) {
        showError("Validation Error: Department Name must be at least 3 characters.");
        return;
      }
      if (departmentForm.description.trim().length < 10) {
        showError("Validation Error: Description & Mandate must be at least 10 characters.");
        return;
      }
    } else if (activeTab === 'services') {
      if (serviceForm.name.trim().length < 3) {
        showError("Validation Error: Service Name must be at least 3 characters.");
        return;
      }
      if (serviceForm.description.trim().length < 10) {
        showError("Validation Error: Description must be at least 10 characters.");
        return;
      }
    } else if (activeTab === 'charter') {
      if (charterForm.office.trim().length < 3) {
        showError("Validation Error: Department / Office Name must be at least 3 characters.");
        return;
      }
      if (charterForm.service_name.trim().length < 3) {
        showError("Validation Error: Chartered Service Name must be at least 3 characters.");
        return;
      }
      if (!charterForm.steps || charterForm.steps.length === 0) {
        showError("Validation Error: Citizen's Charter must include at least 1 workflow step.");
        return;
      }
    } else if (activeTab === 'events') {
      if (eventForm.title.trim().length < 3) {
        showError("Validation Error: Event Title must be at least 3 characters.");
        return;
      }
      if (eventForm.venue.trim().length < 3) {
        showError("Validation Error: Venue must be at least 3 characters.");
        return;
      }
      if (eventForm.description.trim().length < 10) {
        showError("Validation Error: Description must be at least 10 characters.");
        return;
      }
    }

    setIsActionLoading(true);
    const userEmail = user?.email || "unknown@talibon.gov.ph";
    try {
      if (activeTab === 'news') {
        const slug = newsForm.slug || newsForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const payload = { 
          ...newsForm, 
          slug,
          barangay_id: profile?.role === 'barangay_admin' ? profile.barangay_id : newsForm.barangay_id || null
        };
        if (editingId) {
          await cmsService.updateNews(editingId, payload, userEmail);
          showSuccess("News article updated!");
        } else {
          await cmsService.createNews(payload, userEmail);
          showSuccess("News published successfully!");
        }
      } else if (activeTab === 'downloadables') {
        if (editingId) {
          await cmsService.updateDownloadable(editingId, downloadForm, userEmail);
          showSuccess("Downloadable asset updated!");
        } else {
          await cmsService.createDownloadable(downloadForm, userEmail);
          showSuccess("Downloadable asset published!");
        }
      } else if (activeTab === 'tourism') {
        if (editingId) {
          await cmsService.updateTourismSpot(editingId, tourismForm, userEmail);
          showSuccess("Tourism spot details updated!");
        } else {
          await cmsService.createTourismSpot(tourismForm, userEmail);
          showSuccess("New tourism spot registered!");
        }
      } else if (activeTab === 'officials') {
        if (editingId) {
          await cmsService.updateOfficial(editingId, officialForm, userEmail);
          showSuccess("Official record updated!");
        } else {
          await cmsService.createOfficial(officialForm, userEmail);
          showSuccess("Official added to directories!");
        }
      } else if (activeTab === 'departments') {
        if (editingId) {
          await cmsService.updateDepartment(editingId, departmentForm, userEmail);
          showSuccess("Department files updated!");
        } else {
          await cmsService.createDepartment(departmentForm, userEmail);
          showSuccess("New municipal department created!");
        }
      } else if (activeTab === 'barangays') {
        if (editingId) {
          await cmsService.updateBarangay(editingId, barangayForm, userEmail);
          showSuccess("Barangay record updated successfully!");
        } else {
          await cmsService.createBarangay(barangayForm, userEmail);
          showSuccess("New Barangay profile created!");
        }
      } else if (activeTab === 'services') {
        const slug = serviceForm.slug || serviceForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const payload = { ...serviceForm, slug };
        if (editingId) {
          await cmsService.updateService(editingId, payload, userEmail);
          showSuccess("Service updated successfully!");
        } else {
          await cmsService.createService(payload, userEmail);
          showSuccess("Service registered successfully!");
        }
      } else if (activeTab === 'charter') {
        if (editingId) {
          await cmsService.updateCitizensCharter(editingId, charterForm, userEmail);
          showSuccess("Citizens Charter entry updated!");
        } else {
          await cmsService.createCitizensCharter(charterForm, userEmail);
          showSuccess("Citizens Charter registered!");
        }
      } else if (activeTab === 'events') {
        if (editingId) {
          await cmsService.updateEvent(editingId, eventForm, userEmail);
          showSuccess("Event record modified!");
        } else {
          await cmsService.createEvent(eventForm, userEmail);
          showSuccess("Event published successfully!");
        }
      }

      setIsModalOpen(false);
      resetAllForms();
      loadAllCmsData();
    } catch (err: any) {
      showError(err.message || "Failed to save details.");
    } finally {
      setIsActionLoading(false);
    }
  };

  // USER ACCESS VERIFICATION & ROLE SETTINGS
  const handleUpdateUserRole = async (
    userId: string,
    targetRole: string,
    verified: boolean,
    departmentId?: string | null,
    barangayId?: string | null
  ) => {
    if (!profile) return;
    
    // Safety check: Find the user being modified in usersList
    const targetUser = usersList.find(u => u.id === userId);
    
    if (profile.role === 'admin') {
      // Admin cannot modify a super_admin account
      if (targetUser && targetUser.role === 'super_admin') {
        showError("Unauthorized: Admins cannot modify Super Admin accounts.");
        return;
      }
      // Admin cannot promote a user to super_admin
      if (targetRole === 'super_admin') {
        showError("Unauthorized: Admins cannot promote users to Super Admin.");
        return;
      }
    }
    
    setIsActionLoading(true);
    const userEmail = user?.email || "unknown@talibon.gov.ph";
    try {
      await cmsService.updateUserRole(userId, targetRole, verified, userEmail, departmentId, barangayId);
      showSuccess("User permissions and verification status updated!");

      // Trigger automatic staff verification notification!
      const roleLabel = targetRole.replace('_', ' ').toUpperCase();
      const actionText = verified ? "verified & approved" : "deauthorized";
      const targetEmail = targetUser?.email || "Staff Member";
      await notificationService.createNotification({
        title: "Staff Clearance Status Change",
        message: `Account '${targetEmail}' was ${actionText} as a ${roleLabel} staff member.`,
        category: "Staff Verification",
        department_id: departmentId || null,
        action_url: "users"
      });

      // Reload profile from Supabase if we changed our own role
      if (user && userId === user.id) {
        if (import.meta.env.DEV) {
          console.log("[AdminDashboard] User updated their own role. Refreshing auth profile...");
        }
        await refreshProfile();
      }

      loadAllCmsData();
    } catch (err: any) {
      showError(err.message || "Permissions change error.");
    } finally {
      setIsActionLoading(false);
    }
  };

  // DELETE FILE FROM SUPABASE STORAGE
  const handleDeleteMedia = async (name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    if (!isSupabaseConfigured) {
      showSuccess("Mock media deleted.");
      return;
    }
    try {
      const { error } = await supabase.storage.from('public-cms').remove([name]);
      if (error) throw error;
      showSuccess("Media asset removed.");
      fetchMediaFiles();
    } catch (err: any) {
      showError("Delete error: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4 text-center p-4">
          <LoaderSpin />
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest animate-pulse">Initializing CMS Security...</p>
          <div className="mt-4">
            <button
              onClick={signOut}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-red-100 transition-all cursor-pointer border border-red-200/20 shadow-sm flex items-center gap-2"
            >
              <LogOut size={12} />
              Force Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Not Logged In or Unauthorized View
  if (!user || !profile || !canAccessManagement) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white p-12 rounded-[3rem] shadow-2xl border border-gray-100 text-center"
        >
          <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-8 text-blue-600">
            <ShieldCheck size={40} />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight uppercase">Admin Access Portal</h1>
          <p className="text-gray-500 font-medium mb-12 leading-relaxed">
            This area is strictly restricted to verified municipal administrators, department heads, and content editors.
          </p>

          {user && !profile && (
            <div className="mb-8 p-4 bg-orange-50 text-orange-600 rounded-2xl text-xs font-black uppercase tracking-widest border border-orange-100 flex items-center gap-2">
              <AlertCircle size={16} />
              Profile registration required — please complete setup at /login
            </div>
          )}

          {profile && !profile.is_verified && (
            <div className="mb-8 p-4 bg-yellow-50 text-yellow-700 rounded-2xl text-xs font-black uppercase tracking-widest border border-yellow-100 flex items-center gap-2">
              <AlertCircle size={16} />
              Your account is pending administrator verification
            </div>
          )}

          {!user ? (
            <button
              onClick={() => window.location.href = "/login"}
              className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 group"
            >
              <LogIn size={18} className="group-hover:translate-x-1 transition-transform" />
              Go to Login Page
            </button>
          ) : (
            <button
              onClick={signOut}
              className="w-full py-5 bg-gray-100 text-gray-600 rounded-2xl font-black text-xs tracking-widest hover:bg-gray-200 transition-all flex items-center justify-center gap-3"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 pt-24 md:pt-32 pb-16">
      <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-5 lg:px-6">
        
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 mb-6 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-xs">
                <Shield size={20} />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight uppercase">
                  CMS Administration
                </h1>
                <p className="text-slate-400 font-bold text-[9.5px] uppercase tracking-wider">Local Government of Talibon, Bohol</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 text-slate-500 font-bold text-xs tracking-wider">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs">Logged:</span>
              <span className="text-blue-600 font-bold">{user.email}</span>
              <span className="px-2.5 py-0.5 bg-blue-50 border border-blue-100 text-blue-700 rounded-md text-[9.5px] uppercase font-bold tracking-wider">
                {profile.role.replace('_', ' ')}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {activeTab !== 'overview' && activeTab !== 'logs' && activeTab !== 'users' && activeTab !== 'media' && activeTab !== 'meeting-assistant' && activeTab !== 'workflows' && canWriteTab(activeTab) && (
              <button
                onClick={() => { resetAllForms(); setIsModalOpen(true); }}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs tracking-wider hover:bg-blue-700 transition-all shadow-2xs flex items-center justify-center gap-1.5 grow lg:grow-0 cursor-pointer"
              >
                <Plus size={15} />
                Create New
              </button>
            )}
            <button
              onClick={loadAllCmsData}
              disabled={isActionLoading}
              className="px-4 py-2.5 bg-white text-slate-700 rounded-xl font-bold text-xs tracking-wider hover:bg-slate-50 border border-slate-200/80 transition-all flex items-center justify-center gap-1.5 grow lg:grow-0 cursor-pointer"
            >
              <RefreshCw size={15} className={isActionLoading ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              onClick={signOut}
              className="px-4 py-2.5 bg-red-50 text-red-600 rounded-xl font-bold text-xs tracking-wider hover:bg-red-100 transition-all flex items-center justify-center gap-1.5 grow lg:grow-0 cursor-pointer"
            >
              <LogOut size={15} />
              Exit CMS
            </button>
          </div>
        </div>

        {/* MAIN CMS LAYOUT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-5 items-start">
          {/* NAVIGATION SIDEBAR */}
          <div className={`transition-all duration-300 lg:sticky lg:top-6 self-start ${isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'} w-full space-y-3`}>
            <div className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-2xs space-y-2">
              <div className="flex items-center justify-between px-2 py-0.5">
                {!isSidebarCollapsed && (
                  <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">Nav Modules</span>
                )}
                <button
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-800 transition-all flex items-center justify-center shrink-0 ml-auto cursor-pointer"
                  title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                  aria-label={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                  <ListCollapse size={15} className={`transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {profile?.department_id ? (
                <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-100">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[8px] font-bold uppercase tracking-wider rounded-md">Office Assigned</span>
                  {!isSidebarCollapsed && (
                    <p className="text-xs font-bold text-blue-900 mt-1.5 leading-snug">
                      {departments.find(d => d.id === profile.department_id)?.name || "Department Staff"}
                    </p>
                  )}
                </div>
              ) : profile?.barangay_id ? (
                <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-100">
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[8px] font-bold uppercase tracking-wider rounded-md">Barangay Active</span>
                  {!isSidebarCollapsed && (
                    <p className="text-xs font-bold text-amber-900 mt-1.5 leading-snug">
                      {BARANGAYS.find(b => b.id === profile.barangay_id)?.name || "Barangay Admin"}
                    </p>
                  )}
                </div>
              ) : null}

              <div className="space-y-0.5">
                {!isSidebarCollapsed ? (
                  <p className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider pl-2.5 mb-1 mt-1">Core Modules</p>
                ) : (
                  <div className="border-t border-slate-100 my-1.5" />
                )}
                <SidebarBtn id="overview" label="Dashboard Stats" icon={LayoutDashboard} active={activeTab} onClick={setActiveTab} visible={isTabVisible('overview')} collapsed={isSidebarCollapsed} />
                <SidebarBtn id="workflows" label="Citizen Workflows" icon={Workflow} active={activeTab} onClick={setActiveTab} visible={isTabVisible('workflows')} collapsed={isSidebarCollapsed} />
                <SidebarBtn id="news" label="News & Advisory" icon={Newspaper} active={activeTab} onClick={setActiveTab} visible={isTabVisible('news')} collapsed={isSidebarCollapsed} />
                <SidebarBtn id="downloadables" label="Document Library" icon={Folder} active={activeTab} onClick={setActiveTab} visible={isTabVisible('downloadables')} collapsed={isSidebarCollapsed} />
                <SidebarBtn id="tourism" label="Tourism Spots" icon={Image} active={activeTab} onClick={setActiveTab} visible={isTabVisible('tourism')} collapsed={isSidebarCollapsed} />
                <SidebarBtn id="events" label="Public Events" icon={Calendar} active={activeTab} onClick={setActiveTab} visible={isTabVisible('events')} collapsed={isSidebarCollapsed} />
              </div>

              {(isTabVisible('officials') || isTabVisible('departments') || isTabVisible('barangays') || isTabVisible('services') || isTabVisible('charter')) && (
                <div className="space-y-0.5 pt-1 border-t border-slate-100/80">
                  {!isSidebarCollapsed ? (
                    <p className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider pl-2.5 mb-1 mt-2">Structure</p>
                  ) : (
                    <div className="border-t border-slate-100 my-1.5" />
                  )}
                  <SidebarBtn id="officials" label="Officials Directory" icon={Users} active={activeTab} onClick={setActiveTab} visible={isTabVisible('officials')} collapsed={isSidebarCollapsed} />
                  <SidebarBtn id="departments" label="Departments" icon={Landmark} active={activeTab} onClick={setActiveTab} visible={isTabVisible('departments')} collapsed={isSidebarCollapsed} />
                  <SidebarBtn id="barangays" label="Barangays" icon={Globe} active={activeTab} onClick={setActiveTab} visible={isTabVisible('barangays')} collapsed={isSidebarCollapsed} />
                  <SidebarBtn id="services" label="Municipal Services" icon={Building2} active={activeTab} onClick={setActiveTab} visible={isTabVisible('services')} collapsed={isSidebarCollapsed} />
                  <SidebarBtn id="charter" label="Citizen's Charter" icon={Gavel} active={activeTab} onClick={setActiveTab} visible={isTabVisible('charter')} collapsed={isSidebarCollapsed} />
                </div>
              )}

              {(isTabVisible('media') || isTabVisible('users') || isTabVisible('logs') || isTabVisible('meeting-assistant')) && (
                <div className="space-y-0.5 pt-1 border-t border-slate-100/80">
                  {!isSidebarCollapsed ? (
                    <p className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider pl-2.5 mb-1 mt-2">Utilities</p>
                  ) : (
                    <div className="border-t border-slate-100 my-1.5" />
                  )}
                  <SidebarBtn id="media" label="Media Library" icon={Image} active={activeTab} onClick={setActiveTab} visible={isTabVisible('media')} collapsed={isSidebarCollapsed} />
                  <SidebarBtn id="users" label="User Permissions" icon={Key} active={activeTab} onClick={setActiveTab} visible={isTabVisible('users')} collapsed={isSidebarCollapsed} />
                  <SidebarBtn id="logs" label="Administrative Logs" icon={Activity} active={activeTab} onClick={setActiveTab} visible={isTabVisible('logs')} collapsed={isSidebarCollapsed} />
                  <SidebarBtn id="meeting-assistant" label="AI Meeting Scribe" icon={Mic} active={activeTab} onClick={setActiveTab} visible={isTabVisible('meeting-assistant')} collapsed={isSidebarCollapsed} />
                </div>
              )}
            </div>
          </div>

          {/* MAIN DATA PANELS */}
          <div className="w-full">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden min-h-[60vh] p-4 sm:p-6 md:p-8">
              
              {/* CONTEXTUAL FEEDBACK BANNERS */}
              {errorMsg && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-100 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 animate-fade-in">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
              {successMsg && (
                <div className="mb-6 p-4 bg-green-50 text-green-700 border border-green-100 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 animate-fade-in">
                  <CheckCircle size={16} className="shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* PANEL SEARCH BOX FOR FILTERING CODES */}
              {activeTab !== 'overview' && activeTab !== 'media' && activeTab !== 'meeting-assistant' && activeTab !== 'logs' && (
                <SearchFilterToolbar
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  placeholder={
                    activeTab === 'news' ? "Search news and advisories..." :
                    activeTab === 'downloadables' ? "Search files and documents..." :
                    activeTab === 'tourism' ? "Search eco-tourism spots..." :
                    activeTab === 'officials' ? "Search officials directory..." :
                    activeTab === 'departments' ? "Search departments..." :
                    activeTab === 'barangays' ? "Search barangays..." :
                    activeTab === 'services' ? "Search municipal services..." :
                    activeTab === 'charter' ? "Search citizen's charter..." :
                    activeTab === 'workflows' ? "Search citizen requests..." :
                    "Search managed entries..."
                  }
                  filterValue={
                    ['news', 'downloadables', 'officials', 'services'].includes(activeTab)
                      ? categoryFilter
                      : undefined
                  }
                  onFilterChange={
                    ['news', 'downloadables', 'officials', 'services'].includes(activeTab)
                      ? setCategoryFilter
                      : undefined
                  }
                  filterOptions={
                    activeTab === 'news'
                      ? [
                          { value: 'ALL', label: 'All Categories' },
                          { value: 'ARTICLE', label: 'Article' },
                          { value: 'ADVISORY', label: 'Advisory' },
                          { value: 'UPDATE', label: 'Update' },
                          { value: 'COMMUNITY', label: 'Community' },
                          { value: 'NOTICE', label: 'Notice' }
                        ]
                      : activeTab === 'downloadables'
                      ? [
                          { value: 'ALL', label: 'All Document Types' },
                          { value: 'forms', label: 'Official Form' },
                          { value: 'ordinances', label: 'Ordinance / Legislation' },
                          { value: 'disclosure', label: 'Disclosure File' },
                          { value: 'reports', label: 'Report / Budget' }
                        ]
                      : activeTab === 'officials'
                      ? [
                          { value: 'ALL', label: 'All Levels' },
                          { value: '1', label: 'Level 1 (Mayor)' },
                          { value: '2', label: 'Level 2 (Vice Mayor)' },
                          { value: '3', label: 'Level 3 (Council)' },
                          { value: '4', label: 'Level 4 (Barangay)' }
                        ]
                      : activeTab === 'services'
                      ? [
                          { value: 'ALL', label: 'All Statuses' },
                          { value: 'available', label: 'Available' },
                          { value: 'coming-soon', label: 'Coming Soon' },
                          { value: 'maintenance', label: 'Under Maintenance' }
                        ]
                      : undefined
                  }
                  actions={
                    canWriteTab(activeTab) && ['news', 'downloadables', 'tourism', 'officials', 'departments', 'barangays', 'services', 'charter', 'events'].includes(activeTab) ? (
                      <button
                        onClick={() => { resetAllForms(); setEditingId(null); setIsModalOpen(true); }}
                        className="px-4 py-2.5 text-[10px] font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/10 flex items-center gap-1.5 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500"
                      >
                        <Plus size={12} />
                        Add New
                      </button>
                    ) : undefined
                  }
                />
              )}

              {/* OVERVIEW PANEL */}
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-2">CMS Status Overview</h2>
                    <p className="text-gray-400 font-bold text-xs">Real-time counts of municipal web elements managed by this account.</p>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
                    {/* LEFT COLUMN: MAIN STATS & OPERATIONS */}
                    <div className="xl:col-span-2 space-y-8">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <StatBox count={stats.totalNews} label="News Posts" icon={Newspaper} color="bg-blue-50 text-blue-600" />
                        <StatBox count={stats.totalDownloadables} label="Files & Forms" icon={Folder} color="bg-indigo-50 text-indigo-600" />
                        <StatBox count={stats.totalTourism} label="Tourism Spots" icon={Image} color="bg-emerald-50 text-emerald-600" />
                        <StatBox count={stats.totalOfficials} label="Org Officials" icon={Users} color="bg-amber-50 text-amber-600" />
                        <StatBox count={stats.totalDepartments} label="Offices" icon={Landmark} color="bg-purple-50 text-purple-600" />
                        <StatBox count={stats.totalServices} label="Citizen Services" icon={Building2} color="bg-teal-50 text-teal-600" />
                      </div>

                      {/* LIVE DATABASE ANALYTICS VIEWS */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* CHART 1: MONTHLY CITIZEN REQUESTS */}
                        <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-xs space-y-4">
                          <div>
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[8px] font-black uppercase tracking-widest rounded-md">View: Monthly Request Stats</span>
                            <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mt-1">E-Services Volume</h3>
                          </div>
                          <div className="h-[200px] w-full text-xs font-mono">
                            {monthlyStats.length > 0 ? (
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyStats}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                  <XAxis dataKey="document_type" tick={{ fill: '#9ca3af', fontSize: 9 }} tickLine={false} axisLine={false} />
                                  <YAxis tick={{ fill: '#9ca3af', fontSize: 9 }} tickLine={false} axisLine={false} />
                                  <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '10px' }} />
                                  <Bar dataKey="total_requests" name="Requests" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                              </ResponsiveContainer>
                            ) : (
                              <div className="h-full flex items-center justify-center text-gray-400">Loading live request volume...</div>
                            )}
                          </div>
                        </div>

                        {/* CHART 2: GAD BENEFICIARIES SECTORAL DISTRIBUTION */}
                        <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-xs space-y-4">
                          <div>
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-widest rounded-md">View: GAD Sectoral Stats</span>
                            <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mt-1">Beneficiary Distribution</h3>
                          </div>
                          <div className="h-[200px] w-full text-xs font-mono">
                            {gadStats.length > 0 ? (
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={gadStats}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                  <XAxis dataKey="civil_status" tick={{ fill: '#9ca3af', fontSize: 9 }} tickLine={false} axisLine={false} />
                                  <YAxis tick={{ fill: '#9ca3af', fontSize: 9 }} tickLine={false} axisLine={false} />
                                  <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '10px' }} />
                                  <Bar dataKey="count" name="Residents Count" fill="#10b981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                              </ResponsiveContainer>
                            ) : (
                              <div className="h-full flex items-center justify-center text-gray-400">Loading live GAD beneficiaries...</div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* DEPARTMENT SPECIFIC WIDGETS */}
                      {profile?.department_id && (() => {
                        const deptId = profile.department_id;
                        const deptName = departments.find(d => d.id === deptId)?.name || "Your Department";
                        
                        if (deptId === "dept-1") { // BPLO
                          return (
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50/30 p-8 rounded-[2rem] border border-blue-100/40 space-y-6">
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-[9px] font-black uppercase tracking-widest rounded-lg">Operational Dashboard</span>
                                  <h3 className="text-base font-black text-blue-900 uppercase tracking-tight mt-2">{deptName}</h3>
                                  <p className="text-gray-500 font-bold text-xs mt-1">Real-time status of business clearings & municipal compliance reviews.</p>
                                </div>
                                <Workflow className="text-blue-500" size={24} />
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white p-5 rounded-2xl border border-blue-100/20 shadow-xs">
                                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Pending Clearances</p>
                                  <p className="text-2xl font-black text-blue-950 mt-1">14</p>
                                  <span className="text-[10px] text-emerald-600 font-bold">● 4 urgent priority</span>
                                </div>
                                <div className="bg-white p-5 rounded-2xl border border-blue-100/20 shadow-xs">
                                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Active Taxpayers Registered</p>
                                  <p className="text-2xl font-black text-blue-950 mt-1">1,480</p>
                                  <span className="text-[10px] text-gray-400 font-bold">12 new this quarter</span>
                                </div>
                                <div className="bg-white p-5 rounded-2xl border border-blue-100/20 shadow-xs">
                                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Avg Resolution Speed</p>
                                  <p className="text-2xl font-black text-blue-950 mt-1">12.4m</p>
                                  <span className="text-[10px] text-blue-600 font-bold">Within SLA target</span>
                                </div>
                              </div>

                              <div className="bg-white/80 p-5 rounded-2xl border border-blue-100/10">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-3">Licensing Fast-Track Tasks</p>
                                <div className="space-y-3 text-xs">
                                  <div className="flex justify-between items-center bg-blue-50/30 p-3 rounded-xl border border-blue-100/10">
                                    <span className="font-bold text-blue-950">Review Unified Form: Bohol Divers Co.</span>
                                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 font-black text-[8px] uppercase tracking-wider rounded">Zoning Check</span>
                                  </div>
                                  <div className="flex justify-between items-center bg-blue-50/30 p-3 rounded-xl border border-blue-100/10">
                                    <span className="font-bold text-blue-950">Approve Clearance: Calituban Marine Supply</span>
                                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 font-black text-[8px] uppercase tracking-wider rounded">Ready</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        if (deptId === "dept-2") { // MTO
                          return (
                            <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50/30 p-8 rounded-[2rem] border border-purple-100/40 space-y-6">
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="px-2.5 py-1 bg-purple-100 text-purple-700 text-[9px] font-black uppercase tracking-widest rounded-lg">Financial Portal</span>
                                  <h3 className="text-base font-black text-purple-900 uppercase tracking-tight mt-2">{deptName}</h3>
                                  <p className="text-gray-500 font-bold text-xs mt-1">Current collections ledger, community tax logs, and general accounting.</p>
                                </div>
                                <Landmark className="text-purple-500" size={24} />
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white p-5 rounded-2xl border border-purple-100/20 shadow-xs">
                                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">CTC Forms Issued Today</p>
                                  <p className="text-2xl font-black text-purple-950 mt-1">142</p>
                                  <span className="text-[10px] text-purple-600 font-bold">Total revenue: ₱3,550</span>
                                </div>
                                <div className="bg-white p-5 rounded-2xl border border-purple-100/20 shadow-xs">
                                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Treasury Daily Collections</p>
                                  <p className="text-2xl font-black text-purple-950 mt-1">₱184,250</p>
                                  <span className="text-[10px] text-emerald-600 font-bold">▲ 8% vs yesterday</span>
                                </div>
                                <div className="bg-white p-5 rounded-2xl border border-purple-100/20 shadow-xs">
                                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Tax Assessment Queue</p>
                                  <p className="text-2xl font-black text-purple-950 mt-1">18</p>
                                  <span className="text-[10px] text-amber-600 font-bold">Avg wait: 4.8 mins</span>
                                </div>
                              </div>

                              <div className="bg-white/80 p-5 rounded-2xl border border-purple-100/10">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-3">Treasury Ledger Audits</p>
                                <div className="space-y-3 text-xs">
                                  <div className="flex justify-between items-center bg-purple-50/30 p-3 rounded-xl border border-purple-100/10">
                                    <span className="font-bold text-purple-950">Verify Community Tax Receipt Batch 04A</span>
                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 font-black text-[8px] uppercase tracking-wider rounded">Auditing</span>
                                  </div>
                                  <div className="flex justify-between items-center bg-purple-50/30 p-3 rounded-xl border border-purple-100/10">
                                    <span className="font-bold text-purple-950">Reconcile BPLO Clearance Permits</span>
                                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 font-black text-[8px] uppercase tracking-wider rounded">Pending</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        // Fallback for general departments
                        return (
                          <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-4">
                            <p className="text-xs font-black text-gray-900 uppercase tracking-wider">{deptName} Dashboard</p>
                            <p className="text-xs text-gray-500 font-bold">Departmental workflow queues are active. View the Citizen Workflows tab to process received requests.</p>
                          </div>
                        );
                      })()}

                      {/* BARANGAY SPECIFIC WIDGETS */}
                      {profile?.barangay_id && (() => {
                        const brgyName = BARANGAYS.find(b => b.id === profile.barangay_id)?.name || "Assigned Barangay";
                        return (
                          <div className="bg-gradient-to-br from-amber-50 to-orange-50/30 p-8 rounded-[2rem] border border-amber-100/40 space-y-6">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-[9px] font-black uppercase tracking-widest rounded-lg">Barangay Administration</span>
                                <h3 className="text-base font-black text-amber-900 uppercase tracking-tight mt-2">{brgyName}</h3>
                                <p className="text-gray-500 font-bold text-xs mt-1">Localized communication bulletins, residency declarations, and resident support requests.</p>
                              </div>
                              <Globe className="text-amber-500" size={24} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="bg-white p-5 rounded-2xl border border-amber-100/20 shadow-xs">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Active News Advisories</p>
                                <p className="text-2xl font-black text-amber-950 mt-1">
                                  {news.filter(n => n.barangay_id === profile.barangay_id).length}
                                </p>
                                <span className="text-[10px] text-gray-400 font-bold">Posted to localized feed</span>
                              </div>
                              <div className="bg-white p-5 rounded-2xl border border-amber-100/20 shadow-xs">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Residency Applications</p>
                                <p className="text-2xl font-black text-amber-950 mt-1">5</p>
                                <span className="text-[10px] text-amber-600 font-bold">● 2 pending signature</span>
                              </div>
                              <div className="bg-white p-5 rounded-2xl border border-amber-100/20 shadow-xs">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Assigned Officials</p>
                                <p className="text-2xl font-black text-amber-950 mt-1">8</p>
                                <span className="text-[10px] text-emerald-600 font-bold">Active directory live</span>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      <div className="p-8 bg-gray-50/50 rounded-3xl border border-gray-100 flex flex-col md:flex-row items-center gap-6 justify-between">
                        <div>
                          <h4 className="font-black text-gray-900 uppercase tracking-wider text-xs mb-1">Database Connectivity</h4>
                          <p className="text-gray-400 text-xs font-bold leading-relaxed">
                            {isSupabaseConfigured
                              ? "Connected to Live Supabase Backend database. Content changes will propagate immediately to the citizen-facing portal."
                              : "Supabase credentials not configured in environmental variables. Falling back to secure Browser Storage mode with identical schemas."
                            }
                          </p>
                        </div>
                        <span className={`px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest shrink-0 ${isSupabaseConfigured ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                          {isSupabaseConfigured ? "LIVE DB CONNECTED" : "OFFLINE FALLBACK"}
                        </span>
                      </div>

                      {/* RECENT ACTIVITY FEED */}
                      <div className="space-y-4">
                        <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Recent Administrative Activities</h3>
                        <div className="divide-y divide-gray-100 border border-gray-100 rounded-3xl overflow-hidden bg-white">
                          {auditLogs.slice(0, 5).map((log) => (
                            <div key={log.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                              <div>
                                <p className="text-xs font-black text-gray-900">
                                  {log.user_email} <span className="text-blue-600 font-bold">[{log.action}]</span> {log.target_table} ({log.target_id})
                                </p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{new Date(log.timestamp).toLocaleString()}</p>
                              </div>
                              <Activity size={16} className="text-gray-300" />
                            </div>
                          ))}
                          {auditLogs.length === 0 && (
                            <p className="p-6 text-center text-gray-400 font-bold text-xs">No admin logs recorded yet.</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* RIGHT COLUMN: QUICK ACTIONS & PENDING SYSTEM TASKS */}
                    <div className="space-y-6">
                      {/* QUICK ACTIONS CARD */}
                      <div className="bg-white border border-gray-100 rounded-[2.5rem] p-6 shadow-xs space-y-4">
                        <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => { setActiveTab('news'); resetAllForms(); setIsModalOpen(true); }}
                            className="p-4 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 rounded-2xl text-left border border-transparent hover:border-blue-100 transition-all space-y-2 group cursor-pointer animate-none"
                          >
                            <Newspaper size={18} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
                            <p className="text-[10px] font-black uppercase tracking-wider">Post Advisory</p>
                          </button>
                          <button
                            onClick={() => { setActiveTab('downloadables'); resetAllForms(); setIsModalOpen(true); }}
                            className="p-4 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-700 rounded-2xl text-left border border-transparent hover:border-indigo-100 transition-all space-y-2 group cursor-pointer"
                          >
                            <Folder size={18} className="text-gray-400 group-hover:text-indigo-600 transition-colors" />
                            <p className="text-[10px] font-black uppercase tracking-wider">Upload File</p>
                          </button>
                          <button
                            onClick={() => { setActiveTab('workflows'); }}
                            className="p-4 bg-gray-50 hover:bg-emerald-50 hover:text-emerald-700 rounded-2xl text-left border border-transparent hover:border-emerald-100 transition-all space-y-2 group cursor-pointer"
                          >
                            <Workflow size={18} className="text-gray-400 group-hover:text-emerald-600 transition-colors" />
                            <p className="text-[10px] font-black uppercase tracking-wider">Manage Tasks</p>
                          </button>
                          <button
                            onClick={() => { setActiveTab('meeting-assistant'); }}
                            className="p-4 bg-gray-50 hover:bg-amber-50 hover:text-amber-700 rounded-2xl text-left border border-transparent hover:border-amber-100 transition-all space-y-2 group cursor-pointer"
                          >
                            <Mic size={18} className="text-gray-400 group-hover:text-amber-600 transition-colors" />
                            <p className="text-[10px] font-black uppercase tracking-wider">AI Scribe</p>
                          </button>
                        </div>
                      </div>

                      {/* LATEST NOTIFICATIONS WIDGET */}
                      <div className="bg-white border border-gray-100 rounded-[2.5rem] p-6 shadow-xs space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Latest Notifications</h3>
                          <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 text-[8px] font-black uppercase tracking-widest rounded-md">Inbox Feed</span>
                        </div>
                        <div className="space-y-3">
                          {notifications.slice(0, 3).map((notif) => {
                            let catColor = "bg-gray-100 text-gray-600";
                            if (notif.category === "Citizen Applications") catColor = "bg-blue-50 text-blue-600";
                            else if (notif.category === "Workflow Updates") catColor = "bg-emerald-50 text-emerald-600";
                            else if (notif.category === "Staff Verification") catColor = "bg-amber-50 text-amber-600";
                            else if (notif.category === "News Approval") catColor = "bg-rose-50 text-rose-600";

                            return (
                              <div 
                                key={notif.id} 
                                className={`p-4 rounded-2xl border transition-all flex items-start gap-3 justify-between ${notif.is_read ? 'bg-white border-gray-100' : 'bg-blue-50/10 border-blue-100/30'}`}
                              >
                                <div className="space-y-1 min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className={`text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${catColor}`}>
                                      {notif.category}
                                    </span>
                                    {!notif.is_read && (
                                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                    )}
                                  </div>
                                  <p className="text-[11px] font-black text-gray-950 truncate">{notif.title}</p>
                                  <p className="text-[10px] text-gray-500 font-medium leading-relaxed line-clamp-2">{notif.message}</p>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  {!notif.is_read && (
                                    <button 
                                      onClick={async (e) => { e.stopPropagation(); await notificationService.markAsRead(notif.id); loadNotifications(); }}
                                      className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                      title="Mark as read"
                                    >
                                      <CheckCircle size={12} />
                                    </button>
                                  )}
                                  <button 
                                    onClick={() => {
                                      notificationService.markAsRead(notif.id);
                                      if (notif.action_url) setActiveTab(notif.action_url as any);
                                    }}
                                    className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="View"
                                  >
                                    <Eye size={12} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                          {notifications.length === 0 && (
                            <p className="p-4 text-center text-gray-400 font-bold text-[10px] uppercase tracking-wider">Your inbox is clear</p>
                          )}
                        </div>
                      </div>

                      {/* PENDING ACTIONS CHECKLIST WIDGET */}
                      {(() => {
                        const pendingStaff = (usersList || []).filter(u => !u.is_verified).length;
                        const pendingWorkflows = citizenRequests.filter(req => req.status === 'PENDING').length;
                        const draftNews = news.filter(n => n.status === 'draft').length;
                        const totalPending = (isSuperAdminOrAdmin ? pendingStaff : 0) + pendingWorkflows + draftNews;

                        return (
                          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-6 shadow-xs space-y-4">
                            <div className="flex justify-between items-center">
                              <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Pending Actions</h3>
                              <span className={`px-2.5 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-md ${totalPending > 0 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                                {totalPending > 0 ? "Action Required" : "All Caught Up"}
                              </span>
                            </div>
                            <div className="space-y-3">
                              {pendingWorkflows > 0 && (
                                <div className="p-4 bg-amber-50/50 border border-amber-100/50 rounded-2xl flex items-start gap-3 justify-between">
                                  <div className="flex gap-3">
                                    <Clock size={16} className="text-amber-500 shrink-0 mt-0.5" />
                                    <div>
                                      <p className="text-[10px] font-black text-amber-900 uppercase tracking-wider">Citizen Workflow Requests</p>
                                      <p className="text-[10px] text-amber-700 font-medium mt-1 leading-relaxed">
                                        {pendingWorkflows} incoming permit assessments need priority triage.
                                      </p>
                                    </div>
                                  </div>
                                  <button 
                                    onClick={() => setActiveTab('workflows')}
                                    className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 text-[8px] font-black uppercase tracking-widest rounded-lg transition-all"
                                  >
                                    Resolve
                                  </button>
                                </div>
                              )}

                              {isSuperAdminOrAdmin && pendingStaff > 0 && (
                                <div className="p-4 bg-red-50/50 border border-red-100/50 rounded-2xl flex items-start gap-3 justify-between">
                                  <div className="flex gap-3">
                                    <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                                    <div>
                                      <p className="text-[10px] font-black text-red-900 uppercase tracking-wider">Review Staff Signups</p>
                                      <p className="text-[10px] text-red-700 font-medium mt-1 leading-relaxed">
                                        {pendingStaff} registration requests are pending verification.
                                      </p>
                                    </div>
                                  </div>
                                  <button 
                                    onClick={() => setActiveTab('users')}
                                    className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-800 text-[8px] font-black uppercase tracking-widest rounded-lg transition-all"
                                  >
                                    Verify
                                  </button>
                                </div>
                              )}

                              {draftNews > 0 && (
                                <div className="p-4 bg-blue-50/50 border border-blue-100/50 rounded-2xl flex items-start gap-3 justify-between">
                                  <div className="flex gap-3">
                                    <Newspaper size={16} className="text-blue-500 shrink-0 mt-0.5" />
                                    <div>
                                      <p className="text-[10px] font-black text-blue-900 uppercase tracking-wider">News Approval Queue</p>
                                      <p className="text-[10px] text-blue-700 font-medium mt-1 leading-relaxed">
                                        {draftNews} unpublished news drafts require review.
                                      </p>
                                    </div>
                                  </div>
                                  <button 
                                    onClick={() => setActiveTab('news')}
                                    className="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 text-[8px] font-black uppercase tracking-widest rounded-lg transition-all"
                                  >
                                    Review
                                  </button>
                                </div>
                              )}

                              {totalPending === 0 && (
                                <div className="p-4 bg-green-50/50 border border-green-100/50 rounded-2xl flex items-start gap-3">
                                  <ShieldCheck size={16} className="text-green-500 shrink-0 mt-0.5" />
                                  <div>
                                    <p className="text-[10px] font-black text-green-900 uppercase tracking-wider">No Pending Actions</p>
                                    <p className="text-[10px] text-green-700 font-medium mt-1 leading-relaxed">
                                      All operations, staff reviews, and citizen applications are fully processed.
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {/* NEWS PANEL */}
              {activeTab === 'news' && (() => {
                const filteredNews = news.filter(n => {
                  const matchesSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase()) || n.summary.toLowerCase().includes(searchTerm.toLowerCase());
                  const matchesFilter = categoryFilter === 'ALL' || n.category === categoryFilter;
                  return matchesSearch && matchesFilter;
                });
                const paginatedNews = filteredNews.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

                return (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">News Articles</h3>
                      <span className="px-3 py-1.5 bg-gray-100 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest">{filteredNews.length} of {news.length} Items</span>
                    </div>

                    <div className="overflow-x-auto relative max-h-[60vh] custom-scrollbar border border-gray-100 rounded-[2rem] shadow-sm">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-10">
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-transparent">Article / Title</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-transparent">Category</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-transparent">Status</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-transparent">Publish Date</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right bg-transparent">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100/60 bg-white">
                          {isTableLoading ? (
                            <TableSkeleton cols={5} />
                          ) : (
                            <>
                              {paginatedNews.map((item) => (
                                <tr key={item.id} className="hover:bg-blue-50/15 even:bg-gray-50/25 transition-colors text-xs">
                                  <td className="px-6 py-4 font-black text-gray-900 max-w-xs truncate">{item.title}</td>
                                  <td className="px-6 py-4">
                                    <StatusBadge status={item.category} />
                                  </td>
                                  <td className="px-6 py-4">
                                    <StatusBadge status={item.status || 'published'} />
                                  </td>
                                  <td className="px-6 py-4 text-gray-400 font-bold">{item.date}</td>
                                  <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-1">
                                      <button onClick={() => { setViewingItem(item); setViewingTab('news'); }} className="p-2.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all cursor-pointer" title="View details"><Eye size={16} /></button>
                                      {canWriteTab('news', item) ? (
                                        <>
                                          {item.status === 'draft' && (
                                            <button
                                              onClick={async () => {
                                                setIsActionLoading(true);
                                                try {
                                                  await cmsService.publishNewsRpc(item.id, user?.email || "unknown@talibon.gov.ph");
                                                  showSuccess("News article published successfully via RPC!");
                                                  loadAllCmsData();
                                                } catch (err: any) {
                                                  showError(err.message || "Failed to publish news.");
                                                } finally {
                                                  setIsActionLoading(false);
                                                }
                                              }}
                                              className="p-2.5 text-amber-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer"
                                              title="Publish now via RPC"
                                            >
                                              <Globe size={16} />
                                            </button>
                                          )}
                                          <button onClick={() => openEditEntity('news', item)} className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer" title="Edit item"><Edit3 size={16} /></button>
                                          <button onClick={() => setDeleteConfirmItem({ id: item.id, tab: 'news', name: item.title })} className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer" title="Delete item"><Trash2 size={16} /></button>
                                        </>
                                      ) : (
                                        <span className="p-2.5 text-gray-300 flex items-center gap-1.5 font-bold uppercase text-[9px] tracking-widest"><Lock size={12} /> Read Only</span>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                              {filteredNews.length === 0 && <NoDataRow colSpan={5} />}
                            </>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <Pagination
                      currentPage={currentPage}
                      totalItems={filteredNews.length}
                      itemsPerPage={itemsPerPage}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                );
              })()}

              {/* DOWNLOADABLES PANEL */}
              {activeTab === 'downloadables' && (() => {
                const filteredDownloadables = downloadables.filter(d => {
                  const matchesSearch = d.title.toLowerCase().includes(searchTerm.toLowerCase()) || d.description.toLowerCase().includes(searchTerm.toLowerCase());
                  const matchesFilter = categoryFilter === 'ALL' || d.category === categoryFilter;
                  return matchesSearch && matchesFilter;
                });
                const paginatedDownloadables = filteredDownloadables.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

                return (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Municipal Forms & Library</h3>
                      <span className="px-3 py-1.5 bg-gray-100 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest">{filteredDownloadables.length} of {downloadables.length} Assets</span>
                    </div>

                    <div className="overflow-x-auto relative max-h-[60vh] custom-scrollbar border border-gray-100 rounded-[2rem] shadow-sm">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-10">
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-transparent">Title</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-transparent">Category</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-transparent">File Size</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right bg-transparent">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100/60 bg-white">
                          {isTableLoading ? (
                            <TableSkeleton cols={4} />
                          ) : (
                            <>
                              {paginatedDownloadables.map((item) => (
                                <tr key={item.id} className="hover:bg-blue-50/15 even:bg-gray-50/25 transition-colors text-xs">
                                  <td className="px-6 py-4 font-black text-gray-900 max-w-xs truncate">{item.title}</td>
                                  <td className="px-6 py-4">
                                    <StatusBadge status={item.category} />
                                  </td>
                                  <td className="px-6 py-4 text-gray-400 font-bold">{item.file_size}</td>
                                  <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-1">
                                      <button onClick={() => { setViewingItem(item); setViewingTab('downloadables'); }} className="p-2.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all cursor-pointer" title="View details"><Eye size={16} /></button>
                                      {canWriteTab('downloadables', item) ? (
                                        <>
                                          <button onClick={() => openEditEntity('downloadables', item)} className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer" title="Edit item"><Edit3 size={16} /></button>
                                          <button onClick={() => setDeleteConfirmItem({ id: item.id, tab: 'downloadables', name: item.title })} className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer" title="Delete item"><Trash2 size={16} /></button>
                                        </>
                                      ) : (
                                        <span className="p-2.5 text-gray-300 flex items-center gap-1.5 font-bold uppercase text-[9px] tracking-widest"><Lock size={12} /> Read Only</span>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                              {filteredDownloadables.length === 0 && <NoDataRow colSpan={4} />}
                            </>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <Pagination
                      currentPage={currentPage}
                      totalItems={filteredDownloadables.length}
                      itemsPerPage={itemsPerPage}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                );
              })()}

              {/* TOURISM PANEL */}
              {activeTab === 'tourism' && (() => {
                const filteredTourism = tourismSpots.filter(t => {
                  const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.description.toLowerCase().includes(searchTerm.toLowerCase()) || t.location.toLowerCase().includes(searchTerm.toLowerCase());
                  return matchesSearch;
                });
                const paginatedTourism = filteredTourism.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

                return (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Eco-Cultural Tourist Spots</h3>
                      <span className="px-3 py-1.5 bg-gray-100 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest">{filteredTourism.length} of {tourismSpots.length} spots</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {isTableLoading ? (
                        [...Array(2)].map((_, i) => (
                          <div key={i} className="border border-gray-100 rounded-[2rem] overflow-hidden shadow-sm flex flex-col animate-pulse">
                            <div className="h-44 w-full bg-gray-150" />
                            <div className="p-6 space-y-4 flex-grow bg-white">
                              <div className="h-4 bg-gray-200 rounded w-2/3" />
                              <div className="space-y-2">
                                <div className="h-3 bg-gray-100 rounded w-full" />
                                <div className="h-3 bg-gray-100 rounded w-5/6" />
                              </div>
                              <div className="h-3 bg-gray-100 rounded w-1/3 pt-2" />
                            </div>
                            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
                              <div className="h-8 bg-gray-200 rounded w-16" />
                              <div className="h-8 bg-gray-200 rounded w-16" />
                            </div>
                          </div>
                        ))
                      ) : (
                        <>
                          {paginatedTourism.map((item) => (
                            <div key={item.id} className="border border-gray-100 rounded-[2rem] overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-all bg-white">
                              {item.featured_image && (
                                <div className="h-44 w-full bg-cover bg-center" style={{ backgroundImage: `url(${item.featured_image})` }} />
                              )}
                              <div className="p-6 flex-grow space-y-3">
                                <h4 className="font-black text-gray-900 uppercase tracking-tight text-sm">{item.name}</h4>
                                <p className="text-gray-400 text-xs line-clamp-3 leading-relaxed">{item.description}</p>
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1.5 pt-2">
                                  <Clock size={12} /> Hours: {item.opening_hours}
                                </div>
                              </div>
                              <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
                                <button onClick={() => { setViewingItem(item); setViewingTab('tourism'); }} className="px-4 py-2 text-xs font-black bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl transition-all flex items-center gap-1 cursor-pointer" title="View details">
                                  <Eye size={12} /> View
                                </button>
                                {canWriteTab('tourism', item) ? (
                                  <>
                                    <button onClick={() => openEditEntity('tourism', item)} className="px-4 py-2 text-xs font-black bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-all flex items-center gap-1 cursor-pointer">
                                      <Edit3 size={12} /> Edit
                                    </button>
                                    <button onClick={() => setDeleteConfirmItem({ id: item.id, tab: 'tourism', name: item.name })} className="px-4 py-2 text-xs font-black bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-all flex items-center gap-1 cursor-pointer">
                                      <Trash2 size={12} /> Delete
                                    </button>
                                  </>
                                ) : (
                                  <span className="px-4 py-2 text-gray-400 flex items-center gap-1.5 font-bold uppercase text-[10px] tracking-widest"><Lock size={12} /> Read Only</span>
                                )}
                              </div>
                            </div>
                          ))}
                          {filteredTourism.length === 0 && <p className="col-span-2 text-center py-12 text-gray-400 font-bold text-xs">No registered tourist spots found.</p>}
                        </>
                      )}
                    </div>

                    <Pagination
                      currentPage={currentPage}
                      totalItems={filteredTourism.length}
                      itemsPerPage={itemsPerPage}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                );
              })()}

              {/* PUBLIC EVENTS PANEL */}
              {activeTab === 'events' && (() => {
                const filteredEvents = events.filter(e => {
                  return e.title.toLowerCase().includes(searchTerm.toLowerCase()) || e.venue.toLowerCase().includes(searchTerm.toLowerCase()) || e.description.toLowerCase().includes(searchTerm.toLowerCase());
                });
                const paginatedEvents = filteredEvents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

                return (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">LGU Public Events</h3>
                      <span className="px-3 py-1.5 bg-gray-100 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest">{filteredEvents.length} of {events.length} Events</span>
                    </div>

                    <div className="overflow-x-auto relative max-h-[60vh] custom-scrollbar border border-gray-100 rounded-[2rem] shadow-sm">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-10">
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-transparent">Event Title</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-transparent">Date & Time</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-transparent">Venue</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right bg-transparent">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100/60 bg-white">
                          {isTableLoading ? (
                            <TableSkeleton cols={4} />
                          ) : (
                            <>
                              {paginatedEvents.map((item) => (
                                <tr key={item.id} className="hover:bg-blue-50/15 even:bg-gray-50/25 transition-colors text-xs">
                                  <td className="px-6 py-4 font-black text-gray-900">{item.title}</td>
                                  <td className="px-6 py-4 text-gray-500">
                                    <span className="font-bold block text-gray-900">{item.date}</span>
                                    <span className="text-[10px]">{item.time}</span>
                                  </td>
                                  <td className="px-6 py-4 text-gray-400 font-bold">{item.venue}</td>
                                  <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-1">
                                      <button onClick={() => { setViewingItem(item); setViewingTab('events'); }} className="p-2.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all cursor-pointer" title="View details"><Eye size={16} /></button>
                                      {canWriteTab('events', item) ? (
                                        <>
                                          <button onClick={() => openEditEntity('events', item)} className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer" title="Edit item"><Edit3 size={16} /></button>
                                          <button onClick={() => setDeleteConfirmItem({ id: item.id, tab: 'events', name: item.title })} className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer" title="Delete item"><Trash2 size={16} /></button>
                                        </>
                                      ) : (
                                        <span className="p-2.5 text-gray-300 flex items-center gap-1.5 font-bold uppercase text-[9px] tracking-widest"><Lock size={12} /> Read Only</span>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                              {filteredEvents.length === 0 && <NoDataRow colSpan={4} />}
                            </>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <Pagination
                      currentPage={currentPage}
                      totalItems={filteredEvents.length}
                      itemsPerPage={itemsPerPage}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                );
              })()}

              {/* OFFICIALS PANEL */}
              {activeTab === 'officials' && (() => {
                const filteredOfficials = officials.filter(o => {
                  const deptName = departments.find(d => d.id === o.department)?.name || o.department || "";
                  const matchesSearch = o.name.toLowerCase().includes(searchTerm.toLowerCase()) || o.role.toLowerCase().includes(searchTerm.toLowerCase()) || deptName.toLowerCase().includes(searchTerm.toLowerCase());
                  const matchesFilter = categoryFilter === 'ALL' || o.level.toString() === categoryFilter;
                  return matchesSearch && matchesFilter;
                });
                const paginatedOfficials = filteredOfficials.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

                return (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Officials Directory</h3>
                      <span className="px-3 py-1.5 bg-gray-100 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest">{filteredOfficials.length} of {officials.length} Officials</span>
                    </div>

                    <div className="overflow-x-auto relative max-h-[60vh] custom-scrollbar border border-gray-100 rounded-[2rem] shadow-sm">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-10">
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-transparent">Name</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-transparent">Position / Title</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-transparent">Department</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right bg-transparent">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100/60 bg-white">
                          {isTableLoading ? (
                            <TableSkeleton cols={4} />
                          ) : (
                            <>
                              {paginatedOfficials.map((item) => (
                                <tr key={item.id} className="hover:bg-blue-50/15 even:bg-gray-50/25 transition-colors text-xs">
                                  <td className="px-6 py-4 font-black text-gray-900">{item.name}</td>
                                  <td className="px-6 py-4 text-blue-600 font-black">{item.role}</td>
                                  <td className="px-6 py-4 text-gray-400 font-bold">
                                    {departments.find(d => d.id === item.department)?.name || item.department || "LGU"}
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-1">
                                      <button onClick={() => { setViewingItem(item); setViewingTab('officials'); }} className="p-2.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all cursor-pointer" title="View details"><Eye size={16} /></button>
                                      {canWriteTab('officials', item) ? (
                                        <>
                                          <button onClick={() => openEditEntity('officials', item)} className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer" title="Edit item"><Edit3 size={16} /></button>
                                          <button onClick={() => setDeleteConfirmItem({ id: item.id, tab: 'officials', name: item.name })} className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer" title="Delete item"><Trash2 size={16} /></button>
                                        </>
                                      ) : (
                                        <span className="p-2.5 text-gray-300 flex items-center gap-1.5 font-bold uppercase text-[9px] tracking-widest"><Lock size={12} /> Read Only</span>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                              {filteredOfficials.length === 0 && <NoDataRow colSpan={4} />}
                            </>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <Pagination
                      currentPage={currentPage}
                      totalItems={filteredOfficials.length}
                      itemsPerPage={itemsPerPage}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                );
              })()}

              {/* DEPARTMENTS PANEL */}
              {activeTab === 'departments' && (() => {
                const filteredDepartments = departments.filter(d => {
                  return d.name.toLowerCase().includes(searchTerm.toLowerCase()) || (d.head_of_office || "").toLowerCase().includes(searchTerm.toLowerCase()) || (d.email || "").toLowerCase().includes(searchTerm.toLowerCase());
                });
                const paginatedDepartments = filteredDepartments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

                return (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Municipal Offices & Departments</h3>
                      <span className="px-3 py-1.5 bg-gray-100 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest">{filteredDepartments.length} of {departments.length} Offices</span>
                    </div>

                    <div className="overflow-x-auto relative max-h-[60vh] custom-scrollbar border border-gray-100 rounded-[2rem] shadow-sm">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-10">
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-transparent">Office Name</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-transparent">Head of Office</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-transparent">Email Contact</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right bg-transparent">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100/60 bg-white">
                          {isTableLoading ? (
                            <TableSkeleton cols={4} />
                          ) : (
                            <>
                              {paginatedDepartments.map((item) => (
                                <tr key={item.id} className="hover:bg-blue-50/15 even:bg-gray-50/25 transition-colors text-xs">
                                  <td className="px-6 py-4 font-black text-gray-900">{item.name}</td>
                                  <td className="px-6 py-4 font-bold text-gray-700">{item.head_of_office || "Unspecified"}</td>
                                  <td className="px-6 py-4 text-gray-400 font-bold">{item.email || "N/A"}</td>
                                  <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-1">
                                      <button onClick={() => { setViewingItem(item); setViewingTab('departments'); }} className="p-2.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all cursor-pointer" title="View details"><Eye size={16} /></button>
                                      {canWriteTab('departments', item) ? (
                                        <>
                                          <button onClick={() => openEditEntity('departments', item)} className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer" title="Edit item"><Edit3 size={16} /></button>
                                          <button onClick={() => setDeleteConfirmItem({ id: item.id, tab: 'departments', name: item.name })} className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer" title="Delete item"><Trash2 size={16} /></button>
                                        </>
                                      ) : (
                                        <span className="p-2.5 text-gray-300 flex items-center gap-1.5 font-bold uppercase text-[9px] tracking-widest"><Lock size={12} /> Read Only</span>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                              {filteredDepartments.length === 0 && <NoDataRow colSpan={4} />}
                            </>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <Pagination
                      currentPage={currentPage}
                      totalItems={filteredDepartments.length}
                      itemsPerPage={itemsPerPage}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                );
              })()}

              {/* BARANGAYS PANEL */}
              {activeTab === 'barangays' && (() => {
                const filteredBarangays = barangaysList.filter(b => {
                  return b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (b.captain || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (b.contact_number || "").toLowerCase().includes(searchTerm.toLowerCase());
                });
                const paginatedBarangays = filteredBarangays.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

                return (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Barangays Directory</h3>
                      <span className="px-3 py-1.5 bg-gray-100 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest">{filteredBarangays.length} of {barangaysList.length} Barangays</span>
                    </div>

                    <div className="overflow-x-auto relative max-h-[60vh] custom-scrollbar border border-gray-100 rounded-[2rem] shadow-sm">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-10">
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-transparent">Barangay Name</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-transparent">Barangay Captain</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-transparent">Population</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right bg-transparent">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100/60 bg-white">
                          {isTableLoading ? (
                            <TableSkeleton cols={4} />
                          ) : (
                            <>
                              {paginatedBarangays.map((item) => (
                                <tr key={item.id} className="hover:bg-blue-50/15 even:bg-gray-50/25 transition-colors text-xs">
                                  <td className="px-6 py-4 font-black text-gray-900">{item.name}</td>
                                  <td className="px-6 py-4 font-bold text-gray-700">{item.captain || "Unspecified"}</td>
                                  <td className="px-6 py-4 text-gray-400 font-bold">{item.population ? Number(item.population).toLocaleString() : "N/A"}</td>
                                  <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-1">
                                      <button onClick={() => { setViewingItem(item); setViewingTab('barangays'); }} className="p-2.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all cursor-pointer" title="View details"><Eye size={16} /></button>
                                      {canWriteTab('barangays', item) ? (
                                        <>
                                          <button onClick={() => openEditEntity('barangays', item)} className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer" title="Edit item"><Edit3 size={16} /></button>
                                          <button onClick={() => setDeleteConfirmItem({ id: item.id, tab: 'barangays', name: item.name })} className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer" title="Delete item"><Trash2 size={16} /></button>
                                        </>
                                      ) : (
                                        <span className="p-2.5 text-gray-300 flex items-center gap-1.5 font-bold uppercase text-[9px] tracking-widest"><Lock size={12} /> Read Only</span>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                              {filteredBarangays.length === 0 && <NoDataRow colSpan={4} />}
                            </>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <Pagination
                      currentPage={currentPage}
                      totalItems={filteredBarangays.length}
                      itemsPerPage={itemsPerPage}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                );
              })()}

              {/* SERVICES CMS PANEL */}
              {activeTab === 'services' && (() => {
                const filteredServices = services.filter(s => {
                  const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.description.toLowerCase().includes(searchTerm.toLowerCase());
                  const matchesFilter = categoryFilter === 'ALL' || s.status === categoryFilter;
                  return matchesSearch && matchesFilter;
                });
                const paginatedServices = filteredServices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

                return (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Citizen E-Services</h3>
                      <span className="px-3 py-1.5 bg-gray-100 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest">{filteredServices.length} of {services.length} Services</span>
                    </div>

                    <div className="overflow-x-auto relative max-h-[60vh] custom-scrollbar border border-gray-100 rounded-[2rem] shadow-sm">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-10">
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-transparent">Service Name</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-transparent">Slug Route</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-transparent">Status Badge</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right bg-transparent">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100/60 bg-white">
                          {isTableLoading ? (
                            <TableSkeleton cols={4} />
                          ) : (
                            <>
                              {paginatedServices.map((item) => (
                                <tr key={item.id} className="hover:bg-blue-50/15 even:bg-gray-50/25 transition-colors text-xs">
                                  <td className="px-6 py-4 font-black text-gray-900">{item.name}</td>
                                  <td className="px-6 py-4 font-mono text-gray-400 text-[10px]">{item.slug}</td>
                                  <td className="px-6 py-4">
                                    <StatusBadge status={item.status} />
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-1">
                                      <button onClick={() => { setViewingItem(item); setViewingTab('services'); }} className="p-2.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all cursor-pointer" title="View details"><Eye size={16} /></button>
                                      {canWriteTab('services', item) ? (
                                        <>
                                          <button onClick={() => openEditEntity('services', item)} className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer" title="Edit item"><Edit3 size={16} /></button>
                                          <button onClick={() => setDeleteConfirmItem({ id: item.id, tab: 'services', name: item.name })} className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer" title="Delete item"><Trash2 size={16} /></button>
                                        </>
                                      ) : (
                                        <span className="p-2.5 text-gray-300 flex items-center gap-1.5 font-bold uppercase text-[9px] tracking-widest"><Lock size={12} /> Read Only</span>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                              {filteredServices.length === 0 && <NoDataRow colSpan={4} />}
                            </>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <Pagination
                      currentPage={currentPage}
                      totalItems={filteredServices.length}
                      itemsPerPage={itemsPerPage}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                );
              })()}

              {/* CITIZEN CHARTER PANEL */}
              {activeTab === 'charter' && (() => {
                const filteredCharters = charters.filter(c => {
                  return c.service_name.toLowerCase().includes(searchTerm.toLowerCase()) || c.office.toLowerCase().includes(searchTerm.toLowerCase());
                });
                const paginatedCharters = filteredCharters.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

                return (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Citizen's Charter</h3>
                      <span className="px-3 py-1.5 bg-gray-100 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest">{filteredCharters.length} of {charters.length} items</span>
                    </div>

                    <div className="overflow-x-auto relative max-h-[60vh] custom-scrollbar border border-gray-100 rounded-[2rem] shadow-sm">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-10">
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-transparent">Office / Section</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-transparent">Service Item</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-transparent">Total Steps</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right bg-transparent">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100/60 bg-white">
                          {isTableLoading ? (
                            <TableSkeleton cols={4} />
                          ) : (
                            <>
                              {paginatedCharters.map((item) => (
                                <tr key={item.id} className="hover:bg-blue-50/15 even:bg-gray-50/25 transition-colors text-xs">
                                  <td className="px-6 py-4 font-black text-gray-900">{departments.find(d => d.id === item.office)?.name || item.office}</td>
                                  <td className="px-6 py-4 font-bold text-gray-700">{item.service_name}</td>
                                  <td className="px-6 py-4 text-blue-600 font-black">{item.steps?.length || 0} steps</td>
                                  <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-1">
                                      <button onClick={() => { setViewingItem(item); setViewingTab('charter'); }} className="p-2.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all cursor-pointer" title="View details"><Eye size={16} /></button>
                                      {canWriteTab('charter', item) ? (
                                        <>
                                          <button onClick={() => openEditEntity('charter', item)} className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer" title="Edit item"><Edit3 size={16} /></button>
                                          <button onClick={() => setDeleteConfirmItem({ id: item.id, tab: 'charter', name: item.service_name })} className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer" title="Delete item"><Trash2 size={16} /></button>
                                        </>
                                      ) : (
                                        <span className="p-2.5 text-gray-300 flex items-center gap-1.5 font-bold uppercase text-[9px] tracking-widest"><Lock size={12} /> Read Only</span>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                              {filteredCharters.length === 0 && <NoDataRow colSpan={4} />}
                            </>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <Pagination
                      currentPage={currentPage}
                      totalItems={filteredCharters.length}
                      itemsPerPage={itemsPerPage}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                );
              })()}

              {/* MEDIA LIBRARY PANEL */}
              {activeTab === 'media' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-2">Centralized Media Library</h3>
                    <p className="text-gray-400 text-xs font-bold mb-6">Browse and upload image and document attachments in your Supabase `public-cms` bucket.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Media upload column */}
                    <div className="md:col-span-1 border border-gray-100 p-6 rounded-[2rem] bg-gray-50">
                      <FileUpload
                        label="Direct Upload"
                        accept="*/*"
                        folder="media"
                        bucket="public-cms"
                        onUploadComplete={(url) => {
                          if (url) {
                            showSuccess("Media uploaded successfully!");
                            fetchMediaFiles();
                          }
                        }}
                      />
                    </div>

                    {/* Media files grid */}
                    <div className="md:col-span-2 space-y-4">
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input
                          type="text"
                          placeholder="Search files..."
                          value={mediaSearch}
                          onChange={(e) => setMediaSearch(e.target.value)}
                          className="w-full bg-gray-50 border border-transparent rounded-2xl py-3 pl-11 pr-5 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs"
                        />
                      </div>

                      {mediaLoading ? (
                        <div className="flex justify-center py-12"><LoaderSpin /></div>
                      ) : (
                        <div className="grid grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto pr-2">
                          {mediaFiles.filter(f => f.name.toLowerCase().includes(mediaSearch.toLowerCase())).map((file) => {
                            const isImage = file.name.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) || file.metadata?.mimetype?.startsWith('image/');
                            const publicUrl = isSupabaseConfigured
                              ? supabase.storage.from('public-cms').getPublicUrl(file.name).data.publicUrl
                              : "#";

                            return (
                              <div key={file.id || file.name} className="border border-gray-100 p-4 rounded-2xl bg-white hover:border-blue-400 transition-all flex flex-col justify-between gap-3 text-xs">
                                <div>
                                  {isImage ? (
                                    <div className="h-24 w-full bg-cover bg-center rounded-xl mb-3 border border-gray-50" style={{ backgroundImage: `url(${publicUrl})` }} />
                                  ) : (
                                    <div className="h-24 w-full bg-gray-50 flex items-center justify-center text-gray-400 rounded-xl mb-3">
                                      <FileText size={28} />
                                    </div>
                                  )}
                                  <p className="font-black text-gray-900 truncate" title={file.name}>{file.name}</p>
                                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                                <div className="flex gap-2 pt-2 border-t border-gray-50">
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(publicUrl);
                                      showSuccess("Public asset URL copied to clipboard!");
                                    }}
                                    className="px-2.5 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-[9px] font-black uppercase tracking-widest grow text-center"
                                  >
                                    Copy URL
                                  </button>
                                  <button
                                    onClick={() => handleDeleteMedia(file.name)}
                                    className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                          {mediaFiles.length === 0 && (
                            <p className="col-span-2 text-center py-12 text-gray-400 font-bold">No assets found in bucket.</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* CITIZEN WORKFLOW ROUTING PANEL */}
              {activeTab === 'workflows' && (() => {
                // If user is a department staff, filter to only show their department's requests
                const myDeptId = profile?.department_id;
                const isGeneralAdmin = ['super_admin', 'admin'].includes(profile?.role || '');
                
                const filteredRequests = citizenRequests.filter(req => {
                  // Search filter
                  const matchesSearch = req.citizenName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        req.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        (req.trackingNumber || "").toLowerCase().includes(searchTerm.toLowerCase());
                  
                  // Department-aware restriction: if not general admin, must match user's department
                  if (!isGeneralAdmin && myDeptId) {
                    return matchesSearch && req.assignedDeptId === myDeptId;
                  }
                  return matchesSearch;
                });

                // Sorting logic
                const sortedRequests = [...filteredRequests].sort((a, b) => {
                  let comparison = 0;
                  if (workflowSortField === 'date') {
                    const dateA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
                    const dateB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
                    comparison = dateA - dateB;
                  } else {
                    comparison = (a.trackingNumber || "").localeCompare(b.trackingNumber || "");
                  }
                  return workflowSortOrder === 'desc' ? -comparison : comparison;
                });

                const handleAssignDept = (reqId: string, deptId: string | null) => {
                  setCitizenRequests(prev => prev.map(req => {
                    if (req.id === reqId) {
                      const deptName = departments.find(d => d.id === deptId)?.name || "Unassigned";
                      showSuccess(`Request ${req.trackingNumber} routed to ${deptName}!`);
                      
                      if (deptId) {
                        notificationService.createNotification({
                          title: "New Citizen Application Routed",
                          message: `Request ${req.trackingNumber} (${req.type}) has been routed to the ${deptName} for clearance review.`,
                          category: "Citizen Applications",
                          department_id: deptId,
                          action_url: "workflows"
                        });
                      }
                      
                      return { ...req, assignedDeptId: deptId, status: deptId ? 'ROUTED' : 'PENDING' };
                    }
                    return req;
                  }));
                };

                return (
                  <div className="space-y-4">
                    {/* Header Bar with Controls */}
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">Citizen Workflow Routing Engine</h3>
                          <span className="text-[11px] font-extrabold text-blue-700 bg-blue-50 border border-blue-200/80 px-2.5 py-0.5 rounded-full">
                            {sortedRequests.length} {sortedRequests.length === 1 ? 'Ticket' : 'Tickets'}
                          </span>
                        </div>
                        <p className="text-slate-500 text-xs font-medium mt-0.5">
                          {isGeneralAdmin 
                            ? "Overview of active citizen workflow requests. Click any row or 'View' to expand detailed information." 
                            : `Displaying tasks routed specifically to your office: ${departments.find(d => d.id === myDeptId)?.name || "Assigned Department"}`
                          }
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto shrink-0">
                        {!isGeneralAdmin && myDeptId && (
                          <div className="px-3 py-1 bg-blue-50 border border-blue-200/80 rounded-lg text-blue-700 font-extrabold text-[9px] uppercase tracking-widest">
                            DEPARTMENT FILTER ACTIVE
                          </div>
                        )}

                        {/* Sort Field Controls */}
                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
                          <span className="text-[10px] font-bold text-slate-500 uppercase px-2">Sort:</span>
                          <button
                            onClick={() => {
                              if (workflowSortField === 'date') {
                                setWorkflowSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
                              } else {
                                setWorkflowSortField('date');
                                setWorkflowSortOrder('desc');
                              }
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                              workflowSortField === 'date' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <span>Date</span>
                            {workflowSortField === 'date' && (
                              workflowSortOrder === 'desc' ? <ArrowDown size={12} /> : <ArrowUp size={12} />
                            )}
                          </button>

                          <button
                            onClick={() => {
                              if (workflowSortField === 'ticket') {
                                setWorkflowSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
                              } else {
                                setWorkflowSortField('ticket');
                                setWorkflowSortOrder('asc');
                              }
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                              workflowSortField === 'ticket' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <span>Ticket #</span>
                            {workflowSortField === 'ticket' && (
                              workflowSortOrder === 'desc' ? <ArrowDown size={12} /> : <ArrowUp size={12} />
                            )}
                          </button>
                        </div>

                        {sortedRequests.length > 0 && (
                          <button
                            onClick={() => {
                              const allIds = sortedRequests.map(r => r.id);
                              if (workflowExpandedIds.size === sortedRequests.length) {
                                setWorkflowExpandedIds(new Set());
                              } else {
                                setWorkflowExpandedIds(new Set(allIds));
                              }
                            }}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-200/80 cursor-pointer"
                          >
                            <ListCollapse size={14} className="text-slate-500" />
                            <span>
                              {workflowExpandedIds.size === sortedRequests.length ? "Collapse All" : "Expand All"}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Table Container */}
                    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[950px]">
                          <thead>
                            <tr className="bg-slate-50/90 border-b border-slate-200/80 text-[10.5px] font-black text-slate-500 uppercase tracking-wider">
                              <th className="py-3.5 px-4">
                                <button 
                                  onClick={() => {
                                    if (workflowSortField === 'ticket') {
                                      setWorkflowSortOrder(p => p === 'asc' ? 'desc' : 'asc');
                                    } else {
                                      setWorkflowSortField('ticket');
                                      setWorkflowSortOrder('asc');
                                    }
                                  }}
                                  className="flex items-center gap-1 hover:text-slate-900 transition-colors cursor-pointer"
                                >
                                  <span>Ticket #</span>
                                  <ArrowUpDown size={11} className="text-slate-400" />
                                </button>
                              </th>
                              <th className="py-3.5 px-4">Applicant</th>
                              <th className="py-3.5 px-4">Document Type</th>
                              <th className="py-3.5 px-4">Priority</th>
                              <th className="py-3.5 px-4">Status</th>
                              <th className="py-3.5 px-4">
                                <button 
                                  onClick={() => {
                                    if (workflowSortField === 'date') {
                                      setWorkflowSortOrder(p => p === 'asc' ? 'desc' : 'asc');
                                    } else {
                                      setWorkflowSortField('date');
                                      setWorkflowSortOrder('desc');
                                    }
                                  }}
                                  className="flex items-center gap-1 hover:text-slate-900 transition-colors cursor-pointer"
                                >
                                  <span>Submitted</span>
                                  <ArrowUpDown size={11} className="text-slate-400" />
                                </button>
                              </th>
                              <th className="py-3.5 px-4">Responsible Office</th>
                              <th className="py-3.5 px-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                            {sortedRequests.map((req, idx) => {
                              const isExpanded = workflowExpandedIds.has(req.id);
                              const assignedDept = departments.find(d => d.id === req.assignedDeptId);

                              const formattedDate = req.submittedAt
                                ? new Date(req.submittedAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                  })
                                : "Recently";

                              const toggleRow = () => {
                                setWorkflowExpandedIds(prev => {
                                  const next = new Set(prev);
                                  if (next.has(req.id)) next.delete(req.id);
                                  else next.add(req.id);
                                  return next;
                                });
                              };

                              return (
                                <React.Fragment key={req.id}>
                                  {/* Main Row */}
                                  <tr 
                                    onClick={toggleRow}
                                    className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                                      isExpanded ? 'bg-blue-50/30' : idx % 2 === 1 ? 'bg-slate-50/30' : 'bg-white'
                                    }`}
                                  >
                                    {/* Ticket # */}
                                    <td className="py-3 px-4 font-mono font-black text-blue-700 text-xs tracking-tight whitespace-nowrap">
                                      {req.trackingNumber}
                                    </td>

                                    {/* Applicant */}
                                    <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                                      {req.citizenName}
                                    </td>

                                    {/* Document Type */}
                                    <td className="py-3 px-4 uppercase font-bold text-slate-800 text-[11px] whitespace-nowrap">
                                      {req.type}
                                    </td>

                                    {/* Priority */}
                                    <td className="py-3 px-4 whitespace-nowrap">
                                      <StatusBadge status={req.priority} label={`${req.priority}`} />
                                    </td>

                                    {/* Status */}
                                    <td className="py-3 px-4 whitespace-nowrap">
                                      <StatusBadge status={req.status} />
                                    </td>

                                    {/* Submission Date */}
                                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap text-[11px]">
                                      {formattedDate}
                                    </td>

                                    {/* Responsible Office */}
                                    <td className="py-3 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                      {isGeneralAdmin ? (
                                        <select
                                          value={req.assignedDeptId || ""}
                                          onChange={(e) => handleAssignDept(req.id, e.target.value || null)}
                                          className="bg-slate-50 hover:bg-white border border-slate-200/80 rounded-lg px-2 py-1 font-bold text-slate-800 text-[11px] focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-2xs cursor-pointer max-w-[160px] truncate"
                                        >
                                          <option value="">-- ROUTE OFFICE --</option>
                                          {departments.map(d => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                          ))}
                                        </select>
                                      ) : (
                                        <span className="text-[11px] font-bold text-slate-700 bg-slate-100 border border-slate-200/60 px-2 py-1 rounded-lg truncate inline-block max-w-[150px]">
                                          {assignedDept ? assignedDept.name : "Unassigned"}
                                        </span>
                                      )}
                                    </td>

                                    {/* Actions */}
                                    <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                      <button
                                        onClick={toggleRow}
                                        className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1 border border-slate-200/80 cursor-pointer shadow-2xs"
                                      >
                                        <span>{isExpanded ? "Hide" : "View"}</span>
                                        {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                                      </button>
                                    </td>
                                  </tr>

                                  {/* Expanded Row Details */}
                                  {isExpanded && (
                                    <tr key={`${req.id}-details`} className="bg-slate-50/60">
                                      <td colSpan={8} className="p-0 border-b border-slate-200/80">
                                        <AnimatePresence>
                                          <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="p-4 sm:p-5 space-y-3.5"
                                          >
                                            {/* Expanded Card Detail Header */}
                                            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3">
                                              <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Citizen Workflow Record</span>
                                                  <span className="font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded text-[11px]">
                                                    {req.trackingNumber}
                                                  </span>
                                                </div>
                                                <h4 className="text-base font-extrabold text-slate-900">
                                                  {req.citizenName} — <span className="text-slate-600 font-semibold">{req.type}</span>
                                                </h4>
                                              </div>

                                              {/* Status and Department Selectors */}
                                              <div className="flex flex-wrap items-center gap-3">
                                                <div className="space-y-0.5">
                                                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                                                    Responsible Office
                                                  </label>
                                                  {isGeneralAdmin ? (
                                                    <select
                                                      value={req.assignedDeptId || ""}
                                                      onChange={(e) => handleAssignDept(req.id, e.target.value || null)}
                                                      className="bg-white border border-slate-200/90 rounded-lg px-2.5 py-1 font-bold text-slate-800 text-[11px] focus:ring-2 focus:ring-blue-500 shadow-2xs cursor-pointer"
                                                    >
                                                      <option value="">-- ROUTE OFFICE --</option>
                                                      {departments.map(d => (
                                                        <option key={d.id} value={d.id}>{d.name}</option>
                                                      ))}
                                                    </select>
                                                  ) : (
                                                    <div className="bg-white border border-slate-200/90 px-2.5 py-1 rounded-lg text-slate-800 font-bold text-[11px]">
                                                      {assignedDept ? assignedDept.name : "Unassigned"}
                                                    </div>
                                                  )}
                                                </div>

                                                <div className="space-y-0.5">
                                                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                                                    Action Status
                                                  </label>
                                                  <select
                                                    value={req.status}
                                                    onChange={(e) => openStatusUpdatePrompt(req, e.target.value)}
                                                    className="bg-white border border-slate-200/90 rounded-lg px-2.5 py-1 font-bold text-slate-800 text-[11px] focus:ring-2 focus:ring-blue-500 shadow-2xs cursor-pointer"
                                                  >
                                                    <option value="SUBMITTED">Submitted</option>
                                                    <option value="ASSIGNED">Assigned to Department</option>
                                                    <option value="PROCESSING">Under Review</option>
                                                    <option value="RETURNED">Additional Requirements Needed</option>
                                                    <option value="APPROVED">Approved</option>
                                                    <option value="PREPARING">Preparing Document</option>
                                                    <option value="READY">Ready for Claim</option>
                                                    <option value="CLAIMED">Claimed / Completed</option>
                                                    <option value="REJECTED">Rejected</option>
                                                  </select>
                                                </div>
                                              </div>
                                            </div>

                                            {/* Form Field Summary */}
                                            <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs">
                                              <RequestSummary
                                                documentType={req.type}
                                                purposeJson={req.description}
                                                ticketId={req.trackingNumber}
                                                submittedAt={req.submittedAt}
                                                compact={true}
                                              />
                                            </div>
                                          </motion.div>
                                        </AnimatePresence>
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              );
                            })}

                            {sortedRequests.length === 0 && (
                              <tr>
                                <td colSpan={8} className="py-16 text-center bg-slate-50/50">
                                  <Workflow className="mx-auto text-slate-300 mb-2 animate-pulse" size={36} />
                                  <p className="text-xs text-slate-500 font-bold">No citizen requests found matching search or filter restrictions.</p>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* USER MANAGEMENT PANEL (SUPER ADMIN ONLY) */}
              {activeTab === 'users' && isSuperAdminOrAdmin && (() => {
                const filteredUsers = usersList.filter(u => {
                  return u.email.toLowerCase().includes(searchTerm.toLowerCase());
                });
                const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

                return (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Staff Role Controls</h3>
                      <span className="px-3 py-1.5 bg-gray-100 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest">{filteredUsers.length} of {usersList.length} staff</span>
                    </div>

                    <div className="overflow-x-auto relative max-h-[60vh] custom-scrollbar border border-gray-100 rounded-[2rem] shadow-sm">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-gray-50/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-10">
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-transparent">Email address</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-transparent">Current Role</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-transparent">Department Assignment</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-transparent">Barangay (if applicable)</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-transparent">Verification Status</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right bg-transparent">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100/60 bg-white">
                          {isTableLoading ? (
                            <TableSkeleton cols={6} />
                          ) : (
                            <>
                              {paginatedUsers.map((item) => (
                                <tr key={item.id} className="hover:bg-blue-50/15 even:bg-gray-50/25 transition-colors text-xs">
                                  <td className="px-6 py-4 font-black text-gray-900">{item.email}</td>
                                  <td className="px-6 py-4">
                                    <select
                                      value={item.role}
                                      disabled={item.role === 'super_admin' && profile?.role !== 'super_admin'}
                                      onChange={(e) => handleUpdateUserRole(item.id, e.target.value, item.is_verified, item.department_id, item.barangay_id)}
                                      className="bg-gray-50 border border-gray-200 rounded-lg p-2 font-bold text-gray-800 text-xs focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                      {(profile?.role === 'super_admin' || item.role === 'super_admin') && (
                                        <option value="super_admin">Super Admin</option>
                                      )}
                                      <option value="admin">Admin</option>
                                      <option value="editor">Editor</option>
                                      <option value="municipal_admin">Municipal Admin</option>
                                      <option value="barangay_admin">Barangay Admin</option>
                                    </select>
                                  </td>
                                  <td className="px-6 py-4">
                                    <select
                                      value={item.department_id || ""}
                                      disabled={['super_admin', 'barangay_admin'].includes(item.role)}
                                      onChange={(e) => handleUpdateUserRole(item.id, item.role, item.is_verified, e.target.value || null, item.barangay_id)}
                                      className="bg-gray-50 border border-gray-200 rounded-lg p-2 font-bold text-gray-800 text-xs focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                      <option value="">-- No Department --</option>
                                      {departments.map((d) => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                      ))}
                                    </select>
                                  </td>
                                  <td className="px-6 py-4">
                                    <select
                                      value={item.barangay_id || ""}
                                      disabled={item.role !== 'barangay_admin'}
                                      onChange={(e) => handleUpdateUserRole(item.id, item.role, item.is_verified, item.department_id, e.target.value || null)}
                                      className="bg-gray-50 border border-gray-200 rounded-lg p-2 font-bold text-gray-800 text-xs focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                      <option value="">-- No Barangay --</option>
                                      {BARANGAYS.map((b) => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                      ))}
                                    </select>
                                  </td>
                                  <td className="px-6 py-4">
                                    <StatusBadge status={item.is_verified ? "approved" : "pending"} label={item.is_verified ? "Verified" : "Pending"} />
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <button
                                      onClick={() => handleUpdateUserRole(item.id, item.role, !item.is_verified, item.department_id, item.barangay_id)}
                                      disabled={item.role === 'super_admin' && profile?.role !== 'super_admin'}
                                      className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer ${
                                        item.role === 'super_admin' && profile?.role !== 'super_admin'
                                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                                          : item.is_verified
                                          ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                          : 'bg-green-50 text-green-600 hover:bg-green-100'
                                      }`}
                                    >
                                      {item.is_verified ? "Deauthorize" : "Verify / Approve"}
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <Pagination
                      currentPage={currentPage}
                      totalItems={filteredUsers.length}
                      itemsPerPage={itemsPerPage}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                );
              })()}

              {/* AUDIT LOGS PANEL */}
              {activeTab === 'logs' && isSuperAdminOrAdmin && (() => {
                const filteredLogs = auditLogs.filter(log => {
                  return log.user_email.toLowerCase().includes(searchTerm.toLowerCase()) || log.target_table.toLowerCase().includes(searchTerm.toLowerCase()) || log.action.toLowerCase().includes(searchTerm.toLowerCase());
                });
                const paginatedLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

                return (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Full System Audit Trails</h3>
                      <span className="px-3 py-1.5 bg-gray-100 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest">{filteredLogs.length} of {auditLogs.length} entries</span>
                    </div>

                    <div className="overflow-x-auto relative max-h-[60vh] custom-scrollbar border border-gray-100 rounded-[2rem] bg-white">
                      <div className="divide-y divide-gray-100">
                        {isTableLoading ? (
                          [...Array(3)].map((_, i) => (
                            <div key={i} className="p-6 flex items-center justify-between animate-pulse">
                              <div className="space-y-2">
                                <div className="h-4 bg-gray-100 rounded w-48" />
                                <div className="h-3 bg-gray-50 rounded w-36" />
                              </div>
                              <div className="flex gap-4">
                                <div className="h-6 bg-gray-100 rounded w-16" />
                                <div className="h-4 bg-gray-50 rounded w-24" />
                              </div>
                            </div>
                          ))
                        ) : (
                          <>
                            {paginatedLogs.map((log) => (
                              <div key={log.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-2 hover:bg-gray-50">
                                <div>
                                  <p className="font-black text-gray-900">
                                    {log.user_email}
                                  </p>
                                  <p className="text-gray-400 font-bold mt-0.5">
                                    Modified <span className="text-blue-600">[{log.target_table}]</span> entry {log.target_id}
                                  </p>
                                </div>
                                <div className="text-right flex items-center gap-4">
                                  <StatusBadge status={log.action} />
                                  <span className="text-[10px] text-gray-400 font-bold">{new Date(log.timestamp).toLocaleString()}</span>
                                </div>
                              </div>
                            ))}
                            {filteredLogs.length === 0 && (
                              <p className="p-8 text-center text-gray-400 font-bold">No system changes recorded yet.</p>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    <Pagination
                      currentPage={currentPage}
                      totalItems={filteredLogs.length}
                      itemsPerPage={itemsPerPage}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                );
              })()}

              {/* MEETING ASSISTANT PANEL */}
              {activeTab === 'meeting-assistant' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-2">AI Scribe & Meeting Assistant</h3>
                    <p className="text-gray-400 text-xs font-bold mb-6">Transcribe municipal hearings and draft executive session summaries automatically.</p>
                  </div>
                  <MeetingAssistant />
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* CMS MODAL FOR CREATION & EDITING */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="CMS content editor">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" />
            
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
              
              <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-white sticky top-0 z-10">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                    {editingId ? 'Modify' : 'Create'} {activeTab.replace('_', ' ')}
                  </h2>
                  <p className="text-gray-400 text-[10px] uppercase font-black tracking-widest mt-0.5">Municipal Record Database</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl transition-colors"><X size={24} /></button>
              </div>

              <div className="p-8 overflow-y-auto flex-grow space-y-6">
                
                {/* 1. NEWS FORM */}
                {activeTab === 'news' && (
                  <form onSubmit={handleSaveEntity} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="news-title">Article Title *</label>
                      <input id="news-title" type="text" required value={newsForm.title} onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="news-cat">Category</label>
                        <select id="news-cat" value={newsForm.category} onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs">
                          <option value="ARTICLE">Article</option>
                          <option value="ADVISORY">Advisory</option>
                          <option value="UPDATE">Update</option>
                          <option value="COMMUNITY">Community</option>
                          <option value="NOTICE">Notice</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="news-date">Publication Date</label>
                        <input id="news-date" type="date" required value={newsForm.date} onChange={(e) => setNewsForm({ ...newsForm, date: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="news-status">Status</label>
                        <select id="news-status" value={newsForm.status} onChange={(e) => setNewsForm({ ...newsForm, status: e.target.value as any })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs">
                          <option value="draft">Draft (Unpublished)</option>
                          <option value="published">Published</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="news-barangay">Associated Barangay</label>
                      {profile?.role === 'barangay_admin' ? (
                        <div className="w-full bg-gray-100 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-500 text-xs">
                          {BARANGAYS.find(b => b.id === profile.barangay_id)?.name || `Barangay ID: ${profile.barangay_id}`} (Locked to your assigned Barangay)
                        </div>
                      ) : (
                        <select id="news-barangay" value={newsForm.barangay_id || ''} onChange={(e) => setNewsForm({ ...newsForm, barangay_id: e.target.value || null })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs">
                          <option value="">Municipality-Wide / Central LGU</option>
                          {BARANGAYS.map((b) => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                          ))}
                        </select>
                      )}
                    </div>

                    <FileUpload label="Featured Image (Optional)" accept="image/*" folder="news_images" bucket="public-cms" currentValue={newsForm.image_url} onUploadComplete={(url) => setNewsForm({ ...newsForm, image_url: url })} />

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="news-summary">Short Summary *</label>
                      <textarea id="news-summary" required rows={2} value={newsForm.summary} onChange={(e) => setNewsForm({ ...newsForm, summary: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs resize-none" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="news-content">Full Content *</label>
                      <textarea id="news-content" required rows={6} value={newsForm.content} onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                    </div>

                    <SubmitBtn label={editingId ? "Update news article" : "Publish news article"} isLoading={isActionLoading} />
                  </form>
                )}

                {/* 2. DOWNLOADABLES FORM */}
                {activeTab === 'downloadables' && (
                  <form onSubmit={handleSaveEntity} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="dl-title">Document Name *</label>
                      <input id="dl-title" type="text" required value={downloadForm.title} onChange={(e) => setDownloadForm({ ...downloadForm, title: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="dl-desc">Description</label>
                      <input id="dl-desc" type="text" value={downloadForm.description} onChange={(e) => setDownloadForm({ ...downloadForm, description: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="dl-cat">Category</label>
                        <select id="dl-cat" value={downloadForm.category} onChange={(e) => setDownloadForm({ ...downloadForm, category: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs">
                          <option value="forms">Official Form</option>
                          <option value="ordinances">Ordinance / Legislation</option>
                          <option value="disclosure">Disclosure File</option>
                          <option value="reports">Report / Budget</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="dl-size">File Size (e.g. 1.2 MB)</label>
                        <input id="dl-size" type="text" value={downloadForm.file_size} onChange={(e) => setDownloadForm({ ...downloadForm, file_size: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                      </div>
                    </div>

                    <FileUpload label="Secure File Attachment" folder="attachments" bucket="public-documents" currentValue={downloadForm.file_url} onUploadComplete={(url) => setDownloadForm({ ...downloadForm, file_url: url })} />

                    <SubmitBtn label={editingId ? "Update library asset" : "Save library asset"} isLoading={isActionLoading} />
                  </form>
                )}

                {/* 3. TOURISM FORM */}
                {activeTab === 'tourism' && (
                  <form onSubmit={handleSaveEntity} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="tour-name">Tourism Spot Name *</label>
                      <input id="tour-name" type="text" required value={tourismForm.name} onChange={(e) => setTourismForm({ ...tourismForm, name: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="tour-desc">Full Description *</label>
                      <textarea id="tour-desc" required rows={4} value={tourismForm.description} onChange={(e) => setTourismForm({ ...tourismForm, description: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="tour-hours">Opening Hours</label>
                        <input id="tour-hours" type="text" value={tourismForm.opening_hours} onChange={(e) => setTourismForm({ ...tourismForm, opening_hours: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="tour-contact">Contact Details</label>
                        <input id="tour-contact" type="text" value={tourismForm.contact_details} onChange={(e) => setTourismForm({ ...tourismForm, contact_details: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="tour-loc">Physical Location *</label>
                      <input id="tour-loc" type="text" required value={tourismForm.location} onChange={(e) => setTourismForm({ ...tourismForm, location: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="tour-maps">Google Maps Embed/Share Link</label>
                      <input id="tour-maps" type="text" value={tourismForm.google_maps_link} onChange={(e) => setTourismForm({ ...tourismForm, google_maps_link: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                    </div>

                    <FileUpload label="Featured Landscape Image" folder="tourism" bucket="public-cms" currentValue={tourismForm.featured_image} onUploadComplete={(url) => setTourismForm({ ...tourismForm, featured_image: url, gallery_images: url ? [url] : [] })} />

                    <SubmitBtn label={editingId ? "Update tourist spot details" : "Register tourist spot"} isLoading={isActionLoading} />
                  </form>
                )}

                {/* 4. OFFICIALS FORM */}
                {activeTab === 'officials' && (
                  <form onSubmit={handleSaveEntity} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="off-name">Official Name *</label>
                      <input id="off-name" type="text" required value={officialForm.name} onChange={(e) => setOfficialForm({ ...officialForm, name: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="off-role">Position / Title *</label>
                        <input id="off-role" type="text" required value={officialForm.role} onChange={(e) => setOfficialForm({ ...officialForm, role: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="off-dept">Department</label>
                        <select
                          id="off-dept"
                          value={officialForm.department_id || officialForm.department || ""}
                          onChange={(e) => setOfficialForm({ ...officialForm, department_id: e.target.value, department: e.target.value })}
                          className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs cursor-pointer"
                        >
                          <option value="">-- No Department --</option>
                          {departments.map((dept) => (
                            <option key={dept.id} value={dept.id}>
                              {dept.name} ({dept.id})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="off-level">Hierarchy Level (1: Mayor, 2: Vice Mayor, 3: Council, 4: Barangay)</label>
                        <input id="off-level" type="number" value={officialForm.level} onChange={(e) => setOfficialForm({ ...officialForm, level: parseInt(e.target.value) || 3 })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="off-order">Display Order (weight)</label>
                        <input id="off-order" type="number" min="1" value={officialForm.display_order} onChange={(e) => setOfficialForm({ ...officialForm, display_order: Math.max(1, parseInt(e.target.value) || 1) })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="off-contact">Email / Contact Information</label>
                      <input id="off-contact" type="text" value={officialForm.contact_info} onChange={(e) => setOfficialForm({ ...officialForm, contact_info: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="off-bio">Brief Biography</label>
                      <textarea id="off-bio" rows={3} value={officialForm.biography} onChange={(e) => setOfficialForm({ ...officialForm, biography: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                    </div>

                    <FileUpload label="Profile Portrait Photo (Optional)" folder="officials" bucket="public-cms" currentValue={officialForm.image_url} onUploadComplete={(url) => setOfficialForm({ ...officialForm, image_url: url })} />

                    <SubmitBtn label={editingId ? "Update official profile" : "Create official profile"} isLoading={isActionLoading} />
                  </form>
                )}

                {/* 5. DEPARTMENTS FORM */}
                {activeTab === 'departments' && (
                  <form onSubmit={handleSaveEntity} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="dept-name">Department Name *</label>
                      <input id="dept-name" type="text" required value={departmentForm.name} onChange={(e) => setDepartmentForm({ ...departmentForm, name: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="dept-desc">Description & Mandate *</label>
                      <textarea id="dept-desc" required rows={3} value={departmentForm.description} onChange={(e) => setDepartmentForm({ ...departmentForm, description: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="dept-head">Head of Office</label>
                        <input id="dept-head" type="text" value={departmentForm.head_of_office} onChange={(e) => setDepartmentForm({ ...departmentForm, head_of_office: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="dept-hours">Office Hours</label>
                        <input id="dept-hours" type="text" value={departmentForm.office_hours} onChange={(e) => setDepartmentForm({ ...departmentForm, office_hours: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="dept-contact">Contact Number</label>
                        <input id="dept-contact" type="text" value={departmentForm.contact_number} onChange={(e) => setDepartmentForm({ ...departmentForm, contact_number: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="dept-email">Office Email</label>
                        <input id="dept-email" type="email" value={departmentForm.email} onChange={(e) => setDepartmentForm({ ...departmentForm, email: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="dept-loc">Physical Location</label>
                      <input id="dept-loc" type="text" value={departmentForm.location} onChange={(e) => setDepartmentForm({ ...departmentForm, location: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                    </div>

                    <SubmitBtn label={editingId ? "Update department record" : "Publish department record"} isLoading={isActionLoading} />
                  </form>
                )}

                {/* 5b. BARANGAYS FORM */}
                {activeTab === 'barangays' && (
                  <form onSubmit={handleSaveEntity} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="brgy-name">Barangay Name *</label>
                      <input id="brgy-name" type="text" required value={barangayForm.name} onChange={(e) => setBarangayForm({ ...barangayForm, name: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="brgy-captain">Barangay Captain *</label>
                        <input id="brgy-captain" type="text" required value={barangayForm.captain || ""} onChange={(e) => setBarangayForm({ ...barangayForm, captain: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="brgy-pop">Population</label>
                        <input id="brgy-pop" type="number" value={barangayForm.population || 0} onChange={(e) => setBarangayForm({ ...barangayForm, population: Number(e.target.value) })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="brgy-contact">Contact Number</label>
                        <input id="brgy-contact" type="text" value={barangayForm.contact_number || ""} onChange={(e) => setBarangayForm({ ...barangayForm, contact_number: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="brgy-hours">Office Hours</label>
                        <input id="brgy-hours" type="text" value={barangayForm.office_hours || ""} onChange={(e) => setBarangayForm({ ...barangayForm, office_hours: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="brgy-addr">Office Address</label>
                      <input id="brgy-addr" type="text" value={barangayForm.office_address || ""} onChange={(e) => setBarangayForm({ ...barangayForm, office_address: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                    </div>

                    <FileUpload label="Cover Image" folder="barangays" bucket="public-cms" currentValue={barangayForm.cover_image || ""} onUploadComplete={(url) => setBarangayForm({ ...barangayForm, cover_image: url })} />

                    <SubmitBtn label={editingId ? "Update Barangay Profile" : "Create Barangay Profile"} isLoading={isActionLoading} />
                  </form>
                )}

                {/* 6. SERVICES FORM */}
                {activeTab === 'services' && (
                  <form onSubmit={handleSaveEntity} className="space-y-6">
                    {/* Step indicators */}
                    <div className="flex items-center justify-between pb-6 border-b border-gray-100 mb-6">
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${formStep === 1 ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-gray-100 text-gray-500'}`}>1</span>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Step 1</p>
                          <p className={`text-xs font-black uppercase tracking-tight ${formStep === 1 ? 'text-blue-600' : 'text-gray-500'}`}>Basic Information</p>
                        </div>
                      </div>
                      <div className="h-0.5 bg-gray-100 grow mx-6" />
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${formStep === 2 ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-gray-100 text-gray-500'}`}>2</span>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Step 2</p>
                          <p className={`text-xs font-black uppercase tracking-tight ${formStep === 2 ? 'text-blue-600' : 'text-gray-500'}`}>Requirements & Forms</p>
                        </div>
                      </div>
                    </div>

                    {formStep === 1 ? (
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="srv-name">Service Name *</label>
                          <input id="srv-name" type="text" required value={serviceForm.name} onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                          <p className="text-[10px] text-gray-400 font-bold">Provide the official title of the citizen service (e.g., "Business Permit Application").</p>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="srv-slug">Slug Route (optional)</label>
                          <input id="srv-slug" type="text" placeholder="e.g. apply-permit" value={serviceForm.slug} onChange={(e) => setServiceForm({ ...serviceForm, slug: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                          <p className="text-[10px] text-gray-400 font-bold">The URL-friendly identifier. If blank, it will auto-generate from the name.</p>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="srv-desc">Description *</label>
                          <textarea id="srv-desc" required rows={3} value={serviceForm.description} onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                          <p className="text-[10px] text-gray-400 font-bold">Clear, helpful overview explaining what this service delivers to residents.</p>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="srv-purpose">Core Purpose / Target Audience</label>
                          <textarea id="srv-purpose" rows={2} value={serviceForm.purpose} onChange={(e) => setServiceForm({ ...serviceForm, purpose: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                          <p className="text-[10px] text-gray-400 font-bold">Who qualifies to apply for this service (e.g., "All local business owners").</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="srv-time">Processing Time</label>
                            <input id="srv-time" type="text" value={serviceForm.processing_time} onChange={(e) => setServiceForm({ ...serviceForm, processing_time: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="srv-fees">Fees / Dues</label>
                            <input id="srv-fees" type="text" value={serviceForm.fees} onChange={(e) => setServiceForm({ ...serviceForm, fees: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="srv-office">Office Responsible</label>
                            <select
                              id="srv-office"
                              value={serviceForm.office_responsible_id || serviceForm.office_responsible || ""}
                              onChange={(e) => setServiceForm({ ...serviceForm, office_responsible_id: e.target.value, office_responsible: e.target.value })}
                              className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs cursor-pointer"
                              required
                            >
                              <option value="">-- Select Office --</option>
                              {departments.map((dept) => (
                                <option key={dept.id} value={dept.id}>
                                  {dept.name} ({dept.id})
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="srv-status">Availability Status</label>
                            <select id="srv-status" value={serviceForm.status} onChange={(e) => setServiceForm({ ...serviceForm, status: e.target.value as any })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs">
                              <option value="available">Available</option>
                              <option value="coming-soon">Coming Soon</option>
                              <option value="maintenance">Under Maintenance</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-gray-50">
                          <button
                            type="button"
                            onClick={() => {
                              if (!serviceForm.name.trim()) {
                                showError("Validation Error: Service Name is required.");
                                return;
                              }
                              if (!serviceForm.description.trim()) {
                                showError("Validation Error: Description is required.");
                                return;
                              }
                              setFormStep(2);
                            }}
                            className="px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl cursor-pointer"
                          >
                            Continue to Step 2
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* DYNAMIC REQUIREMENTS LIST */}
                        <div className="space-y-3 p-6 bg-gray-50 rounded-3xl border border-gray-100">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Requirements Checklist</label>
                          <p className="text-[10px] text-gray-400 font-bold mb-2">List any mandatory documents or credentials the citizen must bring or upload.</p>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="e.g. Barangay Clearance (Original)"
                              value={tempReqInput}
                              onChange={(e) => setTempReqInput(e.target.value)}
                              className="grow bg-white border border-gray-200 rounded-xl py-3 px-4 font-bold text-gray-900 focus:outline-none text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (tempReqInput.trim()) {
                                  setServiceForm({ ...serviceForm, requirements: [...serviceForm.requirements, tempReqInput.trim()] });
                                  setTempReqInput('');
                                }
                              }}
                              className="px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs cursor-pointer"
                            >
                              Add
                            </button>
                          </div>
                          <div className="space-y-1.5 pt-2">
                            {serviceForm.requirements.map((req, index) => (
                              <div key={index} className="flex justify-between items-center bg-white border border-gray-100 px-4 py-2 rounded-xl text-xs">
                                <span className="font-bold text-gray-800">{req}</span>
                                <button
                                  type="button"
                                  onClick={() => setServiceForm({ ...serviceForm, requirements: serviceForm.requirements.filter((_, i) => i !== index) })}
                                  className="text-red-500 hover:text-red-700 cursor-pointer"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ))}
                            {serviceForm.requirements.length === 0 && (
                              <p className="text-[10px] text-gray-400 font-bold italic">No specific requirements added yet.</p>
                            )}
                          </div>
                        </div>

                        {/* ATTACHED FORMS SECTION */}
                        <div className="space-y-3 p-6 bg-gray-50 rounded-3xl border border-gray-100">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block font-sans">Attached Downloadable Forms</label>
                          <p className="text-[10px] text-gray-400 font-bold mb-2 font-sans">Attach template documents (PDF/DOCX) that citizens can pre-fill.</p>
                          <div className="space-y-2">
                            <input
                              type="text"
                              placeholder="Form title (e.g. Unified Business Application Form)"
                              value={tempFormTitle}
                              onChange={(e) => setTempFormTitle(e.target.value)}
                              className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 font-bold text-gray-900 focus:outline-none text-xs"
                            />
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Direct URL (e.g. https://... or use Media Library)"
                                value={tempFormUrl}
                                onChange={(e) => setTempFormUrl(e.target.value)}
                                className="grow bg-white border border-gray-200 rounded-xl py-3 px-4 font-bold text-gray-900 focus:outline-none text-xs"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (tempFormTitle.trim() && tempFormUrl.trim()) {
                                    const newForm = { title: tempFormTitle.trim(), url: tempFormUrl.trim(), fileSize: tempFormSize };
                                    setServiceForm({ ...serviceForm, downloadable_forms: [...(serviceForm.downloadable_forms || []), newForm] });
                                    setTempFormTitle('');
                                    setTempFormUrl('');
                                  }
                                }}
                                className="px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs cursor-pointer"
                              >
                                Attach
                              </button>
                            </div>
                          </div>
                          <div className="space-y-1.5 pt-2">
                            {serviceForm.downloadable_forms?.map((formItem, index) => (
                              <div key={index} className="flex justify-between items-center bg-white border border-gray-100 px-4 py-2 rounded-xl text-xs">
                                <span className="font-bold text-indigo-600">{formItem.title}</span>
                                <button
                                  type="button"
                                  onClick={() => setServiceForm({ ...serviceForm, downloadable_forms: serviceForm.downloadable_forms?.filter((_, i) => i !== index) })}
                                  className="text-red-500 hover:text-red-700 cursor-pointer"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ))}
                            {(!serviceForm.downloadable_forms || serviceForm.downloadable_forms.length === 0) && (
                              <p className="text-[10px] text-gray-400 font-bold italic font-sans">No downloadable forms attached yet.</p>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                          <button
                            type="button"
                            onClick={() => setFormStep(1)}
                            className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 font-black text-xs uppercase tracking-widest rounded-2xl cursor-pointer"
                          >
                            Back to Step 1
                          </button>
                          <SubmitBtn label={editingId ? "Update service details" : "Register digital service"} isLoading={isActionLoading} />
                        </div>
                      </div>
                    )}
                  </form>
                )}

                {/* 7. CITIZEN CHARTER FORM */}
                {activeTab === 'charter' && (
                  <form onSubmit={handleSaveEntity} className="space-y-6">
                    {/* Step indicators */}
                    <div className="flex items-center justify-between pb-6 border-b border-gray-100 mb-6">
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${formStep === 1 ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-gray-100 text-gray-500'}`}>1</span>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Step 1</p>
                          <p className={`text-xs font-black uppercase tracking-tight ${formStep === 1 ? 'text-blue-600' : 'text-gray-500'}`}>General Details</p>
                        </div>
                      </div>
                      <div className="h-0.5 bg-gray-100 grow mx-6" />
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${formStep === 2 ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-gray-100 text-gray-500'}`}>2</span>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Step 2</p>
                          <p className={`text-xs font-black uppercase tracking-tight ${formStep === 2 ? 'text-blue-600' : 'text-gray-500'}`}>Timeline Steps</p>
                        </div>
                      </div>
                    </div>

                    {formStep === 1 ? (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="cc-office">Department / Office Name *</label>
                            <select
                              id="cc-office"
                              value={charterForm.office_id || charterForm.office || ""}
                              onChange={(e) => setCharterForm({ ...charterForm, office_id: e.target.value, office: e.target.value })}
                              className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs cursor-pointer"
                              required
                            >
                              <option value="">-- Select Office --</option>
                              {departments.map((dept) => (
                                <option key={dept.id} value={dept.id}>
                                  {dept.name} ({dept.id})
                                </option>
                              ))}
                            </select>
                            <p className="text-[10px] text-gray-400 font-bold">Office delivering the charter (e.g., "MTO").</p>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="cc-name">Chartered Service Name *</label>
                            <input id="cc-name" type="text" required value={charterForm.service_name} onChange={(e) => setCharterForm({ ...charterForm, service_name: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                            <p className="text-[10px] text-gray-400 font-bold">Name of the official chartered process.</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="cc-fees">Fees / Cost</label>
                            <input id="cc-fees" type="text" value={charterForm.fees} onChange={(e) => setCharterForm({ ...charterForm, fees: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                            <p className="text-[10px] text-gray-400 font-bold">Use "No Fees" or write the breakdown.</p>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="cc-time">Total Processing Time</label>
                            <input id="cc-time" type="text" value={charterForm.processing_time} onChange={(e) => setCharterForm({ ...charterForm, processing_time: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                            <p className="text-[10px] text-gray-400 font-bold">Total duration from start to final release.</p>
                          </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-gray-50">
                          <button
                            type="button"
                            onClick={() => {
                              if (!charterForm.office.trim()) {
                                showError("Validation Error: Office Name is required.");
                                return;
                              }
                              if (!charterForm.service_name.trim()) {
                                showError("Validation Error: Chartered Service Name is required.");
                                return;
                              }
                              setFormStep(2);
                            }}
                            className="px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl cursor-pointer"
                          >
                            Continue to Step 2
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* STEPS TIMELINE WRAPPER */}
                        <div className="space-y-4 p-6 bg-gray-50 rounded-3xl border border-gray-100 text-xs">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Workflow Timeline Steps</label>
                          <p className="text-[10px] text-gray-400 font-bold mb-2">Build the step-by-step transaction timeline. Order is managed automatically.</p>
                          
                          <div className="grid grid-cols-2 gap-3 bg-white p-4 rounded-2xl border border-gray-100">
                            <div className="col-span-2 font-black text-[10px] text-gray-400 uppercase tracking-widest">New step details</div>
                            
                            <div className="col-span-2 space-y-1">
                              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">What the client does</label>
                              <input
                                type="text"
                                placeholder="e.g. Submits required files to Counter 1"
                                value={tempStepClient}
                                onChange={(e) => setTempStepClient(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-xs focus:outline-none font-bold"
                              />
                            </div>

                            <div className="col-span-2 space-y-1">
                              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">What the office does (Activity)</label>
                              <input
                                type="text"
                                placeholder="e.g. Verifies checklist credentials"
                                value={tempStepActivity}
                                onChange={(e) => setTempStepActivity(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-xs focus:outline-none font-bold"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Duration</label>
                              <input
                                type="text"
                                placeholder="e.g. 10 mins"
                                value={tempStepDuration}
                                onChange={(e) => setTempStepDuration(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-xs focus:outline-none font-bold"
                              />
                            </div>

                            <div className="flex items-end">
                              <button
                                type="button"
                                onClick={() => {
                                  if (tempStepActivity.trim()) {
                                    const newStep = {
                                      stepNumber: charterForm.steps.length + 1,
                                      activity: tempStepActivity.trim(),
                                      officeResponsible: tempStepOffice || charterForm.office,
                                      duration: tempStepDuration || '5 mins',
                                      clientSteps: tempStepClient || 'Submit forms'
                                    };
                                    setCharterForm({ ...charterForm, steps: [...charterForm.steps, newStep] });
                                    setTempStepActivity('');
                                    setTempStepClient('');
                                    setTempStepDuration('');
                                  } else {
                                    showError("Please fill out the 'Office Activity' field to push the step.");
                                  }
                                }}
                                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black font-sans uppercase tracking-widest text-[9px] cursor-pointer"
                              >
                                Push Step
                              </button>
                            </div>
                          </div>

                          <div className="space-y-1.5 pt-2">
                            {charterForm.steps.map((st, i) => (
                              <div key={i} className="bg-white border border-gray-100 p-3 rounded-xl flex justify-between items-center">
                                <div>
                                  <span className="font-black text-blue-600">Step {st.stepNumber}: </span>
                                  <span className="font-bold text-gray-800">{st.activity}</span>
                                  <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-widest">{st.duration} — {st.clientSteps}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const filtered = charterForm.steps.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, stepNumber: idx + 1 }));
                                    setCharterForm({ ...charterForm, steps: filtered });
                                  }}
                                  className="text-red-500 hover:text-red-700 cursor-pointer"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ))}
                            {charterForm.steps.length === 0 && (
                              <p className="text-[10px] text-gray-400 font-bold italic text-center py-4">No steps added to this charter timeline yet.</p>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                          <button
                            type="button"
                            onClick={() => setFormStep(1)}
                            className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 font-black text-xs uppercase tracking-widest rounded-2xl cursor-pointer"
                          >
                            Back to Step 1
                          </button>
                          <SubmitBtn label={editingId ? "Update citizens charter" : "Publish citizens charter"} isLoading={isActionLoading} />
                        </div>
                      </div>
                    )}
                  </form>
                )}

                {/* 8. EVENTS FORM */}
                {activeTab === 'events' && (
                  <form onSubmit={handleSaveEntity} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="evt-title">Event Title *</label>
                      <input id="evt-title" type="text" required value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="evt-date">Scheduled Date *</label>
                        <input id="evt-date" type="date" required value={eventForm.date} onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="evt-time">Scheduled Time *</label>
                        <input id="evt-time" type="text" required placeholder="e.g. 8:00 AM - 5:00 PM" value={eventForm.time} onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="evt-venue">Venue / Address *</label>
                      <input id="evt-venue" type="text" required value={eventForm.venue} onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest" htmlFor="evt-desc">Full Description *</label>
                      <textarea id="evt-desc" required rows={3} value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 text-xs" />
                    </div>

                    <FileUpload label="Event Banner Landscape Image" folder="event_banners" bucket="public-cms" currentValue={eventForm.banner_image} onUploadComplete={(url) => setEventForm({ ...eventForm, banner_image: url })} />

                    <SubmitBtn label={editingId ? "Update scheduled event" : "Publish scheduled event"} isLoading={isActionLoading} />
                  </form>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CUSTOM DELETE CONFIRMATION DIALOG */}
      <AnimatePresence>
        {deleteConfirmItem && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Confirm item deletion">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteConfirmItem(null)} className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" />
            
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden p-8 text-center space-y-6">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
                <Trash2 size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Delete item?</h3>
                <p className="text-gray-500 text-xs leading-relaxed font-bold">
                  Are you sure you want to permanently delete <span className="text-gray-900 font-black">"{deleteConfirmItem.name}"</span>? This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmItem(null)}
                  className="flex-1 py-3.5 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const { tab, id } = deleteConfirmItem;
                    setDeleteConfirmItem(null);
                    await handleDeleteEntity(tab as any, id);
                  }}
                  className="flex-1 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-red-600/10"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CUSTOM STATUS & REMARKS UPDATE DIALOG */}
      <AnimatePresence>
        {statusUpdateReq && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Confirm status update with remarks">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setStatusUpdateReq(null)} className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" />
            
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden p-8 space-y-6 border border-gray-100 max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                  <Edit3 size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Guided Workflow update</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Ticket: {statusUpdateReq.trackingNumber}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-wider">
                    <span className="text-gray-400">Citizen / Requester</span>
                    <span className="text-gray-800">{statusUpdateReq.citizenName}</span>
                  </div>
                </div>

                {/* Workflow Status Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block font-display">Target Workflow Stage</label>
                  <select
                    value={statusUpdateReq.status}
                    onChange={(e) => {
                      const selected = e.target.value;
                      let defaultRemarks = `Status updated to ${selected} in portal.`;
                      const upper = selected.toUpperCase();
                      if (upper === "SUBMITTED") {
                        defaultRemarks = "Application received successfully. Awaiting review.";
                      } else if (upper === "ROUTED" || upper === "ASSIGNED") {
                        defaultRemarks = "Request has been successfully routed to the responsible department.";
                      } else if (upper === "PROCESSING" || upper === "UNDER REVIEW") {
                        defaultRemarks = "Our municipal clerks are currently verifying the information on your request.";
                      } else if (upper === "RETURNED" || upper === "ADDITIONAL REQUIREMENTS NEEDED") {
                        defaultRemarks = "The uploaded ID is unreadable. Please submit a clearer copy of your Valid ID.";
                      } else if (upper === "APPROVED") {
                        defaultRemarks = "Your application has been approved. The municipality is now preparing your official document.";
                      } else if (upper === "PREPARING" || upper === "PREPARING DOCUMENT") {
                        defaultRemarks = "Your official municipal document is currently being prepared, generated, and signed.";
                      } else if (upper === "READY" || upper === "READY FOR CLAIM") {
                        defaultRemarks = "Your municipal certificate is complete and ready for physical collection at our Treasury Office. Please bring your tracking ID and a valid ID.";
                      } else if (upper === "COMPLETED" || upper === "CLAIMED" || upper === "CLAIMED / COMPLETED") {
                        defaultRemarks = "The requested municipal document has been successfully generated, signed, and collected. Closing ticket.";
                      } else if (upper === "REJECTED") {
                        defaultRemarks = "Application rejected due to incomplete or unverified identification files.";
                      }
                      setStatusUpdateReq(prev => prev ? { ...prev, status: selected } : null);
                      setStatusRemarks(defaultRemarks);
                    }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 font-black text-gray-800 text-xs focus:outline-none focus:border-indigo-500 transition-all"
                  >
                    <option value="SUBMITTED">Submitted</option>
                    <option value="ASSIGNED">Assigned to Department</option>
                    <option value="PROCESSING">Under Review</option>
                    <option value="RETURNED">Additional Requirements Needed</option>
                    <option value="APPROVED">Approved</option>
                    <option value="PREPARING">Preparing Document</option>
                    <option value="READY">Ready for Claim</option>
                    <option value="CLAIMED">Claimed / Completed</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>

                {/* Remarks TextArea */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Workflow Remarks / Staff Note</label>
                  <textarea
                    rows={3}
                    value={statusRemarks}
                    onChange={(e) => setStatusRemarks(e.target.value)}
                    placeholder="Enter details, pick up instructions, additional requirements needed, or rejection reasons..."
                    className="w-full bg-gray-50 border border-gray-200 focus:border-indigo-500 rounded-2xl p-4 font-bold text-gray-800 text-xs focus:outline-none transition-all resize-none"
                  />
                </div>

                {/* Citizen Notification Live Preview */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Citizen Notification Preview</label>
                  <div className="bg-indigo-50/20 border border-indigo-100 rounded-2xl p-4 flex gap-3.5 items-start">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 font-bold text-xs border border-indigo-100/50">
                      {statusUpdateReq.status === "SUBMITTED" && "✅"}
                      {(statusUpdateReq.status === "ASSIGNED" || statusUpdateReq.status === "ROUTED") && "📂"}
                      {statusUpdateReq.status === "PROCESSING" && "🔍"}
                      {statusUpdateReq.status === "RETURNED" && "⚠"}
                      {statusUpdateReq.status === "APPROVED" && "✅"}
                      {statusUpdateReq.status === "PREPARING" && "🖨"}
                      {statusUpdateReq.status === "READY" && "🏛"}
                      {statusUpdateReq.status === "CLAIMED" && "🎉"}
                      {statusUpdateReq.status === "REJECTED" && "❌"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] font-black uppercase tracking-widest text-indigo-600">Workflow Updates</span>
                        <span className="text-[8px] font-bold text-gray-400">Just now</span>
                      </div>
                      <h4 className="text-xs font-black text-gray-900 mt-0.5">
                        {statusUpdateReq.status === "SUBMITTED" && "✅ Application Submitted"}
                        {(statusUpdateReq.status === "ASSIGNED" || statusUpdateReq.status === "ROUTED") && "📂 Assigned to Department"}
                        {statusUpdateReq.status === "PROCESSING" && "🔍 Under Review"}
                        {statusUpdateReq.status === "RETURNED" && "⚠ Additional Requirements Required"}
                        {statusUpdateReq.status === "APPROVED" && "✅ Approved"}
                        {statusUpdateReq.status === "PREPARING" && "🖨 Preparing Document"}
                        {statusUpdateReq.status === "READY" && "🏛 Ready for Claim"}
                        {statusUpdateReq.status === "CLAIMED" && "🎉 Transaction Completed"}
                        {statusUpdateReq.status === "REJECTED" && "❌ Request Rejected"}
                      </h4>
                      <p className="text-[10px] text-gray-500 font-medium leading-relaxed mt-1">
                        {statusUpdateReq.status === "SUBMITTED" && `Your Barangay Clearance application has been received successfully. We will notify you whenever your application progresses. [Ticket: ${statusUpdateReq.trackingNumber}]`}
                        {(statusUpdateReq.status === "ASSIGNED" || statusUpdateReq.status === "ROUTED") && `Your application has been assigned to: Municipal Engineering Office. Our staff has begun reviewing your request. [Ticket: ${statusUpdateReq.trackingNumber}]`}
                        {statusUpdateReq.status === "PROCESSING" && `Your application is currently being reviewed. No action is required at this time. [Ticket: ${statusUpdateReq.trackingNumber}]`}
                        {statusUpdateReq.status === "RETURNED" && `Please submit a clearer copy of your Valid ID. Remarks from Staff: "${statusRemarks || "No remarks provided"}". Please return to your request and upload the required document. [Ticket: ${statusUpdateReq.trackingNumber}]`}
                        {statusUpdateReq.status === "APPROVED" && `Your application has been approved. The municipality is now preparing your official document. [Ticket: ${statusUpdateReq.trackingNumber}]`}
                        {statusUpdateReq.status === "PREPARING" && `Your document is currently being prepared and signed. You will receive another notification once it is ready for pickup. [Ticket: ${statusUpdateReq.trackingNumber}]`}
                        {statusUpdateReq.status === "READY" && `Your request has been processed successfully. Please visit: Municipality of Talibon. Bring: • Tracking Number (${statusUpdateReq.trackingNumber}) • Valid Government ID • Required payment (if applicable). Office Hours: Monday-Friday 8:00 AM - 5:00 PM. Location: Treasury Office. [Ticket: ${statusUpdateReq.trackingNumber}]`}
                        {statusUpdateReq.status === "CLAIMED" && `Your document has been successfully claimed. Thank you for using Talibon Digital Core. [Ticket: ${statusUpdateReq.trackingNumber}]`}
                        {statusUpdateReq.status === "REJECTED" && `Verification declined. Remarks: "${statusRemarks || "Incomplete details"}". Please submit a new claim with valid files. [Ticket: ${statusUpdateReq.trackingNumber}]`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Citizen Contact & Notification Preferences Controls */}
                <div className="bg-slate-50 rounded-2xl p-4.5 border border-slate-100 space-y-3">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Citizen Contact & Notification Channels</span>
                  
                  {/* Contact Availability Indicators */}
                  <div className="flex flex-col gap-2 border-b border-slate-150/60 pb-3">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-sm">📧</span>
                      <span className="font-bold text-slate-500 uppercase tracking-wide text-[10px]">Email:</span>
                      {statusUpdateReq.email ? (
                        <span className="font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100/60 text-[10px]">{statusUpdateReq.email}</span>
                      ) : (
                        <span className="text-red-500 bg-red-50 font-bold px-2 py-0.5 rounded-lg border border-red-100/60 text-[10px]">Unavailable</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-sm">📱</span>
                      <span className="font-bold text-slate-500 uppercase tracking-wide text-[10px]">Mobile:</span>
                      {statusUpdateReq.mobileNumber ? (
                        <span className="font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100/60 text-[10px]">{statusUpdateReq.mobileNumber}</span>
                      ) : (
                        <span className="text-red-500 bg-red-50 font-bold px-2 py-0.5 rounded-lg border border-red-100/60 text-[10px]">Unavailable</span>
                      )}
                    </div>
                    {!statusUpdateReq.email && !statusUpdateReq.mobileNumber && (
                      <div className="p-2 bg-amber-50 border border-amber-200/50 rounded-xl text-[10px] text-amber-700 font-bold flex items-center gap-2">
                        <span>⚠️</span> No citizen contact information available for notifications.
                      </div>
                    )}
                  </div>

                  {/* Checkbox selectors */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5 pt-1">
                    <label className={`flex items-center gap-3 cursor-pointer group ${!statusUpdateReq.email ? 'opacity-40 cursor-not-allowed' : ''}`}>
                      <input
                        type="checkbox"
                        disabled={!statusUpdateReq.email}
                        checked={sendEmail}
                        onChange={(e) => setSendEmail(e.target.checked)}
                        className="rounded-lg border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4.5 h-4.5 cursor-pointer disabled:cursor-not-allowed"
                      />
                      <div>
                        <p className="text-[10px] font-black uppercase text-gray-850 tracking-wide flex items-center gap-1.5">
                          Notify via Email
                          {statusUpdateReq.email && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                        </p>
                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Primary Channel</p>
                      </div>
                    </label>

                    <label className={`flex items-center gap-3 cursor-pointer group opacity-50 cursor-not-allowed`}>
                      <input
                        type="checkbox"
                        disabled
                        checked={false}
                        onChange={(e) => {}}
                        className="rounded-lg border-gray-300 text-slate-300 w-4.5 h-4.5 cursor-not-allowed"
                      />
                      <div>
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-wide">
                          Notify via SMS
                        </p>
                        <p className="text-[8px] font-bold text-amber-600/80 uppercase tracking-widest font-black">Offline (Not Configured)</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Workflow Configuration Checkboxes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1.5 border-t border-gray-100">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={notifyCitizen}
                      onChange={(e) => setNotifyCitizen(e.target.checked)}
                      className="rounded-lg border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <p className="text-[10px] font-black uppercase text-gray-800 tracking-wide">In-App Alerts</p>
                      <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Portal Notification</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={saveTimeline}
                      onChange={(e) => setSaveTimeline(e.target.checked)}
                      className="rounded-lg border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <p className="text-[10px] font-black uppercase text-gray-800 tracking-wide">Save to Timeline</p>
                      <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Citizen Tracker</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setStatusUpdateReq(null)}
                  className="flex-1 py-4 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const { id, status } = statusUpdateReq;
                    setStatusUpdateReq(null);
                    await handleUpdateReqStatus(id, status, statusRemarks, sendEmail, false, saveTimeline);
                  }}
                  className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/15"
                >
                  Confirm & Save
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CUSTOM VIEW DETAILS MODAL */}
      <AnimatePresence>
        {viewingItem && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="View entry details">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setViewingItem(null); setViewingTab(null); }} className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" />
            
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
              <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-white sticky top-0 z-10">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                    {viewingTab?.replace('_', ' ')} Details
                  </h2>
                  <p className="text-gray-400 text-[10px] uppercase font-black tracking-widest mt-0.5">Municipal Record Information Card</p>
                </div>
                <button onClick={() => { setViewingItem(null); setViewingTab(null); }} className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 overflow-y-auto flex-grow space-y-6 text-xs text-gray-700">
                {viewingTab === 'news' && (
                  <div className="space-y-6">
                    {viewingItem.featured_image && (
                      <img src={viewingItem.featured_image} alt={viewingItem.title} className="w-full h-64 object-cover rounded-2xl border border-gray-100" referrerPolicy="no-referrer" />
                    )}
                    <div className="space-y-2">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-widest">{viewingItem.category}</span>
                      <h3 className="text-xl font-black text-gray-900 tracking-tight">{viewingItem.title}</h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Published: {viewingItem.date} by {viewingItem.author || 'Super Admin'}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 italic text-gray-600 font-medium">
                      {viewingItem.summary}
                    </div>
                    <div className="prose max-w-none text-gray-800 font-medium leading-relaxed whitespace-pre-wrap">
                      {viewingItem.content}
                    </div>
                  </div>
                )}

                {viewingTab === 'downloadables' && (
                  <div className="space-y-6">
                    <div className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                        <FileText size={24} />
                      </div>
                      <div className="flex-grow">
                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight">{viewingItem.title}</h4>
                        <p className="text-[10px] text-indigo-600 uppercase font-black tracking-widest mt-0.5">{viewingItem.category} • {viewingItem.file_size || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Description & Usage Instruction</h4>
                      <p className="text-gray-600 leading-relaxed font-bold bg-gray-50 p-4 rounded-2xl border border-gray-100">{viewingItem.description || 'No instructions provided.'}</p>
                    </div>
                    <div className="pt-4 border-t border-gray-50 flex gap-3">
                      <a
                        href={viewingItem.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest text-center transition-all shadow-xl shadow-indigo-600/15"
                      >
                        Download PDF / Document
                      </a>
                    </div>
                  </div>
                )}

                {viewingTab === 'tourism' && (
                  <div className="space-y-6">
                    {viewingItem.featured_image && (
                      <img src={viewingItem.featured_image} alt={viewingItem.name} className="w-full h-64 object-cover rounded-2xl border border-gray-100" referrerPolicy="no-referrer" />
                    )}
                    <div className="space-y-2">
                      <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase">{viewingItem.name}</h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Location: {viewingItem.location}</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">About this tourist destination</h4>
                      <p className="text-gray-600 leading-relaxed font-bold bg-gray-50 p-4 rounded-2xl border border-gray-100">{viewingItem.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="p-4 border border-gray-100 rounded-2xl bg-gray-50/50 space-y-1">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Opening Hours</span>
                        <span className="font-bold text-gray-800">{viewingItem.opening_hours || 'Always Open'}</span>
                      </div>
                      <div className="p-4 border border-gray-100 rounded-2xl bg-gray-50/50 space-y-1">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Entrance Fee</span>
                        <span className="font-bold text-gray-800">{viewingItem.fee || 'Free'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {viewingTab === 'events' && (
                  <div className="space-y-6">
                    {viewingItem.banner_image && (
                      <img src={viewingItem.banner_image} alt={viewingItem.title} className="w-full h-64 object-cover rounded-2xl border border-gray-100" referrerPolicy="no-referrer" />
                    )}
                    <div className="space-y-2">
                      <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase">{viewingItem.title}</h3>
                      <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">Scheduled Event</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Event Description</h4>
                      <p className="text-gray-600 leading-relaxed font-bold bg-gray-50 p-4 rounded-2xl border border-gray-100">{viewingItem.description}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-4 pt-2">
                      <div className="p-4 border border-gray-100 rounded-2xl bg-gray-50/50 space-y-1">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Date</span>
                        <span className="font-bold text-gray-800">{viewingItem.date}</span>
                      </div>
                      <div className="p-4 border border-gray-100 rounded-2xl bg-gray-50/50 space-y-1">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Time</span>
                        <span className="font-bold text-gray-800">{viewingItem.time}</span>
                      </div>
                      <div className="p-4 border border-gray-100 rounded-2xl bg-gray-50/50 space-y-1">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Venue</span>
                        <span className="font-bold text-gray-800 truncate block">{viewingItem.venue}</span>
                      </div>
                    </div>
                  </div>
                )}

                {viewingTab === 'officials' && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-6 p-6 border border-gray-100 bg-gray-50/50 rounded-3xl">
                      {viewingItem.photo_url ? (
                        <img src={viewingItem.photo_url} alt={viewingItem.name} className="w-24 h-24 object-cover rounded-2xl border border-gray-200" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-24 h-24 bg-gray-200 rounded-2xl flex items-center justify-center text-gray-400 font-black text-lg">
                          {viewingItem.name.charAt(0)}
                        </div>
                      )}
                      <div className="space-y-1">
                        <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">{viewingItem.name}</h3>
                        <p className="text-xs text-blue-600 font-black uppercase tracking-widest">{viewingItem.role}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Department: {departments.find(d => d.id === viewingItem.department)?.name || viewingItem.department || 'LGU'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 border border-gray-100 rounded-2xl bg-gray-50/50 space-y-1">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Term of Office</span>
                        <span className="font-bold text-gray-800">{viewingItem.term_start || 'N/A'} - {viewingItem.term_end || 'N/A'}</span>
                      </div>
                      <div className="p-4 border border-gray-100 rounded-2xl bg-gray-50/50 space-y-1">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Hierarchy Level</span>
                        <span className="font-bold text-gray-800">Level {viewingItem.level || '0'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {viewingTab === 'departments' && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase">{viewingItem.name}</h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Office Head: <span className="text-gray-800 font-black">{viewingItem.head_of_office || 'None'}</span></p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">About Office & Mandate</h4>
                      <p className="text-gray-600 leading-relaxed font-bold bg-gray-50 p-4 rounded-2xl border border-gray-100">{viewingItem.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 border border-gray-100 rounded-2xl bg-gray-50/50 space-y-1">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Email Address</span>
                        <span className="font-bold text-gray-800">{viewingItem.email || 'N/A'}</span>
                      </div>
                      <div className="p-4 border border-gray-100 rounded-2xl bg-gray-50/50 space-y-1">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Phone Contact</span>
                        <span className="font-bold text-gray-800">{viewingItem.phone || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {viewingTab === 'barangays' && (
                  <div className="space-y-6">
                    {viewingItem.cover_image && (
                      <div className="w-full h-40 rounded-3xl overflow-hidden border border-gray-100">
                        <img src={viewingItem.cover_image} alt={viewingItem.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    )}
                    <div className="space-y-2">
                      <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase">{viewingItem.name}</h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Barangay Captain: <span className="text-gray-800 font-black">{viewingItem.captain || 'Unspecified'}</span></p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 border border-gray-100 rounded-2xl bg-gray-50/50 space-y-1">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Total Population</span>
                        <span className="font-bold text-gray-800">{viewingItem.population ? Number(viewingItem.population).toLocaleString() : 'N/A'}</span>
                      </div>
                      <div className="p-4 border border-gray-100 rounded-2xl bg-gray-50/50 space-y-1">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Contact Number</span>
                        <span className="font-bold text-gray-800">{viewingItem.contact_number || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 border border-gray-100 rounded-2xl bg-gray-50/50 space-y-1">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Office Hours</span>
                        <span className="font-bold text-gray-800">{viewingItem.office_hours || 'N/A'}</span>
                      </div>
                      <div className="p-4 border border-gray-100 rounded-2xl bg-gray-50/50 space-y-1">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Office Address</span>
                        <span className="font-bold text-gray-800">{viewingItem.office_address || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {viewingTab === 'services' && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase">{viewingItem.name}</h3>
                      <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">Processing Time: {viewingItem.processing_time || 'Immediate'}</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Service Overview</h4>
                      <p className="text-gray-600 leading-relaxed font-bold bg-gray-50 p-4 rounded-2xl border border-gray-100">{viewingItem.description}</p>
                    </div>

                    {viewingItem.downloadable_forms && viewingItem.downloadable_forms.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Downloadable Forms</h4>
                        <div className="space-y-2">
                          {viewingItem.downloadable_forms.map((form: any, idx: number) => (
                            <a
                              key={idx}
                              href={form.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex justify-between items-center bg-gray-50 hover:bg-gray-100 border border-gray-100 px-4 py-3 rounded-xl transition-all"
                            >
                              <span className="font-bold text-indigo-600">{form.title}</span>
                              <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest">Get Form</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {viewingTab === 'charter' && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase">{viewingItem.service_name}</h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Responsible Office: <span className="text-gray-800 font-black">{viewingItem.office}</span></p>
                    </div>

                    {viewingItem.steps && viewingItem.steps.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Step-by-step Procedures</h4>
                        <div className="space-y-3 relative before:absolute before:left-6 before:top-4 before:bottom-4 before:w-0.5 before:bg-blue-100">
                          {viewingItem.steps.map((st: any, idx: number) => (
                            <div key={idx} className="flex gap-4 relative">
                              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs z-10 shrink-0 border-2 border-white">
                                {st.stepNumber || idx + 1}
                              </div>
                              <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl flex-grow space-y-1">
                                <h5 className="font-black text-gray-900 text-xs">{st.activity}</h5>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Client Step: {st.clientSteps}</p>
                                <p className="text-[10px] text-blue-600 font-black uppercase tracking-wider">Duration: {st.duration} • Responsible: {st.officeResponsible}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// COMPONENT: SIDEBAR BUTTON
interface SidebarBtnProps {
  id: string;
  label: string;
  icon: React.ElementType;
  active: string;
  onClick: (val: any) => void;
  visible?: boolean;
  collapsed?: boolean;
}
const SidebarBtn: React.FC<SidebarBtnProps> = ({ id, label, icon: Icon, active, onClick, visible = true, collapsed = false }) => {
  if (!visible) return null;
  const isSelected = active === id;
  return (
    <button
      onClick={() => onClick(id)}
      className={`w-full px-3 py-2.5 rounded-xl font-bold text-[10.5px] uppercase tracking-wider flex items-center transition-all text-left relative group ${
        collapsed ? 'justify-center lg:px-0' : 'gap-2.5'
      } ${
        isSelected
          ? 'bg-blue-600 text-white shadow-2xs font-extrabold'
          : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
      }`}
    >
      <Icon size={14} className={isSelected ? "text-white" : "text-slate-400 group-hover:text-slate-700 transition-colors"} />
      <span className={`transition-opacity duration-300 ${collapsed ? 'lg:hidden' : 'block'}`}>
        {label}
      </span>
      {collapsed && (
        <div className="hidden lg:group-hover:block absolute left-full ml-2.5 px-2.5 py-1 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg whitespace-nowrap z-50 shadow-md">
          {label}
        </div>
      )}
    </button>
  );
};

// COMPONENT: DASHBOARD STAT BOX
interface StatBoxProps {
  count: number;
  label: string;
  icon: React.ElementType;
  color: string;
}
const StatBox: React.FC<StatBoxProps> = ({ count, label, icon: Icon, color }) => {
  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className="border border-slate-200/80 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between bg-white overflow-hidden relative group"
    >
      <div className="space-y-1 relative z-10">
        <span className="text-2xl font-black text-slate-900 block tracking-tight font-display">{count}</span>
        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">{label}</span>
      </div>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 relative z-10 ${color}`}>
        <Icon size={18} />
      </div>
    </motion.div>
  );
};

// COMPONENT: SUBMIT ACTION BUTTON
const SubmitBtn: React.FC<{ label: string; isLoading: boolean }> = ({ label, isLoading }) => {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-500/15 uppercase sticky bottom-0"
    >
      {isLoading ? <LoaderSpin /> : label}
    </button>
  );
};

// COMPONENT: TABLE EMPTY DATA ROW
const NoDataRow: React.FC<{ colSpan: number }> = ({ colSpan }) => {
  return (
    <tr>
      <td colSpan={colSpan} className="text-center py-16">
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
            <Search size={20} />
          </div>
          <div>
            <p className="text-xs font-black text-gray-900 uppercase tracking-wider">No Records Found</p>
            <p className="text-[10px] text-gray-400 font-bold mt-1">Try adjusting your filters or search keywords.</p>
          </div>
        </div>
      </td>
    </tr>
  );
};

// COMPONENT: TABLE LOADING SKELETON
const TableSkeleton: React.FC<{ cols: number }> = ({ cols }) => {
  return (
    <>
      {[1, 2, 3, 4].map((rowIdx) => (
        <tr key={rowIdx} className="animate-pulse border-b border-gray-50">
          {Array.from({ length: cols }).map((_, colIdx) => (
            <td key={colIdx} className="px-6 py-4">
              <div className="h-4 bg-gray-100 rounded-md w-full" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

// COMPONENT: ROTATIONAL SPINNING LOADER
const LoaderSpin = () => <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />;

// COMPONENT: TABLE PAGINATION CONTROLS
const Pagination: React.FC<{
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-4">
      <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
        Showing Page {currentPage} of {totalPages}
      </span>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2.5 text-[9px] font-black uppercase tracking-widest bg-white border border-gray-100 text-gray-500 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-all shadow-xs flex items-center justify-center min-w-16 cursor-pointer"
        >
          Prev
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2.5 text-[9px] font-black uppercase tracking-widest bg-white border border-gray-100 text-gray-500 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-all shadow-xs flex items-center justify-center min-w-16 cursor-pointer"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
