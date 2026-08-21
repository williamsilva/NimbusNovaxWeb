import { PeriodEnum } from '@models/enums/period.enum';
import { RecordStatus } from '@models/enums/record-status.enum';

export interface CancellationReasonsAdvancedFilters {
  name?: string;
  description?: string;
  status?: RecordStatus[] | null;

  createdAt?: string | string[];
  periodCreatedAt?: PeriodEnum;
}
