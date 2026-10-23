import { randomBytes, scrypt } from 'node:crypto';
import type { HashSenha } from '../../../application/ports/hash-senha';
import type { Senha } from '../../../domain/value-objects/senha';

const TAMANHO_SALT = 16;
const TAMANHO_HASH = 64;

function scryptAsync(senha: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(senha, salt, TAMANHO_HASH, (erro, hash) =>
      erro ? reject(erro) : resolve(hash),
    );
  });
}

/**
 * Hash com scrypt (node:crypto), sem dependências nativas.
 * Formato armazenado: scrypt$<salt hex>$<hash hex>
 */
export class ScryptHashSenha implements HashSenha {
  async gerar(senha: Senha): Promise<string> {
    const salt = randomBytes(TAMANHO_SALT);
    const hash = await scryptAsync(senha.valor, salt);
    return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`;
  }
}
