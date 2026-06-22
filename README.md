# Fintech Expenses Challenge API

API do desafio técnico em NestJS para gestão financeira corporativa.

## Objetivo

Construir uma base de backend limpa, modular e pronta para evoluir com:

- autenticação com JWT;
- categorias por usuário;
- transações financeiras com filtros e paginação;
- dashboard com consolidação de dados;
- PostgreSQL com Prisma 7.

## Decisões de projeto

- Usei NestJS com módulos por responsabilidade para manter o código fácil de crescer.
- O Prisma foi configurado com o fluxo atual do Prisma 7 para SQL, usando `prisma.config.ts`.
- O client do Prisma é gerado em `generated/prisma` e não fica versionado.
- O banco local roda em Docker Compose para padronizar a execução do projeto.
- O `PrismaModule` foi deixado global para reduzir repetição de imports nos módulos de domínio.
- A conexão com o banco usa `PrismaPg` com pool e timeouts configurados para evitar conexões abertas sem necessidade e deixar o comportamento mais previsível.
- Esses valores podem ser ajustados via `PRISMA_POOL_MAX`, `PRISMA_CONNECTION_TIMEOUT_MS` e `PRISMA_IDLE_TIMEOUT_MS` no `.env`.
- A autenticação utiliza JWT stateless com expiração configurável por variável de ambiente. Refresh tokens não foram implementados por não fazerem parte do escopo do MVP e para evitar complexidade desnecessária no desafio. Em um ambiente produtivo, a evolução natural seria adotar refresh tokens com rotação, armazenamento seguro e revogação.
- A API fica protegida por padrão via guard global de JWT. Apenas endpoints marcados com `@Public()` ficam acessíveis sem token, o que reduz o risco de deixar rotas abertas por esquecimento.
- Foi aplicado rate limit global e um limite mais restritivo nas rotas sensíveis de autenticação para reduzir risco de brute force sem adicionar complexidade indevida ao MVP.
- A resposta pública de `users` usa uma entity simples, apenas como contrato de saída da API, e não uma entity rica com regras de domínio.
- Eu prefiro usar o Prisma como camada de persistência e conveniência de acesso aos recursos do banco, mas sem acoplar toda a aplicação diretamente ao modelo gerado. Em projetos maiores isso ajuda a reduzir impacto quando a estrutura do banco muda ou quando há falhas/ajustes no client.
- Para valores monetários das transações, a aplicação usa `Prisma.Decimal`, que expõe a implementação baseada em `decimal.js` no runtime do Prisma. Isso evita usar `number` para dinheiro e reduz risco de erro de precisão em operações como soma, comparação, arredondamento e consolidação do dashboard.
- Para este desafio eu também mantive a API sem Swagger e sem Scalar, porque o foco é resolver o escopo da entrevista com menos superfície operacional.

## Big.js vs BigNumber.js vs Decimal.js

As três bibliotecas resolvem problemas parecidos, mas com focos ligeiramente diferentes:

- `big.js` é menor e costuma ser uma boa escolha quando a necessidade é aritmética decimal enxuta.
- `bignumber.js` é forte quando o projeto precisa lidar com números muito grandes, formatos variados e uma API mais ampla para manipulação numérica genérica.
- `decimal.js` oferece uma superfície mais completa para operações decimais compostas, arredondamento configurável e cenários financeiros em que previsibilidade importa mais do que simplicidade extrema.

Neste backend a escolha foi usar `decimal.js` via `Prisma.Decimal`, porque o domínio de transações e dashboard exige precisão monetária consistente sem converter dinheiro para `number` comum do JavaScript.

## Class Validator vs Zod

Neste desafio eu segui com `class-validator` e `class-transformer` porque o enunciado pede esse padrão e os DTOs já mostram mensagens de validação mais claras.

Pontos relevantes da comparação:

- `class-validator` exige DTO + decorators, então a estrutura acaba aparecendo duas vezes.
- Em NestJS, ele funciona muito bem com Swagger e com a abordagem tradicional de DTOs.
- `zod` costuma ser mais direto porque validação e tipagem vivem na mesma estrutura.
- Isso reduz risco de inconsistência entre tipo e regra de validação.
- `zod` também lida melhor com coerção de `string` para `number` e `Date`, o que ajuda bastante em APIs.
- Para este desafio, a escolha foi seguir o requisito; em projetos próprios, eu geralmente prefiro `zod` no backend.

## Repository Pattern

Neste desafio eu não vou usar Repository Pattern, porque a ideia é manter a solução mais direta e sem complexidade desnecessária.

Na minha visão, o Repository Pattern faz mais sentido quando:

- o sistema real já tem mais módulos e queries começando a crescer;
- existe necessidade de padronizar acesso ao banco em mais de uma camada;
- a equipe quer centralizar mudanças de persistência e manter um contrato mais estável.

Em plataformas reais de médio porte, eu costumo usar em alguns módulos por organização e consistência de alterações de banco.
Mas em testes técnicos e aplicações menores, normalmente prefiro acessar o banco direto na camada de `service` ou `usecase`, porque isso reduz custo inicial e deixa o fluxo mais fácil de ler.

## Estrutura inicial

- `src/prisma` - integração com Prisma e conexão com o banco.
- `src/auth` - autenticação JWT, login, cadastro e `/auth/me`.
- `src/categories` - CRUD de categorias por usuário.
- `src/transactions` - CRUD de transações com filtros, paginação e validação monetária.
- `prisma/schema.prisma` - schema do banco e geração do client.
- `docker-compose.yml` - PostgreSQL local.

## Segurança aplicada

Um hardening importante neste backend foi simular e aplicar uma correção famosa e comum de encontrar em diversas aplicaçoes correção de um caso clássico de IDOR em rotas de usuário.

Antes, o fluxo aceitava `GET /users/:id`, `PATCH /users/:id` e `DELETE /users/:id` apenas com autenticação JWT. Isso é um problema real e comum: mesmo com token válido, o cliente não deve escolher qual usuário será lido, alterado ou removido quando a regra de negócio é self-service.

A correção aplicada foi:

- remover a dependência de `:id` vindo da URL para operações da própria conta;
- expor apenas `GET /users/me`, `PATCH /users/me` e `DELETE /users/me`;
- usar o `request.user.id` resolvido pelo token no guard como fonte única da identidade autenticada;
- cobrir a regressão com teste e2e simulando um usuário tentando operar sobre outra conta.

Esse tipo de ajuste evidencia uma correção real de autorização: autenticação sozinha não garante que o usuário autenticado tenha permissão para agir sobre qualquer recurso identificado pelo cliente.

## Pré-requisitos

- Node.js 24 LTS.
- pnpm 11.8.0 via Corepack.
- Docker e Docker Compose.

## Versões do ambiente

O repositório já vem com travas locais para facilitar a troca de versão:

- `.tool-versions` fixa o Node.js em `24.16.0` neste projeto.
- `package.json` declara `packageManager: "pnpm@11.8.0"`.
- `.tool-versions` também fixa o `pnpm` em `11.8.0` via `asdf`.
- `.npmrc` força o `pnpm` a respeitar essa versão no install.

### Como trocar com segurança

```bash
asdf install nodejs 24.16.0
asdf install pnpm 11.8.0
asdf local nodejs 24.16.0
asdf local pnpm 11.8.0
```

Se o `pnpm` ainda não estiver disponível no `asdf`, instale o plugin antes:

```bash
asdf plugin add pnpm
```

## Como rodar

1. Instale as dependências:

```bash
pnpm install
```

2. Crie o arquivo de ambiente:

```bash
cp .env.example .env
```

3. Suba o banco:

```bash
pnpm db:up
```

4. Gere o Prisma Client:

```bash
pnpm prisma:generate
```

5. Rode as migrations quando os models estiverem definidos:

```bash
pnpm prisma:migrate
```

6. Inicie a API:

```bash
pnpm start:dev
```

## Scripts úteis

- `pnpm db:up` - sobe o PostgreSQL local.
- `pnpm db:down` - derruba o PostgreSQL local.
- `pnpm prisma:generate` - gera o Prisma Client.
- `pnpm prisma:migrate` - cria/aplica migrations.
- `pnpm prisma:studio` - abre o Prisma Studio.

## Banco de dados

O projeto usa o schema em `prisma/schema.prisma` com provider `postgresql`.
A URL de conexão fica em `DATABASE_URL` dentro de `.env`.
Se precisar tunar o pool de conexões, também use:

- `PRISMA_POOL_MAX`
- `PRISMA_CONNECTION_TIMEOUT_MS`
- `PRISMA_IDLE_TIMEOUT_MS`

Para permitir o frontend autenticado local ou em deploy, configure também:

- `FRONTEND_URL`

## Bootstrap automatico no start

Quando a API sobe, ela verifica se o usuario `demo@fintech.local` ja existe.

- se nao existir, cria o usuario demo, as categorias e as 300 movimentacoes automaticamente antes de seguir o start;
- se ja existir, apenas continua a inicializacao da aplicacao sem recriar a massa;
- isso acontece tanto em desenvolvimento quanto em producao.

### Credenciais do usuario demo

- E-mail: `demo@fintech.local`
- Senha: `Demo@123456`

## Próximos passos

- implementar os endpoints de dashboard com agregações no backend;
- escrever os testes mínimos exigidos no desafio;
- documentar no README os fluxos completos de uso com exemplos de requisição.
