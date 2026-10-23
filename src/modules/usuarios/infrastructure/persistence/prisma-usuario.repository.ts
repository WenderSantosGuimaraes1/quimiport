import type { PrismaClient, Usuario as UsuarioRegistro } from '@prisma/client';
import { ErroConflito } from '../../../../shared/domain/errors/erro-dominio';
import { ehViolacaoDeUnicidade } from '../../../../shared/infrastructure/database/prisma';
import type {
  FiltroListagemUsuarios,
  PaginaUsuarios,
  UsuarioRepository,
} from '../../application/ports/usuario-repository';
import { Usuario } from '../../domain/entities/usuario';
import { Cpf } from '../../domain/value-objects/cpf';

export class PrismaUsuarioRepository implements UsuarioRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async salvar(usuario: Usuario): Promise<void> {
    try {
      await this.prisma.usuario.create({
        data: {
          id: usuario.id,
          nome: usuario.nome,
          cpf: usuario.cpf.valor,
          cargoProfissional: usuario.cargoProfissional,
          dataNascimento: usuario.dataNascimento,
          senhaHash: usuario.senhaHash,
          status: usuario.status,
          createdAt: usuario.criadoEm,
          updatedAt: usuario.atualizadoEm,
        },
      });
    } catch (erro) {
      if (ehViolacaoDeUnicidade(erro)) {
        throw new ErroConflito(
          'CPF_JA_CADASTRADO',
          'Já existe um usuário cadastrado com este CPF',
        );
      }
      throw erro;
    }
  }

  async atualizar(usuario: Usuario): Promise<void> {
    await this.prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        nome: usuario.nome,
        cargoProfissional: usuario.cargoProfissional,
        dataNascimento: usuario.dataNascimento,
        status: usuario.status,
        updatedAt: usuario.atualizadoEm,
      },
    });
  }

  async buscarPorId(id: string): Promise<Usuario | null> {
    const registro = await this.prisma.usuario.findUnique({ where: { id } });
    return registro ? paraDominio(registro) : null;
  }

  async buscarPorCpf(cpf: Cpf): Promise<Usuario | null> {
    const registro = await this.prisma.usuario.findUnique({
      where: { cpf: cpf.valor },
    });
    return registro ? paraDominio(registro) : null;
  }

  async listar(filtro: FiltroListagemUsuarios): Promise<PaginaUsuarios> {
    const where = { status: filtro.status };
    const [registros, total] = await this.prisma.$transaction([
      this.prisma.usuario.findMany({
        where,
        orderBy: { nome: 'asc' },
        skip: (filtro.pagina - 1) * filtro.porPagina,
        take: filtro.porPagina,
      }),
      this.prisma.usuario.count({ where }),
    ]);
    return { itens: registros.map(paraDominio), total };
  }
}

function paraDominio(registro: UsuarioRegistro): Usuario {
  return Usuario.restaurar({
    id: registro.id,
    nome: registro.nome,
    cpf: Cpf.restaurar(registro.cpf),
    cargoProfissional: registro.cargoProfissional,
    dataNascimento: registro.dataNascimento,
    senhaHash: registro.senhaHash,
    status: registro.status,
    criadoEm: registro.createdAt,
    atualizadoEm: registro.updatedAt,
  });
}
