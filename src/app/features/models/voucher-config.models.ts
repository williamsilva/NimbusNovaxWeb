export interface ConfigVoucherModel {
  id: string;
  senderMail: boolean;
  daysToExpire: number;
  daysToCancel: number;
  numberPendingVouchers: number;
  emailBody: string | null;
  notificationEmails: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface ConfigVoucherUpdateInput {
  senderMail?: boolean;
  daysToExpire: number;
  daysToCancel: number;
  numberPendingVouchers: number;
  emailBody?: string | null;
  notificationEmails?: string | null;
}

export interface ConfigVoucherApiModel {
  id: string;
  senderMail?: boolean | null;
  daysToExpire: number;
  daysToCancel: number;
  numberPendingVouchers: number;
  emailBody?: string | null;
  notificationEmails?: string | null;
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
    notificationEmails: input.notificationEmails ?? null,
    createdAt: input.createdAt ?? null,
    updatedAt: input.updatedAt ?? null,
  };
}
