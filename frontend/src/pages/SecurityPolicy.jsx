import { Link } from 'react-router-dom';
import { Lock, ArrowLeft, CheckCircle } from 'lucide-react';
import SEOHead from '../components/SEOHead';

const LAST_UPDATED = 'July 1, 2026';

const highlights = [
  'TLS 1.2+ encryption for all data in transit',
  'AES-256 encryption for data at rest',
  'Multi-factor authentication enforced for admin access',
  'MongoDB Atlas with IP-restricted database access',
  'Automated daily backups with 30-day retention',
  '72-hour breach notification commitment',
];

const sections = [
  {
    title: '1. Our Security Commitment',
    body: `Sambid treats the security of your data as a core product responsibility, not an afterthought. We operate a federal contract intelligence platform that handles business-sensitive data, and we apply rigorous controls across our infrastructure, application, and operational layers. This document describes our current security posture and the measures we take to protect your information.`,
  },
  {
    title: '2. Infrastructure Security',
    subsections: [
      {
        label: 'Hosting & Network',
        text: 'Sambid is hosted on a dedicated VPS with firewall rules restricting all inbound traffic except ports 80 (HTTP), 443 (HTTPS), and the application port behind NGINX reverse proxy. SSH access is restricted to authorized IP addresses with key-based authentication only - password authentication is disabled.',
      },
      {
        label: 'Database',
        text: 'User data is stored in MongoDB Atlas (M10+ cluster). Database access is restricted to application servers via Atlas IP allowlisting. MongoDB Atlas provides built-in encryption at rest (AES-256), automated backups, and point-in-time recovery. No direct public database access is permitted.',
      },
      {
        label: 'TLS / Encryption in Transit',
        text: 'All connections to Sambid are encrypted using TLS 1.2 or higher. HTTP connections are automatically redirected to HTTPS. SSL certificates are managed via Hostinger and renewed automatically before expiry.',
      },
      {
        label: 'DDoS & Rate Limiting',
        text: 'NGINX is configured with rate limiting on all API endpoints. Application-level rate limiting (express-rate-limit) enforces per-IP request quotas: 2,000 requests per 15 minutes for general API, 15 requests per 15 minutes for login endpoints, and 5 requests per 15 minutes for sensitive operations (password reset, OTP verification).',
      },
    ],
  },
  {
    title: '3. Application Security',
    subsections: [
      {
        label: 'Authentication',
        text: 'Passwords are hashed using bcrypt (cost factor 12+). JSON Web Tokens (JWT) are used for session management with short expiry windows. Password reset tokens are single-use, time-limited, and transmitted only via verified email.',
      },
      {
        label: 'Input Validation & Injection Prevention',
        text: 'All user input is validated and sanitized before processing. NoSQL injection protection is enforced via middleware that strips MongoDB operators ($where, $gt, etc.) from untrusted input. XSS protection is applied to all string fields. SQL injection is not applicable as Sambid uses MongoDB exclusively.',
      },
      {
        label: 'Security Headers',
        text: 'HTTP security headers are enforced via Helmet.js: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy, and Strict-Transport-Security (HSTS) with a 1-year max-age. Content Security Policy is managed at the NGINX layer.',
      },
      {
        label: 'File Upload Security',
        text: 'File uploads are restricted by MIME type and file extension. Uploaded files are validated on both client and server sides. Non-image uploads are served with Content-Disposition: attachment to prevent browser execution. Upload size is capped at 10MB.',
      },
      {
        label: 'Dependency Management',
        text: 'Third-party dependencies are reviewed before adoption. npm packages are monitored for known vulnerabilities. Dependencies are updated regularly, with critical security patches applied within 48 hours of public disclosure.',
      },
    ],
  },
  {
    title: '4. Access Controls',
    body: `Access to production systems is strictly controlled. Only authorized Sambid engineers have SSH access to the production VPS, protected by key-based authentication. Database credentials are stored in environment variables and never committed to source control. The codebase is hosted in a private GitHub repository with branch protection and required reviews before merging to main. Admin panel access within the application requires a separate admin credential distinct from user accounts.`,
  },
  {
    title: '5. Payment Security',
    body: `Sambid does not store, process, or transmit raw credit card numbers or bank account details. All payment processing is handled by PCI DSS-compliant providers: Stripe, PayPal, and Payoneer. Payment tokens and identifiers returned by these providers are stored for subscription management purposes only. Sambid's servers never receive or see cardholder data.`,
  },
  {
    title: '6. Third-Party Integrations',
    body: `Sambid integrates with SAM.gov (U.S. federal data), Anthropic AI, and the payment processors named above. API keys for all third-party services are stored as server-side environment variables and are never exposed to the client. SAM.gov API keys are rotated periodically and are scoped to the minimum required permissions (read-only data access).`,
  },
  {
    title: '7. Data Backup & Recovery',
    body: `MongoDB Atlas performs automated daily backups with a 30-day retention period and supports point-in-time recovery (PITR). Critical application configuration is maintained in secure environment files with off-site copies. Recovery Time Objective (RTO): 4 hours. Recovery Point Objective (RPO): 24 hours.`,
  },
  {
    title: '8. Incident Response',
    body: `Sambid maintains an internal incident response procedure. In the event of a confirmed personal data breach: (1) we will contain the breach and assess its scope within 24 hours; (2) we will notify affected customers without undue delay and within 72 hours of discovery, as required by GDPR and applicable law; (3) we will provide information on the nature of the breach, categories and approximate number of individuals affected, and recommended protective actions; (4) we will conduct a post-incident review and implement corrective measures within 30 days.`,
  },
  {
    title: '9. Employee & Contractor Security',
    body: `All Sambid personnel with access to customer data are bound by confidentiality agreements. Access is granted on a least-privilege basis and reviewed quarterly. Access is revoked immediately upon role change or departure. Personnel are trained on data protection obligations and security best practices before receiving system access.`,
  },
  {
    title: '10. Vulnerability Disclosure',
    body: `Sambid welcomes responsible disclosure of security vulnerabilities. If you discover a security issue, please report it immediately to security@sambid.co. Please do not disclose vulnerabilities publicly until we have had a reasonable opportunity to investigate and remediate. We commit to acknowledging valid reports within 48 hours and providing a resolution timeline within 14 days. We do not pursue legal action against researchers who follow responsible disclosure practices.`,
  },
  {
    title: '11. Compliance',
    body: `Sambid's security program is designed to comply with: GDPR (EU General Data Protection Regulation), CCPA (California Consumer Privacy Act), and applicable U.S. federal data security standards. We are working toward SOC 2 Type II certification. Enterprise customers may request our security documentation package including this policy, our DPA, and sub-processor list by contacting security@sambid.co.`,
  },
  {
    title: '12. Contact',
    body: `For security-related inquiries, vulnerability reports, or to request security documentation for enterprise procurement: security@sambid.co - Sambid, Arlington, VA 22203, USA. Response time: within 48 hours for security reports, within 5 business days for documentation requests.`,
  },
];

export default function SecurityPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <SEOHead
        title="Security - Sambid"
        description="Sambid's security practices: encryption, access controls, incident response, and data protection measures for our federal contract intelligence platform."
        keywords="Sambid security, federal contracting platform security, SaaS data security, GDPR security compliance, government contract software security"
        canonical="https://sambid.co/security"
      />
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Security</h1>
          </div>
          <p className="text-gray-500 text-sm">Last updated: {LAST_UPDATED}</p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Protecting your business data is fundamental to what we do. Here's how Sambid secures your information across infrastructure, application, and operations.
          </p>
        </div>

        {/* Security highlights */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 mb-8">
          <h2 className="text-sm font-semibold text-indigo-900 uppercase tracking-wide mb-4">Security at a Glance</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {highlights.map((item) => (
              <div key={item} className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                <span className="text-sm text-indigo-800">{item}</span>
              </div>
            ))}
          </div>
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
                    <div key={sub.label} className="pl-4 border-l-2 border-indigo-100">
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
        <div className="mt-10 p-5 bg-indigo-50 border border-indigo-100 rounded-2xl text-center">
          <p className="text-sm text-indigo-800 font-medium mb-1">Found a security issue?</p>
          <p className="text-sm text-indigo-700">
            Report it to <a href="mailto:security@sambid.co" className="underline hover:text-indigo-900">security@sambid.co</a> - we respond within 48 hours.
          </p>
          <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-500">
            <Link to="/privacy" className="hover:text-indigo-700 transition-colors">Privacy Policy</Link>
            <span>·</span>
            <Link to="/dpa" className="hover:text-indigo-700 transition-colors">Data Processing Agreement</Link>
            <span>·</span>
            <Link to="/contact" className="hover:text-indigo-700 transition-colors">Contact</Link>
          </div>
        </div>

      </div>
    </div>
  );
}
