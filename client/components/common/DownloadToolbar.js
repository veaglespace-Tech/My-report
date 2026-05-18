"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Download, FileSpreadsheet, FileText, RefreshCw } from "lucide-react";

export function DownloadToolbar({
  onRefresh,
  onExportPdf,
  onExportExcel,
  exporting = null,
  className = "",
  downloadDisabled = false,
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function onDocumentClick(event) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocumentClick);
    return () => document.removeEventListener("mousedown", onDocumentClick);
  }, []);

  return (
    <div className={["flex w-full flex-wrap items-center justify-end gap-3", className].filter(Boolean).join(" ")}>
      <button
        type="button"
        onClick={onRefresh}
        disabled={exporting !== null}
        className="btn btn-outline btn-neutral gap-2 shadow-sm"
      >
        <RefreshCw size={16} className={exporting === "refresh" ? "animate-spin" : ""} />
        {exporting === "refresh" ? "Refreshing..." : "Refresh"}
      </button>

      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          disabled={downloadDisabled}
          className="btn btn-primary gap-2 shadow-lg shadow-primary/20"
        >
          <Download size={16} />
          Download
          <ChevronDown size={16} className={["transition", open ? "rotate-180" : ""].join(" ")} />
        </button>

        <AnimatePresence>
          {open ? (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.16 }}
              className="menu absolute right-0 z-30 mt-3 w-56 overflow-hidden rounded-box border border-base-300 bg-base-100 p-2 shadow-xl"
            >
              <button
                type="button"
                onClick={async () => {
                  setOpen(false);
                  await onExportPdf?.();
                }}
                disabled={exporting !== null}
                className="flex w-full items-center gap-3 rounded-field px-3 py-3 text-left text-sm font-semibold text-base-content transition hover:bg-base-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FileText size={16} className="text-primary" />
                Export PDF
              </button>
              <div className="my-1 h-px bg-base-300" />
              <button
                type="button"
                onClick={async () => {
                  setOpen(false);
                  await onExportExcel?.();
                }}
                disabled={exporting !== null}
                className="flex w-full items-center gap-3 rounded-field px-3 py-3 text-left text-sm font-semibold text-base-content transition hover:bg-base-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FileSpreadsheet size={16} className="text-success" />
                Export Excel
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
