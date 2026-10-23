import type {
  CargaQuimica as CargaQuimicaRegistro,
  Prisma,
  PrismaClient,
} from '@prisma/client';
import { ErroConflito } from '../../../../shared/domain/errors/erro-dominio';
import { ehViolacaoDeUnicidade } from '../../../../shared/infrastructure/database/prisma';
import type {
  CargaQuimicaRepository,
  FiltroListagemCargasQuimicas,
  PaginaCargasQuimicas,
} from '../../application/ports/carga-quimica-repository';
import { CargaQuimica } from '../../domain/aggregates/carga-quimica';
import { Quantidade } from '../../domain/value-objects/quantidade';

export class PrismaCargaQuimicaRepository implements CargaQuimicaRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async registrar(carga: CargaQuimica): Promise<void> {
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.cargaQuimica.create({
          data: {
            id: carga.id,
            codigo: carga.codigo,
            produtoId: carga.produto.id,
            produtoNome: carga.produto.nome,
            produtoNumeroOnu: carga.produto.numeroOnu,
            produtoClasseRisco: carga.produto.classeRisco,
            quantidade: carga.quantidade.valor,
            unidadeMedida: carga.quantidade.unidade,
            origem: carga.origem,
            destino: carga.destino,
            responsavelId: carga.responsavelTecnicoId,
            status: carga.status,
            documentacaoValida: carga.documentacaoValida,
            dataEntrada: carga.dataEntrada,
            createdAt: carga.criadoEm,
            updatedAt: carga.atualizadoEm,
          },
        });
        await this.inserirEventos(tx, carga);
      });
    } catch (erro) {
      if (ehViolacaoDeUnicidade(erro)) {
        throw new ErroConflito(
          'CODIGO_CARGA_DUPLICADO',
          'Já existe uma carga química com este código',
          'RN026',
        );
      }
      throw erro;
    }
    carga.confirmarPersistencia();
  }

  async salvarMudancaStatus(carga: CargaQuimica): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Condicionado ao status lido: se outra requisição alterou a carga
      // no intervalo, nenhuma linha é afetada e a transação é desfeita.
      const { count } = await tx.cargaQuimica.updateMany({
        where: { id: carga.id, status: carga.statusPersistido },
        data: { status: carga.status, updatedAt: carga.atualizadoEm },
      });
      if (count === 0) {
        throw new ErroConflito(
          'CARGA_ALTERADA_CONCORRENTEMENTE',
          'A carga foi alterada por outra operação. Consulte-a novamente e repita a ação',
        );
      }
      await this.inserirEventos(tx, carga);
    });
    carga.confirmarPersistencia();
  }

  async buscarPorId(id: string): Promise<CargaQuimica | null> {
    const registro = await this.prisma.cargaQuimica.findUnique({
      where: { id },
    });
    return registro ? paraDominio(registro) : null;
  }

  async buscarPorCodigo(codigo: string): Promise<CargaQuimica | null> {
    const registro = await this.prisma.cargaQuimica.findUnique({
      where: { codigo },
    });
    return registro ? paraDominio(registro) : null;
  }

  async listar(
    filtro: FiltroListagemCargasQuimicas,
  ): Promise<PaginaCargasQuimicas> {
    const where: Prisma.CargaQuimicaWhereInput = {
      status: filtro.status,
      produtoId: filtro.produtoId,
      responsavelId: filtro.responsavelTecnicoId,
    };
    const [registros, total] = await this.prisma.$transaction([
      this.prisma.cargaQuimica.findMany({
        where,
        orderBy: { dataEntrada: 'desc' },
        skip: (filtro.pagina - 1) * filtro.porPagina,
        take: filtro.porPagina,
      }),
      this.prisma.cargaQuimica.count({ where }),
    ]);
    return { itens: registros.map(paraDominio), total };
  }

  /** historico_carga é somente inserção (RN011) */
  private async inserirEventos(
    tx: Prisma.TransactionClient,
    carga: CargaQuimica,
  ): Promise<void> {
    if (carga.eventosPendentes.length === 0) return;
    await tx.historicoCarga.createMany({
      data: carga.eventosPendentes.map((evento) => ({
        cargaId: carga.id,
        tipoEvento: evento.tipo,
        statusAnterior: evento.statusAnterior,
        statusNovo: evento.statusNovo,
        motivo: evento.motivo,
        autorId: evento.autorId,
        ocorridoEm: evento.ocorridoEm,
      })),
    });
  }
}

function paraDominio(registro: CargaQuimicaRegistro): CargaQuimica {
  return CargaQuimica.restaurar({
    id: registro.id,
    codigo: registro.codigo,
    produto: {
      id: registro.produtoId,
      nome: registro.produtoNome,
      numeroOnu: registro.produtoNumeroOnu,
      classeRisco: registro.produtoClasseRisco,
    },
    quantidade: Quantidade.restaurar(
      registro.quantidade.toNumber(),
      registro.unidadeMedida,
    ),
    origem: registro.origem,
    destino: registro.destino,
    responsavelTecnicoId: registro.responsavelId,
    status: registro.status,
    documentacaoValida: registro.documentacaoValida,
    dataEntrada: registro.dataEntrada,
    criadoEm: registro.createdAt,
    atualizadoEm: registro.updatedAt,
  });
}
