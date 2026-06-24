import { ArrowRight, MapPin, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import ErrorState from "../../components/common/ErrorState";
import { ListingGridSkeleton } from "../../components/common/Skeleton";
import ListingGrid from "../../components/listing/ListingGrid";
import { useLocationFilter } from "../../hooks/useLocationFilter";
import { useMarketplace } from "../../hooks/useMarketplace";
import { marketplaceService } from "../../services/marketplace.service";

const HomePage = () => {
  const navigate = useNavigate();
  const [selectedLocation] = useLocationFilter();
  const { data, loading, error, reload } = useMarketplace(() => marketplaceService.getHome({ location: selectedLocation }), [selectedLocation]);

  const search = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const params = new URLSearchParams();
    if (form.get("q")) params.set("q", form.get("q"));
    if (form.get("location")) params.set("location", form.get("location"));
    navigate(`/listings?${params.toString()}`);
  };

  if (error) return <section className="mx-auto max-w-7xl px-4 py-8"><ErrorState message={error} onRetry={reload} /></section>;

  return (
    <>
      <section className="border-b border-slate-200 bg-white text-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <h1 className="max-w-3xl text-4xl font-black tracking-tight md:text-5xl">Find great local deals near you.</h1>
            <p className="mt-4 max-w-2xl text-slate-600 dark:text-slate-300">Search cars, phones, property, furniture, jobs, and daily essentials from trusted local sellers.</p>
            {selectedLocation ? <p className="mt-3 text-sm font-bold text-brand-700 dark:text-brand-300">Showing deals in {selectedLocation}</p> : null}
            <form onSubmit={search} className="mt-6 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:grid-cols-[1fr_14rem_auto]">
              <input name="q" placeholder="Search product, category, seller" className="h-12 rounded-lg border border-slate-200 bg-white px-4 text-slate-900 outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" />
              <input name="location" placeholder="Location" className="h-12 rounded-lg border border-slate-200 bg-white px-4 text-slate-900 outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" />
              <Button icon={Search}>Search</Button>
            </form>
          </div>
          <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80" alt="Marketplace browsing" className="h-80 w-full rounded-xl object-cover" />
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-black">Categories</h2>
          <Link to="/categories" className="flex items-center gap-1 text-sm font-bold text-brand-600">Browse all <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="mt-5 grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
          {(data?.categories || []).map((category) => (
            <Link key={category.id} to={`/category/${category.id}`} className="group text-center">
              <div className="aspect-square overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition group-hover:-translate-y-0.5 group-hover:border-brand-200 group-hover:shadow-soft dark:border-slate-800 dark:bg-slate-900 dark:group-hover:border-brand-500/50">
                <img src={category.image} alt={category.name} className="h-full w-full object-cover transition group-hover:scale-105" />
              </div>
              <p className="mt-3 font-black leading-tight text-slate-950 dark:text-white">{category.name}</p>
            </Link>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 pb-10">
        <h2 className="text-2xl font-black">Featured Listings</h2>
        <div className="mt-5">{loading ? <ListingGridSkeleton /> : <ListingGrid listings={data?.featuredListings} />}</div>
      </section>
      <section className="mx-auto max-w-7xl px-4 pb-10">
        <h2 className="text-2xl font-black">Latest Listings</h2>
        <div className="mt-5">{loading ? <ListingGridSkeleton /> : <ListingGrid listings={data?.latestListings} />}</div>
      </section>
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <h2 className="text-2xl font-black">Popular Locations</h2>
        <div className="mt-5 flex flex-wrap gap-3">
          {(data?.locations || []).map((location) => (
            <Link key={location} to={`/location/${location}`} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold dark:border-slate-800 dark:bg-slate-900">
              <MapPin className="h-4 w-4 text-brand-600" />{location}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
};

export default HomePage;
