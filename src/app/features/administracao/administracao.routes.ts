import { Routes } from '@angular/router';

import { permissionGuard } from '@core/auth/permission.guard';
import { PERMISSIONS } from '@core/auth/permissions.constants';

export const ADMINISTRACAO_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'agentes' },
  {
    path: 'agentes',
    title: 'routes.administracao.agentes.title',
    canActivate: [permissionGuard],
    data: {
      requireAll: false,
      redirectTo: '/forbidden',
      permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.AGENTES.VIEW],
    },
    loadComponent: () =>
      import('./agentes/agentes-list/agentes-list.component').then((m) => m.AgentesListComponent),
  },
  {
    path: 'produtos',
    title: 'routes.administracao.produtos.title',
    canActivate: [permissionGuard],
    data: {
      requireAll: false,
      redirectTo: '/forbidden',
      permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.PRODUTOS.VIEW],
    },
    loadComponent: () =>
      import('./produtos/produtos-list/produtos-list.component').then((m) => m.ProdutosListComponent),
  },
  {
    path: 'motivo-cancelamento',
    title: 'routes.administracao.motivoCancelamento.title',
    canActivate: [permissionGuard],
    data: {
      requireAll: false,
      redirectTo: '/forbidden',
      permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.MOTIVO_CANCELAMENTO.VIEW],
    },
    loadComponent: () =>
      import('./motivo-cancelamento/motivo-cancelamento-list/motivo-cancelamento-list.component').then(
        (m) => m.MotivoCancelamentoListComponent,
      ),
  },
  {
    path: '**',
    title: 'routes.notFound.title',
    loadComponent: () => import('../error/not-found/not-found.page').then((m) => m.NotFoundPage),
  },
];
