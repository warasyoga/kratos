import { useQueryClient } from '@tanstack/react-query';
import { Upload } from 'lucide-react';
import { useId, useState } from 'react';
import { useNavigate } from 'react-router';
import type { ImportPreview } from '@/application/backup/backupUseCases';
import { useServices } from '@/application/ServicesContext';
import { toLocalDate } from '@/domain/common/clock';
import { errorMessage, t } from '@/shared/i18n/id';
import { tBackup } from '@/shared/i18n/profile';
import { formatDayDate, formatShortDate } from '@/shared/lib/format';
import { Button } from '@/shared/ui/Button';
import { Sheet } from '@/shared/ui/Sheet';
import { useToast } from '@/shared/ui/toastContext';

/**
 * Pilih file backup → pratinjau (profil, jumlah sesi, rentang, foto) → "Ganti semua".
 * Dipakai di Profil dan di layar pembuka onboarding (HP baru). docs/fitur/13-backup.md
 */
export function RestoreBackup() {
  const { backup } = useServices();
  const client = useQueryClient();
  const navigate = useNavigate();
  const toast = useToast();
  const inputId = useId();
  const [pending, setPending] = useState(false);
  const [preview, setPreview] = useState<ImportPreview>();

  const busy = async (work: () => Promise<void>) => {
    setPending(true);
    try {
      await work();
    } finally {
      setPending(false);
    }
  };

  const pickFile = (file: File | undefined) =>
    file &&
    busy(async () => {
      const result = await backup.inspect(new Uint8Array(await file.arrayBuffer()));
      if (!result.ok) return toast(errorMessage(result.error.code));
      setPreview(result.value);
    });

  const restore = () =>
    preview &&
    busy(async () => {
      const result = await backup.restore(preview.backup);
      if (!result.ok) return toast(errorMessage(result.error.code));
      setPreview(undefined);
      await client.invalidateQueries();
      toast(tBackup.restored);
      void navigate('/', { replace: true });
    });

  const summary = preview?.summary;
  return (
    <>
      <label
        htmlFor={inputId}
        aria-disabled={pending}
        className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-[14px] bg-surface-2 font-bold text-ink has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent aria-disabled:opacity-50"
      >
        <Upload className="size-5" aria-hidden />
        {tBackup.import}
        <input
          id={inputId}
          type="file"
          accept=".zip,application/zip"
          disabled={pending}
          className="sr-only"
          onChange={(e) => {
            void pickFile(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      </label>

      {preview && summary && (
        <Sheet
          open
          title={tBackup.previewTitle}
          onClose={() => setPreview(undefined)}
          footer={
            <div className="grid grid-cols-2 gap-2">
              <Button variant="ghost" onClick={() => setPreview(undefined)}>
                {t.common.cancel}
              </Button>
              <Button disabled={pending} onClick={() => void restore()}>
                {pending ? tBackup.working : tBackup.replaceAll}
              </Button>
            </div>
          }
        >
          <ul className="flex flex-col gap-1.5 text-sm">
            <li>{tBackup.previewExported(formatDayDate(toLocalDate(preview.exportedAt)))}</li>
            {summary.profileName && <li>{tBackup.previewProfile(summary.profileName)}</li>}
            <li>{tBackup.previewSessions(summary.sessions)}</li>
            {summary.firstDate && summary.lastDate && (
              <li>
                {tBackup.previewRange(
                  formatShortDate(summary.firstDate),
                  formatShortDate(summary.lastDate),
                )}
              </li>
            )}
            <li>{tBackup.previewPhotos(summary.photos)}</li>
          </ul>
          <p className="mt-3 rounded-[14px] bg-warn-bg px-3.5 py-2.5 text-[13px] text-warn">
            {tBackup.previewWarning}
          </p>
        </Sheet>
      )}
    </>
  );
}
