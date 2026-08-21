import { Injectable, inject, signal } from '@angular/core';

import { ProductOptionsApiService } from '@features/service/product-options.api.service';
import { TypeProduct } from '@models/enums/type-product.enum';
import { ProductOptionModel } from '@models/product-option.models';

/** Mesmo padrão de cache em memória de {@link AgentOptionsFacade}, por tipo de produto. */
@Injectable({ providedIn: 'root' })
export class ProductOptionsFacade {
  private readonly api = inject(ProductOptionsApiService);

  private readonly cache = new Map<TypeProduct, ReturnType<typeof signal<ProductOptionModel[]>>>();
  private readonly loadingTypes = new Set<TypeProduct>();

  optionsFor(typeProduct: TypeProduct) {
    if (!this.cache.has(typeProduct)) {
      this.cache.set(typeProduct, signal<ProductOptionModel[]>([]));
      this.reload(typeProduct);
    }
    return this.cache.get(typeProduct)!.asReadonly();
  }

  reload(typeProduct: TypeProduct): void {
    if (this.loadingTypes.has(typeProduct)) return;
    this.loadingTypes.add(typeProduct);

    this.api.findByType(typeProduct).subscribe({
      next: (options) => {
        this.loadingTypes.delete(typeProduct);
        this.cache.get(typeProduct)?.set(options);
      },
      error: () => {
        this.loadingTypes.delete(typeProduct);
      },
    });
  }
}
