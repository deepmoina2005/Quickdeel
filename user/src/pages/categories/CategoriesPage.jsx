import { Link } from "react-router-dom";
import { useMarketplace } from "../../hooks/useMarketplace";
import { marketplaceService } from "../../services/marketplace.service";

const CategoriesPage = () => {
  const { data } = useMarketplace(() => marketplaceService.getCategories(), []);
  const categories = Array.isArray(data) ? data : [];

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">All Categories</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Browse every QuickDeal category in one place.</p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
        {categories.map((category) => (
          <Link key={category.id} to={`/category/${category.id}`} className="group text-center">
            <div className="aspect-square overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition group-hover:-translate-y-0.5 group-hover:border-brand-200 group-hover:shadow-soft dark:border-slate-800 dark:bg-slate-900 dark:group-hover:border-brand-500/50">
              <img src={category.image} alt={category.name} className="h-full w-full object-cover transition group-hover:scale-105" />
            </div>
            <p className="mt-3 font-black leading-tight text-slate-950 dark:text-white">{category.name}</p>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategoriesPage;
