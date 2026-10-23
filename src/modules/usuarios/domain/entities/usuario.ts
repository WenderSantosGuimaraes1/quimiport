import { randomUUID } from 'node:crypto';
import {
  ErroRegraNegocio,
  ErroValidacao,
} from '../../../../shared/domain/errors/erro-dominio';
import type { CargoProfissional } from '../value-objects/cargo-profissional';
import type { Cpf } from '../value-objects/cpf';
import type { StatusUsuario } from '../value-objects/status-usuario';

const NOME_TAMANHO_MAXIMO = 150;

export interface UsuarioProps {
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

export interface CriarUsuarioProps {
  nome: string;
  cpf: Cpf;
  cargoProfissional: CargoProfissional;
  dataNascimento: Date;
  senhaHash: string;
}

export interface AtualizarUsuarioProps {
  nome?: string;
  cargoProfissional?: CargoProfissional;
  dataNascimento?: Date;
}

export class Usuario {
  private constructor(private props: UsuarioProps) {}

  static criar(dados: CriarUsuarioProps): Usuario {
    const agora = new Date();
    return new Usuario({
      id: randomUUID(),
      nome: Usuario.validarNome(dados.nome),
      cpf: dados.cpf,
      cargoProfissional: dados.cargoProfissional,
      dataNascimento: Usuario.validarDataNascimento(dados.dataNascimento),
      senhaHash: dados.senhaHash,
      status: 'ATIVO',
      criadoEm: agora,
      atualizadoEm: agora,
    });
  }

  /** Reconstrói um usuário já persistido */
  static restaurar(props: UsuarioProps): Usuario {
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

  atualizar(dados: AtualizarUsuarioProps): void {
    if (dados.nome !== undefined) {
      this.props.nome = Usuario.validarNome(dados.nome);
    }
    if (dados.cargoProfissional !== undefined) {
      this.props.cargoProfissional = dados.cargoProfissional;
    }
    if (dados.dataNascimento !== undefined) {
      this.props.dataNascimento = Usuario.validarDataNascimento(
        dados.dataNascimento,
      );
    }
    this.tocar();
  }

  ativar(): void {
    if (this.estaAtivo()) {
      throw new ErroRegraNegocio('USUARIO_JA_ATIVO', 'Usuário já está ativo');
    }
    this.props.status = 'ATIVO';
    this.tocar();
  }

  inativar(): void {
    if (!this.estaAtivo()) {
      throw new ErroRegraNegocio(
        'USUARIO_JA_INATIVO',
        'Usuário já está inativo',
      );
    }
    this.props.status = 'INATIVO';
    this.tocar();
  }

  private tocar(): void {
    this.props.atualizadoEm = new Date();
  }

  private static validarNome(nome: string): string {
    const normalizado = nome?.trim();
    if (!normalizado) {
      throw new ErroValidacao(
        'NOME_USUARIO_OBRIGATORIO',
        'Nome do usuário é obrigatório',
      );
    }
    if (normalizado.length > NOME_TAMANHO_MAXIMO) {
      throw new ErroValidacao(
        'NOME_USUARIO_INVALIDO',
        `O nome do usuário deve ter no máximo ${NOME_TAMANHO_MAXIMO} caracteres`,
      );
    }
    return normalizado;
  }

  private static validarDataNascimento(data: Date): Date {
    if (!(data instanceof Date) || Number.isNaN(data.getTime())) {
      throw new ErroValidacao(
        'DATA_NASCIMENTO_INVALIDA',
        'Data de nascimento inválida',
      );
    }
    if (data.getTime() >= Date.now()) {
      throw new ErroValidacao(
        'DATA_NASCIMENTO_INVALIDA',
        'A data de nascimento deve ser anterior à data atual',
      );
    }
    return data;
  }
}
