import { criarValorEnumerado } from '../../../../shared/domain/valor-enumerado';

export const CARGOS_PROFISSIONAIS = [
  'OPERADOR',
  'INSPETOR',
  'RESPONSAVEL_TECNICO',
  'GESTOR',
  'ADMINISTRADOR',
] as const;

export type CargoProfissional = (typeof CARGOS_PROFISSIONAIS)[number];

export function criarCargoProfissional(valor: string): CargoProfissional {
  return criarValorEnumerado(CARGOS_PROFISSIONAIS, valor, {
    codigoErro: 'CARGO_PROFISSIONAL_INVALIDO',
    mensagemObrigatorio: 'Cargo profissional é obrigatório',
    mensagemInvalido: 'Cargo profissional inválido',
  });
}
