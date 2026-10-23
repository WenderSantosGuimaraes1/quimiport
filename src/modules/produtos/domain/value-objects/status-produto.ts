import { criarValorEnumerado } from '../../../../shared/domain/valor-enumerado';

export const STATUS_PRODUTO = ['ATIVO', 'INATIVO'] as const;

export type StatusProduto = (typeof STATUS_PRODUTO)[number];

export function criarStatusProduto(valor: string): StatusProduto {
  return criarValorEnumerado(STATUS_PRODUTO, valor, {
    codigoErro: 'STATUS_PRODUTO_INVALIDO',
    mensagemObrigatorio: 'Status do produto químico é obrigatório',
    mensagemInvalido: 'Status do produto químico inválido',
    regra: 'RN021',
  });
}
