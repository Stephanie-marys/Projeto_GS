import type { FormaPagamento, ItemVenda } from "../vendas/types.ts";

/**
 * Ciclo de vida do pedido:
 *   recebido → em_preparo → pronto → entregue
 *   recebido / em_preparo → cancelado
 */
export type StatusPedido =
  | "recebido"
  | "em_preparo"
  | "pronto"
  | "entregue"
  | "cancelado";

export const STATUS_PEDIDO: StatusPedido[] = [
  "recebido",
  "em_preparo",
  "pronto",
  "entregue",
  "cancelado",
];

export const ROTULO_STATUS_PEDIDO: Record<StatusPedido, string> = {
  recebido: "Recebido",
  em_preparo: "Em preparo",
  pronto: "Pronto para retirada",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

/** Status em que o pedido ainda ocupa lugar na fila. */
export const STATUS_ATIVOS: StatusPedido[] = ["recebido", "em_preparo", "pronto"];

export interface MudancaStatus {
  status: StatusPedido;
  em: string;
}

export interface Pedido {
  id: string;
  /** Senha exibida na fila (sequencial, começa em 1). */
  numero: number;
  clienteNome: string;
  itens: ItemVenda[];
  total: number;
  /** O pagamento é feito na retirada, com a forma escolhida no pedido. */
  formaPagamento: FormaPagamento;
  observacao?: string;
  status: StatusPedido;
  criadoEm: string;
  atualizadoEm: string;
  historico: MudancaStatus[];
}

export interface ItemPedidoInput {
  produtoId: string;
  quantidade: number;
}

export interface NovoPedidoInput {
  clienteNome: string;
  itens: ItemPedidoInput[];
  formaPagamento: string;
  observacao?: string;
}
