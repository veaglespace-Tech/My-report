"use client";

import { motion } from "framer-motion";
import { Mail, MapPin, Phone } from "lucide-react";

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
      className="group rounded-2xl bg-white/70 p-5 shadow-md ring-1 ring-black/5 backdrop-blur-md transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="flex items-start gap-4">
        <div className="rounded-xl bg-gradient-to-br from-cyan-400/20 to-indigo-400/20 p-3 ring-1 ring-black/5">
          <Icon className="h-5 w-5 text-indigo-700" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <p className="mt-1 break-words text-sm text-slate-700">{value}</p>
          {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
        </div>
      </div>
    </motion.div>
  );
}

export default function ContactClient() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-200 via-purple-200 to-blue-200">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-cyan-300/50 blur-3xl" />
        <div className="absolute -right-28 top-10 h-80 w-80 rounded-full bg-indigo-300/50 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 -translate-x-1/2 rounded-full bg-fuchsia-300/40 blur-3xl" />
      </div>

      <motion.div
        initial="hidden"
        animate="show"
        variants={container}
        className="relative mx-auto w-full max-w-6xl px-6 py-16"
      >
        <motion.div variants={item} className="text-center">
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Get in{" "}
            <span className="bg-gradient-to-r from-cyan-500 to-indigo-600 bg-clip-text text-transparent">
              Touch
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-7 text-slate-700">
            Reach out for demos, onboarding help, pricing, or enterprise support.
          </p>
        </motion.div>

        <motion.div
          variants={item}
          className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2"
        >
          <div className="space-y-4">
            <InfoCard
              icon={Mail}
              title="Email"
              value="support@myreport.com"
              hint="We typically respond within 1 business day."
            />
            <InfoCard
              icon={Phone}
              title="Phone"
              value="+1 (555) 123-4567"
              hint="Mon–Fri, 9:00 AM – 6:00 PM"
            />
            <InfoCard
              icon={MapPin}
              title="Office"
              value="123 SaaS Street, Suite 400, San Francisco, CA"
              hint="Visits by appointment only."
            />
          </div>

          <motion.div
            variants={item}
            className="rounded-2xl bg-white/70 p-6 shadow-md ring-1 ring-black/5 backdrop-blur-md"
          >
            <form
              className="grid grid-cols-1 gap-4"
              onSubmit={(event) => event.preventDefault()}
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-900">Full Name</label>
                  <input
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-200/60"
                    placeholder="Your name"
                    autoComplete="name"
                    name="name"
                    type="text"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-900">
                    Email Address
                  </label>
                  <input
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-200/60"
                    placeholder="you@company.com"
                    autoComplete="email"
                    name="email"
                    type="email"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-900">Subject</label>
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-200/60"
                  placeholder="How can we help?"
                  name="subject"
                  type="text"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-900">Message</label>
                <textarea
                  className="mt-2 min-h-36 w-full resize-none rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-200/60"
                  placeholder="Tell us a bit about what you need…"
                  name="message"
                />
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  className="group inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-400 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:brightness-105 hover:shadow-lg hover:shadow-indigo-500/25 active:scale-[0.99]"
                >
                  <span className="transition group-hover:-translate-y-0.5">Send Message</span>
                </button>
                <p className="mt-3 text-center text-xs text-slate-600">
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

