import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { API } from '@core/api/api.config';
import {
  ConfigVoucherModel,
  ConfigVoucherApiModel,
  ConfigVoucherUpdateInput,
  mapConfigVoucherApiModel,
  VoucherNotificationRecipientModel,
} from '@models/voucher-config.models';

@Injectable({ providedIn: 'root' })
export class VoucherConfigApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API.bff}/v1/voucher-config`;

  find() {
    return this.http.get<ConfigVoucherApiModel>(this.baseUrl).pipe(map(mapConfigVoucherApiModel));
  }

  update(input: ConfigVoucherUpdateInput): Observable<ConfigVoucherModel> {
    return this.http.put<ConfigVoucherApiModel>(this.baseUrl, input).pipe(map(mapConfigVoucherApiModel));
  }

  notificationRecipients(): Observable<VoucherNotificationRecipientModel[]> {
    return this.http.get<VoucherNotificationRecipientModel[]>(`${this.baseUrl}/notification-recipients`);
  }
}
