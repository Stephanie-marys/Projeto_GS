"use client";

import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { validarLogin } from "@/lib/autenticacao/login";

export default function Home() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    senha: "",
    lembrar: false,
  });
  const [erros, setErros] = useState<Partial<Record<"email" | "senha", string>>>({});
  const [status, setStatus] = useState("");

  const emailTemErro = Boolean(erros.email);
  const senhaTemErro = Boolean(erros.senha);
  const podeEnviar =
    Boolean(form.email) &&
    Boolean(form.senha) &&
    !emailTemErro &&
    !senhaTemErro;

  function atualizarCampo(
    campo: "email" | "senha" | "lembrar",
    valor: string | boolean
  ) {
    const proximoForm = { ...form, [campo]: valor };
    setForm(proximoForm);

    if (campo === "email" || campo === "senha") {
      const resultado = validarLogin({
        email: String(proximoForm.email ?? ""),
        senha: String(proximoForm.senha ?? ""),
        lembrar: Boolean(proximoForm.lembrar),
      });

      setErros((prev) => ({
        ...prev,
        [campo]: resultado.erros[campo],
      }));

      if (!resultado.erros[campo]) {
        setStatus("");
      }
    }
  }

  function onEmailChange(event: ChangeEvent<HTMLInputElement>) {
    atualizarCampo("email", event.target.value);
  }

  function onSenhaChange(event: ChangeEvent<HTMLInputElement>) {
    atualizarCampo("senha", event.target.value);
  }

  function onLembrarChange(event: ChangeEvent<HTMLInputElement>) {
    atualizarCampo("lembrar", event.target.checked);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const resultado = validarLogin(form);

    if (!resultado.valido) {
      setErros(resultado.erros);
      setStatus("Revise os dados do acesso antes de continuar.");
      return;
    }

    setErros({});
    setStatus(
      `Acesso liberado para ${
        resultado.tipoUsuario === "aluno" ? "aluno" : "servidor"
      }. Redirecionando...`
    );
    router.push("/produtos/catalogo");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff7ed_0%,_#fff_35%,_#f8fafc_100%)] px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[32px] border border-orange-100 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.12)] lg:grid-cols-[1.15fr_0.85fr]">
        <section className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-amber-500 to-red-500 p-8 text-white sm:p-10 lg:p-12">
          <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-14 left-10 h-32 w-32 rounded-full bg-red-900/10 blur-2xl" />

          <div className="relative z-10 flex h-full flex-col justify-between gap-10">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-sm font-medium backdrop-blur-sm">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-300" />
                Fila.exe
              </div>

              <h1 className="mt-8 max-w-md text-4xl font-black leading-tight tracking-tight sm:text-5xl">
                Sua fila virtual da cantina escolar.
              </h1>

              <p className="mt-4 max-w-md text-base text-orange-50/90 sm:text-lg">
                Acompanhe pedidos, evite filas e garanta uma experiência mais rápida para alunos e colaboradores.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-2xl font-bold">15 min</p>
                <p className="mt-1 text-sm text-orange-50/80">tempo médio</p>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-2xl font-bold">1.200</p>
                <p className="mt-1 text-sm text-orange-50/80">pedidos/mês</p>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-2xl font-bold">24/7</p>
                <p className="mt-1 text-sm text-orange-50/80">status online</p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center bg-white p-6 sm:p-8 lg:p-12">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">
                Acesso
              </p>
              <h2 className="mt-3 text-3xl font-bold text-slate-900">Entrar no sistema</h2>
              <p className="mt-2 text-sm text-slate-500">
                Use seu e-mail institucional para continuar.
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-5" noValidate>
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                  E-mail institucional
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={onEmailChange}
                  placeholder="aluno@aluno.ifsp.edu.br"
                  aria-invalid={emailTemErro}
                  className={`w-full rounded-xl border bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:ring-4 ${
                    emailTemErro
                      ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100"
                      : "border-slate-200 focus:border-orange-400 focus:bg-white focus:ring-orange-100"
                  }`}
                />
                {erros.email && (
                  <p className="mt-2 text-sm text-red-600">{erros.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
                  Senha
                </label>
                <input
                  id="password"
                  name="senha"
                  type="password"
                  autoComplete="current-password"
                  value={form.senha}
                  onChange={onSenhaChange}
                  placeholder="Digite sua senha"
                  aria-invalid={senhaTemErro}
                  className={`w-full rounded-xl border bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:ring-4 ${
                    senhaTemErro
                      ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100"
                      : "border-slate-200 focus:border-orange-400 focus:bg-white focus:ring-orange-100"
                  }`}
                />
                {erros.senha && (
                  <p className="mt-2 text-sm text-red-600">{erros.senha}</p>
                )}
              </div>

              <div className="flex items-center justify-between gap-4 text-sm">
                <label className="flex items-center gap-2 text-slate-600">
                  <input
                    type="checkbox"
                    checked={form.lembrar}
                    onChange={onLembrarChange}
                    className="h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-400"
                  />
                  Lembrar de mim
                </label>

                <a href="#" className="font-medium text-orange-600 hover:text-orange-700">
                  Esqueci a senha
                </a>
              </div>

              {status && (
                <p
                  className={
                    erros.email || erros.senha
                      ? "text-sm font-medium text-red-600"
                      : "text-sm font-medium text-emerald-600"
                  }
                  role="status"
                >
                  {status}
                </p>
              )}

              <button
                type="submit"
                disabled={!podeEnviar}
                className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3.5 text-base font-semibold text-white shadow-lg shadow-orange-200 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Entrar
              </button>
            </form>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm text-slate-600">
              Novo por aqui?{" "}
              <a href="#" className="font-semibold text-orange-600 hover:text-orange-700">
                Solicitar acesso
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
