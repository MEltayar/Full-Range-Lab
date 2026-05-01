import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Plus, ChevronLeft } from 'lucide-react';
import { useToastStore } from '../../../store/toastStore';
import { arrayMove } from '@dnd-kit/sortable';
import { useTemplateStore } from '../../../store/templateStore';
import { useExerciseStore } from '../../../store/exerciseStore';
import SessionList from '../../programs/components/SessionList';
import ExercisePicker from '../../programs/components/ExercisePicker';
import type { ProgramExercise, Session } from '../../../types';

export default function TemplateEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const templates = useTemplateStore((s) => s.templates);
  const isLoaded = useTemplateStore((s) => s.isLoaded);
  const updateTemplate = useTemplateStore((s) => s.updateTemplate);

  const exercisesLoaded = useExerciseStore((s) => s.isLoaded);
  const initializeExercises = useExerciseStore((s) => s.initializeFromDB);
  const exercises = useExerciseStore((s) => s.exercises);

  const [name, setName] = useState('');
  const [condition, setCondition] = useState('');
  const [description, setDescription] = useState('');
  const [sessions, setSessions] = useState<Session[]>([]);
  const showToast = useToastStore((s) => s.showToast);
  const [nameError, setNameError] = useState('');
  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const exerciseMap = new Map(exercises.map((ex) => [ex.id, ex.name]));

  useEffect(() => {
    if (!exercisesLoaded) initializeExercises();
  }, [exercisesLoaded, initializeExercises]);

  useEffect(() => {
    if (!isLoaded) return;
    const template = templates.find((t) => t.id === id);
    if (!template) {
      navigate('/templates', { replace: true });
      return;
    }
    if (template.isBuiltIn) {
      navigate('/templates', { replace: true });
      return;
    }
    setName(template.name);
    setCondition(template.condition);
    setDescription(template.description ?? '');
    setSessions(JSON.parse(JSON.stringify(template.sessions)));
  }, [id, isLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-gray-400 dark:text-gray-500 text-sm">Loading…</p>
      </div>
    );
  }

  function handleUpdateLabel(sessionId: string, label: string) {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, label } : s))
    );
  }

  function handleUpdateDayOfWeek(sessionId: string, dayOfWeek: number | undefined) {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, dayOfWeek } : s))
    );
  }

  function handleDeleteSession(sessionId: string) {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
  }

  function handleAddSession() {
    const n = sessions.length + 1;
    setSessions((prev) => [
      ...prev,
      { id: crypto.randomUUID(), label: `Session ${n}`, exercises: [] },
    ]);
  }

  function handleAddExercise(sessionId: string, exerciseId: string) {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s;
        const newExercise: ProgramExercise = {
          id: crypto.randomUUID(),
          exerciseId,
          sets: 3,
          reps: '10',
          order: s.exercises.length,
        };
        return { ...s, exercises: [...s.exercises, newExercise] };
      })
    );
  }

  function handleUpdateParams(
    sessionId: string,
    programExerciseId: string,
    params: Partial<Pick<ProgramExercise, 'sets' | 'reps' | 'holdTime' | 'restSeconds' | 'notes'>>
  ) {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s;
        return {
          ...s,
          exercises: s.exercises.map((ex) =>
            ex.id === programExerciseId ? { ...ex, ...params } : ex
          ),
        };
      })
    );
  }

  function handleRemoveExercise(sessionId: string, programExerciseId: string) {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s;
        const filtered = s.exercises.filter((ex) => ex.id !== programExerciseId);
        return { ...s, exercises: filtered.map((ex, i) => ({ ...ex, order: i })) };
      })
    );
  }

  function handleReorder(sessionId: string, oldIndex: number, newIndex: number) {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s;
        const reordered = arrayMove(s.exercises, oldIndex, newIndex).map((ex, i) => ({
          ...ex,
          order: i,
        }));
        return { ...s, exercises: reordered };
      })
    );
  }

  async function handleSave() {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError('Template name is required.');
      return;
    }
    const duplicate = templates.some(
      (t) => t.id !== id && t.name.trim().toLowerCase() === trimmedName.toLowerCase(),
    );
    if (duplicate) {
      setNameError('A template with this name already exists. Please choose a different name.');
      return;
    }
    setSaving(true);
    try {
      await updateTemplate(id!, {
        name: trimmedName,
        condition: condition.trim(),
        description: description.trim() || undefined,
        sessions,
      });
      navigate('/templates');
    } catch (err) {
      console.error('Failed to save template:', err);
      showToast('Failed to save template. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Edit Template</h1>
        <Link
          to="/templates"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/40 hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors shadow-sm"
        >
          <ChevronLeft size={15} /> Back to Templates
        </Link>
      </div>

      {/* Meta form */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
            Template Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setNameError(''); }}
            placeholder="e.g. ACL Recovery Phase 1"
            className="px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          {nameError && (
            <p className="text-xs text-red-600 dark:text-red-400">{nameError}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Condition (optional)
            </label>
            <input
              type="text"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              placeholder="e.g. Rotator cuff rehabilitation"
              className="px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of this template's purpose…"
            rows={2}
            className="px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
          />
        </div>
      </div>

      {/* Sessions */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Sessions</h2>
          <button
            onClick={handleAddSession}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-orange-500 dark:text-orange-400 border border-orange-300 dark:border-orange-700 rounded-md hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
          >
            <Plus size={15} />
            Add Session
          </button>
        </div>

        {/* Unknown exercise notice */}
        {sessions.some((s) =>
          s.exercises.some((pe) => !exerciseMap.has(pe.exerciseId))
        ) && (
          <div className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md px-3 py-2">
            Some exercises are not found in the Exercise Library and show as "Unknown exercise". You can remove or replace them.
          </div>
        )}

        <SessionList
          sessions={sessions}
          onUpdateLabel={handleUpdateLabel}
          onUpdateDayOfWeek={handleUpdateDayOfWeek}
          onDeleteSession={handleDeleteSession}
          onAddExercise={(sessionId) => {
            setActiveSessionId(sessionId);
            setPickerOpen(true);
          }}
          onUpdateParams={handleUpdateParams}
          onRemoveExercise={handleRemoveExercise}
          onReorder={handleReorder}
          onReorderSessions={() => {}}
        />
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
        <Link
          to="/templates"
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Cancel
        </Link>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-medium rounded-md transition-colors"
        >
          {saving ? 'Saving…' : 'Save Template'}
        </button>
      </div>

      <ExercisePicker
        isOpen={pickerOpen}
        onClose={() => { setPickerOpen(false); setActiveSessionId(null); }}
        onSelect={(exerciseId) => {
          if (activeSessionId) handleAddExercise(activeSessionId, exerciseId);
        }}
      />
    </div>
  );
}
