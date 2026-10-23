import { ErroValidacao } from '../../../../shared/domain/errors/erro-dominio';

/** CPF armazenado apenas com dígitos; aceita entrada com ou sem máscara */
export class Cpf {
  private constructor(readonly valor: string) {}

  static criar(entrada: string): Cpf {
    const digitos = (entrada ?? '').replace(/[.\-\s]/g, '');

    if (!digitos) {
      throw new ErroValidacao('CPF_INVALIDO', 'CPF é obrigatório');
    }
    if (!Cpf.digitosValidos(digitos)) {
      throw new ErroValidacao('CPF_INVALIDO', 'CPF inválido');
    }
    return new Cpf(digitos);
  }

  /** Reconstrói um CPF já persistido, sem revalidar os dígitos verificadores */
  static restaurar(valor: string): Cpf {
    return new Cpf(valor);
  }

  formatado(): string {
    return this.valor.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
  }

  private static digitosValidos(digitos: string): boolean {
    if (!/^\d{11}$/.test(digitos)) return false;
    // Sequências como 111.111.111-11 passam no cálculo, mas não são CPFs válidos
    if (/^(\d)\1{10}$/.test(digitos)) return false;

    const numeros = digitos.split('').map(Number);
    const digitoVerificador = (quantidade: number): number => {
      const soma = numeros
        .slice(0, quantidade)
        .reduce((acc, n, i) => acc + n * (quantidade + 1 - i), 0);
      const resto = (soma * 10) % 11;
      return resto === 10 ? 0 : resto;
    };

    return (
      digitoVerificador(9) === numeros[9] &&
      digitoVerificador(10) === numeros[10]
    );
  }
}
