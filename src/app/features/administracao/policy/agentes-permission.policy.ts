import { Injectable, inject } from '@angular/core';

import { PERMISSIONS } from '@core/auth/permissions.constants';
import { PermissionService } from '@core/auth/permission.service';

@Injectable({ providedIn: 'root' })
export class AgentesPermissionPolicy {
  private readonly perms = inject(PermissionService);

  canView(): boolean {
    return this.perms.hasSupportOr(PERMISSIONS.AGENTES.VIEW);
  }

  canCreate(): boolean {
    return this.perms.hasSupportOr(PERMISSIONS.AGENTES.CREATE);
  }

  canEdit(): boolean {
    return this.perms.hasSupportOr(PERMISSIONS.AGENTES.CHANGE);
  }

  canDelete(): boolean {
    return this.perms.hasSupportOr(PERMISSIONS.AGENTES.DELETE);
  }
}
