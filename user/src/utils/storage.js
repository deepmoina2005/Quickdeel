const prefix = "quickdeal_user_";

export const storage = {
  get(key, fallback = null) {
    try {
      const value = localStorage.getItem(`${prefix}${key}`);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    localStorage.setItem(`${prefix}${key}`, JSON.stringify(value));
  },
  remove(key) {
    localStorage.removeItem(`${prefix}${key}`);
  },
};
