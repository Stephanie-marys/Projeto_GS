import type { CamposVenda } from "@/lib/vendas/regras";

export interface VendaPresencialState {
  success: boolean;
  message: string;
  errors: Partial<Record<CamposVenda, string>>;
  sequencia: number;
}

export const estadoInicialVenda: VendaPresencialState = {
  success: false,
  message: "",
  errors: {},
  sequencia: 0,
};
