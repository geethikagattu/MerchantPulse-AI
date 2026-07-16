import { RiskBand } from "../types/merchant";

type BadgeBand = RiskBand | "low" | "medium" | "high" | "critical";

const STYLES: Record<RiskBand, { classes: string; icon: string }> = {
  Low: {
    classes: "bg-emerald-100 text-emerald-800 border-emerald-300",
    icon: "●",
  },
  Medium: {
    classes: "bg-amber-100 text-amber-800 border-amber-300",
    icon: "▲",
  },
  High: {
    classes: "bg-orange-100 text-orange-800 border-orange-300",
    icon: "■",
  },
  Critical: { classes: "bg-red-100 text-red-800 border-red-300", icon: "✕" },
};

function normalizeBand(band: BadgeBand | string | undefined): RiskBand {
  switch (String(band ?? "").toLowerCase()) {
    case "critical":
      return "Critical";
    case "high":
      return "High";
    case "medium":
      return "Medium";
    case "low":
    default:
      return "Low";
  }
}

export function RiskBadge({
  band,
  score,
}: {
  band: BadgeBand | string;
  score?: number;
}) {
  const normalizedBand = normalizeBand(band);
  const style = STYLES[normalizedBand];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${style.classes}`}
    >
      <span aria-hidden="true">{style.icon}</span>
      {normalizedBand}
      {typeof score === "number" && (
        <span className="opacity-70">· {score}</span>
      )}
    </span>
  );
}
