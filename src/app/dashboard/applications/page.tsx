"use client";
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useLocale } from '@/context/LocaleContext';
import { motion, AnimatePresence } from 'framer-motion';
import type * as THREE from 'three';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, onSnapshot, addDoc } from 'firebase/firestore';
import {
    Search, Filter, Download, Plus, Eye, Edit, ChevronLeft, ChevronRight, X, Check,
    Clock, AlertCircle, FileText, User, Phone, MapPin,
    DollarSign, MessageSquare, AlertTriangle, ChevronDown
} from 'lucide-react';

// New Application Form Component
const NewApplicationForm = ({ onCancel }: { onCancel: () => void }) => {
    const { theme } = useTheme();
    const { t } = useLocale();
    const [formData, setFormData] = useState({
        applicantName: '',
        aadhaar: '',
        phone: '',
        district: '',
        state: '',
        actType: '',
        incidentDate: '',
        amount: '',
        priority: 'medium',
        assignedOfficer: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const applicationsRef = collection(db, 'applications');
            const newApplication = {
                applicantName: formData.applicantName,
                aadhaar: formData.aadhaar,
                phone: formData.phone,
                district: formData.district,
                state: formData.state,
                actType: formData.actType,
                incidentDate: formData.incidentDate,
                applicationDate: new Date().toISOString(),
                status: 'pending',
                amount: parseFloat(formData.amount) || 0,
                priority: formData.priority,
                assignedOfficer: formData.assignedOfficer,
                documents: 0,
                lastUpdate: new Date().toISOString()
            };

            await addDoc(applicationsRef, newApplication);
            onCancel(); // Hide form after successful creation
        } catch (error) {
            console.error('Error creating application:', error);
            // You could add error handling here
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Applicant Information */}
            <div>
                <h3 className="text-lg font-semibold theme-text-primary mb-4">Applicant Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium theme-text-muted mb-2">Full Name *</label>
                        <input
                            type="text"
                            required
                            value={formData.applicantName}
                            onChange={(e) => handleInputChange('applicantName', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                            placeholder="Enter applicant's full name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium theme-text-muted mb-2">Phone Number *</label>
                        <input
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                            placeholder="Enter phone number"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium theme-text-muted mb-2">Aadhaar Number *</label>
                        <input
                            type="text"
                            required
                            value={formData.aadhaar}
                            onChange={(e) => handleInputChange('aadhaar', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                            placeholder="Enter 12-digit Aadhaar number"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium theme-text-muted mb-2">District *</label>
                        <input
                            type="text"
                            required
                            value={formData.district}
                            onChange={(e) => handleInputChange('district', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                            placeholder="Enter district"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium theme-text-muted mb-2">State *</label>
                        <input
                            type="text"
                            required
                            value={formData.state}
                            onChange={(e) => handleInputChange('state', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                            placeholder="Enter state"
                        />
                    </div>
                </div>
            </div>

            {/* Application Details */}
            <div>
                <h3 className="text-lg font-semibold theme-text-primary mb-4">Application Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium theme-text-muted mb-2">Act Type *</label>
                        <select
                            required
                            value={formData.actType}
                            onChange={(e) => handleInputChange('actType', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                        >
                            <option value="">Select Act Type</option>
                            <option value="PCR Act">PCR Act</option>
                            <option value="PoA Act">PoA Act</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium theme-text-muted mb-2">Incident Date *</label>
                        <input
                            type="date"
                            required
                            value={formData.incidentDate}
                            onChange={(e) => handleInputChange('incidentDate', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium theme-text-muted mb-2">Relief Amount (₹) *</label>
                        <input
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            value={formData.amount}
                            onChange={(e) => handleInputChange('amount', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                            placeholder="Enter relief amount"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium theme-text-muted mb-2">Priority Level</label>
                        <select
                            value={formData.priority}
                            onChange={(e) => handleInputChange('priority', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium theme-text-muted mb-2">Assigned Officer</label>
                        <input
                            type="text"
                            value={formData.assignedOfficer}
                            onChange={(e) => handleInputChange('assignedOfficer', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                            placeholder="Enter assigned officer name (optional)"
                        />
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-4 border-t theme-border-glass">
                <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onCancel}
                    className="flex-1 px-4 py-3 rounded-xl theme-bg-glass theme-border-glass border font-semibold flex items-center justify-center gap-2 theme-text-primary"
                    style={{ background: theme === 'light' ? 'rgba(248, 250, 252, 0.8)' : undefined }}
                >
                    Cancel
                </motion.button>
                <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-4 py-3 rounded-xl accent-gradient text-white font-semibold flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Creating...
                        </>
                    ) : (
                        <>
                            <Plus className="w-5 h-5" />
                            Create Application
                        </>
                    )}
                </motion.button>
            </div>
        </form>
    );
};

// Application data type
interface Application {
    id: string;
    applicantName: string;
    aadhaar: string;
    phone: string;
    district: string;
    state: string;
    actType: string;
    incidentDate: string;
    applicationDate: string;
    status: string;
    amount: number;
    priority: string;
    assignedOfficer: string;
    documents: number;
    lastUpdate: string;
}

// Function to export applications data as CSV
const exportApplicationsData = (applications: Application[]) => {
    const headers = [
        'Application ID',
        'Applicant Name',
        'Aadhaar Number',
        'Phone Number',
        'District',
        'State',
        'Act Type',
        'Incident Date',
        'Application Date',
        'Status',
        'Amount (INR)',
        'Priority',
        'Assigned Officer',
        'Documents Count',
        'Last Update'
    ];

    const rows = applications.map(app => [
        app.id,
        app.applicantName,
        app.aadhaar,
        app.phone,
        app.district,
        app.state,
        app.actType,
        app.incidentDate,
        app.applicationDate,
        app.status,
        app.amount.toString(),
        app.priority,
        app.assignedOfficer,
        app.documents.toString(),
        app.lastUpdate
    ]);

    const csvContent = [headers, ...rows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `applications_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// Function to export applications data as PDF
const exportApplicationsPDF = (applications: Application[]) => {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(20);
    doc.text('Applications Report', 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}`, 14, 32);
    doc.text(`Total Applications: ${applications.length}`, 14, 38);

    // Prepare table data
    const headers = [
        ['Application ID', 'Applicant Name', 'District', 'Act Type', 'Amount', 'Status', 'Priority']
    ];

    const rows = applications.map(app => [
        app.id,
        app.applicantName,
        `${app.district}, ${app.state}`,
        app.actType,
        `₹${app.amount.toLocaleString('en-IN')}`,
        app.status.replace('-', ' '),
        app.priority
    ]);

    // Add table
    autoTable(doc, {
        head: headers,
        body: rows,
        startY: 45,
        styles: {
            fontSize: 8,
            cellPadding: 3,
        },
        headStyles: {
            fillColor: [59, 130, 246],
            textColor: 255,
            fontStyle: 'bold',
        },
        alternateRowStyles: {
            fillColor: [248, 250, 252],
        },
        margin: { top: 45 },
    });

    // Save the PDF
    doc.save(`applications_report_${new Date().toISOString().split('T')[0]}.pdf`);
};

const ApplicationsPage = () => {
    const { theme } = useTheme();
    const { t } = useLocale();
    // Deterministic formatting helpers to avoid SSR/client hydration mismatches
    const formatDate = (d?: string | Date) => {
        if (!d) return '';
        try {
            const dt = typeof d === 'string' ? new Date(d) : d;
            return new Intl.DateTimeFormat('en-GB', { year: 'numeric', month: 'short', day: 'numeric' }).format(dt);
        } catch { return String(d); }
    };

 

    const formatCurrency = (n?: number) => {
        if (n == null) return '';
        try {
            return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n).replace('₹', '₹');
        } catch { return String(n); }
    };
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [actTypeFilter, setActTypeFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [sortBy] = useState('applicationDate');
    const [sortOrder] = useState<'asc' | 'desc'>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
    const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewApplicationForm, setShowNewApplicationForm] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    // Filter and sort applications
    const filteredApplications = useMemo(() => {
        let filtered = [...applications];

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(app =>
                app.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                app.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                app.district.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(app => app.status === statusFilter);
        }

        // Act type filter
        if (actTypeFilter !== 'all') {
            filtered = filtered.filter(app => app.actType === actTypeFilter);
        }

        // Priority filter
        if (priorityFilter !== 'all') {
            filtered = filtered.filter(app => app.priority === priorityFilter);
        }

        // Sort
        filtered.sort((a, b) => {
            const aVal = a[sortBy as keyof Application];
            const bVal = b[sortBy as keyof Application];

            if (sortOrder === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });

        return filtered;
    }, [applications, searchQuery, statusFilter, actTypeFilter, priorityFilter, sortBy, sortOrder]);

    // Pagination
    const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
    const paginatedApplications = filteredApplications.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Statistics
    const stats = useMemo(() => {
        return {
            total: applications.length,
            pending: applications.filter(a => a.status === 'pending').length,
            inReview: applications.filter(a => a.status === 'in-review').length,
            approved: applications.filter(a => a.status === 'approved').length,
            rejected: applications.filter(a => a.status === 'rejected').length,
            documentsRequired: applications.filter(a => a.status === 'documents-required').length
        };
    }, [applications]);

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

    // Fetch applications from Firebase
    useEffect(() => {
        const applicationsRef = collection(db, 'applications');
        const q = query(applicationsRef, orderBy('applicationDate', 'desc'));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const apps: Application[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                apps.push({
                    id: doc.id,
                    applicantName: data.applicantName || '',
                    aadhaar: data.aadhaar || '',
                    phone: data.phone || '',
                    district: data.district || '',
                    state: data.state || '',
                    actType: data.actType || '',
                    incidentDate: data.incidentDate || '',
                    applicationDate: data.applicationDate || '',
                    status: data.status || 'pending',
                    amount: data.amount || 0,
                    priority: data.priority || 'medium',
                    assignedOfficer: data.assignedOfficer || '',
                    documents: data.documents || 0,
                    lastUpdate: data.lastUpdate || ''
                });
            });
            setApplications(apps);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching applications:', error);
            setLoading(false);
        });

        return () => unsubscribe();
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

            // Theme-aware colors - subtle
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
            const particlesCount = 200; // Reduced for subtlety
            const posArray = new Float32Array(particlesCount * 3);

            for (let i = 0; i < particlesCount * 3; i++) {
                posArray[i] = (Math.random() - 0.5) * 10;
            }

            particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

            const particlesMaterial = new THREE.PointsMaterial({
                size: theme === 'dark' ? 0.005 : 0.003, // Smaller
                color: particleColor,
                transparent: true,
                opacity: theme === 'dark' ? 0.3 : 0.2, // Less opacity
                blending: THREE.AdditiveBlending
            });

            const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
            scene.add(particlesMesh);

            // Remove connecting lines for cleaner look
            // const linesGeometry = new THREE.BufferGeometry();
            // const linesMaterial = new THREE.LineBasicMaterial({ color: lineColor, transparent: true, opacity: theme === 'dark' ? 0.15 : 0.1 });

            // const linesPositions: number[] = [];
            // for (let i = 0; i < 80; i++) {
            //     const x1 = (Math.random() - 0.5) * 8;
            //     const y1 = (Math.random() - 0.5) * 8;
            //     const z1 = (Math.random() - 0.5) * 8;
            //     const x2 = x1 + (Math.random() - 0.5) * 1.5;
            //     const y2 = y1 + (Math.random() - 0.5) * 1.5;
            //     const z2 = z1 + (Math.random() - 0.5) * 1.5;
            //     linesPositions.push(x1, y1, z1, x2, y2, z2);
            // }

            // linesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linesPositions, 3));
            // const linesMesh = new THREE.LineSegments(linesGeometry, linesMaterial);
            // scene.add(linesMesh);

            let animationId: number | null = null;
            const animate = () => {
                animationId = requestAnimationFrame(animate);
                particlesMesh.rotation.y += 0.0001; // Slower
                particlesMesh.rotation.x += 0.00005;
                // linesMesh.rotation.y -= 0.0002;
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
                // linesGeometry.dispose();
                // linesMaterial.dispose();
            };
        })();
    }, [theme]);

    const getStatusColor = (status: string) => {
        if (theme === 'dark') {
            switch (status) {
                case 'approved': return 'text-green-300 bg-green-900/30';
                case 'pending': return 'text-amber-300 bg-amber-900/30';
                case 'in-review': return 'text-blue-300 bg-blue-900/30';
                case 'rejected': return 'text-red-300 bg-red-900/30';
                case 'documents-required': return 'text-purple-300 bg-purple-900/30';
                default: return 'text-gray-300 bg-gray-800';
            }
        }

        switch (status) {
            case 'approved': return 'text-green-700 bg-green-100';
            case 'pending': return 'text-amber-700 bg-amber-100';
            case 'in-review': return 'text-blue-700 bg-blue-100';
            case 'rejected': return 'text-red-700 bg-red-100';
            case 'documents-required': return 'text-purple-700 bg-purple-100';
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
            'pending': Clock,
            'in-review': Eye,
            'approved': Check,
            'rejected': X,
            'documents-required': AlertCircle
        };
        return icons[status as keyof typeof icons] || Clock;
    };

    return (
        <div data-theme={theme} className="p-4 lg:p-6 space-y-6">
            {/* Three.js Canvas Background (theme-aware) */}
            <canvas
                ref={canvasRef}
                id="applications-three-canvas"
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

        @media print {
          body {
            background: white !important;
          }
          
          #applications-three-canvas,
          canvas {
            display: none !important;
          }
          
          .no-print {
            display: none !important;
          }
          
          .print-only {
            display: block !important;
          }
          
          .theme-bg-card,
          .theme-bg-glass {
            background: white !important;
            border: 1px solid #e2e8f0 !important;
          }
          
          .theme-text-primary {
            color: #0f172a !important;
          }
          
          .theme-text-secondary,
          .theme-text-muted {
            color: #475569 !important;
          }
          
          .accent-gradient {
            background: linear-gradient(135deg, #3b82f6, #8b5cf6) !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          table {
            page-break-inside: auto;
          }
          
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          
          thead {
            display: table-header-group;
          }
          
          .print-page-break {
            page-break-before: always;
          }
          
          @page {
            margin: 1.5cm;
            size: A4;
          }
        }
      `}</style>
            
            {/* Print Header - Only visible when printing */}
            <div className="print-only hidden">
                <div style={{ textAlign: 'center', marginBottom: '30px', paddingBottom: '20px', borderBottom: '2px solid #3b82f6' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}>
                        {t('applications.title')}
                    </h1>
                    <p style={{ fontSize: '14px', color: '#64748b' }}>
                        Generated on {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
            </div>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="theme-bg-card theme-border-glass border rounded-xl p-6 backdrop-blur-sm shadow-sm"
            >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold theme-text-primary mb-2">
                            {t('extracted.application')} <span className="text-accent-gradient">{t('extracted.monitoring_center')}</span>
                        </h1>
                        <p className="theme-text-secondary text-base">
                            {t('extracted.realtime_application_tracking_description')}
                        </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowExportModal(true)}
                            className="px-4 py-2.5 theme-bg-glass theme-border-glass border rounded-lg flex items-center gap-2 theme-text-primary shadow-sm hover:shadow-md transition-shadow"
                        >
                            <Download className="w-4 h-4" />
                            <span>{t('extracted.export_data')}</span>
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowNewApplicationForm(true)}
                            className="px-4 py-2.5 accent-gradient text-white rounded-lg flex items-center gap-2 shadow-sm hover:shadow-md transition-shadow font-semibold"
                        >
                            <Plus className="w-4 h-4" />
                            <span>{t('extracted.new_application')}</span>
                        </motion.button>
                    </div>
                </div>
            </motion.div>

            {/* Main Content */}
            {showNewApplicationForm ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="theme-bg-card theme-border-glass border rounded-xl backdrop-blur-sm shadow-sm overflow-hidden"
                >
                    <div className="p-6 border-b theme-border-glass">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold theme-text-primary">{t('extracted.new_application')}</h2>
                                <p className="theme-text-muted">Create a new relief application</p>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowNewApplicationForm(false)}
                                className="p-2 rounded-lg theme-bg-glass hover:bg-red-500/20 theme-text-muted transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </motion.button>
                        </div>
                    </div>
                    <NewApplicationForm onCancel={() => setShowNewApplicationForm(false)} />
                </motion.div>
            ) : (
                <>
                    {/* Statistics Cards */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
                    >
                        {[
                            { labelKey: 'applications.stats.total', value: stats.total, color: 'from-blue-500 to-cyan-500', icon: FileText, borderColor: 'border-blue-200 dark:border-blue-800' },
                            { labelKey: 'applications.stats.pending', value: stats.pending, color: 'from-amber-500 to-orange-500', icon: Clock, borderColor: 'border-amber-200 dark:border-amber-800' },
                            { labelKey: 'applications.stats.inReview', value: stats.inReview, color: 'from-purple-500 to-pink-500', icon: Eye, borderColor: 'border-purple-200 dark:border-purple-800' },
                            { labelKey: 'applications.stats.approved', value: stats.approved, color: 'from-green-500 to-emerald-500', icon: Check, borderColor: 'border-green-200 dark:border-green-800' },
                            { labelKey: 'applications.stats.rejected', value: stats.rejected, color: 'from-red-500 to-rose-500', icon: X, borderColor: 'border-red-200 dark:border-red-800' },
                            { labelKey: 'applications.stats.docsRequired', value: stats.documentsRequired, color: 'from-indigo-500 to-purple-500', icon: AlertCircle, borderColor: 'border-indigo-200 dark:border-indigo-800' }
                        ].map((stat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className={`theme-bg-card theme-border-glass border rounded-xl p-4 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                                        <stat.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="text-lg font-bold theme-text-primary">{stat.value}</span>
                                </div>
                                <p className="text-sm font-medium theme-text-muted">{t(stat.labelKey)}</p>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Filters and Search */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="theme-bg-card theme-border-glass border rounded-xl p-4 backdrop-blur-sm shadow-sm"
                    >
                        <div className="flex flex-col lg:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 theme-text-muted" />
                                <input
                                    type="text"
                                    placeholder={t('applications.search')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                                />
                            </div>

                            {/* View Mode Toggle */}
                            <div className="flex items-center gap-2 theme-bg-glass rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode('table')}
                                    className={`px-4 py-2 rounded ${viewMode === 'table' ? 'accent-gradient text-white' : 'theme-text-muted hover:theme-text-primary'} transition-colors`}
                                >
                                    {t('applications.viewMode.table')}
                                </button>
                                <button
                                    onClick={() => setViewMode('cards')}
                                    className={`px-4 py-2 rounded ${viewMode === 'cards' ? 'accent-gradient text-white' : 'theme-text-muted hover:theme-text-primary'} transition-colors`}
                                >
                                    {t('applications.viewMode.cards')}
                                </button>
                            </div>

                            {/* Filter Toggle */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setShowFilters(!showFilters)}
                                className={`px-4 py-3 rounded-lg theme-border-glass border flex items-center gap-2 ${showFilters ? 'accent-gradient text-white' : 'theme-bg-glass theme-text-primary'} transition-colors`}
                            >
                                <Filter className="w-4 h-4" />
                                <span>{t('applications.filters')}</span>
                                {(statusFilter !== 'all' || actTypeFilter !== 'all' || priorityFilter !== 'all') && (
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
                                            <label className="block text-sm font-medium theme-text-muted mb-2">{t('applications.filterLabels.status')}</label>
                                            <select
                                                value={statusFilter}
                                                onChange={(e) => setStatusFilter(e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                                            >
                                                <option value="all">{t('applications.filterLabels.allStatuses')}</option>
                                                <option value="pending">{t('applications.stats.pending')}</option>
                                                <option value="in-review">{t('applications.stats.inReview')}</option>
                                                <option value="approved">{t('applications.stats.approved')}</option>
                                                <option value="rejected">{t('applications.stats.rejected')}</option>
                                                <option value="documents-required">{t('applications.stats.docsRequired')}</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium theme-text-muted mb-2">{t('applications.filterLabels.actType')}</label>
                                            <select
                                                value={actTypeFilter}
                                                onChange={(e) => setActTypeFilter(e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                                            >
                                                <option value="all">{t('applications.filterLabels.allActs')}</option>
                                                <option value="PCR Act">{t('extracted.pcr_act')}</option>
                                                <option value="PoA Act">{t('extracted.poa_act')}</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium theme-text-muted mb-2">{t('applications.filterLabels.priority')}</label>
                                            <select
                                                value={priorityFilter}
                                                onChange={(e) => setPriorityFilter(e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                                            >
                                                <option value="all">{t('applications.filterLabels.allPriorities')}</option>
                                                <option value="high">{t('extracted.high')}</option>
                                                <option value="medium">{t('extracted.medium')}</option>
                                                <option value="low">{t('extracted.low')}</option>
                                            </select>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Applications List */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="theme-bg-card theme-border-glass border rounded-xl backdrop-blur-sm shadow-sm overflow-hidden"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="theme-text-secondary">{t('extracted.loading_applications')}</p>
                                </div>
                            </div>
                        ) : viewMode === 'table' ? (
                            <div className="w-full">
                                {/* Desktop Table */}
                                <div className="hidden sm:block overflow-x-auto">
                                    <table className="w-full min-w-[700px]">
                                        <thead className="border-b theme-border-glass theme-bg-glass dark:bg-gray-800/50 backdrop-blur-sm">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-sm font-semibold theme-text-primary">{t('extracted.application_id')}</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold theme-text-primary">{t('extracted.applicant')}</th>
                                                <th className="hidden sm:table-cell px-6 py-4 text-left text-sm font-semibold theme-text-primary">{t('extracted.district')}</th>
                                                <th className="hidden md:table-cell px-6 py-4 text-left text-sm font-semibold theme-text-primary">{t('extracted.act_type')}</th>
                                                <th className="hidden md:table-cell px-6 py-4 text-left text-sm font-semibold theme-text-primary">{t('extracted.amount')}</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold theme-text-primary">{t('extracted.status')}</th>
                                                <th className="hidden sm:table-cell px-6 py-4 text-left text-sm font-semibold theme-text-primary">{t('extracted.priority')}</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold theme-text-primary">{t('extracted.actions')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y theme-border-glass">
                                            {paginatedApplications.map((app, idx) => (
                                                <motion.tr
                                                    key={app.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: idx * 0.02 }}
                                                    className={`${idx % 2 === 0 ? 'theme-bg-glass dark:bg-gray-900/30' : 'theme-bg-glass dark:bg-gray-800/20'} hover:bg-slate-100/60 dark:hover:bg-gray-800/30 transition-colors`}
                                                >
                                                    <td className="px-6 py-4 text-sm font-medium theme-text-primary">{app.id}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full accent-gradient flex items-center justify-center text-white text-xs font-bold">
                                                                {app.applicantName.split(' ').map(n => n[0]).join('')}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium theme-text-primary">{app.applicantName}</p>
                                                                <p className="text-xs theme-text-muted">{app.phone}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="hidden sm:table-cell px-6 py-4">
                                                        <p className="text-sm theme-text-primary">{app.district}</p>
                                                        <p className="text-xs theme-text-muted">{app.state}</p>
                                                    </td>
                                                    <td className="hidden md:table-cell px-6 py-4">
                                                        <span className="px-2 py-1 rounded text-xs font-medium theme-bg-glass theme-text-primary">{app.actType}</span>
                                                    </td>
                                                    <td className="hidden md:table-cell px-6 py-4 text-sm font-semibold theme-text-primary">
                                                        {formatCurrency(app.amount)}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(app.status)}`}>
                                                            {(() => { const Icon = getStatusIcon(app.status); return <Icon className="w-3 h-3" /> })()}
                                                            {app.status.replace('-', ' ')}
                                                        </span>
                                                    </td>
                                                    <td className="hidden sm:table-cell px-6 py-4">
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(app.priority)}`}>
                                                            {app.priority}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex gap-2">
                                                            <button className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-gray-700 theme-text-muted hover:text-blue-500 transition-colors" onClick={() => setSelectedApplication(app)}>
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                            <button className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-gray-700 theme-text-muted hover:text-blue-500 transition-colors">
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile Card View */}
                                <div className="sm:hidden grid grid-cols-1 gap-4 p-4">
                                    {paginatedApplications.map((app) => (
                                        <motion.div
                                            key={app.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="theme-bg-glass theme-border-glass border rounded-lg p-4"
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <p className="text-sm font-medium theme-text-primary">{app.applicantName}</p>
                                                    <p className="text-xs theme-text-muted">{app.phone}</p>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(app.priority)}`}>
                                                    {app.priority}
                                                </span>
                                            </div>

                                            <div className="space-y-1 text-sm theme-text-secondary mb-3">
                                                <div><strong>ID:</strong> {app.id}</div>
                                                <div><strong>{t('extracted.district_1')}</strong> {app.district}, {app.state}</div>
                                                <div><strong>{t('extracted.act_type_1')}</strong> {app.actType}</div>
                                                <div><strong>{t('extracted.amount_1')}</strong> {formatCurrency(app.amount)}</div>
                                                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(app.status)}`}>
                                                    {(() => { const Icon = getStatusIcon(app.status); return <Icon className="w-3 h-3 mr-1" /> })()}
                                                    {app.status.replace('-', ' ')}
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <button className="p-2 rounded-lg hover:bg-slate-200/60 dark:hover:bg-gray-700 theme-text-muted hover:text-blue-500 transition-colors" onClick={() => setSelectedApplication(app)}>
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 rounded-lg hover:bg-slate-200/60 dark:hover:bg-gray-700 theme-text-muted hover:text-blue-500 transition-colors">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                                {paginatedApplications.map((app, idx) => (
                                    <motion.div
                                        key={app.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.02 }}
                                        whileHover={{ y: -2 }}
                                        className="theme-bg-glass theme-border-glass border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                                        onClick={() => setSelectedApplication(app)}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full accent-gradient flex items-center justify-center text-white font-bold">
                                                    {app.applicantName.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div>
                                                    <p className="font-medium theme-text-primary">{app.applicantName}</p>
                                                    <p className="text-xs theme-text-muted">{app.id}</p>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(app.priority)}`}>
                                                {app.priority}
                                            </span>
                                        </div>
                                        <div className="space-y-2 mb-3">
                                            <div className="flex items-center gap-2 text-sm theme-text-secondary">
                                                <MapPin className="w-4 h-4" />
                                                <span>{app.district}, {app.state}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm theme-text-secondary">
                                                <FileText className="w-4 h-4" />
                                                <span>{app.actType}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm theme-text-secondary">
                                                <DollarSign className="w-4 h-4" />
                                                <span className="font-semibold">{formatCurrency(app.amount)}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between pt-3 border-t theme-border-glass">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(app.status)}`}>
                                                {(() => {
                                                    const Icon = getStatusIcon(app.status);
                                                    return <Icon className="w-3 h-3" />;
                                                })()}
                                                {app.status.replace('-', ' ')}
                                            </span>
                                            <div className="flex items-center gap-1">
                                                <button className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-gray-700 transition-colors" onClick={(e) => { e.stopPropagation(); setSelectedApplication(app); }}>
                                                    <Eye className="w-4 h-4 theme-text-muted hover:text-blue-500" />
                                                </button>
                                                <button className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-gray-700 transition-colors">
                                                    <Edit className="w-4 h-4 theme-text-muted hover:text-blue-500" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        <div className="flex items-center justify-between px-6 py-4 border-t theme-border-glass theme-bg-glass dark:bg-gray-800/50 backdrop-blur-sm">
                            <p className="text-sm theme-text-muted">
                                {t('extracted.showing')} {(currentPage - 1) * itemsPerPage + 1} {t('extracted.to')} {Math.min(currentPage * itemsPerPage, filteredApplications.length)} {t('extracted.of')} {filteredApplications.length}
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage((p) => p - 1)}
                                    className="p-2 rounded-lg theme-bg-card theme-border-glass border disabled:opacity-50 theme-text-primary hover:bg-slate-200/60 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    const pageNum = i + Math.max(1, currentPage - 2);
                                    if (pageNum > totalPages) return null;
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`px-3 py-1.5 rounded-lg ${currentPage === pageNum ? 'accent-gradient text-white' : 'theme-bg-card theme-border-glass border theme-text-primary hover:bg-slate-200/60 dark:hover:bg-gray-700'} transition-colors`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                                <button
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage((p) => p + 1)}
                                    className="p-2 rounded-lg theme-bg-card theme-border-glass border disabled:opacity-50 theme-text-primary hover:bg-slate-200/60 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}

            {/* Application Detail Modal */}
            <AnimatePresence>
                {selectedApplication && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedApplication(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className={`${isMobile ? 'theme-bg-card theme-border-glass border rounded-tl-none rounded-tr-none w-full h-full max-h-none overflow-y-auto' : 'theme-bg-card theme-border-glass border rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto'}`}
                        >
                            <div className="sticky top-0 theme-bg-nav backdrop-blur-xl border-b theme-border-glass p-6 flex items-center justify-between" style={{ background: theme === 'light' ? 'rgba(255, 255, 255, 0.98)' : undefined }}>
                                <div>
                                    <h2 className="text-2xl font-bold theme-text-primary">{selectedApplication.id}</h2>
                                    <p className="theme-text-muted">{t('extracted.application_details')} </p>
                                </div>
                                <button
                                    onClick={() => setSelectedApplication(null)}
                                    className="p-2 rounded-lg theme-bg-glass hover:bg-red-500/20 theme-text-muted transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Applicant Information */}
                                <div>
                                    <h3 className="text-lg font-semibold theme-text-primary mb-4">{t('extracted.applicant_information_1')} </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3 p-3 rounded-lg theme-bg-glass border theme-border-glass" style={{ background: theme === 'light' ? 'rgba(248, 250, 252, 0.8)' : undefined }}>
                                            <User className="w-5 h-5 theme-text-muted" />
                                            <div>
                                                <p className="text-xs theme-text-muted">{t('extracted.full_name')} </p>
                                                <p className="font-medium theme-text-primary">{selectedApplication.applicantName}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 rounded-lg theme-bg-glass border theme-border-glass" style={{ background: theme === 'light' ? 'rgba(248, 250, 252, 0.8)' : undefined }}>
                                            <Phone className="w-5 h-5 theme-text-muted" />
                                            <div>
                                                <p className="text-xs theme-text-muted">{t('extracted.phone_number')} </p>
                                                <p className="font-medium theme-text-primary">{selectedApplication.phone}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 rounded-lg theme-bg-glass border theme-border-glass" style={{ background: theme === 'light' ? 'rgba(248, 250, 252, 0.8)' : undefined }}>
                                            <FileText className="w-5 h-5 theme-text-muted" />
                                            <div>
                                                <p className="text-xs theme-text-muted">{t('extracted.aadhaar_number')} </p>
                                                <p className="font-medium theme-text-primary">{selectedApplication.aadhaar}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 rounded-lg theme-bg-glass border theme-border-glass" style={{ background: theme === 'light' ? 'rgba(248, 250, 252, 0.8)' : undefined }}>
                                            <MapPin className="w-5 h-5 theme-text-muted" />
                                            <div>
                                                <p className="text-xs theme-text-muted">{t('extracted.location')} </p>
                                                <p className="font-medium theme-text-primary">{selectedApplication.district}, {selectedApplication.state}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Application Details */}
                                <div>
                                    <h3 className="text-lg font-semibold theme-text-primary mb-4">{t('extracted.application_details')} </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-3 rounded-lg theme-bg-glass border theme-border-glass" style={{ background: theme === 'light' ? 'rgba(248, 250, 252, 0.8)' : undefined }}>
                                            <p className="text-xs theme-text-muted mb-1">{t('extracted.act_type')} </p>
                                            <p className="font-medium theme-text-primary">{selectedApplication.actType}</p>
                                        </div>
                                        <div className="p-3 rounded-lg theme-bg-glass border theme-border-glass" style={{ background: theme === 'light' ? 'rgba(248, 250, 252, 0.8)' : undefined }}>
                                            <p className="text-xs theme-text-muted mb-1">{t('extracted.relief_amount')} </p>
                                            <p className="font-semibold text-lg theme-text-primary">{formatCurrency(selectedApplication.amount)}</p>
                                        </div>
                                        <div className="p-3 rounded-lg theme-bg-glass border theme-border-glass" style={{ background: theme === 'light' ? 'rgba(248, 250, 252, 0.8)' : undefined }}>
                                            <p className="text-xs theme-text-muted mb-1">{t('extracted.incident_date')} </p>
                                            <p className="font-medium theme-text-primary">{formatDate(selectedApplication.incidentDate)}</p>
                                        </div>
                                        <div className="p-3 rounded-lg theme-bg-glass border theme-border-glass" style={{ background: theme === 'light' ? 'rgba(248, 250, 252, 0.8)' : undefined }}>
                                            <p className="text-xs theme-text-muted mb-1">{t('extracted.application_date')} </p>
                                            <p className="font-medium theme-text-primary">{formatDate(selectedApplication.applicationDate)}</p>
                                        </div>
                                        <div className="p-3 rounded-lg theme-bg-glass border theme-border-glass" style={{ background: theme === 'light' ? 'rgba(248, 250, 252, 0.8)' : undefined }}>
                                            <p className="text-xs theme-text-muted mb-1">{t('extracted.assigned_officer')} </p>
                                            <p className="font-medium theme-text-primary">{selectedApplication.assignedOfficer}</p>
                                        </div>
                                        <div className="p-3 rounded-lg theme-bg-glass border theme-border-glass" style={{ background: theme === 'light' ? 'rgba(248, 250, 252, 0.8)' : undefined }}>
                                            <p className="text-xs theme-text-muted mb-1">{t('extracted.documents_uploaded')} </p>
                                            <p className="font-medium theme-text-primary">{selectedApplication.documents} files</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Status and Priority */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-lg theme-bg-glass border theme-border-glass">
                                        <p className="text-sm theme-text-muted mb-2">{t('extracted.current_status')} </p>
                                        <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border ${getStatusColor(selectedApplication.status)}`}>
                                            {(() => {
                                                const Icon = getStatusIcon(selectedApplication.status);
                                                return <Icon className="w-4 h-4" />;
                                            })()}
                                            {selectedApplication.status.replace('-', ' ').toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="p-4 rounded-lg theme-bg-glass border theme-border-glass">
                                        <p className="text-sm theme-text-muted mb-2">{t('extracted.priority_level')} </p>
                                        <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border ${getPriorityColor(selectedApplication.priority)}`}>
                                            <AlertTriangle className="w-4 h-4" />
                                            {selectedApplication.priority.toUpperCase()}
                                        </span>
                                    </div>
                                </div>

                                {/* Documents Section */}
                                <div>
                                    <h3 className="text-lg font-semibold theme-text-primary mb-4">{t('extracted.uploaded_documents')} </h3>
                                    <div className="space-y-2">
                                        {['FIR Copy', 'Medical Certificate', 'Identity Proof', 'Income Certificate'].map((doc, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 rounded-lg theme-bg-glass border theme-border-glass hover:shadow-md transition-all" style={{ background: theme === 'light' ? 'rgba(248, 250, 252, 0.8)' : undefined }}>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: theme === 'light' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.2)' }}>
                                                        <FileText className="w-5 h-5" style={{ color: theme === 'light' ? '#2563eb' : '#60a5fa' }} />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium theme-text-primary">{doc}</p>
                                                        <p className="text-xs theme-text-muted">{t('extracted.pdf_24_mb')} </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button className="p-2 rounded-lg hover:theme-bg-card theme-text-muted hover:text-blue-500 transition-colors">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-2 rounded-lg hover:theme-bg-card theme-text-muted hover:text-blue-500 transition-colors">
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Timeline */}
                                <div>
                                    <h3 className="text-lg font-semibold theme-text-primary mb-4">{t('extracted.application_timeline')} </h3>
                                    <div className="space-y-4">
                                        {[
                                            { date: selectedApplication.applicationDate, action: 'Application Submitted', status: 'completed' },
                                            { date: selectedApplication.applicationDate, action: 'Document Verification', status: 'completed' },
                                            { date: selectedApplication.lastUpdate, action: 'Under Review', status: 'current' },
                                            { date: '', action: 'Approval Pending', status: 'pending' },
                                            { date: '', action: 'Disbursement', status: 'pending' }
                                        ].map((item, idx) => (
                                            <div key={idx} className="flex gap-4">
                                                <div className="flex flex-col items-center">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.status === 'completed' ? 'bg-green-500/20 border-2 border-green-500' :
                                                        item.status === 'current' ? 'bg-blue-500/20 border-2 border-blue-500 animate-pulse' :
                                                            'bg-gray-500/20 border-2 border-gray-500'
                                                        }`}>
                                                        {item.status === 'completed' && <Check className="w-4 h-4 text-green-400" />}
                                                        {item.status === 'current' && <Clock className="w-4 h-4 text-blue-400" />}
                                                    </div>
                                                    {idx < 4 && <div className="w-0.5 h-12 mt-2" style={{ background: theme === 'light' ? 'rgba(148, 163, 184, 0.3)' : 'rgba(148, 163, 184, 0.2)' }}></div>}
                                                </div>
                                                <div className="flex-1 pb-8">
                                                    <p className="font-medium theme-text-primary">{item.action}</p>
                                                    {item.date && <p className="text-xs theme-text-muted">{new Date(item.date).toLocaleString()}</p>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-3 pt-4 border-t theme-border-glass">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex-1 px-4 py-3 rounded-xl border font-semibold flex items-center justify-center gap-2"
                                        style={theme === 'light' ? { background: 'rgba(34, 197, 94, 0.15)', color: '#15803d', borderColor: 'rgba(34, 197, 94, 0.4)' } : { background: 'rgba(34, 197, 94, 0.2)', color: '#86efac', borderColor: 'rgba(34, 197, 94, 0.3)' }}
                                    >
                                        <Check className="w-5 h-5" />
                                        Approve Application
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex-1 px-4 py-3 rounded-xl theme-bg-glass theme-border-glass border font-semibold flex items-center justify-center gap-2 theme-text-primary"
                                        style={{ background: theme === 'light' ? 'rgba(248, 250, 252, 0.8)' : undefined }}
                                    >
                                        <MessageSquare className="w-5 h-5" />
                                        Request Documents
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex-1 px-4 py-3 rounded-xl border font-semibold flex items-center justify-center gap-2"
                                        style={theme === 'light' ? { background: 'rgba(239, 68, 68, 0.15)', color: '#dc2626', borderColor: 'rgba(239, 68, 68, 0.4)' } : { background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                                    >
                                        <X className="w-5 h-5" />
                                        Reject Application
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Export Modal */}
            <AnimatePresence>
                {showExportModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowExportModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="export-modal theme-bg-card theme-border-glass border rounded-2xl max-w-md w-full p-6"
                        >
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                    <Download className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold theme-text-primary mb-2">Export Applications</h2>
                                <p className="theme-text-secondary">Choose your preferred export format</p>
                            </div>

                            <div className="space-y-3">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        exportApplicationsData(filteredApplications);
                                        setShowExportModal(false);
                                    }}
                                    className="w-full p-4 theme-bg-glass theme-border-glass border rounded-xl flex items-center gap-4 hover:shadow-md transition-all"
                                >
                                    <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                                        <FileText className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div className="text-left flex-1">
                                        <h3 className="font-semibold theme-text-primary">Export as CSV</h3>
                                        <p className="text-sm theme-text-muted">Spreadsheet format with all application details</p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 theme-text-muted" />
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        exportApplicationsPDF(filteredApplications);
                                        setShowExportModal(false);
                                    }}
                                    className="w-full p-4 theme-bg-glass theme-border-glass border rounded-xl flex items-center gap-4 hover:shadow-md transition-all"
                                >
                                    <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center">
                                        <FileText className="w-6 h-6 text-red-600" />
                                    </div>
                                    <div className="text-left flex-1">
                                        <h3 className="font-semibold theme-text-primary">Export as PDF</h3>
                                        <p className="text-sm theme-text-muted">Professional report format</p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 theme-text-muted" />
                                </motion.button>
                            </div>

                            <div className="mt-6 pt-4 border-t theme-border-glass">
                                <p className="text-xs theme-text-muted text-center">
                                    {filteredApplications.length} application{filteredApplications.length !== 1 ? 's' : ''} will be exported
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* New Application Modal */}
            <AnimatePresence>
                {showNewApplicationModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowNewApplicationModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="theme-bg-card theme-border-glass border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        >
                            <div className="sticky top-0 theme-bg-nav backdrop-blur-xl border-b theme-border-glass p-6 flex items-center justify-between" style={{ background: theme === 'light' ? 'rgba(255, 255, 255, 0.98)' : undefined }}>
                                <div>
                                    <h2 className="text-2xl font-bold theme-text-primary">{t('extracted.new_application')}</h2>
                                    <p className="theme-text-muted">Create a new relief application</p>
                                </div>
                                <button
                                    onClick={() => setShowNewApplicationModal(false)}
                                    className="p-2 rounded-lg theme-bg-glass hover:bg-red-500/20 theme-text-muted transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <NewApplicationForm onClose={() => setShowNewApplicationModal(false)} />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ApplicationsPage;