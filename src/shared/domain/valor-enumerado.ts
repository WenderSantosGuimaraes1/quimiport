import { ErroValidacao } from './errors/erro-dominio';

interface OpcoesValorEnumerado {
  codigoErro: string;
  /** Ex.: "Classe de risco é obrigatória" */
  mensagemObrigatorio: string;
  /** Ex.: "Classe de risco inválida" */
  mensagemInvalido: string;
  regra?: string;
}

/**
 * Converte um valor primitivo em um dos valores de um conjunto fechado
 * (status, classes, cargos...), lançando ErroValidacao quando não pertence a ele.
 */
export function criarValorEnumerado<T extends string>(
  valoresPermitidos: readonly T[],
  valor: string | undefined | null,
  opcoes: OpcoesValorEnumerado,
): T {
  const normalizado =
    typeof valor === 'string' ? valor.trim().toUpperCase() : '';
  if (!normalizado) {
    throw new ErroValidacao(
      opcoes.codigoErro,
      opcoes.mensagemObrigatorio,
      opcoes.regra,
    );
  }
  if (!(valoresPermitidos as readonly string[]).includes(normalizado)) {
    throw new ErroValidacao(
      opcoes.codigoErro,
      `${opcoes.mensagemInvalido}: ${valor}. Valores permitidos: ${valoresPermitidos.join(', ')}`,
      opcoes.regra,
      { valoresPermitidos },
    );
  }
  return normalizado as T;
}
