import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatDate } from "@/lib/format";

function formatInr(value) {
  const amount = typeof value === "number" ? value : Number(value || 0);
  return `Rs. ${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export async function generateInvoicePdf({
  storeName = "MyReport",
  invoiceNumber = "DRAFT",
  customerName = "-",
  customerMobile = "",
  customerAddress = "",
  createdAt,
  items = [],
  gstPercentage = 0,
  discountAmount = 0,
  subtotal = 0,
  taxAmount = 0,
  totalAmount = 0,
  notes = "",
} = {}) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  const headerY = 52;
  const invoiceDate = formatDate(createdAt || new Date().toISOString());

  doc.setFillColor(18, 38, 78);
  doc.roundedRect(margin, headerY - 18, contentWidth, 64, 10, 10, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(storeName, margin + 14, headerY + 8);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Invoice", margin + 14, headerY + 26);

  const rightX = margin + contentWidth - 14;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(String(invoiceNumber), rightX, headerY + 8, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(invoiceDate, rightX, headerY + 25, { align: "right" });

  const billedY = headerY + 76;
  doc.setTextColor(94, 104, 121);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Billed To", margin, billedY);

  doc.setTextColor(17, 24, 39);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(String(customerName || "-"), margin, billedY + 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  let billedInfoY = billedY + 34;
  if (customerMobile) {
    doc.setTextColor(75, 85, 99);
    doc.text(`Mobile: ${String(customerMobile)}`, margin, billedInfoY);
    billedInfoY += 14;
  }
  if (customerAddress) {
    doc.setTextColor(75, 85, 99);
    doc.text(`Address: ${String(customerAddress)}`, margin, billedInfoY, { maxWidth: contentWidth * 0.6 });
  }

  const tableRows = (Array.isArray(items) ? items : []).map((item) => {
    const quantity = Number(item?.quantity ?? 0);
    const price = Number(item?.rate ?? item?.price ?? 0);
    const lineTotal = Number(item?.total ?? quantity * price);
    return [
      String(item?.productName || item?.name || "-"),
      String(quantity),
      formatInr(price),
      formatInr(lineTotal),
    ];
  });

  autoTable(doc, {
    startY: billedY + 52,
    head: [["Product Name", "Qty", "Price", "Total"]],
    body: tableRows.length ? tableRows : [["No items", "-", "-", "-"]],
    theme: "striped",
    styles: {
      font: "helvetica",
      fontSize: 10,
      cellPadding: { top: 8, right: 10, bottom: 8, left: 10 },
      textColor: [17, 24, 39],
      lineColor: [226, 232, 240],
      lineWidth: 0.6,
      overflow: "linebreak",
      valign: "middle",
    },
    headStyles: {
      fillColor: [18, 38, 78],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "left",
      valign: "middle",
    },
    alternateRowStyles: { fillColor: [246, 248, 252] },
    columnStyles: {
      0: { cellWidth: contentWidth * 0.46, halign: "left" },
      1: { cellWidth: contentWidth * 0.14, halign: "center" },
      2: { cellWidth: contentWidth * 0.2, halign: "right" },
      3: { cellWidth: contentWidth * 0.2, halign: "right" },
    },
    margin: { left: margin, right: margin },
    tableLineColor: [226, 232, 240],
    tableLineWidth: 0.6,
  });

  const tableEndY = doc.lastAutoTable?.finalY || billedY + 220;
  const summaryTop = tableEndY + 18;
  const summaryWidth = 248;
  const summaryLeft = pageWidth - margin - summaryWidth;

  doc.setFillColor(250, 251, 255);
  doc.roundedRect(summaryLeft, summaryTop, summaryWidth, 108, 8, 8, "F");
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(summaryLeft, summaryTop, summaryWidth, 108, 8, 8);

  const summaryRows = [
    ["Subtotal", formatInr(subtotal)],
    [`GST (${Number(gstPercentage || 0)}%)`, formatInr(taxAmount)],
    ["Discount", formatInr(discountAmount)],
  ];

  let rowY = summaryTop + 24;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(75, 85, 99);
  summaryRows.forEach(([label, value]) => {
    doc.text(label, summaryLeft + 14, rowY);
    doc.text(value, summaryLeft + summaryWidth - 14, rowY, { align: "right" });
    rowY += 18;
  });

  doc.setDrawColor(203, 213, 225);
  doc.line(summaryLeft + 14, rowY - 6, summaryLeft + summaryWidth - 14, rowY - 6);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(17, 24, 39);
  doc.text("Total", summaryLeft + 14, rowY + 12);
  doc.text(formatInr(totalAmount), summaryLeft + summaryWidth - 14, rowY + 12, { align: "right" });

  const notesY = summaryTop + 130;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(55, 65, 81);
  doc.text("Notes:", margin, notesY);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(75, 85, 99);
  doc.text(String(notes || "Thank you for choosing MyReport POS."), margin, notesY + 14, {
    maxWidth: contentWidth,
    lineHeightFactor: 1.4,
  });

  const footerY = pageHeight - 30;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, footerY - 14, pageWidth - margin, footerY - 14);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  doc.text("Generated by MyReport POS", margin, footerY);

  return doc;
}

