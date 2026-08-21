import { CsTagTone } from '@shared/ui';
import { I18nService } from '@core/i18n/i18n.service';

export enum TypeProduct {
  TICKET = 'TICKET',
  FOOD = 'FOOD',
  COURTESY = 'COURTESY',
}

export type TypeProductInput = TypeProduct | string | null | undefined;

export function normalizeTypeProduct(value: TypeProductInput): TypeProduct | null {
  if (value == null) return null;

  const normalized = String(value).trim().toUpperCase();

  switch (normalized) {
    case TypeProduct.TICKET:
      return TypeProduct.TICKET;
    case TypeProduct.FOOD:
      return TypeProduct.FOOD;
    case TypeProduct.COURTESY:
      return TypeProduct.COURTESY;
    default:
      return null;
  }
}

export function typeProductSeverity(value: TypeProductInput): CsTagTone {
  switch (normalizeTypeProduct(value)) {
    case TypeProduct.TICKET:
      return 'info';
    case TypeProduct.FOOD:
      return 'warn';
    case TypeProduct.COURTESY:
      return 'success';
    default:
      return 'contrast';
  }
}

export function typeProductLabel(value: TypeProductInput, i18n: I18nService): string {
  switch (normalizeTypeProduct(value)) {
    case TypeProduct.TICKET:
      return i18n.tUi('enum.typeProduct.ticket');
    case TypeProduct.FOOD:
      return i18n.tUi('enum.typeProduct.food');
    case TypeProduct.COURTESY:
      return i18n.tUi('enum.typeProduct.courtesy');
    default:
      return i18n.tUi('enum.typeProduct.unknown', 'Desconhecido');
  }
}

export function allTypeProducts(): TypeProduct[] {
  return [TypeProduct.TICKET, TypeProduct.FOOD, TypeProduct.COURTESY];
}
