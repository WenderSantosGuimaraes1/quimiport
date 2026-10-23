import type {
  CargaQuimicaSaida,
  MotivoEntrada,
} from '../dto/carga-quimica.dto';
import { MudancaStatusCarga } from './mudanca-status';

/** Cancelamento lógico (RN015): a carga permanece armazenada */
export class CancelarCarga extends MudancaStatusCarga {
  async executar(
    id: string,
    entrada: MotivoEntrada,
    autorId: string,
  ): Promise<CargaQuimicaSaida> {
    return this.aplicar(id, autorId, (carga) =>
      carga.cancelar({ autorId, motivo: entrada.motivo }),
    );
  }
}
