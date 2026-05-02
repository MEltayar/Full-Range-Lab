import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { BrandTile } from '../components/Brand';
import LegalLayout from '../components/LegalLayout';

const LAST_UPDATED = 'May 2, 2026';

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
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
        This Privacy Policy explains how <strong>Full Range Lab</strong> ("we", "us") collects, uses,
        and protects the information you provide when you use our personal-trainer and physiotherapist
        platform at <a href="https://fullrangelab.com">fullrangelab.com</a>.
      </p>

      <h2>1. Information we collect</h2>
      <ul>
        <li>
          <strong>Account data</strong> — your email address, hashed password, and any profile
          details (name, business name, contact info) you choose to add.
        </li>
        <li>
          <strong>Client records you enter</strong> — names, contact details, body measurements,
          training notes, progress photos, diet and program data. You are responsible for obtaining
          consent from your clients before entering their information.
        </li>
        <li>
          <strong>Payment proof</strong> — when you submit a renewal screenshot for Vodafone Cash or
          InstaPay, we store the image to verify your transaction.
        </li>
        <li>
          <strong>Technical data</strong> — error reports and basic browser/device data collected by
          our error-tracking provider (Sentry) so we can fix bugs.
        </li>
      </ul>

      <h2>2. How we use your information</h2>
      <ul>
        <li>To provide, maintain, and improve the platform.</li>
        <li>To verify subscription payments and manage renewals.</li>
        <li>To contact you about your account, billing, or service updates.</li>
        <li>To diagnose and fix technical issues.</li>
      </ul>

      <h2>3. How we store and protect data</h2>
      <p>
        Your account and client data are stored on Supabase, with row-level security so only you can
        access your own records. We host the application on Cloudflare Pages. We do not sell or
        rent your data, and we do not use it for advertising.
      </p>

      <h2>4. Sub-processors</h2>
      <ul>
        <li><strong>Supabase</strong> — database, authentication, storage</li>
        <li><strong>Cloudflare</strong> — hosting and content delivery</li>
        <li><strong>Sentry</strong> — error tracking and performance monitoring</li>
      </ul>

      <h2>5. Your rights</h2>
      <p>
        You may request access to, correction of, or deletion of your account data at any time by
        contacting us. Deleting your account permanently removes your records, including all client
        data you entered.
      </p>

      <h2>6. Data retention</h2>
      <p>
        We retain your data for as long as your account is active. After account deletion, backups
        are purged within 30 days.
      </p>

      <h2>7. Children's privacy</h2>
      <p>
        Full Range Lab is not directed to children under 16. If you are a trainer working with
        minor clients, you must obtain consent from a parent or legal guardian before entering their
        information.
      </p>

      <h2>8. Changes to this policy</h2>
      <p>
        We may update this policy from time to time. Material changes will be communicated by email
        or in-app notice.
      </p>

      <h2>9. Contact</h2>
      <p>
        Questions or requests about this policy: <a href="mailto:fullrangelab@gmail.com">fullrangelab@gmail.com</a>
        {' '}or WhatsApp +20 102 175 1325.
      </p>
    </LegalLayout>
  );
}
