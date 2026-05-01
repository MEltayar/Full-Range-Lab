import { useEffect, useMemo, useState } from 'react';
import { Upload } from 'lucide-react';
import { useClientProgressPhotoStore } from '../../../store/clientProgressPhotoStore';
import type { PhotoPose } from '../../../types';

const POSES: { value: PhotoPose; label: string }[] = [
  { value: 'front', label: 'Front' },
  { value: 'side',  label: 'Side'  },
  { value: 'back',  label: 'Back'  },
  { value: 'other', label: 'Other' },
];

export default function PhotoUploadForm({
  clientId,
  onCancel,
}: {
  clientId: string;
  onCancel: () => void;
}) {
  const uploadPhoto = useClientProgressPhotoStore((s) => s.uploadPhoto);
  const [file, setFile]       = useState<File | null>(null);
  const [takenAt, setTakenAt] = useState(new Date().toISOString().split('T')[0]);
  const [caption, setCaption] = useState('');
  const [pose, setPose]       = useState<PhotoPose | ''>('');
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  async function handleSave() {
    if (!file) { setError('Pick a photo first.'); return; }
    if (file.size > 8 * 1024 * 1024) { setError('Photo must be under 8 MB.'); return; }
    setSaving(true);
    setError('');
    try {
      await uploadPhoto({
        clientId,
        file,
        takenAt,
        caption: caption.trim() || undefined,
        pose: pose || undefined,
      });
      onCancel();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setSaving(false);
    }
  }

  const inp = 'px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full';

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex flex-col gap-3 bg-gray-50 dark:bg-gray-800/60">
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Add progress photo</p>

      <label className="flex flex-col gap-1 items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg py-6 px-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/40 transition-colors">
        {previewUrl ? (
          <img src={previewUrl} alt="Preview" className="max-h-40 rounded-md object-contain" />
        ) : (
          <>
            <Upload size={24} className="text-gray-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Tap to choose a photo</span>
          </>
        )}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </label>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 dark:text-gray-400">Taken on</label>
          <input type="date" value={takenAt} onChange={(e) => setTakenAt(e.target.value)} className={inp} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 dark:text-gray-400">Caption (optional)</label>
          <input type="text" value={caption} onChange={(e) => setCaption(e.target.value)} className={inp} placeholder="Post workout" />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-gray-500 dark:text-gray-400">Pose (helps compare over time)</label>
        <div className="flex flex-wrap gap-1.5">
          {POSES.map((p) => {
            const active = pose === p.value;
            return (
              <button
                key={p.value}
                type="button"
                onClick={() => setPose(active ? '' : p.value)}
                className={
                  'px-3 py-1 text-xs rounded-full border transition-colors ' +
                  (active
                    ? 'bg-pink-500 border-pink-500 text-white'
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-pink-400 hover:text-pink-600 dark:hover:text-pink-300')
                }
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          Cancel
        </button>
        <button onClick={handleSave} disabled={saving || !file} className="text-sm px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium transition-colors disabled:opacity-50">
          {saving ? 'Uploading…' : 'Upload'}
        </button>
      </div>
    </div>
  );
}
