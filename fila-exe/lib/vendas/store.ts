import { listarProdutos } from "../produtos/store.ts";
import { validarVendaPresencial, type CamposVenda } from "./regras.ts";
import type { NovaVendaInput, Venda } from "./types.ts";

/**
 * Mock de persistência em memória das vendas presenciais.
 *
 * Segue o mesmo padrão do store de produtos: as funções exportadas são a
 * "interface" que a Server Action e a página usam, então trocar por um banco
 * real depois não deve exigir mexer em quem as consome.
 *
 * ⚠️ Os dados vivem só na memória do servidor Next.js e se perdem a cada
 * restart do `npm run dev`.
 */
const vendas: Venda[] = [];

export type ResultadoRegistroVenda =
  | { sucesso: true; venda: Venda }
  | { sucesso: false; erros: Partial<Record<CamposVenda, string>> };

/**
 * Valida contra os produtos cadastrados no momento e, se estiver tudo certo,
 * grava a venda. O preço de cada item fica "congelado" na venda: alterar o
 * preço do produto depois não muda vendas já registradas.
 */
export function registrarVendaPresencial(
  entrada: NovaVendaInput
): ResultadoRegistroVenda {
  const resultado = validarVendaPresencial(entrada, listarProdutos());

  if (!resultado.valido || !resultado.dados) {
    return { sucesso: false, erros: resultado.erros };
  }

  const venda: Venda = {
    id: crypto.randomUUID(),
    criadoEm: new Date().toISOString(),
    origem: "presencial",
    ...resultado.dados,
  };
  vendas.push(venda);

  return { sucesso: true, venda };
}

/** Vendas mais recentes primeiro. */
export function listarVendas(): Venda[] {
  return [...vendas].sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
}

/** Utilitário para testes — não deve ser usado em código de produção. */
export function limparVendas(): void {
  vendas.length = 0;
}
