(function (root) {
  'use strict';
  const stats = { mixed: 'おまかせ', hp: 'HP', attack: 'こうげき', defense: 'ぼうぎょ', spAttack: 'とくこう', spDefense: 'とくぼう', speed: 'すばやさ' };
  function correctChoice(a, b, stat) { return a[stat] === b[stat] ? 'tie' : a[stat] > b[stat] ? 'left' : 'right'; }
  function getPool(data, scope) { return scope === 'kanto' ? data.filter(p => p.dex <= 151 && Number(p.id) === p.dex) : data; }
  function makeQuestions(data, scope, mode, count = 10, random = Math.random) {
    const pool = getPool(data, scope);
    if (pool.length < 2) throw new Error('出題できるポケモンが不足しています。');
    const keys = Object.keys(stats).filter(k => k !== 'mixed');
    if (mode !== 'mixed' && !keys.includes(mode)) throw new Error('能力の指定が正しくありません。');
    const questions = [], seen = new Set();
    for (let attempt = 0; questions.length < count && attempt < 5000; attempt++) {
      const stat = mode === 'mixed' ? keys[Math.floor(random() * keys.length)] : mode;
      const left = pool[Math.floor(random() * pool.length)];
      const candidates = pool.filter(p => p.key !== left.key);
      const right = candidates[Math.floor(random() * candidates.length)];
      const key = [left.key, right.key].sort().join(':') + ':' + stat;
      if (seen.has(key)) continue;
      seen.add(key);
      questions.push({ left, right, stat, correct: correctChoice(left, right, stat) });
    }
    if (questions.length !== count) throw new Error('問題を作成できませんでした。もう一度お試しください。');
    return questions;
  }
  root.QuizEngine = { stats, correctChoice, getPool, makeQuestions };
  if (typeof module !== 'undefined') module.exports = root.QuizEngine;
})(globalThis);
