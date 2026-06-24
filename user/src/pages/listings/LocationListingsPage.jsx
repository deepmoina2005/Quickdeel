import { useParams } from "react-router-dom";
import ErrorState from "../../components/common/ErrorState";
import { ListingGridSkeleton } from "../../components/common/Skeleton";
import ListingGrid from "../../components/listing/ListingGrid";
import { useMarketplace } from "../../hooks/useMarketplace";
import { marketplaceService } from "../../services/marketplace.service";

const LocationListingsPage = () => {
  const { locationName } = useParams();
  const { data, loading, error, reload } = useMarketplace(() => marketplaceService.getListings({ location: locationName }), [locationName]);
  const listings = Array.isArray(data) ? data : [];

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-black">Listings in {locationName}</h1>
      <p className="mt-2 text-slate-500">Find available products and services around this location.</p>
      <div className="mt-6">
        {error ? <ErrorState message={error} onRetry={reload} /> : loading ? <ListingGridSkeleton /> : <ListingGrid listings={listings} />}
      </div>
    </section>
  );
};

export default LocationListingsPage;
