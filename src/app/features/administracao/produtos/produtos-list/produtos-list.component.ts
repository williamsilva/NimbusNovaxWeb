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
import { StatefulListPage } from '@williamsilva/nimbus-web-commons';
import { BulkActionListPage } from '@features/list-base/bulk-action-list-page';
import { buildListQuery } from '@williamsilva/nimbus-web-commons';
import { PageHeaderComponent } from '@shared/features/page-header/page-header.component';
import { ProductsFacade } from '@features/facade/produtos.facade';
import { ProductsAdvancedFilters } from '@features/filter/produtos.filters';
import { ProductModel, ProductsFiltersState } from '@models/produtos.models';
import { ProdutosPermissionPolicy } from '@features/administracao/policy/produtos-permission.policy';
import { ProdutosCreateDialogComponent } from '@features/administracao/produtos/produtos-create/produtos-create-dialog.component';
import { PeriodEnum, allPeriodEnum, periodEnumLabel } from '@models/enums/period.enum';
import { CsAdvancedPeriodDateFilterComponent } from '@williamsilva/nimbus-web-commons';
import {
  RecordStatus,
  allRecordStatuses,
  recordStatusLabel,
  recordStatusSeverity,
} from '@models/enums/record-status.enum';
import {
  TypeProduct,
  allTypeProducts,
  typeProductLabel,
  typeProductSeverity,
} from '@models/enums/type-product.enum';
import {
  ActiveFilterItem,
  FiltersPanelComponent,
} from '@williamsilva/nimbus-web-commons';
import { readSingleFilterValue, readArrayFilterValues } from '@williamsilva/nimbus-web-commons';

@Component({
  standalone: true,
  selector: 'app-produtos-list',
  templateUrl: './produtos-list.component.html',
  styleUrl: './produtos-list.component.scss',
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
    ProdutosCreateDialogComponent,
    CsAdvancedPeriodDateFilterComponent,
  ],
})
export class ProdutosListComponent extends StatefulListPage<ProductsFiltersState, ProductsAdvancedFilters> {
  @ViewChild('dt') private dt?: Table;

  protected override readonly i18n = inject(I18nService);
  readonly facade = inject(ProductsFacade);
  protected readonly toast = inject(MessageService);
  protected readonly confirm = inject(ConfirmationService);
  protected readonly secPolicy = inject(ProdutosPermissionPolicy);

  override rows =
    Number(localStorage.getItem(this.tableRowsKey())) || StatefulListPage.DEFAULT_ROWS;

  private readonly bulk = new (class extends BulkActionListPage {
    protected override readonly i18n = inject(I18nService);
    protected override readonly toast = inject(MessageService);
    protected override readonly confirm = inject(ConfirmationService);
    constructor(private readonly host: ProdutosListComponent) {
      super();
    }
    protected override clearSelection(): void {}

    confirmDelete(row: ProductModel): void {
      this.confirmAction({
        header: this.i18n.tUi('produtos.delete.header'),
        message: this.i18n.tUi('produtos.delete.message', { name: row.name }),
        icon: 'pi pi-exclamation-triangle',
        accept: () =>
          this.executeAction(this.host.facade.delete(row.id), this.i18n.tUi('produtos.delete.success')),
      });
    }

    confirmActivate(row: ProductModel): void {
      this.confirmAction({
        header: this.i18n.tUi('produtos.activate.header'),
        message: this.i18n.tUi('produtos.activate.message', { name: row.name }),
        icon: 'pi pi-check-circle',
        accept: () =>
          this.executeAction(this.host.facade.activate(row.id), this.i18n.tUi('produtos.activate.success')),
      });
    }

    confirmDeactivate(row: ProductModel): void {
      this.confirmAction({
        header: this.i18n.tUi('produtos.deactivate.header'),
        message: this.i18n.tUi('produtos.deactivate.message', { name: row.name }),
        icon: 'pi pi-exclamation-triangle',
        accept: () =>
          this.executeAction(
            this.host.facade.deactivate(row.id),
            this.i18n.tUi('produtos.deactivate.success'),
          ),
      });
    }
  })(this);

  name = signal('');
  typeProduct = signal<TypeProduct[] | null>(null);
  status = signal<RecordStatus[] | null>(null);
  createdAt = signal<string | string[] | null>(null);
  periodCreatedAt = signal<PeriodEnum | null>(null);

  upsertVisible = signal(false);
  product = signal<ProductModel | null>(null);

  readonly canCreate = computed(() => this.secPolicy.canCreate());
  readonly products = computed<ProductModel[]>(() => this.facade.products());
  readonly totalRecords = computed(() => this.facade.totalRecords());

  readonly typeProductPanelOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allTypeProducts().map((value) => ({ label: typeProductLabel(value, this.i18n), value }));
  });

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
    const types = this.typeProduct();
    const statuses = this.status();

    if (name) items.push({ label: this.i18n.tUi('produtos.fields.name'), value: name });

    if (types?.length) {
      items.push({
        label: this.i18n.tUi('produtos.fields.typeProduct'),
        value: types.map((v) => typeProductLabel(v, this.i18n)).join(', '),
      });
    }

    if (statuses?.length) {
      items.push({
        label: this.i18n.tUi('produtos.fields.status'),
        value: statuses.map((v) => recordStatusLabel(v, this.i18n)).join(', '),
      });
    }

    const createdAtLabel = this.formatActiveFilterPeriodDateValue(
      this.periodCreatedAt(),
      this.createdAt(),
      this.i18n,
    );
    if (createdAtLabel) {
      items.push({ label: this.i18n.tUi('produtos.fields.createdAt'), value: createdAtLabel });
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

  isTypeActive(type: TypeProduct): boolean {
    return !!this.typeProduct()?.includes(type);
  }

  toggleTypePanel(type: TypeProduct): void {
    const current = this.typeProduct() ?? [];
    const next = current.includes(type) ? current.filter((t) => t !== type) : [...current, type];
    this.typeProduct.set(next.length ? next : null);
    this.search();
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat(this.i18n.getLocale(), {
      style: 'currency',
      currency: this.i18n.getCurrency(),
    }).format(amount);
  }

  typeLabel(value: TypeProduct | null) {
    return typeProductLabel(value, this.i18n);
  }

  typeSeverity(value: TypeProduct | null) {
    return typeProductSeverity(value);
  }

  statusLabel(status: RecordStatus | null) {
    return recordStatusLabel(status, this.i18n);
  }

  statusSeverity(status: RecordStatus | null) {
    return recordStatusSeverity(status);
  }

  goNew() {
    if (!this.secPolicy.canCreate()) return;
    this.product.set(null);
    this.upsertVisible.set(true);
  }

  edit(row: ProductModel) {
    if (!this.secPolicy.canEdit(row)) return;
    this.product.set(row);
    this.upsertVisible.set(true);
  }

  confirmDelete(row: ProductModel) {
    if (!this.secPolicy.canDelete(row)) return;
    this.bulk.confirmDelete(row);
  }

  confirmActivate(row: ProductModel) {
    if (!this.secPolicy.canActivate(row)) return;
    this.bulk.confirmActivate(row);
  }

  confirmDeactivate(row: ProductModel) {
    if (!this.secPolicy.canDeactivate(row)) return;
    this.bulk.confirmDeactivate(row);
  }

  onUpsertVisibleChange(v: boolean) {
    this.upsertVisible.set(v);
    if (!v) {
      this.product.set(null);
    }
  }

  protected override tableStateKey(): string {
    return STATE_KEY.NIMBUSNOVAX.ADMINISTRACAO.PRODUTOS.TABLE.STATE.V1;
  }

  protected override tableRowsKey(): string {
    return STATE_KEY.NIMBUSNOVAX.ADMINISTRACAO.PRODUTOS.TABLE.ROWS.V1;
  }

  protected override filtersKey(): string {
    return STATE_KEY.NIMBUSNOVAX.ADMINISTRACAO.PRODUTOS.FILTERS.V1;
  }

  protected override refresh(): void {
    this.reloadWithCurrentState();
  }

  protected override loadFirstPage(): void {}

  protected override resetFilters(): void {
    this.name.set('');
    this.typeProduct.set(null);
    this.status.set(null);
    this.createdAt.set(null);
    this.periodCreatedAt.set(null);
  }

  protected override toFiltersState(): ProductsFiltersState {
    return {
      name: this.name(),
      typeProduct: this.typeProduct()?.length ? this.typeProduct() : null,
      status: this.status()?.length ? this.status() : null,
      createdAt: this.createdAt(),
      periodCreatedAt: this.periodCreatedAt(),
    };
  }

  protected override applyFiltersState(s: ProductsFiltersState): void {
    this.name.set(s.name ?? '');
    this.typeProduct.set(s.typeProduct ?? null);
    this.status.set(s.status ?? null);
    this.createdAt.set(s.createdAt ?? null);
    this.periodCreatedAt.set(s.periodCreatedAt ?? null);
  }

  protected override buildAdvancedFilters(): Partial<ProductsAdvancedFilters> {
    return {
      name: this.name().trim() || undefined,
      typeProduct: this.typeProduct()?.length ? this.typeProduct() : undefined,
      status: this.status()?.length ? this.status() : undefined,
      createdAt: this.createdAt() ?? undefined,
      periodCreatedAt: this.periodCreatedAt() ?? undefined,
    };
  }

  protected override mapTableFiltersToActiveItems(filters: any): ActiveFilterItem[] {
    this.i18n.getAppliedLang();

    const items: ActiveFilterItem[] = [];

    const name = readSingleFilterValue(filters, 'name');
    if (name) items.push({ label: this.i18n.tUi('produtos.fields.name'), value: name });

    const statuses = readArrayFilterValues(filters, 'status');
    if (statuses.length) {
      items.push({
        label: this.i18n.tUi('produtos.fields.status'),
        value: statuses.map((value) => recordStatusLabel(value as RecordStatus, this.i18n)).join(', '),
      });
    }

    return items;
  }

  protected override loadPage(query: ReturnType<typeof buildListQuery<ProductsAdvancedFilters>>): void {
    this.facade.loadPage(query);
  }
}
