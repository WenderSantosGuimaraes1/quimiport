import {
  ErroNaoEncontrado,
  ErroRegraNegocio,
} from '../../../../shared/domain/errors/erro-dominio';
import type { CargaQuimica } from '../../domain/aggregates/carga-quimica';
import type { CargaQuimicaRepository } from '../ports/carga-quimica-repository';
import type { UsuarioGateway } from '../ports/usuario-gateway';

/** Usado pelos casos de uso que precisam de uma carga existente */
export async function obterCargaExistente(
  repositorio: CargaQuimicaRepository,
  id: string,
): Promise<CargaQuimica> {
  const carga = await repositorio.buscarPorId(id);
  if (!carga) {
    throw new ErroNaoEncontrado(
      'CARGA_QUIMICA_NAO_ENCONTRADA',
      'Carga química não encontrada',
    );
  }
  return carga;
}

/** O autor de toda operação sobre a carga precisa ser um usuário ativo (RNF005) */
export async function garantirAutorValido(
  usuarios: UsuarioGateway,
  autorId: string,
): Promise<void> {
  const autor = await usuarios.buscarPorId(autorId);
  if (!autor) {
    throw new ErroRegraNegocio(
      'AUTOR_NAO_ENCONTRADO',
      'O usuário autor da operação não foi encontrado',
    );
  }
  if (!autor.ativo) {
    throw new ErroRegraNegocio(
      'AUTOR_INATIVO',
      'O usuário autor da operação está inativo',
    );
  }
}
