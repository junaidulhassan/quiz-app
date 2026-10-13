import { useEffect, useRef } from "react";
import { GOOGLE_CLIENT_ID } from "../config/google.js";

const SCRIPT_SRC = "https://accounts.google.com/gsi/client";

let scriptPromise = null;

function loadScript() {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      script.onload = resolve;
      script.onerror = () => {
        scriptPromise = null;
        reject(new Error("Google sign-in couldn't load."));
      };
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
}

export default function GoogleButton({ onCredential, onError, text = "continue_with" }) {
  const holder = useRef(null);
  const handlers = useRef({ onCredential, onError });

  useEffect(() => {
    handlers.current = { onCredential, onError };
  }, [onCredential, onError]);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return undefined;
    let active = true;
    loadScript()
      .then(() => {
        if (!active || !holder.current) return;
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => handlers.current.onCredential(response.credential),
        });
        window.google.accounts.id.renderButton(holder.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text,
          shape: "rectangular",
          logo_alignment: "center",
          width: Math.min(400, holder.current.offsetWidth || 360),
        });
      })
      .catch((error) => {
        if (active) handlers.current.onError?.(error.message);
      });
    return () => {
      active = false;
    };
  }, [text]);

  if (!GOOGLE_CLIENT_ID) return null;
  return <div className="hv-google" ref={holder} />;
}
