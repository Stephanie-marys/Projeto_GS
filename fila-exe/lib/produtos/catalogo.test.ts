import { describe, test } from "node:test";
import assert from "node:assert/strict";
import type { Produto } from "./types.ts";
import {
  categoriasComProdutoDisponivel,
  filtrarCatalogo,
  montarCatalogo,
  ordenarCatalogo,
  produtosDoCatalogo,
  TODAS_CATEGORIAS,
  validarFiltroCatalogo,
} from "./catalogo.ts";

/** Helper para criar produtos de teste sem repetir todos os campos. */
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

describe("produtosDoCatalogo", () => {
  test("remove produtos marcados como indisponíveis", () => {
    const produtos = [
      produto({ nome: "Coxinha", disponivel: true }),
      produto({ nome: "Suco (esgotado)", disponivel: false }),
    ];

    const resultado = produtosDoCatalogo(produtos);

    assert.equal(resultado.length, 1);
    assert.equal(resultado[0].nome, "Coxinha");
  });
});

describe("filtrarCatalogo", () => {
  const produtos = [
    produto({ nome: "Coxinha de frango", categoria: "Salgados" }),
    produto({
      nome: "Refrigerante Cola",
      categoria: "Bebidas",
      descricao: "Lata 350ml",
    }),
    produto({ nome: "Água com Gás", categoria: "Bebidas" }),
  ];

  test("filtra por categoria", () => {
    const resultado = filtrarCatalogo(produtos, { categoria: "Bebidas" });
    assert.equal(resultado.length, 2);
  });

  test("categoria 'Todas' não filtra nada", () => {
    const resultado = filtrarCatalogo(produtos, { categoria: TODAS_CATEGORIAS });
    assert.equal(resultado.length, 3);
  });

  test("busca por nome ignora acentos e maiúsculas/minúsculas", () => {
    const resultado = filtrarCatalogo(produtos, { busca: "agua" });
    assert.equal(resultado.length, 1);
    assert.equal(resultado[0].nome, "Água com Gás");
  });

  test("busca também procura na descrição", () => {
    const resultado = filtrarCatalogo(produtos, { busca: "350ml" });
    assert.equal(resultado.length, 1);
    assert.equal(resultado[0].nome, "Refrigerante Cola");
  });

  test("categoria e busca combinadas", () => {
    const resultado = filtrarCatalogo(produtos, {
      categoria: "Bebidas",
      busca: "cola",
    });
    assert.equal(resultado.length, 1);
    assert.equal(resultado[0].nome, "Refrigerante Cola");
  });

  test("sem termo de busca retorna todos os produtos da categoria", () => {
    const resultado = filtrarCatalogo(produtos, { categoria: "Bebidas", busca: "" });
    assert.equal(resultado.length, 2);
  });
});

describe("ordenarCatalogo", () => {
  test("ordena por nome, alfabeto pt-BR", () => {
    const produtos = [
      produto({ nome: "Suco" }),
      produto({ nome: "Água" }),
      produto({ nome: "Coxinha" }),
    ];

    const resultado = ordenarCatalogo(produtos);

    assert.deepEqual(
      resultado.map((p) => p.nome),
      ["Água", "Coxinha", "Suco"]
    );
  });
});

describe("montarCatalogo", () => {
  test("nunca mostra produto indisponível, mesmo sem nenhum filtro", () => {
    const produtos = [
      produto({ nome: "Coxinha", disponivel: true }),
      produto({ nome: "Salgado esgotado", disponivel: false }),
    ];

    const resultado = montarCatalogo(produtos);

    assert.equal(resultado.length, 1);
    assert.equal(resultado[0].nome, "Coxinha");
  });

  test("aplica filtro sobre os disponíveis e devolve ordenado", () => {
    const produtos = [
      produto({ nome: "Suco de Laranja", categoria: "Bebidas", disponivel: true }),
      produto({ nome: "Água", categoria: "Bebidas", disponivel: true }),
      produto({ nome: "Refrigerante", categoria: "Bebidas", disponivel: false }),
    ];

    const resultado = montarCatalogo(produtos, { categoria: "Bebidas" });

    assert.deepEqual(
      resultado.map((p) => p.nome),
      ["Água", "Suco de Laranja"]
    );
  });
});

describe("categoriasComProdutoDisponivel", () => {
  test("só retorna categorias que têm produto disponível", () => {
    const produtos = [
      produto({ categoria: "Bebidas", disponivel: true }),
      produto({ categoria: "Doces", disponivel: false }),
    ];

    const resultado = categoriasComProdutoDisponivel(produtos);

    assert.deepEqual(resultado, ["Bebidas"]);
  });

  test("lista vazia quando não há nenhum produto disponível", () => {
    const produtos = [produto({ disponivel: false })];
    assert.deepEqual(categoriasComProdutoDisponivel(produtos), []);
  });
});

describe("validarFiltroCatalogo", () => {
  test("categoria inválida/desconhecida cai para 'Todas'", () => {
    const resultado = validarFiltroCatalogo({ categoria: "Sobremesas" });
    assert.equal(resultado.categoria, TODAS_CATEGORIAS);
  });

  test("categoria válida é preservada", () => {
    const resultado = validarFiltroCatalogo({ categoria: "Doces" });
    assert.equal(resultado.categoria, "Doces");
  });

  test("remove espaços extras e limita o tamanho da busca", () => {
    const resultado = validarFiltroCatalogo({
      busca: "  " + "a".repeat(200) + "  ",
    });
    assert.equal(resultado.busca.length, 100);
  });

  test("lida com parâmetros ausentes usando os padrões", () => {
    const resultado = validarFiltroCatalogo({});
    assert.deepEqual(resultado, { categoria: TODAS_CATEGORIAS, busca: "" });
  });

  test("usa o primeiro valor quando o parâmetro vem duplicado na URL", () => {
    const resultado = validarFiltroCatalogo({ categoria: ["Bebidas", "Doces"] });
    assert.equal(resultado.categoria, "Bebidas");
  });
});
