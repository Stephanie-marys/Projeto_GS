import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { CONFIGURACAO_PADRAO } from "../configuracao/types.ts";
import type { Produto } from "../produtos/types.ts";
import {
  acompanharPedido,
  lerNumeroPedido,
  montarFila,
  podeMudarStatus,
  proximosStatus,
  validarPedido,
  type ContextoPedido,
} from "./regras.ts";
import type { NovoPedidoInput, Pedido, StatusPedido } from "./types.ts";

function produto(overrides: Partial<Produto> = {}): Produto {
  return {
    id: crypto.randomUUID(),
    nome: "Produto",
    descricao: "",
    preco: 5,
    categoria: "Lanches",
    disponivel: true,
    criadoEm: new Date().toISOString(),
    ...overrides,
  };
}

function pedido(numero: number, status: StatusPedido, minuto = numero): Pedido {
  const em = new Date(Date.UTC(2026, 10, 20, 13, minuto)).toISOString();
  return {
    id: `id-${numero}`,
    numero,
    clienteNome: `Cliente ${numero}`,
    itens: [],
    total: 0,
    formaPagamento: "pix",
    status,
    criadoEm: em,
    atualizadoEm: em,
    historico: [{ status, em }],
  };
}

const coxinha = produto({ id: "p1", nome: "Coxinha", preco: 6.5 });
const suco = produto({ id: "p2", nome: "Suco", preco: 4.1 });
const esgotado = produto({ id: "p3", nome: "Pastel", disponivel: false });

/** 10:00 em Brasília. */
const agora = new Date("2026-11-20T13:00:00Z");

function contexto(overrides: Partial<ContextoPedido> = {}): ContextoPedido {
  return {
    produtos: [coxinha, suco, esgotado],
    config: CONFIGURACAO_PADRAO,
    pedidos: [],
    agora,
    ...overrides,
  };
}

function entrada(overrides: Partial<NovoPedidoInput> = {}): NovoPedidoInput {
  return {
    clienteNome: "Ana",
    itens: [{ produtoId: "p1", quantidade: 1 }],
    formaPagamento: "pix",
    ...overrides,
  };
}

describe("validarPedido — cantina", () => {
  test("rejeita pedido com a cantina pausada", () => {
    const r = validarPedido(entrada(), contexto({ config: { ...CONFIGURACAO_PADRAO, aceitandoPedidos: false } }));
    assert.equal(r.valido, false);
    assert.match(r.erros.geral ?? "", /pausou/);
  });

  test("rejeita pedido fora do horário", () => {
    const config = { ...CONFIGURACAO_PADRAO, horarioAbertura: "11:00", horarioFechamento: "14:00" };
    const r = validarPedido(entrada(), contexto({ config }));
    assert.equal(r.valido, false);
    assert.match(r.erros.geral ?? "", /11:00 às 14:00/);
  });

  test("rejeita quando a fila atingiu o limite; finalizados não contam", () => {
    const config = { ...CONFIGURACAO_PADRAO, limitePedidosAtivos: 2 };
    const cheia = [pedido(1, "recebido"), pedido(2, "pronto")];
    assert.match(validarPedido(entrada(), contexto({ config, pedidos: cheia })).erros.geral ?? "", /fila está cheia/);

    const comFinalizados = [pedido(1, "recebido"), pedido(2, "entregue"), pedido(3, "cancelado")];
    assert.equal(validarPedido(entrada(), contexto({ config, pedidos: comFinalizados })).valido, true);
  });
});

describe("validarPedido — dados", () => {
  test("calcula itens e total sem erro de ponto flutuante", () => {
    const r = validarPedido(
      entrada({ itens: [{ produtoId: "p1", quantidade: 2 }, { produtoId: "p2", quantidade: 3 }] }),
      contexto()
    );
    assert.equal(r.valido, true);
    assert.equal(r.dados?.total, 25.3);
    assert.equal(r.dados?.itens[1].subtotal, 12.3);
  });

  test("exige nome do cliente e apara espaços", () => {
    assert.match(validarPedido(entrada({ clienteNome: " " }), contexto()).erros.clienteNome ?? "", /nome/);
    assert.equal(validarPedido(entrada({ clienteNome: "  Ana  " }), contexto()).dados?.clienteNome, "Ana");
  });

  test("rejeita pedido vazio, produto esgotado e quantidade inválida", () => {
    assert.match(validarPedido(entrada({ itens: [] }), contexto()).erros.itens ?? "", /ao menos um/);
    assert.match(validarPedido(entrada({ itens: [{ produtoId: "p3", quantidade: 1 }] }), contexto()).erros.itens ?? "", /Pastel/);
    assert.match(validarPedido(entrada({ itens: [{ produtoId: "p1", quantidade: 0 }] }), contexto()).erros.itens ?? "", /Quantidade inválida/);
    assert.match(validarPedido(entrada({ itens: [{ produtoId: "x", quantidade: 1 }] }), contexto()).erros.itens ?? "", /não existe/);
  });

  test("rejeita forma de pagamento desconhecida", () => {
    assert.ok(validarPedido(entrada({ formaPagamento: "cheque" }), contexto()).erros.formaPagamento);
  });

  test("observação é opcional e limitada a 200 caracteres", () => {
    assert.equal(validarPedido(entrada({ observacao: "  " }), contexto()).dados?.observacao, undefined);
    assert.equal(validarPedido(entrada({ observacao: "sem cebola" }), contexto()).dados?.observacao, "sem cebola");
    assert.ok(validarPedido(entrada({ observacao: "a".repeat(201) }), contexto()).erros.observacao);
  });
});

describe("transições de status", () => {
  test("segue o fluxo recebido → em preparo → pronto → entregue", () => {
    assert.equal(podeMudarStatus("recebido", "em_preparo"), true);
    assert.equal(podeMudarStatus("em_preparo", "pronto"), true);
    assert.equal(podeMudarStatus("pronto", "entregue"), true);
  });

  test("não pula etapas nem volta atrás", () => {
    assert.equal(podeMudarStatus("recebido", "pronto"), false);
    assert.equal(podeMudarStatus("recebido", "entregue"), false);
    assert.equal(podeMudarStatus("pronto", "em_preparo"), false);
  });

  test("cancelamento só antes de ficar pronto", () => {
    assert.equal(podeMudarStatus("recebido", "cancelado"), true);
    assert.equal(podeMudarStatus("em_preparo", "cancelado"), true);
    assert.equal(podeMudarStatus("pronto", "cancelado"), false);
  });

  test("entregue e cancelado são finais", () => {
    assert.deepEqual(proximosStatus("entregue"), []);
    assert.deepEqual(proximosStatus("cancelado"), []);
  });
});

describe("fila virtual", () => {
  const pedidos = [
    pedido(3, "recebido"),
    pedido(1, "pronto"),
    pedido(2, "em_preparo"),
    pedido(4, "entregue"),
    pedido(5, "cancelado"),
    pedido(6, "recebido"),
  ];

  test("só mostra ativos, em ordem de chegada", () => {
    assert.deepEqual(montarFila(pedidos).map((p) => p.numero), [1, 2, 3, 6]);
  });

  test("calcula posição e estimativa ignorando pedidos já prontos", () => {
    const r = acompanharPedido(pedidos, 6, 5);
    assert.equal(r.encontrado, true);
    if (!r.encontrado) return;
    assert.equal(r.pedidosAFrente, 2);
    assert.equal(r.estimativaMinutos, 15);
  });

  test("primeiro da fila espera só o próprio preparo", () => {
    const r = acompanharPedido(pedidos, 2, 5);
    assert.equal(r.encontrado && r.estimativaMinutos, 5);
  });

  test("pedido pronto ou finalizado não tem espera", () => {
    for (const numero of [1, 4, 5]) {
      const r = acompanharPedido(pedidos, numero, 5);
      assert.equal(r.encontrado && r.estimativaMinutos, 0);
    }
  });

  test("senha inexistente", () => {
    assert.deepEqual(acompanharPedido(pedidos, 99, 5), { encontrado: false });
  });
});

describe("lerNumeroPedido", () => {
  test("aceita só inteiros positivos", () => {
    assert.equal(lerNumeroPedido("12"), 12);
    assert.equal(lerNumeroPedido(["7", "8"]), 7);
    for (const v of [undefined, "", "0", "-1", "1.5", "abc", "1234567"]) {
      assert.equal(lerNumeroPedido(v), null, String(v));
    }
  });
});
