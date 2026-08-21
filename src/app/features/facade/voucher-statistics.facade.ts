import { Injectable, inject, signal } from '@angular/core';

import {
  VoucherStatisticsApiService,
  VoucherStatisticsPeriod,
  VoucherByStatusDto,
  VoucherTotalsDto,
  VoucherTopClientDto,
} from '@features/service/voucher-statistics.api.service';

@Injectable({ providedIn: 'root' })
export class VoucherStatisticsFacade {
  private readonly api = inject(VoucherStatisticsApiService);

  private readonly _byStatus = signal<VoucherByStatusDto[]>([]);
  private readonly _totals = signal<VoucherTotalsDto | null>(null);
  private readonly _topClients = signal<VoucherTopClientDto[]>([]);
  private readonly _loading = signal(false);

  readonly byStatus = this._byStatus.asReadonly();
  readonly totals = this._totals.asReadonly();
  readonly topClients = this._topClients.asReadonly();
  readonly loading = this._loading.asReadonly();

  load(period: VoucherStatisticsPeriod): void {
    this._loading.set(true);

    this.api.byStatus(period).subscribe({
      next: (data) => this._byStatus.set(data),
      error: () => this._byStatus.set([]),
    });

    this.api.totals(period).subscribe({
      next: (data) => {
        this._loading.set(false);
        this._totals.set(data);
      },
      error: () => {
        this._loading.set(false);
        this._totals.set(null);
      },
    });

    this.api.topClients(period).subscribe({
      next: (data) => this._topClients.set(data),
      error: () => this._topClients.set([]),
    });
  }
}
