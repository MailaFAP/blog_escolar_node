# 🏫 API Blog Escolar

Uma API REST desenvolvida em **Node.js**, **TypeScript** e **Express** para gerenciamento de postagens escolares com persistência em banco de dados **PostgreSQL**. O projeto adota princípios de **Clean Architecture** (Arquitetura Limpa) e **SOLID** para garantir robustez, manutenibilidade e facilidade de testes.

> 📝 **Documentação Interativa (Swagger UI):** Com a aplicação em execução, acesse **[http://localhost:3000/api-docs](http://localhost:3000/api-docs)** para visualizar e testar todos os endpoints de forma interativa e visual diretamente no navegador.

---

## 🏗️ Arquitetura do Projeto

A aplicação está organizada seguindo os conceitos de isolamento de camadas da Clean Architecture:

```
src/
├── domain/            # Camada de Negócio Pura (Entidades e Interfaces do Repositório)
│   ├── post.ts
│   ├── post-repository.ts
│   └── user.ts
│
├── application/       # Regras de Aplicação (Casos de Uso)
│   └── usecases/      # Create, Read, Update, Delete, List, Search
│
├── infra/             # Detalhes de Infraestrutura (Banco de dados Postgres, etc.)
│   ├── database.ts
│   └── postgres/      # Implementação dos Repositórios usando pg (node-postgres)
│
├── main/              # Ponto de Entrada, Factories, Controladores e Middlewares
│   ├── auth/          # Middleware de Autorização baseado em Headers
│   ├── controllers/   # Adaptadores para o Express
│   └── factories/     # Injeção de dependências e instanciação dos Casos de Uso
│
└── routes.ts          # Definição e mapeamento das rotas HTTP
```

---

## 🛠️ Setup Inicial e Execução

### Pré-requisitos
- [Docker](https://www.docker.com/) instalado.
- [Docker Compose](https://docs.docker.com/compose/) instalado.

### 🐳 Execução com Docker (Recomendado)

A aplicação já está totalmente conteinerizada com Docker e Docker Compose, contendo a API e o Banco de Dados integrados.

1. Clone o repositório.
2. Certifique-se de que a porta `3000` (API) e `5432` (PostgreSQL) não estão em uso no seu computador.
3. Suba os containers com o comando:
   ```bash
   docker-compose up -d --build
   ```
4. A API estará pronta e respondendo em `http://localhost:3000`.

### 💻 Execução para Desenvolvimento Local (Sem Docker)

Se preferir rodar localmente no seu host:

1. Certifique-se de ter um banco PostgreSQL rodando e preencha as variáveis no arquivo `.env` localizado na raiz:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_NAME=blog_escolar
   PORT=3000
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Execute o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

---

## 🔐 Autenticação e Autorização (RBAC)

A API utiliza controle de acesso baseado em papéis (Role-Based Access Control - RBAC). A identificação e autenticação dos usuários é feita diretamente por meio de dois headers HTTP personalizados enviando o ID e a Role do usuário requisitante:

| Header | Descrição | Exemplo |
| :--- | :--- | :--- |
| `x-user-id` | ID numérico do usuário no banco | `1` |
| `x-user-role` | Cargo do usuário (`admin`, `teacher`, `student`) | `teacher` |

### Tabela de Permissões

| Recurso / Rota | Permissão Requerida | Admin | Professor (Teacher) | Aluno (Student) |
| :--- | :--- | :---: | :---: | :---: |
| `POST /posts` | `create_post` | ✅ | ✅ | ❌ |
| `PUT /posts/:id` | `edit_post` | ✅ | ✅ *(Apenas os seus)* | ❌ |
| `DELETE /posts/:id` | `edit_post` | ✅ | ✅ *(Apenas os seus)* | ❌ |
| `GET /posts` | `list_posts` | ✅ | ✅ *(Apenas os seus)* | ❌ |
| `GET /posts/search` | `list_posts` | ✅ | ✅ *(Apenas os seus)* | ❌ |
| `GET /posts/:id` | `view_post` | ✅ | ✅ | ✅ |
| `POST /users` | `manage_users` | ✅ | ❌ | ❌ |
| `GET /users` | `manage_users` | ✅ | ❌ | ❌ |

---

## 📖 Guia de Uso das APIs (API Docs)

Você tem duas formas de consultar e testar os endpoints da API:

### 📝 Swagger UI (Documentação Interativa - Recomendado)
A aplicação conta com uma interface gráfica para testes e documentação dos contratos das rotas.
Com os containers ativos, basta acessar pelo navegador:
👉 **[http://localhost:3000/api-docs](http://localhost:3000/api-docs)**

Você poderá testar as rotas inserindo os headers `x-user-id` e `x-user-role` diretamente na interface.

---

### 📝 Manual dos Endpoints

Abaixo estão listados os caminhos HTTP com exemplos completos de corpo e headers para testes manuais.

### 📌 Usuários (Users)

#### Criar Usuário
- **Rota:** `POST /users`
- **Headers:** `x-user-id: 1`, `x-user-role: admin`
- **Request Body:**
  ```json
  {
    "name": "Prof. Carlos",
    "email": "carlos@escola.com",
    "role": "teacher"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "id": 2,
    "name": "Prof. Carlos",
    "email": "carlos@escola.com",
    "role": "teacher"
  }
  ```

#### Listar Usuários
- **Rota:** `GET /users`
- **Headers:** `x-user-id: 1`, `x-user-role: admin`
- **Response (200 OK):**
  ```json
  [
    {
      "id": 1,
      "name": "Admin",
      "email": "admin@escola.com",
      "role": "admin"
    }
  ]
  ```

---

### 📌 Postagens (Posts)

#### Criar Post
- **Rota:** `POST /posts`
- **Headers:** `x-user-id: 2`, `x-user-role: teacher`
- **Request Body:**
  ```json
  {
    "title": "Introdução ao TypeScript",
    "content": "Nesta aula vamos aprender os conceitos básicos do TS...",
    "url": "https://meublog.com/imagem-aula.png"
  }
  ```
  *(Nota: Se o campo `author` não for passado no payload, o sistema resolverá automaticamente o nome do autor com base no `x-user-id` passado no header).*
- **Response (201 Created):**
  ```json
  {
    "id": 1,
    "title": "Introdução ao TypeScript",
    "content": "Nesta aula vamos aprender os conceitos básicos do TS...",
    "author": "Prof. Carlos",
    "url": "https://meublog.com/imagem-aula.png",
    "createdBy": 2,
    "createdAt": "2026-07-12T00:30:00.000Z",
    "updatedAt": "2026-07-12T00:30:00.000Z"
  }
  ```

#### Listar Posts
- **Rota:** `GET /posts`
- **Headers:** `x-user-id: 2`, `x-user-role: teacher`
- **Response (200 OK):**
  *(Se for professor, retorna apenas os posts criados por ele. Se for admin, retorna de todos).*

#### Buscar Posts por Palavra-Chave
- **Rota:** `GET /posts/search?q=TypeScript`
- **Headers:** `x-user-id: 2`, `x-user-role: teacher`
- **Response (200 OK):**
  *(Busca palavras-chave nos títulos e conteúdos dos posts aplicáveis ao escopo do usuário).*

#### Obter Post por ID
- **Rota:** `GET /posts/:id`
- **Headers:** `x-user-id: 3`, `x-user-role: student`
- **Response (200 OK):**
  *(Disponível para todas as roles).*

#### Atualizar Post
- **Rota:** `PUT /posts/:id`
- **Headers:** `x-user-id: 2`, `x-user-role: teacher`
- **Request Body:**
  ```json
  {
    "title": "TypeScript Avançado"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "id": 1,
    "title": "TypeScript Avançado",
    "content": "Nesta aula vamos aprender os conceitos básicos do TS...",
    "author": "Prof. Carlos",
    "url": "https://meublog.com/imagem-aula.png",
    "createdBy": 2,
    "createdAt": "2026-07-12T00:30:00.000Z",
    "updatedAt": "2026-07-12T00:32:00.000Z"
  }
  ```

#### Excluir Post
- **Rota:** `DELETE /posts/:id`
- **Headers:** `x-user-id: 2`, `x-user-role: teacher`
- **Response (204 No Content):**
  *(Retorna sem corpo em caso de sucesso).*

---

## 🧪 Cobertura de Testes Unitários

O projeto possui suporte a testes unitários automatizados utilizando o framework **Jest**. Atualmente, a cobertura do projeto é de **53.84%** das linhas globais e **100% de cobertura** nos casos de uso críticos (`CreatePostUseCase`, `UpdatePostUseCase`, `DeletePostUseCase`).

### Como rodar os testes:
Utilizando o ambiente conteinerizado do Docker:

```bash
# Executar todos os testes
docker-compose exec api npm run test

# Executar todos os testes gerando relatório de cobertura de código
docker-compose exec api npm run test:cov
```

---

## 🚀 Integração e Entrega Contínua (CI/CD)

O projeto está integrado com **GitHub Actions** através do workflow configurado em `.github/workflows/ci-cd.yml`.
A cada push ou pull request na branch `main`:
- Um banco de dados Postgres é montado temporariamente na nuvem do GitHub.
- O Node roda o setup do projeto e instala dependências.
- Executa a compilação do TypeScript (`npm run build`).
- Executa todos os testes unitários (`npm test`).
- Se todas as etapas passarem, o pipeline prossegue para a etapa de deploy automático.
