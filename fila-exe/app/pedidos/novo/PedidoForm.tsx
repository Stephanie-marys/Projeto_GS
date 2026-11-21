"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  FORMAS_PAGAMENTO,
  ROTULO_FORMA_PAGAMENTO,
} from "@/lib/vendas/types";
import { fazerPedido } from "./actions";
import { estadoInicialPedido, type NovoPedidoState } from "./estado";

export interface ProdutoPedido {
  id: string;
  nome: string;
  categoria: string;
  preco: number;
  descricao?: string;
}

interface CamposPedidoProps {
  produtos: ProdutoPedido[];
  state: NovoPedidoState;
  isPending: boolean;
  formAction: (formData: FormData) => void;
  bloqueado: boolean;
}

const formatarMoeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const classeInput =
  "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500";

function CamposPedido({ produtos, state, isPending, formAction, bloqueado }: CamposPedidoProps) {
  const [quantidades, setQuantidades] = useState<Record<string, string>>({});

  const totalCentavos = produtos.reduce((soma, produto) => {
    const quantidade = Number(quantidades[produto.id] ?? 0);
    if (!Number.isInteger(quantidade) || quantidade < 1) return soma;
    return soma + Math.round(produto.preco * 100) * quantidade;
  }, 0);

  return (
    <form action={formAction} className="mt-6 space-y-6" noValidate>
      {state.success && state.numero !== undefined && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-4 text-center" role="status">
          <p className="text-sm text-emerald-800">Sua senha é</p>
          <p className="text-4xl font-black text-emerald-700">#{state.numero}</p>
          <p className="mt-1 text-sm text-emerald-800">{state.message}</p>
          <Link
            href={`/fila?numero=${state.numero}`}
            className="mt-2 inline-block text-sm font-semibold text-emerald-700 hover:underline"
          >
            Acompanhar na fila →
          </Link>
        </div>
      )}

      <section>
        <h2 className="text-lg font-semibold text-gray-900">Escolha os produtos</h2>
        {produtos.length === 0 ? (
          <p className="mt-3 rounded-md border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-500">
            Nenhum produto disponível no momento. Volte mais tarde!
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-gray-200 rounded-md border border-gray-200">
            {produtos.map((produto) => (
              <li key={produto.id} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                <div>
                  <p className="font-medium text-gray-900">{produto.nome}</p>
                  <p className="text-gray-500">
                    {produto.categoria} · {formatarMoeda.format(produto.preco)}
                  </p>
                  {produto.descricao && (
                    <p className="text-xs text-gray-400">{produto.descricao}</p>
                  )}
                </div>
                <div className="w-24">
                  <label htmlFor={`qtd_${produto.id}`} className="sr-only">
                    Quantidade de {produto.nome}
                  </label>
                  <input
                    id={`qtd_${produto.id}`}
                    name={`qtd_${produto.id}`}
                    type="number"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    placeholder="0"
                    value={quantidades[produto.id] ?? ""}
                    onChange={(evento) =>
                      setQuantidades((atual) => ({ ...atual, [produto.id]: evento.target.value }))
                    }
                    className={classeInput}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
        {state.errors.itens && <p className="mt-2 text-sm text-red-600">{state.errors.itens}</p>}
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="clienteNome" className="block text-sm font-medium text-gray-700">
            Seu nome (para chamar na retirada)
          </label>
          <input
            id="clienteNome"
            name="clienteNome"
            type="text"
            maxLength={100}
            placeholder="Ex: Ana Souza"
            className={classeInput}
          />
          {state.errors.clienteNome && (
            <p className="mt-1 text-sm text-red-600">{state.errors.clienteNome}</p>
          )}
        </div>

        <div>
          <label htmlFor="formaPagamento" className="block text-sm font-medium text-gray-700">
            Pagamento na retirada
          </label>
          <select
            id="formaPagamento"
            name="formaPagamento"
            defaultValue="pix"
            className={`${classeInput} bg-white`}
          >
            {FORMAS_PAGAMENTO.map((opcao) => (
              <option key={opcao} value={opcao}>
                {ROTULO_FORMA_PAGAMENTO[opcao]}
              </option>
            ))}
          </select>
          {state.errors.formaPagamento && (
            <p className="mt-1 text-sm text-red-600">{state.errors.formaPagamento}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="observacao" className="block text-sm font-medium text-gray-700">
            Observação (opcional)
          </label>
          <input
            id="observacao"
            name="observacao"
            type="text"
            maxLength={200}
            placeholder="Ex: sem cebola"
            className={classeInput}
          />
          {state.errors.observacao && (
            <p className="mt-1 text-sm text-red-600">{state.errors.observacao}</p>
          )}
        </div>
      </section>

      <section className="flex items-center justify-between rounded-md bg-gray-50 px-4 py-3 text-sm">
        <span className="text-gray-600">Total</span>
        <span className="text-lg font-semibold text-gray-900">
          {formatarMoeda.format(totalCentavos / 100)}
        </span>
      </section>

      {state.message && !state.success && (
        <p className="text-sm font-medium text-red-600" role="status">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending || bloqueado || produtos.length === 0}
        className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Enviando..." : "Fazer pedido"}
      </button>
    </form>
  );
}

export default function PedidoForm({
  produtos,
  bloqueado,
}: {
  produtos: ProdutoPedido[];
  bloqueado: boolean;
}) {
  const [state, formAction, isPending] = useActionState(fazerPedido, estadoInicialPedido);

  return (
    <CamposPedido
      key={state.sequencia}
      produtos={produtos}
      state={state}
      isPending={isPending}
      formAction={formAction}
      bloqueado={bloqueado}
    />
  );
}
