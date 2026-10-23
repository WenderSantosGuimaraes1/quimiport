import type { Senha } from '../../domain/value-objects/senha';

/** Outbound Port: transforma a senha em hash antes de persistir */
export interface HashSenha {
  gerar(senha: Senha): Promise<string>;
}
