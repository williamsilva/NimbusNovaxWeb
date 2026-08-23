import { FormsModule } from '@angular/forms';
import { Component, ViewChild, computed, inject, signal } from '@angular/core';

import { Table } from 'primeng/table';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { TranslateModule } from '@ngx-translate/core';
import { MultiSelectModule } from 'primeng/multiselect';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

import { CsTagComponent } from '@shared/ui';
import { I18nService } from '@core/i18n/i18n.service';
import { CsDatePipe } from '@shared/pipes/cs-date.pipe';
import { STATE_KEY } from '@features/state-key.constants';
import { StatefulListPage } from '@features/list-base/stateful-list-page';
import { BulkActionListPage } from '@features/list-base/bulk-action-list-page';
import { buildListQuery } from '@shared/features/list-query/list-query.builder';
import { PageHeaderComponent } from '@shared/features/page-header/page-header.component';
import { VoucherFacade } from '@features/facade/voucher.facade';
import { AgentOptionsFacade } from '@features/facade/agent-options.facade';
import { VouchersAdvancedFilters } from '@features/filter/voucher.filters';
import { VoucherModel, VouchersFiltersState } from '@models/voucher.models';
import { TypeAgent } from '@models/enums/type-agent.enum';
import { VoucherPermissionPolicy } from '@features/voucher/policy/voucher-permission.policy';
import { VoucherCreateDialogComponent } from '@features/voucher/voucher-create/voucher-create-dialog.component';
import { VoucherCancelDialogComponent } from '@features/voucher/voucher-cancel/voucher-cancel-dialog.component';
import { PeriodEnum, allPeriodEnum, periodEnumLabel } from '@models/enums/period.enum';
import { CsAdvancedPeriodDateFilterComponent } from '@features/list-base/cs-advanced-period-date-filter.component';
import {
  StatusVoucher,
  allStatusVoucher,
  statusVoucherLabel,
  statusVoucherSeverity,
  defaultVisibleStatusVoucher,
} from '@models/enums/status-voucher.enum';
import {
  ActiveFilterItem,
  FiltersPanelComponent,
} from '@shared/features/filters-panel/filters-panel.component';
import { readSingleFilterValue, readArrayFilterValues } from '@features/list-base/table-filter-readers';

@Component({
  standalone: true,
  selector: 'app-voucher-list',
  templateUrl: './voucher-list.component.html',
  styleUrl: './voucher-list.component.scss',
  imports: [
    FloatLabel,
    CsDatePipe,
    FormsModule,
    TableModule,
    ButtonModule,
    SelectModule,
    TooltipModule,
    CsTagComponent,
    InputTextModule,
    TranslateModule,
    MultiSelectModule,
    PageHeaderComponent,
    ConfirmDialogModule,
    FiltersPanelComponent,
    VoucherCreateDialogComponent,
    VoucherCancelDialogComponent,
    CsAdvancedPeriodDateFilterComponent,
  ],
})
export class VoucherListComponent extends StatefulListPage<VouchersFiltersState, VouchersAdvancedFilters> {
  @ViewChild('dt') private dt?: Table;

  protected override readonly i18n = inject(I18nService);
  readonly facade = inject(VoucherFacade);
  protected readonly toast = inject(MessageService);
  protected readonly confirm = inject(ConfirmationService);
  protected readonly secPolicy = inject(VoucherPermissionPolicy);
  private readonly agentOptions = inject(AgentOptionsFacade);

  override rows = Number(localStorage.getItem(this.tableRowsKey())) || StatefulListPage.DEFAULT_ROWS;

  private readonly bulk = new (class extends BulkActionListPage {
    protected override readonly i18n = inject(I18nService);
    protected override readonly toast = inject(MessageService);
    protected override readonly confirm = inject(ConfirmationService);
    constructor(private readonly host: VoucherListComponent) {
      super();
    }
    protected override clearSelection(): void {}

    confirmDelete(row: VoucherModel): void {
      this.confirmAction({
        header: this.i18n.tUi('voucher.delete.header'),
        message: this.i18n.tUi('voucher.delete.message', { code: row.code }),
        icon: 'pi pi-exclamation-triangle',
        accept: () => this.executeAction(this.host.facade.delete(row.id), this.i18n.tUi('voucher.delete.success')),
      });
    }

    confirmConfirm(row: VoucherModel): void {
      this.confirmAction({
        header: this.i18n.tUi('voucher.action.confirm.header'),
        message: this.i18n.tUi('voucher.action.confirm.message', { code: row.code }),
        icon: 'pi pi-check-circle',
        accept: () => this.executeAction(this.host.facade.confirm(row.id), this.i18n.tUi('voucher.action.confirm.success')),
      });
    }

    confirmNotConfirm(row: VoucherModel): void {
      this.confirmAction({
        header: this.i18n.tUi('voucher.action.notConfirm.header'),
        message: this.i18n.tUi('voucher.action.notConfirm.message', { code: row.code }),
        icon: 'pi pi-times-circle',
        accept: () =>
          this.executeAction(this.host.facade.notConfirm(row.id), this.i18n.tUi('voucher.action.notConfirm.success')),
      });
    }

    confirmChange(row: VoucherModel): void {
      this.confirmAction({
        header: this.i18n.tUi('voucher.action.change.header'),
        message: this.i18n.tUi('voucher.action.change.message', { code: row.code }),
        icon: 'pi pi-sync',
        accept: () => this.executeAction(this.host.facade.change(row.id), this.i18n.tUi('voucher.action.change.success')),
      });
    }

    confirmSendEmail(row: VoucherModel): void {
      this.confirmAction({
        header: this.i18n.tUi('voucher.action.sendEmail.header'),
        message: this.i18n.tUi('voucher.action.sendEmail.message', { code: row.code }),
        icon: 'pi pi-envelope',
        accept: () =>
          this.executeAction(this.host.facade.sendEmail(row.id), this.i18n.tUi('voucher.action.sendEmail.success')),
      });
    }
  })(this);

  voucher = signal('');
  client = signal('');
  promoterIds = signal<string[] | null>(null);
  /** Valor inicial antes de qualquer cache ser restaurado - ver applyDefaultAdvancedFilters. */
  status = signal<StatusVoucher[] | null>(defaultVisibleStatusVoucher());
  visitDate = signal<string | string[] | null>(null);
  periodVisitDate = signal<PeriodEnum | null>(null);

  upsertVisible = signal(false);
  editingVoucher = signal<VoucherModel | null>(null);

  cancelVisible = signal(false);
  cancelingVoucher = signal<VoucherModel | null>(null);

  readonly canCreate = computed(() => this.secPolicy.canCreate());
  readonly vouchers = computed<VoucherModel[]>(() => this.facade.vouchers());
  readonly totalRecords = computed(() => this.facade.totalRecords());

  readonly promoterOptions = computed(() => this.agentOptions.optionsFor(TypeAgent.PROMOTER)());

  readonly statusOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allStatusVoucher().map((value) => ({ label: statusVoucherLabel(value, this.i18n), value }));
  });

  readonly periodEnumOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allPeriodEnum().map((value) => ({ label: periodEnumLabel(value, this.i18n), value }));
  });

  protected override readonly advancedActiveFilters = computed<ActiveFilterItem[]>(() => {
    const items: ActiveFilterItem[] = [];

    const voucher = this.voucher().trim();
    const client = this.client().trim();
    const promoters = this.promoterIds();
    const statuses = this.status();

    if (voucher) items.push({ label: this.i18n.tUi('voucher.fields.voucher'), value: voucher });
    if (client) items.push({ label: this.i18n.tUi('voucher.fields.client'), value: client });

    if (promoters?.length) {
      const names = this.promoterOptions()
        .filter((o) => promoters.includes(o.id))
        .map((o) => o.name)
        .join(', ');
      items.push({ label: this.i18n.tUi('voucher.fields.promoter'), value: names || String(promoters.length) });
    }

    if (statuses?.length) {
      items.push({
        label: this.i18n.tUi('voucher.fields.status'),
        value: statuses.map((v) => statusVoucherLabel(v, this.i18n)).join(', '),
      });
    }

    const visitDateLabel = this.formatActiveFilterPeriodDateValue(this.periodVisitDate(), this.visitDate(), this.i18n);
    if (visitDateLabel) {
      items.push({ label: this.i18n.tUi('voucher.fields.visitDate'), value: visitDateLabel });
    }

    return items;
  });

  ngOnInit() {
    this.initStatefulList();
  }

  clear() {
    this.clearTableAndReload(this.dt);
  }

  onSaved(): void {
    this.refresh();
  }

  statusLabel(status: StatusVoucher | null) {
    return statusVoucherLabel(status, this.i18n);
  }

  statusSeverity(status: StatusVoucher | null) {
    return statusVoucherSeverity(status);
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat(this.i18n.getLocale(), {
      style: 'currency',
      currency: this.i18n.getCurrency(),
    }).format(amount);
  }

  goNew() {
    if (!this.secPolicy.canCreate()) return;
    this.editingVoucher.set(null);
    this.upsertVisible.set(true);
  }

  edit(row: VoucherModel) {
    if (!this.secPolicy.canEdit(row)) return;
    this.editingVoucher.set(row);
    this.upsertVisible.set(true);
  }

  confirmDelete(row: VoucherModel) {
    if (!this.secPolicy.canDelete(row)) return;
    this.bulk.confirmDelete(row);
  }

  confirmConfirm(row: VoucherModel) {
    if (!this.secPolicy.canConfirm(row)) return;
    this.bulk.confirmConfirm(row);
  }

  confirmNotConfirm(row: VoucherModel) {
    if (!this.secPolicy.canNotConfirm(row)) return;
    this.bulk.confirmNotConfirm(row);
  }

  confirmChange(row: VoucherModel) {
    if (!this.secPolicy.canChangeStatus(row)) return;
    this.bulk.confirmChange(row);
  }

  openCancel(row: VoucherModel) {
    if (!this.secPolicy.canCancel(row)) return;
    this.cancelingVoucher.set(row);
    this.cancelVisible.set(true);
  }

  confirmSendEmail(row: VoucherModel) {
    if (!this.secPolicy.canSendEmail(row)) return;
    this.bulk.confirmSendEmail(row);
  }

  viewPdf(row: VoucherModel) {
    window.open(this.facade.viewPdfUrl(row.id), '_blank');
  }

  onUpsertVisibleChange(v: boolean) {
    this.upsertVisible.set(v);
    if (!v) {
      this.editingVoucher.set(null);
    }
  }

  onCancelVisibleChange(v: boolean) {
    this.cancelVisible.set(v);
    if (!v) {
      this.cancelingVoucher.set(null);
    }
  }

  onCanceled(): void {
    this.refresh();
  }

  protected override tableStateKey(): string {
    return STATE_KEY.NIMBUSNOVAX.VOUCHER.TABLE.STATE.V1;
  }

  protected override tableRowsKey(): string {
    return STATE_KEY.NIMBUSNOVAX.VOUCHER.TABLE.ROWS.V1;
  }

  protected override filtersKey(): string {
    return STATE_KEY.NIMBUSNOVAX.VOUCHER.FILTERS.V1;
  }

  protected override refresh(): void {
    this.reloadWithCurrentState();
  }

  protected override loadFirstPage(): void {}

  protected override resetFilters(): void {
    this.voucher.set('');
    this.client.set('');
    this.promoterIds.set(null);
    this.status.set(null);
    this.visitDate.set(null);
    this.periodVisitDate.set(null);
    this.applyDefaultAdvancedFiltersIfEmpty();
  }

  /** Vem pré-selecionado com Negociando/Vencido/Confirmado - mesmo critério que o backend já
   *  aplicava implicitamente quando a busca não informava nenhum status (ver
   *  VoucherService.HIDDEN_BY_DEFAULT). O gate que decide SE isso deve ser aplicado (painel
   *  inteiro vazio, não campo a campo) vive na classe base — ver applyDefaultAdvancedFiltersIfEmpty
   *  em StatefulListPage. */
  protected override applyDefaultAdvancedFilters(): void {
    this.status.set(defaultVisibleStatusVoucher());
  }

  protected override toFiltersState(): VouchersFiltersState {
    return {
      voucher: this.voucher(),
      client: this.client(),
      promoterIds: this.promoterIds()?.length ? this.promoterIds() : null,
      status: this.status()?.length ? this.status() : null,
      visitDate: this.visitDate(),
      periodVisitDate: this.periodVisitDate(),
    };
  }

  protected override applyFiltersState(s: VouchersFiltersState): void {
    this.voucher.set(s.voucher ?? '');
    this.client.set(s.client ?? '');
    this.promoterIds.set(s.promoterIds ?? null);
    this.status.set(s.status ?? null);
    this.visitDate.set(s.visitDate ?? null);
    this.periodVisitDate.set(s.periodVisitDate ?? null);

    this.applyDefaultAdvancedFiltersIfEmpty();
  }

  protected override buildAdvancedFilters(): Partial<VouchersAdvancedFilters> {
    return {
      voucher: this.voucher().trim() || undefined,
      client: this.client().trim() || undefined,
      promoterIds: this.promoterIds()?.length ? this.promoterIds()! : undefined,
      status: this.status()?.length ? this.status() : undefined,
      visitDate: this.visitDate() ?? undefined,
      periodVisitDate: this.periodVisitDate() ?? undefined,
    };
  }

  protected override mapTableFiltersToActiveItems(filters: any): ActiveFilterItem[] {
    this.i18n.getAppliedLang();

    const items: ActiveFilterItem[] = [];

    const voucher = readSingleFilterValue(filters, 'voucher');
    if (voucher) items.push({ label: this.i18n.tUi('voucher.fields.voucher'), value: voucher });

    const statuses = readArrayFilterValues(filters, 'status');
    if (statuses.length) {
      items.push({
        label: this.i18n.tUi('voucher.fields.status'),
        value: statuses.map((value) => statusVoucherLabel(value as StatusVoucher, this.i18n)).join(', '),
      });
    }

    return items;
  }

  protected override loadPage(query: ReturnType<typeof buildListQuery<VouchersAdvancedFilters>>): void {
    this.facade.loadPage(query);
  }
}
