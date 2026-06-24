import { Bell, Heart, Menu, MessageCircle, Search, ShoppingBag, Store, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import AuthDialog from "../auth/AuthDialog";
import Button from "../common/Button";
import LocationSelector from "./LocationSelector";
import ProfileMenu from "./ProfileMenu";
import { useAuth } from "../../context/AuthContext";
import { useLocationFilter } from "../../hooks/useLocationFilter";
import { useMarketplace } from "../../hooks/useMarketplace";
import { marketplaceService } from "../../services/marketplace.service";
import { applyTheme, getPreferredTheme, THEME_STORAGE_KEY } from "../../utils/theme";

const Navbar = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [location, setLocation] = useLocationFilter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [theme, setTheme] = useState(getPreferredTheme);
  const [now, setNow] = useState(() => new Date());
  const { data: categoryData } = useMarketplace(() => marketplaceService.getCategories(), []);
  const categories = Array.isArray(categoryData) ? categoryData : [];

  useEffect(() => {
    setTheme(applyTheme(theme));
  }, [theme]);

  useEffect(() => {
    const syncTheme = (event) => {
      if (event.key === THEME_STORAGE_KEY || event.key === "theme") {
        setTheme(getPreferredTheme());
      }
    };

    window.addEventListener("storage", syncTheme);
    return () => window.removeEventListener("storage", syncTheme);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const runSearch = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (location && location !== "detect") params.set("location", location);
    navigate(`/listings?${params.toString()}`);
    setMobileOpen(false);
  };

  const handleLocationChange = (nextLocation) => {
    setLocation(nextLocation);
  };

  const sell = () => {
    if (isAuthenticated) {
      navigate("/sell");
      return;
    }

    setAuthOpen(true);
  };
  const dateTime = new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(now);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <button className="md:hidden" onClick={() => setMobileOpen((value) => !value)} aria-label="Toggle menu">
          {mobileOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
        </button>
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-600 text-white"><Store className="h-6 w-6" /></span>
          <span className="text-xl font-black tracking-tight">QuickDeal</span>
        </Link>
        <LocationSelector value={location} onChange={handleLocationChange} />
        <form onSubmit={runSearch} className="hidden flex-1 md:block">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by product title, category, location" className="h-12 w-full rounded-lg border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900" />
          </label>
        </form>
        <Link to="/wishlist" className="hidden h-12 w-12 place-items-center rounded-lg text-slate-950 transition hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800 md:grid" aria-label="Wishlist"><Heart className="h-6 w-6" /></Link>
        {isAuthenticated ? (
          <>
            <Link to="/chat" className="hidden h-12 w-12 place-items-center rounded-lg text-slate-950 transition hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800 lg:grid" aria-label="Chat"><MessageCircle className="h-6 w-6" /></Link>
            <Link to="/notifications" className="hidden h-12 w-12 place-items-center rounded-lg text-slate-950 transition hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800 lg:grid" aria-label="Notifications"><Bell className="h-6 w-6" /></Link>
            <ProfileMenu />
          </>
        ) : (
          <div className="hidden items-center gap-2 lg:flex">
            <Button type="button" variant="secondary" onClick={() => setAuthOpen(true)}>Login/Register</Button>
          </div>
        )}
        <Button icon={ShoppingBag} onClick={sell} className="hidden md:inline-flex">Sell</Button>
      </div>
      <nav className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950" aria-label="Categories">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2">
          <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
            <button type="button" onClick={() => setCategoriesOpen(true)} className="inline-flex h-9 shrink-0 items-center gap-2 rounded-full bg-brand-600 px-4 text-xs font-black uppercase text-white transition hover:bg-brand-700">
              <Menu className="h-4 w-4" />
              All Categories
            </button>
            {categories.map((category) => (
              <Link key={category.id} to={`/category/${category.id}`} className="inline-flex h-9 shrink-0 items-center rounded-full border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-brand-500/50 dark:hover:bg-brand-500/15">
                {category.name}
              </Link>
            ))}
          </div>
          <time dateTime={now.toISOString()} className="hidden shrink-0 border-l border-slate-200 pl-3 text-sm font-semibold text-slate-500 dark:border-slate-800 dark:text-slate-400 md:block">
            {dateTime}
          </time>
        </div>
      </nav>
      {mobileOpen ? (
        <div className="border-t border-slate-200 px-4 py-3 dark:border-slate-800 md:hidden">
          <form onSubmit={runSearch} className="space-y-3">
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search QuickDeal" className="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 dark:border-slate-700 dark:bg-slate-900" />
            <Button className="w-full" icon={Search}>Search</Button>
          </form>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button variant="secondary" icon={Heart} onClick={() => navigate("/wishlist")}>Wishlist</Button>
            <Button icon={ShoppingBag} onClick={sell}>Sell</Button>
            {!isAuthenticated ? <Button type="button" variant="secondary" className="col-span-2" onClick={() => setAuthOpen(true)}>Login/Register</Button> : null}
          </div>
        </div>
      ) : null}
      </header>
      <AuthDialog open={authOpen} onClose={() => setAuthOpen(false)} />
      {categoriesOpen ? (
        <div className="fixed inset-0 z-50 grid min-h-screen place-items-center bg-slate-950/50 px-4 py-6" role="dialog" aria-modal="true" aria-labelledby="categories-dialog-title">
          <button className="absolute inset-0" onClick={() => setCategoriesOpen(false)} aria-label="Close categories" />
          <div className="relative max-h-[85vh] w-full max-w-4xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
              <h2 id="categories-dialog-title" className="text-lg font-black text-slate-950 dark:text-white">All Categories</h2>
              <button type="button" onClick={() => setCategoriesOpen(false)} className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800" aria-label="Close categories">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto p-5">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {categories.map((category) => (
                  <Link key={category.id} to={`/category/${category.id}`} onClick={() => setCategoriesOpen(false)} className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-soft dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-500/50">
                    <img src={category.image} alt={category.name} className="h-28 w-full object-cover transition group-hover:scale-105" />
                    <div className="p-3">
                      <p className="font-black text-slate-950 dark:text-white">{category.name}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default Navbar;
