import { z } from 'zod';
import {
  paginacaoQuery,
  textoObrigatorio,
  textoOpcional,
} from '../../../../../../shared/infrastructure/http/validacao';

// Enums (classe, grupo, estado, status) chegam como texto e são validados
// pelos Value Objects do domínio, que mantêm a lista de valores permitidos.

const dadosProdutoSchema = z.object({
  nome: textoObrigatorio('Nome do produto químico é obrigatório'),
  descricao: textoOpcional().nullable(),
  numeroOnu: textoObrigatorio('Número ONU é obrigatório'),
  classeRisco: textoObrigatorio('Classe de risco é obrigatória'),
  grupoCompatibilidade: textoObrigatorio(
    'Grupo de compatibilidade é obrigatório',
  ),
  estadoFisico: textoOpcional().nullable(),
});

export const criarProdutoQuimicoSchema = dadosProdutoSchema.extend({
  status: textoOpcional(),
});

export const atualizarProdutoQuimicoSchema = dadosProdutoSchema;

export const listarProdutosQuimicosSchema = z.object({
  status: z.string().optional(),
  classeRisco: z.string().optional(),
  ...paginacaoQuery,
});
