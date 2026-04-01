"use client";

import { useEffect } from "react";

export default function FreeAuditLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Hide navbar and footer on the waitlist audit page
    const nav = document.querySelector("nav");
    const footer = document.querySelector("footer");
    if (nav) nav.style.display = "none";
    if (footer) footer.style.display = "none";

    return () => {
      if (nav) nav.style.display = "";
      if (footer) footer.style.display = "";
    };
  }, []);

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `nav, footer, header { display: none !important; }`,
        }}
      />
      {children}
    </>
  );
}
