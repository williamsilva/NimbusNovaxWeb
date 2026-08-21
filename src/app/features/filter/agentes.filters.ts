import { PeriodEnum } from '@models/enums/period.enum';
import { TypePerson } from '@models/enums/type-person.enum';

export interface AgentsAdvancedFilters {
  code?: string;
  name?: string;
  document?: string;
  typePerson?: TypePerson[] | null;

  createdAt?: string | string[];
  periodCreatedAt?: PeriodEnum;
}
