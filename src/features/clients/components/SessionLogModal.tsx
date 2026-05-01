import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { Program, Session, Exercise, LoggedExercise, LoggedSet } from '../../../types';
import { useClientSessionLogStore } from '../../../store/clientSessionLogStore';

interface SessionLogModalProps {
  clientId: string;
  clientName: string;
  programs: Program[];
  exercises: Exercise[];
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

const INPUT = 'px-2 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full';
const SMALL = `${INPUT} text-center`;
const LABEL = 'text-xs font-medium text-gray-500 dark:text-gray-400';

function emptySet(): LoggedSet { return { weightKg: undefined, reps: undefined, rpe: undefined }; }

function buildInitialExercises(session: Session | undefined): LoggedExercise[] {
  if (!session) return [];
  return session.exercises.map((pe) => ({
    exerciseId: pe.exerciseId,
    sets: Array.from({ length: pe.sets ?? 3 }, () => emptySet()),
    notes: undefined,
  }));
}

export default function SessionLogModal({
  clientId, clientName, programs, exercises, isOpen, onClose, onSaved,
}: SessionLogModalProps) {
  const addLog = useClientSessionLogStore((s) => s.addLog);

  const [loggedAt, setLoggedAt]   = useState(new Date().toISOString().split('T')[0]);
  const [programId, setProgramId] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  const [items, setItems]         = useState<LoggedExercise[]>([]);
  const [notes, setNotes]         = useState('');
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');

  const selectedProgram = useMemo(
    () => programs.find((p) => p.id === programId),
    [programs, programId],
  );
  const selectedSession = useMemo(
    () => selectedProgram?.sessions.find((s) => s.id === sessionId),
    [selectedProgram, sessionId],
  );

  const exerciseById = useMemo(() => {
    const m: Record<string, Exercise> = {};
    exercises.forEach((e) => { m[e.id] = e; });
    return m;
  }, [exercises]);

  // On open, default to active program + first session
  useEffect(() => {
    if (!isOpen) return;
    const active = programs.find((p) => p.status === 'active') ?? programs[0];
    const newProgramId = active?.id ?? '';
    const newSessionId = active?.sessions[0]?.id ?? '';
    setLoggedAt(new Date().toISOString().split('T')[0]);
    setProgramId(newProgramId);
    setSessionId(newSessionId);
    setItems(buildInitialExercises(active?.sessions[0]));
    setNotes('');
    setError('');
  }, [isOpen, programs]);

  // When program changes, jump to its first session
  function handleProgramChange(newProgramId: string) {
    setProgramId(newProgramId);
    const prog = programs.find((p) => p.id === newProgramId);
    const firstSessionId = prog?.sessions[0]?.id ?? '';
    setSessionId(firstSessionId);
    setItems(buildInitialExercises(prog?.sessions[0]));
  }

  function handleSessionChange(newSessionId: string) {
    setSessionId(newSessionId);
    const sess = selectedProgram?.sessions.find((s) => s.id === newSessionId);
    setItems(buildInitialExercises(sess));
  }

  function updateSet(exIdx: number, setIdx: number, patch: Partial<LoggedSet>) {
    setItems((prev) => {
      const copy = prev.map((it) => ({ ...it, sets: it.sets.slice() }));
      copy[exIdx].sets[setIdx] = { ...copy[exIdx].sets[setIdx], ...patch };
      return copy;
    });
  }
  function addSetRow(exIdx: number) {
    setItems((prev) => {
      const copy = prev.map((it) => ({ ...it, sets: it.sets.slice() }));
      copy[exIdx].sets.push(emptySet());
      return copy;
    });
  }
  function removeSetRow(exIdx: number, setIdx: number) {
    setItems((prev) => {
      const copy = prev.map((it) => ({ ...it, sets: it.sets.slice() }));
      copy[exIdx].sets.splice(setIdx, 1);
      return copy;
    });
  }
  function updateExerciseNotes(exIdx: number, n: string) {
    setItems((prev) => prev.map((it, i) => i === exIdx ? { ...it, notes: n || undefined } : it));
  }

  async function handleSave() {
    // Strip empty sets so we don't store noise.
    const cleaned: LoggedExercise[] = items
      .map((it) => ({
        ...it,
        sets: it.sets.filter((s) => s.weightKg !== undefined || s.reps !== undefined || s.rpe !== undefined),
      }))
      .filter((it) => it.sets.length > 0 || it.notes);

    if (cleaned.length === 0 && !notes.trim()) {
      setError('Log at least one set or add a note.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await addLog({
        clientId,
        programId: programId || undefined,
        programSessionId: sessionId || undefined,
        loggedAt,
        exercises: cleaned,
        notes: notes.trim() || undefined,
      });
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save session log.');
    } finally {
      setSaving(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/55 flex items-start justify-center z-50 p-4 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl my-8">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Log Session</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">{clientName}</p>
          </div>
        </div>

        <div className="px-6 py-5 flex flex-col gap-5 max-h-[70vh] overflow-y-auto">

          {/* Top row: date + program + session */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <label className={LABEL}>Date</label>
              <input type="date" value={loggedAt} onChange={(e) => setLoggedAt(e.target.value)} className={INPUT} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={LABEL}>Program</label>
              <select value={programId} onChange={(e) => handleProgramChange(e.target.value)} className={INPUT}>
                <option value="">— No program —</option>
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>{p.name || 'Untitled'}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className={LABEL}>Session</label>
              <select value={sessionId} onChange={(e) => handleSessionChange(e.target.value)} className={INPUT} disabled={!selectedProgram}>
                <option value="">— Pick a session —</option>
                {selectedProgram?.sessions.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Exercises */}
          {items.length === 0 ? (
            <div className="border border-dashed border-gray-200 dark:border-gray-700 rounded-lg py-8 text-center">
              <p className="text-sm text-gray-400">
                {selectedProgram
                  ? 'This session has no exercises yet.'
                  : 'Pick a program and session above to log sets, or just add notes below.'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {items.map((item, exIdx) => {
                const ex = exerciseById[item.exerciseId];
                const prescribed = selectedSession?.exercises.find((p) => p.exerciseId === item.exerciseId);
                return (
                  <div key={`${item.exerciseId}-${exIdx}`} className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                    <div className="flex items-baseline justify-between gap-2 mb-2">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {ex?.name ?? '(unknown exercise)'}
                      </p>
                      {prescribed && (
                        <p className="text-[11px] text-gray-400 shrink-0">
                          Prescribed: {prescribed.sets ?? '—'}×{prescribed.reps ?? '—'}
                          {prescribed.weightKg ? ` @ ${prescribed.weightKg}kg` : ''}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-[24px_1fr_1fr_1fr_24px] gap-2 items-center">
                      <span className="text-[10px] font-semibold text-gray-400 uppercase">#</span>
                      <span className="text-[10px] font-semibold text-gray-400 uppercase text-center">Weight (kg)</span>
                      <span className="text-[10px] font-semibold text-gray-400 uppercase text-center">Reps</span>
                      <span className="text-[10px] font-semibold text-gray-400 uppercase text-center">RPE</span>
                      <span />

                      {item.sets.map((s, setIdx) => (
                        <div key={setIdx} className="contents">
                          <span className="text-xs text-gray-400 text-center">{setIdx + 1}</span>
                          <input
                            type="number"
                            value={s.weightKg ?? ''}
                            onChange={(e) => updateSet(exIdx, setIdx, { weightKg: e.target.value === '' ? undefined : Number(e.target.value) })}
                            className={SMALL}
                            placeholder="—"
                            step="0.5"
                          />
                          <input
                            type="number"
                            value={s.reps ?? ''}
                            onChange={(e) => updateSet(exIdx, setIdx, { reps: e.target.value === '' ? undefined : Number(e.target.value) })}
                            className={SMALL}
                            placeholder="—"
                          />
                          <input
                            type="number"
                            value={s.rpe ?? ''}
                            onChange={(e) => updateSet(exIdx, setIdx, { rpe: e.target.value === '' ? undefined : Number(e.target.value) })}
                            className={SMALL}
                            placeholder="—"
                            min={1}
                            max={10}
                            step="0.5"
                          />
                          <button
                            type="button"
                            onClick={() => removeSetRow(exIdx, setIdx)}
                            className="text-gray-300 hover:text-red-500 transition-colors"
                            disabled={item.sets.length === 1}
                            aria-label="Remove set"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between gap-3 mt-2">
                      <button
                        type="button"
                        onClick={() => addSetRow(exIdx)}
                        className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        <Plus size={11} /> Add set
                      </button>
                      <input
                        type="text"
                        value={item.notes ?? ''}
                        onChange={(e) => updateExerciseNotes(exIdx, e.target.value)}
                        className={`${INPUT} text-xs flex-1`}
                        placeholder="Notes for this exercise (optional)"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Session notes */}
          <div className="flex flex-col gap-1">
            <label className={LABEL}>Session notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={`${INPUT} resize-none`}
              rows={2}
              placeholder="How the session went, energy, pain points..."
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-md transition-colors disabled:opacity-50">
            {saving ? 'Saving…' : 'Save log'}
          </button>
        </div>
      </div>
    </div>
  );
}
