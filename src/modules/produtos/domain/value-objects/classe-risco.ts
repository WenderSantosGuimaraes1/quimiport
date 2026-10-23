import { criarValorEnumerado } from '../../../../shared/domain/valor-enumerado';

/** Classes de produtos perigosos da ONU para transporte */
export const CLASSES_RISCO = [
  'CLASSE_1',
  'CLASSE_2',
  'CLASSE_3',
  'CLASSE_4',
  'CLASSE_5',
  'CLASSE_6',
  'CLASSE_7',
  'CLASSE_8',
  'CLASSE_9',
] as const;

export type ClasseRisco = (typeof CLASSES_RISCO)[number];

export function criarClasseRisco(valor: string | undefined): ClasseRisco {
  return criarValorEnumerado(CLASSES_RISCO, valor, {
    codigoErro: 'CLASSE_RISCO_INVALIDA',
    mensagemObrigatorio: 'Classe de risco é obrigatória',
    mensagemInvalido: 'Classe de risco inválida',
    regra: 'RN002',
  });
}
