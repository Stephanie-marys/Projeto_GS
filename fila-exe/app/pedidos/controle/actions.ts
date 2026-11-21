"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { atualizarStatusPedido } from "@/lib/pedidos/store";
import { STATUS_PEDIDO, type StatusPedido } from "@/lib/pedidos/types";

/**
 * Muda o status de um pedido. Em caso de erro (ex: outro funcionário já
 * mudou o status), volta para a tela com a mensagem na URL.
 */
export async function mudarStatusPedido(formData: FormData): Promise<void> {
  const id = String(formData.get("pedidoId") ?? "");
  const novoStatus = String(formData.get("novoStatus") ?? "") as StatusPedido;

  const resultado = STATUS_PEDIDO.includes(novoStatus)
    ? atualizarStatusPedido(id, novoStatus)
    : { sucesso: false as const, erro: "Status inválido." };

  revalidatePath("/pedidos/controle");
  revalidatePath("/fila");
  revalidatePath("/relatorios/vendas");

  redirect(
    resultado.sucesso
      ? "/pedidos/controle"
      : `/pedidos/controle?erro=${encodeURIComponent(resultado.erro)}`
  );
}
