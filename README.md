# Fintech Expenses Challenge API

API do desafio técnico **NestJS + React** para gestão financeira corporativa.

O backend entrega autenticação JWT, categorias por usuário, transações financeiras com filtros/paginação e dashboard calculado pela API.

## Objetivo

Construir uma API limpa, modular e funcional para o MVP do desafio, priorizando:

- TypeScript em modo strict;
- organização por módulos de responsabilidade clara;
- DTOs com validação usando `class-validator` e `class-transformer`;
- autenticação JWT com rotas protegidas;
- isolamento de dados por usuário autenticado;
- PostgreSQL com Prisma;
- respostas e erros consistentes para integração com o frontend.

## Stack

- NestJS 11
- TypeScript
- Prisma 7
- PostgreSQL
- JWT
- Passport
- Bcrypt
- Helmet
- Nest Throttler
- Swagger/OpenAPI
- Jest + Supertest
- Docker Compose para banco local

## Decisões técnicas

### Arquitetura modular

A API foi organizada por módulos, mantendo cada contexto com responsabilidade clara:

- `src/auth` - login, registro, estratégia JWT e endpoint `/auth/me`.
- `src/users` - operações da própria conta autenticada.
- `src/categories` - CRUD de categorias pertencentes ao usuário autenticado.
- `src/transactions` - CRUD, filtros, paginação e validação monetária de transações.
- `src/dashboard` - consolidação dos indicadores financeiros calculados no backend.
- `src/prisma` - integração com Prisma e conexão com o banco.

A proposta foi evitar over-engineering. Por isso, não foram usados DDD pesado, microsserviços, CQRS, filas ou Repository Pattern genérico. Para o tamanho do desafio, services com Prisma deixam o fluxo mais direto, legível e fácil de avaliar.

### Prisma 7 e PostgreSQL

O Prisma foi configurado com o fluxo atual do Prisma 7 para SQL, usando `prisma.config.ts`.

O client é gerado em `generated/prisma` e não fica versionado. Isso evita acoplar o repositório a artefatos gerados e mantém o build mais previsível.

A conexão usa `PrismaPg` com pool e timeouts configuráveis:

- `PRISMA_POOL_MAX`
- `PRISMA_CONNECTION_TIMEOUT_MS`
- `PRISMA_IDLE_TIMEOUT_MS`

### Autenticação JWT

A autenticação utiliza JWT stateless com expiração configurável via `JWT_EXPIRES_IN`.

Refresh token não foi implementado porque não faz parte do escopo do MVP e adicionaria complexidade desnecessária para o desafio. Em um ambiente produtivo, a evolução natural seria refresh token com rotação, revogação e armazenamento mais seguro.

A API usa guard global de JWT. Apenas endpoints marcados com `@Public()` ficam acessíveis sem token. Essa decisão reduz o risco operacional de expor uma rota por esquecimento.

### Segurança aplicada

Foi corrigido um problema real de autorização do tipo **IDOR**.

Antes, as operações de usuário dependiam de IDs enviados pelo cliente em rotas como:

```http
GET /users/:id
PATCH /users/:id
DELETE /users/:id
```

Esse fluxo é perigoso porque autenticação não significa autorização sobre qualquer recurso informado na URL.

A correção aplicada foi:

- remover rotas de usuário baseadas em `:id` para self-service;
- expor apenas operações como `/users/me`;
- usar `request.user.id`, extraído do token JWT, como fonte única da identidade autenticada;
- cobrir o cenário com teste e2e de acesso cruzado entre usuários.

Esse é o principal ponto de segurança do desafio: cada usuário deve acessar apenas seus próprios dados.

### Validação de entrada

A API usa `ValidationPipe` global com:

```ts
transform: true
whitelist: true
forbidNonWhitelisted: true
```

Com isso, os DTOs definem o contrato aceito pela API, transformam query params quando necessário e bloqueiam campos extras enviados pelo cliente.

### Valores monetários

Para dinheiro, a aplicação usa `Prisma.Decimal`, baseado em `decimal.js` no runtime do Prisma.

Essa decisão evita usar `number` comum do JavaScript em cálculos financeiros e reduz risco de erro de precisão em operações como soma, comparação, saldo e dashboard.

### Rate limit e Helmet

Foi aplicado `helmet` para headers básicos de segurança e `@nestjs/throttler` para rate limit global, com atenção maior para rotas sensíveis de autenticação.

Isso adiciona uma camada de hardening sem transformar o MVP em uma arquitetura exagerada.

### Swagger/OpenAPI

A API expõe documentação em:

```txt
/docs
```

O Swagger foi mantido ativo para facilitar a avaliação técnica, testes manuais e integração com o frontend.

Em produção real, a recomendação seria proteger a documentação por variável de ambiente, autenticação simples ou restrição de rede.

## Decisões de MVP e trade-offs de avaliação

Durante a revisão de segurança, alguns pontos foram mantidos de forma intencional por causa do contexto do desafio técnico.

### 1. Docker Compose com credenciais locais

O `docker-compose.yml` usa credenciais simples para o PostgreSQL local.

Essa decisão existe para facilitar a execução do avaliador com poucos comandos. O compose não deve ser tratado como manifesto de produção.

Em produção, o banco deve ser gerenciado pela plataforma de deploy ou por serviço dedicado, com credenciais fortes em variáveis de ambiente.

### 2. Usuário demo com seed automático

A aplicação cria um usuário demo e uma massa inicial de dados para facilitar a validação do desafio.

Credenciais:

- E-mail: `demo@fintech.local`
- Senha: `Demo@123456`

Essa decisão reduz fricção para o avaliador testar dashboard, categorias, transações, filtros e paginação rapidamente.

Em produção real, esse seed deveria ser condicionado por variável de ambiente ou removido.

### 3. JWT armazenado no frontend

O frontend pode persistir o JWT em storage do navegador por simplicidade do MVP.

Essa decisão é aceitável para o desafio desde que o token tenha expiração curta e o frontend trate `401` de forma centralizada.

Em produção real, a evolução recomendada seria avaliar cookie `HttpOnly`, `Secure` e `SameSite`, considerando também CSRF, CORS e fluxo de refresh token.

### 4. Paginação por page/limit

A API usa paginação simples por `page` e `limit`, suficiente para o volume e escopo do desafio.

Para produção com volume alto, seria possível evoluir para cursor pagination ou impor limites mais rígidos de profundidade para evitar offsets caros.

### 5. Swagger público no ambiente de avaliação

O Swagger fica público para facilitar inspeção dos contratos da API.

Para ambiente produtivo, a documentação deveria ser controlada por variável de ambiente, autenticação ou restrição de rede.

## Endpoints principais

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

### Users

- `GET /users/me`
- `PATCH /users/me`
- `DELETE /users/me`

### Categories

- `POST /categories`
- `GET /categories`
- `GET /categories/:id`
- `PATCH /categories/:id`
- `DELETE /categories/:id`

### Transactions

- `POST /transactions`
- `GET /transactions`
- `GET /transactions/:id`
- `PATCH /transactions/:id`
- `DELETE /transactions/:id`

Filtros esperados na listagem:

- `type`
- `categoryId`
- `startDate`
- `endDate`
- `page`
- `limit`

### Dashboard

- `GET /dashboard`

O dashboard é calculado no backend, não no frontend.

## Pré-requisitos

- Node.js `24.16.0`
- pnpm `11.8.0`
- Docker e Docker Compose
- PostgreSQL, caso não use Docker local

O projeto contém travas de versão para reduzir inconsistência de ambiente:

- `.tool-versions`
- `.npmrc`
- `packageManager` no `package.json`

## Variáveis de ambiente

Crie o arquivo `.env` a partir do exemplo:

```bash
cp .env.example .env
```

Variáveis principais:

```env
POSTGRES_USER=fintech
POSTGRES_PASSWORD=fintech
POSTGRES_DB=fintech_expenses
POSTGRES_PORT=5433

DATABASE_URL="postgresql://fintech:fintech@localhost:5433/fintech_expenses?schema=public"
JWT_SECRET="change-me-to-a-long-random-secret"
JWT_EXPIRES_IN=15m

FRONTEND_URL="http://localhost:5173"

PRISMA_POOL_MAX=10
PRISMA_CONNECTION_TIMEOUT_MS=5000
PRISMA_IDLE_TIMEOUT_MS=300000
```

`FRONTEND_URL` aceita múltiplas origens separadas por vírgula. Isso permite liberar o frontend local e o deploy público ao mesmo tempo.

Exemplo:

```env
FRONTEND_URL="http://localhost:5173,https://seu-front.vercel.app"
```

## Como rodar localmente

Instale as dependências:

```bash
pnpm install
```

Suba o banco local:

```bash
pnpm db:up
```

Gere o Prisma Client:

```bash
pnpm prisma:generate
```

Rode as migrations:

```bash
pnpm prisma:migrate
```

Inicie a API em modo desenvolvimento:

```bash
pnpm start:dev
```

A API ficará disponível em:

```txt
http://localhost:3333
```

A documentação Swagger ficará disponível em:

```txt
http://localhost:3333/docs
```

## Scripts úteis

| Script | Descrição |
| --- | --- |
| `pnpm start:dev` | Inicia a API em modo watch. |
| `pnpm build` | Gera o build da aplicação. |
| `pnpm start:prod` | Executa o build em modo produção. |
| `pnpm db:up` | Sobe o PostgreSQL local. |
| `pnpm db:down` | Derruba o PostgreSQL local. |
| `pnpm prisma:generate` | Gera o Prisma Client. |
| `pnpm prisma:migrate` | Executa migrations em desenvolvimento. |
| `pnpm prisma:studio` | Abre o Prisma Studio. |
| `pnpm test` | Executa testes unitários. |
| `pnpm test:e2e` | Executa testes e2e. |
| `pnpm test:cov` | Executa testes com cobertura. |

## Testes

O desafio pede pelo menos 5 testes automatizados significativos. A prioridade deste backend é cobrir fluxos que validam regra de negócio e segurança.

Cenários relevantes:

- login com credenciais válidas;
- login inválido;
- usuário autenticado não acessa dados de outro usuário;
- criação de categoria válida;
- criação de transação válida;
- criação de transação com categoria inexistente ou pertencente a outro usuário;
- filtros e paginação de transações;
- dashboard calculado corretamente pela API.

Para executar:

```bash
pnpm test
pnpm test:e2e
```

## Deploy

A API pode ser publicada em Render, Railway, Fly.io ou plataforma equivalente.

Checklist mínimo para deploy:

- configurar `DATABASE_URL` do PostgreSQL de produção;
- configurar `JWT_SECRET` forte;
- configurar `JWT_EXPIRES_IN`;
- configurar `FRONTEND_URL` com a URL pública do frontend;
- rodar migrations no ambiente de produção;
- validar `/docs`, `/auth/login`, `/auth/me`, listagem de transações e dashboard.

## Usuário demo

Ao iniciar, a aplicação verifica se o usuário `demo@fintech.local` existe.

Se não existir, cria automaticamente:

- usuário demo;
- categorias iniciais;
- massa de transações para teste do dashboard, filtros e paginação.

Credenciais:

```txt
E-mail: demo@fintech.local
Senha: Demo@123456
```

Esse comportamento foi mantido para facilitar a avaliação do desafio.

## Checklist antes da entrega

- [ ] API sobe localmente sem erro.
- [ ] Migrations executam corretamente.
- [ ] Swagger abre em `/docs`.
- [ ] Registro de usuário funciona.
- [ ] Login retorna JWT.
- [ ] `/auth/me` retorna o usuário autenticado.
- [ ] Usuário A não acessa dados do usuário B.
- [ ] Categorias são isoladas por usuário.
- [ ] Transações são isoladas por usuário.
- [ ] Filtros de transações funcionam.
- [ ] Paginação funciona.
- [ ] Dashboard é calculado no backend.
- [ ] Testes principais passam.
- [ ] README contém decisões técnicas, instruções locais, variáveis e credenciais demo.
- [ ] Deploy público está acessível.
- [ ] `FRONTEND_URL` contém a URL correta do frontend.

## Observações finais

A solução prioriza uma entrega sênior pragmática: modularidade, segurança básica, validação consistente e baixo custo de manutenção.

As decisões mantidas como trade-off existem para melhorar a experiência de avaliação do desafio, não para representar um desenho final de produção.
