import { Eye, MessageCircle, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import EmptyState from "../../components/common/EmptyState";
import { useMarketplace } from "../../hooks/useMarketplace";
import { marketplaceService } from "../../services/marketplace.service";
import { formatCurrency, formatDate } from "../../utils/format";

const fallbackImage = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=240&auto=format&fit=crop";

const MyPurchasesPage = () => {
  const { data } = useMarketplace(() => marketplaceService.getPurchases(), []);
  const purchases = Array.isArray(data) ? data : [];

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div>
        <h1 className="text-3xl font-black">My Purchases</h1>
        <p className="mt-2 text-slate-500">Products where your purchase has been completed.</p>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        {!purchases.length ? (
          <EmptyState title="No completed purchases yet" description="Accepted offers will appear here after a deal is completed." icon={ShoppingBag} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-900">
                <tr>
                  <th className="px-4 py-3">Image</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Seller</th>
                  <th className="px-4 py-3">Purchase Price</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Completed On</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((purchase) => (
                  <tr key={purchase.id} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="px-4 py-3">
                      <img src={purchase.listing?.images?.[0] || fallbackImage} alt={purchase.listing?.title} className="h-14 w-16 rounded-lg object-cover" />
                    </td>
                    <td className="px-4 py-3">
                      <Link to={`/listings/${purchase.listing?.id}`} className="font-bold hover:text-brand-600">{purchase.listing?.title}</Link>
                    </td>
                    <td className="px-4 py-3">{purchase.seller.name}</td>
                    <td className="px-4 py-3 font-black">{formatCurrency(purchase.amount)}</td>
                    <td className="px-4 py-3">{purchase.listing?.location || "-"}</td>
                    <td className="px-4 py-3">{purchase.completedAt ? formatDate(purchase.completedAt) : "-"}</td>
                    <td className="px-4 py-3"><Badge>Completed</Badge></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link to={`/listings/${purchase.listing?.id}`}>
                          <Button variant="secondary" icon={Eye} aria-label="View product" className="h-11 w-11 px-0" />
                        </Link>
                        <Link to={`/listings/${purchase.listing?.id}/chat`}>
                          <Button variant="secondary" icon={MessageCircle} aria-label="Open chat" className="h-11 w-11 px-0" />
                        </Link>
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

export default MyPurchasesPage;
