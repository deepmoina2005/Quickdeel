import EmptyState from "../common/EmptyState";
import ListingCard from "./ListingCard";

const ListingGrid = ({ listings, defaultFavorited = false, onFavoriteChange }) => {
  if (!listings?.length) return <EmptyState title="No listings found" />;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {listings.map((listing) => (
        <ListingCard
          key={listing.id}
          listing={listing}
          defaultFavorited={defaultFavorited}
          onFavoriteChange={onFavoriteChange}
        />
      ))}
    </div>
  );
};

export default ListingGrid;
