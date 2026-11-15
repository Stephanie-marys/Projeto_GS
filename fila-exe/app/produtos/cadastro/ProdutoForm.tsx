"use client";

import { useActionState, useEffect, useRef } from "react";
import { cadastrarProduto } from "./actions";
import { estadoInicialCadastro } from "./estado";
import { CATEGORIAS } from "@/lib/produtos/types";

export default function ProdutoForm() {
  const [state, formAction, isPending] = useActionState(
    cadastrarProduto,
    estadoInicialCadastro
  );
  const formRef = useRef<HTMLFormElement>(null);
  const success = Boolean(
    state && typeof state === "object" && "success" in state && state.success
  );
  const message =
    state && typeof state === "object" && "message" in state
      ? String(state.message ?? "")
      : "";
  const errors =
    state && typeof state === "object" && "errors" in state && state.errors
      ? state.errors
      : estadoInicialCadastro.errors ?? {};

  // Limpa o formulário após um cadastro bem-sucedido.
  useEffect(() => {
    if (success) {
      formRef.current?.reset();
    }
  }, [success]);

  return (
    <form ref={formRef} action={formAction} className="mt-6 space-y-4" noValidate>
      <div>
        <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
          Nome do produto
        </label>
        <input
          id="nome"
          name="nome"
          type="text"
          maxLength={100}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          placeholder="Ex: Coxinha de frango"
        />
        {errors.nome && <p className="mt-1 text-sm text-red-600">{errors.nome}</p>}
      </div>

      <div>
        <label htmlFor="descricao" className="block text-sm font-medium text-gray-700">
          Descrição (opcional)
        </label>
        <textarea
          id="descricao"
          name="descricao"
          rows={3}
          maxLength={500}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          placeholder="Ex: Salgado frito recheado com frango desfiado"
        />
        {errors.descricao && (
          <p className="mt-1 text-sm text-red-600">{errors.descricao}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="preco" className="block text-sm font-medium text-gray-700">
            Preço (R$)
          </label>
          <input
            id="preco"
            name="preco"
            type="number"
            step="0.01"
            min="0"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            placeholder="0,00"
          />
          {errors.preco && <p className="mt-1 text-sm text-red-600">{errors.preco}</p>}
        </div>

        <div>
          <label htmlFor="categoria" className="block text-sm font-medium text-gray-700">
            Categoria
          </label>
          <select
            id="categoria"
            name="categoria"
            defaultValue=""
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="" disabled>
              Selecione...
            </option>
            {CATEGORIAS.map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
          </select>
          {errors.categoria && (
            <p className="mt-1 text-sm text-red-600">{errors.categoria}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="disponivel"
          name="disponivel"
          type="checkbox"
          defaultChecked
          className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
        />
        <label htmlFor="disponivel" className="text-sm text-gray-700">
          Disponível para pedido
        </label>
      </div>

      {message && (
        <p
          className={
            success
              ? "text-sm font-medium text-emerald-600"
              : "text-sm font-medium text-red-600"
          }
          role="status"
        >
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Salvando..." : "Cadastrar produto"}
      </button>
    </form>
  );
}