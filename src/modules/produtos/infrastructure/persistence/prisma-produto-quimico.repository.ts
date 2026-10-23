import type {
  PrismaClient,
  ProdutoQuimico as ProdutoQuimicoRegistro,
} from '@prisma/client';
import { ErroConflito } from '../../../../shared/domain/errors/erro-dominio';
import { ehViolacaoDeUnicidade } from '../../../../shared/infrastructure/database/prisma';
import type {
  FiltroListagemProdutosQuimicos,
  PaginaProdutosQuimicos,
  ProdutoQuimicoRepository,
} from '../../application/ports/produto-quimico-repository';
import { ProdutoQuimico } from '../../domain/entities/produto-quimico';

export class PrismaProdutoQuimicoRepository implements ProdutoQuimicoRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async salvar(produto: ProdutoQuimico): Promise<void> {
    await this.converterConflito(() =>
      this.prisma.produtoQuimico.create({
        data: {
          id: produto.id,
          ...dadosGravaveis(produto),
          createdAt: produto.criadoEm,
        },
      }),
    );
  }

  async atualizar(produto: ProdutoQuimico): Promise<void> {
    await this.converterConflito(() =>
      this.prisma.produtoQuimico.update({
        where: { id: produto.id },
        data: dadosGravaveis(produto),
      }),
    );
  }

  async buscarPorId(id: string): Promise<ProdutoQuimico | null> {
    const registro = await this.prisma.produtoQuimico.findUnique({
      where: { id },
    });
    return registro ? paraDominio(registro) : null;
  }

  async buscarAtivoPorNome(nome: string): Promise<ProdutoQuimico | null> {
    // Mesma expressão do índice único parcial produtos_quimicos_nome_ativo_uk
    const [encontrado] = await this.prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM produtos_quimicos
       WHERE status = 'ATIVO'
         AND lower(btrim(nome)) = lower(btrim(${nome}))
       LIMIT 1`;
    return encontrado ? this.buscarPorId(encontrado.id) : null;
  }

  async listar(
    filtro: FiltroListagemProdutosQuimicos,
  ): Promise<PaginaProdutosQuimicos> {
    const where = { status: filtro.status, classeRisco: filtro.classeRisco };
    const [registros, total] = await this.prisma.$transaction([
      this.prisma.produtoQuimico.findMany({
        where,
        orderBy: { nome: 'asc' },
        skip: (filtro.pagina - 1) * filtro.porPagina,
        take: filtro.porPagina,
      }),
      this.prisma.produtoQuimico.count({ where }),
    ]);
    return { itens: registros.map(paraDominio), total };
  }

  private async converterConflito(operacao: () => Promise<unknown>) {
    try {
      await operacao();
    } catch (erro) {
      if (ehViolacaoDeUnicidade(erro)) {
        throw new ErroConflito(
          'NOME_PRODUTO_DUPLICADO',
          'Já existe produto químico ativo com este nome',
        );
      }
      throw erro;
    }
  }
}

function dadosGravaveis(produto: ProdutoQuimico) {
  return {
    nome: produto.nome,
    descricao: produto.descricao,
    numeroOnu: produto.numeroOnu,
    classeRisco: produto.classeRisco,
    grupoCompatibilidade: produto.grupoCompatibilidade,
    estadoFisico: produto.estadoFisico,
    status: produto.status,
    updatedAt: produto.atualizadoEm,
  };
}

function paraDominio(registro: ProdutoQuimicoRegistro): ProdutoQuimico {
  return ProdutoQuimico.restaurar({
    id: registro.id,
    nome: registro.nome,
    descricao: registro.descricao,
    numeroOnu: registro.numeroOnu,
    classeRisco: registro.classeRisco,
    grupoCompatibilidade: registro.grupoCompatibilidade,
    estadoFisico: registro.estadoFisico,
    status: registro.status,
    criadoEm: registro.createdAt,
    atualizadoEm: registro.updatedAt,
  });
}
