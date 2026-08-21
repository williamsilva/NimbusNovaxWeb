import { PeriodEnum } from '@models/enums/period.enum';
import { Generation, GenerationInput } from '@models/enums/generation.enum';
import { RecordStatus, RecordStatusInput, normalizeRecordStatus } from '@models/enums/record-status.enum';

export interface CancellationReasonModel {
  id: string;
  name: string;
  description: string | null;
  status: RecordStatus | null;
  generation: Generation | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface CancellationReasonCreateInput {
  name: string;
  description?: string | null;
  status?: RecordStatus;
}

export type CancellationReasonUpdateInput = CancellationReasonCreateInput;

export type CancellationReasonsFiltersState = {
  name: string;
  description: string;
  status: RecordStatus[] | null;
  createdAt: string | string[] | null;
  periodCreatedAt: PeriodEnum | null;
};

export interface CancellationReasonApiModel {
  id: string;
  name: string;
  description?: string | null;
  status: RecordStatusInput;
  generation: GenerationInput;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export function mapCancellationReasonApiModel(input: CancellationReasonApiModel): CancellationReasonModel {
  return {
    id: input.id,
    name: input.name,
    description: input.description ?? null,
    status: normalizeRecordStatus(input.status),
    generation: input.generation as Generation | null,
    createdAt: input.createdAt ?? null,
    updatedAt: input.updatedAt ?? null,
  };
}

export function mapCancellationReasonApiModels(
  items: CancellationReasonApiModel[] | null | undefined,
): CancellationReasonModel[] {
  return (items ?? []).map(mapCancellationReasonApiModel);
}
