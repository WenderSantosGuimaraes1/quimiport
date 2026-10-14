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

O projeto pode ser executado de duas formas:

- [**Localmente**](#rodando-localmente): a API roda direto na máquina, com recarregamento automático a cada alteração no código. Indicado para desenvolvimento.
- [**Via Docker**](#rodando-via-docker): a API e o banco de dados rodam em containers, sem precisar instalar Node.js nem PostgreSQL.

Em ambos os casos, a API fica disponível em http://localhost:3000.

### Rodando localmente

#### Pré-requisitos

- [Node.js](https://nodejs.org/) 22 ou superior;
- Um PostgreSQL 17 acessível em `localhost:5432`. Pode ser uma instalação local ou o banco do Docker (veja o passo 3).

#### Passo a passo

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Crie um arquivo `.env` na raiz do projeto com o conteúdo abaixo:

   ```env
   NODE_ENV=development
   PORT=3000

   POSTGRES_USER=quimiport
   POSTGRES_PASSWORD=quimiport
   POSTGRES_DB=quimiport
   DATABASE_URL=postgresql://quimiport:quimiport@localhost:5432/quimiport?schema=public
   ```

3. Suba o banco de dados. A forma mais simples é subir apenas o container do banco:

   ```bash
   docker compose up -d db
   ```

   Se preferir usar um PostgreSQL instalado na máquina, crie o usuário e o banco `quimiport` e execute o script [database/schema.sql](./database/schema.sql):

   ```bash
   psql -U quimiport -d quimiport -f database/schema.sql
   ```

4. Inicie a API em modo de desenvolvimento:

   ```bash
   npm run start:dev
   ```

#### Verificação

```bash
# Deve responder {"status":"ok"}
curl http://localhost:3000/health
```

#### Scripts disponíveis

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

### Rodando via Docker

#### Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e em execução. No Windows, é necessário o backend WSL 2.

Não é necessário criar o arquivo `.env`: o Docker Compose já define valores padrão para as variáveis de ambiente.

#### Passo a passo

1. Na raiz do projeto, construa as imagens e suba os containers:

   ```bash
   docker compose up -d --build
   ```

   Atalho equivalente, se o Node.js estiver instalado: `npm run docker:up`.

2. Aguarde os containers iniciarem. A API só sobe depois que o banco estiver pronto para receber conexões.

Serviços disponíveis:

| Serviço | Container | Endereço |
| --- | --- | --- |
| API | `quimiport-api` | http://localhost:3000 |
| PostgreSQL | `quimiport-db` | `localhost:5432` (usuário, senha e banco: `quimiport`) |

Na primeira inicialização, as tabelas do banco são criadas a partir do script [database/schema.sql](./database/schema.sql).

#### Verificação

```bash
# Status dos containers: ambos devem aparecer como "healthy"
docker compose ps

# API: deve responder {"status":"ok"}
curl http://localhost:3000/health

# Banco: deve listar as tabelas criadas pelo schema.sql
docker exec quimiport-db psql -U quimiport -c "\dt"
```

#### Comandos úteis

| Comando | Atalho npm | Descrição |
| --- | --- | --- |
| `docker compose logs -f` | `npm run docker:logs` | Acompanha os logs dos containers |
| `docker compose down` | `npm run docker:down` | Para e remove os containers. Os dados do banco são mantidos |
| `docker compose down -v` | — | Para os containers e apaga os dados do banco |
| `docker compose down -v && docker compose up -d --build` | `npm run docker:reset` | Recria o banco do zero. Necessário após alterar o `schema.sql`, que só é executado com o banco vazio |

## Integrantes do grupo

- Gabriel Marques Silva - RM374482
- Ionara Ferreira de Lima - RM374697
- Matheus Felipe Santos Pereira - RM376292
- Wender Santos Guimarães - RM374718
