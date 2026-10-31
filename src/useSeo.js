import { useEffect } from "react";

const SITE = "https://hyeve.net";

const ROUTE_SEO = {
  "/": {
    title: "Hyeve – Free Personality Assessment & Rental Trust Platform in Nigeria",
    description:
      "Take Hyeve's free 25-question personality assessment, discover your archetype and get a Trust ID. Landlords, property managers, tenants and roommates in Nigeria use it to make better rental decisions.",
    index: true,
  },
  "/take-assessment": {
    title: "Free Personality Assessment for Renters & Roommates | Hyeve",
    description:
      "Answer 25 quick questions to find your personality archetype and receive your Trust ID. Free, takes about 5 minutes, built for tenants, roommates and landlords in Nigeria.",
    index: true,
  },
  "/take-assessment/active": {
    title: "Hyeve Assessment in Progress",
    index: false,
  },
  "/take-assessment/results": {
    title: "Your Hyeve Assessment Results",
    index: false,
  },
};

function upsertMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export default function useSeo(pathname) {
  useEffect(() => {
    const key = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
    const seo = ROUTE_SEO[key];
    if (!seo) return;

    document.title = seo.title;
    upsertMeta("name", "robots", seo.index ? "index, follow" : "noindex, nofollow");
    upsertMeta("property", "og:title", seo.title);
    upsertMeta("name", "twitter:title", seo.title);

    if (seo.description) {
      upsertMeta("name", "description", seo.description);
      upsertMeta("property", "og:description", seo.description);
      upsertMeta("name", "twitter:description", seo.description);
    }

    if (seo.index) {
      const url = key === "/" ? `${SITE}/` : `${SITE}${key}`;
      upsertCanonical(url);
      upsertMeta("property", "og:url", url);
    } else {
      document.head.querySelector('link[rel="canonical"]')?.remove();
    }
  }, [pathname]);
}
