# 🍓 Frutódromo

**A quitanda das frutas que a natureza não teve coragem de criar.**

### 🎮 [Jogar agora → mendesoz.github.io/frutodromo](https://mendesoz.github.io/frutodromo/)

Frutódromo é um jogo de navegador em pixel art: você cruza frutas num caldeirão, cria híbridos com formato, cor e sabor herdados dos pais e atende os pedidos dos clientes que aparecem no balcão — gente, bichos, robôs, aliens e fantasminhas.

<p align="center">
  <img src="docs/inicio.png" width="240" alt="Tela inicial">
  <img src="docs/quitanda.png" width="240" alt="A quitanda">
  <img src="docs/arvore.png" width="240" alt="Árvore de frutas">
</p>

## Como jogar

1. **Compre frutas** na feira (parte de baixo da tela).
2. **Jogue 2 frutas no caldeirão** para cruzar e criar um híbrido. O caldeirão pode ser arrastado pra qualquer lugar da mesa.
3. **Arraste a fruta até um cliente** que pediu algo parecido no balão.
4. Arraste para o canto da mesa para **vender**.
5. Ficou perdido? Toque no **?** do balão do cliente para ver a **receita passo a passo**.
6. Toque numa fruta para ver os atributos — com 1 fruta no caldeirão, aparece a **previsão** do filho.

Cada dia de trabalho dura 2 minutos e meio. No fim, aparece o resumo do dia.

## A lógica das misturas

Tudo segue uma regra só: **parecidos se intensificam**.

| Mistura | Resultado |
|---|---|
| Pequena + pequena | fica **menor** (Mini → Microscópica) |
| Grande + grande | fica **maior** (Enorme → Gigantesca) |
| Doce + doce | fica **mais doce** (até o Mel Puro) |
| Opostos (grande + pequena) | meio-termo |
| Cores | misturam como tinta (vermelha + amarela = laranja) |
| Dois elementos diferentes | nasce uma **super-fruta**, com capa e máscara |

O formato do filho é uma **fusão dos contornos dos pais**, então cada linhagem gera formas novas.

## Recursos

- 🎨 Pixel art gerada no código (frutas, clientes, cenário e caldeirão)
- ✨ Frutas **brilhantes** raras, espécies novas aparecem como **carta colecionável** com raridade (Comum → Lendária), pra baixar e compartilhar
- 🎁 **Artefatos mágicos** que os clientes dão de presente: poções de crescer e encolher, tintas, pena de fênix, capa heroica, pó de estrela, molde maluco... Morango gigante? Melancia de bolso? Pode!
- 🌦️ **Mundo real na janela**: relógio com a hora certa e, se você permitir, o clima de verdade da sua cidade (sol, nuvens, chuva, tempestade, noite), com **avisos de tempo perigoso** (Open-Meteo)
- 🔥 Frutas de **Fogo**, **Gelo** e **Raio** com efeitos animados
- 🌳 **Árvore de Espécies** infinita: cada combinação nova vira uma espécie ligada aos pais, com sugestões das próximas descobertas
- 🖌️ **Guia de Cores** dentro da árvore, com as combinações possíveis
- 👑 Clientes VIP, níveis e frutas raras que vão liberando
- ✅ Todo pedido é possível: o cliente escolhe uma fruta que dá pra fazer com a feira do seu nível
- 🎵 Efeitos e música em chiptune (Web Audio)
- ⏸️ Pausa, **Modo Zen** (sem relógio), volumes separados, tutorial, botão de arrumar a mesa e desfazer venda
- 🃏 **Álbum de cartas** com molduras por raridade (borda arco-íris pras brilhantes, cantos dourados pras lendárias)
- 🏆 **17 troféus** com recompensa e painel de recordes
- 📱 **Instalável como app** (PWA): no celular, abra o link e toque em "Adicionar à tela inicial". Funciona offline
- 💾 Progresso salvo no navegador, com **código de backup** pra levar pra outro aparelho

## Estrutura

```
frutodromo/
├── index.html        # estrutura da página
├── css/style.css     # visual: pixel art, cena, mesa, árvore e cartas
├── js/game.js        # lógica: sprites gerados por código, genética, clientes, som e interface
├── manifest.json     # dados do app instalável (PWA)
├── sw.js             # service worker: funciona offline
├── icon-192.png      # ícones do app
├── icon-512.png
├── docs/             # prints do README
└── tools/bundle.py   # gera uma versão de arquivo único (CSS e JS embutidos)
```

## Rodando

Sem dependências nem build. Como o jogo carrega arquivos separados, rode com um servidor local:

```bash
git clone https://github.com/Mendesoz/frutodromo.git
cd frutodromo
python3 -m http.server 8000
# abra http://localhost:8000
```

Ou jogue direto pelo **GitHub Pages**: [mendesoz.github.io/frutodromo](https://mendesoz.github.io/frutodromo/).

## Tecnologias

HTML, CSS e JavaScript puro · Canvas para gerar os sprites · Web Audio API para o som · localStorage para salvar o progresso.

---

Feito por [Eric Mendes](https://github.com/Mendesoz).
