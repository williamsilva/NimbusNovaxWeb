import { Injectable, inject, signal } from '@angular/core';

import { Observable, tap } from 'rxjs';

import { VoucherConfigApiService } from '@features/service/voucher-config.api.service';
import {
  ConfigVoucherModel,
  ConfigVoucherUpdateInput,
  VoucherNotificationRecipientModel,
} from '@models/voucher-config.models';

@Injectable({ providedIn: 'root' })
export class VoucherConfigFacade {
  private readonly api = inject(VoucherConfigApiService);

  private readonly _config = signal<ConfigVoucherModel | null>(null);
  private readonly _loading = signal(false);
  private readonly _notificationRecipients = signal<VoucherNotificationRecipientModel[]>([]);

  readonly config = this._config.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly notificationRecipients = this._notificationRecipients.asReadonly();

  load(): void {
    this._loading.set(true);
    this.api.find().subscribe({
      next: (config) => {
        this._loading.set(false);
        this._config.set(config);
      },
      error: () => {
        this._loading.set(false);
      },
    });
    this.api.notificationRecipients().subscribe({
      next: (recipients) => this._notificationRecipients.set(recipients),
      error: () => this._notificationRecipients.set([]),
    });
  }

  update(input: ConfigVoucherUpdateInput): Observable<ConfigVoucherModel> {
    return this.api.update(input).pipe(tap((config) => this._config.set(config)));
  }
}
