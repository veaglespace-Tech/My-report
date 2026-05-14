import { formatCurrency, formatDate } from "@/lib/format";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function printInvoice({
  invoiceNumber,
  storeName = "MyReport",
  customerName,
  customerMobile,
  customerAddress,
  items,
  gstPercentage,
  discountAmount,
  subtotal,
  taxAmount,
  totalAmount,
  notes,
  createdAt,
} = {}) {
  if (typeof window === "undefined") return;

  const safeItems = Array.isArray(items) ? items : [];
  const now = createdAt ? new Date(createdAt) : new Date();
  const title = invoiceNumber ? `Invoice ${invoiceNumber}` : "Invoice";

  const rowsHtml = safeItems
    .map((item) => {
      const quantity = Number(item?.quantity ?? 0);
      const price = Number(item?.rate ?? item?.price ?? 0);
      const lineTotal = Number(item?.total ?? quantity * price);
      return `
        <tr>
          <td>${escapeHtml(item?.productName || item?.name || "-")}</td>
          <td class="qty">${escapeHtml(quantity)}</td>
          <td class="num">${escapeHtml(formatCurrency(price))}</td>
          <td class="num">${escapeHtml(formatCurrency(lineTotal))}</td>
        </tr>
      `;
    })
    .join("");

  const html = `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <title>${escapeHtml(title)}</title>
      <style>
        :root { color-scheme: light; }
        body { font-family: Inter, Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 0; padding: 24px; color: #0b1220; background: #ffffff; }
        .wrap { max-width: 840px; margin: 0 auto; }
        .header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding-bottom: 16px; border-bottom: 1px solid #e6e9f2; }
        .brand { font-weight: 800; font-size: 22px; line-height: 1.2; }
        .subtitle { margin-top: 6px; font-size: 13px; color: #42526b; line-height: 1.4; }
        .meta { text-align: right; font-size: 12px; color: #42526b; line-height: 1.5; }
        .meta strong { color: #0b1220; font-size: 13px; }
        .block { padding: 20px 0; }
        .section-label { font-size: 11px; text-transform: uppercase; letter-spacing: .08em; color: #6b7a90; font-weight: 700; }
        .section-value { margin-top: 8px; font-size: 14px; font-weight: 700; color: #0b1220; line-height: 1.5; }
        .section-sub { margin-top: 4px; font-size: 12px; color: #4b5563; line-height: 1.5; }
        table { width: 100%; border-collapse: collapse; border: 1px solid #e6e9f2; table-layout: fixed; }
        col.product { width: 45%; }
        col.qty { width: 15%; }
        col.price { width: 20%; }
        col.total { width: 20%; }
        thead th { text-align: left; font-size: 11px; text-transform: uppercase; color: #ffffff; background: #12264e; padding: 12px; border-bottom: 1px solid #0d1f41; font-weight: 700; }
        thead th.qty { text-align: center; }
        thead th.num { text-align: right; }
        tbody td { padding: 12px; border-bottom: 1px solid #eef1f8; font-size: 13px; line-height: 1.4; }
        tbody tr:nth-child(even) { background: #f8fafc; }
        tbody tr:last-child td { border-bottom: none; }
        td.qty { text-align: center; white-space: nowrap; font-variant-numeric: tabular-nums; }
        .num { text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; letter-spacing: 0; word-spacing: 0; }
        .totals-wrap { margin-top: 16px; display: flex; justify-content: flex-end; }
        .totals { width: 320px; border: 1px solid #e6e9f2; background: #fbfcff; padding: 12px 14px; }
        .total-row { display: flex; justify-content: space-between; gap: 14px; font-size: 13px; color: #2a3850; padding: 6px 0; }
        .total-row strong { color: #0b1220; white-space: nowrap; }
        .grand { margin-top: 6px; padding-top: 10px; border-top: 1px dashed #cbd5e1; font-size: 16px; font-weight: 800; color: #0b1220; }
        .notes { margin-top: 18px; font-size: 12px; color: #42526b; line-height: 1.7; border-top: 1px solid #e6e9f2; padding-top: 12px; }
        .footer { margin-top: 18px; padding-top: 10px; border-top: 1px solid #e6e9f2; font-size: 11px; color: #6b7280; }
        @page { size: A4; margin: 14mm; }
        @media print {
          body { background: white; color: black; padding: 0; }
          .wrap { max-width: none; }
          table { width: 100%; border-collapse: collapse; }
          td, th { padding: 12px; }
        }
      </style>
    </head>
    <body>
      <div class="wrap">
        <div class="header">
          <div>
            <div class="brand">${escapeHtml(storeName || "MyReport")}</div>
            <div class="subtitle">Invoice</div>
          </div>
          <div class="meta">
            <div><strong>${escapeHtml(invoiceNumber || "DRAFT")}</strong></div>
            <div style="margin-top:6px">${escapeHtml(formatDate(now.toISOString()))}</div>
          </div>
        </div>

        <div class="block">
          <div class="section-label">Billed To</div>
          <div class="section-value">${escapeHtml(customerName || "-")}</div>
          ${customerMobile ? `<div class="section-sub">Mobile: ${escapeHtml(customerMobile)}</div>` : ""}
          ${customerAddress ? `<div class="section-sub">Address: ${escapeHtml(customerAddress)}</div>` : ""}
        </div>

        <div class="block">
          <table>
            <colgroup>
              <col class="product" />
              <col class="qty" />
              <col class="price" />
              <col class="total" />
            </colgroup>
            <thead>
              <tr>
                <th>Product</th>
                <th class="qty">Qty</th>
                <th class="num">Price</th>
                <th class="num">Total</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml || `<tr><td colspan="4" style="padding:16px 14px;color:#5b6b82">No items</td></tr>`}
            </tbody>
          </table>

          <div class="totals-wrap">
            <div class="totals">
              <div class="total-row"><span>Subtotal</span><strong>${escapeHtml(formatCurrency(subtotal || 0))}</strong></div>
              <div class="total-row"><span>GST (${escapeHtml(Number(gstPercentage ?? 0))}%)</span><strong>${escapeHtml(formatCurrency(taxAmount || 0))}</strong></div>
              <div class="total-row"><span>Discount</span><strong>${escapeHtml(formatCurrency(discountAmount || 0))}</strong></div>
              <div class="total-row grand"><span>Total</span><span>${escapeHtml(formatCurrency(totalAmount || 0))}</span></div>
            </div>
          </div>

          <div class="notes"><strong>Notes:</strong> ${escapeHtml(notes || "Thank you for choosing MyReport POS.")}</div>
          <div class="footer">Generated by MyReport POS</div>
        </div>
      </div>
      <script>
        // Printing is triggered by the opener after the document fully loads.
      </script>
    </body>
  </html>`;

  const win = window.open("", "_blank");
  if (!win) {
    throw new Error("Print popup was blocked. Please allow popups for this site and try again.");
  }
  win.document.open();
  win.document.write(html);
  win.document.close();

  let printed = false;
  const triggerPrint = () => {
    if (printed) return;
    printed = true;
    try {
      win.focus();
      win.print();
      win.onafterprint = () => win.close();
    } catch {
      printed = false;
    }
  };

  // Ensure content is rendered before printing (prevents "blank print" in some browsers).
  win.addEventListener("load", () => {
    setTimeout(triggerPrint, 250);
  });
  setTimeout(triggerPrint, 900);
}
