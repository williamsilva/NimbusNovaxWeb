export interface ConfigVoucherModel {
  id: string;
  senderMail: boolean;
  daysToExpire: number;
  daysToCancel: number;
  numberPendingVouchers: number;
  emailBody: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface ConfigVoucherUpdateInput {
  senderMail?: boolean;
  daysToExpire: number;
  daysToCancel: number;
  numberPendingVouchers: number;
  emailBody?: string | null;
}

export interface ConfigVoucherApiModel {
  id: string;
  senderMail?: boolean | null;
  daysToExpire: number;
  daysToCancel: number;
  numberPendingVouchers: number;
  emailBody?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export function mapConfigVoucherApiModel(input: ConfigVoucherApiModel): ConfigVoucherModel {
  return {
    id: input.id,
    senderMail: !!input.senderMail,
    daysToExpire: input.daysToExpire,
    daysToCancel: input.daysToCancel,
    numberPendingVouchers: input.numberPendingVouchers,
    emailBody: input.emailBody ?? null,
    createdAt: input.createdAt ?? null,
    updatedAt: input.updatedAt ?? null,
  };
}

/** Usuário que hoje recebe o aviso diário de vouchers vencidos (tem a permissão
 *  VOUCHER_NOTIFICATION no NimbusAuth) - só leitura, ver GET /voucher-config/notification-recipients.
 *  Concedida/revogada no NimbusAuth (grupo NOTIFICAÇÕES), não nesta tela. */
export interface VoucherNotificationRecipientModel {
  name: string;
  username: string;
}
