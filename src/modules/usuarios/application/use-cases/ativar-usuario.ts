import { paraUsuarioSaida, type UsuarioSaida } from '../dto/usuario.dto';
import type { UsuarioRepository } from '../ports/usuario-repository';
import { obterUsuarioExistente } from './buscar-usuario';

/** Reativa um usuário que foi inativado */
export class AtivarUsuario {
  constructor(private readonly repositorio: UsuarioRepository) {}

  async executar(id: string): Promise<UsuarioSaida> {
    const usuario = await obterUsuarioExistente(this.repositorio, id);
    usuario.ativar();
    await this.repositorio.atualizar(usuario);
    return paraUsuarioSaida(usuario);
  }
}
