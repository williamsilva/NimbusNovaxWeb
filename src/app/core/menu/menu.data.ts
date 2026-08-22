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
      {
        labelKey: 'menu.voucher.dashboard',
        icon: 'pi pi-chart-pie text-cyan-400',
        route: '/voucher/dashboard',
        exact: false,
        permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.VOUCHERS.VIEW],
      },
    ],
  },
  /* Security */
  {
    icon: 'pi pi-shield text-red-600',
    labelKey: 'menu.security.title',
    children: [
      {
        labelKey: 'menu.security.users',
        icon: 'pi pi-user text-red-400',
        route: '/security/users',
        exact: false,
        permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.USERS.VIEW],
      },
      {
        labelKey: 'menu.security.groups',
        icon: 'pi pi-id-card text-red-400',
        route: '/security/groups',
        exact: false,
        permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.GROUPS.VIEW],
      },
    ],
  },
  /* Settings — cor slate */
  {
    icon: 'pi pi-cog text-slate-600',
    labelKey: 'menu.settings.title',
    children: [
      {
        exact: false,
        route: '/settings/email',
        labelKey: 'menu.settings.email',
        icon: 'pi pi-envelope text-slate-400',
        permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.SETTINGS.EMAIL_VIEW],
      },
      {
        exact: false,
        route: '/settings/backup',
        labelKey: 'menu.settings.backup',
        icon: 'pi pi-database text-slate-400',
        permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.SETTINGS.BACKUP_PROCESS],
      },
      {
        exact: false,
        route: '/settings/email-log',
        labelKey: 'menu.settings.emailLog',
        icon: 'pi pi-history text-slate-400',
        permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.SETTINGS.EMAIL_LOG_VIEW],
      },
      {
        exact: false,
        route: '/settings/voucher',
        labelKey: 'menu.settings.voucher',
        icon: 'pi pi-ticket text-slate-400',
        permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.VOUCHER_CONFIG.VIEW],
      },
    ],
  },
];
