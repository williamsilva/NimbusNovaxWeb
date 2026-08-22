import { Injectable, inject, signal } from '@angular/core';

import { Observable, tap } from 'rxjs';

import { VoucherConfigApiService } from '@features/service/voucher-config.api.service';
import { ConfigVoucherModel, ConfigVoucherUpdateInput } from '@models/voucher-config.models';

@Injectable({ providedIn: 'root' })
export class VoucherConfigFacade {
  private readonly api = inject(VoucherConfigApiService);

  private readonly _config = signal<ConfigVoucherModel | null>(null);
  private readonly _loading = signal(false);

  readonly config = this._config.asReadonly();
  readonly loading = this._loading.asReadonly();

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
  }

  update(input: ConfigVoucherUpdateInput): Observable<ConfigVoucherModel> {
    return this.api.update(input).pipe(tap((config) => this._config.set(config)));
  }
}
