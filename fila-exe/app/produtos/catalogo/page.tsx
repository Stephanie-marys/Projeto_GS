import Link from "next/link";
import { listarProdutos } from "@/lib/produtos/store";
import {
  categoriasComProdutoDisponivel,
  montarCatalogo,
  produtosDoCatalogo,
  TODAS_CATEGORIAS,
  validarFiltroCatalogo,
} from "@/lib/produtos/catalogo";
import FiltrosCatalogo from "./FiltrosCatalogo";

const formatarPreco = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

interface CatalogoPageProps {
  searchParams: Promise<{
    categoria?: string | string[];
    busca?: string | string[];
  }>;
}

export default async function CatalogoPage({ searchParams }: CatalogoPageProps) {
  const parametros = await searchParams;
  const filtro = validarFiltroCatalogo(parametros);

  const produtos = listarProdutos();
  const totalDisponiveis = produtosDoCatalogo(produtos).length;
  const catalogo = montarCatalogo(produtos, filtro);
  const categorias = categoriasComProdutoDisponivel(produtos);
  const filtroAtivo = filtro.busca !== "" || filtro.categoria !== TODAS_CATEGORIAS;

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catálogo de Produtos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Pacote 1.3.1 — vitrine dos produtos disponíveis para pedido.
          </p>
        </div>
        <Link
          href="/produtos/cadastro"
          className="whitespace-nowrap text-sm font-medium text-emerald-700 hover:underline"
        >
          Cadastro (admin)
        </Link>
      </div>

      <FiltrosCatalogo
        categorias={categorias}
        categoriaAtual={filtro.categoria}
        buscaAtual={filtro.busca}
      />

      <section className="mt-8">
        <h2 className="text-sm font-medium text-gray-500">
          {catalogo.length}{" "}
          {catalogo.length === 1 ? "produto encontrado" : "produtos encontrados"}
        </h2>

        {totalDisponiveis === 0 ? (
          <p className="mt-4 rounded-md border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-500">
            Nenhum produto disponível no momento. Volte mais tarde!
          </p>
        ) : catalogo.length === 0 ? (
          <p className="mt-4 rounded-md border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-500">
            Nenhum produto encontrado para esse filtro.
            {filtroAtivo && (
              <>
                {" "}
                <Link
                  href="/produtos/catalogo"
                  className="font-medium text-emerald-700 hover:underline"
                >
                  Limpar filtros
                </Link>
              </>
            )}
          </p>
        ) : (
          <ul className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {catalogo.map((produto) => (
              <li
                key={produto.id}
                className="flex flex-col justify-between rounded-lg border border-gray-200 p-4 shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-gray-900">{produto.nome}</p>
                    <span className="whitespace-nowrap rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      {produto.categoria}
                    </span>
                  </div>
                  {produto.descricao && (
                    <p className="mt-1 text-sm text-gray-500">{produto.descricao}</p>
                  )}
                </div>
                <p className="mt-3 text-right text-base font-semibold text-gray-900">
                  {formatarPreco.format(produto.preco)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
