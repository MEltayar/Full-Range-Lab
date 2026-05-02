import { useEffect, useRef, useState } from 'react';
import { MessageCircle, Mail, MessageSquare, X } from 'lucide-react';
import { CONTACT_NUMBER } from '../lib/paymentConfig';

const FEEDBACK_EMAIL = 'mostafaeltayar98@gmail.com';
const SUBJECT = 'Feedback on Full Range Lab';
const BODY_TEMPLATE =
  "Hi, I'm using Full Range Lab and wanted to share some feedback:\n\n" +
  "What I was doing:\n\n" +
  "What happened:\n\n" +
  "What I expected:\n\n" +
  "Browser / device (optional):\n";

export default function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const whatsappHref = `https://wa.me/${CONTACT_NUMBER.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(SUBJECT + '\n\n' + BODY_TEMPLATE)}`;
  const mailtoHref   = `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(SUBJECT)}&body=${encodeURIComponent(BODY_TEMPLATE)}`;

  return (
    <div ref={containerRef} className="fixed bottom-4 right-4 z-40">
      {open && (
        <div className="mb-2 w-60 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 dark:border-gray-700/60">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Send feedback</span>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Close"
            >
              <X size={14} />
            </button>
          </div>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
          >
            <MessageSquare size={15} className="text-emerald-600 dark:text-emerald-400" />
            WhatsApp
          </a>
          <a
            href={mailtoHref}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-t border-gray-100 dark:border-gray-700/60 transition-colors"
          >
            <Mail size={15} className="text-blue-600 dark:text-blue-400" />
            Email
          </a>
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Send feedback"
        className="flex items-center gap-2 pl-3 pr-3.5 py-2.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold shadow-lg shadow-orange-500/30 transition-colors"
      >
        <MessageCircle size={16} />
        <span className="hidden sm:inline">Feedback</span>
      </button>
    </div>
  );
}
