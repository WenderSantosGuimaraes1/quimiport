import { ErroValidacao } from '../../../../shared/domain/errors/erro-dominio';

const TAMANHO_MINIMO = 8;
const TAMANHO_MAXIMO = 72;

/** Senha em texto puro, válida apenas em memória até virar hash */
export class Senha {
  private constructor(readonly valor: string) {}

  static criar(valor: string): Senha {
    if (!valor) {
      throw new ErroValidacao('SENHA_INVALIDA', 'Senha é obrigatória');
    }
    if (valor.length < TAMANHO_MINIMO || valor.length > TAMANHO_MAXIMO) {
      throw new ErroValidacao(
        'SENHA_INVALIDA',
        `A senha deve ter entre ${TAMANHO_MINIMO} e ${TAMANHO_MAXIMO} caracteres`,
      );
    }
    if (!/[A-Za-z]/.test(valor) || !/\d/.test(valor)) {
      throw new ErroValidacao(
        'SENHA_INVALIDA',
        'A senha deve conter ao menos uma letra e um número',
      );
    }
    return new Senha(valor);
  }
}
