'use strict';
const $ = id => document.getElementById(id);
const { stats, makeQuestions } = QuizEngine;
let questions = [], answers = [], current = 0, score = 0, streak = 0, bestStreak = 0, answered = false, scope = 'kanto', mode = 'mixed';
for (const [key, label] of Object.entries(stats)) {
  const wrapper = document.createElement('label');
  const input = document.createElement('input');
  input.type = 'radio'; input.name = 'stat'; input.value = key; input.checked = key === 'mixed';
  const span = document.createElement('span'); span.textContent = label;
  wrapper.append(input, span); $('stat-options').append(wrapper);
}
$('all-count').textContent = `共有シートの ${POKEMON_DATA.length} 種類・フォルム`;
function show(screen) {
  for (const id of ['setup', 'play', 'result']) $(id).hidden = id !== screen;
  window.scrollTo({ top: 0, behavior: 'instant' });
}
function start() {
  mode = document.querySelector('input[name="stat"]:checked').value;
  scope = document.querySelector('input[name="scope"]:checked').value;
  questions = makeQuestions(POKEMON_DATA, scope, mode);
  current = 0; score = 0; streak = 0; bestStreak = 0; answers = [];
  show('play'); renderQuestion();
}
function renderQuestion() {
  answered = false;
  const q = questions[current];
  $('question-count').textContent = `QUESTION ${String(current + 1).padStart(2, '0')} / 10`;
  $('score').textContent = `${score} 問正解`;
  $('streak').textContent = streak > 1 ? `${streak} 連続正解！` : '自分のペースで挑戦';
  $('progress').style.width = `${current * 10}%`;
  $('stat-name').textContent = stats[q.stat];
  for (const side of ['left', 'right']) {
    const card = $(side + '-choice'), p = q[side];
    card.disabled = false; card.classList.remove('winner', 'selected-wrong');
    card.querySelector('.dex').textContent = `No.${String(p.dex).padStart(3, '0')}`;
    card.querySelector('.pokemon-name').textContent = p.name;
    card.querySelector('.stat-orb').textContent = '?';
    card.querySelector('.card-caption').textContent = 'こっちが高い';
    card.setAttribute('aria-label', `${p.name}の${stats[q.stat]}が高い`);
  }
  $('tie-choice').disabled = false; $('tie-choice').classList.remove('winner', 'selected-wrong');
  $('feedback').textContent = ''; $('feedback').className = 'feedback'; $('next').hidden = true;
  $('question-title').tabIndex = -1; $('question-title').focus({ preventScroll: true });
}
function answer(choice) {
  if (answered) return;
  answered = true;
  const q = questions[current], correct = choice === q.correct;
  if (correct) { score++; streak++; } else { streak = 0; }
  bestStreak = Math.max(streak, bestStreak);
  answers.push({ ...q, choice, isCorrect: correct });
  for (const side of ['left', 'right']) {
    const card = $(side + '-choice'); card.disabled = true;
    card.querySelector('.stat-orb').textContent = q[side][q.stat];
    card.querySelector('.card-caption').textContent = stats[q.stat];
    if (q.correct === side || q.correct === 'tie') card.classList.add('winner');
    if (!correct && choice === side) card.classList.add('selected-wrong');
  }
  $('tie-choice').disabled = true;
  if (q.correct === 'tie') $('tie-choice').classList.add('winner');
  else if (choice === 'tie') $('tie-choice').classList.add('selected-wrong');
  const explanation = q.correct === 'tie' ? `どちらも ${q.left[q.stat]}。同じ種族値です。` : `${q[q.correct].name}の方が ${Math.abs(q.left[q.stat] - q.right[q.stat])} 高い！`;
  $('feedback').textContent = `${correct ? '✓ 正解！' : '惜しい！'} ${explanation}`;
  $('feedback').className = `feedback ${correct ? 'correct' : 'incorrect'}`;
  $('score').textContent = `${score} 問正解`;
  $('progress').style.width = `${(current + 1) * 10}%`;
  $('streak').textContent = streak > 1 ? `${streak} 連続正解！` : '自分のペースで挑戦';
  $('next').textContent = current === 9 ? '結果を見る →' : '次の問題へ →'; $('next').hidden = false;
  $('next').focus({ preventScroll: true });
}
function finish() {
  show('result');
  $('final-score').textContent = score;
  $('result-title').textContent = score === 10 ? 'パーフェクト！' : score >= 7 ? 'さすがの知識！' : 'ナイスチャレンジ！';
  $('result-message').textContent = score === 10 ? '10問すべて正解。次は別の能力でも挑戦しよう。' : '意外な強さは見つかった？ふりかえって、もう一度。';
  $('accuracy').textContent = `${score * 10}%`; $('best-streak').textContent = `${bestStreak} 問`;
  try {
    const key = `pokemon-quiz-best-v1-${scope}-${mode}`;
    const stored = Number(localStorage.getItem(key));
    const best = Math.max(Number.isFinite(stored) && stored >= 0 && stored <= 10 ? stored : 0, score);
    localStorage.setItem(key, String(best)); $('best-score').textContent = `${best} / 10`;
  } catch { $('best-score').textContent = '保存できません'; }
  $('review').replaceChildren();
  answers.forEach((q, i) => {
    const row = document.createElement('div'); row.className = 'review-row';
    const icon = document.createElement('span'); icon.className = q.isCorrect ? 'review-ok' : 'review-no'; icon.textContent = q.isCorrect ? '✓' : '×'; icon.setAttribute('aria-label', q.isCorrect ? '正解' : '不正解');
    const body = document.createElement('div'), label = document.createElement('small'), values = document.createElement('p'), chosen = document.createElement('small');
    label.textContent = `Q${i + 1} · ${stats[q.stat]}`;
    values.textContent = `${q.left.name} ${q.left[q.stat]} ${q.correct === 'tie' ? '＝' : q.correct === 'left' ? '＞' : '＜'} ${q.right.name} ${q.right[q.stat]}`;
    chosen.textContent = `あなたの回答：${q.choice === 'tie' ? '同じ' : q[q.choice].name}`;
    body.append(label, values, chosen); row.append(icon, body); $('review').append(row);
  });
  $('result-title').focus({ preventScroll: true });
}
$('start').addEventListener('click', start);
$('retry').addEventListener('click', start);
$('quit').addEventListener('click', () => show('setup'));
$('settings-back').addEventListener('click', () => show('setup'));
for (const side of ['left', 'right', 'tie']) $(side + '-choice').addEventListener('click', () => answer(side));
$('next').addEventListener('click', () => { if (!answered) return; current++; if (current === questions.length) finish(); else renderQuestion(); });
