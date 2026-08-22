import { Injectable, inject, signal } from '@angular/core';

import { Observable, tap } from 'rxjs';

import { CompanySettingsApiService } from '@features/service/company-settings.api.service';
import { CompanySettingsModel, CompanySettingsUpdateInput } from '@models/company-settings.models';

@Injectable({ providedIn: 'root' })
export class CompanySettingsFacade {
  private readonly api = inject(CompanySettingsApiService);

  private readonly _settings = signal<CompanySettingsModel | null>(null);
  private readonly _loading = signal(false);

  readonly settings = this._settings.asReadonly();
  readonly loading = this._loading.asReadonly();

  load(): void {
    this._loading.set(true);
    this.api.find().subscribe({
      next: (settings) => {
        this._loading.set(false);
        this._settings.set(settings);
      },
      error: () => {
        this._loading.set(false);
      },
    });
  }

  update(input: CompanySettingsUpdateInput): Observable<CompanySettingsModel> {
    return this.api.update(input).pipe(tap((settings) => this._settings.set(settings)));
  }
}
