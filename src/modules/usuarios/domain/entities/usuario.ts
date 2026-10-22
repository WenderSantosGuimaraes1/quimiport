import { randomUUID } from 'node:crypto';
import {
  ErroRegraNegocio,
  ErroValidacao,
} from '../../../../shared/domain/errors/erro-dominio';
import type { CargoProfissional } from '../value-objects/cargo-profissional';
import type { Cpf } from '../value-objects/cpf';
import type { StatusUsuario } from '../value-objects/status-usuario';

const TAMANHO_MAXIMO_NOME = 150;

export interface PropsUsuario {
  id: string;
  nome: string;
  cpf: Cpf;
  cargoProfissional: CargoProfissional;
  dataNascimento: Date;
  senhaHash: string;
  status: StatusUsuario;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface DadosNovoUsuario {
  nome: string;
  cpf: Cpf;
  cargoProfissional: CargoProfissional;
  dataNascimento: Date;
  /** A senha chega já transformada em hash pela camada de aplicação */
  senhaHash: string;
}

export type DadosAtualizacaoUsuario = Partial<
  Pick<PropsUsuario, 'nome' | 'cargoProfissional' | 'dataNascimento'>
>;

export class Usuario {
  private constructor(private props: PropsUsuario) {}

  /** Novo cadastro: aplica as regras e nasce sempre ATIVO */
  static criar(dados: DadosNovoUsuario): Usuario {
    const agora = new Date();
    return new Usuario({
      id: randomUUID(),
      nome: validarNome(dados.nome),
      cpf: dados.cpf,
      cargoProfissional: dados.cargoProfissional,
      dataNascimento: validarDataNascimento(dados.dataNascimento),
      senhaHash: dados.senhaHash,
      status: 'ATIVO',
      criadoEm: agora,
      atualizadoEm: agora,
    });
  }

  /** Reconstrói um usuário já persistido, sem revalidar */
  static restaurar(props: PropsUsuario): Usuario {
    return new Usuario({ ...props });
  }

  get id(): string {
    return this.props.id;
  }
  get nome(): string {
    return this.props.nome;
  }
  get cpf(): Cpf {
    return this.props.cpf;
  }
  get cargoProfissional(): CargoProfissional {
    return this.props.cargoProfissional;
  }
  get dataNascimento(): Date {
    return this.props.dataNascimento;
  }
  get senhaHash(): string {
    return this.props.senhaHash;
  }
  get status(): StatusUsuario {
    return this.props.status;
  }
  get criadoEm(): Date {
    return this.props.criadoEm;
  }
  get atualizadoEm(): Date {
    return this.props.atualizadoEm;
  }

  estaAtivo(): boolean {
    return this.props.status === 'ATIVO';
  }

  /** CPF e senha não são alterados por aqui */
  atualizar(dados: DadosAtualizacaoUsuario): void {
    this.garantirAtivo();

    if (dados.nome !== undefined) {
      this.props.nome = validarNome(dados.nome);
    }
    if (dados.cargoProfissional !== undefined) {
      this.props.cargoProfissional = dados.cargoProfissional;
    }
    if (dados.dataNascimento !== undefined) {
      this.props.dataNascimento = validarDataNascimento(dados.dataNascimento);
    }
    this.tocar();
  }

  /** Exclusão lógica: o registro é mantido para preservar o histórico */
  inativar(): void {
    if (!this.estaAtivo()) {
      throw new ErroRegraNegocio(
        'USUARIO_JA_INATIVO',
        'O usuário já está inativo',
      );
    }
    this.props.status = 'INATIVO';
    this.tocar();
  }

  ativar(): void {
    if (this.estaAtivo()) {
      throw new ErroRegraNegocio('USUARIO_JA_ATIVO', 'O usuário já está ativo');
    }
    this.props.status = 'ATIVO';
    this.tocar();
  }

  private garantirAtivo(): void {
    if (!this.estaAtivo()) {
      throw new ErroRegraNegocio(
        'USUARIO_INATIVO',
        'Um usuário inativo não pode ser alterado. Reative-o antes',
      );
    }
  }

  private tocar(): void {
    this.props.atualizadoEm = new Date();
  }
}

function validarNome(nome: string): string {
  const nomeLimpo = nome.trim();
  if (nomeLimpo === '') {
    throw new ErroValidacao('NOME_OBRIGATORIO', 'O nome é obrigatório');
  }
  if (nomeLimpo.length > TAMANHO_MAXIMO_NOME) {
    throw new ErroValidacao(
      'NOME_INVALIDO',
      `O nome deve ter no máximo ${TAMANHO_MAXIMO_NOME} caracteres`,
    );
  }
  return nomeLimpo;
}

/** Mesma regra do banco: data_nascimento < CURRENT_DATE */
function validarDataNascimento(data: Date): Date {
  if (isNaN(data.getTime())) {
    throw new ErroValidacao(
      'DATA_NASCIMENTO_INVALIDA',
      'A data de nascimento é inválida',
    );
  }
  const hoje = new Date();
  hoje.setUTCHours(0, 0, 0, 0);
  if (data >= hoje) {
    throw new ErroValidacao(
      'DATA_NASCIMENTO_INVALIDA',
      'A data de nascimento deve ser anterior à data atual',
    );
  }
  return data;
}
