import { locations } from "../../constants/mockData";
import { useMarketplace } from "../../hooks/useMarketplace";
import { marketplaceService } from "../../services/marketplace.service";
import Button from "../common/Button";
import Select from "../common/Select";

const FilterSidebar = ({ filters, setFilters, onClear }) => {
  const { data } = useMarketplace(() => marketplaceService.getCategories(), []);
  const categories = Array.isArray(data) ? data : [];

  return (
    <aside className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-black">Filters</h2>
      <button onClick={onClear} className="text-sm font-bold text-brand-600">Clear</button>
    </div>
    <div className="mt-5 space-y-4">
      <Select label="Category" value={filters.category || ""} onChange={(event) => setFilters({ ...filters, category: event.target.value })}>
        <option value="">All Categories</option>
        {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
      </Select>
      <Select label="Location" value={filters.location || ""} onChange={(event) => setFilters({ ...filters, location: event.target.value })}>
        <option value="">All Locations</option>
        {locations.map((location) => <option key={location} value={location}>{location}</option>)}
      </Select>
      <Select label="Condition" value={filters.condition || ""} onChange={(event) => setFilters({ ...filters, condition: event.target.value })}>
        <option value="">Any Condition</option>
        <option>New</option>
        <option>Like New</option>
        <option>Used</option>
        <option>Good</option>
      </Select>
      <Button className="w-full">Apply Filters</Button>
    </div>
    </aside>
  );
};

export default FilterSidebar;
