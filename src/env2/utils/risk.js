export function riskColor(level, key) {
  if (key === "lifestyle" && level === "high") return "var(--hv-risk-lifestyle-high)";
  if (key === "noise" && level === "high") return "var(--hv-risk-lifestyle-high)";
  return `var(--hv-risk-${level})`;
}

export function riskBackground(level, key) {
  if ((key === "lifestyle" || key === "noise") && level === "high") return "var(--hv-risk-medium-bg)";
  return `var(--hv-risk-${level}-bg)`;
}

export const CATEGORY_COLORS = {
  property_changes: "var(--hv-cat-property)",
  delay_payments: "var(--hv-cat-payments)",
  maintenance: "var(--hv-cat-maintenance)",
  lifestyle: "var(--hv-cat-lifestyle)",
  arguments: "var(--hv-cat-arguments)",
  bill_sharing: "var(--hv-cat-bills)",
  hygiene: "var(--hv-cat-hygiene)",
  noise: "var(--hv-cat-noise)",
  privacy: "var(--hv-cat-privacy)",
};

export const HOBBY_COLOR_GROUPS = [
  { color: "#ECBECE", hobbies: ["Arts & Design", "Music", "Reading", "Travel", "Writing", "Photography", "Exploring", "Experimenting"] },
  { color: "#BAD1EB", hobbies: ["Exercise", "Journaling", "Building Projects", "Strategy games", "Planning", "Learning", "Certification study", "Habit tracking", "Fixing things"] },
  { color: "#EEDABA", hobbies: ["Sports", "Travel", "Party / Events", "Acting", "Networking", "Group activities", "Nightlife & bars", "Fashion", "Dancing"] },
  { color: "#BFE3CF", hobbies: ["Volunteering", "Helping others", "Group activities", "Music", "Reading"] },
  { color: "#D8CBE5", hobbies: ["Meditation", "Walking", "Reading", "Journaling"] },
  { color: "#BAE6FD", hobbies: ["Simple games", "Music", "Web surfing", "TV & streaming", "Casual activities"] },
];

const HOBBY_COLORS = {};
HOBBY_COLOR_GROUPS.forEach(({ color, hobbies }) => {
  hobbies.forEach((hobby) => {
    if (!(hobby in HOBBY_COLORS)) HOBBY_COLORS[hobby] = color;
  });
});

export function hobbyColor(name) {
  return HOBBY_COLORS[name] || "#E5E7EB";
}
