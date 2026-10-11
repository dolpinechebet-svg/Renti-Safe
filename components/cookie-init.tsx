"use client";

import { useEffect } from "react";

export function CookieInit() {
  useEffect(() => {
    const notice = document.getElementById("cookie-notice");
    if (!notice) return;
    const accept = () => {
      localStorage.setItem("rentisafe-cookie-notice", "seen");
      notice.setAttribute("hidden", "");
    };
    notice.querySelector("button")?.addEventListener("click", accept);
    if (!localStorage.getItem("rentisafe-cookie-notice")) notice.removeAttribute("hidden");
    return () => notice.querySelector("button")?.removeEventListener("click", accept);
  }, []);
  return null;
}
