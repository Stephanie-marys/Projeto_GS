import { FUSO_CANTINA } from "../configuracao/regras.ts";
import type { Pedido } from "../pedidos/types.ts";
import type { FormaPagamento, ItemVenda, Venda } from "../vendas/types.ts";

/**
 * Regras do Relatório de Vendas (pacote 1.8.1).
 *
 * Uma "venda" no relatório é:
 *  - toda venda presencial registrada no balcão; e
 *  - todo pedido online que foi ENTREGUE (o pagamento acontece na
 *    retirada — pedido cancelado ou ainda na fila não é venda).
 *
 * O período é filtrado por data no fuso de Brasília. Todos os valores são
 * somados em centavos para não acumular erro de ponto flutuante.
 */

export type OrigemVenda = "presencial" | "pedido";

export const ROTULO_ORIGEM: Record<OrigemVenda, string> = {
  presencial: "Venda presencial",
  pedido: "Pedido online",
};

export interface RegistroVenda {
  id: string;
  origem: OrigemVenda;
  /** Momento em que o dinheiro entrou (criação da venda / entrega do pedido). */
  data: string;
  total: number;
  formaPagamento: FormaPagamento;
  itens: ItemVenda[];
}

export interface FiltroRelatorio {
  /** "AAAA-MM-DD", inclusivo. */
  dataInicio: string;
  /** "AAAA-MM-DD", inclusivo. */
  dataFim: string;
}

export interface LinhaProduto {
  produtoId: string;
  nome: string;
  quantidade: number;
  total: number;
}

export interface LinhaAgrupada<Chave extends string> {
  chave: Chave;
  quantidadeVendas: number;
  total: number;
}

export interface Relatorio {
  filtro: FiltroRelatorio;
  quantidadeVendas: number;
  totalVendido: number;
  ticketMedio: number;
  itensVendidos: number;
  porFormaPagamento: LinhaAgrupada<FormaPagamento>[];
  porOrigem: LinhaAgrupada<OrigemVenda>[];
  porDia: LinhaAgrupada<string>[];
  produtosMaisVendidos: LinhaProduto[];
}

export const PERIODO_MAXIMO_DIAS = 366;

/** Data "AAAA-MM-DD" de um instante, no fuso da cantina. */
export function dataNaCantina(instante: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: FUSO_CANTINA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(instante);
}

function dataValida(texto: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false;
  const data = new Date(`${texto}T00:00:00Z`);
  return !Number.isNaN(data.getTime()) && data.toISOString().startsWith(texto);
}

function diasEntre(inicio: string, fim: string): number {
  const ms = Date.parse(`${fim}T00:00:00Z`) - Date.parse(`${inicio}T00:00:00Z`);
  return Math.round(ms / 86_400_000);
}

export interface ResultadoFiltroRelatorio {
  filtro: FiltroRelatorio;
  erro?: string;
}

/**
 * Valida o período vindo da URL. Sem parâmetros, o padrão é o dia de hoje.
 * Datas inválidas caem no padrão; início depois do fim é invertido; o
 * período é limitado a PERIODO_MAXIMO_DIAS (devolve um aviso em `erro`).
 */
export function validarFiltroRelatorio(
  entrada: { inicio?: string | string[]; fim?: string | string[] },
  agora: Date
): ResultadoFiltroRelatorio {
  const hoje = dataNaCantina(agora);
  const primeiro = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v ?? "").trim();

  const inicioBruto = primeiro(entrada.inicio);
  const fimBruto = primeiro(entrada.fim);

  let dataInicio = dataValida(inicioBruto) ? inicioBruto : "";
  let dataFim = dataValida(fimBruto) ? fimBruto : "";
  let erro: string | undefined;

  if ((inicioBruto && !dataInicio) || (fimBruto && !dataFim)) {
    erro = "Data inválida no filtro — usando o período padrão.";
  }

  if (!dataInicio && !dataFim) {
    dataInicio = hoje;
    dataFim = hoje;
  } else if (!dataInicio) {
    dataInicio = dataFim;
  } else if (!dataFim) {
    dataFim = dataInicio;
  }

  if (dataInicio > dataFim) {
    [dataInicio, dataFim] = [dataFim, dataInicio];
  }

  if (diasEntre(dataInicio, dataFim) + 1 > PERIODO_MAXIMO_DIAS) {
    const limite = new Date(Date.parse(`${dataFim}T00:00:00Z`));
    limite.setUTCDate(limite.getUTCDate() - (PERIODO_MAXIMO_DIAS - 1));
    dataInicio = limite.toISOString().slice(0, 10);
    erro = `O período máximo do relatório é de ${PERIODO_MAXIMO_DIAS} dias.`;
  }

  return { filtro: { dataInicio, dataFim }, erro };
}

/** Converte vendas presenciais e pedidos entregues num formato único. */
export function registrosDeVenda(vendas: Venda[], pedidos: Pedido[]): RegistroVenda[] {
  const presenciais: RegistroVenda[] = vendas.map((v) => ({
    id: v.id,
    origem: "presencial",
    data: v.criadoEm,
    total: v.total,
    formaPagamento: v.formaPagamento,
    itens: v.itens,
  }));

  const entregues: RegistroVenda[] = pedidos
    .filter((p) => p.status === "entregue")
    .map((p) => ({
      id: p.id,
      origem: "pedido",
      data: p.historico.find((h) => h.status === "entregue")?.em ?? p.atualizadoEm,
      total: p.total,
      formaPagamento: p.formaPagamento,
      itens: p.itens,
    }));

  return [...presenciais, ...entregues];
}

function centavos(valor: number): number {
  return Math.round(valor * 100);
}

function agrupar<Chave extends string>(
  registros: RegistroVenda[],
  chaveDe: (r: RegistroVenda) => Chave
): LinhaAgrupada<Chave>[] {
  const mapa = new Map<Chave, { quantidade: number; centavos: number }>();
  for (const r of registros) {
    const chave = chaveDe(r);
    const atual = mapa.get(chave) ?? { quantidade: 0, centavos: 0 };
    atual.quantidade += 1;
    atual.centavos += centavos(r.total);
    mapa.set(chave, atual);
  }
  return [...mapa.entries()].map(([chave, v]) => ({
    chave,
    quantidadeVendas: v.quantidade,
    total: v.centavos / 100,
  }));
}

/**
 * Gera o relatório do período: totais, ticket médio, quebras por forma de
 * pagamento, origem e dia, e ranking de produtos (por quantidade, depois
 * por valor, depois nome).
 */
export function gerarRelatorio(
  registros: RegistroVenda[],
  filtro: FiltroRelatorio
): Relatorio {
  const doPeriodo = registros.filter((r) => {
    const dia = dataNaCantina(new Date(r.data));
    return dia >= filtro.dataInicio && dia <= filtro.dataFim;
  });

  const totalCentavos = doPeriodo.reduce((s, r) => s + centavos(r.total), 0);
  const quantidadeVendas = doPeriodo.length;

  const produtos = new Map<string, { nome: string; quantidade: number; centavos: number }>();
  let itensVendidos = 0;
  for (const r of doPeriodo) {
    for (const item of r.itens) {
      const atual = produtos.get(item.produtoId) ?? {
        nome: item.nome,
        quantidade: 0,
        centavos: 0,
      };
      atual.quantidade += item.quantidade;
      atual.centavos += centavos(item.subtotal);
      produtos.set(item.produtoId, atual);
      itensVendidos += item.quantidade;
    }
  }

  const produtosMaisVendidos = [...produtos.entries()]
    .map(([produtoId, v]) => ({
      produtoId,
      nome: v.nome,
      quantidade: v.quantidade,
      total: v.centavos / 100,
    }))
    .sort(
      (a, b) =>
        b.quantidade - a.quantidade ||
        b.total - a.total ||
        a.nome.localeCompare(b.nome, "pt-BR")
    );

  return {
    filtro,
    quantidadeVendas,
    totalVendido: totalCentavos / 100,
    ticketMedio:
      quantidadeVendas === 0 ? 0 : Math.round(totalCentavos / quantidadeVendas) / 100,
    itensVendidos,
    porFormaPagamento: agrupar(doPeriodo, (r) => r.formaPagamento).sort(
      (a, b) => b.total - a.total
    ),
    porOrigem: agrupar(doPeriodo, (r) => r.origem).sort((a, b) => b.total - a.total),
    porDia: agrupar(doPeriodo, (r) => dataNaCantina(new Date(r.data))).sort((a, b) =>
      a.chave.localeCompare(b.chave)
    ),
    produtosMaisVendidos,
  };
}
