# MerchantPulse AI v1 Spec

## Problem framing

MerchantPulse AI is a lightweight merchant risk monitoring dashboard for a payments operations team. The product helps reviewers quickly identify merchants whose behavior suggests churn risk, payment friction, or disengagement, and then decide whether a human follow-up is needed.

The first version focuses on a single-screen experience that shows a merchant watchlist, a risk explanation panel, and a notes/actions panel. The goal is not to be a full enterprise risk platform yet, but to provide a believable first-pass workflow for reviewing merchant health.

## Core user need

A merchant operations reviewer needs to:
- scan a list of merchants ranked by risk,
- understand why a merchant is flagged,
- decide on a recommended action,
- and persist a note or action state for follow-up.

## Initial product scope

### 1. Merchant record shape

The first version uses a simplified merchant schema that captures enough information to drive meaningful churn signals without overcomplicating the demo.

Each merchant record includes:
- merchantId
- name
- industryCategory
- onboardedDate
- monthsActive
- planTier
- monthlyVolume: monthly revenue or volume history over time
- transactionCounts: monthly transaction history over time
- supportTicketsLast90d
- failedPaymentRateLast30d
- failedPaymentCountLast30d
- lastActiveDate

This shape was chosen because it supports the core signals we care about:
- trend decline in volume,
- trend decline in transaction count,
- payment friction from failed payments and support issues,
- and dormancy when recent volume drops to zero.

### 2. Churn signals being tracked

The initial scoring model tracks three primary signals:

1. Volume decay
   - Measures whether the merchant’s recent monthly volume is materially lower than its recent baseline.
   - Why: declining revenue volume is a strong early warning sign of disengagement.

2. Transaction decay
   - Measures whether transaction counts are declining relative to baseline.
   - Why: usage may be dropping even when ticket size stays stable.

3. Payment friction
   - Combines failed payment rate and support tickets into one friction signal.
   - Why: payment failures and support burden often point to product friction, billing issues, or customer dissatisfaction.

A dormant state is also detected when a merchant has been active long enough and has zero volume in the most recent month.

### 3. Risk scoring approach

The initial version uses a weighted risk score derived from the three main signal values.

The scoring plan is intentionally simple and deterministic:
- volume decay contributes a weighted score,
- transaction decay contributes a weighted score,
- payment friction contributes a weighted score,
- and the combined result produces a low/medium/high/critical band.

The model is designed to be explainable, not perfectly predictive.

### 4. Recommendation logic

Each merchant gets a recommendation based on the strongest signal and the band:
- low risk → monitor only,
- payment friction dominant → flag support/payment issues,
- volume decay dominant → proactive retention outreach,
- transaction decay dominant → usage pattern review,
- dormant merchants → re-engagement outreach.

This keeps the product useful for a reviewer who wants a clear next action without requiring a complex rules engine.

### 5. Persistence model

The app uses browser localStorage to persist user actions and notes.

The initial persistence plan is:
- each merchant gets its own storage key,
- notes are saved as freeform text,
- actionTaken and dismissed are saved as booleans.

This allows the dashboard to feel interactive without needing a backend in v1.

## UX assumptions

The v1 experience is a single-page dashboard with three main sections:
- a merchant watchlist,
- a detail/explanation panel,
- and a notes/actions panel.

The interface should let a reviewer:
- search by merchant name,
- filter by risk band and dominant signal,
- sort by risk or alphabetically,
- click a merchant to inspect its signals,
- and leave notes or action state for later review.

## Data assumptions

Because this is a demo product, the app uses a static mock dataset rather than live merchant data. The data files are meant to reflect realistic merchant behavior patterns without requiring backend integration.

The initial dataset includes merchants with:
- healthy baseline behavior,
- seasonal spikes,
- gradual declines,
- high payment friction,
- dormant states,
- and insufficient history for scoring.

## Success criteria

The initial version is successful if a reviewer can:
- load the dashboard and immediately understand which merchants deserve attention,
- see why a merchant is flagged,
- take a recommended action from the explanation panel,
- and leave persistent notes/actions without needing a server.

## Out of scope for v1

The following are intentionally deferred:
- real backend integration,
- authentication or multi-user workflows,
- live payments or transaction ingestion,
- advanced forecasting or machine learning,
- persistent team collaboration beyond browser-local state.

## Change log

- v1 initial draft: defined merchant schema, core signals, scoring and recommendation logic, and local persistence model.
