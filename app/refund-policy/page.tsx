import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund policy · DRAFT",
  description: "Draft refund policy for RentiSafe rental verification bookings.",
  alternates: { canonical: "/refund-policy" },
};

export default function RefundPolicyPage() {
  return <article className="wrap policy">
    <span className="eyebrow">DRAFT · Legal review required</span><h1>Refund policy</h1>
    <p className="lead">This draft applies to verification fees only. A Kenyan lawyer should review it before launch. Payments are simulated in this prototype.</p>
    <h2>When a refund may be due</h2><ul><li>The assigned agent cannot access the property or contact the caretaker despite reasonable attempts, and no useful inspection can be completed.</li><li>RentiSafe cancels the job and cannot arrange a replacement visit within a reasonable period.</li><li>A duplicate charge is confirmed.</li></ul>
    <h2>When a refund is generally not due</h2><ul><li>A report was delivered, including where its verdict is RED or the findings are disappointing.</li><li>The tenant changes their mind after an inspection has started or completed.</li><li>The property later becomes unavailable or conditions change after the inspection.</li></ul>
    <h2>Requesting a refund</h2><p>Contact RentiSafe through the WhatsApp link with your private tracking link, phone number and reason. We will review the case and evidence, explain the decision, and return eligible fees to the original payment method once real payments are enabled. This draft does not override any rights that cannot be limited under Kenyan law.</p>
  </article>;
}
