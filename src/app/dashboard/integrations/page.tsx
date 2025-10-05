"use client";
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import type * as THREE from 'three';
import {
  Search, Filter, Download, Plus, Eye, Edit,
   ChevronLeft, ChevronRight, X,
  Clock, AlertCircle, FileText, DollarSign,
  RefreshCw, TrendingUp,
  Shield,Scale,
  Banknote,Fingerprint,  CreditCard,
  CheckCircle, XCircle, PieChart,
   Users, Map as MapIcon, Timer,
  Database, Server, Cloud, Wifi, WifiOff, Network, Shield as ShieldIcon,
} from 'lucide-react';

// Mock data for government integrations
const mockIntegrations = [
  {
    id: 'AADHAAR-001',
    name: 'Aadhaar Authentication',
    provider: 'UIDAI',
    category: 'identity-verification',
    status: 'active',
    health: 'excellent',
    lastSync: '2024-03-18 14:30:25',
    nextSync: '2024-03-18 15:30:00',
    syncFrequency: 'real-time',
    successRate: 99.8,
    responseTime: '1.2s',
    apiVersion: '2.5',
    endpoints: 3,
    description: 'Real-time Aadhaar authentication and e-KYC services for beneficiary verification',
    documentation: 'https://uidai.gov.in/apis',
    apiKey: '•••••••••a1b2c3',
    security: 'ISO 27001 Certified',
    dataEncryption: 'AES-256',
    compliance: ['DPDPA', 'IT Act'],
    usage: {
      monthly: 12500,
      daily: 450,
      errors: 12
    },
    config: {
      authType: 'OAuth 2.0',
      rateLimit: '1000/hour',
      timeout: '30s'
    },
    logs: [
      { timestamp: '2024-03-18 14:30:25', status: 'success', message: 'Authentication successful' },
      { timestamp: '2024-03-18 14:25:10', status: 'success', message: 'KYC verification completed' },
      { timestamp: '2024-03-18 14:20:45', status: 'warning', message: 'High latency detected' }
    ]
  },
  {
    id: 'DIGILOCKER-002',
    name: 'DigiLocker Integration',
    provider: 'MeitY',
    category: 'document-verification',
    status: 'active',
    health: 'good',
    lastSync: '2024-03-18 13:45:10',
    nextSync: '2024-03-18 14:45:00',
    syncFrequency: 'hourly',
    successRate: 98.5,
    responseTime: '2.1s',
    apiVersion: '1.8',
    endpoints: 5,
    description: 'Secure document fetching and verification from DigiLocker repository',
    documentation: 'https://digilocker.gov.in/developers',
    apiKey: '•••••••••d4e5f6',
    security: 'ISO 27001 Certified',
    dataEncryption: 'RSA-2048',
    compliance: ['DPDPA', 'IT Act'],
    usage: {
      monthly: 8900,
      daily: 320,
      errors: 25
    },
    config: {
      authType: 'API Key',
      rateLimit: '500/hour',
      timeout: '45s'
    },
    logs: [
      { timestamp: '2024-03-18 13:45:10', status: 'success', message: 'Document retrieval successful' },
      { timestamp: '2024-03-18 13:30:22', status: 'success', message: 'Document verification completed' }
    ]
  },
  {
    id: 'CCTNS-003',
    name: 'CCTNS Integration',
    provider: 'MHA',
    category: 'crime-records',
    status: 'active',
    health: 'good',
    lastSync: '2024-03-18 12:15:30',
    nextSync: '2024-03-18 13:15:00',
    syncFrequency: 'hourly',
    successRate: 96.2,
    responseTime: '3.5s',
    apiVersion: '3.2',
    endpoints: 8,
    description: 'Crime and Criminal Tracking Network System integration for case verification',
    documentation: 'https://cctns.gov.in/apis',
    apiKey: '•••••••••g7h8i9',
    security: 'MHA Certified',
    dataEncryption: 'AES-256',
    compliance: ['IT Act', 'CrPC'],
    usage: {
      monthly: 6700,
      daily: 240,
      errors: 18
    },
    config: {
      authType: 'Certificate-based',
      rateLimit: '200/hour',
      timeout: '60s'
    },
    logs: [
      { timestamp: '2024-03-18 12:15:30', status: 'success', message: 'Case data synchronized' },
      { timestamp: '2024-03-18 11:45:15', status: 'error', message: 'Temporary connection timeout' }
    ]
  },
  {
    id: 'ECOURTS-004',
    name: 'eCourts Integration',
    provider: 'eCommittee, SC',
    category: 'court-records',
    status: 'active',
    health: 'fair',
    lastSync: '2024-03-18 11:30:45',
    nextSync: '2024-03-18 12:30:00',
    syncFrequency: 'hourly',
    successRate: 94.7,
    responseTime: '4.2s',
    apiVersion: '2.1',
    endpoints: 6,
    description: 'Integration with eCourts for case status and hearing information',
    documentation: 'https://ecourts.gov.in/apis',
    apiKey: '•••••••••j0k1l2',
    security: 'Supreme Court Certified',
    dataEncryption: 'AES-256',
    compliance: ['IT Act', 'Evidence Act'],
    usage: {
      monthly: 5400,
      daily: 190,
      errors: 32
    },
    config: {
      authType: 'OAuth 2.0',
      rateLimit: '300/hour',
      timeout: '45s'
    },
    logs: [
      { timestamp: '2024-03-18 11:30:45', status: 'success', message: 'Case status updated' },
      { timestamp: '2024-03-18 10:15:20', status: 'warning', message: 'Partial data received' }
    ]
  },
  {
    id: 'NSDL-005',
    name: 'NSDL Banking',
    provider: 'NSDL',
    category: 'banking-services',
    status: 'active',
    health: 'excellent',
    lastSync: '2024-03-18 10:45:15',
    nextSync: '2024-03-18 11:45:00',
    syncFrequency: 'real-time',
    successRate: 99.9,
    responseTime: '0.8s',
    apiVersion: '4.0',
    endpoints: 12,
    description: 'National Securities Depository Limited integration for DBT payments and banking',
    documentation: 'https://nsdl.co.in/apis',
    apiKey: '•••••••••m3n4o5',
    security: 'RBI Certified',
    dataEncryption: 'AES-256 + TLS 1.3',
    compliance: ['RBI Guidelines', 'FEMA'],
    usage: {
      monthly: 21500,
      daily: 780,
      errors: 5
    },
    config: {
      authType: 'Mutual TLS',
      rateLimit: '5000/hour',
      timeout: '15s'
    },
    logs: [
      { timestamp: '2024-03-18 10:45:15', status: 'success', message: 'Payment processed successfully' },
      { timestamp: '2024-03-18 10:30:10', status: 'success', message: 'Account verification completed' }
    ]
  },
  {
    id: 'NPCI-006',
    name: 'NPCI UPI & IMPS',
    provider: 'NPCI',
    category: 'payment-services',
    status: 'active',
    health: 'excellent',
    lastSync: '2024-03-18 09:20:30',
    nextSync: '2024-03-18 09:21:00',
    syncFrequency: 'real-time',
    successRate: 99.7,
    responseTime: '1.1s',
    apiVersion: '3.5',
    endpoints: 15,
    description: 'National Payments Corporation of India integration for UPI and IMPS transactions',
    documentation: 'https://www.npci.org.in/apis',
    apiKey: '•••••••••p6q7r8',
    security: 'PCI DSS Certified',
    dataEncryption: 'AES-256 + RSA-4096',
    compliance: ['RBI Guidelines', 'PCI DSS'],
    usage: {
      monthly: 32800,
      daily: 1150,
      errors: 15
    },
    config: {
      authType: 'Certificate-based',
      rateLimit: '10000/hour',
      timeout: '10s'
    },
    logs: [
      { timestamp: '2024-03-18 09:20:30', status: 'success', message: 'UPI transaction completed' },
      { timestamp: '2024-03-18 09:15:45', status: 'success', message: 'IMPS transfer successful' }
    ]
  },
  {
    id: 'INCOME-TAX-007',
    name: 'Income Tax Database',
    provider: 'CBDT',
    category: 'financial-verification',
    status: 'inactive',
    health: 'offline',
    lastSync: '2024-03-17 18:30:00',
    nextSync: '2024-03-19 09:00:00',
    syncFrequency: 'daily',
    successRate: 92.3,
    responseTime: '5.8s',
    apiVersion: '2.0',
    endpoints: 4,
    description: 'Central Board of Direct Taxes integration for income verification and PAN validation',
    documentation: 'https://incometaxindia.gov.in/apis',
    apiKey: '•••••••••s9t0u1',
    security: 'CBDT Certified',
    dataEncryption: 'AES-256',
    compliance: ['Income Tax Act'],
    usage: {
      monthly: 3200,
      daily: 120,
      errors: 28
    },
    config: {
      authType: 'API Key + IP Whitelist',
      rateLimit: '100/hour',
      timeout: '90s'
    },
    logs: [
      { timestamp: '2024-03-17 18:30:00', status: 'error', message: 'Scheduled maintenance' },
      { timestamp: '2024-03-17 17:45:15', status: 'success', message: 'PAN verification completed' }
    ]
  },
  {
    id: 'NSAP-008',
    name: 'NSAP Database',
    provider: 'Ministry of Rural Development',
    category: 'social-welfare',
    status: 'active',
    health: 'good',
    lastSync: '2024-03-18 08:15:20',
    nextSync: '2024-03-18 09:15:00',
    syncFrequency: 'hourly',
    successRate: 95.8,
    responseTime: '2.8s',
    apiVersion: '1.5',
    endpoints: 7,
    description: 'National Social Assistance Programme integration for beneficiary cross-verification',
    documentation: 'https://nsap.gov.in/apis',
    apiKey: '•••••••••v2w3x4',
    security: 'Ministry Certified',
    dataEncryption: 'AES-256',
    compliance: ['NSAP Guidelines'],
    usage: {
      monthly: 4800,
      daily: 170,
      errors: 22
    },
    config: {
      authType: 'OAuth 2.0',
      rateLimit: '400/hour',
      timeout: '30s'
    },
    logs: [
      { timestamp: '2024-03-18 08:15:20', status: 'success', message: 'Beneficiary data synchronized' },
      { timestamp: '2024-03-18 07:30:45', status: 'success', message: 'Eligibility check completed' }
    ]
  },
  {
    id: 'STATE-PORTALS-009',
    name: 'State Welfare Portals',
    provider: 'Various State Governments',
    category: 'state-integrations',
    status: 'active',
    health: 'fair',
    lastSync: '2024-03-18 07:45:30',
    nextSync: '2024-03-18 08:45:00',
    syncFrequency: 'hourly',
    successRate: 91.4,
    responseTime: '6.5s',
    apiVersion: 'Multiple',
    endpoints: 28,
    description: 'Integration with state-level social welfare and SC/ST development portals',
    documentation: 'Various state portals',
    apiKey: '•••••••••y5z6a7',
    security: 'State Certified',
    dataEncryption: 'AES-256',
    compliance: ['State IT Policies'],
    usage: {
      monthly: 15200,
      daily: 540,
      errors: 145
    },
    config: {
      authType: 'Mixed (OAuth/API Key)',
      rateLimit: 'Varies by state',
      timeout: '60s'
    },
    logs: [
      { timestamp: '2024-03-18 07:45:30', status: 'warning', message: 'Partial sync - Bihar portal timeout' },
      { timestamp: '2024-03-18 07:30:15', status: 'success', message: 'UP portal synchronized successfully' }
    ]
  },
  {
    id: 'CLOUD-INFRA-010',
    name: 'MeghRaj Cloud',
    provider: 'MeitY',
    category: 'cloud-services',
    status: 'active',
    health: 'excellent',
    lastSync: '2024-03-18 06:30:00',
    nextSync: 'Continuous',
    syncFrequency: 'continuous',
    successRate: 99.95,
    responseTime: '0.3s',
    apiVersion: 'N/A',
    endpoints: 0,
    description: 'Government of India MeghRaj Cloud infrastructure hosting and services',
    documentation: 'https://meghraj.gov.in',
    apiKey: 'Infrastructure',
    security: 'STQC Certified',
    dataEncryption: 'Multiple layers',
    compliance: ['Cloud Security Guidelines'],
    usage: {
      monthly: 'Continuous',
      daily: 'Continuous',
      errors: 2
    },
    config: {
      authType: 'IAM',
      rateLimit: 'N/A',
      timeout: 'N/A'
    },
    logs: [
      { timestamp: '2024-03-18 06:30:00', status: 'success', message: 'Infrastructure healthy' },
      { timestamp: '2024-03-18 05:45:15', status: 'success', message: 'Auto-scaling activated' }
    ]
  }
];

const IntegrationsPage = () => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [healthFilter, setHealthFilter] = useState('all');
  const [sortBy] = useState('name');
  const [sortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<typeof mockIntegrations[0] | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState('overview');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Filter and sort integrations
  const filteredIntegrations = useMemo(() => {
    let filtered = [...mockIntegrations];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(integration =>
        integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        integration.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
        integration.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        integration.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(integration => integration.status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(integration => integration.category === categoryFilter);
    }

    // Health filter
    if (healthFilter !== 'all') {
      filtered = filtered.filter(integration => integration.health === healthFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      const aVal = a[sortBy as keyof typeof a];
      const bVal = b[sortBy as keyof typeof b];
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [searchQuery, statusFilter, categoryFilter, healthFilter, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredIntegrations.length / itemsPerPage);
  const paginatedIntegrations = filteredIntegrations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Statistics
  const stats = useMemo(() => {
    const total = mockIntegrations.length;
    const active = mockIntegrations.filter(i => i.status === 'active').length;
    const inactive = mockIntegrations.filter(i => i.status === 'inactive').length;
    const excellent = mockIntegrations.filter(i => i.health === 'excellent').length;
    const good = mockIntegrations.filter(i => i.health === 'good').length;
    const fair = mockIntegrations.filter(i => i.health === 'fair').length;
    const offline = mockIntegrations.filter(i => i.health === 'offline').length;
    
    const totalEndpoints = mockIntegrations.reduce((sum, i) => sum + i.endpoints, 0);
    const avgSuccessRate = mockIntegrations.reduce((sum, i) => sum + i.successRate, 0) / total;
    
    return {
      total,
      active,
      inactive,
      excellent,
      good,
      fair,
      offline,
      totalEndpoints,
      avgSuccessRate: Math.round(avgSuccessRate * 10) / 10
    };
  }, []);

  // Category distribution
  const categoryStats = useMemo(() => {
    const categories = {
      'identity-verification': mockIntegrations.filter(i => i.category === 'identity-verification').length,
      'document-verification': mockIntegrations.filter(i => i.category === 'document-verification').length,
      'crime-records': mockIntegrations.filter(i => i.category === 'crime-records').length,
      'court-records': mockIntegrations.filter(i => i.category === 'court-records').length,
      'banking-services': mockIntegrations.filter(i => i.category === 'banking-services').length,
      'payment-services': mockIntegrations.filter(i => i.category === 'payment-services').length,
      'financial-verification': mockIntegrations.filter(i => i.category === 'financial-verification').length,
      'social-welfare': mockIntegrations.filter(i => i.category === 'social-welfare').length,
      'state-integrations': mockIntegrations.filter(i => i.category === 'state-integrations').length,
      'cloud-services': mockIntegrations.filter(i => i.category === 'cloud-services').length
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
        case 'active': return 'text-green-300 bg-green-900/30';
        case 'inactive': return 'text-red-300 bg-red-900/30';
        case 'pending': return 'text-amber-300 bg-amber-900/30';
        default: return 'text-gray-300 bg-gray-800';
      }
    }

    switch (status) {
      case 'active': return 'text-green-700 bg-green-100';
      case 'inactive': return 'text-red-700 bg-red-100';
      case 'pending': return 'text-amber-700 bg-amber-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getHealthColor = (health: string) => {
    if (theme === 'dark') {
      switch (health) {
        case 'excellent': return 'text-green-300 bg-green-900/30';
        case 'good': return 'text-blue-300 bg-blue-900/30';
        case 'fair': return 'text-amber-300 bg-amber-900/30';
        case 'offline': return 'text-red-300 bg-red-900/30';
        default: return 'text-gray-300 bg-gray-800';
      }
    }

    switch (health) {
      case 'excellent': return 'text-green-700 bg-green-100';
      case 'good': return 'text-blue-700 bg-blue-100';
      case 'fair': return 'text-amber-700 bg-amber-100';
      case 'offline': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
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

  const handleTestConnection = (integrationId: string) => {
    // In a real application, this would make an API call to test the connection
    console.log(`Testing connection for integration: ${integrationId}`);
    // Show success/error notification
  };

  const handleSyncNow = (integrationId: string) => {
    // In a real application, this would trigger an immediate sync
    console.log(`Manual sync triggered for integration: ${integrationId}`);
    // Show success/error notification
  };

  return (
    <div data-theme={theme} className="p-4 lg:p-6 space-y-6">
      {/* Three.js Canvas Background (theme-aware) */}
      <canvas
        ref={canvasRef}
        id="integrations-three-canvas"
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
          <h1 className="text-3xl font-bold theme-text-primary mb-2">Government Integrations</h1>
          <p className="theme-text-secondary">Manage connections with government systems and platforms for DBT under PCR/PoA Acts</p>
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
            <span>New Integration</span>
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
          { label: 'Total', value: stats.total, color: 'from-blue-500 to-cyan-500', icon: Database },
          { label: 'Active', value: stats.active, color: 'from-green-500 to-emerald-500', icon: CheckCircle },
          { label: 'Inactive', value: stats.inactive, color: 'from-red-500 to-rose-500', icon: XCircle },
          { label: 'Excellent', value: stats.excellent, color: 'from-green-500 to-emerald-500', icon: TrendingUp },
          { label: 'Good', value: stats.good, color: 'from-blue-500 to-cyan-500', icon: CheckCircle },
          { label: 'Fair', value: stats.fair, color: 'from-amber-500 to-orange-500', icon: AlertCircle },
          { label: 'Offline', value: stats.offline, color: 'from-red-500 to-rose-500', icon: WifiOff },
          { label: 'Endpoints', value: stats.totalEndpoints, color: 'from-purple-500 to-pink-500', icon: Network }
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
              <p className="text-sm theme-text-muted">Average Success Rate</p>
              <p className="text-2xl font-bold theme-text-primary">{stats.avgSuccessRate}%</p>
            </div>
          </div>
          <p className="text-sm theme-text-secondary">
            Across all active integrations
          </p>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="theme-bg-card theme-border-glass border rounded-xl p-6 backdrop-blur-xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Server className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm theme-text-muted">API Endpoints</p>
              <p className="text-2xl font-bold theme-text-primary">{stats.totalEndpoints}</p>
            </div>
          </div>
          <p className="text-sm theme-text-secondary">
            Active API connections
          </p>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="theme-bg-card theme-border-glass border rounded-xl p-6 backdrop-blur-xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <ShieldIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm theme-text-muted">Security Compliance</p>
              <p className="text-2xl font-bold theme-text-primary">100%</p>
            </div>
          </div>
          <p className="text-sm theme-text-secondary">
            All integrations certified
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
            <h3 className="text-lg font-semibold theme-text-primary">Integration Categories</h3>
            <p className="text-sm theme-text-muted">Distribution by service type</p>
          </div>
          <PieChart className="w-5 h-5 theme-text-muted" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.entries(categoryStats).map(([category, count]) => {
            const Icon = getCategoryIcon(category);
            return (
              <div key={category} className="text-center p-4 rounded-lg theme-bg-glass">
                <Icon className="w-8 h-8 theme-text-primary mx-auto mb-2" />
                <p className="text-lg font-bold theme-text-primary">{count}</p>
                <p className="text-xs theme-text-muted capitalize">
                  {formatCategoryName(category)}
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
              placeholder="Search integrations by name, provider, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 theme-bg-glass rounded-lg p-1 sm:p-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded ${viewMode === 'grid' ? 'accent-gradient text-white' : 'theme-text-muted'}`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded ${viewMode === 'list' ? 'accent-gradient text-white' : 'theme-text-muted'}`}
            >
              List
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
            {(statusFilter !== 'all' || categoryFilter !== 'all' || healthFilter !== 'all') && (
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t theme-border-glass">
                <div>
                  <label className="block text-sm theme-text-muted mb-2">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
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
                    <option value="identity-verification">Identity Verification</option>
                    <option value="document-verification">Document Verification</option>
                    <option value="crime-records">Crime Records</option>
                    <option value="court-records">Court Records</option>
                    <option value="banking-services">Banking Services</option>
                    <option value="payment-services">Payment Services</option>
                    <option value="financial-verification">Financial Verification</option>
                    <option value="social-welfare">Social Welfare</option>
                    <option value="state-integrations">State Integrations</option>
                    <option value="cloud-services">Cloud Services</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm theme-text-muted mb-2">Health</label>
                  <select
                    value={healthFilter}
                    onChange={(e) => setHealthFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary"
                  >
                    <option value="all">All Health</option>
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

     {/* Integrations List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="theme-bg-card theme-border-glass border rounded-xl backdrop-blur-xl overflow-hidden"
      >
        {viewMode === 'list' ? (
          isMobile ? (
            <div className="p-3 space-y-3">
              {paginatedIntegrations.map((integration, idx) => {
                const CategoryIcon = getCategoryIcon(integration.category);
                const HealthIcon = getHealthIcon(integration.health);
                
                return (
                  <motion.div
                    key={integration.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    whileTap={{ scale: 0.995 }}
                    className="theme-bg-glass theme-border-glass border rounded-xl p-4 active:bg-opacity-80"
                    onClick={() => setSelectedIntegration(integration)}
                  >
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-12 h-12 rounded-lg accent-gradient flex items-center justify-center text-white flex-shrink-0 shadow-md">
                          <CategoryIcon className="w-6 h-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold theme-text-primary truncate">{integration.name}</p>
                          <p className="text-xs theme-text-muted truncate">{integration.id}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${getStatusColor(integration.status)}`}>
                        {integration.status === 'active' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      </span>
                    </div>

                    {/* Info Grid */}
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="theme-text-muted flex items-center gap-1.5">
                          <Database className="w-3.5 h-3.5" />
                          Provider
                        </span>
                        <span className="theme-text-primary font-medium">{integration.provider}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="theme-text-muted flex items-center gap-1.5">
                          <CategoryIcon className="w-3.5 h-3.5" />
                          Category
                        </span>
                        <span className="theme-text-primary font-medium capitalize">{formatCategoryName(integration.category)}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="theme-text-muted flex items-center gap-1.5">
                          <HealthIcon className="w-3.5 h-3.5" />
                          Health
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getHealthColor(integration.health)}`}>
                          <HealthIcon className="w-3 h-3" />
                          <span className="capitalize">{integration.health}</span>
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="theme-text-muted flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          Last Sync
                        </span>
                        <span className="theme-text-primary font-medium font-mono text-[10px]">{integration.lastSync}</span>
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center gap-4 mb-3 text-xs theme-text-secondary pb-3 border-b theme-border-glass">
                      <div className="flex items-center gap-1.5">
                        <Network className="w-3.5 h-3.5" />
                        <span>{integration.endpoints} EP</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>{integration.successRate}%</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Timer className="w-3.5 h-3.5" />
                        <span>{integration.responseTime}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleTestConnection(integration.id); }}
                        className="px-3 py-2 rounded-lg theme-bg-card theme-border-glass border text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-green-500/10 active:scale-95 transition-all"
                      >
                        <Wifi className="w-3.5 h-3.5" />
                        <span>Test</span>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleSyncNow(integration.id); }}
                        className="px-3 py-2 rounded-lg theme-bg-card theme-border-glass border text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-blue-500/10 active:scale-95 transition-all"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Sync</span>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedIntegration(integration); }}
                        className="px-3 py-2 rounded-lg accent-gradient text-white text-xs font-medium flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
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
                    <th className="px-4 py-3 text-left text-sm font-semibold theme-text-primary">Integration</th>
                    <th className="hidden sm:table-cell px-4 py-3 text-left text-sm font-semibold theme-text-primary">Provider</th>
                    <th className="hidden md:table-cell px-4 py-3 text-left text-sm font-semibold theme-text-primary">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold theme-text-primary">Status</th>
                    <th className="hidden lg:table-cell px-4 py-3 text-left text-sm font-semibold theme-text-primary">Health</th>
                    <th className="hidden xl:table-cell px-4 py-3 text-left text-sm font-semibold theme-text-primary">Last Sync</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold theme-text-primary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedIntegrations.map((integration, idx) => (
                    <motion.tr
                      key={integration.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-b theme-border-glass hover:theme-bg-glass transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg accent-gradient flex items-center justify-center text-white">
                            {(() => {
                              const Icon = getCategoryIcon(integration.category);
                              return <Icon className="w-5 h-5" />;
                            })()}
                          </div>
                          <div>
                            <p className="text-sm font-medium theme-text-primary">{integration.name}</p>
                            <p className="text-xs theme-text-muted">{integration.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-4 py-3 text-sm theme-text-primary">
                        {integration.provider}
                      </td>
                      <td className="hidden md:table-cell px-4 py-3">
                        <span className="px-2 py-1 rounded text-xs font-medium theme-bg-glass capitalize">
                          {integration.category.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(integration.status)}`}>
                          {integration.status === 'active' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {integration.status}
                        </span>
                      </td>
                      <td className="hidden lg:table-cell px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getHealthColor(integration.health)}`}>
                          {(() => {
                            const Icon = getHealthIcon(integration.health);
                            return <Icon className="w-3 h-3" />;
                          })()}
                          {integration.health}
                        </span>
                      </td>
                      <td className="hidden xl:table-cell px-4 py-3 text-sm theme-text-primary">
                        {integration.lastSync}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setSelectedIntegration(integration)}
                            className="p-1.5 rounded-lg theme-bg-glass hover:accent-gradient hover:text-white transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleTestConnection(integration.id)}
                            className="p-1.5 rounded-lg theme-bg-glass hover:bg-green-500/20 hover:text-green-400 transition-colors"
                          >
                            <Wifi className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleSyncNow(integration.id)}
                            className="p-1.5 rounded-lg theme-bg-glass hover:bg-blue-500/20 hover:text-blue-400 transition-colors"
                          >
                            <RefreshCw className="w-4 h-4" />
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
            {paginatedIntegrations.map((integration, idx) => (
              <motion.div
                key={integration.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -4 }}
                className="theme-bg-glass theme-border-glass border rounded-xl p-4 cursor-pointer"
                onClick={() => setSelectedIntegration(integration)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg accent-gradient flex items-center justify-center text-white">
                      {(() => {
                        const Icon = getCategoryIcon(integration.category);
                        return <Icon className="w-6 h-6" />;
                      })()}
                    </div>
                    <div>
                      <p className="font-medium theme-text-primary">{integration.name}</p>
                      <p className="text-xs theme-text-muted">{integration.id}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(integration.status)}`}>
                    {integration.status === 'active' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  </span>
                </div>
                
                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-sm theme-text-secondary">
                    <Database className="w-4 h-4" />
                    <span>{integration.provider}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm theme-text-secondary">
                    <Network className="w-4 h-4" />
                    <span>{integration.endpoints} endpoints</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm theme-text-secondary">
                    <TrendingUp className="w-4 h-4" />
                    <span>{integration.successRate}% success rate</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm theme-text-secondary">
                    <Clock className="w-4 h-4" />
                    <span>Last sync: {integration.lastSync.split(' ')[1]}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t theme-border-glass">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getHealthColor(integration.health)}`}>
                    {(() => {
                      const Icon = getHealthIcon(integration.health);
                      return <Icon className="w-3 h-3" />;
                    })()}
                    {integration.health}
                  </span>
                  <div className="flex items-center gap-1">
                    <button 
                      className="p-1.5 rounded-lg hover:theme-bg-card"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTestConnection(integration.id);
                      }}
                    >
                      <Wifi className="w-4 h-4" />
                    </button>
                    <button 
                      className="p-1.5 rounded-lg hover:theme-bg-card"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSyncNow(integration.id);
                      }}
                    >
                      <RefreshCw className="w-4 h-4" />
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
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredIntegrations.length)} of {filteredIntegrations.length}
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

      {/* Integration Detail Modal */}
      <AnimatePresence>
        {selectedIntegration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedIntegration(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`${isMobile ? 'theme-bg-card theme-border-glass border rounded-tl-none rounded-tr-none w-full h-full max-h-none overflow-y-auto' : 'theme-bg-card theme-border-glass border rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto'}`}
            >
              <div className="sticky top-0 theme-bg-nav backdrop-blur-xl border-b theme-border-glass p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg accent-gradient flex items-center justify-center text-white">
                    {(() => {
                      const Icon = getCategoryIcon(selectedIntegration.category);
                      return <Icon className="w-6 h-6" />;
                    })()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold theme-text-primary">{selectedIntegration.name}</h2>
                    <p className="theme-text-muted">{selectedIntegration.provider} • {selectedIntegration.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedIntegration(null)}
                  className="p-2 rounded-lg theme-bg-glass hover:bg-red-500/20"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="border-b theme-border-glass">
                <div className="flex overflow-x-auto">
                  {['overview', 'configuration', 'logs', 'analytics'].map((tab) => (
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
                {activeTab === 'overview' && (
                  <>
                    {/* Integration Overview */}
                    <div>
                      <h3 className="text-lg font-semibold theme-text-primary mb-4">Integration Overview</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg theme-bg-glass">
                          <p className="text-sm theme-text-muted mb-2">Description</p>
                          <p className="theme-text-primary leading-relaxed">{selectedIntegration.description}</p>
                        </div>
                        <div className="p-4 rounded-lg theme-bg-glass">
                          <p className="text-sm theme-text-muted mb-2">Documentation</p>
                          <a href={selectedIntegration.documentation} className="text-blue-500 hover:underline flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            API Documentation
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Status and Health */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-4 rounded-lg theme-bg-glass border theme-border-glass">
                        <p className="text-sm theme-text-muted mb-2">Status</p>
                        <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border ${getStatusColor(selectedIntegration.status)}`}>
                          {selectedIntegration.status === 'active' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          {selectedIntegration.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="p-4 rounded-lg theme-bg-glass border theme-border-glass">
                        <p className="text-sm theme-text-muted mb-2">Health</p>
                        <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border ${getHealthColor(selectedIntegration.health)}`}>
                          {(() => {
                            const Icon = getHealthIcon(selectedIntegration.health);
                            return <Icon className="w-4 h-4" />;
                          })()}
                          {selectedIntegration.health.toUpperCase()}
                        </span>
                      </div>
                      <div className="p-4 rounded-lg theme-bg-glass border theme-border-glass">
                        <p className="text-sm theme-text-muted mb-2">Success Rate</p>
                        <p className="text-2xl font-bold theme-text-primary">{selectedIntegration.successRate}%</p>
                      </div>
                      <div className="p-4 rounded-lg theme-bg-glass border theme-border-glass">
                        <p className="text-sm theme-text-muted mb-2">Response Time</p>
                        <p className="text-2xl font-bold theme-text-primary">{selectedIntegration.responseTime}</p>
                      </div>
                    </div>

                    {/* Sync Information */}
                    <div>
                      <h3 className="text-lg font-semibold theme-text-primary mb-4">Sync Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-lg theme-bg-glass">
                          <p className="text-sm theme-text-muted mb-1">Last Sync</p>
                          <p className="font-medium theme-text-primary">{selectedIntegration.lastSync}</p>
                        </div>
                        <div className="p-4 rounded-lg theme-bg-glass">
                          <p className="text-sm theme-text-muted mb-1">Next Sync</p>
                          <p className="font-medium theme-text-primary">{selectedIntegration.nextSync}</p>
                        </div>
                        <div className="p-4 rounded-lg theme-bg-glass">
                          <p className="text-sm theme-text-muted mb-1">Sync Frequency</p>
                          <p className="font-medium theme-text-primary">{selectedIntegration.syncFrequency}</p>
                        </div>
                      </div>
                    </div>

                    {/* Usage Statistics */}
                    <div>
                      <h3 className="text-lg font-semibold theme-text-primary mb-4">Usage Statistics</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-lg theme-bg-glass text-center">
                          <p className="text-2xl font-bold theme-text-primary">{selectedIntegration.usage.monthly}</p>
                          <p className="text-sm theme-text-muted">Monthly Requests</p>
                        </div>
                        <div className="p-4 rounded-lg theme-bg-glass text-center">
                          <p className="text-2xl font-bold theme-text-primary">{selectedIntegration.usage.daily}</p>
                          <p className="text-sm theme-text-muted">Daily Requests</p>
                        </div>
                        <div className="p-4 rounded-lg theme-bg-glass text-center">
                          <p className="text-2xl font-bold theme-text-primary">{selectedIntegration.usage.errors}</p>
                          <p className="text-sm theme-text-muted">Monthly Errors</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'configuration' && (
                  <div className="space-y-6">
                    {/* API Configuration */}
                    <div>
                      <h3 className="text-lg font-semibold theme-text-primary mb-4">API Configuration</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg theme-bg-glass">
                          <p className="text-sm theme-text-muted mb-1">API Version</p>
                          <p className="font-medium theme-text-primary">{selectedIntegration.apiVersion}</p>
                        </div>
                        <div className="p-4 rounded-lg theme-bg-glass">
                          <p className="text-sm theme-text-muted mb-1">Endpoints</p>
                          <p className="font-medium theme-text-primary">{selectedIntegration.endpoints}</p>
                        </div>
                        <div className="p-4 rounded-lg theme-bg-glass">
                          <p className="text-sm theme-text-muted mb-1">Authentication</p>
                          <p className="font-medium theme-text-primary">{selectedIntegration.config.authType}</p>
                        </div>
                        <div className="p-4 rounded-lg theme-bg-glass">
                          <p className="text-sm theme-text-muted mb-1">Rate Limit</p>
                          <p className="font-medium theme-text-primary">{selectedIntegration.config.rateLimit}</p>
                        </div>
                      </div>
                    </div>

                    {/* Security Information */}
                    <div>
                      <h3 className="text-lg font-semibold theme-text-primary mb-4">Security & Compliance</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg theme-bg-glass">
                          <p className="text-sm theme-text-muted mb-1">Security Certification</p>
                          <p className="font-medium theme-text-primary">{selectedIntegration.security}</p>
                        </div>
                        <div className="p-4 rounded-lg theme-bg-glass">
                          <p className="text-sm theme-text-muted mb-1">Data Encryption</p>
                          <p className="font-medium theme-text-primary">{selectedIntegration.dataEncryption}</p>
                        </div>
                        <div className="p-4 rounded-lg theme-bg-glass">
                          <p className="text-sm theme-text-muted mb-1">Compliance</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedIntegration.compliance.map((comp, idx) => (
                              <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                {comp}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="p-4 rounded-lg theme-bg-glass">
                          <p className="text-sm theme-text-muted mb-1">API Key</p>
                          <p className="font-medium theme-text-primary font-mono">{selectedIntegration.apiKey}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'logs' && (
                  <div>
                    <h3 className="text-lg font-semibold theme-text-primary mb-4">Recent Activity Logs</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {selectedIntegration.logs.map((log, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-3 rounded-lg theme-bg-glass">
                          <div className={`w-2 h-2 rounded-full ${
                            log.status === 'success' ? 'bg-green-500' :
                            log.status === 'error' ? 'bg-red-500' :
                            'bg-yellow-500'
                          }`}></div>
                          <div className="flex-1">
                            <p className="text-sm theme-text-primary">{log.message}</p>
                            <p className="text-xs theme-text-muted">{log.timestamp}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            log.status === 'success' ? 'bg-green-100 text-green-800' :
                            log.status === 'error' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {log.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'analytics' && (
                  <div className="space-y-6">
                    {/* Performance Metrics */}
                    <div>
                      <h3 className="text-lg font-semibold theme-text-primary mb-4">Performance Metrics</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-4 rounded-lg theme-bg-glass text-center">
                          <p className="text-2xl font-bold theme-text-primary">{selectedIntegration.successRate}%</p>
                          <p className="text-sm theme-text-muted">Success Rate</p>
                        </div>
                        <div className="p-4 rounded-lg theme-bg-glass text-center">
                          <p className="text-2xl font-bold theme-text-primary">{selectedIntegration.responseTime}</p>
                          <p className="text-sm theme-text-muted">Avg Response Time</p>
                        </div>
                        <div className="p-4 rounded-lg theme-bg-glass text-center">
                          <p className="text-2xl font-bold theme-text-primary">{selectedIntegration.usage.monthly}</p>
                          <p className="text-sm theme-text-muted">Monthly API Calls</p>
                        </div>
                        <div className="p-4 rounded-lg theme-bg-glass text-center">
                          <p className="text-2xl font-bold theme-text-primary">{selectedIntegration.usage.errors}</p>
                          <p className="text-sm theme-text-muted">Error Count</p>
                        </div>
                      </div>
                    </div>

                    {/* Uptime Statistics */}
                    <div>
                      <h3 className="text-lg font-semibold theme-text-primary mb-4">Uptime Statistics</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-lg theme-bg-glass text-center">
                          <p className="text-2xl font-bold theme-text-primary">99.95%</p>
                          <p className="text-sm theme-text-muted">Last 30 Days</p>
                        </div>
                        <div className="p-4 rounded-lg theme-bg-glass text-center">
                          <p className="text-2xl font-bold theme-text-primary">99.92%</p>
                          <p className="text-sm theme-text-muted">Last 90 Days</p>
                        </div>
                        <div className="p-4 rounded-lg theme-bg-glass text-center">
                          <p className="text-2xl font-bold theme-text-primary">99.89%</p>
                          <p className="text-sm theme-text-muted">Last Year</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-6 border-t theme-border-glass">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleTestConnection(selectedIntegration.id)}
                    className="flex-1 px-4 py-3 rounded-xl bg-green-500/20 text-green-300 border border-green-500/30 font-semibold flex items-center justify-center gap-2"
                  >
                    <Wifi className="w-5 h-5" />
                    Test Connection
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSyncNow(selectedIntegration.id)}
                    className="flex-1 px-4 py-3 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Sync Now
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-4 py-3 rounded-xl theme-bg-glass theme-border-glass border font-semibold flex items-center justify-center gap-2"
                  >
                    <Edit className="w-5 h-5" />
                    Edit Configuration
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-4 py-3 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30 font-semibold flex items-center justify-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    Disable Integration
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

export default IntegrationsPage;