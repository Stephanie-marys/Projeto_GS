import type { NovoProdutoInput, Produto } from "./types";

/**
 * Mock de persistência em memória para o cadastro de produtos.
 *
 * Substituir por uma implementação real (ex: Prisma + banco de dados)
 * quando a decisão de persistência for tomada — a assinatura das
 * funções abaixo foi pensada para não precisar mudar quem as consome
 * (a Server Action e a página continuam chamando as mesmas funções).
 *
 * ⚠️ Os dados vivem apenas em memória do processo do servidor Next.js:
 * eles são perdidos a cada restart do `npm run dev`.
 */
const produtos: Produto[] = [];

export function listarProdutos(): Produto[] {
  return [...produtos].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

export function criarProduto(dados: NovoProdutoInput): Produto {
  const produto: Produto = {
    id: crypto.randomUUID(),
    criadoEm: new Date().toISOString(),
    ...dados,
  };
  produtos.push(produto);
  return produto;
}

/** Utilitário para testes — não deve ser usado em código de produção. */
export function limparProdutos(): void {
  produtos.length = 0;
}