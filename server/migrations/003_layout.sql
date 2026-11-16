-- Layout persistente: cada predio guarda o tile do canto superior esquerdo.
-- O limite por CHECK cobre a origem (tiles -24..35, terrenos -2..2). A extensao
-- da pegada e a posse do terreno sao validadas em src/layout.ts.
ALTER TABLE buildings ADD COLUMN tile_x integer;
ALTER TABLE buildings ADD COLUMN tile_y integer;
-- Posicoes historicas do terreno inicial, iguais a defaultPosition em src/layout.ts.
UPDATE buildings SET tile_x=1, tile_y=1 WHERE tile_x IS NULL AND kind='feed_mill' AND slot=0;
UPDATE buildings SET tile_x=7, tile_y=1 WHERE tile_x IS NULL AND kind='coop' AND slot=0;
UPDATE buildings SET tile_x=3, tile_y=7 WHERE tile_x IS NULL AND kind='plot' AND slot=0;
UPDATE buildings SET tile_x=6, tile_y=7 WHERE tile_x IS NULL AND kind='plot' AND slot=1;
-- Faixa livre y=4 para combinacoes de kind/slot que o cadastro atual nunca criou.
UPDATE buildings SET tile_x=3 + (slot % 3) * 3, tile_y=4 WHERE tile_x IS NULL;
ALTER TABLE buildings ALTER COLUMN tile_x SET NOT NULL;
ALTER TABLE buildings ALTER COLUMN tile_y SET NOT NULL;
ALTER TABLE buildings ADD CONSTRAINT buildings_world_bounds CHECK (tile_x BETWEEN -24 AND 35 AND tile_y BETWEEN -24 AND 35);
-- Personagem escolhido pelo jogador: 22 originais, 0 e o robo Unidade K7.
ALTER TABLE farms ADD COLUMN hero integer NOT NULL DEFAULT 0 CHECK (hero BETWEEN 0 AND 21);
