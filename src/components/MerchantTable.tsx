import type { Merchant } from "../types/merchant";
import { RiskBadge } from "./RiskBadge";

interface MerchantTableProps {
  merchants: Merchant[];
  insufficientMerchants?: Merchant[];
  onSelectMerchant: (merchant: Merchant) => void;
}

export function MerchantTable({
  merchants,
  insufficientMerchants = [],
  onSelectMerchant,
}: MerchantTableProps) {
  return (
    <div className="table-card">
      <h3>Merchant watchlist</h3>
      <table>
        <thead>
          <tr>
            <th>Merchant</th>
            <th>Segment</th>
            <th>Plan</th>
            <th>Risk</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {merchants.map((merchant) => (
            <tr
              key={merchant.merchantId}
              onClick={() => onSelectMerchant(merchant)}
            >
              <td>{merchant.name}</td>
              <td>{merchant.industryCategory.replace(/_/g, " ")}</td>
              <td>{merchant.planTier}</td>
              <td>
                <RiskBadge
                  band={(merchant.riskLevel ?? "low") as any}
                  score={merchant.riskScore ?? 0}
                />
              </td>
              <td>{merchant.riskScore ?? 0}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {insufficientMerchants.length > 0 && (
        <div className="mt-4 border-t border-slate-200 pt-4">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-2">
            Insufficient data
          </h4>
          <ul className="space-y-2">
            {insufficientMerchants.map((merchant) => (
              <li
                key={merchant.merchantId}
                className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-sm"
              >
                <button
                  type="button"
                  onClick={() => onSelectMerchant(merchant)}
                  className="text-left font-medium text-slate-700 hover:text-slate-900"
                >
                  {merchant.name}
                </button>
                <span className="text-xs uppercase tracking-wide text-slate-400">
                  not scored
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
