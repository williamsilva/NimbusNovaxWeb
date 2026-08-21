import { I18nService } from '@core/i18n/i18n.service';

/** Backend guarda como VARCHAR(1) ('M'/'F' - ver Agent.sex no NimbusNovaxServer). */
export enum Sex {
  MALE = 'M',
  FEMALE = 'F',
}

export type SexInput = Sex | string | null | undefined;

export function normalizeSex(value: SexInput): Sex | null {
  if (value == null) return null;

  const normalized = String(value).trim().toUpperCase();

  switch (normalized) {
    case Sex.MALE:
      return Sex.MALE;
    case Sex.FEMALE:
      return Sex.FEMALE;
    default:
      return null;
  }
}

export function sexLabel(value: SexInput, i18n: I18nService): string {
  switch (normalizeSex(value)) {
    case Sex.MALE:
      return i18n.tUi('enum.sex.male');
    case Sex.FEMALE:
      return i18n.tUi('enum.sex.female');
    default:
      return i18n.tUi('enum.sex.unknown', 'N/A');
  }
}

export function allSexes(): Sex[] {
  return [Sex.MALE, Sex.FEMALE];
}
