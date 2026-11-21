import Navegacao from "@/app/components/Navegacao";
import { situacaoCantina } from "@/lib/configuracao/regras";
import { obterConfiguracao } from "@/lib/configuracao/store";
import ConfiguracaoForm from "./ConfiguracaoForm";

export const dynamic = "force-dynamic";

export default function ConfiguracaoPage() {
  const config = obterConfiguracao();
  const situacao = situacaoCantina(config, new Date());

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Navegacao atual="/configuracao" />
      <h1 className="mt-6 text-2xl font-bold text-gray-900">Configuração da Cantina</h1>
      <p className="mt-1 text-sm text-gray-500">
        Pacote 1.7.1 — horário, pausa e capacidade da fila (dados em memória,
        substituir por persistência real futuramente).
      </p>

      <p
        className={`mt-4 rounded-md px-4 py-3 text-sm font-medium ${
          situacao.aberta ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"
        }`}
        role="status"
      >
        {situacao.aberta
          ? "Agora: recebendo pedidos online."
          : `Agora: não recebendo pedidos. ${situacao.motivo}`}
      </p>

      <ConfiguracaoForm atual={config} />
    </main>
  );
}
