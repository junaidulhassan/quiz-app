import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { reopenProfile } from "../api/lookup.js";

export default function useProfile(type) {
  const { id } = useParams();
  const location = useLocation();
  const preloaded = location.state?.profile?.id === id ? location.state.profile : null;
  const [state, setState] = useState(
    preloaded ? { status: "ready", profile: preloaded } : { status: "loading", profile: null }
  );

  useEffect(() => {
    if (preloaded) return undefined;
    let active = true;
    reopenProfile(type, id)
      .then((profile) => active && setState({ status: "ready", profile }))
      .catch((error) => active && setState({ status: "missing", profile: null, message: error.message }));
    return () => {
      active = false;
    };
  }, [type, id, preloaded]);

  return state;
}
