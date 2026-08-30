"use client";

import { useEffect } from "react";

export default function Template({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.add("weather-template");

    return () => {
      document.documentElement.classList.remove("weather-template");
    };
  }, []);

  return children;
}
