import { t } from '@/shared/i18n/id';
import { tOnboarding } from '@/shared/i18n/onboarding';
import { useInstallPrompt } from '@/shared/lib/installPrompt';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';

/** Ajakan memasang Kratos ke layar utama (docs/10-deploy-pwa.md "Memasang di HP"). */
export function InstallCard({ title }: { title?: string }) {
  const { canInstall, installed, install } = useInstallPrompt();

  return (
    <Card>
      {title && <h2 className="font-sans label-caps">{title}</h2>}
      {installed ? (
        <p className="text-sm text-good">{t.pwa.installed}</p>
      ) : canInstall ? (
        <>
          <p className="text-sm text-muted">{t.pwa.installHint}</p>
          <Button fullWidth onClick={() => void install()}>
            {t.pwa.install}
          </Button>
        </>
      ) : (
        <div className="flex flex-col gap-2 text-sm">
          <p className="text-muted">{t.pwa.installHint}</p>
          <p>{tOnboarding.install.android}</p>
          <p>{tOnboarding.install.ios}</p>
        </div>
      )}
    </Card>
  );
}
