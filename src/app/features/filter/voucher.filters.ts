import { PeriodEnum } from '@models/enums/period.enum';
import { StatusVoucher } from '@models/enums/status-voucher.enum';

export interface VouchersAdvancedFilters {
  voucher?: string;
  client?: string;
  promoterIds?: string[];
  status?: StatusVoucher[] | null;

  visitDate?: string | string[];
  periodVisitDate?: PeriodEnum;
}
