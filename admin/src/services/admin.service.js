import api from './api';

const dataOf = (response) => response?.data ?? response;
const arrayOf = (response) => {
  const value = dataOf(response);
  return Array.isArray(value) ? value : [];
};

const normalizePaged = (response) => ({
  data: response?.data ?? [],
  meta: response?.meta ?? { total: response?.data?.length ?? 0, page: 1, limit: 12, totalPages: 1 },
});

const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const recentSixMonths = () => {
  const now = new Date();
  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      month: monthLabels[date.getMonth()],
      year: date.getFullYear(),
    };
  });
};

const groupByMonth = (items, valueKey) => {
  const months = recentSixMonths();
  return months.map((month) => ({
    month: month.month,
    [valueKey]: items.filter((item) => {
      if (!item.createdAt) return false;
      const date = new Date(item.createdAt);
      return `${date.getFullYear()}-${date.getMonth()}` === month.key;
    }).length,
  }));
};

const formatPrice = (price) => `₹${Number(price || 0).toLocaleString('en-IN')}`;

const formDataFrom = (values) => {
  const formData = new FormData();
  formData.append('name', values.name);
  const file = values.image?.[0];
  if (file) formData.append('image', file);
  return formData;
};

export const adminService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return {
      token: response.accessToken,
      refreshToken: response.refreshToken,
      user: response.user,
    };
  },
  getDashboard: async () => {
    const dashboardResponse = await api.get('/admin/dashboard');
    const [usersResult, listingsResult, approvedResult, categoriesResult, reportsResult] = await Promise.allSettled([
      api.get('/admin/users', { params: { page: 1, limit: 50 } }),
      api.get('/admin/listings', { params: { page: 1, limit: 50 } }),
      api.get('/listings', { params: { page: 1, limit: 1 } }),
      api.get('/categories'),
      api.get('/admin/reports'),
    ]);
    const counts = dataOf(dashboardResponse) || {};
    const usersResponse = usersResult.status === 'fulfilled' ? usersResult.value : {};
    const listingsResponse = listingsResult.status === 'fulfilled' ? listingsResult.value : {};
    const approvedResponse = approvedResult.status === 'fulfilled' ? approvedResult.value : {};
    const categoriesResponse = categoriesResult.status === 'fulfilled' ? categoriesResult.value : [];
    const reportsResponse = reportsResult.status === 'fulfilled' ? reportsResult.value : [];
    const userRows = usersResponse.data || [];
    const listingRows = listingsResponse.data || [];
    const categoryRows = arrayOf(categoriesResponse);
    const reportRows = arrayOf(reportsResponse);
    const approvedTotal = approvedResponse.meta?.total ?? listingRows.filter((item) => item.status === 'APPROVED').length;
    const categoryDistribution = categoryRows
      .map((category) => ({
        name: category.name,
        value: listingRows.filter((listing) => listing.categoryId === category.id || listing.category?.id === category.id).length,
      }))
      .filter((item) => item.value > 0);

    return {
      stats: [
        { label: 'Total Users', value: counts.users ?? 0, trend: 'Live' },
        { label: 'Total Listings', value: counts.listings ?? 0, trend: 'Live' },
        { label: 'Active Listings', value: approvedTotal, trend: 'Published' },
        { label: 'Sold Listings', value: counts.soldListings ?? 0, trend: 'Live' },
        { label: 'Total Categories', value: counts.categories ?? 0, trend: 'Live' },
        { label: 'Total Reports', value: counts.openReports ?? 0, trend: 'Open' },
      ],
      listingsGrowth: groupByMonth(listingRows, 'listings'),
      userRegistration: groupByMonth(userRows, 'users'),
      categoryDistribution,
      latestUsers: userRows.slice(0, 5),
      latestListings: listingRows.slice(0, 5).map((listing) => ({
        ...listing,
        title: listing.title,
        price: formatPrice(listing.price),
        status: listing.status,
      })),
      latestReports: reportRows.slice(0, 5).map((report) => ({
        ...report,
        listing: report.listing?.title || report.reportedUser?.name || 'Reported user',
      })),
    };
  },
  getUsers: async (params = {}) => normalizePaged(await api.get('/admin/users', { params })),
  updateUser: async (id, payload) => dataOf(await api.patch(`/admin/users/${id}`, payload)),
  getCategories: async () => arrayOf(await api.get('/categories')),
  createCategory: async (values) => dataOf(await api.post('/categories', formDataFrom(values))),
  updateCategory: async (id, values) => dataOf(await api.patch(`/categories/${id}`, formDataFrom(values))),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
  getListings: async (params = {}) => normalizePaged(await api.get('/admin/listings', { params })),
  deleteListing: (id) => api.delete(`/listings/${id}`),
  markListingSold: async (id) => dataOf(await api.patch(`/listings/${id}/sold`)),
  getReports: async () => arrayOf(await api.get('/admin/reports')),
  updateReport: async (id, status) => dataOf(await api.patch(`/admin/reports/${id}`, { status })),
  getNotifications: async () => arrayOf(await api.get('/notifications')),
};
