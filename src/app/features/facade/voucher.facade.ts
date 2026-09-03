import { Injectable, inject, signal } from '@angular/core';

import { Observable, tap } from 'rxjs';

import { VoucherApiService } from '@features/service/voucher.api.service';
import { VouchersAdvancedFilters } from '@features/filter/voucher.filters';
import { ListQueryDto } from '@williamsilva/nimbus-web-commons';
import { VoucherModel, VoucherUpsertInput } from '@models/voucher.models';

type LastQuery = ListQueryDto<VouchersAdvancedFilters>;

@Injectable({ providedIn: 'root' })
export class VoucherFacade {
  private readonly api = inject(VoucherApiService);

  private readonly _total = signal(0);
  private readonly _loading = signal(false);
  private readonly _loadedOnce = signal(false);
  private readonly _data = signal<VoucherModel[]>([]);
  private readonly _lastQuery = signal<LastQuery | null>(null);

  readonly vouchers = this._data.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly totalRecords = this._total.asReadonly();
  readonly loadedOnce = this._loadedOnce.asReadonly();

  loadPage(q: LastQuery): void {
    if (this._loading()) return;

    this._loading.set(true);
    this._lastQuery.set(q);

    this.api.searchPaged(q).subscribe({
      next: (res) => {
        this._loading.set(false);
        this._loadedOnce.set(true);
        this._data.set(res?._embedded?.content ?? []);
        this._total.set(res?.page?.totalElements ?? 0);
      },
      error: () => {
        this._loading.set(false);
        this._loadedOnce.set(true);
        this._data.set([]);
        this._total.set(0);
      },
    });
  }

  reloadLast(): void {
    const last = this._lastQuery();
    if (!last) return;

    this.loadPage(last);
  }

  getById(id: string): Observable<VoucherModel> {
    return this.api.getById(id);
  }

  create(input: VoucherUpsertInput): Observable<VoucherModel> {
    return this.api.create(input).pipe(tap(() => this.reloadLast()));
  }

  update(id: string, input: VoucherUpsertInput): Observable<VoucherModel> {
    return this.api.update(id, input).pipe(tap(() => this.reloadLast()));
  }

  delete(id: string): Observable<void> {
    return this.api.delete(id).pipe(tap(() => this.reloadLast()));
  }

  confirm(id: string): Observable<void> {
    return this.api.confirm(id).pipe(tap(() => this.reloadLast()));
  }

  notConfirm(id: string): Observable<void> {
    return this.api.notConfirm(id).pipe(tap(() => this.reloadLast()));
  }

  change(id: string): Observable<void> {
    return this.api.change(id).pipe(tap(() => this.reloadLast()));
  }

  cancel(id: string, cancellationReasonId: string): Observable<void> {
    return this.api.cancel(id, cancellationReasonId).pipe(tap(() => this.reloadLast()));
  }

  sendEmail(id: string): Observable<void> {
    return this.api.sendEmail(id);
  }

  viewPdfUrl(id: string): string {
    return this.api.viewPdfUrl(id);
  }
}
