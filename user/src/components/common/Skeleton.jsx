import { cn } from "../../utils/cn";

const Skeleton = ({ className }) => <div className={cn("animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800", className)} />;

export const ListingGridSkeleton = () => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {Array.from({ length: 8 }).map((_, index) => (
      <div key={index} className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        <Skeleton className="aspect-[4/3] w-full" />
        <Skeleton className="mt-4 h-5 w-4/5" />
        <Skeleton className="mt-2 h-4 w-3/5" />
        <Skeleton className="mt-4 h-8 w-1/2" />
      </div>
    ))}
  </div>
);

export default Skeleton;
