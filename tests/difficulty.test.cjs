const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');

// Executa a função real do jogo, sem substituir sua fórmula por uma cópia.
const game = fs.readFileSync(path.join(__dirname, '../js/game.js'), 'utf8');
const start = game.indexOf('function diffTier(L)');
const end = game.indexOf('function newCust()', start);
assert(start >= 0 && end > start, 'Função diffTier encontrada no código do jogo');
let roll = 0;
const state = { streak: 0 };
const rngMath = Object.create(Math);
rngMath.random = () => roll;
const classify = vm.runInNewContext(game.slice(start, end) + '\ndiffTier', {
  Math: rngMath, DIFF: state,
});

function distribution(level, streak, samples = 10000) {
  state.streak = streak;
  const counts = [0, 0, 0];
  for (let i = 0; i < samples; i++) {
    roll = (i + 0.5) / samples;
    const tier = classify(level);
    assert([0, 1, 2].includes(tier), 'Classe válida');
    counts[tier]++;
  }
  return counts;
}

test('LOG-06: esgotar difíceis preserva os 32% de médios nos níveis 3 e 4', () => {
  for (const level of [3, 4]) for (const streak of [-1, -5, -40]) {
    assert.deepEqual(distribution(level, streak), [6800, 3200, 0], `${level}/${streak}`);
  }
});

test('LOG-06: esgotar difíceis preserva os 37% de médios nos níveis 5 e 6', () => {
  for (const level of [5, 6]) for (const streak of [-3, -5, -40]) {
    assert.deepEqual(distribution(level, streak), [6300, 3700, 0], `${level}/${streak}`);
  }
});

test('bases neutras continuam iguais em todas as faixas de nível', () => {
  for (const [level, expected] of [
    [1,[8500,1500,0]], [2,[8500,1500,0]],
    [3,[6500,3200,300]], [4,[6500,3200,300]],
    [5,[5500,3700,800]], [6,[5500,3700,800]],
    [7,[4500,4000,1500]], [9,[4500,4000,1500]], [12,[4500,4000,1500]],
  ]) assert.deepEqual(distribution(level, 0), expected, `nível ${level}`);
});

test('adaptação positiva e seu limite continuam iguais', () => {
  for (const [level, streak, expected] of [
    [3,1,[6150,3200,650]], [3,5,[5000,3200,1800]], [3,40,[5000,3200,1800]],
    [5,1,[5150,3700,1150]], [5,5,[4000,3700,2300]], [5,40,[4000,3700,2300]],
    [7,1,[4150,4000,1850]], [7,5,[3000,4000,3000]], [12,40,[3000,4000,3000]],
  ]) assert.deepEqual(distribution(level, streak), expected, `${level}/${streak}`);
});

test('redução antes do limite e níveis avançados continuam iguais', () => {
  assert.deepEqual(distribution(5, -1), [5850,3700,450]);
  assert.deepEqual(distribution(7, -1), [4850,4000,1150]);
  assert.deepEqual(distribution(7, -5), [6000,4000,0]);
  assert.deepEqual(distribution(12, -40), [6000,4000,0]);
});

test('níveis iniciais continuam sem adaptação', () => {
  for (const level of [1,2]) for (const streak of [-40,40]) {
    assert.deepEqual(distribution(level, streak), [8500,1500,0]);
  }
});

test('níveis 3 a 12 preservam os médios em sequências de -40 a +40', () => {
  for (let level = 3; level <= 12; level++) for (let streak = -40; streak <= 40; streak++) {
    const samples = 1000;
    const counts = distribution(level, streak, samples);
    const expectedMedium = level <= 4 ? 320 : level <= 6 ? 370 : 400;
    assert(Math.abs(counts[1] - expectedMedium) <= 1, `médios ${level}/${streak}: ${counts}`);
    assert.equal(counts.reduce((a,b) => a+b, 0), samples);
  }
});
