import { useState } from 'react';
import type { ProfileOverview } from '@/application/profile/getProfileOverview';
import { useServices } from '@/application/ServicesContext';
import type { Equipment } from '@/domain/profile/types';
import { t } from '@/shared/i18n/id';
import { tProfile } from '@/shared/i18n/onboarding';
import { formatFixed, formatKg, formatNumber } from '@/shared/lib/format';
import { useThemePreference, type ThemePreference } from '@/shared/lib/theme';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Meter } from '@/shared/ui/Meter';
import { ScreenHeader } from '@/shared/ui/ScreenHeader';
import { SegmentedControl } from '@/shared/ui/SegmentedControl';
import { Stat } from '@/shared/ui/Stat';
import { describeChanges } from './changeMessages';
import { EditBodySheet } from './components/EditBodySheet';
import { EquipmentPicker } from './components/EquipmentPicker';
import { HealthCard } from './components/HealthCard';
import { BackupCard } from './components/BackupCard';
import { InstallCard } from './components/InstallCard';
import { ReminderCard } from './components/ReminderCard';
import { InventoryCard } from './components/InventoryCard';
import { ParqCard } from './components/ParqCard';
import { ScheduleSheet } from './components/ScheduleSheet';
import { useProfileOverview } from './hooks/useProfile';
import { useProfileAction } from './hooks/useProfileAction';

const themeOptions = [
  { value: 'system', label: t.theme.system },
  { value: 'light', label: t.theme.light },
  { value: 'dark', label: t.theme.dark },
] as const satisfies readonly { value: ThemePreference; label: string }[];

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 text-sm">
      <span className="text-muted">{label}</span>
      <span className="text-right font-semibold">{value}</span>
    </div>
  );
}

function BodyCard({ overview }: { overview: ProfileOverview }) {
  const { profile: p, targets } = overview;
  return (
    <>
      <div className="flex items-center gap-3.5">
        <div className="grid size-14 place-items-center rounded-2xl bg-accent font-display text-[26px] font-bold text-accent-ink">
          {p.name.slice(0, 1).toUpperCase()}
        </div>
        <div>
          <h1 className="text-[26px] leading-none uppercase">{p.name}</h1>
          <p className="text-[13px] text-muted tabular-nums">
            {tProfile.summary(
              t.sex[p.sex],
              overview.ageYears,
              p.heightCm,
              formatKg(overview.weightKg),
            )}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat
          value={formatNumber(overview.bmi)}
          label={`${tProfile.bmi} · ${t.bmi[overview.bmiCategory]}`}
        />
        <Stat value={formatNumber(targets.kcal, 0)} label={tProfile.kcal} />
        <Stat value={`${targets.proteinG} g`} label={tProfile.protein} />
      </div>
      <p className="text-xs text-muted">{tProfile.bmiAsiaNote(t.bmi[overview.bmiAsiaCategory])}</p>
      <Card>
        <h2 className="font-sans label-caps">{tProfile.targets}</h2>
        <Meter
          label={tProfile.fat}
          valueText={`${targets.fatG} g`}
          ratio={(targets.fatG * 9) / targets.kcal}
        />
        <Meter
          label={tProfile.carbs}
          valueText={`${targets.carbsG} g`}
          ratio={(targets.carbsG * 4) / targets.kcal}
        />
        <Row
          label={tProfile.water}
          value={tProfile.waterValue(
            formatNumber(targets.waterRestL),
            formatNumber(targets.waterGymL),
          )}
        />
      </Card>
    </>
  );
}

function EquipmentCard({ equipment }: { equipment: Equipment[] }) {
  const { gym } = useServices();
  const { run, pending } = useProfileAction();
  return (
    <Card>
      <h2 className="font-sans label-caps">{tProfile.equipment}</h2>
      <EquipmentPicker
        value={equipment}
        disabled={pending}
        onChange={(next) =>
          void run(
            () => gym.setEquipment(next),
            ({ changes }) => describeChanges(changes),
          )
        }
      />
      <p className="text-xs text-muted">{tProfile.equipmentHint}</p>
    </Card>
  );
}

/** docs/fitur/09-profil.md */
export function ProfileScreen() {
  const { data: overview } = useProfileOverview();
  const [theme, setTheme] = useThemePreference();
  const [sheet, setSheet] = useState<'body' | 'schedule' | null>(null);

  if (!overview) return <ScreenHeader title={tProfile.title} />;
  const p = overview.profile;

  return (
    <div className="flex flex-col gap-3.5">
      <BodyCard overview={overview} />

      <Card>
        <h2 className="font-sans label-caps">{tProfile.goalSchedule}</h2>
        <div className="divide-y divide-line">
          <Row label={tProfile.goal} value={tProfile.goalValue} />
          <Row label={tProfile.experience} value={t.experience[p.experience].label} />
          <Row
            label={tProfile.trainingDays}
            value={p.trainingDays.map((d) => t.weekdayShort[d]).join(', ')}
          />
          <Row label={tProfile.activity} value={t.activity[p.activityLevel].label} />
          <Row
            label={tProfile.proteinFactor}
            value={tProfile.proteinFactorValue(formatFixed(p.proteinGPerKg, 1))}
          />
          <Row label={tProfile.units} value={tProfile.unitsValue} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="ghost" size="sm" onClick={() => setSheet('body')}>
            {tProfile.editBody}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSheet('schedule')}>
            {tProfile.editSchedule}
          </Button>
        </div>
      </Card>

      <EquipmentCard equipment={overview.equipment} />
      <InventoryCard />
      <HealthCard conditions={overview.conditions} />
      <ParqCard status={overview.parq} />
      <ReminderCard />
      <BackupCard />

      <Card>
        <h2 className="font-sans label-caps">{tProfile.appearance}</h2>
        <SegmentedControl
          label={t.theme.label}
          options={themeOptions}
          value={theme}
          onChange={setTheme}
        />
      </Card>

      <InstallCard title={t.pwa.install} />

      <Card>
        <h2 className="font-sans label-caps">{tProfile.about}</h2>
        <Row label={t.app.name} value={`${tProfile.version} ${__APP_VERSION__}`} />
        <p className="text-xs text-muted">{tProfile.disclaimer}</p>
      </Card>

      {sheet === 'body' && <EditBodySheet overview={overview} onClose={() => setSheet(null)} />}
      {sheet === 'schedule' && (
        <ScheduleSheet current={p.trainingDays} onClose={() => setSheet(null)} />
      )}
    </div>
  );
}
