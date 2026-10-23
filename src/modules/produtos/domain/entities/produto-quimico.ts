import { randomUUID } from 'node:crypto';
import {
  ErroRegraNegocio,
  ErroValidacao,
} from '../../../../shared/domain/errors/erro-dominio';
import type { ClasseRisco } from '../value-objects/classe-risco';
import type { EstadoFisico } from '../value-objects/estado-fisico';
import type { GrupoCompatibilidade } from '../value-objects/grupo-compatibilidade';
import type { StatusProduto } from '../value-objects/status-produto';

const NOME_TAMANHO_MAXIMO = 150;
const NUMERO_ONU_TAMANHO_MAXIMO = 10;

export interface ProdutoQuimicoProps {
  id: string;
  nome: string;
  descricao: string | null;
  numeroOnu: string;
  classeRisco: ClasseRisco;
  grupoCompatibilidade: GrupoCompatibilidade;
  estadoFisico: EstadoFisico | null;
  status: StatusProduto;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface DadosCadastraisProdutoQuimico {
  nome: string;
  descricao?: string | null;
  numeroOnu: string;
  classeRisco: ClasseRisco;
  grupoCompatibilidade: GrupoCompatibilidade;
  estadoFisico?: EstadoFisico | null;
}

export interface CriarProdutoQuimicoProps extends DadosCadastraisProdutoQuimico {
  status?: StatusProduto;
}

export class ProdutoQuimico {
  private constructor(private props: ProdutoQuimicoProps) {}

  static criar(dados: CriarProdutoQuimicoProps): ProdutoQuimico {
    const agora = new Date();
    return new ProdutoQuimico({
      id: randomUUID(),
      ...ProdutoQuimico.validarDadosCadastrais(dados),
      status: dados.status ?? 'ATIVO',
      criadoEm: agora,
      atualizadoEm: agora,
    });
  }

  /** Reconstrói um produto já persistido */
  static restaurar(props: ProdutoQuimicoProps): ProdutoQuimico {
    return new ProdutoQuimico({ ...props });
  }

  get id(): string {
    return this.props.id;
  }
  get nome(): string {
    return this.props.nome;
  }
  get descricao(): string | null {
    return this.props.descricao;
  }
  get numeroOnu(): string {
    return this.props.numeroOnu;
  }
  get classeRisco(): ClasseRisco {
    return this.props.classeRisco;
  }
  get grupoCompatibilidade(): GrupoCompatibilidade {
    return this.props.grupoCompatibilidade;
  }
  get estadoFisico(): EstadoFisico | null {
    return this.props.estadoFisico;
  }
  get status(): StatusProduto {
    return this.props.status;
  }
  get criadoEm(): Date {
    return this.props.criadoEm;
  }
  get atualizadoEm(): Date {
    return this.props.atualizadoEm;
  }

  estaAtivo(): boolean {
    return this.props.status === 'ATIVO';
  }

  /** Substitui os dados cadastrais (PUT). O status muda apenas por inativar() */
  atualizar(dados: DadosCadastraisProdutoQuimico): void {
    this.props = {
      ...this.props,
      ...ProdutoQuimico.validarDadosCadastrais(dados),
      atualizadoEm: new Date(),
    };
  }

  /** Exclusão lógica (RN015): cargas já registradas continuam válidas (RN003) */
  inativar(): void {
    if (!this.estaAtivo()) {
      throw new ErroRegraNegocio(
        'PRODUTO_QUIMICO_JA_INATIVO',
        'Produto químico já está inativo',
      );
    }
    this.props.status = 'INATIVO';
    this.props.atualizadoEm = new Date();
  }

  private static validarDadosCadastrais(dados: DadosCadastraisProdutoQuimico) {
    const nome = dados.nome?.trim();
    if (!nome) {
      throw new ErroValidacao(
        'NOME_PRODUTO_OBRIGATORIO',
        'Nome do produto químico é obrigatório',
        'RN001',
      );
    }
    if (nome.length > NOME_TAMANHO_MAXIMO) {
      throw new ErroValidacao(
        'NOME_PRODUTO_INVALIDO',
        `O nome do produto químico deve ter no máximo ${NOME_TAMANHO_MAXIMO} caracteres`,
      );
    }

    const numeroOnu = dados.numeroOnu?.trim();
    if (!numeroOnu) {
      throw new ErroValidacao(
        'NUMERO_ONU_OBRIGATORIO',
        'Número ONU é obrigatório',
      );
    }
    if (numeroOnu.length > NUMERO_ONU_TAMANHO_MAXIMO) {
      throw new ErroValidacao(
        'NUMERO_ONU_INVALIDO',
        `O número ONU deve ter no máximo ${NUMERO_ONU_TAMANHO_MAXIMO} caracteres`,
      );
    }

    if (!dados.classeRisco) {
      throw new ErroValidacao(
        'CLASSE_RISCO_INVALIDA',
        'Classe de risco é obrigatória',
        'RN002',
      );
    }

    return {
      nome,
      descricao: dados.descricao?.trim() || null,
      numeroOnu,
      classeRisco: dados.classeRisco,
      grupoCompatibilidade: dados.grupoCompatibilidade,
      estadoFisico: dados.estadoFisico ?? null,
    };
  }
}
