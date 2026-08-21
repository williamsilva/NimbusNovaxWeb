import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { map } from 'rxjs/operators';

import { API } from '@core/api/api.config';
import { HalPagedResponse } from '@core/api/page.model';
import { ListQueryDto } from '@shared/features/list-query/list-query.types';
import { AgentsAdvancedFilters } from '@features/filter/agentes.filters';
import {
  AgentModel,
  AgentApiModel,
  AgentUpsertInput,
  mapAgentApiModel,
  mapAgentApiModels,
} from '@models/agentes.models';

@Injectable({ providedIn: 'root' })
export class AgentesApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API.bff}/v1/agents`;

  searchPaged(body: ListQueryDto<AgentsAdvancedFilters>) {
    return this.http.post<HalPagedResponse<AgentApiModel>>(`${this.baseUrl}/search`, body).pipe(
      map(
        (res) =>
          ({
            ...res,
            _embedded: {
              ...(res?._embedded ?? {}),
              content: mapAgentApiModels(res?._embedded?.content),
            },
          }) as HalPagedResponse<AgentModel>,
      ),
    );
  }

  getById(id: string) {
    return this.http.get<AgentApiModel>(`${this.baseUrl}/${id}`).pipe(map(mapAgentApiModel));
  }

  create(input: AgentUpsertInput) {
    return this.http.post<AgentApiModel>(`${this.baseUrl}`, input).pipe(map(mapAgentApiModel));
  }

  update(id: string, input: AgentUpsertInput) {
    return this.http.put<AgentApiModel>(`${this.baseUrl}/${id}`, input).pipe(map(mapAgentApiModel));
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
