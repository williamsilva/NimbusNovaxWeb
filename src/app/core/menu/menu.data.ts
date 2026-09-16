import { environment } from 'environments/environment';

import { PERMISSIONS } from '@core/auth/permissions.constants';

import { AppMenuItem } from './menu.model';

export const APP_MENU: AppMenuItem[] = [
  {
    icon: 'pi pi-home text-blue-600',
    labelKey: 'menu.dashboard',
    route: '/dashboard',
    exact: true,
  },
  /* Administração — cor âmbar */
  {
    icon: 'pi pi-briefcase text-amber-600',
    labelKey: 'menu.administracao.title',
    children: [
      {
        labelKey: 'menu.administracao.agentes',
        icon: 'pi pi-id-card text-amber-400',
        route: '/administracao/agentes',
        exact: false,
        permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.AGENTES.VIEW],
      },
      {
        labelKey: 'menu.administracao.produtos',
        icon: 'pi pi-truck text-amber-400',
        route: '/administracao/produtos',
        exact: false,
        permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.PRODUTOS.VIEW],
      },
      {
        labelKey: 'menu.administracao.motivoCancelamento',
        icon: 'pi pi-ban text-amber-400',
        route: '/administracao/motivo-cancelamento',
        exact: false,
        permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.MOTIVO_CANCELAMENTO.VIEW],
      },
    ],
  },
  /* Voucher — cor cyan */
  {
    icon: 'pi pi-ticket text-cyan-600',
    labelKey: 'menu.voucher.title',
    children: [
      {
        labelKey: 'menu.voucher.list',
        icon: 'pi pi-list text-cyan-400',
        route: '/voucher',
        exact: true,
        permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.VOUCHERS.VIEW],
      },
    ],
  },
  /* Settings — cor indigo */
  {
    icon: 'pi pi-cog text-indigo-600',
    labelKey: 'menu.settings.title',
    children: [
      {
        labelKey: 'menu.settings.backup',
        icon: 'pi pi-database text-indigo-400',
        externalUrl: `${environment.nimbusAuthWebUrl}/backup`,
        permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.SETTINGS.BACKUP_PROCESS],
      },
      {
        exact: false,
        route: '/settings/voucher',
        labelKey: 'menu.settings.voucher',
        icon: 'pi pi-ticket text-indigo-400',
        permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.VOUCHER_CONFIG.VIEW],
      },
      {
        exact: false,
        route: '/settings/company',
        labelKey: 'menu.settings.company',
        icon: 'pi pi-building text-indigo-400',
        permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.SETTINGS.COMPANY_VIEW],
      },
    ],
  },
];
