export const metadata = { title: "Contact — LogicLot" };

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
