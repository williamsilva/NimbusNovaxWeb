import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { map } from 'rxjs/operators';

import { API } from '@core/api/api.config';
import { TypeAgent } from '@models/enums/type-agent.enum';
import { AgentOptionApiModel, mapAgentOptionApiModels } from '@models/agent-option.models';

@Injectable({ providedIn: 'root' })
export class AgentOptionsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API.bff}/v1/agents/options`;

  findByRole(role: TypeAgent) {
    return this.http
      .get<AgentOptionApiModel[]>(this.baseUrl, { params: { role } })
      .pipe(map(mapAgentOptionApiModels));
  }
}
