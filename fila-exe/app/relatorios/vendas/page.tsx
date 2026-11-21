import Link from "next/link";
import Navegacao from "@/app/components/Navegacao";
import { listarPedidos } from "@/lib/pedidos/store";
import {
  gerarRelatorio,
  registrosDeVenda,
  ROTULO_ORIGEM,
  validarFiltroRelatorio,
} from "@/lib/relatorios/vendas";
import { listarVendas } from "@/lib/vendas/store";
import { ROTULO_FORMA_PAGAMENTO } from "@/lib/vendas/types";

export const dynamic = "force-dynamic";

const formatarMoeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function formatarData(iso: string) {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

interface RelatorioPageProps {
  searchParams: Promise<{ inicio?: string | string[]; fim?: string | string[] }>;
}

const classeInput =
  "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500";

function Cartao({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{rotulo}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{valor}</p>
    </div>
  );
}

function Tabela({
  titulo,
  colunas,
  linhas,
}: {
  titulo: string;
  colunas: string[];
  linhas: (string | number)[][];
}) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-gray-900">{titulo}</h2>
      {linhas.length === 0 ? (
        <p className="mt-3 text-sm text-gray-500">Sem dados no período.</p>
      ) : (
        <div className="mt-3 overflow-x-auto rounded-md border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                {colunas.map((c, i) => (
                  <th key={c} className={`px-4 py-2 font-medium ${i > 0 ? "text-right" : ""}`}>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {linhas.map((linha, i) => (
                <tr key={i}>
                  {linha.map((celula, j) => (
                    <td key={j} className={`px-4 py-2 ${j > 0 ? "text-right tabular-nums" : "text-gray-900"}`}>
                      {celula}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default async function RelatorioVendasPage({ searchParams }: RelatorioPageProps) {
  const parametros = await searchParams;
  const { filtro, erro } = validarFiltroRelatorio(parametros, new Date());
  const relatorio = gerarRelatorio(registrosDeVenda(listarVendas(), listarPedidos()), filtro);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <Navegacao atual="/relatorios/vendas" />
      <h1 className="mt-6 text-2xl font-bold text-gray-900">Relatório de Vendas</h1>
      <p className="mt-1 text-sm text-gray-500">
        Pacote 1.8.1 — vendas presenciais e pedidos online entregues, de{" "}
        {formatarData(filtro.dataInicio)} a {formatarData(filtro.dataFim)}.
      </p>

      <form action="/relatorios/vendas" method="get" className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div>
          <label htmlFor="inicio" className="block text-sm font-medium text-gray-700">
            De
          </label>
          <input id="inicio" name="inicio" type="date" defaultValue={filtro.dataInicio} className={classeInput} />
        </div>
        <div>
          <label htmlFor="fim" className="block text-sm font-medium text-gray-700">
            Até
          </label>
          <input id="fim" name="fim" type="date" defaultValue={filtro.dataFim} className={classeInput} />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700"
          >
            Gerar relatório
          </button>
          <Link
            href="/relatorios/vendas"
            className="flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Hoje
          </Link>
        </div>
      </form>

      {erro && <p className="mt-3 text-sm text-amber-700">{erro}</p>}

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Cartao rotulo="Total vendido" valor={formatarMoeda.format(relatorio.totalVendido)} />
        <Cartao rotulo="Vendas" valor={String(relatorio.quantidadeVendas)} />
        <Cartao rotulo="Ticket médio" valor={formatarMoeda.format(relatorio.ticketMedio)} />
        <Cartao rotulo="Itens vendidos" valor={String(relatorio.itensVendidos)} />
      </div>

      <Tabela
        titulo="Produtos mais vendidos"
        colunas={["Produto", "Quantidade", "Total"]}
        linhas={relatorio.produtosMaisVendidos.map((p) => [p.nome, p.quantidade, formatarMoeda.format(p.total)])}
      />

      <Tabela
        titulo="Por forma de pagamento"
        colunas={["Forma", "Vendas", "Total"]}
        linhas={relatorio.porFormaPagamento.map((l) => [
          ROTULO_FORMA_PAGAMENTO[l.chave],
          l.quantidadeVendas,
          formatarMoeda.format(l.total),
        ])}
      />

      <Tabela
        titulo="Por origem"
        colunas={["Origem", "Vendas", "Total"]}
        linhas={relatorio.porOrigem.map((l) => [ROTULO_ORIGEM[l.chave], l.quantidadeVendas, formatarMoeda.format(l.total)])}
      />

      <Tabela
        titulo="Por dia"
        colunas={["Dia", "Vendas", "Total"]}
        linhas={relatorio.porDia.map((l) => [formatarData(l.chave), l.quantidadeVendas, formatarMoeda.format(l.total)])}
      />
    </main>
  );
}
