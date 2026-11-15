import type { Produto } from "../produtos/types.ts";
import {
  FORMAS_PAGAMENTO,
  type FormaPagamento,
  type ItemVenda,
  type NovaVendaInput,
} from "./types.ts";

/**
 * Regras e validações da Venda Presencial.
 *
 * A venda presencial é registrada pelo funcionário da cantina para o aluno
 * que não usa o sistema. Ela só pode conter produtos disponíveis no cadastro
 * (os mesmos que aparecem no catálogo), é paga na hora e nasce já fechada.
 *
 * Todo o cálculo é feito em centavos (inteiros) para não acumular erro de
 * ponto flutuante (ex: 3 x 4,10 não pode virar 12,299999...). Só na saída
 * os valores voltam para reais.
 *
 * As funções são puras (não dependem de React/Next nem do store), então
 * podem ser testadas isoladamente.
 */

export const NOME_CLIENTE_PADRAO = "Cliente presencial";
export const QUANTIDADE_MAXIMA_POR_ITEM = 50;
export const TAMANHO_MAXIMO_NOME_CLIENTE = 100;

export type CamposVenda =
  | "itens"
  | "formaPagamento"
  | "valorRecebido"
  | "clienteNome";

export interface DadosVendaCalculados {
  clienteNome: string;
  itens: ItemVenda[];
  total: number;
  formaPagamento: FormaPagamento;
  valorRecebido?: number;
  troco: number;
}

export interface ResultadoValidacaoVenda {
  valido: boolean;
  erros: Partial<Record<CamposVenda, string>>;
  dados?: DadosVendaCalculados;
}

function paraCentavos(valor: number): number {
  return Math.round(valor * 100);
}

function paraReais(centavos: number): number {
  return centavos / 100;
}

/**
 * Regra 1 — o mesmo produto lançado mais de uma vez vira uma linha só,
 * com as quantidades somadas.
 */
export function agruparItens(
  itens: NovaVendaInput["itens"]
): NovaVendaInput["itens"] {
  const porProduto = new Map<string, number>();
  const ordem: string[] = [];

  for (const item of itens) {
    if (!porProduto.has(item.produtoId)) {
      porProduto.set(item.produtoId, 0);
      ordem.push(item.produtoId);
    }
    porProduto.set(
      item.produtoId,
      (porProduto.get(item.produtoId) ?? 0) + item.quantidade
    );
  }

  return ordem.map((produtoId) => ({
    produtoId,
    quantidade: porProduto.get(produtoId) ?? 0,
  }));
}

/**
 * Valida a venda e, se estiver tudo certo, devolve os dados já calculados
 * (itens com preço do momento da venda, total e troco).
 *
 * Regras:
 *  - precisa ter ao menos um item;
 *  - quantidade de cada item: inteiro entre 1 e QUANTIDADE_MAXIMA_POR_ITEM;
 *  - produto precisa existir e estar disponível;
 *  - forma de pagamento precisa ser uma das aceitas;
 *  - em dinheiro, o valor recebido é obrigatório e não pode ser menor que
 *    o total (o troco é a diferença); nas demais formas ele é ignorado;
 *  - nome do cliente é opcional (máx. 100 caracteres); vazio vira
 *    "Cliente presencial".
 */
export function validarVendaPresencial(
  entrada: NovaVendaInput,
  produtos: Produto[]
): ResultadoValidacaoVenda {
  const erros: Partial<Record<CamposVenda, string>> = {};
  const problemasItens: string[] = [];

  const clienteNome = (entrada.clienteNome ?? "").trim();
  if (clienteNome.length > TAMANHO_MAXIMO_NOME_CLIENTE) {
    erros.clienteNome = `O nome deve ter no máximo ${TAMANHO_MAXIMO_NOME_CLIENTE} caracteres.`;
  }

  const itensAgrupados = agruparItens(entrada.itens ?? []);
  const itens: ItemVenda[] = [];

  if (itensAgrupados.length === 0) {
    problemasItens.push("Adicione ao menos um produto à venda.");
  }

  for (const item of itensAgrupados) {
    const produto = produtos.find((p) => p.id === item.produtoId);

    if (!produto) {
      problemasItens.push("Há um produto na venda que não existe mais no cadastro.");
      continue;
    }

    if (!produto.disponivel) {
      problemasItens.push(`"${produto.nome}" está indisponível e não pode ser vendido.`);
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

    const precoCentavos = paraCentavos(produto.preco);
    itens.push({
      produtoId: produto.id,
      nome: produto.nome,
      precoUnitario: paraReais(precoCentavos),
      quantidade: item.quantidade,
      subtotal: paraReais(precoCentavos * item.quantidade),
    });
  }

  if (problemasItens.length > 0) {
    erros.itens = problemasItens.join(" ");
  }

  const formaPagamento = entrada.formaPagamento as FormaPagamento;
  if (!FORMAS_PAGAMENTO.includes(formaPagamento)) {
    erros.formaPagamento = "Selecione uma forma de pagamento válida.";
  }

  const totalCentavos = itens.reduce(
    (soma, item) => soma + paraCentavos(item.subtotal),
    0
  );

  let valorRecebidoCentavos: number | undefined;
  let trocoCentavos = 0;

  if (formaPagamento === "dinheiro") {
    const recebido = entrada.valorRecebido;
    if (recebido === undefined || !Number.isFinite(recebido)) {
      erros.valorRecebido = "Informe o valor recebido em dinheiro.";
    } else if (recebido <= 0) {
      erros.valorRecebido = "O valor recebido deve ser maior que zero.";
    } else {
      valorRecebidoCentavos = paraCentavos(recebido);
      if (!erros.itens && valorRecebidoCentavos < totalCentavos) {
        erros.valorRecebido = "O valor recebido é menor que o total da venda.";
      } else {
        trocoCentavos = Math.max(0, valorRecebidoCentavos - totalCentavos);
      }
    }
  }

  if (Object.keys(erros).length > 0) {
    return { valido: false, erros };
  }

  return {
    valido: true,
    erros: {},
    dados: {
      clienteNome: clienteNome || NOME_CLIENTE_PADRAO,
      itens,
      total: paraReais(totalCentavos),
      formaPagamento,
      valorRecebido:
        valorRecebidoCentavos === undefined
          ? undefined
          : paraReais(valorRecebidoCentavos),
      troco: paraReais(trocoCentavos),
    },
  };
}
