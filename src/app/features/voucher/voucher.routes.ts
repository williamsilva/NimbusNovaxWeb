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
    title: 'routes.voucher.dashboard.title',
    canActivate: [permissionGuard],
    data: {
      requireAll: false,
      redirectTo: '/forbidden',
      permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.VOUCHERS.VIEW],
    },
    loadComponent: () =>
      import('./voucher-dashboard/voucher-dashboard.component').then((m) => m.VoucherDashboardComponent),
  },
  {
    path: 'config',
    title: 'routes.voucher.config.title',
    canActivate: [permissionGuard],
    data: {
      requireAll: false,
      redirectTo: '/forbidden',
      permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.VOUCHER_CONFIG.VIEW],
    },
    loadComponent: () =>
      import('./voucher-config/voucher-config-page.component').then((m) => m.VoucherConfigPageComponent),
  },
  {
    path: '**',
    title: 'routes.notFound.title',
    loadComponent: () => import('../error/not-found/not-found.page').then((m) => m.NotFoundPage),
  },
];
