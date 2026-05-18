const steps = [
  { label: "Weak", tone: "bg-red-400", text: "text-red-500" },
  { label: "Medium", tone: "bg-yellow-400", text: "text-yellow-500" },
  { label: "Medium", tone: "bg-cyan-400", text: "text-cyan-500" },
  { label: "Strong", tone: "bg-emerald-400", text: "text-emerald-500" },
];

function getPasswordScore(password) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
}

export function PasswordStrengthMeter({ password }) {
  const score = getPasswordScore(password);
  const activeStep = steps[Math.max(0, score - 1)] || steps[0];

  return (
    <div className="grid gap-2">
      <div className="flex gap-2">
        {steps.map((step, index) => (
          <div
            key={`${step.label}-${index}`}
            className={`h-2 flex-1 rounded-full transition-all duration-300 ${index < score ? step.tone : "bg-slate-200/80 dark:bg-white/10"}`}
          />
        ))}
      </div>
      <div className={`text-xs font-semibold ${activeStep.text}`}>Password strength: {activeStep.label}</div>
    </div>
  );
}
