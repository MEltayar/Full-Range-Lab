import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Plus, BookTemplate, UserPlus, Lock, ChevronLeft } from 'lucide-react';
import { useToastStore } from '../../../store/toastStore';
import { useConfirmStore } from '../../../store/confirmStore';
import { useProgramStore } from '../../../store/programStore';
import { usePlanStore } from '../../../store/planStore';
import { useProfileTerms } from '../../../hooks/useProfileTerms';
import { useClientStore } from '../../../store/clientStore';
import { useExerciseStore } from '../../../store/exerciseStore';
import { useTemplateStore } from '../../../store/templateStore';
import ProgramMetaForm from '../components/ProgramMetaForm';
import SessionList from '../components/SessionList';
import ExercisePicker from '../components/ExercisePicker';
import SaveAsTemplateModal from '../../templates/components/SaveAsTemplateModal';

export default function ProgramBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const programs = useProgramStore((s) => s.programs);
  const isLoaded = useProgramStore((s) => s.isLoaded);
  const draft = useProgramStore((s) => s.draft);
  const initializePrograms = useProgramStore((s) => s.initializeFromDB);
  const startNewDraft = useProgramStore((s) => s.startNewDraft);
  const loadDraftFromProgram = useProgramStore((s) => s.loadDraftFromProgram);
  const loadDraftFromTemplate = useProgramStore((s) => s.loadDraftFromTemplate);
  const clearDraft = useProgramStore((s) => s.clearDraft);

  const templatesList = useTemplateStore((s) => s.templates);
  const saveDraft = useProgramStore((s) => s.saveDraft);
  const setDraftField = useProgramStore((s) => s.setDraftField);
  const addSession = useProgramStore((s) => s.addSession);
  const updateSessionLabel = useProgramStore((s) => s.updateSessionLabel);
  const updateSessionDayOfWeek = useProgramStore((s) => s.updateSessionDayOfWeek);
  const deleteSession = useProgramStore((s) => s.deleteSession);
  const addExerciseToSession = useProgramStore((s) => s.addExerciseToSession);
  const updateExerciseParams = useProgramStore((s) => s.updateExerciseParams);
  const removeExerciseFromSession = useProgramStore((s) => s.removeExerciseFromSession);
  const reorderExercisesInSession = useProgramStore((s) => s.reorderExercisesInSession);
  const reorderSessions = useProgramStore((s) => s.reorderSessions);
  const deleteProgramAction = useProgramStore((s) => s.deleteProgram);

  const clients = useClientStore((s) => s.clients);
  const clientsLoaded = useClientStore((s) => s.isLoaded);
  const initializeClients = useClientStore((s) => s.initializeFromDB);

  const exercisesLoaded = useExerciseStore((s) => s.isLoaded);
  const initializeExercises = useExerciseStore((s) => s.initializeFromDB);

  const showToast = useToastStore((s) => s.showToast);
  const showConfirm = useConfirmStore((s) => s.showConfirm);
  const terms = useProfileTerms();

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [saveAsTemplateOpen, setSaveAsTemplateOpen] = useState(false);
  const [noClientDismissed, setNoClientDismissed] = useState(false);

  useEffect(() => {
    if (!clientsLoaded) initializeClients();
    if (!exercisesLoaded) initializeExercises();
  }, [clientsLoaded, exercisesLoaded, initializeClients, initializeExercises]);

  useEffect(() => {
    if (!id) {
      const templateId = searchParams.get('template');
      if (templateId) {
        const template = templatesList.find((t) => t.id === templateId);
        if (template) {
          if (template.sessions.length === 0) {
            showToast('This template has no sessions. You can add sessions below.', 'info');
          }
          loadDraftFromTemplate(template);
        } else {
          startNewDraft('');
          showToast('Template not found. Starting a blank program.', 'error');
        }
      } else {
        startNewDraft('');
      }
    } else {
      if (!isLoaded) {
        initializePrograms();
      }
    }
    return () => clearDraft();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (id && isLoaded) {
      const program = programs.find((p) => p.id === id);
      if (program) {
        loadDraftFromProgram(program);
      } else {
        setNotFound(true);
      }
    }
  }, [id, isLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <p className="text-gray-700 dark:text-gray-300 font-medium">Program not found</p>
        <Link to="/programs" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/40 hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors shadow-sm">
          <ChevronLeft size={15} /> Back to Programs
        </Link>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-400 dark:text-gray-500 text-sm">Loading…</p>
      </div>
    );
  }

  const showNoClientBanner = !id && clientsLoaded && clients.length === 0 && !noClientDismissed;

  async function handleSave() {
    if (!draft) return;
    const errs: Record<string, string> = {};
    if (!draft.clientId && clients.length > 0) errs.clientId = 'Please select a client.';
    if (!draft.name.trim()) {
      errs.name = 'Program name is required.';
    } else {
      const nameTaken = programs.some(
        (p) => p.clientId === draft.clientId &&
               p.name.trim().toLowerCase() === draft.name.trim().toLowerCase() &&
               p.id !== draft.id
      );
      if (nameTaken) errs.name = 'A program with this name already exists for this client.';
    }
    if (!Number.isInteger(draft.durationWeeks) || draft.durationWeeks < 1 || draft.durationWeeks > 52) {
      errs.durationWeeks = 'Duration must be a whole number between 1 and 52.';
    }
    if (!draft.startDate) errs.startDate = 'Start date is required.';
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      const first = Object.values(errs)[0];
      document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });
      showToast(first, 'error');
      return;
    }
    setSaving(true);
    try {
      const savedId = draft.id;
      await saveDraft();
      document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });
      showToast('Program saved! Click Preview to review it.', 'success');
      if (!id) {
        navigate(`/programs/${savedId}/edit`, { replace: true });
      }
    } catch (err) {
      console.error('Save failed:', err);
      const message = err instanceof Error ? err.message : 'Failed to save program. Please try again.';
      showToast(message, 'error');
    } finally {
      setSaving(false);
    }
  }

  function handleDelete() {
    if (!id || !draft) return;
    showConfirm({
      title: 'Delete Program',
      message: `Are you sure you want to delete "${draft.name}"? This cannot be undone.`,
      variant: 'danger',
      onConfirm: async () => {
        await deleteProgramAction(id);
        navigate('/programs');
      },
    });
  }

  const isEditMode = Boolean(id);

  // Program limit check — only relevant for new programs
  const programLimitReached = (() => {
    if (isEditMode) return false;
    const limits = usePlanStore.getState().limits();
    if (limits.maxProgramsPerClient === Infinity) return false;
    if (!draft?.clientId) return false;
    const clientProgramCount = programs.filter((p) => p.clientId === draft.clientId).length;
    return clientProgramCount >= limits.maxProgramsPerClient;
  })();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
          {isEditMode ? `Edit ${terms.programLabel}` : `New ${terms.programLabel}`}
        </h1>
        <div className="flex items-center gap-2">
          {usePlanStore.getState().limits().canSaveTemplate ? (
            <button
              onClick={() => setSaveAsTemplateOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <BookTemplate size={14} />
              Save as Template
            </button>
          ) : (
            <a
              href="/pricing"
              title="Upgrade to Pro to save templates"
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-400 dark:text-gray-600 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md"
            >
              <Lock size={13} />
              Save as Template
            </a>
          )}
          {usePlanStore.getState().limits().canPreview ? (
            isEditMode ? (
              <Link
                to={`/programs/${id}/preview`}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Preview
              </Link>
            ) : (
              <span
                title="Save the program first to preview it"
                className="px-4 py-2 text-sm font-medium text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md cursor-not-allowed"
              >
                Preview
              </span>
            )
          ) : (
            <a
              href="/pricing"
              title="Upgrade to Pro to preview programs"
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-400 dark:text-gray-600 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md"
            >
              <Lock size={13} />
              Preview
            </a>
          )}
        </div>
      </div>

      {showNoClientBanner && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-lg px-4 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-start gap-3 flex-1">
            <UserPlus size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">No clients yet</p>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Add a client to assign this program, or continue building it and assign a client later.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/clients"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded-md transition-colors"
            >
              <UserPlus size={13} />
              Add Client
            </Link>
            <button
              onClick={() => setNoClientDismissed(true)}
              className="px-3 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-300 border border-amber-400 dark:border-amber-600 rounded-md hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
            >
              Continue anyway
            </button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5">
        <ProgramMetaForm
          draft={draft}
          clients={clients}
          errors={errors}
          onChange={(field, value) => {
            setDraftField(field as Parameters<typeof setDraftField>[0], value);
            if (errors[field]) setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
          }}
        />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{terms.sessionLabel}s</h2>
          <button
            onClick={addSession}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-orange-500 dark:text-orange-400 border border-orange-300 dark:border-orange-700 rounded-md hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
          >
            <Plus size={15} />
            Add {terms.sessionLabel}
          </button>
        </div>

        <SessionList
          sessions={draft.sessions}
          onUpdateLabel={updateSessionLabel}
          onUpdateDayOfWeek={updateSessionDayOfWeek}
          onDeleteSession={deleteSession}
          onAddExercise={(sessionId) => {
            setActiveSessionId(sessionId);
            setPickerOpen(true);
          }}
          onUpdateParams={updateExerciseParams}
          onRemoveExercise={removeExerciseFromSession}
          onReorder={reorderExercisesInSession}
          onReorderSessions={reorderSessions}
        />
      </div>

      <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-3">
          <Link
            to="/programs"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/40 hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors shadow-sm"
          >
            <ChevronLeft size={15} /> Back to Programs
          </Link>
          {isEditMode && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-white dark:bg-gray-800 border border-red-300 dark:border-red-700 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              Delete Program
            </button>
          )}
        </div>

        {programLimitReached ? (
          <a
            href="/pricing"
            title="Upgrade to Pro for unlimited programs per client"
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-400 dark:text-gray-600 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md"
          >
            <Lock size={13} />
            Save (limit reached)
          </a>
        ) : (
          <button
            onClick={handleSave}
            disabled={saving || !draft?.name?.trim()}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        )}
      </div>

      <ExercisePicker
        isOpen={pickerOpen}
        onClose={() => { setPickerOpen(false); setActiveSessionId(null); }}
        onSelect={(exerciseId) => {
          if (activeSessionId) addExerciseToSession(activeSessionId, exerciseId);
        }}
      />

      <SaveAsTemplateModal
        isOpen={saveAsTemplateOpen}
        onClose={() => setSaveAsTemplateOpen(false)}
        sessions={draft.sessions}
        defaultName={draft.name}
        defaultCondition={draft.condition}
      />
    </div>
  );
}
