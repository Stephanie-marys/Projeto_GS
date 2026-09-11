# Fila.exe 🍔🎫

**Sistema de Gerenciamento da Cantina Escolar**

Sistema web para digitalizar o fluxo de pedidos da cantina escolar: catálogo de produtos, pedidos online com login institucional, venda presencial, fila virtual de preparo/retirada e relatórios de vendas.

> Projeto acadêmico desenvolvido a partir da especificação de escopo elaborada por um grupo parceiro, com implementação por nosso grupo.

---

## 📋 Sobre o projeto

O **Fila.exe** tem como objetivo reduzir filas físicas e agilizar o atendimento da cantina escolar, permitindo que alunos façam pedidos online (com autenticação por e-mail institucional) e acompanhem o status de preparo em uma fila virtual, além de possibilitar que a cantina registre vendas presenciais e acompanhe suas vendas por meio de relatórios.

Este repositório contém a **implementação técnica** do sistema, desenvolvida com base no documento de Especificação do Escopo (D7) e na Estrutura Analítica do Projeto — EAP (D8) fornecidos pelo grupo responsável pelo levantamento de requisitos.

## ✨ Funcionalidades

- **Catálogo de Produtos** — listagem dos produtos disponíveis para pedido.
- **Pedidos Online + Login Institucional** — aluno faz login com e-mail institucional e realiza pedidos pelo sistema.
- **Venda Presencial** — funcionário da cantina registra vendas de alunos que não usam o sistema.
- **Fila Virtual de Preparo e Retirada** — acompanhamento do pedido pelos estados:
  `pendente` → `em preparo` → `pronto para retirada` → `entregue` (ou `cancelado`)
- **Controle de Pedidos** — cada pedido é vinculado ao nome do aluno que o realizou.
- **Configuração da Cantina** — abertura/fechamento do sistema, limite de chamadas para retirada e tempo limite de retirada (com cancelamento automático de pedidos expirados).
- **Relatórios de Vendas** — consolidação dos pedidos realizados, incluindo vendas presenciais.

## 🗓️ Cronograma / Marcos do Projeto

Marcos previstos no planejamento do grupo parceiro (Documento de Gerenciamento do Cronograma — D9), em dias a partir do início do projeto:

| Dia | Marco |
|---|---|
| 5  | Login institucional concluído |
| 10 | Cadastro de produtos da cantina concluído |
| 15 | Registro de pedidos concluído |
| 20 | Catálogo de produtos concluído |
| 25 | Venda presencial concluída |
| 30 | Fila virtual concluída |
| 35 | Controle de pedidos concluído |
| 40 | Configuração da cantina concluída |
| 45 | Relatório de vendas concluído |
| 50 | Testes gerais do sistema concluídos |
| 55 | Sistema finalizado e pronto para implantação |

> ⚠️ Esses marcos refletem o planejamento do grupo parceiro (responsável pela especificação). O cronograma real de implementação deste grupo pode ser adaptado às nossas sprints — atualizar esta tabela conforme necessário.

## 🛠️ Tecnologias

- [Next.js](https://nextjs.org/) (React)
- TypeScript 
- Tailwind CSS
- Vercel
- `TODO:` banco de dados / ORM
- `TODO:` provedor de autenticação institucional (e-mail)

> Preencher conforme as decisões técnicas do grupo forem definidas.

## 🚀 Como rodar o projeto localmente

### Pré-requisitos

- [Node.js](https://nodejs.org/) 18+
- npm

### Passos

```bash
# Clone o repositório
git clone https://github.com/<usuario-ou-org>/fila-exe.git
cd fila-exe

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local

# Rode o projeto em modo de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador para ver o resultado.

Este projeto usa [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) para otimizar e carregar automaticamente [Geist](https://vercel.com/font), a fonte da Vercel.

### Variáveis de ambiente

```env
# TODO: preencher conforme integrações do projeto (ex: banco de dados, auth institucional)
DATABASE_URL=
AUTH_SECRET=
```

## 📁 Estrutura do projeto (referência)

```
fila-exe/
├── src/
│   ├── app/              # Rotas (App Router do Next.js)
│   ├── components/       # Componentes reutilizáveis
│   ├── lib/               # Funções utilitárias, integrações
│   └── types/             # Tipagens TypeScript
├── public/                 # Arquivos estáticos
├── docs/                   # Documentos de especificação (D7, D8, etc.)
└── README.md
```

## 👥 Equipe

### Especificação de Requisitos

| Responsável | Pacote de trabalho |
|---|---|
| Maria Clara | Levantamento de Requisitos |
| Stephanie Marys | Regras de Negócio da Cantina |
| Matheus Ciffoni | Catálogo de Produtos |
| Vinicius Rafael | Pedidos Online e Login Institucional |
| Maria Clara | Venda Presencial |
| Vinicius Rafael | Fila Virtual de Preparo e Retirada |
| Stephanie Marys | Controle de Pedidos |
| Matheus Ciffoni | Configuração da Cantina |
| Stephanie Marys | Relatórios de Vendas |

## 📄 Documentação relacionada

- `docs/D8_EspecificacaoDoEscopo_Fila_xe.pdf` — EAP e dicionário da EAP
- `docs/D9_Gerenciamento_do_Cronograma.pdf` — Gerenciamento do cronograma (atividades, dependências e marcos)

## 📌 Status do projeto

🚧 Em desenvolvimento — projeto acadêmico (IFSP).

## 📚 Saiba mais

Para aprender mais sobre Next.js, consulte:

- [Next.js Documentation](https://nextjs.org/docs) — funcionalidades e API do Next.js.
- [Learn Next.js](https://nextjs.org/learn) — tutorial interativo.
- [Repositório do Next.js no GitHub](https://github.com/vercel/next.js) — feedback e contribuições são bem-vindos.

## 📃 Licença

`TODO:` definir licença do projeto (ex: MIT), caso aplicável.