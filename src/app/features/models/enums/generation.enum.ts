import { CsTagTone } from '@shared/ui';
import { I18nService } from '@core/i18n/i18n.service';

/** USER (cadastrado manualmente) ou SYSTEM (seed, protegido contra edição/exclusão na UI - ver
 *  CancellationReasonService no backend, que sempre força USER no save). */
export enum Generation {
  USER = 'USER',
  SYSTEM = 'SYSTEM',
}

export type GenerationInput = Generation | string | null | undefined;

export function normalizeGeneration(value: GenerationInput): Generation | null {
  if (value == null) return null;

  const normalized = String(value).trim().toUpperCase();

  switch (normalized) {
    case Generation.USER:
      return Generation.USER;
    case Generation.SYSTEM:
      return Generation.SYSTEM;
    default:
      return null;
  }
}

export function isSystemGenerated(value: GenerationInput): boolean {
  return normalizeGeneration(value) === Generation.SYSTEM;
}

export function generationSeverity(value: GenerationInput): CsTagTone {
  return normalizeGeneration(value) === Generation.SYSTEM ? 'info' : 'contrast';
}

export function generationLabel(value: GenerationInput, i18n: I18nService): string {
  switch (normalizeGeneration(value)) {
    case Generation.USER:
      return i18n.tUi('enum.generation.user');
    case Generation.SYSTEM:
      return i18n.tUi('enum.generation.system');
    default:
      return i18n.tUi('enum.generation.unknown', 'Desconhecido');
  }
}
