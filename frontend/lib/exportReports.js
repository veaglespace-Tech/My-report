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

function getCellValue(row, column) {
  const raw = typeof column.value === "function" ? column.value(row) : row?.[column.key];
  if (column.type === "date") return toReportDate(raw);
  return safeText(raw);
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function escapePdfText(value) {
  return safeText(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)").replace(/\r?\n/g, " ");
}

function escapeHtml(value) {
  return safeText(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function truncateForWidth(value, width, fontSize) {
  const text = safeText(value);
  const maxChars = Math.max(4, Math.floor(width / (fontSize * 0.52)));
  return text.length > maxChars ? `${text.slice(0, maxChars - 1)}...` : text;
}

function normalizePdfColumnWidths(columns, tableWidth) {
  const explicitTotal = columns.reduce((total, column) => total + (Number(column.width) || 0), 0);
  const flexibleColumns = columns.filter((column) => !Number(column.width)).length || 1;
  const flexibleWidth = Math.max(54, (tableWidth - explicitTotal) / flexibleColumns);

  return columns.map((column) => Number(column.width) || flexibleWidth);
}

function addPdfObject(objects, body) {
  objects.push(body);
  return objects.length;
}

export async function exportTablePdf({ fileName, reportTitle, companyName = "MyReport", rows, columns }) {
  const pageWidth = 842;
  const pageHeight = 595;
  const margin = 36;
  const tableWidth = pageWidth - margin * 2;
  const rowHeight = 22;
  const headerTop = 86;
  const footerTop = pageHeight - 24;
  const columnWidths = normalizePdfColumnWidths(columns, tableWidth);
  const exportedAt = new Date();
  const reportRows = rows.map((row) => columns.map((column) => getCellValue(row, column)));
  const rowsPerPage = Math.max(1, Math.floor((footerTop - headerTop - rowHeight) / rowHeight));
  const pages = [];

  for (let start = 0; start < reportRows.length || start === 0; start += rowsPerPage) {
    pages.push(reportRows.slice(start, start + rowsPerPage));
  }

  const objects = [];
  const fontObjectId = addPdfObject(objects, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  const fontBoldObjectId = addPdfObject(objects, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");
  const pageObjectIds = [];

  pages.forEach((pageRows, pageIndex) => {
    const commands = [];
    const text = (value, x, y, size = 10, font = "F1") => {
      commands.push(`BT /${font} ${size} Tf ${x.toFixed(2)} ${(pageHeight - y).toFixed(2)} Td (${escapePdfText(value)}) Tj ET`);
    };
    const rect = (x, y, width, height, color = null) => {
      if (color) commands.push(`${color} rg ${x.toFixed(2)} ${(pageHeight - y - height).toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re f`);
      commands.push(`0.82 0.86 0.91 RG ${x.toFixed(2)} ${(pageHeight - y - height).toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re S`);
    };

    text(companyName, margin, 34, 18, "F2");
    text(reportTitle, margin, 56, 12, "F1");
    text(`Exported: ${exportedAt.toLocaleString()}`, pageWidth - 220, 34, 9, "F1");
    text(`Page ${pageIndex + 1} of ${pages.length}`, pageWidth - 110, footerTop + 10, 9, "F1");

    let x = margin;
    columns.forEach((column, index) => {
      rect(x, headerTop, columnWidths[index], rowHeight, "0.06 0.09 0.16");
      commands.push("1 1 1 rg");
      text(truncateForWidth(column.label, columnWidths[index] - 10, 9), x + 5, headerTop + 14, 9, "F2");
      commands.push("0 0 0 rg");
      x += columnWidths[index];
    });

    pageRows.forEach((row, rowIndex) => {
      x = margin;
      const y = headerTop + rowHeight * (rowIndex + 1);
      row.forEach((cell, columnIndex) => {
        rect(x, y, columnWidths[columnIndex], rowHeight, rowIndex % 2 === 0 ? "0.97 0.98 0.99" : null);
        text(truncateForWidth(cell, columnWidths[columnIndex] - 10, 9), x + 5, y + 14, 9, "F1");
        x += columnWidths[columnIndex];
      });
    });

    const content = commands.join("\n");
    const contentObjectId = addPdfObject(objects, `<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
    const pageObjectId = addPdfObject(
      objects,
      `<< /Type /Page /Parent 0 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${fontObjectId} 0 R /F2 ${fontBoldObjectId} 0 R >> >> /Contents ${contentObjectId} 0 R >>`
    );
    pageObjectIds.push(pageObjectId);
  });

  const pagesObjectId = addPdfObject(objects, `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageObjectIds.length} >>`);
  const catalogObjectId = addPdfObject(objects, `<< /Type /Catalog /Pages ${pagesObjectId} 0 R >>`);
  pageObjectIds.forEach((pageObjectId) => {
    objects[pageObjectId - 1] = objects[pageObjectId - 1].replace("/Parent 0 0 R", `/Parent ${pagesObjectId} 0 R`);
  });

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((body, index) => {
    offsets[index + 1] = pdf.length;
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogObjectId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  downloadBlob(new Blob([pdf], { type: "application/pdf" }), fileName);
}

export async function exportTableExcel({ fileName, sheetName, rows, columns }) {
  const headers = columns.map((column) => column.label);
  const data = rows.map((row) => columns.map((column) => getCellValue(row, column)));
  const tableRows = [headers, ...data]
    .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`)
    .join("");
  const workbookHtml = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="ProgId" content="Excel.Sheet" />
  <style>
    table { border-collapse: collapse; }
    td { border: 1px solid #cbd5e1; padding: 6px; font-family: Arial, sans-serif; font-size: 12px; }
    tr:first-child td { background: #0f172a; color: #ffffff; font-weight: bold; }
  </style>
</head>
<body>
  <table data-sheet-name="${escapeHtml(sheetName || "Report")}">${tableRows}</table>
</body>
</html>`;
  const safeFileName = fileName.replace(/\.xlsx$/i, ".xls");

  downloadBlob(new Blob([workbookHtml], { type: "application/vnd.ms-excel;charset=utf-8" }), safeFileName);
}
