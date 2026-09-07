import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { map } from 'rxjs/operators';

import { API } from '@core/api/api.config';
import { HalPagedResponse } from '@core/api/page.model';
import { ListQueryDto } from '@williamsilva/nimbus-web-commons';
import { VouchersAdvancedFilters } from '@features/filter/voucher.filters';
import {
  VoucherModel,
  VoucherApiModel,
  VoucherUpsertInput,
  mapVoucherApiModel,
  mapVoucherApiModels,
} from '@models/voucher.models';

@Injectable({ providedIn: 'root' })
export class VoucherApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API.bff}/v1/vouchers`;

  searchPaged(body: ListQueryDto<VouchersAdvancedFilters>) {
    return this.http.post<HalPagedResponse<VoucherApiModel>>(`${this.baseUrl}/search`, body).pipe(
      map(
        (res) =>
          ({
            ...res,
            _embedded: {
              ...(res?._embedded ?? {}),
              content: mapVoucherApiModels(res?._embedded?.content),
            },
          }) as HalPagedResponse<VoucherModel>,
      ),
    );
  }

  getById(id: string) {
    return this.http.get<VoucherApiModel>(`${this.baseUrl}/${id}`).pipe(map(mapVoucherApiModel));
  }

  create(input: VoucherUpsertInput) {
    return this.http.post<VoucherApiModel>(`${this.baseUrl}`, input).pipe(map(mapVoucherApiModel));
  }

  update(id: string, input: VoucherUpsertInput) {
    return this.http.put<VoucherApiModel>(`${this.baseUrl}/${id}`, input).pipe(map(mapVoucherApiModel));
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  confirm(id: string) {
    return this.http.put<void>(`${this.baseUrl}/${id}/confirm`, null);
  }

  notConfirm(id: string) {
    return this.http.put<void>(`${this.baseUrl}/${id}/not-confirm`, null);
  }

  change(id: string) {
    return this.http.put<void>(`${this.baseUrl}/${id}/change`, null);
  }

  cancel(id: string, cancellationReasonId: string) {
    return this.http.put<void>(`${this.baseUrl}/${id}/cancel`, { cancellationReasonId });
  }

  sendEmail(id: string) {
    return this.http.put<void>(`${this.baseUrl}/${id}/send-email`, null);
  }

  viewPdfUrl(id: string) {
    return `${this.baseUrl}/${id}/to-view`;
  }
}
