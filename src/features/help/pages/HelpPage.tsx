import { useState } from 'react';
import { Mail, MessageCircle, Stethoscope, Users, HelpCircle, Zap, Pencil, Plus, Trash2, X, Save, ShieldCheck, FileText, FileSpreadsheet, Moon, Send, Crosshair, Dumbbell, Salad, Smartphone } from 'lucide-react';
import { useSettingsStore } from '../../../store/settingsStore';
import { useUserStore } from '../../../store/userStore';
import { BrandTile } from '../../../components/Brand';
import type { HelpAnnouncement } from '../../../types';

function genId() { return Math.random().toString(36).slice(2, 10); }

function fmtDate(iso: string) {
  try { return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); }
  catch { return iso; }
}

// ── What's New (admin-editable) ───────────────────────────────────────────────

function WhatsNewSection({ isAdmin }: { isAdmin: boolean }) {
  const announcements = useSettingsStore((s) => s.helpAnnouncements) ?? [];
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingNew, setAddingNew]   = useState(false);
  const [draft, setDraft]           = useState({ title: '', body: '' });
  const [saving, setSaving]         = useState(false);

  const persist = async (items: HelpAnnouncement[]) => {
    setSaving(true);
    try { await updateSettings({ helpAnnouncements: items }); }
    finally { setSaving(false); }
  };

  const handleAdd = async () => {
    if (!draft.title.trim()) return;
    const item: HelpAnnouncement = { id: genId(), title: draft.title.trim(), body: draft.body.trim(), date: new Date().toISOString() };
    await persist([item, ...announcements]);
    setDraft({ title: '', body: '' });
    setAddingNew(false);
  };

  const handleUpdate = async (id: string) => {
    await persist(announcements.map((a) => a.id === id ? { ...a, title: draft.title.trim(), body: draft.body.trim() } : a));
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    await persist(announcements.filter((a) => a.id !== id));
  };

  const startEdit = (a: HelpAnnouncement) => {
    setDraft({ title: a.title, body: a.body });
    setEditingId(a.id);
    setAddingNew(false);
  };

  if (announcements.length === 0 && !isAdmin) return null;

  return (
    <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700 bg-emerald-50 dark:bg-emerald-900/20">
        <div className="flex items-center gap-3">
          <Zap size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">What's New</h2>
        </div>
        {isAdmin && (
          <button
            onClick={() => { setDraft({ title: '', body: '' }); setAddingNew(true); setEditingId(null); }}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
          >
            <Plus size={13} /> Add Update
          </button>
        )}
      </div>
      <div className="px-5 py-5 flex flex-col gap-4">

        {addingNew && (
          <div className="border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 bg-emerald-50/50 dark:bg-emerald-900/10 flex flex-col gap-3">
            <input
              className="w-full text-sm font-semibold border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              placeholder="Update title…"
              value={draft.title}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
            />
            <textarea
              rows={3}
              className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
              placeholder="Describe what changed or was added…"
              value={draft.body}
              onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
            />
            <div className="flex gap-2">
              <button onClick={handleAdd} disabled={saving || !draft.title.trim()} className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 transition-colors">
                <Save size={13} /> {saving ? 'Saving…' : 'Save'}
              </button>
              <button onClick={() => setAddingNew(false)} className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors">
                <X size={13} /> Cancel
              </button>
            </div>
          </div>
        )}

        {announcements.length === 0 && !addingNew && isAdmin && (
          <p className="text-sm text-gray-400 dark:text-gray-500 italic">No updates yet. Click "Add Update" to post your first announcement.</p>
        )}

        {announcements.map((a) => (
          <div key={a.id} className="border-b border-gray-50 dark:border-gray-700/50 last:border-0 pb-4 last:pb-0">
            {editingId === a.id ? (
              <div className="flex flex-col gap-3">
                <input
                  className="w-full text-sm font-semibold border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  value={draft.title}
                  onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                />
                <textarea
                  rows={3}
                  className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
                  value={draft.body}
                  onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
                />
                <div className="flex gap-2">
                  <button onClick={() => handleUpdate(a.id)} disabled={saving} className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 transition-colors">
                    <Save size={13} /> {saving ? 'Saving…' : 'Save'}
                  </button>
                  <button onClick={() => setEditingId(null)} className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors">
                    <X size={13} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{a.title}</p>
                    <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">{fmtDate(a.date)}</span>
                  </div>
                  {a.body && <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{a.body}</p>}
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => startEdit(a)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => handleDelete(a.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function HelpPage() {
  const isSuperAdmin   = useUserStore((s) => s.isSuperAdmin());
  const clinicGmail    = useSettingsStore((s) => s.clinicGmail);
  const clinicWhatsApp = useSettingsStore((s) => s.clinicWhatsApp);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  const [editingContact, setEditingContact] = useState(false);
  const [emailDraft, setEmailDraft]         = useState('');
  const [whatsappDraft, setWhatsappDraft]   = useState('');
  const [savingContact, setSavingContact]   = useState(false);

  const startContactEdit = () => {
    setEmailDraft(clinicGmail ?? '');
    setWhatsappDraft(clinicWhatsApp ?? '');
    setEditingContact(true);
  };

  const saveContact = async () => {
    setSavingContact(true);
    try {
      await updateSettings({ clinicGmail: emailDraft.trim() || undefined, clinicWhatsApp: whatsappDraft.trim() || undefined });
      setEditingContact(false);
    } finally { setSavingContact(false); }
  };

  const strip = (p: string) => p.replace(/[^\d+]/g, '');
  const displayEmail    = clinicGmail    ?? 'Mostafaeltayar98@gmail.com';
  const displayWhatsApp = clinicWhatsApp ?? '+20 102 175 1325';
  const emailHref  = `mailto:${displayEmail}`;
  const waHref     = `https://wa.me/${strip(displayWhatsApp)}`;

  return (
    <div className="flex flex-col gap-8 pb-10">

      {/* Page header */}
      <div className="flex items-center gap-4">
        <BrandTile className="w-12 h-12 rounded-xl shadow-md" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Help & About</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Everything you need to know about Full Range Lab.
          </p>
        </div>
      </div>

      {/* What's New — visible to all if there are posts, editable by admin */}
      <WhatsNewSection isAdmin={isSuperAdmin} />

      {/* ── What is Full Range Lab ───────────────────── */}
      <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">
          <HelpCircle size={18} className="text-blue-600 dark:text-blue-400 shrink-0" />
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">What is Full Range Lab?</h2>
        </div>
        <div className="px-5 py-5 flex flex-col gap-3 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          <p>
            <strong className="text-gray-900 dark:text-gray-100">Full Range Lab</strong> is a
            professional client management platform built for fitness and healthcare practitioners
            — personal trainers, physiotherapists, nutritionists, and rehab coaches — who need
            a single place to manage clients, build programs, plan nutrition, and deliver polished
            exports.
          </p>
          <p>
            Build multi-session training programs with full exercise parameters, create day-by-day
            diet plans with automatic macro calculations, track body metrics over time, and export
            everything as a branded PDF or Excel sheet in seconds — with your clinic logo, colours,
            and contact details already on it.
          </p>
          <p>
            Full Range Lab covers the full picture: a 500+ exercise library with video links,
            pre-built rehabilitation templates, 30 PDF layout styles, diet plan exports, client
            activity timelines, and body metrics tracking — all linked to the same client profile.
          </p>
          <p>
            And clients aren't left out — every client gets their own private, mobile-friendly
            portal to see their program, log check-ins, upload progress photos, and follow their
            diet plan, all under your branding.
          </p>
        </div>
      </section>

      {/* ── Why Full Range Lab ──────────────────────── */}
      <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-700 bg-orange-50 dark:bg-orange-900/20">
          <ShieldCheck size={18} className="text-orange-600 dark:text-orange-400 shrink-0" />
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Why Full Range Lab</h2>
        </div>
        <div className="px-5 py-5 flex flex-col gap-4 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          <p>
            Most platforms in this space focus on gym business operations — subscriptions, payments,
            and leads. Full Range Lab focuses on what actually matters: building great programs and
            plans for your clients, whether you are a physio, a trainer, or both.
          </p>
          <div className="flex flex-col gap-3 mt-1">
            {[
              {
                icon: Crosshair,
                title: 'Built for both rehab and fitness coaching',
                desc: 'Whether you run a physio clinic or a personal training business, Full Range Lab adapts — with separate exercise libraries, category systems, and program templates for rehabilitation and gym training in one platform.',
                color: 'text-orange-500',
              },
              {
                icon: Users,
                title: 'Everything on one client profile',
                desc: 'Training programs, diet plans, body metrics, check-ins, and activity history — all linked to the same client. No jumping between modules or losing context.',
                color: 'text-teal-500',
              },
              {
                icon: Smartphone,
                title: 'Branded mobile-first client portal',
                desc: 'Clients get their own private login to view their program and diet plan, log check-ins, and upload progress photos — all under your branding, with a per-client subscription window you control.',
                color: 'text-rose-500',
              },
              {
                icon: FileText,
                title: '30 professional PDF layouts',
                desc: 'Export polished program sheets across 30 layout variants with your full branding — logo, colours, address, social links, and coach name — not just a logo stamp on a generic template.',
                color: 'text-blue-500',
              },
              {
                icon: FileSpreadsheet,
                title: 'Excel export included',
                desc: 'Export your programs and diet plans as fully formatted, colour-coded Excel spreadsheets — ideal for sharing structured plans with clients or keeping records.',
                color: 'text-emerald-500',
              },
              {
                icon: Dumbbell,
                title: 'Exercise library built for real practitioners',
                desc: 'Browse 500+ exercises organised by category, muscle group, equipment, and progression level — each with video links. Add your own custom exercises on top of the built-in library.',
                color: 'text-orange-400',
              },
              {
                icon: Salad,
                title: 'Full food library with macro tracking',
                desc: 'A comprehensive food database with serving sizes, calories, protein, carbs, fat, and alternative serving options. Build meal plans with macros calculated automatically per meal and per day.',
                color: 'text-lime-500',
              },
              {
                icon: Send,
                title: 'Send directly via WhatsApp or email',
                desc: 'Deliver a PDF to your client via WhatsApp or email without leaving the app — no downloading, no switching tools, no extra steps.',
                color: 'text-green-500',
              },
              {
                icon: Moon,
                title: 'Full dark mode',
                desc: "Complete dark mode across every page and component — not a partial implementation that only covers half the app.",
                color: 'text-violet-500',
              },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="flex items-start gap-3 py-3 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                <Icon size={17} className={`mt-0.5 shrink-0 ${color}`} />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 mb-0.5">{title}</p>
                  <p className="text-gray-500 dark:text-gray-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who is it for ────────────────────────────── */}
      <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-700 bg-teal-50 dark:bg-teal-900/20">
          <Users size={18} className="text-teal-600 dark:text-teal-400 shrink-0" />
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Who is it for?</h2>
        </div>
        <div className="px-5 py-5 flex flex-col gap-4 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          <p>
            Full Range Lab is built for healthcare and fitness professionals who prescribe
            structured programs to clients, including:
          </p>
          <ul className="flex flex-col gap-3">
            {[
              { title: 'Personal Trainers & Strength Coaches', desc: 'Create progressive training blocks with full exercise parameters, linked diet plans, and body composition tracking across check-ins.' },
              { title: 'Physiotherapists',                     desc: 'Build condition-specific rehab programs, track recovery progress, and export professional session sheets for patients.' },
              { title: 'Sports Rehabilitation Therapists',     desc: 'Manage athletes returning from injury with phased programs, plan status tracking, and exportable documentation.' },
              { title: 'Nutritionists & Dietitians',           desc: 'Design day-by-day meal plans with automatic macro breakdowns, food library management, and branded diet plan exports.' },
              { title: 'Chiropractors & Osteopaths',           desc: 'Prescribe home exercise routines with video-linked exercises and generate patient-ready PDF handouts.' },
              { title: 'Occupational Therapists',              desc: 'Create functional movement programs tailored to specific conditions and goals.' },
            ].map(({ title, desc }) => (
              <li key={title} className="flex items-start gap-3">
                <Stethoscope size={15} className="text-teal-500 dark:text-teal-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-gray-900 dark:text-gray-100">{title}</strong>
                  {' '}— {desc}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-gray-500 dark:text-gray-400 italic">
            If your work involves prescribing movement or nutrition — Full Range Lab was made for you.
          </p>
        </div>
      </section>

      {/* ── Contact & Feedback ───────────────────────── */}
      <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700 bg-violet-50 dark:bg-violet-900/20">
          <div className="flex items-center gap-3">
            <Mail size={18} className="text-violet-600 dark:text-violet-400 shrink-0" />
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Contact & Feedback</h2>
          </div>
          {isSuperAdmin && !editingContact && (
            <button onClick={startContactEdit} className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-violet-200 dark:border-violet-700 hover:bg-violet-100 dark:hover:bg-violet-800/30 text-violet-600 dark:text-violet-400 transition-colors">
              <Pencil size={13} /> Edit
            </button>
          )}
        </div>
        <div className="px-5 py-5 flex flex-col gap-5 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          <p>
            Full Range Lab is constantly evolving, and your experience as a practitioner is
            what shapes it.
          </p>
          <p>
            Whether you have a feature idea that would improve your workflow, spotted something
            that isn't working as expected, or simply want to share your thoughts — I'd love
            to hear from you.
          </p>

          {editingContact ? (
            <div className="flex flex-col gap-3 p-4 bg-gray-50 dark:bg-gray-700/40 rounded-xl border border-gray-200 dark:border-gray-600">
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Email</label>
                <input
                  type="email"
                  className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-400"
                  placeholder="your@email.com"
                  value={emailDraft}
                  onChange={(e) => setEmailDraft(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">WhatsApp number</label>
                <input
                  type="text"
                  className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-400"
                  placeholder="+1 234 567 8900"
                  value={whatsappDraft}
                  onChange={(e) => setWhatsappDraft(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <button onClick={saveContact} disabled={savingContact} className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white disabled:opacity-50 transition-colors">
                  <Save size={13} /> {savingContact ? 'Saving…' : 'Save'}
                </button>
                <button onClick={() => setEditingContact(false)} className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors">
                  <X size={13} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={emailHref}
                className="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group"
              >
                <Mail size={18} className="text-blue-500 shrink-0" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100 text-xs uppercase tracking-wide mb-0.5">Email</p>
                  <p className="text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{displayEmail}</p>
                </div>
              </a>

              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-green-400 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors group"
              >
                <MessageCircle size={18} className="text-green-500 shrink-0" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100 text-xs uppercase tracking-wide mb-0.5">WhatsApp</p>
                  <p className="text-gray-600 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">{displayWhatsApp}</p>
                </div>
              </a>
            </div>
          )}

          <p className="text-gray-400 dark:text-gray-500 text-xs">
            Every message is read and genuinely appreciated. Your feedback directly influences
            what gets built next.
          </p>
        </div>
      </section>

    </div>
  );
}
