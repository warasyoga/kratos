import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Download, FileSpreadsheet } from 'lucide-react';
import { useState } from 'react';
import { queryKeys } from '@/application/queryKeys';
import { useServices } from '@/application/ServicesContext';
import { toLocalDate } from '@/domain/common/clock';
import { errorMessage } from '@/shared/i18n/id';
import { tBackup } from '@/shared/i18n/profile';
import { formatDayDate } from '@/shared/lib/format';
import { downloadBlob, downloadTextFile } from '@/shared/lib/notifications';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { useToast } from '@/shared/ui/toastContext';
import { RestoreBackup } from './RestoreBackup';

/** Profil → Data: ekspor/impor backup .zip dan CSV riwayat set. docs/fitur/13-backup.md */
export function BackupCard() {
  const { backup } = useServices();
  const client = useQueryClient();
  const toast = useToast();
  const [pending, setPending] = useState(false);
  const { data: lastBackupAt } = useQuery({
    queryKey: queryKeys.lastBackup,
    queryFn: backup.lastBackupAt,
  });

  const busy = async (work: () => Promise<void>) => {
    setPending(true);
    try {
      await work();
    } finally {
      setPending(false);
    }
  };

  const exportZip = () =>
    busy(async () => {
      const result = await backup.exportData();
      if (!result.ok) return toast(errorMessage(result.error.code));
      downloadBlob(
        result.value.fileName,
        new Blob([new Uint8Array(result.value.bytes)], { type: 'application/zip' }),
      );
      toast(tBackup.exported);
      await Promise.all(
        [queryKeys.lastBackup, queryKeys.suggestions].map((queryKey) =>
          client.invalidateQueries({ queryKey }),
        ),
      );
    });

  const exportCsv = () =>
    busy(async () => {
      const { fileName, content } = await backup.exportSetsCsv(tBackup.csvHeader);
      downloadTextFile(fileName, 'text/csv;charset=utf-8', content);
      toast(tBackup.csvExported);
    });

  return (
    <Card>
      <h2 className="font-sans label-caps">{tBackup.title}</h2>
      <p className="text-[13px] text-muted">{tBackup.hint}</p>
      <p className="text-sm font-semibold">
        {lastBackupAt
          ? tBackup.lastBackup(formatDayDate(toLocalDate(lastBackupAt)))
          : tBackup.never}
      </p>
      <Button disabled={pending} onClick={() => void exportZip()}>
        <Download className="size-5" aria-hidden />
        {tBackup.export}
      </Button>
      <RestoreBackup />
      <Button variant="ghost" disabled={pending} onClick={() => void exportCsv()}>
        <FileSpreadsheet className="size-5" aria-hidden />
        {tBackup.csv}
      </Button>
    </Card>
  );
}
