import { useCallback, useEffect, useState } from "react";

export default function useCooldown() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (seconds <= 0) return undefined;
    const timer = setTimeout(() => setSeconds((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  const start = useCallback((value) => setSeconds(Math.max(0, Math.ceil(value))), []);

  return [seconds, start];
}
