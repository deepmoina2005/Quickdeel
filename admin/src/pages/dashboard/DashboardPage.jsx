import { useCallback } from 'react';
import { Area, AreaChart, Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Flag, FolderTree, ListChecks, ShoppingBag, Tag, Users } from 'lucide-react';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import PageHeader from '../../components/common/PageHeader';
import { CardSkeleton } from '../../components/common/Skeleton';
import ChartCard from '../../components/dashboard/ChartCard';
import RecentPanel from '../../components/dashboard/RecentPanel';
import StatCard from '../../components/dashboard/StatCard';
import { useAdminData } from '../../hooks/useAdminData';
import { adminService } from '../../services/admin.service';

const icons = [Users, ListChecks, ShoppingBag, Tag, FolderTree, Flag];
const colors = ['#10b981', '#2563eb', '#f59e0b', '#ef4444', '#8b5cf6'];
const emptyDashboard = {
  stats: [
    { label: 'Total Users', value: 0, trend: 'Live' },
    { label: 'Total Listings', value: 0, trend: 'Live' },
    { label: 'Active Listings', value: 0, trend: 'Approved' },
    { label: 'Sold Listings', value: 0, trend: 'Live' },
    { label: 'Total Categories', value: 0, trend: 'Live' },
    { label: 'Total Reports', value: 0, trend: 'Open' },
  ],
  listingsGrowth: [],
  userRegistration: [],
  categoryDistribution: [],
  latestUsers: [],
  latestListings: [],
  latestReports: [],
};

export default function DashboardPage() {
  const loader = useCallback(() => adminService.getDashboard(), []);
  const { data, loading, error } = useAdminData(loader, emptyDashboard);
  const dashboard = { ...emptyDashboard, ...data };

  return (
    <>
      <PageHeader title="Dashboard" description="Marketplace overview, growth trends, and latest moderation activity." />
      {error && <div className="mb-4"><ErrorState message={error} /></div>}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => <CardSkeleton key={index} />)}
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {dashboard.stats.map((stat, index) => <StatCard key={stat.label} {...stat} icon={icons[index]} />)}
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-3">
            <ChartCard title="Listings Growth">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dashboard.listingsGrowth}>
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="listings" stroke="#059669" fill="#d1fae5" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="User Registration">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboard.userRegistration}>
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="users" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Category Distribution">
              {dashboard.categoryDistribution.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={dashboard.categoryDistribution} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90}>
                      {dashboard.categoryDistribution.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState title="No category data" description="Category distribution will appear after listings are created." />
              )}
            </ChartCard>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <RecentPanel
              title="Latest Users"
              items={dashboard.latestUsers}
              render={(item) => (
                <>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-slate-500">{item.email}</p>
                </>
              )}
            />
            <RecentPanel
              title="Latest Listings"
              items={dashboard.latestListings}
              render={(item) => (
                <>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm text-slate-500">{item.price} - {item.status}</p>
                </>
              )}
            />
            <RecentPanel
              title="Latest Reports"
              items={dashboard.latestReports}
              render={(item) => (
                <>
                  <p className="font-semibold">{item.reason}</p>
                  <p className="text-sm text-slate-500">{item.listing}</p>
                </>
              )}
            />
          </div>
        </>
      )}
    </>
  );
}
