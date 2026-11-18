<div align="center">

# 🍔 Fila.exe

### Sistema de Gerenciamento de Pedidos e Vendas para Cantina Escolar

<p>
  <strong>📚 Projeto Acadêmico • IFSP • Engenharia de Software</strong>
</p>

<p>
  <img src="https://img.shields.io/badge/status-em%20desenvolvimento-yellow" alt="Status">
  <img src="https://img.shields.io/badge/IFSP-Instituto%20Federal%20de%20São%20Paulo-blue" alt="IFSP">
  <img src="https://img.shields.io/badge/documentação-Markdown-purple" alt="Documentação">
  <img src="https://img.shields.io/badge/versionamento-Git%20%2F%20GitHub-black" alt="Git">
</p>

</div>

---

## 📌 Sobre o Projeto

O **Fila.exe** é um sistema desenvolvido para auxiliar no gerenciamento de uma **cantina escolar**, centralizando:

- 🛒 Cadastro de produtos
- 🧾 Realização e controle de pedidos
- 💰 Vendas presenciais
- 📋 Gerenciamento de fila
- 📊 Geração de relatórios

O projeto está sendo desenvolvido no contexto acadêmico da disciplina de **Gestão de Projetos de Software**, com foco na aplicação prática de conceitos de:

> **Engenharia de Software • Gerenciamento de Projetos • Desenvolvimento de Sistemas • Banco de Dados**

---

## 🎯 Objetivos

| Objetivo | Descrição |
|---|---|
| 🏪 **Centralização** | Centralizar o gerenciamento da cantina |
| 📦 **Produtos** | Facilitar o cadastro e gerenciamento de produtos |
| 🛒 **Pedidos** | Permitir o registro e acompanhamento de pedidos |
| 📋 **Fila** | Organizar a fila virtual |
| 💰 **Vendas** | Registrar vendas presenciais |
| 📊 **Informações** | Disponibilizar informações para acompanhamento das vendas |
| ⚙️ **Operação** | Reduzir processos manuais e facilitar o controle operacional |

---

## 👥 Equipe e Gestão

| Função | Responsável |
|---|---|
| 👩‍💼 **Gerente do Projeto** | Stephanie Marys |
| 🏫 **Patrocinador** | IFSP — Instituto Federal de São Paulo |
| 📅 **Data de elaboração** | 28/08/2026 |

---

# 🎯 Escopo do Sistema

O sistema será composto pelos seguintes módulos:

| Módulo | Descrição |
|---|---|
| 🔐 **Login Institucional** | Autenticação e controle de acesso dos usuários |
| 📦 **Cadastro de Produtos** | Gerenciamento dos produtos disponíveis na cantina |
| 🛒 **Registro de Pedidos** | Criação e armazenamento de pedidos |
| 📖 **Catálogo** | Visualização dos produtos disponíveis |
| 💰 **Venda Presencial** | Registro de vendas realizadas diretamente na cantina |
| 🧾 **Fila Virtual** | Organização e acompanhamento dos pedidos |
| 📋 **Controle de Pedidos** | Gerenciamento do status dos pedidos |
| ⚙️ **Configuração da Cantina** | Gerenciamento das configurações do sistema |
| 📊 **Relatórios de Vendas** | Consulta e análise das vendas realizadas |

---

# 🏗️ Arquitetura Funcional

A estrutura funcional prevista para o sistema:

```text
                         ┌──────────────────────┐
                         │      🍔 FILA.EXE      │
                         │   Sistema da Cantina │
                         └──────────┬───────────┘
                                    │
             ┌──────────────────────┼──────────────────────┐
             │                      │                      │
             ▼                      ▼                      ▼
      🔐 AUTENTICAÇÃO           🛒 PEDIDOS              ⚙️ GESTÃO
             │                      │                      │
             ▼                      ▼                      ▼
      Login Institucional     Registro de Pedidos      Produtos
                              Fila Virtual              Configuração
                              Controle de Pedidos
                                    │
                                    ▼
                           💰 VENDAS / RELATÓRIOS
                                    │
                             ┌──────┴──────┐
                             ▼             ▼
                      Venda Presencial  Relatórios
```

---

# 📋 Requisitos Funcionais

## 🔐 Autenticação

- **RF01** — O sistema deverá permitir o login utilizando e-mail institucional.
- **RF02** — O sistema deverá validar as credenciais do usuário.
- **RF03** — O sistema deverá controlar o acesso às funcionalidades de acordo com o perfil do usuário.

## 📦 Produtos

- **RF04** — O sistema deverá permitir cadastrar produtos.
- **RF05** — O sistema deverá permitir consultar produtos.
- **RF06** — O sistema deverá permitir alterar informações dos produtos.
- **RF07** — O sistema deverá permitir controlar a disponibilidade dos produtos.

## 🛒 Pedidos

- **RF08** — O sistema deverá permitir criar pedidos.
- **RF09** — O sistema deverá armazenar os pedidos.
- **RF10** — O sistema deverá permitir acompanhar o status dos pedidos.
- **RF11** — O sistema deverá organizar os pedidos na fila virtual.

## 💰 Vendas

- **RF12** — O sistema deverá permitir registrar vendas presenciais.
- **RF13** — O sistema deverá armazenar as informações das vendas.

## 📊 Relatórios

- **RF14** — O sistema deverá permitir consultar informações sobre as vendas.
- **RF15** — O sistema deverá gerar relatórios de vendas.

> 💡 **Observação:** Os requisitos serão refinados durante o levantamento e a análise de requisitos do projeto.

---

# 🔐 Requisitos Não Funcionais

| Código | Categoria | Requisito |
|---|---|---|
| RNF01 | 🔒 Segurança | Informações de autenticação devem ser protegidas |
| RNF02 | 🖥️ Usabilidade | As telas devem apresentar navegação simples e intuitiva |
| RNF03 | 🗄️ Integridade | Os dados registrados devem manter consistência no banco de dados |
| RNF04 | 🟢 Disponibilidade | O sistema deve estar disponível durante o horário de funcionamento da cantina |
| RNF05 | 🛠️ Manutenibilidade | O código deve ser organizado para facilitar futuras alterações |
| RNF06 | ⚡ Desempenho | Operações comuns devem apresentar tempo de resposta adequado ao contexto de utilização |

---

# 🗂️ Estrutura Analítica do Projeto — EAP

```text
1.0 — 🍔 FILA.EXE
│
├── 1.0.1 — 🔐 Login Institucional
│   ├── Definição das regras
│   ├── Desenvolvimento da tela
│   ├── Integração com e-mail institucional
│   ├── Validações
│   └── Testes
│
├── 1.1.1 — 📦 Cadastro de Produtos
│   ├── Levantamento dos campos
│   ├── Desenvolvimento da tela
│   ├── Integração com banco de dados
│   ├── Validações
│   └── Testes
│
├── 1.2.1 — 🛒 Registro de Pedidos
│   ├── Definição das regras
│   ├── Desenvolvimento da tela
│   ├── Persistência dos dados
│   ├── Validações
│   └── Testes
│
├── 1.3.1 — 📖 Catálogo de Produtos
│   ├── Definição das regras
│   ├── Desenvolvimento da tela
│   ├── Validações
│   └── Testes
│
├── 1.4.1 — 💰 Venda Presencial
│   ├── Definição das regras
│   ├── Desenvolvimento da tela
│   ├── Persistência da venda
│   ├── Validações
│   └── Testes
│
├── 1.5.1 — 🧾 Fila Virtual
│   ├── Definição das regras
│   ├── Desenvolvimento da tela
│   ├── Persistência da fila
│   ├── Validações
│   └── Testes
│
├── 1.6.1 — 📋 Controle de Pedidos
│   ├── Definição das regras
│   ├── Desenvolvimento da tela
│   ├── Persistência dos dados
│   ├── Validações
│   └── Testes
│
├── 1.7.1 — ⚙️ Configuração da Cantina
│   ├── Definição das regras
│   ├── Desenvolvimento da tela
│   ├── Persistência das configurações
│   ├── Validações
│   └── Testes
│
└── 1.8.1 — 📊 Relatório de Vendas
    ├── Definição das regras
    ├── Desenvolvimento da tela
    ├── Implementação dos relatórios
    ├── Validações
    └── Testes
```

---



# 📌 Status do Projeto

<div align="center">

### 🚧 EM DESENVOLVIMENTO

O projeto está em desenvolvimento acadêmico e poderá sofrer alterações durante as etapas de análise, desenvolvimento e validação.

</div>

---

# 🎓 Contexto Acadêmico

Projeto desenvolvido no:

**🏫 Instituto Federal de São Paulo — IFSP**

Com aplicação de conceitos relacionados a:

- 💻 Engenharia de Software
- 📋 Gerenciamento de Projetos
- 🔎 Análise e Desenvolvimento de Sistemas
- 🗄️ Banco de Dados
- ⚙️ Desenvolvimento de Software
- 🧪 Testes de Software
- 🌿 Controle de Versionamento

---

# 👩‍💻 Equipe

| Integrante | Função |
|---|---|
| 👩‍💼 **Stephanie Marys** | Gerente do Projeto |
| 👩‍💻 **Maria Passareli** | Gerente de Desenvolvimento |
| 👨‍💻 **Mateus Ciffoni** | Desenvolvedor |
| 👨‍💻 **Vinícius Do Vale** | Desenvolvedor |

### 🏫 IFSP — Instituto Federal de São Paulo

---

<div align="center">

## 🍔 Fila.exe

### Sistema de Gerenciamento da Cantina Escolar

---

**📚 Projeto acadêmico • IFSP • 2026**

</div>
