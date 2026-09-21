«Sistema de gerenciamento de pedidos e vendas para cantina escolar»

O Fila.exe é um sistema desenvolvido para auxiliar no gerenciamento de uma cantina escolar, centralizando o cadastro de produtos, realização e controle de pedidos, vendas presenciais, gerenciamento de fila e geração de relatórios.

O projeto está sendo desenvolvido no contexto acadêmico da disciplina de Gestão de Projetos de Software, com foco na aplicação prática de conceitos de Engenharia de Software, Gerenciamento de Projetos, Desenvolvimento de Sistemas e Banco de Dados.

---

📌 Sobre o Projeto

Atualmente, processos relacionados a pedidos e vendas de uma cantina podem envolver controles manuais e pouca centralização das informações.

O Fila.exe propõe uma solução informatizada para organizar esses processos, permitindo que as informações sejam registradas e consultadas de forma estruturada.

Objetivos

- Centralizar o gerenciamento da cantina;
- Facilitar o cadastro e gerenciamento de produtos;
- Permitir o registro e acompanhamento de pedidos;
- Organizar a fila virtual;
- Registrar vendas presenciais;
- Disponibilizar informações para acompanhamento das vendas;
- Reduzir processos manuais;
- Facilitar o controle operacional da cantina.

---

👥 Equipe e Gestão

Função| Responsável
Gerente do Projeto| Stephanie Marys
Patrocinador| IFSP — Instituto Federal de São Paulo
Data de elaboração| 28/08/2026

---

🎯 Escopo do Sistema

O sistema será composto pelos seguintes módulos:

Módulo| Descrição
🔐 Login Institucional| Autenticação e controle de acesso dos usuários
📦 Cadastro de Produtos| Gerenciamento dos produtos disponíveis na cantina
🛒 Registro de Pedidos| Criação e armazenamento de pedidos
📖 Catálogo| Visualização dos produtos disponíveis
💰 Venda Presencial| Registro de vendas realizadas diretamente na cantina
🧾 Fila Virtual| Organização e acompanhamento dos pedidos
📋 Controle de Pedidos| Gerenciamento do status dos pedidos
⚙️ Configuração da Cantina| Gerenciamento das configurações do sistema
📊 Relatórios de Vendas| Consulta e análise das vendas realizadas

---

🏗️ Arquitetura Funcional

A estrutura funcional prevista para o sistema pode ser representada da seguinte forma:

                         ┌──────────────────────┐
                         │      FILA.EXE        │
                         │ Sistema da Cantina   │
                         └──────────┬───────────┘
                                    │
             ┌──────────────────────┼──────────────────────┐
             │                      │                      │
             ▼                      ▼                      ▼
       AUTENTICAÇÃO             PEDIDOS                 GESTÃO
             │                      │                      │
             ▼                      ▼                      ▼
     Login Institucional      Registro de Pedidos    Produtos
                              Fila Virtual            Configuração
                              Controle de Pedidos
                                    │
                                    ▼
                              VENDAS / RELATÓRIOS
                                    │
                             ┌──────┴──────┐
                             ▼             ▼
                       Venda Presencial   Relatórios

---

📋 Requisitos Funcionais

Os principais requisitos funcionais previstos incluem:

Autenticação

- RF01 — O sistema deverá permitir o login utilizando e-mail institucional.
- RF02 — O sistema deverá validar as credenciais do usuário.
- RF03 — O sistema deverá controlar o acesso às funcionalidades de acordo com o perfil do usuário.

Produtos

- RF04 — O sistema deverá permitir cadastrar produtos.
- RF05 — O sistema deverá permitir consultar produtos.
- RF06 — O sistema deverá permitir alterar informações dos produtos.
- RF07 — O sistema deverá permitir controlar a disponibilidade dos produtos.

Pedidos

- RF08 — O sistema deverá permitir criar pedidos.
- RF09 — O sistema deverá armazenar os pedidos.
- RF10 — O sistema deverá permitir acompanhar o status dos pedidos.
- RF11 — O sistema deverá organizar os pedidos na fila virtual.

Vendas

- RF12 — O sistema deverá permitir registrar vendas presenciais.
- RF13 — O sistema deverá armazenar as informações das vendas.

Relatórios

- RF14 — O sistema deverá permitir consultar informações sobre as vendas.
- RF15 — O sistema deverá gerar relatórios de vendas.

«Os requisitos serão refinados durante o levantamento e a análise de requisitos do projeto.»

---

🔐 Requisitos Não Funcionais

Entre os requisitos não funcionais previstos estão:

- RNF01 — Segurança: informações de autenticação devem ser protegidas.
- RNF02 — Usabilidade: as telas devem apresentar navegação simples e intuitiva.
- RNF03 — Integridade: os dados registrados devem manter consistência no banco de dados.
- RNF04 — Disponibilidade: o sistema deve estar disponível durante o horário de funcionamento da cantina.
- RNF05 — Manutenibilidade: o código deve ser organizado de forma a facilitar futuras alterações.
- RNF06 — Desempenho: operações comuns devem apresentar tempo de resposta adequado ao contexto de utilização.

---

🗂️ Estrutura Analítica do Projeto — EAP

1.0 — FILA.EXE
│
├── 1.0.1 — Login Institucional
│   ├── Definição das regras
│   ├── Desenvolvimento da tela
│   ├── Integração com e-mail institucional
│   ├── Validações
│   └── Testes
│
├── 1.1.1 — Cadastro de Produtos
│   ├── Levantamento dos campos
│   ├── Desenvolvimento da tela
│   ├── Integração com banco de dados
│   ├── Validações
│   └── Testes
│
├── 1.2.1 — Registro de Pedidos
│   ├── Definição das regras
│   ├── Desenvolvimento da tela
│   ├── Persistência dos dados
│   ├── Validações
│   └── Testes
│
├── 1.3.1 — Catálogo de Produtos
│   ├── Definição das regras
│   ├── Desenvolvimento da tela
│   ├── Validações
│   └── Testes
│
├── 1.4.1 — Venda Presencial
│   ├── Definição das regras
│   ├── Desenvolvimento da tela
│   ├── Persistência da venda
│   ├── Validações
│   └── Testes
│
├── 1.5.1 — Fila Virtual
│   ├── Definição das regras
│   ├── Desenvolvimento da tela
│   ├── Persistência da fila
│   ├── Validações
│   └── Testes
│
├── 1.6.1 — Controle de Pedidos
│   ├── Definição das regras
│   ├── Desenvolvimento da tela
│   ├── Persistência dos dados
│   ├── Validações
│   └── Testes
│
├── 1.7.1 — Configuração da Cantina
│   ├── Definição das regras
│   ├── Desenvolvimento da tela
│   ├── Persistência das configurações
│   ├── Validações
│   └── Testes
│
└── 1.8.1 — Relatório de Vendas
    ├── Definição das regras
    ├── Desenvolvimento da tela
    ├── Implementação dos relatórios
    ├── Validações
    └── Testes

---

🚀 Roadmap

O desenvolvimento do projeto será organizado nas seguintes etapas:

🟡 Fase 1 — Planejamento

- [x] Definição do projeto
- [x] Definição da equipe
- [x] Definição do escopo inicial
- [x] Elaboração da EAP
- [x] Levantamento completo dos requisitos

🔵 Fase 2 — Análise e Modelagem

- [x] Levantamento de requisitos
- [x] Definição dos casos de uso
- [x] Modelagem do banco de dados
- [x] Diagrama de classes
- [x] Diagrama de casos de uso
- [x] Definição da arquitetura
- [x] Protótipo das interfaces

🟣 Fase 3 — Desenvolvimento

- [ ] Login Institucional
- [x] Cadastro de Produtos
- [ ] Catálogo
- [ ] Registro de Pedidos
- [ ] Fila Virtual
- [ ] Controle de Pedidos
- [ ] Venda Presencial
- [ ] Configuração da Cantina
- [ ] Relatórios de Vendas

🟠 Fase 4 — Testes

- [ ] Testes unitários
- [ ] Testes de integração
- [ ] Testes funcionais
- [ ] Validação dos requisitos
- [ ] Correção de erros

🟢 Fase 5 — Entrega

- [ ] Documentação técnica
- [ ] Manual do usuário
- [ ] Revisão final
- [ ] Apresentação do projeto
- [ ] Entrega da versão final

---

💻 Tecnologias

As tecnologias serão definidas durante a etapa de arquitetura e planejamento técnico.

Stack

Camada| Tecnologia
Front-end| 🔄 A definir
Back-end| 🔄 A definir
Banco de Dados| 🔄 A definir
Autenticação| 🔄 A definir
Versionamento| Git / GitHub
Documentação| Markdown

---

📁 Estrutura do Repositório

A estrutura proposta para o repositório é:

Fila.exe/
│
├── docs/
│   ├── requisitos/
│   ├── diagramas/
│   ├── arquitetura/
│   └── projeto/
│
├── src/
│   ├── frontend/
│   └── backend/
│
├── database/
│   ├── scripts/
│   └── migrations/
│
├── tests/
│   ├── unit/
│   └── integration/
│
├── .gitignore
├── README.md
└── LICENSE

«A estrutura poderá ser ajustada de acordo com a tecnologia e arquitetura definidas pela equipe.»

---

🌿 Estratégia de Versionamento

O projeto utilizará Git para controle de versão.

Sugestão de organização das branches:

main
 │
 ├── develop
 │    │
 │    ├── feature/login
 │    ├── feature/produtos
 │    ├── feature/pedidos
 │    ├── feature/fila
 │    └── feature/relatorios
 │
 └── release/

Padrão de commits

Sugestão de utilização de Conventional Commits:

feat: adiciona cadastro de produtos
fix: corrige validação do login
docs: atualiza documentação
refactor: reorganiza serviço de pedidos
test: adiciona testes para cadastro
chore: atualiza configurações do projeto

---

🧪 Estratégia de Testes

Cada funcionalidade deverá passar por uma etapa de validação antes de ser considerada concluída.

Desenvolvimento
       │
       ▼
Validação
       │
       ▼
Testes
       │
   ┌───┴───┐
   │       │
 Falha    OK
   │       │
   ▼       ▼
Correção  Merge
   │
   └──────► Testes

---

📊 Critério de Conclusão

Uma funcionalidade será considerada concluída quando:

- [x] Requisitos definidos;
- [ ] Interface implementada;
- [ ] Regras de negócio implementadas;
- [ ] Integração com banco de dados realizada, quando aplicável;
- [ ] Validações implementadas;
- [ ] Testes realizados;
- [ ] Erros críticos corrigidos;
- [ ] Código revisado;
- [ ] Documentação atualizada.

---

📚 Documentação do Projeto

A documentação complementar ficará disponível no diretório ""/docs"" (./docs).

Documentos previstos:

- 📄 Documento de requisitos
- 📊 EAP
- 📐 Diagramas UML
- 🗃️ Modelo de banco de dados
- 🏗️ Arquitetura do sistema
- 🧪 Plano de testes
- 📖 Manual do usuário
- 📋 Plano de gerenciamento do projeto

---

📌 Status

🚧 Em desenvolvimento

«Este projeto está em desenvolvimento acadêmico e poderá sofrer alterações durante as etapas de análise, desenvolvimento e validação.»

---

🎓 Contexto Acadêmico

Projeto desenvolvido no Instituto Federal de São Paulo — IFSP, com aplicação de conceitos relacionados a:

- Engenharia de Software;
- Gerenciamento de Projetos;
- Análise e Desenvolvimento de Sistemas;
- Banco de Dados;
- Desenvolvimento de Software;
- Testes de Software;
- Controle de Versionamento.

---

👩‍💻 Equipe

Stephanie Marys — Gerente do Projeto
Maria Passareli — Gerente de Desenvolvimento
Mateus Ciffoni - Desenvolvedor 
Vinícius Do Vale - Desenvolvedor 

IFSP — Instituto Federal de São Paulo

---

<p align="center">
  <strong>🍔 Fila.exe</strong><br>
  Sistema de Gerenciamento da Cantina Escolar
</p>
