import { computed, untracked, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { input, signal, Output, inject, Component, EventEmitter, effect } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';

import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { DatePickerModule } from 'primeng/datepicker';
import { TranslateModule } from '@ngx-translate/core';
import { InputNumberModule } from 'primeng/inputnumber';

import { I18nService } from '@core/i18n/i18n.service';
import { ErrorMsgComponent } from '@shared/error-msg/error-msg.component';
import { DateInputMaskDirective } from '@shared/directives/date-input-mask.directive';
import { ProductsFacade } from '@features/facade/produtos.facade';
import { ProductModel, ProductCreateInput } from '@models/produtos.models';
import { TypeProduct, allTypeProducts, typeProductLabel } from '@models/enums/type-product.enum';
import { RecordStatus, allRecordStatuses, recordStatusLabel } from '@models/enums/record-status.enum';
import { ProdutosPermissionPolicy } from '@features/administracao/policy/produtos-permission.policy';

function courtesyAmountValidator(): ValidatorFn {
  return (control): ValidationErrors | null => {
    const amount = control.get('amount')?.value;
    const typeProduct = control.get('typeProduct')?.value;

    if (typeProduct === TypeProduct.COURTESY) return null;
    if (amount == null || Number(amount) <= 0) {
      return { amountRequiredUnlessCourtesy: true };
    }
    return null;
  };
}

@Component({
  standalone: true,
  selector: 'app-produtos-create-dialog',
  templateUrl: './produtos-create-dialog.component.html',
  imports: [
    ToastModule,
    SelectModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    TranslateModule,
    DatePickerModule,
    FloatLabelModule,
    InputNumberModule,
    ErrorMsgComponent,
    ReactiveFormsModule,
    DateInputMaskDirective,
  ],
})
export class ProdutosCreateDialogComponent {
  visible = input.required<boolean>();
  product = input<ProductModel | null>(null);

  @Output() saved = new EventEmitter<void>();
  @Output() visibleChange = new EventEmitter<boolean>();

  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  readonly i18n = inject(I18nService);
  readonly facade = inject(ProductsFacade);
  readonly secPolicy = inject(ProdutosPermissionPolicy);

  readonly isEditMode = computed(() => !!this.product());
  readonly canSubmit = computed(() =>
    this.isEditMode() ? this.secPolicy.canEdit({ id: this.product()!.id, status: this.product()!.status }) : this.secPolicy.canCreate(),
  );

  readonly saving = signal(false);

  readonly typeProductOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allTypeProducts().map((value) => ({ label: typeProductLabel(value, this.i18n), value }));
  });

  readonly statusOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allRecordStatuses().map((value) => ({ label: recordStatusLabel(value, this.i18n), value }));
  });

  readonly isCourtesy = computed(() => this.form.controls.typeProduct.value === TypeProduct.COURTESY);

  private lastLoadedId: string | null = null;

  readonly form = this.fb.nonNullable.group(
    {
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(100)]],
      typeProduct: [TypeProduct.TICKET as TypeProduct, [Validators.required]],
      amount: [0 as number | null],
      initialValidate: [null as Date | null],
      finalValidate: [null as Date | null],
      status: [RecordStatus.ACTIVE as RecordStatus],
    },
    { validators: [courtesyAmountValidator()] },
  );

  readonly currency = this.i18n.getCurrency();
  readonly locale = this.i18n.getLocale();

  /**
   * `untracked()` em volta de tudo + guard por `lastLoadedId` - mesmo padrão/motivo do
   * AgentesCreateDialogComponent: sem isso, qualquer reexecução espúria deste `effect` (por
   * qualquer signal lido incidentalmente durante o processamento) chamava `resetFormForCreate()`
   * de novo e apagava os dados já digitados no modo de criação, mesmo sem `product`/`visible`
   * terem de fato mudado.
   */
  constructor() {
    effect(() => {
      const visible = this.visible();
      const product = this.product();

      untracked(() => {
        if (!visible) return;

        if (!product) {
          if (this.lastLoadedId !== null) {
            this.lastLoadedId = null;
            this.resetFormForCreate();
          }
          return;
        }

        if (this.lastLoadedId === product.id) return;

        this.lastLoadedId = product.id;
        this.form.reset({
          name: product.name,
          description: product.description ?? '',
          typeProduct: product.typeProduct ?? TypeProduct.TICKET,
          amount: product.amount,
          initialValidate: product.initialValidate ? new Date(product.initialValidate) : null,
          finalValidate: product.finalValidate ? new Date(product.finalValidate) : null,
          status: product.status ?? RecordStatus.ACTIVE,
        });
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
    this.form.reset({
      name: '',
      description: '',
      typeProduct: TypeProduct.TICKET,
      amount: 0,
      initialValidate: null,
      finalValidate: null,
      status: RecordStatus.ACTIVE,
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
    const payload: ProductCreateInput = {
      name: v.name.trim(),
      description: v.description?.trim() || null,
      typeProduct: v.typeProduct,
      amount: v.typeProduct === TypeProduct.COURTESY ? (v.amount ?? 0) : Number(v.amount),
      initialValidate: this.toDateOnly(v.initialValidate),
      finalValidate: this.toDateOnly(v.finalValidate),
      status: v.status,
    };

    this.saving.set(true);

    const id = this.product()?.id;
    const req$ = id ? this.facade.update(id, payload) : this.facade.create(payload);

    req$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.add({
          severity: 'success',
          summary: this.i18n.tUi('common.success'),
          detail: id ? this.i18n.tUi('produtos.form.updated') : this.i18n.tUi('produtos.form.created'),
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
