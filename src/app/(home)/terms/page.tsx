import { BRAND_NAME } from "@/lib/branding";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Terms of Service | ${BRAND_NAME}`,
  description: `Terms of Service for ${BRAND_NAME} — automation marketplace for businesses and experts.`,
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl prose prose-neutral dark:prose-invert">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <p className="text-muted-foreground text-sm mb-8">Last updated: 9 March 2026</p>

      {/* 1. Agreement to Terms */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">1. Agreement to Terms</h2>
        <p className="text-muted-foreground leading-relaxed mb-3">
          By creating an account on or using {BRAND_NAME} (&quot;the Platform&quot;), operated by {BRAND_NAME} Ltd (&quot;we&quot;, &quot;us&quot;, &quot;the Company&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to all of these Terms, you must not access or use the Platform.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          These Terms constitute a legally binding agreement between you and {BRAND_NAME} Ltd. Your continued use of the Platform after any updates to these Terms constitutes acceptance of the revised Terms. We will notify registered users of material changes via email or in-app notification.
        </p>
      </section>

      {/* 2. Platform Overview */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">2. Platform Overview</h2>
        <p className="text-muted-foreground leading-relaxed mb-3">
          {BRAND_NAME} is a business-to-business (B2B) marketplace that connects businesses seeking automation solutions (&quot;Clients&quot; or &quot;Buyers&quot;) with qualified automation professionals (&quot;Experts&quot; or &quot;Sellers&quot;).
        </p>
        <p className="text-muted-foreground leading-relaxed mb-3">
          The Platform acts solely as an intermediary and facilitator. {BRAND_NAME} is not a party to any agreement between Clients and Experts, does not guarantee the quality or timeliness of any work delivered, and does not employ, supervise, or direct the work of Experts. Experts are independent contractors operating under their own authority.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Services facilitated through the Platform include, but are not limited to:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-1">
          <li>Discovery Scans &mdash; expert-led assessments of automation opportunities</li>
          <li>Custom Projects &mdash; bespoke automation implementation via job posts and bidding</li>
          <li>Ready-made Solutions &mdash; pre-built automation packages listed by Experts</li>
        </ul>
      </section>

      {/* 2a. Suite Partnerships */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">2a. Suite Partnerships</h2>
        <p className="text-muted-foreground leading-relaxed mb-3">
          Experts may create Suites &mdash; curated bundles of solutions that work together as a recommended workflow. Suite owners may invite solutions from other Experts (&quot;Partner Experts&quot;) to join their Suite, subject to the following terms:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-1 mb-3">
          <li><strong>Voluntary participation:</strong> Invitations are non-binding. A Partner Expert must explicitly accept an invite before their solution is added to a Suite. They may decline without consequence.</li>
          <li><strong>Independent payments:</strong> Each Expert is paid directly for orders placed on their own solutions within the Suite. The Suite owner receives no commission, revenue share, or financial benefit from sales of Partner solutions.</li>
          <li><strong>Withdrawal rights:</strong> Either party may end the partnership at any time. The Suite owner may remove a Partner solution, and the Partner Expert may withdraw their solution from the Suite, in both cases without penalty.</li>
          <li><strong>Solution control:</strong> The Suite owner controls the Suite&apos;s title, description, structure, and ordering, but cannot modify, reprice, or alter any Partner Expert&apos;s solution content.</li>
          <li><strong>Order fulfilment:</strong> Orders for Partner solutions within a Suite are fulfilled by the respective Partner Expert under the same terms as standalone solution orders, including escrow, delivery, and dispute processes.</li>
        </ul>
        <p className="text-muted-foreground leading-relaxed">
          When a Suite containing Partner solutions is deleted by the owner, all Partner Experts are notified and their solutions are removed from the Suite automatically.
        </p>
      </section>

      {/* 3. Account Types & Obligations */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">3. Account Types &amp; Obligations</h2>
        <p className="text-muted-foreground leading-relaxed mb-3">
          Users must register for one of the following account types:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-3">
          <li><strong>Business Account (Client):</strong> For organisations seeking automation solutions. Business users must provide accurate company information during onboarding.</li>
          <li><strong>Expert Account (Seller):</strong> For automation professionals offering services. Expert users must complete identity verification, agree to the Expert Terms, and maintain an active Stripe Connect account to receive payments.</li>
        </ul>
        <p className="text-muted-foreground leading-relaxed mb-3">
          Each user may hold only one account type at a time. You are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account. You must immediately notify us of any unauthorised use.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          You represent and warrant that all information you provide to the Platform is accurate, current, and complete. Providing false or misleading information is grounds for immediate account termination.
        </p>
      </section>

      {/* 4. Fees & Commission */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">4. Fees &amp; Commission</h2>
        <p className="text-muted-foreground leading-relaxed mb-3">
          All prices on the Platform are displayed in Euros (EUR) unless otherwise stated. The following fees apply:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-1 mb-3">
          <li><strong>Posting Fees:</strong> Discovery Scans and Custom Project job posts may incur a one-time, non-refundable posting fee as displayed at the time of submission.</li>
          <li><strong>Platform Commission:</strong> {BRAND_NAME} charges a commission on completed project payments, deducted from the Expert&apos;s payout. Commission rates range from 11% to 16% depending on the Expert&apos;s tier, sales history, and any applicable promotional rates. The applicable commission rate is displayed to the Expert before accepting an order.</li>
          <li><strong>No Buyer Fees:</strong> Clients pay only the agreed project price. No additional buyer-side fees are charged by the Platform.</li>
        </ul>
        <p className="text-muted-foreground leading-relaxed">
          {BRAND_NAME} reserves the right to modify fee structures with 30 days&apos; prior notice to affected users. Changes do not apply to orders already in progress at the time of the change.
        </p>
      </section>

      {/* 5. Escrow & Milestone Payments */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">5. Escrow &amp; Milestone Payments</h2>
        <p className="text-muted-foreground leading-relaxed mb-3">
          All project payments are processed through a secure escrow system. Funds are held by our payment processor (Stripe) until release conditions are met.
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-1 mb-3">
          <li>Projects are divided into one or more milestones, each with a defined deliverable and price.</li>
          <li>The Client funds each milestone before work begins on that milestone. Funded amounts are held in escrow.</li>
          <li>Escrowed funds are released to the Expert only when the Client explicitly approves the delivery for that milestone, or when the Platform administration resolves a dispute in the Expert&apos;s favour.</li>
          <li>Clients retain full protection of their escrowed funds until they are satisfied with the deliverables or until the Platform makes a binding resolution.</li>
        </ul>
        <p className="text-muted-foreground leading-relaxed">
          By funding a milestone, the Client authorises {BRAND_NAME} to hold and release funds in accordance with these Terms, including through the dispute resolution process described in Section 8.
        </p>
      </section>

      {/* 6. Delivery & Acceptance */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">6. Delivery &amp; Acceptance</h2>
        <p className="text-muted-foreground leading-relaxed mb-3">
          Upon completing the agreed deliverables for a milestone, the Expert submits a delivery through the Platform. The Client is then required to:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-1 mb-3">
          <li><strong>Approve the delivery</strong> &mdash; releasing escrowed funds to the Expert; or</li>
          <li><strong>Request a modification</strong> &mdash; providing a detailed description (minimum 20 characters) of the changes needed; or</li>
          <li><strong>Raise a dispute</strong> &mdash; if there is a material issue with the deliverables that cannot be resolved through the modification process.</li>
        </ul>
        <p className="text-muted-foreground leading-relaxed">
          If the Client does not take any action within fourteen (14) calendar days of delivery submission, {BRAND_NAME} reserves the right to automatically release the escrowed funds to the Expert or to initiate a review of the order.
        </p>
      </section>

      {/* 7. Modifications & Revisions */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">7. Modifications &amp; Revisions</h2>
        <p className="text-muted-foreground leading-relaxed mb-3">
          After an Expert submits a delivery, the Client may request modifications if the deliverables do not meet the agreed scope. The modification process works as follows:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-1 mb-3">
          <li>The Client submits a modification request with a detailed explanation of the required changes.</li>
          <li>The Expert may <strong>accept</strong> the modification request, in which case the project returns to &quot;Work in Progress&quot; status, and the Expert delivers the revised work; or</li>
          <li>The Expert may <strong>deny</strong> the modification request if they believe it falls outside the original scope, in which case a dispute is automatically opened for Platform review.</li>
        </ul>
        <p className="text-muted-foreground leading-relaxed mb-3">
          There is no hard limit on the number of modification requests a Client may submit. However, the Platform tracks all modification requests, and the history is visible to both parties and to the administration team. Repeatedly unreasonable modification requests may be considered abuse and handled through the dispute process.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Modification requests must relate to the original agreed scope of work. Requests for substantially new or different work beyond the original scope should be handled as a new order.
        </p>
      </section>

      {/* 8. Dispute Resolution & Platform Authority */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">8. Dispute Resolution &amp; Platform Authority</h2>
        <p className="text-muted-foreground leading-relaxed mb-3">
          Disputes may be raised by the Client or may be triggered automatically when an Expert denies a modification request or when a project is cancelled with funded milestones. The Platform&apos;s dispute resolution process is as follows:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-1 mb-3">
          <li>When a dispute is opened, both parties are notified immediately. The Platform will review the situation and contact both parties in the shortest time possible.</li>
          <li>The {BRAND_NAME} administration team (&quot;Admin&quot;) will review all relevant evidence, including the order scope, milestone deliverables, communications between the parties, modification history, and any other pertinent information.</li>
          <li>
            The Admin may resolve the dispute by taking one of the following actions:
            <ul className="list-disc pl-6 mt-1 space-y-1">
              <li><strong>Full refund to Client</strong> &mdash; all escrowed funds are returned to the Client.</li>
              <li><strong>Release funds to Expert</strong> &mdash; escrowed funds are released to the Expert (minus platform commission).</li>
              <li><strong>Partial refund</strong> &mdash; a portion of the escrowed funds is refunded to the Client, with the remainder handled as directed by the Admin.</li>
              <li><strong>Require revision</strong> &mdash; the Expert is required to perform the requested modifications. The project returns to &quot;Work in Progress&quot; status and the Expert must deliver the revised work.</li>
              <li><strong>Dismiss dispute</strong> &mdash; the dispute is found to be without merit, and the project continues from its prior state.</li>
            </ul>
          </li>
        </ul>
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-3">
          <p className="text-sm text-amber-800 dark:text-amber-200 font-semibold mb-2">Binding Resolution</p>
          <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
            By using {BRAND_NAME}, both Business and Expert users agree that all dispute resolution decisions made by the {BRAND_NAME} administration team are <strong>final and binding</strong>. Users waive any right to contest Platform decisions outside of the dispute resolution process provided herein. The Admin will provide a written explanation of the reasoning behind each decision, which will be communicated to both parties.
          </p>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          Both parties agree to cooperate in good faith during the dispute resolution process, respond to admin enquiries within a reasonable timeframe, and accept the final resolution. Failure to cooperate may result in a default resolution against the non-cooperating party.
        </p>
      </section>

      {/* 9. Cancellation & Refunds */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">9. Cancellation &amp; Refunds</h2>
        <p className="text-muted-foreground leading-relaxed mb-3">
          Orders may be cancelled under the following conditions:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-1 mb-3">
          <li><strong>Draft orders:</strong> May be cancelled freely by the Client with no financial consequences.</li>
          <li><strong>Unfunded orders:</strong> Orders where no milestones have been funded may be cancelled by the Client. The order will be marked as refunded with no money movement.</li>
          <li><strong>Funded orders:</strong> If any milestones have been funded (in escrow), cancellation triggers an automatic dispute. The {BRAND_NAME} administration team will review and determine the appropriate resolution, including any refunds.</li>
        </ul>
        <p className="text-muted-foreground leading-relaxed mb-3">
          Refunds, where granted, are processed through the original payment method. Refunds typically appear within 5&ndash;10 business days depending on the payment provider. Posting fees (Discovery Scans, Custom Project listings) are non-refundable unless the Platform is at fault.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Orders that are not accepted by an Expert within forty-eight (48) hours of being paid are automatically refunded to the Client.
        </p>
      </section>

      {/* 10. Confidentiality (Mutual NDA) */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">10. Confidentiality (Mutual NDA)</h2>
        <p className="text-muted-foreground leading-relaxed mb-3">
          By participating in any project on the Platform, both the Client and Expert agree to maintain the confidentiality of all information shared during the course of the engagement, including but not limited to:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-1 mb-3">
          <li>Business processes, workflows, and proprietary methods</li>
          <li>Technical specifications, system architectures, and access credentials</li>
          <li>Financial data, pricing structures, and commercial strategies</li>
          <li>Customer or employee data shared for the purpose of the project</li>
        </ul>
        <p className="text-muted-foreground leading-relaxed">
          This confidentiality obligation survives the completion or termination of any project and remains in effect indefinitely. Breach of confidentiality may result in account termination and may give rise to legal claims by the affected party.
        </p>
      </section>

      {/* 11. Intellectual Property */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">11. Intellectual Property</h2>
        <p className="text-muted-foreground leading-relaxed mb-3">
          Unless otherwise agreed in writing between the Client and Expert:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-1 mb-3">
          <li>All work product, deliverables, and custom automation created during a project transfer to the Client upon full payment (i.e., when all milestones have been approved and released).</li>
          <li>The Expert retains the right to use general knowledge, techniques, and methodologies developed during the project, and to reference the project in their portfolio (without disclosing confidential details).</li>
          <li>Pre-existing intellectual property brought by either party remains the property of that party.</li>
        </ul>
        <p className="text-muted-foreground leading-relaxed">
          {BRAND_NAME} does not claim ownership of any content, work product, or intellectual property created by users on the Platform.
        </p>
      </section>

      {/* 12. Limitation of Liability */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">12. Limitation of Liability</h2>
        <p className="text-muted-foreground leading-relaxed mb-3">
          {BRAND_NAME} acts as an intermediary marketplace and facilitator. To the maximum extent permitted by applicable law:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-1 mb-3">
          <li>{BRAND_NAME} is not liable for the quality, accuracy, timeliness, or completeness of work delivered by Experts.</li>
          <li>{BRAND_NAME} is not liable for any loss of profit, revenue, data, or anticipated savings arising from the use of the Platform or any services procured through it.</li>
          <li>{BRAND_NAME}&apos;s total aggregate liability to any user in connection with these Terms shall not exceed the total fees paid by or to that user through the Platform in the twelve (12) months preceding the claim.</li>
          <li>{BRAND_NAME} shall not be liable for any indirect, incidental, special, consequential, or punitive damages, regardless of the cause of action or theory of liability.</li>
        </ul>
        <p className="text-muted-foreground leading-relaxed">
          Nothing in these Terms excludes or limits liability for death or personal injury caused by negligence, fraud or fraudulent misrepresentation, or any other liability that cannot be excluded by applicable law.
        </p>
      </section>

      {/* 13. Indemnification */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">13. Indemnification</h2>
        <p className="text-muted-foreground leading-relaxed">
          You agree to indemnify, defend, and hold harmless {BRAND_NAME} Ltd, its directors, officers, employees, and agents from and against any and all claims, damages, losses, liabilities, costs, and expenses (including reasonable legal fees) arising out of or in connection with: (a) your use of the Platform; (b) your breach of these Terms; (c) your violation of any applicable law or regulation; (d) any content you submit to the Platform; or (e) any dispute between you and another user of the Platform. This indemnification obligation survives the termination of your account and these Terms.
        </p>
      </section>

      {/* 14. Account Termination */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">14. Account Termination</h2>
        <p className="text-muted-foreground leading-relaxed mb-3">
          {BRAND_NAME} reserves the right to suspend or terminate any user account at its sole discretion, with or without notice, for any reason including but not limited to:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-1 mb-3">
          <li>Violation of these Terms or any applicable law</li>
          <li>Fraudulent, deceptive, or abusive behaviour</li>
          <li>Repeated failure to cooperate in dispute resolution processes</li>
          <li>Non-payment of fees or outstanding balances</li>
          <li>Providing false or misleading information</li>
        </ul>
        <p className="text-muted-foreground leading-relaxed mb-3">
          Upon termination, any active orders will be handled as follows: funded milestones in escrow will be subject to the dispute resolution process; unfunded milestones will be cancelled; and any earned but unpaid funds will be released to the Expert after deducting applicable commission.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Users may request voluntary account deletion through their account settings. Account deletion is subject to the completion or resolution of any active orders or pending disputes. Deleted accounts are anonymised in accordance with applicable data protection regulations.
        </p>
      </section>

      {/* 15. Governing Law & Contact */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">15. Governing Law &amp; Contact</h2>
        <p className="text-muted-foreground leading-relaxed mb-3">
          These Terms shall be governed by and construed in accordance with the laws of Spain. Any disputes arising under or in connection with these Terms that cannot be resolved through the Platform&apos;s dispute resolution process shall be subject to the exclusive jurisdiction of the courts of Spain.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-3">
          If any provision of these Terms is found to be invalid or unenforceable, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          For questions, concerns, or legal enquiries regarding these Terms, please contact us at:{" "}
          <a href="mailto:contact@logiclot.io" className="text-primary hover:underline">contact@logiclot.io</a>
        </p>
      </section>
    </div>
  );
}
