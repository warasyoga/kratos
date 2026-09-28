import { t } from '@/shared/i18n/id';
import { useThemePreference, type ThemePreference } from '@/shared/lib/theme';
import { Card } from '@/shared/ui/Card';
import { ScreenHeader } from '@/shared/ui/ScreenHeader';
import { SegmentedControl } from '@/shared/ui/SegmentedControl';

const themeOptions = [
  { value: 'system', label: t.theme.system },
  { value: 'light', label: t.theme.light },
  { value: 'dark', label: t.theme.dark },
] as const satisfies readonly { value: ThemePreference; label: string }[];

export function ProfileScreen() {
  const [theme, setTheme] = useThemePreference();

  return (
    <div className="flex flex-col gap-3.5">
      <ScreenHeader title={t.profile.title} />
      <Card>
        <h2 className="font-sans label-caps">{t.profile.appearance}</h2>
        <SegmentedControl
          label={t.theme.label}
          options={themeOptions}
          value={theme}
          onChange={setTheme}
        />
      </Card>
      <Card>
        <h2 className="font-sans label-caps">{t.profile.about}</h2>
        <div className="flex justify-between text-sm">
          <span>{t.app.name}</span>
          <span className="text-muted tabular-nums">
            {t.profile.version} {__APP_VERSION__}
          </span>
        </div>
      </Card>
    </div>
  );
}
