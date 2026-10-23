import type { Usuario } from '../../domain/entities/usuario';
import type { Cpf } from '../../domain/value-objects/cpf';
import type { StatusUsuario } from '../../domain/value-objects/status-usuario';

export interface FiltroListagemUsuarios {
  status?: StatusUsuario;
  pagina: number;
  porPagina: number;
}

export interface PaginaUsuarios {
  itens: Usuario[];
  total: number;
}

/** Outbound Port: persistência de usuários */
export interface UsuarioRepository {
  /** Insere um usuário novo. CPF duplicado deve virar ErroConflito */
  salvar(usuario: Usuario): Promise<void>;
  /** Grava as alterações de um usuário existente */
  atualizar(usuario: Usuario): Promise<void>;
  buscarPorId(id: string): Promise<Usuario | null>;
  buscarPorCpf(cpf: Cpf): Promise<Usuario | null>;
  listar(filtro: FiltroListagemUsuarios): Promise<PaginaUsuarios>;
}
