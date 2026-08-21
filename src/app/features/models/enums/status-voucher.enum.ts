import { CsTagTone } from '@shared/ui';
import { I18nService } from '@core/i18n/i18n.service';

/** Máquina de estados do Voucher (com.nimbusnovax.voucher.model.enums.StatusVoucherEnum no
 *  backend, serializado pelo nome do enum Java). Nasce DEALING; EXCHANGED e CALLED_OFF são
 *  estados finais (nenhuma transição a partir deles tem efeito - ver Voucher.canChangeStatus). */
export enum StatusVoucher {
  DEALING = 'DEALING',
  CONFIRMED = 'CONFIRMED',
  EXCHANGED = 'EXCHANGED',
  OVERDUE = 'OVERDUE',
  CALLED_OFF = 'CALLED_OFF',
  NOT_CLOSED = 'NOT_CLOSED',
}

export type StatusVoucherInput = StatusVoucher | string | null | undefined;

export function normalizeStatusVoucher(status: StatusVoucherInput): StatusVoucher | null {
  if (status == null) return null;

  const normalized = String(status).trim().toUpperCase();

  switch (normalized) {
    case StatusVoucher.DEALING:
      return StatusVoucher.DEALING;
    case StatusVoucher.CONFIRMED:
      return StatusVoucher.CONFIRMED;
    case StatusVoucher.EXCHANGED:
      return StatusVoucher.EXCHANGED;
    case StatusVoucher.OVERDUE:
      return StatusVoucher.OVERDUE;
    case StatusVoucher.CALLED_OFF:
      return StatusVoucher.CALLED_OFF;
    case StatusVoucher.NOT_CLOSED:
      return StatusVoucher.NOT_CLOSED;
    default:
      return null;
  }
}

export function statusVoucherSeverity(status: StatusVoucherInput): CsTagTone {
  switch (normalizeStatusVoucher(status)) {
    case StatusVoucher.CONFIRMED:
      return 'success';
    case StatusVoucher.EXCHANGED:
      return 'teal';
    case StatusVoucher.DEALING:
      return 'info';
    case StatusVoucher.OVERDUE:
      return 'warn';
    case StatusVoucher.CALLED_OFF:
      return 'danger';
    case StatusVoucher.NOT_CLOSED:
      return 'secondary';
    default:
      return 'secondary';
  }
}

export function statusVoucherLabel(status: StatusVoucherInput, i18n: I18nService): string {
  switch (normalizeStatusVoucher(status)) {
    case StatusVoucher.DEALING:
      return i18n.tUi('enum.statusVoucher.dealing');
    case StatusVoucher.CONFIRMED:
      return i18n.tUi('enum.statusVoucher.confirmed');
    case StatusVoucher.EXCHANGED:
      return i18n.tUi('enum.statusVoucher.exchanged');
    case StatusVoucher.OVERDUE:
      return i18n.tUi('enum.statusVoucher.overdue');
    case StatusVoucher.CALLED_OFF:
      return i18n.tUi('enum.statusVoucher.calledOff');
    case StatusVoucher.NOT_CLOSED:
      return i18n.tUi('enum.statusVoucher.notClosed');
    default:
      return i18n.tUi('enum.statusVoucher.unknown', 'N/A');
  }
}

export function allStatusVoucher(): StatusVoucher[] {
  return [
    StatusVoucher.DEALING,
    StatusVoucher.CONFIRMED,
    StatusVoucher.EXCHANGED,
    StatusVoucher.OVERDUE,
    StatusVoucher.CALLED_OFF,
    StatusVoucher.NOT_CLOSED,
  ];
}

/** Status "em aberto" (voucher ainda não resolvido) - mesmo critério já aplicado no backend
 *  (VoucherService.HIDDEN_BY_DEFAULT escondia EXCHANGED/CALLED_OFF/NOT_CLOSED quando a busca não
 *  informava nenhum status). Usado como filtro avançado pré-selecionado na listagem (a pedido do
 *  usuário: a tela deve abrir já filtrando Negociando/Vencido/Confirmado) - agora explícito na UI
 *  em vez de um comportamento implícito só do backend. */
export function defaultVisibleStatusVoucher(): StatusVoucher[] {
  return [StatusVoucher.DEALING, StatusVoucher.OVERDUE, StatusVoucher.CONFIRMED];
}
