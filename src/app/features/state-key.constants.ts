export const STATE_KEY = {
  NIMBUSNOVAX: {
    /* Segurança */
    SECURITY: {
      USERS: {
        TABLE: {
          ROWS: { V1: 'users.table.rows' },
          STATE: { V1: 'nimbusnovax.users.table.state.v1' },
        },
        FILTERS: { V1: 'nimbusnovax.users.filters.v1' },
      },
      GROUPS: {
        TABLE: {
          ROWS: { V1: 'groups.table.rows' },
          STATE: { V1: 'nimbusnovax.groups.table.state.v1' },
        },
        FILTERS: { V1: 'nimbusnovax.groups.filters.v1' },
      },
    },

    /* Administração (com.nimbusnovax.administracao no backend) */
    ADMINISTRACAO: {
      AGENTES: {
        TABLE: {
          ROWS: { V1: 'agentes.table.rows' },
          STATE: { V1: 'nimbusnovax.agentes.table.state.v1' },
        },
        FILTERS: { V1: 'nimbusnovax.agentes.filters.v1' },
      },
      PRODUTOS: {
        TABLE: {
          ROWS: { V1: 'produtos.table.rows' },
          STATE: { V1: 'nimbusnovax.produtos.table.state.v1' },
        },
        FILTERS: { V1: 'nimbusnovax.produtos.filters.v1' },
      },
      MOTIVO_CANCELAMENTO: {
        TABLE: {
          ROWS: { V1: 'motivo-cancelamento.table.rows' },
          STATE: { V1: 'nimbusnovax.motivo-cancelamento.table.state.v1' },
        },
        FILTERS: { V1: 'nimbusnovax.motivo-cancelamento.filters.v1' },
      },
    },

    /* Voucher (com.nimbusnovax.voucher no backend) */
    VOUCHER: {
      TABLE: {
        ROWS: { V1: 'voucher.table.rows' },
        STATE: { V1: 'nimbusnovax.voucher.table.state.v1' },
      },
      FILTERS: { V1: 'nimbusnovax.voucher.filters.v1' },
    },

    /* Configurações > Auditoria de E-mail (com.nimbusnovax.common.notification.mail no backend) */
    SETTINGS: {
      EMAIL_LOG: {
        TABLE: {
          ROWS: { V1: 'email-log.table.rows' },
          STATE: { V1: 'nimbusnovax.email-log.table.state.v1' },
        },
        FILTERS: { V1: 'nimbusnovax.email-log.filters.v1' },
      },
    },
  },
};
