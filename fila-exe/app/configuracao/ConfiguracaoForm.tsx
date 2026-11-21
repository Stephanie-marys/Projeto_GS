"use client";

import { useActionState } from "react";
import type { ConfiguracaoCantina } from "@/lib/configuracao/types";
import {
  LIMITE_PEDIDOS_MAXIMO,
  LIMITE_PEDIDOS_MINIMO,
  TEMPO_PREPARO_MAXIMO,
  TEMPO_PREPARO_MINIMO,
} from "@/lib/configuracao/regras";
import { salvarConfiguracaoCantina } from "./actions";
import { estadoInicialConfiguracao } from "./estado";

const classeInput =
  "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500";

export default function ConfiguracaoForm({ atual }: { atual: ConfiguracaoCantina }) {
  const [state, formAction, isPending] = useActionState(
    salvarConfiguracaoCantina,
    estadoInicialConfiguracao
  );
  const errors = state.errors;

  return (
    <form action={formAction} className="mt-6 space-y-5" noValidate>
      <div>
        <label htmlFor="nomeCantina" className="block text-sm font-medium text-gray-700">
          Nome da cantina
        </label>
        <input
          id="nomeCantina"
          name="nomeCantina"
          type="text"
          maxLength={60}
          defaultValue={atual.nomeCantina}
          className={classeInput}
        />
        {errors.nomeCantina && <p className="mt-1 text-sm text-red-600">{errors.nomeCantina}</p>}
      </div>

      <fieldset className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <legend className="mb-1 text-sm font-semibold text-gray-900">
          Horário de pedidos online (Brasília)
        </legend>
        <div>
          <label htmlFor="horarioAbertura" className="block text-sm font-medium text-gray-700">
            Abertura
          </label>
          <input
            id="horarioAbertura"
            name="horarioAbertura"
            type="time"
            defaultValue={atual.horarioAbertura}
            className={classeInput}
          />
          {errors.horarioAbertura && (
            <p className="mt-1 text-sm text-red-600">{errors.horarioAbertura}</p>
          )}
        </div>
        <div>
          <label htmlFor="horarioFechamento" className="block text-sm font-medium text-gray-700">
            Fechamento
          </label>
          <input
            id="horarioFechamento"
            name="horarioFechamento"
            type="time"
            defaultValue={atual.horarioFechamento}
            className={classeInput}
          />
          {errors.horarioFechamento && (
            <p className="mt-1 text-sm text-red-600">{errors.horarioFechamento}</p>
          )}
        </div>
      </fieldset>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="tempoPreparoMinutos" className="block text-sm font-medium text-gray-700">
            Tempo médio de preparo (min)
          </label>
          <input
            id="tempoPreparoMinutos"
            name="tempoPreparoMinutos"
            type="number"
            step="1"
            min={TEMPO_PREPARO_MINIMO}
            max={TEMPO_PREPARO_MAXIMO}
            inputMode="numeric"
            defaultValue={atual.tempoPreparoMinutos}
            className={classeInput}
          />
          {errors.tempoPreparoMinutos && (
            <p className="mt-1 text-sm text-red-600">{errors.tempoPreparoMinutos}</p>
          )}
        </div>
        <div>
          <label htmlFor="limitePedidosAtivos" className="block text-sm font-medium text-gray-700">
            Limite de pedidos na fila
          </label>
          <input
            id="limitePedidosAtivos"
            name="limitePedidosAtivos"
            type="number"
            step="1"
            min={LIMITE_PEDIDOS_MINIMO}
            max={LIMITE_PEDIDOS_MAXIMO}
            inputMode="numeric"
            defaultValue={atual.limitePedidosAtivos}
            className={classeInput}
          />
          {errors.limitePedidosAtivos && (
            <p className="mt-1 text-sm text-red-600">{errors.limitePedidosAtivos}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="aceitandoPedidos"
          name="aceitandoPedidos"
          type="checkbox"
          defaultChecked={atual.aceitandoPedidos}
          className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
        />
        <label htmlFor="aceitandoPedidos" className="text-sm text-gray-700">
          Aceitando pedidos online (desmarque para pausar temporariamente)
        </label>
      </div>

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
        disabled={isPending}
        className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Salvando..." : "Salvar configuração"}
      </button>
    </form>
  );
}
