import { z } from 'zod';
import { ErroValidacao } from '../../domain/errors/erro-dominio';

/**
 * Valida o formato da entrada HTTP (tipos e campos obrigatórios).
 * Regras de negócio continuam no domínio.
 */
export function validar<T extends z.ZodType>(
  schema: T,
  dados: unknown,
): z.output<T> {
  const resultado = schema.safeParse(dados);
  if (resultado.success) return resultado.data;

  const problemas = resultado.error.issues.map((issue) => ({
    campo: issue.path.join('.'),
    mensagem: issue.message,
  }));

  throw new ErroValidacao(
    'DADOS_INVALIDOS',
    problemas.length === 1 ? problemas[0].mensagem : 'Dados inválidos',
    undefined,
    problemas,
  );
}

const ausente = (valor: unknown) => valor === undefined || valor === null;

/** Texto obrigatório e não vazio, com mensagem de negócio para ausência */
export const textoObrigatorio = (mensagemObrigatorio: string) =>
  z
    .string({
      error: (issue) =>
        ausente(issue.input) ? mensagemObrigatorio : 'Deve ser um texto',
    })
    .trim()
    .min(1, mensagemObrigatorio);

export const textoOpcional = () =>
  z.string({ error: 'Deve ser um texto' }).trim().optional();

/** Data no formato AAAA-MM-DD, convertida para meia-noite UTC */
export const dataIso = (mensagemObrigatorio: string) =>
  z
    .string({
      error: (issue) =>
        ausente(issue.input) ? mensagemObrigatorio : 'Deve ser uma data',
    })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'A data deve estar no formato AAAA-MM-DD')
    .transform((valor) => new Date(`${valor}T00:00:00.000Z`));

// z.guid aceita qualquer UUID 8-4-4-4-12, como o Postgres (z.uuid exige versão RFC)
export const uuid = (mensagem: string) => z.guid({ error: mensagem });

/** UUID obrigatório, com mensagens distintas para ausência e formato inválido */
export const uuidObrigatorio = (
  mensagemObrigatorio: string,
  mensagemInvalido: string,
) =>
  z.guid({
    error: (issue) =>
      ausente(issue.input) || issue.input === ''
        ? mensagemObrigatorio
        : mensagemInvalido,
  });

export const paramsComId = z.object({
  id: uuid('O identificador informado não é um UUID válido'),
});

export const paginacaoQuery = {
  pagina: z.coerce.number({ error: 'A página deve ser um número' }).optional(),
  porPagina: z.coerce
    .number({ error: 'A quantidade por página deve ser um número' })
    .optional(),
};
