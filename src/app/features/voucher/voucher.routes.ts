import { Routes } from '@angular/router';

import { permissionGuard } from '@core/auth/permission.guard';
import { PERMISSIONS } from '@core/auth/permissions.constants';

export const VOUCHER_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'routes.voucher.list.title',
    canActivate: [permissionGuard],
    data: {
      requireAll: false,
      redirectTo: '/forbidden',
      permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.VOUCHERS.VIEW],
    },
    loadComponent: () =>
      import('./voucher-list/voucher-list.component').then((m) => m.VoucherListComponent),
  },
  {
    path: 'dashboard',
    pathMatch: 'full',
    redirectTo: '/dashboard',
  },
  {
    path: '**',
    title: 'routes.notFound.title',
    loadComponent: () => import('../error/not-found/not-found.page').then((m) => m.NotFoundPage),
  },
];
