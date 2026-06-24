import { Route, Routes } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "./ProtectedRoute";
import HomePage from "../pages/home/HomePage";
import CategoriesPage from "../pages/categories/CategoriesPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import BrowseListingsPage from "../pages/listings/BrowseListingsPage";
import ListingDetailsPage from "../pages/listings/ListingDetailsPage";
import MakeOfferPage from "../pages/listings/MakeOfferPage";
import CategoryListingsPage from "../pages/listings/CategoryListingsPage";
import LocationListingsPage from "../pages/listings/LocationListingsPage";
import SellerProfilePage from "../pages/sellers/SellerProfilePage";
import ProfilePage from "../pages/profile/ProfilePage";
import MyListingsPage from "../pages/profile/MyListingsPage";
import MyPurchasesPage from "../pages/profile/MyPurchasesPage";
import SettingsPage from "../pages/settings/SettingsPage";
import CreateListingPage from "../pages/listings/CreateListingPage";
import WishlistPage from "../pages/wishlist/WishlistPage";
import NotificationsPage from "../pages/notifications/NotificationsPage";

const AppRoutes = () => (
  <Routes>
    <Route element={<MainLayout />}>
      <Route index element={<HomePage />} />
      <Route path="/categories" element={<CategoriesPage />} />
      <Route path="/listings" element={<BrowseListingsPage />} />
      <Route path="/listings/:id" element={<ListingDetailsPage />} />
      <Route path="/category/:categoryId" element={<CategoryListingsPage />} />
      <Route path="/location/:locationName" element={<LocationListingsPage />} />
      <Route path="/seller/:sellerId" element={<SellerProfilePage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/my-listings" element={<MyListingsPage />} />
        <Route path="/my-purchases" element={<MyPurchasesPage />} />
        <Route path="/sell" element={<CreateListingPage />} />
        <Route path="/listings/:id/chat" element={<MakeOfferPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/chat" element={<MakeOfferPage />} />
      </Route>
    </Route>
  </Routes>
);

export default AppRoutes;
