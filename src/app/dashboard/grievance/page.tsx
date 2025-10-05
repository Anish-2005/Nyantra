"use client";
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import type * as THREE from 'three';
import {
  Search, Filter, Download, Plus, Eye, Edit, Trash2,
  ChevronDown, ChevronLeft, ChevronRight, X, Check,
  Clock, AlertCircle, FileText, User, Phone, MapPin,
  Calendar, DollarSign, Upload, Send, MessageSquare,
  RefreshCw, MoreVertical, TrendingUp, AlertTriangle,
  Shield, Award, Heart, Cross, Scale, BadgeCheck,
  Banknote, Receipt, Fingerprint, QrCode, CreditCard,
  TrendingDown, Circle, CheckCircle, XCircle, PlayCircle,
  PauseCircle, BarChart3, Target, RotateCcw, PieChart,
  LineChart, BarChart, Activity, Users, Award as AwardIcon,
  Clock as ClockIcon, Map as MapIcon, Calendar as CalendarIcon,
  MessageCircle, ThumbsUp, ThumbsDown, Flag, Star, Zap,
  ArrowRight, ArrowUp, ArrowDown, Mail, PhoneCall, Video,
  UserCheck, UserX, AlertOctagon, FileSearch, Timer
} from 'lucide-react';

// Mock data for grievances
const mockGrievances = [
  {
    id: 'GRV-2024-001234',
    beneficiaryId: 'BEN-2024-001234',
    beneficiaryName: 'Rajesh Kumar',
    phone: '+91 98765-43210',
    email: 'rajesh.k@example.com',
    district: 'Patna',
    state: 'Bihar',
    actType: 'PCR Act',
    applicationId: 'APP-2024-001234',
    category: 'disbursement-delay',
    subCategory: 'payment-not-received',
    priority: 'high',
    status: 'open',
    assignedTo: 'Officer Sharma',
    assignedDate: '2024-03-15',
    createdDate: '2024-03-10',
    lastUpdated: '2024-03-18 14:30',
    resolutionDate: '',
    expectedResolution: '2024-03-25',
    description: 'Relief amount not received despite application approval 3 weeks ago. No communication regarding disbursement status.',
    attachments: 3,
    communication: [
      {
        id: 1,
        type: 'complaint',
        message: 'Applied for relief under PCR Act. Application approved but no payment received.',
        date: '2024-03-10 10:30',
        from: 'Rajesh Kumar',
        to: 'Grievance Cell'
      },
      {
        id: 2,
        type: 'acknowledgment',
        message: 'Grievance registered. Ticket #GRV-2024-001234 assigned to Officer Sharma.',
        date: '2024-03-11 09:15',
        from: 'System',
        to: 'Rajesh Kumar'
      }
    ],
    escalationLevel: 1,
    satisfactionRating: null,
    followUpRequired: true,
    relatedGrievances: []
  },
  {
    id: 'GRV-2024-001235',
    beneficiaryId: 'BEN-2024-001235',
    beneficiaryName: 'Priya Singh',
    phone: '+91 98765-43211',
    email: 'priya.s@example.com',
    district: 'Lucknow',
    state: 'Uttar Pradesh',
    actType: 'PoA Act',
    applicationId: 'APP-2024-001235',
    category: 'document-issues',
    subCategory: 'document-rejection',
    priority: 'medium',
    status: 'in-progress',
    assignedTo: 'Officer Verma',
    assignedDate: '2024-03-12',
    createdDate: '2024-03-08',
    lastUpdated: '2024-03-17 11:45',
    resolutionDate: '',
    expectedResolution: '2024-03-22',
    description: 'Aadhaar document rejected multiple times without proper reason. Need clarification on acceptable documents.',
    attachments: 5,
    communication: [
      {
        id: 1,
        type: 'complaint',
        message: 'Aadhaar card rejected 3 times. No clear reason provided.',
        date: '2024-03-08 14:20',
        from: 'Priya Singh',
        to: 'Grievance Cell'
      },
      {
        id: 2,
        type: 'response',
        message: 'Requesting clarification on document rejection. Please provide specific reasons.',
        date: '2024-03-12 10:30',
        from: 'Officer Verma',
        to: 'Priya Singh'
      }
    ],
    escalationLevel: 1,
    satisfactionRating: null,
    followUpRequired: true,
    relatedGrievances: []
  },
  {
    id: 'GRV-2024-001236',
    beneficiaryId: 'BEN-2024-001236',
    beneficiaryName: 'Amit Verma',
    phone: '+91 98765-43212',
    email: 'amit.v@example.com',
    district: 'Jaipur',
    state: 'Rajasthan',
    actType: 'PCR Act',
    applicationId: 'APP-2024-001236',
    category: 'application-status',
    subCategory: 'status-not-updated',
    priority: 'medium',
    status: 'resolved',
    assignedTo: 'Officer Kapoor',
    assignedDate: '2024-03-05',
    createdDate: '2024-03-01',
    lastUpdated: '2024-03-10 16:45',
    resolutionDate: '2024-03-10',
    expectedResolution: '2024-03-15',
    description: 'Application status stuck at "Under Review" for 4 weeks. No updates provided.',
    attachments: 2,
    communication: [
      {
        id: 1,
        type: 'complaint',
        message: 'Application status not updated for a month.',
        date: '2024-03-01 11:15',
        from: 'Amit Verma',
        to: 'Grievance Cell'
      },
      {
        id: 2,
        type: 'resolution',
        message: 'Application processed and approved. Status updated in system.',
        date: '2024-03-10 16:45',
        from: 'Officer Kapoor',
        to: 'Amit Verma'
      }
    ],
    escalationLevel: 1,
    satisfactionRating: 5,
    followUpRequired: false,
    relatedGrievances: []
  },
  {
    id: 'GRV-2024-001237',
    beneficiaryId: 'BEN-2024-001237',
    beneficiaryName: 'Sunita Devi',
    phone: '+91 98765-43213',
    email: 'sunita.d@example.com',
    district: 'Bhopal',
    state: 'Madhya Pradesh',
    actType: 'PoA Act',
    applicationId: 'APP-2024-001237',
    category: 'officer-behavior',
    subCategory: 'rude-behavior',
    priority: 'high',
    status: 'escalated',
    assignedTo: 'Senior Officer Gupta',
    assignedDate: '2024-03-14',
    createdDate: '2024-03-10',
    lastUpdated: '2024-03-16 09:20',
    resolutionDate: '',
    expectedResolution: '2024-03-24',
    description: 'Facing rude behavior from assigned officer during document submission. Request officer change.',
    attachments: 1,
    communication: [
      {
        id: 1,
        type: 'complaint',
        message: 'Officer behaved rudely during document verification.',
        date: '2024-03-10 15:45',
        from: 'Sunita Devi',
        to: 'Grievance Cell'
      },
      {
        id: 2,
        type: 'escalation',
        message: 'Complaint escalated to senior management for investigation.',
        date: '2024-03-14 11:30',
        from: 'System',
        to: 'Sunita Devi'
      }
    ],
    escalationLevel: 2,
    satisfactionRating: null,
    followUpRequired: true,
    relatedGrievances: []
  },
  {
    id: 'GRV-2024-001238',
    beneficiaryId: 'BEN-2024-001238',
    beneficiaryName: 'Ramesh Yadav',
    phone: '+91 98765-43214',
    email: 'ramesh.y@example.com',
    district: 'Ranchi',
    state: 'Jharkhand',
    actType: 'PCR Act',
    applicationId: 'APP-2024-001238',
    category: 'information-correction',
    subCategory: 'name-correction',
    priority: 'low',
    status: 'closed',
    assignedTo: 'Officer Mishra',
    assignedDate: '2024-03-08',
    createdDate: '2024-03-05',
    lastUpdated: '2024-03-12 11:30',
    resolutionDate: '2024-03-12',
    expectedResolution: '2024-03-18',
    description: 'Name spelling error in approved application. Need correction certificate.',
    attachments: 4,
    communication: [
      {
        id: 1,
        type: 'complaint',
        message: 'Name spelling incorrect in approved application.',
        date: '2024-03-05 09:20',
        from: 'Ramesh Yadav',
        to: 'Grievance Cell'
      },
      {
        id: 2,
        type: 'resolution',
        message: 'Name correction completed and new certificate issued.',
        date: '2024-03-12 11:30',
        from: 'Officer Mishra',
        to: 'Ramesh Yadav'
      }
    ],
    escalationLevel: 1,
    satisfactionRating: 4,
    followUpRequired: false,
    relatedGrievances: []
  },
  {
    id: 'GRV-2024-001239',
    beneficiaryId: 'BEN-2024-001239',
    beneficiaryName: 'Anita Sharma',
    phone: '+91 98765-43215',
    email: 'anita.s@example.com',
    district: 'Chandigarh',
    state: 'Punjab',
    actType: 'PoA Act',
    applicationId: 'APP-2024-001239',
    category: 'technical-issues',
    subCategory: 'portal-access',
    priority: 'medium',
    status: 'pending',
    assignedTo: 'IT Support',
    assignedDate: '2024-03-16',
    createdDate: '2024-03-15',
    lastUpdated: '2024-03-16 08:15',
    resolutionDate: '',
    expectedResolution: '2024-03-19',
    description: 'Unable to access application portal. Password reset not working.',
    attachments: 0,
    communication: [
      {
        id: 1,
        type: 'complaint',
        message: 'Cannot login to application portal.',
        date: '2024-03-15 16:30',
        from: 'Anita Sharma',
        to: 'Grievance Cell'
      }
    ],
    escalationLevel: 1,
    satisfactionRating: null,
    followUpRequired: true,
    relatedGrievances: []
  },
  {
    id: 'GRV-2024-001240',
    beneficiaryId: 'BEN-2024-001240',
    beneficiaryName: 'Mohan Das',
    phone: '+91 98765-43216',
    email: 'mohan.d@example.com',
    district: 'Ahmedabad',
    state: 'Gujarat',
    actType: 'PCR Act',
    applicationId: 'APP-2024-001240',
    category: 'disbursement-delay',
    subCategory: 'partial-payment',
    priority: 'high',
    status: 'in-progress',
    assignedTo: 'Officer Patel',
    assignedDate: '2024-03-13',
    createdDate: '2024-03-10',
    lastUpdated: '2024-03-17 14:20',
    resolutionDate: '',
    expectedResolution: '2024-03-23',
    description: 'Received only partial payment. Balance amount pending for 2 weeks.',
    attachments: 2,
    communication: [
      {
        id: 1,
        type: 'complaint',
        message: 'Received only 50% of approved amount.',
        date: '2024-03-10 12:45',
        from: 'Mohan Das',
        to: 'Grievance Cell'
      },
      {
        id: 2,
        type: 'response',
        message: 'Investigating partial payment issue with accounts department.',
        date: '2024-03-13 15:30',
        from: 'Officer Patel',
        to: 'Mohan Das'
      }
    ],
    escalationLevel: 1,
    satisfactionRating: null,
    followUpRequired: true,
    relatedGrievances: []
  }
];

const GrievancePage = () => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [actTypeFilter, setActTypeFilter] = useState('all');
  const [assignedToFilter, setAssignedToFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGrievance, setSelectedGrievance] = useState<typeof mockGrievances[0] | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Filter and sort grievances
  const filteredGrievances = useMemo(() => {
    let filtered = [...mockGrievances];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(grievance =>
        grievance.beneficiaryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        grievance.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        grievance.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        grievance.applicationId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(grievance => grievance.status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(grievance => grievance.category === categoryFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(grievance => grievance.priority === priorityFilter);
    }

    // Act type filter
    if (actTypeFilter !== 'all') {
      filtered = filtered.filter(grievance => grievance.actType === actTypeFilter);
    }

    // Assigned to filter
    if (assignedToFilter !== 'all') {
      filtered = filtered.filter(grievance => grievance.assignedTo === assignedToFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      const getVal = (obj: any, key: string) => {
        const val = obj[key as keyof typeof obj];
        if (val === null || val === undefined) return '';
        if (typeof val === 'string') {
          const ts = Date.parse(val);
          // convert ISO-like date strings to timestamp for proper chronological sorting
          if (!Number.isNaN(ts)) return ts;
          return val.toLowerCase();
        }
        return val;
      };
    
      const aVal = getVal(a, sortBy);
      const bVal = getVal(b, sortBy);
    
      if (aVal === bVal) return 0;
    
      // numeric comparison when both are numbers
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
    
      // fallback to string comparison
      const aStr = String(aVal);
      const bStr = String(bVal);
    
      if (sortOrder === 'asc') {
        return aStr > bStr ? 1 : -1;
      } else {
        return aStr < bStr ? 1 : -1;
      }
    });

    return filtered;
  }, [searchQuery, statusFilter, categoryFilter, priorityFilter, actTypeFilter, assignedToFilter, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredGrievances.length / itemsPerPage);
  const paginatedGrievances = filteredGrievances.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Statistics
  const stats = useMemo(() => {
    const total = mockGrievances.length;
    const resolved = mockGrievances.filter(g => g.status === 'resolved' || g.status === 'closed').length;
    const inProgress = mockGrievances.filter(g => g.status === 'in-progress').length;
    const escalated = mockGrievances.filter(g => g.status === 'escalated').length;
    const avgResolutionTime = 5.2; // days
    const satisfactionRate = Math.round((mockGrievances.filter(g => g.satisfactionRating && g.satisfactionRating >= 4).length / resolved) * 100);
    
    return {
      total,
      open: mockGrievances.filter(g => g.status === 'open').length,
      inProgress,
      resolved,
      escalated,
      closed: mockGrievances.filter(g => g.status === 'closed').length,
      pending: mockGrievances.filter(g => g.status === 'pending').length,
      avgResolutionTime,
      satisfactionRate,
      highPriority: mockGrievances.filter(g => g.priority === 'high').length
    };
  }, []);

  // Category distribution
  const categoryStats = useMemo(() => {
    const categories = {
      'disbursement-delay': mockGrievances.filter(g => g.category === 'disbursement-delay').length,
      'document-issues': mockGrievances.filter(g => g.category === 'document-issues').length,
      'application-status': mockGrievances.filter(g => g.category === 'application-status').length,
      'officer-behavior': mockGrievances.filter(g => g.category === 'officer-behavior').length,
      'information-correction': mockGrievances.filter(g => g.category === 'information-correction').length,
      'technical-issues': mockGrievances.filter(g => g.category === 'technical-issues').length
    };
    return categories;
  }, []);

  // Detect small screens and adjust UI defaults for better mobile UX
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      const matches = 'matches' in e ? e.matches : mq.matches;
      setIsMobile(matches);
    };

    handler(mq);
    if ('addEventListener' in mq) mq.addEventListener('change', handler as (this: MediaQueryList, ev: MediaQueryListEvent) => void);
    else (mq as unknown as { addListener?: (h: (e: MediaQueryListEvent) => void) => void }).addListener?.(handler as (e: MediaQueryListEvent) => void);

    return () => {
      if ('removeEventListener' in mq) mq.removeEventListener('change', handler as (this: MediaQueryList, ev: MediaQueryListEvent) => void);
      else (mq as unknown as { removeListener?: (h: (e: MediaQueryListEvent) => void) => void }).removeListener?.(handler as (e: MediaQueryListEvent) => void);
    };
  }, []);

  // Prefer cards view on mobile for readability
  useEffect(() => {
    if (isMobile) setViewMode('cards');
  }, [isMobile]);

  // Three.js canvas background (particles + connecting lines) — theme-aware
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
      renderer.setClearColor(0x000000, 0);

      // Theme-aware colors
      let particleColor: THREE.Color | number = theme === 'dark' ? 0x3b82f6 : 0x1e40af;
      let lineColor: THREE.Color | number = theme === 'dark' ? 0xf59e0b : 0xd97706;
      try {
        const style = getComputedStyle(document.documentElement);
        const a = (style.getPropertyValue('--accent-primary') || '').trim();
        const b = (style.getPropertyValue('--accent-secondary') || '').trim();
        if (a) particleColor = new THREE.Color(a);
        if (b) lineColor = new THREE.Color(b);
      } catch { }

      const particlesGeometry = new THREE.BufferGeometry();
      const particlesCount = 1000;
      const posArray = new Float32Array(particlesCount * 3);

      for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 10;
      }

      particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

      const particlesMaterial = new THREE.PointsMaterial({
        size: theme === 'dark' ? 0.012 : 0.008,
        color: particleColor,
        transparent: true,
        opacity: theme === 'dark' ? 0.6 : 0.4,
        blending: THREE.AdditiveBlending
      });

      const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
      scene.add(particlesMesh);

      // Create connecting lines
      const linesGeometry = new THREE.BufferGeometry();
      const linesMaterial = new THREE.LineBasicMaterial({ color: lineColor, transparent: true, opacity: theme === 'dark' ? 0.15 : 0.1 });

      const linesPositions: number[] = [];
      for (let i = 0; i < 80; i++) {
        const x1 = (Math.random() - 0.5) * 8;
        const y1 = (Math.random() - 0.5) * 8;
        const z1 = (Math.random() - 0.5) * 8;
        const x2 = x1 + (Math.random() - 0.5) * 1.5;
        const y2 = y1 + (Math.random() - 0.5) * 1.5;
        const z2 = z1 + (Math.random() - 0.5) * 1.5;
        linesPositions.push(x1, y1, z1, x2, y2, z2);
      }

      linesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linesPositions, 3));
      const linesMesh = new THREE.LineSegments(linesGeometry, linesMaterial);
      scene.add(linesMesh);

      let animationId: number | null = null;
      const animate = () => {
        animationId = requestAnimationFrame(animate);
        particlesMesh.rotation.y += 0.0003;
        particlesMesh.rotation.x += 0.0001;
        linesMesh.rotation.y -= 0.0002;
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
        if (animationId !== null) cancelAnimationFrame(animationId);
        renderer.dispose();
        particlesGeometry.dispose();
        particlesMaterial.dispose();
        linesGeometry.dispose();
        linesMaterial.dispose();
      };
    })();
  }, [theme]);

  const getStatusColor = (status: string) => {
    if (theme === 'dark') {
      switch (status) {
        case 'resolved': return 'text-green-300 bg-green-900/30';
        case 'closed': return 'text-emerald-300 bg-emerald-900/30';
        case 'in-progress': return 'text-blue-300 bg-blue-900/30';
        case 'open': return 'text-amber-300 bg-amber-900/30';
        case 'pending': return 'text-yellow-300 bg-yellow-900/30';
        case 'escalated': return 'text-red-300 bg-red-900/30';
        default: return 'text-gray-300 bg-gray-800';
      }
    }

    switch (status) {
      case 'resolved': return 'text-green-700 bg-green-100';
      case 'closed': return 'text-emerald-700 bg-emerald-100';
      case 'in-progress': return 'text-blue-700 bg-blue-100';
      case 'open': return 'text-amber-700 bg-amber-100';
      case 'pending': return 'text-yellow-700 bg-yellow-100';
      case 'escalated': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    if (theme === 'dark') {
      switch (priority) {
        case 'high': return 'text-red-300 bg-red-900/30';
        case 'medium': return 'text-amber-300 bg-amber-900/30';
        case 'low': return 'text-green-300 bg-green-900/30';
        default: return 'text-gray-300 bg-gray-800';
      }
    }

    switch (priority) {
      case 'high': return 'text-red-700 bg-red-100';
      case 'medium': return 'text-amber-700 bg-amber-100';
      case 'low': return 'text-green-700 bg-green-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      'open': AlertCircle,
      'pending': Clock,
      'in-progress': PlayCircle,
      'resolved': CheckCircle,
      'closed': Check,
      'escalated': AlertOctagon
    };
    return icons[status as keyof typeof icons] || AlertCircle;
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

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedGrievance) return;

    // In a real application, this would make an API call
    const updatedGrievance = {
      ...selectedGrievance,
      communication: [
        ...selectedGrievance.communication,
        {
          id: selectedGrievance.communication.length + 1,
          type: 'response',
          message: newMessage,
          date: new Date().toLocaleString(),
          from: 'Support Officer',
          to: selectedGrievance.beneficiaryName
        }
      ]
    };

    setSelectedGrievance(updatedGrievance);
    setNewMessage('');
  };

  const handleUpdateStatus = (newStatus: string) => {
    if (!selectedGrievance) return;

    const updatedGrievance = {
      ...selectedGrievance,
      status: newStatus,
      lastUpdated: new Date().toLocaleString(),
      ...(newStatus === 'resolved' && { resolutionDate: new Date().toISOString().split('T')[0] })
    };

    setSelectedGrievance(updatedGrievance);
  };

  const handleEscalate = () => {
    if (!selectedGrievance) return;

    const updatedGrievance = {
      ...selectedGrievance,
      status: 'escalated',
      escalationLevel: selectedGrievance.escalationLevel + 1,
      assignedTo: 'Senior ' + selectedGrievance.assignedTo,
      lastUpdated: new Date().toLocaleString()
    };

    setSelectedGrievance(updatedGrievance);
  };

  return (
    <div data-theme={theme} className="p-4 lg:p-6 space-y-6">
      {/* Three.js Canvas Background (theme-aware) */}
      <canvas
        ref={canvasRef}
        id="grievance-three-canvas"
        className="fixed inset-0 w-full h-full pointer-events-none transition-opacity duration-500"
        style={{ zIndex: 0, background: 'transparent' }}
      />
      <style jsx global>{`
        [data-theme="dark"] {
          --bg-gradient: radial-gradient(1200px 600px at 10% 10%, rgba(30, 64, 175, 0.08), transparent 8%), 
                         radial-gradient(900px 500px at 90% 90%, rgba(245, 158, 11, 0.06), transparent 8%), 
                         linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%);
          --card-bg: rgba(15, 23, 42, 0.7);
          --card-border: rgba(255, 255, 255, 0.08);
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
          --card-bg: rgba(255, 255, 255, 0.8);
          --card-border: rgba(0, 0, 0, 0.06);
          --nav-bg: rgba(255, 255, 255, 0.95);
          --text-primary: #0f172a;
          --text-secondary: #475569;
          --text-muted: #64748b;
          --accent-primary: #fb7185;
          --accent-secondary: #fb923c;
          --glass-bg: rgba(255, 255, 255, 0.6);
          --glass-border: rgba(0, 0, 0, 0.08);
        }

        .theme-text-primary { color: var(--text-primary) !important; }
        .theme-text-secondary { color: var(--text-secondary) !important; }
        .theme-text-muted { color: var(--text-muted) !important; }
        .theme-bg-card { background: var(--card-bg) !important; }
        .theme-border-card { border-color: var(--card-border) !important; }
        .theme-bg-glass { background: var(--glass-bg) !important; }
        .theme-border-glass { border-color: var(--glass-border) !important; }
        .theme-bg-nav { background: var(--nav-bg) !important; }
        
        .accent-gradient {
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)) !important;
        }
        
        .text-accent-gradient {
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>
      
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold theme-text-primary mb-2">Grievance Redressal</h1>
          <p className="theme-text-secondary">Manage and resolve beneficiary grievances under PCR/PoA Acts</p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-xl theme-bg-glass theme-border-glass border flex items-center gap-2"
            onClick={() => window.print()}
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-xl accent-gradient text-white flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>New Grievance</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-4"
      >
        {[
          { label: 'Total', value: stats.total, color: 'from-blue-500 to-cyan-500', icon: Flag },
          { label: 'Open', value: stats.open, color: 'from-amber-500 to-orange-500', icon: AlertCircle },
          { label: 'In Progress', value: stats.inProgress, color: 'from-purple-500 to-pink-500', icon: PlayCircle },
          { label: 'Resolved', value: stats.resolved, color: 'from-green-500 to-emerald-500', icon: CheckCircle },
          { label: 'Escalated', value: stats.escalated, color: 'from-red-500 to-rose-500', icon: AlertOctagon },
          { label: 'Closed', value: stats.closed, color: 'from-gray-500 to-slate-500', icon: Check },
          { label: 'Avg Resolution', value: `${stats.avgResolutionTime}d`, color: 'from-teal-500 to-cyan-500', icon: Timer },
          { label: 'Satisfaction', value: `${stats.satisfactionRate}%`, color: 'from-yellow-500 to-amber-500', icon: Star }
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -4 }}
            className="theme-bg-card theme-border-glass border rounded-xl p-4 backdrop-blur-xl"
          >
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold theme-text-primary">{stat.value}</p>
            <p className="text-sm theme-text-muted">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Performance Overview */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <motion.div
          whileHover={{ y: -2 }}
          className="theme-bg-card theme-border-glass border rounded-xl p-6 backdrop-blur-xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm theme-text-muted">Resolution Rate</p>
              <p className="text-2xl font-bold theme-text-primary">
                {Math.round((stats.resolved / stats.total) * 100)}%
              </p>
            </div>
          </div>
          <p className="text-sm theme-text-secondary">
            {stats.resolved} out of {stats.total} grievances resolved
          </p>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="theme-bg-card theme-border-glass border rounded-xl p-6 backdrop-blur-xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm theme-text-muted">Avg Resolution Time</p>
              <p className="text-2xl font-bold theme-text-primary">{stats.avgResolutionTime} days</p>
            </div>
          </div>
          <p className="text-sm theme-text-secondary">
            Target: 7 days • -1.8 days from last month
          </p>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="theme-bg-card theme-border-glass border rounded-xl p-6 backdrop-blur-xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm theme-text-muted">Satisfaction Rate</p>
              <p className="text-2xl font-bold theme-text-primary">{stats.satisfactionRate}%</p>
            </div>
          </div>
          <p className="text-sm theme-text-secondary">
            Based on {stats.resolved} resolved grievances
          </p>
        </motion.div>
      </motion.div>

      {/* Category Distribution */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="theme-bg-card theme-border-glass border rounded-xl p-6 backdrop-blur-xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold theme-text-primary">Grievance Categories</h3>
            <p className="text-sm theme-text-muted">Distribution by complaint type</p>
          </div>
          <PieChart className="w-5 h-5 theme-text-muted" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(categoryStats).map(([category, count]) => {
            const Icon = getCategoryIcon(category);
            return (
              <div key={category} className="text-center p-4 rounded-lg theme-bg-glass">
                <Icon className="w-8 h-8 theme-text-primary mx-auto mb-2" />
                <p className="text-lg font-bold theme-text-primary">{count}</p>
                <p className="text-xs theme-text-muted capitalize">
                  {category.replace('-', ' ')}
                </p>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="theme-bg-card theme-border-glass border rounded-xl p-4 backdrop-blur-xl"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 theme-text-muted" />
            <input
              type="text"
              placeholder="Search by beneficiary, grievance ID, or district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 theme-bg-glass rounded-lg p-1 sm:p-2">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded ${viewMode === 'table' ? 'accent-gradient text-white' : 'theme-text-muted'}`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded ${viewMode === 'cards' ? 'accent-gradient text-white' : 'theme-text-muted'}`}
            >
              Cards
            </button>
          </div>

          {/* Filter Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2.5 rounded-lg theme-border-glass border flex items-center gap-2 ${showFilters ? 'accent-gradient text-white' : 'theme-bg-glass'}`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {(statusFilter !== 'all' || categoryFilter !== 'all' || priorityFilter !== 'all' || actTypeFilter !== 'all') && (
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </motion.button>
        </div>

        {/* Expanded Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-4 pt-4 border-t theme-border-glass">
                <div>
                  <label className="block text-sm theme-text-muted mb-2">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary"
                  >
                    <option value="all">All Statuses</option>
                    <option value="open">Open</option>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                    <option value="escalated">Escalated</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm theme-text-muted mb-2">Category</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary"
                  >
                    <option value="all">All Categories</option>
                    <option value="disbursement-delay">Disbursement Delay</option>
                    <option value="document-issues">Document Issues</option>
                    <option value="application-status">Application Status</option>
                    <option value="officer-behavior">Officer Behavior</option>
                    <option value="information-correction">Information Correction</option>
                    <option value="technical-issues">Technical Issues</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm theme-text-muted mb-2">Priority</label>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary"
                  >
                    <option value="all">All Priorities</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm theme-text-muted mb-2">Act Type</label>
                  <select
                    value={actTypeFilter}
                    onChange={(e) => setActTypeFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary"
                  >
                    <option value="all">All Acts</option>
                    <option value="PCR Act">PCR Act</option>
                    <option value="PoA Act">PoA Act</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm theme-text-muted mb-2">Assigned To</label>
                  <select
                    value={assignedToFilter}
                    onChange={(e) => setAssignedToFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary"
                  >
                    <option value="all">All Officers</option>
                    <option value="Officer Sharma">Officer Sharma</option>
                    <option value="Officer Verma">Officer Verma</option>
                    <option value="Officer Kapoor">Officer Kapoor</option>
                    <option value="Officer Gupta">Officer Gupta</option>
                    <option value="Officer Mishra">Officer Mishra</option>
                    <option value="IT Support">IT Support</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

       {/* Grievances List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="theme-bg-card theme-border-glass border rounded-xl backdrop-blur-xl overflow-hidden"
      >
        {viewMode === 'table' ? (
          isMobile ? (
            <div className="p-3 space-y-3">
              {paginatedGrievances.map((grievance, idx) => {
                const StatusIcon = getStatusIcon(grievance.status);
                const CategoryIcon = getCategoryIcon(grievance.category);
                
                return (
                  <motion.div
                    key={grievance.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    whileTap={{ scale: 0.995 }}
                    className="theme-bg-glass theme-border-glass border rounded-xl p-4 active:bg-opacity-80"
                    onClick={() => setSelectedGrievance(grievance)}
                  >
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-12 h-12 rounded-lg accent-gradient flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-md">
                          {grievance.beneficiaryName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold theme-text-primary truncate">{grievance.beneficiaryName}</p>
                          <p className="text-xs theme-text-muted truncate">{grievance.id}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${getPriorityColor(grievance.priority)}`}>
                        {grievance.priority.toUpperCase()}
                      </span>
                    </div>

                    {/* Info Grid */}
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="theme-text-muted flex items-center gap-1.5">
                          <CategoryIcon className="w-3.5 h-3.5" />
                          Category
                        </span>
                        <span className="theme-text-primary font-medium capitalize">{grievance.category.replace('-', ' ')}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="theme-text-muted flex items-center gap-1.5">
                          <Scale className="w-3.5 h-3.5" />
                          Act Type
                        </span>
                        <span className="theme-text-primary font-medium">{grievance.actType}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="theme-text-muted flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5" />
                          Assigned To
                        </span>
                        <span className="theme-text-primary font-medium truncate max-w-[180px]">{grievance.assignedTo}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="theme-text-muted flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" />
                          Location
                        </span>
                        <span className="theme-text-primary font-medium">{grievance.district}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="theme-text-muted flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          Created
                        </span>
                        <span className="theme-text-primary font-medium font-mono text-[10px]">{new Date(grievance.createdDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="mb-3 pb-3 border-b theme-border-glass">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusColor(grievance.status)}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        <span className="capitalize">{grievance.status.replace('-', ' ')}</span>
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedGrievance(grievance); }}
                        className="px-3 py-2 rounded-lg accent-gradient text-white text-xs font-medium flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); }}
                        className="px-3 py-2 rounded-lg theme-bg-card theme-border-glass border text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-blue-500/10 active:scale-95 transition-all"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); }}
                        className="px-3 py-2 rounded-lg theme-bg-card theme-border-glass border text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-red-500/10 active:scale-95 transition-all"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                        <span>More</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="theme-bg-glass border-b theme-border-glass">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold theme-text-primary">Grievance ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold theme-text-primary">Beneficiary</th>
                    <th className="hidden sm:table-cell px-4 py-3 text-left text-sm font-semibold theme-text-primary">Category</th>
                    <th className="hidden md:table-cell px-4 py-3 text-left text-sm font-semibold theme-text-primary">Act Type</th>
                    <th className="hidden lg:table-cell px-4 py-3 text-left text-sm font-semibold theme-text-primary">Assigned To</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold theme-text-primary">Status</th>
                    <th className="hidden sm:table-cell px-4 py-3 text-left text-sm font-semibold theme-text-primary">Priority</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold theme-text-primary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedGrievances.map((grievance, idx) => (
                    <motion.tr
                      key={grievance.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-b theme-border-glass hover:theme-bg-glass transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-medium theme-text-primary">{grievance.id}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg accent-gradient flex items-center justify-center text-white text-xs font-bold">
                            {grievance.beneficiaryName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="text-sm font-medium theme-text-primary">{grievance.beneficiaryName}</p>
                            <p className="text-xs theme-text-muted">{grievance.district}</p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-4 py-3">
                        <div className="flex items-center gap-2">
                          {(() => {
                            const Icon = getCategoryIcon(grievance.category);
                            return <Icon className="w-4 h-4 theme-text-muted" />;
                          })()}
                          <span className="text-sm theme-text-primary capitalize">
                            {grievance.category.replace('-', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-4 py-3">
                        <span className="px-2 py-1 rounded text-xs font-medium theme-bg-glass">
                          {grievance.actType}
                        </span>
                      </td>
                      <td className="hidden lg:table-cell px-4 py-3 text-sm theme-text-primary">
                        {grievance.assignedTo}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(grievance.status)}`}>
                          {(() => {
                            const Icon = getStatusIcon(grievance.status);
                            return <Icon className="w-3 h-3" />;
                          })()}
                          {grievance.status.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="hidden sm:table-cell px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(grievance.priority)}`}>
                          {grievance.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setSelectedGrievance(grievance)}
                            className="p-1.5 rounded-lg theme-bg-glass hover:accent-gradient hover:text-white transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-1.5 rounded-lg theme-bg-glass hover:accent-gradient hover:text-white transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-1.5 rounded-lg theme-bg-glass hover:bg-red-500/20 hover:text-red-400 transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {paginatedGrievances.map((grievance, idx) => (
              <motion.div
                key={grievance.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -4 }}
                className="theme-bg-glass theme-border-glass border rounded-xl p-4 cursor-pointer"
                onClick={() => setSelectedGrievance(grievance)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg accent-gradient flex items-center justify-center text-white font-bold">
                      {grievance.beneficiaryName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium theme-text-primary">{grievance.beneficiaryName}</p>
                      <p className="text-xs theme-text-muted">{grievance.id}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(grievance.priority)}`}>
                    {grievance.priority}
                  </span>
                </div>
                
                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-sm theme-text-secondary">
                    {(() => {
                      const Icon = getCategoryIcon(grievance.category);
                      return <Icon className="w-4 h-4" />;
                    })()}
                    <span className="capitalize">{grievance.category.replace('-', ' ')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm theme-text-secondary">
                    <Scale className="w-4 h-4" />
                    <span>{grievance.actType}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm theme-text-secondary">
                    <UserCheck className="w-4 h-4" />
                    <span>{grievance.assignedTo}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm theme-text-secondary">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(grievance.createdDate).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t theme-border-glass">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(grievance.status)}`}>
                    {(() => {
                      const Icon = getStatusIcon(grievance.status);
                      return <Icon className="w-3 h-3" />;
                    })()}
                    {grievance.status.replace('-', ' ')}
                  </span>
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 rounded-lg hover:theme-bg-card">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 rounded-lg hover:theme-bg-card">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t theme-border-glass theme-bg-glass">
          <p className="text-sm theme-text-muted">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredGrievances.length)} of {filteredGrievances.length}
          </p>
          <div className="flex items-center gap-2">
            {isMobile ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p: number) => p - 1)}
                  className="px-4 py-2 rounded-lg theme-bg-card theme-border-glass border disabled:opacity-50"
                >
                  Prev
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p: number) => p + 1)}
                  className="px-4 py-2 rounded-lg theme-bg-card theme-border-glass border disabled:opacity-50"
                >
                  Next
                </motion.button>
              </>
            ) : (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p: number) => p - 1)}
                  className="p-2 rounded-lg theme-bg-card theme-border-glass border disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </motion.button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1.5 rounded-lg ${currentPage === i + 1 ? 'accent-gradient text-white' : 'theme-bg-card theme-border-glass border'}`}
                  >
                    {i + 1}
                  </motion.button>
                ))}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p: number) => p + 1)}
                  className="p-2 rounded-lg theme-bg-card theme-border-glass border disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Grievance Detail Modal */}
      <AnimatePresence>
        {selectedGrievance && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedGrievance(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`${isMobile ? 'theme-bg-card theme-border-glass border rounded-tl-none rounded-tr-none w-full h-full max-h-none overflow-y-auto' : 'theme-bg-card theme-border-glass border rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto'}`}
            >
              <div className="sticky top-0 theme-bg-nav backdrop-blur-xl border-b theme-border-glass p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold theme-text-primary">{selectedGrievance.id}</h2>
                  <p className="theme-text-muted">Grievance Details • {selectedGrievance.actType}</p>
                </div>
                <button
                  onClick={() => setSelectedGrievance(null)}
                  className="p-2 rounded-lg theme-bg-glass hover:bg-red-500/20"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="border-b theme-border-glass">
                <div className="flex overflow-x-auto">
                  {['details', 'communication', 'timeline', 'documents'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === tab
                          ? 'border-blue-500 text-blue-600 theme-text-primary'
                          : 'border-transparent theme-text-muted hover:theme-text-primary'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6 space-y-6">
                {activeTab === 'details' && (
                  <>
                    {/* Beneficiary Information */}
                    <div>
                      <h3 className="text-lg font-semibold theme-text-primary mb-4">Beneficiary Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="flex items-center gap-3 p-3 rounded-lg theme-bg-glass">
                          <User className="w-5 h-5 theme-text-muted" />
                          <div>
                            <p className="text-xs theme-text-muted">Beneficiary Name</p>
                            <p className="font-medium theme-text-primary">{selectedGrievance.beneficiaryName}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg theme-bg-glass">
                          <Phone className="w-5 h-5 theme-text-muted" />
                          <div>
                            <p className="text-xs theme-text-muted">Phone Number</p>
                            <p className="font-medium theme-text-primary">{selectedGrievance.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg theme-bg-glass">
                          <MapPin className="w-5 h-5 theme-text-muted" />
                          <div>
                            <p className="text-xs theme-text-muted">Location</p>
                            <p className="font-medium theme-text-primary">{selectedGrievance.district}, {selectedGrievance.state}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Grievance Details */}
                    <div>
                      <h3 className="text-lg font-semibold theme-text-primary mb-4">Grievance Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="p-3 rounded-lg theme-bg-glass">
                          <p className="text-xs theme-text-muted mb-1">Category</p>
                          <div className="flex items-center gap-2">
                            {(() => {
                              const Icon = getCategoryIcon(selectedGrievance.category);
                              return <Icon className="w-4 h-4 theme-text-primary" />;
                            })()}
                            <p className="font-medium theme-text-primary capitalize">
                              {selectedGrievance.category.replace('-', ' ')}
                            </p>
                          </div>
                        </div>
                        <div className="p-3 rounded-lg theme-bg-glass">
                          <p className="text-xs theme-text-muted mb-1">Sub Category</p>
                          <p className="font-medium theme-text-primary capitalize">
                            {selectedGrievance.subCategory.replace('-', ' ')}
                          </p>
                        </div>
                        <div className="p-3 rounded-lg theme-bg-glass">
                          <p className="text-xs theme-text-muted mb-1">Application ID</p>
                          <p className="font-medium theme-text-primary">{selectedGrievance.applicationId}</p>
                        </div>
                        <div className="p-3 rounded-lg theme-bg-glass">
                          <p className="text-xs theme-text-muted mb-1">Act Type</p>
                          <p className="font-medium theme-text-primary">{selectedGrievance.actType}</p>
                        </div>
                        <div className="p-3 rounded-lg theme-bg-glass">
                          <p className="text-xs theme-text-muted mb-1">Created Date</p>
                          <p className="font-medium theme-text-primary">{new Date(selectedGrievance.createdDate).toLocaleDateString()}</p>
                        </div>
                        <div className="p-3 rounded-lg theme-bg-glass">
                          <p className="text-xs theme-text-muted mb-1">Expected Resolution</p>
                          <p className="font-medium theme-text-primary">{new Date(selectedGrievance.expectedResolution).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <h3 className="text-lg font-semibold theme-text-primary mb-4">Complaint Description</h3>
                      <div className="p-4 rounded-lg theme-bg-glass">
                        <p className="theme-text-primary leading-relaxed">{selectedGrievance.description}</p>
                      </div>
                    </div>

                    {/* Status and Assignment */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg theme-bg-glass border theme-border-glass">
                        <p className="text-sm theme-text-muted mb-2">Current Status</p>
                        <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border ${getStatusColor(selectedGrievance.status)}`}>
                          {(() => {
                            const Icon = getStatusIcon(selectedGrievance.status);
                            return <Icon className="w-4 h-4" />;
                          })()}
                          {selectedGrievance.status.replace('-', ' ').toUpperCase()}
                        </span>
                        <div className="mt-3 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="theme-text-muted">Escalation Level</span>
                            <span className="theme-text-primary font-medium">Level {selectedGrievance.escalationLevel}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="theme-text-muted">Last Updated</span>
                            <span className="theme-text-primary">{selectedGrievance.lastUpdated}</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 rounded-lg theme-bg-glass border theme-border-glass">
                        <p className="text-sm theme-text-muted mb-2">Assignment Details</p>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="theme-text-primary font-medium">Assigned To</span>
                            <span className="theme-text-primary">{selectedGrievance.assignedTo}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="theme-text-muted">Assigned Date</span>
                            <span className="theme-text-primary">{new Date(selectedGrievance.assignedDate).toLocaleDateString()}</span>
                          </div>
                          {selectedGrievance.satisfactionRating && (
                            <div className="flex justify-between text-sm">
                              <span className="theme-text-muted">Satisfaction Rating</span>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < selectedGrievance.satisfactionRating
                                        ? 'text-yellow-500 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'communication' && (
                  <div className="space-y-6">
                    {/* Communication History */}
                    <div>
                      <h3 className="text-lg font-semibold theme-text-primary mb-4">Communication History</h3>
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {selectedGrievance.communication.map((comm) => (
                          <div key={comm.id} className="flex gap-4">
                            <div className="flex-shrink-0">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                comm.type === 'complaint' ? 'bg-red-100 text-red-600' :
                                comm.type === 'response' ? 'bg-blue-100 text-blue-600' :
                                comm.type === 'resolution' ? 'bg-green-100 text-green-600' :
                                comm.type === 'escalation' ? 'bg-orange-100 text-orange-600' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                {comm.type === 'complaint' && <AlertCircle className="w-5 h-5" />}
                                {comm.type === 'response' && <MessageCircle className="w-5 h-5" />}
                                {comm.type === 'resolution' && <CheckCircle className="w-5 h-5" />}
                                {comm.type === 'escalation' && <AlertOctagon className="w-5 h-5" />}
                                {comm.type === 'acknowledgment' && <Check className="w-5 h-5" />}
                              </div>
                            </div>
                            <div className="flex-1 theme-bg-glass rounded-lg p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <p className="font-medium theme-text-primary">{comm.from}</p>
                                  <p className="text-xs theme-text-muted">to {comm.to}</p>
                                </div>
                                <span className="text-xs theme-text-muted">{comm.date}</span>
                              </div>
                              <p className="theme-text-primary">{comm.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* New Message */}
                    <div>
                      <h3 className="text-lg font-semibold theme-text-primary mb-4">Send Response</h3>
                      <div className="space-y-3">
                        <textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type your response here..."
                          rows={4}
                          className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary resize-none"
                        />
                        <div className="flex justify-between items-center">
                          <div className="flex gap-2">
                            <button className="p-2 rounded-lg theme-bg-glass hover:theme-bg-card">
                              <Paperclip className="w-4 h-4" />
                            </button>
                            <button className="p-2 rounded-lg theme-bg-glass hover:theme-bg-card">
                              <PhoneCall className="w-4 h-4" />
                            </button>
                            <button className="p-2 rounded-lg theme-bg-glass hover:theme-bg-card">
                              <Video className="w-4 h-4" />
                            </button>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim()}
                            className="px-4 py-2 rounded-lg bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            <Send className="w-4 h-4" />
                            Send Response
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'timeline' && (
                  <div>
                    <h3 className="text-lg font-semibold theme-text-primary mb-4">Grievance Timeline</h3>
                    <div className="space-y-4">
                      {[
                        { 
                          step: 'Grievance Registered', 
                          date: selectedGrievance.createdDate,
                          status: 'completed',
                          description: 'Grievance successfully registered in the system'
                        },
                        { 
                          step: 'Assigned to Officer', 
                          date: selectedGrievance.assignedDate,
                          status: 'completed',
                          description: `Assigned to ${selectedGrievance.assignedTo}`
                        },
                        { 
                          step: 'Under Investigation', 
                          date: selectedGrievance.lastUpdated,
                          status: selectedGrievance.status === 'resolved' || selectedGrievance.status === 'closed' ? 'completed' : 'current',
                          description: 'Officer investigating the complaint'
                        },
                        { 
                          step: 'Resolution', 
                          date: selectedGrievance.resolutionDate,
                          status: selectedGrievance.status === 'resolved' || selectedGrievance.status === 'closed' ? 'completed' : 'pending',
                          description: 'Grievance resolution in progress'
                        },
                        { 
                          step: 'Closed', 
                          date: selectedGrievance.resolutionDate,
                          status: selectedGrievance.status === 'closed' ? 'completed' : 'pending',
                          description: 'Grievance closed after resolution'
                        }
                      ].map((item, idx) => (
                        <div key={idx} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              item.status === 'completed' ? 'bg-green-500/20 border-2 border-green-500' :
                              item.status === 'current' ? 'bg-blue-500/20 border-2 border-blue-500 animate-pulse' :
                              'bg-gray-500/20 border-2 border-gray-500'
                            }`}>
                              {item.status === 'completed' && <Check className="w-4 h-4 text-green-400" />}
                              {item.status === 'current' && <Clock className="w-4 h-4 text-blue-400" />}
                            </div>
                            {idx < 4 && <div className="w-0.5 h-12 bg-gray-500/20 mt-2"></div>}
                          </div>
                          <div className="flex-1 pb-8">
                            <p className="font-medium theme-text-primary">{item.step}</p>
                            <p className="text-sm theme-text-muted">{item.description}</p>
                            {item.date && <p className="text-xs theme-text-muted mt-1">{new Date(item.date).toLocaleString()}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'documents' && (
                  <div>
                    <h3 className="text-lg font-semibold theme-text-primary mb-4">Attached Documents</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        'Complaint Form',
                        'Supporting Documents',
                        'Identity Proof',
                        'Application Copy'
                      ].map((doc, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 rounded-lg theme-bg-glass hover:theme-border-glass border border-transparent transition-all">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                              <FileText className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                              <p className="font-medium theme-text-primary">{doc}</p>
                              <p className="text-xs theme-text-muted">PDF • 1.2 MB</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button className="p-2 rounded-lg hover:theme-bg-card">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-2 rounded-lg hover:theme-bg-card">
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-6 border-t theme-border-glass">
                  {selectedGrievance.status !== 'resolved' && selectedGrievance.status !== 'closed' && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleUpdateStatus('resolved')}
                      className="flex-1 px-4 py-3 rounded-xl bg-green-500/20 text-green-300 border border-green-500/30 font-semibold flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Mark as Resolved
                    </motion.button>
                  )}
                  {selectedGrievance.status !== 'escalated' && selectedGrievance.escalationLevel < 3 && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleEscalate}
                      className="flex-1 px-4 py-3 rounded-xl bg-orange-500/20 text-orange-300 border border-orange-500/30 font-semibold flex items-center justify-center gap-2"
                    >
                      <AlertOctagon className="w-5 h-5" />
                      Escalate Grievance
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-4 py-3 rounded-xl theme-bg-glass theme-border-glass border font-semibold flex items-center justify-center gap-2"
                  >
                    <PhoneCall className="w-5 h-5" />
                    Call Beneficiary
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-4 py-3 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30 font-semibold flex items-center justify-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    Close Grievance
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Add missing Paperclip component
const Paperclip = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
  </svg>
);

export default GrievancePage;