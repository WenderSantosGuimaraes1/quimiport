-- =====================================================================
-- Limpeza (ordem reversa de dependência)
-- =====================================================================
DROP TABLE IF EXISTS historico_carga   CASCADE;
DROP TABLE IF EXISTS inspecoes         CASCADE;
DROP TABLE IF EXISTS documentos_carga  CASCADE;
DROP TABLE IF EXISTS cargas_quimicas   CASCADE;
DROP TABLE IF EXISTS produtos_quimicos CASCADE;
DROP TABLE IF EXISTS usuarios          CASCADE;
DROP FUNCTION IF EXISTS historico_carga_somente_insercao();
DROP TYPE IF EXISTS tipo_evento, resultado_inspecao, status_documento, status_carga,
                    unidade_medida, estado_fisico, grupo_compatibilidade, classe_risco,
                    status_produto, cargo_profissional, status_usuario;

-- =====================================================================
-- Tipos enumerados
-- =====================================================================
CREATE TYPE status_usuario AS ENUM ('ATIVO', 'INATIVO');

CREATE TYPE cargo_profissional AS ENUM (
  'OPERADOR', 'INSPETOR', 'RESPONSAVEL_TECNICO', 'GESTOR', 'ADMINISTRADOR'
);

CREATE TYPE status_produto AS ENUM ('ATIVO', 'INATIVO');

-- Classes de risco ONU (1 a 9)
CREATE TYPE classe_risco AS ENUM (
  'CLASSE_1', 'CLASSE_2', 'CLASSE_3', 'CLASSE_4', 'CLASSE_5',
  'CLASSE_6', 'CLASSE_7', 'CLASSE_8', 'CLASSE_9'
);

-- Grupo de classificação
CREATE TYPE grupo_compatibilidade AS ENUM (
  'EXPLOSIVOS',
  'GASES',
  'LIQUIDOS_INFLAMAVEIS',
  'SOLIDOS_INFLAMAVEIS',
  'OXIDANTES_PEROXIDOS_ORGANICOS',
  'TOXICOS_INFECTANTES',
  'RADIOATIVOS',
  'CORROSIVOS',
  'SUBSTANCIAS_PERIGOSAS_DIVERSAS'
);

CREATE TYPE estado_fisico AS ENUM ('SOLIDO', 'LIQUIDO', 'GASOSO');

CREATE TYPE unidade_medida AS ENUM ('KG', 'T', 'L', 'M3');

CREATE TYPE status_carga AS ENUM (
  'REGISTRADA', 'EM_ANALISE', 'EM_INSPECAO', 'LIBERADA',
  'BLOQUEADA', 'EM_MOVIMENTACAO', 'FINALIZADA', 'CANCELADA'
);

CREATE TYPE status_documento AS ENUM ('PENDENTE', 'VALIDO', 'INVALIDO', 'VENCIDO');

CREATE TYPE resultado_inspecao AS ENUM ('APROVADA', 'REPROVADA');

CREATE TYPE tipo_evento AS ENUM (
  'REGISTRO', 'MUDANCA_STATUS', 'DOCUMENTO_REGISTRADO', 'DOCUMENTACAO_VALIDADA',
  'INSPECAO_REGISTRADA', 'BLOQUEIO', 'LIBERACAO', 'CANCELAMENTO'
);

-- =====================================================================
-- usuarios
-- =====================================================================
CREATE TABLE usuarios (
  id                 UUID               PRIMARY KEY DEFAULT gen_random_uuid(),
  nome               VARCHAR(150)       NOT NULL CHECK (btrim(nome) <> ''),
  status             status_usuario     NOT NULL DEFAULT 'ATIVO',
  cargo_profissional cargo_profissional NOT NULL,
  data_nascimento    DATE               NOT NULL CHECK (data_nascimento < CURRENT_DATE),
  cpf                CHAR(11)           NOT NULL UNIQUE CHECK (cpf ~ '^[0-9]{11}$'),
  senha_hash         VARCHAR(255)       NOT NULL,
  created_at         TIMESTAMPTZ(3)     NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ(3)     NOT NULL DEFAULT now()
);

CREATE INDEX usuarios_status_idx ON usuarios (status);

-- =====================================================================
-- produtos_quimicos
-- =====================================================================
CREATE TABLE produtos_quimicos (
  id                    UUID                  PRIMARY KEY DEFAULT gen_random_uuid(),
  nome                  VARCHAR(150)          NOT NULL CHECK (btrim(nome) <> ''),
  descricao             TEXT,
  numero_onu            VARCHAR(10)           NOT NULL,
  classe_risco          classe_risco          NOT NULL,
  grupo_compatibilidade grupo_compatibilidade NOT NULL,
  estado_fisico         estado_fisico,
  status                status_produto        NOT NULL DEFAULT 'ATIVO',
  created_at            TIMESTAMPTZ(3)        NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ(3)        NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX produtos_quimicos_nome_ativo_uk
  ON produtos_quimicos (lower(btrim(nome)))
  WHERE status = 'ATIVO';

CREATE INDEX produtos_quimicos_status_idx ON produtos_quimicos (status);

-- =====================================================================
-- cargas_quimicas
-- =====================================================================
CREATE TABLE cargas_quimicas (
  id                     UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo                 VARCHAR(30)    NOT NULL UNIQUE CHECK (btrim(codigo) <> ''),
  produto_id             UUID           NOT NULL
                         REFERENCES produtos_quimicos (id)
                         ON DELETE RESTRICT ON UPDATE RESTRICT,

  -- Snapshot do produto no momento do registro
  produto_nome           VARCHAR(150)   NOT NULL,
  produto_numero_onu     VARCHAR(10)    NOT NULL,
  produto_classe_risco   classe_risco   NOT NULL,

  quantidade             NUMERIC(14,3)  NOT NULL CHECK (quantidade > 0),
  unidade_medida         unidade_medida NOT NULL,
  origem                 VARCHAR(150)   NOT NULL,
  destino                VARCHAR(150)   NOT NULL,
  responsavel_id         UUID           NOT NULL
                         REFERENCES usuarios (id)
                         ON DELETE RESTRICT ON UPDATE RESTRICT,
  status                 status_carga   NOT NULL DEFAULT 'REGISTRADA',
  documentacao_valida    BOOLEAN        NOT NULL DEFAULT false,
  inspecao_prevista_para DATE,
  data_entrada           TIMESTAMPTZ(3) NOT NULL,
  created_at             TIMESTAMPTZ(3) NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ(3) NOT NULL DEFAULT now()
);

CREATE INDEX cargas_quimicas_status_idx         ON cargas_quimicas (status);
CREATE INDEX cargas_quimicas_produto_id_idx     ON cargas_quimicas (produto_id);
CREATE INDEX cargas_quimicas_responsavel_id_idx ON cargas_quimicas (responsavel_id);

-- =====================================================================
-- documentos_carga
-- =====================================================================
CREATE TABLE documentos_carga (
  id             UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
  carga_id       UUID             NOT NULL
                 REFERENCES cargas_quimicas (id)
                 ON DELETE RESTRICT ON UPDATE RESTRICT,
  tipo_documento VARCHAR(100)     NOT NULL CHECK (btrim(tipo_documento) <> ''),
  status         status_documento NOT NULL DEFAULT 'PENDENTE',
  data_validade  DATE             NOT NULL,
  autor_id       UUID             NOT NULL
                 REFERENCES usuarios (id)
                 ON DELETE RESTRICT ON UPDATE RESTRICT,
  created_at     TIMESTAMPTZ(3)   NOT NULL DEFAULT now()
);

CREATE INDEX documentos_carga_carga_id_idx ON documentos_carga (carga_id);

-- =====================================================================
-- inspecoes
-- =====================================================================
CREATE TABLE inspecoes (
  id            UUID               PRIMARY KEY DEFAULT gen_random_uuid(),
  carga_id      UUID               NOT NULL
                REFERENCES cargas_quimicas (id)
                ON DELETE RESTRICT ON UPDATE RESTRICT,
  resultado     resultado_inspecao NOT NULL,
  motivo        TEXT,
  observacoes   TEXT,
  autor_id      UUID               NOT NULL
                REFERENCES usuarios (id)
                ON DELETE RESTRICT ON UPDATE RESTRICT,
  registrada_em TIMESTAMPTZ(3)     NOT NULL DEFAULT now(),
  CONSTRAINT inspecoes_motivo_reprovacao_ck
    CHECK (resultado <> 'REPROVADA' OR (motivo IS NOT NULL AND btrim(motivo) <> ''))
);

CREATE INDEX inspecoes_carga_id_registrada_em_idx ON inspecoes (carga_id, registrada_em DESC);
CREATE INDEX inspecoes_autor_id_idx               ON inspecoes (autor_id);

-- =====================================================================
-- historico_carga (somente inserção)
-- =====================================================================
CREATE TABLE historico_carga (
  id              UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  carga_id        UUID           NOT NULL
                  REFERENCES cargas_quimicas (id)
                  ON DELETE RESTRICT ON UPDATE RESTRICT,
  tipo_evento     tipo_evento    NOT NULL,
  status_anterior status_carga,
  status_novo     status_carga,
  motivo          TEXT,
  autor_id        UUID           NOT NULL
                  REFERENCES usuarios (id)
                  ON DELETE RESTRICT ON UPDATE RESTRICT,
  ocorrido_em     TIMESTAMPTZ(3) NOT NULL DEFAULT now(),
  CONSTRAINT historico_carga_status_novo_ck
    CHECK (tipo_evento NOT IN ('REGISTRO', 'MUDANCA_STATUS', 'BLOQUEIO', 'LIBERACAO', 'CANCELAMENTO')
           OR status_novo IS NOT NULL)
);

CREATE INDEX historico_carga_carga_id_ocorrido_em_idx ON historico_carga (carga_id, ocorrido_em DESC);
CREATE INDEX historico_carga_autor_id_idx             ON historico_carga (autor_id);

CREATE FUNCTION historico_carga_somente_insercao()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'historico_carga é somente inserção (RN011): operação % não permitida', TG_OP
    USING ERRCODE = 'restrict_violation';
END;
$$;

CREATE TRIGGER historico_carga_bloqueia_update_delete
  BEFORE UPDATE OR DELETE ON historico_carga
  FOR EACH ROW EXECUTE FUNCTION historico_carga_somente_insercao();

CREATE TRIGGER historico_carga_bloqueia_truncate
  BEFORE TRUNCATE ON historico_carga
  FOR EACH STATEMENT EXECUTE FUNCTION historico_carga_somente_insercao();
