import { CsTagTone } from '@shared/ui';
import { I18nService } from '@core/i18n/i18n.service';

/** Ativo/Inativo - Product e CancellationReason (com.nimbusnovax.administracao.model.enums.StatusEnum
 *  no backend serializa pelo nome do enum Java, não por código numérico). */
export enum RecordStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export type RecordStatusInput = RecordStatus | string | null | undefined;

export function normalizeRecordStatus(status: RecordStatusInput): RecordStatus | null {
  if (status == null) return null;

  const normalized = String(status).trim().toUpperCase();

  switch (normalized) {
    case RecordStatus.ACTIVE:
      return RecordStatus.ACTIVE;
    case RecordStatus.INACTIVE:
      return RecordStatus.INACTIVE;
    default:
      return null;
  }
}

export function recordStatusSeverity(status: RecordStatusInput): CsTagTone {
  return normalizeRecordStatus(status) === RecordStatus.ACTIVE ? 'success' : 'bank';
}

export function recordStatusLabel(status: RecordStatusInput, i18n: I18nService): string {
  switch (normalizeRecordStatus(status)) {
    case RecordStatus.ACTIVE:
      return i18n.tUi('enum.recordStatus.active');
    case RecordStatus.INACTIVE:
      return i18n.tUi('enum.recordStatus.inactive');
    default:
      return i18n.tUi('enum.recordStatus.unknown', 'Desconhecido');
  }
}

export function allRecordStatuses(): RecordStatus[] {
  return [RecordStatus.ACTIVE, RecordStatus.INACTIVE];
}
