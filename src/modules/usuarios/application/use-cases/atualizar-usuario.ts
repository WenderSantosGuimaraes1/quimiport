import { ErroValidacao } from '../../../../shared/domain/errors/erro-dominio';
import { criarCargoProfissional } from '../../domain/value-objects/cargo-profissional';
import {
  paraUsuarioSaida,
  type AtualizarUsuarioEntrada,
  type UsuarioSaida,
} from '../dto/usuario.dto';
import type { UsuarioRepository } from '../ports/usuario-repository';
import { obterUsuarioExistente } from './buscar-usuario';

export class AtualizarUsuario {
  constructor(private readonly repositorio: UsuarioRepository) {}

  async executar(
    id: string,
    entrada: AtualizarUsuarioEntrada,
  ): Promise<UsuarioSaida> {
    if (
      entrada.nome === undefined &&
      entrada.cargoProfissional === undefined &&
      entrada.dataNascimento === undefined
    ) {
      throw new ErroValidacao(
        'NENHUM_CAMPO_PARA_ATUALIZAR',
        'Informe ao menos um campo para atualizar: nome, cargoProfissional ou dataNascimento',
      );
    }

    const usuario = await obterUsuarioExistente(this.repositorio, id);

    usuario.atualizar({
      nome: entrada.nome,
      cargoProfissional:
        entrada.cargoProfissional === undefined
          ? undefined
          : criarCargoProfissional(entrada.cargoProfissional),
      dataNascimento: entrada.dataNascimento,
    });

    await this.repositorio.atualizar(usuario);
    return paraUsuarioSaida(usuario);
  }
}
