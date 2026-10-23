import type { PrismaClient } from '@prisma/client';
import type {
  UsuarioGateway,
  UsuarioResumo,
} from '../../../application/ports/usuario-gateway';

/** Lê o usuário direto da tabela, sem depender da camada de aplicação de usuários */
export class PrismaUsuarioGateway implements UsuarioGateway {
  constructor(private readonly prisma: PrismaClient) {}

  async buscarPorId(id: string): Promise<UsuarioResumo | null> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      select: { id: true, status: true, cargoProfissional: true },
    });
    if (!usuario) return null;

    return {
      id: usuario.id,
      ativo: usuario.status === 'ATIVO',
      responsavelTecnico: usuario.cargoProfissional === 'RESPONSAVEL_TECNICO',
    };
  }
}
