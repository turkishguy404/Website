'use strict';

/* ===== Charm ikonları (SVG) ===== */
const ICONS = {
  heart: '<svg viewBox="0 0 64 64"><path d="M32 56C10 40 6 26 12 18c6-8 16-6 20 2 4-8 14-10 20-2 6 8 2 22-20 38z"/></svg>',
  star: '<svg viewBox="0 0 64 64"><polygon points="32,6 39,24 58,25 43,37 48,56 32,45 16,56 21,37 6,25 25,24"/></svg>',
  moon: '<svg viewBox="0 0 64 64"><path d="M44 8A26 26 0 1 0 56 44 20 20 0 1 1 44 8z"/></svg>',
  drop: '<svg viewBox="0 0 64 64"><path d="M32 6S12 28 12 40a20 20 0 0 0 40 0C52 28 32 6 32 6z"/></svg>',
  clover: '<svg viewBox="0 0 64 64"><circle cx="24" cy="24" r="11"/><circle cx="40" cy="24" r="11"/><circle cx="24" cy="40" r="11"/><circle cx="40" cy="40" r="11"/><path d="M32 40c0 8 4 14 10 18l2-3c-5-3-8-8-8-15z"/></svg>',
  key: '<svg viewBox="0 0 64 64"><path fill-rule="evenodd" d="M22 6a16 16 0 1 0 9 29l21 21 6-6-5-5 4-4-5-5-4 4-6-6A16 16 0 0 0 22 6zm0 9a7 7 0 1 1 0 14 7 7 0 0 1 0-14z"/></svg>'
};

/* ===== Ürün verisi ===== */
const PRODUCTS = [
  { id: 1, name: 'Sonsuz Kalp', category: 'Aşk', icon: 'heart', price: 490, old: 590, badge: 'Çok Satan', desc: '925 ayar gümüş, altın kaplama kalp charm.' },
  { id: 2, name: 'Işık Yıldızı', category: 'Gökyüzü', icon: 'star', price: 420, desc: 'Parlak taş işlemeli minik yıldız charm.' },
  { id: 3, name: 'Hilal Ay', category: 'Gökyüzü', icon: 'moon', price: 450, badge: 'Yeni', desc: 'Mat altın dokulu zarif hilal tasarımı.' },
  { id: 4, name: 'Şans Yoncası', category: 'Doğa', icon: 'clover', price: 520, old: 640, desc: 'Dört yapraklı yonca ile şans seninle.' },
  { id: 5, name: 'Sır Anahtarı', category: 'Aşk', icon: 'key', price: 480, desc: 'Kalbinin kilidini açan vintage anahtar charm.' },
  { id: 6, name: 'Gece Damlası', category: 'Doğa', icon: 'drop', price: 390, badge: 'Yeni', desc: 'Su damlası formunda sade ve şık charm.' },
  { id: 7, name: 'Kalp Çifti', category: 'Aşk', icon: 'heart', price: 760, desc: 'Sevgililer için iç içe geçmiş çift charm seti.' },
  { id: 8, name: 'Kutup Yıldızı', category: 'Gökyüzü', icon: 'star', price: 510, desc: 'Yönünü kaybedenlere rehber olan yıldız.' }
];

/* ===== Yardımcılar ===== */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const fmt = n => n.toLocaleString('tr-TR') + ' ₺';

/* ===== Charm ikonlarını yerleştir ===== */
$$('[data-charm]').forEach(el => { el.innerHTML = ICONS[el.dataset.charm] || ''; });

/* ===== Header: scroll & mobil menü ===== */
const header = $('#header');
const nav = $('#nav');
const burger = $('#burger');

const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 20);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

burger.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  burger.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', open);
});
$$('a', nav).forEach(a => a.addEventListener('click', () => {
  nav.classList.remove('open');
  burger.classList.remove('open');
  burger.setAttribute('aria-expanded', 'false');
}));

/* ===== Ürün listesi & filtre ===== */
const grid = $('#productGrid');
const filterBox = $('#filters');
const categories = ['Tümü', ...new Set(PRODUCTS.map(p => p.category))];
let activeFilter = 'Tümü';

function renderFilters() {
  filterBox.innerHTML = categories
    .map(c => `<button class="filter ${c === activeFilter ? 'active' : ''}" data-cat="${c}" role="tab" aria-selected="${c === activeFilter}">${c}</button>`)
    .join('');
}

function renderProducts() {
  const list = activeFilter === 'Tümü' ? PRODUCTS : PRODUCTS.filter(p => p.category === activeFilter);
  grid.innerHTML = list.map((p, i) => `
    <article class="card" style="animation-delay:${i * 70}ms">
      <div class="card__img">
        ${p.badge ? `<span class="badge">${p.badge}</span>` : ''}
        <div data-charm="${p.icon}">${ICONS[p.icon]}</div>
      </div>
      <div class="card__body">
        <span class="card__cat">${p.category}</span>
        <h3 class="card__title">${p.name}</h3>
        <p class="card__desc">${p.desc}</p>
        <div class="card__foot">
          <span class="price">${p.old ? `<small>${fmt(p.old)}</small>` : ''}${fmt(p.price)}</span>
          <button class="add-btn" data-add="${p.id}">Sepete Ekle</button>
        </div>
      </div>
    </article>`).join('');
}

function setFilter(cat) {
  activeFilter = cat;
  renderFilters();
  renderProducts();
}

filterBox.addEventListener('click', e => {
  const btn = e.target.closest('.filter');
  if (btn) setFilter(btn.dataset.cat);
});
$$('[data-filter-link]').forEach(a =>
  a.addEventListener('click', () => setFilter(a.dataset.filterLink))
);

grid.addEventListener('click', e => {
  const btn = e.target.closest('[data-add]');
  if (btn) addToCart(Number(btn.dataset.add));
});

/* ===== Sepet ===== */
const drawer = $('#drawer');
const overlay = $('#overlay');
const cartItemsEl = $('#cartItems');
const cartCountEl = $('#cartCount');
const cartTotalEl = $('#cartTotal');
let cart = [];

try { cart = JSON.parse(localStorage.getItem('charmora-cart')) || []; } catch (_) { cart = []; }

const saveCart = () => {
  try { localStorage.setItem('charmora-cart', JSON.stringify(cart)); } catch (_) { /* yoksay */ }
};

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove('show'), 2200);
}

function addToCart(id) {
  const item = cart.find(i => i.id === id);
  if (item) item.qty++;
  else cart.push({ id, qty: 1 });
  updateCart();
  const p = PRODUCTS.find(p => p.id === id);
  toast(`${p.name} sepete eklendi`);
  cartCountEl.classList.add('bump');
  setTimeout(() => cartCountEl.classList.remove('bump'), 250);
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  updateCart();
}

function removeItem(id) {
  cart = cart.filter(i => i.id !== id);
  updateCart();
}

function updateCart() {
  saveCart();
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const total = cart.reduce((s, i) => s + i.qty * PRODUCTS.find(p => p.id === i.id).price, 0);
  cartCountEl.textContent = count;
  cartTotalEl.textContent = fmt(total);

  if (!cart.length) {
    cartItemsEl.innerHTML = '<p class="empty">Sepetin şimdilik boş.<br>Hikâyeni oluşturmaya başla ✨</p>';
    return;
  }
  cartItemsEl.innerHTML = cart.map(i => {
    const p = PRODUCTS.find(p => p.id === i.id);
    return `
      <div class="cart-item">
        <div class="cart-item__img" data-charm="${p.icon}">${ICONS[p.icon]}</div>
        <div>
          <h4>${p.name}</h4>
          <div class="cart-item__price">${fmt(p.price)}</div>
          <div class="qty">
            <button data-dec="${p.id}" aria-label="Azalt">−</button>
            <span>${i.qty}</span>
            <button data-inc="${p.id}" aria-label="Artır">+</button>
          </div>
        </div>
        <button class="cart-item__remove" data-rm="${p.id}">Kaldır</button>
      </div>`;
  }).join('');
}

cartItemsEl.addEventListener('click', e => {
  const t = e.target;
  if (t.dataset.inc) changeQty(Number(t.dataset.inc), 1);
  else if (t.dataset.dec) changeQty(Number(t.dataset.dec), -1);
  else if (t.dataset.rm) removeItem(Number(t.dataset.rm));
});

function toggleDrawer(open) {
  drawer.classList.toggle('open', open);
  overlay.classList.toggle('show', open);
  drawer.setAttribute('aria-hidden', String(!open));
  document.body.style.overflow = open ? 'hidden' : '';
}
$('#cartOpen').addEventListener('click', () => toggleDrawer(true));
$('#cartClose').addEventListener('click', () => toggleDrawer(false));
overlay.addEventListener('click', () => toggleDrawer(false));
document.addEventListener('keydown', e => { if (e.key === 'Escape') toggleDrawer(false); });

$('#checkout').addEventListener('click', () => {
  if (!cart.length) return toast('Önce sepetine ürün ekle');
  toast('Ödeme sayfası demo amaçlıdır. Teşekkürler!');
});

/* ===== Bülten formu ===== */
$('#newsletterForm').addEventListener('submit', e => {
  e.preventDefault();
  const email = $('#email').value.trim();
  const msg = $('#formMsg');
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  msg.className = 'form-msg ' + (valid ? 'ok' : 'err');
  msg.textContent = valid
    ? 'Teşekkürler! İndirim kodun e-postana gönderildi.'
    : 'Lütfen geçerli bir e-posta adresi gir.';
  if (valid) e.target.reset();
});

/* ===== Scroll ile belirme animasyonu ===== */
const io = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (en.isIntersecting) {
      en.target.classList.add('visible');
      io.unobserve(en.target);
    }
  });
}, { threshold: 0.12 });
$$('.reveal').forEach(el => io.observe(el));

/* ===== Başlangıç ===== */
$('#year').textContent = new Date().getFullYear();
renderFilters();
renderProducts();
updateCart();
