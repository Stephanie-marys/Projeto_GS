export type CategoriaProduto = "Lanches" | "Bebidas" | "Doces" | "Salgados" | "Outros";

export const CATEGORIAS: CategoriaProduto[] = [
  "Lanches",
  "Bebidas",
  "Doces",
  "Salgados",
  "Outros",
];

export interface Produto {
  id: string;
  nome: string;
  descricao?: string;
  preco: number;
  categoria: CategoriaProduto;
  disponivel: boolean;
  criadoEm: string;
}

export interface NovoProdutoInput {
  nome: string;
  descricao?: string;
  preco: number;
  categoria: CategoriaProduto;
  disponivel: boolean;
}