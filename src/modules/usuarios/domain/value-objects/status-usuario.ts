import { criarValorEnumerado } from '../../../../shared/domain/valor-enumerado';

export const STATUS_USUARIO = ['ATIVO', 'INATIVO'] as const;

export type StatusUsuario = (typeof STATUS_USUARIO)[number];

export function criarStatusUsuario(valor: string): StatusUsuario {
  return criarValorEnumerado(STATUS_USUARIO, valor, {
    codigoErro: 'STATUS_USUARIO_INVALIDO',
    mensagemObrigatorio: 'Status do usuário é obrigatório',
    mensagemInvalido: 'Status do usuário inválido',
  });
}
