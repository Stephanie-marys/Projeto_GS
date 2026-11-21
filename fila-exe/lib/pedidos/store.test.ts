import { beforeEach, describe, test } from "node:test";
import assert from "node:assert/strict";
import { restaurarConfiguracaoPadrao, salvarConfiguracao } from "../configuracao/store.ts";
import { CONFIGURACAO_PADRAO } from "../configuracao/types.ts";
import { criarProduto, limparProdutos } from "../produtos/store.ts";
import {
  atualizarStatusPedido,
  limparPedidos,
  listarPedidos,
  registrarPedido,
} from "./store.ts";

/** 10:00 em Brasília. */
const agora = new Date("2026-11-20T13:00:00Z");

beforeEach(() => {
  limparProdutos();
  limparPedidos();
  restaurarConfiguracaoPadrao();
});

function novoProduto() {
  return criarProduto({ nome: "Coxinha", preco: 6.5, categoria: "Salgados", disponivel: true });
}

describe("registrarPedido", () => {
  test("grava com senha sequencial e status recebido", () => {
    const coxinha = novoProduto();
    const entrada = { clienteNome: "Ana", itens: [{ produtoId: coxinha.id, quantidade: 2 }], formaPagamento: "pix" };

    const a = registrarPedido(entrada, agora);
    const b = registrarPedido(entrada, agora);

    assert.equal(a.sucesso && a.pedido.numero, 1);
    assert.equal(b.sucesso && b.pedido.numero, 2);
    assert.equal(a.sucesso && a.pedido.status, "recebido");
    assert.equal(a.sucesso && a.pedido.total, 13);
    assert.equal(listarPedidos().length, 2);
  });

  test("não grava quando a cantina está pausada", () => {
    const coxinha = novoProduto();
    salvarConfiguracao({ ...CONFIGURACAO_PADRAO, aceitandoPedidos: false });

    const r = registrarPedido(
      { clienteNome: "Ana", itens: [{ produtoId: coxinha.id, quantidade: 1 }], formaPagamento: "pix" },
      agora
    );

    assert.equal(r.sucesso, false);
    assert.equal(listarPedidos().length, 0);
  });
});

describe("atualizarStatusPedido", () => {
  test("avança o status e registra o histórico", () => {
    const coxinha = novoProduto();
    const r = registrarPedido(
      { clienteNome: "Ana", itens: [{ produtoId: coxinha.id, quantidade: 1 }], formaPagamento: "pix" },
      agora
    );
    assert.ok(r.sucesso);
    if (!r.sucesso) return;

    assert.equal(atualizarStatusPedido(r.pedido.id, "em_preparo", agora).sucesso, true);
    const pronto = atualizarStatusPedido(r.pedido.id, "pronto", agora);
    assert.equal(pronto.sucesso && pronto.pedido.historico.length, 3);

    const invalida = atualizarStatusPedido(r.pedido.id, "cancelado", agora);
    assert.equal(invalida.sucesso, false);
    assert.equal(listarPedidos()[0].status, "pronto");
  });

  test("pedido inexistente", () => {
    const r = atualizarStatusPedido("nao-existe", "em_preparo");
    assert.equal(r.sucesso, false);
  });

  test("listarPedidos devolve cópias (não permite alterar o store por fora)", () => {
    const coxinha = novoProduto();
    registrarPedido(
      { clienteNome: "Ana", itens: [{ produtoId: coxinha.id, quantidade: 1 }], formaPagamento: "pix" },
      agora
    );
    listarPedidos()[0].status = "entregue";
    assert.equal(listarPedidos()[0].status, "recebido");
  });
});
