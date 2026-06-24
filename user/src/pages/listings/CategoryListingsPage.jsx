import { Link, useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import Button from "../../components/common/Button";
import ErrorState from "../../components/common/ErrorState";
import { ListingGridSkeleton } from "../../components/common/Skeleton";
import ListingGrid from "../../components/listing/ListingGrid";
import { useLocationFilter } from "../../hooks/useLocationFilter";
import { useMarketplace } from "../../hooks/useMarketplace";
import { marketplaceService } from "../../services/marketplace.service";

const CategoryListingsPage = () => {
  const { categoryId } = useParams();
  const [priceDraft, setPriceDraft] = useState({ minPrice: "", maxPrice: "" });
  const [priceFilters, setPriceFilters] = useState({ minPrice: "", maxPrice: "" });
  const [selectedLocation] = useLocationFilter();
  const { data: categoryData } = useMarketplace(() => marketplaceService.getCategories(), []);
  const categories = Array.isArray(categoryData) ? categoryData : [];
  const category = categories.find((item) => item.id === categoryId);
  const filters = useMemo(() => ({ category: categoryId, location: selectedLocation, ...priceFilters }), [categoryId, selectedLocation, priceFilters]);
  const { data, loading, error, reload } = useMarketplace(() => marketplaceService.getListings(filters), [filters]);
  const listings = Array.isArray(data) ? data : [];

  const applyPrice = () => setPriceFilters(priceDraft);
  const clearPrice = () => {
    const emptyFilters = { minPrice: "", maxPrice: "" };
    setPriceDraft(emptyFilters);
    setPriceFilters(emptyFilters);
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-black">{category?.name || "Category"} Listings</h1>
      <p className="mt-2 text-slate-500">Browse local deals in this category{selectedLocation ? ` around ${selectedLocation}` : ""}.</p>
      <div className="mt-6 grid gap-6 lg:grid-cols-[18rem_1fr]">
        <aside className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div>
            <h2 className="text-lg font-black">Categories</h2>
            <div className="mt-3 space-y-1">
              {categories.map((item) => (
                <Link
                  key={item.id}
                  to={`/category/${item.id}`}
                  className={`block rounded-lg px-3 py-2 text-sm font-semibold transition hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-500/15 ${
                    item.id === categoryId
                      ? "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-100"
                      : "text-slate-700 dark:text-slate-200"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="mt-6 border-t border-slate-200 pt-5 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black">Price</h2>
              <button type="button" onClick={clearPrice} className="text-sm font-bold text-brand-600">Clear</button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Min</span>
                <input
                  type="number"
                  min="0"
                  value={priceDraft.minPrice}
                  onChange={(event) => setPriceDraft((value) => ({ ...value, minPrice: event.target.value }))}
                  className="mt-1 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-950"
                  placeholder="₹0"
                />
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Max</span>
                <input
                  type="number"
                  min="0"
                  value={priceDraft.maxPrice}
                  onChange={(event) => setPriceDraft((value) => ({ ...value, maxPrice: event.target.value }))}
                  className="mt-1 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-950"
                  placeholder="Any"
                />
              </label>
            </div>
            <Button className="mt-4 w-full" onClick={applyPrice}>Apply Price</Button>
          </div>
        </aside>
        <div>
          {error ? <ErrorState message={error} onRetry={reload} /> : loading ? <ListingGridSkeleton /> : <ListingGrid listings={listings} />}
        </div>
      </div>
    </section>
  );
};

export default CategoryListingsPage;
