import { describe, test } from "node:test";
import assert from "node:assert/strict";
import type { Pedido, StatusPedido } from "../pedidos/types.ts";
import type { Venda } from "../vendas/types.ts";
import {
  dataNaCantina,
  gerarRelatorio,
  PERIODO_MAXIMO_DIAS,
  registrosDeVenda,
  validarFiltroRelatorio,
} from "./vendas.ts";

const coxinha = { produtoId: "p1", nome: "Coxinha", precoUnitario: 6.5 };
const suco = { produtoId: "p2", nome: "Suco", precoUnitario: 4.1 };

function venda(criadoEm: string, quantidadeCoxinha: number, formaPagamento: Venda["formaPagamento"] = "pix"): Venda {
  const subtotal = Math.round(6.5 * 100 * quantidadeCoxinha) / 100;
  return {
    id: crypto.randomUUID(),
    criadoEm,
    origem: "presencial",
    clienteNome: "Cliente presencial",
    itens: [{ ...coxinha, quantidade: quantidadeCoxinha, subtotal }],
    total: subtotal,
    formaPagamento,
    troco: 0,
  };
}

function pedido(status: StatusPedido, entregueEm: string, quantidadeSuco: number): Pedido {
  const subtotal = Math.round(4.1 * 100 * quantidadeSuco) / 100;
  const historico: Pedido["historico"] = [{ status: "recebido", em: "2026-11-20T12:00:00Z" }];
  if (status === "entregue") historico.push({ status: "entregue", em: entregueEm });
  return {
    id: crypto.randomUUID(),
    numero: 1,
    clienteNome: "Ana",
    itens: [{ ...suco, quantidade: quantidadeSuco, subtotal }],
    total: subtotal,
    formaPagamento: "dinheiro",
    status,
    criadoEm: "2026-11-20T12:00:00Z",
    atualizadoEm: entregueEm,
    historico,
  };
}

const agora = new Date("2026-11-20T15:00:00Z");

describe("dataNaCantina", () => {
  test("usa o fuso de Brasília (01:00 UTC ainda é o dia anterior)", () => {
    assert.equal(dataNaCantina(new Date("2026-11-21T01:00:00Z")), "2026-11-20");
  });
});

describe("validarFiltroRelatorio", () => {
  test("sem parâmetros usa o dia de hoje", () => {
    assert.deepEqual(validarFiltroRelatorio({}, agora).filtro, { dataInicio: "2026-11-20", dataFim: "2026-11-20" });
  });

  test("data inválida cai no padrão e devolve aviso", () => {
    const r = validarFiltroRelatorio({ inicio: "2026-02-30" }, agora);
    assert.equal(r.filtro.dataInicio, "2026-11-20");
    assert.ok(r.erro);
  });

  test("inverte início e fim trocados", () => {
    const r = validarFiltroRelatorio({ inicio: "2026-11-20", fim: "2026-11-01" }, agora);
    assert.deepEqual(r.filtro, { dataInicio: "2026-11-01", dataFim: "2026-11-20" });
  });

  test("só uma das datas vira período de um dia", () => {
    assert.deepEqual(validarFiltroRelatorio({ fim: "2026-11-05" }, agora).filtro, { dataInicio: "2026-11-05", dataFim: "2026-11-05" });
  });

  test("limita o período máximo", () => {
    const r = validarFiltroRelatorio({ inicio: "2020-01-01", fim: "2026-11-20" }, agora);
    assert.ok(r.erro);
    const dias = (Date.parse(r.filtro.dataFim) - Date.parse(r.filtro.dataInicio)) / 86_400_000 + 1;
    assert.equal(dias, PERIODO_MAXIMO_DIAS);
  });
});

describe("registrosDeVenda", () => {
  test("inclui vendas presenciais e só pedidos entregues, na data da entrega", () => {
    const registros = registrosDeVenda(
      [venda("2026-11-20T13:00:00Z", 1)],
      [
        pedido("entregue", "2026-11-20T14:00:00Z", 1),
        pedido("cancelado", "2026-11-20T14:00:00Z", 1),
        pedido("pronto", "2026-11-20T14:00:00Z", 1),
      ]
    );
    assert.equal(registros.length, 2);
    assert.equal(registros.find((r) => r.origem === "pedido")?.data, "2026-11-20T14:00:00Z");
  });
});

describe("gerarRelatorio", () => {
  const registros = registrosDeVenda(
    [
      venda("2026-11-20T13:00:00Z", 2, "pix"),
      venda("2026-11-19T13:00:00Z", 1, "dinheiro"),
      venda("2026-11-10T13:00:00Z", 10, "pix"),
    ],
    [pedido("entregue", "2026-11-20T14:00:00Z", 3)]
  );

  test("totais, ticket médio e itens do período", () => {
    const r = gerarRelatorio(registros, { dataInicio: "2026-11-19", dataFim: "2026-11-20" });
    assert.equal(r.quantidadeVendas, 3);
    assert.equal(r.totalVendido, 31.8); // 13 + 6,5 + 12,3
    assert.equal(r.ticketMedio, 10.6);
    assert.equal(r.itensVendidos, 6);
  });

  test("quebras por forma de pagamento, origem e dia", () => {
    const r = gerarRelatorio(registros, { dataInicio: "2026-11-19", dataFim: "2026-11-20" });
    assert.deepEqual(
      r.porFormaPagamento.map((l) => [l.chave, l.total]),
      [["dinheiro", 18.8], ["pix", 13]]
    );
    assert.deepEqual(r.porOrigem.map((l) => [l.chave, l.quantidadeVendas]), [["presencial", 2], ["pedido", 1]]);
    assert.deepEqual(r.porDia.map((l) => [l.chave, l.total]), [["2026-11-19", 6.5], ["2026-11-20", 25.3]]);
  });

  test("ranking de produtos por quantidade", () => {
    const r = gerarRelatorio(registros, { dataInicio: "2026-11-19", dataFim: "2026-11-20" });
    assert.deepEqual(r.produtosMaisVendidos.map((p) => [p.nome, p.quantidade]), [["Coxinha", 3], ["Suco", 3]]);
  });

  test("período sem vendas não divide por zero", () => {
    const r = gerarRelatorio(registros, { dataInicio: "2026-01-01", dataFim: "2026-01-02" });
    assert.equal(r.quantidadeVendas, 0);
    assert.equal(r.ticketMedio, 0);
    assert.deepEqual(r.produtosMaisVendidos, []);
  });
});
