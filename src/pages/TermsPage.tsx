import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { BrandTile } from '../components/Brand';
import LegalLayout from '../components/LegalLayout';

const LAST_UPDATED = 'May 2, 2026';

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      lastUpdated={LAST_UPDATED}
      header={
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
            <BrandTile className="w-7 h-7 rounded-lg" />
            <span className="text-sm font-bold">Full Range Lab</span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            Back home
          </Link>
        </div>
      }
    >
      <p>
        These Terms of Service ("Terms") govern your use of <strong>Full Range Lab</strong>
        {' '}(the "Service") at <a href="https://fullrangelab.com">fullrangelab.com</a>. By creating
        an account, you agree to these Terms.
      </p>

      <h2>1. Eligibility & accounts</h2>
      <p>
        You must be at least 18 years old and a personal trainer, physiotherapist, or other movement
        professional to use the Service. You are responsible for keeping your login credentials
        confidential and for all activity under your account.
      </p>

      <h2>2. Acceptable use</h2>
      <ul>
        <li>Do not use the Service for unlawful, harmful, or fraudulent activity.</li>
        <li>Do not upload content you do not have the right to share.</li>
        <li>Do not attempt to break, reverse engineer, or overload the Service.</li>
        <li>Obtain consent from your clients before entering their personal data.</li>
      </ul>

      <h2>3. Subscription & payment</h2>
      <p>
        Paid plans are billed monthly or yearly via manual transfer (Vodafone Cash or InstaPay).
        After you submit a payment screenshot, we verify the transaction and activate your plan.
        Subscriptions do not auto-renew — you submit a fresh payment to extend your access.
      </p>

      <h2>4. Trial</h2>
      <p>
        New accounts receive a free trial. After the trial expires, you must subscribe to continue
        using the Service. We may change trial terms for new sign-ups, but existing trials are
        honored.
      </p>

      <h2>5. Refunds</h2>
      <p>
        Due to the nature of digital subscriptions, payments are non-refundable except where
        required by law or where we have made a clear billing error. Contact us within 7 days of
        payment if you believe there is an error.
      </p>

      <h2>6. Your content</h2>
      <p>
        You retain ownership of all client data, programs, exercises, and other content you create
        in the Service. We only access your content as needed to provide and support the Service.
      </p>

      <h2>7. Service availability</h2>
      <p>
        We aim for high availability but do not guarantee uninterrupted service. We may perform
        maintenance, suspend access for misuse, or change features over time. We will give
        reasonable notice for material changes that affect you.
      </p>

      <h2>8. Termination</h2>
      <p>
        You may delete your account at any time from settings. We may suspend or terminate accounts
        that violate these Terms. On termination, your data is deleted as described in our{' '}
        <Link to="/privacy">Privacy Policy</Link>.
      </p>

      <h2>9. Disclaimer</h2>
      <p>
        The Service is provided "as is" without warranties of any kind. Full Range Lab is a tool
        for organizing training programs — it does not provide medical advice. You are responsible
        for the appropriateness of programs you create for your clients.
      </p>

      <h2>10. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, Full Range Lab is not liable for any indirect,
        incidental, or consequential damages arising from your use of the Service. Our total
        liability is limited to the amount you paid us in the 12 months before the claim.
      </p>

      <h2>11. Governing law</h2>
      <p>
        These Terms are governed by the laws of the Arab Republic of Egypt. Disputes will be
        resolved in the courts of Cairo.
      </p>

      <h2>12. Changes</h2>
      <p>
        We may update these Terms from time to time. Material changes will be communicated by email
        or in-app notice. Continued use of the Service after changes constitutes acceptance.
      </p>

      <h2>13. Contact</h2>
      <p>
        Questions: <a href="mailto:fullrangelab@gmail.com">fullrangelab@gmail.com</a>{' '}
        or WhatsApp +20 102 175 1325.
      </p>
    </LegalLayout>
  );
}
