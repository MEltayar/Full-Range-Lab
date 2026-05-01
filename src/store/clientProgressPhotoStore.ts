import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { dbRowToProgressPhoto, progressPhotoToDbRow } from '../lib/mappers';
import type { ClientProgressPhoto, PhotoPose } from '../types';

const BUCKET = 'progress-photos';
const SIGNED_URL_TTL = 60 * 60; // 1 hour
// Re-sign once the URLs are this old, so a tab left open overnight doesn't
// hit broken images when the trainer comes back to it.
const SIGNED_URL_REFRESH_AFTER_MS = 45 * 60 * 1000;
const MAX_DIM = 2048;     // longest-side cap so we don't upload 12 MP phone shots
const JPEG_QUALITY = 0.9; // good visual quality, ~3-4× smaller than raw

interface UploadArgs {
  clientId: string;
  file: File;
  takenAt: string;
  caption?: string;
  pose?: PhotoPose;
  checkInId?: string;
}

// Decode → resize → re-encode as JPEG. Fixes HEIC/HEIF from iPhones (which
// most non-Safari browsers can't render → "broken image" on the trainer side),
// strips weird content-types, and caps oversized images. GIFs are passed
// through untouched so animation isn't lost.
async function normalizeImage(file: File): Promise<File> {
  if (file.type === 'image/gif') return file;

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload  = () => resolve(i);
      i.onerror = () => reject(new Error("This photo format isn't supported. Try JPG or PNG."));
      i.src = objectUrl;
    });

    const longest = Math.max(img.naturalWidth, img.naturalHeight);
    const scale = longest > MAX_DIM ? MAX_DIM / longest : 1;
    const w = Math.round(img.naturalWidth  * scale);
    const h = Math.round(img.naturalHeight * scale);

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported on this device.');
    ctx.drawImage(img, 0, 0, w, h);

    const blob: Blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Could not encode photo.'))),
        'image/jpeg',
        JPEG_QUALITY,
      );
    });

    const baseName = file.name.replace(/\.[^.]+$/, '') || 'photo';
    return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg', lastModified: Date.now() });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

interface ClientProgressPhotoStore {
  photos: ClientProgressPhoto[];
  isLoaded: boolean;
  signedUrls: Record<string, string>; // photoId -> signed URL
  signedAt: number;                   // epoch ms when signedUrls were minted
  loadForClient: (clientId: string) => Promise<void>;
  uploadPhoto: (args: UploadArgs) => Promise<void>;
  deletePhoto: (id: string) => Promise<void>;
  /** Re-sign URLs when they're older than the refresh threshold. No-op otherwise. */
  refreshSignedUrlsIfStale: () => Promise<void>;
}

async function signUrls(photos: ClientProgressPhoto[]): Promise<Record<string, string>> {
  if (photos.length === 0) return {};
  const paths = photos.map((p) => p.photoPath);
  const { data, error } = await supabase
    .storage
    .from(BUCKET)
    .createSignedUrls(paths, SIGNED_URL_TTL);
  if (error || !data) return {};
  const out: Record<string, string> = {};
  data.forEach((entry, i) => {
    if (entry.signedUrl) out[photos[i].id] = entry.signedUrl;
  });
  return out;
}

export const useClientProgressPhotoStore = create<ClientProgressPhotoStore>((set, get) => ({
  photos: [],
  isLoaded: false,
  signedUrls: {},
  signedAt: 0,

  loadForClient: async (clientId) => {
    set({ isLoaded: false });
    try {
      const { data, error } = await supabase
        .from('client_progress_photos')
        .select('*')
        .eq('client_id', clientId)
        .order('taken_at', { ascending: false });
      if (error) throw error;
      const photos = (data ?? []).map(dbRowToProgressPhoto);
      const signedUrls = await signUrls(photos);
      set({ photos, signedUrls, signedAt: Date.now(), isLoaded: true });
    } catch {
      set({ photos: [], signedUrls: {}, signedAt: 0, isLoaded: true });
    }
  },

  refreshSignedUrlsIfStale: async () => {
    const { photos, signedAt } = get();
    if (photos.length === 0) return;
    if (Date.now() - signedAt < SIGNED_URL_REFRESH_AFTER_MS) return;
    const fresh = await signUrls(photos);
    if (Object.keys(fresh).length === 0) return;
    set({ signedUrls: fresh, signedAt: Date.now() });
  },

  uploadPhoto: async ({ clientId, file, takenAt, caption, pose, checkInId }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const normalized = await normalizeImage(file);
    const ext = normalized.type === 'image/gif' ? 'gif' : 'jpg';
    const id = crypto.randomUUID();
    const path = `${user.id}/${clientId}/${id}.${ext}`;

    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, normalized, {
      cacheControl: '3600',
      upsert: false,
      contentType: normalized.type,
    });
    if (upErr) throw upErr;

    const photo: ClientProgressPhoto = {
      id,
      clientId,
      checkInId,
      photoPath: path,
      takenAt,
      caption,
      pose,
      createdAt: new Date().toISOString(),
    };

    const { error: dbErr } = await supabase
      .from('client_progress_photos')
      .insert({ ...progressPhotoToDbRow(photo), user_id: user.id });
    if (dbErr) {
      // Roll back the uploaded file so we don't orphan storage
      await supabase.storage.from(BUCKET).remove([path]).catch(() => {});
      throw dbErr;
    }

    const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(path, SIGNED_URL_TTL);
    set((s) => ({
      photos: [photo, ...s.photos],
      signedUrls: signed?.signedUrl
        ? { ...s.signedUrls, [id]: signed.signedUrl }
        : s.signedUrls,
      // Don't touch signedAt — older URLs in the map keep their original mint time,
      // which is what the staleness check should reflect.
    }));
  },

  deletePhoto: async (id) => {
    const photo = get().photos.find((p) => p.id === id);
    if (!photo) return;

    const previous = get().photos;
    set((s) => ({ photos: s.photos.filter((p) => p.id !== id) }));

    const { error } = await supabase.from('client_progress_photos').delete().eq('id', id);
    if (error) {
      set({ photos: previous });
      throw error;
    }
    // Storage cleanup is best-effort — the row is already gone.
    await supabase.storage.from(BUCKET).remove([photo.photoPath]).catch(() => {});
  },
}));
