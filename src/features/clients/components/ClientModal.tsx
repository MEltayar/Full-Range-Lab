import { useEffect, useRef, useState } from 'react';
import type { Client, FitnessGoal } from '../../../types';

const FITNESS_GOALS: { value: FitnessGoal; label: string }[] = [
  { value: 'weight_loss',  label: 'Weight Loss' },
  { value: 'muscle_gain',  label: 'Muscle Gain' },
  { value: 'rehab',        label: 'Rehabilitation' },
  { value: 'endurance',    label: 'Endurance' },
  { value: 'flexibility',  label: 'Flexibility' },
  { value: 'general',      label: 'General Fitness' },
];

interface ClientModalProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Client, 'id' | 'createdAt'>) => void;
}

const INPUT = 'px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full';
const TEXTAREA = `${INPUT} resize-none`;
const LABEL = 'text-sm font-medium text-gray-700 dark:text-gray-300';
const HINT = 'text-gray-400 font-normal';

export default function ClientModal({ client, isOpen, onClose, onSave }: ClientModalProps) {
  const [name, setName]                   = useState('');
  const [ageStr, setAgeStr]               = useState('');
  const [email, setEmail]                 = useState('');
  const [phone, setPhone]                 = useState('');
  const [heightStr, setHeightStr]         = useState('');
  const [weightStr, setWeightStr]         = useState('');
  const [fitnessGoal, setFitnessGoal]     = useState<FitnessGoal | ''>('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [foodPreferences, setFoodPreferences] = useState('');
  const [foodDislikes, setFoodDislikes]   = useState('');
  const [exercisePreferences, setExercisePreferences] = useState('');
  const [exerciseDislikes, setExerciseDislikes] = useState('');
  const [allergies, setAllergies]         = useState('');
  const [healthAlerts, setHealthAlerts]   = useState('');
  const [generalNotes, setGeneralNotes]   = useState('');
  const [trainerMessage, setTrainerMessage] = useState('');

  const [nameError, setNameError]   = useState('');
  const [ageError, setAgeError]     = useState('');
  const [emailError, setEmailError] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);

  const isEditMode = client !== null;

  useEffect(() => {
    if (isOpen) {
      setName(client?.name ?? '');
      setAgeStr(client?.age !== undefined ? String(client.age) : '');
      setEmail(client?.email ?? '');
      setPhone(client?.phone ?? '');
      setHeightStr(client?.heightCm !== undefined ? String(client.heightCm) : '');
      setWeightStr(client?.weightKg !== undefined ? String(client.weightKg) : '');
      setFitnessGoal(client?.fitnessGoal ?? '');
      setMedicalHistory(client?.medicalHistory ?? '');
      setFoodPreferences(client?.foodPreferences ?? '');
      setFoodDislikes(client?.foodDislikes ?? '');
      setExercisePreferences(client?.exercisePreferences ?? '');
      setExerciseDislikes(client?.exerciseDislikes ?? '');
      setAllergies(client?.allergies ?? '');
      setHealthAlerts(client?.healthAlerts ?? '');
      setGeneralNotes(client?.generalNotes ?? '');
      setTrainerMessage(client?.trainerMessage ?? '');
      setNameError(''); setAgeError(''); setEmailError('');
      setTimeout(() => nameInputRef.current?.focus(), 50);
    }
  }, [isOpen, client]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let valid = true;

    if (!name.trim()) { setNameError('Name is required.'); valid = false; }
    else setNameError('');

    let age: number | undefined;
    if (ageStr.trim()) {
      const parsed = Number(ageStr);
      if (!Number.isInteger(parsed) || parsed <= 0) { setAgeError('Age must be a positive whole number.'); valid = false; }
      else { setAgeError(''); age = parsed; }
    } else setAgeError('');

    const trimmedEmail = email.trim();
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setEmailError('Please enter a valid email address.'); valid = false;
    } else setEmailError('');

    if (!valid) return;

    const heightCm = heightStr.trim() ? Number(heightStr) || undefined : undefined;
    const weightKg = weightStr.trim() ? Number(weightStr) || undefined : undefined;

    onSave({
      name: name.trim(),
      age,
      email: trimmedEmail || undefined,
      phone: phone.trim() || undefined,
      heightCm,
      weightKg,
      fitnessGoal: fitnessGoal || undefined,
      medicalHistory: medicalHistory.trim() || undefined,
      foodPreferences: foodPreferences.trim() || undefined,
      foodDislikes: foodDislikes.trim() || undefined,
      exercisePreferences: exercisePreferences.trim() || undefined,
      exerciseDislikes: exerciseDislikes.trim() || undefined,
      allergies: allergies.trim() || undefined,
      healthAlerts: healthAlerts.trim() || undefined,
      generalNotes: generalNotes.trim() || undefined,
      trainerMessage: trainerMessage.trim() || undefined,
    });
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg my-8">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {isEditMode ? 'Edit Client' : 'Add Client'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="px-6 py-5 flex flex-col gap-5">

            {/* ── Basic info ── */}
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Basic Info</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 flex flex-col gap-1">
                <label className={LABEL}>Name <span className="text-red-500">*</span></label>
                <input ref={nameInputRef} type="text" value={name} onChange={(e) => setName(e.target.value)} className={INPUT} placeholder="Full name" />
                {nameError && <p className="text-xs text-red-500">{nameError}</p>}
              </div>
              <div className="flex flex-col gap-1">
                <label className={LABEL}>Age <span className={HINT}>(optional)</span></label>
                <input type="number" value={ageStr} onChange={(e) => setAgeStr(e.target.value)} className={INPUT} placeholder="e.g. 34" min={1} step={1} />
                {ageError && <p className="text-xs text-red-500">{ageError}</p>}
              </div>
              <div className="flex flex-col gap-1">
                <label className={LABEL}>Phone <span className={HINT}>(optional)</span></label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={INPUT} placeholder="+44 7911 123456" />
              </div>
              <div className="col-span-2 flex flex-col gap-1">
                <label className={LABEL}>Email <span className={HINT}>(optional)</span></label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={INPUT} placeholder="client@example.com" />
                {emailError && <p className="text-xs text-red-500">{emailError}</p>}
              </div>
            </div>

            {/* ── Physical profile ── */}
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Physical Profile</p>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <label className={LABEL}>Height (cm)</label>
                <input type="number" value={heightStr} onChange={(e) => setHeightStr(e.target.value)} className={INPUT} placeholder="175" min={1} />
              </div>
              <div className="flex flex-col gap-1">
                <label className={LABEL}>Weight (kg)</label>
                <input type="number" value={weightStr} onChange={(e) => setWeightStr(e.target.value)} className={INPUT} placeholder="75" min={1} />
              </div>
              <div className="flex flex-col gap-1">
                <label className={LABEL}>Fitness Goal</label>
                <select value={fitnessGoal} onChange={(e) => setFitnessGoal(e.target.value as FitnessGoal | '')} className={INPUT}>
                  <option value="">— Select —</option>
                  {FITNESS_GOALS.map((g) => (
                    <option key={g.value} value={g.value}>{g.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* ── Message to client (public — shown on portal) ── */}
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Message to Client</p>
            <div className="flex flex-col gap-1">
              <label className={LABEL}>Visible on the client's portal <span className={HINT}>(short note, encouragement, weekly focus…)</span></label>
              <textarea
                value={trainerMessage}
                onChange={(e) => setTrainerMessage(e.target.value)}
                className={`${TEXTAREA} border-emerald-300 dark:border-emerald-700 focus:ring-emerald-500`}
                rows={2}
                placeholder="e.g. Great work last week — focus on form over weight in this block."
              />
            </div>

            {/* ── Trainer notes ── */}
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Trainer Notes <span className="normal-case font-normal text-gray-400">(private — never shown to the client)</span></p>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className={LABEL}>Medical History <span className={HINT}>(injuries, conditions)</span></label>
                <textarea value={medicalHistory} onChange={(e) => setMedicalHistory(e.target.value)} className={TEXTAREA} rows={2} placeholder="e.g. Previous knee surgery, lower back pain..." />
              </div>
              <div className="flex flex-col gap-1">
                <label className={LABEL}>Food Preferences <span className={HINT}>(what they like)</span></label>
                <textarea value={foodPreferences} onChange={(e) => setFoodPreferences(e.target.value)} className={TEXTAREA} rows={2} placeholder="e.g. Prefers chicken, loves salads..." />
              </div>
              <div className="flex flex-col gap-1">
                <label className={LABEL}>Food Dislikes <span className={HINT}>(what to avoid)</span></label>
                <textarea value={foodDislikes} onChange={(e) => setFoodDislikes(e.target.value)} className={TEXTAREA} rows={2} placeholder="e.g. Does not eat dairy, avoids red meat..." />
              </div>
              <div className="flex flex-col gap-1">
                <label className={LABEL}>Exercise Preferences <span className={HINT}>(what they enjoy)</span></label>
                <textarea value={exercisePreferences} onChange={(e) => setExercisePreferences(e.target.value)} className={TEXTAREA} rows={2} placeholder="e.g. Loves deadlifts, enjoys yoga..." />
              </div>
              <div className="flex flex-col gap-1">
                <label className={LABEL}>Exercise Dislikes <span className={HINT}>(what to avoid)</span></label>
                <textarea value={exerciseDislikes} onChange={(e) => setExerciseDislikes(e.target.value)} className={TEXTAREA} rows={2} placeholder="e.g. Hates running, no overhead pressing..." />
              </div>
              <div className="flex flex-col gap-1">
                <label className={LABEL}>Allergies <span className={HINT}>(food, environment, etc.)</span></label>
                <textarea value={allergies} onChange={(e) => setAllergies(e.target.value)} className={TEXTAREA} rows={2} placeholder="e.g. Peanuts, shellfish, latex..." />
              </div>
              <div className="flex flex-col gap-1">
                <label className={LABEL}>Health Alerts <span className={HINT}>(important flags)</span></label>
                <textarea value={healthAlerts} onChange={(e) => setHealthAlerts(e.target.value)} className={TEXTAREA} rows={2} placeholder="e.g. Avoid high-impact exercises, allergic to nuts..." />
              </div>
              <div className="flex flex-col gap-1">
                <label className={LABEL}>General Notes</label>
                <textarea value={generalNotes} onChange={(e) => setGeneralNotes(e.target.value)} className={TEXTAREA} rows={3} placeholder="Any additional observations, motivations, goals..." />
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-md transition-colors">
              {isEditMode ? 'Save Changes' : 'Add Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
