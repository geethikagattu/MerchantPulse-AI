import type {
  Merchant,
  Recommendation,
  RiskAssessment,
  RiskBand,
  DominantSignal,
} from "../types/merchant";
import {
  computePaymentFriction,
  computeTransactionDecay,
  computeVolumeDecay,
  isDormant,
} from "./churnSignals";
import { scoringConfig } from "./scoringConfig";

function getDataCompleteness(
  merchant: Merchant,
): "full" | "partial" | "insufficient" {
  if (merchant.monthsActive < scoringConfig.minMonthsForScoring) {
    return "insufficient";
  }

  if (merchant.monthsActive >= 12) {
    return "full";
  }

  return "partial";
}

export function assessMerchantRisk(merchant: Merchant): RiskAssessment {
  const completeness = getDataCompleteness(merchant);

  if (completeness === "insufficient") {
    return {
      merchantId: merchant.merchantId,
      score: 0,
      band: "Low",
      dataCompleteness: "insufficient",
      signals: {
        volumeDecay: null,
        transactionDecay: null,
        paymentFriction: null,
      },
      dominantSignal: "none",
      isDormant: isDormant(merchant),
    };
  }

  const volumeDecay = computeVolumeDecay(merchant);
  const transactionDecay = computeTransactionDecay(merchant);
  const paymentFriction = computePaymentFriction(merchant);
  const score = Math.round(
    (volumeDecay ?? 0) * scoringConfig.weights.volumeDecay +
      (transactionDecay ?? 0) * scoringConfig.weights.transactionDecay +
      paymentFriction * scoringConfig.weights.paymentFriction,
  );

  let band: RiskBand = "Low";
  if (score > scoringConfig.bands.highMax) band = "Critical";
  else if (score > scoringConfig.bands.mediumMax) band = "High";
  else if (score > scoringConfig.bands.lowMax) band = "Medium";

  const signalScores: Record<string, number> = {
    paymentFriction,
    volumeDecay: volumeDecay ?? 0,
    transactionDecay: transactionDecay ?? 0,
  };
  const dominantSignal: DominantSignal = isDormant(merchant)
    ? "dormant"
    : (scoringConfig.dominantSignalPriority.find(
        (signal) => signalScores[signal] >= 40,
      ) ?? "none");

  return {
    merchantId: merchant.merchantId,
    score,
    band,
    dataCompleteness: completeness,
    signals: {
      volumeDecay,
      transactionDecay,
      paymentFriction,
    },
    dominantSignal,
    isDormant: isDormant(merchant),
  };
}

export function recommendAction(assessment: RiskAssessment): Recommendation {
  if (assessment.dataCompleteness === "insufficient") {
    return {
      action: "Monitor -- insufficient history",
      reason:
        "Merchant has been active less than 3 months; no reliable baseline exists yet to assess risk.",
      priority: "monitor",
    };
  }

  if (assessment.isDormant) {
    return {
      action: "Re-engagement outreach",
      reason:
        "Merchant has an established history but zero transaction volume in the most recent month -- this looks like full disengagement, not gradual decay.",
      priority:
        assessment.band === "Critical" || assessment.band === "High"
          ? "urgent"
          : "soon",
    };
  }

  if (assessment.band === "Low") {
    return {
      action: "No action needed",
      reason: "All churn signals are within normal range for this merchant.",
      priority: "monitor",
    };
  }

  switch (assessment.dominantSignal) {
    case "paymentFriction":
      return {
        action: "Flag payment method / escalate to support",
        reason:
          "Elevated failed payment rate and/or support ticket volume is the largest contributor to this merchant's risk score -- likely a payment-method or billing issue rather than disengagement.",
        priority: assessment.band === "Critical" ? "urgent" : "soon",
      };
    case "volumeDecay":
      return {
        action: "Proactive outreach / retention offer",
        reason:
          "Transaction volume has declined significantly versus this merchant's own trailing baseline -- the strongest signal here is revenue decline, not payment problems.",
        priority: assessment.band === "Critical" ? "urgent" : "soon",
      };
    case "transactionDecay":
      return {
        action: "Check in on usage patterns",
        reason:
          "Transaction count has dropped relative to baseline, independent of volume -- may indicate reduced engagement even if average ticket size holds steady.",
        priority: assessment.band === "Critical" ? "urgent" : "soon",
      };
    default:
      return {
        action: "High-touch account review",
        reason:
          "Multiple signals are contributing without one clear dominant cause -- warrants a manual review rather than an automated single action.",
        priority: "soon",
      };
  }
}

export function getRecommendations(merchant: Merchant): Recommendation[] {
  const assessment = assessMerchantRisk(merchant);
  return [recommendAction(assessment)];
}
