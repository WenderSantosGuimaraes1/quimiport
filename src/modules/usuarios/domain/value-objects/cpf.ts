import { ErroValidacao } from '../../../../shared/domain/errors/erro-dominio';

/** CPF válido, guardado apenas com os 11 dígitos (sem pontos e traço) */
export class Cpf {
  private constructor(readonly valor: string) {}

  /** Aceita o CPF com ou sem máscara: "123.456.789-09" ou "12345678909" */
  static criar(entrada: string): Cpf {
    const digitos = entrada.replace(/[.\-\s]/g, '');

    if (
      !/^\d{11}$/.test(digitos) ||
      /^(\d)\1{10}$/.test(digitos) || // 000.000.000-00, 111.111.111-11...
      !digitosVerificadoresConferem(digitos)
    ) {
      throw new ErroValidacao('CPF_INVALIDO', 'O CPF informado é inválido');
    }

    return new Cpf(digitos);
  }

  /** CPF já validado anteriormente, vindo do banco */
  static restaurar(valor: string): Cpf {
    return new Cpf(valor);
  }

  formatado(): string {
    return this.valor.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  igual(outro: Cpf): boolean {
    return this.valor === outro.valor;
  }
}

function digitosVerificadoresConferem(cpf: string): boolean {
  const primeiro = calcularDigito(cpf.slice(0, 9));
  const segundo = calcularDigito(cpf.slice(0, 10));
  return cpf === `${cpf.slice(0, 9)}${primeiro}${segundo}`;
}

/** Soma ponderada dos dígitos (pesos decrescentes até 2), módulo 11 */
function calcularDigito(base: string): number {
  const soma = [...base].reduce(
    (total, digito, i) => total + Number(digito) * (base.length + 1 - i),
    0,
  );
  const resto = (soma * 10) % 11;
  return resto === 10 ? 0 : resto;
}
