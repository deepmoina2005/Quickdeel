import { Heart, MapPin } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import Badge from "../common/Badge";
import { useAuth } from "../../context/AuthContext";
import { marketplaceService } from "../../services/marketplace.service";
import { formatCurrency, formatDate } from "../../utils/format";

const ListingCard = ({ listing, defaultFavorited = false, onFavoriteChange }) => {
  const { isAuthenticated } = useAuth();
  const [favorited, setFavorited] = useState(Boolean(defaultFavorited || listing.isFavorited));
  const [saving, setSaving] = useState(false);

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to use wishlist");
      return;
    }
    if (saving) return;

    const nextFavorited = !favorited;
    setSaving(true);
    setFavorited(nextFavorited);
    try {
      if (nextFavorited) {
        await marketplaceService.addFavorite(listing.id);
        toast.success("Added to wishlist");
      } else {
        await marketplaceService.removeFavorite(listing.id);
        toast.success("Removed from wishlist");
      }
      onFavoriteChange?.(listing.id, nextFavorited);
    } catch (err) {
      setFavorited(!nextFavorited);
      toast.error(err?.message || "Wishlist update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <Link to={`/listings/${listing.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          <img src={listing.images?.[0]} alt={listing.title} className="h-full w-full object-cover transition duration-300 hover:scale-105" />
          {listing.featured ? <Badge className="absolute left-3 top-3">Featured</Badge> : null}
        </div>
      </Link>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xl font-black">{formatCurrency(listing.price)}</p>
            <Link to={`/listings/${listing.id}`} className="mt-1 block font-semibold line-clamp-2">{listing.title}</Link>
          </div>
          <button
            type="button"
            onClick={toggleFavorite}
            disabled={saving}
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border transition disabled:cursor-not-allowed disabled:opacity-60 ${favorited ? "border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300" : "border-slate-200 hover:bg-brand-50 dark:border-slate-700 dark:hover:bg-slate-800"}`}
            aria-label={favorited ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={`h-5 w-5 ${favorited ? "fill-current" : ""}`} />
          </button>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{listing.location}</span>
          <span>{formatDate(listing.createdAt)}</span>
        </div>
      </div>
    </article>
  );
};

export default ListingCard;
