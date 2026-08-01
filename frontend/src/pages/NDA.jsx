import { Link } from 'react-router-dom';
import { FileSignature, ArrowLeft, Mail } from 'lucide-react';
import SEOHead from '../components/SEOHead';

const LAST_UPDATED = 'July 1, 2026';

const sections = [
  {
    title: '1. Purpose',
    body: `This Non-Disclosure Agreement ("NDA") template governs the disclosure of confidential information between Sambid ("Sambid") and enterprise clients, partners, or prospective customers ("Receiving Party") in connection with evaluation, integration, or use of the Sambid platform. Either party may be the disclosing party. This page describes our standard NDA terms. To execute a signed, binding NDA for your organization, contact legal@sambid.co.`,
  },
  {
    title: '2. Definition of Confidential Information',
    body: `"Confidential Information" means any non-public information disclosed by either party, whether in written, oral, electronic, or other form, that is designated as confidential or that reasonably should be understood to be confidential given the nature of the information and the circumstances of disclosure. This includes, but is not limited to: business plans, financial projections, pricing models, technical architecture, API implementations, customer lists, proprietary algorithms, product roadmaps, and personal data subject to data protection laws. Confidential Information does not include information that: (a) is or becomes publicly known through no breach of this NDA; (b) was rightfully known before disclosure; (c) is independently developed without reference to the disclosing party's Confidential Information; or (d) is required to be disclosed by law, court order, or government authority.`,
  },
  {
    title: '3. Obligations of the Receiving Party',
    body: `The Receiving Party agrees to: (a) hold all Confidential Information in strict confidence; (b) not disclose Confidential Information to any third party without prior written consent of the Disclosing Party; (c) use Confidential Information solely for the purpose of evaluating or conducting business with Sambid ("Permitted Purpose"); (d) limit access to Confidential Information to employees and contractors who need to know it for the Permitted Purpose and who are bound by confidentiality obligations at least as protective as this NDA; (e) promptly notify the Disclosing Party in writing of any unauthorized disclosure or use of Confidential Information; and (f) use at least the same degree of care to protect the Confidential Information as it uses to protect its own confidential information, but in no event less than reasonable care.`,
  },
  {
    title: '4. Term',
    body: `This NDA remains in effect for a period of three (3) years from the date of execution, unless terminated earlier by either party with 30 days' written notice. Notwithstanding termination, obligations with respect to trade secrets remain in effect indefinitely, and obligations with respect to personal data remain in effect for as long as required by applicable data protection law. Either party may terminate this NDA at any time by providing written notice, provided that all confidential information previously disclosed remains protected under the terms herein.`,
  },
  {
    title: '5. Exclusions & Permitted Disclosures',
    body: `The Receiving Party may disclose Confidential Information if required by law, regulation, or court order, provided that: (a) it gives the Disclosing Party prompt written notice before disclosure (to the extent permitted by law); (b) it reasonably cooperates with the Disclosing Party's efforts to seek a protective order or other remedy; and (c) any such disclosure is limited to the minimum required. Disclosure to legal counsel, accountants, or financial advisors bound by professional confidentiality obligations is permitted without prior consent.`,
  },
  {
    title: '6. Return or Destruction of Information',
    body: `Upon the earlier of: (a) the Disclosing Party's written request, (b) the conclusion of the Permitted Purpose, or (c) termination of this NDA, the Receiving Party shall promptly return or, at the Disclosing Party's option, destroy all tangible materials containing Confidential Information, and certify in writing that all copies have been returned or destroyed. Electronic copies stored in automated backup systems may be retained until the next scheduled deletion in the ordinary course of business, but must not be accessed or used.`,
  },
  {
    title: '7. Ownership',
    body: `All Confidential Information remains the exclusive property of the Disclosing Party. This NDA does not grant any license, right, or interest in any patent, copyright, trademark, trade secret, or other intellectual property right. The Receiving Party acquires no rights to Confidential Information other than the limited right to use it for the Permitted Purpose during the term of this NDA.`,
  },
  {
    title: '8. No Warranty',
    body: `Confidential Information is provided "as is." The Disclosing Party makes no representations or warranties, express or implied, regarding the accuracy, completeness, or fitness for a particular purpose of the Confidential Information. The Disclosing Party shall not be liable for any errors or omissions in Confidential Information or for any reliance placed on it.`,
  },
  {
    title: '9. Remedies',
    body: `Each party acknowledges that breach of this NDA may cause irreparable harm for which monetary damages would be an inadequate remedy. Accordingly, the Disclosing Party shall be entitled to seek equitable relief, including injunction and specific performance, in addition to all other remedies available at law or in equity, without the requirement to post bond or prove actual damages. The prevailing party in any legal proceeding arising from this NDA shall be entitled to recover reasonable attorneys' fees and costs.`,
  },
  {
    title: '10. Governing Law & Dispute Resolution',
    body: `This NDA is governed by the laws of the Commonwealth of Virginia, United States, without regard to its conflict of law provisions. Any disputes arising from this NDA shall first be addressed through good-faith negotiation. If not resolved within 30 days, disputes shall be submitted to binding arbitration in Arlington, Virginia under the rules of the American Arbitration Association, except that either party may seek emergency injunctive relief in any court of competent jurisdiction.`,
  },
  {
    title: '11. General Provisions',
    body: `This NDA constitutes the entire agreement between the parties with respect to the subject matter hereof and supersedes all prior negotiations, understandings, and agreements. This NDA may not be amended except by a written instrument signed by authorized representatives of both parties. If any provision of this NDA is held invalid or unenforceable, the remaining provisions shall continue in full force. The failure of either party to enforce any provision of this NDA shall not constitute a waiver of future enforcement. This NDA may be executed in counterparts, including by electronic signature, each of which shall constitute an original.`,
  },
  {
    title: '12. Execute This NDA',
    body: `To request a signed, binding NDA for your organization (for procurement, integration, or enterprise evaluation purposes), contact our legal team at legal@sambid.co. Please include your organization name, jurisdiction, and the purpose of the NDA. We will respond within 3 business days with a fully executable document.`,
  },
];

export default function NDA() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <SEOHead
        title="Non-Disclosure Agreement | Sambid"
        description="Sambid's standard NDA terms for enterprise clients, partners, and prospective customers evaluating our federal contract intelligence platform."
        keywords="Sambid NDA, non-disclosure agreement, federal contracting platform NDA, enterprise confidentiality agreement, government contracting software NDA"
        canonical="https://sambid.co/nda"
      />
      <div className="max-w-[1440px] mx-auto">

        {/* Header */}
        <div className="mb-10">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
              <FileSignature className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Non-Disclosure Agreement</h1>
          </div>
          <p className="text-gray-500 text-sm">Standard terms · Last updated: {LAST_UPDATED}</p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            These are Sambid's standard NDA terms for enterprise evaluations and partnerships. To execute a signed binding NDA, contact <a href="mailto:legal@sambid.co" className="text-indigo-600 hover:underline">legal@sambid.co</a>.
          </p>
        </div>

        {/* Execute CTA */}
        <div className="bg-purple-50 border border-purple-100 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-purple-900 mb-0.5">Need a signed NDA for procurement?</p>
            <p className="text-sm text-purple-700">Email <a href="mailto:legal@sambid.co" className="underline hover:text-purple-900">legal@sambid.co</a> with your organization name and we'll send a fully executable document within 3 business days.</p>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((s) => (
            <div key={s.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-3">{s.title}</h2>
              {s.body && <p className="text-sm text-gray-600 leading-relaxed">{s.body}</p>}
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-10 p-5 bg-purple-50 border border-purple-100 rounded-2xl text-center">
          <p className="text-sm text-purple-800 font-medium mb-1">Enterprise & Partnership Inquiries</p>
          <p className="text-sm text-purple-700">
            Ready to sign? Contact <a href="mailto:legal@sambid.co" className="underline hover:text-purple-900">legal@sambid.co</a> to execute a binding NDA.
          </p>
          <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-500">
            <Link to="/terms" className="hover:text-purple-700 transition-colors">Terms of Service</Link>
            <span>·</span>
            <Link to="/dpa" className="hover:text-purple-700 transition-colors">Data Processing Agreement</Link>
            <span>·</span>
            <Link to="/privacy" className="hover:text-purple-700 transition-colors">Privacy Policy</Link>
          </div>
        </div>

      </div>
    </div>
  );
}
