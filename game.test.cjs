const test = require('node:test');
const assert = require('node:assert/strict');
require('./data.js');
const { correctChoice, getPool, makeQuestions, stats } = require('./game.js');
test('greater, smaller and equal stats are judged correctly', () => {
  assert.equal(correctChoice({ attack: 100 }, { attack: 80 }, 'attack'), 'left');
  assert.equal(correctChoice({ speed: 70 }, { speed: 90 }, 'speed'), 'right');
  assert.equal(correctChoice({ hp: 80 }, { hp: 80 }, 'hp'), 'tie');
});
test('imported data has unique identifiers and six numeric stats', () => {
  assert.ok(POKEMON_DATA.length > 700);
  assert.equal(new Set(POKEMON_DATA.map(p => p.key)).size, POKEMON_DATA.length);
  for (const p of POKEMON_DATA) for (const k of Object.keys(stats).filter(k => k !== 'mixed')) assert.ok(Number.isFinite(p[k]) && p[k] > 0, `${p.name}: ${k}`);
});
test('Kanto scope excludes alternate forms and later generations', () => {
  const pool = getPool(POKEMON_DATA, 'kanto');
  assert.ok(pool.length > 20);
  assert.ok(pool.every(p => p.dex <= 151 && Number(p.id) === p.dex));
});
test('each mode produces ten unique valid questions in both scopes', () => {
  for (const scope of ['kanto', 'all']) for (const mode of Object.keys(stats)) {
    const questions = makeQuestions(POKEMON_DATA, scope, mode);
    assert.equal(questions.length, 10);
    assert.equal(new Set(questions.map(q => [q.left.key, q.right.key].sort().join(':') + ':' + q.stat)).size, 10);
    for (const q of questions) {
      assert.notEqual(q.left.key, q.right.key);
      if (mode !== 'mixed') assert.equal(q.stat, mode);
      assert.equal(q.correct, correctChoice(q.left, q.right, q.stat));
    }
  }
});
