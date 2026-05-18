"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export function Modal({ open, title, description, onClose, children }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="modal modal-open fixed inset-0 z-50 overflow-y-auto bg-neutral/45 px-4 py-6 backdrop-blur-xl sm:px-6 sm:py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.24 }}
            className="modal-box glass-panel frost-line mx-auto w-full max-w-2xl overflow-hidden border border-base-300 bg-base-100/95 p-0 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-base-300/70 px-5 py-4 sm:px-6">
              <div>
                <h3 className="text-xl font-bold tracking-tight text-base-content">{title}</h3>
                {description ? <p className="mt-1 text-sm text-base-content/60">{description}</p> : null}
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-circle btn-sm shrink-0"
                onClick={onClose}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>
            <div className="max-h-[calc(100vh-12rem)] overflow-y-auto px-5 py-5 pr-4 sm:px-6">
              {children}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
