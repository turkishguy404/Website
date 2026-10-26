'use strict';

/* ===== Helpers ===== */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ===== Header, mobile menu ===== */
const header = $('#header');
const nav = $('#nav');
const burger = $('#burger');

const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 24);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

function setMenu(open) {
  nav.classList.toggle('open', open);
  burger.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
}
burger.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
$$('a', nav).forEach(a => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

/* ===== Active nav link while scrolling ===== */
const links = $$('a[href^="#"]', nav).filter(a => !a.classList.contains('nav__cta'));
const sections = links.map(a => $(a.getAttribute('href'))).filter(Boolean);
const spy = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (!en.isIntersecting) return;
    links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
sections.forEach(s => spy.observe(s));

/* ===== Reveal on scroll ===== */
const io = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (en.isIntersecting) {
      en.target.classList.add('visible');
      io.unobserve(en.target);
    }
  });
}, { threshold: 0.12 });
$$('.reveal').forEach(el => io.observe(el));

/* ===== Mystery box lab ===== */
const CHARMS = [
  { id: 'fire', name: 'Fire', who: 'Kai', img: 'images/charm-fire.png', line: 'Ignites passion and inner strength.' },
  { id: 'lightning', name: 'Lightning', who: 'Jay', img: 'images/charm-lightning.png', line: 'Brings speed and focus to every move.' },
  { id: 'water', name: 'Water', who: 'Nya', img: 'images/charm-water.png', line: 'Adapts, flows and finds the way.' },
  { id: 'ice', name: 'Ice', who: 'Zane', img: 'images/charm-ice.png', line: 'Brings control and clarity to the mind.' },
  { id: 'earth', name: 'Earth', who: 'Cole', img: 'images/charm-earth.png', line: 'Provides balance and stability.' }
];

const CHASE = {
  id: 'chase',
  name: 'Golden Lloyd',
  who: 'Spinjitzu effect',
  line: 'Secret chase charm. Transparent, glitter-coated, and only a 5% chance to pull.',
  svg: '<svg viewBox="0 0 120 120" role="img" aria-label="Golden spiral chase charm">' +
    '<circle cx="60" cy="60" r="50" fill="url(#goldGrad)" stroke="#fff3c4" stroke-width="3"/>' +
    '<circle cx="60" cy="60" r="38" fill="none" stroke="#fff3c4" stroke-opacity=".55" stroke-width="1.5"/>' +
    '<path d="M60 60m0-5a5 5 0 1 1-5 5a12 12 0 1 1 12 12a21 21 0 1 1-21-21a30 30 0 1 1 30 30" fill="none" stroke="#7a4600" stroke-width="4" stroke-linecap="round"/>' +
    '<path d="M95 14l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#fff"/>' +
    '<path d="M20 86l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="#fff" opacity=".85"/>' +
    '</svg>'
};

const PRICE_LOW = 6;
const PRICE_HIGH = 10;
const CHASE_RATE = 0.05;
const STORE_KEY = '4mula-shelf-v1';

const el = {
  open: $('#openBox'),
  reset: $('#resetShelf'),
  mystery: $('#mystery'),
  result: $('#boxResult'),
  shelf: $('#shelf'),
  collected: $('#statCollected'),
  pulls: $('#statPulls'),
  spend: $('#statSpend')
};

let state = { owned: {}, pulls: 0 };
try {
  const saved = JSON.parse(localStorage.getItem(STORE_KEY));
  if (saved && typeof saved.pulls === 'number' && saved.owned && typeof saved.owned === 'object') state = saved;
} catch (_) { /* storage may be unavailable, keep going in memory */ }

function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (_) { /* ignore */ }
}

function renderShelf() {
  const all = [...CHARMS, CHASE];
  el.shelf.innerHTML = all.map(c => {
    const count = state.owned[c.id] || 0;
    const media = c.id === 'chase'
      ? (count ? c.svg : '<span class="slot__q" aria-hidden="true">?</span>')
      : `<img src="${c.img}" alt="" width="240" height="240">`;
    const label = count ? `${c.name}, owned ${count}` : `${c.name}, not collected yet`;
    return `<li class="slot ${count ? 'slot--owned' : 'slot--empty'}" aria-label="${label}">
      ${media}${count > 1 ? `<span class="slot__count" aria-hidden="true">&times;${count}</span>` : ''}
    </li>`;
  }).join('');

  const have = all.filter(c => state.owned[c.id]).length;
  el.collected.textContent = have;
  el.pulls.textContent = state.pulls;
  el.spend.textContent = state.pulls
    ? `$${state.pulls * PRICE_LOW}–$${state.pulls * PRICE_HIGH}`
    : '$0';
}

function pull() {
  if (Math.random() < CHASE_RATE) return CHASE;
  return CHARMS[Math.floor(Math.random() * CHARMS.length)];
}

function showResult(c, isDupe) {
  const media = c.id === 'chase' ? c.svg : `<img src="${c.img}" alt="${c.name} charm" width="240" height="240">`;
  const badge = c.id === 'chase'
    ? '<span class="badge badge--rare">Secret chase</span>'
    : isDupe
      ? '<span class="badge badge--dupe">Double: save it for a swap day</span>'
      : '<span class="badge">New charm</span>';
  el.result.innerHTML = `<div class="pull">${media}${badge}<h4>${c.name}</h4><p>${c.who && c.id !== 'chase' ? c.who + '. ' : ''}${c.line}</p></div>`;
}

let busy = false;
el.open.addEventListener('click', () => {
  if (busy) return;
  busy = true;
  el.open.disabled = true;

  const finish = () => {
    const c = pull();
    const isDupe = !!state.owned[c.id];
    state.owned[c.id] = (state.owned[c.id] || 0) + 1;
    state.pulls += 1;
    save();
    showResult(c, isDupe);
    renderShelf();
    busy = false;
    el.open.disabled = false;
    el.open.textContent = 'Open another box';
  };

  if (reduceMotion) return finish();

  el.result.innerHTML = '<div class="mystery shake" aria-hidden="true"><span class="mystery__mark">?</span></div><p class="reveal-card__hint">Opening&hellip;</p>';
  setTimeout(finish, 750);
});

el.reset.addEventListener('click', () => {
  state = { owned: {}, pulls: 0 };
  save();
  el.result.innerHTML = '<div class="mystery" id="mystery" aria-hidden="true"><span class="mystery__mark">?</span></div><p class="reveal-card__hint" id="boxHint">Tap “Open a box” to pull your first charm.</p>';
  el.open.textContent = 'Open a box';
  renderShelf();
});

renderShelf();

/* ===== Collection cost calculator ===== */
const setSize = $('#setSize');
const setCount = $('#setCount');
const setCost = $('#setCost');

function updateCost() {
  const n = Number(setSize.value);
  setCount.textContent = n;
  setCost.textContent = `$${n * PRICE_LOW} – $${n * PRICE_HIGH}`;
}
setSize.addEventListener('input', updateCost);
updateCost();

/* ===== Footer year ===== */
$('#year').textContent = new Date().getFullYear();
