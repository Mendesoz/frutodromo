#!/bin/sh
# copia a branch atual para ${QA_SITE:-/tmp/qa9/site} com um coletor de erros no topo do <head>
rm -rf ${QA_SITE:-/tmp/qa9/site} && mkdir -p /tmp/qa9/site && cd /home/claude/frutodromo-repo && git ls-files | tar -cf - -T - | tar -xf - -C /tmp/qa9/site
for f in index.html; do python3 - "$f" <<'PY'
import sys;p='${QA_SITE:-/tmp/qa9/site}/'+sys.argv[1];s=open(p).read()
inj='<script>window.__errs=[];addEventListener("error",e=>__errs.push(String(e.message)+" @"+(e.filename||"").split("/").pop()+":"+e.lineno));addEventListener("unhandledrejection",e=>__errs.push("rej "+e.reason));</script>'
s=s.replace('<head>','<head>'+inj,1);open(p,'w').write(s)
PY
done
