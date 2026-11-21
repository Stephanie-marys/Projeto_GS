import type { ConfiguracaoCantina } from "../configuracao/types.ts";
import { situacaoCantina } from "../configuracao/regras.ts";
import type { Produto } from "../produtos/types.ts";
import { agruparItens, QUANTIDADE_MAXIMA_POR_ITEM } from "../vendas/regras.ts";
import {
  FORMAS_PAGAMENTO,
  type FormaPagamento,
  type ItemVenda,
} from "../vendas/types.ts";
import {
  STATUS_ATIVOS,
  type NovoPedidoInput,
  type Pedido,
  type StatusPedido,
} from "./types.ts";

/**
 * Regras do Registro de Pedidos (1.2.1), Fila Virtual (1.5.1) e
 * Controle de Pedidos (1.6.1).
 *
 * O pedido é feito pelo aluno/servidor pelo sistema, com produtos do
 * catálogo, e pago na retirada. Ele entra na fila com uma senha e passa
 * pelos status recebido → em preparo → pronto → entregue (ou cancelado).
 *
 * Funções puras: recebem produtos, configuração, pedidos e `agora` por
 * parâmetro para poderem ser testadas isoladamente.
 */

export const TAMANHO_MINIMO_NOME = 2;
export const TAMANHO_MAXIMO_NOME = 100;
export const TAMANHO_MAXIMO_OBSERVACAO = 200;
export const MAXIMO_ITENS_DIFERENTES = 20;

export type CamposPedido =
  | "geral"
  | "clienteNome"
  | "itens"
  | "formaPagamento"
  | "observacao";

export interface DadosPedidoCalculados {
  clienteNome: string;
  itens: ItemVenda[];
  total: number;
  formaPagamento: FormaPagamento;
  observacao?: string;
}

export interface ResultadoValidacaoPedido {
  valido: boolean;
  erros: Partial<Record<CamposPedido, string>>;
  dados?: DadosPedidoCalculados;
}

export interface ContextoPedido {
  produtos: Produto[];
  config: ConfiguracaoCantina;
  pedidos: Pedido[];
  agora: Date;
}

export function pedidosAtivos(pedidos: Pedido[]): Pedido[] {
  return pedidos.filter((p) => STATUS_ATIVOS.includes(p.status));
}

/**
 * Valida um novo pedido.
 *
 * Regras:
 *  - a cantina precisa estar aberta (horário + não pausada);
 *  - a fila não pode ter atingido o limite de pedidos ativos;
 *  - nome do cliente obrigatório (2 a 100 caracteres) — é como ele será
 *    chamado na retirada;
 *  - ao menos um item; no máximo 20 produtos diferentes;
 *  - cada produto precisa existir e estar disponível, com quantidade
 *    inteira de 1 a QUANTIDADE_MAXIMA_POR_ITEM;
 *  - forma de pagamento (na retirada) precisa ser uma das aceitas;
 *  - observação opcional, até 200 caracteres.
 */
export function validarPedido(
  entrada: NovoPedidoInput,
  contexto: ContextoPedido
): ResultadoValidacaoPedido {
  const erros: Partial<Record<CamposPedido, string>> = {};

  const situacao = situacaoCantina(contexto.config, contexto.agora);
  if (!situacao.aberta) {
    return { valido: false, erros: { geral: situacao.motivo } };
  }

  if (pedidosAtivos(contexto.pedidos).length >= contexto.config.limitePedidosAtivos) {
    return {
      valido: false,
      erros: {
        geral:
          "A fila está cheia no momento. Aguarde alguns pedidos serem entregues e tente novamente.",
      },
    };
  }

  const clienteNome = (entrada.clienteNome ?? "").trim();
  if (clienteNome.length < TAMANHO_MINIMO_NOME) {
    erros.clienteNome = "Informe seu nome para ser chamado na retirada.";
  } else if (clienteNome.length > TAMANHO_MAXIMO_NOME) {
    erros.clienteNome = `O nome deve ter no máximo ${TAMANHO_MAXIMO_NOME} caracteres.`;
  }

  const observacao = (entrada.observacao ?? "").trim();
  if (observacao.length > TAMANHO_MAXIMO_OBSERVACAO) {
    erros.observacao = `A observação deve ter no máximo ${TAMANHO_MAXIMO_OBSERVACAO} caracteres.`;
  }

  const problemasItens: string[] = [];
  const itensAgrupados = agruparItens(entrada.itens ?? []);
  const itens: ItemVenda[] = [];

  if (itensAgrupados.length === 0) {
    problemasItens.push("Adicione ao menos um produto ao pedido.");
  } else if (itensAgrupados.length > MAXIMO_ITENS_DIFERENTES) {
    problemasItens.push(
      `O pedido pode ter no máximo ${MAXIMO_ITENS_DIFERENTES} produtos diferentes.`
    );
  }

  for (const item of itensAgrupados) {
    const produto = contexto.produtos.find((p) => p.id === item.produtoId);

    if (!produto) {
      problemasItens.push("Há um produto no pedido que não existe mais no cadastro.");
      continue;
    }
    if (!produto.disponivel) {
      problemasItens.push(`"${produto.nome}" acabou e não pode ser pedido agora.`);
      continue;
    }
    if (
      !Number.isInteger(item.quantidade) ||
      item.quantidade < 1 ||
      item.quantidade > QUANTIDADE_MAXIMA_POR_ITEM
    ) {
      problemasItens.push(
        `Quantidade inválida para "${produto.nome}": use um número inteiro de 1 a ${QUANTIDADE_MAXIMA_POR_ITEM}.`
      );
      continue;
    }

    const precoCentavos = Math.round(produto.preco * 100);
    itens.push({
      produtoId: produto.id,
      nome: produto.nome,
      precoUnitario: precoCentavos / 100,
      quantidade: item.quantidade,
      subtotal: (precoCentavos * item.quantidade) / 100,
    });
  }

  if (problemasItens.length > 0) {
    erros.itens = problemasItens.join(" ");
  }

  const formaPagamento = entrada.formaPagamento as FormaPagamento;
  if (!FORMAS_PAGAMENTO.includes(formaPagamento)) {
    erros.formaPagamento = "Selecione como você vai pagar na retirada.";
  }

  if (Object.keys(erros).length > 0) {
    return { valido: false, erros };
  }

  const totalCentavos = itens.reduce(
    (soma, item) => soma + Math.round(item.subtotal * 100),
    0
  );

  return {
    valido: true,
    erros: {},
    dados: {
      clienteNome,
      itens,
      total: totalCentavos / 100,
      formaPagamento,
      observacao: observacao || undefined,
    },
  };
}

// ---------------------------------------------------------------------------
// Controle de Pedidos — transições de status
// ---------------------------------------------------------------------------

const TRANSICOES: Record<StatusPedido, StatusPedido[]> = {
  recebido: ["em_preparo", "cancelado"],
  em_preparo: ["pronto", "cancelado"],
  pronto: ["entregue"],
  entregue: [],
  cancelado: [],
};

/** Próximos status possíveis a partir do status atual. */
export function proximosStatus(atual: StatusPedido): StatusPedido[] {
  return TRANSICOES[atual] ?? [];
}

/**
 * Um pedido só avança uma etapa por vez, não volta atrás, e não pode ser
 * cancelado depois de pronto (a comida já foi feita — vira entrega).
 * Entregue e cancelado são finais.
 */
export function podeMudarStatus(atual: StatusPedido, novo: StatusPedido): boolean {
  return proximosStatus(atual).includes(novo);
}

// ---------------------------------------------------------------------------
// Fila Virtual
// ---------------------------------------------------------------------------

/** Pedidos ativos em ordem de chegada (o primeiro a pedir é o primeiro da fila). */
export function montarFila(pedidos: Pedido[]): Pedido[] {
  return pedidosAtivos(pedidos).sort(
    (a, b) => a.criadoEm.localeCompare(b.criadoEm) || a.numero - b.numero
  );
}

export type AcompanhamentoPedido =
  | {
      encontrado: true;
      pedido: Pedido;
      /** Pedidos ainda não prontos que chegaram antes deste. */
      pedidosAFrente: number;
      /** Estimativa em minutos até ficar pronto (0 se já está pronto/finalizado). */
      estimativaMinutos: number;
    }
  | { encontrado: false };

/**
 * Posição do pedido na fila e estimativa de espera.
 *
 * A cozinha prepara um pedido por vez, na ordem de chegada; a estimativa é
 * (pedidos à frente ainda não prontos + o próprio) × tempo médio de preparo.
 */
export function acompanharPedido(
  pedidos: Pedido[],
  numero: number,
  tempoPreparoMinutos: number
): AcompanhamentoPedido {
  const pedido = pedidos.find((p) => p.numero === numero);
  if (!pedido) return { encontrado: false };

  if (pedido.status !== "recebido" && pedido.status !== "em_preparo") {
    return { encontrado: true, pedido, pedidosAFrente: 0, estimativaMinutos: 0 };
  }

  const fila = montarFila(pedidos).filter(
    (p) => p.status === "recebido" || p.status === "em_preparo"
  );
  const posicao = fila.findIndex((p) => p.id === pedido.id);
  const pedidosAFrente = Math.max(0, posicao);

  return {
    encontrado: true,
    pedido,
    pedidosAFrente,
    estimativaMinutos: (pedidosAFrente + 1) * tempoPreparoMinutos,
  };
}

/**
 * Lê o número da senha vindo da URL. Qualquer coisa que não seja um
 * inteiro positivo vira null (não quebra a página).
 */
export function lerNumeroPedido(bruto: string | string[] | undefined): number | null {
  const texto = (Array.isArray(bruto) ? bruto[0] : bruto ?? "").trim();
  if (!/^\d{1,6}$/.test(texto)) return null;
  const numero = Number(texto);
  return numero >= 1 ? numero : null;
}
