"use client";
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useLocale } from '@/context/LocaleContext';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Download, Plus, Eye, Edit, MoreVertical, Clock, Star, PlayCircle, CheckCircle, Check, AlertCircle, AlertOctagon, MessageCircle, PhoneCall, UserCheck, FileText, X, Banknote, FileSearch, UserX, Zap, Timer, Mail, MessageSquare, BarChart3, Shield, Target, ArrowUpRight, Activity, ChevronDown, Calendar } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, doc, getDoc, serverTimestamp, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { db } from '@/lib/firebase';

// Grievance type definition (minimal fields used in this page)
type Grievance = {
  id: string;
  beneficiaryId?: string;
  beneficiaryName: string;
  phone?: string;
  email?: string;
  district?: string;
  state?: string;
  actType?: string;
  applicationId?: string;
  category?: string;
  subCategory?: string;
  priority?: string;
  status?: string;
  assignedTo?: string;
  assignedDate?: string;
  createdDate?: string | null;
  lastUpdated?: string;
  resolutionDate?: string | null;
  expectedResolution?: string;
  description?: string;
  attachments?: number;
  communication?: any[];
  escalationLevel?: number;
  satisfactionRating?: number | null;
  followUpRequired?: boolean;
  relatedGrievances?: string[];
};

// Feedback type definition
type Feedback = {
  id: string;
  userId: string;
  subject: string;
  message: string;
  rating: number; // 1-5 stars
  status: 'open' | 'in-review' | 'resolved';
  createdAt: any;
  updatedAt: any;
};

// Firestore-backed grievances: hook-like function to subscribe and set state
const useFirestoreGrievances = (setState: React.Dispatch<React.SetStateAction<Grievance[]>>) => {
  useEffect(() => {
    const q = query(collection(db, 'grievances'), orderBy('createdDate', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const items: Grievance[] = snapshot.docs.map((d) => {
        const data = d.data() as any;
        const toIso = (v: any) => v && typeof v.toDate === 'function' ? v.toDate().toISOString() : (v ? String(v) : null);
        const created = toIso(data?.createdDate);
        const lastUpdated = toIso(data?.lastUpdated);
        const resolutionDate = toIso(data?.resolutionDate);
        const expectedResolution = toIso(data?.expectedResolution);
        return {
          id: d.id,
          beneficiaryName: data.beneficiaryName || data.name || '—',
          beneficiaryId: data.beneficiaryId,
          phone: data.phone,
          email: data.email,
          district: data.district,
          state: data.state,
          actType: data.actType,
          applicationId: data.applicationId,
          category: data.category,
          subCategory: data.subCategory,
          priority: data.priority,
          status: data.status,
          assignedTo: data.assignedTo,
          assignedDate: data.assignedDate,
          createdDate: created,
          lastUpdated: lastUpdated,
          resolutionDate: resolutionDate,
          expectedResolution: expectedResolution,
          description: data.description,
          attachments: data.attachments || 0,
          communication: data.communication || [],
          escalationLevel: data.escalationLevel || 0,
          satisfactionRating: data.satisfactionRating ?? null,
          followUpRequired: data.followUpRequired || false,
          relatedGrievances: data.relatedGrievances || []
        };
      });
      setState(items);
    });
    return () => unsub();
  }, [setState]);
};

// New Grievance Form (client-side modal)
const NewGrievanceForm = ({ onClose, onCreated, initialData }: { onClose: () => void; onCreated?: (g: Grievance) => void; initialData?: Grievance | null }) => {
  const { theme } = useTheme();
  const { t } = useLocale();
  const [beneficiaryId, setBeneficiaryId] = useState('');
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('disbursement-delay');
  const [subCategory, setSubCategory] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    { value: 'disbursement-delay', label: 'Disbursement Delay' },
    { value: 'document-issues', label: 'Document Issues' },
    { value: 'application-status', label: 'Application Status' },
    { value: 'officer-behavior', label: 'Officer Behavior' },
    { value: 'information-correction', label: 'Information Correction' },
    { value: 'technical-issues', label: 'Technical Issues' }
  ];

  const handleLookupBeneficiary = async (id: string) => {
    setBeneficiaryName('');
    if (!id) return;
    try {
      const snap = await getDoc(doc(db, 'beneficiaries', id));
      if (snap.exists()) {
        const data = snap.data() as any;
        setBeneficiaryName(data.name || '');
        setPhone(data.phone || '');
        setEmail(data.email || '');
        setError(null);
      } else {
        setError(t('extracted.beneficiary_not_found') || 'Beneficiary not found');
      }
    } catch (err) {
      console.error('Lookup beneficiary error', err);
      setError(t('extracted.lookup_failed') || 'Lookup failed');
    }
  };

  // Prefill when editing
  useEffect(() => {
    if (!initialData) return;
    setBeneficiaryId(initialData.beneficiaryId || '');
    setBeneficiaryName(initialData.beneficiaryName || '');
    setPhone(initialData.phone || '');
    setEmail(initialData.email || '');
    setCategory(initialData.category || 'disbursement-delay');
    setSubCategory(initialData.subCategory || '');
    setPriority((initialData.priority as any) || 'medium');
    setDescription(initialData.description || '');
  }, [initialData]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    if (!beneficiaryId) return setError(t('extracted.enter_beneficiary_id') || 'Enter a beneficiary ID');
    setIsSubmitting(true);
    try {
      // validate beneficiary exists
      const snap = await getDoc(doc(db, 'beneficiaries', beneficiaryId));
      if (!snap.exists()) {
        setError(t('extracted.beneficiary_not_found') || 'Beneficiary not found');
        setIsSubmitting(false);
        return;
      }

      const base: any = {
        beneficiaryId,
        beneficiaryName: beneficiaryName || (snap.data() as any).name || '',
        phone: phone || (snap.data() as any).phone || null,
        email: email || (snap.data() as any).email || null,
        category,
        subCategory: subCategory || null,
        priority,
        description: description || null,
        status: initialData ? (initialData.status || 'open') : 'open',
        lastUpdated: serverTimestamp(),
        attachments: initialData ? (initialData.attachments || 0) : 0,
        communication: initialData ? (initialData.communication || []) : [],
        escalationLevel: initialData ? (initialData.escalationLevel || 0) : 0,
        followUpRequired: initialData ? (initialData.followUpRequired || false) : false
      };

      if (initialData && initialData.id) {
        // update existing grievance
        await updateDoc(doc(db, 'grievances', initialData.id), { ...base, lastUpdated: serverTimestamp() });
        const updated: Grievance = { ...initialData, ...base, lastUpdated: new Date().toISOString() } as Grievance;
        onCreated?.(updated);
        onClose();
      } else {
        // create with deterministic id: GRV-<timestamp>
        const newId = `GRV-${Date.now()}`;
        const payload = { ...base, createdDate: serverTimestamp() };
        await setDoc(doc(db, 'grievances', newId), payload);
        const created: Grievance = {
          id: newId,
          beneficiaryId: payload.beneficiaryId,
          beneficiaryName: payload.beneficiaryName,
          phone: payload.phone,
          email: payload.email,
          category: payload.category,
          subCategory: payload.subCategory,
          priority: payload.priority,
          description: payload.description,
          status: payload.status,
          attachments: payload.attachments || 0,
          communication: payload.communication || [],
          escalationLevel: payload.escalationLevel || 0,
          followUpRequired: payload.followUpRequired || false,
          createdDate: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        };

        onCreated?.(created);
        onClose();
      }
    } catch (err) {
      console.error('Create grievance failed', err);
      setError(t('extracted.create_failed') || 'Failed to create grievance');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
        

        <div className="md:col-span-2">
          <label className="text-sm font-medium theme-text-muted block mb-2">{t('extracted.beneficiary_id') || 'Beneficiary ID'}</label>
          <input placeholder={t('extracted.beneficiary_id') || 'Beneficiary ID'} value={beneficiaryId} onChange={(e) => setBeneficiaryId(e.target.value)} onBlur={() => handleLookupBeneficiary(beneficiaryId)} className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30" required />
          {beneficiaryName && <p className="text-xs theme-text-muted mt-1">{beneficiaryName}</p>}
        </div>

        <div>
          <label className="text-sm font-medium theme-text-muted block mb-2">{t('extracted.phone_number') || 'Phone Number'}</label>
          <input placeholder={t('extracted.phone_number') || 'Phone Number'} value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30" />
        </div>

        <div>
          <label className="text-sm font-medium theme-text-muted block mb-2">{t('extracted.email') || 'Email'}</label>
          <input placeholder={t('extracted.email') || 'Email'} value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30" />
        </div>

        <div>
          <label className="text-sm font-medium theme-text-muted block mb-2">{t('extracted.category_1') || 'Category'}</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={`w-full px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30 ${theme === 'light' ? 'bg-white text-gray-800 border' : 'bg-[#0b1220] text-slate-100 border border-gray-700'}`}>
            {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="text-sm font-medium theme-text-muted block mb-2">{t('extracted.sub_category') || 'Sub-category'}</label>
          <input placeholder={t('extracted.sub_category') || 'Sub-category'} value={subCategory} onChange={(e) => setSubCategory(e.target.value)} className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30" />
        </div>

        <div className="md:col-span-2">
          <label className="text-sm font-medium theme-text-muted block mb-2">{t('extracted.description') || 'Description'}</label>
          <textarea placeholder={t('extracted.description') || 'Description'} value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30" />
        </div>
      </div>

      {error && <div className="text-sm text-red-500">{error}</div>}

      <div className="flex items-center justify-end gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-cancel">{t('extracted.cancel')}</button>
        <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-lg accent-gradient text-white font-semibold shadow">
          {isSubmitting ? (t('extracted.saving') || 'Saving...') : (initialData ? (t('extracted.save') || 'Save') : (t('extracted.create') || 'Create'))}
        </button>
      </div>
    </form>
  );
};


const GrievancePage = () => {
  const { theme } = useTheme();
  const { t } = useLocale();
  const { user, profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter] = useState('all');
  const [categoryFilter] = useState('all');
  const [priorityFilter] = useState('all');
  const [actTypeFilter] = useState('all');
  const [assignedToFilter] = useState('all');
  const [sortBy] = useState('createdDate');
  const [sortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);
  const [showNewCaseModal, setShowNewCaseModal] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'dashboard' | 'list'>('dashboard');
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [newMessage, setNewMessage] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [pendingMessages, setPendingMessages] = useState<any[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  // Feedback state
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [feedbackSortBy, setFeedbackSortBy] = useState<'rating' | 'createdAt'>('createdAt');
  const [feedbackSortOrder, setFeedbackSortOrder] = useState<'asc' | 'desc'>('desc');

  // subscribe to Firestore grievances collection
  useFirestoreGrievances(setGrievances);

  // Subscribe to Firestore feedback collection
  useEffect(() => {
    // Only subscribe if user is authenticated and has officer role
    if (!user || profile?.role !== 'officer') {
      return;
    }

    const q = query(collection(db, 'feedbacks'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const items: Feedback[] = snapshot.docs.map((d) => {
        const data = d.data() as any;
        return {
          id: d.id,
          userId: data.userId,
          subject: data.subject,
          message: data.message,
          rating: data.rating,
          status: data.status,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        };
      });
      setFeedbacks(items);
    }, (error) => {
      console.error('Error fetching feedback:', error);
    });
    return () => unsub();
  }, [user, profile]);

  // Filter and sort grievances (same logic as before)
  const filteredGrievances = useMemo(() => {
    let filtered = [...grievances];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(grievance =>
        (grievance.beneficiaryName || '').toLowerCase().includes(q) ||
        (grievance.id || '').toLowerCase().includes(q) ||
        (grievance.district || '').toLowerCase().includes(q) ||
        (grievance.applicationId || '').toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') filtered = filtered.filter(g => g.status === statusFilter);
    if (categoryFilter !== 'all') filtered = filtered.filter(g => g.category === categoryFilter);
    if (priorityFilter !== 'all') filtered = filtered.filter(g => g.priority === priorityFilter);
    if (actTypeFilter !== 'all') filtered = filtered.filter(g => g.actType === actTypeFilter);
    if (assignedToFilter !== 'all') filtered = filtered.filter(g => g.assignedTo === assignedToFilter);
    
    filtered.sort((a, b) => {
      const getVal = (obj: Record<string, unknown>, key: string) => {
        const val = obj[key as keyof typeof obj];
        if (val === null || val === undefined) return '';
        if (typeof val === 'string') {
          const ts = Date.parse(val);
          if (!Number.isNaN(ts)) return ts;
          return val.toLowerCase();
        }
        return val as unknown as number | string;
      };
      const aVal = getVal(a, sortBy);
      const bVal = getVal(b, sortBy);
      if (aVal === bVal) return 0;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      const aStr = String(aVal);
      const bStr = String(bVal);
      return sortOrder === 'asc' ? (aStr > bStr ? 1 : -1) : (aStr < bStr ? 1 : -1);
    });
    return filtered;
  }, [grievances, searchQuery, statusFilter, categoryFilter, priorityFilter, actTypeFilter, assignedToFilter, sortBy, sortOrder]);

  // Sort feedbacks
  const sortedFeedbacks = useMemo(() => {
    const sorted = [...feedbacks];
    sorted.sort((a, b) => {
      if (feedbackSortBy === 'rating') {
        const aRating = a.rating;
        const bRating = b.rating;
        return feedbackSortOrder === 'asc' ? aRating - bRating : bRating - aRating;
      } else if (feedbackSortBy === 'createdAt') {
        const aDate = a.createdAt?.toDate?.()?.getTime() || 0;
        const bDate = b.createdAt?.toDate?.()?.getTime() || 0;
        return feedbackSortOrder === 'asc' ? aDate - bDate : bDate - aDate;
      }
      return 0;
    });
    return sorted;
  }, [feedbacks, feedbackSortBy, feedbackSortOrder]);

  // Pagination
  const paginatedGrievances = filteredGrievances.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Statistics
  const stats = useMemo(() => {
    const total = grievances.length;
    const resolved = grievances.filter(g => g.status === 'resolved' || g.status === 'closed').length;
    const inProgress = grievances.filter(g => g.status === 'in-progress').length;
    const escalated = grievances.filter(g => g.status === 'escalated').length;
    const avgResolutionTime = 5.2;
    const satisfiedCount = grievances.filter(g => g.satisfactionRating && g.satisfactionRating >= 4).length;
    const satisfactionRate = resolved > 0 ? Math.round((satisfiedCount / resolved) * 100) : 0;

    return {
      total,
      open: grievances.filter(g => g.status === 'open').length,
      inProgress,
      resolved,
      escalated,
      closed: grievances.filter(g => g.status === 'closed').length,
      pending: grievances.filter(g => g.status === 'pending').length,
      avgResolutionTime,
      satisfactionRate,
      highPriority: grievances.filter(g => g.priority === 'high').length
    };
  }, [grievances]);

  // Category distribution
  const categoryStats = useMemo(() => {
    return {
      'disbursement-delay': grievances.filter(g => g.category === 'disbursement-delay').length,
      'document-issues': grievances.filter(g => g.category === 'document-issues').length,
      'application-status': grievances.filter(g => g.category === 'application-status').length,
      'officer-behavior': grievances.filter(g => g.category === 'officer-behavior').length,
      'information-correction': grievances.filter(g => g.category === 'information-correction').length,
      'technical-issues': grievances.filter(g => g.category === 'technical-issues').length
    };
  }, [grievances]);

  // Mobile detection
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      const matches = 'matches' in e ? e.matches : mq.matches;
      setIsMobile(matches);
    };
    handler(mq);
    mq.addEventListener('change', handler as EventListener);
    return () => mq.removeEventListener('change', handler as EventListener);
  }, []);

  // Auto-scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatRef.current && activeTab === 'communication') {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [selectedGrievance?.communication, pendingMessages, activeTab]);

  // Three.js background
  useEffect(() => {
    if (!canvasRef.current) return;
    let cancelled = false;

    (async () => {
      const THREE = await import('three');
      if (cancelled) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current!, alpha: true, antialias: true });

      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      camera.position.z = 5;

      const particleColor = theme === 'dark' ? 0x3b82f6 : 0x1e40af;
      const lineColor = theme === 'dark' ? 0xf59e0b : 0xd97706;

      const particlesGeometry = new THREE.BufferGeometry();
      const particlesCount = 800;
      const posArray = new Float32Array(particlesCount * 3);

      for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 15;
      }

      particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

      const particlesMaterial = new THREE.PointsMaterial({
        size: theme === 'dark' ? 0.015 : 0.01,
        color: particleColor,
        transparent: true,
        opacity: theme === 'dark' ? 0.4 : 0.3,
      });

      const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
      scene.add(particlesMesh);

      const linesGeometry = new THREE.BufferGeometry();
      const linesMaterial = new THREE.LineBasicMaterial({ 
        color: lineColor, 
        transparent: true, 
        opacity: theme === 'dark' ? 0.1 : 0.08 
      });

      const linesPositions: number[] = [];
      for (let i = 0; i < 60; i++) {
        const x1 = (Math.random() - 0.5) * 12;
        const y1 = (Math.random() - 0.5) * 12;
        const z1 = (Math.random() - 0.5) * 12;
        const x2 = x1 + (Math.random() - 0.5) * 2;
        const y2 = y1 + (Math.random() - 0.5) * 2;
        const z2 = z1 + (Math.random() - 0.5) * 2;
        linesPositions.push(x1, y1, z1, x2, y2, z2);
      }

      linesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linesPositions, 3));
      const linesMesh = new THREE.LineSegments(linesGeometry, linesMaterial);
      scene.add(linesMesh);

      let animationId: number;
      const animate = () => {
        animationId = requestAnimationFrame(animate);
        particlesMesh.rotation.y += 0.0002;
        particlesMesh.rotation.x += 0.0001;
        linesMesh.rotation.y -= 0.00015;
        renderer.render(scene, camera);
      };

      animate();

      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };

      window.addEventListener('resize', handleResize);

      return () => {
        cancelled = true;
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationId);
        renderer.dispose();
      };
    })();
  }, [theme]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [selectedGrievance?.communication, pendingMessages]);

  const getStatusColor = (status?: string) => {
    const colors = {
      resolved: theme === 'dark' ? 'text-green-300 bg-green-900/30' : 'text-green-700 bg-green-100',
      closed: theme === 'dark' ? 'text-emerald-300 bg-emerald-900/30' : 'text-emerald-700 bg-emerald-100',
      'in-progress': theme === 'dark' ? 'text-blue-300 bg-blue-900/30' : 'text-blue-700 bg-blue-100',
      open: theme === 'dark' ? 'text-amber-300 bg-amber-900/30' : 'text-amber-700 bg-amber-100',
      pending: theme === 'dark' ? 'text-yellow-300 bg-yellow-900/30' : 'text-yellow-700 bg-yellow-100',
      escalated: theme === 'dark' ? 'text-red-300 bg-red-900/30' : 'text-red-700 bg-red-100'
    };
    const key = (status || '').toLowerCase() as keyof typeof colors;
    return colors[key] || 'text-gray-300 bg-gray-800';
  };

  const getPriorityColor = (priority?: string) => {
    const colors = {
      high: theme === 'dark' ? 'text-red-300 bg-red-900/30' : 'text-red-700 bg-red-100',
      medium: theme === 'dark' ? 'text-amber-300 bg-amber-900/30' : 'text-amber-700 bg-amber-100',
      low: theme === 'dark' ? 'text-green-300 bg-green-900/30' : 'text-green-700 bg-green-100'
    };
    const key = (priority || '').toLowerCase() as keyof typeof colors;
    return colors[key] || 'text-gray-300 bg-gray-800';
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      'disbursement-delay': Banknote,
      'document-issues': FileText,
      'application-status': FileSearch,
      'officer-behavior': UserX,
      'information-correction': Edit,
      'technical-issues': Zap
    };
    return icons[category as keyof typeof icons] || AlertCircle;
  };

  const statuses = ['open', 'in-progress', 'pending', 'resolved', 'closed', 'escalated'];

  const updateGrievanceStatus = async (id: string, status: string) => {
    try {
      setStatusUpdating(id);
      await updateDoc(doc(db, 'grievances', id), { status, lastUpdated: serverTimestamp() });
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setStatusUpdating(null);
    }
  };

  const sendMessage = async () => {
    if (!selectedGrievance?.id) return;
    const text = newMessage.trim();
    if (!text) return;
    const pendingMessage = { user: 'Officer', text, createdAt: new Date().toISOString(), type: 'officer', pending: true };
    setPendingMessages(prev => [...prev, pendingMessage]);
    setNewMessage('');
    try {
      await updateDoc(doc(db, 'grievances', selectedGrievance.id), {
        communication: arrayUnion({ user: 'Officer', text, createdAt: new Date().toISOString(), type: 'officer' }),
        lastUpdated: serverTimestamp()
      });
      setPendingMessages(prev => prev.filter(msg => msg !== pendingMessage));
    } catch (err) {
      console.error('Failed to send message', err);
      setPendingMessages(prev => prev.filter(msg => msg !== pendingMessage));
    }
  };

  const resolveCase = async () => {
    if (!selectedGrievance?.id) return;
    const id = selectedGrievance.id;
    try {
      await updateGrievanceStatus(id, 'closed');
      // Optimistically update selectedGrievance so UI reflects resolved state immediately
      setSelectedGrievance(prev => prev ? { ...prev, status: 'closed', lastUpdated: new Date().toISOString() } : prev);
    } catch (err) {
      console.error('Failed to resolve case', err);
    }
  };

  // Export utilities (CSV + PDF) for grievances
  const exportGrievancesData = (items: Grievance[]) => {
    const headers = [
      'Grievance ID',
      'Beneficiary Name',
      'Beneficiary ID',
      'Phone',
      'Email',
      'District',
      'State',
      'Category',
      'Sub-category',
      'Priority',
      'Status',
      'Assigned To',
      'Created Date',
      'Last Updated',
      'Attachments',
      'Messages Count'
    ];

    const rows = items.map(g => [
      g.id,
      g.beneficiaryName,
      g.beneficiaryId || '',
      g.phone || '',
      g.email || '',
      g.district || '',
      g.state || '',
      g.category || '',
      g.subCategory || '',
      g.priority || '',
      g.status || '',
      g.assignedTo || '',
      g.createdDate || '',
      g.lastUpdated || '',
      String(g.attachments ?? 0),
      String((g.communication || []).length)
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${(field ?? '')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `grievances_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportGrievancesPDF = (items: Grievance[]) => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'landscape' });
    const margin = 36;
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFillColor(30, 64, 175);
    doc.rect(0, 0, pageWidth, 56, 'F');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('Grievances Report', margin, 36);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })}`, pageWidth - margin, 28, { align: 'right' });
    doc.text(`Total: ${items.length}`, pageWidth - margin, 44, { align: 'right' });

    const head = [[
      'Grievance ID', 'Beneficiary', 'District', 'Category', 'Priority', 'Status', 'Assigned', 'Messages'
    ]];

    const body: any[] = [];
    items.forEach(g => {
      const beneficiaryCell = `${g.beneficiaryName || ''}\n${g.phone || ''}`;
      body.push([
        g.id,
        beneficiaryCell,
        `${g.district || ''}${g.state ? ', ' + g.state : ''}`,
        g.category || '',
        g.priority || '',
        (g.status || '').toString().replace('-', ' '),
        g.assignedTo || '',
        String((g.communication || []).length)
      ]);
    });

    autoTable(doc, {
      head,
      body,
      startY: 70,
      styles: { fontSize: 9, cellPadding: 6, overflow: 'linebreak', cellWidth: 'wrap' },
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [250, 250, 251] },
      margin: { left: margin, right: margin, top: 70 },
      tableWidth: 'auto',
      columnStyles: {
        0: { cellWidth: 90 },
        1: { cellWidth: 160 },
        2: { cellWidth: 100 },
        3: { cellWidth: 100 },
        4: { cellWidth: 60 },
        5: { cellWidth: 80 },
        6: { cellWidth: 100 },
        7: { cellWidth: 50 }
      }
    });

    doc.save(`grievances_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };


 

 

  return (
    <div data-theme={theme} className="min-h-screen p-4 lg:p-6 space-y-6 relative overflow-hidden">
      {/* Three.js Canvas Background */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none -z-10"
      />

      {/* Custom Theme Styles */}
      <style jsx global>{`
        [data-theme="dark"] {
          --bg-gradient: radial-gradient(1200px 600px at 10% 10%, rgba(30, 64, 175, 0.08), transparent 8%), 
                         radial-gradient(900px 500px at 90% 90%, rgba(245, 158, 11, 0.06), transparent 8%), 
                         linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%);
          --card-bg: rgba(15, 23, 42, 0.8);
          --card-border: rgba(255, 255, 255, 0.1);
          --nav-bg: rgba(15, 23, 42, 0.95);
          --text-primary: #f1f5f9;
          --text-secondary: #94a3b8;
          --text-muted: #64748b;
          --accent-primary: #06b6d4;
          --accent-secondary: #8b5cf6;
          --glass-bg: rgba(15, 23, 42, 0.6);
          --glass-border: rgba(255, 255, 255, 0.1);
        }

        [data-theme="light"] {
          --bg-gradient: radial-gradient(1200px 600px at 10% 10%, rgba(59, 130, 246, 0.08), transparent 8%), 
                         radial-gradient(900px 500px at 90% 90%, rgba(245, 158, 11, 0.06), transparent 8%), 
                         linear-gradient(180deg, #f8fafc 0%, #f0f9ff 100%);
          --card-bg: rgba(255, 255, 255, 0.9);
          --card-border: rgba(0, 0, 0, 0.08);
          --nav-bg: rgba(255, 255, 255, 0.95);
          --text-primary: #0f172a;
          --text-secondary: #475569;
          --text-muted: #64748b;
          --accent-primary: #fb7185;
          --accent-secondary: #fb923c;
          --glass-bg: rgba(255, 255, 255, 0.7);
          --glass-border: rgba(0, 0, 0, 0.08);
        }

        .theme-text-primary { color: var(--text-primary) !important; }
        .theme-text-secondary { color: var(--text-secondary) !important; }
        .theme-text-muted { color: var(--text-muted) !important; }
        .theme-bg-card { background: var(--card-bg) !important; }
        .theme-border-card { border-color: var(--card-border) !important; }
        .theme-bg-glass { background: var(--glass-bg) !important; }
        .theme-border-glass { border-color: var(--glass-border) !important; }
        
        .accent-gradient {
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)) !important;
        }
        
        .text-accent-gradient {
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .glass-effect {
          backdrop-filter: blur(16px) saturate(180%);
          -webkit-backdrop-filter: blur(16px) saturate(180%);
        }
        .btn-cancel {
          background: transparent;
          border: 1px solid var(--glass-border);
          color: var(--text-muted);
          padding: 0.5rem 0.75rem;
          border-radius: 0.5rem;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }
        [data-theme="light"] .btn-cancel:hover {
          background: rgba(0,0,0,0.04);
        }
        [data-theme="dark"] .btn-cancel:hover {
          background: rgba(255,255,255,0.03);
        }
        .action-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1rem;
          border-radius: 0.75rem;
          border: 1px solid var(--glass-border);
          background: var(--glass-bg);
          color: var(--text-primary);
          font-weight: 600;
        }
        .action-btn svg { color: inherit; }
        [data-theme="light"] .action-btn:hover { background: rgba(0,0,0,0.04); }
        [data-theme="dark"] .action-btn:hover { background: rgba(255,255,255,0.02); }

        .action-btn-accent {
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          border-color: transparent;
          color: white;
        }
        .action-btn-accent svg { color: rgba(255,255,255,0.95); }
      `}</style>

      {/* Header Section - Real-time Monitoring */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 p-6 rounded-2xl theme-bg-card theme-border-glass border backdrop-blur-xl overflow-hidden"
      >
        {/* Animated gradient background */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
        />
        
        <div className="relative z-10 text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
            <motion.div
              className="w-3 h-3 rounded-full bg-purple-500"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [1, 0.8, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-sm font-medium theme-text-secondary">
              {t('extracted.live_tracking')} • {filteredGrievances.length} {t('extracted.active_grievances')}
            </span>
          </div>
          <h1 className="text-3xl font-bold theme-text-primary mb-2">
            {t('extracted.grievance')} <span className="text-accent-gradient inline-block leading-normal ml-2">{t('extracted.monitoring_center')}</span>
          </h1>
          <p className="theme-text-secondary max-w-2xl mx-auto lg:mx-0">{t('extracted.realtime_grievance_tracking_description')}</p>
        </div>
        
        <div className="relative z-10 flex items-center justify-center lg:justify-end gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowExportModal(true)}
            aria-label={t('extracted.export_data_1')}
            className={`px-6 py-3 rounded-xl border flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-offset-1 ${theme === 'light' ? 'bg-white text-gray-800 border-gray-200' : 'theme-bg-glass theme-border-glass'}`} 
          >
            <Download className={`w-5 h-5 ${theme === 'light' ? 'text-gray-800' : ''}`} />
            <span className="font-semibold">{t('extracted.export_data')} </span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowNewCaseModal(true)}
            className="px-6 py-3 rounded-xl accent-gradient text-white flex items-center gap-3 shadow-xl"
          >
            <Plus className="w-5 h-5" />
            <span className="font-semibold">{t('extracted.new_case')} </span>
          </motion.button>
        </div>
      </motion.div>

      {/* Inline New Case Section (appears above grid/table) */}
      {/* Export Modal */}
      <AnimatePresence>
        {showExportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-black/60" onClick={() => setShowExportModal(false)} />
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="relative w-full max-w-3xl mx-4 p-6 rounded-xl theme-border-glass border shadow-lg"
              style={{ background: theme === 'light' ? 'rgba(255,255,255,0.98)' : 'rgba(6,8,20,0.98)' }}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold theme-text-primary flex items-center gap-3">
                    <Download className="w-5 h-5 text-accent-gradient" />
                    {t('extracted.export') || 'Export Data'}
                  </h3>
                  <p className="text-sm theme-text-muted mt-1">{t('extracted.exportDescription') || 'Export grievances as CSV or a printable PDF report.'}</p>
                </div>
                <button onClick={() => setShowExportModal(false)} aria-label="Close export modal" className="p-2 rounded-md theme-bg-glass hover:bg-red-500/10 transition-colors">
                  <X className="w-5 h-5 theme-text-primary" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className={`rounded-lg p-4 border ${theme === 'light' ? 'bg-white' : 'bg-gray-900/90'}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold theme-text-primary">{t('extracted.exportAll') || 'Export All'}</h4>
                          <p className="text-xs theme-text-muted">{t('extracted.exportAllDescription') || 'Download the full grievances dataset in the chosen format.'}</p>
                        </div>
                      </div>
                      <p className="text-sm theme-text-muted">{grievances.length} {t('extracted.grievances') || 'grievances'}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button onClick={() => { exportGrievancesData(grievances); setShowExportModal(false); }} className="px-4 py-2 rounded-lg border theme-border-glass text-sm hover:shadow-sm theme-bg-glass theme-text-primary">CSV</button>
                      <button onClick={() => { exportGrievancesPDF(grievances); setShowExportModal(false); }} className="px-4 py-2 rounded-lg text-sm accent-gradient text-white shadow">PDF</button>
                    </div>
                  </div>
                </div>

                <div className={`rounded-lg p-4 border ${theme === 'light' ? 'bg-white' : 'bg-gray-900/90'}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-md bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white">
                          <Download className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold theme-text-primary">{t('extracted.exportFiltered') || 'Export Filtered'}</h4>
                          <p className="text-xs theme-text-muted">{t('extracted.exportFilteredDescription') || 'Download only the results matching your current filters.'}</p>
                        </div>
                      </div>
                      <p className="text-sm theme-text-muted">{filteredGrievances.length} {t('extracted.grievances') || 'grievances'}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button disabled={filteredGrievances.length === 0} onClick={() => { exportGrievancesData(filteredGrievances); setShowExportModal(false); }} className="px-4 py-2 rounded-lg border theme-border-glass text-sm hover:shadow-sm theme-bg-glass theme-text-primary disabled:opacity-50 disabled:cursor-not-allowed">CSV</button>
                      <button disabled={filteredGrievances.length === 0} onClick={() => { exportGrievancesPDF(filteredGrievances); setShowExportModal(false); }} className="px-4 py-2 rounded-lg text-sm accent-gradient text-white shadow disabled:opacity-50">PDF</button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {showNewCaseModal && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="theme-bg-card theme-border-glass border rounded-xl p-4 mb-4"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-xl font-semibold theme-text-primary">{selectedGrievance ? (t('extracted.edit_case') || 'Edit Case') : (t('extracted.new_case') || 'New Case')}</h3>
              <p className="text-sm theme-text-muted">{selectedGrievance ? (t('extracted.edit_case_description') || 'Edit the grievance details and save changes.') : (t('extracted.new_case_description') || 'Create a new grievance and link it to a beneficiary.')}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowNewCaseModal(false)} className="btn-cancel text-sm">
                <X className="w-4 h-4 inline-block" /> <span>{t('extracted.cancel')}</span>
              </button>
            </div>
          </div>
          <NewGrievanceForm
            initialData={selectedGrievance}
            onClose={() => { setShowNewCaseModal(false); setSelectedGrievance(null); }}
            onCreated={(g) => { setSelectedGrievance(g); setShowNewCaseModal(false); }}
          />
        </motion.div>
      )}

      {/* Inline Grievance Detail Section (appears in-page for view/edit) - moved above grid/table */}
      {selectedGrievance && (
        <motion.section
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="theme-bg-card theme-border-glass border rounded-xl p-4 mb-4"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-16 h-16 rounded-2xl accent-gradient flex items-center justify-center text-white shadow-lg">
                <Shield className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold theme-text-primary">{selectedGrievance.id}</h2>
                  <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-sm font-bold rounded-full">
                    {selectedGrievance.priority ? `${selectedGrievance.priority.toUpperCase()} ${t('extracted.priority_tag')}` : '-'}
                  </span>
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  <p className="theme-text-muted text-lg">{selectedGrievance.beneficiaryName}</p>
                  <span className="text-sm theme-text-muted">•</span>
                  <p className="theme-text-muted">{selectedGrievance.actType}</p>
                  <span className="text-sm theme-text-muted">•</span>
                  <p className="theme-text-muted">{t('extracted.created')}: {selectedGrievance.createdDate ? new Date(selectedGrievance.createdDate).toLocaleDateString() : '—'}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setSelectedGrievance(null)} className="btn-cancel">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="border-b theme-border-glass mb-4">
            <div className="flex overflow-x-auto">
              {[
                { id: 'overview', labelKey: 'extracted.tab_overview', icon: Eye },
                { id: 'communication', labelKey: 'extracted.tab_communication', icon: MessageCircle },
                { id: 'timeline', labelKey: 'extracted.tab_timeline', icon: Clock },
                { id: 'documents', labelKey: 'extracted.tab_documents', icon: FileText },
                { id: 'analytics', labelKey: 'extracted.tab_analytics', icon: BarChart3 }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 theme-text-primary'
                      : 'border-transparent theme-text-muted hover:theme-text-primary hover:bg-theme-bg-glass'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {t((tab as any).labelKey)}
                </button>
              ))}
            </div>
          </div>

          <div className="p-2">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="p-4 rounded-lg theme-bg-glass theme-border-glass border">
                    <h4 className="text-sm font-semibold theme-text-primary">{t('extracted.beneficiary')}</h4>
                    <p className="text-sm theme-text-muted">{selectedGrievance.beneficiaryName || '—'}</p>
                    <p className="text-xs theme-text-muted mt-1">ID: {selectedGrievance.beneficiaryId || '—'}</p>
                  </div>

                  <div className="p-4 rounded-lg theme-bg-glass theme-border-glass border">
                    <h4 className="text-sm font-semibold theme-text-primary">{t('extracted.contact')}</h4>
                    <p className="text-sm theme-text-muted">{selectedGrievance.phone || '-'}</p>
                    <p className="text-sm theme-text-muted">{selectedGrievance.email || '-'}</p>
                  </div>

                  <div className="p-4 rounded-lg theme-bg-glass theme-border-glass border">
                    <h4 className="text-sm font-semibold theme-text-primary">{t('extracted.location')}</h4>
                    <p className="text-sm theme-text-muted">{selectedGrievance.district || '-'}, {selectedGrievance.state || '-'}</p>
                    <p className="text-xs theme-text-muted mt-1">{t('extracted.act')}: {selectedGrievance.actType || '-'}</p>
                  </div>

                  <div className="p-4 rounded-lg theme-bg-glass theme-border-glass border">
                    <h4 className="text-sm font-semibold theme-text-primary">{t('extracted.identification')}</h4>
                    <p className="text-sm theme-text-muted">{t('extracted.application_id')}: {selectedGrievance.applicationId || '—'}</p>
                    <p className="text-sm theme-text-muted">{t('extracted.grievance_id')}: {selectedGrievance.id}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-lg theme-bg-glass theme-border-glass border">
                    <h4 className="text-sm font-semibold theme-text-primary">{t('extracted.case_details')}</h4>
                    <p className="text-sm theme-text-muted"><strong>{t('extracted.category')}:</strong> {selectedGrievance.category || '-'}</p>
                    <p className="text-sm theme-text-muted"><strong>{t('extracted.sub_category')}:</strong> {selectedGrievance.subCategory || '-'}</p>
                    <p className="text-sm theme-text-muted"><strong>{t('extracted.priority')}:</strong> {selectedGrievance.priority ? selectedGrievance.priority.toUpperCase() : '-'}</p>
                    <p className="text-sm theme-text-muted"><strong>{t('extracted.status')}:</strong> {selectedGrievance.status || '-'}</p>
                    <p className="text-sm theme-text-muted"><strong>{t('extracted.assigned_to')}:</strong> {selectedGrievance.assignedTo || '-'}</p>
                  </div>

                  <div className="p-4 rounded-lg theme-bg-glass theme-border-glass border">
                    <h4 className="text-sm font-semibold theme-text-primary">{t('extracted.timestamps')}</h4>
                    <p className="text-sm theme-text-muted">{t('extracted.created')}: {selectedGrievance.createdDate ? new Date(selectedGrievance.createdDate).toLocaleString() : '—'}</p>
                    <p className="text-sm theme-text-muted">{t('extracted.last_updated')}: {selectedGrievance.lastUpdated ? new Date(selectedGrievance.lastUpdated).toLocaleString() : '—'}</p>
                    <p className="text-sm theme-text-muted">{t('extracted.expected_resolution')}: {selectedGrievance.expectedResolution ? new Date(selectedGrievance.expectedResolution).toLocaleString() : '—'}</p>
                    <p className="text-sm theme-text-muted">{t('extracted.resolution_date')}: {selectedGrievance.resolutionDate ? new Date(selectedGrievance.resolutionDate).toLocaleString() : '—'}</p>
                  </div>

                  <div className="p-4 rounded-lg theme-bg-glass theme-border-glass border">
                    <h4 className="text-sm font-semibold theme-text-primary">{t('extracted.attachments_communication')}</h4>
                    <p className="text-sm theme-text-muted">{t('extracted.attachments_label')}: {selectedGrievance.attachments ?? 0}</p>
                    <p className="text-sm theme-text-muted">{t('extracted.messages_label')}: {selectedGrievance.communication?.length ?? 0}</p>
                    {(selectedGrievance.communication?.length ?? 0) > 0 && (
                      <div className="mt-2 space-y-1">
                        {(selectedGrievance.communication ?? []).slice(0,3).map((c, i) => (
                          <div key={i} className="text-xs theme-text-muted">
                            <strong>{c.user || (t('extracted.user') || 'User')}:</strong> {String(c.text || c.message || c.body || '—')}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'communication' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <MessageCircle className="w-5 h-5 theme-text-primary" />
                  <h3 className="text-lg font-semibold theme-text-primary">{t('extracted.communication_history') || 'Communication History'}</h3>
                </div>

                <div
                  ref={chatRef}
                  className="max-h-96 overflow-y-auto p-4 space-y-4 border theme-border-glass rounded-xl theme-bg-glass scroll-smooth"
                >
                  {(selectedGrievance.communication ?? []).length === 0 && pendingMessages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="w-12 h-12 theme-text-muted mx-auto mb-3 opacity-50" />
                      <p className="theme-text-muted">{t('extracted.no_messages') || 'No messages yet'}</p>
                      <p className="text-sm theme-text-muted mt-1">{t('extracted.start_conversation') || 'Start a conversation with the beneficiary'}</p>
                    </div>
                  ) : (
                    <>
                      {(selectedGrievance.communication ?? []).map((c, i) => {
                        const isOfficer = c.type !== 'user';
                        return (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`flex items-start gap-3 ${isOfficer ? 'justify-end' : 'justify-start'}`}
                          >
                            {!isOfficer && (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                                {c.user?.charAt(0)?.toUpperCase() || 'U'}
                              </div>
                            )}
                            <div className={`max-w-xs lg:max-w-md ${isOfficer ? 'order-1' : 'order-2'}`}>
                              <div className={`p-3 rounded-2xl shadow-sm ${
                                isOfficer
                                  ? 'bg-gradient-to-r from-green-500/10 to-emerald-600/10 border border-green-500/20 rounded-tr-sm'
                                  : 'bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-tl-sm'
                              }`}>
                                <div className="flex items-center gap-2 mb-1">
                                  {!isOfficer && <Shield className="w-4 h-4 text-blue-500" />}
                                  <span className={`text-xs font-medium ${!isOfficer ? 'text-blue-600' : 'theme-text-muted'}`}>
                                    {!isOfficer ? (c.user || (t('extracted.user') || 'User')) : (t('extracted.officer') || 'Officer')}
                                  </span>
                                </div>
                                <p className={`text-sm ${!isOfficer ? 'text-blue-700' : 'theme-text-primary'}`}>
                                  {String(c.text || c.message || c.body || '')}
                                </p>
                                <p className={`text-xs mt-2 ${!isOfficer ? 'text-blue-500' : 'theme-text-muted'}`}>
                                  {c.createdAt ? (new Date(c.createdAt?.toDate ? c.createdAt.toDate() : c.createdAt).toLocaleString()) : ''}
                                </p>
                              </div>
                            </div>
                            {isOfficer && (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 order-2">
                                {c.user?.charAt(0)?.toUpperCase() || 'U'}
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                      {pendingMessages.map((c, i) => (
                        <motion.div
                          key={`pending-${i}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className="flex items-start gap-3 justify-end"
                        >
                          <div className="max-w-xs lg:max-w-md">
                            <div className="p-3 rounded-2xl shadow-sm bg-gradient-to-r from-green-500/10 to-emerald-600/10 border border-green-500/20 rounded-tr-sm opacity-70">
                              <div className="flex items-center gap-2 mb-1">
                                <Shield className="w-4 h-4 text-blue-500" />
                                <span className="text-xs font-medium text-blue-600">
                                  {t('extracted.officer') || 'Officer'}
                                </span>
                              </div>
                              <p className="text-sm text-blue-700">{c.text}</p>
                              <p className="text-xs mt-2 text-blue-500">
                                {t('extracted.sending') || 'Sending...'}
                              </p>
                            </div>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                            <Shield className="w-4 h-4" />
                          </div>
                        </motion.div>
                      ))}
                    </>
                  )}
                </div>

                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder={t('extracted.write_message') || 'Write a message...'}
                      className="w-full px-4 py-3 pr-12 rounded-xl theme-bg-glass theme-border-glass border theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg accent-gradient text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg"
                      aria-label={t('extracted.send_message') || 'Send message'}
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className="space-y-3">
                <div className="p-3 rounded-lg theme-bg-glass theme-border-glass border">
                  <p className="text-sm theme-text-muted"><strong>{t('extracted.created')}:</strong> {selectedGrievance.createdDate ? new Date(selectedGrievance.createdDate).toLocaleString() : '—'}</p>
                  <p className="text-sm theme-text-muted"><strong>{t('extracted.last_updated')}:</strong> {selectedGrievance.lastUpdated ? new Date(selectedGrievance.lastUpdated).toLocaleString() : '—'}</p>
                </div>
                <div className="p-3 rounded-lg theme-bg-glass theme-border-glass border">
                  <h4 className="text-sm font-semibold theme-text-primary">{t('extracted.activity')}</h4>
                  {(selectedGrievance.communication ?? []).length === 0 ? <p className="theme-text-muted">{t('extracted.no_activity')}</p> : (
                    <ul className="list-disc pl-5 space-y-2">
                      {(selectedGrievance.communication ?? []).map((c, i) => (
                        <li key={i} className="text-sm theme-text-muted flex items-start gap-2">
                          {(c.type === 'officer' || c.user === 'Officer') && <Shield className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />}
                          <span>
                            {(c.type === 'officer' || c.user === 'Officer') ? (t('extracted.officer') || 'Officer') : (c.user || (t('extracted.user') || 'User'))} — {String(c.text || c.message || c.body || '')}
                            <span className="text-xs block">{c.createdAt ? (new Date(c.createdAt?.toDate ? c.createdAt.toDate() : c.createdAt).toLocaleString()) : ''}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-3">
                <div className="p-4 rounded-lg theme-bg-glass theme-border-glass border">
                  <h4 className="text-sm font-semibold theme-text-primary">{t('extracted.attachments_label')}</h4>
                  <p className="text-sm theme-text-muted">{t('extracted.count')}: {selectedGrievance.attachments ?? 0}</p>
                  <p className="text-xs theme-text-muted">{t('extracted.upload_download_note')}</p>
                </div>
                <div className="p-4 rounded-lg theme-bg-glass theme-border-glass border">
                  <label className="text-sm theme-text-muted">{t('extracted.add_document_not_implemented')}</label>
                  <input type="file" disabled className="mt-2" />
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg theme-bg-glass theme-border-glass border text-center">
                  <div className="text-2xl font-bold theme-text-primary">{selectedGrievance.communication?.length ?? 0}</div>
                  <div className="text-sm theme-text-muted">{t('extracted.messages')}</div>
                </div>
                <div className="p-4 rounded-lg theme-bg-glass theme-border-glass border text-center">
                  <div className="text-2xl font-bold theme-text-primary">{selectedGrievance.attachments ?? 0}</div>
                  <div className="text-sm theme-text-muted">{t('extracted.attachments_label')}</div>
                </div>
                <div className="p-4 rounded-lg theme-bg-glass theme-border-glass border text-center">
                  <div className="text-2xl font-bold theme-text-primary">{(() => {
                    const created = selectedGrievance.createdDate ? new Date(selectedGrievance.createdDate).getTime() : Date.now();
                    const diff = Date.now() - created;
                    return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
                  })()}</div>
                  <div className="text-sm theme-text-muted">{t('extracted.days_open')}</div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={async (e) => { e.stopPropagation(); await resolveCase(); }}
                disabled={statusUpdating === selectedGrievance?.id || selectedGrievance?.status === 'closed'}
                className={`action-btn ${statusUpdating === selectedGrievance?.id ? 'opacity-60 cursor-wait' : ''} ${selectedGrievance?.status === 'closed' ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <CheckCircle className="w-4 h-4" />
                {selectedGrievance?.status === 'closed' ? (t('extracted.resolved') || 'Resolved') : (t('extracted.resolve_case') || 'Resolve')}
              </motion.button>
              {selectedGrievance?.phone ? (
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href={`tel:${selectedGrievance.phone.trim()}`}
                  target="_blank"
                  rel="noreferrer"
                  className="action-btn"
                  aria-label={t('extracted.call_now')}
                >
                  <PhoneCall className="w-4 h-4" />
                  {t('extracted.call_now')}
                </motion.a>
              ) : (
                <motion.button whileHover={{}} whileTap={{}} className="action-btn opacity-50 cursor-not-allowed" aria-disabled>
                  <PhoneCall className="w-4 h-4" />
                  {t('extracted.call_now')}
                </motion.button>
              )}

              {selectedGrievance?.email ? (
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href={`mailto:${selectedGrievance.email.trim()}`}
                  target="_blank"
                  rel="noreferrer"
                  className="action-btn"
                  aria-label={t('extracted.send_email')}
                >
                  <Mail className="w-4 h-4" />
                  {t('extracted.send_email')}
                </motion.a>
              ) : (
                <motion.button whileHover={{}} whileTap={{}} className="action-btn opacity-50 cursor-not-allowed" aria-disabled>
                  <Mail className="w-4 h-4" />
                  {t('extracted.send_email')}
                </motion.button>
              )}
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="action-btn action-btn-accent">
                <AlertOctagon className="w-4 h-4" />
                {t('extracted.escalate_case')}
              </motion.button>
          </div>
        </motion.section>
      )}

      {/* Dashboard Grid - New Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Analytics Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="xl:col-span-1 space-y-6"
        >
          {/* Quick Stats */}
          <div className="theme-bg-card theme-border-glass border rounded-2xl p-6 glass-effect">
            <h3 className="text-lg font-semibold theme-text-primary mb-4">{t('extracted.case_analytics')} </h3>
            <div className="space-y-4">
              {[
                { labelKey: 'extracted.active_cases_label', value: stats.open + stats.inProgress, trend: '+8%', icon: AlertCircle, color: 'from-amber-500 to-orange-500' },
                { labelKey: 'extracted.avg_resolution_label', value: `${stats.avgResolutionTime}d`, trend: '-1.2d', icon: Timer, color: 'from-blue-500 to-cyan-500' },
                { labelKey: 'extracted.satisfaction_label', value: `${stats.satisfactionRate}%`, trend: '+5%', icon: Star, color: 'from-yellow-500 to-amber-500' },
                { labelKey: 'extracted.escalated_label', value: stats.escalated, trend: '+2', icon: AlertOctagon, color: 'from-red-500 to-rose-500' }
              ].map((stat, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl theme-bg-glass">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold theme-text-primary">{stat.value}</p>
                      <p className="text-sm theme-text-muted">{t(stat.labelKey)}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold ${stat.trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                    {stat.trend}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="theme-bg-card theme-border-glass border rounded-2xl p-6 glass-effect">
            <h3 className="text-lg font-semibold theme-text-primary mb-4">{t('extracted.quick_actions_1')} </h3>
            <div className="space-y-3">
              {[
                { labelKey: 'extracted.assign_cases', icon: UserCheck, color: 'bg-blue-500/20 text-blue-400' },
                { labelKey: 'extracted.bulk_update', icon: Edit, color: 'bg-purple-500/20 text-purple-400' },
                { labelKey: 'extracted.generate_report', icon: FileText, color: 'bg-green-500/20 text-green-400' },
                { labelKey: 'extracted.call_center', icon: PhoneCall, color: 'bg-orange-500/20 text-orange-400' }
              ].map((action, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ x: 4 }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl ${action.color} transition-colors`}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{t(action.labelKey)}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Category Distribution */}
          <div className="theme-bg-card theme-border-glass border rounded-2xl p-6 glass-effect">
            <h3 className="text-lg font-semibold theme-text-primary mb-4">{t('extracted.case_categories')} </h3>
            <div className="space-y-3">
              {Object.entries(categoryStats).map(([category, count], idx) => {
                const Icon = getCategoryIcon(category);
                const categoryKey = `extracted.${category.replace('-', '_')}`;
                return (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg theme-bg-glass">
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 theme-text-primary" />
                      <span className="text-sm theme-text-primary">{t(categoryKey)}</span>
                    </div>
                    <span className="text-sm theme-text-muted">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Main Content Area */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="xl:col-span-3 space-y-6"
          >
          {/* View Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold theme-text-primary">
                {t('extracted.active_cases')} <span className="theme-text-muted text-lg">({filteredGrievances.length})</span>
              </h2>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative flex-1 lg:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 theme-text-muted" />
                <input
                  type="text"
                  placeholder={t('extracted.search_cases')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full lg:w-64 pl-10 pr-4 py-2.5 rounded-xl theme-bg-glass theme-border-glass border theme-text-primary"
                />
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-2 theme-bg-glass rounded-xl p-1">
                {[
                  { mode: 'dashboard', labelKey: 'extracted.dashboard_view' },
                  { mode: 'list', labelKey: 'extracted.list_view' }
                ].map(({ mode, labelKey }) => (
                  <motion.button
                    key={mode}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setViewMode(mode as 'dashboard' | 'list')}
                    className={`px-4 py-2 rounded-lg ${
                      viewMode === mode ? 'accent-gradient text-white' : 'theme-text-muted'
                    }`}
                  >
                    {t(labelKey)}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Cases Grid / List - separate dashboard and list layouts */}
          {viewMode === 'dashboard' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {paginatedGrievances.map((grievance, idx) => (
                <motion.div
                  key={grievance.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.06 }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  className="theme-bg-card theme-border-glass border rounded-2xl p-6 glass-effect cursor-pointer group"
                  onClick={() => setSelectedGrievance(grievance)}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                        <div className="text-sm font-bold">
                          {grievance.beneficiaryName.split(' ').map(n => n[0]).join('')}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-bold theme-text-primary group-hover:text-accent-gradient transition-colors">
                          {grievance.beneficiaryName}
                        </h3>
                        <p className="theme-text-muted text-sm">{grievance.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 ${getPriorityColor(grievance.priority)} text-xs font-bold rounded-full`}>
                        {grievance.priority ? grievance.priority.toUpperCase() : '-'}
                      </span>
                      <button className="p-1 rounded-lg theme-bg-glass hover:theme-bg-card transition-colors border theme-border-glass">
                        <MoreVertical className="w-4 h-4 theme-text-primary" />
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="theme-text-secondary text-sm mb-4 line-clamp-2">
                    {grievance.description}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-lg font-bold theme-text-primary">{grievance.attachments}</p>
                      <p className="theme-text-muted text-xs">{t('extracted.files')} </p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold theme-text-primary">{grievance.communication?.length ?? 0}</p>
                      <p className="theme-text-muted text-xs">{t('extracted.messages')} </p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold theme-text-primary">L{grievance.escalationLevel}</p>
                      <p className="theme-text-muted text-xs">{t('extracted.escalation')} </p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t theme-border-glass">
                      <div>
                        <select
                          onClick={(e) => e.stopPropagation()}
                          value={grievance.status}
                          onChange={(e) => { e.stopPropagation(); updateGrievanceStatus(grievance.id, e.target.value); }}
                          className={`px-3 py-1 rounded-full text-xs font-bold ${theme === 'light' ? 'bg-white border' : 'theme-bg-glass theme-border-glass'} ${getStatusColor(grievance.status)}`}
                        >
                          {statuses.map(s => (
                            <option key={s} value={s}>{s.replace('-', ' ').toUpperCase()}</option>
                          ))}
                        </select>
                      </div>
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => { e.stopPropagation(); setSelectedGrievance(grievance); }}
                        className="p-2 rounded-lg theme-bg-glass hover:bg-blue-500/20 transition-colors border theme-border-glass"
                        aria-label={`View ${grievance.id}`}
                      >
                        <Eye className="w-4 h-4 theme-text-primary" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => { e.stopPropagation(); setSelectedGrievance(grievance); setShowNewCaseModal(true); }}
                        className="p-2 rounded-lg theme-bg-glass hover:bg-yellow-500/20 transition-colors border theme-border-glass"
                        aria-label={`Edit ${grievance.id}`}
                      >
                        <Edit className="w-4 h-4 theme-text-primary" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => { e.stopPropagation(); /* placeholder for call action */ }}
                        className="p-2 rounded-lg theme-bg-glass hover:bg-green-500/20 transition-colors border theme-border-glass"
                        aria-label={`Call ${grievance.id}`}
                      >
                        <PhoneCall className="w-4 h-4 theme-text-primary" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            // List view: stacked cards on mobile, table on desktop
            <div>
              {isMobile ? (
                <div className="space-y-4">
                  {paginatedGrievances.map((g) => (
                    <div key={g.id} className="theme-bg-card theme-border-glass border rounded-2xl p-4 glass-effect">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold theme-text-primary">{g.beneficiaryName}</p>
                          <p className="text-xs theme-text-muted">{g.id} • {g.district}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 text-xs font-bold rounded-full ${getPriorityColor(g.priority)}`}>{g.priority ? g.priority.toUpperCase() : '-'}</span>
                          <div className="mt-2 flex items-center justify-end gap-2">
                                <select onClick={(e) => e.stopPropagation()} value={g.status} onChange={(e) => { e.stopPropagation(); updateGrievanceStatus(g.id, e.target.value); }} className={`px-2 py-1 rounded-md text-sm ${theme === 'light' ? 'bg-white text-gray-800 border' : 'bg-[#0b1220] text-slate-100 border border-gray-700'}`}>
                                  {statuses.map(s => <option key={s} value={s}>{s.replace('-', ' ').toUpperCase()}</option>)}
                                </select>
                                <button onClick={() => { setSelectedGrievance(g); setShowNewCaseModal(true); }} className="p-2 rounded-lg theme-bg-glass border theme-border-glass">
                                  <Edit className="w-4 h-4 theme-text-primary" />
                                </button>
                                <button onClick={() => setSelectedGrievance(g)} className="p-2 rounded-lg theme-bg-glass border theme-border-glass">
                                  <Eye className="w-4 h-4 theme-text-primary" />
                                </button>
                          </div>
                        </div>
                      </div>
                      <p className="theme-text-secondary text-sm mt-2 line-clamp-2">{g.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="theme-bg-card theme-border-glass border rounded-2xl overflow-auto">
                  <table className="min-w-full table-fixed">
                      <thead className={`${theme === 'light' ? 'bg-white/80' : 'bg-gray-800'}`}>
                        <tr>
                          <th className={`px-4 py-3 text-left text-xs font-medium ${theme === 'light' ? 'text-gray-700' : 'theme-text-muted'}`}>ID</th>
                          <th className={`px-4 py-3 text-left text-xs font-medium ${theme === 'light' ? 'text-gray-700' : 'theme-text-muted'}`}>{t('extracted.beneficiary')} </th>
                          <th className={`px-4 py-3 text-left text-xs font-medium ${theme === 'light' ? 'text-gray-700' : 'theme-text-muted'}`}>{t('extracted.district')} </th>
                          <th className={`px-4 py-3 text-left text-xs font-medium ${theme === 'light' ? 'text-gray-700' : 'theme-text-muted'}`}>{t('extracted.priority')} </th>
                          <th className={`px-4 py-3 text-left text-xs font-medium ${theme === 'light' ? 'text-gray-700' : 'theme-text-muted'}`}>{t('extracted.status')} </th>
                          <th className={`px-4 py-3 text-right text-xs font-medium ${theme === 'light' ? 'text-gray-700' : 'theme-text-muted'}`}>{t('extracted.actions')} </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedGrievances.map((g) => (
                          <tr key={g.id} className={`border-b ${theme === 'light' ? 'border-gray-200 hover:bg-gray-50' : 'theme-border-glass hover:bg-theme-bg-glass'} transition-colors`}>
                            <td className="px-4 py-3 text-sm theme-text-primary">{g.id}</td>
                            <td className="px-4 py-3 text-sm theme-text-primary">{g.beneficiaryName}</td>
                            <td className="px-4 py-3 text-sm theme-text-muted">{g.district}</td>
                            <td className="px-4 py-3 text-sm"><span className={`px-2 py-1 text-xs font-bold rounded-full ${getPriorityColor(g.priority)}`}>{g.priority ? g.priority.toUpperCase() : '-'}</span></td>
                            <td className="px-4 py-3 text-sm theme-text-muted">
                              <select value={g.status} onChange={(e) => updateGrievanceStatus(g.id, e.target.value)} className={`px-2 py-1 rounded-md text-sm ${theme === 'light' ? 'bg-white text-gray-800 border' : 'bg-[#0b1220] text-slate-100 border border-gray-700'}`}>
                                {statuses.map(s => <option key={s} value={s}>{s.replace('-', ' ').toUpperCase()}</option>)}
                              </select>
                            </td>
                            <td className="px-4 py-3 text-sm text-right">
                              <div className="inline-flex items-center gap-2">
                                <button onClick={() => { setSelectedGrievance(g); setShowNewCaseModal(true); }} className="p-2 rounded-lg theme-bg-glass border theme-border-glass" aria-label={`Edit ${g.id}`}>
                                  <Edit className="w-4 h-4 theme-text-primary" />
                                </button>
                                <button onClick={() => setSelectedGrievance(g)} className="p-2 rounded-lg theme-bg-glass border theme-border-glass" aria-label={`View ${g.id}`}>
                                  <Eye className="w-4 h-4 theme-text-primary" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                </div>
              )}
            </div>
          )}

          {/* Performance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Resolution Metrics */}
            <motion.div
              whileHover={{ y: -4 }}
              className="theme-bg-card theme-border-glass border rounded-2xl p-6 glass-effect"
            >
              <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-semibold theme-text-primary">{t('extracted.resolution_metrics_1')} </h3>
                <Target className="w-5 h-5 theme-text-muted" />
              </div>
                        <div className="space-y-4">
                          {/* Compute SLA buckets dynamically */}
                          {(() => {
                            const totalWithExpected = grievances.filter(g => g.expectedResolution).length || grievances.length || 1;
                            const now = new Date();
                            let within = 0, near = 0, breached = 0;
                            grievances.forEach(g => {
                              const exp = g.expectedResolution ? new Date(g.expectedResolution) : null;
                              const res = g.resolutionDate ? new Date(g.resolutionDate) : null;
                              if (exp) {
                                if (res) {
                                  if (res <= exp) within += 1; else breached += 1;
                                } else {
                                  if (exp < now) breached += 1;
                                  else {
                                    const daysLeft = (exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
                                    if (daysLeft <= 2) near += 1; else within += 1;
                                  }
                                }
                              }
                            });
                            const withinPct = Math.round((within / totalWithExpected) * 100);
                            const nearPct = Math.round((near / totalWithExpected) * 100);
                            const breachedPct = 100 - withinPct - nearPct;
                            const metrics = [
                              { label: t('extracted.within_sla'), value: withinPct, color: 'bg-green-500' },
                              { label: t('extracted.near_sla'), value: nearPct, color: 'bg-amber-500' },
                              { label: t('extracted.breached_sla'), value: breachedPct, color: 'bg-red-500' }
                            ];
                            return metrics.map((metric) => (
                              <div key={metric.label} className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className={`text-sm ${theme === 'light' ? 'text-gray-700' : 'theme-text-primary'}`}>{metric.label}</span>
                                  <span className={`text-sm font-semibold ${theme === 'light' ? 'text-gray-800' : 'theme-text-primary'}`}>{metric.value}%</span>
                                </div>
                                <div className={`w-full rounded-full h-2 ${theme === 'light' ? 'bg-gray-200' : 'bg-gray-700'}`}>
                                  <div 
                                    className={`h-2 rounded-full ${metric.color} transition-all duration-1000`}
                                    style={{ width: `${metric.value}%` }}
                                  ></div>
                                </div>
                              </div>
                            ));
                          })()}
                        </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              whileHover={{ y: -4 }}
              className="theme-bg-card theme-border-glass border rounded-2xl p-6 glass-effect"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold theme-text-primary">{t('extracted.recent_updates')} </h3>
                <Activity className="w-5 h-5 theme-text-muted" />
              </div>
              <div className="space-y-4">
                {(() => {
                  // Build recent activities from grievances
                  const now = new Date();
                  const recent: { action: string; user: string; time: string; status: 'success' | 'warning' | 'info' | 'error' }[] = [];
                  const seen = new Set<string>();
                  const items = [...grievances].sort((a, b) => {
                    const aTime = new Date(a.lastUpdated || a.createdDate || '').getTime() || 0;
                    const bTime = new Date(b.lastUpdated || b.createdDate || '').getTime() || 0;
                    return bTime - aTime;
                  });
                  const withinWindowMs = 1000 * 60 * 60 * 24 * 7; // 7 days
                  for (const g of items) {
                    if (recent.length >= 4) break;
                    const lu = new Date(g.lastUpdated || g.createdDate || now.toISOString());
                    if (now.getTime() - lu.getTime() > withinWindowMs) continue;
                    const timeLabel = (() => {
                      const mins = Math.round((now.getTime() - lu.getTime()) / 60000);
                      if (mins < 60) return `${mins} min ago`;
                      const hrs = Math.round(mins / 60);
                      if (hrs < 24) return `${hrs} hr ago`;
                      const days = Math.round(hrs / 24);
                      return `${days} day${days > 1 ? 's' : ''} ago`;
                    })();

                    if (g.status === 'resolved' && !seen.has('resolved')) {
                      recent.push({ action: t('extracted.case_resolved') || 'Case Resolved', user: g.assignedTo || g.beneficiaryName || 'System', time: timeLabel, status: 'success' });
                      seen.add('resolved');
                      continue;
                    }
                    if ((g.escalationLevel || 0) > 0 && !seen.has('escalation')) {
                      recent.push({ action: t('extracted.new_escalation') || 'New Escalation', user: 'System', time: timeLabel, status: 'warning' });
                      seen.add('escalation');
                      continue;
                    }
                    if ((g.attachments || 0) > 0 && !seen.has('document')) {
                      recent.push({ action: t('extracted.document_uploaded') || 'Document Uploaded', user: t('extracted.beneficiary_user') || g.beneficiaryName || 'Beneficiary', time: timeLabel, status: 'info' });
                      seen.add('document');
                      continue;
                    }
                    if (g.followUpRequired && !seen.has('followup')) {
                      recent.push({ action: t('extracted.followup_required') || 'Follow-up Required', user: g.assignedTo || 'Officer', time: timeLabel, status: 'error' });
                      seen.add('followup');
                      continue;
                    }
                  }
                  // Fallback: if no recent activities found, synthesize a dynamic event from the latest item
                  if (recent.length === 0 && items.length) {
                    const latest = items[0];
                    const lu = new Date(latest.lastUpdated || latest.createdDate || new Date().toISOString());
                    const timeLabel = (() => {
                      const mins = Math.round((now.getTime() - lu.getTime()) / 60000);
                      if (mins < 1) return 'just now';
                      if (mins < 60) return `${mins} min ago`;
                      const hrs = Math.round(mins / 60);
                      if (hrs < 24) return `${hrs} hr ago`;
                      const days = Math.round(hrs / 24);
                      return `${days} day${days > 1 ? 's' : ''} ago`;
                    })();

                    let action = t('extracted.case_updated') || 'Updated';
                    let statusLabel: 'success' | 'warning' | 'info' | 'error' = 'info';
                    if (latest.status === 'resolved' || latest.status === 'closed') {
                      action = t('extracted.case_resolved') || 'Case Resolved';
                      statusLabel = 'success';
                    } else if ((latest.escalationLevel || 0) > 0) {
                      action = t('extracted.new_escalation') || 'New Escalation';
                      statusLabel = 'warning';
                    } else if ((latest.attachments || 0) > 0) {
                      action = t('extracted.document_uploaded') || 'Document Uploaded';
                      statusLabel = 'info';
                    } else if (latest.followUpRequired) {
                      action = t('extracted.followup_required') || 'Follow-up Required';
                      statusLabel = 'error';
                    } else if ((latest.communication?.length ?? 0) > 0) {
                      action = t('extracted.new_message') || 'New Message';
                      statusLabel = 'info';
                    }

                    recent.push({ action, user: latest.assignedTo || latest.beneficiaryName || 'System', time: timeLabel, status: statusLabel });
                  }
                  return recent.map((activity, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-lg theme-bg-glass">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.status === 'success' ? 'bg-green-500' :
                        activity.status === 'warning' ? 'bg-amber-500' :
                        activity.status === 'error' ? 'bg-red-500' : 'bg-blue-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium theme-text-primary truncate">{activity.action}</p>
                        <p className="text-xs theme-text-muted truncate">{activity.user} • {activity.time}</p>
                      </div>
                      <ArrowUpRight className="w-4 h-4 theme-text-muted flex-shrink-0" />
                    </div>
                  ));
                })()}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Feedback Section */}
      {user && profile?.role === 'officer' ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative p-6 rounded-2xl theme-bg-card theme-border-glass border backdrop-blur-xl overflow-hidden"
        >
        {/* Animated gradient background */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl"
        />

        <div className="relative z-10">
          {/* Enhanced Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-3">
                <motion.div
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Star className="w-5 h-5 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold theme-text-primary">
                    {t('extracted.feedback_analytics.userFeedback')}
                  </h2>
                  <p className="text-sm theme-text-secondary">
                    {feedbacks.length} {feedbacks.length === 1 ? t('extracted.feedback_analytics.submissions').toLowerCase().slice(0, -1) : t('extracted.feedback_analytics.submissions').toLowerCase()} • {t('extracted.feedback_analytics.averageRating', { rating: sortedFeedbacks.length > 0 ? (sortedFeedbacks.reduce((sum, f) => sum + f.rating, 0) / sortedFeedbacks.length).toFixed(1) : '0.0' })}
                  </p>
                </div>
              </div>
              <p className="theme-text-muted max-w-md mx-auto lg:mx-0">
                {t('extracted.feedback_analytics.insightsFromUserExperiences')}
              </p>
            </div>

            {/* Enhanced Sort Controls */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium theme-text-secondary hidden sm:inline">{t('extracted.feedback_analytics.sortBy')}</span>
                <div className="relative">
                  <select
                    value={feedbackSortBy}
                    onChange={(e) => setFeedbackSortBy(e.target.value as 'rating' | 'createdAt')}
                    className="appearance-none px-4 py-2 pr-8 rounded-xl theme-bg-glass theme-border-glass border theme-text-primary text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all cursor-pointer hover:theme-bg-glass-hover"
                  >
                    <option value="createdAt"><Calendar className="inline w-4 h-4 mr-2" />{t('extracted.feedback_analytics.dateCreated').replace('📅 ', '')}</option>
                    <option value="rating"><Star className="inline w-4 h-4 mr-2" />{t('extracted.feedback_analytics.rating')}</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 theme-text-muted pointer-events-none" />
                </div>
              </div>
              <motion.button
                onClick={() => setFeedbackSortOrder(feedbackSortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 rounded-xl theme-bg-glass theme-border-glass border hover:theme-bg-glass-hover transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title={feedbackSortOrder === 'asc' ? t('extracted.feedback_analytics.sortDescending') : t('extracted.feedback_analytics.sortAscending')}
              >
                <ArrowUpRight className={`w-4 h-4 theme-text-secondary transition-transform duration-200 ${feedbackSortOrder === 'asc' ? 'rotate-90' : '-rotate-90'}`} />
              </motion.button>
            </div>
          </div>

          {/* Enhanced Feedback Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {sortedFeedbacks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="col-span-full text-center py-16"
              >
                <div className="mx-auto w-20 h-20 rounded-2xl flex items-center justify-center mb-6 theme-bg-glass border theme-border-glass">
                  <MessageSquare className="w-10 h-10 theme-text-muted" />
                </div>
                <h3 className="text-lg font-semibold theme-text-primary mb-2">No feedback yet</h3>
                <p className="text-sm theme-text-muted max-w-sm mx-auto">
                  User feedback and ratings will appear here once submissions start coming in
                </p>
              </motion.div>
            ) : (
              sortedFeedbacks.map((feedback, index) => (
                <motion.div
                  key={feedback.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -6, scale: 1.03 }}
                  className="group relative theme-bg-card theme-border-glass border-2 hover:shadow-xl hover:shadow-blue-500/20 dark:hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden rounded-2xl p-6"
                >
                  {/* Enhanced gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative z-10">
                    {/* Rating Section */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <motion.div
                              key={star}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: (index * 0.1) + (star * 0.05) }}
                            >
                              <Star
                                className={`w-5 h-5 transition-colors duration-200 ${
                                  star <= feedback.rating
                                    ? 'text-yellow-500 fill-current drop-shadow-sm'
                                    : 'text-gray-400 dark:text-gray-600'
                                }`}
                              />
                            </motion.div>
                          ))}
                        </div>
                        <div className="px-3 py-1.5 rounded-full bg-yellow-300 border border-yellow-500 dark:bg-yellow-900/30 dark:border-yellow-700">
                          <span className="text-sm font-bold text-yellow-950 dark:text-yellow-300">
                            {feedback.rating}/5
                          </span>
                        </div>
                      </div>

                      {/* Status indicator */}
                      <div className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 ${
                        feedback.status === 'resolved'
                          ? 'bg-green-300 text-green-950 border-green-500 dark:bg-green-900/40 dark:text-green-300 dark:border-green-700'
                          : feedback.status === 'in-review'
                          ? 'bg-blue-300 text-blue-950 border-blue-500 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700'
                          : 'bg-gray-300 text-gray-950 border-gray-500 dark:bg-gray-900/40 dark:text-gray-300 dark:border-gray-700'
                      }`}>
                        {feedback.status === 'in-review' ? 'In Review' : feedback.status.charAt(0).toUpperCase() + feedback.status.slice(1)}
                      </div>
                    </div>

                    {/* Subject */}
                    <h4 className="font-bold theme-text-primary mb-3 text-lg leading-tight line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {feedback.subject}
                    </h4>

                    {/* Message */}
                    <p className="text-sm theme-text-secondary mb-4 line-clamp-3 leading-relaxed">
                      {feedback.message}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t theme-border-glass">
                      <div className="flex items-center gap-2 text-xs theme-text-muted">
                        <Clock className="w-3 h-3" />
                        <span className="font-medium">
                          {feedback.createdAt?.toDate?.()?.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          }) || 'Unknown date'}
                        </span>
                      </div>
                      <div className="text-xs font-mono font-semibold theme-text-secondary bg-gray-100 dark:bg-gray-100 border theme-border-glass px-2.5 py-1 rounded-lg">
                        #{feedback.id.slice(-6)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Enhanced Statistics Dashboard */}
          {sortedFeedbacks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8 pt-8 border-t theme-border-glass"
            >
              <div className="mb-6 text-center">
                <h3 className="text-lg font-semibold theme-text-primary mb-2">{t('extracted.feedback_analytics.feedbackAnalytics')}</h3>
                <p className="text-sm theme-text-muted">{t('extracted.feedback_analytics.insightsFromUserExperiences')}</p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Feedback */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-4 rounded-2xl theme-bg-glass theme-border-glass border group hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold theme-text-primary mb-1">
                    {sortedFeedbacks.length}
                  </div>
                  <div className="text-sm theme-text-secondary font-medium">{t('extracted.feedback_analytics.totalFeedback')}</div>
                  <div className="text-xs theme-text-muted mt-1">{t('extracted.feedback_analytics.allSubmissions')}</div>
                </motion.div>

                {/* Average Rating */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-4 rounded-2xl theme-bg-glass theme-border-glass border group hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Star className="w-6 h-6 text-white fill-current" />
                  </div>
                  <div className="text-3xl font-bold theme-text-primary mb-1">
                    {(sortedFeedbacks.reduce((sum, f) => sum + f.rating, 0) / sortedFeedbacks.length).toFixed(1)}
                  </div>
                  <div className="text-sm theme-text-secondary font-medium">{t('extracted.feedback_analytics.averageRating', { rating: (sortedFeedbacks.reduce((sum, f) => sum + f.rating, 0) / sortedFeedbacks.length).toFixed(1) }).replace('⭐', '')} <Star className="inline w-4 h-4" /></div>
                  <div className="text-xs theme-text-muted mt-1">{t('extracted.feedback_analytics.outOf5Stars')}</div>
                </motion.div>

                {/* High Ratings */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-4 rounded-2xl theme-bg-glass theme-border-glass border group hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                    {sortedFeedbacks.filter(f => f.rating >= 4).length}
                  </div>
                  <div className="text-sm theme-text-secondary font-medium">{t('extracted.feedback_analytics.highRatings').replace('⭐', '')} <Star className="inline w-3 h-3" /></div>
                  <div className="text-xs theme-text-muted mt-1">{t('extracted.feedback_analytics.starsRange', { range: '4-5', percentage: Math.round((sortedFeedbacks.filter(f => f.rating >= 4).length / sortedFeedbacks.length) * 100) })}</div>
                </motion.div>

                {/* Medium/Low Ratings */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-4 rounded-2xl theme-bg-glass theme-border-glass border group hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-amber-500 to-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <AlertCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-1">
                    {sortedFeedbacks.filter(f => f.rating < 4).length}
                  </div>
                  <div className="text-sm theme-text-secondary font-medium">{t('extracted.feedback_analytics.needsAttention').replace('⭐', '')} <Star className="inline w-3 h-3" /></div>
                  <div className="text-xs theme-text-muted mt-1">{t('extracted.feedback_analytics.starsRange', { range: 'Below 4', percentage: Math.round((sortedFeedbacks.filter(f => f.rating < 4).length / sortedFeedbacks.length) * 100) })}</div>
                </motion.div>
              </div>

              {/* Rating Distribution Chart */}
              <div className="mt-8 p-6 rounded-2xl theme-bg-glass theme-border-glass border">
                <h4 className="text-md font-semibold theme-text-primary mb-4 text-center">{t('extracted.feedback_analytics.ratingDistribution')}</h4>
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = sortedFeedbacks.filter(f => f.rating === rating).length;
                    const percentage = sortedFeedbacks.length > 0 ? (count / sortedFeedbacks.length) * 100 : 0;
                    return (
                      <div key={rating} className="flex items-center gap-3">
                        <div className="flex items-center gap-2 w-12">
                          <span className="text-sm font-medium theme-text-secondary">{rating}</span>
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        </div>
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                            className={`h-2 rounded-full ${
                              rating >= 4 ? 'bg-green-500' :
                              rating === 3 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                          />
                        </div>
                        <div className="text-xs theme-text-muted w-8 text-right">
                          {count}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative p-6 rounded-2xl theme-bg-card theme-border-glass border backdrop-blur-xl overflow-hidden"
        >
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 theme-bg-glass">
              <Shield className="w-8 h-8 theme-text-muted" />
            </div>
            <p className="theme-text-secondary mb-2">Access Restricted</p>
            <p className="text-sm theme-text-muted">Feedback management requires officer privileges</p>
          </div>
        </motion.div>
      )}

    </div>
  );
};

export default GrievancePage;