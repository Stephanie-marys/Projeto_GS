export interface ConfiguracaoCantina {
  nomeCantina: string;
  /** Horário de abertura no formato "HH:MM" (horário de Brasília). */
  horarioAbertura: string;
  /** Horário de fechamento no formato "HH:MM" (horário de Brasília). */
  horarioFechamento: string;
  /** Pausa manual: quando false, a cantina não recebe pedidos online. */
  aceitandoPedidos: boolean;
  /** Tempo médio de preparo de um pedido, usado na estimativa da fila. */
  tempoPreparoMinutos: number;
  /** Quantidade máxima de pedidos aguardando preparo/retirada ao mesmo tempo. */
  limitePedidosAtivos: number;
}

export interface DadosConfiguracaoForm {
  nomeCantina: string;
  horarioAbertura: string;
  horarioFechamento: string;
  aceitandoPedidos: boolean;
  tempoPreparoMinutos: number;
  limitePedidosAtivos: number;
}

export const CONFIGURACAO_PADRAO: ConfiguracaoCantina = {
  nomeCantina: "Cantina IFSP",
  horarioAbertura: "07:00",
  horarioFechamento: "22:00",
  aceitandoPedidos: true,
  tempoPreparoMinutos: 5,
  limitePedidosAtivos: 30,
};
