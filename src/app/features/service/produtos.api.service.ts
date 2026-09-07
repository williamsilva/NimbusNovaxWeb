import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { map } from 'rxjs/operators';

import { API } from '@core/api/api.config';
import { HalPagedResponse } from '@core/api/page.model';
import { ListQueryDto } from '@williamsilva/nimbus-web-commons';
import { ProductsAdvancedFilters } from '@features/filter/produtos.filters';
import {
  ProductModel,
  ProductApiModel,
  ProductCreateInput,
  ProductUpdateInput,
  mapProductApiModel,
  mapProductApiModels,
} from '@models/produtos.models';

@Injectable({ providedIn: 'root' })
export class ProductsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API.bff}/v1/products`;

  searchPaged(body: ListQueryDto<ProductsAdvancedFilters>) {
    return this.http.post<HalPagedResponse<ProductApiModel>>(`${this.baseUrl}/search`, body).pipe(
      map(
        (res) =>
          ({
            ...res,
            _embedded: {
              ...(res?._embedded ?? {}),
              content: mapProductApiModels(res?._embedded?.content),
            },
          }) as HalPagedResponse<ProductModel>,
      ),
    );
  }

  getById(id: string) {
    return this.http.get<ProductApiModel>(`${this.baseUrl}/${id}`).pipe(map(mapProductApiModel));
  }

  create(input: ProductCreateInput) {
    return this.http.post<ProductApiModel>(`${this.baseUrl}`, input).pipe(map(mapProductApiModel));
  }

  update(id: string, input: ProductUpdateInput) {
    return this.http.put<ProductApiModel>(`${this.baseUrl}/${id}`, input).pipe(map(mapProductApiModel));
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  activate(id: string) {
    return this.http.post<void>(`${this.baseUrl}/${id}/activate`, null);
  }

  deactivate(id: string) {
    return this.http.post<void>(`${this.baseUrl}/${id}/deactivate`, null);
  }
}
