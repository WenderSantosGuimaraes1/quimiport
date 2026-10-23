import { ErroValidacao } from '../../../../shared/domain/errors/erro-dominio';
import type { UnidadeMedida } from './unidade-medida';

/** Limites da coluna numeric(14,3) */
const CASAS_DECIMAIS = 3;
const VALOR_MAXIMO = 99_999_999_999.999;

export function quantidadeValida(valor: number): boolean {
  return Number.isFinite(valor) && valor > 0;
}

export class Quantidade {
  private constructor(
    readonly valor: number,
    readonly unidade: UnidadeMedida,
  ) {}

  static criar(valor: number, unidade: UnidadeMedida): Quantidade {
    if (!quantidadeValida(valor)) {
      throw new ErroValidacao(
        'QUANTIDADE_INVALIDA',
        'Quantidade da carga deve ser maior que zero',
        'RN004',
      );
    }
    if (valor > VALOR_MAXIMO) {
      throw new ErroValidacao(
        'QUANTIDADE_INVALIDA',
        `Quantidade da carga deve ser no máximo ${VALOR_MAXIMO}`,
      );
    }
    if (Number(valor.toFixed(CASAS_DECIMAIS)) !== valor) {
      throw new ErroValidacao(
        'QUANTIDADE_INVALIDA',
        `Quantidade da carga deve ter no máximo ${CASAS_DECIMAIS} casas decimais`,
      );
    }
    return new Quantidade(valor, unidade);
  }

  /** Reconstrói uma quantidade já persistida */
  static restaurar(valor: number, unidade: UnidadeMedida): Quantidade {
    return new Quantidade(valor, unidade);
  }
}
