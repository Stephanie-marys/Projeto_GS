"use server";

import { revalidatePath } from "next/cache";
import { registrarPedido } from "@/lib/pedidos/store";
import type { ItemPedidoInput } from "@/lib/pedidos/types";
import type { NovoPedidoState } from "./estado";

const formatarMoeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export async function fazerPedido(
  estadoAnterior: NovoPedidoState,
  formData: FormData
): Promise<NovoPedidoState> {
  const itens: ItemPedidoInput[] = [];

  for (const [chave, valor] of formData.entries()) {
    if (!chave.startsWith("qtd_")) continue;
    const bruto = String(valor).trim();
    if (bruto === "" || bruto === "0") continue;
    itens.push({ produtoId: chave.slice(4), quantidade: Number(bruto) });
  }

  const resultado = registrarPedido({
    clienteNome: String(formData.get("clienteNome") ?? ""),
    itens,
    formaPagamento: String(formData.get("formaPagamento") ?? ""),
    observacao: String(formData.get("observacao") ?? ""),
  });

  if (!resultado.sucesso) {
    return {
      success: false,
      message:
        resultado.erros.geral ?? "Corrija os campos destacados e tente novamente.",
      errors: resultado.erros,
      sequencia: estadoAnterior.sequencia,
    };
  }

  revalidatePath("/fila");
  revalidatePath("/pedidos/controle");

  const { pedido } = resultado;
  return {
    success: true,
    message: `Pedido #${pedido.numero} registrado: ${formatarMoeda.format(pedido.total)}. Pague na retirada.`,
    errors: {},
    numero: pedido.numero,
    sequencia: estadoAnterior.sequencia + 1,
  };
}
