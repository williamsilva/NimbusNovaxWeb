import { I18nService } from '@core/i18n/i18n.service';

export enum CivilState {
  SINGLE = 'SINGLE',
  MARRIED = 'MARRIED',
  WIDOWED = 'WIDOWED',
  DIVORCED = 'DIVORCED',
}

export type CivilStateInput = CivilState | string | null | undefined;

export function normalizeCivilState(value: CivilStateInput): CivilState | null {
  if (value == null) return null;

  const normalized = String(value).trim().toUpperCase();

  switch (normalized) {
    case CivilState.SINGLE:
      return CivilState.SINGLE;
    case CivilState.MARRIED:
      return CivilState.MARRIED;
    case CivilState.WIDOWED:
      return CivilState.WIDOWED;
    case CivilState.DIVORCED:
      return CivilState.DIVORCED;
    default:
      return null;
  }
}

export function civilStateLabel(value: CivilStateInput, i18n: I18nService): string {
  switch (normalizeCivilState(value)) {
    case CivilState.SINGLE:
      return i18n.tUi('enum.civilState.single');
    case CivilState.MARRIED:
      return i18n.tUi('enum.civilState.married');
    case CivilState.WIDOWED:
      return i18n.tUi('enum.civilState.widowed');
    case CivilState.DIVORCED:
      return i18n.tUi('enum.civilState.divorced');
    default:
      return i18n.tUi('enum.civilState.unknown', 'N/A');
  }
}

export function allCivilStates(): CivilState[] {
  return [CivilState.SINGLE, CivilState.MARRIED, CivilState.WIDOWED, CivilState.DIVORCED];
}
