"use client";

import Script from "next/script";

const MICROSOFT_UET_TAG_ID = "187245640";

export function MicrosoftAnalytics() {
  return (
    <>
      <Script
        id="bing-uet"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
              (function(w, d, t, u, o) {
                w[u] = w[u] || [];
                o.ts = (new Date).getTime();
                var n = d.createElement(t);
                n.src = "/metrics/ms-loader?ti=" + o.ti + ("uetq" != u ? "&q=" + u : "");
                n.async = 1;
                n.onload = n.onreadystatechange = function() {
                  var s = this.readyState;
                  s && "loaded" !== s && "complete" !== s || (o.q = w[u], w[u] = new UET(o), w[u].push("pageLoad"), n.onload = n.onreadystatechange = null);
                };
                var i = d.getElementsByTagName(t)[0];
                i.parentNode.insertBefore(n, i);
              })(window, document, "script", "uetq", { ti: "${MICROSOFT_UET_TAG_ID}", enableAutoSpaTracking: true });
            `,
        }}
      />

      {/* UET Default Consent */}
      <Script
        id="bing-uet-consent-default"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
              window.uetq = window.uetq || [];
              window.uetq.push('consent', 'default', { 'ad_storage': 'denied' });
            `,
        }}
      />
    </>
  );
}
