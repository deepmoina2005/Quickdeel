import { Heart, ListChecks, LogOut, MessageCircle, Settings, ShoppingBag, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

const items = [
  { label: "My Profile", to: "/profile", icon: User },
  { label: "My Listings", to: "/my-listings", icon: ListChecks },
  { label: "My Purchases", to: "/my-purchases", icon: ShoppingBag },
  { label: "My Favorites", to: "/wishlist", icon: Heart },
  { label: "My Chats", to: "/chat", icon: MessageCircle },
  { label: "Settings", to: "/settings", icon: Settings },
];

const ProfileMenu = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const initial = (user?.name || user?.email || "U").trim().charAt(0).toUpperCase();
  const showImage = user?.avatar && !imageError;

  useEffect(() => {
    setImageError(false);
  }, [user?.avatar]);

  return (
    <div className="relative">
      <button onClick={() => setOpen((value) => !value)} className="grid h-12 w-12 place-items-center rounded-full transition hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Open profile menu">
        {showImage ? (
          <img src={user.avatar} alt={user.name} onError={() => setImageError(true)} className="h-10 w-10 rounded-full object-cover" />
        ) : (
          <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-600 text-base font-black text-white">
            {initial}
          </span>
        )}
      </button>
      {open ? (
        <div className="absolute right-0 z-30 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          {items.map((item) => (
            <Link key={item.label} to={item.to} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800">
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40">
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default ProfileMenu;
