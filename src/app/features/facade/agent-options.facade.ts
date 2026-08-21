import { Injectable, inject, signal } from '@angular/core';

import { AgentOptionsApiService } from '@features/service/agent-options.api.service';
import { TypeAgent } from '@models/enums/type-agent.enum';
import { AgentOptionModel } from '@models/agent-option.models';

/** Cache simples em memória por papel - os selects de cliente/promotor/guia turístico do
 *  formulário de Voucher recarregam raramente (só quando o dialog é aberto), então um cache por
 *  sessão evita refazer a mesma consulta a cada abertura. */
@Injectable({ providedIn: 'root' })
export class AgentOptionsFacade {
  private readonly api = inject(AgentOptionsApiService);

  private readonly cache = new Map<TypeAgent, ReturnType<typeof signal<AgentOptionModel[]>>>();
  private readonly loadingRoles = new Set<TypeAgent>();

  optionsFor(role: TypeAgent) {
    if (!this.cache.has(role)) {
      this.cache.set(role, signal<AgentOptionModel[]>([]));
      this.reload(role);
    }
    return this.cache.get(role)!.asReadonly();
  }

  reload(role: TypeAgent): void {
    if (this.loadingRoles.has(role)) return;
    this.loadingRoles.add(role);

    this.api.findByRole(role).subscribe({
      next: (options) => {
        this.loadingRoles.delete(role);
        this.cache.get(role)?.set(options);
      },
      error: () => {
        this.loadingRoles.delete(role);
      },
    });
  }
}
