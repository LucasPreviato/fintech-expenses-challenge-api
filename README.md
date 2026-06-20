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
- O `pnpm` deve ser ativado via Corepack para respeitar essa versão.

### Como trocar com segurança

```bash
asdf install nodejs 24.16.0
asdf local nodejs 24.16.0
corepack prepare pnpm@11.8.0 --activate
```

Se o `pnpm` já estiver em cache e falhar na primeira execução, crie o diretório:

```bash
mkdir -p ~/.local/share/pnpm/.tools/pnpm
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

## Próximos passos

- criar os models de `User`, `Category` e `Transaction`;
- montar os módulos de domínio do NestJS;
- adicionar DTOs, validações e autenticação JWT;
- criar migrations iniciais;
- escrever os testes mínimos exigidos no desafio.
