import { useLocalStorage } from "../hooks/useLocalStorage";
import { MerchantUserState } from "../types/merchant";

const DEFAULT_STATE: MerchantUserState = {
  notes: "",
  actionTaken: false,
  dismissed: false,
};

export function NotesActionPanel({ merchantId }: { merchantId: string }) {
  const [state, setState] = useLocalStorage<MerchantUserState>(
    `merchant:${merchantId}`,
    DEFAULT_STATE,
  );

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-3">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
        Notes & actions
      </p>

      <textarea
        value={state.notes}
        onChange={(e) => setState({ ...state, notes: e.target.value })}
        placeholder="Add a note about this merchant..."
        className="w-full text-sm border border-slate-300 rounded-md p-2 min-h-[80px]"
      />

      <div className="flex gap-4 text-sm">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={state.actionTaken}
            onChange={(e) =>
              setState({ ...state, actionTaken: e.target.checked })
            }
          />
          Action taken
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={state.dismissed}
            onChange={(e) =>
              setState({ ...state, dismissed: e.target.checked })
            }
          />
          Dismiss from active list
        </label>
      </div>
    </div>
  );
}
