# Quimiport

Repositório destinado à entrega do Tech Challenge do curso de pós-graduação em Desenvolvimento Fullstack, e evolução da solução nas próximas fases.

## Sumário

1. [Contexto do problema](./docs/01-dominio-e-problema.md)
2. [Usuários do sistema](./docs/02-linguagem-ubiqua.md)
3. [Linguagem ubíqua](./docs/03-modelo-de-dominio.md)
4. [Entidades e Value Objects (DDD)](./04-docs/casos-de-uso.md)
5. [Casos de uso (BDD)](./docs/05-regras-de-negocio.md)
6. [Regras de negócio](./docs/06-arquitetura-e-adrs.md)
7. [Requisitos não funcionais](./docs/07-plano-de-qualidade.md)

## Tecnologias utilizadas

| Categoria | Tecnologia |
| --- | --- |
| Linguagem | [TypeScript](https://www.typescriptlang.org/) 5 |
| Runtime | [Node.js](https://nodejs.org/) 22 |
| Framework HTTP | [Express](https://expressjs.com/) 5 |
| Banco de dados | [PostgreSQL](https://www.postgresql.org/) 17 |
| ORM | [Prisma](https://www.prisma.io/) 6 (configurado, ainda sem modelos) |
| Containers | [Docker](https://www.docker.com/) e Docker Compose |
| Testes | [Jest](https://jestjs.io/) e [Supertest](https://github.com/ladjs/supertest) |
| Qualidade de código | [ESLint](https://eslint.org/) e [Prettier](https://prettier.io/) |
| Execução em desenvolvimento | [tsx](https://tsx.is/) |

A aplicação segue a **Arquitetura Hexagonal (Ports and Adapters)**. As decisões arquiteturais estão registradas em [Arquitetura e ADRs](./docs/06-arquitetura-e-adrs.md).

## Como rodar o projeto

### Com Docker (recomendado)

Sobe o banco de dados e a API em containers. Não é necessário ter Node.js nem PostgreSQL instalados.

**Pré-requisito:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e em execução (no Windows, com o backend WSL 2).

```bash
npm run docker:up
```

Se não tiver o Node.js instalado, use diretamente `docker compose up -d --build`.

Serviços disponíveis:

| Serviço | Endereço |
| --- | --- |
| API | http://localhost:3000 |
| PostgreSQL | `localhost:5432` (usuário, senha e banco: `quimiport`) |

Na primeira inicialização, o banco é criado a partir do script [database/schema.sql](./database/schema.sql).

Para verificar se tudo está funcionando:

```bash
# API: deve responder {"status":"ok"}
curl http://localhost:3000/health

# Banco: deve listar as tabelas criadas pelo schema.sql
docker exec quimiport-db psql -U quimiport -c "\dt"
```

Outros comandos:

| Comando | Descrição |
| --- | --- |
| `npm run docker:logs` | Acompanha os logs dos containers |
| `npm run docker:down` | Para e remove os containers (os dados do banco são mantidos) |
| `npm run docker:reset` | Apaga os dados do banco e sobe tudo novamente. Necessário após alterar o `schema.sql`, que só é executado com o banco vazio |

### Localmente (desenvolvimento)

Executa a API na máquina, com recarregamento automático a cada alteração no código.

**Pré-requisitos:** Node.js 22 ou superior e um PostgreSQL acessível. É possível usar o banco do Docker subindo apenas ele: `docker compose up -d db`.

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Crie um arquivo `.env` na raiz do projeto:

   ```env
   NODE_ENV=development
   PORT=3000

   POSTGRES_USER=quimiport
   POSTGRES_PASSWORD=quimiport
   POSTGRES_DB=quimiport
   DATABASE_URL=postgresql://quimiport:quimiport@localhost:5432/quimiport?schema=public
   ```

3. Inicie a API:

   ```bash
   npm run start:dev
   ```

### Scripts disponíveis

| Comando | Descrição |
| --- | --- |
| `npm run start:dev` | Inicia a API em modo de desenvolvimento, com recarregamento automático |
| `npm run build` | Compila o projeto para a pasta `dist/` |
| `npm start` | Executa a versão compilada |
| `npm test` | Executa os testes unitários |
| `npm run test:e2e` | Executa os testes end-to-end |
| `npm run test:cov` | Executa os testes com relatório de cobertura |
| `npm run lint` | Analisa e corrige o código com ESLint |
| `npm run format` | Formata o código com Prettier |

## Integrantes do grupo

- Gabriel Marques Silva - RM374482
- Ionara Ferreira de Lima - RM374697
- Matheus Felipe Santos Pereira - RM376292
- Wender Santos Guimarães - RM374718
