import { Injectable, inject } from '@angular/core';

import { PERMISSIONS } from '@core/auth/permissions.constants';
import { PermissionService } from '@core/auth/permission.service';
import { RecordStatus } from '@models/enums/record-status.enum';
import { ProductModel } from '@models/produtos.models';

export interface ProductPermissionTarget extends Pick<ProductModel, 'id' | 'status'> {}

@Injectable({ providedIn: 'root' })
export class ProdutosPermissionPolicy {
  private readonly perms = inject(PermissionService);

  canView(): boolean {
    return this.perms.hasSupportOr(PERMISSIONS.PRODUTOS.VIEW);
  }

  canCreate(): boolean {
    return this.perms.hasSupportOr(PERMISSIONS.PRODUTOS.CREATE);
  }

  canEdit(_row: ProductPermissionTarget): boolean {
    return this.perms.hasSupportOr(PERMISSIONS.PRODUTOS.CHANGE);
  }

  canDelete(_row: ProductPermissionTarget): boolean {
    return this.perms.hasSupportOr(PERMISSIONS.PRODUTOS.DELETE);
  }

  canActivate(row: ProductPermissionTarget): boolean {
    return this.perms.hasSupportOr(PERMISSIONS.PRODUTOS.CHANGE) && row.status !== RecordStatus.ACTIVE;
  }

  canDeactivate(row: ProductPermissionTarget): boolean {
    return this.perms.hasSupportOr(PERMISSIONS.PRODUTOS.CHANGE) && row.status === RecordStatus.ACTIVE;
  }

  editDisabledReason(_row: ProductPermissionTarget): string | null {
    if (!this.canEdit(_row)) return 'produtos.action.edit.noPermission';
    return null;
  }

  deleteDisabledReason(_row: ProductPermissionTarget): string | null {
    if (!this.canDelete(_row)) return 'produtos.action.delete.noPermission';
    return null;
  }
}
