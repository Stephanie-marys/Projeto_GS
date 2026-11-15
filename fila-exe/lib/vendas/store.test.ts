import { beforeEach, describe, test } from "node:test";
import assert from "node:assert/strict";
import { criarProduto, limparProdutos } from "../produtos/store.ts";
import {
  limparVendas,
  listarVendas,
  registrarVendaPresencial,
} from "./store.ts";

beforeEach(() => {
  limparProdutos();
  limparVendas();
});

describe("registrarVendaPresencial", () => {
  test("grava a venda com preço congelado e origem presencial", () => {
    const coxinha = criarProduto({
      nome: "Coxinha",
      preco: 6.5,
      categoria: "Salgados",
      disponivel: true,
    });

    const r = registrarVendaPresencial({
      itens: [{ produtoId: coxinha.id, quantidade: 2 }],
      formaPagamento: "dinheiro",
      valorRecebido: 20,
    });

    assert.equal(r.sucesso, true);
    if (!r.sucesso) return;
    assert.equal(r.venda.origem, "presencial");
    assert.equal(r.venda.total, 13);
    assert.equal(r.venda.troco, 7);
    assert.equal(r.venda.itens[0].precoUnitario, 6.5);
    assert.equal(listarVendas().length, 1);
  });

  test("não grava nada quando a venda é inválida", () => {
    const r = registrarVendaPresencial({ itens: [], formaPagamento: "pix" });

    assert.equal(r.sucesso, false);
    assert.equal(listarVendas().length, 0);
  });

  test("não vende produto que ficou indisponível depois de cadastrado", () => {
    const pastel = criarProduto({
      nome: "Pastel",
      preco: 7,
      categoria: "Salgados",
      disponivel: false,
    });

    const r = registrarVendaPresencial({
      itens: [{ produtoId: pastel.id, quantidade: 1 }],
      formaPagamento: "pix",
    });

    assert.equal(r.sucesso, false);
    assert.equal(listarVendas().length, 0);
  });

  test("lista as vendas da mais recente para a mais antiga", async () => {
    const suco = criarProduto({
      nome: "Suco",
      preco: 4,
      categoria: "Bebidas",
      disponivel: true,
    });

    const primeira = registrarVendaPresencial({
      itens: [{ produtoId: suco.id, quantidade: 1 }],
      formaPagamento: "pix",
      clienteNome: "Primeira",
    });
    await new Promise((resolve) => setTimeout(resolve, 5));
    const segunda = registrarVendaPresencial({
      itens: [{ produtoId: suco.id, quantidade: 1 }],
      formaPagamento: "pix",
      clienteNome: "Segunda",
    });

    assert.equal(primeira.sucesso && segunda.sucesso, true);
    assert.deepEqual(
      listarVendas().map((v) => v.clienteNome),
      ["Segunda", "Primeira"]
    );
  });
});
