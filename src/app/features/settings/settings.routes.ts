import { Routes } from '@angular/router';

import { permissionGuard } from '@core/auth/permission.guard';
import { PERMISSIONS } from '@core/auth/permissions.constants';

export const SETTINGS_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'voucher' },
  {
    path: 'voucher',
    title: 'routes.settings.voucher.title',
    canActivate: [permissionGuard],
    data: {
      requireAll: false,
      redirectTo: '/forbidden',
      permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.VOUCHER_CONFIG.VIEW],
    },
    loadComponent: () =>
      import('../voucher/voucher-config/voucher-config-page.component').then(
        (m) => m.VoucherConfigPageComponent,
      ),
  },
  {
    path: 'company',
    title: 'routes.settings.company.title',
    canActivate: [permissionGuard],
    data: {
      requireAll: false,
      redirectTo: '/forbidden',
      permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.SETTINGS.COMPANY_VIEW],
    },
    loadComponent: () =>
      import('./company-settings/company-settings-page.component').then(
        (m) => m.CompanySettingsPageComponent,
      ),
  },
  {
    path: '**',
    title: 'routes.notFound.title',
    loadComponent: () => import('../error/not-found/not-found.page').then((m) => m.NotFoundPage),
  },
];
