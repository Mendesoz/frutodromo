#!/usr/bin/env python3
"""Guarda dos agentes de somente leitura: tester, code-reviewer e art-director.

Roda antes de cada comando Bash do testador (hook PreToolUse).
Sai com código 2 para BLOQUEAR o comando; a mensagem em stderr volta pro agente.

Regras:
- O testador só pode escrever dentro de /tmp/ (scripts de teste, prints, relatórios, cópia do jogo).
- Nada de git que altere o repositório, nada de gh que altere o GitHub.
- Nada de instalar pacotes dentro do projeto (npm install etc.).
- Se algum arquivo versionado do projeto mudar durante a sessão, todos os comandos seguintes são bloqueados.
"""
import json, os, re, shlex, subprocess, sys

PROJ = os.environ.get("CLAUDE_PROJECT_DIR") or os.getcwd()
QA = "/tmp/frutodromo-qa"


def block(msg):
    print("BLOQUEADO pelo guarda de somente leitura (tester, code-reviewer, art-director): " + msg, file=sys.stderr)
    sys.exit(2)


def git_state():
    try:
        out = subprocess.run(["git", "-C", PROJ, "status", "--porcelain"], capture_output=True, text=True, timeout=20).stdout
        diff = subprocess.run(["git", "-C", PROJ, "diff", "HEAD"], capture_output=True, text=True, timeout=20).stdout
        head = subprocess.run(["git", "-C", PROJ, "rev-parse", "HEAD"], capture_output=True, text=True, timeout=20).stdout
        return head + "\n" + out + "\n" + diff
    except Exception:
        return None


# remove o corpo dos heredocs (cat > /tmp/x.py <<'EOF' ... EOF): é conteúdo, não comando
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


data = json.load(sys.stdin)
cmd = (data.get("tool_input") or {}).get("command", "")

# 1) O projeto não pode ter mudado desde o primeiro comando desta execução do testador.
#    A foto inicial é separada por execução (agent_id), então cada rodada nova começa do zero.
os.makedirs(QA, exist_ok=True)
run_id = str(data.get("agent_id") or data.get("transcript_path") or data.get("session_id") or "sessao")
BASE = os.path.join(QA, ".baseline-" + re.sub(r"[^A-Za-z0-9_-]", "_", run_id)[-80:])
state = git_state()
if state is not None:
    if not os.path.exists(BASE):
        open(BASE, "w").write(state)
    elif open(BASE).read() != state:
        block("arquivos do projeto mudaram durante o teste. Pare, não tente desfazer e informe isso no relatório.")

low = strip_heredocs(cmd).lower()

# 2) git e gh: só leitura.
if re.search(r"\bgit\b[^|;&]*\b(commit|push|add|rm|mv|reset|checkout|switch|restore|stash|merge|rebase|cherry-pick|revert|tag|clean|apply|am|init|clone|pull|fetch)\b", low):
    block("o testador não pode alterar o repositório com git (só leitura: status, log, diff, show).")
if re.search(r"\bgh\b", low):
    if re.search(r"\bgh\s+(issue|pr|release|repo|label|workflow|run|secret|variable|gist)\s+(create|close|reopen|edit|comment|delete|merge|review|lock|unlock|transfer|pin|unpin|develop|fork|rename|archive|enable|disable|cancel|rerun)\b", low):
        block("o testador não pode alterar o GitHub. Escreva o problema no relatório; quem abre issue é você (pessoa) ou a sessão principal.")
    if re.search(r"\bgh\s+api\b", low) and re.search(r"(-x|--method)\s*(post|put|patch|delete)|\s-f\s|\s-F\s|--field|--raw-field|--input", low):
        block("gh api só pode ser usado para leitura (GET).")

# 3) Instalação de pacotes dentro do projeto.
if re.search(r"\b(npm|pnpm|yarn)\s+(i|install|add|ci|init|update|remove|uninstall)\b", low) or re.search(r"\bnpx\s+playwright\s+install\b", low):
    block("não instale pacotes pelo projeto. Use o Playwright para Python que já está instalado (python3 + playwright).")

# 4) Escrita em disco: só dentro de /tmp/.
def ok_path(p):
    p = p.strip("'\"")
    if p in ("/dev/null", "/dev/stdout", "/dev/stderr") or p.startswith("&"):
        return True
    return os.path.abspath(os.path.expanduser(p)).startswith("/tmp/")

shell = strip_heredocs(cmd)
try:
    parts = shlex.split(shell.replace("\n", " ; "), posix=True)
except ValueError:
    parts = shell.split()

for k, t in enumerate(parts):
    m = re.match(r"^(\d*|&)>{1,2}(.*)$", t)
    if m:
        target = m.group(2) or (parts[k + 1] if k + 1 < len(parts) else "")
        if target and not ok_path(target):
            block(f"redirecionamento para '{target}'. Só é permitido escrever dentro de /tmp/.")

WRITERS = {"rm", "rmdir", "touch", "mkdir", "chmod", "chown", "truncate", "tee", "dd", "ln", "cp", "mv", "rsync", "install", "unzip", "tar"}
segs, cur = [], []
for t in parts:
    if t in (";", "&&", "||", "|"):
        segs.append(cur); cur = []
    else:
        cur.append(t)
segs.append(cur)
for s in segs:
    if not s:
        continue
    exe = os.path.basename(s[0])
    args = [a for a in s[1:] if not a.startswith("-")]
    if exe == "sed" and any(a.startswith("-i") or a == "--in-place" for a in s[1:]):
        block("sed -i edita arquivos. O testador não edita arquivos.")
    if exe == "perl" and any(a.startswith("-i") for a in s[1:]):
        block("perl -i edita arquivos. O testador não edita arquivos.")
    if exe in ("cp", "rsync", "install", "ln"):
        if args and not ok_path(args[-1]):
            block(f"{exe} com destino '{args[-1]}'. O destino precisa estar dentro de /tmp/ (ex.: cópia do jogo em /tmp/frutodromo-qa/).")
    elif exe in ("tar", "unzip"):
        if not any(a.startswith("/tmp/") for a in s[1:]):
            block(f"{exe} só pode extrair/gravar dentro de /tmp/.")
    elif exe in WRITERS:
        bad = [a for a in args if not ok_path(a)]
        if exe == "dd":
            bad = [a for a in s[1:] if a.startswith("of=") and not ok_path(a[3:])]
        if bad:
            block(f"{exe} em '{bad[0]}'. Só é permitido mexer em arquivos dentro de /tmp/.")

# 5) Scripts Python/Node: só se o script estiver em /tmp/ ou for inline de leitura.
for s in segs:
    if not s:
        continue
    exe = os.path.basename(s[0])
    if exe.startswith("python") or exe == "node":
        files = [a for a in s[1:] if not a.startswith("-") and (a.endswith(".py") or a.endswith(".js") or a.endswith(".mjs"))]
        for f in files:
            if not ok_path(f) and f != "--check":
                if exe == "node" and "--check" in s:
                    continue
                block(f"execute scripts de teste a partir de /tmp/ (recebido: {f}).")

sys.exit(0)
