import { I18nService } from '@core/i18n/i18n.service';

/** Forma de pagamento de uma parcela do Pagamento Antecipado do voucher (ex-"Depósito", agora
 *  itemizado - com.nimbusnovax.voucher.model.enums.PaymentMethodEnum no backend, serializado pelo
 *  nome do enum Java). */
export enum PaymentMethod {
  BANK_DEPOSIT = 'BANK_DEPOSIT',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  PIX = 'PIX',
  CASH = 'CASH',
  CHECK = 'CHECK',
  BANK_SLIP = 'BANK_SLIP',
  OTHER = 'OTHER',
}

export type PaymentMethodInput = PaymentMethod | string | null | undefined;

export function normalizePaymentMethod(value: PaymentMethodInput): PaymentMethod | null {
  if (value == null) return null;

  const normalized = String(value).trim().toUpperCase();

  switch (normalized) {
    case PaymentMethod.BANK_DEPOSIT:
      return PaymentMethod.BANK_DEPOSIT;
    case PaymentMethod.CREDIT_CARD:
      return PaymentMethod.CREDIT_CARD;
    case PaymentMethod.DEBIT_CARD:
      return PaymentMethod.DEBIT_CARD;
    case PaymentMethod.PIX:
      return PaymentMethod.PIX;
    case PaymentMethod.CASH:
      return PaymentMethod.CASH;
    case PaymentMethod.CHECK:
      return PaymentMethod.CHECK;
    case PaymentMethod.BANK_SLIP:
      return PaymentMethod.BANK_SLIP;
    case PaymentMethod.OTHER:
      return PaymentMethod.OTHER;
    default:
      return null;
  }
}

export function paymentMethodLabel(value: PaymentMethodInput, i18n: I18nService): string {
  switch (normalizePaymentMethod(value)) {
    case PaymentMethod.BANK_DEPOSIT:
      return i18n.tUi('enum.paymentMethod.bankDeposit');
    case PaymentMethod.CREDIT_CARD:
      return i18n.tUi('enum.paymentMethod.creditCard');
    case PaymentMethod.DEBIT_CARD:
      return i18n.tUi('enum.paymentMethod.debitCard');
    case PaymentMethod.PIX:
      return i18n.tUi('enum.paymentMethod.pix');
    case PaymentMethod.CASH:
      return i18n.tUi('enum.paymentMethod.cash');
    case PaymentMethod.CHECK:
      return i18n.tUi('enum.paymentMethod.check');
    case PaymentMethod.BANK_SLIP:
      return i18n.tUi('enum.paymentMethod.bankSlip');
    case PaymentMethod.OTHER:
      return i18n.tUi('enum.paymentMethod.other');
    default:
      return i18n.tUi('enum.paymentMethod.unknown', 'N/A');
  }
}

export function allPaymentMethod(): PaymentMethod[] {
  return [
    PaymentMethod.BANK_DEPOSIT,
    PaymentMethod.CREDIT_CARD,
    PaymentMethod.DEBIT_CARD,
    PaymentMethod.PIX,
    PaymentMethod.CASH,
    PaymentMethod.CHECK,
    PaymentMethod.BANK_SLIP,
    PaymentMethod.OTHER,
  ];
}
