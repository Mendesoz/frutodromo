"""Simulação de oferta (rodar: python3 tools/online/sim_reproducao.py [rodadas]; parâmetros por variável de ambiente: P_CROSS, Y, VIDA, ENC_DIA, PODRE)

Simulação de oferta de uma linhagem rara — Frutódromo Online (estudo, não balanceamento).

Pergunta: com cada regra de reprodução, quantas frutas raras existem depois de alguns dias,
quantas são consumidas por encomendas e quantas sobram sem comprador?

Modelo (todas as hipóteses abaixo são candidatas, escolhidas para comparar regras, não para o jogo):
- N jogadores, 30 dias, 3 ciclos de colheita por dia (quem entra 3 vezes ao dia).
- 2 estufas. Estufa comum dá 2 frutas comuns por ciclo. Cruzar 2 comuns dá semente rara com chance P_CROSS.
- Árvore rara dá Y frutas por ciclo durante VIDA ciclos e depois seca.
- Cada fruta rara pode ser ENTREGUE (consumida numa encomenda rara) ou usada como MATRIZ (vira 2 sementes raras),
  se a regra permitir. Sem encomenda disponível, a fruta fica em estoque (oferta sem comprador).
- Encomendas raras: ENC_DIA por jogador por dia, cada uma consome 1 fruta rara.
- Política do jogador: "investidor" usa como matriz sempre que a regra deixa e tem estufa livre a caminho;
  "vendedor" entrega sempre. População meio a meio.
Regras:
  livre     — controle: toda fruta rara pode virar matriz, para sempre.
  finita    — cada linhagem nascida de um cruzamento aceita no máximo USOS_MATRIZ usos como matriz.
  esteril   — só a fruta da 1ª geração (semente do cruzamento) serve de matriz; as gerações seguintes não.
  declinio  — cada geração produz DECL vezes a anterior (arredondamento aleatório); nada impede a matriz.
"""
import random, statistics, sys

import os
E_ = lambda k, d: type(d)(os.environ.get(k, d))
N, DIAS, CICLOS = 200, 30, 3
P_CROSS, Y, VIDA = E_("P_CROSS", 0.10), E_("Y", 2.0), E_("VIDA", 6)
ENC_DIA, USOS_MATRIZ, DECL = E_("ENC_DIA", 1), 3, 0.6
PODRE = E_("PODRE", 0)  # dias até a fruta estragar no estoque (0 = nunca)

def rodar(regra, seed):
    rnd = random.Random(seed)
    out = []
    players = []
    lin_id = 0
    for i in range(N):
        players.append(dict(inv=("investidor" if i % 2 == 0 else "vendedor"), arv=[], sem=[], est=[], enc=0, com=0))
    tot_prod = tot_cons = 0
    for dia in range(DIAS):
        prod_d = cons_d = 0
        for p in players:
            p["enc"] += ENC_DIA
        for c in range(CICLOS):
            for p in players:
                # estufas: árvores raras ocupam estufa; as livres produzem comuns
                livres = 2 - len(p["arv"])
                # plantar sementes raras em estufa livre (mantém ao menos 1 estufa comum para cruzar)
                while p["sem"] and len(p["arv"]) < 1 + (1 if p["inv"] == "investidor" else 0) and 2 - len(p["arv"]) > 0:
                    g, lin = p["sem"].pop()
                    p["arv"].append([g, lin, VIDA])
                livres = 2 - len(p["arv"])
                p["com"] += 2 * livres
                # cruzamento: 2 comuns por tentativa, 1 tentativa por ciclo
                if p["com"] >= 2:
                    p["com"] -= 2
                    if rnd.random() < P_CROSS:
                        lin_id += 1
                        p["sem"].append((0, lin_id))
                        usos[lin_id] = 0
                # colheita rara
                novas = []
                for a in p["arv"]:
                    g, lin, vida = a
                    y = Y * (DECL ** g if regra == "declinio" else 1)
                    n = int(y) + (1 if rnd.random() < y - int(y) else 0)
                    novas += [(g, lin)] * n
                    a[2] -= 1
                p["arv"] = [a for a in p["arv"] if a[2] > 0]
                prod_d += len(novas)
                for g, lin in novas:
                    pode = (regra in ("livre", "declinio") or (regra == "finita" and usos[lin] < USOS_MATRIZ)
                            or (regra == "esteril" and g == 0))
                    quer = p["inv"] == "investidor" and len(p["sem"]) + len(p["arv"]) < 2
                    if pode and quer:
                        if regra == "finita": usos[lin] += 1
                        p["sem"] += [(g + 1, lin)] * 2
                    elif p["enc"] > 0:
                        p["enc"] -= 1; cons_d += 1
                    else:
                        p["est"].append(dia)
                # estoque também atende encomenda nova
                while p["est"] and p["enc"] > 0:
                    p["est"].pop(); p["enc"] -= 1; cons_d += 1
        if PODRE:
            for p in players: p["est"] = [d0 for d0 in p["est"] if dia - d0 < PODRE]
        tot_prod += prod_d; tot_cons += cons_d
        estoque = sum(len(p["est"]) for p in players)
        com_rara = sum(1 for p in players if p["arv"] or p["sem"] or p["est"])
        out.append(dict(dia=dia + 1, prod=prod_d, cons=cons_d, estoque=estoque, com_rara=com_rara,
                        arvores=sum(len(p["arv"]) for p in players)))
    return out

usos = {}
REGRAS = ["livre", "finita", "esteril", "declinio"]
if __name__ == "__main__":
    runs = int(sys.argv[1]) if len(sys.argv) > 1 else 10
    res = {}
    for r in REGRAS:
        rs = [rodar(r, s) for s in range(runs)]
        res[r] = rs
    def med(r, dia, k):
        return statistics.mean(run[dia - 1][k] for run in res[r])
    print(f"P_CROSS={P_CROSS} Y={Y} VIDA={VIDA} PODRE={PODRE}; N={N} jogadores, {DIAS} dias, {runs} rodadas por regra; demanda = {ENC_DIA} encomenda rara/jogador/dia = {N*ENC_DIA}/dia")
    print("| Regra | Dia | Raras colhidas/dia | Consumidas/dia | Estoque sem comprador | Árvores raras plantadas | Jogadores com rara |")
    print("|---|---|---|---|---|---|---|")
    for r in REGRAS:
        for d in (7, 14, 30):
            print(f"| {r} | {d} | {med(r,d,'prod'):.0f} | {med(r,d,'cons'):.0f} | {med(r,d,'estoque'):.0f} | {med(r,d,'arvores'):.0f} | {med(r,d,'com_rara'):.0f} |")
