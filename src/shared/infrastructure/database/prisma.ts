import { PrismaClient } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export const prisma = new PrismaClient();

/** Violação de unique (P2002), usada pelos repositórios para gerar ErroConflito */
export function ehViolacaoDeUnicidade(erro: unknown): boolean {
  return erro instanceof PrismaClientKnownRequestError && erro.code === 'P2002';
}
