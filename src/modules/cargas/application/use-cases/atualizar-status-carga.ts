import { criarStatusCarga } from '../../domain/value-objects/status-carga';
import type {
  AtualizarStatusCargaEntrada,
  CargaQuimicaSaida,
} from '../dto/carga-quimica.dto';
import { MudancaStatusCarga } from './mudanca-status';

/** Transição genérica, validada pela máquina de estados (RN010) */
export class AtualizarStatusCarga extends MudancaStatusCarga {
  async executar(
    id: string,
    entrada: AtualizarStatusCargaEntrada,
    autorId: string,
  ): Promise<CargaQuimicaSaida> {
    const novoStatus = criarStatusCarga(entrada.status);
    return this.aplicar(id, autorId, (carga) =>
      carga.alterarStatus(novoStatus, { autorId, motivo: entrada.motivo }),
    );
  }
}
