import { CsTagTone } from '@shared/ui';
import { I18nService } from '@core/i18n/i18n.service';

/** Status por papel do Agente (Cliente/Fornecedor/Promotor/Funcionário/Guia Turístico) - `null`
 *  significa "sem esse papel ainda configurado" (ver Agent.getStatusClientEnum() etc. no backend,
 *  que mapeia o código 0 do banco para ausência). */
export enum PartyStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED',
}

export type PartyStatusInput = PartyStatus | string | null | undefined;

export function normalizePartyStatus(value: PartyStatusInput): PartyStatus | null {
  if (value == null) return null;

  const normalized = String(value).trim().toUpperCase();

  switch (normalized) {
    case PartyStatus.ACTIVE:
      return PartyStatus.ACTIVE;
    case PartyStatus.INACTIVE:
      return PartyStatus.INACTIVE;
    case PartyStatus.BLOCKED:
      return PartyStatus.BLOCKED;
    default:
      return null;
  }
}

export function partyStatusSeverity(value: PartyStatusInput): CsTagTone {
  switch (normalizePartyStatus(value)) {
    case PartyStatus.ACTIVE:
      return 'success';
    case PartyStatus.BLOCKED:
      return 'danger';
    case PartyStatus.INACTIVE:
      return 'bank';
    default:
      return 'contrast';
  }
}

export function partyStatusLabel(value: PartyStatusInput, i18n: I18nService): string {
  switch (normalizePartyStatus(value)) {
    case PartyStatus.ACTIVE:
      return i18n.tUi('enum.partyStatus.active');
    case PartyStatus.INACTIVE:
      return i18n.tUi('enum.partyStatus.inactive');
    case PartyStatus.BLOCKED:
      return i18n.tUi('enum.partyStatus.blocked');
    default:
      return i18n.tUi('enum.partyStatus.none', 'N/A');
  }
}

export function allPartyStatuses(): PartyStatus[] {
  return [PartyStatus.ACTIVE, PartyStatus.INACTIVE, PartyStatus.BLOCKED];
}
