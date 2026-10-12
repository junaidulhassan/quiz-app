import { useEffect } from "react";

const IDLE_LIMIT_MS = 60 * 60 * 1000;
const EVENTS = ["click", "keydown", "mousemove", "scroll", "touchstart"];

export default function useIdleLogout(enabled, onIdle) {
  useEffect(() => {
    if (!enabled) return undefined;
    let timer;
    const arm = () => {
      clearTimeout(timer);
      timer = setTimeout(onIdle, IDLE_LIMIT_MS);
    };
    arm();
    EVENTS.forEach((name) => window.addEventListener(name, arm, { passive: true }));
    return () => {
      clearTimeout(timer);
      EVENTS.forEach((name) => window.removeEventListener(name, arm));
    };
  }, [enabled, onIdle]);
}
