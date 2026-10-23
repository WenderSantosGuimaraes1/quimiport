import { ErroValidacao } from '../domain/errors/erro-dominio';

const POR_PAGINA_PADRAO = 20;
const POR_PAGINA_MAXIMO = 100;

export interface Paginacao {
  pagina: number;
  porPagina: number;
}

export interface ListaPaginada<T> {
  itens: T[];
  total: number;
  pagina: number;
  porPagina: number;
  totalPaginas: number;
}

export function validarPaginacao(entrada: {
  pagina?: number;
  porPagina?: number;
}): Paginacao {
  const pagina = entrada.pagina ?? 1;
  const porPagina = entrada.porPagina ?? POR_PAGINA_PADRAO;

  if (!Number.isInteger(pagina) || pagina < 1) {
    throw new ErroValidacao(
      'PAGINA_INVALIDA',
      'A página deve ser um número inteiro maior que zero',
    );
  }
  if (
    !Number.isInteger(porPagina) ||
    porPagina < 1 ||
    porPagina > POR_PAGINA_MAXIMO
  ) {
    throw new ErroValidacao(
      'POR_PAGINA_INVALIDO',
      `A quantidade por página deve ser um número inteiro entre 1 e ${POR_PAGINA_MAXIMO}`,
    );
  }

  return { pagina, porPagina };
}

export function montarListaPaginada<T>(
  itens: T[],
  total: number,
  { pagina, porPagina }: Paginacao,
): ListaPaginada<T> {
  return {
    itens,
    total,
    pagina,
    porPagina,
    totalPaginas: Math.ceil(total / porPagina),
  };
}
