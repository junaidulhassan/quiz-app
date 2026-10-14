import { createContext, useContext } from "react";

export const MODES = {
  tenant: {
    key: "tenant",
    scope: "pg-landlord",
    base: "/landlord",
    label: "Tenant",
    noun: "tenant",
    badge: "Tenant Lookup",
    heading: "Know Your Tenant",
    subtext: "Enter a tenant's email address or Trust ID to check rental history and behavior insights.",
    placeholder: "Enter tenant's email",
    fieldLabel: "Tenant email or Trust ID",
    emptyError: "Enter a tenant's email or Trust ID to continue.",
    profilePath: "tenants",
    stages: [
      { title: "Finding tenant records", active: "Searching the web", done: "Record found!" },
      { title: "Checking rental history", active: "Reviewing previous rental records", done: "Rental history reviewed!" },
      { title: "Reviewing payment patterns", active: "Analyzing payment patterns", done: "Payment behavior analyzed!" },
      { title: "Analyzing tenancy behavior", active: "Evaluating rental patterns", done: "Tenancy patterns analyzed!" },
      { title: "Preparing tenant report", active: "Generating your tenant insights", done: "Report ready!" },
    ],
    stageOneTexts: ["Searching the web", "Searching tenant records"],
    notFound: "Ask the tenant to complete the assessment honestly for the",
    paymentEmpty: "Your payment history will appear here once you make a payment.",
  },
  roommate: {
    key: "roommate",
    scope: "pg-roommate",
    base: "/roommate",
    label: "Roommate",
    noun: "roommate",
    badge: "Roommate Lookup",
    heading: "Know Your Roommate",
    subtext: "Enter a roommate's email address or Trust ID to check their history and behavior insights.",
    placeholder: "Enter roommate's email",
    fieldLabel: "Roommate email or Trust ID",
    emptyError: "Enter a roommate's email or Trust ID to continue.",
    profilePath: "roommates",
    stages: [
      { title: "Finding roommate records", active: "Searching the web", done: "Record found!" },
      { title: "Checking rental history", active: "Reviewing previous rental records", done: "Rental history reviewed!" },
      { title: "Reviewing payment patterns", active: "Analyzing payment patterns", done: "Payment behavior analyzed!" },
      { title: "Analyzing roommate behavior", active: "Evaluating roommate patterns", done: "Roommate patterns analyzed!" },
      { title: "Preparing roommate report", active: "Generating your roommate insights", done: "Report ready!" },
    ],
    stageOneTexts: ["Searching the web", "Searching roommate records"],
    notFound: "Ask the roommate to complete the assessment honestly for the",
    paymentEmpty: "Your payment transactions will appear here once you make a payment.",
  },
};

const ModeContext = createContext(MODES.tenant);

export const ModeProvider = ModeContext.Provider;

export function useMode() {
  return useContext(ModeContext);
}
