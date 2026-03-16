import { BRAND_NAME, BRAND_DOMAIN } from "@/lib/branding";

const BASE_URL = `https://${BRAND_DOMAIN}`;

export const metadata = {
  title: `Contact | ${BRAND_NAME}`,
  description: "Get in touch with LogicLot. Whether you have questions about automation solutions, need support, or want to explore a partnership, our team responds within one business day. Email us at contact@logiclot.io.",
  openGraph: {
    title: `Contact | ${BRAND_NAME}`,
    description: "Questions, support, or partnerships. Our team responds within one business day.",
    url: `${BASE_URL}/contact`,
    siteName: BRAND_NAME,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Contact | ${BRAND_NAME}`,
    description: "Questions, support, or partnerships. Our team responds within one business day.",
  },
  alternates: { canonical: `${BASE_URL}/contact` },
  keywords: ["contact LogicLot", "automation support", "business automation help", "LogicLot support"],
};

export default function ContactPage() {
  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Contact Us</h1>
      <p className="text-muted-foreground">
        Have a question or need support? Reach out to our team and we&apos;ll get back to you within one business day.
      </p>
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div>
          <p className="text-sm font-semibold text-foreground">Email</p>
          <a
            href="mailto:hello@logiclot.io"
            className="text-primary hover:underline text-sm"
          >
            hello@logiclot.io
          </a>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Response time</p>
          <p className="text-sm text-muted-foreground">1 business day</p>
        </div>
      </div>
    </div>
  );
}
