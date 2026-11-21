import { describe, test } from "node:test";
import assert from "node:assert/strict";
import {
  horarioParaMinutos,
  minutosDoDiaNaCantina,
  situacaoCantina,
  validarConfiguracao,
} from "./regras.ts";
import { CONFIGURACAO_PADRAO, type DadosConfiguracaoForm } from "./types.ts";

function dados(overrides: Partial<DadosConfiguracaoForm> = {}): DadosConfiguracaoForm {
  return { ...CONFIGURACAO_PADRAO, ...overrides };
}

/** 10:00 em Brasília (UTC-3). */
const dezDaManha = new Date("2026-11-20T13:00:00Z");

describe("horarioParaMinutos", () => {
  test("converte HH:MM em minutos", () => {
    assert.equal(horarioParaMinutos("07:30"), 450);
    assert.equal(horarioParaMinutos("00:00"), 0);
    assert.equal(horarioParaMinutos("23:59"), 1439);
  });

  test("rejeita formatos inválidos", () => {
    for (const h of ["7:30", "24:00", "12:60", "abc", ""]) {
      assert.equal(horarioParaMinutos(h), null, h);
    }
  });
});

describe("minutosDoDiaNaCantina", () => {
  test("usa o fuso de Brasília independente do fuso do servidor", () => {
    assert.equal(minutosDoDiaNaCantina(dezDaManha), 600);
  });
});

describe("validarConfiguracao", () => {
  test("aceita a configuração padrão", () => {
    const r = validarConfiguracao(dados());
    assert.equal(r.valido, true);
    assert.deepEqual(r.dados, CONFIGURACAO_PADRAO);
  });

  test("apara o nome e rejeita nome curto ou longo", () => {
    assert.equal(validarConfiguracao(dados({ nomeCantina: "  Cantina  " })).dados?.nomeCantina, "Cantina");
    assert.ok(validarConfiguracao(dados({ nomeCantina: "a" })).erros.nomeCantina);
    assert.ok(validarConfiguracao(dados({ nomeCantina: "a".repeat(61) })).erros.nomeCantina);
  });

  test("rejeita horário inválido", () => {
    const r = validarConfiguracao(dados({ horarioAbertura: "25:00" }));
    assert.equal(r.valido, false);
    assert.match(r.erros.horarioAbertura ?? "", /HH:MM/);
  });

  test("fechamento precisa ser depois da abertura", () => {
    for (const fechamento of ["07:00", "06:00"]) {
      const r = validarConfiguracao(dados({ horarioAbertura: "07:00", horarioFechamento: fechamento }));
      assert.equal(r.valido, false);
      assert.match(r.erros.horarioFechamento ?? "", /depois/);
    }
  });

  test("tempo de preparo e limite precisam ser inteiros dentro da faixa", () => {
    for (const tempo of [0, 121, 2.5, Number.NaN]) {
      assert.ok(validarConfiguracao(dados({ tempoPreparoMinutos: tempo })).erros.tempoPreparoMinutos, String(tempo));
    }
    for (const limite of [0, 201, 1.5, Number.NaN]) {
      assert.ok(validarConfiguracao(dados({ limitePedidosAtivos: limite })).erros.limitePedidosAtivos, String(limite));
    }
  });
});

describe("situacaoCantina", () => {
  test("aberta dentro do horário", () => {
    assert.deepEqual(situacaoCantina(CONFIGURACAO_PADRAO, dezDaManha), { aberta: true });
  });

  test("fechada quando pausada manualmente", () => {
    const r = situacaoCantina({ ...CONFIGURACAO_PADRAO, aceitandoPedidos: false }, dezDaManha);
    assert.equal(r.aberta, false);
    assert.match(!r.aberta ? r.motivo : "", /pausou/);
  });

  test("abertura é inclusiva e fechamento é exclusivo", () => {
    const config = { ...CONFIGURACAO_PADRAO, horarioAbertura: "10:00", horarioFechamento: "11:00" };
    assert.equal(situacaoCantina(config, dezDaManha).aberta, true);
    const onzeHoras = new Date("2026-11-20T14:00:00Z");
    assert.equal(situacaoCantina(config, onzeHoras).aberta, false);
  });

  test("fechada fora do horário", () => {
    const config = { ...CONFIGURACAO_PADRAO, horarioAbertura: "11:00", horarioFechamento: "15:00" };
    const r = situacaoCantina(config, dezDaManha);
    assert.equal(r.aberta, false);
    assert.match(!r.aberta ? r.motivo : "", /11:00 às 15:00/);
  });
});
