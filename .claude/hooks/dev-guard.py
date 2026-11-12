#!/usr/bin/env python3
"""Guarda do agente developer.

Roda antes de cada comando Bash do desenvolvedor (hook PreToolUse).
Sai com código 2 para BLOQUEAR; a mensagem em stderr volta pro agente.

O desenvolvedor pode editar arquivos e rodar testes. Ele NÃO pode:
- fazer commit, push, merge, trocar de branch ou mexer no histórico;
- descartar mudanças (reset, restore, checkout de arquivo, stash, clean);
- fechar, editar ou comentar issues/PRs no GitHub.
As mudanças ficam no working tree; o commit fica a cargo do Eric.
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

if re.search(r"\bgit\b[^|;&]*\b(commit|push|merge|rebase|cherry-pick|revert|tag|pull|am|filter-branch)\b", low):
    block("commit, push, merge e mudanças no histórico não são permitidos. Deixe as alterações no working tree; o commit fica a cargo do Eric.")
if re.search(r"\bgit\b[^|;&]*\b(reset|restore|checkout|switch|stash|clean|branch\s+-[dDmM])\b", low):
    block("não troque de branch nem descarte mudanças com git. Se precisar desfazer algo seu, edite o arquivo de volta.")
if re.search(r"\bgh\s+(issue|pr|release|repo|label|workflow|secret|variable)\s+(create|close|reopen|edit|comment|delete|merge|review|lock|unlock|transfer)\b", low):
    block("não altere issues/PRs. Liste no relatório quais issues a correção resolve; quem fecha é a sessão principal depois da verificação.")
if re.search(r"\bgh\s+api\b", low) and re.search(r"(-x|--method)\s*(post|put|patch|delete)|\s-f\s|\s-F\s|--field|--raw-field|--input", low):
    block("gh api só pode ser usado para leitura (GET).")
sys.exit(0)
