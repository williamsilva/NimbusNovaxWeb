import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { API } from '@core/api/api.config';
import { StateModel, CityModel } from '@models/geo.models';

@Injectable({ providedIn: 'root' })
export class GeoApiService {
  private readonly http = inject(HttpClient);

  getStates() {
    return this.http.get<StateModel[]>(`${API.bff}/v1/states`);
  }

  getCitiesByState(stateId: string) {
    return this.http.get<CityModel[]>(`${API.bff}/v1/cities`, {
      params: new HttpParams().set('stateId', stateId),
    });
  }
}
