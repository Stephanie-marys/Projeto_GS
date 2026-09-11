import { CATEGORIAS, type CategoriaProduto } from "./types";

export type CamposProduto = "nome" | "descricao" | "preco" | "categoria";

export interface DadosProdutoForm {
  nome: string;
  descricao: string;
  preco: number;
  categoria: string;
  disponivel: boolean;
}

export interface ResultadoValidacao {
  valido: boolean;
  erros: Partial<Record<CamposProduto, string>>;
}

/**
 * Regras de validação do cadastro de produtos da cantina (pacote 1.1.1).
 * Mantido separado do componente/action para poder ser testado isoladamente
 * e reaproveitado (ex: numa futura validação client-side extra).
 */
export function validarProduto(dados: DadosProdutoForm): ResultadoValidacao {
  const erros: Partial<Record<CamposProduto, string>> = {};

  const nome = dados.nome?.trim() ?? "";
  if (nome.length < 2) {
    erros.nome = "Informe um nome com pelo menos 2 caracteres.";
  } else if (nome.length > 100) {
    erros.nome = "O nome deve ter no máximo 100 caracteres.";
  }

  if (dados.descricao && dados.descricao.length > 500) {
    erros.descricao = "A descrição deve ter no máximo 500 caracteres.";
  }

  if (Number.isNaN(dados.preco)) {
    erros.preco = "Informe um preço válido.";
  } else if (dados.preco <= 0) {
    erros.preco = "O preço deve ser maior que zero.";
  } else if (dados.preco > 1000) {
    erros.preco = "O preço parece muito alto. Confira o valor.";
  }

  if (!CATEGORIAS.includes(dados.categoria as CategoriaProduto)) {
    erros.categoria = "Selecione uma categoria válida.";
  }

  return { valido: Object.keys(erros).length === 0, erros };
}