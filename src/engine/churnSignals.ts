import { Merchant } from "../types/merchant";
import { scoringConfig } from "./scoringConfig";

export function computeVolumeDecay(m: Merchant): number | null {
  return computeDecay(m.monthlyVolume);
}

export function computeTransactionDecay(m: Merchant): number | null {
  return computeDecay(m.transactionCounts);
}

function computeDecay(series: number[]): number | null {
  if (series.length < 2) return null;
  const current = series[series.length - 1];
  const baselineWindow = series.slice(
    Math.max(0, series.length - 4),
    series.length - 1,
  );
  const baseline =
    baselineWindow.reduce((a, b) => a + b, 0) / baselineWindow.length;
  if (baseline === 0) return null;
  const pctChange = (baseline - current) / baseline;
  const clamped = Math.max(0, Math.min(1, pctChange));
  return Math.round(clamped * 100);
}

export function computePaymentFriction(m: Merchant): number {
  const rateComponent = Math.min(
    100,
    (m.failedPaymentRateLast30d / scoringConfig.failedPaymentRateThreshold) *
      100,
  );
  const ticketComponent = Math.min(
    100,
    (m.supportTicketsLast90d / scoringConfig.supportTicketThreshold) * 100,
  );
  const { failedPaymentRate, supportTickets } =
    scoringConfig.paymentFrictionInternalWeights;
  return Math.round(
    rateComponent * failedPaymentRate + ticketComponent * supportTickets,
  );
}

export function isDormant(m: Merchant): boolean {
  if (m.monthsActive < scoringConfig.dormancyMinMonthsActive) return false;
  const lastMonth = m.monthlyVolume[m.monthlyVolume.length - 1];
  return lastMonth === 0;
}

export function getChurnSignals(merchant: Merchant) {
  const signals = [] as string[];
  const volumeDecay = computeVolumeDecay(merchant);
  const transactionDecay = computeTransactionDecay(merchant);
  const paymentFriction = computePaymentFriction(merchant);

  if (paymentFriction > 40) {
    signals.push(
      "Failed payments and/or support issues are above the monitored threshold.",
    );
  }

  if (volumeDecay !== null && volumeDecay > 20) {
    signals.push("Volume has decayed materially versus the prior window.");
  }

  if (transactionDecay !== null && transactionDecay > 20) {
    signals.push("Transaction counts have dropped relative to baseline.");
  }

  if (isDormant(merchant)) {
    signals.push(
      "The merchant appears dormant and needs reactivation outreach.",
    );
  }

  return signals;
}
