import { describe, expect, it, jest } from '@jest/globals';
import type { CargaQuimicaRepository } from '../ports/carga-quimica-repository';
import type { ProdutoQuimicoGateway } from '../ports/produto-quimico-gateway';
import type { UsuarioGateway } from '../ports/usuario-gateway';
import { Quantidade } from '../../domain/value-objects/quantidade';
import { criarUnidadeMedida } from '../../domain/value-objects/unidade-medida';
import { RegistrarCargaQuimica } from './registrar-carga-quimica';

describe('RegistrarCargaQuimica', () => {
  // Dados da carga.
  const entrada = {
    codigo: 'CARGA-001',
    produtoId: 'produto-1',
    quantidade: 10,
    unidadeMedida: 'KG',
    origem: 'Origem',
    destino: 'Destino',
    responsavelTecnicoId: 'tecnico-1',
    documentacaoValida: true,
  };

  // Produto usado no teste.
  const produto = {
    id: 'produto-1',
    nome: 'Produto de teste',
    numeroOnu: '1830',
    classeRisco: 'CLASSE_3' as const,
    ativo: true,
  };

  // Cria dependências simuladas.
  function criarCaso() {
    const repositorio: jest.Mocked<CargaQuimicaRepository> = {
      registrar: jest.fn<CargaQuimicaRepository['registrar']>(),
      salvarMudancaStatus:
        jest.fn<CargaQuimicaRepository['salvarMudancaStatus']>(),
      buscarPorId: jest.fn<CargaQuimicaRepository['buscarPorId']>(),
      buscarPorCodigo: jest
        .fn<CargaQuimicaRepository['buscarPorCodigo']>()
        .mockResolvedValue(null),
      listar: jest.fn<CargaQuimicaRepository['listar']>(),
    };
    const produtos: jest.Mocked<ProdutoQuimicoGateway> = {
      buscarPorId: jest
        .fn<ProdutoQuimicoGateway['buscarPorId']>()
        .mockResolvedValue(produto),
    };
    const usuarios: jest.Mocked<UsuarioGateway> = {
      buscarPorId: jest
        .fn<UsuarioGateway['buscarPorId']>()
        .mockResolvedValueOnce({
          id: 'autor-1',
          ativo: true,
          responsavelTecnico: false,
        })
        .mockResolvedValue({
          id: 'tecnico-1',
          ativo: true,
          responsavelTecnico: true,
        }),
    };

    return {
      repositorio,
      produtos,
      caso: new RegistrarCargaQuimica(repositorio, produtos, usuarios),
    };
  }

  // Registra uma carga válida.
  it('Valida o registro de carga química.', async () => {
    // Executa o registro.
    const { caso, repositorio } = criarCaso();
    const carga = await caso.executar(entrada, 'autor-1');

    // Confere o resultado.
    expect(repositorio.registrar.mock.calls).toHaveLength(1);
    expect(carga.codigo).toBe('CARGA-001');
    expect(carga.status).toBe('REGISTRADA');
  });

  // Rejeita produto inativo.
  it('Valida o bloqueio de carga com produto inativo.', async () => {
    // Desativa o produto.
    const { caso, produtos, repositorio } = criarCaso();
    produtos.buscarPorId.mockResolvedValue({ ...produto, ativo: false });

    // Confere o erro e que nada foi salvo.
    await expect(caso.executar(entrada, 'autor-1')).rejects.toMatchObject({
      codigo: 'PRODUTO_QUIMICO_INATIVO',
    });
    expect(repositorio.registrar.mock.calls).toHaveLength(0);
  });

  // Rejeita quantidade zero ou negativa.
  it.each([0, -1])(
    'Valida o bloqueio de carga com quantidade inválida.',
    (quantidade) => {
      // Valida a quantidade diretamente, sem usar dependências externas.
      expect(() =>
        Quantidade.criar(quantidade, criarUnidadeMedida('KG')),
      ).toThrow('Quantidade da carga deve ser maior que zero');
    },
  );
});
