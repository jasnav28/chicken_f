import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Order, AppSettings } from '../types';
import { formatINR, formatWeight, numberToWordsINR } from './formatters';

export const generateInvoicePDF = (
  order: Order,
  settings: AppSettings,
  shopOutstanding: number = 0
): jsPDF => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const primaryColor = [21, 128, 61]; // #15803D Deep Green
  const textColor = [15, 23, 42]; // #0F172A
  const mutedColor = [100, 116, 139]; // #64748B

  // Top Brand Header Banner
  doc.setFillColor(21, 128, 61);
  doc.rect(0, 0, pageWidth, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(settings.business_name.toUpperCase(), 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(
    `Daily Wholesale Chicken Distributor | Phone: ${settings.phone} | GSTIN: ${settings.gstin || 'Unregistered'}`,
    14,
    19
  );

  // Invoice Title Right Aligned
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('TAX INVOICE', pageWidth - 14, 14, { align: 'right' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`ORIGINAL FOR RECIPIENT`, pageWidth - 14, 20, { align: 'right' });

  // Order & Shop Details Box
  let y = 35;

  // Left Column: Bill To
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('BILLED TO (RETAIL SHOP)', 14, y);

  y += 5;
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(order.shop_name, 14, y);

  y += 5;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
  doc.text(`Address: ${order.shop_address}`, 14, y);
  y += 4.5;
  doc.text(`Route / Area: ${order.shop_area}`, 14, y);
  y += 4.5;
  doc.text(`Contact: ${order.shop_phone}`, 14, y);

  // Right Column: Invoice Info
  const rightColX = pageWidth - 80;
  let rY = 35;
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('INVOICE DETAILS', rightColX, rY);

  rY += 5;
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`Invoice No:`, rightColX, rY);
  doc.setFont('helvetica', 'normal');
  doc.text(order.invoice_number || `INV-${order.order_number}`, rightColX + 26, rY);

  rY += 5;
  doc.setFont('helvetica', 'bold');
  doc.text(`Date:`, rightColX, rY);
  doc.setFont('helvetica', 'normal');
  doc.text(order.delivery_date, rightColX + 26, rY);

  rY += 5;
  doc.setFont('helvetica', 'bold');
  doc.text(`Slot:`, rightColX, rY);
  doc.setFont('helvetica', 'normal');
  doc.text(order.delivery_slot, rightColX + 26, rY);

  rY += 5;
  doc.setFont('helvetica', 'bold');
  doc.text(`Order Ref:`, rightColX, rY);
  doc.setFont('helvetica', 'normal');
  doc.text(order.order_number, rightColX + 26, rY);

  y = Math.max(y, rY) + 8;

  // Table Items
  const tableData = order.items.map((item, index) => {
    const qty = item.delivered_qty !== undefined ? item.delivered_qty : item.ordered_qty;
    const itemTotal = (item.delivered_qty !== undefined ? item.delivered_qty : item.ordered_qty) * item.unit_rate;
    return [
      (index + 1).toString(),
      item.product_name,
      formatWeight(item.ordered_qty, item.unit),
      formatWeight(qty, item.unit),
      formatINR(item.unit_rate, false),
      formatINR(itemTotal, true),
    ];
  });

  autoTable(doc, {
    startY: y,
    head: [['#', 'Item Description', 'Ordered', 'Delivered (Billed)', 'Rate/Unit', 'Amount (Rs)']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [21, 128, 61],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'left',
    },
    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: 3,
      textColor: [15, 23, 42],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 26, halign: 'right' },
      3: { cellWidth: 32, halign: 'right', fontStyle: 'bold' },
      4: { cellWidth: 24, halign: 'right' },
      5: { cellWidth: 30, halign: 'right', fontStyle: 'bold' },
    },
  });

  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;

  // Calculation Summary
  const invoiceTotal = order.final_amount ?? order.estimated_amount;
  const netOutstanding = shopOutstanding;

  // Amount in words box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.rect(14, finalY, 110, 24, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
  doc.text('AMOUNT IN WORDS:', 18, finalY + 6);

  doc.setFontSize(8.5);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  const words = numberToWordsINR(invoiceTotal);
  doc.text(words, 18, finalY + 12, { maxWidth: 102 });

  // Bank & UPI Note
  doc.setFontSize(8);
  doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
  doc.text(`Pay via UPI: ${settings.upi_id} | Bank: ${settings.bank_details.bank_name}`, 18, finalY + 20);

  // Financial Totals on Right
  const totalsX = pageWidth - 70;
  let tY = finalY + 4;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
  doc.text('Total Delivered Wt:', totalsX, tY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text(
    formatWeight(order.total_delivered_qty ?? order.total_ordered_qty),
    pageWidth - 14,
    tY,
    { align: 'right' }
  );

  tY += 6;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
  doc.text('Current Invoice Amount:', totalsX, tY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text(formatINR(invoiceTotal), pageWidth - 14, tY, { align: 'right' });

  tY += 6;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
  doc.text('Total Outstanding Balance:', totalsX, tY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(21, 128, 61);
  doc.text(formatINR(netOutstanding), pageWidth - 14, tY, { align: 'right' });

  // Footer notes & Signatory
  const footerY = Math.max(finalY + 36, 250);
  doc.setDrawColor(226, 232, 240);
  doc.line(14, footerY, pageWidth - 14, footerY);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
  doc.text(settings.invoice_footer, 14, footerY + 6);
  doc.text('Delivered goods received in fresh and good condition.', 14, footerY + 11);

  // Signatures
  doc.text("Receiver's Signature / Stamp", 14, footerY + 26);
  doc.text(`For ${settings.business_name}`, pageWidth - 14, footerY + 20, { align: 'right' });
  doc.text('Authorized Signatory', pageWidth - 14, footerY + 26, { align: 'right' });

  return doc;
};

export const downloadInvoicePDF = (order: Order, settings: AppSettings, shopBalance: number = 0) => {
  const doc = generateInvoicePDF(order, settings, shopBalance);
  const filename = `${order.invoice_number || order.order_number}_${order.shop_name.replace(/\s+/g, '_')}.pdf`;
  doc.save(filename);
};
