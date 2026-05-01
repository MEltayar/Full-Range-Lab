import { useRef } from 'react';
import { Camera, Globe, Mail, MessageCircle } from 'lucide-react';
import SectionHeader from './SectionHeader';
import type { ProfileType } from '../../../types';

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

interface ClinicDetailsValues {
  clinicName: string;
  clinicLogo?: string;
  clinicInstagram?: string;
  clinicFacebook?: string;
  clinicGmail?: string;
  clinicWhatsApp?: string;
}

interface ClinicDetailsSectionProps {
  values: ClinicDetailsValues;
  onChange: (patch: Partial<ClinicDetailsValues>) => void;
  logoError: string;
  onLogoError: (err: string) => void;
  profileType?: ProfileType;
}

const inputCls =
  'w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md ' +
  'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ' +
  'focus:outline-none focus:ring-2 focus:ring-blue-500';

const labelCls = 'flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';
const iconCls  = 'shrink-0 text-gray-400 dark:text-gray-500';

export default function ClinicDetailsSection({
  values,
  onChange,
  logoError,
  onLogoError,
  profileType = 'physio',
}: ClinicDetailsSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isGym = profileType === 'gym';

  const labels = isGym
    ? {
        section: 'Personal Trainer Details',
        infoText: "Your name, logo, and contact details appear on every exported training plan and PDF sent to clients.",
        name: 'Name',
        namePlaceholder: 'e.g. Peak Performance Training',
        logo: 'Logo',
        whatsappPlaceholder: '+1 555 123 4567',
        gmailPlaceholder: 'contact@gmail.com',
        instagramPlaceholder: 'https://instagram.com/yourbrand',
        facebookPlaceholder: 'https://facebook.com/yourbrand',
      }
    : {
        section: 'Clinic Details',
        infoText: "Your clinic's name, logo, and contact details appear on every exported rehab sheet and PDF sent to clients.",
        name: 'Clinic Name',
        namePlaceholder: 'e.g. City Physio Clinic',
        logo: 'Clinic Logo',
        whatsappPlaceholder: '+1 555 123 4567',
        gmailPlaceholder: 'clinic@gmail.com',
        instagramPlaceholder: 'https://instagram.com/yourclinic',
        facebookPlaceholder: 'https://facebook.com/yourclinic',
      };

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      onLogoError('Invalid file type. Please upload a PNG, JPG, or SVG image.');
      e.target.value = '';
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      onLogoError('File is too large. Maximum size is 5 MB.');
      e.target.value = '';
      return;
    }

    onLogoError('');
    const reader = new FileReader();
    reader.onload = (ev) => {
      onChange({ clinicLogo: ev.target?.result as string });
    };
    reader.readAsDataURL(file);
  }

  return (
    <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <SectionHeader title={labels.section} infoText={labels.infoText} />
      <div className="flex flex-col gap-4">

        {/* Name */}
        <div>
          <label className={labelCls}>{labels.name}</label>
          <input
            type="text"
            value={values.clinicName}
            onChange={(e) => onChange({ clinicName: e.target.value })}
            placeholder={labels.namePlaceholder}
            className={inputCls}
          />
        </div>

        {/* Logo */}
        <div>
          <label className={labelCls}>{labels.logo}</label>
          {values.clinicLogo && (
            <img
              src={values.clinicLogo}
              alt="Clinic logo preview"
              className="mb-2 h-16 w-auto object-contain rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-1"
            />
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {values.clinicLogo ? 'Change Logo' : 'Upload Logo'}
            </button>
            {values.clinicLogo && (
              <button
                type="button"
                onClick={() => {
                  onChange({ clinicLogo: undefined });
                  onLogoError('');
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="px-3 py-2 text-sm border border-red-300 dark:border-red-700 rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                Remove
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/svg+xml"
            className="hidden"
            onChange={handleFileChange}
          />
          {logoError && (
            <p className="mt-2 text-xs text-red-600 dark:text-red-400">{logoError}</p>
          )}
        </div>

        {/* WhatsApp */}
        <div>
          <label className={labelCls}>
            <MessageCircle size={14} className={iconCls} />
            WhatsApp
          </label>
          <input
            type="text"
            value={values.clinicWhatsApp ?? ''}
            onChange={(e) => onChange({ clinicWhatsApp: e.target.value })}
            placeholder={labels.whatsappPlaceholder}
            className={inputCls}
          />
        </div>

        {/* Gmail */}
        <div>
          <label className={labelCls}>
            <Mail size={14} className={iconCls} />
            Gmail
          </label>
          <input
            type="text"
            value={values.clinicGmail ?? ''}
            onChange={(e) => onChange({ clinicGmail: e.target.value })}
            placeholder={labels.gmailPlaceholder}
            className={inputCls}
          />
        </div>

        {/* Instagram */}
        <div>
          <label className={labelCls}>
            <Camera size={14} className={iconCls} />
            Instagram
          </label>
          <input
            type="text"
            value={values.clinicInstagram ?? ''}
            onChange={(e) => onChange({ clinicInstagram: e.target.value })}
            placeholder={labels.instagramPlaceholder}
            className={inputCls}
          />
        </div>

        {/* Facebook */}
        <div>
          <label className={labelCls}>
            <Globe size={14} className={iconCls} />
            Facebook
          </label>
          <input
            type="text"
            value={values.clinicFacebook ?? ''}
            onChange={(e) => onChange({ clinicFacebook: e.target.value })}
            placeholder={labels.facebookPlaceholder}
            className={inputCls}
          />
        </div>

      </div>
    </section>
  );
}
