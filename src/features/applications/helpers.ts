"use client";
import jsPDF from 'jspdf';
import { Clock, Eye, Check, X, AlertCircle } from 'lucide-react';

// Application data type
export interface Application {
  id: string;
  ownerId: string;
  applicantName: string;
  aadhaar: string;
  phone: string;
  district: string;
  state: string;
  actType: string;
  beneficiaryId: string;
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
  // common beneficiary fields
  fatherName?: string;
  email?: string;
  address?: string;
  registrationDate?: any;
  category?: string;
  age?: number | null;
  gender?: string;
  maritalStatus?: string;
  bankAccount?: string;
  ifsc?: string;
  // PoA specific fields
  offenceCategory?: string;
  offenceType?: string;
}

export type TranslateFn = (key: string, vars?: Record<string, string | number>) => string;

/** Status → journey stage index (rejected = -1) */
export const stageIndex = (status: string) => {
  switch (status) {
    case 'approved': return 2;
    case 'in-review':
    case 'documents-required': return 1;
    case 'rejected': return -1;
    default: return 0;
  }
};

export const formatCurrency = (n?: number) => {
  if (n == null) return '\u20b90';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
};

export const formatDate = (date: any) => {
  if (!date) return '\u2014';
  try {
    if (typeof date?.toDate === 'function') {
      return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(date.toDate());
    }
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return String(date);
    return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(d);
  } catch { return String(date); }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved': return 'bg-green-500/10 text-green-600 dark:text-green-400';
    case 'pending': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
    case 'in-review': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
    case 'rejected': return 'bg-red-500/10 text-red-600 dark:text-red-400';
    case 'documents-required': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
    default: return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
  }
};

const STATUS_ICONS = {
  'pending': Clock,
  'in-review': Eye,
  'approved': Check,
  'rejected': X,
  'documents-required': AlertCircle
} as const;

export const getStatusIcon = (status: string) =>
  STATUS_ICONS[status as keyof typeof STATUS_ICONS] || Clock;

/** Status → left spine strip color for officer cards */
export const STATUS_SPINE: Record<string, string> = {
  pending: 'bg-amber-500/70',
  'in-review': 'bg-blue-500/70',
  approved: 'bg-emerald-500/70',
  rejected: 'bg-red-500/70',
  'documents-required': 'bg-purple-500/70'
};

export const getTranslatedStatus = (t: TranslateFn, status: string) => {
  const safe = status ?? '';
  return t(`applications.status.${safe.replace('-', '_')}`) || safe.replace('-', ' ');
};

export const getTranslatedPriority = (t: TranslateFn, priority: string) =>
  t(`applications.priority.${(priority || '').toLowerCase()}`) || priority;

/* ------------------------------------------------------------------ */
/* Officer-side additions (OfficerApplicationsPage + officer components) */
/* ------------------------------------------------------------------ */

/** Application shape as consumed by the officer monitoring center */
export interface OfficerApplication {
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

/** Priority → pill tone (officer tables/cards) */
export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'bg-red-500/10 text-red-600 dark:text-red-400';
    case 'medium': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
    case 'low': return 'bg-green-500/10 text-green-600 dark:text-green-400';
    default: return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
  }
};

// Key-map for translated status labels (i18n-check/no-orphan-t: no literal-key calls)
const OFFICER_STATUS_TEXT_KEYS: Record<string, string> = {
  'pending': 'applications.status.pending',
  'in-review': 'applications.status.in_review',
  'approved': 'applications.status.approved',
  'rejected': 'applications.status.rejected',
  'documents-required': 'applications.status.documents_required'
};

/** Translated status label for officer views (falls back to humanized status) */
export const getOfficerTranslatedStatus = (t: TranslateFn, status: string) => {
  const safe = status ?? '';
  const key = OFFICER_STATUS_TEXT_KEYS[safe];
  return (key ? t(key) : '') || safe.replace('-', ' ');
};

/** Deterministic en-GB date for officer tables (empty string when missing) to avoid SSR mismatches */
export const formatOfficerDate = (d?: string | Date) => {
  if (!d) return '';
  try {
    const dt = typeof d === 'string' ? new Date(d) : d;
    return new Intl.DateTimeFormat('en-GB', { year: 'numeric', month: 'short', day: 'numeric' }).format(dt);
  } catch { return String(d); }
};

/** Deterministic en-IN currency for officer tables (empty string when missing) */
export const formatOfficerCurrency = (n?: number) => {
  if (n == null) return '';
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
  } catch { return String(n); }
};

/** Custom CSS for the amount slider used by officer detail panels */
export const sliderStyles = `
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

// Key-map for CSV header labels (i18n-check/no-orphan-t: no literal-key calls)
const EXPORT_TEXT_KEYS = {
  applicationDate: 'applications.sortOptions.applicationDate'
} as const;

/** Build RFC-ish quoted CSV content for a set of applications */
export const buildApplicationsCsv = (items: OfficerApplication[], t: TranslateFn): string => {
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
    t(EXPORT_TEXT_KEYS.applicationDate) || 'Application Date',
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
    app.firReport || '',
    app.medicalReport || '',
    app.policeStation || '',
    app.caseNumber || '',
    app.applicationDate,
    app.status,
    app.amount.toString(),
    app.priority,
    app.assignedOfficer,
    app.documents.toString(),
    app.lastUpdate
  ]);

  return [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');
};

/** Email attachment payload for exported application reports */
export interface ApplicationsExportAttachment {
  filename: string;
  content: string | Buffer;
  contentType: string;
  encoding?: string;
}

/** Build the CSV/PDF attachment sent with officer report emails */
export const buildApplicationsAttachment = (
  items: OfficerApplication[],
  format: 'csv' | 'pdf',
  t: TranslateFn
): ApplicationsExportAttachment => {
  if (format === 'csv') {
    return {
      filename: `nyantra_applications_report_${new Date().toISOString().split('T')[0]}.csv`,
      content: buildApplicationsCsv(items, t),
      contentType: 'text/csv',
      encoding: 'utf8'
    };
  }

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

  tableRows.forEach((row) => {
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

  return {
    filename: `nyantra_applications_report_${new Date().toISOString().split('T')[0]}.pdf`,
    content: Buffer.from(pdfDoc.output('arraybuffer')),
    contentType: 'application/pdf'
  };
};

/** HTML body for officer report emails */
export const buildApplicationsEmailHtml = (items: OfficerApplication[], format: 'csv' | 'pdf'): string => `
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
`;

/** Export applications data as PDF (professional A4 report) */
export const exportApplicationsPDF = (applications: OfficerApplication[]) => {
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
      status: (app.status ?? '').replace(/-/g, ' ').toUpperCase(),
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
