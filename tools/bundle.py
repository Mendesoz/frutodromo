"""Gera um arquivo HTML único (CSS e JS embutidos) a partir dos arquivos do repositório.
Os arquivos do repositório (index.html, css/style.css, js/game.js) são a fonte da verdade.
Uso: python3 tools/bundle.py saida.html
"""
import os, sys
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rd = lambda p: open(os.path.join(root, p), encoding="utf-8").read()
html, css, js = rd("index.html"), rd("css/style.css"), rd("js/game.js")
a, b = '<link rel="stylesheet" href="css/style.css">', '<script src="js/game.js"></script>'
assert a in html and b in html, "index.html não tem os links esperados"
out = html.replace(a, "<style>\n" + css + "</style>", 1).replace(b, "<script>\n" + js + "</script>", 1)
dst = sys.argv[1] if len(sys.argv) > 1 else os.path.join(root, "frutodromo-single.html")
open(dst, "w", encoding="utf-8").write(out)
print(dst, len(out), "bytes")
