import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Order, AppSettings } from '../types';
import { formatINR, formatWeight } from './formatters';

export const generateDeliverySheetPDF = (
  date: string,
  slot: string,
  orders: Order[],
  settings: AppSettings
): jsPDF => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Banner
  doc.setFillColor(21, 128, 61);
  doc.rect(0, 0, pageWidth, 22, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(`${settings.business_name.toUpperCase()} - DAILY DISPATCH & DELIVERY SHEET`, 14, 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Date: ${date} | Delivery Slot: ${slot} | Total Route Orders: ${orders.length}`, 14, 17);

  // Group orders by Route/Area
  const routesMap = new Map<string, Order[]>();
  orders.forEach((o) => {
    const route = o.shop_area || 'General Area';
    if (!routesMap.has(route)) {
      routesMap.set(route, []);
    }
    routesMap.get(route)!.push(o);
  });

  let currentY = 28;

  routesMap.forEach((routeOrders, routeName) => {
    // Route Title Header
    doc.setFillColor(241, 245, 249);
    doc.rect(14, currentY, pageWidth - 28, 8, 'F');
    doc.setTextColor(21, 128, 61);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(`ROUTE / AREA: ${routeName.toUpperCase()} (${routeOrders.length} Drops)`, 18, currentY + 5.5);
    currentY += 10;

    const tableRows = routeOrders.map((order, idx) => {
      const itemsList = order.items
        .map((i) => `${i.product_name}: ${formatWeight(i.delivered_qty ?? i.ordered_qty, i.unit)}`)
        .join(', ');

      const totalWeight = order.total_delivered_qty ?? order.total_ordered_qty;
      const amountToCollect = order.final_amount ?? order.estimated_amount;

      return [
        (idx + 1).toString(),
        order.shop_name,
        `${order.shop_address}\nPh: ${order.shop_phone}`,
        itemsList,
        formatWeight(totalWeight),
        formatINR(amountToCollect, false),
        '', // Space for shopkeeper signature
      ];
    });

    autoTable(doc, {
      startY: currentY,
      head: [['#', 'Shop Name', 'Address & Phone', 'Delivered Items Breakdown', 'Total Wt', 'Collect (Rs)', 'Receiver Sign']],
      body: tableRows,
      theme: 'grid',
      headStyles: {
        fillColor: [100, 116, 139],
        textColor: [255, 255, 255],
        fontSize: 8.5,
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 8,
        cellPadding: 2.5,
      },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },
        1: { cellWidth: 42, fontStyle: 'bold' },
        2: { cellWidth: 50 },
        3: { cellWidth: 'auto' },
        4: { cellWidth: 22, halign: 'right', fontStyle: 'bold' },
        5: { cellWidth: 26, halign: 'right', fontStyle: 'bold' },
        6: { cellWidth: 28 },
      },
    });

    currentY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  });

  return doc;
};

export const downloadDeliverySheetPDF = (
  date: string,
  slot: string,
  orders: Order[],
  settings: AppSettings
) => {
  const doc = generateDeliverySheetPDF(date, slot, orders, settings);
  doc.save(`DeliverySheet_${date}_${slot}.pdf`);
};
