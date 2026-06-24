import { CalendarDays, Flag, Share2, UserPlus, Users } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import Button from "../../components/common/Button";
import EmptyState from "../../components/common/EmptyState";
import ErrorState from "../../components/common/ErrorState";
import Skeleton from "../../components/common/Skeleton";
import ListingCard from "../../components/listing/ListingCard";
import { useAuth } from "../../context/AuthContext";
import { useMarketplace } from "../../hooks/useMarketplace";
import { marketplaceService } from "../../services/marketplace.service";

const SellerProfilePage = () => {
  const { sellerId } = useParams();
  const { isAuthenticated, refreshUser, user } = useAuth();
  const [followLoading, setFollowLoading] = useState(false);
  const { data, loading, error, reload } = useMarketplace(() => marketplaceService.getSellerProfile(sellerId), [sellerId]);
  const seller = data?.seller;
  const sellerListings = data?.listings || [];
  const isOwnProfile = String(user?.id) === String(seller?.id);
  const isFollowing = (user?.following || []).some((person) => String(person.id) === String(seller?.id));
  const followersCount = Number(seller?.followersCount || 0);
  const followingCount = Number(seller?.followingCount || 0);

  const toggleFollow = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to follow sellers");
      return;
    }

    if (isOwnProfile) {
      toast.error("You cannot follow yourself");
      return;
    }

    setFollowLoading(true);
    try {
      if (isFollowing) {
        await marketplaceService.unfollowSeller(seller.id);
        toast.success("Seller unfollowed");
      } else {
        await marketplaceService.followSeller(seller.id);
        toast.success("Seller followed");
      }

      await refreshUser();
      await reload();
    } catch (err) {
      toast.error(err?.message || "Follow action failed");
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[20rem_1fr]">
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-96 w-full" />
      </section>
    );
  }

  if (error) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-10">
        <ErrorState message={error} onRetry={reload} />
      </section>
    );
  }

  if (!seller) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-10">
        <EmptyState title="Seller not found" description="This seller profile is not available." />
      </section>
    );
  }

  return (
    <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[20rem_1fr]">
      <aside className="space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center dark:border-slate-800 dark:bg-slate-900">
          <img src={seller.avatar} alt={seller.name} className="mx-auto h-36 w-36 rounded-full object-cover" />
          <h1 className="mt-4 text-2xl font-black text-slate-950 dark:text-white">{seller.name}</h1>
          {!isOwnProfile ? (
          <button type="button" onClick={toggleFollow} disabled={followLoading} className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-brand-600 px-4 text-sm font-bold text-brand-700 transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-60 dark:text-brand-100 dark:hover:bg-brand-500/15">
            <UserPlus className="h-4 w-4" />
            {isFollowing ? "Following" : "Follow"}
          </button>
          ) : null}
          <div className="mt-6 space-y-3 text-left text-sm text-slate-700 dark:text-slate-300">
            <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4" />Member since {seller.createdAt ? new Date(seller.createdAt).toLocaleDateString([], { month: "short", year: "numeric" }) : "Nov 2022"}</p>
            <p className="flex items-center gap-2"><Users className="h-4 w-4" />{followersCount} Followers <span className="mx-1">|</span> {followingCount} Following</p>
          </div>
          <div className="mt-6 grid gap-3">
            <Button icon={Share2}>Share profile</Button>
            <Button variant="secondary" icon={Flag}>Report user</Button>
          </div>
        </div>
      </aside>
      <div>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-950 dark:text-white">Listings by {seller.name}</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{sellerListings.length} items listed</p>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sellerListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SellerProfilePage;
