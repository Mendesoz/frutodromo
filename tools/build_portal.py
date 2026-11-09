"""Gera a versão do Frutódromo para um portal de jogos (hoje: CrazyGames).

Saída: dist/<portal>/index.html (arquivo único) e dist/frutodromo-<portal>.zip pronto para enviar.
A página ganha o SDK do portal e window.PORTAL_NAME; o jogo então liga anúncios, eventos de gameplay
e tira links externos e o pedido de localização. Sem isso (GitHub, artifact) nada muda.
Uso: python3 tools/build_portal.py crazygames
"""
import os, sys, zipfile, subprocess
PORTALS = {"crazygames": '<script src="https://sdk.crazygames.com/crazygames-sdk-v3.js"></script>'}
name = sys.argv[1] if len(sys.argv) > 1 else "crazygames"
assert name in PORTALS, "portal desconhecido: " + name
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out_dir = os.path.join(root, "dist", name); os.makedirs(out_dir, exist_ok=True)
tmp = os.path.join(out_dir, "index.html")
subprocess.run([sys.executable, os.path.join(root, "tools", "bundle.py"), tmp], check=True)
html = open(tmp, encoding="utf-8").read()
inject = PORTALS[name] + f'\n<script>window.PORTAL_NAME="{name}"</script>\n'
html = html.replace("<style>", inject + "<style>", 1)
# portal não usa PWA (manifest/ícones ficam de fora do pacote)
html = html.replace('<link rel="manifest" href="manifest.json">', "")
open(tmp, "w", encoding="utf-8").write(html)
z = os.path.join(root, "dist", f"frutodromo-{name}.zip")
with zipfile.ZipFile(z, "w", zipfile.ZIP_DEFLATED) as f:
    f.write(tmp, "index.html")
print(tmp, len(html), "bytes ->", z)
