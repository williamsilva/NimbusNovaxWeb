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
import { TypeProduct } from '@models/enums/type-product.enum';
import { ProductOptionsFacade } from '@features/facade/product-options.facade';
import { VoucherItemModel } from '@models/voucher.models';

/**
 * Linha de itens (ingressos/alimentação) do formulário de Voucher - reutilizado 2x pelo
 * VoucherCreateDialogComponent (um por aba), mesmo papel de ItemsVoucherComponent/
 * ItemsFoodComponent no sistema legado (Novax antigo), unificados aqui num único componente
 * genérico parametrizado por `typeProduct`. A lista de itens é controlada pelo componente pai
 * (`items`/`itemsChange`) - este componente só cuida do mini-formulário de adicionar item e da
 * tabela de itens já adicionados.
 */
@Component({
  standalone: true,
  selector: 'app-voucher-items',
  templateUrl: './voucher-items.component.html',
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
export class VoucherItemsComponent {
  items = input.required<VoucherItemModel[]>();
  typeProduct = input.required<TypeProduct>();
  label = input.required<string>();

  @Output() itemsChange = new EventEmitter<VoucherItemModel[]>();

  private readonly fb = inject(FormBuilder);
  readonly i18n = inject(I18nService);
  private readonly productOptions = inject(ProductOptionsFacade);

  readonly products = computed(() => this.productOptions.optionsFor(this.typeProduct())());

  readonly totalValue = computed(() =>
    this.items().reduce((total, item) => total + (item.unitPrice ?? 0) * (item.quantity ?? 0), 0),
  );

  readonly form = this.fb.nonNullable.group({
    productId: [null as string | null, [Validators.required]],
    quantity: [1 as number | null, [Validators.required, Validators.min(1)]],
  });

  get productId() {
    return this.form.controls.productId;
  }

  get quantity() {
    return this.form.controls.quantity;
  }

  currency = this.i18n.getCurrency();
  locale = this.i18n.getLocale();

  addItem(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const { productId, quantity } = this.form.getRawValue();
    const product = this.products().find((p) => p.id === productId);
    if (!product) return;

    const existing = this.items().find((i) => i.productId === productId);
    let next: VoucherItemModel[];

    if (existing) {
      next = this.items().map((i) =>
        i.productId === productId ? { ...i, quantity: (i.quantity ?? 0) + (quantity ?? 1) } : i,
      );
    } else {
      next = [
        ...this.items(),
        {
          productId: product.id,
          productName: product.name,
          quantity: quantity ?? 1,
          unitPrice: product.amount,
          totalPrice: product.amount * (quantity ?? 1),
        },
      ];
    }

    this.itemsChange.emit(next);
    this.form.reset({ productId: null, quantity: 1 });
  }

  removeItem(index: number): void {
    this.itemsChange.emit(this.items().filter((_, i) => i !== index));
  }

  itemTotal(item: VoucherItemModel): number {
    return (item.unitPrice ?? 0) * (item.quantity ?? 0);
  }
}
