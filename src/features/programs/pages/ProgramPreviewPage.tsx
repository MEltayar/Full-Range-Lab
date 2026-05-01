import { useState, useEffect, useMemo } from 'react';
import { useToastStore } from '../../../store/toastStore';
import { usePlanStore } from '../../../store/planStore';
import { Lock } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Calendar, Clock, User, Target, Layers, BookTemplate, ChevronLeft } from 'lucide-react';
import ExportDropdown from '../../pdf/components/ExportDropdown';
import SendPanel from '../../pdf/components/SendPanel';
import SaveAsTemplateModal from '../../templates/components/SaveAsTemplateModal';
import { useProgramStore } from '../../../store/programStore';
import { useClientStore } from '../../../store/clientStore';
import { useExerciseStore } from '../../../store/exerciseStore';
import { useSettingsStore } from '../../../store/settingsStore';
import { generateAndDownload, generatePDFBlob } from '../../pdf/services/pdfExportService';
import { generateExcel } from '../../pdf/services/excelExportService';
import { shareFile } from '../../pdf/services/shareService';
import type { ClinicInfo } from '../../pdf/services/pdfExportService';
import { getCombinedTemplate } from '../../config/data/exportTemplates';

// ── Colour palette for session accents ────────────────────
const SESSION_ACCENTS = [
  'border-l-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300',
  'border-l-violet-500 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300',
  'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
  'border-l-cyan-500 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300',
  'border-l-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300',
  'border-l-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300',
];

function sessionAccent(i: number) {
  return SESSION_ACCENTS[i % SESSION_ACCENTS.length];
}

export default function ProgramPreviewPage() {
  const { id } = useParams<{ id: string }>();

  const programs      = useProgramStore((s) => s.programs);
  const isLoaded      = useProgramStore((s) => s.isLoaded);
  const initPrograms  = useProgramStore((s) => s.initializeFromDB);

  const clients       = useClientStore((s) => s.clients);
  const clientsLoaded = useClientStore((s) => s.isLoaded);
  const initClients   = useClientStore((s) => s.initializeFromDB);

  const exercises        = useExerciseStore((s) => s.exercises);
  const exercisesLoaded  = useExerciseStore((s) => s.isLoaded);
  const initExercises    = useExerciseStore((s) => s.initializeFromDB);

  const clinicName      = useSettingsStore((s) => s.clinicName);
  const clinicLogo      = useSettingsStore((s) => s.clinicLogo);
  const clinicPhone     = useSettingsStore((s) => s.clinicPhone);
  const clinicEmail     = useSettingsStore((s) => s.clinicEmail);
  const clinicAddress   = useSettingsStore((s) => s.clinicAddress);
  const clinicWebsite   = useSettingsStore((s) => s.clinicWebsite);
  const therapistName   = useSettingsStore((s) => s.therapistName);
  const clinicInstagram    = useSettingsStore((s) => s.clinicInstagram);
  const clinicFacebook     = useSettingsStore((s) => s.clinicFacebook);
  const clinicGmail        = useSettingsStore((s) => s.clinicGmail);
  const clinicWhatsApp     = useSettingsStore((s) => s.clinicWhatsApp);
  const exportTemplateId   = useSettingsStore((s) => s.exportTemplateId);
  const exportPaletteId    = useSettingsStore((s) => s.exportPaletteId);
  const exportTemplate     = getCombinedTemplate(exportTemplateId, exportPaletteId);
  const emailSubject  = useSettingsStore((s) => s.emailSubject);
  const emailTemplate = useSettingsStore((s) => s.emailTemplate);
  const whatsappTemplate = useSettingsStore((s) => s.whatsappTemplate);

  const showToast = useToastStore((s) => s.showToast);

  const limits = usePlanStore((s) => s.limits());
  const canSaveTemplate = limits.canSaveTemplate;

  const [exportingPDF, setExportingPDF]     = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [saveAsTemplateOpen, setSaveAsTemplateOpen] = useState(false);
  const [selectedSendOption, setSelectedSendOption] = useState<'email' | 'whatsapp' | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [fallbackMessage, setFallbackMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded)       initPrograms();
    if (!clientsLoaded)  initClients();
    if (!exercisesLoaded) initExercises();
  }, [isLoaded, clientsLoaded, exercisesLoaded, initPrograms, initClients, initExercises]);

  const program = useMemo(
    () => programs.find((p) => p.id === id),
    [programs, id],
  );

  const exerciseMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const ex of exercises) m.set(ex.id, ex.name);
    return m;
  }, [exercises]);

  if (!isLoaded || !clientsLoaded || !exercisesLoaded) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-gray-400 dark:text-gray-500 text-sm">Loading…</p>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <p className="text-gray-700 dark:text-gray-300 font-medium">Program not found</p>
        <Link to="/programs" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/40 hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors shadow-sm">
          <ChevronLeft size={15} /> Back to Programs
        </Link>
      </div>
    );
  }

  const client = clients.find((c) => c.id === program.clientId);
  const clientName = client?.name ?? 'Unknown client';

  const clinic: ClinicInfo = {
    clinicName,
    clinicLogo,
    clinicPhone,
    clinicEmail,
    clinicAddress,
    clinicWebsite,
    therapistName,
    clinicInstagram,
    clinicFacebook,
    clinicGmail,
    clinicWhatsApp,
  };

  async function handleExportPDF() {
    setExportingPDF(true);
    try {
      await generateAndDownload(program!, clientName, exercises, clinic, exportTemplate);
    } catch (err) {
      console.error('PDF export failed:', err);
      showToast('PDF export failed. Please try again.', 'error');
    } finally {
      setExportingPDF(false);
    }
  }

  async function handleExportExcel() {
    setExportingExcel(true);
    try {
      await generateExcel(program!, clientName, exercises, clinic, exportTemplate);
    } catch (err) {
      console.error('Excel export failed:', err);
      showToast('Excel export failed. Please try again.', 'error');
    } finally {
      setExportingExcel(false);
    }
  }

  async function handleSendEmail(subject: string, body: string) {
    setIsSending(true);
    try {
      const { blob, filename } = await generatePDFBlob(program!, clientName, exercises, clinic, exportTemplate);
      const { fallbackUsed } = await shareFile({ channel: 'email', blob, filename, title: subject, text: body });
      if (fallbackUsed) {
        setFallbackMessage('PDF downloaded — please attach it to your email before sending.');
      }
      setSelectedSendOption(null);
    } catch (err) {
      console.error('Send email failed:', err);
      showToast('Failed to prepare email. Please try again.', 'error');
    } finally {
      setIsSending(false);
    }
  }

  async function handleSendWhatsApp(body: string) {
    setIsSending(true);
    try {
      const { blob, filename } = await generatePDFBlob(program!, clientName, exercises, clinic, exportTemplate);
      const { fallbackUsed } = await shareFile({ channel: 'whatsapp', blob, filename, text: body, recipientPhone: client?.phone });
      if (fallbackUsed) {
        setFallbackMessage('PDF downloaded — please attach it in WhatsApp before sending.');
      }
      setSelectedSendOption(null);
    } catch (err) {
      console.error('Send WhatsApp failed:', err);
      showToast('Failed to prepare WhatsApp message. Please try again.', 'error');
    } finally {
      setIsSending(false);
    }
  }

  const totalExercises = program.sessions.reduce(
    (sum, s) => sum + s.exercises.length, 0,
  );

  return (
    <div className="flex flex-col gap-6">

      {/* ── Top action bar ─────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          to={`/programs/${id}/edit`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/40 hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors shadow-sm"
        >
          <ChevronLeft size={15} /> Back to Edit
        </Link>

        <div className="flex flex-wrap gap-2">
          {/* Save as Template button */}
          {canSaveTemplate ? (
            <button
              onClick={() => setSaveAsTemplateOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
            >
              <BookTemplate size={15} />
              <span className="hidden sm:inline">Save as Template</span>
              <span className="sm:hidden">Template</span>
            </button>
          ) : (
            <a
              href="/pricing"
              title="Upgrade to Pro to save templates"
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-600 border border-gray-200 dark:border-gray-700 shadow-sm"
            >
              <Lock size={13} />
              <span className="hidden sm:inline">Save as Template</span>
              <span className="sm:hidden">Template</span>
            </a>
          )}

          {/* Export / Send — always shown; ExportDropdown handles per-item locks */}
          <ExportDropdown
            onSelectPDF={handleExportPDF}
            onSelectExcel={handleExportExcel}
            onSelectEmail={() => setSelectedSendOption('email')}
            onSelectWhatsApp={() => setSelectedSendOption('whatsapp')}
            disabled={exportingPDF || exportingExcel || isSending || totalExercises === 0}
            loading={exportingPDF || exportingExcel || isSending}
          />
        </div>
      </div>

      {/* ── Fallback share banner ───────────────────────── */}
      {fallbackMessage && (
        <div className="flex items-start justify-between gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
          <span>{fallbackMessage}</span>
          <button
            type="button"
            onClick={() => setFallbackMessage(null)}
            className="shrink-0 text-amber-500 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Send panel ──────────────────────────────────── */}
      {selectedSendOption && (
        <SendPanel
          option={selectedSendOption}
          clientEmail={client?.email}
          clientPhone={client?.phone}
          clientId={program.clientId}
          defaultEmailSubject={emailSubject ?? ''}
          defaultEmailBody={emailTemplate ?? ''}
          defaultWhatsAppBody={whatsappTemplate ?? ''}
          isSending={isSending}
          onSendEmail={handleSendEmail}
          onSendWhatsApp={handleSendWhatsApp}
          onClose={() => setSelectedSendOption(null)}
        />
      )}

      {/* ── Clinic identity banner (if configured) ──────── */}
      {clinicName && (
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-xl px-6 py-4 text-white">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-300 mb-0.5">
            Prepared by
          </p>
          <p className="text-lg font-bold">{clinicName}</p>
          <div className="flex flex-wrap gap-x-5 gap-y-0.5 mt-1 text-sm text-blue-200">
            {therapistName && <span>Therapist: {therapistName}</span>}
            {clinicPhone    && <span>{clinicPhone}</span>}
            {clinicEmail    && <span>{clinicEmail}</span>}
            {clinicAddress  && <span>{clinicAddress}</span>}
          </div>
        </div>
      )}

      {/* ── Program header card ─────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        {/* Blue top accent strip */}
        <div className="h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600" />

        <div className="px-6 py-5">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {program.name}
          </h1>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="flex items-start gap-2">
              <User size={15} className="text-blue-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                  Client
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {clientName}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Target size={15} className="text-blue-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                  Condition
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {program.condition}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Clock size={15} className="text-blue-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                  Duration
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {program.durationWeeks} week{program.durationWeeks !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Calendar size={15} className="text-blue-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                  Start Date
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {new Date(program.startDate).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Layers size={15} className="text-blue-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                  Sessions
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {program.sessions.length} session{program.sessions.length !== 1 ? 's' : ''},{' '}
                  {totalExercises} exercise{totalExercises !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {therapistName && (
              <div className="flex items-start gap-2">
                <User size={15} className="text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                    Therapist
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {therapistName}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Goal ───────────────────────────────────────── */}
      {program.goal && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-5 py-4">
          <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest mb-1">
            Program Goal
          </p>
          <p className="text-sm text-amber-900 dark:text-amber-200 leading-relaxed">
            {program.goal}
          </p>
        </div>
      )}

      {/* ── Sessions ───────────────────────────────────── */}
      {program.sessions.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-5 py-10 text-center">
          <p className="text-sm text-gray-400 dark:text-gray-500">No sessions added yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {program.sessions.map((session, si) => {
            const accentClasses = sessionAccent(si);

            return (
              <div
                key={session.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm border-l-4"
                style={{ borderLeftColor: ['#6366f1','#8b5cf6','#3b82f6','#06b6d4','#14b8a6','#10b981'][si % 6] }}
              >
                {/* Session header */}
                <div className={`px-5 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2.5 ${accentClasses}`}>
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/60 dark:bg-black/20 text-xs font-bold">
                    {si + 1}
                  </span>
                  <h2 className="text-sm font-semibold">{session.label}</h2>
                  <span className="ml-auto text-xs font-normal opacity-70">
                    {session.exercises.length} exercise{session.exercises.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {session.exercises.length === 0 ? (
                  <div className="px-5 py-4">
                    <p className="text-xs text-gray-400 dark:text-gray-500 italic">Empty session</p>
                  </div>
                ) : (
                  <>
                    {/* Mobile card list */}
                    <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-700">
                      {session.exercises.map((pe) => (
                        <div key={pe.id} className="px-4 py-3 flex flex-col gap-1">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {exerciseMap.get(pe.exerciseId) ?? 'Unknown exercise'}
                          </p>
                          <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500 dark:text-gray-400">
                            {pe.sets   != null && <span>Sets: <strong className="text-gray-700 dark:text-gray-300">{pe.sets}</strong></span>}
                            {pe.reps   != null && <span>Reps: <strong className="text-gray-700 dark:text-gray-300">{pe.reps}</strong></span>}
                            {pe.holdTime   != null && <span>Hold: <strong className="text-gray-700 dark:text-gray-300">{pe.holdTime}s</strong></span>}
                            {pe.restSeconds != null && <span>Rest: <strong className="text-gray-700 dark:text-gray-300">{pe.restSeconds}s</strong></span>}
                          </div>
                          {pe.notes && <p className="text-xs text-gray-400 dark:text-gray-500 italic">{pe.notes}</p>}
                        </div>
                      ))}
                    </div>

                    {/* Desktop table */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-sm table-fixed">
                        <colgroup>
                          <col className="w-[38%]" />
                          <col className="w-[8%]" />
                          <col className="w-[8%]" />
                          <col className="w-[10%]" />
                          <col className="w-[10%]" />
                          <col className="w-[26%]" />
                        </colgroup>
                        <thead>
                          <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
                            <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Exercise</th>
                            <th className="text-center px-3 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Sets</th>
                            <th className="text-center px-3 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Reps</th>
                            <th className="text-center px-3 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Hold (s)</th>
                            <th className="text-center px-3 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Rest (s)</th>
                            <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {session.exercises.map((pe, ei) => (
                            <tr
                              key={pe.id}
                              className={`border-b border-gray-50 dark:border-gray-700/50 last:border-b-0 ${
                                ei % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/60 dark:bg-gray-900/30'
                              }`}
                            >
                              <td className="px-5 py-3 font-semibold text-gray-900 dark:text-gray-100 truncate">
                                {exerciseMap.get(pe.exerciseId) ?? 'Unknown exercise'}
                              </td>
                              <td className="px-3 py-3 text-center text-gray-700 dark:text-gray-300">
                                {pe.sets ?? <span className="text-gray-300 dark:text-gray-600">—</span>}
                              </td>
                              <td className="px-3 py-3 text-center text-gray-700 dark:text-gray-300">
                                {pe.reps ?? <span className="text-gray-300 dark:text-gray-600">—</span>}
                              </td>
                              <td className="px-3 py-3 text-center text-gray-700 dark:text-gray-300">
                                {pe.holdTime ?? <span className="text-gray-300 dark:text-gray-600">—</span>}
                              </td>
                              <td className="px-3 py-3 text-center text-gray-700 dark:text-gray-300">
                                {pe.restSeconds ?? <span className="text-gray-300 dark:text-gray-600">—</span>}
                              </td>
                              <td className="px-5 py-3 text-gray-500 dark:text-gray-400 text-xs">
                                {pe.notes ?? ''}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {program && (
        <SaveAsTemplateModal
          isOpen={saveAsTemplateOpen}
          onClose={() => setSaveAsTemplateOpen(false)}
          sessions={program.sessions}
          defaultName={program.name}
          defaultCondition={program.condition}
        />
      )}
    </div>
  );
}
