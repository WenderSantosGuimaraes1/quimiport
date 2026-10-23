import {
  paraCargaQuimicaSaida,
  type CargaQuimicaSaida,
} from '../dto/carga-quimica.dto';
import type { CargaQuimicaRepository } from '../ports/carga-quimica-repository';
import { obterCargaExistente } from './validacoes-comuns';

export class BuscarCargaQuimica {
  constructor(private readonly repositorio: CargaQuimicaRepository) {}

  async executar(id: string): Promise<CargaQuimicaSaida> {
    const carga = await obterCargaExistente(this.repositorio, id);
    return paraCargaQuimicaSaida(carga);
  }
}
