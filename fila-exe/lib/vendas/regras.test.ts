import { describe, test } from "node:test";
import assert from "node:assert/strict";
import type { Produto } from "../produtos/types.ts";
import {
  agruparItens,
  NOME_CLIENTE_PADRAO,
  QUANTIDADE_MAXIMA_POR_ITEM,
  validarVendaPresencial,
} from "./regras.ts";

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

const coxinha = produto({ id: "p1", nome: "Coxinha", preco: 6.5 });
const suco = produto({ id: "p2", nome: "Suco", preco: 4.1, categoria: "Bebidas" });
const esgotado = produto({ id: "p3", nome: "Pastel", preco: 7, disponivel: false });
const catalogo = [coxinha, suco, esgotado];

describe("agruparItens", () => {
  test("soma as quantidades do mesmo produto e mantém a ordem", () => {
    const resultado = agruparItens([
      { produtoId: "p2", quantidade: 1 },
      { produtoId: "p1", quantidade: 2 },
      { produtoId: "p2", quantidade: 3 },
    ]);

    assert.deepEqual(resultado, [
      { produtoId: "p2", quantidade: 4 },
      { produtoId: "p1", quantidade: 2 },
    ]);
  });
});

describe("validarVendaPresencial — itens", () => {
  test("rejeita venda sem nenhum item", () => {
    const r = validarVendaPresencial(
      { itens: [], formaPagamento: "pix" },
      catalogo
    );

    assert.equal(r.valido, false);
    assert.match(r.erros.itens ?? "", /ao menos um produto/);
  });

  test("rejeita produto indisponível", () => {
    const r = validarVendaPresencial(
      { itens: [{ produtoId: "p3", quantidade: 1 }], formaPagamento: "pix" },
      catalogo
    );

    assert.equal(r.valido, false);
    assert.match(r.erros.itens ?? "", /Pastel/);
    assert.match(r.erros.itens ?? "", /indisponível/);
  });

  test("rejeita produto que não existe no cadastro", () => {
    const r = validarVendaPresencial(
      { itens: [{ produtoId: "nao-existe", quantidade: 1 }], formaPagamento: "pix" },
      catalogo
    );

    assert.equal(r.valido, false);
    assert.match(r.erros.itens ?? "", /não existe/);
  });

  test("rejeita quantidade zero, negativa, fracionada ou NaN", () => {
    for (const quantidade of [0, -1, 1.5, Number.NaN]) {
      const r = validarVendaPresencial(
        { itens: [{ produtoId: "p1", quantidade }], formaPagamento: "pix" },
        catalogo
      );
      assert.equal(r.valido, false, `quantidade ${quantidade} deveria ser inválida`);
      assert.match(r.erros.itens ?? "", /Quantidade inválida/);
    }
  });

  test("rejeita quantidade acima do limite por item", () => {
    const r = validarVendaPresencial(
      {
        itens: [{ produtoId: "p1", quantidade: QUANTIDADE_MAXIMA_POR_ITEM + 1 }],
        formaPagamento: "pix",
      },
      catalogo
    );

    assert.equal(r.valido, false);
    assert.match(r.erros.itens ?? "", /Quantidade inválida/);
  });

  test("aceita exatamente o limite de quantidade", () => {
    const r = validarVendaPresencial(
      {
        itens: [{ produtoId: "p1", quantidade: QUANTIDADE_MAXIMA_POR_ITEM }],
        formaPagamento: "pix",
      },
      catalogo
    );

    assert.equal(r.valido, true);
  });

  test("a soma de linhas repetidas também respeita o limite", () => {
    const r = validarVendaPresencial(
      {
        itens: [
          { produtoId: "p1", quantidade: QUANTIDADE_MAXIMA_POR_ITEM },
          { produtoId: "p1", quantidade: 1 },
        ],
        formaPagamento: "pix",
      },
      catalogo
    );

    assert.equal(r.valido, false);
  });

  test("reporta todos os problemas de itens de uma vez", () => {
    const r = validarVendaPresencial(
      {
        itens: [
          { produtoId: "p3", quantidade: 1 },
          { produtoId: "p1", quantidade: 0 },
        ],
        formaPagamento: "pix",
      },
      catalogo
    );

    assert.match(r.erros.itens ?? "", /Pastel/);
    assert.match(r.erros.itens ?? "", /Coxinha/);
  });
});

describe("validarVendaPresencial — cálculo", () => {
  test("calcula subtotais e total sem erro de ponto flutuante", () => {
    const r = validarVendaPresencial(
      {
        itens: [
          { produtoId: "p1", quantidade: 2 },
          { produtoId: "p2", quantidade: 3 },
        ],
        formaPagamento: "pix",
      },
      catalogo
    );

    assert.equal(r.valido, true);
    assert.equal(r.dados?.itens[0].subtotal, 13);
    assert.equal(r.dados?.itens[1].subtotal, 12.3);
    assert.equal(r.dados?.total, 25.3);
  });

  test("junta linhas repetidas do mesmo produto na venda final", () => {
    const r = validarVendaPresencial(
      {
        itens: [
          { produtoId: "p1", quantidade: 1 },
          { produtoId: "p1", quantidade: 2 },
        ],
        formaPagamento: "pix",
      },
      catalogo
    );

    assert.equal(r.dados?.itens.length, 1);
    assert.equal(r.dados?.itens[0].quantidade, 3);
    assert.equal(r.dados?.total, 19.5);
  });
});

describe("validarVendaPresencial — pagamento", () => {
  const itens = [{ produtoId: "p1", quantidade: 2 }];

  test("rejeita forma de pagamento desconhecida", () => {
    const r = validarVendaPresencial({ itens, formaPagamento: "cheque" }, catalogo);

    assert.equal(r.valido, false);
    assert.match(r.erros.formaPagamento ?? "", /forma de pagamento/);
  });

  test("dinheiro exige valor recebido", () => {
    const r = validarVendaPresencial({ itens, formaPagamento: "dinheiro" }, catalogo);

    assert.equal(r.valido, false);
    assert.match(r.erros.valorRecebido ?? "", /Informe o valor recebido/);
  });

  test("dinheiro com valor recebido NaN é tratado como não informado", () => {
    const r = validarVendaPresencial(
      { itens, formaPagamento: "dinheiro", valorRecebido: Number.NaN },
      catalogo
    );

    assert.equal(r.valido, false);
    assert.match(r.erros.valorRecebido ?? "", /Informe o valor recebido/);
  });

  test("dinheiro rejeita valor recebido menor que o total", () => {
    const r = validarVendaPresencial(
      { itens, formaPagamento: "dinheiro", valorRecebido: 12.99 },
      catalogo
    );

    assert.equal(r.valido, false);
    assert.match(r.erros.valorRecebido ?? "", /menor que o total/);
  });

  test("dinheiro rejeita valor recebido zero ou negativo", () => {
    for (const valorRecebido of [0, -5]) {
      const r = validarVendaPresencial(
        { itens, formaPagamento: "dinheiro", valorRecebido },
        catalogo
      );
      assert.equal(r.valido, false);
      assert.match(r.erros.valorRecebido ?? "", /maior que zero/);
    }
  });

  test("dinheiro com valor exato não gera troco", () => {
    const r = validarVendaPresencial(
      { itens, formaPagamento: "dinheiro", valorRecebido: 13 },
      catalogo
    );

    assert.equal(r.valido, true);
    assert.equal(r.dados?.troco, 0);
    assert.equal(r.dados?.valorRecebido, 13);
  });

  test("dinheiro calcula o troco corretamente", () => {
    const r = validarVendaPresencial(
      {
        itens: [{ produtoId: "p2", quantidade: 3 }],
        formaPagamento: "dinheiro",
        valorRecebido: 20,
      },
      catalogo
    );

    assert.equal(r.valido, true);
    assert.equal(r.dados?.total, 12.3);
    assert.equal(r.dados?.troco, 7.7);
  });

  test("pix, débito e crédito ignoram valor recebido e não têm troco", () => {
    for (const formaPagamento of ["pix", "debito", "credito"]) {
      const r = validarVendaPresencial(
        { itens, formaPagamento, valorRecebido: 100 },
        catalogo
      );
      assert.equal(r.valido, true);
      assert.equal(r.dados?.troco, 0);
      assert.equal(r.dados?.valorRecebido, undefined);
    }
  });

  test("não acusa 'valor menor que o total' quando os itens já estão inválidos", () => {
    const r = validarVendaPresencial(
      {
        itens: [{ produtoId: "p3", quantidade: 1 }],
        formaPagamento: "dinheiro",
        valorRecebido: 1,
      },
      catalogo
    );

    assert.equal(r.valido, false);
    assert.ok(r.erros.itens);
    assert.equal(r.erros.valorRecebido, undefined);
  });
});

describe("validarVendaPresencial — cliente", () => {
  const itens = [{ produtoId: "p1", quantidade: 1 }];

  test("nome vazio usa o nome padrão", () => {
    const r = validarVendaPresencial(
      { itens, formaPagamento: "pix", clienteNome: "   " },
      catalogo
    );

    assert.equal(r.dados?.clienteNome, NOME_CLIENTE_PADRAO);
  });

  test("nome é aparado", () => {
    const r = validarVendaPresencial(
      { itens, formaPagamento: "pix", clienteNome: "  Ana Souza  " },
      catalogo
    );

    assert.equal(r.dados?.clienteNome, "Ana Souza");
  });

  test("rejeita nome com mais de 100 caracteres", () => {
    const r = validarVendaPresencial(
      { itens, formaPagamento: "pix", clienteNome: "a".repeat(101) },
      catalogo
    );

    assert.equal(r.valido, false);
    assert.match(r.erros.clienteNome ?? "", /no máximo 100/);
  });
});
