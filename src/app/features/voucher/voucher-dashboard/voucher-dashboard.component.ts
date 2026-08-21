import { CurrencyPipe } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TranslateModule } from '@ngx-translate/core';
import { FloatLabelModule } from 'primeng/floatlabel';
import { DatePickerModule } from 'primeng/datepicker';

import { I18nService } from '@core/i18n/i18n.service';
import { VoucherStatisticsFacade } from '@features/facade/voucher-statistics.facade';
import { statusVoucherLabel } from '@models/enums/status-voucher.enum';
import { PageHeaderComponent } from '@shared/features/page-header/page-header.component';

const STATUS_COLORS: Record<string, string> = {
  DEALING: '#3B82F6',
  CONFIRMED: '#22C55E',
  EXCHANGED: '#14B8A6',
  OVERDUE: '#F59E0B',
  CALLED_OFF: '#EF4444',
  NOT_CLOSED: '#6B7280',
};

/** Dashboard estatístico de voucher (distribuição por status, totais, top clientes) - mesmo papel
 *  do DashboardVoucherComponent no sistema legado (Novax antigo), consumindo
 *  VoucherStatisticsController/VoucherStatisticsService (novo, sem equivalente 1:1 no legado
 *  além do conjunto de consultas). */
@Component({
  standalone: true,
  selector: 'app-voucher-dashboard',
  templateUrl: './voucher-dashboard.component.html',
  imports: [
    CardModule,
    ChartModule,
    CurrencyPipe,
    TableModule,
    ButtonModule,
    TranslateModule,
    FloatLabelModule,
    DatePickerModule,
    ReactiveFormsModule,
    PageHeaderComponent,
  ],
})
export class VoucherDashboardComponent {
  private readonly fb = inject(FormBuilder);

  readonly i18n = inject(I18nService);
  readonly facade = inject(VoucherStatisticsFacade);

  readonly currency = this.i18n.getCurrency();
  readonly locale = this.i18n.getLocale();

  readonly form = this.fb.nonNullable.group({
    firstPeriod: [null as Date | null],
    finalPeriod: [null as Date | null],
  });

  readonly chartData = computed(() => {
    const byStatus = this.facade.byStatus();
    return {
      labels: byStatus.map((s) => statusVoucherLabel(s.status, this.i18n)),
      datasets: [
        {
          data: byStatus.map((s) => s.total),
          backgroundColor: byStatus.map((s) => STATUS_COLORS[String(s.status)] ?? '#94A3B8'),
        },
      ],
    };
  });

  readonly chartOptions = signal({
    plugins: { legend: { labels: { usePointStyle: true } } },
  });

  constructor() {
    effect(() => {
      this.i18n.getAppliedLang();
      this.chartData();
    });
    this.reload();
  }

  private toDateOnly(value: Date | null): string | undefined {
    if (!value) return undefined;
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, '0');
    const d = String(value.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  reload(): void {
    const v = this.form.getRawValue();
    this.facade.load({
      firstPeriod: this.toDateOnly(v.firstPeriod),
      finalPeriod: this.toDateOnly(v.finalPeriod),
    });
  }

  clear(): void {
    this.form.reset({ firstPeriod: null, finalPeriod: null });
    this.reload();
  }
}
