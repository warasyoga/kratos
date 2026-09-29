import {
  BACKUP_APP,
  BACKUP_SCHEMA_VERSION,
  backupFileName,
  countRows,
  photoPath,
  summarizeBackup,
  toCsv,
  type BackupData,
  type BackupManifest,
} from '@/domain/backup/backup';
import { toLocalDate } from '@/domain/common/clock';
import { err, ok, type Result } from '@/domain/common/result';
import type { ProgressPhoto } from '@/domain/progress/photo';
import type { AppDeps } from '../deps';
import { dataSchema, manifestSchema } from './backupSchema';

/** Backup yang sudah diperiksa dan siap dipulihkan (dipegang UI selama pratinjau). */
export interface ParsedBackup {
  manifest: BackupManifest;
  data: BackupData;
  photos: ProgressPhoto[];
}

export interface ImportPreview {
  exportedAt: number;
  summary: ReturnType<typeof summarizeBackup>;
  backup: ParsedBackup;
}

const invalid = () => err({ code: 'backup_invalid', message: 'File backup tidak valid' });
const encode = (value: unknown) => new TextEncoder().encode(JSON.stringify(value));
const decodeJson = (bytes: Uint8Array | undefined): unknown =>
  bytes === undefined ? undefined : JSON.parse(new TextDecoder().decode(bytes));
const decimal = (n: number | undefined) => (n === undefined ? '' : String(n).replace('.', ','));

/** Ekspor/impor .zip (JSON + foto) dan ekspor CSV riwayat set. docs/fitur/13-backup.md */
export function makeBackupUseCases(deps: AppDeps) {
  return {
    lastBackupAt: () => deps.backup.lastBackupAt(),

    async exportData(): Promise<Result<{ fileName: string; bytes: Uint8Array }>> {
      const now = deps.clock.now();
      const { data, photos } = await deps.backup.dump();
      const exported: BackupData = { ...data, settings: { ...data.settings, lastBackupAt: now } };
      const manifest: BackupManifest = {
        app: BACKUP_APP,
        schemaVersion: BACKUP_SCHEMA_VERSION,
        exportedAt: now,
        counts: countRows(exported),
      };
      const files: Record<string, Uint8Array> = {
        'manifest.json': encode(manifest),
        'data.json': encode(exported),
      };
      for (const photo of photos) {
        files[photoPath(photo.id, 'full')] = new Uint8Array(await photo.blob.arrayBuffer());
        files[photoPath(photo.id, 'thumb')] = new Uint8Array(await photo.thumb.arrayBuffer());
      }
      const bytes = await deps.archive.pack(files);
      await deps.backup.markBackedUp(now);
      return ok({ fileName: backupFileName(toLocalDate(now)), bytes });
    },

    /** Baca dan periksa file tanpa mengubah data; hasilnya ditampilkan sebagai pratinjau. */
    async inspect(bytes: Uint8Array): Promise<Result<ImportPreview>> {
      let files: Record<string, Uint8Array>;
      let rawManifest: unknown;
      let rawData: unknown;
      try {
        files = await deps.archive.unpack(bytes);
        rawManifest = decodeJson(files['manifest.json']);
        rawData = decodeJson(files['data.json']);
      } catch {
        return invalid();
      }
      const manifest = manifestSchema.safeParse(rawManifest);
      if (!manifest.success) return invalid();
      if (manifest.data.schemaVersion > BACKUP_SCHEMA_VERSION)
        return err({ code: 'backup_newer', message: 'Backup dari versi aplikasi lebih baru' });
      const parsed = dataSchema.safeParse(rawData);
      if (!parsed.success) return invalid();
      const data = parsed.data as unknown as BackupData;

      const photos: ProgressPhoto[] = [];
      for (const meta of data.photos) {
        const full = files[photoPath(meta.id, 'full')];
        const thumb = files[photoPath(meta.id, 'thumb')];
        if (!full || !thumb) return invalid();
        photos.push({
          ...meta,
          blob: new Blob([new Uint8Array(full)], { type: 'image/jpeg' }),
          thumb: new Blob([new Uint8Array(thumb)], { type: 'image/jpeg' }),
        });
      }
      const backup: ParsedBackup = {
        manifest: {
          app: BACKUP_APP,
          schemaVersion: manifest.data.schemaVersion,
          exportedAt: manifest.data.exportedAt,
          counts: countRows(data),
        },
        data,
        photos,
      };
      return ok({ exportedAt: manifest.data.exportedAt, summary: summarizeBackup(data), backup });
    },

    /** Ganti semua data dengan isi backup (satu transaksi). */
    async restore(backup: ParsedBackup): Promise<Result<void>> {
      await deps.backup.restore(backup.data, backup.photos);
      return ok(undefined);
    },

    /** Riwayat set kerja yang selesai sebagai CSV (Excel/Sheets locale Indonesia). */
    async exportSetsCsv(header: readonly string[]): Promise<{ fileName: string; content: string }> {
      const [{ data }, library] = await Promise.all([deps.backup.dump(), deps.exercises.list()]);
      const names = new Map(library.map((e) => [e.id, e.name]));
      const sessions = new Map(
        data.sessions.filter((s) => s.status === 'finished').map((s) => [s.id, s]),
      );
      const rows = data.setLogs
        .filter((s) => s.completedAt !== undefined && sessions.has(s.sessionId))
        .sort(
          (a, b) =>
            (sessions.get(a.sessionId)?.logDate ?? '').localeCompare(
              sessions.get(b.sessionId)?.logDate ?? '',
            ) || (a.completedAt ?? 0) - (b.completedAt ?? 0),
        )
        .map((s) => {
          const session = sessions.get(s.sessionId);
          return [
            session?.logDate ?? '',
            session?.dayLabel ?? '',
            names.get(s.exerciseId) ?? s.exerciseId,
            s.kind,
            String(s.setNumber),
            decimal(s.weightKg),
            String(s.reps),
            decimal(s.rir),
          ];
        });
      return {
        fileName: `kratos-riwayat-set-${toLocalDate(deps.clock.now())}.csv`,
        content: toCsv([header, ...rows]),
      };
    },
  };
}
