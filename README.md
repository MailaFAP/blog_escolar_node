# Blog Escolar

Aplicação full stack para publicação e leitura de posts escolares. O projeto possui uma API REST em Node.js/TypeScript, uma interface web em React e um aplicativo móvel em React Native (Expo), com persistência em PostgreSQL, autenticação real e controle de permissões por papel.

## Visão geral

- **Backend:** Node.js, TypeScript, Express 5, PostgreSQL e `pg`.
- **Frontend:** React, TypeScript, Vite, React Router, Axios e styled-components.
- **Mobile:** React Native, Expo, TypeScript, hooks e componentes funcionais.
- **Autenticação:** senha com bcrypt e sessão JWT em cookie `httpOnly`.
- **Autorização:** RBAC para `teacher`, `student` e `admin`.
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
│   ├── update-post.ts
│   ├── update-student.ts
│   └── update-teacher.ts
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

mobile/
├── App.tsx                      # Telas, navegação local, formulários e estado (hooks)
├── src/api/client.ts            # Cliente HTTP (fetch), sessão por cookie e todos os endpoints
├── src/api/posts.ts             # Listagem e busca públicas de posts
├── src/auth/post-permissions.ts # Regra de quem pode editar/excluir cada post
└── app.json, package.json       # Configuração e dependências do Expo
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

O administrador padr\u00e3o s\u00f3 \u00e9 criado quando a tabela `users` est\u00e1 vazia. No `docker-compose.yml`, `FRONTEND_ORIGIN` aponta para `http://localhost:8081` (Expo web); use `http://localhost:5173` para o frontend web. A API aceita uma \u00fanica origem por vez.
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

## Aplicativo móvel

O diretório `mobile/` contém um aplicativo React Native com Expo, separado da interface web. São necessários Node.js 20 ou superior, npm e o aplicativo Expo Go em um dispositivo Android/iOS, ou um emulador Android. Para simulador iOS, é necessário macOS com Xcode.

Com o PostgreSQL e o backend já iniciados, instale e execute o aplicativo em outro terminal:

```bash
cd mobile
npm install
npm start
```

Abra o QR code no Expo Go, pressione `a` para abrir o emulador Android (exige Android Studio e `ANDROID_HOME`) ou pressione `w` para abrir no navegador em `http://localhost:8081`. O aplicativo usa `http://10.0.2.2:3000` no emulador Android e `http://localhost:3000` no simulador iOS por padrão. Em um celular físico, configure o endereço IP da máquina que executa a API, na mesma rede do dispositivo, antes de iniciar o Expo:

```powershell
$env:EXPO_PUBLIC_API_URL="http://192.168.1.10:3000"
npm start
```

Substitua o IP pelo endereço da sua máquina e libere a porta da API no firewall, se necessário. Em macOS/Linux, use `EXPO_PUBLIC_API_URL=http://192.168.1.10:3000 npm start`. A variável é incorporada ao aplicativo e não deve conter segredos. Para produção, utilize HTTPS e configure a API e o aplicativo adequadamente.

### Execução no navegador

É necessário ter instalado `react-dom`, `react-native-web` e `@expo/metro-runtime` (`npx expo install react-dom react-native-web @expo/metro-runtime`) e a plataforma `web` em `mobile/app.json`. Como a sessão usa cookie, a API deve permitir a origem do Expo web: defina `FRONTEND_ORIGIN=http://localhost:8081` (o `docker-compose.yml` já faz isso). A API aceita uma única origem; para usar o frontend web (`http://localhost:5173`) ao mesmo tempo, altere essa variável.

### Arquitetura e uso

- `mobile/App.tsx`: componente `App` com hooks (`useState`, `useEffect`, `useRef`) que controla as telas (`home`, `read`, `login`, `register`, `postForm`, `admin`, `users`, `userForm`, `teachers`, `teacherEdit`, `studentEdit`), a navegação local, os formulários e o estado da sessão e das listas. Não há Context API nem Redux. Os componentes `Button`, `IconButton`, `Field` e `PostRead` são funcionais.
- `mobile/src/api/posts.ts`: listagem e busca públicas de posts.
- `mobile/src/api/client.ts`: demais endpoints (autenticação, posts, docentes, estudantes), sessão por cookie (`credentials: 'include'`) e tratamento de sessão expirada (401).
- `mobile/src/auth/post-permissions.ts`: `canManagePost`, que define quem edita ou exclui cada post.
- `mobile/app.json` e `mobile/package.json`: configuração e dependências do Expo.

Fluxo de uso:

- **Visitante:** na tela inicial, pesquisa por palavras-chave e toca em uma publicação para lê-la. Pelo ícone de usuário, entra ou cria uma conta de docente ou de estudante.
- **Estudante:** lê os posts e, pelo ícone de configurações, acessa a administração de estudantes: **Cadastrar estudante** e **Listar estudantes**, com edição de nome e email e exclusão (exceto da própria conta). Não cria, edita nem exclui posts.
- **Professor:** além das opções de estudante, cria posts, edita ou exclui os próprios, cadastra outros docentes e usa **Listar docentes** para editar e excluir docentes (exceto a própria conta), sempre com confirmação.
- **Administrador:** gerencia todos os posts e, em **Gerenciar pessoas**, docentes e estudantes.

A autenticação usa o cookie retornado pela API; o servidor continua responsável por validar as permissões.

### Permissões da lista administrativa móvel

A lista pública de publicações pode ser acessada sem login. A área administrativa, acessível pelo ícone de configurações após o login, mostra todas as publicações para professores e administradores:

| Usuário | Acesso à administração | Editar ou excluir |
| --- | --- | --- |
| Professor autenticado | Visualiza todos os posts | Apenas posts vinculados à própria conta |
| Administrador autenticado | Visualiza todos os posts | Qualquer post, incluindo posts sem criador vinculado |
| Estudante autenticado | Acessa apenas a administração de estudantes | Não pode editar ou excluir posts |
| Visitante | Não acessa a administração | Não pode editar ou excluir posts |

A propriedade é determinada pelo identificador `createdBy`, não pelo nome exibido no campo autor. Se um post não tiver criador vinculado, somente o administrador pode editá-lo ou excluí-lo. Na interface, os botões aparecem apenas para ações permitidas e a exclusão pede confirmação. A API valida a autenticação, as permissões e a propriedade novamente, independentemente dos botões exibidos.

No aplicativo móvel, a sessão é restaurada ao iniciar e verificada novamente ao abrir a administração ou o formulário de postagem e ao retornar ao aplicativo nessas telas. Se a API informar que a sessão expirou, o aplicativo solicita um novo login. Se não for possível verificar a sessão por falha de conexão, as telas protegidas permanecem bloqueadas até uma nova tentativa. A API valida a autenticação e a autorização em cada operação protegida.

O backend não oferece paginação nos endpoints de usuários, docentes ou estudantes; a paginação móvel é local, com oito registros por página. Ao excluir um docente, seus posts são mantidos sem vínculo com a conta; a sessão da conta excluída deixa de autorizar rotas protegidas. Comentários são opcionais e não foram implementados.

**Segurança:** o autocadastro de professores e estudantes é público e qualquer usuário autenticado pode listar, editar e excluir estudantes; qualquer professor (inclusive recém-cadastrado) pode listar, editar e excluir outros docentes. Restrinja o autocadastro público antes de usar essas operações com dados reais.

Ao executar no navegador, `Alert.alert` com botões não funciona no react-native-web; as confirmações de exclusão usam `window.confirm` nessa plataforma. Os avisos de sucesso ainda usam `Alert.alert` e não aparecem no navegador.

Para verificar os tipos do aplicativo, execute `npm run typecheck` em `mobile/`. Os testes do mobile (`mobile/src/**/*.spec.ts`) rodam pela raiz: `npm test -- --runInBand mobile/src`.

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

- **Professor (`teacher`):** pode criar posts, editar/excluir os próprios posts, cadastrar, listar, editar e excluir docentes e estudantes, e trocar a própria senha. No aplicativo móvel, pode visualizar todos os posts na administração, mas só gerenciar os próprios.
- **Administrador (`admin`):** possui as permissões de professor, gerencia todos os posts e pode listar e criar qualquer usuário (`/users`).
- **Aluno (`student`):** pode fazer login, ler posts e gerenciar estudantes (cadastrar, listar, editar e excluir), mas não cria, edita nem exclui posts. Posts são públicos para leitura, então visitantes podem navegar sem conta. Não é possível excluir a própria conta.

### Rotas protegidas

- `POST /posts`: professor ou administrador.
- `PUT /posts/:id`: autor do post ou administrador.
- `DELETE /posts/:id`: autor do post ou administrador.
- `POST /teachers`: professor ou administrador; cria apenas contas de docente e não altera a sessão atual.
- `GET /teachers`, `GET /teachers/:id` e `PUT /teachers/:id`: professor ou administrador; listam, consultam ou atualizam nome e email de docentes.
- `DELETE /teachers/:id`: professor ou administrador; exclui a conta de docente, mantendo os posts existentes. A própria conta não pode ser excluída (400).
- `GET /students` e `POST /students`: qualquer usuário autenticado; listam estudantes ou cadastram um estudante (sessão atual preservada).
- `GET /students/:id`, `PUT /students/:id` e `DELETE /students/:id`: qualquer usuário autenticado; consultam, atualizam nome e email ou excluem um estudante. A própria conta não pode ser excluída (400).
- `POST /users` e `GET /users`: administrador.
- `PUT /auth/password`: qualquer usuário autenticado.

### Rotas públicas

- `GET /posts`: lista todos os posts.
- `GET /posts/:id`: lê um post.
- `GET /posts/search?q=termo`: busca posts.
- `GET /auth/me`: retorna o usuário da sessão (exige cookie ou token).
- `POST /auth/register`: cadastro público para professores e estudantes (`role` `teacher` ou `student`); não cria administradores.
- `POST /auth/login`: login de professores, estudantes e administradores.
- `POST /auth/logout`: encerra a sessão.

## Endpoints principais

### Criar conta própria (professor ou estudante)

`POST http://localhost:3000/auth/register`

```json
{
  "name": "Ana Souza",
  "email": "ana@escola.com",
  "password": "SenhaForte123",
  "role": "teacher"
}
```

Use `"role": "student"` para criar um estudante. O cadastro já inicia a sessão e retorna o usuário sem a senha.

### Cadastrar outro professor ou estudante

`POST http://localhost:3000/teachers` (professor ou administrador) e `POST http://localhost:3000/students` (qualquer usuário autenticado). O corpo contém `name`, `email` e `password`; o papel criado é sempre `teacher` ou `student`, respectivamente, e a sessão de quem fez a solicitação permanece ativa.

```json
{
  "name": "Ana Souza",
  "email": "ana@escola.com",
  "password": "SenhaForte123"
}
```

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

## Relato de desenvolvimento: dificuldades enfrentadas (front-end e autenticação)

Este projeto foi desenvolvido por mim como parte do trabalho de pós-graduação em desenvolvimento
full stack. Sou desenvolvedora júnior e registro aqui, com transparência, os pontos que mais me
custaram tempo e entendimento ao longo da implementação do front-end e da autenticação — tanto para
documentar meu aprendizado quanto para ajudar quem for revisar ou continuar este código.

**1. Entender onde o token deveria "morar".**
No início eu simplesmente guardava os dados do usuário logado no `localStorage`, sem me preocupar
muito com segurança. Ao evoluir para uma autenticação real com JWT, tive que estudar por que
guardar o token em `localStorage` é arriscado (fica exposto a ataques de XSS) e por que um cookie
`httpOnly` é mais seguro, já que o JavaScript do navegador nunca consegue ler o valor do cookie.
A parte mais difícil foi entender que, com o token em cookie `httpOnly`, o React não tem mais acesso
direto ao token — então eu precisei criar uma rota `GET /auth/me` só para "redescobrir" quem é o
usuário logado toda vez que a página é recarregada, em vez de simplesmente ler algo do
`localStorage`.

**2. CORS com cookies (credentials).**
Configurar o back-end e o front-end em portas diferentes (`3000` e `5173`) trouxe problemas de CORS
que eu não tinha enfrentado antes. Descobri que, além de configurar o `cors()` no Express com
`credentials: true` e uma origem específica (não pode usar `*` quando se usa cookies), eu também
precisava lembrar de configurar `withCredentials: true` no Axios no front-end. Esquecer qualquer um
dos dois lados fazia o cookie simplesmente não ser enviado, e eu ficava recebendo `401` sem entender
o motivo — foi um dos bugs mais silenciosos que enfrentei.

**3. Sincronizar o estado de autenticação no React sem "piscar" a tela.**
Como a sessão precisa ser restaurada de forma assíncrona (chamando `/auth/me`), percebi que minhas
rotas protegidas (`PrivateRoute`) redirecionavam para `/login` por uma fração de segundo antes de a
resposta da API chegar, mesmo quando o usuário já estava autenticado. Tive que adicionar um estado de
`loading` no `AuthContext` e esperar essa verificação terminar antes de decidir se redireciono ou não
— algo que não é tão óbvio quando se está acostumado com autenticação síncrona.

**4. Separar "quem pode ver" de "quem pode editar".**
Outra dificuldade foi entender a diferença entre autenticação (quem é você) e autorização (o que você
pode fazer). Passei por vários ajustes de escopo durante o projeto: primeiro os posts exigiam login
para qualquer leitura, depois precisei torná-los públicos para leitura e manter a autenticação restrita
apenas a professores para criar/editar/administrar. Foi um exercício de refatoração constante entre o
front-end (rotas protegidas com `PrivateRoute` e papéis permitidos) e o back-end (middlewares
`authorize`), e aprendi que é fácil esquecer de atualizar os dois lados de forma consistente.

**5. Dados "legados" sem senha no banco.**
Quando implementei login com senha, descobri que já existiam usuários cadastrados no banco de dados
(criados antes de existir autenticação real) sem nenhum `password_hash`. Isso me ensinou que migrações
de schema não bastam sozinhas — às vezes é preciso também migrar/ajustar os dados que já existem, ou
o recurso novo simplesmente não funciona para quem já estava na base.

**6. Formulários controlados e re-uso de componentes.**
Reaproveitar o mesmo formulário (`PostForm`) tanto para criar quanto para editar postagens pareceu
simples no início, mas fez eu perceber sutilezas do React sobre estado inicial vindo de props
assíncronas (o post só chega depois de uma chamada à API) e sobre quando um campo deve ou não ser
enviado no payload (por exemplo, o campo de autor precisou deixar de ser editável manualmente e passar
a ser resolvido automaticamente a partir de quem está logado).

No geral, a maior lição foi perceber que autenticação "de verdade" tem muito mais camadas do que
parece à primeira vista — não é só validar email e senha, mas pensar em onde os dados ficam
armazenados, como e quando o front-end "sabe" que a sessão ainda é válida, e como manter front-end e
back-end sempre de acordo sobre quem pode fazer o quê.
