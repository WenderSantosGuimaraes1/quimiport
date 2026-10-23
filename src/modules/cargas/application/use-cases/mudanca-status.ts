import type { CargaQuimica } from '../../domain/aggregates/carga-quimica';
import {
  paraCargaQuimicaSaida,
  type CargaQuimicaSaida,
} from '../dto/carga-quimica.dto';
import type { CargaQuimicaRepository } from '../ports/carga-quimica-repository';
import type { UsuarioGateway } from '../ports/usuario-gateway';
import { garantirAutorValido, obterCargaExistente } from './validacoes-comuns';

/**
 * Fluxo comum das mudanças de status: valida o autor, carrega a carga,
 * aplica a regra do agregado e grava status + histórico na mesma transação.
 */
export abstract class MudancaStatusCarga {
  constructor(
    private readonly repositorio: CargaQuimicaRepository,
    private readonly usuarios: UsuarioGateway,
  ) {}

  protected async aplicar(
    id: string,
    autorId: string,
    acao: (carga: CargaQuimica) => void,
  ): Promise<CargaQuimicaSaida> {
    await garantirAutorValido(this.usuarios, autorId);
    const carga = await obterCargaExistente(this.repositorio, id);
    acao(carga);
    await this.repositorio.salvarMudancaStatus(carga);
    return paraCargaQuimicaSaida(carga);
  }
}
