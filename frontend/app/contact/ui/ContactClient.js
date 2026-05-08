"use client";

import { motion } from "framer-motion";
import { Mail, MapPin, Phone } from "lucide-react";
import { startTransition, useMemo, useState } from "react";
import { toast } from "sonner";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

function InfoCard({ icon: Icon, title, value, hint }) {
  return (
    <motion.div
      variants={item}
      className="group rounded-2xl bg-[var(--surface-soft)] p-5 shadow-md ring-1 ring-[var(--stroke)] backdrop-blur-md transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="flex items-start gap-4">
        <div className="rounded-xl bg-gradient-to-br from-cyan-400/20 to-indigo-400/20 p-3 ring-1 ring-[var(--stroke)]">
          <Icon className="h-5 w-5 text-[var(--foreground)]" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--foreground)]">{title}</p>
          <p className="mt-1 whitespace-pre-line break-words text-sm text-[var(--muted-strong)]">{value}</p>
          {hint ? <p className="mt-1 text-xs text-[var(--muted)]">{hint}</p> : null}
        </div>
      </div>
    </motion.div>
  );
}

export default function ContactClient() {
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    subject: "",
    message: "",
  });

  const errors = useMemo(() => {
    const nextErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.fullName.trim()) {
      nextErrors.fullName = "Full Name is required.";
    }

    if (!form.email.trim()) {
      nextErrors.email = "Email Address is required.";
    } else if (!emailRegex.test(form.email.trim())) {
      nextErrors.email = "Email Address is invalid.";
    }

    if (!form.subject.trim()) {
      nextErrors.subject = "Subject is required.";
    }

    if (!form.message.trim()) {
      nextErrors.message = "Message is required.";
    }

    return nextErrors;
  }, [form.email, form.fullName, form.message, form.subject]);

  const isValid = Object.keys(errors).length === 0;

  const inputBase =
    "mt-2 w-full rounded-xl border bg-white/80 px-4 py-3 text-sm shadow-sm outline-none transition-all duration-300 focus:ring-2 dark:bg-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400";

  const fieldStatus = (key) => {
    if (!touched) return "idle";
    if (errors[key]) return "error";
    if (String(form[key] ?? "").trim()) return "success";
    return "idle";
  };

  const fieldClassName = (key) => {
    const status = fieldStatus(key);
    if (status === "error") {
      return `${inputBase} border-red-400 focus:border-red-400 focus:ring-red-300 dark:border-red-500/70 dark:focus:ring-red-400/30`;
    }
    if (status === "success") {
      return `${inputBase} border-green-300 focus:border-green-300 focus:ring-cyan-300 dark:border-green-500/70 dark:focus:ring-cyan-400/30`;
    }
    return `${inputBase} border-slate-200 focus:border-indigo-300 focus:ring-cyan-300 dark:border-slate-700 dark:focus:border-slate-600 dark:focus:ring-cyan-400/30`;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setTouched(true);
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setTouched(true);

    if (!isValid || loading) {
      return;
    }

    setLoading(true);

    startTransition(async () => {
      try {
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        });

        if (!response.ok) {
          throw new Error("Failed to Send Message");
        }

        setForm({ fullName: "", email: "", subject: "", message: "" });
        setTouched(false);
        toast.success("Message Sent Successfully");
      } catch (error) {
        toast.error(error?.message || "Failed to Send Message");
      } finally {
        setLoading(false);
      }
    });
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-200 via-purple-200 to-blue-200 transition-colors duration-300 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-900">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-cyan-300/50 blur-3xl dark:bg-cyan-500/20" />
        <div className="absolute -right-28 top-10 h-80 w-80 rounded-full bg-indigo-300/50 blur-3xl dark:bg-indigo-500/20" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 -translate-x-1/2 rounded-full bg-fuchsia-300/40 blur-3xl dark:bg-fuchsia-500/15" />
      </div>

      <motion.div
        initial="hidden"
        animate="show"
        variants={container}
        className="relative mx-auto w-full max-w-6xl px-6 py-12 sm:py-14"
      >
        <motion.div variants={item} className="text-center">
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl">
            Get in{" "}
            <span className="bg-gradient-to-r from-cyan-500 to-indigo-600 bg-clip-text text-transparent">
              Touch
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-7 text-[var(--muted)]">
            Reach out for demos, onboarding help, pricing, or enterprise support.
          </p>
        </motion.div>

        <motion.div variants={item} className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <InfoCard icon={Mail} title="Email" value="info@veaglespace.com" hint="Available 24/7" />
            <InfoCard icon={Phone} title="Call Support" value="+91 8237999101" hint="Mon-Sat, 10am - 7pm" />
            <InfoCard
              icon={MapPin}
              title="Visit Office"
              value={`Kudale Patil Tower, Office No. 207,\n2nd Floor, Jadhav Nagar,\nNear Shiv Temple,\nVadgaon Budruk,\nPune, Maharashtra 411041,\nIndia`}
            />
          </div>

          <motion.div
            variants={item}
            className="rounded-2xl bg-[var(--surface-soft)] p-6 shadow-md ring-1 ring-[var(--stroke)] backdrop-blur-md transition-colors duration-300"
          >
            <form className="grid grid-cols-1 gap-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-[var(--foreground)]">Full Name</label>
                  <input
                    className={fieldClassName("fullName")}
                    placeholder="Your name"
                    autoComplete="name"
                    name="fullName"
                    type="text"
                    value={form.fullName}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[var(--foreground)]">Email Address</label>
                  <input
                    className={fieldClassName("email")}
                    placeholder="you@company.com"
                    autoComplete="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-[var(--foreground)]">Subject</label>
                <input
                  className={fieldClassName("subject")}
                  placeholder="How can we help?"
                  name="subject"
                  type="text"
                  value={form.subject}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[var(--foreground)]">Message</label>
                <textarea
                  className={`${fieldClassName("message")} min-h-36 resize-none`}
                  placeholder="Tell us a bit about what you need..."
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                />
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="group inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-400 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:brightness-105 hover:shadow-lg hover:shadow-indigo-500/25 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <span className="transition group-hover:-translate-y-0.5">{loading ? "Sending..." : "Send Message"}</span>
                </button>
                <p className="mt-3 text-center text-xs text-[var(--muted)]">
                  By sending this, you agree to be contacted about your request.
                </p>
              </div>
            </form>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

