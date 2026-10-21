import { ErroValidacao } from '../../../../shared/domain/errors/erro-dominio';

export const STATUS_USUARIO = ['ATIVO', 'INATIVO'] as const;

export type StatusUsuario = (typeof STATUS_USUARIO)[number];

export function criarStatusUsuario(valor: string): StatusUsuario {
  if (!(STATUS_USUARIO as readonly string[]).includes(valor)) {
    throw new ErroValidacao(
      'STATUS_USUARIO_INVALIDO',
      `Status inválido. Valores aceitos: ${STATUS_USUARIO.join(', ')}`,
    );
  }
  return valor as StatusUsuario;
}
