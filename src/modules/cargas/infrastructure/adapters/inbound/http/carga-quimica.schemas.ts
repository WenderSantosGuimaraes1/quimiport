import { z } from 'zod';
import {
  paginacaoQuery,
  textoObrigatorio,
  textoOpcional,
  uuid,
  uuidObrigatorio,
} from '../../../../../../shared/infrastructure/http/validacao';

// Enums (unidade, status) chegam como texto e são validados pelos Value
// Objects do domínio, que mantêm a lista de valores permitidos.

/**
 * Usuário que executa a operação, gravado em historico_carga.autor_id
 * (RNF005). Enquanto não há autenticação, é informado no corpo.
 */
const autorId = uuidObrigatorio(
  'O autor da operação (autorId) é obrigatório',
  'O identificador do autor (autorId) não é um UUID válido',
);

export const registrarCargaQuimicaSchema = z.object({
  codigo: textoObrigatorio('Código da carga é obrigatório'),
  produtoId: uuidObrigatorio(
    'Produto químico é obrigatório para registrar carga',
    'O identificador do produto químico não é um UUID válido',
  ),
  quantidade: z.number({
    error: (issue) =>
      issue.input === undefined || issue.input === null
        ? 'Quantidade da carga é obrigatória'
        : 'A quantidade deve ser um número',
  }),
  unidadeMedida: textoObrigatorio('Unidade de medida é obrigatória'),
  origem: textoObrigatorio('Origem da carga é obrigatória'),
  destino: textoObrigatorio('Destino da carga é obrigatório'),
  responsavelTecnicoId: uuidObrigatorio(
    'Responsável técnico é obrigatório para toda carga química',
    'O identificador do responsável técnico não é um UUID válido',
  ),
  documentacaoValida: z
    .boolean({ error: 'documentacaoValida deve ser true ou false' })
    .optional(),
  dataEntrada: z.iso
    .datetime({
      offset: true,
      error:
        'A data de entrada deve estar no formato ISO 8601 (ex.: 2026-10-22T10:00:00Z)',
    })
    .transform((valor) => new Date(valor))
    .optional(),
  autorId,
});

export const atualizarStatusCargaSchema = z.object({
  status: textoObrigatorio('Status da carga é obrigatório'),
  motivo: textoOpcional(),
  autorId,
});

export const motivoSchema = (acao: string) =>
  z.object({
    motivo: textoObrigatorio(`Motivo é obrigatório para ${acao} a carga`),
    autorId,
  });

export const liberarCargaSchema = z.object({ autorId });

export const listarCargasQuimicasSchema = z.object({
  status: z.string().optional(),
  produtoId: uuid('O filtro produtoId não é um UUID válido').optional(),
  responsavelTecnicoId: uuid(
    'O filtro responsavelTecnicoId não é um UUID válido',
  ).optional(),
  ...paginacaoQuery,
});
