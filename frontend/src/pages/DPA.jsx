import { Link } from 'react-router-dom';
import { Database, ArrowLeft } from 'lucide-react';
import SEOHead from '../components/SEOHead';

const LAST_UPDATED = 'July 1, 2026';

const sections = [
  {
    title: '1. Introduction & Scope',
    body: `This Data Processing Agreement ("DPA") is entered into between Sambid Notify ("Sambid", "Processor") and the customer entity that has agreed to the Sambid Terms of Service ("Controller"). This DPA forms part of the Agreement and governs the processing of personal data by Sambid on behalf of the Controller. This DPA applies where Sambid processes personal data submitted by the Controller in connection with the use of the Sambid platform.`,
  },
  {
    title: '2. Definitions',
    body: `"Personal Data" means any information relating to an identified or identifiable natural person. "Processing" means any operation performed on personal data, including collection, storage, use, disclosure, or deletion. "Data Subject" means the individual to whom personal data relates. "Sub-Processor" means any processor engaged by Sambid to process personal data on behalf of the Controller. "GDPR" means the EU General Data Protection Regulation 2016/679. "CCPA" means the California Consumer Privacy Act. All other capitalized terms not defined here have the meanings given in the Sambid Terms of Service.`,
  },
  {
    title: '3. Data Processed',
    subsections: [
      {
        label: 'Categories of Personal Data',
        text: 'Name, business email address, job title, company name, billing address, payment method identifiers (tokenized), IP addresses, device identifiers, usage logs, NAICS codes, SAM.gov registration numbers, and any content uploaded or generated within the platform (e.g., capability statements, proposal drafts, pipeline entries).',
      },
      {
        label: 'Categories of Data Subjects',
        text: 'Employees, contractors, and authorized users of the Controller who use the Sambid platform.',
      },
      {
        label: 'Purpose of Processing',
        text: 'Providing and improving the Sambid platform services as described in the Terms of Service, including opportunity matching, AI-powered analysis, billing, customer support, and security monitoring.',
      },
    ],
  },
  {
    title: '4. Sambid\'s Obligations as Processor',
    body: `Sambid will: (a) process personal data only on documented instructions from the Controller, including those set out in the Terms of Service and this DPA; (b) ensure that persons authorized to process personal data are bound by confidentiality obligations; (c) implement appropriate technical and organizational security measures as described in Section 6; (d) assist the Controller in fulfilling obligations to Data Subjects (access, correction, deletion, portability requests) within 30 days of receiving a request; (e) delete or return all personal data upon termination of the Agreement as described in Section 8; (f) provide the Controller with all information necessary to demonstrate compliance with this DPA.`,
  },
  {
    title: '5. Controller\'s Obligations',
    body: `The Controller represents and warrants that: (a) it has a lawful basis for processing personal data and sharing it with Sambid; (b) it has provided all required notices to Data Subjects and obtained all necessary consents; (c) the personal data submitted to Sambid is accurate and up to date; (d) it has the authority to enter into this DPA on behalf of the Controller entity. The Controller is responsible for its users' compliance with the Sambid Terms of Service.`,
  },
  {
    title: '6. Technical & Organizational Security Measures',
    subsections: [
      {
        label: 'Encryption',
        text: 'All personal data is encrypted in transit using TLS 1.2+ and at rest using AES-256 encryption on MongoDB Atlas.',
      },
      {
        label: 'Access Controls',
        text: 'Access to personal data is restricted to authorized Sambid personnel on a need-to-know basis. Multi-factor authentication is enforced for all administrative access.',
      },
      {
        label: 'Infrastructure Security',
        text: 'Sambid operates on secured VPS infrastructure with firewalls, intrusion detection, and regular security audits. Database access is restricted to application servers via allowlisted IPs.',
      },
      {
        label: 'Incident Response',
        text: 'In the event of a personal data breach, Sambid will notify the Controller without undue delay and no later than 72 hours after becoming aware, providing all information required under applicable data protection law.',
      },
    ],
  },
  {
    title: '7. Sub-Processors',
    body: `Sambid uses the following categories of sub-processors to provide its services: (a) Cloud infrastructure — VPS hosting provider; (b) Database — MongoDB Atlas (MongoDB, Inc.); (c) Payment processing — Stripe, PayPal, Payoneer; (d) Email delivery — Hostinger Mail / SMTP service; (e) AI services — Anthropic (for AI-powered features). Sambid will notify the Controller at least 14 days before engaging any new sub-processor. The Controller may object to a new sub-processor within 14 days of such notice. Sambid imposes data protection obligations on all sub-processors equivalent to those in this DPA.`,
  },
  {
    title: '8. Data Retention & Deletion',
    body: `Sambid retains personal data for as long as necessary to provide the services and as required by applicable law. Upon termination of the Agreement, Sambid will, at the Controller's choice, delete or return all personal data within 30 days, unless retention is required by applicable law. Anonymized or aggregated data that cannot identify individuals may be retained for analytics purposes.`,
  },
  {
    title: '9. International Data Transfers',
    body: `Sambid's primary infrastructure is located in the United States. If the Controller or its users are located in the EEA, UK, or other jurisdictions with data transfer restrictions, Sambid relies on Standard Contractual Clauses (SCCs) as approved by the European Commission as the legal basis for such transfers. A copy of the applicable SCCs is available upon request at privacy@sambid.co.`,
  },
  {
    title: '10. Audit Rights',
    body: `The Controller may audit Sambid's compliance with this DPA no more than once per calendar year, with 30 days' written notice. Audits must be conducted during business hours, at the Controller's expense, and must not unreasonably disrupt Sambid's operations. Sambid may satisfy an audit request by providing a current SOC 2 report or equivalent third-party assessment.`,
  },
  {
    title: '11. Governing Law',
    body: `This DPA is governed by the same governing law as the Sambid Terms of Service (laws of the Commonwealth of Virginia, USA). Where GDPR applies, this DPA shall be interpreted in accordance with GDPR requirements.`,
  },
  {
    title: '12. Contact',
    body: `For DPA-related requests, enterprise data processing inquiries, or to request Standard Contractual Clauses, contact: privacy@sambid.co — Sambid Notify, Arlington, VA 22203, USA.`,
  },
];

export default function DPA() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <SEOHead
        title="Data Processing Agreement — Sambid"
        description="Sambid's Data Processing Agreement (DPA) for enterprise customers — GDPR and CCPA compliant data processing terms for the federal contract intelligence platform."
        keywords="Sambid DPA, data processing agreement, GDPR compliance, federal contracting software data processing, enterprise data protection"
        canonical="https://sambid.co/dpa"
      />
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Database className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Data Processing Agreement</h1>
          </div>
          <p className="text-gray-500 text-sm">Effective date: {LAST_UPDATED} · Last updated: {LAST_UPDATED}</p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            This DPA governs how Sambid processes personal data on behalf of enterprise customers in compliance with GDPR, CCPA, and applicable data protection regulations.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((s) => (
            <div key={s.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-3">{s.title}</h2>
              {s.body && <p className="text-sm text-gray-600 leading-relaxed">{s.body}</p>}
              {s.subsections && (
                <div className="space-y-4 mt-2">
                  {s.subsections.map((sub) => (
                    <div key={sub.label} className="pl-4 border-l-2 border-blue-100">
                      <p className="text-sm font-medium text-gray-800 mb-1">{sub.label}</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{sub.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-10 p-5 bg-blue-50 border border-blue-100 rounded-2xl text-center">
          <p className="text-sm text-blue-800 font-medium mb-1">Enterprise customers</p>
          <p className="text-sm text-blue-700">
            Contact us to execute a signed copy of this DPA for your organization's compliance records.
          </p>
          <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-500">
            <Link to="/privacy" className="hover:text-blue-700 transition-colors">Privacy Policy</Link>
            <span>·</span>
            <Link to="/security" className="hover:text-blue-700 transition-colors">Security</Link>
            <span>·</span>
            <Link to="/contact" className="hover:text-blue-700 transition-colors">Contact Us</Link>
          </div>
        </div>

      </div>
    </div>
  );
}
