import Link from "next/link";
import { listarProdutos } from "@/lib/produtos/store";
import ProdutoForm from "./ProdutoForm";

export default function CadastroProdutoPage() {
  const produtos = listarProdutos();

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Cadastro de Produtos da Cantina
        </h1>
        <Link
          href="/produtos/catalogo"
          className="whitespace-nowrap text-sm font-medium text-emerald-700 hover:underline"
        >
          Ver catálogo
        </Link>
      </div>
      <p className="mt-1 text-sm text-gray-500">
        Pacote 1.1.1 — cadastro de produtos (dados mockados em memória,
        substituir por persistência real futuramente).
      </p>

      <ProdutoForm />

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-gray-900">
          Produtos cadastrados ({produtos.length})
        </h2>

        {produtos.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">
            Nenhum produto cadastrado ainda.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-gray-200 rounded-md border border-gray-200">
            {produtos.map((produto) => (
              <li
                key={produto.id}
                className="flex items-center justify-between px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-gray-900">{produto.nome}</p>
                  <p className="text-gray-500">{produto.categoria}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(produto.preco)}
                  </p>
                  <p
                    className={
                      produto.disponivel ? "text-emerald-600" : "text-gray-400"
                    }
                  >
                    {produto.disponivel ? "Disponível" : "Indisponível"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}