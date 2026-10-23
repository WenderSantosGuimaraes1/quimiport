import type {
  CargaQuimicaSaida,
  MotivoEntrada,
} from '../dto/carga-quimica.dto';
import { MudancaStatusCarga } from './mudanca-status';

export class BloquearCarga extends MudancaStatusCarga {
  async executar(
    id: string,
    entrada: MotivoEntrada,
    autorId: string,
  ): Promise<CargaQuimicaSaida> {
    return this.aplicar(id, autorId, (carga) =>
      carga.bloquear({ autorId, motivo: entrada.motivo }),
    );
  }
}
