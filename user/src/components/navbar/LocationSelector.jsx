import { ChevronDown, MapPin, X } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";
import Button from "../common/Button";

const LocationSelector = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("options");
  const [form, setForm] = useState({ country: "", state: "", city: "" });
  const label = value || "All India";

  const selectAllIndia = () => {
    onChange("");
    setOpen(false);
    setMode("options");
  };

  const applyEnteredLocation = () => {
    const nextLocation = [form.city, form.state, form.country].map((item) => item.trim()).filter(Boolean).join(", ");
    if (!nextLocation) return;
    onChange(nextLocation);
    setOpen(false);
    setMode("options");
  };

  return (
    <div className="relative hidden min-w-48 md:block">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-12 w-full items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition hover:border-brand-200 focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      >
        <MapPin className="h-5 w-5 shrink-0 text-brand-600" />
        <span className="min-w-0 flex-1 truncate text-left">{label}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
      </button>

      {open ? createPortal(
        <div className="fixed inset-0 z-50 bg-slate-950/50 px-4">
          <button className="absolute inset-0" onClick={() => setOpen(false)} aria-label="Close location selector" />
          <div className="fixed left-1/2 top-1/2 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
              <h2 className="text-lg font-black text-slate-950 dark:text-white">Select Location</h2>
              <button type="button" onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close location selector">
                <X className="h-5 w-5" />
              </button>
            </div>

            {mode === "options" ? (
              <div className="space-y-3 p-5">
                <button type="button" onClick={selectAllIndia} className="flex w-full items-center gap-3 rounded-lg border border-slate-200 p-4 text-left font-bold hover:border-brand-200 hover:bg-brand-50 dark:border-slate-800 dark:hover:border-brand-500/50 dark:hover:bg-brand-500/15">
                  <MapPin className="h-5 w-5 text-brand-600" />
                  All India
                </button>
                <button type="button" onClick={() => setMode("manual")} className="flex w-full items-center gap-3 rounded-lg border border-slate-200 p-4 text-left font-bold hover:border-brand-200 hover:bg-brand-50 dark:border-slate-800 dark:hover:border-brand-500/50 dark:hover:bg-brand-500/15">
                  <MapPin className="h-5 w-5 text-brand-600" />
                  Enter Location
                </button>
              </div>
            ) : (
              <div className="space-y-4 p-5">
                {[
                  ["country", "Country"],
                  ["state", "State"],
                  ["city", "City"],
                ].map(([key, placeholder]) => (
                  <input
                    key={key}
                    value={form[key]}
                    onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                    placeholder={placeholder}
                    className="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                ))}
                <div className="flex justify-between gap-3">
                  <Button type="button" variant="secondary" onClick={() => setMode("options")}>Back</Button>
                  <Button type="button" disabled={!form.country.trim() && !form.state.trim() && !form.city.trim()} onClick={applyEnteredLocation}>Apply</Button>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body,
      ) : null}
    </div>
  );
};

export default LocationSelector;
