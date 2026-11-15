import Link from "next/link";
import { listarProdutos } from "@/lib/produtos/store";
import { montarCatalogo } from "@/lib/produtos/catalogo";
import { listarVendas } from "@/lib/vendas/store";
import { ROTULO_FORMA_PAGAMENTO } from "@/lib/vendas/types";
import VendaForm from "./VendaForm";

export const dynamic = "force-dynamic";

const formatarMoeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const QUANTIDADE_VENDAS_RECENTES = 10;

export default function VendaPresencialPage() {
  const produtos = montarCatalogo(listarProdutos()).map((produto) => ({
    id: produto.id,
    nome: produto.nome,
    categoria: produto.categoria,
    preco: produto.preco,
  }));
  const vendas = listarVendas().slice(0, QUANTIDADE_VENDAS_RECENTES);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Venda Presencial</h1>
        <nav className="flex gap-4 text-sm font-medium text-emerald-700">
          <Link href="/produtos/catalogo" className="hover:underline">
            Catálogo
          </Link>
          <Link href="/produtos/cadastro" className="hover:underline">
            Cadastro
          </Link>
        </nav>
      </div>
      <p className="mt-1 text-sm text-gray-500">
        Registro de vendas feitas no balcão, para quem não usa o sistema (dados
        em memória, substituir por persistência real futuramente).
      </p>

      <VendaForm produtos={produtos} />

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-gray-900">
          Vendas recentes ({vendas.length})
        </h2>

        {vendas.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">Nenhuma venda registrada ainda.</p>
        ) : (
          <ul className="mt-3 divide-y divide-gray-200 rounded-md border border-gray-200">
            {vendas.map((venda) => (
              <li key={venda.id} className="px-4 py-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-medium text-gray-900">{venda.clienteNome}</p>
                  <p className="font-medium text-gray-900">
                    {formatarMoeda.format(venda.total)}
                  </p>
                </div>
                <p className="mt-0.5 text-gray-500">
                  {new Date(venda.criadoEm).toLocaleTimeString("pt-BR", {
                    timeZone: "America/Sao_Paulo",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  · {ROTULO_FORMA_PAGAMENTO[venda.formaPagamento]} ·{" "}
                  {venda.itens
                    .map((item) => `${item.quantidade}x ${item.nome}`)
                    .join(", ")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
