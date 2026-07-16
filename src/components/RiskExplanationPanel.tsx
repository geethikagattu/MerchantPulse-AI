import type { Merchant, RiskAssessment } from "../types/merchant";
import { recommendAction } from "../engine/recommendations";

function SignalRow({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-slate-600 w-40 shrink-0">{label}</span>
      {value === null ? (
        <span className="text-xs text-slate-400 italic">
          Not enough history to compute
        </span>
      ) : (
        <>
          <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-slate-700 rounded-full"
              style={{ width: `${value}%` }}
            />
          </div>
          <span className="text-sm font-medium w-10 text-right">{value}</span>
        </>
      )}
    </div>
  );
}

export function RiskExplanationPanel({
  merchant,
  assessment,
}: {
  merchant: Merchant | null;
  assessment: RiskAssessment | null;
}) {
  if (!merchant || !assessment) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-900 mb-2">Select a merchant</h3>
        <p className="text-sm text-slate-500">
          Pick a merchant from the watchlist to inspect its risk assessment.
        </p>
      </div>
    );
  }

  if (assessment.dataCompleteness === "insufficient") {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-900 mb-2">{merchant.name}</h3>
        <p className="text-sm text-slate-500 italic">
          Onboarded {merchant.monthsActive ?? 0} month(s) ago -- insufficient
          history to compute a reliable risk score. Excluded from ranking rather
          than scored with low confidence.
        </p>
      </div>
    );
  }

  const rec = recommendAction(assessment);

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-4">
      <div>
        <h3 className="font-semibold text-slate-900">{merchant.name}</h3>
        <p className="text-xs text-slate-500">
          {(merchant.industryCategory ?? "general").replace("_", " ")} ·{" "}
          {merchant.planTier ?? "standard"} plan · data completeness{" "}
          {assessment.dataCompleteness}
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          Signal breakdown
        </p>
        <SignalRow
          label="Volume decay"
          value={assessment.signals.volumeDecay}
        />
        <SignalRow
          label="Transaction decay"
          value={assessment.signals.transactionDecay}
        />
        <SignalRow
          label="Payment friction"
          value={assessment.signals.paymentFriction}
        />
      </div>

      <div className="border-t border-slate-100 pt-4">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
          Recommended action
        </p>
        <p className="text-sm font-medium text-slate-900">{rec.action}</p>
        <p className="text-sm text-slate-600 mt-1">{rec.reason}</p>
      </div>
    </div>
  );
}
