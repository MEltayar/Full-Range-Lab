import { useState } from 'react';
import { AlertTriangle, Ban, Heart, ThumbsDown, ThumbsUp, Target, FileText, Pencil, X, User } from 'lucide-react';
import { useClientPortalStore, type SelfProfilePatch } from '../../../store/clientPortalStore';
import { useToastStore } from '../../../store/toastStore';
import type { Client, FitnessGoal } from '../../../types';

const FITNESS_GOAL_LABELS: Record<FitnessGoal, string> = {
  weight_loss: 'Weight Loss',
  muscle_gain: 'Muscle Gain',
  rehab:       'Rehabilitation',
  endurance:   'Endurance',
  flexibility: 'Flexibility',
  general:     'General Fitness',
};

const FITNESS_GOAL_ORDER: FitnessGoal[] = [
  'weight_loss', 'muscle_gain', 'rehab', 'endurance', 'flexibility', 'general',
];

const INPUT = 'w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-orange-500';
const LABEL = 'text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400';

export default function SelfProfileEditor({ client }: { client: Client }) {
  const updateOwnProfile = useClientPortalStore((s) => s.updateOwnProfile);
  const showToast = useToastStore((s) => s.showToast);
  const [editing, setEditing] = useState(false);

  const hasAny =
    client.fitnessGoal || client.allergies || client.healthAlerts ||
    client.foodPreferences || client.foodDislikes ||
    client.exercisePreferences || client.exerciseDislikes ||
    client.medicalHistory || client.age || client.heightCm || client.weightKg;

  if (editing) {
    return <EditForm client={client} onCancel={() => setEditing(false)} onSave={async (patch) => {
      try {
        await updateOwnProfile(patch);
        showToast('Profile saved.', 'success');
        setEditing(false);
      } catch (err) {
        console.error('[client-portal] update profile failed', err);
        showToast('Failed to save profile.', 'error');
      }
    }} />;
  }

  return (
    <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <User size={16} className="text-orange-500" />
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Your profile</h2>
        </div>
        <button
          onClick={() => setEditing(true)}
          className="flex items-center gap-1 text-xs font-medium text-orange-600 dark:text-orange-400 hover:underline"
        >
          <Pencil size={11} /> {hasAny ? 'Edit' : 'Fill in'}
        </button>
      </div>

      {!hasAny ? (
        <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300">Help your trainer build the right plan for you.</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Tell us about your goal, allergies, food preferences, and anything to avoid.</p>
        </div>
      ) : (
        <ProfileRows client={client} />
      )}
    </section>
  );
}

function ProfileRows({ client }: { client: Client }) {
  type Row = { icon: typeof Target; tone: string; label: string; value: string };
  const rows: Row[] = [];
  const physical: string[] = [];
  if (client.age) physical.push(`${client.age} yrs`);
  if (client.heightCm) physical.push(`${client.heightCm} cm`);
  if (client.weightKg) physical.push(`${client.weightKg} kg`);
  if (physical.length > 0) rows.push({ icon: User, tone: 'text-gray-500', label: 'Physical', value: physical.join(' · ') });
  if (client.fitnessGoal) rows.push({ icon: Target, tone: 'text-orange-500', label: 'Goal', value: FITNESS_GOAL_LABELS[client.fitnessGoal] });
  if (client.allergies) rows.push({ icon: AlertTriangle, tone: 'text-rose-500', label: 'Allergies', value: client.allergies });
  if (client.healthAlerts) rows.push({ icon: Ban, tone: 'text-rose-500', label: 'Health alerts', value: client.healthAlerts });
  if (client.foodPreferences) rows.push({ icon: Heart, tone: 'text-emerald-500', label: 'Food preferences', value: client.foodPreferences });
  if (client.foodDislikes) rows.push({ icon: ThumbsDown, tone: 'text-amber-500', label: 'Food dislikes', value: client.foodDislikes });
  if (client.exercisePreferences) rows.push({ icon: ThumbsUp, tone: 'text-emerald-500', label: 'Exercise preferences', value: client.exercisePreferences });
  if (client.exerciseDislikes) rows.push({ icon: ThumbsDown, tone: 'text-amber-500', label: 'Exercise dislikes', value: client.exerciseDislikes });
  if (client.medicalHistory) rows.push({ icon: FileText, tone: 'text-gray-500', label: 'Medical history', value: client.medicalHistory });
  return (
    <ul className="flex flex-col gap-2.5">
      {rows.map((r) => {
        const Icon = r.icon;
        return (
          <li key={r.label} className="flex gap-2.5">
            <Icon size={14} className={`${r.tone} mt-0.5 shrink-0`} />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] uppercase tracking-wide text-gray-400 dark:text-gray-500">{r.label}</p>
              <p className="text-sm text-gray-800 dark:text-gray-100 whitespace-pre-wrap break-words">{r.value}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function EditForm({
  client,
  onCancel,
  onSave,
}: {
  client: Client;
  onCancel: () => void;
  onSave: (patch: SelfProfilePatch) => Promise<void>;
}) {
  const [age, setAge] = useState<string>(client.age != null ? String(client.age) : '');
  const [heightCm, setHeightCm] = useState<string>(client.heightCm != null ? String(client.heightCm) : '');
  const [weightKg, setWeightKg] = useState<string>(client.weightKg != null ? String(client.weightKg) : '');
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal | ''>(client.fitnessGoal ?? '');
  const [allergies, setAllergies] = useState(client.allergies ?? '');
  const [healthAlerts, setHealthAlerts] = useState(client.healthAlerts ?? '');
  const [foodPreferences, setFoodPreferences] = useState(client.foodPreferences ?? '');
  const [foodDislikes, setFoodDislikes] = useState(client.foodDislikes ?? '');
  const [exercisePreferences, setExercisePreferences] = useState(client.exercisePreferences ?? '');
  const [exerciseDislikes, setExerciseDislikes] = useState(client.exerciseDislikes ?? '');
  const [medicalHistory, setMedicalHistory] = useState(client.medicalHistory ?? '');
  const [saving, setSaving] = useState(false);

  const parseNum = (s: string): number | undefined => {
    const t = s.trim();
    if (t === '') return undefined;
    const n = Number(t);
    return Number.isFinite(n) ? n : undefined;
  };
  const orUndef = (s: string): string | undefined => {
    const t = s.trim();
    return t === '' ? undefined : t;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        age: parseNum(age),
        heightCm: parseNum(heightCm),
        weightKg: parseNum(weightKg),
        fitnessGoal: fitnessGoal === '' ? undefined : fitnessGoal,
        allergies: orUndef(allergies),
        healthAlerts: orUndef(healthAlerts),
        foodPreferences: orUndef(foodPreferences),
        foodDislikes: orUndef(foodDislikes),
        exercisePreferences: orUndef(exercisePreferences),
        exerciseDislikes: orUndef(exerciseDislikes),
        medicalHistory: orUndef(medicalHistory),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <User size={16} className="text-orange-500" />
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Edit your profile</h2>
        </div>
        <button onClick={onCancel} className="p-1 rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" aria-label="Cancel">
          <X size={16} />
        </button>
      </div>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col gap-1">
            <label className={LABEL}>Age</label>
            <input type="number" inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} className={INPUT} placeholder="—" />
          </div>
          <div className="flex flex-col gap-1">
            <label className={LABEL}>Height (cm)</label>
            <input type="number" inputMode="numeric" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} className={INPUT} placeholder="—" />
          </div>
          <div className="flex flex-col gap-1">
            <label className={LABEL}>Weight (kg)</label>
            <input type="number" inputMode="decimal" step="0.1" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} className={INPUT} placeholder="—" />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className={LABEL}>Goal</label>
          <select value={fitnessGoal} onChange={(e) => setFitnessGoal(e.target.value as FitnessGoal | '')} className={INPUT}>
            <option value="">— Choose a goal —</option>
            {FITNESS_GOAL_ORDER.map((g) => (
              <option key={g} value={g}>{FITNESS_GOAL_LABELS[g]}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className={LABEL}>Allergies</label>
          <textarea rows={2} value={allergies} onChange={(e) => setAllergies(e.target.value)} className={INPUT} placeholder="e.g. peanuts, shellfish" />
        </div>

        <div className="flex flex-col gap-1">
          <label className={LABEL}>Health alerts</label>
          <textarea rows={2} value={healthAlerts} onChange={(e) => setHealthAlerts(e.target.value)} className={INPUT} placeholder="Conditions your trainer should know about" />
        </div>

        <div className="flex flex-col gap-1">
          <label className={LABEL}>Food preferences</label>
          <textarea rows={2} value={foodPreferences} onChange={(e) => setFoodPreferences(e.target.value)} className={INPUT} placeholder="Foods you enjoy / cuisines you prefer" />
        </div>

        <div className="flex flex-col gap-1">
          <label className={LABEL}>Food dislikes</label>
          <textarea rows={2} value={foodDislikes} onChange={(e) => setFoodDislikes(e.target.value)} className={INPUT} placeholder="Foods to avoid" />
        </div>

        <div className="flex flex-col gap-1">
          <label className={LABEL}>Exercise preferences</label>
          <textarea rows={2} value={exercisePreferences} onChange={(e) => setExercisePreferences(e.target.value)} className={INPUT} placeholder="Movements / equipment you like" />
        </div>

        <div className="flex flex-col gap-1">
          <label className={LABEL}>Exercise dislikes</label>
          <textarea rows={2} value={exerciseDislikes} onChange={(e) => setExerciseDislikes(e.target.value)} className={INPUT} placeholder="Movements / equipment to avoid" />
        </div>

        <div className="flex flex-col gap-1">
          <label className={LABEL}>Medical history</label>
          <textarea rows={3} value={medicalHistory} onChange={(e) => setMedicalHistory(e.target.value)} className={INPUT} placeholder="Past injuries, surgeries, chronic conditions" />
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <button onClick={onCancel} disabled={saving} className="px-3 py-1.5 text-sm rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-40">
            {saving ? 'Saving…' : 'Save profile'}
          </button>
        </div>
      </div>
    </section>
  );
}
