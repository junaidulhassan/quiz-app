const CATEGORY_VARS = {
  property_changes: "--category-property",
  delay_payments: "--category-payments",
  maintenance: "--category-maintenance",
  lifestyle: "--category-lifestyle",
  arguments: "--category-arguments",
  bill_sharing: "--category-bill-sharing",
  hygiene: "--category-hygiene",
  noise: "--category-noise",
  privacy: "--category-privacy",
};

export function categoryColor(key) {
  return `var(${CATEGORY_VARS[key]})`;
}

export function riskColor(level, key) {
  if (key === "lifestyle" && level === "high") return "var(--risk-lifestyle-high)";
  if (key === "noise" && level === "high") return "var(--risk-noise-high)";
  return `var(--risk-${level})`;
}

export function riskBackground(level, key) {
  if ((key === "lifestyle" || key === "noise") && level === "high") return "var(--risk-medium-bg)";
  return `var(--risk-${level}-bg)`;
}

const HOBBY_COLOR_GROUPS = [
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
  return HOBBY_COLORS[name] || "var(--badge-bg)";
}
