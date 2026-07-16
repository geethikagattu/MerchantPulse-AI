import type { Merchant, RiskLevel } from "../types/merchant";
import {
  computePaymentFriction,
  computeTransactionDecay,
  computeVolumeDecay,
  isDormant,
} from "./churnSignals";
import { scoringConfig } from "./scoringConfig";

export function scoreMerchant(merchant: Merchant): Merchant {
  const volumeDecay = computeVolumeDecay(merchant) ?? 0;
  const transactionDecay = computeTransactionDecay(merchant) ?? 0;
  const paymentFriction = computePaymentFriction(merchant);

  const score = Math.round(
    volumeDecay * scoringConfig.weights.volumeDecay +
      transactionDecay * scoringConfig.weights.transactionDecay +
      paymentFriction * scoringConfig.weights.paymentFriction,
  );

  const riskLevel: RiskLevel =
    score > scoringConfig.bands.highMax
      ? "high"
      : score > scoringConfig.bands.mediumMax
        ? "medium"
        : "low";

  return {
    ...merchant,
    riskScore: Math.min(score, 100),
    riskLevel,
  };
}

export function scoreMerchants(merchants: Merchant[]): Merchant[] {
  return merchants.map(scoreMerchant);
}

export function buildRiskBand(
  score: number,
): "Low" | "Medium" | "High" | "Critical" {
  if (score > scoringConfig.bands.highMax) return "Critical";
  if (score > scoringConfig.bands.mediumMax) return "High";
  if (score > scoringConfig.bands.lowMax) return "Medium";
  return "Low";
}

export function computeRiskSummary(merchant: Merchant) {
  const volumeDecay = computeVolumeDecay(merchant);
  const transactionDecay = computeTransactionDecay(merchant);
  const paymentFriction = computePaymentFriction(merchant);
  const score = Math.round(
    (volumeDecay ?? 0) * scoringConfig.weights.volumeDecay +
      (transactionDecay ?? 0) * scoringConfig.weights.transactionDecay +
      paymentFriction * scoringConfig.weights.paymentFriction,
  );

  return {
    score,
    band: buildRiskBand(score),
    isDormant: isDormant(merchant),
    signals: {
      volumeDecay,
      transactionDecay,
      paymentFriction,
    },
  };
}
