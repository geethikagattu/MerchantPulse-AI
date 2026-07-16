import type { DominantSignal, RiskBand } from "../types/merchant";

export interface FilterState {
  search: string;
  band: RiskBand | "All";
  dominantSignal: DominantSignal | "All";
  sortBy: "score" | "name";
}

const BANDS: (RiskBand | "All")[] = [
  "All",
  "Critical",
  "High",
  "Medium",
  "Low",
];
const SIGNALS: (DominantSignal | "All")[] = [
  "All",
  "paymentFriction",
  "volumeDecay",
  "transactionDecay",
  "dormant",
];

export function FilterBar({
  filters,
  onChange,
}: {
  filters: FilterState;
  onChange: (f: FilterState) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3 items-center bg-white p-4 rounded-lg border border-slate-200">
      <input
        type="text"
        placeholder="Search merchant name..."
        value={filters.search}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
        className="px-3 py-2 border border-slate-300 rounded-md text-sm flex-1 min-w-[200px]"
      />

      <select
        value={filters.band}
        onChange={(e) =>
          onChange({ ...filters, band: e.target.value as FilterState["band"] })
        }
        className="px-3 py-2 border border-slate-300 rounded-md text-sm"
      >
        {BANDS.map((band) => (
          <option key={band} value={band}>
            {band === "All" ? "All risk bands" : band}
          </option>
        ))}
      </select>

      <select
        value={filters.dominantSignal}
        onChange={(e) =>
          onChange({
            ...filters,
            dominantSignal: e.target.value as FilterState["dominantSignal"],
          })
        }
        className="px-3 py-2 border border-slate-300 rounded-md text-sm"
      >
        {SIGNALS.map((signal) => (
          <option key={signal} value={signal}>
            {signal === "All" ? "All signals" : signal}
          </option>
        ))}
      </select>

      <select
        value={filters.sortBy}
        onChange={(e) =>
          onChange({
            ...filters,
            sortBy: e.target.value as FilterState["sortBy"],
          })
        }
        className="px-3 py-2 border border-slate-300 rounded-md text-sm"
      >
        <option value="score">Sort: Risk score (high to low)</option>
        <option value="name">Sort: Name (A-Z)</option>
      </select>
    </div>
  );
}
