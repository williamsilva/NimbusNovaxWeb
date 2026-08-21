import { PeriodEnum } from '@models/enums/period.enum';
import { TypeProduct, TypeProductInput, normalizeTypeProduct } from '@models/enums/type-product.enum';
import { RecordStatus, RecordStatusInput, normalizeRecordStatus } from '@models/enums/record-status.enum';

export interface ProductModel {
  id: string;
  name: string;
  description: string | null;
  typeProduct: TypeProduct | null;
  amount: number;
  initialValidate: string | null;
  finalValidate: string | null;
  status: RecordStatus | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface ProductCreateInput {
  name: string;
  description?: string | null;
  typeProduct: TypeProduct;
  amount: number;
  initialValidate?: string | null;
  finalValidate?: string | null;
  status?: RecordStatus;
}

export type ProductUpdateInput = ProductCreateInput;

export type ProductsFiltersState = {
  name: string;
  typeProduct: TypeProduct[] | null;
  status: RecordStatus[] | null;
  createdAt: string | string[] | null;
  periodCreatedAt: PeriodEnum | null;
};

export interface ProductApiModel {
  id: string;
  name: string;
  description?: string | null;
  typeProduct: TypeProductInput;
  amount: number;
  initialValidate?: string | null;
  finalValidate?: string | null;
  status: RecordStatusInput;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export function mapProductApiModel(input: ProductApiModel): ProductModel {
  return {
    id: input.id,
    name: input.name,
    description: input.description ?? null,
    typeProduct: normalizeTypeProduct(input.typeProduct),
    amount: input.amount,
    initialValidate: input.initialValidate ?? null,
    finalValidate: input.finalValidate ?? null,
    status: normalizeRecordStatus(input.status),
    createdAt: input.createdAt ?? null,
    updatedAt: input.updatedAt ?? null,
  };
}

export function mapProductApiModels(items: ProductApiModel[] | null | undefined): ProductModel[] {
  return (items ?? []).map(mapProductApiModel);
}
