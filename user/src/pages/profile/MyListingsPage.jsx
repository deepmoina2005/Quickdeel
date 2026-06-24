import toast from "react-hot-toast";
import { CheckCircle, Eye, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import EmptyState from "../../components/common/EmptyState";
import { useMarketplace } from "../../hooks/useMarketplace";
import { marketplaceService } from "../../services/marketplace.service";
import { formatCurrency, formatDate } from "../../utils/format";

const fallbackImage = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=240&auto=format&fit=crop";

const MyListingsPage = () => {
  const { data, reload } = useMarketplace(() => marketplaceService.getMyListings(), []);
  const listings = Array.isArray(data) ? data : [];

  const markSold = async (listing) => {
    if (listing.status === "SOLD" || listing.status === "Sold") return;
    await marketplaceService.markListingSold(listing.id);
    toast.success("Listing marked as sold");
    reload();
  };

  const deleteListing = async (listing) => {
    if (!window.confirm(`Delete ${listing.title}?`)) return;
    await marketplaceService.deleteListing(listing.id);
    toast.success("Listing deleted");
    reload();
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black">My Listings</h1>
          <p className="mt-2 text-slate-500">Create, delete, and mark listings as sold.</p>
        </div>
        <Link to="/sell"><Button icon={Plus}>Create Listing</Button></Link>
      </div>
      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        {!listings.length ? (
          <EmptyState title="No listings yet" description="Create your first listing from the Sell page." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-900">
                <tr>
                  <th className="px-4 py-3">Image</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Posted On</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((listing) => (
                  <tr key={listing.id} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="px-4 py-3">
                      <img src={listing.images?.[0] || fallbackImage} alt={listing.title} className="h-14 w-16 rounded-lg object-cover" />
                    </td>
                    <td className="px-4 py-3">
                      <Link to={`/listings/${listing.id}`} className="font-bold hover:text-brand-600">{listing.title}</Link>
                    </td>
                    <td className="px-4 py-3 font-bold">{formatCurrency(listing.price)}</td>
                    <td className="px-4 py-3">{listing.location}</td>
                    <td className="px-4 py-3">{listing.createdAt ? formatDate(listing.createdAt) : "-"}</td>
                    <td className="px-4 py-3"><Badge>{listing.status}</Badge></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link to={`/listings/${listing.id}`}>
                          <Button variant="secondary" icon={Eye} aria-label="View listing" className="h-11 w-11 px-0" />
                        </Link>
                        <Button
                          variant="secondary"
                          icon={CheckCircle}
                          aria-label="Mark sold"
                          className="h-11 w-11 px-0"
                          disabled={listing.status === "Sold" || listing.status === "SOLD"}
                          onClick={() => markSold(listing)}
                        />
                        <Button variant="danger" icon={Trash2} aria-label="Delete" className="h-11 w-11 px-0" onClick={() => deleteListing(listing)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default MyListingsPage;
