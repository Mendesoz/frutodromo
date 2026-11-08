"""Separa o jogo (arquivo único) em index.html + css/style.css + js/game.js.
Uso: python3 tools/split.py caminho/do/frutodromo.html
"""
import re, sys, os
src = open(sys.argv[1], encoding="utf-8").read()
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
css = re.search(r"<style>(.*?)</style>", src, re.S).group(1).strip()
js = re.search(r"<script>(.*)</script>", src, re.S).group(1).strip()
html = src.replace(re.search(r"<style>.*?</style>", src, re.S).group(0), '<link rel="stylesheet" href="css/style.css">', 1)
html = html.replace(re.search(r"<script>.*</script>", html, re.S).group(0), '<script src="js/game.js"></script>', 1)
os.makedirs(os.path.join(root, "css"), exist_ok=True); os.makedirs(os.path.join(root, "js"), exist_ok=True)
open(os.path.join(root, "css/style.css"), "w", encoding="utf-8").write("/* Frutódromo — estilos (pixel art, cena, mesa, árvore, cartas) */\n" + css + "\n")
open(os.path.join(root, "js/game.js"), "w", encoding="utf-8").write("// Frutódromo — lógica do jogo: sprites gerados por código, genética das frutas, clientes, árvore de espécies, som e interface\n" + js + "\n")
open(os.path.join(root, "index.html"), "w", encoding="utf-8").write(html)
print("index.html", len(html), "| css", len(css), "| js", len(js))
