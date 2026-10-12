import { useCallback, useEffect, useState } from "react";
import { SessionExpiredError } from "../../session.js";

export default function useFetch(loader) {
  const [state, setState] = useState({ status: "loading", data: null, error: "" });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;
    loader()
      .then((data) => active && setState({ status: "ready", data, error: "" }))
      .catch((error) => {
        if (!active) return;
        if (error instanceof SessionExpiredError) {
          window.dispatchEvent(new Event("hyeve-admin:signed-out"));
          return;
        }
        setState((current) => ({ status: "error", data: current.data, error: error.message }));
      });
    return () => {
      active = false;
    };
  }, [loader, version]);

  const reload = useCallback(() => setVersion((value) => value + 1), []);
  return { ...state, reload };
}
