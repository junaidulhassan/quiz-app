import { createContext, useContext } from "react";

export const MODES = {
  tenant: {
    key: "tenant",
    base: "/landlord",
    label: "Tenant",
    noun: "tenant",
    badge: "Tenant Lookup",
    heading: "Know Your Tenant",
    subtext: "Enter a tenant's email address or Trust ID to check rental history and behavior insights.",
    placeholder: "Enter tenant's email or Trust ID",
    profilePath: "tenants",
  },
  roommate: {
    key: "roommate",
    base: "/roommate",
    label: "Roommate",
    noun: "roommate",
    badge: "Roommate Lookup",
    heading: "Know Your Roommate",
    subtext: "Enter a roommate's email address or Trust ID to see compatibility and lifestyle insights.",
    placeholder: "Enter roommate's email or Trust ID",
    profilePath: "roommates",
  },
};

const ModeContext = createContext(MODES.tenant);

export const ModeProvider = ModeContext.Provider;

export function useMode() {
  return useContext(ModeContext);
}
