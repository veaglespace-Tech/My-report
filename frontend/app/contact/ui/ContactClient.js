"use client";

import { motion } from "framer-motion";
import { ExternalLink, Mail, MapPin, Phone } from "lucide-react";
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

const mapsUrl =
  "https://www.google.com/maps/place/Veagle+Space+Technology/@18.4664403,73.8212889,826m/data=!3m2!1e3!4b1!4m6!3m5!1s0x3bc2952f1a0d1e2b:0x20c7362429855a2f!8m2!3d18.4664403!4d73.8238638!16s%2Fg%2F11ytd2b7gw?entry=ttu";

const mapEmbedUrl =
  "https://www.google.com/maps?q=Veagle%20Space%20Technology%2C%20Kudale%20Patil%20Tower%2C%20Vadgaon%20Budruk%2C%20Pune&output=embed";

function ContactInfoItem({ icon: Icon, label, value }) {
  return (
    <div className="group flex items-start gap-4 rounded-3xl p-3 transition-all duration-300 hover:-translate-y-1 hover:bg-white/45 dark:hover:bg-white/5">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-br from-cyan-400/22 via-indigo-400/18 to-purple-400/18 ring-1 ring-white/45 transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-105 group-hover:shadow-[0_12px_24px_rgba(99,102,241,0.18)] dark:ring-white/10">
        <Icon className="h-5 w-5 text-slate-900/90 dark:text-white" />
      </div>
      <div className="min-w-0 pt-1">
        <div className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-700/75 dark:text-cyan-200/80">{label}</div>
        <div className="mt-2 whitespace-pre-line break-words text-base font-semibold leading-6 text-slate-900 dark:text-white">{value}</div>
      </div>
    </div>
  );
}

function BusinessHourBox({ label, value }) {
  return (
    <div className="flex min-h-24 flex-1 flex-col justify-center rounded-[18px] border border-white/35 bg-white/35 px-5 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(99,102,241,0.15)] dark:border-white/15 dark:bg-white/8">
      <div className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-700/75 dark:text-cyan-200/80">{label}</div>
      <div className="mt-2 text-base font-bold leading-6 text-slate-900 dark:text-white">{value}</div>
    </div>
  );
}

export default function ContactClient() {
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const errors = useMemo(() => {
    const nextErrors = {};
    const emailRegex = /^(?!.*\.\.)[A-Za-z0-9._%+-]+@(?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,}$/;

    if (!form.fullName.trim()) {
      nextErrors.fullName = "Full Name is required.";
    }

    const email = form.email.trim().toLowerCase();

    if (!email) {
      nextErrors.email = "Email Address is required.";
    } else if (!emailRegex.test(email)) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!form.phone.trim()) {
      nextErrors.phone = "Phone Number is required.";
    } else if (!/^[0-9]{10,15}$/.test(form.phone.trim())) {
      nextErrors.phone = "Phone Number is invalid.";
    }

    if (!form.subject.trim()) {
      nextErrors.subject = "Subject is required.";
    }

    if (!form.message.trim()) {
      nextErrors.message = "Inquiry Message is required.";
    }

    return nextErrors;
  }, [form.email, form.fullName, form.message, form.phone, form.subject]);

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
    setForm((previous) => ({
      ...previous,
      [name]: name === "phone" ? value.replace(/\D/g, "").slice(0, 15) : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setTouched(true);

    if (!isValid || loading) {
      if (errors.fullName) toast.error("Please enter your name");
      else if (errors.email) toast.error("Invalid email address");
      else if (errors.phone) toast.error("Please enter valid phone number");
      else if (errors.subject) toast.error("Please enter a subject");
      else if (errors.message) toast.error("Please enter your inquiry message");
      return;
    }

    setLoading(true);

    startTransition(async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const response = await fetch("/api/enquiry/send", {
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

        setForm({ fullName: "", email: "", phone: "", subject: "", message: "" });
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

  return (
    <>
      <motion.div
        initial="hidden"
        animate="show"
        variants={container}
        className="w-full"
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

        <motion.div variants={item} className="mt-10 grid grid-cols-1 items-stretch gap-7 lg:grid-cols-2">
          <div className="flex h-full flex-col rounded-[28px] border border-white/40 bg-white/60 p-8 shadow-[0_22px_60px_rgba(99,102,241,0.12)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/70 hover:shadow-[0_28px_70px_rgba(34,211,238,0.16)] dark:border-white/10 dark:bg-slate-900/45 dark:hover:bg-slate-900/55">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.28em] text-indigo-600/80 dark:text-cyan-200/80">Contact</div>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">Direct Contact</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-white/65">
                Talk to the MyReport team for demos, onboarding, and account support.
              </p>
            </div>

            <div className="mt-7 grid flex-1 content-start gap-3">
              <ContactInfoItem icon={Mail} label="Email" value="info@veaglespace.com" />
              <ContactInfoItem icon={Phone} label="Phone" value="+91 8237999101" />
              <ContactInfoItem
                icon={MapPin}
                label="Office Location"
                value={`Kudale Patil Tower, Office No. 207\n2nd Floor, Jadhav Nagar\nVadgaon Budruk, Pune 411041`}
              />
              <div className="mt-3 border-t border-white/35 pt-6 dark:border-white/10">
                <h3 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">Business Hours</h3>
                <div className="mt-4 flex flex-col gap-4 sm:flex-row">
                  <BusinessHourBox label="Monday - Saturday" value="10:00 AM - 6:30 PM" />
                  <BusinessHourBox label="Sunday" value="Day Off" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex h-full flex-col overflow-hidden rounded-[28px] border border-white/40 bg-white/60 p-8 shadow-[0_22px_60px_rgba(99,102,241,0.12)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/70 hover:shadow-[0_28px_70px_rgba(34,211,238,0.16)] dark:border-white/10 dark:bg-slate-900/45">
            <div className="mb-6">
              <div className="text-xs font-bold uppercase tracking-[0.28em] text-indigo-600/80 dark:text-cyan-200/80">Inquiry</div>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">Send a Message</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-white/65">
                Share your details and we will route your request to the right team.
              </p>
            </div>

            <form className="flex flex-1 flex-col gap-4" onSubmit={handleSubmit}>
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
                <div>
                  <label className="text-sm font-medium text-[var(--foreground)]">Phone Number</label>
                  <input
                    className={fieldClassName("phone")}
                    placeholder="10 to 15 digit phone number"
                    autoComplete="tel"
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={form.phone}
                    onChange={handleChange}
                  />
                  {touched && errors.phone ? (
                    <p className="mt-2 text-xs font-medium text-red-600/90">{errors.phone}</p>
                  ) : null}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-[var(--foreground)]">Inquiry Subject</label>
                <input
                  className={fieldClassName("subject")}
                  placeholder="What do you need help with?"
                  name="subject"
                  type="text"
                  value={form.subject}
                  onChange={handleChange}
                />
                {touched && errors.subject ? (
                  <p className="mt-2 text-xs font-medium text-red-600/90">{errors.subject}</p>
                ) : null}
              </div>

              <div className="flex-1">
                <label className="text-sm font-medium text-[var(--foreground)]">Inquiry Message</label>
                <textarea
                  className={`${fieldClassName("message")} min-h-32 resize-none`}
                  placeholder="Share the details so SuperAdmin can review and solve it..."
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
                  className="group inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-400 to-violet-500 px-4 py-3.5 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(99,102,241,0.2)] transition-all duration-300 hover:-translate-y-1 hover:brightness-105 hover:shadow-[0_14px_28px_rgba(99,102,241,0.24)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-white" />
                      <span>Sending Inquiry...</span>
                    </span>
                  ) : (
                    <span className="transition group-hover:-translate-y-0.5">Send Inquiry</span>
                  )}
                </button>
                <p className="mt-3 text-center text-xs text-[var(--muted)]">
                  Your inquiry will appear in the SuperAdmin panel for review and follow-up.
                </p>
              </div>
            </form>
          </div>

          <div className="relative flex min-h-[430px] overflow-hidden rounded-[28px] border border-white/40 bg-white/60 p-4 shadow-[0_22px_60px_rgba(99,102,241,0.12)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(34,211,238,0.16)] dark:border-white/10 dark:bg-slate-900/45 lg:col-span-2">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute left-7 top-7 z-10 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-violet-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(99,102,241,0.22)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_28px_rgba(99,102,241,0.24)]"
            >
              <ExternalLink size={15} />
              Open in Maps
            </a>
            <iframe
              title="MyReport office location map"
              src={mapEmbedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-full min-h-[400px] w-full rounded-[22px] border border-white/45 shadow-inner"
            />
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}
