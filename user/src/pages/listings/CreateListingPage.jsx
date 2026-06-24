import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ListingForm from "../../components/forms/ListingForm";
import { marketplaceService } from "../../services/marketplace.service";
import { categories as mockCategories } from "../../constants/mockData";
import { useState } from "react";
import { useMarketplace } from "../../hooks/useMarketplace";

const CreateListingPage = () => {
  const navigate = useNavigate();
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const { data: loadedCategories } = useMarketplace(() => marketplaceService.getCategories(), []);
  const categories = Array.isArray(loadedCategories) && loadedCategories.length ? loadedCategories : mockCategories;
  const selectedCategory = categories.find((category) => String(category.id) === String(selectedCategoryId));

  const submit = async (values) => {
    await marketplaceService.createListing(values);
    toast.success("Listing created");
    navigate("/my-listings");
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-black">{selectedCategory ? `Sell ${selectedCategory.name}` : "What are you selling?"}</h1>
      <p className="mt-2 text-slate-500">{selectedCategory ? "Add clear details and photos to reach buyers faster." : "Choose a category first so we can show the right listing form."}</p>
      {!selectedCategory ? (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setSelectedCategoryId(String(category.id))}
              className="group text-center"
            >
              <div className="aspect-square overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition group-hover:-translate-y-0.5 group-hover:border-brand-200 group-hover:shadow-soft dark:border-slate-800 dark:bg-slate-900 dark:group-hover:border-brand-500/50">
                <img src={category.image} alt={category.name} className="h-full w-full object-cover transition group-hover:scale-105" />
              </div>
              <p className="mt-3 font-black leading-tight text-slate-950 dark:text-white">{category.name}</p>
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-6">
          <button type="button" onClick={() => setSelectedCategoryId("")} className="mb-4 text-sm font-bold text-brand-600">Change category</button>
          <ListingForm key={selectedCategory.id} onSubmit={submit} defaultValues={{ category: String(selectedCategory.id) }} categoryOptions={categories} />
        </div>
      )}
    </section>
  );
};

export default CreateListingPage;
