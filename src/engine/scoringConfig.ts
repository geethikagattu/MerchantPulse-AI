export const scoringConfig = {
  weights: {
    volumeDecay: 0.35,
    transactionDecay: 0.2,
    paymentFriction: 0.45,
  },
  bands: {
    lowMax: 24,
    mediumMax: 49,
    highMax: 74,
  },
  minMonthsForScoring: 3,
  dormancyMinMonthsActive: 2,
  failedPaymentRateThreshold: 0.08,
  supportTicketThreshold: 5,
  paymentFrictionInternalWeights: {
    failedPaymentRate: 0.65,
    supportTickets: 0.35,
  },
  dominantSignalPriority: [
    "paymentFriction",
    "volumeDecay",
    "transactionDecay",
  ] as const,
};
