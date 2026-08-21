/** Item leve pra popular os selects de item do formulário de Voucher (GET /bff/v1/products/options?
 *  typeProduct=) - só produtos ativos (ver ProductService.findOptions), não é ProductModel
 *  completo. */
export interface ProductOptionModel {
  id: string;
  name: string;
  amount: number;
}

export interface ProductOptionApiModel {
  id: string;
  name: string;
  amount: number;
}

export function mapProductOptionApiModel(input: ProductOptionApiModel): ProductOptionModel {
  return { id: input.id, name: input.name, amount: input.amount };
}

export function mapProductOptionApiModels(items: ProductOptionApiModel[] | null | undefined): ProductOptionModel[] {
  return (items ?? []).map(mapProductOptionApiModel);
}
