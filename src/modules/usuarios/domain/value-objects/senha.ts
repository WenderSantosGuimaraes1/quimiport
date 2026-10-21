import { ErroValidacao } from '../../../../shared/domain/errors/erro-dominio';

/**
 * Senha em texto puro, já conferida contra as regras de força.
 * Existe só até virar hash: a entidade Usuario guarda apenas o hash.
 */
export class Senha {
  static readonly TAMANHO_MINIMO = 8;
  static readonly TAMANHO_MAXIMO = 128;

  private constructor(readonly valor: string) {}

  static criar(valor: string): Senha {
    if (
      valor.length < Senha.TAMANHO_MINIMO ||
      valor.length > Senha.TAMANHO_MAXIMO
    ) {
      throw new ErroValidacao(
        'SENHA_INVALIDA',
        `A senha deve ter entre ${Senha.TAMANHO_MINIMO} e ${Senha.TAMANHO_MAXIMO} caracteres`,
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

  /** Evita que a senha apareça em logs ou respostas JSON por descuido */
  toJSON(): string {
    return '[PROTEGIDA]';
  }

  toString(): string {
    return '[PROTEGIDA]';
  }
}
