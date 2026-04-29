const steps = [
  { label: "Weak", tone: "bg-rose-400" },
  { label: "Fair", tone: "bg-amber-400" },
  { label: "Good", tone: "bg-cyan-400" },
  { label: "Strong", tone: "bg-emerald-400" },
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
            key={step.label}
            className={`h-2 flex-1 rounded-full ${index < score ? step.tone : "bg-white/10"}`}
          />
        ))}
      </div>
      <div className="text-xs text-white/55">Password strength: {activeStep.label}</div>
    </div>
  );
}
