"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Footprints, Gem, Glasses, Send, Shirt, ShoppingBag, Sparkles, Store, Watch, X } from "lucide-react";
import clsx from "clsx";
import { usePathname } from "next/navigation";

const QUICK_QUESTIONS = [
  {
    label: "Features",
    prompt: "What features does MyReport offer?",
    icon: Sparkles,
    tone: "from-cyan-300/25 via-blue-400/15 to-indigo-400/20 text-cyan-50 shadow-cyan-500/10",
  },
  {
    label: "Generate bills",
    prompt: "How do I generate bills?",
    icon: ShoppingBag,
    tone: "from-emerald-300/25 via-cyan-400/15 to-blue-400/20 text-emerald-50 shadow-emerald-500/10",
  },
  {
    label: "Export reports",
    prompt: "How can I export reports?",
    icon: Store,
    tone: "from-violet-300/25 via-indigo-400/15 to-cyan-400/20 text-violet-50 shadow-violet-500/10",
  },
  {
    label: "Customers",
    prompt: "How do I manage customers?",
    icon: Store,
    tone: "from-sky-300/25 via-cyan-400/15 to-teal-400/20 text-sky-50 shadow-sky-500/10",
  },
  {
    label: "Pricing",
    prompt: "What pricing plans are available?",
    icon: Watch,
    tone: "from-amber-300/25 via-orange-400/15 to-rose-400/20 text-amber-50 shadow-amber-500/10",
  },
  {
    label: "Setup store",
    prompt: "How do I setup my store?",
    icon: Store,
    tone: "from-teal-300/25 via-cyan-400/15 to-indigo-400/20 text-teal-50 shadow-teal-500/10",
  },
  {
    label: "GST billing",
    prompt: "Does MyReport support GST billing?",
    icon: ShoppingBag,
    tone: "from-lime-300/25 via-emerald-400/15 to-cyan-400/20 text-lime-50 shadow-lime-500/10",
  },
  {
    label: "Grocery stock",
    prompt: "How can I track grocery stock and expiry?",
    icon: ShoppingBag,
    tone: "from-green-300/25 via-emerald-400/15 to-teal-400/20 text-green-50 shadow-green-500/10",
  },
  {
    label: "Clothing sizes",
    prompt: "How do I manage clothing sizes, colors, and variants?",
    icon: Shirt,
    tone: "from-pink-300/25 via-fuchsia-400/15 to-violet-400/20 text-pink-50 shadow-pink-500/10",
  },
  {
    label: "Shoe store",
    prompt: "How do I manage shoe sizes, stock, and returns?",
    icon: Footprints,
    tone: "from-orange-300/25 via-amber-400/15 to-yellow-400/20 text-orange-50 shadow-orange-500/10",
  },
  {
    label: "Electronics",
    prompt: "Can I track electronics inventory, warranties, and invoices?",
    icon: Glasses,
    tone: "from-blue-300/25 via-indigo-400/15 to-purple-400/20 text-blue-50 shadow-blue-500/10",
  },
  {
    label: "Beauty offers",
    prompt: "How can beauty stores manage bundles and repeat purchases?",
    icon: Gem,
    tone: "from-rose-300/25 via-pink-400/15 to-fuchsia-400/20 text-rose-50 shadow-rose-500/10",
  },
  {
    label: "Support",
    prompt: "How do I contact support?",
    icon: Bot,
    tone: "from-slate-200/20 via-cyan-400/15 to-indigo-400/20 text-white shadow-cyan-500/10",
  },
];

const WELCOME_MESSAGE =
  "Hi! I'm the MyReport Assistant.\n\nI can help with billing, GST invoices, reports, customers, stock, pricing, and store setup for grocery, clothing, shoes, electronics, beauty, and accessories.\n\nPick a quick question below or ask anything about MyReport.";

function formatTime(isoString) {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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

function QuickQuestionChips({ disabled, onSelect }) {
  return (
    <div className="grid gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-3 shadow-lg shadow-black/10">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100/75">
        <Sparkles className="h-3.5 w-3.5 text-cyan-200" />
        Ask by store interest
      </div>
      <div className="-mx-1 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]">
        <div className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
          {QUICK_QUESTIONS.map((question) => (
            <QuickQuestionButton key={question.prompt} disabled={disabled} question={question} onSelect={onSelect} />
          ))}
        </div>
      </div>
    </div>
  );
}

function QuickQuestionButton({ disabled, question, onSelect }) {
  const Icon = question.icon;

  return (
    <button
      type="button"
      onClick={() => onSelect(question.prompt)}
      disabled={disabled}
      className={clsx(
        "group inline-flex min-h-9 items-center gap-2 rounded-full border border-white/12 bg-gradient-to-r px-3 py-2 text-left text-xs font-semibold shadow-md backdrop-blur transition",
        question.tone,
        disabled ? "cursor-not-allowed opacity-55" : "hover:-translate-y-0.5 hover:border-white/25 hover:brightness-110 hover:shadow-lg"
      )}
    >
      <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/15 transition group-hover:bg-white/20">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span className="whitespace-nowrap">{question.label}</span>
    </button>
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
        .filter((message) => message.id !== "welcome")
        .map((message) => ({ role: message.role, content: message.content })),
    [messages]
  );

  const latestAssistantMessageId = useMemo(() => {
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      if (messages[index]?.role === "assistant") return messages[index].id;
    }
    return null;
  }, [messages]);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const listElement = listRef.current;
    if (!listElement) return;
    listElement.scrollTo({ top: listElement.scrollHeight, behavior: "smooth" });
  }, [open, messages.length, sending]);

  async function sendMessageWithText(textInput) {
    const text = String(textInput ?? "").trim();
    if (!text || sending) return;

    const userMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((previousMessages) => [...previousMessages, userMessage]);
    setInput("");
    setSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...apiMessages, { role: "user", content: text }] }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Request failed");

      setMessages((previousMessages) => [
        ...previousMessages,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data?.message || "Sorry, I couldn't generate a response.",
          timestamp: data?.timestamp || new Date().toISOString(),
        },
      ]);
    } catch {
      setMessages((previousMessages) => [
        ...previousMessages,
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

  function sendFeatureQuestion(prompt) {
    sendMessageWithText(prompt);
  }

  function onKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
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
            className="w-[92vw] max-w-md overflow-hidden rounded-[24px] border border-white/15 bg-gradient-to-br from-slate-950/78 via-indigo-950/70 to-cyan-950/62 shadow-2xl shadow-indigo-950/35 backdrop-blur-2xl dark:border-white/10"
          >
            <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-gradient-to-r from-cyan-400/18 via-indigo-400/18 to-fuchsia-400/16 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300/30 to-indigo-300/25 ring-1 ring-white/15">
                  <Bot className="h-5 w-5 text-white/90" />
                </span>
                <div className="leading-tight">
                  <div className="text-sm font-semibold text-white/95">MyReport Assistant</div>
                  <div className="text-xs text-cyan-100/75">Billing, GST, reports, stock and store setup</div>
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

            <div ref={listRef} className="max-h-[58vh] space-y-3 overflow-y-auto px-4 py-4 [scrollbar-width:thin]">
              {messages.map((message) => (
                <div key={message.id} className="space-y-3">
                  <div className={clsx("flex", message.role === "user" ? "justify-end" : "justify-start")}>
                    <div
                      className={clsx(
                        "max-w-[85%] rounded-[18px] px-4 py-4 text-[15px] font-medium leading-[1.6] ring-1",
                        message.role === "user"
                          ? "bg-gradient-to-br from-cyan-500/80 via-indigo-500/75 to-fuchsia-500/70 text-white ring-white/10"
                          : "bg-[rgba(255,255,255,0.94)] text-[rgba(15,23,42,0.92)] shadow-[0_8px_24px_rgba(0,0,0,0.08)] ring-black/10 backdrop-blur-[12px] dark:bg-white/12 dark:text-white/90 dark:ring-white/10 dark:shadow-none"
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="whitespace-pre-wrap break-words">{message.content}</div>
                        <div className="shrink-0 pt-0.5 text-right text-[11px] font-medium tracking-[0.08em] text-[rgba(148,163,184,0.88)] dark:text-white/55">
                          {formatTime(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {message.id === latestAssistantMessageId ? (
                    <div className="flex items-end justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <QuickQuestionChips disabled={sending} onSelect={sendFeatureQuestion} />
                      </div>
                      <div className="shrink-0 pb-1 text-right text-[11px] font-medium tracking-[0.08em] text-white/45">
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  ) : null}
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

            <div className="border-t border-white/10 bg-white/[0.03] p-3">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={onKeyDown}
                  rows={1}
                  placeholder="Ask about billing, GST, stock, reports..."
                  className="min-h-[44px] max-h-28 flex-1 resize-none rounded-xl border border-white/10 bg-white/8 px-3 py-2 text-sm text-white/95 outline-none placeholder:text-white/80 focus:border-cyan-200/35 focus:ring-2 focus:ring-cyan-400/30 dark:bg-white/5"
                />
                <button
                  type="button"
                  onClick={sendMessage}
                  disabled={sending || input.trim().length === 0}
                  className={clsx(
                    "inline-flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-sm ring-1 transition",
                    sending || input.trim().length === 0
                      ? "cursor-not-allowed bg-white/5 ring-white/10"
                      : "bg-gradient-to-br from-cyan-500/85 via-indigo-500/80 to-fuchsia-500/75 ring-white/10 hover:brightness-110"
                  )}
                  aria-label="Send message"
                >
                  <Send className="h-5 w-5 rotate-45 transform" />
                </button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setOpen((value) => !value)}
        whileTap={{ scale: 0.98 }}
        className="group mt-3 inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 via-indigo-600 to-fuchsia-600 text-white shadow-xl shadow-indigo-950/30 ring-1 ring-white/10 transition hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-cyan-500/30"
        aria-label={open ? "Close chat" : "Open chat"}
        suppressHydrationWarning={true}
      >
        <Bot className="h-6 w-6 transition group-hover:scale-105" />
      </motion.button>
    </div>
  );
}
