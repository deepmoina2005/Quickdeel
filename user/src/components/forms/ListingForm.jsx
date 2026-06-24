import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, Save, Upload } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { categories } from "../../constants/mockData";
import { listingSchema } from "../../validations/listing.schema";
import Button from "../common/Button";
import Input from "../common/Input";
import Select from "../common/Select";
import Textarea from "../common/Textarea";

const splitLocation = (location = "") => {
  const [city = "", state = "", country = ""] = String(location).split(",").map((part) => part.trim());
  return { city, state, country };
};

const ListingForm = ({ defaultValues, onSubmit, submitLabel = "Create Listing", categoryOptions = categories }) => {
  const formDefaults = useMemo(() => {
    const parsedLocation = splitLocation(defaultValues?.location);
    return {
      title: "",
      description: "",
      category: "",
      price: "",
      condition: "",
      location: "",
      ...defaultValues,
      country: defaultValues?.country || parsedLocation.country || "",
      state: defaultValues?.state || parsedLocation.state || "",
      city: defaultValues?.city || parsedLocation.city || "",
    };
  }, [defaultValues]);
  const selectedCategory = categoryOptions.find((category) => String(category.id) === String(formDefaults.category));
  const categoryName = selectedCategory?.name || "product";
  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(listingSchema),
    defaultValues: formDefaults,
  });
  const imageRegister = register("images");
  const selectedImages = watch("images");
  const selectedCountry = watch("country");
  const selectedState = watch("state");
  const selectedCity = watch("city");
  const allImageFiles = useMemo(() => Array.from(selectedImages || []), [selectedImages]);
  const imageFiles = useMemo(() => allImageFiles.slice(0, 8), [allImageFiles]);
  const imagePreviews = useMemo(() => imageFiles.map((file) => ({
    name: file.name,
    url: URL.createObjectURL(file),
  })), [imageFiles]);

  useEffect(() => () => {
    imagePreviews.forEach((image) => URL.revokeObjectURL(image.url));
  }, [imagePreviews]);

  useEffect(() => {
    reset(formDefaults);
  }, [formDefaults, reset]);

  useEffect(() => {
    const location = [selectedCity, selectedState, selectedCountry]
      .map((value) => String(value || "").trim())
      .filter(Boolean)
      .join(", ");
    setValue("location", location, { shouldValidate: true });
  }, [selectedCity, selectedState, selectedCountry, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-[360px_minmax(0,1fr)]">
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-black text-slate-950 dark:text-white">Product Photos</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Upload 1 to 8 clear images.</p>
        </div>
        <label className="flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-5 text-center transition hover:border-brand-300 hover:bg-brand-50 dark:border-slate-700 dark:bg-slate-950 dark:hover:border-brand-500/60 dark:hover:bg-brand-500/10">
          <input
            type="file"
            multiple
            accept="image/*"
            className="sr-only"
            {...imageRegister}
          />
          <span className="grid h-14 w-14 place-items-center rounded-full bg-white text-brand-600 shadow-sm dark:bg-slate-900 dark:text-brand-300">
            <Upload className="h-6 w-6" />
          </span>
          <span className="mt-4 text-sm font-black text-slate-950 dark:text-white">Click to upload photos</span>
          <span className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">{allImageFiles.length}/8 images selected</span>
        </label>
        {errors.images?.message ? <p className="text-xs font-medium text-red-600">{errors.images.message}</p> : null}
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, index) => {
            const image = imagePreviews[index];
            return (
              <div key={index} className="grid aspect-square place-items-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
                {image ? (
                  <img src={image.url} alt={image.name} className="h-full w-full object-cover" />
                ) : (
                  <ImagePlus className="h-5 w-5 text-slate-300 dark:text-slate-600" />
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-5">
        <div>
          <h2 className="text-xl font-black text-slate-950 dark:text-white">Product Information</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Add price, condition, and buyer-ready details.</p>
        </div>
        {selectedCategory ? (
          <div className="rounded-lg bg-brand-50 px-4 py-3 text-sm font-bold text-brand-700 dark:bg-brand-500/15 dark:text-brand-100">
            Selected category: {selectedCategory.name}
          </div>
        ) : null}
        <Input label="Title" placeholder={`Example: ${categoryName} for sale`} {...register("title")} error={errors.title?.message} />
        <Textarea label="Description" placeholder={`Add ${categoryName.toLowerCase()} details, condition, purchase date, and reason for selling`} {...register("description")} error={errors.description?.message} />
        <div className="grid gap-4 md:grid-cols-2">
          <Select label="Category" {...register("category")} error={errors.category?.message}>
            <option value="">Select category</option>
            {categoryOptions.map((category) => <option key={category.id} value={String(category.id)}>{category.name}</option>)}
          </Select>
          <Input label="Price" type="number" placeholder="25000" {...register("price")} error={errors.price?.message} />
          <Select label="Condition" {...register("condition")} error={errors.condition?.message}>
            <option value="">Select condition</option>
            <option>New</option>
            <option>Like New</option>
            <option>Used</option>
            <option>Good</option>
          </Select>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Input label="Country" placeholder="Example: India" {...register("country")} error={errors.country?.message} />
          <Input label="State" placeholder="Example: Assam" {...register("state")} error={errors.state?.message} />
          <Input label="City" placeholder="Example: Sibsagar" {...register("city")} error={errors.city?.message} />
          <input type="hidden" {...register("location")} />
        </div>
        <Button icon={Save} loading={isSubmitting}>{submitLabel}</Button>
      </section>
    </form>
  );
};

export default ListingForm;
