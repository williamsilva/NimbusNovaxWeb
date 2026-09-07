import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { map } from 'rxjs/operators';

import { API } from '@core/api/api.config';
import { HalPagedResponse } from '@core/api/page.model';
import { ListQueryDto } from '@williamsilva/nimbus-web-commons';
import { CancellationReasonsAdvancedFilters } from '@features/filter/motivo-cancelamento.filters';
import {
  CancellationReasonModel,
  CancellationReasonApiModel,
  CancellationReasonCreateInput,
  CancellationReasonUpdateInput,
  mapCancellationReasonApiModel,
  mapCancellationReasonApiModels,
} from '@models/motivo-cancelamento.models';

@Injectable({ providedIn: 'root' })
export class CancellationReasonsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API.bff}/v1/cancellation-reasons`;

  searchPaged(body: ListQueryDto<CancellationReasonsAdvancedFilters>) {
    return this.http
      .post<HalPagedResponse<CancellationReasonApiModel>>(`${this.baseUrl}/search`, body)
      .pipe(
        map(
          (res) =>
            ({
              ...res,
              _embedded: {
                ...(res?._embedded ?? {}),
                content: mapCancellationReasonApiModels(res?._embedded?.content),
              },
            }) as HalPagedResponse<CancellationReasonModel>,
        ),
      );
  }

  getById(id: string) {
    return this.http
      .get<CancellationReasonApiModel>(`${this.baseUrl}/${id}`)
      .pipe(map(mapCancellationReasonApiModel));
  }

  create(input: CancellationReasonCreateInput) {
    return this.http
      .post<CancellationReasonApiModel>(`${this.baseUrl}`, input)
      .pipe(map(mapCancellationReasonApiModel));
  }

  update(id: string, input: CancellationReasonUpdateInput) {
    return this.http
      .put<CancellationReasonApiModel>(`${this.baseUrl}/${id}`, input)
      .pipe(map(mapCancellationReasonApiModel));
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
