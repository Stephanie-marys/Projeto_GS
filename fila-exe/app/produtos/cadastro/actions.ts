"use server";

import { revalidatePath } from "next/cache";
import { criarProduto } from "@/lib/produtos/store";
import { validarProduto } from "@/lib/produtos/validation";
import type { CategoriaProduto } from "@/lib/produtos/types";
import type { CadastroProdutoState } from "./estado";

export async function cadastrarProduto(
  _prevState: CadastroProdutoState,
  formData: FormData
): Promise<CadastroProdutoState> {
  const dados = {
    nome: String(formData.get("nome") ?? "").trim(),
    descricao: String(formData.get("descricao") ?? "").trim(),
    preco: Number(formData.get("preco")),
    categoria: String(formData.get("categoria") ?? "") as CategoriaProduto,
    disponivel: formData.get("disponivel") === "on",
  };

  const { valido, erros } = validarProduto(dados);

  if (!valido) {
    return {
      success: false,
      message: "Corrija os campos destacados e tente novamente.",
      errors: erros,
    };
  }

  const produto = criarProduto(dados);

  // Revalida a página para que a lista de produtos cadastrados seja atualizada.
  revalidatePath("/produtos/cadastro");

  return {
    success: true,
    message: `Produto "${produto.nome}" cadastrado com sucesso!`,
    errors: {},
  };
}