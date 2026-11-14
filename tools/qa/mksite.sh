#!/bin/sh
# copia a branch atual para ${QA_SITE:-/tmp/qa9/site} com um coletor de erros no topo do <head>
SITE=${QA_SITE:-/tmp/qa9/site}; export SITE
rm -rf "$SITE" && mkdir -p "$SITE" && cd "$(dirname "$0")/../.." && git ls-files | tar -cf - -T - | tar -xf - -C "$SITE"
python3 - <<'PY'
import os;p=os.environ['SITE']+'/index.html';s=open(p).read()
inj='<script>window.__errs=[];addEventListener("error",e=>__errs.push(String(e.message)+" @"+(e.filename||"").split("/").pop()+":"+e.lineno));addEventListener("unhandledrejection",e=>__errs.push("rej "+e.reason));</script>'
s=s.replace('<head>','<head>'+inj,1);open(p,'w').write(s)
PY
