import { Check, IndianRupee, Reply, Send, X } from "lucide-react";
import { useState } from "react";
import Button from "../../components/common/Button";
import { formatCurrency } from "../../utils/format";

const OfferPanel = ({ listing, offerOptions = [], offers = [], onAcceptOffer, onRejectOffer, onSendOffer }) => {
  const [offer, setOffer] = useState(String(listing.price));
  const selectedOffer = Number(offer || listing.price);

  const sendOffer = (event) => {
    event.preventDefault();
    onSendOffer?.(selectedOffer);
  };

  const counterOffer = (amount) => {
    setOffer(String(amount));
    window.requestAnimationFrame(() => {
      document.getElementById("offer-input")?.focus();
    });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-xl font-black">Make an offer</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Choose a suggested amount or enter your own price.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {offerOptions.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => setOffer(String(amount))}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${selectedOffer === amount ? "border-brand-100 bg-brand-50 text-brand-700 dark:border-brand-500/40 dark:bg-brand-500/15 dark:text-brand-100" : "border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"}`}
              >
                {formatCurrency(amount)}
              </button>
            ))}
          </div>
          <form onSubmit={sendOffer} className="mt-5">
            <label className="block max-w-sm">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Your offer</span>
              <div className="mt-2 flex h-14 items-center rounded-lg border border-slate-200 bg-white px-3 focus-within:border-brand-500 dark:border-slate-700 dark:bg-slate-950">
                <IndianRupee className="h-5 w-5 text-slate-500" />
                <input
                  id="offer-input"
                  value={offer}
                  onChange={(event) => setOffer(event.target.value)}
                  type="number"
                  min="1"
                  className="h-full flex-1 bg-transparent px-2 text-2xl font-black outline-none"
                />
              </div>
            </label>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="rounded-lg bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-800 dark:bg-brand-500/15 dark:text-brand-100">
                Very good offer. High chances of reply.
              </div>
              <Button icon={Send} className="sm:min-w-32">Make offer</Button>
            </div>
          </form>
        </div>
        <div className="mt-5 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-black">Offer history</h2>
          <div className="mt-4 space-y-3">
            {offers.length ? offers.map((item) => {
              const status = String(item.status || "").toUpperCase();
              const canRespond = !item.fromMe && status === "SENT";

              return (
                <div key={item.id} className="grid gap-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-950 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <p className="font-black">{formatCurrency(item.amount)}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.status} - {item.time}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700 dark:bg-brand-500/15 dark:text-brand-100">{item.fromMe ? "You" : "Other"}</span>
                    {canRespond ? (
                      <>
                        <Button type="button" icon={Check} className="min-h-9 px-3 py-1 text-xs" onClick={() => onAcceptOffer?.(item.id)}>Accept</Button>
                        <Button type="button" variant="danger" icon={X} className="min-h-9 px-3 py-1 text-xs" onClick={() => onRejectOffer?.(item.id)}>Reject</Button>
                        <Button type="button" variant="secondary" icon={Reply} className="min-h-9 px-3 py-1 text-xs" onClick={() => counterOffer(item.amount)}>Counter</Button>
                      </>
                    ) : null}
                  </div>
                </div>
              );
            }) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">No offers yet. Send the first offer to start negotiation.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferPanel;
