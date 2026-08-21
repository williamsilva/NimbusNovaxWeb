import { I18nService } from '@core/i18n/i18n.service';

/** Papel que um Agente pode assumir - um agente pode ter vários simultaneamente. */
export enum TypeAgent {
  CLIENT = 'CLIENT',
  PROVIDER = 'PROVIDER',
  PROMOTER = 'PROMOTER',
  EMPLOYEE = 'EMPLOYEE',
  TOUR_GUIDE = 'TOUR_GUIDE',
}

export type TypeAgentInput = TypeAgent | string | null | undefined;

export function normalizeTypeAgent(value: TypeAgentInput): TypeAgent | null {
  if (value == null) return null;

  const normalized = String(value).trim().toUpperCase();

  switch (normalized) {
    case TypeAgent.CLIENT:
      return TypeAgent.CLIENT;
    case TypeAgent.PROVIDER:
      return TypeAgent.PROVIDER;
    case TypeAgent.PROMOTER:
      return TypeAgent.PROMOTER;
    case TypeAgent.EMPLOYEE:
      return TypeAgent.EMPLOYEE;
    case TypeAgent.TOUR_GUIDE:
      return TypeAgent.TOUR_GUIDE;
    default:
      return null;
  }
}

export function typeAgentLabel(value: TypeAgentInput, i18n: I18nService): string {
  switch (normalizeTypeAgent(value)) {
    case TypeAgent.CLIENT:
      return i18n.tUi('enum.typeAgent.client');
    case TypeAgent.PROVIDER:
      return i18n.tUi('enum.typeAgent.provider');
    case TypeAgent.PROMOTER:
      return i18n.tUi('enum.typeAgent.promoter');
    case TypeAgent.EMPLOYEE:
      return i18n.tUi('enum.typeAgent.employee');
    case TypeAgent.TOUR_GUIDE:
      return i18n.tUi('enum.typeAgent.tourGuide');
    default:
      return i18n.tUi('enum.typeAgent.unknown', 'N/A');
  }
}

export function allTypeAgents(): TypeAgent[] {
  return [TypeAgent.CLIENT, TypeAgent.PROVIDER, TypeAgent.PROMOTER, TypeAgent.EMPLOYEE, TypeAgent.TOUR_GUIDE];
}
