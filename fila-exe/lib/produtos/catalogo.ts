import { CATEGORIAS, type CategoriaProduto, type Produto } from "./types.ts";

/**
 * Regras de negócio e validações do Catálogo de Produtos (pacote 1.3.1).
 *
 * O catálogo é a vitrine voltada ao aluno: mostra apenas os produtos
 * marcados como disponíveis no cadastro (pacote 1.1.1), com busca por
 * nome/descrição e filtro por categoria. Um produto indisponível continua
 * existindo no cadastro — ele só não aparece aqui, pois não pode ser pedido.
 *
 * As funções são puras (não dependem de React/Next) para poder ser
 * testadas isoladamente e reaproveitadas tanto na tela quanto em testes.
 */

export const TODAS_CATEGORIAS = "Todas" as const;
export type FiltroCategoria = CategoriaProduto | typeof TODAS_CATEGORIAS;

export interface FiltroCatalogo {
  categoria: FiltroCategoria;
  busca: string;
}

export const FILTRO_CATALOGO_PADRAO: FiltroCatalogo = {
  categoria: TODAS_CATEGORIAS,
  busca: "",
};

/** Tamanho máximo aceito para o termo de busca (evita abuso via URL). */
const TAMANHO_MAXIMO_BUSCA = 100;

/**
 * Regra 1 — só entram no catálogo produtos disponíveis para pedido.
 * Produtos esgotados/fora de linha (disponivel = false) nunca aparecem
 * para o aluno, mesmo que nenhum filtro tenha sido aplicado.
 */
export function produtosDoCatalogo(produtos: Produto[]): Produto[] {
  return produtos.filter((produto) => produto.disponivel);
}

/** Remove acentuação e normaliza caixa, para uma busca mais tolerante. */
function normalizar(texto: string): string {
  return texto
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Regra 2 — filtro por categoria e por termo de busca.
 * A busca é case-insensitive, ignora acentos e procura tanto no nome
 * quanto na descrição do produto. Categoria "Todas" não filtra nada.
 */
export function filtrarCatalogo(
  produtos: Produto[],
  filtro: Partial<FiltroCatalogo>
): Produto[] {
  const categoria = filtro.categoria ?? TODAS_CATEGORIAS;
  const termo = normalizar(filtro.busca ?? "");

  return produtos.filter((produto) => {
    const combinaCategoria =
      categoria === TODAS_CATEGORIAS || produto.categoria === categoria;

    if (!combinaCategoria) return false;
    if (!termo) return true;

    const alvo = normalizar(`${produto.nome} ${produto.descricao ?? ""}`);
    return alvo.includes(termo);
  });
}

/**
 * Regra 3 — ordenação padrão do catálogo: alfabética por nome (pt-BR),
 * igual à listagem usada no cadastro, para manter consistência.
 */
export function ordenarCatalogo(produtos: Produto[]): Produto[] {
  return [...produtos].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

/**
 * Monta o catálogo final a partir de todos os produtos cadastrados:
 * aplica disponibilidade → filtro → ordenação, nessa ordem (um produto
 * indisponível nunca deve "vazar" para o catálogo por causa do filtro).
 */
export function montarCatalogo(
  produtos: Produto[],
  filtro: Partial<FiltroCatalogo> = {}
): Produto[] {
  const disponiveis = produtosDoCatalogo(produtos);
  const filtrados = filtrarCatalogo(disponiveis, filtro);
  return ordenarCatalogo(filtrados);
}

/**
 * Categorias que de fato têm ao menos um produto disponível agora —
 * usado para não oferecer, no filtro da tela, uma categoria vazia.
 */
export function categoriasComProdutoDisponivel(
  produtos: Produto[]
): CategoriaProduto[] {
  const disponiveis = produtosDoCatalogo(produtos);
  return CATEGORIAS.filter((categoria) =>
    disponiveis.some((produto) => produto.categoria === categoria)
  );
}

/**
 * Validação dos parâmetros de filtro vindos da URL (searchParams).
 * Nunca confia no valor cru vindo do usuário: uma categoria desconhecida
 * cai em "Todas" em vez de quebrar a página, e o termo de busca é
 * aparado e limitado em tamanho.
 */
export function validarFiltroCatalogo(entrada: {
  categoria?: string | string[];
  busca?: string | string[];
}): FiltroCatalogo {
  const categoriaBruta = Array.isArray(entrada.categoria)
    ? entrada.categoria[0]
    : entrada.categoria;
  const buscaBruta = Array.isArray(entrada.busca)
    ? entrada.busca[0]
    : entrada.busca;

  const categoria: FiltroCategoria =
    categoriaBruta && CATEGORIAS.includes(categoriaBruta as CategoriaProduto)
      ? (categoriaBruta as CategoriaProduto)
      : TODAS_CATEGORIAS;

  const busca = (buscaBruta ?? "").trim().slice(0, TAMANHO_MAXIMO_BUSCA);

  return { categoria, busca };
}
