import type { ReactNode } from 'react';
import { Card } from '@/shared/ui/Card';

/** Keadaan kosong yang menjelaskan cara mengisi data (docs/fitur/07-progres.md "Aturan"). */
export function EmptyCard({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <Card>
      <p className="text-sm text-muted">{children}</p>
      {action}
    </Card>
  );
}
