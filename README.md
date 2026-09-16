# Blog Escolar

Aplicação full stack para publicação e leitura de posts escolares. O projeto possui uma API REST em Node.js/TypeScript e uma interface web em React, com persistência em PostgreSQL, autenticação real e controle de permissões por papel.

## Visão geral

- **Backend:** Node.js, TypeScript, Express 5, PostgreSQL e `pg`.
- **Frontend:** React, TypeScript, Vite, React Router, Axios e styled-components.
- **Autenticação:** senha com bcrypt e sessão JWT em cookie `httpOnly`.
- **Autorização:** RBAC para `teacher` e `admin`.
- **Documentação da API:** Swagger UI em `http://localhost:3000/api-docs`.
- **Testes:** Jest e ts-jest.

## Arquitetura

O backend segue uma separação inspirada em Clean Architecture:

```text
src/
├── domain/                      # Entidades e contratos dos repositórios
├── application/usecases/        # Regras de negócio isoladas
│   ├── authenticate-user.ts
│   ├── change-password.ts
│   ├── create-post.ts
│   ├── create-user.ts
│   ├── delete-post.ts
│   ├── get-post-by-id.ts
│   ├── list-posts.ts
│   ├── list-users.ts
│   ├── search-posts.ts
│   └── update-post.ts
├── infra/                       # Pool PostgreSQL e repositórios concretos
├── main/
│   ├── auth/                    # JWT, autenticação e autorização
│   ├── controllers/             # Adaptadores HTTP
│   └── factories/               # Composição das dependências
├── index.ts                     # Inicialização da aplicação e schema
└── routes.ts                    # Rotas HTTP

frontend/
├── src/api/                     # Cliente HTTP e chamadas à API
├── src/auth/                    # Contexto e proteção de rotas
├── src/components/              # Navbar, formulários e UI reutilizável
├── src/pages/                   # Telas da aplicação
├── src/styles/                  # Estilos globais
└── src/App.tsx                  # Roteamento principal
```

## Configuração

### Pré-requisitos

- Node.js 20 ou superior.
- npm.
- Docker e Docker Compose, caso queira executar o PostgreSQL em container.

### Variáveis de ambiente

Copie o arquivo de exemplo e ajuste os valores locais:

```bash
copy .env.example .env
```

No macOS/Linux, use `cp .env.example .env`.

O `.env` real não deve ser commitado. As principais variáveis são:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=change-me
DB_NAME=blog_escolar
PORT=3000
JWT_SECRET=change-this-in-a-real-environment
JWT_EXPIRES_IN=8h
FRONTEND_ORIGIN=http://localhost:5173
DEFAULT_ADMIN_EMAIL=admin@escola.com
DEFAULT_ADMIN_PASSWORD=change-me
```

## Execução com Docker

Na raiz do projeto:

```bash
docker compose up -d --build
```

Esse comando inicia o PostgreSQL e a API em `http://localhost:3000`.

O frontend pode ser executado localmente em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

Abra `http://localhost:5173`.

## Execução local

Com o PostgreSQL disponível e o `.env` configurado:

```bash
# Backend, na raiz
npm install
npm run dev

# Frontend, em outro terminal
cd frontend
npm install
npm run dev
```

Para gerar as versões de produção:

```bash
# Backend
npm run build

# Frontend
cd frontend
npm run build
```

## Autenticação e autorização

O login usa email e senha. As senhas são armazenadas com bcrypt e nunca retornadas pela API. Após o login, o backend envia um JWT em um cookie `httpOnly` chamado `auth_token`.

O frontend envia cookies com `withCredentials: true` e restaura a sessão usando `GET /auth/me`. O cookie pode ser usado pelo navegador ou pelo Insomnia. Como alternativa, a API também aceita `Authorization: Bearer <jwt>`.

### Papéis

- **Professor (`teacher`):** pode criar posts, editar/excluir os próprios posts, trocar a própria senha e acessar a administração dos próprios posts.
- **Administrador (`admin`):** possui as permissões de professor e pode gerenciar usuários e visualizar todos os posts na área administrativa.
- **Aluno (`student`):** não pode fazer login pela interface atual. Posts são públicos para leitura, então alunos e visitantes podem navegar sem conta.

### Rotas protegidas

- `POST /posts`: professor ou administrador.
- `PUT /posts/:id`: autor do post ou administrador.
- `DELETE /posts/:id`: autor do post ou administrador.
- `POST /users` e `GET /users`: administrador.
- `PUT /auth/password`: qualquer usuário autenticado.

### Rotas públicas

- `GET /posts`: lista todos os posts.
- `GET /posts/:id`: lê um post.
- `GET /posts/search?q=termo`: busca posts.
- `POST /auth/register`: cadastro público somente para professores.
- `POST /auth/login`: login de professores e administradores.

## Endpoints principais

### Criar conta de professor

`POST http://localhost:3000/auth/register`

```json
{
  "name": "Ana Souza",
  "email": "ana@escola.com",
  "password": "SenhaForte123",
  "role": "teacher"
}
```

O cadastro já inicia a sessão e retorna o usuário sem a senha.

### Login

`POST http://localhost:3000/auth/login`

```json
{
  "email": "ana@escola.com",
  "password": "SenhaForte123"
}
```

### Trocar senha

`PUT http://localhost:3000/auth/password`

```json
{
  "currentPassword": "SenhaForte123",
  "newPassword": "OutraSenha456"
}
```

Essa rota exige a sessão criada no login.

### Criar post

`POST http://localhost:3000/posts`

```json
{
  "title": "Introdução ao TypeScript",
  "content": "Nesta aula vamos aprender os conceitos básicos do TypeScript."
}
```

O autor é preenchido automaticamente a partir do usuário autenticado. Não é necessário enviar `author`.

### Listar e buscar posts

```text
GET http://localhost:3000/posts
GET http://localhost:3000/posts/search?q=TypeScript
GET http://localhost:3000/posts/1
```

Essas rotas são públicas e retornam posts de todos os professores.

## Frontend

A interface React possui:

- Página pública de listagem com busca.
- Leitura de posts e comentários locais no navegador.
- Cadastro e login de professores.
- Criação e edição de posts para professores autenticados.
- Administração dos próprios posts para professores.
- Administração de todos os posts e usuários para administradores.
- Troca de senha para usuários autenticados.
- Formulários responsivos e componentes reutilizáveis com styled-components.

Os comentários atuais são armazenados no `localStorage` do navegador. Eles ainda não são persistidos no PostgreSQL nem compartilhados entre dispositivos.

## Testes

Na raiz do projeto:

```bash
npm test
npm run test:cov
npm run build
```

Para validar o frontend:

```bash
cd frontend
npm run build
```

## Swagger

Com a API em execução, acesse:

**http://localhost:3000/api-docs**

O Swagger documenta autenticação, cadastro, login, troca de senha, posts e usuários.

## CI/CD

O projeto possui workflow em `.github/workflows/ci-cd.yml`. O pipeline instala dependências, prepara o PostgreSQL, executa o build TypeScript e roda os testes antes de continuar para as etapas de entrega configuradas.

## Relato de desenvolvimento

As dificuldades encontradas durante a implementação do frontend e da autenticação estão documentadas em [frontend/README.md](frontend/README.md), em primeira pessoa, como parte do relato do trabalho de pós-graduação em desenvolvimento full stack.
