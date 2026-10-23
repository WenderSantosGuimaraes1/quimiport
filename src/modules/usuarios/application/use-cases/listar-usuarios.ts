import {
  montarListaPaginada,
  validarPaginacao,
} from '../../../../shared/application/paginacao';
import { criarStatusUsuario } from '../../domain/value-objects/status-usuario';
import {
  paraUsuarioSaida,
  type ListarUsuariosEntrada,
  type ListaUsuariosSaida,
} from '../dto/usuario.dto';
import type { UsuarioRepository } from '../ports/usuario-repository';

export class ListarUsuarios {
  constructor(private readonly repositorio: UsuarioRepository) {}

  async executar(
    entrada: ListarUsuariosEntrada = {},
  ): Promise<ListaUsuariosSaida> {
    const paginacao = validarPaginacao(entrada);

    const { itens, total } = await this.repositorio.listar({
      status:
        entrada.status === undefined
          ? undefined
          : criarStatusUsuario(entrada.status),
      ...paginacao,
    });

    return montarListaPaginada(itens.map(paraUsuarioSaida), total, paginacao);
  }
}
