import {
  montarListaPaginada,
  validarPaginacao,
} from '../../../../shared/application/paginacao';
import { criarStatusCarga } from '../../domain/value-objects/status-carga';
import {
  paraCargaQuimicaSaida,
  type ListaCargasQuimicasSaida,
  type ListarCargasQuimicasEntrada,
} from '../dto/carga-quimica.dto';
import type { CargaQuimicaRepository } from '../ports/carga-quimica-repository';

export class ListarCargasQuimicas {
  constructor(private readonly repositorio: CargaQuimicaRepository) {}

  async executar(
    entrada: ListarCargasQuimicasEntrada = {},
  ): Promise<ListaCargasQuimicasSaida> {
    const paginacao = validarPaginacao(entrada);

    const { itens, total } = await this.repositorio.listar({
      status:
        entrada.status === undefined
          ? undefined
          : criarStatusCarga(entrada.status),
      produtoId: entrada.produtoId,
      responsavelTecnicoId: entrada.responsavelTecnicoId,
      ...paginacao,
    });

    return montarListaPaginada(
      itens.map(paraCargaQuimicaSaida),
      total,
      paginacao,
    );
  }
}
