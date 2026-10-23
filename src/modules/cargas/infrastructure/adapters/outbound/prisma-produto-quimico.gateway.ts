import type { PrismaClient } from '@prisma/client';
import type {
  ProdutoQuimicoGateway,
  ProdutoQuimicoResumo,
} from '../../../application/ports/produto-quimico-gateway';

/** Lê o produto direto da tabela, sem depender da camada de aplicação de produtos */
export class PrismaProdutoQuimicoGateway implements ProdutoQuimicoGateway {
  constructor(private readonly prisma: PrismaClient) {}

  async buscarPorId(id: string): Promise<ProdutoQuimicoResumo | null> {
    const produto = await this.prisma.produtoQuimico.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        numeroOnu: true,
        classeRisco: true,
        status: true,
      },
    });
    if (!produto) return null;

    const { status, ...resumo } = produto;
    return { ...resumo, ativo: status === 'ATIVO' };
  }
}
