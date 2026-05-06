import { formatDate } from "@/lib/format";

function safeText(value) {
  if (value === null || value === undefined) return "";
  return String(value);
}

function toReportDate(value) {
  if (!value) return "";
  try {
    return formatDate(value);
  } catch {
    return safeText(value);
  }
}

export async function exportTablePdf({ fileName, reportTitle, companyName = "MyReport", rows, columns }) {
  const [{ jsPDF }, autoTableModule] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
  const autoTable = autoTableModule.default || autoTableModule;

  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  const exportedAt = new Date();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(companyName, 40, 46);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(reportTitle, 40, 68);

  doc.setFontSize(10);
  doc.setTextColor(80);
  doc.text(`Exported: ${exportedAt.toLocaleString()}`, pageWidth - 40, 46, { align: "right" });
  doc.setTextColor(0);

  const head = [columns.map((column) => column.label)];
  const body = rows.map((row) =>
    columns.map((column) => {
      const raw = typeof column.value === "function" ? column.value(row) : row?.[column.key];
      if (column.type === "date") return toReportDate(raw);
      return safeText(raw);
    })
  );

  autoTable(doc, {
    head,
    body,
    startY: 92,
    theme: "grid",
    styles: { font: "helvetica", fontSize: 10, cellPadding: 6, overflow: "linebreak" },
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: Object.fromEntries(columns.map((column, index) => [index, { cellWidth: column.width || "auto" }])),
  });

  doc.save(fileName);
}

export async function exportTableExcel({ fileName, sheetName, rows, columns }) {
  const XLSX = await import("xlsx");
  const headers = columns.map((column) => column.label);
  const data = rows.map((row) =>
    columns.map((column) => {
      const raw = typeof column.value === "function" ? column.value(row) : row?.[column.key];
      if (column.type === "date") return toReportDate(raw);
      return safeText(raw);
    })
  );

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);

  const colWidths = headers.map((header, colIndex) => {
    const maxLength = Math.max(
      header.length,
      ...data.map((row) => (row[colIndex] ? String(row[colIndex]).length : 0))
    );
    return { wch: Math.min(42, Math.max(12, maxLength + 2)) };
  });
  worksheet["!cols"] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, fileName, { compression: true });
}

