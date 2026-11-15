"use server";

import { revalidatePath } from "next/cache";
import { registrarVendaPresencial } from "@/lib/vendas/store";
import type { ItemVendaInput } from "@/lib/vendas/types";
import type { VendaPresencialState } from "./estado";

const formatarMoeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function lerValorRecebido(bruto: FormDataEntryValue | null): number | undefined {
  const texto = String(bruto ?? "").trim().replace(",", ".");
  if (texto === "") return undefined;
  return Number(texto);
}

export async function registrarVenda(
  estadoAnterior: VendaPresencialState,
  formData: FormData
): Promise<VendaPresencialState> {
  const itens: ItemVendaInput[] = [];

  for (const [chave, valor] of formData.entries()) {
    if (!chave.startsWith("qtd_")) continue;
    const bruto = String(valor).trim();
    if (bruto === "" || bruto === "0") continue;
    itens.push({ produtoId: chave.slice(4), quantidade: Number(bruto) });
  }

  const resultado = registrarVendaPresencial({
    clienteNome: String(formData.get("clienteNome") ?? ""),
    itens,
    formaPagamento: String(formData.get("formaPagamento") ?? ""),
    valorRecebido: lerValorRecebido(formData.get("valorRecebido")),
  });

  if (!resultado.sucesso) {
    return {
      success: false,
      message: "Corrija os campos destacados e tente novamente.",
      errors: resultado.erros,
      sequencia: estadoAnterior.sequencia,
    };
  }

  revalidatePath("/vendas/presencial");

  const { venda } = resultado;
  const trocoTexto =
    venda.troco > 0 ? ` Troco: ${formatarMoeda.format(venda.troco)}.` : "";

  return {
    success: true,
    message: `Venda registrada: ${formatarMoeda.format(venda.total)}.${trocoTexto}`,
    errors: {},
    sequencia: estadoAnterior.sequencia + 1,
  };
}
