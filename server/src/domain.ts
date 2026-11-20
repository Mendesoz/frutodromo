import { createHash } from 'node:crypto';

export class GameError extends Error {
  constructor(public status: number, public code: string) { super(code); }
}

function stable(value: any): string {
  if (value && typeof value === 'object' && !Array.isArray(value))
    return '{' + Object.keys(value).sort().map(k => JSON.stringify(k) + ':' + stable(value[k])).join(',') + '}';
  return JSON.stringify(value);
}
export function fingerprint(command: unknown) { return createHash('sha256').update(stable(command)).digest('hex'); }
