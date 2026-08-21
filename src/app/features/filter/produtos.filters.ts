import { PeriodEnum } from '@models/enums/period.enum';
import { TypeProduct } from '@models/enums/type-product.enum';
import { RecordStatus } from '@models/enums/record-status.enum';

export interface ProductsAdvancedFilters {
  name?: string;
  typeProduct?: TypeProduct[] | null;
  status?: RecordStatus[] | null;

  createdAt?: string | string[];
  periodCreatedAt?: PeriodEnum;
}
