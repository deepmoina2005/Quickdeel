import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ErrorState from "../../components/common/ErrorState";
import Input from "../../components/common/Input";
import Pagination from "../../components/common/Pagination";
import { ListingGridSkeleton } from "../../components/common/Skeleton";
import FilterSidebar from "../../components/listing/FilterSidebar";
import ListingGrid from "../../components/listing/ListingGrid";
import { useLocationFilter } from "../../hooks/useLocationFilter";
import { useMarketplace } from "../../hooks/useMarketplace";
import { marketplaceService } from "../../services/marketplace.service";

const pageSize = 8;

const BrowseListingsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedLocation] = useLocationFilter();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    q: searchParams.get("q") || "",
    category: searchParams.get("category") || "",
    location: searchParams.get("location") || selectedLocation || "",
    condition: "",
  });

  useEffect(() => {
    setFilters((current) => ({
      ...current,
      q: searchParams.get("q") || "",
      category: searchParams.get("category") || "",
      location: searchParams.get("location") || selectedLocation || "",
    }));
    setPage(1);
  }, [searchParams, selectedLocation]);

  const { data, loading, error, reload } = useMarketplace(() => marketplaceService.getListings(filters), [filters]);
  const listings = Array.isArray(data) ? data : [];
  const totalPages = Math.max(1, Math.ceil(listings.length / pageSize));
  const pageItems = useMemo(() => listings.slice((page - 1) * pageSize, page * pageSize), [listings, page]);

  const applySearch = (event) => {
    event.preventDefault();
    setPage(1);
    setSearchParams(filters);
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-black">Browse Listings</h1>
      <form onSubmit={applySearch} className="mt-5">
        <Input icon={Search} value={filters.q} onChange={(event) => setFilters({ ...filters, q: event.target.value })} placeholder="Search listings" />
      </form>
      <div className="mt-6 grid gap-6 lg:grid-cols-[18rem_1fr]">
        <FilterSidebar filters={filters} setFilters={setFilters} onClear={() => setFilters({ q: "", category: "", location: "", condition: "" })} />
        <div>
          {error ? <ErrorState message={error} onRetry={reload} /> : loading ? <ListingGridSkeleton /> : <ListingGrid listings={pageItems} />}
          {!loading && !error ? <div className="mt-5"><Pagination page={page} totalPages={totalPages} onPageChange={setPage} /></div> : null}
        </div>
      </div>
    </section>
  );
};

export default BrowseListingsPage;
