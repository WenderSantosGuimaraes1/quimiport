/** Dados do usuário de que as operações de carga precisam */
export interface UsuarioResumo {
  id: string;
  ativo: boolean;
  /** Possui o cargo RESPONSAVEL_TECNICO */
  responsavelTecnico: boolean;
}

/**
 * Outbound Port: consulta ao contexto de usuários, para validar o
 * responsável técnico (RN009) e o autor das operações (RNF005).
 */
export interface UsuarioGateway {
  buscarPorId(id: string): Promise<UsuarioResumo | null>;
}
