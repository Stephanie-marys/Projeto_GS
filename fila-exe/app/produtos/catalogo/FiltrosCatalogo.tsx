"use client";

import { useRef } from "react";
import type { CategoriaProduto } from "@/lib/produtos/types";
import { TODAS_CATEGORIAS, type FiltroCategoria } from "@/lib/produtos/catalogo";

interface FiltrosCatalogoProps {
  categorias: CategoriaProduto[];
  categoriaAtual: FiltroCategoria;
  buscaAtual: string;
}

/**
 * Formulário de filtro do catálogo (categoria + busca por texto).
 *
 * Funciona por GET puro (`?categoria=...&busca=...`), então continua
 * funcionando mesmo sem JavaScript — o "use client" aqui serve só para
 * o select enviar o formulário sozinho ao trocar de categoria,
 * poupando um clique extra no botão "Filtrar".
 */
export default function FiltrosCatalogo({
  categorias,
  categoriaAtual,
  buscaAtual,
}: FiltrosCatalogoProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const filtroAtivo = buscaAtual !== "" || categoriaAtual !== TODAS_CATEGORIAS;

  return (
    <form
      ref={formRef}
      action="/produtos/catalogo"
      method="get"
      className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end"
    >
      <div className="flex-1">
        <label htmlFor="busca" className="block text-sm font-medium text-gray-700">
          Buscar produto
        </label>
        <input
          id="busca"
          name="busca"
          type="search"
          maxLength={100}
          defaultValue={buscaAtual}
          placeholder="Ex: coxinha, suco..."
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      <div>
        <label htmlFor="categoria" className="block text-sm font-medium text-gray-700">
          Categoria
        </label>
        <select
          id="categoria"
          name="categoria"
          defaultValue={categoriaAtual}
          onChange={() => formRef.current?.requestSubmit()}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:w-48"
        >
          <option value={TODAS_CATEGORIAS}>Todas as categorias</option>
          {categorias.map((categoria) => (
            <option key={categoria} value={categoria}>
              {categoria}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700"
        >
          Filtrar
        </button>
        {filtroAtivo && (
          <a
            href="/produtos/catalogo"
            className="flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Limpar
          </a>
        )}
      </div>
    </form>
  );
}
