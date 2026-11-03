export type TipoUsuario = "aluno" | "servidor";
export type CampoLogin = "email" | "senha";

export interface DadosLoginForm {
  email: string;
  senha: string;
  lembrar?: boolean;
}

export interface ResultadoLogin {
  valido: boolean;
  tipoUsuario?: TipoUsuario;
  erros: Partial<Record<CampoLogin, string>>;
}

export function validarLogin(dados: DadosLoginForm): ResultadoLogin {
  const erros: Partial<Record<CampoLogin, string>> = {};
  const email = (dados.email ?? "").trim().toLowerCase();
  const senha = dados.senha ?? "";

  if (!email) {
    erros.email = "Informe seu e-mail institucional.";
  } else if (!email.includes("@")) {
    erros.email = "Informe um e-mail válido.";
  } else {
    const dominio = email.slice(email.indexOf("@"));
    if (dominio !== "@aluno.ifsp.edu.br" && dominio !== "@ifsp.edu.br") {
      erros.email =
        "Use um e-mail institucional do IFSP: @aluno.ifsp.edu.br ou @ifsp.edu.br.";
    }
  }

  if (!senha) {
    erros.senha = "Informe sua senha.";
  } else if (senha.length < 6) {
    erros.senha = "A senha deve ter pelo menos 6 caracteres.";
  }

  const tipoUsuario = email.endsWith("@aluno.ifsp.edu.br")
    ? "aluno"
    : email.endsWith("@ifsp.edu.br")
      ? "servidor"
      : undefined;

  return {
    valido: Object.keys(erros).length === 0,
    tipoUsuario,
    erros,
  };
}
