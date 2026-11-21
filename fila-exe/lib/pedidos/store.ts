import { obterConfiguracao } from "../configuracao/store.ts";
import { listarProdutos } from "../produtos/store.ts";
import {
  podeMudarStatus,
  validarPedido,
  type CamposPedido,
} from "./regras.ts";
import type { NovoPedidoInput, Pedido, StatusPedido } from "./types.ts";

/**
 * Mock de persistência em memória dos pedidos.
 *
 * Mesmo padrão dos demais stores: trocar por banco real depois não deve
 * exigir mudanças nas Server Actions e páginas que usam estas funções.
 *
 * ⚠️ Os dados vivem só na memória do servidor e se perdem a cada restart
 * do `npm run dev`.
 */
const pedidos: Pedido[] = [];
let proximoNumero = 1;

export type ResultadoRegistroPedido =
  | { sucesso: true; pedido: Pedido }
  | { sucesso: false; erros: Partial<Record<CamposPedido, string>> };

/**
 * Valida contra os produtos, a configuração e a fila do momento e, se
 * estiver tudo certo, grava o pedido com status "recebido" e uma senha.
 * O preço dos itens fica congelado no pedido.
 */
export function registrarPedido(
  entrada: NovoPedidoInput,
  agora: Date = new Date()
): ResultadoRegistroPedido {
  const resultado = validarPedido(entrada, {
    produtos: listarProdutos(),
    config: obterConfiguracao(),
    pedidos,
    agora,
  });

  if (!resultado.valido || !resultado.dados) {
    return { sucesso: false, erros: resultado.erros };
  }

  const momento = agora.toISOString();
  const pedido: Pedido = {
    id: crypto.randomUUID(),
    numero: proximoNumero++,
    status: "recebido",
    criadoEm: momento,
    atualizadoEm: momento,
    historico: [{ status: "recebido", em: momento }],
    ...resultado.dados,
  };
  pedidos.push(pedido);

  return { sucesso: true, pedido: clonar(pedido) };
}

export type ResultadoMudancaStatus =
  | { sucesso: true; pedido: Pedido }
  | { sucesso: false; erro: string };

export function atualizarStatusPedido(
  id: string,
  novoStatus: StatusPedido,
  agora: Date = new Date()
): ResultadoMudancaStatus {
  const pedido = pedidos.find((p) => p.id === id);
  if (!pedido) {
    return { sucesso: false, erro: "Pedido não encontrado." };
  }
  if (!podeMudarStatus(pedido.status, novoStatus)) {
    return {
      sucesso: false,
      erro: `O pedido #${pedido.numero} não pode passar de "${pedido.status}" para "${novoStatus}".`,
    };
  }

  const momento = agora.toISOString();
  pedido.status = novoStatus;
  pedido.atualizadoEm = momento;
  pedido.historico.push({ status: novoStatus, em: momento });

  return { sucesso: true, pedido: clonar(pedido) };
}

/** Pedidos mais recentes primeiro. */
export function listarPedidos(): Pedido[] {
  return pedidos
    .map(clonar)
    .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm) || b.numero - a.numero);
}

function clonar(pedido: Pedido): Pedido {
  return {
    ...pedido,
    itens: pedido.itens.map((i) => ({ ...i })),
    historico: pedido.historico.map((h) => ({ ...h })),
  };
}

/** Utilitário para testes — não deve ser usado em código de produção. */
export function limparPedidos(): void {
  pedidos.length = 0;
  proximoNumero = 1;
}
