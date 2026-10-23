import { paraUsuarioSaida, type UsuarioSaida } from '../dto/usuario.dto';
import type { UsuarioRepository } from '../ports/usuario-repository';
import { obterUsuarioExistente } from './buscar-usuario';

/** Exclusão lógica: o usuário continua no banco com status INATIVO */
export class InativarUsuario {
  constructor(private readonly repositorio: UsuarioRepository) {}

  async executar(id: string): Promise<UsuarioSaida> {
    const usuario = await obterUsuarioExistente(this.repositorio, id);
    usuario.inativar();
    await this.repositorio.atualizar(usuario);
    return paraUsuarioSaida(usuario);
  }
}
