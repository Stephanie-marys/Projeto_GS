import type { CamposPedido } from "@/lib/pedidos/regras";

export interface NovoPedidoState {
  success: boolean;
  message: string;
  errors: Partial<Record<CamposPedido, string>>;
  /** Senha do último pedido registrado com sucesso. */
  numero?: number;
  sequencia: number;
}

export const estadoInicialPedido: NovoPedidoState = {
  success: false,
  message: "",
  errors: {},
  sequencia: 0,
};
