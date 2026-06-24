import { createContext, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../services/api";
import { useRealApi } from "../services/marketplace.service";
import { storage } from "../utils/storage";

const AuthContext = createContext(null);

const apiOrigin = () => (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");
const assetUrl = (url) => {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `${apiOrigin()}${url.startsWith("/") ? url : `/${url}`}`;
};
const normalizePerson = (person = {}) => ({
  ...person,
  id: person.id ? String(person.id) : person.id,
  avatar: assetUrl(person.avatar),
});
const normalizeUser = (nextUser = {}) => ({
  ...nextUser,
  id: nextUser.id ? String(nextUser.id) : nextUser.id,
  avatar: assetUrl(nextUser.avatar),
  followers: (nextUser.followers || []).map(normalizePerson),
  following: (nextUser.following || []).map(normalizePerson),
});
const getCurrentUser = async (fallbackUser) => {
  try {
    const response = await api.get("/users/me");
    return normalizeUser(response.data.user);
  } catch {
    return normalizeUser(fallbackUser);
  }
};
const valueOrEmpty = (value) => value ?? "";

const demoUser = {
  id: "me",
  name: "QuickDeal User",
  email: "user@quickdeal.com",
  phone: "+91 99999 99999",
  location: "Kolkata",
  about: "",
  contactEmail: "user@quickdeal.com",
  avatar: "https://i.pravatar.cc/120?img=7",
  followers: [],
  following: [],
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => storage.get("user"));
  const isAuthenticated = Boolean(user);

  useEffect(() => {
    if (!useRealApi || !storage.get("token")) return;

    let mounted = true;
    api.get("/users/me").then((response) => {
      if (!mounted) return;
      const nextUser = normalizeUser(response.data.user);
      storage.set("user", nextUser);
      setUser(nextUser);
    }).catch(() => {
      storage.remove("token");
      storage.remove("refreshToken");
      storage.remove("user");
      if (mounted) setUser(null);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (values) => {
    if (useRealApi) {
      const response = await api.post("/auth/login", values);
      storage.set("token", response.data.accessToken);
      storage.set("refreshToken", response.data.refreshToken);
      const nextUser = await getCurrentUser(response.data.user);
      storage.set("user", nextUser);
      setUser(nextUser);
      toast.success("Logged in successfully");
      return nextUser;
    }

    const nextUser = { ...demoUser, email: values.email || demoUser.email };
    storage.set("token", "mock-user-jwt-token");
    storage.set("user", nextUser);
    setUser(nextUser);
    toast.success("Logged in successfully");
    return nextUser;
  };

  const register = async (values) => {
    if (useRealApi) {
      const response = await api.post("/auth/register", values);
      storage.set("token", response.data.accessToken);
      storage.set("refreshToken", response.data.refreshToken);
      const nextUser = await getCurrentUser(response.data.user);
      storage.set("user", nextUser);
      setUser(nextUser);
      toast.success("Account created");
      return nextUser;
    }

    const nextUser = { ...demoUser, name: values.name, email: values.email, contactEmail: values.email, phone: values.phone || demoUser.phone };
    storage.set("token", "mock-user-jwt-token");
    storage.set("user", nextUser);
    setUser(nextUser);
    toast.success("Account created");
    return nextUser;
  };

  const logout = async () => {
    if (useRealApi) {
      try {
        await api.post("/auth/logout");
      } catch {
        // Local session cleanup should still happen if the server token is stale.
      }
    }
    storage.remove("token");
    storage.remove("refreshToken");
    storage.remove("user");
    setUser(null);
    toast.success("Logged out");
  };

  const refreshUser = async () => {
    if (!useRealApi || !storage.get("token")) return user;
    const nextUser = await getCurrentUser(user);
    storage.set("user", nextUser);
    setUser(nextUser);
    return nextUser;
  };

  const updateProfile = async (values) => {
    if (useRealApi) {
      const avatarFile = Array.from(values.avatarFile || [])[0];
      if (avatarFile) {
        const formData = new FormData();
        formData.append("avatar", avatarFile);
        await api.post("/users/avatar", formData);
      }

      const { avatarFile: _avatarFile, ...profileValues } = values;
      const response = await api.patch("/users/profile", {
        name: valueOrEmpty(profileValues.name),
        email: valueOrEmpty(profileValues.email),
        phone: valueOrEmpty(profileValues.phone),
        about: valueOrEmpty(profileValues.about),
        contactEmail: valueOrEmpty(profileValues.contactEmail),
      });
      const nextUser = normalizeUser(response.data.user);
      storage.set("user", nextUser);
      setUser(nextUser);
      toast.success("Profile updated");
      return nextUser;
    }

    const { avatarFile: _avatarFile, ...profileValues } = values;
    const nextUser = normalizeUser({ ...user, ...profileValues });
    storage.set("user", nextUser);
    setUser(nextUser);
    toast.success("Profile updated");
    return nextUser;
  };

  const value = useMemo(() => ({ user, isAuthenticated, login, register, logout, refreshUser, updateProfile }), [user, isAuthenticated]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
