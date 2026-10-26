/**
 * pdfGenerator.js — PDF Export Generator
 * Uses jsPDF and jspdf-autotable for professional fabrication reports.
 */
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { unitsToFraction } from '@/lib/shared/measurement/measurementEngine.js';

/**
 * Generates a complete PDF report for calculated window(s).
 * @param {Object} projectData - Contains windowResults, materials, costs, pricing, meta
 * @returns {jsPDF} The generated PDF document
 */
export function generateFabricationReport(projectData) {
  const { windowResults, calcData, materials, costs, pricing, meta } = projectData;
  const windows = windowResults || (calcData ? [calcData] : []);

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.width;

  // Brand colors
  const colorPrimary = [16, 185, 129];
  const colorText = [40, 40, 40];
  const colorMuted = [100, 100, 100];

  // Header
  doc.setFontSize(22);
  doc.setTextColor(...colorPrimary);
  doc.setFont('helvetica', 'bold');
  doc.text('AluminiumCalc', 14, 22);

  doc.setFontSize(12);
  doc.setTextColor(...colorText);
  doc.text('Fabrication & Quotation Report', 14, 30);

  doc.setFontSize(10);
  doc.setTextColor(...colorMuted);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - 14, 22, { align: 'right' });
  if (meta?.customer) doc.text(`Customer: ${meta.customer}`, pageWidth - 14, 28, { align: 'right' });
  if (meta?.projectName) doc.text(`Project: ${meta.projectName}`, pageWidth - 14, 34, { align: 'right' });

  doc.setDrawColor(200, 200, 200);
  doc.line(14, 38, pageWidth - 14, 38);

  let yPos = 46;

  // Project Overview
  doc.setFontSize(14);
  doc.setTextColor(...colorText);
  doc.setFont('helvetica', 'bold');
  doc.text('Project Overview', 14, yPos);
  yPos += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  [`Total Windows: ${windows.length}`, `Total Area: ${pricing.areaSqFt.toFixed(2)} sqft`].forEach(line => {
    doc.text(line, 14, yPos);
    yPos += 6;
  });
  yPos += 4;

  // Cut List Tables
  windows.forEach((w, index) => {
    if (yPos > doc.internal.pageSize.height - 60) { doc.addPage(); yPos = 20; }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Cut List - ${w.windowLabel || `Window #${index + 1}`}`, 14, yPos);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colorMuted);
    doc.text(`(${unitsToFraction(w.inputs.width)}" x ${unitsToFraction(w.inputs.height)}")`, 80, yPos);
    yPos += 4;

    const cutListData = w.sections.map(s => [
      s.description, s.sectionKey.toUpperCase(), s.qty.toString(),
      `${s.cutSize.fraction}"`, s.cutSize.sut.toString(), s.cutSize.units.toString()
    ]);

    if (w.glassConfig) {
      w.glassConfig.forEach(g => {
        const wDim = w.dimensions[g.width_key];
        const hDim = w.dimensions[g.height_key];
        if (wDim && hDim) {
          cutListData.push([
            g.label, 'GLASS', g.qty.toString(),
            `${wDim.fraction}" x ${hDim.fraction}"`,
            `${wDim.sut} x ${hDim.sut}`,
            `${wDim.units} x ${hDim.units}`
          ]);
        }
      });
    }

    autoTable(doc, {
      startY: yPos,
      head: [['Description', 'Section', 'Qty', 'Cut Size (in)', 'In Sut', 'Units']],
      body: cutListData,
      theme: 'grid',
      headStyles: { fillColor: colorPrimary, textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 9, textColor: colorText },
      alternateRowStyles: { fillColor: [250, 250, 250] },
      margin: { left: 14, right: 14 }
    });
    yPos = doc.lastAutoTable.finalY + 12;
  });

  yPos += 4;

  // Material Requirements
  if (yPos > doc.internal.pageSize.height - 80) { doc.addPage(); yPos = 20; }
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colorText);
  doc.text('Combined Material Requirements', 14, yPos);
  yPos += 4;

  const matData = [];
  materials.aluminium.forEach(a => {
    matData.push([`Aluminium: ${a.label}`, `${a.totalLengthFt.toFixed(2)} ft`, `${a.totalWeightKg.toFixed(2)} kg`, `${a.stockLengthsNeeded} lengths`]);
  });
  matData.push(['Glass', `${(materials.glass.totalAreaSqFt || 0).toFixed(2)} sq.ft`, '-', '-']);
  materials.hardware.forEach(h => {
    matData.push([`Hardware: ${h.label}`, `${h.qty.toFixed(2)} ${h.unit === 'piece' ? 'pcs' : 'ft'}`, '-', '-']);
  });

  autoTable(doc, {
    startY: yPos,
    head: [['Material', 'Quantity / Length', 'Weight', 'Stock']],
    body: matData,
    theme: 'plain',
    headStyles: { fillColor: [240, 240, 240], textColor: colorText, fontSize: 9, fontStyle: 'bold' },
    bodyStyles: { fontSize: 9, textColor: colorText },
    margin: { left: 14, right: 14 }
  });

  // Pricing Summary
  yPos = doc.lastAutoTable.finalY + 16;
  if (yPos > doc.internal.pageSize.height - 60) { doc.addPage(); yPos = 20; }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Total Quotation Summary', 14, yPos);
  yPos += 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  doc.text('Total Area:', 14, yPos);
  doc.text(`${pricing.areaSqFt.toFixed(2)} sqft`, 80, yPos, { align: 'right' });
  yPos += 6;
  doc.setDrawColor(200, 200, 200);
  doc.line(14, yPos, 80, yPos);
  yPos += 6;

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colorPrimary);
  doc.text('Total Selling Price:', 14, yPos);
  doc.text(`Rs. ${pricing.sellingPrice.toFixed(2)}`, 80, yPos, { align: 'right' });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.setFont('helvetica', 'normal');
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(`Generated by AluminiumCalc • Page ${i} of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });
  }

  return doc;
}

/** Downloads the PDF in the browser. */
export function downloadPDF(projectData, filename = 'fabrication_report.pdf') {
  try {
    const doc = generateFabricationReport(projectData);
    doc.save(filename);
  } catch (err) {
    alert('PDF Error: ' + err.message);
    console.error(err);
  }
}

/** Opens the PDF in a new tab for printing. */
export function printPDF(projectData) {
  try {
    const doc = generateFabricationReport(projectData);
    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
  } catch (err) {
    alert('PDF Error: ' + err.message);
    console.error(err);
  }
}
