/**
 * Rótulos livres (String, sem enum fixo no backend - ver EmailSenderService.Message.eventType) -
 * lista dos eventos conhecidos HOJE (VoucherFlowService/VoucherScheduledTasks), só para popular o
 * filtro multiSelect da tela de auditoria. Um evento novo no backend precisa ser adicionado aqui
 * manualmente (mesmo espírito do gotcha já documentado pra ui-keys.ts) - sem isso, o valor ainda
 * aparece na listagem (eventType é texto puro), só não entra como opção do filtro.
 */
export const EMAIL_LOG_EVENT_TYPE_VALUES: string[] = [
  'voucher_send',
  'voucher_change',
  'voucher_expired_warning',
];

export function emailLogEventTypeI18nKey(eventType: string): string {
  return `emailLog.eventType.${eventType}`;
}
