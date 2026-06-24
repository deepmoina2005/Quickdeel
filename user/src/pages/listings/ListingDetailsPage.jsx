import {
  ChevronRight,
  Flag,
  Heart,
  MapPin,
  MessageCircle,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import Button from "../../components/common/Button";
import EmptyState from "../../components/common/EmptyState";
import ErrorState from "../../components/common/ErrorState";
import Skeleton from "../../components/common/Skeleton";
import ImageGallery from "../../components/listing/ImageGallery";
import ListingGrid from "../../components/listing/ListingGrid";
import { useAuth } from "../../context/AuthContext";
import { useMarketplace } from "../../hooks/useMarketplace";
import { marketplaceService } from "../../services/marketplace.service";
import { formatCurrency, formatDate } from "../../utils/format";

const mapEmbedUrl = (location) => `https://maps.google.com/maps?q=${encodeURIComponent(location || "")}&output=embed`;
const mapSearchUrl = (location) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location || "")}`;
const formatMonthYear = (date) => (
  date ? new Intl.DateTimeFormat("en-IN", { month: "short", year: "numeric" }).format(new Date(date)) : "-"
);
const reportReasons = [
  { value: "Fake or misleading product", label: "Fake or misleading product" },
  { value: "Possible fraud or scam", label: "Possible fraud or scam" },
  { value: "Duplicate listing", label: "Duplicate listing" },
  { value: "Prohibited item", label: "Prohibited item" },
  { value: "Other", label: "Other" },
];

const ListingDetailsPage = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [reportOpen, setReportOpen] = useState(false);
  const [reportForm, setReportForm] = useState({ reason: "", description: "" });
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [favoriteSaving, setFavoriteSaving] = useState(false);
  const {
    data: listing,
    loading,
    error,
    reload,
  } = useMarketplace(() => marketplaceService.getListing(id), [id]);
  const { data: similar } = useMarketplace(
    () => marketplaceService.getListings({ category: listing?.category }),
    [listing?.category],
  );
  const similarListings = Array.isArray(similar) ? similar : [];

  useEffect(() => {
    if (!isAuthenticated || !listing?.id) {
      setFavorited(false);
      return;
    }

    let mounted = true;
    marketplaceService.getFavorites()
      .then((items) => {
        if (!mounted) return;
        setFavorited(items.some((item) => String(item.id) === String(listing.id)));
      })
      .catch(() => {
        if (mounted) setFavorited(false);
      });

    return () => {
      mounted = false;
    };
  }, [isAuthenticated, listing?.id]);

  if (error)
    return (
      <section className="mx-auto max-w-7xl px-4 py-8">
        <ErrorState message={error} onRetry={reload} />
      </section>
    );
  if (loading)
    return (
      <section className="mx-auto max-w-7xl px-4 py-8">
        <Skeleton className="h-96 w-full" />
      </section>
    );
  if (!listing)
    return (
      <section className="mx-auto max-w-7xl px-4 py-8">
        <EmptyState title="Listing not found" />
      </section>
    );


  const submitReport = async (event) => {
    event.preventDefault();

    if (!isAuthenticated) {
      toast.error("Please login to report this product");
      return;
    }
    if (!reportForm.reason) {
      toast.error("Please select a reason");
      return;
    }

    setReportSubmitting(true);
    try {
      await marketplaceService.reportListing(listing.id, reportForm);
      toast.success("Report sent to admin");
      setReportOpen(false);
      setReportForm({ reason: "", description: "" });
    } catch (err) {
      toast.error(err?.message || "Report could not be sent");
    } finally {
      setReportSubmitting(false);
    }
  };

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to use wishlist");
      return;
    }
    if (favoriteSaving) return;

    const nextFavorited = !favorited;
    setFavoriteSaving(true);
    setFavorited(nextFavorited);
    try {
      if (nextFavorited) {
        await marketplaceService.addFavorite(listing.id);
        toast.success("Added to wishlist");
      } else {
        await marketplaceService.removeFavorite(listing.id);
        toast.success("Removed from wishlist");
      }
    } catch (err) {
      setFavorited(!nextFavorited);
      toast.error(err?.message || "Wishlist update failed");
    } finally {
      setFavoriteSaving(false);
    }
  };

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
          <div className="space-y-5">
            <ImageGallery images={listing.images} />
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h1 className="text-2xl font-black">{listing.title}</h1>
              <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {listing.location}
                </span>
                <span>Posted {formatDate(listing.createdAt)}</span>
                <span>{listing.condition}</span>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-xl font-black">Details</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-950">
                  <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                    Category
                  </p>
                  <p className="mt-1 font-semibold capitalize">
                    {listing.category}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-950">
                  <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                    Condition
                  </p>
                  <p className="mt-1 font-semibold">{listing.condition}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-950">
                  <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                    Status
                  </p>
                  <p className="mt-1 font-semibold">{listing.status}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-950">
                  <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                    Listed on
                  </p>
                  <p className="mt-1 font-semibold">
                    {formatDate(listing.createdAt)}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-xl font-black">Description</h2>
              <p className="mt-4 leading-7 text-slate-700 dark:text-slate-300">
                {listing.description}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button type="button" icon={Heart} loading={favoriteSaving} onClick={toggleFavorite}>
                  {favorited ? "Remove from Wishlist" : "Add to Wishlist"}
                </Button>
              </div>
            </div>
          </div>
          <aside className="space-y-5">
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-4xl font-black tracking-tight">
                {formatCurrency(listing.price)}
              </p>
            <Link to={`/listings/${listing.id}/chat`} className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-brand-600 bg-brand-600 px-4 py-2 text-base font-semibold text-white transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2">
              Make offer
            </Link>
              <Link
                to={`/category/${listing.category}`}
                className="mt-3 flex items-center gap-3 rounded-lg bg-blue-50 p-3 text-blue-900 transition hover:bg-blue-100 dark:bg-blue-500/15 dark:text-blue-100"
              >
                <img
                  src={listing.images?.[0]}
                  alt=""
                  className="h-10 w-10 rounded-md object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-black">
                    More deals in {listing.category}
                  </p>
                  <p className="text-xs">Limited period local offers</p>
                </div>
                <ChevronRight className="h-5 w-5" />
              </Link>
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <div className="p-5">
                <Link to={`/seller/${listing.seller.id}`} className="flex items-center gap-4 rounded-lg transition hover:bg-slate-50 dark:hover:bg-slate-800">
                  <img
                    src={listing.seller.avatar}
                    alt={listing.seller.name}
                    className="h-20 w-20 rounded-full object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Posted by
                    </p>
                    <p className="truncate text-lg font-black text-blue-700 dark:text-blue-300">
                      {listing.seller.name}
                    </p>
                    <p className="font-semibold text-slate-600 dark:text-slate-300">
                      Member since {formatMonthYear(listing.seller.createdAt)}
                    </p>
                  </div>
                  <ChevronRight className="h-6 w-6" />
                </Link>
                <div className="my-5 grid place-items-center border-y border-slate-200 py-4 text-center dark:border-slate-800">
                  <p className="text-2xl font-black text-blue-700 dark:text-blue-300">
                    {listing.seller.itemsListed}
                  </p>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                    Items listed
                  </p>
                </div>
                <div className="grid gap-2">
                <Link to={`/listings/${listing.id}/chat`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-brand-600 bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2">
                  <MessageCircle className="h-5 w-5" />
                  Chat with seller
                </Link>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-lg font-black">Posted in</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {listing.location}
              </p>
              <a
                href={mapSearchUrl(listing.location)}
                target="_blank"
                rel="noreferrer"
                className="relative mt-4 block h-56 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-950"
              >
                <iframe
                  title={`Map for ${listing.location}`}
                  src={mapEmbedUrl(listing.location)}
                  className="h-full w-full border-0"
                  loading="lazy"
                />
                <span className="absolute bottom-3 left-3 rounded-md bg-white/90 px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm dark:bg-slate-900/90 dark:text-slate-300">
                  Open map
                </span>
              </a>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-lg font-black">Report product</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Tell us if this listing looks suspicious, misleading, or unsafe.
              </p>
              <button
                type="button"
                onClick={() => setReportOpen(true)}
                className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-bold text-rose-700 transition hover:bg-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200"
              >
                <Flag className="h-5 w-5" />
                Report product
              </button>
            </div>
          </aside>
        </div>
        <div className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black">Similar Listings</h2>
            <Link
              to={`/category/${listing.category}`}
              className="text-sm font-bold text-brand-600"
            >
              View category
            </Link>
          </div>
          <div className="mt-5">
            <ListingGrid
              listings={similarListings
                .filter((item) => item.id !== listing.id)
                .slice(0, 4)}
            />
          </div>
        </div>
      </section>
      {reportOpen ? (
        <div
          className="fixed inset-0 z-50 grid min-h-screen place-items-center bg-slate-950/50 px-4 py-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-dialog-title"
        >
          <button
            className="absolute inset-0"
            onClick={() => setReportOpen(false)}
            aria-label="Close report form"
          />
          <form
            onSubmit={submitReport}
            className="relative w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-950"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
              <h2
                id="report-dialog-title"
                className="text-lg font-black text-slate-950 dark:text-white"
              >
                Report product
              </h2>
              <button
                type="button"
                onClick={() => setReportOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                aria-label="Close report form"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 p-5">
              <label className="block">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  Select reason
                </span>
                <select
                  value={reportForm.reason}
                  onChange={(event) =>
                    setReportForm((value) => ({
                      ...value,
                      reason: event.target.value,
                    }))
                  }
                  className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                  <option value="">Choose a reason</option>
                  {reportReasons.map((reason) => (
                    <option key={reason.value} value={reason.value}>{reason.label}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  Description
                </span>
                <textarea
                  value={reportForm.description}
                  onChange={(event) =>
                    setReportForm((value) => ({
                      ...value,
                      description: event.target.value,
                    }))
                  }
                  className="mt-2 min-h-32 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  placeholder="Write more details about the issue"
                />
              </label>
              <Button className="w-full" icon={Flag} loading={reportSubmitting}>
                Send complaint
              </Button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
};

export default ListingDetailsPage;
