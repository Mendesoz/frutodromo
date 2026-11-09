#!/usr/bin/env python3
"""Guarda do agente frutodromo-developer.

Roda antes de cada comando Bash do desenvolvedor (hook PreToolUse).
Sai com código 2 para BLOQUEAR; a mensagem em stderr volta pro agente.

O desenvolvedor pode editar, testar e fazer commits locais. Ele NÃO pode:
- publicar (git push) nem reescrever histórico (reset --hard, push --force, rebase);
- fechar, editar ou comentar issues/PRs no GitHub.
Publicar e fechar issues só acontece depois que o testador verificar a correção
e a pessoa aprovar; isso fica com a sessão principal.
"""
import json, re, sys


def strip_heredocs(c):
    out, lines, i = [], c.split("\n"), 0
    while i < len(lines):
        out.append(lines[i])
        tags = re.findall(r"<<-?\s*['\"]?(\w+)['\"]?", lines[i])
        i += 1
        for tag in tags:
            while i < len(lines) and lines[i].strip() != tag:
                i += 1
            i += 1
    return "\n".join(out)


def block(msg):
    print("BLOQUEADO pelo guarda do desenvolvedor: " + msg, file=sys.stderr)
    sys.exit(2)


data = json.load(sys.stdin)
low = strip_heredocs((data.get("tool_input") or {}).get("command", "")).lower()

if re.search(r"\bgit\b[^|;&]*\bpush\b", low):
    block("git push fica com a sessão principal, depois da verificação do testador e da aprovação da pessoa. Faça só o commit local.")
if re.search(r"\bgit\b[^|;&]*\b(reset\s+--hard|rebase|filter-branch|clean\s+-[a-z]*f)", low):
    block("comandos que apagam trabalho ou reescrevem histórico não são permitidos.")
if re.search(r"\bgh\s+(issue|pr|release|repo|label|workflow|secret|variable)\s+(create|close|reopen|edit|comment|delete|merge|review|lock|unlock|transfer)\b", low):
    block("não altere issues/PRs. Liste no relatório quais issues a correção resolve; quem fecha é a sessão principal depois da verificação.")
if re.search(r"\bgh\s+api\b", low) and re.search(r"(-x|--method)\s*(post|put|patch|delete)|\s-f\s|\s-F\s|--field|--raw-field|--input", low):
    block("gh api só pode ser usado para leitura (GET).")
sys.exit(0)
