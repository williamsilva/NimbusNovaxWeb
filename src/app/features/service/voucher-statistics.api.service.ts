import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { StatusVoucherInput } from '@models/enums/status-voucher.enum';
import { API } from '@core/api/api.config';

export interface VoucherByStatusDto {
  status: StatusVoucherInput;
  total: number;
}

export interface VoucherTotalsDto {
  clientCount: number;
  voucherCount: number;
  totalPrice: number;
  totalPriceTickets: number;
  totalPriceFoods: number;
}

export interface VoucherTopClientDto {
  clientId: string;
  clientName: string;
  voucherCount: number;
  totalPrice: number;
}

export interface VoucherStatisticsPeriod {
  firstPeriod?: string | null;
  finalPeriod?: string | null;
}

@Injectable({ providedIn: 'root' })
export class VoucherStatisticsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API.bff}/v1/vouchers/statistics`;

  private params(period: VoucherStatisticsPeriod) {
    const params: Record<string, string> = {};
    if (period.firstPeriod) params['firstPeriod'] = period.firstPeriod;
    if (period.finalPeriod) params['finalPeriod'] = period.finalPeriod;
    return params;
  }

  byStatus(period: VoucherStatisticsPeriod) {
    return this.http.get<VoucherByStatusDto[]>(`${this.baseUrl}/by-status`, { params: this.params(period) });
  }

  totals(period: VoucherStatisticsPeriod) {
    return this.http.get<VoucherTotalsDto>(`${this.baseUrl}/totals`, { params: this.params(period) });
  }

  topClients(period: VoucherStatisticsPeriod) {
    return this.http.get<VoucherTopClientDto[]>(`${this.baseUrl}/top-clients`, { params: this.params(period) });
  }
}
