import ListingGrid from "../../components/listing/ListingGrid";
import EmptyState from "../../components/common/EmptyState";
import { useMarketplace } from "../../hooks/useMarketplace";
import { marketplaceService } from "../../services/marketplace.service";

const WishlistPage = () => {
  const { data, reload } = useMarketplace(() => marketplaceService.getFavorites(), []);
  const listings = Array.isArray(data) ? data : [];

  const handleFavoriteChange = (listingId, isFavorited) => {
    if (!isFavorited) reload();
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-black">Wishlist</h1>
      <p className="mt-2 text-slate-500">Your saved marketplace listings.</p>
      <div className="mt-6">
        {listings.length ? (
          <ListingGrid listings={listings} defaultFavorited onFavoriteChange={handleFavoriteChange} />
        ) : (
          <EmptyState title="No saved listings" />
        )}
      </div>
    </section>
  );
};

export default WishlistPage;
