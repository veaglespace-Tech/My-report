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

function InfoCard({ icon: Icon, title, value, hint, href }) {
  const Wrapper = href ? motion.a : motion.div;
  const wrapperProps = href
    ? {
        href,
        target: "_blank",
        rel: "noreferrer",
      }
    : {};

  return (
    <Wrapper
      variants={item}
      className={[
        "group w-full rounded-3xl border border-white/35 bg-white/55 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.10)] backdrop-blur-xl",
        "transition hover:-translate-y-0.5 hover:bg-white/65 hover:shadow-[0_24px_70px_rgba(15,23,42,0.14)]",
        "dark:border-white/10 dark:bg-slate-900/40 dark:hover:bg-slate-900/50",
        href ? "cursor-pointer" : "",
      ].join(" ")}
      {...wrapperProps}
    >
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/18 via-indigo-400/14 to-fuchsia-400/12 ring-1 ring-white/35 dark:ring-white/10">
          <Icon className="h-5 w-5 text-slate-900/90 dark:text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">{title}</p>
          <p className="mt-1 whitespace-pre-line break-words text-sm leading-6 text-slate-600 dark:text-white/70">
            {value}
          </p>
          {hint ? (
            <div className="mt-3">
              <span
                className={[
                  "inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-indigo-700",
                  "ring-1 ring-indigo-500/20 transition group-hover:bg-white/85 group-hover:ring-indigo-500/30",
                  "dark:bg-white/5 dark:text-cyan-200 dark:ring-white/15 dark:group-hover:bg-white/8",
                ].join(" ")}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-500/80" />
                {hint}
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </Wrapper>
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
      if (errors.fullName) toast.error("Please enter your name");
      else if (errors.email) toast.error("Invalid email address");
      else if (errors.subject) toast.error("Please enter a subject");
      else if (errors.message) toast.error("Message cannot be empty");
      return;
    }

    setLoading(true);

    startTransition(async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const response = await fetch("/api/contact", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        let body = null;
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          body = await response.json().catch(() => null);
        } else {
          body = await response.text().catch(() => "");
        }

        if (!response.ok || body?.success === false) {
          const message =
            typeof body === "object" && body
              ? body.message || "Failed to send message. Please try again."
              : "Failed to send message. Please try again.";
          throw new Error(message);
        }

        setForm({ fullName: "", email: "", subject: "", message: "" });
        setTouched(false);
        toast.success("Message sent successfully");
      } catch (error) {
        const isTimeout = error?.name === "AbortError";
        toast.error(isTimeout ? "Failed to send message. Please try again." : error?.message || "Failed to send message. Please try again.");
      } finally {
        setLoading(false);
      }
    });
  };

  const googleMapsUrl =
    "https://www.google.com/maps?rlz=1C1RXQR_enIN1141IN1141&biw=1536&bih=730&sca_esv=9700858d11d87a5f&output=search&q=veagle+space+technology,+office+no+207,+kudale+patil+chambers,+heritage,+near+bhairavnath+temple,+jadhav+nagar,+vadgaon+budruk,+pune,+maharashtra+411041&source=lnms&fbs=ADc_l-aN0CWEZBOHjofHoaMMDiKpUrv6YeyJhXfuYqj4Fj6c1U4Z6Yq0xAU8tFlmuJvKXCt2iug6axOV8fORMUDyzql5eftAvM01BCoXXxgyfHuMr6x2ZscPm0fwdyB5VxFc3qiGVCUKfBqOpiOih0-PzFDfuCOWG9-0wSFGakunBowexz4XsLuKcEFLp9zgDBYYBuIaky9uPZZCJfPP0TVu3_LchT-3QA&entry=mc&ved=1t:200715&ictx=111";

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

        <motion.div variants={item} className="mt-10 grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
          <div className="grid grid-cols-1 gap-4">
            <InfoCard icon={Mail} title="Email" value="info@veaglespace.com" hint="Available 24/7" />
            <InfoCard icon={Phone} title="Call Support" value="+91 8237999101" hint="Mon-Sat, 10am - 7pm" />
            <InfoCard
              icon={MapPin}
              title="Visit Office"
              value={`Kudale Patil Tower, Office No. 207,\n2nd Floor, Jadhav Nagar,\nNear Shiv Temple,\nVadgaon Budruk,\nPune, Maharashtra 411041,\nIndia`}
              hint="Open in Google Maps"
              href={googleMapsUrl}
            />
          </div>

          <motion.div
            variants={item}
            className="w-full overflow-hidden rounded-3xl border border-white/35 bg-white/55 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.10)] backdrop-blur-xl transition-colors duration-300 dark:border-white/10 dark:bg-slate-900/40"
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
                  {touched && errors.fullName ? (
                    <p className="mt-2 text-xs font-medium text-red-600/90">{errors.fullName}</p>
                  ) : null}
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
                  {touched && errors.email ? (
                    <p className="mt-2 text-xs font-medium text-red-600/90">{errors.email}</p>
                  ) : null}
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
                {touched && errors.subject ? (
                  <p className="mt-2 text-xs font-medium text-red-600/90">{errors.subject}</p>
                ) : null}
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
                {touched && errors.message ? (
                  <p className="mt-2 text-xs font-medium text-red-600/90">{errors.message}</p>
                ) : null}
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="group inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-400 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:brightness-105 hover:shadow-lg hover:shadow-indigo-500/25 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-white" />
                      <span>Sending...</span>
                    </span>
                  ) : (
                    <span className="transition group-hover:-translate-y-0.5">Send Message</span>
                  )}
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
