import { useMemo, useState } from "react";
import merchantsData from "../data/merchants.json";
import { assessMerchantRisk } from "../engine/recommendations";
import { scoreMerchants } from "../engine/riskScoring";
import { useLocalStorage } from "../hooks/useLocalStorage";
import type { Merchant } from "../types/merchant";
import { FilterBar, type FilterState } from "./FilterBar";
import { MerchantTable } from "./MerchantTable";
import { NotesActionPanel } from "./NotesActionPanel";
import { RiskExplanationPanel } from "./RiskExplanationPanel";

export function Dashboard() {
  const initialMerchants = useMemo(
    () => scoreMerchants(merchantsData as Merchant[]),
    [],
  );
  const [merchants] = useState(initialMerchants);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    band: "All",
    dominantSignal: "All",
    sortBy: "score",
  });
  const [selectedMerchantId, setSelectedMerchantId] = useLocalStorage<string>(
    "selected-merchant",
    initialMerchants[0]?.merchantId ?? "",
  );

  const { filteredMerchants, insufficientDataMerchants } = useMemo(() => {
    const query = filters.search.trim().toLowerCase();

    const split = merchants.reduce<{
      filteredMerchants: Merchant[];
      insufficientDataMerchants: Merchant[];
    }>(
      (acc, merchant) => {
        const assessment = assessMerchantRisk(merchant);
        const matchesSearch =
          query.length === 0 || merchant.name.toLowerCase().includes(query);
        const matchesBand =
          filters.band === "All" || assessment.band === filters.band;
        const matchesSignal =
          filters.dominantSignal === "All" ||
          assessment.dominantSignal === filters.dominantSignal;

        const passesFilters = matchesSearch && matchesBand && matchesSignal;

        if (assessment.dataCompleteness === "insufficient") {
          if (passesFilters) {
            acc.insufficientDataMerchants.push(merchant);
          }
          return acc;
        }

        if (passesFilters) {
          acc.filteredMerchants.push(merchant);
        }

        return acc;
      },
      { filteredMerchants: [], insufficientDataMerchants: [] },
    );

    split.filteredMerchants.sort((left, right) => {
      if (filters.sortBy === "name") {
        return left.name.localeCompare(right.name);
      }

      return (right.riskScore ?? 0) - (left.riskScore ?? 0);
    });

    split.insufficientDataMerchants.sort((left, right) =>
      left.name.localeCompare(right.name),
    );

    return split;
  }, [filters, merchants]);

  const selectedMerchant =
    filteredMerchants.find(
      (merchant) => merchant.merchantId === selectedMerchantId,
    ) ??
    filteredMerchants[0] ??
    null;
  const assessment = selectedMerchant
    ? assessMerchantRisk(selectedMerchant)
    : null;

  return (
    <div className="dashboard-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">MerchantPulse AI</p>
          <h1>Merchant risk monitoring workspace</h1>
          <p>
            Prioritize high-risk merchants, review churn indicators, and track
            suggested actions.
          </p>
        </div>
      </header>

      <FilterBar filters={filters} onChange={setFilters} />

      <div className="content-grid">
        <MerchantTable
          merchants={filteredMerchants}
          insufficientMerchants={insufficientDataMerchants}
          onSelectMerchant={(merchant) =>
            setSelectedMerchantId(merchant.merchantId)
          }
        />
        <div className="side-panels">
          <RiskExplanationPanel
            merchant={selectedMerchant}
            assessment={assessment}
          />
          <NotesActionPanel merchantId={selectedMerchant?.merchantId ?? ""} />
        </div>
      </div>
    </div>
  );
}
