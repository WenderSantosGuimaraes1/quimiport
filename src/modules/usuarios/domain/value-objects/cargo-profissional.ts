import { ErroValidacao } from '../../../../shared/domain/errors/erro-dominio';

export const CARGOS_PROFISSIONAIS = [
  'OPERADOR',
  'INSPETOR',
  'RESPONSAVEL_TECNICO',
  'GESTOR',
  'ADMINISTRADOR',
] as const;

export type CargoProfissional = (typeof CARGOS_PROFISSIONAIS)[number];

export function criarCargoProfissional(valor: string): CargoProfissional {
  if (!(CARGOS_PROFISSIONAIS as readonly string[]).includes(valor)) {
    throw new ErroValidacao(
      'CARGO_PROFISSIONAL_INVALIDO',
      `Cargo profissional inválido. Valores aceitos: ${CARGOS_PROFISSIONAIS.join(', ')}`,
    );
  }
  return valor as CargoProfissional;
}
