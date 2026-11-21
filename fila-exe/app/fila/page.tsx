import Navegacao from "@/app/components/Navegacao";
import AtualizacaoAutomatica from "@/app/components/AtualizacaoAutomatica";
import { obterConfiguracao } from "@/lib/configuracao/store";
import { acompanharPedido, lerNumeroPedido, montarFila } from "@/lib/pedidos/regras";
import { listarPedidos } from "@/lib/pedidos/store";
import { ROTULO_STATUS_PEDIDO, type Pedido } from "@/lib/pedidos/types";

export const dynamic = "force-dynamic";

interface FilaPageProps {
  searchParams: Promise<{ numero?: string | string[] }>;
}

function ColunaSenhas({ titulo, pedidos, destaque }: { titulo: string; pedidos: Pedido[]; destaque?: boolean }) {
  return (
    <section
      className={`rounded-lg border p-4 ${destaque ? "border-emerald-300 bg-emerald-50" : "border-gray-200"}`}
    >
      <h2 className={`text-sm font-semibold uppercase tracking-wide ${destaque ? "text-emerald-800" : "text-gray-600"}`}>
        {titulo} ({pedidos.length})
      </h2>
      {pedidos.length === 0 ? (
        <p className="mt-3 text-sm text-gray-400">Nenhum pedido.</p>
      ) : (
        <ul className="mt-3 flex flex-wrap gap-2">
          {pedidos.map((p) => (
            <li
              key={p.id}
              className={`rounded-md px-3 py-2 text-center ${destaque ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-900"}`}
            >
              <span className="block text-xl font-black">#{p.numero}</span>
              <span className="block max-w-[8rem] truncate text-xs">{p.clienteNome}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default async function FilaPage({ searchParams }: FilaPageProps) {
  const parametros = await searchParams;
  const numero = lerNumeroPedido(parametros.numero);
  const numeroBruto = Array.isArray(parametros.numero) ? parametros.numero[0] : parametros.numero;

  const config = obterConfiguracao();
  const pedidos = listarPedidos();
  const fila = montarFila(pedidos);
  const aguardando = fila.filter((p) => p.status === "recebido");
  const emPreparo = fila.filter((p) => p.status === "em_preparo");
  const prontos = fila.filter((p) => p.status === "pronto");

  const acompanhamento =
    numero !== null ? acompanharPedido(pedidos, numero, config.tempoPreparoMinutos) : null;

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <AtualizacaoAutomatica segundos={10} />
      <Navegacao atual="/fila" />
      <h1 className="mt-6 text-2xl font-bold text-gray-900">Fila Virtual — {config.nomeCantina}</h1>
      <p className="mt-1 text-sm text-gray-500">
        Pacote 1.5.1 — acompanhe sua senha. A tela se atualiza sozinha a cada 10 segundos.
      </p>

      <form action="/fila" method="get" className="mt-6 flex items-end gap-2">
        <div>
          <label htmlFor="numero" className="block text-sm font-medium text-gray-700">
            Sua senha
          </label>
          <input
            id="numero"
            name="numero"
            type="number"
            min="1"
            step="1"
            inputMode="numeric"
            defaultValue={numero ?? ""}
            placeholder="Ex: 12"
            className="mt-1 block w-32 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700"
        >
          Consultar
        </button>
      </form>

      {numeroBruto && numero === null && (
        <p className="mt-3 text-sm text-red-600">Informe uma senha válida (número inteiro positivo).</p>
      )}

      {acompanhamento && (
        <div className="mt-4 rounded-lg border border-gray-200 px-4 py-4 text-sm" role="status">
          {!acompanhamento.encontrado ? (
            <p className="text-red-600">Não encontramos o pedido #{numero}.</p>
          ) : (
            <>
              <p className="text-base font-semibold text-gray-900">
                Pedido #{acompanhamento.pedido.numero} — {ROTULO_STATUS_PEDIDO[acompanhamento.pedido.status]}
              </p>
              {acompanhamento.pedido.status === "pronto" && (
                <p className="mt-1 font-medium text-emerald-700">Pode retirar no balcão!</p>
              )}
              {(acompanhamento.pedido.status === "recebido" ||
                acompanhamento.pedido.status === "em_preparo") && (
                <p className="mt-1 text-gray-600">
                  {acompanhamento.pedidosAFrente === 0
                    ? "Você é o próximo."
                    : `${acompanhamento.pedidosAFrente} ${acompanhamento.pedidosAFrente === 1 ? "pedido" : "pedidos"} à sua frente.`}{" "}
                  Estimativa: ~{acompanhamento.estimativaMinutos} min.
                </p>
              )}
              <p className="mt-1 text-gray-500">
                {acompanhamento.pedido.itens.map((i) => `${i.quantidade}x ${i.nome}`).join(", ")}
              </p>
            </>
          )}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <ColunaSenhas titulo="Prontos para retirada" pedidos={prontos} destaque />
        <ColunaSenhas titulo="Em preparo" pedidos={emPreparo} />
        <ColunaSenhas titulo="Aguardando" pedidos={aguardando} />
      </div>
    </main>
  );
}
