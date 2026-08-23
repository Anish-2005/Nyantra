"use client";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}
import { buildOfficerBeneficiaryCsv, type TranslateFnLike } from './helpers';

/**
 * Download the beneficiaries collection as a CSV file (browser side effect).
 */
export const downloadOfficerBeneficiariesCsv = (items: any[], t: TranslateFnLike) => {
  const csv = buildOfficerBeneficiaryCsv(items, t);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `beneficiaries_export_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const buildOfficerBeneficiariesPdfDoc = (items: any[]): jsPDF => {
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
  doc.text('NYANTRA - Beneficiaries Report', margin, 22);

  // Subtitle
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
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
  doc.text(`Total Records: ${items.length}`, pageWidth - margin, 30, { align: 'right' });

  let yPosition = 50;

  // Summary section
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, yPosition, contentWidth, 25, 'F');

  doc.setFontSize(12);
  doc.setTextColor(30, 64, 175);
  doc.setFont('helvetica', 'bold');
  doc.text('EXECUTIVE SUMMARY', margin + 5, yPosition + 8);

  // Summary stats
  const statusCounts = items.reduce((acc, b) => {
      acc[b.status] = (acc[b.status] || 0) + 1;
      return acc;
  }, {} as Record<string, number>);

  const verificationCounts = items.reduce((acc, b) => {
      acc[b.verificationStatus] = (acc[b.verificationStatus] || 0) + 1;
      return acc;
  }, {} as Record<string, number>);

  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Beneficiaries: ${items.length}`, margin + 5, yPosition + 18);

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
      const percentage = (((count as number) / items.length) * 100).toFixed(1);
      doc.text(`${statusText}: ${count} (${percentage}%)`, margin + 5, yPosition);
      yPosition += 5;
  });

  yPosition += 10;

  // Verification breakdown
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 64, 175);
  doc.text('Verification Breakdown:', margin, yPosition);

  yPosition += 8;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);

  Object.entries(verificationCounts).forEach(([verification, count]) => {
      const verificationText = verification.replace(/-/g, ' ').toUpperCase();
      const percentage = (((count as number) / items.length) * 100).toFixed(1);
      doc.text(`${verificationText}: ${count} (${percentage}%)`, margin + 5, yPosition);
      yPosition += 5;
  });

  yPosition += 10;

  // Beneficiaries table
  const tableColumns = [
      { header: 'Beneficiary ID', dataKey: 'id', width: 30 },
      { header: 'Name', dataKey: 'name', width: 35 },
      { header: 'Phone', dataKey: 'phone', width: 30 },
      { header: 'District', dataKey: 'district', width: 30 },
      { header: 'Status', dataKey: 'status', width: 25 },
      { header: 'Verification', dataKey: 'verificationStatus', width: 25 },
      { header: 'Assigned Officer', dataKey: 'assignedOfficer', width: 35 }
  ];

  const tableRows = items.map(b => ({
      id: b.id,
      name: b.name,
      phone: b.phone,
      district: `${b.district}${b.state ? `, ${b.state}` : ''}`,
      status: (b.status || '').toString().replace(/-/g, ' ').toUpperCase(),
      verificationStatus: (b.verificationStatus || '').toString().replace(/-/g, ' ').toUpperCase(),
      assignedOfficer: b.assignedOfficer || 'Not Assigned'
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

  return doc;
};

/**
 * Generate and save the beneficiaries PDF report.
 */
export const exportOfficerBeneficiariesPdf = (items: any[]) => {
  buildOfficerBeneficiariesPdfDoc(items).save(`nyantra_beneficiaries_report_${new Date().toISOString().split('T')[0]}.pdf`);
};

/**
 * Build the PDF binary payload used as an email attachment.
 */
export const getOfficerBeneficiariesPdfBuffer = (items: any[]): Buffer =>
  Buffer.from(buildOfficerBeneficiariesPdfDoc(items).output('arraybuffer'));
