import { ErroNaoEncontrado } from '../../../../shared/domain/errors/erro-dominio';
import type { Usuario } from '../../domain/entities/usuario';
import { paraUsuarioSaida, type UsuarioSaida } from '../dto/usuario.dto';
import type { UsuarioRepository } from '../ports/usuario-repository';

/** Usado pelos casos de uso que precisam de um usuário existente */
export async function obterUsuarioExistente(
  repositorio: UsuarioRepository,
  id: string,
): Promise<Usuario> {
  const usuario = await repositorio.buscarPorId(id);
  if (!usuario) {
    throw new ErroNaoEncontrado(
      'USUARIO_NAO_ENCONTRADO',
      'Usuário não encontrado',
    );
  }
  return usuario;
}

export class BuscarUsuario {
  constructor(private readonly repositorio: UsuarioRepository) {}

  async executar(id: string): Promise<UsuarioSaida> {
    const usuario = await obterUsuarioExistente(this.repositorio, id);
    return paraUsuarioSaida(usuario);
  }
}
