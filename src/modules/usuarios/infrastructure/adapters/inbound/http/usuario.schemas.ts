import { z } from 'zod';
import {
  dataIso,
  paginacaoQuery,
  textoObrigatorio,
} from '../../../../../../shared/infrastructure/http/validacao';

export const criarUsuarioSchema = z.object({
  nome: textoObrigatorio('Nome do usuário é obrigatório'),
  cpf: textoObrigatorio('CPF é obrigatório'),
  cargoProfissional: textoObrigatorio('Cargo profissional é obrigatório'),
  dataNascimento: dataIso('Data de nascimento é obrigatória'),
  senha: z.string({ error: 'Senha é obrigatória' }),
});

export const atualizarUsuarioSchema = z.object({
  nome: z.string({ error: 'O nome deve ser um texto' }).optional(),
  cargoProfissional: z
    .string({ error: 'O cargo profissional deve ser um texto' })
    .optional(),
  dataNascimento: dataIso('Data de nascimento é obrigatória').optional(),
});

export const listarUsuariosSchema = z.object({
  status: z.string().optional(),
  ...paginacaoQuery,
});
