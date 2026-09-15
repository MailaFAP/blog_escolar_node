# Blog Escolar — Frontend

Interface React (Vite + TypeScript) para o back-end de blogging escolar.

## Como executar

```bash
npm install
npm run dev
```

A aplicação espera a API disponível em `http://localhost:3000` (configurável via `VITE_API_URL` no `.env`).

## Autenticação

A autenticação é real: login com email e senha (`POST /auth/login`), com o back-end retornando um
JWT em um cookie `httpOnly` (não acessível via JavaScript). A sessão é restaurada ao recarregar a
página através de `GET /auth/me`, e encerrada com `POST /auth/logout`.

Um usuário administrador padrão é criado automaticamente na primeira inicialização do back-end
(veja `DEFAULT_ADMIN_EMAIL`/`DEFAULT_ADMIN_PASSWORD` no `.env` do back-end). Use-o para entrar e
cadastrar professores/alunos em `/admin/users`.

Papéis com permissão para criar, editar, excluir e administrar posts: `teacher` e `admin`.
Apenas `admin` pode gerenciar usuários.

## Páginas

- `/` — lista de posts com busca por palavra-chave.
- `/posts/:id` — leitura de um post, com comentários (armazenados localmente no navegador).
- `/posts/new` — criação de postagem (restrito a professores/administradores).
- `/posts/:id/edit` — edição de postagem (restrito a professores/administradores).
- `/admin` — lista administrativa com edição e exclusão de posts (restrito a professores/administradores).
- `/admin/users` — cadastro e listagem de usuários (restrito a administradores).
- `/login` — autenticação com email e senha.

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
