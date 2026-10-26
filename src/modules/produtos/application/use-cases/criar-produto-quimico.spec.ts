import { describe, expect, it, jest } from '@jest/globals';
import type { ProdutoQuimicoRepository } from '../ports/produto-quimico-repository';
import { CriarProdutoQuimico } from './criar-produto-quimico';

describe('CriarProdutoQuimico', () => {
  // Dados do produto.
  const entrada = {
    nome: 'Produto de teste',
    numeroOnu: '1830',
    classeRisco: 'CLASSE_3',
    grupoCompatibilidade: 'CORROSIVOS',
    estadoFisico: 'LIQUIDO',
  };

  // Cria o repositório simulado.
  function criarCaso() {
    const repositorio: jest.Mocked<ProdutoQuimicoRepository> = {
      salvar: jest.fn<ProdutoQuimicoRepository['salvar']>(),
      atualizar: jest.fn<ProdutoQuimicoRepository['atualizar']>(),
      buscarPorId: jest.fn<ProdutoQuimicoRepository['buscarPorId']>(),
      buscarAtivoPorNome: jest
        .fn<ProdutoQuimicoRepository['buscarAtivoPorNome']>()
        .mockResolvedValue(null),
      listar: jest.fn<ProdutoQuimicoRepository['listar']>(),
    };

    return { repositorio, caso: new CriarProdutoQuimico(repositorio) };
  }

  // Cadastra um produto válido.
  it('Valida o cadastro de produto químico.', async () => {
    // Executa o cadastro.
    const { caso, repositorio } = criarCaso();
    const produto = await caso.executar(entrada);

    // Confere o resultado.
    expect(repositorio.salvar.mock.calls).toHaveLength(1);
    expect(produto.nome).toBe(entrada.nome);
    expect(produto.classeRisco).toBe('CLASSE_3');
  });

  // Rejeita nome vazio.
  it('Valida o bloqueio de cadastro sem nome.', async () => {
    // Tenta cadastrar sem nome.
    const { caso, repositorio } = criarCaso();

    // Confere o erro e que nada foi salvo.
    await expect(
      caso.executar({ ...entrada, nome: ' ' }),
    ).rejects.toMatchObject({ codigo: 'NOME_PRODUTO_OBRIGATORIO' });
    expect(repositorio.salvar.mock.calls).toHaveLength(0);
  });

  // Rejeita classe de risco ausente.
  it('Valida o bloqueio de cadastro sem classe de risco.', async () => {
    // Tenta cadastrar sem classe de risco.
    const { caso, repositorio } = criarCaso();

    // Confere o erro e que nada foi salvo.
    await expect(
      caso.executar({ ...entrada, classeRisco: undefined }),
    ).rejects.toMatchObject({ codigo: 'CLASSE_RISCO_INVALIDA' });
    expect(repositorio.salvar.mock.calls).toHaveLength(0);
  });
});
