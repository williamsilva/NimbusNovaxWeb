import { PeriodEnum } from '@models/enums/period.enum';
import { TypeAgent, TypeAgentInput, normalizeTypeAgent } from '@models/enums/type-agent.enum';
import { TypePerson, TypePersonInput, normalizeTypePerson } from '@models/enums/type-person.enum';
import { CivilState, CivilStateInput, normalizeCivilState } from '@models/enums/civil-state.enum';
import { PartyStatus, PartyStatusInput, normalizePartyStatus } from '@models/enums/party-status.enum';

export interface AgentAddressModel {
  id?: string;
  street: string | null;
  number: string | null;
  complement: string | null;
  burgh: string | null;
  postalCode: string | null;
  cityId: string | null;
  cityName?: string | null;
  stateUf?: string | null;
}

export interface AgentContactModel {
  id?: string;
  name: string | null;
  cellphone: string | null;
  telephone: string | null;
  email: string | null;
}

export interface AgentModel {
  id: string;
  code: string;
  name: string;
  socialReason: string | null;
  document: string;
  rg: string | null;
  sex: string | null;
  typePerson: TypePerson | null;
  civilState: CivilState | null;
  birthDate: string | null;
  isManager: boolean;
  isAttendant: boolean;
  roles: TypeAgent[];
  statusClient: PartyStatus | null;
  statusProvider: PartyStatus | null;
  statusPromoter: PartyStatus | null;
  statusEmployee: PartyStatus | null;
  statusTourGuide: PartyStatus | null;
  addresses: AgentAddressModel[];
  contacts: AgentContactModel[];
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface AgentUpsertInput {
  name: string;
  socialReason?: string | null;
  document: string;
  rg?: string | null;
  sex?: string | null;
  typePerson?: TypePerson | null;
  civilState?: CivilState | null;
  birthDate?: string | null;
  isManager: boolean;
  isAttendant: boolean;
  roles: TypeAgent[];
  statusClient?: PartyStatus | null;
  statusProvider?: PartyStatus | null;
  statusPromoter?: PartyStatus | null;
  statusEmployee?: PartyStatus | null;
  statusTourGuide?: PartyStatus | null;
  addresses: AgentAddressModel[];
  contacts: AgentContactModel[];
}

export type AgentsFiltersState = {
  code: string;
  name: string;
  document: string;
  typePerson: TypePerson[] | null;
  createdAt: string | string[] | null;
  periodCreatedAt: PeriodEnum | null;
};

export interface AgentApiModel {
  id: string;
  code: string;
  name: string;
  socialReason?: string | null;
  document: string;
  rg?: string | null;
  sex?: string | null;
  typePerson: TypePersonInput;
  civilState: CivilStateInput;
  birthDate?: string | null;
  isManager: boolean;
  isAttendant: boolean;
  roles: TypeAgentInput[];
  statusClient: PartyStatusInput;
  statusProvider: PartyStatusInput;
  statusPromoter: PartyStatusInput;
  statusEmployee: PartyStatusInput;
  statusTourGuide: PartyStatusInput;
  addresses: Array<{
    id: string;
    street?: string | null;
    number?: string | null;
    complement?: string | null;
    burgh?: string | null;
    postalCode?: string | null;
    cityId?: string | null;
    cityName?: string | null;
    stateUf?: string | null;
  }>;
  contacts: Array<{
    id: string;
    name?: string | null;
    cellphone?: string | null;
    telephone?: string | null;
    email?: string | null;
  }>;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export function mapAgentApiModel(input: AgentApiModel): AgentModel {
  return {
    id: input.id,
    code: input.code,
    name: input.name,
    socialReason: input.socialReason ?? null,
    document: input.document,
    rg: input.rg ?? null,
    sex: input.sex ?? null,
    typePerson: normalizeTypePerson(input.typePerson),
    civilState: normalizeCivilState(input.civilState),
    birthDate: input.birthDate ?? null,
    isManager: !!input.isManager,
    isAttendant: !!input.isAttendant,
    roles: (input.roles ?? []).map(normalizeTypeAgent).filter((r): r is TypeAgent => r !== null),
    statusClient: normalizePartyStatus(input.statusClient),
    statusProvider: normalizePartyStatus(input.statusProvider),
    statusPromoter: normalizePartyStatus(input.statusPromoter),
    statusEmployee: normalizePartyStatus(input.statusEmployee),
    statusTourGuide: normalizePartyStatus(input.statusTourGuide),
    addresses: (input.addresses ?? []).map((a) => ({
      id: a.id,
      street: a.street ?? null,
      number: a.number ?? null,
      complement: a.complement ?? null,
      burgh: a.burgh ?? null,
      postalCode: a.postalCode ?? null,
      cityId: a.cityId ?? null,
      cityName: a.cityName ?? null,
      stateUf: a.stateUf ?? null,
    })),
    contacts: (input.contacts ?? []).map((c) => ({
      id: c.id,
      name: c.name ?? null,
      cellphone: c.cellphone ?? null,
      telephone: c.telephone ?? null,
      email: c.email ?? null,
    })),
    createdAt: input.createdAt ?? null,
    updatedAt: input.updatedAt ?? null,
  };
}

export function mapAgentApiModels(items: AgentApiModel[] | null | undefined): AgentModel[] {
  return (items ?? []).map(mapAgentApiModel);
}
