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

  const baseButton =
    "inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold shadow-xl transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <div className={["flex w-full flex-wrap items-center justify-end gap-3", className].filter(Boolean).join(" ")}>
      <button
        type="button"
        onClick={onRefresh}
        className={[
          baseButton,
          "bg-black/40 text-white/85 backdrop-blur-md ring-1 ring-white/10 hover:bg-black/55",
        ].join(" ")}
      >
        <RefreshCw size={16} className={exporting === "refresh" ? "animate-spin" : ""} />
        Refresh
      </button>

      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          disabled={downloadDisabled}
          className={[
            baseButton,
            "bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-600 text-white shadow-indigo-500/25 hover:brightness-105 hover:shadow-2xl hover:shadow-indigo-500/30",
          ].join(" ")}
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
              className="absolute right-0 z-30 mt-3 w-56 overflow-hidden rounded-xl border border-white/10 bg-black/40 shadow-xl backdrop-blur-md"
            >
              <button
                type="button"
                onClick={async () => {
                  setOpen(false);
                  await onExportPdf?.();
                }}
                disabled={exporting !== null}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-white/85 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FileText size={16} className="text-white/75" />
                Export PDF
              </button>
              <div className="h-px bg-white/10" />
              <button
                type="button"
                onClick={async () => {
                  setOpen(false);
                  await onExportExcel?.();
                }}
                disabled={exporting !== null}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-white/85 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FileSpreadsheet size={16} className="text-white/75" />
                Export Excel
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
