import type { ErrorRequestHandler, RequestHandler } from 'express';
import {
  ErroConflito,
  ErroDominio,
  ErroNaoEncontrado,
  ErroRegraNegocio,
  ErroValidacao,
} from '../../../domain/errors/erro-dominio';

function statusDoErro(erro: ErroDominio): number {
  if (erro instanceof ErroValidacao) return 400;
  if (erro instanceof ErroNaoEncontrado) return 404;
  if (erro instanceof ErroConflito) return 409;
  if (erro instanceof ErroRegraNegocio) return 422;
  return 400;
}

export const rotaNaoEncontrada: RequestHandler = (req, res) => {
  res.status(404).json({
    codigo: 'ROTA_NAO_ENCONTRADA',
    mensagem: `Rota ${req.method} ${req.path} não encontrada`,
  });
};

export const tratarErros: ErrorRequestHandler = (erro, _req, res, _next) => {
  if (erro instanceof ErroDominio) {
    res.status(statusDoErro(erro)).json({
      codigo: erro.codigo,
      mensagem: erro.message,
      regra: erro.regra,
      detalhes: erro.detalhes,
    });
    return;
  }

  // JSON malformado no corpo da requisição
  if (erro instanceof SyntaxError && 'body' in erro) {
    res.status(400).json({
      codigo: 'JSON_INVALIDO',
      mensagem: 'Corpo da requisição não é um JSON válido',
    });
    return;
  }

  console.error(erro);
  res.status(500).json({
    codigo: 'ERRO_INTERNO',
    mensagem: 'Erro interno do servidor',
  });
};
