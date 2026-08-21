/** Item leve pra popular os selects de item do formulário de Voucher (GET /bff/v1/products/options?
 *  typeProduct=) - não é ProductModel completo. */
export interface ProductOptionModel {
  id: string;
  name: string;
  amount: number;
  inactive: boolean;
}

export interface ProductOptionApiModel {
  id: string;
  name: string;
  amount: number;
  inactive: boolean;
}

export function mapProductOptionApiModel(input: ProductOptionApiModel): ProductOptionModel {
  return { id: input.id, name: input.name, amount: input.amount, inactive: !!input.inactive };
}

export function mapProductOptionApiModels(items: ProductOptionApiModel[] | null | undefined): ProductOptionModel[] {
  return (items ?? []).map(mapProductOptionApiModel);
}
