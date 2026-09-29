import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { queryKeys } from '@/application/queryKeys';
import { useServices } from '@/application/ServicesContext';
import { WATER_QUICK_ADD_ML } from '@/domain/standards';
import { t } from '@/shared/i18n/id';
import { formatNumber } from '@/shared/lib/format';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Meter } from '@/shared/ui/Meter';
import { useTodayAction } from '../hooks/useToday';

/** Asupan hari ini vs target (angka sama dengan layar Nutrisi) + tombol cepat air. */
export function NutritionCard() {
  const { nutrition } = useServices();
  const { data: day } = useQuery({ queryKey: queryKeys.nutritionDay, queryFn: nutrition.day });
  const { run, pending } = useTodayAction();
  if (!day) return null;
  const { intake, targets } = day;
  const g = (v: number) => formatNumber(v, 0);

  return (
    <Card>
      <h2 className="font-sans label-caps">{t.today.nutritionTitle}</h2>
      <Meter
        label={t.nutrition.kcal}
        valueText={t.nutrition.ofTarget(g(intake.kcal), g(targets.kcal), 'kkal')}
        ratio={intake.kcal / targets.kcal}
      />
      <Meter
        label={t.nutrition.protein}
        valueText={t.nutrition.ofTarget(g(intake.proteinG), g(targets.proteinG), 'g')}
        ratio={intake.proteinG / targets.proteinG}
      />
      <Meter
        label={t.nutrition.water}
        valueText={t.nutrition.ofTarget(g(intake.waterMl), g(targets.waterMl), 'ml')}
        ratio={intake.waterMl / targets.waterMl}
      />
      <div className="grid grid-cols-3 gap-2">
        {WATER_QUICK_ADD_ML.map((ml) => (
          <Button
            key={ml}
            variant="ghost"
            size="sm"
            disabled={pending}
            aria-label={t.nutrition.addWaterLabel(ml)}
            onClick={() => void run(() => nutrition.logWater(ml))}
          >
            {t.nutrition.addWater(ml)}
          </Button>
        ))}
        <Link
          to="/nutrisi"
          className="grid min-h-11 place-items-center rounded-[10px] bg-accent-soft text-[13px] font-bold text-accent"
        >
          {t.nutrition.logFood}
        </Link>
      </div>
    </Card>
  );
}
