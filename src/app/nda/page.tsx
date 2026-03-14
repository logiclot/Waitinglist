import { BRAND_NAME } from "@/lib/branding";
import Link from "next/link";

export const metadata = {
  title: `Mutual NDA | ${BRAND_NAME}`,
  description: "Mutual Non-Disclosure Agreement automatically binding upon account creation on the LogicLot platform.",
};

const EFFECTIVE_DATE = "1 March 2025";
const EMAIL = "contact@logiclot.io";
const JURISDICTION = "Spain";

export default function NdaPage() {
  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12">
          <p className="text-sm text-muted-foreground uppercase tracking-widest font-semibold mb-3">Legal</p>
          <h1 className="text-4xl font-bold tracking-tight mb-4">Mutual Non-Disclosure Agreement</h1>
          <p className="text-muted-foreground text-sm">Effective date: {EFFECTIVE_DATE} &mdash; Governing law: {JURISDICTION}</p>
          <p className="text-muted-foreground text-sm mt-1">
            See also:{" "}
            <Link href="/terms" className="text-primary underline underline-offset-2">Terms &amp; Conditions</Link>
            {" "}&middot;{" "}
            <Link href="/privacy" className="text-primary underline underline-offset-2">Privacy Policy</Link>
          </p>
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-900 leading-relaxed">
              <strong>This Mutual NDA is legally binding on all LogicLot Users.</strong> It comes into effect automatically upon account creation and applies to all interactions, proposals, and project data exchanged through the Platform. No separate signature is required.
            </p>
          </div>
        </div>

        <div className="space-y-10 text-foreground">

          <Section title="1. Parties &amp; Automatic Binding">
            <p>
              This Mutual Non-Disclosure Agreement (&ldquo;NDA&rdquo; or &ldquo;Agreement&rdquo;) is entered into automatically and without need of a separate signature between:
            </p>
            <ul>
              <li><strong>LogicLot Ltd</strong> (&ldquo;Platform Operator&rdquo;); and</li>
              <li><strong>Each registered User</strong> of the LogicLot platform, whether a Business or Expert/Specialist (&ldquo;User&rdquo; or &ldquo;Receiving Party&rdquo; or &ldquo;Disclosing Party&rdquo; as applicable).</li>
            </ul>
            <p>
              By creating an account on LogicLot, you unconditionally and irrevocably enter into this Agreement. This NDA is incorporated by reference into the{" "}
              <Link href="/terms" className="text-primary underline">Terms &amp; Conditions</Link> and forms part of the complete legal agreement governing your use of the Platform.
            </p>
            <p>
              <strong>This Agreement operates mutually between all Users of the Platform who interact with one another through a Discovery Scan, Custom Project, Solution purchase, Order, or any other Platform-mediated interaction.</strong>
            </p>
          </Section>

          <Section title="2. Definitions">
            <ul>
              <li><strong>&ldquo;Confidential Information&rdquo;</strong> means any information disclosed by one party (&ldquo;Disclosing Party&rdquo;) to another party (&ldquo;Receiving Party&rdquo;) in connection with the Platform or any Platform-mediated engagement — whether disclosed in writing, orally, digitally, visually, or by any other means — that is designated as confidential or that a reasonable person would understand to be confidential given the nature of the information and the circumstances of its disclosure. Confidential Information is not limited to information submitted through Platform interfaces and expressly includes information disclosed during live calls, screen-sharing sessions, and video demonstrations arranged in connection with the Platform.</li>
            </ul>
            <p>Without limitation, Confidential Information includes:</p>
            <ul className="pl-6">
              <li>Business workflows, operational processes, standard operating procedures, data structures, and internal systems;</li>
              <li>Customer lists, client data, revenue figures, margins, pricing, and commercial metrics;</li>
              <li>Technical architectures, automation logic, integration specifications, and software stack details;</li>
              <li><strong>Responses submitted through any Platform intake form or questionnaire</strong>, including but not limited to: Discovery Scan intake fields (business model, team size, primary time drain, monthly volume, communication tools, tech stack, business description, growth goals), Custom Project brief fields, and any onboarding or profiling questionnaire;</li>
              <li>Expert proposals, automation strategies, implementation blueprints, scoping documents, methodology descriptions, pricing structures, and technical approaches submitted in response to any job posting or Discovery Scan;</li>
              <li>Solution blueprints, source documentation, workflow diagrams, and implementation details;</li>
              <li><strong>Information disclosed during discovery calls, demo sessions, screen-sharing sessions, video calls, or any other live or recorded consultation</strong> arranged through or in connection with the Platform, regardless of whether that session occurs on the Platform or via a third-party tool (e.g., Zoom, Google Meet, Calendly);</li>
              <li><strong>System access credentials, API keys, access tokens, passwords, OAuth authorisations, webhook secrets, and any similar authentication material</strong> shared during or for the purpose of an implementation engagement;</li>
              <li>Database schemas, data models, table structures, and sample or production data provided to facilitate implementation;</li>
              <li>Third-party tool configurations, account settings, automation workspace contents, and integration logic;</li>
              <li>Any other business information marked as confidential or that a reasonable person would treat as proprietary.</li>
            </ul>
            <p><strong>Confidential Information does not include information that:</strong></p>
            <ul>
              <li>(a) is or becomes publicly available through no fault of the Receiving Party;</li>
              <li>(b) the Receiving Party can demonstrate was known to them prior to disclosure, free of any confidentiality obligation;</li>
              <li>(c) is independently developed by the Receiving Party without use of or reference to the Disclosing Party&apos;s Confidential Information;</li>
              <li>(d) is received from a third party with no confidentiality restriction and under no duty of confidence;</li>
              <li>(e) is required to be disclosed by applicable law, court order, or regulatory authority — provided the Receiving Party gives the Disclosing Party prompt prior written notice (where legally permissible) to allow the Disclosing Party to seek a protective order.</li>
            </ul>
          </Section>

          <Section title="3. Obligations of the Receiving Party">
            <p>Each Receiving Party agrees to:</p>
            <ul>
              <li><strong>Keep strictly confidential</strong> all Confidential Information received through the Platform and not disclose it to any third party without prior written consent from the Disclosing Party and LogicLot.</li>
              <li><strong>Use Confidential Information solely</strong> for the purpose of evaluating, negotiating, or performing the specific Platform-mediated engagement for which it was shared. Any other use is strictly prohibited.</li>
              <li><strong>Not reproduce, copy, distribute, or reverse-engineer</strong> any Confidential Information beyond what is strictly necessary for the permitted purpose.</li>
              <li><strong>Apply at least the same level of care</strong> to protect Confidential Information as it applies to its own most sensitive proprietary information, and in any event no less than reasonable care.</li>
              <li><strong>Not use Confidential Information to compete</strong> with the Disclosing Party, directly or indirectly, or to develop competing products, services, or workflows that are substantially based on the Disclosing Party&apos;s Confidential Information.</li>
              <li><strong>Immediately notify LogicLot and the Disclosing Party</strong> upon becoming aware of any actual or suspected unauthorised disclosure or misuse of Confidential Information.</li>
            </ul>
          </Section>

          <Section title="4. Specific Protections for Expert Proposals">
            <p>
              The following specific rules apply to Confidential Information disclosed through Discovery Scans and Custom Projects:
            </p>
            <ul>
              <li>Expert proposals, automation strategies, implementation blueprints, and scoping documents submitted through the Platform are the Confidential Information of the submitting Expert.</li>
              <li><strong>Businesses are strictly prohibited</strong> from using, replicating, implementing, sharing with their own technical team, or commissioning the implementation of any Expert proposal without completing a paid engagement through LogicLot with that Expert.</li>
              <li>A Business may not use proposal content received from Expert A to negotiate with, instruct, or improve the brief offered to Expert B, or any third party outside the Platform.</li>
              <li>This protection applies regardless of whether the Business proceeds with the project, and survives the expiry or termination of the Business&apos;s account.</li>
              <li>Breach of this clause entitles the Expert and LogicLot to claim damages including the full commercial value of the improperly used proposal and any resulting implementation. LogicLot may also pursue a claim in its own right for circumvention fees as set out in the Terms &amp; Conditions.</li>
            </ul>
          </Section>

          <Section title="5. Specific Protections for Business Information">
            <p>
              The following specific rules apply to Business information shared through Discovery Scans, Custom Projects, and Orders:
            </p>
            <ul>
              <li>All business data, workflow descriptions, tooling details, team structures, and operational information shared by a Business through any job posting, conversation, or order on the Platform is the Confidential Information of that Business.</li>
              <li><strong>Experts are strictly prohibited</strong> from: sharing Business information with any third party; using Business information to develop solutions for competing businesses; incorporating Business-specific logic into publicly listed Solutions without explicit written consent from the Business; or retaining Business data beyond the period necessary to deliver the contracted work.</li>
              <li>Experts must delete or securely destroy Business Confidential Information upon project completion or upon request, unless retention is required by law.</li>
            </ul>
          </Section>

          <Section title="6. Discovery Calls, Demo Sessions &amp; Off-Platform Communications">
            <p>
              The confidentiality obligations of this Agreement apply in full to any information disclosed during live or recorded sessions arranged in connection with a Platform engagement, including but not limited to:
            </p>
            <ul>
              <li><strong>Demo sessions</strong> booked and paid through the Platform (including screen-sharing demonstrations of an Expert&apos;s solution or approach);</li>
              <li><strong>Discovery calls</strong> between a Business and one or more Experts conducted prior to, during, or following a Discovery Scan or Custom Project;</li>
              <li><strong>Video or voice consultations</strong> conducted via third-party tools (Zoom, Google Meet, Microsoft Teams, or similar) where the meeting was initiated, referenced, or booked through the Platform;</li>
              <li><strong>Screen-sharing sessions</strong> during which a Business shares internal systems, tools, dashboards, or workflows with an Expert for the purpose of scoping or delivering an automation project.</li>
            </ul>
            <p>
              The fact that such sessions occur outside the Platform&apos;s messaging interface does not remove them from the scope of this Agreement. Any information disclosed in connection with a Platform-mediated relationship — regardless of the channel through which it is communicated — is Confidential Information subject to the full obligations of this NDA.
            </p>
            <p>
              <strong>Specific rules for demo and discovery sessions:</strong>
            </p>
            <ul>
              <li>Experts may not record, screenshot, or transcribe any session without the explicit prior consent of the Business.</li>
              <li>Businesses may not record sessions, retain notes, or share session content with third parties without the Expert&apos;s explicit consent.</li>
              <li>Neither party may use information disclosed in a session to brief, instruct, or negotiate with any third party outside the Platform.</li>
              <li>If a session reveals trade secrets, source code, customer data, or credentials, those materials are subject to the heightened protections in Sections 5 and 7 of this Agreement in addition to the general confidentiality obligations.</li>
            </ul>
          </Section>

          <Section title="7. Implementation Phase — System Access, Credentials &amp; Data">
            <p>
              During the implementation phase of a project — whether arising from a Solution purchase, Custom Project award, or any other paid Order — a Business may be required to share sensitive access credentials, system integrations, and internal data with an Expert to enable delivery of the contracted automation work. The following rules apply without exception:
            </p>
            <p><strong>Expert obligations regarding system access:</strong></p>
            <ul>
              <li>All access credentials, API keys, OAuth tokens, webhook secrets, passwords, and authentication material shared by a Business are Confidential Information of the highest sensitivity. The Expert must treat them with the strictest level of protection and must not store, copy, or share them beyond what is strictly necessary to perform the contracted work.</li>
              <li>The Expert must access the Business&apos;s systems, accounts, and tools <strong>only for the specific and limited purpose</strong> of performing the contracted implementation. Any access beyond that scope — including but not limited to reading, exporting, or copying data unrelated to the automation project — constitutes a material breach of this Agreement.</li>
              <li>Upon project completion, or immediately upon request by the Business or LogicLot, the Expert must <strong>permanently delete or destroy all access credentials, stored data, API keys, and copies of any system configuration</strong> shared by the Business. The Expert must confirm in writing (through the Platform) that destruction is complete.</li>
              <li>The Expert must not share system access with subcontractors, assistants, or any third party without the explicit prior written consent of the Business, recorded through the Platform.</li>
              <li>The Expert must immediately notify the Business and LogicLot if any access credentials are compromised, exposed, or accessed by an unauthorised party.</li>
            </ul>
            <p><strong>Business obligations regarding data provided for implementation:</strong></p>
            <ul>
              <li>The Business must not share live production credentials without first assessing the risk. Where possible, sandbox, staging, or read-only credentials should be used.</li>
              <li>Business Confidential Information (data schemas, production data, customer records) provided to an Expert is subject to the obligations in Section 5 of this Agreement and must not be used for any purpose beyond the contracted scope.</li>
            </ul>
            <p>
              <strong>Breach of this section</strong> — including unauthorised retention of credentials, unauthorised data access, or failure to confirm destruction of access materials — constitutes wilful breach of this NDA and entitles the Business and LogicLot to the full remedies set out in Section 10 of this Agreement, including the fixed &euro;5,000 per-incident penalty and immediate account termination.
            </p>
          </Section>

          <Section title="8. LogicLot's Rights of Access">
            <p>
              <strong>Notwithstanding the above, LogicLot retains the right to access, process, store, and use all Confidential Information exchanged through the Platform</strong> for the following purposes:
            </p>
            <ul>
              <li>Dispute resolution and investigation;</li>
              <li>Fraud detection, anti-circumvention enforcement, and platform security;</li>
              <li>Compliance with applicable law, regulatory requests, or court orders;</li>
              <li>Quality assurance and platform improvement (in anonymised form where possible);</li>
              <li>Enforcement of these Terms and the Mutual NDA.</li>
            </ul>
            <p>
              LogicLot&apos;s access does not constitute a breach of this Agreement. By using the Platform, all Users consent to this access. LogicLot will not voluntarily disclose User Confidential Information to third parties except as described in the Privacy Policy.
            </p>
          </Section>

          <Section title="9. Duration &amp; Survival">
            <p>
              This Agreement takes effect upon account creation and remains in full force for the duration of your use of the Platform. Upon account termination, the confidentiality obligations in Sections 3, 4, 5, 6, 7, and 10 survive indefinitely with respect to:
            </p>
            <ul>
              <li>Trade secrets (which remain protected for as long as they qualify as trade secrets under applicable law);</li>
              <li>Business workflows, customer data, and proprietary methodologies;</li>
              <li>Expert automation architectures, pricing models, and solution designs.</li>
            </ul>
            <p>
              For all other categories of Confidential Information, obligations survive account termination for a period of <strong>5 years</strong>.
            </p>
          </Section>

          <Section title="10. Consequences of Breach">
            <p>
              Breach of this NDA is a <strong>material breach</strong> of the Platform Terms &amp; Conditions and may result in:
            </p>
            <ul>
              <li>Immediate account suspension or permanent termination without refund;</li>
              <li>Withholding of all pending payments;</li>
              <li>Civil proceedings for damages, including loss of profits, unjust enrichment, and reputational harm;</li>
              <li>Injunctive relief (courts may grant an injunction to prevent further breach without requiring proof of actual damage);</li>
              <li>A fixed breach penalty of <strong>&euro;5,000 per incident</strong> for wilful or repeated violations, as a genuine pre-estimate of harm to the Disclosing Party and the Platform, without prejudice to any other remedy.</li>
            </ul>
            <p>
              Both parties acknowledge that a breach of this NDA may cause irreparable harm for which monetary damages alone are an inadequate remedy. Accordingly, both parties consent to the granting of equitable relief (including injunction) without the requirement to post bond or prove actual damages.
            </p>
          </Section>

          <Section title="11. No Licence or Transfer of Rights">
            <p>
              Nothing in this Agreement grants the Receiving Party any licence, title, or ownership rights in the Disclosing Party&apos;s Confidential Information. Disclosure of Confidential Information does not grant any rights to use, reproduce, or commercialise that information beyond the specific permitted purpose.
            </p>
          </Section>

          <Section title="12. No Warranty on Confidential Information">
            <p>
              Confidential Information is provided &ldquo;as is&rdquo;. The Disclosing Party makes no representations or warranties — express or implied — as to the accuracy, completeness, fitness for purpose, or non-infringement of any Confidential Information. The Receiving Party relies on it at their own risk.
            </p>
          </Section>

          <Section title="13. Governing Law &amp; Jurisdiction">
            <p>
              This Agreement is governed by the laws of <strong>{JURISDICTION}</strong>. Any dispute arising out of or in connection with this Agreement shall be submitted exclusively to the courts of {JURISDICTION}, except where mandatory local law requires otherwise.
            </p>
          </Section>

          <Section title="14. Contact">
            <p>
              To report a suspected NDA breach or for enquiries regarding this Agreement, contact:{" "}
              <a href={`mailto:${EMAIL}`} className="text-primary underline">{EMAIL}</a>
            </p>
          </Section>

        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const id = title.split(".")[0].toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return (
    <section id={id}>
      <h2 className="text-lg font-bold mb-3 text-foreground">{title}</h2>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-3">{children}</div>
    </section>
  );
}
