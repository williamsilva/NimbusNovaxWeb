import { PeriodEnum } from '@models/enums/period.enum';
import { TypePerson, TypePersonInput, normalizeTypePerson } from '@models/enums/type-person.enum';
import { StatusVoucher, StatusVoucherInput, normalizeStatusVoucher } from '@models/enums/status-voucher.enum';

export interface VoucherItemModel {
  id?: string;
  productId: string;
  productName: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number | null;
}

export interface VoucherAgentRefModel {
  id: string;
  name: string;
  document: string | null;
}

export interface VoucherCancellationReasonRefModel {
  id: string;
  name: string;
}

export interface VoucherModel {
  id: string;
  code: string;
  status: StatusVoucher | null;
  typePerson: TypePerson | null;
  note: string | null;
  visitDate: string | null;
  numberOfVisit: number | null;
  totalPrice: number;
  advanceValue: number;
  totalPriceTickets: number;
  totalPriceFoods: number;
  confirmationDate: string | null;
  cancellationDate: string | null;
  client: VoucherAgentRefModel;
  promoter: VoucherAgentRefModel;
  tourGuide: VoucherAgentRefModel | null;
  cancellationReason: VoucherCancellationReasonRefModel | null;
  tickets: VoucherItemModel[];
  foods: VoucherItemModel[];
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface VoucherItemInput {
  productId: string;
  quantity: number;
  unitPrice?: number | null;
}

export interface VoucherUpsertInput {
  note?: string | null;
  visitDate: string;
  advanceValue?: number | null;
  clientId: string;
  promoterId: string;
  tourGuideId?: string | null;
  tickets: VoucherItemInput[];
  foods: VoucherItemInput[];
}

export type VouchersFiltersState = {
  voucher: string;
  client: string;
  promoterIds: string[] | null;
  status: StatusVoucher[] | null;
  visitDate: string | string[] | null;
  periodVisitDate: PeriodEnum | null;
};

export interface VoucherApiModel {
  id: string;
  code: string;
  status: StatusVoucherInput;
  typePerson: TypePersonInput;
  note?: string | null;
  visitDate?: string | null;
  numberOfVisit?: number | null;
  totalPrice: number;
  advanceValue: number;
  totalPriceTickets: number;
  totalPriceFoods: number;
  confirmationDate?: string | null;
  cancellationDate?: string | null;
  client: VoucherAgentRefModel;
  promoter: VoucherAgentRefModel;
  tourGuide?: VoucherAgentRefModel | null;
  cancellationReason?: VoucherCancellationReasonRefModel | null;
  tickets?: Array<{
    id: string;
    productId: string;
    productName?: string | null;
    quantity: number;
    unitPrice: number;
    totalPrice?: number | null;
  }> | null;
  foods?: Array<{
    id: string;
    productId: string;
    productName?: string | null;
    quantity: number;
    unitPrice: number;
    totalPrice?: number | null;
  }> | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

function mapItems(items: VoucherApiModel['tickets']): VoucherItemModel[] {
  return (items ?? []).map((i) => ({
    id: i.id,
    productId: i.productId,
    productName: i.productName ?? null,
    quantity: i.quantity,
    unitPrice: i.unitPrice,
    totalPrice: i.totalPrice ?? null,
  }));
}

export function mapVoucherApiModel(input: VoucherApiModel): VoucherModel {
  return {
    id: input.id,
    code: input.code,
    status: normalizeStatusVoucher(input.status),
    typePerson: normalizeTypePerson(input.typePerson),
    note: input.note ?? null,
    visitDate: input.visitDate ?? null,
    numberOfVisit: input.numberOfVisit ?? null,
    totalPrice: input.totalPrice,
    advanceValue: input.advanceValue,
    totalPriceTickets: input.totalPriceTickets,
    totalPriceFoods: input.totalPriceFoods,
    confirmationDate: input.confirmationDate ?? null,
    cancellationDate: input.cancellationDate ?? null,
    client: input.client,
    promoter: input.promoter,
    tourGuide: input.tourGuide ?? null,
    cancellationReason: input.cancellationReason ?? null,
    tickets: mapItems(input.tickets),
    foods: mapItems(input.foods),
    createdAt: input.createdAt ?? null,
    updatedAt: input.updatedAt ?? null,
  };
}

export function mapVoucherApiModels(items: VoucherApiModel[] | null | undefined): VoucherModel[] {
  return (items ?? []).map(mapVoucherApiModel);
}
