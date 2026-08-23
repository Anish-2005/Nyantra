"use client";
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useLocale } from '@/context/LocaleContext';
import { Download, Plus } from 'lucide-react';
import { collection, getDocs, doc, updateDoc, serverTimestamp, type QueryDocumentSnapshot, type DocumentData } from 'firebase/firestore';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { db } from '@/lib/firebase';
import ExportModal from '@/components/dashboard/ExportModal';
import { PageHeader } from '@/components/dashboard/ui';
import type { Report, OfficerActivityItem } from './helpers';
import {
  useOfficerFirestoreReports,
  buildOfficerReportsCsv,
  createOfficerReportsPdfDocument,
} from './helpers';
import OfficerReportsPanel from './components/OfficerReportsPanel';
import OfficerReportInspector from './components/OfficerReportInspector';
import OfficerAnalyticsSection from './components/OfficerAnalyticsSection';
import OfficerNewReportDrawer from './components/OfficerNewReportDrawer';

// Comprehensive system PDF+CSV export shared by toolbar button + quick action
const runComprehensiveSystemExport = async (setLoading: React.Dispatch<React.SetStateAction<boolean>>) => {
  try {
    setLoading(true);

    // Fetch all data from different collections
    const [applicationsSnap, disbursementsSnap, beneficiariesSnap, grievancesSnap, reportsSnap] = await Promise.all([
      getDocs(collection(db, 'applications')),
      getDocs(collection(db, 'disbursements')),
      getDocs(collection(db, 'beneficiaries')),
      getDocs(collection(db, 'grievances')),
      getDocs(collection(db, 'reports'))
    ]);

    // Process applications data
    const applications: any[] = applicationsSnap.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
      id: doc.id,
      ...doc.data(),
      createdDate: doc.data().applicationDate?.toDate?.()?.toISOString() || doc.data().applicationDate,
      lastUpdated: doc.data().lastUpdated?.toDate?.()?.toISOString() || doc.data().lastUpdated
    }));

    // Process disbursements data
    const disbursements: any[] = disbursementsSnap.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
      id: doc.id,
      ...doc.data(),
      disbursementDate: doc.data().disbursementDate?.toDate?.()?.toISOString() || doc.data().disbursementDate,
      createdDate: doc.data().createdDate?.toDate?.()?.toISOString() || doc.data().createdDate
    }));

    // Process beneficiaries data
    const beneficiaries: any[] = beneficiariesSnap.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
      id: doc.id,
      ...doc.data(),
      createdDate: doc.data().createdDate?.toDate?.()?.toISOString() || doc.data().createdDate,
      lastUpdated: doc.data().lastUpdated?.toDate?.()?.toISOString() || doc.data().lastUpdated
    }));

    // Process grievances data
    const grievances: any[] = grievancesSnap.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
      id: doc.id,
      ...doc.data(),
      createdDate: doc.data().createdDate?.toDate?.()?.toISOString() || doc.data().createdDate,
      lastUpdated: doc.data().lastUpdated?.toDate?.()?.toISOString() || doc.data().lastUpdated
    }));

    // Process reports data
    const reports: any[] = reportsSnap.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
      generatedDate: doc.data().generatedDate?.toDate?.()?.toISOString() || doc.data().generatedDate
    }));

    // Generate comprehensive PDF report
    const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait' });
    const margin = 36;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Title page
    doc.setFillColor(30, 64, 175);
    doc.rect(0, 0, pageWidth, 120, 'F');
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('Comprehensive System Report', margin, 60);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Nyantra - Direct Benefit Transfer Platform', margin, 85);
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-GB', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })}`, margin, 105);

    // Executive Summary
    doc.addPage();
    doc.setFontSize(18);
    doc.setTextColor(30, 64, 175);
    doc.setFont('helvetica', 'bold');
    doc.text('Executive Summary', margin, 50);

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    const summaryData = [
      ['Total Applications', applications.length.toString()],
      ['Total Disbursements', disbursements.length.toString()],
      ['Total Beneficiaries', beneficiaries.length.toString()],
      ['Active Grievances', grievances.filter((g: any) => g.status !== 'closed').length.toString()],
      ['Total Reports Generated', reports.length.toString()],
      ['Total Amount Disbursed', `₹${disbursements.reduce((sum: number, d: any) => sum + (d.disbursedAmount || 0), 0).toLocaleString('en-IN')}`]
    ];

    autoTable(doc, {
      body: summaryData,
      startY: 70,
      styles: { fontSize: 11, cellPadding: 8 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 150 },
        1: { cellWidth: 100, halign: 'right' }
      },
      theme: 'grid'
    });

    // Applications Section
    if (applications.length > 0) {
      doc.addPage();
      doc.setFontSize(16);
      doc.setTextColor(30, 64, 175);
      doc.setFont('helvetica', 'bold');
      doc.text('Applications Overview', margin, 50);

      const appHeaders = [['ID', 'Beneficiary', 'Act Type', 'Status', 'Amount', 'Date']];
      const appData = applications.slice(0, 50).map((app: any) => [
        app.id.substring(0, 8) + '...',
        app.beneficiaryName || 'N/A',
        app.actType || 'N/A',
        app.status || 'N/A',
        app.requestedAmount ? `₹${app.requestedAmount.toLocaleString('en-IN')}` : 'N/A',
        app.createdDate ? new Date(app.createdDate).toLocaleDateString() : 'N/A'
      ]);

      autoTable(doc, {
        head: appHeaders,
        body: appData,
        startY: 70,
        styles: { fontSize: 8, cellPadding: 4 },
        headStyles: { fillColor: [59, 130, 246], textColor: 255 },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 80 },
          2: { cellWidth: 60 },
          3: { cellWidth: 50 },
          4: { cellWidth: 60 },
          5: { cellWidth: 50 }
        }
      });

      if (applications.length > 50) {
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Showing first 50 of ${applications.length} applications`, margin, (doc as any).lastAutoTable.finalY + 20);
      }
    }

    // Disbursements Section
    if (disbursements.length > 0) {
      doc.addPage();
      doc.setFontSize(16);
      doc.setTextColor(30, 64, 175);
      doc.setFont('helvetica', 'bold');
      doc.text('Disbursements Overview', margin, 50);

      const disbHeaders = [['ID', 'Application ID', 'Beneficiary', 'Amount', 'Status', 'Date']];
      const disbData = disbursements.slice(0, 50).map((disb: any) => [
        disb.id.substring(0, 8) + '...',
        disb.applicationId?.substring(0, 8) + '...' || 'N/A',
        disb.beneficiaryName || 'N/A',
        disb.disbursedAmount ? `₹${disb.disbursedAmount.toLocaleString('en-IN')}` : 'N/A',
        disb.status || 'N/A',
        disb.disbursementDate ? new Date(disb.disbursementDate).toLocaleDateString() : 'N/A'
      ]);

      autoTable(doc, {
        head: disbHeaders,
        body: disbData,
        startY: 70,
        styles: { fontSize: 8, cellPadding: 4 },
        headStyles: { fillColor: [34, 197, 94], textColor: 255 },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 60 },
          2: { cellWidth: 70 },
          3: { cellWidth: 60 },
          4: { cellWidth: 50 },
          5: { cellWidth: 50 }
        }
      });

      if (disbursements.length > 50) {
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Showing first 50 of ${disbursements.length} disbursements`, margin, (doc as any).lastAutoTable.finalY + 20);
      }
    }

    // Beneficiaries Section
    if (beneficiaries.length > 0) {
      doc.addPage();
      doc.setFontSize(16);
      doc.setTextColor(30, 64, 175);
      doc.setFont('helvetica', 'bold');
      doc.text('Beneficiaries Overview', margin, 50);

      const benHeaders = [['ID', 'Name', 'Phone', 'District', 'State', 'Category']];
      const benData = beneficiaries.slice(0, 50).map((ben: any) => [
        ben.id.substring(0, 8) + '...',
        ben.name || 'N/A',
        ben.phone || 'N/A',
        ben.district || 'N/A',
        ben.state || 'N/A',
        ben.category || 'N/A'
      ]);

      autoTable(doc, {
        head: benHeaders,
        body: benData,
        startY: 70,
        styles: { fontSize: 8, cellPadding: 4 },
        headStyles: { fillColor: [168, 85, 247], textColor: 255 },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 80 },
          2: { cellWidth: 70 },
          3: { cellWidth: 60 },
          4: { cellWidth: 50 },
          5: { cellWidth: 50 }
        }
      });

      if (beneficiaries.length > 50) {
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Showing first 50 of ${beneficiaries.length} beneficiaries`, margin, (doc as any).lastAutoTable.finalY + 20);
      }
    }

    // Grievances Section
    if (grievances.length > 0) {
      doc.addPage();
      doc.setFontSize(16);
      doc.setTextColor(30, 64, 175);
      doc.setFont('helvetica', 'bold');
      doc.text('Grievances Overview', margin, 50);

      const grievHeaders = [['ID', 'Beneficiary', 'Category', 'Priority', 'Status', 'Date']];
      const grievData = grievances.slice(0, 50).map((griev: any) => [
        griev.id.substring(0, 8) + '...',
        griev.beneficiaryName || 'N/A',
        griev.category || 'N/A',
        griev.priority || 'N/A',
        griev.status || 'N/A',
        griev.createdDate ? new Date(griev.createdDate).toLocaleDateString() : 'N/A'
      ]);

      autoTable(doc, {
        head: grievHeaders,
        body: grievData,
        startY: 70,
        styles: { fontSize: 8, cellPadding: 4 },
        headStyles: { fillColor: [239, 68, 68], textColor: 255 },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 70 },
          2: { cellWidth: 60 },
          3: { cellWidth: 50 },
          4: { cellWidth: 50 },
          5: { cellWidth: 50 }
        }
      });

      if (grievances.length > 50) {
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Showing first 50 of ${grievances.length} grievances`, margin, (doc as any).lastAutoTable.finalY + 20);
      }
    }

    // Analytics Summary
    doc.addPage();
    doc.setFontSize(16);
    doc.setTextColor(30, 64, 175);
    doc.setFont('helvetica', 'bold');
    doc.text('Analytics Summary', margin, 50);

    // Calculate analytics
    const totalAmount = disbursements.reduce((sum: number, d: any) => sum + (d.disbursedAmount || 0), 0);
    const avgAmount = disbursements.length > 0 ? totalAmount / disbursements.length : 0;
    const successRate = applications.length > 0 ? (disbursements.length / applications.length) * 100 : 0;

    const analyticsData = [
      ['Total Applications', applications.length.toString()],
      ['Successful Disbursements', disbursements.length.toString()],
      ['Success Rate', `${successRate.toFixed(1)}%`],
      ['Total Beneficiaries Served', beneficiaries.length.toString()],
      ['Total Amount Disbursed', `₹${totalAmount.toLocaleString('en-IN')}`],
      ['Average Disbursement Amount', `₹${avgAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`],
      ['Active Grievances', grievances.filter((g: any) => g.status !== 'closed').length.toString()],
      ['Reports Generated', reports.length.toString()]
    ];

    autoTable(doc, {
      body: analyticsData,
      startY: 70,
      styles: { fontSize: 11, cellPadding: 8 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 150 },
        1: { cellWidth: 120, halign: 'right' }
      },
      theme: 'grid'
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 20, { align: 'right' });
      doc.text('Generated by Nyantra DBT Platform', margin, pageHeight - 20);
    }

    doc.save(`comprehensive_report_${new Date().toISOString().split('T')[0]}.pdf`);

    // Also generate CSV with all data
    const csvHeaders = [
      'Data Type', 'ID', 'Name/Beneficiary', 'Type/Category', 'Status', 'Amount', 'Date', 'Details'
    ];

    const csvRows = [
      // Applications
      ...applications.map((app: any) => [
        'Application',
        app.id,
        app.beneficiaryName || '',
        app.actType || '',
        app.status || '',
        app.requestedAmount?.toString() || '',
        app.createdDate || '',
        `District: ${app.district || ''}, State: ${app.state || ''}`
      ]),
      // Disbursements
      ...disbursements.map((disb: any) => [
        'Disbursement',
        disb.id,
        disb.beneficiaryName || '',
        disb.actType || '',
        disb.status || '',
        disb.disbursedAmount?.toString() || '',
        disb.disbursementDate || '',
        `Application: ${disb.applicationId || ''}`
      ]),
      // Beneficiaries
      ...beneficiaries.map((ben: any) => [
        'Beneficiary',
        ben.id,
        ben.name || '',
        ben.category || '',
        'Active',
        '',
        ben.createdDate || '',
        `Phone: ${ben.phone || ''}, District: ${ben.district || ''}, State: ${ben.state || ''}`
      ]),
      // Grievances
      ...grievances.map((griev: any) => [
        'Grievance',
        griev.id,
        griev.beneficiaryName || '',
        griev.category || '',
        griev.status || '',
        '',
        griev.createdDate || '',
        `Priority: ${griev.priority || ''}, Description: ${griev.description || ''}`
      ])
    ];

    const csvContent = [csvHeaders, ...csvRows]
      .map((row: any[]) => row.map((field: any) => `"${field}"`).join(','))
      .join('\n');

    const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const csvLink = document.createElement('a');
    const csvUrl = URL.createObjectURL(csvBlob);
    csvLink.setAttribute('href', csvUrl);
    csvLink.setAttribute('download', `comprehensive_data_${new Date().toISOString().split('T')[0]}.csv`);
    csvLink.style.visibility = 'hidden';
    document.body.appendChild(csvLink);
    csvLink.click();
    document.body.removeChild(csvLink);

  } catch (error) {
    console.error('Error generating comprehensive report:', error);
    alert('Error generating report. Please try again.');
  } finally {
    setLoading(false);
  }
};

const ReportsPage = () => {
  const { t } = useLocale();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter] = useState('all');
  const [statusFilter] = useState('all');
  const [categoryFilter] = useState('all');
  const [frequencyFilter] = useState('all');
  const [sortBy] = useState('createdAt');
  const [sortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [viewMode, setViewMode] = useState<'reports' | 'templates' | 'scheduled'>('reports');
  const [showNewReportModal, setShowNewReportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [loading, setLoading] = useState(false);
  const detailRef = useRef<HTMLDivElement>(null);

  // Subscribe to Firestore reports collection
  useOfficerFirestoreReports(setReports);

  // Scroll detail inspector into view on selection change
  useEffect(() => {
    if (selectedReport && detailRef.current) {
      detailRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedReport]);

  // Filter and sort reports
  const filteredReports = useMemo(() => {
    let filtered = [...reports];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(report =>
        report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(report => report.type === typeFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(report => report.status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(report => report.category === categoryFilter);
    }

    // Frequency filter
    if (frequencyFilter !== 'all') {
      filtered = filtered.filter(report => report.frequency === frequencyFilter);
    }

    // View mode filter
    if (viewMode === 'scheduled') {
      filtered = filtered.filter(report => report.isScheduled);
    } else if (viewMode === 'templates') {
      return []; // Templates are handled separately
    }

    // Sort
    filtered.sort((a, b) => {
      const aVal = a[sortBy as keyof typeof a];
      const bVal = b[sortBy as keyof typeof b];

      const aNull = aVal === null || aVal === undefined;
      const bNull = bVal === null || bVal === undefined;

      // Handle null/undefined consistently
      if (aNull && bNull) return 0;
      if (aNull) return sortOrder === 'asc' ? 1 : -1;
      if (bNull) return sortOrder === 'asc' ? -1 : 1;

      // If both can be parsed as valid dates, compare by timestamp
      const aTime = Date.parse(String(aVal));
      const bTime = Date.parse(String(bVal));
      if (!isNaN(aTime) && !isNaN(bTime)) {
        return sortOrder === 'asc' ? aTime - bTime : bTime - aTime;
      }

      // Fallback to string comparison
      const aStr = String(aVal);
      const bStr = String(bVal);
      return sortOrder === 'asc'
        ? aStr.localeCompare(bStr, undefined, { numeric: true })
        : bStr.localeCompare(aStr, undefined, { numeric: true });
    });

    return filtered;
  }, [reports, searchQuery, typeFilter, statusFilter, categoryFilter, frequencyFilter, viewMode, sortBy, sortOrder]);

  // Pagination
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Statistics
  const stats = useMemo(() => {
    const total = reports.length;
    const completed = reports.filter(r => r.status === 'completed').length;
    const processing = reports.filter(r => r.status === 'processing').length;
    const scheduled = reports.filter(r => r.status === 'scheduled').length;
    const failed = reports.filter(r => r.status === 'failed').length;
    const totalDownloads = reports.reduce((sum, r) => sum + r.downloadCount, 0);
    const avgProcessingTime = 2.3;
    const successRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      processing,
      scheduled,
      failed,
      totalDownloads,
      avgProcessingTime,
      successRate
    };
  }, [reports]);

  // Category distribution
  const categoryStats = useMemo(() => {
    return {
      'financial': reports.filter(r => r.category === 'financial').length,
      'compliance': reports.filter(r => r.category === 'compliance').length,
      'performance': reports.filter(r => r.category === 'performance').length,
      'statistical': reports.filter(r => r.category === 'statistical').length,
      'analytical': reports.filter(r => r.category === 'analytical').length,
      'technical': reports.filter(r => r.category === 'technical').length
    };
  }, [reports]);

  // Recent Activities
  const recentActivities = useMemo<OfficerActivityItem[]>(() => {
    // Helper function to format time ago
    const formatTimeAgo = (dateString: string) => {
      const now = new Date();
      const date = new Date(dateString);
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

      if (diffInMinutes < 1) return t('extracted.just_now');
      if (diffInMinutes < 60) return t('extracted.min_ago', { time: diffInMinutes });
      if (diffInMinutes < 1440) return t('extracted.hours_ago', { time: Math.floor(diffInMinutes / 60) });
      return t('extracted.days_ago', { time: Math.floor(diffInMinutes / 1440) });
    };

    const activities: OfficerActivityItem[] = [];

    // Add activities based on reports
    reports.forEach(report => {
      // Report creation
      if (report.createdAt) {
        activities.push({
          action: t('extracted.report_created', { reportName: report.name }),
          user: report.generatedBy || t('extracted.system'),
          time: formatTimeAgo(report.createdAt),
          status: 'info',
          timestamp: new Date(report.createdAt).getTime()
        });
      }

      // Report completion
      if (report.status === 'completed' && report.generatedDate) {
        activities.push({
          action: t('extracted.report_generated', { reportName: report.name }),
          user: report.generatedBy || t('extracted.system'),
          time: formatTimeAgo(report.generatedDate),
          status: 'success',
          timestamp: new Date(report.generatedDate).getTime()
        });
      }

      // Report failure
      if (report.status === 'failed' && report.updatedAt) {
        activities.push({
          action: t('extracted.report_failed', { reportName: report.name }),
          user: t('extracted.system'),
          time: formatTimeAgo(report.updatedAt),
          status: 'error',
          timestamp: new Date(report.updatedAt).getTime()
        });
      }
    });

    // Sort by timestamp (most recent first) and take last 3
    return activities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 3);
  }, [reports, t]);

  const handleDownload = async (reportId: string) => {
    console.log('handleDownload called with reportId:', reportId);
    try {
      const report = reports.find(r => r.id === reportId);
      console.log('Found report:', report);
      if (!report) {
        console.error('Report not found');
        return;
      }

      // Update download count (optional - don't fail if this fails)
      try {
        console.log('Updating download count...');
        await updateDoc(doc(db, 'reports', reportId), {
          downloadCount: (report.downloadCount || 0) + 1,
          lastUpdated: serverTimestamp()
        });
        console.log('Download count updated');
      } catch (updateError) {
        console.warn('Failed to update download count:', updateError);
        // Continue with download even if count update fails
      }

      // Generate PDF for the report
      console.log('Creating PDF...');
      const pdfDoc = new jsPDF({ unit: 'pt', format: 'a4' });
      console.log('PDF document created');

      // Title
      pdfDoc.setFontSize(20);
      pdfDoc.setFont('helvetica', 'bold');
      pdfDoc.text('Report Download', 40, 60);

      // Report details
      pdfDoc.setFontSize(14);
      pdfDoc.setFont('helvetica', 'bold');
      pdfDoc.text('Report Details', 40, 90);

      pdfDoc.setFontSize(12);
      pdfDoc.setFont('helvetica', 'normal');
      let yPosition = 110;

      pdfDoc.text(`Report Name: ${report.name}`, 40, yPosition);
      yPosition += 20;

      pdfDoc.text(`Report ID: ${report.id}`, 40, yPosition);
      yPosition += 20;

      pdfDoc.text(`Type: ${report.type}`, 40, yPosition);
      yPosition += 20;

      pdfDoc.text(`Category: ${report.category}`, 40, yPosition);
      yPosition += 20;

      pdfDoc.text(`Status: ${report.status}`, 40, yPosition);
      yPosition += 20;

      pdfDoc.text(`Generated at: ${new Date().toLocaleString()}`, 40, yPosition);
      yPosition += 30;

      // Description section
      if (report.description) {
        pdfDoc.setFontSize(14);
        pdfDoc.setFont('helvetica', 'bold');
        pdfDoc.text('Description', 40, yPosition);
        yPosition += 20;

        pdfDoc.setFontSize(11);
        pdfDoc.setFont('helvetica', 'normal');

        // Split description into lines that fit the page width
        const pageWidth = pdfDoc.internal.pageSize.getWidth();
        const margin = 40;
        const maxWidth = pageWidth - (margin * 2);
        const lines = pdfDoc.splitTextToSize(report.description, maxWidth);

        lines.forEach((line: string) => {
          if (yPosition > pdfDoc.internal.pageSize.getHeight() - 50) {
            pdfDoc.addPage();
            yPosition = 50;
          }
          pdfDoc.text(line, 40, yPosition);
          yPosition += 15;
        });
      }

      // Additional metadata
      yPosition += 20;
      pdfDoc.setFontSize(12);
      pdfDoc.setFont('helvetica', 'bold');
      pdfDoc.text('Additional Information', 40, yPosition);
      yPosition += 20;

      pdfDoc.setFontSize(11);
      pdfDoc.setFont('helvetica', 'normal');

      if (report.generatedBy) {
        pdfDoc.text(`Generated By: ${report.generatedBy}`, 40, yPosition);
        yPosition += 15;
      }

      if (report.recordCount) {
        pdfDoc.text(`Record Count: ${report.recordCount}`, 40, yPosition);
        yPosition += 15;
      }

      if (report.frequency) {
        pdfDoc.text(`Frequency: ${report.frequency}`, 40, yPosition);
        yPosition += 15;
      }

      if (report.fileFormat) {
        pdfDoc.text(`Format: ${report.fileFormat}`, 40, yPosition);
        yPosition += 15;
      }

      pdfDoc.text(`Download Count: ${report.downloadCount}`, 40, yPosition);

      console.log('PDF content added with description');

      // Save the PDF
      const fileName = `${report.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${report.id}.pdf`;
      console.log('Saving PDF with filename:', fileName);

      // Try using blob method for better browser compatibility
      try {
        const pdfBlob = pdfDoc.output('blob');
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        console.log('PDF downloaded using blob method');
      } catch (blobError) {
        console.warn('Blob method failed, trying direct save:', blobError);
        pdfDoc.save(fileName);
        console.log('PDF saved using direct save method');
      }

    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download report. Please try again.');
    }
  };

  const handleScheduleReport = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (report) {
      setSelectedReport(report);
    }
  };

  const handleStatusUpdate = async (reportId: string, newStatus: Report['status']) => {
    try {
      console.log(`Updating report ${reportId} status to ${newStatus}`);
      await updateDoc(doc(db, 'reports', reportId), {
        status: newStatus,
        updatedAt: serverTimestamp(),
        ...(newStatus === 'completed' && { generatedDate: serverTimestamp() }),
        ...(newStatus === 'failed' && { updatedAt: serverTimestamp() })
      });
      console.log(`Report ${reportId} status updated to ${newStatus} successfully`);
    } catch (error) {
      console.error('Failed to update report status:', error);
      alert('Failed to update report status. Please try again.');
    }
  };

  const handleShare = async (report: Report) => {
    const shareUrl = `${window.location.origin}/dashboard/reports?report=${report.id}`;
    const shareData = {
      title: `Report: ${report.name}`,
      text: `Check out this ${report.category} report - ${report.description}`,
      url: shareUrl
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareUrl);
        alert('Report link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert('Report link copied to clipboard!');
      } catch (clipboardError) {
        console.error('Error copying to clipboard:', clipboardError);
        alert('Unable to share report. Please copy the URL manually.');
      }
    }
  };

  // Download reports list as CSV (shared export drawer handler)
  const exportReportsCsv = (items: Report[]) => {
    const csvContent = buildOfficerReportsCsv(items);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reports_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download reports list as PDF (shared export drawer handler)
  const exportReportsPdf = (items: Report[]) => {
    createOfficerReportsPdfDocument(items).save(`reports_export_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Email export function
  const sendReportsEmail = async (items: Report[], format: 'csv' | 'pdf') => {
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
        attachmentData = buildOfficerReportsCsv(items);
        attachmentName = `reports_export_${new Date().toISOString().split('T')[0]}.csv`;
        attachmentType = 'text/csv';
      } else {
        attachmentData = createOfficerReportsPdfDocument(items).output('datauristring').split(',')[1];
        attachmentName = `reports_export_${new Date().toISOString().split('T')[0]}.pdf`;
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
          subject: `Nyantra Reports Export - ${items.length} Reports`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1e40af;">Nyantra - Reports Export</h2>
              <p>Dear User,</p>
              <p>Please find attached the reports export containing ${items.length} reports.</p>
              <p><strong>Report Details:</strong></p>
              <ul>
                <li>Total Reports: ${items.length}</li>
                <li>Format: ${format.toUpperCase()}</li>
                <li>Generated: ${new Date().toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</li>
              </ul>
              <p>This report is generated by the Nyantra Direct Benefit Transfer System.</p>
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
      alert(`Report sent successfully to ${emailAddress}! Check your Gmail inbox.`);
      setEmailAddress('');
      setShowExportModal(false);
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email. Please try again.');
    } finally {
      setSendingEmail(false);
    }
  };

  const statCells: Array<{ label: string; value: string; delta?: string; down?: boolean }> = [
    { label: t('extracted.total_generated'), value: String(stats.total), delta: '+12%' },
    { label: t('extracted.completed'), value: String(stats.completed) },
    { label: t('extracted.processing'), value: String(stats.processing) },
    { label: t('extracted.failed'), value: String(stats.failed) },
    { label: t('extracted.active_schedules'), value: String(stats.scheduled), delta: '+3' },
    { label: t('extracted.avg_processing_time'), value: `${stats.avgProcessingTime}s`, delta: '-0.4s' },
    { label: t('extracted.success_rate_label'), value: `${stats.successRate}%`, delta: '+1.2%' },
    { label: t('extracted.downloads'), value: String(stats.totalDownloads) }
  ];

  return (
    <div className="space-y-4 max-w-[1400px]">
      {/* Header */}
      <PageHeader
        title={t('extracted.report_hub')}
        highlight={t('extracted.monitoring_center')}
        subtitle={t('extracted.generate_analyze_schedule_comprehensive_reports')}
      >
        <button
          onClick={() => setShowExportModal(true)}
          aria-label={t('extracted.export_data_1')}
          className="h-9 px-3.5 rounded-md text-xs border theme-border-glass theme-text-secondary font-medium hover:theme-bg-glass inline-flex items-center gap-1.5 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{t('extracted.export_data')}</span>
        </button>
        <button
          onClick={() => setShowNewReportModal(true)}
          className="h-9 px-3.5 rounded-md accent-gradient text-white font-semibold hover:opacity-90 inline-flex items-center gap-1.5 text-xs transition-opacity"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t('extracted.generate_report')}</span>
        </button>
      </PageHeader>

      {/* Stats hairline band (custom: delta chips + xl:8 columns don't fit StatBand API) */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-px theme-bg-glass border theme-border-glass rounded-xl overflow-hidden">
        {statCells.map(cell => (
          <div key={cell.label} className="theme-bg-card p-3.5 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-medium uppercase tracking-wider theme-text-muted truncate">{cell.label}</p>
              {cell.delta && (
                <span className={`shrink-0 text-[11px] font-medium ${cell.down ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {cell.delta}
                </span>
              )}
            </div>
            <p className="text-xl font-semibold tracking-tight theme-text-primary mt-1 tabular-nums">{cell.value}</p>
          </div>
        ))}
      </div>

      {/* Reports List */}
      <OfficerReportsPanel
        t={t}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        loading={loading}
        onSystemExport={() => runComprehensiveSystemExport(setLoading)}
        filteredCount={filteredReports.length}
        reports={paginatedReports}
        onOpen={setSelectedReport}
        onDownload={handleDownload}
        onSchedule={handleScheduleReport}
        onStatusUpdate={handleStatusUpdate}
      />

      {/* Report Detail Inspector */}
      {selectedReport && (
        <OfficerReportInspector
          report={selectedReport}
          containerRef={detailRef}
          t={t}
          onClose={() => setSelectedReport(null)}
          onDownload={handleDownload}
          onEdit={() => { setShowNewReportModal(true); }}
          onShare={handleShare}
          onStatusUpdate={handleStatusUpdate}
        />
      )}

      {/* Analytics Overview */}
      <OfficerAnalyticsSection
        t={t}
        stats={stats}
        categoryStats={categoryStats}
        recentActivities={recentActivities}
        loading={loading}
        onQuickAction={(id) => {
          switch (id) {
            case 'download_all':
              runComprehensiveSystemExport(setLoading);
              break;
            case 'view_templates':
              setViewMode('templates');
              break;
            default:
              setShowNewReportModal(true);
          }
        }}
      />

      {/* Shared Export Drawer */}
      <ExportModal
        open={showExportModal}
        onClose={() => setShowExportModal(false)}
        items={reports}
        filteredItems={filteredReports}
        onExportCsv={exportReportsCsv}
        onExportPdf={exportReportsPdf}
        emailAddress={emailAddress}
        setEmailAddress={setEmailAddress}
        sendingEmail={sendingEmail}
        onSendEmail={sendReportsEmail}
        title={t('extracted.export') || 'Export Data'}
        subtitle={t('extracted.exportDescription') || ''}
        allTitle={t('extracted.allReports') || 'All Reports'}
        filteredTitle={t('extracted.filteredReports') || 'Filtered Reports'}
      />

      {/* New/Edit Report Drawer */}
      <AnimatePresence>
        {showNewReportModal && (
          <OfficerNewReportDrawer
            initialData={selectedReport}
            onClose={() => { setShowNewReportModal(false); setSelectedReport(null); }}
            onCreated={(r) => { setSelectedReport(r); setShowNewReportModal(false); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReportsPage;
