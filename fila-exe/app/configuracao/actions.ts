"use server";

import { revalidatePath } from "next/cache";
import { validarConfiguracao } from "@/lib/configuracao/regras";
import { salvarConfiguracao } from "@/lib/configuracao/store";
import type { ConfiguracaoState } from "./estado";

function lerInteiro(bruto: FormDataEntryValue | null): number {
  const texto = String(bruto ?? "").trim();
  return texto === "" ? Number.NaN : Number(texto);
}

export async function salvarConfiguracaoCantina(
  _estadoAnterior: ConfiguracaoState,
  formData: FormData
): Promise<ConfiguracaoState> {
  const resultado = validarConfiguracao({
    nomeCantina: String(formData.get("nomeCantina") ?? ""),
    horarioAbertura: String(formData.get("horarioAbertura") ?? ""),
    horarioFechamento: String(formData.get("horarioFechamento") ?? ""),
    aceitandoPedidos: formData.get("aceitandoPedidos") === "on",
    tempoPreparoMinutos: lerInteiro(formData.get("tempoPreparoMinutos")),
    limitePedidosAtivos: lerInteiro(formData.get("limitePedidosAtivos")),
  });

  if (!resultado.valido || !resultado.dados) {
    return {
      success: false,
      message: "Corrija os campos destacados e tente novamente.",
      errors: resultado.erros,
    };
  }

  salvarConfiguracao(resultado.dados);

  revalidatePath("/configuracao");
  revalidatePath("/pedidos/novo");
  revalidatePath("/fila");

  return { success: true, message: "Configuração salva com sucesso!", errors: {} };
}
