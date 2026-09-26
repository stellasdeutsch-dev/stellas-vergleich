(() => {
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const HAS_AD = !!document.getElementById('platform');

/* ---------- камни ---------- */
const MEDIA = $('.logo img').getAttribute('src').replace('logo.png', '');

/* ---------- появление ---------- */
$$('[data-stagger]').forEach(g => [...g.children].forEach((c, i) => { c.setAttribute('data-r', ''); c.style.setProperty('--d', (i * .08) + 's'); }));
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: .14, rootMargin: '0px 0px -6% 0px' });
$$('[data-r], .reveal, .err, .cbar, .fx, .uml, .bd, .slots, .chart, .flow').forEach(el => io.observe(el));

/* счётчики */
const cio = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  const el = e.target, to = +el.dataset.count, t0 = performance.now();
  const tick = t => { const k = Math.min(1, (t - t0) / 1200); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(tick); };
  requestAnimationFrame(tick); cio.unobserve(el);
}), { threshold: .6 });
$$('[data-count]').forEach(el => cio.observe(el));

/* ---------- озвучка ---------- */
const spk = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" stroke="none"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/></svg>';
const canSpeak = 'speechSynthesis' in window;
function say(text, btn){
  if (!canSpeak) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'de-DE'; u.rate = .9;
  const v = speechSynthesis.getVoices().find(v => /^de/i.test(v.lang));
  if (v) u.voice = v;
  if (btn){ btn.classList.add('on'); u.onend = u.onerror = () => btn.classList.remove('on'); }
  speechSynthesis.speak(u);
}
$$('.say').forEach(b => { if (!canSpeak) { b.remove(); return; } b.innerHTML = spk; b.addEventListener('click', () => say(b.dataset.say, b)); });

/* ---------- FLIP ---------- */
function flip(container, mutate, jumpers = []){
  const els = [...container.children];
  const first = new Map(els.map(e => [e, e.getBoundingClientRect()]));
  const wasHidden = new Map(els.map(e => [e, e.classList.contains('hide')]));
  mutate();
  els.forEach(e => {
    if (wasHidden.get(e) && !e.classList.contains('hide')){ e.classList.remove('pop'); void e.offsetWidth; e.classList.add('pop'); return; }
    if (e.classList.contains('hide')) return;
    const f = first.get(e), l = e.getBoundingClientRect(), dx = f.left - l.left, dy = f.top - l.top;
    if (!dx && !dy) return;
    const kf = jumpers.includes(e)
      ? [{ transform: `translate(${dx}px,${dy}px)` }, { transform: `translate(${dx / 2}px,${dy / 2 - 46}px) rotate(-6deg)`, offset: .5 }, { transform: 'none' }]
      : [{ transform: `translate(${dx}px,${dy}px)` }, { transform: 'none' }];
    e.animate(kf, { duration: reduce ? 1 : (jumpers.includes(e) ? 1000 : 700), easing: 'cubic-bezier(.2,.8,.2,1)' });
  });
}

/* ---------- степпер ---------- */
function stepper(root, caps, render, delay = 2600){
  const n = caps.length, bars = $('.bars', root), cap = $('.cap', root), no = $('.stepno', root);
  const prev = $('.prev', root), next = $('.next', root);
  bars.innerHTML = '<i></i>'.repeat(n);
  let i = -1, timer = null, auto = true;
  const nextIcon = next.innerHTML, replay = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 12a8 8 0 1 0 2.3-5.7M4 4v4.5h4.5"/></svg>';
  function go(k){
    k = Math.max(0, Math.min(n - 1, k));
    if (k === i) return;
    i = k;
    render(i);
    $$('i', bars).forEach((b, j) => b.classList.toggle('on', j <= i));
    if (no) no.textContent = '/0' + (i + 1);
    cap.classList.add('swap');
    setTimeout(() => { cap.innerHTML = caps[i]; cap.classList.remove('swap'); }, 220);
    prev.disabled = i === 0;
    next.innerHTML = i === n - 1 ? replay : nextIcon;
    next.setAttribute('aria-label', i === n - 1 ? 'Сначала' : 'Дальше');
  }
  const stop = () => { auto = false; clearInterval(timer); };
  next.addEventListener('click', () => { stop(); if (i === n - 1){ go(0); play(); } else go(i + 1); });
  prev.addEventListener('click', () => { stop(); go(i - 1); });
  function play(){ auto = true; clearInterval(timer); timer = setInterval(() => { if (i >= n - 1) { clearInterval(timer); return; } go(i + 1); }, delay); }
  go(0);
  new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting && auto){ play(); o.disconnect(); } }), { threshold: .5 }).observe(root);
}

/* /01 морфинг */
const morph = $('#morph');
stepper(morph, [
  'Берём прилагательное. <span class="de">groß</span> — большой.',
  'Короткое слово, внутри <b>o</b>. Получает умлаут. Бонус, о котором никто не просил.',
  'Приклеиваем <b>-er</b>. <span class="de">größer</span> — больше.',
  'Ставим <b>als</b> — и сравниваем. Готово.'
], i => { for (let k = 1; k < 4; k++) morph.classList.toggle('st' + k, k <= i); }, 2300);

/* /03 глагол в конец */
const fr = $('#flipRow'), fk = k => fr.querySelector(`[data-k="${k}"]`);
stepper($('#flipd'), [
  'Главное предложение. Глагол <b>sind</b> — на втором месте. Всё как обычно.',
  'Запятая и <b>als</b>. Дальше начинается придаточное. Тут свои правила.',
  '<span class="de">wir haben erwartet</span> — так хочется сказать. Так нельзя.',
  'Спрягаемый глагол уезжает в конец. Как пассажир, который всегда садится в последний вагон.'
], i => {
  flip(fr, () => {
    fk('als').classList.toggle('hide', i < 1);
    fk('c').classList.toggle('cm', i >= 1);
    ['wir', 'haben', 'erw'].forEach(k => fk(k).classList.toggle('hide', i < 2));
    fk('haben').classList.toggle('warn', i === 2);
    fk('haben').classList.toggle('v', i === 3);
    fk('haben').classList.toggle('fin', i === 3);
    if (i === 3) fr.appendChild(fk('haben'));
    else fr.insertBefore(fk('haben'), fk('erw'));
  }, [fk('haben')]);
}, 2800);

/* /05 als ob */
const ar = $('#asobRow'), ak = k => ar.querySelector(`[data-k="${k}"]`), atr = $('#asobTr');
stepper($('#asob'), [
  '<b>als ob</b> + придаточное. Глагол в конце. Konjunktiv II: <span class="de">würde + sehen</span>.',
  '<b>ob</b> можно выкинуть.',
  'Но тогда глагол прыгает сразу за <b>als</b>. Сам. Без приглашения.'
], i => {
  flip(ar, () => {
    ak('ob').classList.toggle('gone', i === 1);
    ak('ob').classList.toggle('hide', i >= 2);
    ak('wurde').classList.toggle('fin', i < 2);
    ak('sehen').classList.toggle('fin', i >= 2);
    if (i >= 2) ar.insertBefore(ak('wurde'), ak('er2'));
    else ar.appendChild(ak('wurde'));
  }, [ak('wurde')]);
  atr.textContent = i >= 2 ? 'Er tut so, als würde er mich nicht sehen.' : 'Он делает вид, будто меня не видит.';
}, 2800);

/* ---------- /02 весы ---------- */
const beam = $('#beam'), pL = $('#panL'), pR = $('#panR'), needle = $('#needle');
function pan(label, flip){
  return `<line x1="0" y1="0" x2="-34" y2="72" stroke="#6d6d6d" stroke-width="1.2"/><line x1="0" y1="0" x2="34" y2="72" stroke="#6d6d6d" stroke-width="1.2"/>
  <circle r="3.5" fill="url(#g-metal)"/>
  <g class="stone" style="transform-box:fill-box;transform-origin:50% 100%;transition:transform 1s cubic-bezier(.5,1.6,.5,1)"><g transform="translate(-30,28)${flip ? ' translate(60,0) scale(-1,1)' : ''}"><image href="${MEDIA}stone-12.webp" width="60" height="46"/></g></g>
  <path d="M-46 72 Q0 104 46 72 Z" fill="url(#g-metal)"/>
  <text y="122" text-anchor="middle" fill="#8a8a8a" font-size="12" font-family="Inter Tight" font-style="italic">${label}</text>`;
}
pL.innerHTML = pan('mein Deutsch', false); pR.innerHTML = pan('dein Deutsch', true);
const M = {
  eq: { t: 0, l: 1, r: 1, s: 'Mein Deutsch ist <b>so gut wie</b> dein Deutsch.', c: 'Поровну → <b>so … wie</b>. Прилагательное не меняется: gut так и остаётся gut.', say: 'Mein Deutsch ist so gut wie dein Deutsch.' },
  gt: { t: 11, l: 1.35, r: .75, s: 'Mein Deutsch ist <b>besser als</b> dein Deutsch.', c: 'Перевесил → <b>Komparativ + als</b>. gut превращается в besser.', say: 'Mein Deutsch ist besser als dein Deutsch.' },
  lt: { t: -11, l: .75, r: 1.35, s: 'Mein Deutsch ist <b>nicht so gut wie</b> dein Deutsch.', c: 'Не дотянул → <b>nicht so … wie</b>. Звучит мягче, чем schlechter als.', say: 'Mein Deutsch ist nicht so gut wie dein Deutsch.' }
};
let ang = 0, vel = 0, target = 0, raf = null;
function drawScale(){
  const r = ang * Math.PI / 180, cx = 180, cy = 70, L = 130;
  beam.setAttribute('transform', `rotate(${-ang} 180 70)`);
  needle.setAttribute('transform', `rotate(${-ang} 180 70)`);
  pL.setAttribute('transform', `translate(${cx - L * Math.cos(r)},${cy + L * Math.sin(r)})`);
  pR.setAttribute('transform', `translate(${cx + L * Math.cos(r)},${cy - L * Math.sin(r)})`);
}
function animScale(){
  vel += (target - ang) * .05; vel *= .84; ang += vel;
  drawScale();
  if (Math.abs(target - ang) > .01 || Math.abs(vel) > .01) raf = requestAnimationFrame(animScale); else raf = null;
}
const sSent = $('#scaleSent'), sCap = $('#scaleCap');
function setMode(m){
  const d = M[m];
  $$('#scale .tab').forEach(t => t.classList.toggle('on', t.dataset.m === m));
  $('#scale .stepno').textContent = m === 'eq' ? 'so … wie' : m === 'gt' ? 'als' : 'nicht so … wie';
  target = d.t;
  $('.stone', pL).style.transform = `scale(${d.l})`;
  $('.stone', pR).style.transform = `scale(${d.r})`;
  sSent.style.opacity = 0; sCap.classList.add('swap');
  setTimeout(() => {
    sSent.innerHTML = d.s + (canSpeak ? `<button class="say" aria-label="Озвучить">${spk}</button>` : '');
    const b = $('.say', sSent); if (b) b.onclick = () => say(d.say, b);
    sSent.style.opacity = 1; sCap.innerHTML = d.c; sCap.classList.remove('swap');
  }, 220);
  if (!raf) raf = requestAnimationFrame(animScale);
}
drawScale(); setMode('eq');
let sTimer = null, sAuto = true;
$$('#scale .tab').forEach(t => t.addEventListener('click', () => { sAuto = false; clearInterval(sTimer); setMode(t.dataset.m); }));
new IntersectionObserver((es, o) => es.forEach(e => {
  if (e.isIntersecting && sAuto){ o.disconnect(); const seq = ['gt', 'lt', 'eq']; let k = 0;
    sTimer = setInterval(() => { if (!sAuto) return clearInterval(sTimer); setMode(seq[k++ % 3]); if (k >= 6) clearInterval(sTimer); }, 2800); }
}), { threshold: .5 }).observe($('#scale'));

/* ---------- /04 лестница ---------- */
const svg = $('#stairsSvg');
let st = '';
for (let i = 0; i < 5; i++){
  const x = 20 + i * 78, y = 172 - i * 30, w = 78, b = 206, dx = 16, dy = 12;
  st += `<g class="stp" data-i="${i}" style="transition-delay:${i * .12}s">
    <path d="M${x + w} ${y} L${x + w + dx} ${y - dy} L${x + w + dx} ${b - dy} L${x + w} ${b} Z" fill="url(#g-side)"/>
    <rect x="${x}" y="${y}" width="${w}" height="${b - y}" fill="url(#g-front)"/>
    <path d="M${x} ${y} L${x + dx} ${y - dy} L${x + w + dx} ${y - dy} L${x + w} ${y} Z" fill="url(#g-top)"/>
    <text x="${x + 10}" y="${b - 10}" fill="#6a6a6a" font-size="11" font-family="Inter Tight">0${i + 1}</text></g>`;
}
st += `<g class="climber" id="climber"><circle r="22" fill="url(#g-dot)" opacity=".55"/><circle r="4.5" fill="#fff"/></g>`;
svg.innerHTML = st;
const JE = [
  { t: [['Je','j'],['mehr','k'],['ich','r'],['übe','v'],[',','p'],['desto','j'],['besser','k'],['spreche','v'],['ich','r'],['.','p']], ru: 'Чем больше я практикуюсь, тем лучше говорю.' },
  { t: [['Je','j'],['öfter','k'],['ich','r'],['zuhöre','v'],[',','p'],['desto','j'],['mehr','k'],['verstehe','v'],['ich','r'],['.','p']], ru: 'Чем чаще я слушаю, тем больше понимаю.' },
  { t: [['Je','j'],['länger','k'],['ich','r'],['hier','r'],['lebe','v'],[',','p'],['desto','j'],['leichter','k'],['wird','v'],['es','r'],['.','p']], ru: 'Чем дольше я здесь живу, тем легче становится.' },
  { t: [['Je','j'],['mehr','k'],['Wörter','k'],['ich','r'],['kenne','v'],[',','p'],['desto','j'],['weniger','k'],['Angst','k'],['habe','v'],['ich','r'],['.','p']], ru: 'Чем больше слов я знаю, тем меньше боюсь.' },
  { t: [['Je','j'],['früher','k'],['du','r'],['anfängst','v'],[',','p'],['desto','j'],['schneller','k'],['sprichst','v'],['du','r'],['.','p']], ru: 'Чем раньше начнёшь, тем быстрее заговоришь.' }
];
const lvl = $('#lvl'), jeRow = $('#jeRow'), jeTr = $('#jeTr'), climber = $('#climber');
let jeCur = -1;
function setLvl(v){
  v = +v; if (v === jeCur) return; jeCur = v;
  lvl.value = v; lvl.style.setProperty('--p', ((v - 1) / 4 * 100) + '%');
  $$('.stp', svg).forEach(s => s.classList.toggle('on', +s.dataset.i < v));
  const i = v - 1, x = 20 + i * 78 + 47, y = 172 - i * 30 - 20;
  climber.style.transform = `translate(${x}px,${y}px)`;
  $('#stairs .stepno').textContent = '/0' + v;
  const s = JE[i];
  const toks = [];
  s.t.forEach(([w, c]) => { if (c === 'p') toks[toks.length - 1][1] += w === ',' ? ' cm' : ' fin'; else toks.push([w, c]); });
  jeRow.innerHTML = toks.map(([w, c], k) => `<span class="tok ${c} pop" style="animation-delay:${k * .05}s">${w}</span>`).join('') +
    (canSpeak ? `<button class="say pop" style="animation-delay:.5s" aria-label="Озвучить">${spk}</button>` : '');
  const b = $('.say', jeRow); if (b) b.onclick = () => say(s.t.map(x => x[0]).join(' ').replace(/ ([,.])/g, '$1'), b);
  jeTr.textContent = s.ru;
}
climber.style.transform = 'translate(67px,152px)';
setLvl(1);
let jTimer = null, jAuto = true;
lvl.addEventListener('input', () => { jAuto = false; clearInterval(jTimer); setLvl(lvl.value); });
const stairsBox = $('#stairs');
new IntersectionObserver((es, o) => es.forEach(e => {
  if (!e.isIntersecting) return;
  o.disconnect(); stairsBox.classList.add('in');
  if (jAuto) jTimer = setInterval(() => { if (jeCur >= 5 || !jAuto) return clearInterval(jTimer); setLvl(jeCur + 1); }, 2600);
}), { threshold: .45 }).observe(stairsBox);

/* ---------- стрелка в схеме позиций ---------- */
const slots = $('.slots');
if (slots){
  const drawArrow = () => {
    const [a, b] = $$('.sl-r .s.v', slots);
    const x1 = a.offsetLeft + a.offsetWidth / 2, y1 = a.offsetTop + a.offsetHeight + 2, x2 = b.offsetLeft + b.offsetWidth / 2, y2 = b.offsetTop - 3;
    $('.sl-arrow', slots).setAttribute('viewBox', `0 0 ${slots.clientWidth} ${slots.clientHeight}`);
    $('.sl-arrow > path', slots).setAttribute('d', `M${x1} ${y1} C ${x1} ${y1 + 26}, ${x2} ${y2 - 26}, ${x2} ${y2}`);
  };
  drawArrow(); addEventListener('resize', drawArrow);
}

/* ---------- флип-карты ---------- */
$$('.flip').forEach(f => {
  const t = () => f.classList.toggle('on');
  f.addEventListener('click', t);
  f.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); t(); } });
});

/* ---------- квиз ---------- */
const Q = [
  { q: 'Mein Bruder ist drei Jahre <u></u> als ich.', h: 'alt — старый', o: ['älter', 'mehr alt', 'alter'], a: 0, e: 'alt — короткое слово с a. Получает умлаут: <b>älter</b>. «Mehr alt» — это «более старый». Немцы так не говорят.' },
  { q: 'Heute ist es genauso kalt <u></u> gestern.', h: 'сегодня так же холодно, как вчера', o: ['als', 'wie', 'dann'], a: 1, e: 'Поровну — значит <b>wie</b>. genauso … wie.' },
  { q: 'Ich trinke <u></u> Tee als Kaffee.', h: 'gern — охотно', o: ['gerner', 'mehr gern', 'lieber'], a: 2, e: 'gern — хулиган. gern → <b>lieber</b> → am liebsten. Выводить бесполезно, только запомнить.' },
  { q: 'Je mehr ich lese, <u></u>', h: 'тем лучше я понимаю', o: ['desto ich verstehe besser.', 'desto besser verstehe ich.', 'desto besser ich verstehe.'], a: 1, e: 'desto → Komparativ → <b>сразу глагол</b>. Потом всё остальное.' },
  { q: 'Die Wohnung war teurer, als ich <u></u>', h: 'дороже, чем я думал', o: ['gedacht habe.', 'habe gedacht.', 'denke gedacht.'], a: 0, e: 'После als начинается придаточное. Спрягаемый глагол <b>habe</b> — в конец.' },
  { q: 'Er tut so, als <u></u> er krank.', h: 'как будто он болен', o: ['ist', 'wäre', 'war'], a: 1, e: 'als без ob — глагол сразу за als. И в Konjunktiv II: <b>wäre</b>.' }
];
const quiz = $('#quiz');
let qi = 0, res = [];
function qRender(){
  if (qi >= Q.length) return qDone();
  const d = Q[qi];
  quiz.innerHTML = `<div class="qhead"><span>Вопрос ${qi + 1} из ${Q.length}</span><span>${res.filter(Boolean).length} верно</span></div>
    <div class="qbars">${Q.map((_, k) => `<i class="${k < res.length ? (res[k] ? 'ok' : 'no') : k === qi ? 'cur' : ''}"></i>`).join('')}</div>
    <p class="qq">${d.q}</p><p class="qhint">${d.h}</p>
    <div class="opts">${d.o.map((o, k) => `<button class="opt" data-k="${k}"><span>${o}</span><span class="m"></span></button>`).join('')}</div>
    <div class="qexp"></div>
    <button class="btn qnext">${qi === Q.length - 1 ? 'Результат' : 'Дальше'} →</button>`;
  $$('.opt', quiz).forEach(b => b.addEventListener('click', () => {
    const k = +b.dataset.k, ok = k === d.a;
    res.push(ok);
    $$('.opt', quiz).forEach(x => { x.disabled = true; const kk = +x.dataset.k;
      if (kk === d.a){ x.classList.add('ok'); $('.m', x).textContent = '✓'; }
      else if (kk === k){ x.classList.add('no'); $('.m', x).textContent = '✕'; } });
    const ex = $('.qexp', quiz); ex.innerHTML = (ok ? '<b style="color:var(--ok)">Верно.</b> ' : '<b style="color:var(--bad)">Мимо.</b> ') + d.e; ex.classList.add('show');
    $('.qnext', quiz).classList.add('show');
    $$('.qbars i', quiz)[qi].className = ok ? 'ok' : 'no';
  }));
  $('.qnext', quiz).addEventListener('click', () => { qi++; qRender(); });
}
function qDone(){
  const s = res.filter(Boolean).length;
  const t = s === 6 ? 'Чисто. Хоть сейчас на экзамен.' : s >= 4 ? 'Хорошо. Пара ловушек сработала. Это нормально — для этого они и ловушки.' : 'Ничего страшного. Оля начинала с mehr gut.';
  quiz.innerHTML = `<div class="qres"><div class="qhead"><span>Результат</span><span>${s} из ${Q.length}</span></div>
    <div class="qbars">${res.map(r => `<i class="${r ? 'ok' : 'no'}"></i>`).join('')}</div>
    <div class="score">${s}/${Q.length}</div>
    <p style="font-size:19px;color:#fff;margin:16px 0 6px">${t}</p>
    ${HAS_AD ? '<p style="color:#9a9a9a;margin:0 0 22px">На платформе к каждому из 340+ гайдов есть упражнения. С разбором каждого ответа — как здесь.</p>' : '<p style="color:#9a9a9a;margin:0 0 22px">Ошибся — вернись к шпаргалке. Она короче, чем кажется.</p>'}
    <div class="cta-row" style="margin-top:0">${HAS_AD ? '<a class="btn" href="#platform">Посмотреть платформу</a>' : '<a class="btn" href="#cheat">К шпаргалке</a>'}<button class="btn ghost" id="qAgain">Ещё раз</button></div></div>`;
  $('#qAgain').onclick = () => { qi = 0; res = []; qRender(); };
}
qRender();

/* ---------- конструктор ---------- */
const TARGET = ['Je', 'mehr', 'ich', 'übe,', 'desto', 'besser', 'spreche', 'ich.'];
const SHUF = [6, 0, 4, 2, 7, 1, 5, 3];
const pool = $('#pool'), ans = $('#ans'), bStat = $('#bStat');
function bBuild(){
  pool.innerHTML = SHUF.map(k => `<span class="tok" data-w="${TARGET[k]}">${TARGET[k]}</span>`).join('');
  ans.innerHTML = ''; ans.className = 'ans'; bStat.textContent = '';
}
function moveTok(t){
  const from = t.parentElement, to = from === pool ? ans : pool;
  const a = t.getBoundingClientRect();
  to.appendChild(t);
  const b = t.getBoundingClientRect();
  t.animate([{ transform: `translate(${a.left - b.left}px,${a.top - b.top}px)` }, { transform: 'none' }], { duration: reduce ? 1 : 450, easing: 'cubic-bezier(.2,.8,.2,1)' });
  ans.classList.remove('ok', 'no'); bStat.textContent = '';
}
pool.addEventListener('click', e => { const t = e.target.closest('.tok'); if (t) moveTok(t); });
ans.addEventListener('click', e => { const t = e.target.closest('.tok'); if (t) moveTok(t); });
$('#bReset').onclick = bBuild;
$('#bCheck').onclick = () => {
  const got = $$('.tok', ans).map(t => t.dataset.w);
  if (got.length < TARGET.length){ bStat.textContent = 'Ещё не все слова на месте.'; return; }
  const ok = got.join(' ') === TARGET.join(' ');
  ans.classList.remove('ok', 'no'); void ans.offsetWidth;
  ans.classList.add(ok ? 'ok' : 'no');
  if (ok){ bStat.innerHTML = '<b style="color:var(--ok)">Richtig!</b> Слушай, как звучит.'; say(TARGET.join(' ')); }
  else {
    const di = got.findIndex((w, k) => w !== TARGET[k]);
    bStat.innerHTML = di >= 4 ? 'Почти. Проверь, что стоит сразу после <b>desto</b>.' : 'Почти. Помни: в первой половине глагол — в конце.';
  }
};
bBuild();

/* ---------- видео ---------- */
const V = {
  'v-gemini': ['stellas · гайды в Gemini', 'Под каждую тему — интерактивное приложение. Словарь с озвучкой, диалоги, тест и чат с ИИ.'],
  'v-grammar': ['stellas · грамматика', 'Грамматика с лайфхаками и озвучкой примеров. Как на канале, только удобнее.'],
  'v-articles': ['stellas · артикли', 'Herr Der, Frau Die и Baby Das. Артикли, которые запоминаются сами.'],
  'v-lexicon': ['stellas · лексика', 'Лексика по ситуациям: магазин, касса, салон, банк. С картинками и диалогами.']
};
const vid = $('#vid'), vcap = $('#vcap'), vurl = $('#vurl');
let vVisible = false;
if (vid) {
vcap.textContent = V['v-gemini'][1];
vid.addEventListener('loadedmetadata', () => { if (vid.videoWidth) vid.style.aspectRatio = vid.videoWidth + '/' + vid.videoHeight; });
function vLoad(){ if (!vid.getAttribute('src')){ vid.src = vid.dataset.src; } vid.play().catch(() => {}); }
new IntersectionObserver(es => es.forEach(e => { vVisible = e.isIntersecting; if (vVisible) vLoad(); else vid.pause(); }), { threshold: .25 }).observe(vid);
$$('#vtabs .tab').forEach(t => t.addEventListener('click', () => {
  $$('#vtabs .tab').forEach(x => x.classList.toggle('on', x === t));
  const k = t.dataset.v;
  vid.classList.add('fade'); vcap.style.opacity = 0;
  setTimeout(() => {
    vid.poster = `media/${k}.jpg`; vid.dataset.src = `media/${k}.mp4`; vid.src = vid.dataset.src;
    if (vVisible) vid.play().catch(() => {});
    vid.classList.remove('fade'); vurl.textContent = V[k][0]; vcap.textContent = V[k][1]; vcap.style.opacity = 1;
  }, 250);
}));
}

/* ---------- галерея ---------- */
const gal = $('#gal');
if (gal){
  const gStep = () => (gal.querySelector('figure').offsetWidth + 12);
  $('#galNext').onclick = () => gal.scrollBy({ left: gStep(), behavior: 'smooth' });
  $('#galPrev').onclick = () => gal.scrollBy({ left: -gStep(), behavior: 'smooth' });
}

/* ---------- меню, хедер, липкая кнопка, активный пункт ---------- */
const burger = $('#burger');
burger.onclick = () => { const o = document.body.classList.toggle('menu-open'); burger.setAttribute('aria-expanded', o); };
$$('#mnav a').forEach(a => a.addEventListener('click', () => { document.body.classList.remove('menu-open'); burger.setAttribute('aria-expanded', false); }));
const top = $('#top'), sticky = $('#sticky');
addEventListener('scroll', () => top.classList.toggle('scrolled', scrollY > 10), { passive: true });
if (sticky){
  const hideStickyIn = ['#price', '#final'].map(s => $(s));
  let heroOut = false, priceIn = false;
  new IntersectionObserver(es => es.forEach(e => { heroOut = !e.isIntersecting; sticky.classList.toggle('show', heroOut && !priceIn); })).observe($('#hero'));
  const pio = new IntersectionObserver(es => { priceIn = hideStickyIn.some(el => { const r = el.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; }); sticky.classList.toggle('show', heroOut && !priceIn); });
  hideStickyIn.forEach(el => pio.observe(el));
}
const share = $('#shareBtn');
if (share) share.onclick = async () => {
  const data = { title: document.title, url: location.href };
  try { if (navigator.share) await navigator.share(data); else { await navigator.clipboard.writeText(location.href); share.textContent = 'Ссылка скопирована'; } } catch (e) {}
};
const navMap = { hero: 'hero', story: 'hero', theory: 'theory', cheat: 'theory', t1: 'theory', t2: 'theory', t3: 'theory', t4: 'theory', t5: 'theory', traps: 'theory', practice: 'practice', platform: 'platform', result: 'platform', inside: 'platform', reviews: 'platform', price: 'platform', final: 'platform' };
const navIO = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  const k = navMap[e.target.id];
  $$('.pills a').forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + k));
}), { rootMargin: '-45% 0px -50% 0px' });
$$('main > section').forEach(s => navIO.observe(s));

/* ---------- GSAP ---------- */
if (window.gsap && window.ScrollTrigger){
  gsap.registerPlugin(ScrollTrigger, window.SplitText);
  const mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.to('#progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: .3 } });

    const hr = $('.hero .r1 img');
    if (hr) gsap.from(hr, { y: -120, rotate: -25, scale: .7, opacity: 0, duration: 1.2, ease: 'expo.out' });

    $$('.rock img').forEach((el, k) => gsap.to(el, {
      yPercent: k % 2 ? -22 : -38, rotate: k % 2 ? -10 : 12, ease: 'none',
      scrollTrigger: { trigger: el.closest('section') || el, start: 'top bottom', end: 'bottom top', scrub: 1 }
    }));
    $$('.bignum').forEach(el => gsap.fromTo(el, { yPercent: 35 }, { yPercent: -35, ease: 'none',
      scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));

    const track = $('.tk-track');
    if (track){
      const loop = gsap.to(track, { xPercent: -50, duration: 26, ease: 'none', repeat: -1 });
      const skew = gsap.quickTo(track, 'skewX', { duration: .4, ease: 'power3' });
      let t;
      ScrollTrigger.create({ onUpdate: self => {
        const v = self.getVelocity();
        gsap.to(loop, { timeScale: (self.direction || 1) * Math.min(5, 1 + Math.abs(v) / 400), duration: .3, overwrite: true,
          onComplete: () => gsap.to(loop, { timeScale: 1, duration: 1.2 }) });
        skew(gsap.utils.clamp(-12, 12, v / -200));
        clearTimeout(t); t = setTimeout(() => skew(0), 120);
      } });
    }

    if (window.SplitText) $$('.story p.big, .story p.punch').forEach(p => {
      const sp = new SplitText(p, { type: 'words,chars', charsClass: 'split-c' });
      gsap.from(sp.chars, { yPercent: 110, rotateX: -80, opacity: 0, stagger: .018, duration: .7, ease: 'back.out(2)',
        scrollTrigger: { trigger: p, start: 'top 85%' } });
    });

    $$('.poster .big').forEach(el => {
      const m = el.textContent.match(/(\d+)(\+?)/); if (!m) return;
      const o = { v: 0 }, to = +m[1], plus = m[2];
      gsap.to(o, { v: to, duration: 2, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' },
        onUpdate: () => el.textContent = Math.round(o.v) + plus });
    });

    if (matchMedia('(hover:hover) and (pointer:fine)').matches) $$('.btn, .ibtn, .cbtn').forEach(b => {
      const xTo = gsap.quickTo(b, 'x', { duration: .5, ease: 'elastic.out(1,.4)' }), yTo = gsap.quickTo(b, 'y', { duration: .5, ease: 'elastic.out(1,.4)' });
      b.addEventListener('mousemove', e => { const r = b.getBoundingClientRect(); xTo((e.clientX - r.left - r.width / 2) * .25); yTo((e.clientY - r.top - r.height / 2) * .35); });
      b.addEventListener('mouseleave', () => { xTo(0); yTo(0); });
    });
  });
}
})();
