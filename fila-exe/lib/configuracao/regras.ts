import type { ConfiguracaoCantina, DadosConfiguracaoForm } from "./types.ts";

/**
 * Regras e validações da Configuração da Cantina (pacote 1.7.1).
 *
 * A configuração define quando a cantina recebe pedidos online (horário de
 * funcionamento + pausa manual), quantos pedidos podem estar na fila ao
 * mesmo tempo e o tempo médio de preparo usado na estimativa da fila.
 *
 * Os horários são sempre interpretados no fuso de Brasília, independente
 * do fuso do servidor. As funções recebem `agora` como parâmetro para
 * poderem ser testadas sem depender do relógio.
 */

export const FUSO_CANTINA = "America/Sao_Paulo";

export const TEMPO_PREPARO_MINIMO = 1;
export const TEMPO_PREPARO_MAXIMO = 120;
export const LIMITE_PEDIDOS_MINIMO = 1;
export const LIMITE_PEDIDOS_MAXIMO = 200;

export type CamposConfiguracao =
  | "nomeCantina"
  | "horarioAbertura"
  | "horarioFechamento"
  | "tempoPreparoMinutos"
  | "limitePedidosAtivos";

export interface ResultadoValidacaoConfiguracao {
  valido: boolean;
  erros: Partial<Record<CamposConfiguracao, string>>;
  dados?: ConfiguracaoCantina;
}

const FORMATO_HORARIO = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** "07:30" → 450. Retorna null se o texto não for um horário válido. */
export function horarioParaMinutos(horario: string): number | null {
  const encontrado = FORMATO_HORARIO.exec(horario.trim());
  if (!encontrado) return null;
  return Number(encontrado[1]) * 60 + Number(encontrado[2]);
}

/** Minutos desde a meia-noite no horário de Brasília. */
export function minutosDoDiaNaCantina(agora: Date): number {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: FUSO_CANTINA,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(agora);

  const hora = Number(partes.find((p) => p.type === "hour")?.value ?? 0);
  const minuto = Number(partes.find((p) => p.type === "minute")?.value ?? 0);
  return hora * 60 + minuto;
}

/**
 * Valida os dados do formulário de configuração.
 *
 * Regras:
 *  - nome da cantina: 2 a 60 caracteres;
 *  - horários no formato HH:MM, com abertura antes do fechamento
 *    (a cantina não funciona virando a meia-noite);
 *  - tempo de preparo: inteiro de 1 a 120 minutos;
 *  - limite de pedidos ativos: inteiro de 1 a 200.
 */
export function validarConfiguracao(
  dados: DadosConfiguracaoForm
): ResultadoValidacaoConfiguracao {
  const erros: Partial<Record<CamposConfiguracao, string>> = {};

  const nomeCantina = (dados.nomeCantina ?? "").trim();
  if (nomeCantina.length < 2) {
    erros.nomeCantina = "Informe um nome com pelo menos 2 caracteres.";
  } else if (nomeCantina.length > 60) {
    erros.nomeCantina = "O nome deve ter no máximo 60 caracteres.";
  }

  const abertura = horarioParaMinutos(dados.horarioAbertura ?? "");
  const fechamento = horarioParaMinutos(dados.horarioFechamento ?? "");

  if (abertura === null) {
    erros.horarioAbertura = "Informe o horário de abertura no formato HH:MM.";
  }
  if (fechamento === null) {
    erros.horarioFechamento = "Informe o horário de fechamento no formato HH:MM.";
  } else if (abertura !== null && fechamento <= abertura) {
    erros.horarioFechamento =
      "O horário de fechamento deve ser depois do horário de abertura.";
  }

  const tempo = dados.tempoPreparoMinutos;
  if (
    !Number.isInteger(tempo) ||
    tempo < TEMPO_PREPARO_MINIMO ||
    tempo > TEMPO_PREPARO_MAXIMO
  ) {
    erros.tempoPreparoMinutos = `Use um número inteiro de ${TEMPO_PREPARO_MINIMO} a ${TEMPO_PREPARO_MAXIMO} minutos.`;
  }

  const limite = dados.limitePedidosAtivos;
  if (
    !Number.isInteger(limite) ||
    limite < LIMITE_PEDIDOS_MINIMO ||
    limite > LIMITE_PEDIDOS_MAXIMO
  ) {
    erros.limitePedidosAtivos = `Use um número inteiro de ${LIMITE_PEDIDOS_MINIMO} a ${LIMITE_PEDIDOS_MAXIMO}.`;
  }

  if (Object.keys(erros).length > 0) {
    return { valido: false, erros };
  }

  return {
    valido: true,
    erros: {},
    dados: {
      nomeCantina,
      horarioAbertura: dados.horarioAbertura.trim(),
      horarioFechamento: dados.horarioFechamento.trim(),
      aceitandoPedidos: Boolean(dados.aceitandoPedidos),
      tempoPreparoMinutos: tempo,
      limitePedidosAtivos: limite,
    },
  };
}

export type SituacaoCantina =
  | { aberta: true }
  | { aberta: false; motivo: string };

/**
 * A cantina recebe pedidos online quando está dentro do horário de
 * funcionamento (abertura inclusiva, fechamento exclusivo) e não foi
 * pausada manualmente.
 */
export function situacaoCantina(
  config: ConfiguracaoCantina,
  agora: Date
): SituacaoCantina {
  if (!config.aceitandoPedidos) {
    return {
      aberta: false,
      motivo: "A cantina pausou o recebimento de pedidos no momento.",
    };
  }

  const abertura = horarioParaMinutos(config.horarioAbertura) ?? 0;
  const fechamento = horarioParaMinutos(config.horarioFechamento) ?? 24 * 60;
  const minutos = minutosDoDiaNaCantina(agora);

  if (minutos < abertura || minutos >= fechamento) {
    return {
      aberta: false,
      motivo: `A cantina recebe pedidos das ${config.horarioAbertura} às ${config.horarioFechamento}.`,
    };
  }

  return { aberta: true };
}
