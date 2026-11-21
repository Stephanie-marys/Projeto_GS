import type { CamposConfiguracao } from "@/lib/configuracao/regras";

export interface ConfiguracaoState {
  success: boolean;
  message: string;
  errors: Partial<Record<CamposConfiguracao, string>>;
}

export const estadoInicialConfiguracao: ConfiguracaoState = {
  success: false,
  message: "",
  errors: {},
};
