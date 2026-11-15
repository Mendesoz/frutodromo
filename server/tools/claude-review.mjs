import { spawn } from 'node:child_process';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';

// Somente revisao sob demanda; nao inicia um servico recorrente ou altera codigo.
const root = resolve(import.meta.dirname, '../..');
const output = resolve(root, 'server/.claude-results');
function cli(args, input = '') {
  // Windows precisa do wrapper .cmd. Argumentos sao literais internos, nunca texto do usuario.
  const command = process.platform === 'win32' ? 'claude ' + args.join(' ') : 'claude';
  const child = spawn(command, process.platform === 'win32' ? [] : args, {
    cwd: root, shell: process.platform === 'win32', windowsHide: true, stdio: ['pipe', 'pipe', 'pipe']
  });
  return new Promise((accept, reject) => {
    let stdout = ''; let stderr = '';
    child.stdout.on('data', data => { stdout += data; });
    child.stderr.on('data', data => { stderr += data; });
    child.on('error', reject);
    child.on('close', code => code ? reject(new Error('Claude falhou. Consulte autenticacao/limites no CLI; nenhum arquivo de jogo foi alterado.')) : accept(stdout));
    child.stdin.end(input);
  });
}
const status = JSON.parse(await cli(['auth', 'status']));
if (!status.loggedIn) throw new Error('Claude Code sem sessao autenticada.');
const prompt = await readFile(resolve(root, 'server/reviews/base-online.md'), 'utf8');
console.log('Claude: revisando a base online em paralelo, somente leitura.');
const result = JSON.parse(await cli(['-p', '--output-format', 'json', '--permission-mode', 'dontAsk', '--tools', 'Read,Glob,Grep', '--allowedTools', 'Read,Glob,Grep', '--strict-mcp-config', '--no-chrome'], prompt));
if (result.is_error || typeof result.result !== 'string') throw new Error('Claude nao concluiu a revisao.');
await mkdir(output, { recursive: true });
const path = resolve(output, 'base-online-' + new Date().toISOString().replace(/[:.]/g, '-') + '.md');
await writeFile(path, result.result, 'utf8');
await writeFile(resolve(output, 'latest.json'), JSON.stringify({ path, reviewedAt: new Date().toISOString(), promptHash: createHash('sha256').update(prompt).digest('hex') }, null, 2));
console.log('Revisao concluida: ' + path);
