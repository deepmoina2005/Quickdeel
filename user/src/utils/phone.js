export const getTelHref = (phone = "") => `tel:${String(phone).replace(/[^\d+]/g, "")}`;
