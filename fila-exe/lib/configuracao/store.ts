import { CONFIGURACAO_PADRAO, type ConfiguracaoCantina } from "./types.ts";

/**
 * Mock de persistência em memória da configuração da cantina.
 *
 * Mesmo padrão dos demais stores: trocar por banco real depois não deve
 * exigir mudanças em quem consome estas funções.
 *
 * ⚠️ Os dados vivem só na memória do servidor e voltam ao padrão a cada
 * restart do `npm run dev`.
 */
let configuracao: ConfiguracaoCantina = { ...CONFIGURACAO_PADRAO };

export function obterConfiguracao(): ConfiguracaoCantina {
  return { ...configuracao };
}

/** Recebe dados já validados por `validarConfiguracao`. */
export function salvarConfiguracao(nova: ConfiguracaoCantina): ConfiguracaoCantina {
  configuracao = { ...nova };
  return obterConfiguracao();
}

/** Utilitário para testes — não deve ser usado em código de produção. */
export function restaurarConfiguracaoPadrao(): void {
  configuracao = { ...CONFIGURACAO_PADRAO };
}
