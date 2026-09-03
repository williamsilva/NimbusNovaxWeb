import { FormsModule } from '@angular/forms';
import { Component, ViewChild, computed, inject, signal } from '@angular/core';

import { Table } from 'primeng/table';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { TranslateModule } from '@ngx-translate/core';
import { MultiSelectModule } from 'primeng/multiselect';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

import { I18nService } from '@core/i18n/i18n.service';
import { CsDatePipe } from '@shared/pipes/cs-date.pipe';
import { STATE_KEY } from '@features/state-key.constants';
import { CsDocumentPipe } from '@shared/pipes/cs-document.pipe';
import { AgentesFacade } from '@features/facade/agentes.facade';
import { StatefulListPage } from '@williamsilva/nimbus-web-commons';
import { BulkActionListPage } from '@features/list-base/bulk-action-list-page';
import { buildListQuery } from '@williamsilva/nimbus-web-commons';
import { CpfCnpjMaskDirective } from '@shared/directives/cpf-cnpj-mask.directive';
import { PageHeaderComponent } from '@shared/features/page-header/page-header.component';
import { AgentsAdvancedFilters } from '@features/filter/agentes.filters';
import { AgentModel, AgentsFiltersState } from '@models/agentes.models';
import { AgentesPermissionPolicy } from '@features/administracao/policy/agentes-permission.policy';
import { AgentesCreateDialogComponent } from '@features/administracao/agentes/agentes-create/agentes-create-dialog.component';
import { PeriodEnum, allPeriodEnum, periodEnumLabel } from '@models/enums/period.enum';
import { CsAdvancedPeriodDateFilterComponent } from '@williamsilva/nimbus-web-commons';
import { TypePerson, allTypePersons, typePersonLabel } from '@models/enums/type-person.enum';
import {
  ActiveFilterItem,
  FiltersPanelComponent,
} from '@williamsilva/nimbus-web-commons';
import { readSingleFilterValue } from '@williamsilva/nimbus-web-commons';

@Component({
  standalone: true,
  selector: 'app-agentes-list',
  templateUrl: './agentes-list.component.html',
  styleUrl: './agentes-list.component.scss',
  imports: [
    FloatLabel,
    CsDatePipe,
    FormsModule,
    TableModule,
    ButtonModule,
    TooltipModule,
    CsDocumentPipe,
    InputTextModule,
    TranslateModule,
    MultiSelectModule,
    PageHeaderComponent,
    ConfirmDialogModule,
    FiltersPanelComponent,
    CpfCnpjMaskDirective,
    AgentesCreateDialogComponent,
    CsAdvancedPeriodDateFilterComponent,
  ],
})
export class AgentesListComponent extends StatefulListPage<AgentsFiltersState, AgentsAdvancedFilters> {
  @ViewChild('dt') private dt?: Table;

  protected override readonly i18n = inject(I18nService);
  readonly facade = inject(AgentesFacade);
  protected readonly toast = inject(MessageService);
  protected readonly confirm = inject(ConfirmationService);
  protected readonly secPolicy = inject(AgentesPermissionPolicy);

  override rows =
    Number(localStorage.getItem(this.tableRowsKey())) || StatefulListPage.DEFAULT_ROWS;

  private readonly bulk = new (class extends BulkActionListPage {
    protected override readonly i18n = inject(I18nService);
    protected override readonly toast = inject(MessageService);
    protected override readonly confirm = inject(ConfirmationService);
    constructor(private readonly host: AgentesListComponent) {
      super();
    }
    protected override clearSelection(): void {}

    confirmDelete(row: AgentModel): void {
      this.confirmAction({
        header: this.i18n.tUi('agentes.delete.header'),
        message: this.i18n.tUi('agentes.delete.message', { name: row.name }),
        icon: 'pi pi-exclamation-triangle',
        accept: () =>
          this.executeAction(this.host.facade.delete(row.id), this.i18n.tUi('agentes.delete.success')),
      });
    }
  })(this);

  code = signal('');
  name = signal('');
  document = signal('');
  typePerson = signal<TypePerson[] | null>(null);
  createdAt = signal<string | string[] | null>(null);
  periodCreatedAt = signal<PeriodEnum | null>(null);

  upsertVisible = signal(false);
  agent = signal<AgentModel | null>(null);

  readonly canCreate = computed(() => this.secPolicy.canCreate());
  readonly agents = computed<AgentModel[]>(() => this.facade.agents());
  readonly totalRecords = computed(() => this.facade.totalRecords());

  readonly typePersonOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allTypePersons().map((value) => ({ label: typePersonLabel(value, this.i18n), value }));
  });

  readonly periodEnumOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allPeriodEnum().map((value) => ({ label: periodEnumLabel(value, this.i18n), value }));
  });

  protected override readonly advancedActiveFilters = computed<ActiveFilterItem[]>(() => {
    const items: ActiveFilterItem[] = [];

    const code = this.code().trim();
    const name = this.name().trim();
    const document = this.document().trim();
    const typePersonValues = this.typePerson();

    if (code) items.push({ label: this.i18n.tUi('agentes.fields.code'), value: code });
    if (name) items.push({ label: this.i18n.tUi('agentes.fields.name'), value: name });
    if (document) items.push({ label: this.i18n.tUi('agentes.fields.document'), value: document });

    if (typePersonValues?.length) {
      items.push({
        label: this.i18n.tUi('agentes.fields.typePerson'),
        value: typePersonValues.map((v) => typePersonLabel(v, this.i18n)).join(', '),
      });
    }

    const createdAtLabel = this.formatActiveFilterPeriodDateValue(
      this.periodCreatedAt(),
      this.createdAt(),
      this.i18n,
    );
    if (createdAtLabel) {
      items.push({ label: this.i18n.tUi('agentes.fields.createdAt'), value: createdAtLabel });
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

  typePersonLabel(value: TypePerson | null) {
    return typePersonLabel(value, this.i18n);
  }

  goNew() {
    if (!this.secPolicy.canCreate()) return;
    this.agent.set(null);
    this.upsertVisible.set(true);
  }

  edit(row: AgentModel) {
    if (!this.secPolicy.canEdit()) return;
    this.agent.set(row);
    this.upsertVisible.set(true);
  }

  confirmDelete(row: AgentModel) {
    if (!this.secPolicy.canDelete()) return;
    this.bulk.confirmDelete(row);
  }

  onUpsertVisibleChange(v: boolean) {
    this.upsertVisible.set(v);
    if (!v) {
      this.agent.set(null);
    }
  }

  protected override tableStateKey(): string {
    return STATE_KEY.NIMBUSNOVAX.ADMINISTRACAO.AGENTES.TABLE.STATE.V1;
  }

  protected override tableRowsKey(): string {
    return STATE_KEY.NIMBUSNOVAX.ADMINISTRACAO.AGENTES.TABLE.ROWS.V1;
  }

  protected override filtersKey(): string {
    return STATE_KEY.NIMBUSNOVAX.ADMINISTRACAO.AGENTES.FILTERS.V1;
  }

  protected override refresh(): void {
    this.reloadWithCurrentState();
  }

  protected override loadFirstPage(): void {}

  protected override resetFilters(): void {
    this.code.set('');
    this.name.set('');
    this.document.set('');
    this.typePerson.set(null);
    this.createdAt.set(null);
    this.periodCreatedAt.set(null);
  }

  protected override toFiltersState(): AgentsFiltersState {
    return {
      code: this.code(),
      name: this.name(),
      document: this.document(),
      typePerson: this.typePerson()?.length ? this.typePerson() : null,
      createdAt: this.createdAt(),
      periodCreatedAt: this.periodCreatedAt(),
    };
  }

  protected override applyFiltersState(s: AgentsFiltersState): void {
    this.code.set(s.code ?? '');
    this.name.set(s.name ?? '');
    this.document.set(s.document ?? '');
    this.typePerson.set(s.typePerson ?? null);
    this.createdAt.set(s.createdAt ?? null);
    this.periodCreatedAt.set(s.periodCreatedAt ?? null);
  }

  protected override buildAdvancedFilters(): Partial<AgentsAdvancedFilters> {
    return {
      code: this.code().trim() || undefined,
      name: this.name().trim() || undefined,
      document: this.document().trim() || undefined,
      typePerson: this.typePerson()?.length ? this.typePerson() : undefined,
      createdAt: this.createdAt() ?? undefined,
      periodCreatedAt: this.periodCreatedAt() ?? undefined,
    };
  }

  protected override mapTableFiltersToActiveItems(filters: any): ActiveFilterItem[] {
    this.i18n.getAppliedLang();

    const items: ActiveFilterItem[] = [];

    const code = readSingleFilterValue(filters, 'code');
    if (code) items.push({ label: this.i18n.tUi('agentes.fields.code'), value: code });

    const name = readSingleFilterValue(filters, 'name');
    if (name) items.push({ label: this.i18n.tUi('agentes.fields.name'), value: name });

    const document = readSingleFilterValue(filters, 'document');
    if (document) items.push({ label: this.i18n.tUi('agentes.fields.document'), value: document });

    return items;
  }

  protected override loadPage(query: ReturnType<typeof buildListQuery<AgentsAdvancedFilters>>): void {
    this.facade.loadPage(query);
  }
}
