"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export function Modal({ open, title, description, onClose, children }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/55 px-4 py-6 backdrop-blur-xl sm:px-6 sm:py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.24 }}
            className="glass-panel frost-line mx-auto w-full max-w-2xl overflow-hidden rounded-[32px] p-5 sm:p-6"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
                {description ? <p className="mt-1 text-sm text-white/55">{description}</p> : null}
              </div>
              <button
                type="button"
                className="rounded-full border border-white/10 bg-white/6 p-2 text-white/70 transition hover:bg-white/10"
                onClick={onClose}
              >
                <X size={18} />
              </button>
            </div>
            <div className="max-h-[calc(100vh-12rem)] overflow-y-auto pr-1">
              {children}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
