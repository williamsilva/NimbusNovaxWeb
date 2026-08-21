import { Injectable, inject } from '@angular/core';

import { PERMISSIONS } from '@core/auth/permissions.constants';
import { PermissionService } from '@core/auth/permission.service';
import { isSystemGenerated } from '@models/enums/generation.enum';
import { CancellationReasonModel } from '@models/motivo-cancelamento.models';

export interface CancellationReasonPermissionTarget
  extends Pick<CancellationReasonModel, 'id' | 'generation'> {}

/** Motivos SYSTEM (seed) ficam protegidos contra edição/exclusão só aqui na UI - o backend nunca
 *  impôs esse bloqueio (ver CancellationReasonService, que sempre força generation=USER no save
 *  independente do valor anterior), fidelidade total ao sistema legado. */
@Injectable({ providedIn: 'root' })
export class MotivoCancelamentoPermissionPolicy {
  private readonly perms = inject(PermissionService);

  canView(): boolean {
    return this.perms.hasSupportOr(PERMISSIONS.MOTIVO_CANCELAMENTO.VIEW);
  }

  canCreate(): boolean {
    return this.perms.hasSupportOr(PERMISSIONS.MOTIVO_CANCELAMENTO.CREATE);
  }

  canEdit(row: CancellationReasonPermissionTarget): boolean {
    if (!this.perms.hasSupportOr(PERMISSIONS.MOTIVO_CANCELAMENTO.CHANGE)) return false;
    return !isSystemGenerated(row.generation);
  }

  canDelete(row: CancellationReasonPermissionTarget): boolean {
    if (!this.perms.hasSupportOr(PERMISSIONS.MOTIVO_CANCELAMENTO.DELETE)) return false;
    return !isSystemGenerated(row.generation);
  }

  editDisabledReason(row: CancellationReasonPermissionTarget): string | null {
    if (isSystemGenerated(row.generation)) return 'motivoCancelamento.action.edit.system';
    if (!this.canEdit(row)) return 'motivoCancelamento.action.edit.noPermission';
    return null;
  }

  deleteDisabledReason(row: CancellationReasonPermissionTarget): string | null {
    if (isSystemGenerated(row.generation)) return 'motivoCancelamento.action.delete.system';
    if (!this.canDelete(row)) return 'motivoCancelamento.action.delete.noPermission';
    return null;
  }
}
