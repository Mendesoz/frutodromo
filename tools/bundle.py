"""Gera um arquivo HTML único (CSS e JS embutidos) a partir dos arquivos do repositório.
Os arquivos do repositório (index.html, css/style.css, js/i18n.js, js/game.js) são a fonte da verdade.
Uso: python3 tools/bundle.py saida.html
"""
import base64, os, re, sys
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rd = lambda p: open(os.path.join(root, p), encoding="utf-8").read()
html, css, js = rd("index.html"), rd("css/style.css"), rd("js/i18n.js") + "\n" + rd("js/game.js")
# fontes (woff2) embutidas em base64: o arquivo único não depende de nenhum arquivo ao lado nem de rede
def font_uri(m):
    p = os.path.join(root, "fonts", os.path.basename(m.group(1)))
    return 'url(data:font/woff2;base64,' + base64.b64encode(open(p, "rb").read()).decode() + ')'
css = re.sub(r'url\(\.\./fonts/([^)]+\.woff2)\)', font_uri, css)
assert "../fonts/" not in css, "fonte sem embutir"
a, b = '<link rel="stylesheet" href="css/style.css">', '<script src="js/i18n.js"></script><script src="js/game.js"></script>'
assert a in html and b in html, "index.html não tem os links esperados"
out = html.replace(a, "<style>\n" + css + "</style>", 1).replace(b, "<script>\n" + js + "</script>", 1)
fav = base64.b64encode(open(os.path.join(root, "favicon.png"), "rb").read()).decode()
out = out.replace('href="favicon.png"', 'href="data:image/png;base64,' + fav + '"')
dst = sys.argv[1] if len(sys.argv) > 1 else os.path.join(root, "frutodromo-single.html")
open(dst, "w", encoding="utf-8").write(out)
print(dst, len(out), "bytes")
