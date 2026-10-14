import { useEffect } from "react";

const HREF =
  "https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,wght@120,400;120,500;120,600;120,700&display=swap";

export default function useGoogleSansFlex() {
  useEffect(() => {
    if (document.querySelector(`link[href="${HREF}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = HREF;
    document.head.appendChild(link);
  }, []);
}
