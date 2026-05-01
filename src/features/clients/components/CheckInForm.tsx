import { useState } from 'react';
import type { ClientCheckIn, ClientMood } from '../../../types';

interface CheckInFormProps {
  clientId: string;
  onSave: (data: Omit<ClientCheckIn, 'id' | 'createdAt'>) => Promise<void>;
  onCancel: () => void;
}

export default function CheckInForm({ clientId, onSave, onCancel }: CheckInFormProps) {
  const [date, setDate]             = useState(new Date().toISOString().split('T')[0]);
  const [weight, setWeight]         = useState('');
  const [bodyFat, setBodyFat]       = useState('');
  const [muscleMass, setMuscleMass] = useState('');
  const [waist, setWaist]           = useState('');
  const [chest, setChest]           = useState('');
  const [hip, setHip]               = useState('');
  const [thigh, setThigh]           = useState('');
  const [arm, setArm]               = useState('');
  const [mood, setMood]             = useState<ClientMood | ''>('');
  const [energy, setEnergy]         = useState<number | ''>('');
  const [weeklyNotes, setWeeklyNotes] = useState('');
  const [notes, setNotes]           = useState('');
  const [saving, setSaving]         = useState(false);
  const [emptyError, setEmptyError] = useState(false);
  const [saveError, setSaveError]   = useState('');

  async function handleSave() {
    if (!weight && !bodyFat && !muscleMass && !waist && !chest && !hip && !thigh && !arm && !mood && !energy && !weeklyNotes && !notes) {
      setEmptyError(true);
      return;
    }
    setEmptyError(false);
    setSaveError('');
    setSaving(true);
    try {
      await onSave({
        clientId,
        date,
        weightKg:      weight     ? Number(weight)     : undefined,
        bodyFatPct:    bodyFat    ? Number(bodyFat)    : undefined,
        muscleMassPct: muscleMass ? Number(muscleMass) : undefined,
        waistCm:       waist      ? Number(waist)      : undefined,
        chestCm:       chest      ? Number(chest)      : undefined,
        hipCm:         hip        ? Number(hip)        : undefined,
        thighCm:       thigh      ? Number(thigh)      : undefined,
        armCm:         arm        ? Number(arm)        : undefined,
        mood:          mood || undefined,
        energyLevel:   energy === '' ? undefined : Number(energy),
        weeklyNotes:   weeklyNotes.trim() || undefined,
        notes:         notes.trim() || undefined,
      });
      onCancel();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  const inp = 'px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full';

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex flex-col gap-3 bg-gray-50 dark:bg-gray-800/60">
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Log Check-in</p>
      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2 flex flex-col gap-1">
          <label className="text-xs text-gray-500 dark:text-gray-400">Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inp} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 dark:text-gray-400">Weight (kg)</label>
          <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className={inp} placeholder="89.2" step="0.1" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 dark:text-gray-400">Body Fat (%)</label>
          <input type="number" value={bodyFat} onChange={(e) => setBodyFat(e.target.value)} className={inp} placeholder="18.5" step="0.1" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 dark:text-gray-400">Muscle Mass (%)</label>
          <input type="number" value={muscleMass} onChange={(e) => setMuscleMass(e.target.value)} className={inp} placeholder="42.0" step="0.1" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 dark:text-gray-400">Waist (cm)</label>
          <input type="number" value={waist} onChange={(e) => setWaist(e.target.value)} className={inp} placeholder="85" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 dark:text-gray-400">Chest (cm)</label>
          <input type="number" value={chest} onChange={(e) => setChest(e.target.value)} className={inp} placeholder="100" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 dark:text-gray-400">Hip (cm)</label>
          <input type="number" value={hip} onChange={(e) => setHip(e.target.value)} className={inp} placeholder="95" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 dark:text-gray-400">Thigh (cm)</label>
          <input type="number" value={thigh} onChange={(e) => setThigh(e.target.value)} className={inp} placeholder="58" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 dark:text-gray-400">Arm (cm)</label>
          <input type="number" value={arm} onChange={(e) => setArm(e.target.value)} className={inp} placeholder="36" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 dark:text-gray-400">Mood</label>
          <select value={mood} onChange={(e) => setMood(e.target.value as ClientMood | '')} className={inp}>
            <option value="">—</option>
            <option value="great">😊 Great</option>
            <option value="good">🙂 Good</option>
            <option value="okay">😐 Okay</option>
            <option value="tired">😴 Tired</option>
            <option value="bad">😣 Bad</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 dark:text-gray-400">Energy (1–5)</label>
          <select value={energy} onChange={(e) => setEnergy(e.target.value === '' ? '' : Number(e.target.value))} className={inp}>
            <option value="">—</option>
            <option value={1}>1 — Very low</option>
            <option value={2}>2 — Low</option>
            <option value={3}>3 — Average</option>
            <option value={4}>4 — High</option>
            <option value={5}>5 — Peak</option>
          </select>
        </div>
        <div className="col-span-2 flex flex-col gap-1">
          <label className="text-xs text-gray-500 dark:text-gray-400">Weekly notes <span className="text-gray-400">(how the training week went)</span></label>
          <textarea value={weeklyNotes} onChange={(e) => setWeeklyNotes(e.target.value)} className={`${inp} resize-none`} rows={2} placeholder="Felt strong on squats, shoulder was stiff Wednesday..." />
        </div>
        <div className="col-span-2 flex flex-col gap-1">
          <label className="text-xs text-gray-500 dark:text-gray-400">Trainer notes</label>
          <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} className={inp} placeholder="Any observations..." />
        </div>
      </div>
      {emptyError && (
        <p className="text-xs text-red-500">Please enter at least one measurement or note.</p>
      )}
      {saveError && (
        <p className="text-xs text-red-500">{saveError}</p>
      )}
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          Cancel
        </button>
        <button onClick={handleSave} disabled={saving} className="text-sm px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium transition-colors disabled:opacity-50">
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
}
