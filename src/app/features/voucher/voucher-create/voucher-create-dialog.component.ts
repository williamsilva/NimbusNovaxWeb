import { computed, untracked, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { input, signal, Output, inject, Component, EventEmitter, effect } from '@angular/core';

import { TabsModule } from 'primeng/tabs';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { DatePickerModule } from 'primeng/datepicker';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TranslateModule } from '@ngx-translate/core';
import { InputNumberModule } from 'primeng/inputnumber';

import { I18nService } from '@core/i18n/i18n.service';
import { ErrorMsgComponent } from '@shared/error-msg/error-msg.component';
import { DateInputMaskDirective } from '@shared/directives/date-input-mask.directive';
import { VoucherFacade } from '@features/facade/voucher.facade';
import { AgentOptionsFacade } from '@features/facade/agent-options.facade';
import { TypeAgent } from '@models/enums/type-agent.enum';
import { TypeProduct } from '@models/enums/type-product.enum';
import { statusVoucherLabel } from '@models/enums/status-voucher.enum';
import { VoucherModel, VoucherItemModel, VoucherUpsertInput } from '@models/voucher.models';
import { VoucherPermissionPolicy } from '@features/voucher/policy/voucher-permission.policy';
import { VoucherItemsComponent } from '@features/voucher/voucher-create/voucher-items.component';

@Component({
  standalone: true,
  selector: 'app-voucher-create-dialog',
  templateUrl: './voucher-create-dialog.component.html',
  imports: [
    TabsModule,
    ToastModule,
    SelectModule,
    DialogModule,
    ButtonModule,
    TextareaModule,
    TranslateModule,
    DatePickerModule,
    FloatLabelModule,
    ErrorMsgComponent,
    InputNumberModule,
    ReactiveFormsModule,
    VoucherItemsComponent,
    DateInputMaskDirective,
  ],
})
export class VoucherCreateDialogComponent {
  visible = input.required<boolean>();
  voucher = input<VoucherModel | null>(null);

  @Output() saved = new EventEmitter<void>();
  @Output() visibleChange = new EventEmitter<boolean>();

  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly agentOptions = inject(AgentOptionsFacade);

  readonly i18n = inject(I18nService);
  readonly facade = inject(VoucherFacade);
  readonly secPolicy = inject(VoucherPermissionPolicy);

  readonly TypeProduct = TypeProduct;
  readonly activeTab = signal(0);

  readonly clients = this.agentOptions.optionsFor(TypeAgent.CLIENT);
  readonly promoters = this.agentOptions.optionsFor(TypeAgent.PROMOTER);
  readonly tourGuides = this.agentOptions.optionsFor(TypeAgent.TOUR_GUIDE);

  readonly isEditMode = computed(() => !!this.voucher());
  readonly canSubmit = computed(() =>
    this.isEditMode() ? this.secPolicy.canEdit({ id: this.voucher()!.id, status: this.voucher()!.status }) : this.secPolicy.canCreate(),
  );

  readonly statusLabel = computed(() => statusVoucherLabel(this.voucher()?.status ?? null, this.i18n));

  readonly saving = signal(false);
  readonly tickets = signal<VoucherItemModel[]>([]);
  readonly foods = signal<VoucherItemModel[]>([]);

  private lastLoadedId: string | null = null;

  readonly form = this.fb.nonNullable.group({
    clientId: [null as string | null, [Validators.required]],
    promoterId: [null as string | null, [Validators.required]],
    tourGuideId: [null as string | null],
    visitDate: [null as Date | null, [Validators.required]],
    advanceValue: [null as number | null],
    note: ['', [Validators.maxLength(200)]],
  });

  /** Ver o mesmo comentário em ProdutosCreateDialogComponent - `untracked()` + guard por
   *  `lastLoadedId` evita que uma reexecução espúria deste `effect` apague os dados já digitados
   *  no modo de criação. */
  constructor() {
    effect(() => {
      const visible = this.visible();
      const voucher = this.voucher();

      untracked(() => {
        if (!visible) return;

        if (!voucher) {
          if (this.lastLoadedId !== null) {
            this.lastLoadedId = null;
            this.resetFormForCreate();
          }
          return;
        }

        if (this.lastLoadedId === voucher.id) return;

        this.lastLoadedId = voucher.id;
        this.activeTab.set(0);
        this.form.reset({
          clientId: voucher.client.id,
          promoterId: voucher.promoter.id,
          tourGuideId: voucher.tourGuide?.id ?? null,
          visitDate: voucher.visitDate ? new Date(voucher.visitDate) : null,
          advanceValue: voucher.advanceValue,
          note: voucher.note ?? '',
        });
        this.tickets.set(voucher.tickets);
        this.foods.set(voucher.foods);
      });
    });
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
    this.activeTab.set(0);
    this.form.reset({
      clientId: null,
      promoterId: null,
      tourGuideId: null,
      visitDate: null,
      advanceValue: null,
      note: '',
    });
    this.tickets.set([]);
    this.foods.set([]);
  }

  private toDateOnly(value: Date | null): string {
    if (!value) return '';
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, '0');
    const d = String(value.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  save(): void {
    this.form.markAllAsTouched();
    this.form.updateValueAndValidity();

    if (this.form.invalid) {
      this.activeTab.set(0);
      return;
    }

    const v = this.form.getRawValue();
    const payload: VoucherUpsertInput = {
      note: v.note?.trim() || null,
      visitDate: this.toDateOnly(v.visitDate),
      advanceValue: v.advanceValue ?? null,
      clientId: v.clientId!,
      promoterId: v.promoterId!,
      tourGuideId: v.tourGuideId || null,
      tickets: this.tickets().map((i) => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice })),
      foods: this.foods().map((i) => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice })),
    };

    this.saving.set(true);

    const id = this.voucher()?.id;
    const req$ = id ? this.facade.update(id, payload) : this.facade.create(payload);

    req$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.add({
          severity: 'success',
          summary: this.i18n.tUi('common.success'),
          detail: id ? this.i18n.tUi('voucher.form.updated') : this.i18n.tUi('voucher.form.created'),
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
