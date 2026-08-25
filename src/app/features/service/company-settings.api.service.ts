import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { API } from '@core/api/api.config';
import {
  CompanySettingsModel,
  CompanySettingsApiModel,
  CompanySettingsUpdateInput,
  mapCompanySettingsApiModel,
} from '@models/company-settings.models';

@Injectable({ providedIn: 'root' })
export class CompanySettingsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API.bff}/v1/company-settings`;

  find(): Observable<CompanySettingsModel> {
    return this.http.get<CompanySettingsApiModel>(this.baseUrl).pipe(map(mapCompanySettingsApiModel));
  }

  update(input: CompanySettingsUpdateInput): Observable<CompanySettingsModel> {
    return this.http.put<CompanySettingsApiModel>(this.baseUrl, input).pipe(map(mapCompanySettingsApiModel));
  }

  uploadLogo(file: File): Observable<CompanySettingsModel> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http
      .post<CompanySettingsApiModel>(`${this.baseUrl}/logo`, formData)
      .pipe(map(mapCompanySettingsApiModel));
  }

  deleteLogo(): Observable<CompanySettingsModel> {
    return this.http.delete<CompanySettingsApiModel>(`${this.baseUrl}/logo`).pipe(map(mapCompanySettingsApiModel));
  }
}
