import { useEffect, useState } from "react";

const LOCATION_STORAGE_KEY = "quickdeal_selected_location";
const LOCATION_EVENT = "quickdeal:location-changed";

export const getSelectedLocation = () => localStorage.getItem(LOCATION_STORAGE_KEY) || "";

export const saveSelectedLocation = (location) => {
  if (location) {
    localStorage.setItem(LOCATION_STORAGE_KEY, location);
  } else {
    localStorage.removeItem(LOCATION_STORAGE_KEY);
  }
  window.dispatchEvent(new CustomEvent(LOCATION_EVENT, { detail: location }));
};

export const useLocationFilter = () => {
  const [location, setLocation] = useState(() => getSelectedLocation());

  useEffect(() => {
    const syncLocation = (event) => {
      if (event.type === LOCATION_EVENT) {
        setLocation(event.detail || "");
        return;
      }
      if (event.key === LOCATION_STORAGE_KEY) {
        setLocation(event.newValue || "");
      }
    };

    window.addEventListener(LOCATION_EVENT, syncLocation);
    window.addEventListener("storage", syncLocation);
    return () => {
      window.removeEventListener(LOCATION_EVENT, syncLocation);
      window.removeEventListener("storage", syncLocation);
    };
  }, []);

  return [location, saveSelectedLocation];
};
