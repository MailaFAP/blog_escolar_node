"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerDocument = void 0;
exports.swaggerDocument = {
    openapi: '3.0.0',
    info: {
        title: 'API Blog Escolar',
        version: '1.0.0',
        description: 'Documentação técnica interativa da API do Blog Escolar. Permite gerenciar usuários e postagens de aulas. A autenticação é baseada em Headers customizados (`x-user-id` e `x-user-role`).',
    },
    servers: [
        {
            url: 'http://localhost:3000',
            description: 'Servidor Local (Docker/Desenvolvimento)',
        },
    ],
    security: [
        {
            UserIdHeader: [],
            UserRoleHeader: [],
        },
    ],
    components: {
        securitySchemes: {
            UserIdHeader: {
                type: 'apiKey',
                in: 'header',
                name: 'x-user-id',
                description: 'ID do Usuário no banco (ex: 1, 2)',
            },
            UserRoleHeader: {
                type: 'apiKey',
                in: 'header',
                name: 'x-user-role',
                description: 'Cargo do usuário (admin, teacher, student)',
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
                required: ['name', 'email', 'role'],
                properties: {
                    name: { type: 'string', example: 'Prof. Carlos' },
                    email: { type: 'string', example: 'carlos@escola.com' },
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
                description: 'Retorna uma lista de posts. Se o usuário for um professor (`teacher`), retorna apenas os posts criados por ele. Se for admin, retorna todos. Alunos (`student`) não têm permissão para listar todos.',
                tags: ['Postagens'],
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
                description: 'Busca posts cujo título ou conteúdo correspondam ao termo de busca. Professores buscam apenas em seus próprios posts. Alunos não têm permissão para buscar.',
                tags: ['Postagens'],
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
                description: 'Retorna os detalhes de uma postagem específica. Acessível a todas as roles (admin, teacher, student).',
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
