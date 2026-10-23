import {
  ErroConflito,
  ErroNaoEncontrado,
} from '../../../../shared/domain/errors/erro-dominio';
import { CargaQuimica } from '../../domain/aggregates/carga-quimica';
import { Quantidade } from '../../domain/value-objects/quantidade';
import { criarUnidadeMedida } from '../../domain/value-objects/unidade-medida';
import {
  paraCargaQuimicaSaida,
  type CargaQuimicaSaida,
  type RegistrarCargaQuimicaEntrada,
} from '../dto/carga-quimica.dto';
import type { CargaQuimicaRepository } from '../ports/carga-quimica-repository';
import type { ProdutoQuimicoGateway } from '../ports/produto-quimico-gateway';
import type { UsuarioGateway } from '../ports/usuario-gateway';
import { garantirAutorValido } from './validacoes-comuns';

export class RegistrarCargaQuimica {
  constructor(
    private readonly repositorio: CargaQuimicaRepository,
    private readonly produtos: ProdutoQuimicoGateway,
    private readonly usuarios: UsuarioGateway,
  ) {}

  async executar(
    entrada: RegistrarCargaQuimicaEntrada,
    autorId: string,
  ): Promise<CargaQuimicaSaida> {
    const quantidade = Quantidade.criar(
      entrada.quantidade,
      criarUnidadeMedida(entrada.unidadeMedida),
    );

    await garantirAutorValido(this.usuarios, autorId);

    const produto = await this.produtos.buscarPorId(entrada.produtoId);
    if (!produto) {
      throw new ErroNaoEncontrado(
        'PRODUTO_QUIMICO_NAO_ENCONTRADO',
        'Produto químico não encontrado',
        'RN004',
      );
    }

    const responsavel = await this.usuarios.buscarPorId(
      entrada.responsavelTecnicoId,
    );
    if (!responsavel) {
      throw new ErroNaoEncontrado(
        'RESPONSAVEL_TECNICO_NAO_ENCONTRADO',
        'Responsável técnico não encontrado',
        'RN009',
      );
    }

    const carga = CargaQuimica.registrar({
      codigo: entrada.codigo,
      produto,
      quantidade,
      origem: entrada.origem,
      destino: entrada.destino,
      responsavelTecnico: {
        id: responsavel.id,
        ativo: responsavel.ativo,
        habilitado: responsavel.responsavelTecnico,
      },
      documentacaoValida: entrada.documentacaoValida ?? false,
      dataEntrada: entrada.dataEntrada ?? new Date(),
      autorId,
    });

    // Checagem antecipada para uma mensagem clara; o UNIQUE do banco barra
    // registros simultâneos e o repositório converte em ErroConflito.
    if (await this.repositorio.buscarPorCodigo(carga.codigo)) {
      throw new ErroConflito(
        'CODIGO_CARGA_DUPLICADO',
        'Já existe uma carga química com este código',
        'RN026',
      );
    }

    await this.repositorio.registrar(carga);
    return paraCargaQuimicaSaida(carga);
  }
}
