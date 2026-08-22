"use client";
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTheme } from '@/context/ThemeContext';

import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import ApplicationDetail from '@/components/dashboard/ApplicationDetail';
import FiltersSearch from '@/components/dashboard/FiltersSearch';
import PrintHeader from '@/components/dashboard/PrintHeader';
import ConfirmDeleteModal from '@/components/dashboard/ConfirmDeleteModal';
import ExportModal from '@/components/dashboard/ExportModal';
import StatisticsCards from '@/components/dashboard/StatisticsCards';
import autoTable from 'jspdf-autotable';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, onSnapshot, addDoc, setDoc, Timestamp, updateDoc, doc, deleteDoc, getDoc } from 'firebase/firestore';
import {
    Search, Filter, Download, Plus, Eye, Edit, ChevronLeft, ChevronRight, X, Check,
    Clock, AlertCircle, FileText, User, Phone, MapPin,
    DollarSign, MessageSquare, AlertTriangle, ChevronDown, Trash, Shield
} from 'lucide-react';

import { POA_OFFENCES } from "@/components/dashboard/POAOffencesTable";
import NewApplicationDrawer from './NewApplicationDrawer';

// Application data type
interface Application {
    id: string;
    applicantName: string;
    aadhaar: string;
    phone: string;
    district: string;
    state: string;
    actType: string;
    beneficiaryId?: string;
    incidentDate: string;
    firReport?: string;
    medicalReport?: string;
    policeStation?: string;
    caseNumber?: string;
    applicationDate: string;
    status: string;
    amount: number;
    priority: string;
    assignedOfficer: string;
    documents: number;
    lastUpdate: string;
    offenceCategory?: string;
    offenceType?: string;
}

// Function to export applications data as PDF (professional A4 report)
const exportApplicationsPDF = (applications: Application[]) => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    // Professional header
    doc.setFillColor(30, 64, 175);
    doc.rect(0, 0, pageWidth, 35, 'F');

    // Title
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('NYANTRA - Applications Report', margin, 22);

    // Subtitle
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Direct Benefit Transfer System under PCR & PoA Acts', margin, 30);

    // Report metadata
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    const currentDate = new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    doc.text(`Generated: ${currentDate}`, pageWidth - margin, 22, { align: 'right' });
    doc.text(`Total Records: ${applications.length}`, pageWidth - margin, 30, { align: 'right' });

    let yPosition = 50;

    // Summary section
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPosition, contentWidth, 25, 'F');

    doc.setFontSize(12);
    doc.setTextColor(30, 64, 175);
    doc.setFont('helvetica', 'bold');
    doc.text('EXECUTIVE SUMMARY', margin + 5, yPosition + 8);

    // Summary stats
    const totalAmount = applications.reduce((sum, app) => sum + (app.amount || 0), 0);
    const statusCounts = applications.reduce((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Applications: ${applications.length}`, margin + 5, yPosition + 18);
    doc.text(`Total Amount: ₹${totalAmount.toLocaleString('en-IN')}`, pageWidth - margin - 5, yPosition + 18, { align: 'right' });

    yPosition += 35;

    // Status breakdown
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 64, 175);
    doc.text('Status Breakdown:', margin, yPosition);

    yPosition += 8;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);

    Object.entries(statusCounts).forEach(([status, count]) => {
        const statusText = status.replace(/-/g, ' ').toUpperCase();
        const percentage = ((count / applications.length) * 100).toFixed(1);
        doc.text(`${statusText}: ${count} (${percentage}%)`, margin + 5, yPosition);
        yPosition += 5;
    });

    yPosition += 10;

    // Applications table
    const tableColumns = [
        { header: 'Application ID', dataKey: 'id', width: 25 },
        { header: 'Applicant Name', dataKey: 'applicantName', width: 35 },
        { header: 'District', dataKey: 'district', width: 25 },
        { header: 'Act Type', dataKey: 'actType', width: 25 },
        { header: 'Amount (₹)', dataKey: 'amount', width: 25 },
        { header: 'Status', dataKey: 'status', width: 25 },
        { header: 'Priority', dataKey: 'priority', width: 20 }
    ];

    const tableRows = applications.map(app => ({
        id: app.id,
        applicantName: app.applicantName,
        district: `${app.district}${app.state ? `, ${app.state}` : ''}`,
        actType: app.actType,
        amount: app.amount ? `₹${app.amount.toLocaleString('en-IN')}` : '₹0',
        status: app.status.replace(/-/g, ' ').toUpperCase(),
        priority: app.priority.toUpperCase()
    }));

    // Check if we need a new page
    if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = margin;
    }

    // Table header
    doc.setFillColor(30, 64, 175);
    doc.rect(margin, yPosition, contentWidth, 8, 'F');

    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');

    let xPos = margin + 2;
    tableColumns.forEach(col => {
        doc.text(col.header, xPos, yPosition + 5.5);
        xPos += col.width;
    });

    yPosition += 10;

    // Table rows
    doc.setFontSize(7);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');

    tableRows.forEach((row, index) => {
        if (yPosition > pageHeight - 20) {
            doc.addPage();
            yPosition = margin;

            // Repeat header on new page
            doc.setFillColor(30, 64, 175);
            doc.rect(margin, yPosition, contentWidth, 8, 'F');

            doc.setFontSize(9);
            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');

            xPos = margin + 2;
            tableColumns.forEach(col => {
                doc.text(col.header, xPos, yPosition + 5.5);
                xPos += col.width;
            });

            yPosition += 10;
            doc.setFontSize(7);
            doc.setTextColor(0, 0, 0);
            doc.setFont('helvetica', 'normal');
        }

        // Alternate row colors
        if (index % 2 === 0) {
            doc.setFillColor(248, 250, 252);
            doc.rect(margin, yPosition - 3, contentWidth, 6, 'F');
        }

        xPos = margin + 2;
        tableColumns.forEach(col => {
            const value = row[col.dataKey as keyof typeof row] || '';
            doc.text(String(value), xPos, yPosition + 2);
            xPos += col.width;
        });

        yPosition += 6;
    });

    // Footer
    const footerY = pageHeight - 15;
    doc.setFontSize(6);
    doc.setTextColor(128, 128, 128);
    doc.setFont('helvetica', 'italic');
    doc.text('This report is generated by Nyantra - Direct Benefit Transfer System', margin, footerY);
    doc.text(`Page 1 of 1`, pageWidth - margin, footerY, { align: 'right' });

    // Save the PDF
    doc.save(`nyantra_applications_report_${new Date().toISOString().split('T')[0]}.pdf`);
};

const ApplicationsPage = () => {
    const { theme } = useTheme();
    const { t } = useLocale();
    const { profile, loading: authLoading } = useAuth();
    const isOfficer = !!profile && profile.role === 'officer';
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

    // Get translated status text
    const getTranslatedStatus = (status: string) => {
        const statusKey = `applications.status.${status.replace('-', '_')}`;
        return t(statusKey) || status.replace('-', ' ');
    };

    // Get translated priority text
    const getTranslatedPriority = (priority: string) => {
        const priorityKey = `applications.priority.${priority.toLowerCase()}`;
        return t(priorityKey) || priority;
    };

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [actTypeFilter, setActTypeFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [sortBy, setSortBy] = useState('status');
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
    const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [emailAddress, setEmailAddress] = useState('');
    const [sendingEmail, setSendingEmail] = useState(false);
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewApplicationForm, setShowNewApplicationForm] = useState(false);
    const [toasts, setToasts] = useState<Array<{ id: string; type: 'success' | 'error' | 'info'; message: string }>>([]);
    const [confirmModal, setConfirmModal] = useState<{ open: boolean; id?: string; message?: string }>({ open: false });
    const [expectedAmount, setExpectedAmount] = useState<number>(0);

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

        // Custom sorting logic
        filtered.sort((a, b) => {
            let aVal: any, bVal: any;

            if (sortBy === 'amount') {
                // Numeric sorting for amount
                aVal = a.amount || 0;
                bVal = b.amount || 0;
            } else if (sortBy === 'status') {
                // Custom status order: approved -> in-review -> pending -> documents-required -> rejected
                const statusOrder = {
                    'approved': 1,
                    'in-review': 2,
                    'pending': 3,
                    'documents-required': 4,
                    'rejected': 5
                };
                aVal = statusOrder[a.status as keyof typeof statusOrder] || 99;
                bVal = statusOrder[b.status as keyof typeof statusOrder] || 99;
            } else if (sortBy === 'priority') {
                // Custom priority order: high -> medium -> low
                const priorityOrder = {
                    'high': 1,
                    'medium': 2,
                    'low': 3
                };
                aVal = priorityOrder[a.priority as keyof typeof priorityOrder] || 99;
                bVal = priorityOrder[b.priority as keyof typeof priorityOrder] || 99;
            } else {
                // Default string sorting for other fields
                const rawA = a[sortBy as keyof Application];
                const rawB = b[sortBy as keyof Application];
                aVal = rawA == null ? '' : String(rawA);
                bVal = rawB == null ? '' : String(rawB);
            }

            if (aVal === bVal) return 0;

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

    // Function to export applications data as CSV
    const exportApplicationsData = (applications: Application[]) => {
        const headers = [
            'Application ID',
            'Applicant Name',
            'Beneficiary ID',
            'Aadhaar Number',
            'Phone Number',
            'District',
            'State',
            'Act Type',
            'Incident Date',
            'FIR Report',
            'Medical Report',
            'Police Station',
            'Case Number',
            t("applications.sortOptions.applicationDate") || 'Application Date',
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
            app.beneficiaryId || '',
            app.aadhaar,
            app.phone,
            app.district,
            app.state,
            app.actType,
            app.incidentDate,
            (app as any).firReport || '',
            (app as any).medicalReport || '',
            (app as any).policeStation || '',
            (app as any).caseNumber || '',
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

    // Function to send applications data via email
    const sendApplicationsEmail = async (items: Application[], format: 'csv' | 'pdf') => {
        if (!emailAddress.trim()) {
            alert('Please enter an email address');
            return;
        }

        setSendingEmail(true);
        try {
            let attachmentData: string | Buffer;
            let attachmentName: string;
            let attachmentType: string;

            if (format === 'csv') {
                // Generate CSV data directly
                const headers = [
                    'Application ID',
                    'Applicant Name',
                    'Beneficiary ID',
                    'Aadhaar Number',
                    'Phone Number',
                    'District',
                    'State',
                    'Act Type',
                    'Incident Date',
                    'FIR Report',
                    'Medical Report',
                    'Police Station',
                    'Case Number',
                    t("applications.sortOptions.applicationDate") || 'Application Date',
                    'Status',
                    'Amount (INR)',
                    'Priority',
                    'Assigned Officer',
                    'Documents Count',
                    'Last Update'
                ];

                const rows = items.map(app => [
                    app.id,
                    app.applicantName,
                    app.beneficiaryId || '',
                    app.aadhaar,
                    app.phone,
                    app.district,
                    app.state,
                    app.actType,
                    app.incidentDate,
                    (app as any).firReport || '',
                    (app as any).medicalReport || '',
                    (app as any).policeStation || '',
                    (app as any).caseNumber || '',
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

                attachmentData = csvContent;
                attachmentName = `nyantra_applications_report_${new Date().toISOString().split('T')[0]}.csv`;
                attachmentType = 'text/csv';
            } else {
                // Generate PDF data
                const pdfDoc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' });
                const pageWidth = pdfDoc.internal.pageSize.getWidth();
                const pageHeight = pdfDoc.internal.pageSize.getHeight();
                const margin = 20;
                const contentWidth = pageWidth - (margin * 2);

                // Professional header
                pdfDoc.setFillColor(30, 64, 175);
                pdfDoc.rect(0, 0, pageWidth, 35, 'F');

                // Title
                pdfDoc.setFontSize(20);
                pdfDoc.setTextColor(255, 255, 255);
                pdfDoc.setFont('helvetica', 'bold');
                pdfDoc.text('NYANTRA - Applications Report', margin, 22);

                // Subtitle
                pdfDoc.setFontSize(10);
                pdfDoc.setTextColor(255, 255, 255);
                pdfDoc.setFont('helvetica', 'normal');
                pdfDoc.text('Direct Benefit Transfer System under PCR & PoA Acts', margin, 30);

                // Report metadata
                pdfDoc.setFontSize(8);
                pdfDoc.setTextColor(255, 255, 255);
                const currentDate = new Date().toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                pdfDoc.text(`Generated: ${currentDate}`, pageWidth - margin, 22, { align: 'right' });
                pdfDoc.text(`Total Records: ${items.length}`, pageWidth - margin, 30, { align: 'right' });

                let yPosition = 50;

                // Summary section
                pdfDoc.setFillColor(240, 240, 240);
                pdfDoc.rect(margin, yPosition, contentWidth, 25, 'F');

                pdfDoc.setFontSize(12);
                pdfDoc.setTextColor(30, 64, 175);
                pdfDoc.setFont('helvetica', 'bold');
                pdfDoc.text('EXECUTIVE SUMMARY', margin + 5, yPosition + 8);

                // Calculate summary data
                const totalAmount = items.reduce((sum, app) => sum + (app.amount || 0), 0);
                const approvedCount = items.filter(app => app.status === 'approved').length;
                const pendingCount = items.filter(app => app.status === 'pending').length;
                const rejectedCount = items.filter(app => app.status === 'rejected').length;

                pdfDoc.setFontSize(9);
                pdfDoc.setTextColor(0, 0, 0);
                pdfDoc.setFont('helvetica', 'normal');
                pdfDoc.text(`Total Applications: ${items.length}`, margin + 5, yPosition + 18);
                pdfDoc.text(`Total Amount: ₹${totalAmount.toLocaleString('en-IN')}`, margin + 5, yPosition + 25);

                yPosition += 35;

                // Table
                const tableColumns = [
                    { header: 'ID', width: 20 },
                    { header: 'Applicant', width: 35 },
                    { header: 'District', width: 25 },
                    { header: 'Act Type', width: 20 },
                    { header: 'Amount', width: 20 },
                    { header: 'Status', width: 15 },
                    { header: 'Priority', width: 15 },
                    { header: 'Date', width: 25 }
                ];

                const tableRows = items.map(app => ({
                    id: app.id || '',
                    applicantName: app.applicantName || '',
                    district: app.district || '',
                    actType: app.actType || '',
                    amount: app.amount ? `₹${app.amount.toLocaleString('en-IN')}` : '₹0',
                    status: (app.status || '').toUpperCase(),
                    priority: (app.priority || '').toUpperCase(),
                    applicationDate: app.applicationDate || ''
                }));

                // Table header
                pdfDoc.setFillColor(30, 64, 175);
                pdfDoc.rect(margin, yPosition, contentWidth, 8, 'F');

                pdfDoc.setFontSize(8);
                pdfDoc.setTextColor(255, 255, 255);
                pdfDoc.setFont('helvetica', 'bold');

                let xPos = margin + 2;
                tableColumns.forEach(col => {
                    pdfDoc.text(col.header, xPos, yPosition + 5);
                    xPos += col.width;
                });

                yPosition += 10;

                // Table rows
                pdfDoc.setFontSize(6);
                pdfDoc.setTextColor(0, 0, 0);
                pdfDoc.setFont('helvetica', 'normal');

                tableRows.forEach((row, index) => {
                    if (yPosition > pageHeight - 20) {
                        pdfDoc.addPage();
                        yPosition = margin;

                        // Repeat header on new page
                        pdfDoc.setFillColor(30, 64, 175);
                        pdfDoc.rect(margin, yPosition, contentWidth, 8, 'F');

                        pdfDoc.setFontSize(8);
                        pdfDoc.setTextColor(255, 255, 255);
                        pdfDoc.setFont('helvetica', 'bold');

                        xPos = margin + 2;
                        tableColumns.forEach(col => {
                            pdfDoc.text(col.header, xPos, yPosition + 5);
                            xPos += col.width;
                        });

                        yPosition += 10;
                    }

                    xPos = margin + 2;
                    tableColumns.forEach(col => {
                        const value = row[col.header.toLowerCase().replace(' ', '') as keyof typeof row] || '';
                        pdfDoc.text(String(value), xPos, yPosition + 3);
                        xPos += col.width;
                    });

                    yPosition += 5;
                });

                // Footer
                const footerY = pageHeight - 15;
                pdfDoc.setFontSize(8);
                pdfDoc.setTextColor(128, 128, 128);
                pdfDoc.setFont('helvetica', 'italic');
                pdfDoc.text('This report is generated by Nyantra - Direct Benefit Transfer System', margin, footerY);
                pdfDoc.text(`Page 1 of 1`, pageWidth - margin, footerY, { align: 'right' });

                // Get PDF as buffer
                attachmentData = Buffer.from(pdfDoc.output('arraybuffer'));
                attachmentName = `nyantra_applications_report_${new Date().toISOString().split('T')[0]}.pdf`;
                attachmentType = 'application/pdf';
            }

            // Send email
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    to: emailAddress,
                    subject: `Nyantra Applications Report - ${new Date().toLocaleDateString()}`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #1e40af;">Nyantra - Applications Report</h2>
                            <p>Dear User,</p>
                            <p>Please find attached the applications report containing ${items.length} records.</p>
                            <p><strong>Report Details:</strong></p>
                            <ul>
                                <li>Total Records: ${items.length}</li>
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
                        encoding: format === 'csv' ? 'utf8' : undefined
                    }]
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to send email');
            }

            alert('Email sent successfully!');
            setEmailAddress('');
            setShowExportModal(false);
        } catch (error) {
            console.error('Error sending email:', error);
            alert('Failed to send email. Please try again.');
        } finally {
            setSendingEmail(false);
        }
    };

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
                const toIso = (val: any) => {
                    if (!val) return '';
                    if (val.toDate && typeof val.toDate === 'function') {
                        try { return val.toDate().toISOString(); } catch { return String(val); }
                    }
                    return typeof val === 'string' ? val : String(val);
                };

                apps.push({
                    id: doc.id,
                    applicantName: data.applicantName || '',
                    aadhaar: data.aadhaar || '',
                    phone: data.phone || '',
                    district: data.district || '',
                    state: data.state || '',
                    actType: data.actType || '',
                    beneficiaryId: data.beneficiaryId || '',
                    incidentDate: data.incidentDate || '',
                    applicationDate: toIso(data.applicationDate),
                    status: data.status || 'pending',
                    amount: data.amount || 0,
                    priority: data.priority || 'medium',
                    assignedOfficer: data.assignedOfficer || '',
                    documents: data.documents || 0,
                    lastUpdate: toIso(data.lastUpdate),
                    offenceCategory: data.offenceCategory || '',
                    offenceType: data.offenceType || ''
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-500/10 text-green-600 dark:text-green-400';
            case 'pending': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
            case 'in-review': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
            case 'rejected': return 'bg-red-500/10 text-red-600 dark:text-red-400';
            case 'documents-required': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
            default: return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-500/10 text-red-600 dark:text-red-400';
            case 'medium': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
            case 'low': return 'bg-green-500/10 text-green-600 dark:text-green-400';
            default: return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
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

    // Toast helpers
    const showToast = (type: 'success' | 'error' | 'info', message: string, ttl = 4000) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        setToasts(prev => [...prev, { id, type, message }]);
        window.setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, ttl);
    };

    // Request delete: open confirm modal
    const requestDeleteApplication = (id?: string) => {
        if (!id) return;
        setConfirmModal({ open: true, id, message: t('applications.confirmDeleteMessage').replace('{id}', id) });
    };

    const cancelConfirmDelete = () => setConfirmModal({ open: false });

    const confirmDeleteApplication = async () => {
        const id = confirmModal.id;
        if (!id) return;
        setConfirmModal({ open: false });
        try {
            await deleteDoc(doc(db, 'applications', id));
            // Optimistically update local state; onSnapshot will also reflect this change
            setApplications(prev => prev.filter(a => a.id !== id));
            setSelectedApplication(prev => (prev && prev.id === id ? null : prev));
            showToast('success', `Deleted application ${id}`);
        } catch (err) {
            // Show error, include message if available
            const message = (err as any)?.message || String(err);
            showToast('error', `Failed to delete ${id}: ${message}`);

            // Try soft-delete fallback (update status) in case deletes are blocked by rules
            try {
                await updateDoc(doc(db, 'applications', id), { status: 'deleted', deletedAt: Timestamp.fromDate(new Date()) });
                // update local list to reflect status change
                setApplications(prev => prev.map(a => a.id === id ? { ...a, status: 'deleted' } : a));
                showToast('success', `Soft-deleted application ${id} (status set to deleted)`);
            } catch (err2) {
                const m2 = (err2 as any)?.message || String(err2);
                showToast('error', `Also failed to update status: ${m2}`);
            }
        }
    };

    // Selected application detail status state (keeps the inline selector controlled)
    const [detailStatus, setDetailStatus] = useState<string>('');

    useEffect(() => {
        setDetailStatus(selectedApplication?.status || 'pending');
        setExpectedAmount(selectedApplication?.amount || 0);
    }, [selectedApplication]);

    // Highlight + scroll-to-row after a new application is created
    const [highlightId, setHighlightId] = useState<string | null>(null);
    const filteredRef = useRef<any[]>([]);
    filteredRef.current = filteredApplications;
    const pageRef = useRef(currentPage);
    pageRef.current = currentPage;

    const scrollToApplication = (id: string) => {
        let attempts = 0;
        const tick = () => {
            const idx = filteredRef.current.findIndex(a => a.id === id);
            if (idx !== -1) {
                const targetPage = Math.floor(idx / itemsPerPage) + 1;
                if (targetPage !== pageRef.current) {
                    setCurrentPage(targetPage);
                    window.setTimeout(tick, 120);
                    return;
                }
                window.setTimeout(() => {
                    document.getElementById(`app-row-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    setHighlightId(id);
                    window.setTimeout(() => setHighlightId(null), 5000);
                }, 150);
            } else if (attempts++ < 20) {
                window.setTimeout(tick, 150);
            }
        };
        tick();
    };

    // Allow officers to update application status
    const updateApplicationStatus = async (id: string, status: string) => {
        if (!id) return;
        try {
            await updateDoc(doc(db, 'applications', id), { status, lastUpdate: Timestamp.fromDate(new Date()) });
            setApplications(prev => prev.map(a => a.id === id ? { ...a, status } : a));
            setSelectedApplication(prev => prev ? { ...prev, status } : prev);
            showToast('success', `Updated status for ${id} to ${status}`);
        } catch (err) {
            const m = (err as any)?.message || String(err);
            showToast('error', `Failed to update status: ${m}`);
        }
    };

    // Allow officers to update application amount
    const updateApplicationAmount = async (id: string, amount: number) => {
        if (!id) return;
        try {
            await updateDoc(doc(db, 'applications', id), { amount, lastUpdate: Timestamp.fromDate(new Date()) });
            setApplications(prev => prev.map(a => a.id === id ? { ...a, amount } : a));
            setSelectedApplication(prev => prev ? { ...prev, amount } : prev);
            showToast('success', `Updated amount for ${id} to ₹${amount.toLocaleString('en-IN')}`);
        } catch (err) {
            const m = (err as any)?.message || String(err);
            showToast('error', `Failed to update amount: ${m}`);
        }
    };

    // Generic in-place edit from the detail panel
    const updateApplicationFields = async (id: string, data: Record<string, unknown>) => {
        if (!id) return;
        try {
            await updateDoc(doc(db, 'applications', id), { ...data, lastUpdate: Timestamp.fromDate(new Date()) });
            setApplications(prev => prev.map(a => a.id === id ? { ...a, ...(data as any) } : a));
            setSelectedApplication(prev => prev ? { ...prev, ...(data as any) } : prev);
            showToast('success', `Updated ${id}`);
        } catch (err) {
            const m = (err as any)?.message || String(err);
            showToast('error', `Failed to update: ${m}`);
        }
    };

    if (authLoading) return (
        <div className="space-y-4 max-w-[1400px]">
            <div className="theme-bg-card theme-border-glass border rounded-xl p-5">Loading...</div>
        </div>
    );

    if (!isOfficer) return (
        <div className="space-y-4 max-w-[1400px]">
            <div className="theme-bg-card theme-border-glass border rounded-xl p-5">
                <h2 className="text-base font-semibold theme-text-primary">Access restricted</h2>
                <p className="theme-text-muted">This page is restricted to officers only. If you believe this is an error, contact your administrator.</p>
            </div>
        </div>
    );

return (
  <div className="space-y-4 max-w-[1400px]">
    <style dangerouslySetInnerHTML={{ __html: sliderStyles }} />

    {/* Print Header - Only visible when printing */}
    <PrintHeader title={`${t("extracted.application")} ${t("extracted.monitoring_center")}`} />

    {/* Header */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-lg font-semibold tracking-tight theme-text-primary truncate">
          {t("extracted.application")} <span className="text-accent-gradient">{t("extracted.monitoring_center")}</span>
        </h1>
        <p className="text-xs theme-text-muted mt-0.5 truncate">
          {t("extracted.realtime_application_tracking_description")}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => setShowExportModal(true)}
          className="h-9 px-3 rounded-md border theme-border-glass inline-flex items-center gap-1.5 text-xs font-semibold theme-text-secondary hover:theme-bg-glass hover:theme-text-primary transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{t("extracted.export_data")}</span>
        </button>
        <button
          onClick={() => setShowNewApplicationForm(true)}
          className="h-9 px-3.5 accent-gradient text-white rounded-md inline-flex items-center gap-1.5 text-xs font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t("extracted.new_application")}</span>
        </button>
      </div>
    </div>

    {/* Toast container (top-right) */}
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast: any) => {
        const toastClass =
          toast.type === "success"
            ? "bg-green-500/10 border-green-500/40 text-green-600 dark:text-green-400"
            : toast.type === "error"
            ? "bg-red-500/10 border-red-500/40 text-red-600 dark:text-red-400"
            : "bg-gray-500/10 border-gray-500/40 theme-text-primary";

        return (
          <div
            key={toast.id}
            className={`max-w-sm w-full p-3 rounded-md border shadow-sm ${toastClass}`}
            role="status"
          >
            <div className="flex items-center justify-between">
              <div className="text-sm">{toast.message}</div>
              <button
                onClick={() =>
                  setToasts((prev: any[]) =>
                    prev.filter((x) => x.id !== toast.id)
                  )
                }
                className="ml-4 p-1 rounded hover:bg-gray-100"
              >
                ×
              </button>
            </div>
          </div>
        );
      })}
    </div>

    {/* Confirm delete modal */}
    <ConfirmDeleteModal
      open={confirmModal.open}
      message={confirmModal.message ?? ''}
      onCancel={cancelConfirmDelete}
      onConfirm={confirmDeleteApplication}
      theme={theme}
      t={t}
    />

    {/* Export Drawer */}
    <ExportModal
      open={showExportModal}
      onClose={() => setShowExportModal(false)}
      items={applications}
      filteredItems={filteredApplications}
      onExportCsv={exportApplicationsData}
      onExportPdf={exportApplicationsPDF}
      emailAddress={emailAddress}
      setEmailAddress={setEmailAddress}
      sendingEmail={sendingEmail}
      onSendEmail={sendApplicationsEmail}
      title={t("applications.exportTitle") || "Export Applications"}
      subtitle={t("applications.exportSubtitle") || ""}
      allTitle={t("applications.exportAllTitle") || "All Applications"}
      filteredTitle={t("applications.exportFilteredTitle") || "Filtered Results"}
    />

    {/* New Application Drawer */}
    <AnimatePresence>
      {showNewApplicationForm && (
        <NewApplicationDrawer
          onCancel={() => setShowNewApplicationForm(false)}
          onCreated={(newId) => {
            setShowNewApplicationForm(false);
            setSelectedApplication(null);
            setSearchQuery('');
            setStatusFilter('all');
            setActTypeFilter('all');
            setPriorityFilter('all');
            scrollToApplication(newId);
          }}
        />
      )}
    </AnimatePresence>

    {/* Main Content */}
    <>
      {/* Statistics Cards */}
      <StatisticsCards stats={stats} theme={theme} t={t} />


        {/* Filters and Search */}
        <FiltersSearch
          theme={theme}
          t={t}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          viewMode={viewMode}
          setViewMode={setViewMode}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          actTypeFilter={actTypeFilter}
          setActTypeFilter={setActTypeFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        />

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
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="theme-text-secondary">
                  {t("extracted.loading_applications")}
                </p>
              </div>
            </div>
) : viewMode === "table" ? (
  <div className="w-full flex flex-col overflow-hidden">
    <div className="hidden sm:block overflow-x-auto">
      <table className="w-full table-auto">
        <thead className="border-b theme-border-glass">
          <tr className="whitespace-nowrap">
            <th className="hidden sm:table-cell py-2 px-3 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted">{t("extracted.application_id")}</th>
            <th className="py-2 px-3 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted">{t("extracted.applicant")}</th>
            <th className="hidden sm:table-cell py-2 px-3 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted min-w-[120px]">{t("applications.beneficiaryId")}</th>
            <th className="hidden sm:table-cell py-2 px-3 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted">{t("extracted.district")}</th>
            <th className="hidden md:table-cell py-2 px-3 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted">{t("extracted.act_type")}</th>
            <th className="hidden md:table-cell py-2 px-3 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted">{t("applications.caseDetails")}</th>
            <th className="hidden md:table-cell py-2 px-3 text-right text-[11px] font-semibold uppercase tracking-wider theme-text-muted">{t("extracted.amount")}</th>
            <th className="py-2 px-3 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted">{t("extracted.status")}</th>
            <th className="hidden sm:table-cell py-2 px-3 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted">{t("extracted.priority")}</th>
            <th className="py-2 px-3 text-right text-[11px] font-semibold uppercase tracking-wider theme-text-muted">{t("extracted.actions")}</th>
          </tr>
        </thead>

        <tbody className="divide-y theme-border-glass text-sm">
          {paginatedApplications.map((app: any) => (
            <motion.tr
              key={app.id}
              id={`app-row-${app.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className={`transition-colors ${highlightId === app.id ? 'bg-blue-500/10' : 'hover:theme-bg-hover'}`}
            >
              <td className="py-2.5 px-3 font-medium theme-text-primary truncate text-xs">{app.id}</td>

              <td className="py-2.5 px-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-full accent-gradient flex items-center justify-center text-white text-[10px] font-semibold shrink-0">
                    {app.applicantName.split(" ").map((n: string) => n[0]).join("")}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium theme-text-primary truncate leading-tight">{app.applicantName}</span>
                    <span className="text-xs theme-text-muted truncate leading-tight">{app.phone}</span>
                  </div>
                </div>
              </td>

              <td className="hidden sm:table-cell py-2.5 px-3 text-xs theme-text-secondary tabular-nums min-w-[120px]">
                {app.beneficiaryId || "-"}
              </td>

              <td className="hidden sm:table-cell py-2.5 px-3">
                <span className="text-sm theme-text-primary truncate">{app.district}</span>
                <span className="text-xs theme-text-muted truncate block">{app.state}</span>
              </td>

              <td className="hidden md:table-cell py-2.5 px-3">
                <span className="inline-block rounded-md px-1.5 py-0.5 text-[11px] font-medium theme-bg-glass theme-text-secondary truncate">
                  {app.actType}
                </span>
              </td>

              <td className="hidden md:table-cell py-2.5 px-3 text-xs theme-text-secondary">
                <div className="space-y-0.5">
                  {app.incidentDate && <div>{new Date(app.incidentDate).toLocaleDateString()}</div>}
                  {app.firReport && <div>FIR {app.firReport}</div>}
                  {app.caseNumber && <div>{app.caseNumber}</div>}
                </div>
              </td>

              <td className="hidden md:table-cell py-2.5 px-3 text-sm font-semibold theme-text-primary truncate text-right tabular-nums">
                {formatCurrency(app.amount)}
              </td>

              <td className="py-2.5 px-3">
                <span
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${getStatusColor(
                    app.status
                  )}`}
                >
                  {(() => {
                    const Icon = getStatusIcon(app.status);
                    return <Icon className="w-3 h-3" />;
                  })()}
                  {getTranslatedStatus(app.status)}
                </span>
              </td>

              <td className="hidden sm:table-cell py-2.5 px-3">
                <span
                  className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${getPriorityColor(
                    app.priority
                  )}`}
                >
                  {getTranslatedPriority(app.priority)}
                </span>
              </td>

              <td className="py-2.5 px-3">
                <div className="flex justify-end gap-0.5">
                  <button
                    title="View"
                    className="p-1.5 rounded-md theme-text-muted hover:theme-bg-glass hover:text-blue-500 transition-colors"
                    onClick={() => setSelectedApplication(app)}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    title="Edit"
                    className="p-1.5 rounded-md theme-text-muted hover:theme-bg-glass hover:text-blue-500 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedApplication(app);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    title="Delete"
                    className="p-1.5 rounded-md theme-text-muted hover:bg-red-500/10 hover:text-red-500 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      requestDeleteApplication(app.id);
                    }}
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Mobile Card View */}
    <div className="sm:hidden grid grid-cols-1 gap-3 p-3">
      {paginatedApplications.map((app: any) => (
        <motion.div
          key={app.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="theme-bg-glass theme-border-glass border rounded-lg p-3"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium theme-text-primary">{app.applicantName}</p>
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(app.priority)}`}>
              {app.priority}
            </span>
          </div>
          <div className="space-y-1 text-sm theme-text-secondary">
            <p><strong>ID:</strong> {app.id}</p>
            <p><strong>{t("applications.beneficiaryId")}:</strong> {app.beneficiaryId || "-"}</p>
            <p><strong>{t("extracted.district_1")}</strong> {app.district}, {app.state}</p>
            <p><strong>{t("extracted.act_type_1")}</strong> {app.actType}</p>
            {app.incidentDate && <p><strong>{t("extracted.incident_date")}:</strong> {new Date(app.incidentDate).toLocaleDateString()}</p>}
            {app.firReport && <p><strong>{t("applications.firReport")}:</strong> {app.firReport}</p>}
            {app.caseNumber && <p><strong>{t("applications.caseNumber")}:</strong> {app.caseNumber}</p>}
            <p><strong>{t("extracted.amount_1")}</strong> {formatCurrency(app.amount)}</p>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
)

: (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {paginatedApplications.map((app: any, idx: number) => (
                <motion.div
                  key={app.id}
                  id={`app-row-${app.id}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.02 }}
                  whileHover={{ y: -2 }}
                  className={`theme-bg-glass theme-border-glass border rounded-lg p-4 cursor-pointer transition-shadow ${highlightId === app.id ? 'ring-2 ring-blue-500/50' : 'hover:shadow-sm'}`}
                  onClick={() => setSelectedApplication(app)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full accent-gradient flex items-center justify-center text-white font-bold">
                        {app.applicantName
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <p className="font-medium theme-text-primary">
                          {app.applicantName}
                        </p>
                        <p className="text-xs theme-text-muted">{app.id}</p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                        app.priority
                      )}`}
                    >
                      {app.priority}
                    </span>
                  </div>
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-sm theme-text-secondary">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {app.district}, {app.state}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm theme-text-secondary">
                      <FileText className="w-4 h-4" />
                      <span>{app.actType}</span>
                    </div>
                    {(app.incidentDate || app.firReport || app.caseNumber) && (
                      <div className="text-sm theme-text-secondary">
                        <div className="font-medium mb-1">{t('applications.caseDetails')}:</div>
                        {app.incidentDate && <div>{t('extracted.incident_date')}: {new Date(app.incidentDate).toLocaleDateString()}</div>}
                        {app.firReport && <div>{t('applications.firReport')}: {app.firReport}</div>}
                        {app.caseNumber && <div>{t('applications.caseNumber')}: {app.caseNumber}</div>}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm theme-text-secondary">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-semibold">
                        {formatCurrency(app.amount)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t theme-border-glass">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        app.status
                      )}`}
                    >
                      {(() => {
                        const Icon = getStatusIcon(app.status);
                        return <Icon className="w-3 h-3" />;
                      })()}
                      {getTranslatedStatus(app.status)}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        className="p-1.5 rounded-lg theme-bg-glass hover:theme-bg-card transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedApplication(app);
                        }}
                      >
                        <Eye className="w-4 h-4 theme-text-muted hover:text-blue-500" />
                      </button>
                      <button
                        className="p-1.5 rounded-lg theme-bg-glass hover:theme-bg-card transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedApplication(app);
                        }}
                      >
                        <Edit className="w-4 h-4 theme-text-muted hover:text-blue-500" />
                      </button>
                      <button
                        className="p-1.5 rounded-lg theme-bg-glass hover:theme-bg-card transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          requestDeleteApplication(app.id);
                        }}
                        aria-label={`Delete ${app.id}`}
                      >
                        <Trash className="w-4 h-4 theme-text-muted hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-2 border-t theme-border-glass">
            <p className="text-xs theme-text-muted">
              {t("extracted.showing")}{" "}
              {(currentPage - 1) * itemsPerPage + 1} {t("extracted.to")}{" "}
              {Math.min(currentPage * itemsPerPage, filteredApplications.length)}{" "}
              {t("extracted.of")} {filteredApplications.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p: number) => p - 1)}
                className="w-8 h-8 inline-flex items-center justify-center rounded-md theme-text-secondary disabled:opacity-40 hover:theme-bg-glass hover:theme-text-primary transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from(
                { length: Math.min(5, totalPages) },
                (_, i: number) => {
                  const pageNum = i + Math.max(1, currentPage - 2);
                  if (pageNum > totalPages) return null;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`min-w-8 h-8 px-2 rounded-md text-xs font-semibold tabular-nums transition-colors ${
                        currentPage === pageNum
                          ? "theme-bg-glass text-accent-gradient"
                          : "theme-text-muted hover:theme-bg-glass hover:theme-text-primary"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                }
              )}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p: number) => p + 1)}
                className="w-8 h-8 inline-flex items-center justify-center rounded-md theme-text-secondary disabled:opacity-40 hover:theme-bg-glass hover:theme-text-primary transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
    </>

    {/* Application Detail Inline Section */}
    <ApplicationDetail
      selectedApplication={selectedApplication}
      setSelectedApplication={setSelectedApplication}
      t={t}
      theme={theme}
      expectedAmount={expectedAmount}
      setExpectedAmount={setExpectedAmount}
      updateApplicationAmount={updateApplicationAmount}
      detailStatus={detailStatus}
      setDetailStatus={setDetailStatus}
      updateApplicationStatus={updateApplicationStatus}
      onUpdateFields={updateApplicationFields}
      formatDate={formatDate}
      formatCurrency={formatCurrency}
      POA_OFFENCES={POA_OFFENCES}
      setShowExportModal={setShowExportModal}
    />
  </div>
);

};

// Custom CSS for slider
const sliderStyles = `
  .slider::-webkit-slider-thumb {
    appearance: none;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    border: 2px solid #ffffff;
    box-shadow: 0 0 0 2px #3b82f6;
  }
  .slider::-webkit-slider-thumb:hover {
    background: #2563eb;
  }
  .slider::-moz-range-thumb {
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    border: 2px solid #ffffff;
    box-shadow: 0 0 0 2px #3b82f6;
  }
  .slider::-moz-range-thumb:hover {
    background: #2563eb;
  }
`;

export default ApplicationsPage;