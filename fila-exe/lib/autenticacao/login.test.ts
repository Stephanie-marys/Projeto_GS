import { describe, test } from "node:test";
import assert from "node:assert/strict";

import { validarLogin } from "./login.ts";

describe("validarLogin", () => {
  test("aceita e-mail institucional de aluno", () => {
    const resultado = validarLogin({
      email: "aluno123@aluno.ifsp.edu.br",
      senha: "senhaSegura123",
    });

    assert.equal(resultado.valido, true);
    assert.equal(resultado.tipoUsuario, "aluno");
    assert.deepEqual(resultado.erros, {});
  });

  test("aceita e-mail institucional de servidor ou professor", () => {
    const resultado = validarLogin({
      email: "professor@ifsp.edu.br",
      senha: "senhaSegura123",
    });

    assert.equal(resultado.valido, true);
    assert.equal(resultado.tipoUsuario, "servidor");
  });

  test("rejeita e-mail fora do domínio do IFSP", () => {
    const resultado = validarLogin({
      email: "aluno@gmail.com",
      senha: "senhaSegura123",
    });

    assert.equal(resultado.valido, false);
    assert.match(resultado.erros.email ?? "", /IFSP/i);
  });

  test("rejeita senha curta", () => {
    const resultado = validarLogin({
      email: "aluno@aluno.ifsp.edu.br",
      senha: "123",
    });

    assert.equal(resultado.valido, false);
    assert.match(resultado.erros.senha ?? "", /6 caracteres/i);
  });
});
