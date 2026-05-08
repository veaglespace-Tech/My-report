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
          <td class="num">${escapeHtml(quantity)}</td>
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
        body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; margin: 0; padding: 24px; color: #0b1220; background: #ffffff; }
        .wrap { max-width: 860px; margin: 0 auto; }
        .header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding-bottom: 16px; border-bottom: 1px solid #e6e9f2; }
        .brand { font-weight: 800; letter-spacing: -0.02em; font-size: 18px; }
        .meta { text-align: right; font-size: 12px; color: #42526b; }
        .meta strong { color: #0b1220; }
        .block { padding: 18px 0; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 18px; }
        .card { border: 1px solid #e6e9f2; border-radius: 14px; padding: 14px 14px; background: #fbfcff; }
        .label { font-size: 11px; text-transform: uppercase; letter-spacing: .16em; color: #6b7a90; }
        .value { margin-top: 8px; font-size: 14px; font-weight: 700; color: #0b1220; }
        table { width: 100%; border-collapse: collapse; border: 1px solid #e6e9f2; border-radius: 14px; overflow: hidden; }
        thead th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: .14em; color: #5b6b82; background: #f5f7ff; padding: 12px 14px; border-bottom: 1px solid #e6e9f2; }
        tbody td { padding: 12px 14px; border-bottom: 1px solid #eef1f8; font-size: 13px; }
        tbody tr:last-child td { border-bottom: none; }
        .num { text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; }
        .totals { margin-top: 14px; display: grid; grid-template-columns: 1fr; gap: 10px; }
        .total-row { display: flex; justify-content: space-between; gap: 14px; font-size: 13px; color: #2a3850; }
        .total-row strong { color: #0b1220; }
        .grand { margin-top: 6px; padding-top: 12px; border-top: 1px dashed #d7dced; font-size: 16px; font-weight: 800; color: #0b1220; }
        .notes { margin-top: 14px; font-size: 12px; color: #42526b; line-height: 1.6; }
        @media print { body { padding: 0; } .wrap { max-width: none; padding: 18px; } }
      </style>
    </head>
    <body>
      <div class="wrap">
        <div class="header">
          <div>
            <div class="brand">${escapeHtml(storeName || "MyReport")}</div>
            <div style="margin-top:6px;font-size:12px;color:#42526b">Generated invoice</div>
          </div>
          <div class="meta">
            <div><strong>${escapeHtml(invoiceNumber || "DRAFT")}</strong></div>
            <div style="margin-top:6px">${escapeHtml(formatDate(now.toISOString()))}</div>
          </div>
        </div>

        <div class="block grid">
          <div class="card">
            <div class="label">Customer</div>
            <div class="value">${escapeHtml(customerName || "-")}</div>
          </div>
          <div class="card">
            <div class="label">GST / Discount</div>
            <div class="value">${escapeHtml(Number(gstPercentage ?? 0))}% / ${escapeHtml(formatCurrency(discountAmount || 0))}</div>
          </div>
        </div>

        <div class="block">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th class="num">Quantity</th>
                <th class="num">Price</th>
                <th class="num">Total</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml || `<tr><td colspan="4" style="padding:16px 14px;color:#5b6b82">No items</td></tr>`}
            </tbody>
          </table>

          <div class="totals">
            <div class="total-row"><span>Subtotal</span><strong>${escapeHtml(formatCurrency(subtotal || 0))}</strong></div>
            <div class="total-row"><span>GST</span><strong>${escapeHtml(formatCurrency(taxAmount || 0))}</strong></div>
            <div class="total-row"><span>Discount</span><strong>${escapeHtml(formatCurrency(discountAmount || 0))}</strong></div>
            <div class="total-row grand"><span>Total Amount</span><span>${escapeHtml(formatCurrency(totalAmount || 0))}</span></div>
          </div>

          ${notes ? `<div class="notes"><strong>Notes:</strong> ${escapeHtml(notes)}</div>` : ""}
        </div>
      </div>
      <script>
        // Printing is triggered by the opener after the document fully loads.
      </script>
    </body>
  </html>`;

  const win = window.open("", "_blank", "noopener,noreferrer");
  if (!win) return;
  win.document.open();
  win.document.write(html);
  win.document.close();

  const triggerPrint = () => {
    try {
      win.focus();
      win.print();
      win.onafterprint = () => win.close();
    } catch {
      // ignore
    }
  };

  // Ensure content is rendered before printing (prevents "blank print" in some browsers).
  win.addEventListener("load", () => {
    setTimeout(triggerPrint, 250);
  });
  setTimeout(triggerPrint, 900);
}
