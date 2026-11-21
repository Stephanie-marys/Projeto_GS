import Navegacao from "@/app/components/Navegacao";
import AtualizacaoAutomatica from "@/app/components/AtualizacaoAutomatica";
import { montarFila, proximosStatus } from "@/lib/pedidos/regras";
import { listarPedidos } from "@/lib/pedidos/store";
import { ROTULO_STATUS_PEDIDO, type Pedido, type StatusPedido } from "@/lib/pedidos/types";
import { ROTULO_FORMA_PAGAMENTO } from "@/lib/vendas/types";
import { mudarStatusPedido } from "./actions";

export const dynamic = "force-dynamic";

const formatarMoeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const QUANTIDADE_FINALIZADOS = 10;

const ROTULO_ACAO: Record<StatusPedido, string> = {
  recebido: "Receber",
  em_preparo: "Iniciar preparo",
  pronto: "Marcar como pronto",
  entregue: "Entregar",
  cancelado: "Cancelar",
};

function hora(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function CartaoPedido({ pedido }: { pedido: Pedido }) {
  const acoes = proximosStatus(pedido.status);

  return (
    <li className="rounded-lg border border-gray-200 p-4 text-sm shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-lg font-black text-gray-900">#{pedido.numero}</p>
          <p className="font-medium text-gray-900">{pedido.clienteNome}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-gray-900">{formatarMoeda.format(pedido.total)}</p>
          <p className="text-xs text-gray-500">{ROTULO_FORMA_PAGAMENTO[pedido.formaPagamento]}</p>
          <p className="text-xs text-gray-500">{hora(pedido.criadoEm)}</p>
        </div>
      </div>
      <ul className="mt-2 text-gray-700">
        {pedido.itens.map((item) => (
          <li key={item.produtoId}>
            {item.quantidade}x {item.nome}
          </li>
        ))}
      </ul>
      {pedido.observacao && (
        <p className="mt-2 rounded bg-amber-50 px-2 py-1 text-xs text-amber-800">Obs: {pedido.observacao}</p>
      )}
      {acoes.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {acoes.map((status) => (
            <form key={status} action={mudarStatusPedido}>
              <input type="hidden" name="pedidoId" value={pedido.id} />
              <input type="hidden" name="novoStatus" value={status} />
              <button
                type="submit"
                className={
                  status === "cancelado"
                    ? "rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                    : "rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                }
              >
                {ROTULO_ACAO[status]}
              </button>
            </form>
          ))}
        </div>
      )}
    </li>
  );
}

interface ControlePageProps {
  searchParams: Promise<{ erro?: string | string[] }>;
}

export default async function ControlePedidosPage({ searchParams }: ControlePageProps) {
  const parametros = await searchParams;
  const erro = (Array.isArray(parametros.erro) ? parametros.erro[0] : parametros.erro ?? "").slice(0, 200);

  const pedidos = listarPedidos();
  const fila = montarFila(pedidos);
  const colunas: { status: StatusPedido; pedidos: Pedido[] }[] = (
    ["recebido", "em_preparo", "pronto"] as StatusPedido[]
  ).map((status) => ({ status, pedidos: fila.filter((p) => p.status === status) }));

  const finalizados = pedidos
    .filter((p) => p.status === "entregue" || p.status === "cancelado")
    .sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm))
    .slice(0, QUANTIDADE_FINALIZADOS);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <AtualizacaoAutomatica segundos={10} />
      <Navegacao atual="/pedidos/controle" />
      <h1 className="mt-6 text-2xl font-bold text-gray-900">Controle de Pedidos</h1>
      <p className="mt-1 text-sm text-gray-500">
        Pacote 1.6.1 — avance cada pedido: recebido → em preparo → pronto → entregue.
        Cancelamento só é possível antes de ficar pronto.
      </p>

      {erro && (
        <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">
          {erro}
        </p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {colunas.map((coluna) => (
          <section key={coluna.status}>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
              {ROTULO_STATUS_PEDIDO[coluna.status]} ({coluna.pedidos.length})
            </h2>
            {coluna.pedidos.length === 0 ? (
              <p className="mt-3 rounded-md border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-400">
                Nenhum pedido.
              </p>
            ) : (
              <ul className="mt-3 space-y-3">
                {coluna.pedidos.map((pedido) => (
                  <CartaoPedido key={pedido.id} pedido={pedido} />
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-gray-900">Finalizados recentemente</h2>
        {finalizados.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">Nenhum pedido finalizado ainda.</p>
        ) : (
          <ul className="mt-3 divide-y divide-gray-200 rounded-md border border-gray-200">
            {finalizados.map((pedido) => (
              <li key={pedido.id} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                <p>
                  <span className="font-semibold text-gray-900">#{pedido.numero}</span>{" "}
                  <span className="text-gray-700">{pedido.clienteNome}</span>
                </p>
                <p className={pedido.status === "entregue" ? "text-emerald-700" : "text-gray-400"}>
                  {ROTULO_STATUS_PEDIDO[pedido.status]} às {hora(pedido.atualizadoEm)} ·{" "}
                  {formatarMoeda.format(pedido.total)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
