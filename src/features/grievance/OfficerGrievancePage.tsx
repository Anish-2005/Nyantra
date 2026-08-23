"use client";
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLocale } from '@/context/LocaleContext';
import { useAuth } from '@/context/AuthContext';
import { AnimatePresence } from 'framer-motion';
import {
  Search, Download, Plus, Eye, Star, ChevronDown, ArrowUpRight,
  AlertOctagon, UserCheck, FileText, BarChart3
} from 'lucide-react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { db } from '@/lib/firebase';
import ExportModal from '@/components/dashboard/ExportModal';
import { PageHeader, StatBand } from '@/components/dashboard/ui';
import OfficerNewCaseDrawer from './components/OfficerNewCaseDrawer';
import OfficerGrievanceCard from './components/OfficerGrievanceCard';
import OfficerGrievanceTable from './components/OfficerGrievanceTable';
import OfficerGrievanceInspector from './components/OfficerGrievanceInspector';
import type { Grievance } from './helpers';
import {
  useFirestoreGrievances, ghostBtn, primaryBtn, iconBtn, pillCls, SectionTitle,
  getOfficerStatusColor, getOfficerCategoryIcon
} from './officerHelpers';

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

// Module-scope quick-action definitions; icons resolved via React.createElement
const OFFICER_QUICK_ACTIONS = [
  { key: 'escalate', icon: AlertOctagon, labelKey: 'extracted.escalate_urgent_cases' },
  { key: 'assign', icon: UserCheck, labelKey: 'extracted.assign_officers' },
  { key: 'report', icon: FileText, labelKey: 'extracted.generate_report' },
  { key: 'analytics', icon: BarChart3, labelKey: 'extracted.view_analytics' }
];

// Hairline inner stat cell for the border-b performance band (unique variant)
const StatCell = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="theme-bg-card p-3.5">
    <p className="text-[11px] font-medium uppercase tracking-wider theme-text-muted truncate">{label}</p>
    <p className="text-xl font-semibold tracking-tight theme-text-primary mt-1 tabular-nums">{value}</p>
  </div>
);

const GrievancePage = () => {
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
  const [activeTab, setActiveTab] = useState('overview');
  const [newMessage, setNewMessage] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [pendingMessages, setPendingMessages] = useState<any[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLElement>(null);

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

    // First sort by priority (urgent > high > medium > low), then by selected criteria
    filtered.sort((a, b) => {
      // Priority order: urgent > high > medium > low
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[(a.priority || 'low').toLowerCase() as keyof typeof priorityOrder] || 1;
      const bPriority = priorityOrder[(b.priority || 'low').toLowerCase() as keyof typeof priorityOrder] || 1;

      if (aPriority !== bPriority) {
        return bPriority - aPriority; // Higher priority first
      }

      // If priorities are equal, sort by selected criteria
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

  // Voice recognition initialization
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();

      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onstart = () => {
        setIsRecording(true);
      };

      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setNewMessage(prev => prev + (prev ? ' ' : '') + transcript);
      };

      recognitionInstance.onend = () => {
        setIsRecording(false);
      };

      recognitionInstance.onerror = (event: Event) => {
        console.error('Speech recognition error:', event);
        setIsRecording(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  // Auto-scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatRef.current && activeTab === 'communication') {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [selectedGrievance?.communication, pendingMessages, activeTab]);

  // Scroll inspector into view when a grievance is selected
  useEffect(() => {
    if (selectedGrievance && detailRef.current) {
      detailRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedGrievance?.id]);

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

  const startVoiceRecording = () => {
    if (recognition && !isRecording) {
      recognition.start();
    }
  };

  const stopVoiceRecording = () => {
    if (recognition && isRecording) {
      recognition.stop();
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

  // Quick action routing (same behaviors as the previous inline handlers)
  const handleQuickAction = (key: string) => {
    switch (key) {
      case 'escalate': setShowExportModal(false); break;
      case 'assign': setSelectedGrievance(null); break;
      case 'report': setShowExportModal(true); break;
      case 'analytics': setViewMode('list'); break;
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

  // Email export function
  const sendGrievancesEmail = async (items: Grievance[], format: 'csv' | 'pdf') => {
    if (!emailAddress.trim()) {
      alert('Please enter a valid email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress.trim())) {
      alert('Please enter a valid email address');
      return;
    }

    setSendingEmail(true);
    try {
      let attachmentData: string | Buffer;
      let attachmentName: string;
      let attachmentType: string;

      if (format === 'csv') {
        const headers = ['Grievance ID', 'Beneficiary Name', 'Phone', 'Email', 'District', 'State', 'Act Type', 'Category', 'Sub Category', 'Priority', 'Status', 'Assigned To', 'Created Date', 'Last Updated', 'Messages Count'];
        const rows = items.map(g => [
          g.id,
          g.beneficiaryName || '',
          g.phone || '',
          g.email || '',
          g.district || '',
          g.state || '',
          g.actType || '',
          g.category || '',
          g.subCategory || '',
          g.priority || '',
          g.status || '',
          g.assignedTo || '',
          g.createdDate || '',
          g.lastUpdated || '',
          (g.communication || []).length.toString()
        ]);

        attachmentData = [headers, ...rows].map(r => r.map(f => `"${(f ?? '')}"`).join(',')).join('\n');
        attachmentName = `grievances_export_${new Date().toISOString().split('T')[0]}.csv`;
        attachmentType = 'text/csv';
      } else {
        // Generate PDF as base64
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

        attachmentData = doc.output('datauristring').split(',')[1];
        attachmentName = `grievances_report_${new Date().toISOString().split('T')[0]}.pdf`;
        attachmentType = 'application/pdf';
      }

      // Send email via API
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: emailAddress.trim(),
          subject: `Nyantra Grievances Export - ${items.length} Grievances`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1e40af;">Nyantra - Grievances Export</h2>
              <p>Dear User,</p>
              <p>Please find attached the grievances export containing ${items.length} grievances.</p>
              <p><strong>Report Details:</strong></p>
              <ul>
                <li>Total Grievances: ${items.length}</li>
                <li>Format: ${format.toUpperCase()}</li>
                <li>Generated: ${new Date().toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</li>
              </ul>
              <p>This report is generated by the Nyantra Grievance Management System.</p>
              <p>Best regards,<br>Nyantra Team</p>
            </div>
          `,
          attachments: [{
            filename: attachmentName,
            content: attachmentData,
            contentType: attachmentType,
            encoding: format === 'csv' ? 'utf8' : 'base64'
          }]
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      await response.json();
      alert(`Grievances report sent successfully to ${emailAddress}! Check your Gmail inbox.`);
      setEmailAddress('');
      setShowExportModal(false);
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email. Please try again.');
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="space-y-4 max-w-[1400px]">
      {/* Header */}
      <PageHeader
        title={t('extracted.grievance')}
        highlight={t('extracted.monitoring_center')}
        subtitle={t('extracted.realtime_grievance_tracking_description')}
      >
        <button onClick={() => setShowExportModal(true)} aria-label={t('extracted.export_data_1')} className={ghostBtn}>
          <Download className="w-3.5 h-3.5" />
          <span>{t('extracted.export_data')}</span>
        </button>
        <button onClick={() => setShowNewCaseModal(true)} className={primaryBtn}>
          <Plus className="w-3.5 h-3.5" />
          <span>{t('extracted.new_case')}</span>
        </button>
      </PageHeader>

      {/* Stats */}
      <StatBand
        cells={[
          { label: t('extracted.active_cases_label'), value: stats.open + stats.inProgress },
          { label: t('extracted.avg_resolution_label'), value: `${stats.avgResolutionTime}d` },
          { label: t('extracted.satisfaction_label'), value: `${stats.satisfactionRate}%` },
          { label: t('extracted.escalated_label'), value: stats.escalated },
        ]}
      />

      {/* Toolbar + Cases */}
      <div className="theme-bg-card theme-border-glass border rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b theme-border-glass flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-baseline gap-2 min-w-0">
            <h2 className="text-sm font-semibold tracking-tight theme-text-primary truncate">{t('extracted.active_cases')}</h2>
            <span className="text-xs theme-text-muted tabular-nums">({filteredGrievances.length})</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 theme-text-muted pointer-events-none" />
              <input
                type="text"
                placeholder={t('extracted.search_cases')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full sm:w-56 pl-8 pr-2.5 rounded-md border theme-border-glass theme-bg-input theme-text-primary text-sm placeholder:theme-text-muted focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
              />
            </div>
            <div className="flex items-center rounded-md border theme-border-glass p-0.5 shrink-0">
              {([
                { mode: 'dashboard', labelKey: 'extracted.dashboard_view' },
                { mode: 'list', labelKey: 'extracted.list_view' }
              ] as const).map(({ mode, labelKey }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`h-8 px-2.5 rounded text-xs font-medium transition-colors ${
                    viewMode === mode ? 'theme-bg-glass theme-text-primary' : 'theme-text-muted hover:theme-bg-hover'
                  }`}
                >
                  {t(labelKey)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {viewMode === 'dashboard' ? (
          <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            {paginatedGrievances.map((grievance) => (
              <OfficerGrievanceCard
                key={grievance.id}
                grievance={grievance}
                onUpdateStatus={updateGrievanceStatus}
                onView={setSelectedGrievance}
                onEdit={(g) => { setSelectedGrievance(g); setShowNewCaseModal(true); }}
                t={t}
              />
            ))}
            {paginatedGrievances.length === 0 && (
              <div className="md:col-span-2 py-10 text-center text-sm theme-text-muted">
                {t('extracted.no_activity')}
              </div>
            )}
          </div>
        ) : (
          <OfficerGrievanceTable
            grievances={paginatedGrievances}
            onUpdateStatus={updateGrievanceStatus}
            onView={setSelectedGrievance}
            onEdit={(g) => { setSelectedGrievance(g); setShowNewCaseModal(true); }}
            t={t}
          />
        )}
      </div>

      {/* Grievance Detail Inspector */}
      {selectedGrievance && (
        <OfficerGrievanceInspector
          grievance={selectedGrievance}
          scrollRef={detailRef}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onClose={() => setSelectedGrievance(null)}
          chatRef={chatRef}
          pendingMessages={pendingMessages}
          newMessage={newMessage}
          onMessageChange={setNewMessage}
          onSend={sendMessage}
          recognition={recognition}
          isRecording={isRecording}
          onStartRecording={startVoiceRecording}
          onStopRecording={stopVoiceRecording}
          onResolve={resolveCase}
          statusUpdating={statusUpdating}
          t={t}
        />
      )}

      {/* Sidebar + Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="theme-bg-card theme-border-glass border rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b theme-border-glass flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold tracking-tight theme-text-primary">{t('extracted.quick_actions')}</h2>
            </div>
            <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
              {OFFICER_QUICK_ACTIONS.map((action) => (
                <button
                  key={action.key}
                  onClick={() => handleQuickAction(action.key)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-md border theme-border-glass theme-bg-glass text-left hover:theme-bg-hover transition-colors group"
                >
                  <span className="w-7 h-7 rounded-md theme-bg-card theme-border-glass border inline-flex items-center justify-center shrink-0 group-hover:text-[var(--accent-primary)] transition-colors">
                    {React.createElement(action.icon, { className: 'w-3.5 h-3.5' })}
                  </span>
                  <span className="text-[13px] font-medium theme-text-primary truncate">{t(action.labelKey)}</span>
                  {action.key === 'escalate' && stats.escalated > 0 ? (
                    <span className="ml-auto pillCls text-[10px] bg-red-500/15 text-red-500 shrink-0 tabular-nums">{stats.escalated}</span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>

          {/* Category Distribution */}
          <div className="theme-bg-card theme-border-glass border rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b theme-border-glass">
              <h2 className="text-sm font-semibold tracking-tight theme-text-primary">{t('extracted.category_distribution')}</h2>
            </div>
            <ul className="p-3 space-y-2">
              {(Object.entries(categoryStats) as [string, number][]).map(([key, count]) => {
                const total = grievances.length || 1;
                return (
                  <li key={key} className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-md theme-bg-glass inline-flex items-center justify-center shrink-0">
                      {React.createElement(getOfficerCategoryIcon(key), { className: 'w-3.5 h-3.5' })}
                    </span>
                    <span className="text-[13px] theme-text-secondary truncate capitalize">
                      {key.replace(/-/g, ' ')}
                    </span>
                    <div className="ml-auto flex items-center gap-2 min-w-[72px]">
                      <div className="h-1 w-full rounded-full theme-bg-glass overflow-hidden">
                        <div className="h-full accent-gradient rounded-full transition-all" style={{ width: `${Math.round((count / total) * 100)}%` }} />
                      </div>
                      <span className="text-xs font-medium theme-text-muted tabular-nums w-5 text-right">{count}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="lg:col-span-2 theme-bg-card theme-border-glass border rounded-lg overflow-hidden self-start">
          <div className="px-4 py-3 border-b theme-border-glass flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold tracking-tight theme-text-primary">{t('extracted.performance_overview')}</h2>
            <span className={`${pillCls} theme-bg-glass theme-text-muted`}>
              {t('extracted.sla_compliance')}: 94%
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-px theme-bg-glass border-b theme-border-glass">
            <StatCell label={t('extracted.avg_first_response')} value="2.4h" />
            <StatCell label={t('extracted.resolution_rate')} value={stats.total > 0 ? `${Math.round(((stats.resolved + stats.closed) / stats.total) * 100)}%` : '0%'} />
            <StatCell label={t('extracted.open_over_7d')} value={grievances.filter(g => {
              if (!g.createdDate || g.status === 'closed' || g.status === 'resolved') return false;
              return Date.now() - new Date(g.createdDate).getTime() > 7 * 24 * 60 * 60 * 1000;
            }).length} />
            <StatCell label={t('extracted.high_priority_open')} value={stats.highPriority} />
          </div>

          <div className="p-3">
            <SectionTitle>{t('extracted.recent_activity')}</SectionTitle>
            <ul className="space-y-1.5">
              {[...grievances]
                .sort((a, b) => new Date(b.lastUpdated || b.createdDate || 0).getTime() - new Date(a.lastUpdated || a.createdDate || 0).getTime())
                .slice(0, 5)
                .map((g) => (
                  <li
                    key={g.id}
                    onClick={() => setSelectedGrievance(g)}
                    className="flex items-center gap-2.5 px-2 py-1.5 -mx-2 rounded-md cursor-pointer hover:theme-bg-hover transition-colors"
                  >
                    <span className="w-6 h-6 rounded-md theme-bg-glass inline-flex items-center justify-center shrink-0">
                      {React.createElement(getOfficerCategoryIcon(g.category || ''), { className: 'w-3.5 h-3.5' })}
                    </span>
                    <span className="text-[13px] font-medium theme-text-primary truncate">{g.beneficiaryName}</span>
                    <ArrowUpRight className="w-3 h-3 theme-text-muted shrink-0 opacity-0 group-hover:opacity-100" />
                    <span className="ml-auto text-xs theme-text-muted whitespace-nowrap hidden sm:inline">
                      {new Date(g.lastUpdated || g.createdDate || Date.now()).toLocaleDateString()}
                    </span>
                    <span className={`${pillCls} ${getOfficerStatusColor(g.status)} shrink-0`}>
                      {(g.status || '-').replace('-', ' ').toUpperCase()}
                    </span>
                  </li>
                ))}
              {grievances.length === 0 && (
                <li className="py-8 text-center text-sm theme-text-muted">{t('extracted.no_activity')}</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Beneficiary Feedback */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-baseline gap-2 min-w-0">
            <h2 className="text-sm font-semibold tracking-tight theme-text-primary truncate">{t('extracted.beneficiary_feedback')}</h2>
            <span className="text-xs theme-text-muted tabular-nums">({sortedFeedbacks.length})</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-medium uppercase tracking-wider theme-text-muted hidden sm:inline">{t('extracted.sort_by')}</span>
            <select
              value={feedbackSortBy}
              onChange={(e) => setFeedbackSortBy(e.target.value as 'rating' | 'createdAt')}
              className="h-8 px-2 rounded-md border theme-border-glass theme-bg-input theme-text-secondary text-xs focus:outline-none focus:border-[var(--accent-primary)] cursor-pointer"
            >
              <option value="createdAt">{t('extracted.date')}</option>
              <option value="rating">{t('extracted.rating')}</option>
            </select>
            <button
              onClick={() => setFeedbackSortOrder(feedbackSortOrder === 'desc' ? 'asc' : 'desc')}
              className={`${iconBtn} w-8 h-8`}
              aria-label="Toggle sort order"
              title={feedbackSortOrder === 'desc' ? 'Descending' : 'Ascending'}
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${feedbackSortOrder === 'asc' ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        <StatBand
          cells={[
            { label: t('extracted.total_responses'), value: sortedFeedbacks.length },
            { label: t('extracted.average_rating'), value: sortedFeedbacks.length > 0 ? (sortedFeedbacks.reduce((s, f) => s + f.rating, 0) / sortedFeedbacks.length).toFixed(1) : '\u2014' },
            { label: t('extracted.five_star_percentage'), value: sortedFeedbacks.length > 0 ? `${Math.round((sortedFeedbacks.filter(f => f.rating === 5).length / sortedFeedbacks.length) * 100)}%` : '0%' },
            { label: t('extracted.needs_attention'), value: sortedFeedbacks.filter(f => f.rating <= 2).length },
          ]}
        />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3">
            {sortedFeedbacks.slice(0, 6).map((f) => (
              <article key={f.id} className="theme-bg-card theme-border-glass border rounded-lg p-3.5 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full accent-gradient flex items-center justify-center text-white text-[10px] font-semibold shrink-0">
                      {(f.subject || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold theme-text-primary truncate">{f.subject || t('extracted.feedback')}</p>
                      <p className="text-xs theme-text-muted">
                        {f.createdAt?.toDate?.()
                          ? new Date(f.createdAt.toDate()).toLocaleDateString()
                          : ''}
                      </p>
                    </div>
                  </div>
                  <span className={`${pillCls} shrink-0 ${f.status === 'resolved' ? 'bg-green-500/15 text-green-500' : f.status === 'in-review' ? 'bg-blue-500/15 text-blue-500' : 'theme-bg-glass theme-text-muted'}`}>
                    {(f.status || 'new').replace('-', ' ').toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center gap-0.5 mb-2" aria-label={`Rated ${f.rating} out of 5`}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i <= f.rating ? 'text-yellow-400 fill-current' : 'theme-text-muted'}`} />
                  ))}
                </div>

                <p className="text-[13px] theme-text-secondary line-clamp-3 mb-3 flex-1">{f.message}</p>

                <div className="pt-2.5 border-t theme-border-glass flex items-center gap-2">
                  <button className={`${ghostBtn} h-7 px-2 text-[11px]`} aria-label={t('extracted.view_details')}>
                    <Eye className="w-3 h-3" />
                    <span>{t('extracted.view')}</span>
                  </button>
                  <span className="ml-auto text-[11px] theme-text-muted">#{(f.id || '').slice(0, 6)}</span>
                </div>
              </article>
            ))}
            {sortedFeedbacks.length === 0 && (
              <div className="md:col-span-2 py-10 text-center text-sm theme-text-muted border theme-border-glass theme-bg-card rounded-lg">
                {t('extracted.no_feedback_yet') || 'No beneficiary feedback yet.'}
              </div>
            )}
          </div>

          {/* Rating distribution */}
          <div className="theme-bg-card theme-border-glass border rounded-lg overflow-hidden self-start">
            <div className="px-4 py-3 border-b theme-border-glass">
              <h2 className="text-sm font-semibold tracking-tight theme-text-primary">{t('extracted.rating_distribution')}</h2>
            </div>
            <ul className="p-3 space-y-2.5">
              {[5, 4, 3, 2, 1].map((r) => {
                const count = feedbacks.filter(f => f.rating === r).length;
                const pct = feedbacks.length > 0 ? Math.round((count / feedbacks.length) * 100) : 0;
                return (
                  <li key={r} className="flex items-center gap-2.5">
                    <span className="inline-flex items-center gap-1 text-xs font-medium theme-text-muted w-8 shrink-0 tabular-nums">
                      {r}<Star className="w-3 h-3 text-yellow-400 fill-current" />
                    </span>
                    <div className="h-1 w-full rounded-full theme-bg-glass overflow-hidden">
                      <div className="h-full accent-gradient rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-medium theme-text-muted tabular-nums w-9 text-right shrink-0">{count}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      {/* Modals */}
      <ExportModal
        open={showExportModal}
        onClose={() => setShowExportModal(false)}
        items={grievances}
        filteredItems={filteredGrievances}
        onExportCsv={exportGrievancesData}
        onExportPdf={exportGrievancesPDF}
        emailAddress={emailAddress}
        setEmailAddress={setEmailAddress}
        sendingEmail={sendingEmail}
        onSendEmail={sendGrievancesEmail}
        title={t('extracted.export_data_1')}
        subtitle={t('extracted.export_subtitle') || t('extracted.choose_export_options')}
        allTitle={t('extracted.all_cases')}
        filteredTitle={t('extracted.filtered_cases')}
      />

      <AnimatePresence>
        {showNewCaseModal && (
          <OfficerNewCaseDrawer
            initialData={selectedGrievance}
            onClose={() => { setShowNewCaseModal(false); setSelectedGrievance(null); }}
            onCreated={(g) => { setSelectedGrievance(g); setShowNewCaseModal(false); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default GrievancePage;
