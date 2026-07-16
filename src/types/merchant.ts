export type RiskLevel = "low" | "medium" | "high";
export type PlanTier = "starter" | "growth" | "enterprise";

export interface Merchant {
  merchantId: string;
  name: string;
  industryCategory: string;
  onboardedDate: string;
  monthsActive: number;
  planTier: PlanTier;
  monthlyVolume: number[];
  transactionCounts: number[];
  supportTicketsLast90d: number;
  failedPaymentRateLast30d: number;
  failedPaymentCountLast30d: number;
  lastActiveDate: string;
  notes?: string;
  riskScore?: number;
  riskLevel?: RiskLevel;
}

export type RiskBand = "Low" | "Medium" | "High" | "Critical";
export type DataCompleteness = "full" | "partial" | "insufficient";
export type DominantSignal =
  | "volumeDecay"
  | "transactionDecay"
  | "paymentFriction"
  | "dormant"
  | "none";

export interface SignalScores {
  volumeDecay: number | null;
  transactionDecay: number | null;
  paymentFriction: number | null;
}

export interface RiskAssessment {
  merchantId: string;
  score: number;
  band: RiskBand;
  dataCompleteness: DataCompleteness;
  signals: SignalScores;
  dominantSignal: DominantSignal;
  isDormant: boolean;
}

export interface Recommendation {
  action: string;
  reason: string;
  priority: "urgent" | "soon" | "monitor";
}

export interface MerchantUserState {
  notes: string;
  actionTaken: boolean;
  dismissed: boolean;
}

export interface ActionRecommendation {
  action: string;
  reason: string;
}
