import { I18nService } from '@core/i18n/i18n.service';

export enum TypePerson {
  PHYSICAL = 'PHYSICAL',
  LEGAL = 'LEGAL',
}

export type TypePersonInput = TypePerson | string | null | undefined;

export function normalizeTypePerson(value: TypePersonInput): TypePerson | null {
  if (value == null) return null;

  const normalized = String(value).trim().toUpperCase();

  switch (normalized) {
    case TypePerson.PHYSICAL:
      return TypePerson.PHYSICAL;
    case TypePerson.LEGAL:
      return TypePerson.LEGAL;
    default:
      return null;
  }
}

export function typePersonLabel(value: TypePersonInput, i18n: I18nService): string {
  switch (normalizeTypePerson(value)) {
    case TypePerson.PHYSICAL:
      return i18n.tUi('enum.typePerson.physical');
    case TypePerson.LEGAL:
      return i18n.tUi('enum.typePerson.legal');
    default:
      return i18n.tUi('enum.typePerson.unknown', 'N/A');
  }
}

export function allTypePersons(): TypePerson[] {
  return [TypePerson.PHYSICAL, TypePerson.LEGAL];
}
