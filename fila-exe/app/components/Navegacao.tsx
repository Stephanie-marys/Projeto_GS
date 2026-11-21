import Link from "next/link";

const LINKS = [
  { href: "/produtos/catalogo", rotulo: "Catálogo" },
  { href: "/pedidos/novo", rotulo: "Fazer pedido" },
  { href: "/fila", rotulo: "Fila" },
  { href: "/pedidos/controle", rotulo: "Controle" },
  { href: "/vendas/presencial", rotulo: "Venda presencial" },
  { href: "/produtos/cadastro", rotulo: "Produtos" },
  { href: "/relatorios/vendas", rotulo: "Relatórios" },
  { href: "/configuracao", rotulo: "Configuração" },
];

/** Menu simples entre as telas do sistema. */
export default function Navegacao({ atual }: { atual: string }) {
  return (
    <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-medium">
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          aria-current={link.href === atual ? "page" : undefined}
          className={
            link.href === atual
              ? "text-gray-900 underline underline-offset-4"
              : "text-emerald-700 hover:underline"
          }
        >
          {link.rotulo}
        </Link>
      ))}
    </nav>
  );
}
