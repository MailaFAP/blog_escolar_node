export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'API Blog Escolar',
    version: '1.0.0',
    description: 'Documentação técnica interativa da API do Blog Escolar. Permite gerenciar usuários e postagens de aulas. A autenticação é feita via JWT (cookie httpOnly `auth_token`, obtido em `POST /auth/login`, ou header `Authorization: Bearer <token>`).',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Servidor Local (Docker/Desenvolvimento)',
    },
  ],
  security: [
    {
      CookieAuth: [],
    },
  ],
  components: {
    securitySchemes: {
      CookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'auth_token',
        description: 'Token JWT emitido por POST /auth/login.',
      },
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Alternativa ao cookie: enviar o token JWT no header Authorization.',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Prof. Carlos' },
          email: { type: 'string', example: 'carlos@escola.com' },
          role: { type: 'string', enum: ['admin', 'teacher', 'student'], example: 'teacher' },
        },
      },
      CreateUserInput: {
        type: 'object',
        required: ['name', 'email', 'password', 'role'],
        properties: {
          name: { type: 'string', example: 'Prof. Carlos' },
          email: { type: 'string', example: 'carlos@escola.com' },
          password: { type: 'string', format: 'password', example: 'SenhaForte123' },
          role: { type: 'string', enum: ['admin', 'teacher', 'student'], example: 'teacher' },
        },
      },
      Post: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          title: { type: 'string', example: 'Aula de TypeScript' },
          content: { type: 'string', example: 'Conteúdo programático sobre tipagem estática...' },
          author: { type: 'string', example: 'Prof. Carlos' },
          url: { type: 'string', nullable: true, example: 'https://escola.com/aulas/ts.png' },
          createdBy: { type: 'integer', nullable: true, example: 2 },
          createdAt: { type: 'string', format: 'date-time', example: '2026-07-12T00:30:00.000Z' },
          updatedAt: { type: 'string', format: 'date-time', example: '2026-07-12T00:30:00.000Z' },
        },
      },
      CreatePostInput: {
        type: 'object',
        required: ['title', 'content'],
        properties: {
          title: { type: 'string', example: 'Aula de TypeScript' },
          content: { type: 'string', example: 'Conteúdo programático sobre tipagem estática...' },
          url: { type: 'string', example: 'https://escola.com/aulas/ts.png' },
        },
      },
      UpdatePostInput: {
        type: 'object',
        properties: {
          title: { type: 'string', example: 'Aula de TypeScript Avançado' },
          content: { type: 'string', example: 'Conteúdo programático atualizado sobre Generics...' },
          url: { type: 'string', example: 'https://escola.com/aulas/ts-avancado.png' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Access denied.' },
        },
      },
    },
  },
  paths: {
    '/auth/register': {
      post: {
        summary: 'Criar a própria conta de professor(a)',
        description: 'Auto-cadastro exclusivo para professores(as). Alunos(as) e visitantes não precisam de conta para ler os posts. Não permite criar contas com papel `admin` ou `student`. Autentica automaticamente após o cadastro (cookie httpOnly).',
        tags: ['Autenticação'],
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password', 'role'],
                properties: {
                  name: { type: 'string', example: 'Ana Souza' },
                  email: { type: 'string', example: 'ana@escola.com' },
                  password: { type: 'string', format: 'password', example: 'SenhaForte123' },
                  role: { type: 'string', enum: ['teacher'], example: 'teacher' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Conta criada com sucesso.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
              },
            },
          },
          400: {
            description: 'Erro de validação, papel inválido ou email já cadastrado.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Autenticar usuário',
        description: 'Valida email e senha e retorna um cookie httpOnly (`auth_token`) com o JWT da sessão. Restrito a contas `teacher`/`admin`; leitura de posts não exige login.',
        tags: ['Autenticação'],
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'carlos@escola.com' },
                  password: { type: 'string', format: 'password', example: 'SenhaForte123' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Autenticado com sucesso.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
              },
            },
          },
          401: {
            description: 'Email ou senha inválidos.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/auth/logout': {
      post: {
        summary: 'Encerrar sessão',
        description: 'Remove o cookie de autenticação.',
        tags: ['Autenticação'],
        responses: {
          204: { description: 'Sessão encerrada.' },
        },
      },
    },
    '/auth/me': {
      get: {
        summary: 'Obter usuário autenticado',
        description: 'Retorna os dados do usuário autenticado com base no cookie/token atual.',
        tags: ['Autenticação'],
        responses: {
          200: {
            description: 'Usuário autenticado.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
              },
            },
          },
          401: { description: 'Não autenticado.' },
        },
      },
    },
    '/auth/password': {
      put: {
        summary: 'Trocar a própria senha',
        description: 'Permite ao usuário autenticado trocar sua senha, informando a senha atual.',
        tags: ['Autenticação'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['currentPassword', 'newPassword'],
                properties: {
                  currentPassword: { type: 'string', format: 'password', example: 'SenhaAtual123' },
                  newPassword: { type: 'string', format: 'password', example: 'NovaSenha456' },
                },
              },
            },
          },
        },
        responses: {
          204: { description: 'Senha alterada com sucesso.' },
          400: {
            description: 'Nova senha inválida (menor que 8 caracteres ou igual à atual).',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          401: {
            description: 'Não autenticado ou senha atual incorreta.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/users': {
      post: {
        summary: 'Criar um novo usuário',
        description: 'Cria um usuário no sistema. Requer permissão `manage_users` (apenas admin).',
        tags: ['Usuários'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateUserInput' },
            },
          },
        },
        responses: {
          201: {
            description: 'Usuário criado com sucesso.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
              },
            },
          },
          400: {
            description: 'Erro de validação ou email já cadastrado.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          403: {
            description: 'Acesso negado (permissão insuficiente).',
          },
        },
      },
      get: {
        summary: 'Listar usuários',
        description: 'Retorna a lista de todos os usuários. Requer permissão `manage_users` (apenas admin).',
        tags: ['Usuários'],
        responses: {
          200: {
            description: 'Lista obtida com sucesso.',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/User' },
                },
              },
            },
          },
          403: {
            description: 'Acesso negado.',
          },
        },
      },
    },
    '/posts': {
      post: {
        summary: 'Criar um novo post',
        description: 'Permite criar um post. Requer permissão `create_post` (admin e teacher). O autor é resolvido de forma automática com base no `x-user-id` se não for fornecido.',
        tags: ['Postagens'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreatePostInput' },
            },
          },
        },
        responses: {
          201: {
            description: 'Post criado com sucesso.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Post' },
              },
            },
          },
          400: {
            description: 'Erro de validação.',
          },
          403: {
            description: 'Acesso negado.',
          },
        },
      },
      get: {
        summary: 'Listar posts',
        description: 'Retorna a lista de todos os posts, de todos os professores. Endpoint público, não exige login.',
        tags: ['Postagens'],
        security: [],
        responses: {
          200: {
            description: 'Lista obtida com sucesso.',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Post' },
                },
              },
            },
          },
          403: {
            description: 'Acesso negado.',
          },
        },
      },
    },
    '/posts/search': {
      get: {
        summary: 'Buscar posts por palavra-chave',
        description: 'Busca posts cujo título ou conteúdo correspondam ao termo de busca, entre todos os posts de todos os professores. Endpoint público, não exige login.',
        tags: ['Postagens'],
        security: [],
        parameters: [
          {
            name: 'q',
            in: 'query',
            required: true,
            description: 'Termo de busca',
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Busca concluída com sucesso.',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Post' },
                },
              },
            },
          },
          403: {
            description: 'Acesso negado.',
          },
        },
      },
    },
    '/posts/{id}': {
      get: {
        summary: 'Obter postagem por ID',
        description: 'Retorna os detalhes de uma postagem específica. Endpoint público, não exige login.',
        tags: ['Postagens'],
        security: [],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID da postagem',
            schema: { type: 'integer' },
          },
        ],
        responses: {
          200: {
            description: 'Post obtido com sucesso.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Post' },
              },
            },
          },
          404: {
            description: 'Postagem não encontrada.',
          },
        },
      },
      put: {
        summary: 'Atualizar postagem por ID',
        description: 'Atualiza o título, conteúdo ou URL do post. Professores só podem editar seus próprios posts.',
        tags: ['Postagens'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID da postagem',
            schema: { type: 'integer' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdatePostInput' },
            },
          },
        },
        responses: {
          200: {
            description: 'Postagem atualizada com sucesso.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Post' },
              },
            },
          },
          400: {
            description: 'Erro de validação.',
          },
          403: {
            description: 'Acesso negado.',
          },
          404: {
            description: 'Postagem não encontrada.',
          },
        },
      },
      delete: {
        summary: 'Excluir postagem por ID',
        description: 'Exclui a postagem do sistema. Professores só podem excluir suas próprias postagens.',
        tags: ['Postagens'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID da postagem',
            schema: { type: 'integer' },
          },
        ],
        responses: {
          204: {
            description: 'Postagem excluída com sucesso (sem conteúdo de retorno).',
          },
          403: {
            description: 'Acesso negado.',
          },
          404: {
            description: 'Postagem não encontrada.',
          },
        },
      },
    },
  },
};
