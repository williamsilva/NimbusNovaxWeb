/** Item leve pra popular selects de outros módulos (GET /bff/v1/agents/options?role=) - não é a
 *  árvore completa de AgentModel (sem endereços/contatos). Reaproveitado pelos pickers de
 *  cliente/promotor/guia turístico do formulário de Voucher. */
export interface AgentOptionModel {
  id: string;
  name: string;
  document: string;
  inactive: boolean;
}

export interface AgentOptionApiModel {
  id: string;
  name: string;
  document: string;
  inactive: boolean;
}

export function mapAgentOptionApiModel(input: AgentOptionApiModel): AgentOptionModel {
  return { id: input.id, name: input.name, document: input.document, inactive: !!input.inactive };
}

export function mapAgentOptionApiModels(items: AgentOptionApiModel[] | null | undefined): AgentOptionModel[] {
  return (items ?? []).map(mapAgentOptionApiModel);
}
