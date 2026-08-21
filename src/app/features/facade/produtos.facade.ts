import { Injectable, inject, signal } from '@angular/core';

import { Observable, tap } from 'rxjs';

import { ProductsApiService } from '@features/service/produtos.api.service';
import { ProductsAdvancedFilters } from '@features/filter/produtos.filters';
import { ListQueryDto } from '@shared/features/list-query/list-query.types';
import { ProductModel, ProductCreateInput, ProductUpdateInput } from '@models/produtos.models';

type LastQuery = ListQueryDto<ProductsAdvancedFilters>;

@Injectable({ providedIn: 'root' })
export class ProductsFacade {
  private readonly api = inject(ProductsApiService);

  private readonly _total = signal(0);
  private readonly _loading = signal(false);
  private readonly _loadedOnce = signal(false);
  private readonly _data = signal<ProductModel[]>([]);
  private readonly _lastQuery = signal<LastQuery | null>(null);

  readonly products = this._data.asReadonly();
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

  getById(id: string): Observable<ProductModel> {
    return this.api.getById(id);
  }

  create(input: ProductCreateInput): Observable<ProductModel> {
    return this.api.create(input).pipe(tap(() => this.reloadLast()));
  }

  update(id: string, input: ProductUpdateInput): Observable<ProductModel> {
    return this.api.update(id, input).pipe(tap(() => this.reloadLast()));
  }

  delete(id: string): Observable<void> {
    return this.api.delete(id).pipe(tap(() => this.reloadLast()));
  }

  activate(id: string): Observable<void> {
    return this.api.activate(id).pipe(tap(() => this.reloadLast()));
  }

  deactivate(id: string): Observable<void> {
    return this.api.deactivate(id).pipe(tap(() => this.reloadLast()));
  }
}
