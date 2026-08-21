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
import { CancellationReasonsFacade } from '@features/facade/motivo-cancelamento.facade';
import { CancellationReasonsAdvancedFilters } from '@features/filter/motivo-cancelamento.filters';
import {
  CancellationReasonModel,
  CancellationReasonsFiltersState,
} from '@models/motivo-cancelamento.models';
import { MotivoCancelamentoPermissionPolicy } from '@features/administracao/policy/motivo-cancelamento-permission.policy';
import { MotivoCancelamentoCreateDialogComponent } from '@features/administracao/motivo-cancelamento/motivo-cancelamento-create/motivo-cancelamento-create-dialog.component';
import { PeriodEnum, allPeriodEnum, periodEnumLabel } from '@models/enums/period.enum';
import { CsAdvancedPeriodDateFilterComponent } from '@features/list-base/cs-advanced-period-date-filter.component';
import {
  RecordStatus,
  allRecordStatuses,
  recordStatusLabel,
  recordStatusSeverity,
} from '@models/enums/record-status.enum';
import { generationLabel, generationSeverity, isSystemGenerated } from '@models/enums/generation.enum';
import {
  ActiveFilterItem,
  FiltersPanelComponent,
} from '@shared/features/filters-panel/filters-panel.component';
import { readSingleFilterValue, readArrayFilterValues } from '@features/list-base/table-filter-readers';

@Component({
  standalone: true,
  selector: 'app-motivo-cancelamento-list',
  templateUrl: './motivo-cancelamento-list.component.html',
  styleUrl: './motivo-cancelamento-list.component.scss',
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
    MotivoCancelamentoCreateDialogComponent,
    CsAdvancedPeriodDateFilterComponent,
  ],
})
export class MotivoCancelamentoListComponent extends StatefulListPage<
  CancellationReasonsFiltersState,
  CancellationReasonsAdvancedFilters
> {
  @ViewChild('dt') private dt?: Table;

  protected override readonly i18n = inject(I18nService);
  readonly facade = inject(CancellationReasonsFacade);
  protected readonly toast = inject(MessageService);
  protected readonly confirm = inject(ConfirmationService);
  protected readonly secPolicy = inject(MotivoCancelamentoPermissionPolicy);

  override rows =
    Number(localStorage.getItem(this.tableRowsKey())) || StatefulListPage.DEFAULT_ROWS;

  private readonly bulk = new (class extends BulkActionListPage {
    protected override readonly i18n = inject(I18nService);
    protected override readonly toast = inject(MessageService);
    protected override readonly confirm = inject(ConfirmationService);
    constructor(private readonly host: MotivoCancelamentoListComponent) {
      super();
    }
    protected override clearSelection(): void {}

    confirmDelete(row: CancellationReasonModel): void {
      this.confirmAction({
        header: this.i18n.tUi('motivoCancelamento.delete.header'),
        message: this.i18n.tUi('motivoCancelamento.delete.message', { name: row.name }),
        icon: 'pi pi-exclamation-triangle',
        accept: () =>
          this.executeAction(
            this.host.facade.delete(row.id),
            this.i18n.tUi('motivoCancelamento.delete.success'),
          ),
      });
    }
  })(this);

  name = signal('');
  description = signal('');
  status = signal<RecordStatus[] | null>(null);
  createdAt = signal<string | string[] | null>(null);
  periodCreatedAt = signal<PeriodEnum | null>(null);

  upsertVisible = signal(false);
  reason = signal<CancellationReasonModel | null>(null);

  readonly canCreate = computed(() => this.secPolicy.canCreate());
  readonly reasons = computed<CancellationReasonModel[]>(() => this.facade.reasons());
  readonly totalRecords = computed(() => this.facade.totalRecords());

  readonly statusOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allRecordStatuses().map((value) => ({ label: recordStatusLabel(value, this.i18n), value }));
  });

  readonly periodEnumOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allPeriodEnum().map((value) => ({ label: periodEnumLabel(value, this.i18n), value }));
  });

  protected override readonly advancedActiveFilters = computed<ActiveFilterItem[]>(() => {
    const items: ActiveFilterItem[] = [];

    const name = this.name().trim();
    const description = this.description().trim();
    const statuses = this.status();

    if (name) items.push({ label: this.i18n.tUi('motivoCancelamento.fields.name'), value: name });
    if (description) {
      items.push({ label: this.i18n.tUi('motivoCancelamento.fields.description'), value: description });
    }

    if (statuses?.length) {
      const labels = statuses.map((v) => recordStatusLabel(v, this.i18n)).join(', ');
      items.push({ label: this.i18n.tUi('motivoCancelamento.fields.status'), value: labels });
    }

    const createdAtLabel = this.formatActiveFilterPeriodDateValue(
      this.periodCreatedAt(),
      this.createdAt(),
      this.i18n,
    );
    if (createdAtLabel) {
      items.push({ label: this.i18n.tUi('motivoCancelamento.fields.createdAt'), value: createdAtLabel });
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

  statusLabel(status: RecordStatus | null) {
    return recordStatusLabel(status, this.i18n);
  }

  statusSeverity(status: RecordStatus | null) {
    return recordStatusSeverity(status);
  }

  generationLabel(value: string | null) {
    return generationLabel(value, this.i18n);
  }

  generationSeverity(value: string | null) {
    return generationSeverity(value);
  }

  isSystem(row: CancellationReasonModel): boolean {
    return isSystemGenerated(row.generation);
  }

  goNew() {
    if (!this.secPolicy.canCreate()) return;
    this.reason.set(null);
    this.upsertVisible.set(true);
  }

  edit(row: CancellationReasonModel) {
    if (!this.secPolicy.canEdit(row)) return;
    this.reason.set(row);
    this.upsertVisible.set(true);
  }

  confirmDelete(row: CancellationReasonModel) {
    if (!this.secPolicy.canDelete(row)) return;
    this.bulk.confirmDelete(row);
  }

  onUpsertVisibleChange(v: boolean) {
    this.upsertVisible.set(v);
    if (!v) {
      this.reason.set(null);
    }
  }

  protected override tableStateKey(): string {
    return STATE_KEY.NIMBUSNOVAX.ADMINISTRACAO.MOTIVO_CANCELAMENTO.TABLE.STATE.V1;
  }

  protected override tableRowsKey(): string {
    return STATE_KEY.NIMBUSNOVAX.ADMINISTRACAO.MOTIVO_CANCELAMENTO.TABLE.ROWS.V1;
  }

  protected override filtersKey(): string {
    return STATE_KEY.NIMBUSNOVAX.ADMINISTRACAO.MOTIVO_CANCELAMENTO.FILTERS.V1;
  }

  protected override refresh(): void {
    this.reloadWithCurrentState();
  }

  protected override loadFirstPage(): void {}

  protected override resetFilters(): void {
    this.name.set('');
    this.description.set('');
    this.status.set(null);
    this.createdAt.set(null);
    this.periodCreatedAt.set(null);
  }

  protected override toFiltersState(): CancellationReasonsFiltersState {
    return {
      name: this.name(),
      description: this.description(),
      status: this.status()?.length ? this.status() : null,
      createdAt: this.createdAt(),
      periodCreatedAt: this.periodCreatedAt(),
    };
  }

  protected override applyFiltersState(s: CancellationReasonsFiltersState): void {
    this.name.set(s.name ?? '');
    this.description.set(s.description ?? '');
    this.status.set(s.status ?? null);
    this.createdAt.set(s.createdAt ?? null);
    this.periodCreatedAt.set(s.periodCreatedAt ?? null);
  }

  protected override buildAdvancedFilters(): Partial<CancellationReasonsAdvancedFilters> {
    return {
      name: this.name().trim() || undefined,
      description: this.description().trim() || undefined,
      status: this.status()?.length ? this.status() : undefined,
      createdAt: this.createdAt() ?? undefined,
      periodCreatedAt: this.periodCreatedAt() ?? undefined,
    };
  }

  protected override mapTableFiltersToActiveItems(filters: any): ActiveFilterItem[] {
    this.i18n.getAppliedLang();

    const items: ActiveFilterItem[] = [];

    const name = readSingleFilterValue(filters, 'name');
    if (name) items.push({ label: this.i18n.tUi('motivoCancelamento.fields.name'), value: name });

    const description = readSingleFilterValue(filters, 'description');
    if (description) {
      items.push({ label: this.i18n.tUi('motivoCancelamento.fields.description'), value: description });
    }

    const statuses = readArrayFilterValues(filters, 'status');
    if (statuses.length) {
      items.push({
        label: this.i18n.tUi('motivoCancelamento.fields.status'),
        value: statuses.map((value) => recordStatusLabel(value as RecordStatus, this.i18n)).join(', '),
      });
    }

    return items;
  }

  protected override loadPage(
    query: ReturnType<typeof buildListQuery<CancellationReasonsAdvancedFilters>>,
  ): void {
    this.facade.loadPage(query);
  }
}
