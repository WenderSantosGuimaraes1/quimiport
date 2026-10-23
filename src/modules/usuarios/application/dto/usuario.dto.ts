import type { Usuario } from '../../domain/entities/usuario';
import type { CargoProfissional } from '../../domain/value-objects/cargo-profissional';
import type { StatusUsuario } from '../../domain/value-objects/status-usuario';

// ----- Entrada -------------------------------------------------------
// Tipos primitivos: a conversão para Value Objects acontece nos casos de uso.

export interface CriarUsuarioEntrada {
  nome: string;
  cpf: string;
  cargoProfissional: string;
  dataNascimento: Date;
  senha: string;
}

export interface AtualizarUsuarioEntrada {
  nome?: string;
  cargoProfissional?: string;
  dataNascimento?: Date;
}

export interface ListarUsuariosEntrada {
  status?: string;
  pagina?: number;
  porPagina?: number;
}

// ----- Saída ---------------------------------------------------------
// Nunca expõe o hash da senha.

export interface UsuarioSaida {
  id: string;
  nome: string;
  cpf: string;
  cargoProfissional: CargoProfissional;
  /** AAAA-MM-DD */
  dataNascimento: string;
  status: StatusUsuario;
  criadoEm: string;
  atualizadoEm: string;
}

export interface ListaUsuariosSaida {
  itens: UsuarioSaida[];
  total: number;
  pagina: number;
  porPagina: number;
  totalPaginas: number;
}

export function paraUsuarioSaida(usuario: Usuario): UsuarioSaida {
  return {
    id: usuario.id,
    nome: usuario.nome,
    cpf: usuario.cpf.formatado(),
    cargoProfissional: usuario.cargoProfissional,
    dataNascimento: usuario.dataNascimento.toISOString().slice(0, 10),
    status: usuario.status,
    criadoEm: usuario.criadoEm.toISOString(),
    atualizadoEm: usuario.atualizadoEm.toISOString(),
  };
}
