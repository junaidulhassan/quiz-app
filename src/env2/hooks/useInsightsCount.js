import { useEffect, useState } from "react";
import { fetchInsights } from "../api/lookup.js";

export default function useInsightsCount() {
  const [total, setTotal] = useState(null);

  useEffect(() => {
    let active = true;
    fetchInsights()
      .then((data) => active && setTotal(data.total))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return total;
}
