import { ErroConflito } from '../../../../shared/domain/errors/erro-dominio';
import { Usuario } from '../../domain/entities/usuario';
import { criarCargoProfissional } from '../../domain/value-objects/cargo-profissional';
import { Cpf } from '../../domain/value-objects/cpf';
import { Senha } from '../../domain/value-objects/senha';
import {
  paraUsuarioSaida,
  type CriarUsuarioEntrada,
  type UsuarioSaida,
} from '../dto/usuario.dto';
import type { HashSenha } from '../ports/hash-senha';
import type { UsuarioRepository } from '../ports/usuario-repository';

export class CriarUsuario {
  constructor(
    private readonly repositorio: UsuarioRepository,
    private readonly hashSenha: HashSenha,
  ) {}

  async executar(entrada: CriarUsuarioEntrada): Promise<UsuarioSaida> {
    const cpf = Cpf.criar(entrada.cpf);
    const cargoProfissional = criarCargoProfissional(entrada.cargoProfissional);
    const senha = Senha.criar(entrada.senha);

    // Checagem antecipada para uma mensagem clara. Dois cadastros simultâneos
    // ainda podem passar daqui: nesse caso, o unique do banco barra o segundo
    // e o repositório converte o erro em ErroConflito.
    if (await this.repositorio.buscarPorCpf(cpf)) {
      throw new ErroConflito(
        'CPF_JA_CADASTRADO',
        'Já existe um usuário cadastrado com este CPF',
      );
    }

    const usuario = Usuario.criar({
      nome: entrada.nome,
      cpf,
      cargoProfissional,
      dataNascimento: entrada.dataNascimento,
      senhaHash: await this.hashSenha.gerar(senha),
    });

    await this.repositorio.salvar(usuario);
    return paraUsuarioSaida(usuario);
  }
}
