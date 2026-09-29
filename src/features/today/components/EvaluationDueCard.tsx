import { useQuery } from '@tanstack/react-query';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import { queryKeys } from '@/application/queryKeys';
import { useServices } from '@/application/ServicesContext';
import { t } from '@/shared/i18n/id';

/** Kartu evaluasi di Hari Ini selama 3 hari setelah bulan/blok selesai. docs/fitur/11-pencapaian.md */
export function EvaluationDueCard() {
  const { evaluation } = useServices();
  const { data: due } = useQuery({ queryKey: queryKeys.evaluationDue, queryFn: evaluation.due });
  if (!due) return null;
  return (
    <Link
      to={`/progres/evaluasi/${due.key}`}
      className="flex min-h-14 items-center justify-between gap-2 rounded-[18px] border border-gold-line bg-gold-bg px-4 py-3"
    >
      <span>
        <span className="block text-xs font-bold text-gold uppercase">
          {t.achievements.dueCard}
        </span>
        <span className="font-semibold">{t.achievements.periodTitle(due.kind, due.label)}</span>
      </span>
      <ChevronRight className="size-5 text-gold" aria-hidden />
    </Link>
  );
}
