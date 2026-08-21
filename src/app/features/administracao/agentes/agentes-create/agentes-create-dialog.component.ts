import { computed, untracked, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { input, signal, Output, inject, Component, EventEmitter, effect } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { TabsModule } from 'primeng/tabs';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { DatePickerModule } from 'primeng/datepicker';
import { TranslateModule } from '@ngx-translate/core';

import { I18nService } from '@core/i18n/i18n.service';
import { GeoFacade } from '@features/facade/geo.facade';
import { GeoApiService } from '@features/service/geo.api.service';
import { AgentesFacade } from '@features/facade/agentes.facade';
import { ErrorMsgComponent } from '@shared/error-msg/error-msg.component';
import { CepLookupService } from '@shared/services/cep-lookup.service';
import { onlyDigits, formatZipCode } from '@shared/utils/br-format';
import { PhoneMaskDirective } from '@shared/directives/phone-mask.directive';
import { CpfCnpjMaskDirective } from '@shared/directives/cpf-cnpj-mask.directive';
import { DateInputMaskDirective } from '@shared/directives/date-input-mask.directive';
import { AgentModel, AgentUpsertInput } from '@models/agentes.models';
import { Sex, allSexes, sexLabel } from '@models/enums/sex.enum';
import { TypeAgent, allTypeAgents, typeAgentLabel } from '@models/enums/type-agent.enum';
import { TypePerson, allTypePersons, typePersonLabel } from '@models/enums/type-person.enum';
import { CivilState, allCivilStates, civilStateLabel } from '@models/enums/civil-state.enum';
import { PartyStatus, allPartyStatuses, partyStatusLabel } from '@models/enums/party-status.enum';
import { AgentesPermissionPolicy } from '@features/administracao/policy/agentes-permission.policy';

@Component({
  standalone: true,
  selector: 'app-agentes-create-dialog',
  templateUrl: './agentes-create-dialog.component.html',
  styleUrl: './agentes-create-dialog.component.scss',
  imports: [
    ToastModule,
    TabsModule,
    FormsModule,
    SelectModule,
    DialogModule,
    ButtonModule,
    TooltipModule,
    CheckboxModule,
    TranslateModule,
    DatePickerModule,
    InputTextModule,
    FloatLabelModule,
    ErrorMsgComponent,
    ReactiveFormsModule,
    CpfCnpjMaskDirective,
    DateInputMaskDirective,
    PhoneMaskDirective,
  ],
})
export class AgentesCreateDialogComponent {
  visible = input.required<boolean>();
  agent = input<AgentModel | null>(null);

  @Output() saved = new EventEmitter<void>();
  @Output() visibleChange = new EventEmitter<boolean>();

  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  readonly i18n = inject(I18nService);
  readonly geo = inject(GeoFacade);
  readonly facade = inject(AgentesFacade);
  readonly secPolicy = inject(AgentesPermissionPolicy);

  private readonly geoApi = inject(GeoApiService);
  private readonly cepLookup = inject(CepLookupService);

  readonly TypeAgent = TypeAgent;

  readonly isEditMode = computed(() => !!this.agent());
  readonly canSubmit = computed(() => (this.isEditMode() ? this.secPolicy.canEdit() : this.secPolicy.canCreate()));

  readonly saving = signal(false);
  readonly states = this.geo.states;

  readonly typePersonOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allTypePersons().map((value) => ({ label: typePersonLabel(value, this.i18n), value }));
  });

  readonly civilStateOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allCivilStates().map((value) => ({ label: civilStateLabel(value, this.i18n), value }));
  });

  readonly partyStatusOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allPartyStatuses().map((value) => ({ label: partyStatusLabel(value, this.i18n), value }));
  });

  readonly roleOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allTypeAgents().map((value) => ({ label: typeAgentLabel(value, this.i18n), value }));
  });

  readonly sexOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allSexes().map((value) => ({ label: sexLabel(value, this.i18n), value }));
  });

  private lastLoadedId: string | null = null;

  readonly form: FormGroup = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    socialReason: ['', [Validators.maxLength(50)]],
    document: ['', [Validators.required]],
    rg: ['', [Validators.maxLength(20)]],
    sex: [null as string | null],
    typePerson: [null as TypePerson | null],
    civilState: [null as CivilState | null],
    birthDate: [null as Date | null],
    roles: [[] as TypeAgent[]],
    isManager: [false],
    isAttendant: [false],
    statusClient: [PartyStatus.ACTIVE as PartyStatus | null],
    statusProvider: [PartyStatus.ACTIVE as PartyStatus | null],
    statusPromoter: [PartyStatus.ACTIVE as PartyStatus | null],
    statusEmployee: [PartyStatus.ACTIVE as PartyStatus | null],
    statusTourGuide: [PartyStatus.ACTIVE as PartyStatus | null],
    addresses: this.fb.array([]),
    contacts: this.fb.array([]),
  });

  get addresses(): FormArray {
    return this.form.get('addresses') as FormArray;
  }

  get contacts(): FormArray {
    return this.form.get('contacts') as FormArray;
  }

  get addressGroups(): FormGroup[] {
    return this.addresses.controls as FormGroup[];
  }

  get contactGroups(): FormGroup[] {
    return this.contacts.controls as FormGroup[];
  }

  private addressStateOverride: (string | null)[] = [];

  constructor() {
    this.geo.loadStates();

    /**
     * `untracked()` em volta de tudo é essencial aqui: sem ele, qualquer signal lido durante o
     * processamento (ex.: `this.states()`, ou `_citiesByState`/`_citiesLoadingFor` do GeoFacade,
     * lidos indiretamente dentro de `loadCitiesForState`) vira dependência deste `effect` - e
     * como `loadCitiesForState` ESCREVE num desses signals de forma síncrona, o Angular relança
     * o effect toda vez que qualquer estado de cidades muda, disparando `resetFormForCreate()` de
     * novo (era exatamente isso que apagava os dados já digitados no modo de criação). O guard
     * por `lastLoadedId` é a segunda camada de proteção: mesmo que o effect seja notificado de
     * novo por qualquer outro motivo, só reresetamos o form quando o agente alvo realmente mudou.
     */
    effect(() => {
      const visible = this.visible();
      const agent = this.agent();

      untracked(() => {
        if (!visible) return;

        if (!agent) {
          if (this.lastLoadedId !== null) {
            this.lastLoadedId = null;
            this.resetFormForCreate();
          }
          return;
        }

        if (this.lastLoadedId === agent.id) return;

        this.lastLoadedId = agent.id;
        this.loadAgentIntoForm(agent);
      });
    });
  }

  private loadAgentIntoForm(agent: AgentModel): void {
    this.addresses.clear();
    this.contacts.clear();
    this.addressStateOverride = [];

    agent.addresses.forEach((address) => {
      this.addresses.push(this.buildAddressGroup(address));
      const state = this.states().find((s) => s.uf === address.stateUf);
      this.addressStateOverride.push(state?.id ?? null);
      if (state) {
        this.geo.loadCitiesForState(state.id);
      }
    });

    agent.contacts.forEach((contact) => this.contacts.push(this.buildContactGroup(contact)));

    this.form.reset({
      name: agent.name,
      socialReason: agent.socialReason ?? '',
      document: agent.document,
      rg: agent.rg ?? '',
      sex: agent.sex ?? null,
      typePerson: agent.typePerson,
      civilState: agent.civilState,
      birthDate: agent.birthDate ? new Date(agent.birthDate) : null,
      roles: agent.roles,
      isManager: agent.isManager,
      isAttendant: agent.isAttendant,
      statusClient: agent.statusClient ?? PartyStatus.ACTIVE,
      statusProvider: agent.statusProvider ?? PartyStatus.ACTIVE,
      statusPromoter: agent.statusPromoter ?? PartyStatus.ACTIVE,
      statusEmployee: agent.statusEmployee ?? PartyStatus.ACTIVE,
      statusTourGuide: agent.statusTourGuide ?? PartyStatus.ACTIVE,
      addresses: this.addresses.value,
      contacts: this.contacts.value,
    });
  }

  hasRole(role: TypeAgent): boolean {
    return !!(this.form.get('roles')?.value as TypeAgent[] | undefined)?.includes(role);
  }

  private buildAddressGroup(address?: Partial<{
    street: string | null;
    number: string | null;
    complement: string | null;
    burgh: string | null;
    postalCode: string | null;
    cityId: string | null;
  }>) {
    return this.fb.nonNullable.group({
      street: [address?.street ?? ''],
      number: [address?.number ?? ''],
      complement: [address?.complement ?? ''],
      burgh: [address?.burgh ?? ''],
      postalCode: [address?.postalCode ?? ''],
      cityId: [address?.cityId ?? (null as string | null)],
    });
  }

  private buildContactGroup(contact?: Partial<{
    name: string | null;
    cellphone: string | null;
    telephone: string | null;
    email: string | null;
  }>) {
    return this.fb.nonNullable.group({
      name: [contact?.name ?? ''],
      cellphone: [contact?.cellphone ?? ''],
      telephone: [contact?.telephone ?? ''],
      email: [contact?.email ?? '', [Validators.email]],
    });
  }

  addAddress(): void {
    this.addresses.push(this.buildAddressGroup());
    this.addressStateOverride.push(null);
  }

  removeAddress(index: number): void {
    this.addresses.removeAt(index);
    this.addressStateOverride.splice(index, 1);
  }

  addContact(): void {
    this.contacts.push(this.buildContactGroup());
  }

  removeContact(index: number): void {
    this.contacts.removeAt(index);
  }

  stateIdForAddress(index: number): string | null {
    return this.addressStateOverride[index] ?? null;
  }

  onAddressStateChange(index: number, stateId: string | null): void {
    this.addressStateOverride[index] = stateId;
    this.geo.loadCitiesForState(stateId);
    (this.addresses.at(index) as FormGroup).get('cityId')?.setValue(null);
  }

  citiesForAddress(index: number) {
    return this.geo.citiesFor(this.stateIdForAddress(index));
  }

  private readonly cepLoadingIndexes = signal<Set<number>>(new Set());

  isCepLoading(index: number): boolean {
    return this.cepLoadingIndexes().has(index);
  }

  /** Formata o CEP enquanto digita e, ao completar os 8 dígitos, já dispara a busca
   *  automaticamente - mesmo padrão do formulário de Fornecedores do NimbusFlow. */
  onZipCodeInput(index: number, value: string): void {
    const formatted = formatZipCode(value);
    (this.addresses.at(index) as FormGroup).get('postalCode')?.setValue(formatted);

    if (onlyDigits(formatted).length === 8) {
      this.searchZipCode(index);
    }
  }

  searchZipCode(index: number): void {
    const group = this.addresses.at(index) as FormGroup;
    const postalCode = group.get('postalCode')?.value;

    if (onlyDigits(postalCode).length !== 8 || this.isCepLoading(index)) {
      return;
    }

    this.setCepLoading(index, true);

    this.cepLookup
      .lookup(postalCode)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (address) => {
          this.setCepLoading(index, false);

          if (!address) {
            this.toast.add({
              severity: 'warn',
              summary: this.i18n.tUi('common.warning'),
              detail: this.i18n.tUi('agentes.cep.notFound'),
            });
            return;
          }

          group.patchValue({
            street: address.street ?? '',
            burgh: address.neighborhood ?? '',
          });

          this.resolveStateAndCityFromCep(index, address.city, address.state);
        },
        error: () => this.setCepLoading(index, false),
      });
  }

  private setCepLoading(index: number, loading: boolean): void {
    const next = new Set(this.cepLoadingIndexes());
    if (loading) {
      next.add(index);
    } else {
      next.delete(index);
    }
    this.cepLoadingIndexes.set(next);
  }

  private resolveStateAndCityFromCep(
    index: number,
    cityName: string | null,
    stateUf: string | null,
  ): void {
    if (!stateUf) return;

    const state = this.states().find((s) => s.uf.toUpperCase() === stateUf.toUpperCase());
    if (!state) return;

    this.onAddressStateChange(index, state.id);

    if (!cityName) return;

    this.geoApi.getCitiesByState(state.id).subscribe((cities) => {
      const match = cities.find((c) => this.normalizeCityName(c.name) === this.normalizeCityName(cityName));
      if (match) {
        (this.addresses.at(index) as FormGroup).get('cityId')?.setValue(match.id);
      }
    });
  }

  private normalizeCityName(value: string): string {
    const from = String.fromCharCode(0x0300);
    const to = String.fromCharCode(0x036f);
    const isDiacritic = (ch: string) => ch.charCodeAt(0) >= from.charCodeAt(0) && ch.charCodeAt(0) <= to.charCodeAt(0);
    return Array.from(value.normalize('NFD'))
      .filter((ch) => !isDiacritic(ch))
      .join('')
      .trim()
      .toLowerCase();
  }

  onHide(): void {
    this.close();
  }

  close(): void {
    this.saving.set(false);
    this.lastLoadedId = null;
    this.resetFormForCreate();
    this.visibleChange.emit(false);
  }

  private resetFormForCreate(): void {
    this.addresses.clear();
    this.contacts.clear();
    this.addressStateOverride = [];

    this.form.reset({
      name: '',
      socialReason: '',
      document: '',
      rg: '',
      sex: null,
      typePerson: null,
      civilState: null,
      birthDate: null,
      roles: [],
      isManager: false,
      isAttendant: false,
      statusClient: PartyStatus.ACTIVE,
      statusProvider: PartyStatus.ACTIVE,
      statusPromoter: PartyStatus.ACTIVE,
      statusEmployee: PartyStatus.ACTIVE,
      statusTourGuide: PartyStatus.ACTIVE,
      addresses: [],
      contacts: [],
    });
  }

  private toDateOnly(value: Date | null): string | null {
    if (!value) return null;
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, '0');
    const d = String(value.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  save(): void {
    this.form.markAllAsTouched();
    this.form.updateValueAndValidity();

    if (this.form.invalid) {
      return;
    }

    const v = this.form.getRawValue();
    const roles: TypeAgent[] = v.roles ?? [];

    const payload: AgentUpsertInput = {
      name: v.name.trim(),
      socialReason: v.socialReason?.trim() || null,
      document: v.document,
      rg: v.rg?.trim() || null,
      sex: v.sex || null,
      typePerson: v.typePerson,
      civilState: v.civilState,
      birthDate: this.toDateOnly(v.birthDate),
      isManager: roles.includes(TypeAgent.EMPLOYEE) ? !!v.isManager : false,
      isAttendant: roles.includes(TypeAgent.EMPLOYEE) ? !!v.isAttendant : false,
      roles,
      statusClient: roles.includes(TypeAgent.CLIENT) ? v.statusClient : null,
      statusProvider: roles.includes(TypeAgent.PROVIDER) ? v.statusProvider : null,
      statusPromoter: roles.includes(TypeAgent.PROMOTER) ? v.statusPromoter : null,
      statusEmployee: roles.includes(TypeAgent.EMPLOYEE) ? v.statusEmployee : null,
      statusTourGuide: roles.includes(TypeAgent.TOUR_GUIDE) ? v.statusTourGuide : null,
      addresses: (v.addresses ?? []).map((a: any) => ({
        street: a.street?.trim() || null,
        number: a.number?.trim() || null,
        complement: a.complement?.trim() || null,
        burgh: a.burgh?.trim() || null,
        postalCode: a.postalCode?.trim() || null,
        cityId: a.cityId || null,
      })),
      contacts: (v.contacts ?? []).map((c: any) => ({
        name: c.name?.trim() || null,
        cellphone: c.cellphone?.trim() || null,
        telephone: c.telephone?.trim() || null,
        email: c.email?.trim() || null,
      })),
    };

    this.saving.set(true);

    const id = this.agent()?.id;
    const req$ = id ? this.facade.update(id, payload) : this.facade.create(payload);

    req$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.add({
          severity: 'success',
          summary: this.i18n.tUi('common.success'),
          detail: id ? this.i18n.tUi('agentes.form.updated') : this.i18n.tUi('agentes.form.created'),
        });
        this.saved.emit();
        this.close();
      },
      error: () => {
        this.saving.set(false);
      },
    });
  }
}
