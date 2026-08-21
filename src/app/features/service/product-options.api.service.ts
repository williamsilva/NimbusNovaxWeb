import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { map } from 'rxjs/operators';

import { API } from '@core/api/api.config';
import { TypeProduct } from '@models/enums/type-product.enum';
import { ProductOptionApiModel, mapProductOptionApiModels } from '@models/product-option.models';

@Injectable({ providedIn: 'root' })
export class ProductOptionsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API.bff}/v1/products/options`;

  findByType(typeProduct: TypeProduct) {
    return this.http
      .get<ProductOptionApiModel[]>(this.baseUrl, { params: { typeProduct } })
      .pipe(map(mapProductOptionApiModels));
  }
}
