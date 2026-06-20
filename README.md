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
- `prisma/schema.prisma` - schema do banco e geração do client.
- `docker-compose.yml` - PostgreSQL local.

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

## Próximos passos

- criar os models de `User`, `Category` e `Transaction`;
- montar os módulos de domínio do NestJS;
- adicionar DTOs, validações e autenticação JWT;
- criar migrations iniciais;
- escrever os testes mínimos exigidos no desafio.
