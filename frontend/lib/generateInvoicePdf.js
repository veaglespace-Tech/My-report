import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency, formatDate } from "@/lib/format";

export async function generateInvoicePdf({
  storeName = "MyReport",
  invoiceNumber = "DRAFT",
  customerName = "-",
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
  const margin = 40;
  const titleY = 48;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(storeName, margin, titleY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(90);
  doc.text("Invoice", margin, titleY + 18);

  const rightX = pageWidth - margin;
  doc.setTextColor(30);
  doc.setFont("helvetica", "bold");
  doc.text(String(invoiceNumber), rightX, titleY, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setTextColor(90);
  doc.text(formatDate(createdAt || new Date().toISOString()), rightX, titleY + 16, { align: "right" });

  doc.setDrawColor(225);
  doc.line(margin, titleY + 28, pageWidth - margin, titleY + 28);

  doc.setTextColor(60);
  doc.setFont("helvetica", "normal");
  doc.text("Billed To", margin, titleY + 56);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30);
  doc.text(String(customerName), margin, titleY + 74);

  const tableRows = (Array.isArray(items) ? items : []).map((item) => {
    const quantity = Number(item?.quantity ?? 0);
    const price = Number(item?.rate ?? item?.price ?? 0);
    const lineTotal = Number(item?.total ?? quantity * price);
    return [
      String(item?.productName || item?.name || "-"),
      String(quantity),
      formatCurrency(price),
      formatCurrency(lineTotal),
    ];
  });

  autoTable(doc, {
    startY: titleY + 96,
    head: [["Product", "Qty", "Price", "Total"]],
    body: tableRows.length ? tableRows : [["No items", "-", "-", "-"]],
    theme: "grid",
    styles: { font: "helvetica", fontSize: 10, cellPadding: 8, textColor: 30, lineColor: 230 },
    headStyles: { fillColor: [245, 247, 255], textColor: 80, fontStyle: "bold" },
    columnStyles: {
      1: { halign: "right" },
      2: { halign: "right" },
      3: { halign: "right" },
    },
    margin: { left: margin, right: margin },
  });

  const afterTableY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 14 : titleY + 220;

  const totals = [
    ["Subtotal", formatCurrency(subtotal)],
    ["GST", formatCurrency(taxAmount)],
    ["Discount", formatCurrency(discountAmount)],
    ["Total Amount", formatCurrency(totalAmount)],
  ];

  const totalsXLabel = pageWidth - margin - 220;
  let y = afterTableY;
  doc.setTextColor(60);
  doc.setFontSize(10);
  totals.forEach(([label, value], idx) => {
    const isGrand = idx === totals.length - 1;
    doc.setFont("helvetica", isGrand ? "bold" : "normal");
    doc.text(label, totalsXLabel, y);
    doc.text(value, pageWidth - margin, y, { align: "right" });
    y += isGrand ? 16 : 14;
  });

  doc.setFont("helvetica", "normal");
  doc.setTextColor(90);
  doc.setFontSize(9);
  doc.text(`GST: ${Number(gstPercentage || 0)}%`, margin, afterTableY + 14);

  if (notes) {
    doc.setTextColor(80);
    doc.setFontSize(9);
    doc.text(`Notes: ${String(notes)}`, margin, y + 6, { maxWidth: pageWidth - margin * 2 });
  }

  doc.setTextColor(120);
  doc.setFontSize(9);
  doc.text("Signature", pageWidth - margin, doc.internal.pageSize.getHeight() - 64, { align: "right" });
  doc.setDrawColor(220);
  doc.line(pageWidth - margin - 160, doc.internal.pageSize.getHeight() - 56, pageWidth - margin, doc.internal.pageSize.getHeight() - 56);

  return doc;
}

