import { randomUUID } from 'node:crypto';
import {
  ErroRegraNegocio,
  ErroValidacao,
} from '../../../../shared/domain/errors/erro-dominio';
import type { ClasseRisco } from '../../../produtos/domain/value-objects/classe-risco';
import type { EventoCarga, TipoEventoCarga } from '../events/evento-carga';
import type { Quantidade } from '../value-objects/quantidade';
import {
  ehEstadoTerminal,
  TRANSICOES_PERMITIDAS,
  transicaoPermitida,
  type StatusCarga,
} from '../value-objects/status-carga';

const CODIGO_TAMANHO_MAXIMO = 30;
const LOCAL_TAMANHO_MAXIMO = 150;

/** Dados do produto copiados no registro, imunes a edições posteriores (RN012) */
export interface SnapshotProduto {
  id: string;
  nome: string;
  numeroOnu: string;
  classeRisco: ClasseRisco;
}

export interface CargaQuimicaProps {
  id: string;
  codigo: string;
  produto: SnapshotProduto;
  quantidade: Quantidade;
  origem: string;
  destino: string;
  responsavelTecnicoId: string;
  status: StatusCarga;
  documentacaoValida: boolean;
  dataEntrada: Date;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface RegistrarCargaQuimicaProps {
  codigo: string;
  produto: SnapshotProduto & { ativo: boolean };
  quantidade: Quantidade;
  origem: string;
  destino: string;
  responsavelTecnico: { id: string; ativo: boolean; habilitado: boolean };
  documentacaoValida: boolean;
  dataEntrada: Date;
  autorId: string;
}

export interface ContextoMudancaStatus {
  autorId: string;
  motivo?: string;
}

/**
 * Agregado raiz: concentra as regras do ciclo de vida da carga
 * (máquina de estados, liberação, bloqueio e cancelamento) e acumula os
 * eventos de histórico, gravados pelo repositório na mesma transação.
 */
export class CargaQuimica {
  private eventos: EventoCarga[] = [];
  private statusLido: StatusCarga;

  private constructor(private props: CargaQuimicaProps) {
    this.statusLido = props.status;
  }

  static registrar(dados: RegistrarCargaQuimicaProps): CargaQuimica {
    if (!dados.produto.ativo) {
      throw new ErroRegraNegocio(
        'PRODUTO_QUIMICO_INATIVO',
        'Produto químico está inativo e não pode ser usado em novas cargas',
        'RN003',
      );
    }
    if (!dados.responsavelTecnico.habilitado) {
      throw new ErroRegraNegocio(
        'RESPONSAVEL_TECNICO_INVALIDO',
        'O usuário informado não possui o cargo de responsável técnico',
        'RN009',
      );
    }
    if (!dados.responsavelTecnico.ativo) {
      throw new ErroRegraNegocio(
        'RESPONSAVEL_TECNICO_INATIVO',
        'Responsável técnico está inativo',
        'RN009',
      );
    }
    if (Number.isNaN(dados.dataEntrada.getTime())) {
      throw new ErroValidacao(
        'DATA_ENTRADA_INVALIDA',
        'Data de entrada inválida',
      );
    }

    const agora = new Date();
    const carga = new CargaQuimica({
      id: randomUUID(),
      codigo: textoObrigatorio(
        dados.codigo,
        CODIGO_TAMANHO_MAXIMO,
        'CODIGO_CARGA_OBRIGATORIO',
        'Código da carga é obrigatório',
        'O código da carga',
      ),
      produto: {
        id: dados.produto.id,
        nome: dados.produto.nome,
        numeroOnu: dados.produto.numeroOnu,
        classeRisco: dados.produto.classeRisco,
      },
      quantidade: dados.quantidade,
      origem: textoObrigatorio(
        dados.origem,
        LOCAL_TAMANHO_MAXIMO,
        'ORIGEM_OBRIGATORIA',
        'Origem da carga é obrigatória',
        'A origem',
      ),
      destino: textoObrigatorio(
        dados.destino,
        LOCAL_TAMANHO_MAXIMO,
        'DESTINO_OBRIGATORIO',
        'Destino da carga é obrigatório',
        'O destino',
      ),
      responsavelTecnicoId: dados.responsavelTecnico.id,
      status: 'REGISTRADA',
      documentacaoValida: dados.documentacaoValida,
      dataEntrada: dados.dataEntrada,
      criadoEm: agora,
      atualizadoEm: agora,
    });

    carga.registrarEvento('REGISTRO', null, 'REGISTRADA', {
      autorId: dados.autorId,
    });
    return carga;
  }

  /** Reconstrói uma carga já persistida */
  static restaurar(props: CargaQuimicaProps): CargaQuimica {
    return new CargaQuimica({ ...props, produto: { ...props.produto } });
  }

  get id(): string {
    return this.props.id;
  }
  get codigo(): string {
    return this.props.codigo;
  }
  get produto(): Readonly<SnapshotProduto> {
    return this.props.produto;
  }
  get quantidade(): Quantidade {
    return this.props.quantidade;
  }
  get origem(): string {
    return this.props.origem;
  }
  get destino(): string {
    return this.props.destino;
  }
  get responsavelTecnicoId(): string {
    return this.props.responsavelTecnicoId;
  }
  get status(): StatusCarga {
    return this.props.status;
  }
  get documentacaoValida(): boolean {
    return this.props.documentacaoValida;
  }
  get dataEntrada(): Date {
    return this.props.dataEntrada;
  }
  get criadoEm(): Date {
    return this.props.criadoEm;
  }
  get atualizadoEm(): Date {
    return this.props.atualizadoEm;
  }

  /** Status no momento da leitura; o repositório usa para detectar concorrência */
  get statusPersistido(): StatusCarga {
    return this.statusLido;
  }

  /** Eventos ainda não gravados no histórico */
  get eventosPendentes(): readonly EventoCarga[] {
    return this.eventos;
  }

  /** Chamado pelo repositório após gravar a carga e os eventos */
  confirmarPersistencia(): void {
    this.eventos = [];
    this.statusLido = this.props.status;
  }

  /**
   * Transição genérica (PATCH /status). Liberação, bloqueio e cancelamento
   * passam pelas mesmas regras dos endpoints dedicados.
   */
  alterarStatus(
    novoStatus: StatusCarga,
    contexto: ContextoMudancaStatus,
  ): void {
    switch (novoStatus) {
      case 'LIBERADA':
        return this.liberar(contexto);
      case 'BLOQUEADA':
        return this.bloquear(contexto);
      case 'CANCELADA':
        return this.cancelar(contexto);
    }

    if (novoStatus === 'EM_MOVIMENTACAO' && this.status === 'BLOQUEADA') {
      throw new ErroRegraNegocio(
        'CARGA_BLOQUEADA',
        'Carga bloqueada — movimentação proibida',
        'RN005',
      );
    }
    if (novoStatus === 'FINALIZADA' && this.status === 'EM_INSPECAO') {
      throw new ErroRegraNegocio(
        'CARGA_NAO_LIBERADA',
        'Carga em inspeção não pode ser finalizada sem antes ser liberada',
        'RN010',
      );
    }

    this.transicionar(novoStatus, 'MUDANCA_STATUS', contexto);
  }

  liberar(contexto: ContextoMudancaStatus): void {
    if (this.status === 'CANCELADA') {
      throw new ErroRegraNegocio(
        'CARGA_CANCELADA',
        'Carga cancelada não pode ser liberada',
        'RN006',
      );
    }
    if (this.status === 'BLOQUEADA') {
      throw new ErroRegraNegocio(
        'CARGA_BLOQUEADA',
        'Carga bloqueada não pode ser liberada',
        'RN005',
      );
    }
    this.validarTransicao('LIBERADA');
    if (!this.documentacaoValida) {
      throw new ErroRegraNegocio(
        'DOCUMENTACAO_PENDENTE',
        'Não é possível liberar: a carga não possui documentação obrigatória válida',
        'RN007',
      );
    }
    this.transicionar('LIBERADA', 'LIBERACAO', contexto);
  }

  bloquear(contexto: ContextoMudancaStatus): void {
    const motivo = exigirMotivo(contexto.motivo, 'bloquear');
    if (this.status === 'FINALIZADA') {
      throw new ErroRegraNegocio(
        'CARGA_FINALIZADA',
        'Carga finalizada não pode ser bloqueada',
        'RN010',
      );
    }
    if (this.status === 'BLOQUEADA') {
      throw new ErroRegraNegocio(
        'CARGA_JA_BLOQUEADA',
        'Carga já está bloqueada',
        'RN010',
      );
    }
    this.transicionar('BLOQUEADA', 'BLOQUEIO', { ...contexto, motivo });
  }

  cancelar(contexto: ContextoMudancaStatus): void {
    const motivo = exigirMotivo(contexto.motivo, 'cancelar');
    if (this.status === 'FINALIZADA') {
      throw new ErroRegraNegocio(
        'CARGA_FINALIZADA',
        'Carga já finalizada não pode ser cancelada',
        'RN010',
      );
    }
    if (this.status === 'CANCELADA') {
      throw new ErroRegraNegocio(
        'CARGA_JA_CANCELADA',
        'Carga já está cancelada',
        'RN006',
      );
    }
    this.transicionar('CANCELADA', 'CANCELAMENTO', { ...contexto, motivo });
  }

  private transicionar(
    novoStatus: StatusCarga,
    tipoEvento: TipoEventoCarga,
    contexto: ContextoMudancaStatus,
  ): void {
    this.validarTransicao(novoStatus);
    const anterior = this.props.status;
    this.props.status = novoStatus;
    this.props.atualizadoEm = new Date();
    this.registrarEvento(tipoEvento, anterior, novoStatus, contexto);
  }

  private validarTransicao(novoStatus: StatusCarga): void {
    if (ehEstadoTerminal(this.status)) {
      throw new ErroRegraNegocio(
        'CARGA_EM_ESTADO_TERMINAL',
        `Carga com status ${this.status} não pode sofrer novas alterações de status`,
        'RN010',
        { statusAtual: this.status, statusSolicitado: novoStatus },
      );
    }
    if (!transicaoPermitida(this.status, novoStatus)) {
      throw new ErroRegraNegocio(
        'TRANSICAO_STATUS_INVALIDA',
        `Transição de status inválida: ${this.status} → ${novoStatus}`,
        'RN010',
        {
          statusAtual: this.status,
          statusSolicitado: novoStatus,
          transicoesPermitidas: TRANSICOES_PERMITIDAS[this.status],
        },
      );
    }
  }

  private registrarEvento(
    tipo: TipoEventoCarga,
    statusAnterior: StatusCarga | null,
    statusNovo: StatusCarga,
    contexto: ContextoMudancaStatus,
  ): void {
    this.eventos.push({
      tipo,
      statusAnterior,
      statusNovo,
      motivo: contexto.motivo?.trim() || null,
      autorId: contexto.autorId,
      ocorridoEm: this.props.atualizadoEm,
    });
  }
}

function exigirMotivo(motivo: string | undefined, acao: string): string {
  const normalizado = motivo?.trim();
  if (!normalizado) {
    throw new ErroValidacao(
      'MOTIVO_OBRIGATORIO',
      `Motivo é obrigatório para ${acao} a carga`,
    );
  }
  return normalizado;
}

function textoObrigatorio(
  valor: string,
  tamanhoMaximo: number,
  codigoErro: string,
  mensagemObrigatorio: string,
  descricaoCampo: string,
): string {
  const normalizado = valor?.trim();
  if (!normalizado) {
    throw new ErroValidacao(codigoErro, mensagemObrigatorio);
  }
  if (normalizado.length > tamanhoMaximo) {
    throw new ErroValidacao(
      codigoErro,
      `${descricaoCampo} deve ter no máximo ${tamanhoMaximo} caracteres`,
    );
  }
  return normalizado;
}
