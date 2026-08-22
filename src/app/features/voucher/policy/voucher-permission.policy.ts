import { Injectable, inject } from '@angular/core';

import { PERMISSIONS } from '@core/auth/permissions.constants';
import { PermissionService } from '@core/auth/permission.service';
import { StatusVoucher } from '@models/enums/status-voucher.enum';
import { VoucherModel } from '@models/voucher.models';

export interface VoucherPermissionTarget extends Pick<VoucherModel, 'id' | 'status' | 'totalPrice'> {}

/** Regras replicadas do sistema legado (Novax antigo): delete físico só em DEALING
 *  (VoucherConsultComponent.canCancel); as ações de fluxo (confirmar/não confirmar/trocar/
 *  cancelar/enviar e-mail) exigem VOUCHERS_CHANGE + o status atual permitir a transição (mesmas
 *  combinações do splitButton do formulário legado). */
@Injectable({ providedIn: 'root' })
export class VoucherPermissionPolicy {
  private readonly perms = inject(PermissionService);

  canView(): boolean {
    return this.perms.hasSupportOr(PERMISSIONS.VOUCHERS.VIEW);
  }

  canCreate(): boolean {
    return this.perms.hasSupportOr(PERMISSIONS.VOUCHERS.CREATE);
  }

  canEdit(_row: VoucherPermissionTarget): boolean {
    return this.perms.hasSupportOr(PERMISSIONS.VOUCHERS.CHANGE);
  }

  canDelete(row: VoucherPermissionTarget): boolean {
    return this.perms.hasSupportOr(PERMISSIONS.VOUCHERS.DELETE) && row.status === StatusVoucher.DEALING;
  }

  private canChange(): boolean {
    return this.perms.hasSupportOr(PERMISSIONS.VOUCHERS.CHANGE);
  }

  /** Voucher com valor zerado não pode ser confirmado - mesma regra do backend
   *  (VoucherFlowService.confirm). */
  canConfirm(row: VoucherPermissionTarget): boolean {
    return (
      this.canChange() &&
      (row.status === StatusVoucher.DEALING || row.status === StatusVoucher.OVERDUE) &&
      row.totalPrice > 0
    );
  }

  canNotConfirm(row: VoucherPermissionTarget): boolean {
    return this.canChange() && (row.status === StatusVoucher.DEALING || row.status === StatusVoucher.OVERDUE);
  }

  /** Só pode trocar (marcar como acessado) um voucher já CONFIRMED - mesma regra do backend
   *  (VoucherFlowService.change). */
  canChangeStatus(row: VoucherPermissionTarget): boolean {
    return this.canChange() && row.status === StatusVoucher.CONFIRMED;
  }

  canCancel(row: VoucherPermissionTarget): boolean {
    return (
      this.canChange() &&
      row.status !== StatusVoucher.DEALING &&
      row.status !== StatusVoucher.OVERDUE &&
      row.status !== StatusVoucher.CONFIRMED
    );
  }

  canSendEmail(row: VoucherPermissionTarget): boolean {
    return row.status !== StatusVoucher.CALLED_OFF && row.status !== StatusVoucher.OVERDUE;
  }

  canViewPdf(_row: VoucherPermissionTarget): boolean {
    return true;
  }

  canViewConfig(): boolean {
    return this.perms.hasSupportOr(PERMISSIONS.VOUCHER_CONFIG.VIEW);
  }

  canChangeConfig(): boolean {
    return this.perms.hasSupportOr(PERMISSIONS.VOUCHER_CONFIG.CHANGE);
  }
}
