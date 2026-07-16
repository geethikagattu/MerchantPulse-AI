# MerchantPulse AI

MerchantPulse AI is a React + TypeScript dashboard for monitoring merchant risk signals such as payment friction, transaction decay, and dormant behavior. It helps teams quickly review merchants that may need outreach or manual review.

## Features

- Merchant watchlist with risk scoring
- Signal breakdown for volume decay, transaction decay, and payment friction
- Recommendation engine for suggested action
- Notes and action-state persistence in local storage
- Responsive layout for desktop and tablet views

## Tech stack

- React
- TypeScript
- Vite
- CSS

## Run locally

```bash
npm install
npm run dev
```

## Build for production

```bash
npm run build
```

## Known limitations

- The dashboard uses a static mock merchant dataset rather than live financial data.
- Scoring reflects a single snapshot of merchant behavior and is meant for demo purposes.

## Future improvements

- Connect to a live data source
- Add richer analytics and trend charts
- Support export/import for review workflows
