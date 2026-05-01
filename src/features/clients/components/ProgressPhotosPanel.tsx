import { useEffect, useMemo, useState } from 'react';
import { Images, ImagePlus, Trash2, X, GitCompareArrows } from 'lucide-react';
import { useClientProgressPhotoStore } from '../../../store/clientProgressPhotoStore';
import { useClientCheckInStore } from '../../../store/clientCheckInStore';
import { useToastStore } from '../../../store/toastStore';
import { useConfirmStore } from '../../../store/confirmStore';
import PhotoUploadForm from './PhotoUploadForm';
import type { ClientProgressPhoto, PhotoPose, ClientCheckIn } from '../../../types';

const POSE_OPTIONS: { value: PhotoPose | 'all'; label: string }[] = [
  { value: 'all',   label: 'All'   },
  { value: 'front', label: 'Front' },
  { value: 'side',  label: 'Side'  },
  { value: 'back',  label: 'Back'  },
  { value: 'other', label: 'Other' },
];

function fmtDate(iso: string) {
  try { return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return iso; }
}

// Closest weight check-in within 14 days of the photo's date.
function findNearestWeight(
  checkIns: ClientCheckIn[],
  dateIso: string,
): { weightKg: number; daysDiff: number } | null {
  const target = new Date(dateIso).getTime();
  let best: ClientCheckIn | null = null;
  let bestDiff = Infinity;
  for (const c of checkIns) {
    if (c.weightKg === undefined) continue;
    const diff = Math.abs(new Date(c.date).getTime() - target);
    if (diff < bestDiff) { best = c; bestDiff = diff; }
  }
  if (!best || bestDiff > 14 * 86_400_000) return null;
  return { weightKg: best.weightKg!, daysDiff: Math.round(bestDiff / 86_400_000) };
}

function elapsedLabel(aIso: string, bIso: string): string {
  const days = Math.abs(Math.round(
    (new Date(bIso).getTime() - new Date(aIso).getTime()) / 86_400_000,
  ));
  if (days === 0) return 'same day';
  if (days < 14) return `${days} day${days === 1 ? '' : 's'} apart`;
  if (days < 60) return `${Math.round(days / 7)} weeks apart`;
  return `${Math.round(days / 30)} months apart`;
}

export default function ProgressPhotosPanel({
  clientId,
  surface = 'trainer',
}: {
  clientId: string;
  surface?: 'trainer' | 'client';
}) {
  const photos        = useClientProgressPhotoStore((s) => s.photos);
  const photosLoaded  = useClientProgressPhotoStore((s) => s.isLoaded);
  const signedUrls    = useClientProgressPhotoStore((s) => s.signedUrls);
  const deletePhoto   = useClientProgressPhotoStore((s) => s.deletePhoto);
  const refreshUrls   = useClientProgressPhotoStore((s) => s.refreshSignedUrlsIfStale);
  const checkIns     = useClientCheckInStore((s) => s.checkIns);
  const showToast    = useToastStore((s) => s.showToast);
  const showConfirm  = useConfirmStore((s) => s.showConfirm);

  const [showPhotoForm, setShowPhotoForm] = useState(false);
  const [lightboxPhotoId, setLightboxPhotoId] = useState<string | null>(null);
  const [poseFilter, setPoseFilter] = useState<PhotoPose | 'all'>('all');
  const [compareMode, setCompareMode] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  // A tab left open past the 1h signed-URL TTL would otherwise show broken images.
  // Re-sign when the user comes back to the page.
  useEffect(() => {
    const onWake = () => { void refreshUrls(); };
    window.addEventListener('focus', onWake);
    document.addEventListener('visibilitychange', onWake);
    return () => {
      window.removeEventListener('focus', onWake);
      document.removeEventListener('visibilitychange', onWake);
    };
  }, [refreshUrls]);

  const visiblePhotos = useMemo(() => {
    if (poseFilter === 'all') return photos;
    return photos.filter((p) => p.pose === poseFilter);
  }, [photos, poseFilter]);

  const selected = useMemo(() => {
    return compareIds
      .map((id) => photos.find((p) => p.id === id))
      .filter((p): p is ClientProgressPhoto => Boolean(p))
      // Sort by takenAt ascending so the older one is on the left.
      .sort((a, b) => new Date(a.takenAt).getTime() - new Date(b.takenAt).getTime());
  }, [compareIds, photos]);

  const togglePhoto = (id: string) => {
    if (compareMode) {
      setCompareIds((prev) => {
        if (prev.includes(id)) return prev.filter((x) => x !== id);
        if (prev.length >= 2)   return [prev[1], id]; // drop oldest selection
        return [...prev, id];
      });
    } else {
      setLightboxPhotoId(id);
    }
  };

  const exitCompare = () => { setCompareMode(false); setCompareIds([]); };

  const card = surface === 'trainer'
    ? 'bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden'
    : 'bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden';
  const headerBorder = surface === 'trainer'
    ? 'border-gray-100 dark:border-gray-700'
    : 'border-gray-100 dark:border-gray-800';

  // Trainer side keeps pink+purple as the photos accent; client portal stays in
  // the orange/rose brand palette so the Me tab reads as one cohesive surface.
  const isClient = surface === 'client';
  const tone = {
    icon:        isClient ? 'text-orange-600 dark:text-orange-400'                          : 'text-pink-600 dark:text-pink-400',
    countPill:   isClient ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300' : 'bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300',
    addLink:     isClient ? 'text-orange-600 dark:text-orange-400'                          : 'text-pink-600 dark:text-pink-400',
    compareLink: isClient ? 'text-rose-600 dark:text-rose-400'                              : 'text-purple-600 dark:text-purple-400',
    chipActive:  isClient ? 'bg-orange-500 border-orange-500 text-white'                    : 'bg-pink-500 border-pink-500 text-white',
    chipHover:   isClient ? 'hover:text-orange-600 dark:hover:text-orange-300 hover:border-orange-400' : 'hover:text-pink-600 dark:hover:text-pink-300 hover:border-pink-400',
    compareHint: isClient ? 'text-rose-600 dark:text-rose-400'                              : 'text-purple-600 dark:text-purple-400',
    compareCard: isClient ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/30'   : 'border-purple-200 dark:border-purple-900/60 bg-purple-50/50 dark:bg-purple-950/30',
    compareTitle:isClient ? 'text-rose-700 dark:text-rose-300'                              : 'text-purple-700 dark:text-purple-300',
    selectRing:  isClient ? 'border-orange-500 ring-2 ring-orange-400'                      : 'border-purple-500 ring-2 ring-purple-400',
    selectBadge: isClient ? 'bg-orange-600'                                                 : 'bg-purple-600',
  };

  return (
    <section className={card}>
      <div className={`flex items-center justify-between px-5 py-3 border-b ${headerBorder}`}>
        <div className="flex items-center gap-2">
          <Images size={16} className={tone.icon} />
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Progress photos</h2>
          {photos.length > 0 && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tone.countPill}`}>
              {photos.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {photos.length >= 2 && (
            <button
              onClick={() => { compareMode ? exitCompare() : setCompareMode(true); }}
              className={
                'flex items-center gap-1 text-xs font-medium ' +
                (compareMode
                  ? 'text-gray-600 dark:text-gray-300 hover:underline'
                  : `${tone.compareLink} hover:underline`)
              }
            >
              <GitCompareArrows size={13} /> {compareMode ? 'Exit compare' : 'Compare'}
            </button>
          )}
          {!showPhotoForm && !compareMode && (
            <button
              onClick={() => setShowPhotoForm(true)}
              className={`flex items-center gap-1 text-xs font-medium hover:underline ${tone.addLink}`}
            >
              <ImagePlus size={13} /> Add
            </button>
          )}
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3">
        {showPhotoForm && (
          <PhotoUploadForm clientId={clientId} onCancel={() => setShowPhotoForm(false)} />
        )}

        {/* Pose filter */}
        {photos.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {POSE_OPTIONS.map((opt) => {
              const count = opt.value === 'all'
                ? photos.length
                : photos.filter((p) => p.pose === opt.value).length;
              const active = poseFilter === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setPoseFilter(opt.value)}
                  className={
                    'px-2.5 py-1 text-[11px] rounded-full border transition-colors ' +
                    (active
                      ? tone.chipActive
                      : `bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 ${tone.chipHover}`)
                  }
                >
                  {opt.label} <span className="opacity-70">{count}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Compare hint */}
        {compareMode && (
          <p className={`text-xs -mt-1 ${tone.compareHint}`}>
            Tap photos to compare ({compareIds.length}/2). Pick two of the same pose for the best read.
          </p>
        )}

        {/* Compare panel (only when 2 photos picked) */}
        {compareMode && selected.length === 2 && (
          <div className={`rounded-xl border p-3 flex flex-col gap-3 ${tone.compareCard}`}>
            <div className="flex items-center justify-between">
              <p className={`text-xs font-semibold uppercase tracking-wide ${tone.compareTitle}`}>
                {elapsedLabel(selected[0].takenAt, selected[1].takenAt)}
                {(() => {
                  const a = findNearestWeight(checkIns, selected[0].takenAt);
                  const b = findNearestWeight(checkIns, selected[1].takenAt);
                  if (!a || !b) return null;
                  const delta = b.weightKg - a.weightKg;
                  const sign = delta > 0 ? '+' : '';
                  return ` · ${sign}${delta.toFixed(1)} kg`;
                })()}
              </p>
              <button onClick={exitCompare} className="text-[11px] text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1">
                <X size={11} /> Close
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {selected.map((photo) => {
                const url = signedUrls[photo.id];
                const w = findNearestWeight(checkIns, photo.takenAt);
                return (
                  <div key={photo.id} className="flex flex-col gap-1.5">
                    <div className="aspect-[3/4] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                      {url ? (
                        <img src={url} alt={photo.caption ?? ''} className="w-full h-full object-contain" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Images size={20} />
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">{fmtDate(photo.takenAt)}</p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">
                      {photo.pose ? <span className="capitalize">{photo.pose}</span> : 'No pose'}
                      {w && <> · {w.weightKg} kg{w.daysDiff > 0 && <span className="opacity-70"> ({w.daysDiff}d off)</span>}</>}
                    </p>
                    {photo.caption && <p className="text-[11px] text-gray-500 dark:text-gray-400 italic">{photo.caption}</p>}
                  </div>
                );
              })}
            </div>
            {selected[0].pose && selected[1].pose && selected[0].pose !== selected[1].pose && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400">
                Heads up — different poses ({selected[0].pose} vs {selected[1].pose}). Pick same-pose photos for a fairer comparison.
              </p>
            )}
          </div>
        )}

        {/* Gallery */}
        {!photosLoaded ? (
          <p className="text-xs text-gray-400">Loading…</p>
        ) : visiblePhotos.length === 0 && !showPhotoForm ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">
            {photos.length === 0
              ? 'No photos yet — tap Add to upload the first one.'
              : 'No photos in this pose yet.'}
          </p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {visiblePhotos.map((p) => {
              const url = signedUrls[p.id];
              const isSelected = compareIds.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => togglePhoto(p.id)}
                  className={
                    'group relative aspect-square rounded-lg overflow-hidden border bg-gray-100 dark:bg-gray-800 transition-all ' +
                    (isSelected
                      ? tone.selectRing
                      : 'border-gray-200 dark:border-gray-700')
                  }
                  title={p.caption || fmtDate(p.takenAt)}
                >
                  {url ? (
                    <img src={url} alt={p.caption ?? ''} className="w-full h-full object-contain" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Images size={18} />
                    </div>
                  )}
                  {p.pose && (
                    <span className="absolute top-1 left-1 text-[9px] uppercase font-semibold tracking-wide text-white bg-black/55 px-1.5 py-0.5 rounded">
                      {p.pose}
                    </span>
                  )}
                  {isSelected && (
                    <span className={`absolute top-1 right-1 text-[10px] font-bold text-white rounded-full w-5 h-5 flex items-center justify-center ${tone.selectBadge}`}>
                      {compareIds.indexOf(p.id) + 1}
                    </span>
                  )}
                  <span className="absolute bottom-0 left-0 right-0 text-[10px] text-white bg-black/55 px-1.5 py-0.5 truncate">
                    {fmtDate(p.takenAt)}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxPhotoId && (() => {
        const photo = photos.find((p) => p.id === lightboxPhotoId);
        if (!photo) return null;
        const url = signedUrls[photo.id];
        const w = findNearestWeight(checkIns, photo.takenAt);
        return (
          <div
            className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4"
            onClick={() => setLightboxPhotoId(null)}
          >
            <div className="relative max-w-4xl max-h-full flex flex-col gap-3" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setLightboxPhotoId(null)}
                className="absolute top-2 right-2 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white"
                aria-label="Close"
              >
                <X size={16} />
              </button>
              {url ? (
                <img src={url} alt={photo.caption ?? ''} className="max-w-full max-h-[80vh] object-contain rounded-lg" />
              ) : (
                <p className="text-white">Loading…</p>
              )}
              <div className="flex items-center justify-between gap-4 text-sm text-white/80">
                <div>
                  <p className="font-semibold">{fmtDate(photo.takenAt)}</p>
                  <p className="text-white/60 text-xs">
                    {photo.pose ? <span className="capitalize">{photo.pose}</span> : 'No pose'}
                    {w && <> · {w.weightKg} kg</>}
                    {photo.caption && <> · {photo.caption}</>}
                  </p>
                </div>
                <button
                  onClick={() => {
                    showConfirm({
                      title: 'Delete photo',
                      message: 'This photo will be permanently removed. Continue?',
                      confirmLabel: 'Delete',
                      variant: 'danger',
                      onConfirm: async () => {
                        try {
                          await deletePhoto(photo.id);
                          setLightboxPhotoId(null);
                        } catch {
                          showToast('Failed to delete photo.', 'error');
                        }
                      },
                    });
                  }}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-red-500/80 hover:bg-red-500 text-white"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </section>
  );
}
