import { CurrencyPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, EventEmitter, Output, computed, inject, input } from '@angular/core';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { InputNumberModule } from 'primeng/inputnumber';

import { I18nService } from '@core/i18n/i18n.service';
import { ErrorMsgComponent } from '@shared/error-msg/error-msg.component';
import { VoucherAdvancePaymentModel } from '@models/voucher.models';
import { PaymentMethod, allPaymentMethod, paymentMethodLabel } from '@models/enums/payment-method.enum';

/** Itens do Pagamento Antecipado do voucher (ex-"Depósito" de valor único) - mesmo papel de
 *  {@link VoucherItemsComponent} (mini-formulário de adicionar + tabela dos já adicionados), só
 *  que sem produto: forma de pagamento + valor. Usado uma única vez pelo
 *  VoucherCreateDialogComponent, na aba de Dados. */
@Component({
  standalone: true,
  selector: 'app-voucher-advance-payments',
  templateUrl: './voucher-advance-payments.component.html',
  imports: [
    TableModule,
    ButtonModule,
    SelectModule,
    TooltipModule,
    CurrencyPipe,
    TranslateModule,
    ErrorMsgComponent,
    InputNumberModule,
    ReactiveFormsModule,
  ],
})
export class VoucherAdvancePaymentsComponent {
  items = input.required<VoucherAdvancePaymentModel[]>();

  @Output() itemsChange = new EventEmitter<VoucherAdvancePaymentModel[]>();

  private readonly fb = inject(FormBuilder);
  readonly i18n = inject(I18nService);

  readonly paymentMethods = computed(() =>
    allPaymentMethod().map((value) => ({ label: paymentMethodLabel(value, this.i18n), value })),
  );

  readonly totalValue = computed(() => this.items().reduce((total, item) => total + (item.amount ?? 0), 0));

  readonly form = this.fb.nonNullable.group({
    paymentMethod: [null as PaymentMethod | null, [Validators.required]],
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
  });

  get paymentMethod() {
    return this.form.controls.paymentMethod;
  }

  get amount() {
    return this.form.controls.amount;
  }

  currency = this.i18n.getCurrency();
  locale = this.i18n.getLocale();

  addItem(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const { paymentMethod, amount } = this.form.getRawValue();
    this.itemsChange.emit([...this.items(), { paymentMethod: paymentMethod!, amount: amount ?? 0 }]);
    this.form.reset({ paymentMethod: null, amount: null });
  }

  removeItem(index: number): void {
    this.itemsChange.emit(this.items().filter((_, i) => i !== index));
  }

  paymentMethodLabel(item: VoucherAdvancePaymentModel): string {
    return paymentMethodLabel(item.paymentMethod, this.i18n);
  }
}
