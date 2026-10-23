import type { CargaQuimicaSaida } from '../dto/carga-quimica.dto';
import { MudancaStatusCarga } from './mudanca-status';

export class LiberarCarga extends MudancaStatusCarga {
  async executar(id: string, autorId: string): Promise<CargaQuimicaSaida> {
    return this.aplicar(id, autorId, (carga) => carga.liberar({ autorId }));
  }
}
