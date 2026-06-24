import { Bell } from "lucide-react";
import EmptyState from "../../components/common/EmptyState";
import { useMarketplace } from "../../hooks/useMarketplace";
import { marketplaceService } from "../../services/marketplace.service";

const NotificationsPage = () => {
  const { data } = useMarketplace(() => marketplaceService.getNotifications(), []);
  const notifications = Array.isArray(data) ? data : [];

  return (
    <section className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-black">Notifications</h1>
      <div className="mt-6 space-y-3">
        {!notifications.length ? <EmptyState title="No notifications" /> : notifications.map((item) => (
          <div key={item.id} className="flex gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <Bell className={`mt-1 h-5 w-5 ${item.read ? "text-slate-400" : "text-brand-600"}`} />
            <div>
              <p className="font-bold">{item.title}</p>
              <p className="text-sm text-slate-500">{item.message}</p>
              <p className="mt-1 text-xs text-slate-400">{item.createdAt}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default NotificationsPage;
