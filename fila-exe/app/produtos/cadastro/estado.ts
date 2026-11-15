import type { CamposProduto } from "@/lib/produtos/validation";

export interface CadastroProdutoState {
  success: boolean;
  message: string;
  errors: Partial<Record<CamposProduto, string>>;
}

export const estadoInicialCadastro: CadastroProdutoState = {
  success: false,
  message: "",
  errors: {},
};
