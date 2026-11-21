import Navegacao from "@/app/components/Navegacao";
import { situacaoCantina } from "@/lib/configuracao/regras";
import { obterConfiguracao } from "@/lib/configuracao/store";
import { pedidosAtivos } from "@/lib/pedidos/regras";
import { listarPedidos } from "@/lib/pedidos/store";
import { montarCatalogo } from "@/lib/produtos/catalogo";
import { listarProdutos } from "@/lib/produtos/store";
import PedidoForm from "./PedidoForm";

export const dynamic = "force-dynamic";

export default function NovoPedidoPage() {
  const config = obterConfiguracao();
  const situacao = situacaoCantina(config, new Date());
  const ativos = pedidosAtivos(listarPedidos()).length;
  const filaCheia = ativos >= config.limitePedidosAtivos;

  const produtos = montarCatalogo(listarProdutos()).map((produto) => ({
    id: produto.id,
    nome: produto.nome,
    categoria: produto.categoria,
    preco: produto.preco,
    descricao: produto.descricao,
  }));

  const aviso = !situacao.aberta
    ? situacao.motivo
    : filaCheia
      ? "A fila está cheia no momento. Tente novamente em alguns minutos."
      : null;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Navegacao atual="/pedidos/novo" />
      <h1 className="mt-6 text-2xl font-bold text-gray-900">Fazer pedido — {config.nomeCantina}</h1>
      <p className="mt-1 text-sm text-gray-500">
        Pacote 1.2.1 — escolha os produtos, receba uma senha e retire quando
        ficar pronto. Pedidos na fila agora: {ativos}.
      </p>

      {aviso && (
        <p className="mt-4 rounded-md bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800" role="status">
          {aviso}
        </p>
      )}

      <PedidoForm produtos={produtos} bloqueado={aviso !== null} />
    </main>
  );
}
