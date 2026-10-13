import dataPolicy from "./dataPolicy.js";
import landlordTerms from "./landlordTerms.js";
import roommateTerms from "./roommateTerms.js";
import serviceTerms from "./serviceTerms.js";
import storagePolicy from "./storagePolicy.js";

export const POLICIES = [dataPolicy, serviceTerms, storagePolicy, landlordTerms, roommateTerms];

export const POLICY_LINKS = [
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/terms", label: "Terms of Service" },
  { to: "/cookies", label: "Cookie Policy" },
  { to: "/landlord-terms", label: "Landlord Terms" },
  { to: "/roommate-terms", label: "Roommate Terms" },
];
