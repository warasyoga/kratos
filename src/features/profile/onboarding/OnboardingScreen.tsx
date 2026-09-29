import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { useServices } from '@/application/ServicesContext';
import { toLocalDate } from '@/domain/common/clock';
import { errorText, t } from '@/shared/i18n/id';
import { tOnboarding, tParq } from '@/shared/i18n/onboarding';
import { tBackup } from '@/shared/i18n/profile';
import { RestoreBackup } from '../components/RestoreBackup';
import { Button } from '@/shared/ui/Button';
import { OptionGroup } from '@/shared/ui/OptionGroup';
import { DayPicker } from '../components/DayPicker';
import { InstallCard } from '../components/InstallCard';
import { EquipmentPicker } from '../components/EquipmentPicker';
import { ParqForm } from '../components/ParqForm';
import { useProfileOverview, useRefreshProfile } from '../hooks/useProfile';
import { activityOptions, experienceOptions } from '../options';
import { BodyStepFields } from './BodyStepFields';
import {
  QUESTION_STEPS,
  STEPS,
  stepOfField,
  toOnboardingInput,
  validateStep,
  type Step,
} from './draft';
import { HealthStepFields } from './HealthStepFields';
import { StepLayout } from './StepLayout';
import { SummaryStep } from './SummaryStep';
import { useOnboardingDraft } from './useOnboardingDraft';

/** Onboarding bertahap: satu pertanyaan per layar. docs/fitur/01-onboarding.md */
export function OnboardingScreen() {
  const services = useServices();
  const navigate = useNavigate();
  const refresh = useRefreshProfile();
  const overview = useProfileOverview();
  const { step, draft, patch, goTo, clear } = useOnboardingDraft();
  const [errors, setErrors] = useState<Record<string, string> | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [hasWarnings, setHasWarnings] = useState(false);
  const today = toLocalDate(services.clock.now());

  const finished = step === 'summary' || step === 'install';
  if (overview.data && !finished) return <Navigate to="/" replace />;

  const index = STEPS.indexOf(step);
  const questionIndex = QUESTION_STEPS.indexOf(step);
  const progress =
    questionIndex >= 0 ? { step: questionIndex + 1, total: QUESTION_STEPS.length } : undefined;
  const back =
    index > 0 && !finished
      ? () => {
          setErrors(null);
          goTo(STEPS[index - 1] as Step);
        }
      : undefined;

  const next = () => {
    const stepErrors = validateStep(step, draft, today);
    setErrors(stepErrors);
    if (!stepErrors) goTo(STEPS[index + 1] as Step);
  };

  const submit = async () => {
    const stepErrors = validateStep('parq', draft, today);
    setErrors(stepErrors);
    if (stepErrors) return;
    setSubmitting(true);
    const result = await services.profile.completeOnboarding(toOnboardingInput(draft));
    setSubmitting(false);
    if (!result.ok) {
      const fields = result.error.fields ?? {};
      const first = Object.keys(fields)[0];
      setErrors(fields);
      if (first) goTo(stepOfField(first));
      return;
    }
    setHasWarnings(result.value.warnings.length > 0);
    clear();
    goTo('summary');
    void services.platform.requestPersistentStorage();
    await refresh();
  };

  const text = tOnboarding;
  const common = { progress, onBack: back, primaryLabel: t.common.next, onPrimary: next } as const;

  switch (step) {
    case 'welcome':
      return (
        <StepLayout
          title={text.welcome.title}
          body={text.welcome.body}
          primaryLabel={text.welcome.start}
          onPrimary={next}
        >
          <div className="flex flex-col gap-2">
            <p className="text-[13px] text-muted">{tBackup.restoreHint}</p>
            <RestoreBackup />
          </div>
        </StepLayout>
      );
    case 'body':
      return (
        <StepLayout {...common} title={text.body.title} body={text.body.body}>
          <BodyStepFields draft={draft} patch={patch} errors={errors} today={today} />
        </StepLayout>
      );
    case 'experience':
      return (
        <StepLayout {...common} title={text.experience.title} body={text.experience.body}>
          <OptionGroup
            name="experience"
            label={text.experience.title}
            options={experienceOptions}
            value={draft.experience}
            onChange={(experience) => patch({ experience })}
            error={errorText(errors?.experience)}
          />
        </StepLayout>
      );
    case 'activity':
      return (
        <StepLayout {...common} title={text.activity.title} body={text.activity.body}>
          <OptionGroup
            name="activity"
            label={text.activity.title}
            options={activityOptions}
            value={draft.activityLevel}
            onChange={(activityLevel) => patch({ activityLevel })}
            error={errorText(errors?.activityLevel)}
          />
        </StepLayout>
      );
    case 'schedule':
      return (
        <StepLayout {...common} title={text.schedule.title} body={text.schedule.body}>
          <DayPicker
            value={draft.trainingDays}
            onChange={(trainingDays) => patch({ trainingDays })}
            error={errorText(errors?.trainingDays)}
          />
        </StepLayout>
      );
    case 'equipment':
      return (
        <StepLayout {...common} title={text.equipment.title} body={text.equipment.body}>
          <EquipmentPicker value={draft.equipment} onChange={(equipment) => patch({ equipment })} />
        </StepLayout>
      );
    case 'health':
      return (
        <StepLayout {...common} title={text.health.title} body={text.health.body}>
          <HealthStepFields
            conditions={draft.conditions}
            onChange={(conditions) => patch({ conditions })}
          />
        </StepLayout>
      );
    case 'parq':
      return (
        <StepLayout
          {...common}
          title={tParq.title}
          primaryLabel={submitting ? text.creating : text.submit}
          primaryDisabled={submitting}
          onPrimary={() => void submit()}
        >
          <ParqForm
            value={draft.parq}
            onChange={(parq) => patch({ parq })}
            errors={errors ?? undefined}
          />
        </StepLayout>
      );
    case 'summary':
      return <SummaryStep hasWarnings={hasWarnings} onNext={() => goTo('install')} />;
    case 'install':
      return (
        <StepLayout
          title={text.install.title}
          body={text.install.body}
          primaryLabel={text.install.done}
          onPrimary={() => navigate('/program', { replace: true })}
          secondary={
            <Button variant="ghost" onClick={() => navigate('/', { replace: true })}>
              {text.install.later}
            </Button>
          }
        >
          <InstallCard />
        </StepLayout>
      );
  }
}
