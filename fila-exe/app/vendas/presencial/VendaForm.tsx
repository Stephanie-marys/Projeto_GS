"use client";

import { useActionState, useState } from "react";
import { registrarVenda } from "./actions";
import { estadoInicialVenda, type VendaPresencialState } from "./estado";
import {
  FORMAS_PAGAMENTO,
  ROTULO_FORMA_PAGAMENTO,
  type FormaPagamento,
} from "@/lib/vendas/types";

export interface ProdutoVendavel {
  id: string;
  nome: string;
  categoria: string;
  preco: number;
}

interface CamposVendaProps {
  produtos: ProdutoVendavel[];
  state: VendaPresencialState;
  isPending: boolean;
  formAction: (formData: FormData) => void;
}

const formatarMoeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const classeInput =
  "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500";

function CamposVenda({ produtos, state, isPending, formAction }: CamposVendaProps) {
  const [quantidades, setQuantidades] = useState<Record<string, string>>({});
  const [forma, setForma] = useState<FormaPagamento>("dinheiro");
  const [recebido, setRecebido] = useState("");

  const totalCentavos = produtos.reduce((soma, produto) => {
    const quantidade = Number(quantidades[produto.id] ?? 0);
    if (!Number.isInteger(quantidade) || quantidade < 1) return soma;
    return soma + Math.round(produto.preco * 100) * quantidade;
  }, 0);

  const recebidoNumero = Number(recebido.replace(",", "."));
  const recebidoCentavos =
    recebido.trim() !== "" && Number.isFinite(recebidoNumero)
      ? Math.round(recebidoNumero * 100)
      : null;
  const trocoCentavos =
    forma === "dinheiro" && recebidoCentavos !== null && totalCentavos > 0
      ? recebidoCentavos - totalCentavos
      : null;

  return (
    <form action={formAction} className="mt-6 space-y-6" noValidate>
      <section>
        <h2 className="text-lg font-semibold text-gray-900">Produtos</h2>
        {produtos.length === 0 ? (
          <p className="mt-3 rounded-md border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-500">
            Nenhum produto disponível para venda. Cadastre ou ative produtos
            primeiro.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-gray-200 rounded-md border border-gray-200">
            {produtos.map((produto) => (
              <li
                key={produto.id}
                className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-gray-900">{produto.nome}</p>
                  <p className="text-gray-500">
                    {produto.categoria} · {formatarMoeda.format(produto.preco)}
                  </p>
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
                      setQuantidades((atual) => ({
                        ...atual,
                        [produto.id]: evento.target.value,
                      }))
                    }
                    className={classeInput}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
        {state.errors.itens && (
          <p className="mt-2 text-sm text-red-600">{state.errors.itens}</p>
        )}
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="clienteNome" className="block text-sm font-medium text-gray-700">
            Nome do cliente (opcional)
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
            Forma de pagamento
          </label>
          <select
            id="formaPagamento"
            name="formaPagamento"
            value={forma}
            onChange={(evento) => setForma(evento.target.value as FormaPagamento)}
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

        {forma === "dinheiro" && (
          <div>
            <label htmlFor="valorRecebido" className="block text-sm font-medium text-gray-700">
              Valor recebido (R$)
            </label>
            <input
              id="valorRecebido"
              name="valorRecebido"
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              placeholder="0,00"
              value={recebido}
              onChange={(evento) => setRecebido(evento.target.value)}
              className={classeInput}
            />
            {state.errors.valorRecebido && (
              <p className="mt-1 text-sm text-red-600">{state.errors.valorRecebido}</p>
            )}
          </div>
        )}
      </section>

      <section className="rounded-md bg-gray-50 px-4 py-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Total</span>
          <span className="text-lg font-semibold text-gray-900">
            {formatarMoeda.format(totalCentavos / 100)}
          </span>
        </div>
        {trocoCentavos !== null && (
          <div className="mt-1 flex items-center justify-between">
            <span className="text-gray-600">
              {trocoCentavos >= 0 ? "Troco" : "Faltam"}
            </span>
            <span
              className={
                trocoCentavos >= 0
                  ? "font-medium text-emerald-700"
                  : "font-medium text-red-600"
              }
            >
              {formatarMoeda.format(Math.abs(trocoCentavos) / 100)}
            </span>
          </div>
        )}
      </section>

      {state.message && (
        <p
          className={
            state.success
              ? "text-sm font-medium text-emerald-600"
              : "text-sm font-medium text-red-600"
          }
          role="status"
        >
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending || produtos.length === 0}
        className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Registrando..." : "Registrar venda"}
      </button>
    </form>
  );
}

export default function VendaForm({ produtos }: { produtos: ProdutoVendavel[] }) {
  const [state, formAction, isPending] = useActionState(
    registrarVenda,
    estadoInicialVenda
  );

  return (
    <CamposVenda
      key={state.sequencia}
      produtos={produtos}
      state={state}
      isPending={isPending}
      formAction={formAction}
    />
  );
}
