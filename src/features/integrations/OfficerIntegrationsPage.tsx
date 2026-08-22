"use client";
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useLocale } from '@/context/LocaleContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,Download, Plus, Eye, Edit,
  ChevronLeft, ChevronRight, X,
  Clock, AlertCircle, FileText, DollarSign,
  RefreshCw, TrendingUp,
  Shield, Scale,
  Banknote, Fingerprint, CreditCard,
  CheckCircle, XCircle,
  Users, Map as MapIcon, Timer,
  Database, Server, Cloud, Wifi, Network,
  Activity, Zap, Cpu, Globe,
  ExternalLink,
  Code,
  Calendar,
  Gauge,
  Lock,
  Key
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { collection, doc, onSnapshot, setDoc, updateDoc, addDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Real government platform logos (using SVG components)
const PlatformLogos = {
  UIDAI: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 100 100" className={props.className ?? "w-6 h-6"}>
      <circle cx="50" cy="50" r="45" fill="#FF9933" />
      <circle cx="50" cy="50" r="35" fill="#FFFFFF" />
      <circle cx="50" cy="50" r="25" fill="#138808" />
      <path d="M50 25 L50 75 M35 50 L65 50" stroke="#000080" strokeWidth="3" />
    </svg>
  ),
  MeitY: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 100 100" className={props.className ?? "w-6 h-6"}>
      <rect x="20" y="20" width="60" height="60" rx="10" fill="#1E40AF" />
      <path d="M40 35 L60 50 L40 65 Z" fill="#FFFFFF" />
    </svg>
  ),
  MHA: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 100 100" className={props.className ?? "w-6 h-6"}>
      <rect x="25" y="25" width="50" height="50" fill="#DC2626" />
      <path d="M45 40 L55 50 L45 60 Z M55 40 L45 50 L55 60 Z" fill="#FFFFFF" />
    </svg>
  ),
  'eCommittee, SC': (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 100 100" className={props.className ?? "w-6 h-6"}>
      <path d="M50 20 L80 40 L80 80 L20 80 L20 40 Z" fill="#7C3AED" />
      <circle cx="50" cy="50" r="15" fill="#FFFFFF" />
      <path d="M50 40 L50 60 M40 50 L60 50" stroke="#7C3AED" strokeWidth="3" />
    </svg>
  ),
  NSDL: (props: React.SVGProps<SVGSVGElement>) => {
    const { t } = useLocale();
    return (
      <svg {...props} viewBox="0 0 100 100" className={props.className ?? "w-6 h-6"}>
        <rect x="20" y="20" width="60" height="60" rx="5" fill="#059669" />
        <text x="50" y="55" textAnchor="middle" fill="#FFFFFF" fontSize="20" fontWeight="bold">{t('extracted.nsdl')} </text>
      </svg>
    );
  },
  NPCI: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 100 100" className={props.className ?? "w-6 h-6"}>
      <circle cx="50" cy="50" r="40" fill="#2563EB" />
      <path d="M35 40 L65 40 L50 70 Z" fill="#FFFFFF" />
    </svg>
  ),
  CBDT: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 100 100" className={props.className ?? "w-6 h-6"}>
      <rect x="25" y="25" width="50" height="50" fill="#D97706" />
      <path d="M40 40 L60 40 L60 60 L40 60 Z" fill="#FFFFFF" />
      <path d="M45 45 L55 45 L55 55 L45 55 Z" fill="#D97706" />
    </svg>
  ),
  'Ministry of Rural Development': (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 100 100" className={props.className ?? "w-6 h-6"}>
      <path d="M30 30 L70 30 L70 70 L30 70 Z" fill="#16A34A" />
      <circle cx="50" cy="50" r="15" fill="#FFFFFF" />
      <path d="M45 45 L55 45 L55 55 L45 55 Z" fill="#16A34A" />
    </svg>
  ),
  'Various State Governments': (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 100 100" className={props.className ?? "w-6 h-6"}>
      <path d="M35 35 L65 35 L65 65 L35 65 Z" fill="#9333EA" />
      <circle cx="40" cy="40" r="5" fill="#FFFFFF" />
      <circle cx="60" cy="40" r="5" fill="#FFFFFF" />
      <circle cx="50" cy="60" r="5" fill="#FFFFFF" />
    </svg>
  )
};




const IntegrationsPage = () => {
  const { theme } = useTheme();
  const { t } = useLocale();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [healthFilter, setHealthFilter] = useState('all');
  const [sortBy] = useState('name');
  const [sortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [selectedIntegration, setSelectedIntegration] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'compact'>('grid');
  const [activeTab, setActiveTab] = useState('overview');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // Firestore-backed integrations state
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [loadingIntegrations, setLoadingIntegrations] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedIntegration, setEditedIntegration] = useState<any | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Subscribe to Firestore 'integrations' collection
  useEffect(() => {
    const q = query(collection(db, 'integrations'), orderBy('name'));
    const unsub = onSnapshot(q, (snap) => {
      const items: any[] = snap.docs.map(d => {
        const data = d.data() as any;
        console.log('Firebase document:', d.id, data); // Debug log
        return {
          id: d.id,
          name: data.name || 'Unnamed Integration',
          provider: data.provider || 'Unknown Provider',
          category: data.category || 'identity-verification',
          status: data.status || 'active',
          health: data.health || 'good',
          description: data.description || 'No description available',
          imageUrl: data.imageUrl || '',
          successRate: data.successRate || 100,
          responseTime: data.responseTime || '1s',
          endpoints: data.endpoints || 1,
          apiVersion: data.apiVersion || '1.0',
          lastSync: data.lastSync || '',
          nextSync: data.nextSync || '',
          syncFrequency: data.syncFrequency || 'hourly',
          apiKey: data.apiKey || '',
          security: data.security || '',
          dataEncryption: data.dataEncryption || '',
          documentation: data.documentation || '',
          compliance: data.compliance || [],
          usage: data.usage || { monthly: 0, daily: 0, errors: 0 },
          config: data.config || { authType: '', rateLimit: '', timeout: '' },
          logs: data.logs || [],
          createdAt: data.createdAt,
          lastModified: data.lastModified
        };
      });
      console.log('Processed integrations:', items); // Debug log
      setIntegrations(items);
      setLoadingIntegrations(false);
    }, (err) => {
      console.error('Integrations snapshot error', err);
      setLoadingIntegrations(false);
    });

    return () => unsub();
  }, []);

  const saveIntegration = async (id: string, updates: any) => {
    try {
      const updateData: any = { lastModified: serverTimestamp() };
      Object.keys(updates).forEach(key => {
        if (updates[key] !== undefined && key !== 'id' && key !== 'createdAt') {
          updateData[key] = updates[key];
        }
      });
      await updateDoc(doc(db, 'integrations', id), updateData);
    } catch (e) {
      console.error('Failed to save integration', e);
      throw e;
    }
  };

  const addIntegration = async (integration: any) => {
    try {
      await addDoc(collection(db, 'integrations'), { ...integration, createdAt: serverTimestamp() });
    } catch (e) {
      console.error('Failed to add integration', e);
      throw e;
    }
  };

  // Export helpers (CSV + PDF) for integrations
  const exportIntegrationsData = (items: any[]) => {
    const headers = [
      'ID', 'Name', 'Provider', 'Category', 'Status', 'Health', 'Success Rate', 'Response Time', 'Endpoints', 'API Version', 'Last Sync', 'Next Sync', 'Documentation'
    ];

    const rows = items.map(i => [
      i.id,
      i.name,
      i.provider,
      i.category,
      i.status,
      i.health,
      i.successRate != null ? String(i.successRate) : '',
      i.responseTime || '',
      i.endpoints != null ? String(i.endpoints) : '',
      i.apiVersion || '',
      i.lastSync || '',
      i.nextSync || '',
      i.documentation || ''
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `integrations_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportIntegrationsPDF = (items: any[]) => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'landscape' });
    const margin = 36;
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFillColor(30, 64, 175);
    doc.rect(0, 0, pageWidth, 56, 'F');

    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('Integrations Report', margin, 36);

    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, pageWidth - margin, 28, { align: 'right' });
    doc.text(`Total: ${items.length}`, pageWidth - margin, 44, { align: 'right' });

    const head = [[ 'ID', 'Name', 'Provider', 'Category', 'Status', 'Health', 'Success Rate', 'Response Time' ]];

    const body: any[] = [];
    items.forEach(i => {
      body.push([
        i.id,
        i.name,
        i.provider,
        i.category,
        i.status,
        i.health,
        i.successRate != null ? String(i.successRate) + '%' : '',
        i.responseTime || ''
      ]);
    });

    autoTable(doc, {
      head,
      body,
      startY: 70,
      styles: { fontSize: 9, cellPadding: 6, overflow: 'linebreak', cellWidth: 'wrap' },
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
      margin: { left: margin, right: margin, top: 70 },
      tableWidth: 'auto',
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 180 },
        2: { cellWidth: 120 },
        3: { cellWidth: 100 },
        4: { cellWidth: 70 },
        5: { cellWidth: 70 },
        6: { cellWidth: 80 },
        7: { cellWidth: 80 }
      }
    });

    doc.save(`integrations_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Filter and sort integrations (use live Firestore data)
  const dataSource = integrations;

 const filteredIntegrations = useMemo(() => {
  let filtered = [...dataSource];

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter((integration) =>
      integration.name.toLowerCase().includes(q) ||
      integration.provider.toLowerCase().includes(q) ||
      integration.category.toLowerCase().includes(q) ||
      String(integration.id).toLowerCase().includes(q)
    );
  }

  if (statusFilter !== 'all') {
    filtered = filtered.filter((integration) => integration.status === statusFilter);
  }

  if (categoryFilter !== 'all') {
    filtered = filtered.filter((integration) => integration.category === categoryFilter);
  }

  if (healthFilter !== 'all') {
    filtered = filtered.filter((integration) => integration.health === healthFilter);
  }

  filtered.sort((a, b) => {
    const aVal = a[sortBy as keyof typeof a];
    const bVal = b[sortBy as keyof typeof b];

    // simple fallback to avoid weird comparisons
    if (aVal === bVal) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;

    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  return filtered;
}, [
  dataSource,            // 🔥 IMPORTANT
  searchQuery,
  statusFilter,
  categoryFilter,
  healthFilter,
  sortBy,
  sortOrder,
]);
  // Pagination
  const totalPages = Math.ceil(filteredIntegrations.length / itemsPerPage);
  const paginatedIntegrations = filteredIntegrations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

 // Statistics
const stats = useMemo(() => {
  const total = dataSource.length;
  const active = dataSource.filter((i) => i.status === 'active').length;
  const inactive = dataSource.filter((i) => i.status === 'inactive').length;
  const excellent = dataSource.filter((i) => i.health === 'excellent').length;
  const good = dataSource.filter((i) => i.health === 'good').length;
  const fair = dataSource.filter((i) => i.health === 'fair').length;
  const offline = dataSource.filter((i) => i.health === 'offline').length;

  const totalEndpoints = dataSource.reduce(
    (sum: number, i: any) => sum + (i.endpoints || 0),
    0
  );
  const avgSuccessRate =
    dataSource.reduce(
      (sum: number, i: any) => sum + (Number(i.successRate) || 0),
      0
    ) / Math.max(1, total);

  return {
    total,
    active,
    inactive,
    excellent,
    good,
    fair,
    offline,
    totalEndpoints,
    avgSuccessRate: Math.round(avgSuccessRate * 10) / 10,
  };
}, [dataSource]);      
  // Category distribution
  const categoryStats = useMemo(() => {
    const categories = {
      'identity-verification': dataSource.filter(i => i.category === 'identity-verification').length,
      'document-verification': dataSource.filter(i => i.category === 'document-verification').length,
      'crime-records': dataSource.filter(i => i.category === 'crime-records').length,
      'court-records': dataSource.filter(i => i.category === 'court-records').length,
      'banking-services': dataSource.filter(i => i.category === 'banking-services').length,
      'payment-services': dataSource.filter(i => i.category === 'payment-services').length,
      'financial-verification': dataSource.filter(i => i.category === 'financial-verification').length,
      'social-welfare': dataSource.filter(i => i.category === 'social-welfare').length,
      'state-integrations': dataSource.filter(i => i.category === 'state-integrations').length,
      'cloud-services': dataSource.filter(i => i.category === 'cloud-services').length
    };
    return categories;
  }, [integrations]);

  // mobile detection removed (isMobile unused) — viewMode can be toggled manually

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

      // Theme-aware colors
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

  const getStatusColor = (status: string) => {
    const colors = {
      active: theme === 'dark' ? 'text-green-300 bg-green-900/30' : 'text-green-700 bg-green-100',
      inactive: theme === 'dark' ? 'text-red-300 bg-red-900/30' : 'text-red-700 bg-red-100',
      pending: theme === 'dark' ? 'text-amber-300 bg-amber-900/30' : 'text-amber-700 bg-amber-100'
    };
    return colors[status as keyof typeof colors] || 'text-gray-300 bg-gray-800';
  };

  const getHealthColor = (health: string) => {
    const colors = {
      excellent: theme === 'dark' ? 'text-green-300 bg-green-900/30' : 'text-green-700 bg-green-100',
      good: theme === 'dark' ? 'text-blue-300 bg-blue-900/30' : 'text-blue-700 bg-blue-100',
      fair: theme === 'dark' ? 'text-amber-300 bg-amber-900/30' : 'text-amber-700 bg-amber-100',
      offline: theme === 'dark' ? 'text-red-300 bg-red-900/30' : 'text-red-700 bg-red-100'
    };
    return colors[health as keyof typeof colors] || 'text-gray-300 bg-gray-800';
  };

  const getHealthIcon = (health: string) => {
    const icons = {
      'excellent': CheckCircle,
      'good': CheckCircle,
      'fair': AlertCircle,
      'offline': XCircle
    };
    return icons[health as keyof typeof icons] || CheckCircle;
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      'identity-verification': Fingerprint,
      'document-verification': FileText,
      'crime-records': Shield,
      'court-records': Scale,
      'banking-services': Banknote,
      'payment-services': CreditCard,
      'financial-verification': DollarSign,
      'social-welfare': Users,
      'state-integrations': MapIcon,
      'cloud-services': Cloud
    };
    return icons[category as keyof typeof icons] || Database;
  };

  const formatCategoryName = (category: string) => {
    return category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getPlatformLogo = (provider: string) => {
    const LogoComponent = PlatformLogos[provider as keyof typeof PlatformLogos];
    const colorClass = theme === 'light' ? 'text-black' : 'text-white';
    const sizeClass = 'w-6 h-6';
    return LogoComponent ? <LogoComponent className={`${sizeClass} ${colorClass}`} /> : <Database className={`${sizeClass} ${colorClass}`} />;
  };

  const handleTestConnection = (integrationId: string) => {
    console.log(`Testing connection for integration: ${integrationId}`);
  };

  const handleSyncNow = (integrationId: string) => {
    console.log(`Manual sync triggered for integration: ${integrationId}`);
  };

  return (
  <div data-theme={theme} className="p-3 sm:p-4 lg:p-5 space-y-5 relative overflow-hidden">
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
      `}</style>

      {/* Header Section - Real-time Monitoring */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-5 p-4 sm:p-5 rounded-xl theme-bg-card theme-border-glass border backdrop-blur-xl overflow-hidden"
      >
        {/* Animated gradient background */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl"
        />
        
        <div className="relative z-10 text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
            <motion.div
              className="w-3 h-3 rounded-full bg-cyan-500"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [1, 0.8, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-sm font-medium theme-text-secondary">
              {t('extracted.live_tracking')} • {filteredIntegrations.length} {t('extracted.active_integrations')}
            </span>
          </div>
          <h1 className="text-2xl sm:text-lg font-semibold tracking-tight theme-text-primary mb-2">
            {t('extracted.integration')} <span className="text-accent-gradient inline-block leading-normal ml-2">{t('extracted.monitoring_center')}</span>
          </h1>
          <p className="theme-text-secondary max-w-2xl mx-auto lg:mx-0">{t('extracted.realtime_integration_tracking_description')}</p>
        </div>
        
        <div className="relative z-10 flex flex-col items-center gap-2 sm:flex-row sm:justify-end sm:gap-3">
          {/* View mode toggle */}
          <div className="flex items-center gap-2 mr-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 rounded-xl text-sm font-semibold ${viewMode === 'grid' ? 'accent-gradient text-white' : (theme === 'light' ? 'bg-white/90 text-black border border-gray-200' : 'theme-bg-glass theme-text-primary')}`}
            >
              {t('extracted.grid')} 
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded-xl text-sm font-semibold ${viewMode === 'list' ? 'accent-gradient text-white' : (theme === 'light' ? 'bg-white/90 text-black border border-gray-200' : 'theme-bg-glass theme-text-primary')}`}
            >
               {t('extracted.list')} 
            </button>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={t('extracted.export_report_1')}
            onClick={() => setShowExportModal(true)}
            className={`w-full sm:w-auto flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-2 sm:py-3 rounded-xl border glass-effect focus:outline-none focus:ring-2 focus:ring-offset-2 ${theme === 'light' ? 'theme-bg-glass theme-border-glass text-black focus:ring-black/40' : 'theme-bg-glass theme-border-glass theme-text-primary focus:ring-white/20'}`}
          >
            <Download className={`w-5 h-5 ${theme === 'light' ? 'text-black' : 'text-white'}`} />
            <span className={`font-semibold ${theme === 'light' ? 'text-black' : 'theme-text-primary'}`}>{t('extracted.export_data')}</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setEditedIntegration({ name: '', provider: '', category: 'identity-verification', status: 'active', health: 'good', lastSync: '', nextSync: '', syncFrequency: 'hourly', successRate: 100, responseTime: '1s', apiVersion: '1.0', endpoints: 1, description: '', documentation: '', apiKey: '', security: '', dataEncryption: '', compliance: [], usage: { monthly: 0, daily: 0, errors: 0 }, config: { authType: '', rateLimit: '', timeout: '' }, logs: [], imageUrl: '' });
              setIsAdding(true);
            }}
            className="px-3 sm:px-6 py-2 sm:py-3 rounded-xl accent-gradient text-white flex items-center gap-2 sm:gap-3 shadow-sm text-sm sm:text-base"
          >
            <Plus className="w-5 h-5" />
            <span className="font-semibold">{t('extracted.new_integration')}</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Inline New Integration Section (appears below metrics when adding) */}
      <AnimatePresence>
  {(selectedIntegration || isAdding) && (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.2 }}
      className="mt-4 sm:mt-6 w-full fixed inset-0 z-50 sm:relative sm:inset-auto"
    >
      <motion.div
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.98, opacity: 0 }}
        className={`border rounded-none w-full h-full mx-0 my-0 overflow-visible shadow-sm sm:rounded-xl sm:mx-auto sm:my-6 ${
          theme === 'light'
            ? 'bg-white border-gray-200'
            : 'bg-slate-900 border-gray-700'
        }`}
      >
        {/* Header */}
        <div
          className={`sticky top-0 backdrop-blur-xl border-b p-4 sm:p-5 ${
            theme === 'light'
              ? 'bg-white/95 border-gray-200'
              : 'theme-bg-card theme-border-glass'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 sm:gap-4 flex-1">
              <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                {((isEditing || isAdding) && editedIntegration && editedIntegration.imageUrl) || (selectedIntegration && selectedIntegration.imageUrl) ? (
                  <img
                    src={((isEditing || isAdding) && editedIntegration && editedIntegration.imageUrl) ? editedIntegration.imageUrl : selectedIntegration.imageUrl}
                    alt={((isEditing || isAdding) && editedIntegration) ? editedIntegration.name : selectedIntegration.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const sib =
                        e.currentTarget.nextElementSibling as
                          | HTMLElement
                          | null;
                      if (sib) sib.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className={`w-full h-full flex items-center justify-center accent-gradient text-white ${
                    ((isEditing || isAdding) &&
                    editedIntegration &&
                    editedIntegration.imageUrl) || (selectedIntegration && selectedIntegration.imageUrl)
                      ? 'hidden'
                      : ''
                  }`}
                >
                  {getPlatformLogo(
                    (isEditing || isAdding) && editedIntegration
                      ? editedIntegration.provider
                      : selectedIntegration.provider
                  )}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                  {(isEditing || isAdding) && editedIntegration ? (
                    <input
                      value={editedIntegration.name}
                      onChange={(e) =>
                        setEditedIntegration({
                          ...editedIntegration,
                          name: e.target.value,
                        })
                      }
                      className="text-xl sm:text-2xl md:text-lg font-semibold tracking-tight theme-text-primary bg-transparent border-b focus:outline-none"
                    />
                  ) : (
                    <h2 className="text-xl sm:text-2xl md:text-lg font-semibold tracking-tight theme-text-primary">
                      {selectedIntegration.name}
                    </h2>
                  )}
                  <span
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border ${getStatusColor(
                      (isEditing || isAdding) && editedIntegration
                        ? editedIntegration.status
                        : selectedIntegration.status
                    )}`}
                  >
                    {(
                      (isEditing || isAdding) && editedIntegration
                        ? editedIntegration.status
                        : selectedIntegration.status
                    ) === 'active' ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    {(
                      (isEditing || isAdding) && editedIntegration
                        ? editedIntegration.status
                        : selectedIntegration.status
                    ).toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  <p className="theme-text-muted text-lg">
                    {(isEditing || isAdding) && editedIntegration
                      ? editedIntegration.provider
                      : selectedIntegration.provider}
                  </p>
                  <span className="text-sm theme-text-muted">•</span>
                  <p className="theme-text-muted font-mono">
                    {(isEditing || isAdding) && editedIntegration
                      ? editedIntegration.id
                      : selectedIntegration.id}
                  </p>
                  <span className="text-sm theme-text-muted">•</span>
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold border ${getHealthColor(
                      (isEditing || isAdding) && editedIntegration
                        ? editedIntegration.health
                        : selectedIntegration.health
                    )}`}
                  >
                    {(() => {
                      const Icon = getHealthIcon(
                        (isEditing || isAdding) && editedIntegration
                          ? editedIntegration.health
                          : selectedIntegration.health
                      );
                      return <Icon className="w-4 h-4" />;
                    })()}
                    {(
                      (isEditing || isAdding) && editedIntegration
                        ? editedIntegration.health
                        : selectedIntegration.health
                    ).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedIntegration(null);
                setIsAdding(false);
                setIsEditing(false);
                setEditedIntegration(null);
              }}
              className={`p-2 sm:p-3 rounded-xl hover:bg-red-500/20 transition-colors ${
                theme === 'light'
                  ? 'bg-gray-100 text-gray-700'
                  : 'theme-bg-glass theme-text-primary'
              }`}
              aria-label={t('extracted.close')}
            >
              <X
                className={`w-5 h-5 sm:w-6 sm:h-6 ${
                  theme === 'light' ? 'text-gray-700' : ''
                }`}
              />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div
          className={`border-b ${
            theme === 'light'
              ? 'border-gray-200 bg-gray-50'
              : 'theme-border-glass bg-gradient-to-r from-transparent via-theme-bg-glass to-transparent'
          }`}
        >
          <div className="flex overflow-x-auto px-4 sm:px-8">
            {[
              { id: 'overview', labelKey: 'extracted.overview', icon: Eye },
              {
                id: 'configuration',
                labelKey: 'extracted.configuration',
                icon: Cpu,
              },
              {
                id: 'performance',
                labelKey: 'extracted.performance',
                icon: Activity,
              },
              { id: 'security', labelKey: 'extracted.security', icon: Shield },
              { id: 'logs', labelKey: 'extracted.logs', icon: FileText },
              {
                id: 'analytics',
                labelKey: 'extracted.analytics',
                icon: TrendingUp,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 theme-text-primary'
                    : 'border-transparent theme-text-muted hover:theme-text-primary hover:bg-theme-bg-glass'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {t(tab.labelKey)}
              </button>
            ))}
          </div>
        </div>

        {/* Content – Scrollable if too long */}
        <div
          className={`p-4 sm:p-5 space-y-5 max-h-full sm:max-h-[70vh] overflow-y-auto ${
            theme === 'light' ? 'bg-white' : ''
          }`}
        >
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Overview Header */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2">
                  <h3 className="text-lg font-semibold tracking-tight theme-text-primary mb-4">
                    {t('extracted.integration_overview')}
                  </h3>
                  {(isEditing || isAdding) && editedIntegration ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium theme-text-muted mb-2">
                          Name
                        </label>
                        <input
                          value={editedIntegration.name}
                          onChange={(e) =>
                            setEditedIntegration({
                              ...editedIntegration,
                              name: e.target.value,
                            })
                          }
                          className="w-full p-3 rounded-lg border theme-bg-card theme-text-primary text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium theme-text-muted mb-2">
                          Provider
                        </label>
                        <input
                          value={editedIntegration.provider}
                          onChange={(e) =>
                            setEditedIntegration({
                              ...editedIntegration,
                              provider: e.target.value,
                            })
                          }
                          className="w-full p-3 rounded-lg border theme-bg-card theme-text-primary text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium theme-text-muted mb-2">
                          Category
                        </label>
                        <select
                          value={editedIntegration.category}
                          onChange={(e) =>
                            setEditedIntegration({
                              ...editedIntegration,
                              category: e.target.value,
                            })
                          }
                          className="w-full p-3 rounded-lg border theme-bg-card theme-text-primary text-sm"
                        >
                          <option value="identity-verification">
                            Identity Verification
                          </option>
                          <option value="document-verification">
                            Document Verification
                          </option>
                          <option value="payment-services">
                            Payment Services
                          </option>
                          <option value="banking-services">
                            Banking Services
                          </option>
                          <option value="crime-records">
                            Crime Records
                          </option>
                          <option value="court-records">
                            Court Records
                          </option>
                          <option value="financial-verification">
                            Financial Verification
                          </option>
                          <option value="social-welfare">
                            Social Welfare
                          </option>
                          <option value="state-integrations">
                            State Integrations
                          </option>
                          <option value="cloud-services">
                            Cloud Services
                          </option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium theme-text-muted mb-2">
                          Status
                        </label>
                        <select
                          value={editedIntegration.status}
                          onChange={(e) =>
                            setEditedIntegration({
                              ...editedIntegration,
                              status: e.target.value,
                            })
                          }
                          className="w-full p-3 rounded-lg border theme-bg-card theme-text-primary text-sm"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="pending">Pending</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium theme-text-muted mb-2">
                          Health
                        </label>
                        <select
                          value={editedIntegration.health}
                          onChange={(e) =>
                            setEditedIntegration({
                              ...editedIntegration,
                              health: e.target.value,
                            })
                          }
                          className="w-full p-3 rounded-lg border theme-bg-card theme-text-primary text-sm"
                        >
                          <option value="excellent">Excellent</option>
                          <option value="good">Good</option>
                          <option value="fair">Fair</option>
                          <option value="offline">Offline</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium theme-text-muted mb-2">
                          Image URL
                        </label>
                        <input
                          value={editedIntegration.imageUrl || ''}
                          onChange={(e) =>
                            setEditedIntegration({
                              ...editedIntegration,
                              imageUrl: e.target.value,
                            })
                          }
                          className="w-full p-3 rounded-lg border theme-bg-card theme-text-primary text-sm"
                          placeholder="https://example.com/image.png"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium theme-text-muted mb-2">
                          Description
                        </label>
                        <textarea
                          value={editedIntegration.description}
                          onChange={(e) =>
                            setEditedIntegration({
                              ...editedIntegration,
                              description: e.target.value,
                            })
                          }
                          className="w-full p-3 rounded-lg border theme-bg-card theme-text-primary text-sm"
                          rows={5}
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="theme-text-primary text-lg leading-relaxed">
                      {selectedIntegration.description}
                    </p>
                  )}
                </div>
                {selectedIntegration && (
                  <div className="p-5 rounded-xl theme-bg-glass border theme-border-glass">
                    <div className="flex items-center gap-3 mb-4">
                      <FileText className="w-6 h-6 theme-text-primary" />
                      <h4 className="text-lg font-semibold theme-text-primary">
                        {t('extracted.documentation')}
                      </h4>
                    </div>
                    <a
                      href={selectedIntegration.documentation}
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-md border transition-colors ${
                        theme === 'light'
                          ? 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300'
                          : 'theme-bg-card theme-border-glass hover:bg-blue-500/20'
                      }`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span className="font-semibold">
                        {t('extracted.view_api_documentation')}
                      </span>
                    </a>
                  </div>
                )}
              </div>

              {selectedIntegration && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                  {[
                    {
                      labelKey: 'extracted.success_rate',
                      value: `${selectedIntegration.successRate}%`,
                      icon: TrendingUp,
                      color: 'from-green-500 to-emerald-500',
                    },
                    {
                      labelKey: 'extracted.response',
                      value: selectedIntegration.responseTime,
                      icon: Zap,
                      color: 'from-blue-500 to-cyan-500',
                    },
                    {
                      labelKey: 'extracted.endpoints',
                      value: selectedIntegration.endpoints,
                      icon: Network,
                      color: 'from-purple-500 to-pink-500',
                    },
                    {
                      labelKey: 'extracted.api_version',
                      value: selectedIntegration.apiVersion,
                      icon: Code,
                      color: 'from-orange-500 to-red-500',
                    },
                  ].map((metric, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-xl theme-bg-glass border theme-border-glass text-center"
                    >
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${metric.color} flex items-center justify-center mx-auto mb-3`}
                      >
                        <metric.icon className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-lg font-semibold tracking-tight theme-text-primary mb-1">
                        {metric.value}
                      </p>
                      <p className="text-sm theme-text-muted">
                        {t(metric.labelKey)}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {selectedIntegration && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="p-5 rounded-xl theme-bg-glass border theme-border-glass">
                    <div className="flex items-center gap-3 mb-3">
                      <Clock className="w-5 h-5 theme-text-primary" />
                      <h4 className="font-semibold theme-text-primary">
                        {t('extracted.last_sync')}
                      </h4>
                    </div>
                    <p className="text-lg theme-text-primary font-mono">
                      {selectedIntegration.lastSync}
                    </p>
                  </div>
                  <div className="p-5 rounded-xl theme-bg-glass border theme-border-glass">
                    <div className="flex items-center gap-3 mb-3">
                      <RefreshCw className="w-5 h-5 theme-text-primary" />
                      <h4 className="font-semibold theme-text-primary">
                        {t('extracted.next_sync')}
                      </h4>
                    </div>
                    <p className="text-lg theme-text-primary font-mono">
                      {selectedIntegration.nextSync}
                    </p>
                  </div>
                  <div className="p-5 rounded-xl theme-bg-glass border theme-border-glass">
                    <div className="flex items-center gap-3 mb-3">
                      <Timer className="w-5 h-5 theme-text-primary" />
                      <h4 className="font-semibold theme-text-primary">
                        {t('extracted.frequency')}
                      </h4>
                    </div>
                    <p className="text-lg theme-text-primary font-semibold capitalize">
                      {selectedIntegration.syncFrequency}
                    </p>
                  </div>
                </div>
              )}

              {selectedIntegration && (
                <div>
                  <h3 className="text-lg font-semibold tracking-tight theme-text-primary mb-6">
                    {t('extracted.usage_statistics_1')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {[
                      {
                        labelKey: 'extracted.monthly_requests',
                        value:
                          selectedIntegration.usage.monthly.toLocaleString(),
                        icon: Calendar,
                      },
                      {
                        labelKey: 'extracted.daily_average',
                        value:
                          selectedIntegration.usage.daily.toLocaleString(),
                        icon: Activity,
                      },
                      {
                        labelKey: 'extracted.error_count',
                        value: selectedIntegration.usage.errors,
                        icon: AlertCircle,
                      },
                    ].map((stat, idx) => (
                      <div
                        key={idx}
                        className="p-5 rounded-xl theme-bg-glass border theme-border-glass text-center"
                      >
                        <stat.icon className="w-8 h-8 theme-text-primary mx-auto mb-3" />
                        <p className="text-lg font-semibold tracking-tight theme-text-primary mb-2">
                          {stat.value}
                        </p>
                        <p className="text-sm theme-text-muted">
                          {t(stat.labelKey)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'configuration' && selectedIntegration && (
            <div className="space-y-5">
              {/* API Configuration */}
              <div>
                <h3 className="text-lg font-semibold tracking-tight theme-text-primary mb-6">
                  {t('extracted.api_configuration_1')}
                </h3>

                {/* read-only cards like before */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {[
                    {
                      labelKey: 'extracted.authentication_type',
                      value: selectedIntegration.config.authType,
                      icon: Shield,
                    },
                    {
                      labelKey: 'extracted.rate_limit',
                      value: selectedIntegration.config.rateLimit,
                      icon: Gauge,
                    },
                    {
                      labelKey: 'extracted.timeout',
                      value: selectedIntegration.config.timeout,
                      icon: Clock,
                    },
                    {
                      labelKey: 'extracted.api_version',
                      value: selectedIntegration.apiVersion,
                      icon: Code,
                    },
                  ].map((config, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-xl theme-bg-glass border theme-border-glass"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <config.icon className="w-5 h-5 theme-text-primary" />
                        <h4 className="font-semibold theme-text-primary">
                          {t(config.labelKey)}
                        </h4>
                      </div>
                      <p className="text-lg theme-text-primary font-semibold">
                        {config.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* OPTIONAL: small config form when editing/adding */}
                {(isEditing || isAdding) && editedIntegration && (
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium theme-text-muted mb-2">
                        Auth Type
                      </label>
                      <input
                        value={editedIntegration.config?.authType || ''}
                        onChange={(e) =>
                          setEditedIntegration({
                            ...editedIntegration,
                            config: {
                              ...editedIntegration.config,
                              authType: e.target.value,
                            },
                          })
                        }
                        className="w-full p-3 rounded-lg border theme-bg-card theme-text-primary text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium theme-text-muted mb-2">
                        Rate Limit
                      </label>
                      <input
                        value={editedIntegration.config?.rateLimit || ''}
                        onChange={(e) =>
                          setEditedIntegration({
                            ...editedIntegration,
                            config: {
                              ...editedIntegration.config,
                              rateLimit: e.target.value,
                            },
                          })
                        }
                        className="w-full p-3 rounded-lg border theme-bg-card theme-text-primary text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium theme-text-muted mb-2">
                        Timeout
                      </label>
                      <input
                        value={editedIntegration.config?.timeout || ''}
                        onChange={(e) =>
                          setEditedIntegration({
                            ...editedIntegration,
                            config: {
                              ...editedIntegration.config,
                              timeout: e.target.value,
                            },
                          })
                        }
                        className="w-full p-3 rounded-lg border theme-bg-card theme-text-primary text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Security Information */}
              <div>
                <h3 className="text-lg font-semibold tracking-tight theme-text-primary mb-6">
                  {t('extracted.security_compliance')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="p-5 rounded-xl theme-bg-glass border theme-border-glass">
                    <div className="flex items-center gap-3 mb-4">
                      <Shield className="w-6 h-6 theme-text-primary" />
                      <h4 className="text-lg font-semibold theme-text-primary">
                        {t('extracted.security')}
                      </h4>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm theme-text-muted mb-1">
                          {t('extracted.certification')}
                        </p>
                        <p className="theme-text-primary font-semibold">
                          {selectedIntegration.security}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm theme-text-muted mb-1">
                          {t('extracted.encryption')}
                        </p>
                        <p className="theme-text-primary font-semibold">
                          {selectedIntegration.dataEncryption}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 rounded-xl theme-bg-glass border theme-border-glass">
                    <div className="flex items-center gap-3 mb-4">
                      <Scale className="w-6 h-6 theme-text-primary" />
                      <h4 className="text-lg font-semibold theme-text-primary">
                        {t('extracted.compliance')}
                      </h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(selectedIntegration.compliance ?? []).map(
                        (comp: string, idx: number) => (
                          <span
                            key={idx}
                            className={`px-3 py-2 text-sm font-semibold rounded-lg ${
                              theme === 'light'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-blue-500/20 text-blue-300'
                            }`}
                          >
                            {comp}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* API Key */}
              <div className="p-5 rounded-xl theme-bg-glass border theme-border-glass">
                <div className="flex items-center gap-3 mb-4">
                  <Key className="w-6 h-6 theme-text-primary" />
                  <h4 className="text-lg font-semibold theme-text-primary">
                    {t('extracted.api_credentials')}
                  </h4>
                </div>
                <div className="flex items-center gap-4">
                  <code className="flex-1 px-3 py-2.5 theme-bg-card rounded-xl theme-text-primary font-mono text-lg">
                    {selectedIntegration.apiKey}
                  </code>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 rounded-md theme-bg-card theme-border-glass border hover:bg-blue-500/20 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'performance' && selectedIntegration && (
            <div className="space-y-5">
              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  {
                    label: 'Success Rate',
                    value: `${selectedIntegration.successRate}%`,
                    trend: '+2.1%',
                    icon: TrendingUp,
                    color: 'text-green-400',
                  },
                  {
                    label: 'Avg Response Time',
                    value: selectedIntegration.responseTime,
                    trend: '-0.3s',
                    icon: Zap,
                    color: 'text-blue-400',
                  },
                  {
                    label: 'Uptime (30d)',
                    value: '99.95%',
                    trend: '+0.05%',
                    icon: Activity,
                    color: 'text-emerald-400',
                  },
                  {
                    label: 'Error Rate',
                    value: `${(100 - selectedIntegration.successRate).toFixed(
                      1
                    )}%`,
                    trend: '-0.8%',
                    icon: AlertCircle,
                    color: 'text-amber-400',
                  },
                ].map((metric, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-xl theme-bg-glass border theme-border-glass"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <metric.icon className={`w-8 h-8 ${metric.color}`} />
                      <span className="text-sm font-semibold text-green-400">
                        {metric.trend}
                      </span>
                    </div>
                    <p className="text-lg font-semibold tracking-tight theme-text-primary mb-2">
                      {metric.value}
                    </p>
                    <p className="text-sm theme-text-muted">{metric.label}</p>
                  </div>
                ))}
              </div>

              {/* Response Time Distribution */}
              <div className="p-5 rounded-xl theme-bg-glass border theme-border-glass">
                <h4 className="text-lg font-semibold theme-text-primary mb-4">
                  {t('extracted.response_time_distribution_1')}
                </h4>
                <div className="space-y-3">
                  {[
                    { range: '< 1s', percentage: 65, color: 'bg-green-400' },
                    { range: '1-2s', percentage: 25, color: 'bg-blue-400' },
                    { range: '2-3s', percentage: 7, color: 'bg-amber-400' },
                    { range: '> 3s', percentage: 3, color: 'bg-red-400' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <span className="w-16 text-sm theme-text-muted">
                        {item.range}
                      </span>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${item.color} transition-all duration-1000`}
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                      <span className="w-12 text-sm font-semibold theme-text-primary">
                        {item.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && selectedIntegration && (
            <div className="space-y-5">
              {/* Security Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="p-5 rounded-xl theme-bg-glass border theme-border-glass">
                  <div className="flex items-center gap-3 mb-4">
                    <Shield className="w-6 h-6 theme-text-primary" />
                    <h4 className="text-lg font-semibold theme-text-primary">
                      {t('extracted.security_status')}
                    </h4>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="theme-text-muted">
                        {t('extracted.encryption')}
                      </span>
                      <span className="flex items-center gap-2 text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        Active
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="theme-text-muted">
                        {t('extracted.certificate')}
                      </span>
                      <span className="flex items-center gap-2 text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        Valid
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="theme-text-muted">
                        {t('extracted.audit_logging')}
                      </span>
                      <span className="flex items-center gap-2 text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        Enabled
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-xl theme-bg-glass border theme-border-glass">
                  <div className="flex items-center gap-3 mb-4">
                    <Scale className="w-6 h-6 theme-text-primary" />
                    <h4 className="text-lg font-semibold theme-text-primary">
                      {t('extracted.compliance')}
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {(selectedIntegration.compliance ?? []).map(
                      (comp: string, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 p-3 rounded-lg theme-bg-card"
                        >
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-sm theme-text-primary">
                            {comp}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Security Features */}
              <div className="p-5 rounded-xl theme-bg-glass border theme-border-glass">
                <h4 className="text-lg font-semibold theme-text-primary mb-4">
                  {t('extracted.security_features_1')}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      feature: 'TLS 1.3 Encryption',
                      status: 'Enabled',
                      icon: Lock,
                    },
                    {
                      feature: 'API Rate Limiting',
                      status: 'Active',
                      icon: Gauge,
                    },
                    {
                      feature: 'IP Whitelisting',
                      status: 'Configured',
                      icon: Globe,
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl theme-bg-card text-center"
                    >
                      <item.icon className="w-8 h-8 theme-text-primary mx-auto mb-2" />
                      <p className="font-semibold theme-text-primary mb-1">
                        {item.feature}
                      </p>
                      <p className="text-sm text-green-400">{item.status}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logs' && selectedIntegration && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold tracking-tight theme-text-primary">
                  {t('extracted.recent_activity_logs')}
                </h3>
                <div className="flex items-center gap-2">
                  <select className="px-3 py-2 rounded-xl theme-bg-glass theme-border-glass border theme-text-primary">
                    <option>{t('extracted.all_activities')}</option>
                    <option>{t('extracted.errors_only')}</option>
                    <option>{t('extracted.success_only')}</option>
                  </select>
                </div>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {(selectedIntegration.logs ?? []).map(
                  (
                    log: { message: string; timestamp: string; status: string },
                    idx: number
                  ) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center gap-4 p-4 rounded-xl theme-bg-glass border theme-border-glass hover:theme-bg-card transition-colors"
                    >
                      <div
                        className={`w-3 h-3 rounded-full ${
                          log.status === 'success'
                            ? 'bg-green-400'
                            : log.status === 'error'
                            ? 'bg-red-400'
                            : 'bg-amber-400'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="theme-text-primary font-medium truncate">
                          {log.message}
                        </p>
                        <p className="text-sm theme-text-muted">
                          {log.timestamp}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          log.status === 'success'
                            ? 'bg-green-400/20 text-green-400'
                            : log.status === 'error'
                            ? 'bg-red-400/20 text-red-400'
                            : 'bg-amber-400/20 text-amber-400'
                        }`}
                      >
                        {log.status.toUpperCase()}
                      </span>
                    </motion.div>
                  )
                )}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && selectedIntegration && (
            <div className="space-y-5">
              {/* Analytics Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { label: 'Total API Calls', value: '2.4M', icon: Database },
                  { label: 'Avg Daily Usage', value: '8.2K', icon: Activity },
                  { label: 'Peak Concurrent', value: '142', icon: TrendingUp },
                  { label: 'Data Processed', value: '4.7GB', icon: Server },
                ].map((stat, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-xl theme-bg-glass border theme-border-glass text-center"
                  >
                    <stat.icon className="w-8 h-8 theme-text-primary mx-auto mb-3" />
                    <p className="text-lg font-semibold tracking-tight theme-text-primary mb-1">
                      {stat.value}
                    </p>
                    <p className="text-sm theme-text-muted">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Usage Trends */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="p-5 rounded-xl theme-bg-glass border theme-border-glass">
                  <h4 className="text-lg font-semibold theme-text-primary mb-4">
                    {t('extracted.usage_trends_30d')}
                  </h4>
                  <div className="space-y-4">
                    {[
                      {
                        period: 'Last 7 days',
                        trend: '+12%',
                        color: 'text-green-400',
                      },
                      {
                        period: 'Last 30 days',
                        trend: '+8%',
                        color: 'text-blue-400',
                      },
                      {
                        period: 'Last 90 days',
                        trend: '+15%',
                        color: 'text-emerald-400',
                      },
                    ].map((trend, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between"
                      >
                        <span className="theme-text-muted">
                          {trend.period}
                        </span>
                        <span
                          className={`font-semibold ${trend.color}`}
                        >
                          {trend.trend}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-5 rounded-xl theme-bg-glass border theme-border-glass">
                  <h4 className="text-lg font-semibold theme-text-primary mb-4">
                    {t('extracted.performance_score')}
                  </h4>
                  <div className="flex items-center justify-center">
                    <div className="relative w-32 h-32">
                      <div className="w-full h-full rounded-full border-8 border-blue-500/20 flex items-center justify-center">
                        <span className="text-lg font-semibold tracking-tight theme-text-primary">
                          94%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div
          className={`sticky bottom-0 backdrop-blur-xl border-t p-4 sm:p-5 ${
            theme === 'light'
              ? 'bg-white/95 border-gray-200'
              : 'theme-bg-card theme-border-glass'
          }`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {isAdding && editedIntegration ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={async () => {
                    try {
                      await addIntegration(editedIntegration);
                      setIsAdding(false);
                      setEditedIntegration(null);
                      setSelectedIntegration(null);
                    } catch (e) {
                      console.error('Add failed', e);
                    }
                  }}
                  className={`w-full px-3 py-2.5 sm:px-6 sm:py-4 rounded-xl border font-semibold flex items-center justify-center gap-3 transition-colors ${
                    theme === 'light'
                      ? 'bg-green-50 text-green-700 border-green-300 hover:bg-green-100'
                      : 'bg-green-500/20 text-green-300 border-green-500/30 hover:bg-green-500/30'
                  }`}
                >
                  <CheckCircle className="w-5 h-5" />
                  <span className="hidden sm:inline">Add Integration</span>
                  <span className="inline sm:hidden">Add</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setIsAdding(false);
                    setEditedIntegration(null);
                    setSelectedIntegration(null);
                  }}
                  className={`w-full px-3 py-2.5 sm:px-6 sm:py-4 rounded-xl border font-semibold flex items-center justify-center gap-3 transition-colors ${
                    theme === 'light'
                      ? 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                      : 'theme-bg-glass theme-border-glass theme-text-primary hover:theme-bg-card'
                  }`}
                >
                  <X className="w-5 h-5" />
                  <span className="hidden sm:inline">Cancel</span>
                  <span className="inline sm:hidden">No</span>
                </motion.button>
              </>
            ) : isEditing && editedIntegration ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={async () => {
                    try {
                      await saveIntegration(
                        editedIntegration.id,
                        editedIntegration
                      );
                      setIsEditing(false);
                      setEditedIntegration(null);
                      setSelectedIntegration(editedIntegration);
                    } catch (e) {
                      console.error('Save failed', e);
                    }
                  }}
                  className={`w-full px-3 py-2.5 sm:px-6 sm:py-4 rounded-xl border font-semibold flex items-center justify-center gap-3 transition-colors ${
                    theme === 'light'
                      ? 'bg-green-50 text-green-700 border-green-300 hover:bg-green-100'
                      : 'bg-green-500/20 text-green-300 border-green-500/30 hover:bg-green-500/30'
                  }`}
                >
                  <CheckCircle className="w-5 h-5" />
                  <span className="hidden sm:inline">Save Changes</span>
                  <span className="inline sm:hidden">Save</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setIsEditing(false);
                    setEditedIntegration(null);
                  }}
                  className={`w-full px-3 py-2.5 sm:px-6 sm:py-4 rounded-xl border font-semibold flex items-center justify-center gap-3 transition-colors ${
                    theme === 'light'
                      ? 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                      : 'theme-bg-glass theme-border-glass theme-text-primary hover:theme-bg-card'
                  }`}
                >
                  <X className="w-5 h-5" />
                  <span className="hidden sm:inline">Cancel</span>
                  <span className="inline sm:hidden">No</span>
                </motion.button>
              </>
            ) : (
              <>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() =>
                    selectedIntegration &&
                    handleTestConnection(selectedIntegration.id)
                  }
                  className={`w-full px-3 py-2.5 sm:px-6 sm:py-4 rounded-xl border font-semibold flex items-center justify-center gap-3 transition-colors ${
                    theme === 'light'
                      ? 'bg-green-50 text-green-700 border-green-300 hover:bg-green-100'
                      : 'bg-green-500/20 text-green-300 border-green-500/30 hover:bg-green-500/30'
                  }`}
                >
                  <Wifi className="w-5 h-5" />
                  <span className="hidden sm:inline">
                    {t('extracted.test_connection')}
                  </span>
                  <span className="inline sm:hidden">
                    {t('extracted.test')}
                  </span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() =>
                    selectedIntegration &&
                    handleSyncNow(selectedIntegration.id)
                  }
                  className={`w-full px-3 py-2.5 sm:px-6 sm:py-4 rounded-xl border font-semibold flex items-center justify-center gap-3 transition-colors ${
                    theme === 'light'
                      ? 'bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100'
                      : 'bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30'
                  }`}
                >
                  <RefreshCw className="w-5 h-5" />
                  <span className="hidden sm:inline">
                    {t('extracted.sync_now')}
                  </span>
                  <span className="inline sm:hidden">
                    {t('extracted.sync')}
                  </span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (selectedIntegration) {
                      setEditedIntegration({ ...selectedIntegration });
                      setIsEditing(true);
                    }
                  }}
                  className={`w-full px-3 py-2.5 sm:px-6 sm:py-4 rounded-xl border font-semibold flex items-center justify-center gap-3 transition-colors ${
                    theme === 'light'
                      ? 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                      : 'theme-bg-glass theme-border-glass theme-text-primary hover:theme-bg-card'
                  }`}
                >
                  <Edit className="w-5 h-5" />
                  <span className="hidden sm:inline">
                    {t('extracted.edit_config')}
                  </span>
                  <span className="inline sm:hidden">
                    {t('extracted.edit')}
                  </span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full px-3 py-2.5 sm:px-6 sm:py-4 rounded-xl border font-semibold flex items-center justify-center gap-3 transition-colors ${
                    theme === 'light'
                      ? 'bg-red-50 text-red-700 border-red-300 hover:bg-red-100'
                      : 'bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30'
                  }`}
                >
                  <X className="w-5 h-5" />
                  <span className="hidden sm:inline">
                    {t('extracted.disable')}
                  </span>
                  <span className="inline sm:hidden">Off</span>
                </motion.button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </motion.section>
  )}
</AnimatePresence>

      {/* Quick Stats Bar - Enhanced with Real-time Indicators */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4"
      >
        {[
          { labelKey: 'extracted.active', value: stats.active, icon: Activity, color: 'from-green-500 to-emerald-500', statusColor: 'bg-green-500' },
          { labelKey: 'extracted.endpoints', value: stats.totalEndpoints, icon: Network, color: 'from-blue-500 to-cyan-500', statusColor: 'bg-blue-500' },
          { labelKey: 'extracted.success_rate', value: `${stats.avgSuccessRate}%`, icon: TrendingUp, color: 'from-purple-500 to-pink-500', statusColor: 'bg-purple-500' },
          { labelKey: 'extracted.response', value: '< 2s', icon: Zap, color: 'from-orange-500 to-red-500', statusColor: 'bg-orange-500' }
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -4, scale: 1.02 }}
            className="relative theme-bg-card theme-border-glass border rounded-xl p-4 sm:p-5 glass-effect cursor-pointer overflow-hidden group"
          >
            {/* Status indicator dot (static) */}
            <div className={`absolute top-3 right-3 w-2 h-2 rounded-full ${stat.statusColor}`} />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold tracking-tight theme-text-primary mb-1">{stat.value}</p>
                <p className="text-sm theme-text-muted">{t(stat.labelKey)}</p>
              </div>
              <div className="relative">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white relative z-10" />
                </div>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-3">
              <div className={`h-full bg-gradient-to-r ${stat.color} w-full`} />
            </div>
            
            {/* Hover glow effect */}
            <motion.div
              className={`absolute inset-0 bg-gradient-to-br ${stat.color} rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Area - New Layout */}
  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-5">
        {/* Sidebar Filters - New Design */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="xl:col-span-1 space-y-4 sm:space-y-5"
        >
          {/* Search Box */}
          <div className="theme-bg-card theme-border-glass border rounded-xl p-4 sm:p-5 glass-effect">
            <h3 className="text-lg font-semibold theme-text-primary mb-4">{t('extracted.search_filter')} </h3>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 theme-text-muted" />
                <input
                  type="text"
                  placeholder={t('extracted.search_integrations')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-xl theme-bg-glass theme-border-glass border theme-text-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>

              {/* Quick Filters */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm theme-text-muted mb-2">{t('extracted.status')} </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-2.5 sm:px-3 py-2 rounded-xl theme-bg-glass theme-border-glass border theme-text-primary text-sm"
                  >
                    <option value="all">{t('extracted.all_status')} </option>
                    <option value="active">{t('extracted.active')} </option>
                    <option value="inactive">{t('extracted.inactive')} </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm theme-text-muted mb-2">{t('extracted.category_1')} </label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-2.5 sm:px-3 py-2 rounded-xl theme-bg-glass theme-border-glass border theme-text-primary text-sm"
                  >
                    <option value="all">{t('extracted.all_categories')}</option>
                    <option value="identity-verification">{t('extracted.identity_verification')}</option>
                    <option value="document-verification">{t('extracted.document_verification')}</option>
                    <option value="payment-services">{t('extracted.payment_services')}</option>
                    <option value="banking-services">{t('extracted.banking_services')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm theme-text-muted mb-2">{t('extracted.health')} </label>
                  <select
                    value={healthFilter}
                    onChange={(e) => setHealthFilter(e.target.value)}
                    className="w-full px-2.5 sm:px-3 py-2 rounded-xl theme-bg-glass theme-border-glass border theme-text-primary text-sm"
                  >
                    <option value="all">{t('extracted.all_health')}</option>
                    <option value="excellent">{t('extracted.excellent')}</option>
                    <option value="good">{t('extracted.good')}</option>
                    <option value="fair">{t('extracted.fair')}</option>
                  </select>
                </div>
              </div>

              {/* Clear Filters Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setCategoryFilter('all');
                  setHealthFilter('all');
                  setCurrentPage(1);
                }}
                className={`w-full px-3 py-2 rounded-md flex items-center justify-center gap-2 transition-colors border ${theme === 'light' ? 'bg-white/90 border-gray-200 text-black hover:bg-blue-50' : 'theme-bg-glass theme-border-glass hover:bg-blue-500/20'}`}
              >
                <RefreshCw className="w-4 h-4" />
                <span className="font-semibold">{t('extracted.clear_filters')}</span>
              </motion.button>
            </div>
          </div>

          {/* Category Overview */}
          <div className="theme-bg-card theme-border-glass border rounded-xl p-4 sm:p-5 glass-effect">
            <h3 className="text-lg font-semibold theme-text-primary mb-4">{t('categories')} </h3>
            <div className="space-y-3">
              {Object.entries(categoryStats).map(([category, count]) => {
                const Icon = getCategoryIcon(category);
                return (
                  <motion.div
                    key={category}
                    whileHover={{ x: 4 }}
                    className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl theme-bg-glass cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 theme-text-primary" />
                      <span className="theme-text-primary text-sm font-medium">
                        {t(`extracted.${category.replace(/-/g, '_')}`)}
                      </span>
                    </div>
                    <span className="px-2 py-1 rounded-full theme-bg-card theme-text-primary text-xs font-bold">
                      {count}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Integrations Grid - New Design */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="xl:col-span-3 space-y-5"
        >
          {/* Action Buttons - Bottom of Grid */}
          <div className={`border-t p-4 sm:p-5 ${theme === 'light' ? 'bg-white/95 border-gray-200' : 'theme-bg-card theme-border-glass'}`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => selectedIntegration && handleTestConnection(selectedIntegration.id)}
                className={`w-full px-3 py-2.5 sm:px-6 sm:py-4 rounded-xl border font-semibold flex items-center justify-center gap-3 transition-colors ${theme === 'light' ? 'bg-green-50 text-green-700 border-green-300 hover:bg-green-100' : 'bg-green-500/20 text-green-300 border-green-500/30 hover:bg-green-500/30'}`}
              >
                <Wifi className="w-5 h-5" />
                <span className="hidden sm:inline">{t('extracted.test_connection')}</span>
                <span className="inline sm:hidden">{t('extracted.test')}</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => selectedIntegration && handleSyncNow(selectedIntegration.id)}
                className={`w-full px-3 py-2.5 sm:px-6 sm:py-4 rounded-xl border font-semibold flex items-center justify-center gap-3 transition-colors ${theme === 'light' ? 'bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100' : 'bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30'}`}
              >
                <RefreshCw className="w-5 h-5" />
                <span className="hidden sm:inline">{t('extracted.sync_now')}</span>
                <span className="inline sm:hidden">{t('extracted.sync')}</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (selectedIntegration) {
                    setEditedIntegration({ ...selectedIntegration });
                    setIsEditing(true);
                  }
                }}
                className={`w-full px-3 py-2.5 sm:px-6 sm:py-4 rounded-xl border font-semibold flex items-center justify-center gap-3 transition-colors ${theme === 'light' ? 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200' : 'theme-bg-glass theme-border-glass theme-text-primary hover:theme-bg-card'}`}
              >
                <Edit className="w-5 h-5" />
                <span className="hidden sm:inline">{t('extracted.edit_config')}</span>
                <span className="inline sm:hidden">{t('extracted.edit')}</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full px-3 py-2.5 sm:px-6 sm:py-4 rounded-xl border font-semibold flex items-center justify-center gap-3 transition-colors ${theme === 'light' ? 'bg-red-50 text-red-700 border-red-300 hover:bg-red-100' : 'bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30'}`}
              >
                <X className="w-5 h-5" />
                <span className="hidden sm:inline">{t('extracted.disable')}</span>
                <span className="inline sm:hidden">Off</span>
              </motion.button>
            </div>
          </div>

            <div>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {loadingIntegrations ? (
                    // Loading state (grid)
                    Array.from({ length: 6 }, (_, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-5 rounded-xl theme-bg-card theme-border-glass border animate-pulse"
                      >
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-gray-300 dark:bg-gray-600"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                          </div>
                        </div>
                        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded mb-4 w-2/3"></div>
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          <div className="text-center">
                            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-1"></div>
                            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
                          </div>
                          <div className="text-center">
                            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-1"></div>
                            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
                          </div>
                          <div className="text-center">
                            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-1"></div>
                            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t theme-border-glass">
                          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : paginatedIntegrations.length === 0 ? (
                    // Empty state (grid)
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="col-span-full flex flex-col items-center justify-center py-16 px-4"
                    >
                      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                        <Database className="w-8 h-8 theme-text-muted" />
                      </div>
                      <h3 className="text-lg font-semibold theme-text-primary mb-2">No integrations found</h3>
                      <p className="text-sm theme-text-muted text-center mb-6 max-w-md">
                        {filteredIntegrations.length === 0 && integrations.length > 0
                          ? "No integrations match your current filters. Try adjusting your search or filter criteria."
                          : "Get started by adding your first integration to monitor and manage your API connections."}
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setEditedIntegration({ name: '', provider: '', category: 'identity-verification', status: 'active', health: 'good', lastSync: '', nextSync: '', syncFrequency: 'hourly', successRate: 100, responseTime: '1s', apiVersion: '1.0', endpoints: 1, description: '', documentation: '', apiKey: '', security: '', dataEncryption: '', compliance: [], usage: { monthly: 0, daily: 0, errors: 0 }, config: { authType: '', rateLimit: '', timeout: '' }, logs: [], imageUrl: '' });
                          setIsAdding(true);
                        }}
                        className="px-4 py-2 rounded-md accent-gradient text-white flex items-center gap-2 shadow-sm"
                      >
                        <Plus className="w-5 h-5" />
                        <span className="font-semibold">Add First Integration</span>
                      </motion.button>
                    </motion.div>
                  ) : (
                    // Actual integrations (grid)
                    paginatedIntegrations.map((integration, idx) => (
                      <motion.div
                        key={integration.id || idx}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        className="p-5 rounded-xl theme-bg-card theme-border-glass border"
                        onClick={() => setSelectedIntegration(integration)}
                      >
                        {/* Header with Image/Logo */}
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
                            {integration.imageUrl ? (
                              <img
                                src={integration.imageUrl}
                                alt={integration.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                      const sib = e.currentTarget.nextElementSibling as HTMLElement | null;
                                      if (sib) sib.style.display = 'flex';
                                    }}
                              />
                            ) : null}
                            <div className={`w-full h-full flex items-center justify-center ${integration.imageUrl ? 'hidden' : ''}`}>
                              {getPlatformLogo(integration.provider)}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold theme-text-primary truncate">{integration.name}</h3>
                            <p className="text-sm theme-text-muted truncate">{integration.provider}</p>
                          </div>
                        </div>

                      {/* Description */}
                        <p className="theme-text-secondary text-sm mb-4 line-clamp-2">
                        {integration.description}
                      </p>

                      {/* Stats */}
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          <div className="text-center">
                            <p className="text-lg font-semibold tracking-tight theme-text-primary">{integration.successRate}%</p>
                            <p className="theme-text-muted text-xs">{t('extracted.success')}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-semibold tracking-tight theme-text-primary">{integration.responseTime}</p>
                            <p className="theme-text-muted text-xs">{t('extracted.response')}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-semibold tracking-tight theme-text-primary">{integration.endpoints}</p>
                            <p className="theme-text-muted text-xs">{t('extracted.endpoints')}</p>
                          </div>
                        </div>

                      {/* Footer */}
                        <div className="flex items-center justify-between pt-3 border-t theme-border-glass">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${getHealthColor(integration.health)}`}>
                            {(() => {
                              const Icon = getHealthIcon(integration.health);
                              return <Icon className="w-3 h-3" />;
                            })()}
                            {integration.health}
                          </span>
                          <div className="flex items-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTestConnection(integration.id);
                              }}
                              className={`p-2 rounded-lg transition-colors touch-manipulation ${theme === 'light' ? 'bg-white/90 text-black border-gray-200 hover:bg-green-50' : 'theme-bg-glass hover:bg-green-500/20'}`}
                            >
                              <Wifi className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSyncNow(integration.id);
                              }}
                              className={`p-2 rounded-lg transition-colors touch-manipulation ${theme === 'light' ? 'bg-white/90 text-black border-gray-200 hover:bg-blue-50' : 'theme-bg-glass hover:bg-blue-500/20'}`}
                            >
                              <RefreshCw className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              ) : (
                // List view
                <div className="space-y-4">
                  {loadingIntegrations ? (
                    Array.from({ length: 6 }, (_, idx) => (
                      <motion.div key={idx} className="p-4 rounded-xl theme-bg-card theme-border-glass border animate-pulse" />
                    ))
                  ) : paginatedIntegrations.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16 px-4">
                      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                        <Database className="w-8 h-8 theme-text-muted" />
                      </div>
                      <h3 className="text-lg font-semibold theme-text-primary mb-2">No integrations found</h3>
                      <p className="text-sm theme-text-muted text-center mb-6 max-w-md">
                        {filteredIntegrations.length === 0 && integrations.length > 0
                          ? "No integrations match your current filters. Try adjusting your search or filter criteria."
                          : "Get started by adding your first integration to monitor and manage your API connections."}
                      </p>
                    </motion.div>
                  ) : (
                    paginatedIntegrations.map((integration, idx) => (
                      <motion.div
                        key={integration.id || idx}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        className="p-4 rounded-xl theme-bg-card theme-border-glass border flex items-center justify-between"
                        onClick={() => setSelectedIntegration(integration)}
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
                            {integration.imageUrl ? (
                              <img src={integration.imageUrl} alt={integration.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">{getPlatformLogo(integration.provider)}</div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-lg font-semibold theme-text-primary truncate">{integration.name}</h3>
                            <p className="text-sm theme-text-muted truncate">{integration.provider} • <span className="font-mono">{integration.id}</span></p>
                            <p className="text-sm theme-text-secondary truncate mt-1">{integration.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 ml-4">
                          <div className="text-center">
                            <p className="text-lg font-bold theme-text-primary">{integration.successRate}%</p>
                            <p className="text-xs theme-text-muted">{t('extracted.success')}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold theme-text-primary">{integration.responseTime}</p>
                            <p className="text-xs theme-text-muted">{t('extracted.response')}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <motion.button onClick={(e) => { e.stopPropagation(); handleTestConnection(integration.id); }} className={`p-2 rounded-lg ${theme === 'light' ? 'bg-white/90 text-black border border-gray-200' : 'theme-bg-glass'}`}><Wifi className="w-4 h-4"/></motion.button>
                            <motion.button onClick={(e) => { e.stopPropagation(); handleSyncNow(integration.id); }} className={`p-2 rounded-lg ${theme === 'light' ? 'bg-white/90 text-black border border-gray-200' : 'theme-bg-glass'}`}><RefreshCw className="w-4 h-4"/></motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              )}
            </div>
            

            {/* Pagination */}
            <div className="flex items-center justify-between pt-4 sm:pt-6 border-t theme-border-glass flex-wrap gap-3">
            <p className="theme-text-muted text-sm">
              {t('extracted.showing')} {((currentPage - 1) * itemsPerPage) + 1} {t('extracted.to')} {Math.min(currentPage * itemsPerPage, filteredIntegrations.length)} {t('extracted.of')} {filteredIntegrations.length} {t('extracted.integrations')}
            </p>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className={`p-2 rounded-lg disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-1 ${theme === 'light' ? 'bg-white/60 text-black border-gray-200 focus:ring-black/30' : 'theme-bg-glass theme-border-glass border focus:ring-white/20'}`}
              >
                <ChevronLeft className={`w-5 h-5 ${theme === 'light' ? 'text-black' : ''}`} />
              </motion.button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-2 sm:px-3 py-2 rounded-lg ${currentPage === i + 1 ? 'accent-gradient text-white' : (theme === 'light' ? 'bg-white/60 text-black border-gray-200' : 'theme-bg-glass theme-border-glass border')}`}
                >
                  {i + 1}
                </motion.button>
              ))}
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className={`p-2 rounded-lg disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-1 ${theme === 'light' ? 'bg-white/60 text-black border-gray-200 focus:ring-black/30' : 'theme-bg-glass theme-border-glass border focus:ring-white/20'}`}
              >
                <ChevronRight className={`w-5 h-5 ${theme === 'light' ? 'text-black' : ''}`} />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Integration Detail Modal - Enhanced */}
     {/* Integration Detail Modal - Enhanced */}
     {/* Export Modal */}
<AnimatePresence>
  {showExportModal && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-stretch justify-stretch sm:items-center sm:justify-center"
    >
      <div className="absolute inset-0 bg-black/60" onClick={() => setShowExportModal(false)} />
      <motion.div
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.98, opacity: 0 }}
        className="relative w-full h-full max-w-none mx-0 p-4 rounded-none theme-border-glass border shadow-sm sm:max-w-3xl sm:mx-4 sm:p-5 sm:rounded-xl"
        style={{ background: theme === 'light' ? 'rgba(255,255,255,1)' : 'rgba(6,8,20,1)' }}
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-base font-semibold theme-text-primary flex items-center gap-3">
              <Download className="w-5 h-5 text-accent-gradient" />
              {t('extracted.export_report') || 'Export Data'}
            </h3>
            <p className="text-sm theme-text-muted mt-1">{t('extracted.export') || 'Export integrations as CSV or a printable PDF report.'}</p>
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
                    <p className="text-xs theme-text-muted">{t('extracted.exportAllDescription') || 'Download the full integrations dataset in the chosen format.'}</p>
                  </div>
                </div>
                <p className="text-sm theme-text-muted">{integrations.length} {t('extracted.integrations')}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <button onClick={() => { exportIntegrationsData(integrations); setShowExportModal(false); }} className="px-3.5 py-2 rounded-md border theme-border-glass text-sm hover:shadow-sm theme-bg-glass theme-text-primary">CSV</button>
                <button onClick={() => { exportIntegrationsPDF(integrations); setShowExportModal(false); }} className="px-3.5 py-2 rounded-md text-sm accent-gradient text-white shadow">PDF</button>
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
                <p className="text-sm theme-text-muted">{filteredIntegrations.length} {t('extracted.integrations')}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <button disabled={filteredIntegrations.length === 0} onClick={() => { exportIntegrationsData(filteredIntegrations); setShowExportModal(false); }} className="px-3.5 py-2 rounded-md border theme-border-glass text-sm hover:shadow-sm theme-bg-glass theme-text-primary disabled:opacity-50 disabled:cursor-not-allowed">CSV</button>
                <button disabled={filteredIntegrations.length === 0} onClick={() => { exportIntegrationsPDF(filteredIntegrations); setShowExportModal(false); }} className="px-3.5 py-2 rounded-md text-sm accent-gradient text-white shadow disabled:opacity-50">PDF</button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

    </div>
  );
};

export default IntegrationsPage;
