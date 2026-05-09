"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Send, X } from "lucide-react";
import clsx from "clsx";
import { usePathname } from "next/navigation";

const QUICK_QUESTIONS = [
  "What features does MyReport offer?",
  "How do I generate bills?",
  "How can I export reports?",
  "How do I manage customers?",
  "What pricing plans are available?",
  "How do I contact support?",
  "How do I setup my store?",
  "Does MyReport support GST billing?",
];

const WELCOME_MESSAGE =
  "Hi! I'm the MyReport Assistant 👋\n\nI can help you with:\n• Billing setup\n• Reports & exports\n• Customer management\n• Inventory tracking\n• Pricing plans\n• Registration support\n• Store onboarding\n• PDF & Excel exports\n\nAsk me anything about MyReport Store OS.";

function formatTime(isoString) {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function shouldHideOnPath(pathname) {
  if (!pathname) return false;
  return pathname.startsWith("/admin") || pathname.startsWith("/superadmin");
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-1">
      <span className="h-2 w-2 animate-bounce rounded-full bg-white/70 [animation-delay:-0.2s]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-white/70 [animation-delay:-0.1s]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-white/70" />
    </div>
  );
}

export function FloatingChatbot() {
  const pathname = usePathname();
  const hidden = shouldHideOnPath(pathname);

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState(() => [
    {
      id: "welcome",
      role: "assistant",
      content: WELCOME_MESSAGE,
      timestamp: new Date().toISOString(),
    },
  ]);

  const listRef = useRef(null);
  const inputRef = useRef(null);

  const apiMessages = useMemo(
    () =>
      messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content })),
    [messages]
  );

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [open, messages.length, sending]);

  async function sendMessageWithText(textInput) {
    const text = String(textInput ?? "").trim();
    if (!text || sending) return;

    const userMsg = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...apiMessages, { role: "user", content: text }] }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Request failed");

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data?.message || "Sorry — I couldn't generate a response.",
          timestamp: data?.timestamp || new Date().toISOString(),
        },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "I'm having trouble reaching the AI service right now. Please try again in a moment.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  function sendMessage() {
    return sendMessageWithText(input);
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  if (hidden) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <AnimatePresence>
        {open ? (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
            className="w-[92vw] max-w-sm overflow-hidden rounded-[20px] border border-white/15 bg-white/10 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-black/30"
          >
            <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-gradient-to-r from-indigo-500/20 via-fuchsia-500/15 to-cyan-500/15 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/10">
                  <Bot className="h-5 w-5 text-white/90" />
                </span>
                <div className="leading-tight">
                  <div className="text-sm font-semibold text-white/95">MyReport Assistant</div>
                  <div className="text-xs text-white/70">Ask anything about your store workspace</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-white/80 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white"
                aria-label="Close chat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div ref={listRef} className="max-h-[55vh] space-y-3 overflow-y-auto px-4 py-4 [scrollbar-width:thin]">
              {messages.length <= 1 && !sending ? (
                <div className="grid gap-2">
                  <div className="text-xs font-medium uppercase tracking-[0.24em] text-white/60">Quick questions</div>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => sendMessageWithText(q)}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {messages.map((m) => (
                <div key={m.id} className={clsx("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                  <div
                    className={clsx(
                      "max-w-[85%] rounded-[18px] px-4 py-4 text-[15px] font-medium leading-[1.6] ring-1",
                      m.role === "user"
                        ? "bg-gradient-to-br from-indigo-600/80 to-fuchsia-600/70 text-white ring-white/10"
                        : "bg-[rgba(255,255,255,0.92)] text-[rgba(15,23,42,0.92)] shadow-[0_8px_24px_rgba(0,0,0,0.08)] ring-black/10 backdrop-blur-[12px] dark:bg-white/10 dark:text-white/90 dark:ring-white/10 dark:shadow-none"
                    )}
                  >
                    <div className="whitespace-pre-wrap break-words">{m.content}</div>
                    <div className="mt-2 text-[12px] text-[rgba(100,116,139,0.8)] dark:text-white/60">
                      {formatTime(m.timestamp)}
                    </div>
                  </div>
                </div>
              ))}

              {sending ? (
                <div className="flex justify-start">
                  <div className="rounded-xl bg-white/10 px-3.5 py-2 text-sm text-white/80 ring-1 ring-white/10">
                    <TypingDots />
                  </div>
                </div>
              ) : null}
            </div>

            <div className="border-t border-white/10 p-3">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  rows={1}
                  placeholder="Ask a question…"
                  className="min-h-[44px] max-h-28 flex-1 resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 outline-none placeholder:text-white/50 focus:border-white/20 focus:ring-2 focus:ring-indigo-500/40 dark:bg-white/5"
                />
                <button
                  type="button"
                  onClick={sendMessage}
                  disabled={sending || input.trim().length === 0}
                  className={clsx(
                    "inline-flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-sm ring-1 transition",
                    sending || input.trim().length === 0
                      ? "cursor-not-allowed bg-white/5 ring-white/10"
                      : "bg-gradient-to-br from-indigo-600/80 to-fuchsia-600/70 ring-white/10 hover:from-indigo-500/80 hover:to-fuchsia-500/70"
                  )}
                  aria-label="Send message"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-2 text-xs text-white/55">● Online · Don’t share passwords or sensitive data.</div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        whileTap={{ scale: 0.98 }}
        className="group mt-3 inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white shadow-xl ring-1 ring-white/10 transition hover:from-indigo-500 hover:to-fuchsia-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/30"
        aria-label={open ? "Close chat" : "Open chat"}
        suppressHydrationWarning={true}
      >
        <Bot className="h-6 w-6 transition group-hover:scale-105" />
      </motion.button>
    </div>
  );
}
