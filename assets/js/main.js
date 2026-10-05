/* ============================================================
   CIVÈRE — main.js
   ============================================================ */

// ---- CART ----
const CART_KEY = 'civere_cart';

function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}
function cartTotal() {
  return getCart().reduce((sum, i) => sum + i.price * i.qty, 0);
}
function cartCount() {
  return getCart().reduce((sum, i) => sum + i.qty, 0);
}

function updateCartBadge() {
  const badges = document.querySelectorAll('.cart-count');
  const count = cartCount();
  badges.forEach(b => {
    b.textContent = count;
    b.classList.toggle('is-hidden', count === 0);
  });
}

function addToCart(product) {
  const cart = getCart();
  const existing = cart.find(i => i.id === product.id);
  if (existing) { existing.qty += product.qty || 1; }
  else { cart.push({ ...product, qty: product.qty || 1 }); }
  saveCart(cart);
  updateCartBadge();
  showToast(`"${product.name}" añadido al carrito`);
}

function removeFromCart(id) {
  saveCart(getCart().filter(i => i.id !== id));
  updateCartBadge();
}

function updateQty(id, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  saveCart(cart);
  updateCartBadge();
}

// ---- TOAST ----
function showToast(msg) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('is-visible');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('is-visible'), 2800);
}

// ---- NAV ----
function initNav() {
  const ham = document.querySelector('.nav__ham');
  const links = document.querySelector('.nav__links');
  if (ham && links) {
    ham.addEventListener('click', () => {
      const isOpen = ham.classList.toggle('is-open');
      links.classList.toggle('is-open');
      ham.setAttribute('aria-expanded', isOpen);
      ham.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
    });
    // Cerrar con Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && ham.classList.contains('is-open')) {
        ham.classList.remove('is-open');
        links.classList.remove('is-open');
        ham.setAttribute('aria-expanded', 'false');
        ham.setAttribute('aria-label', 'Abrir menú');
        ham.focus();
      }
    });
  }
  // Mark active link
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__links a').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href === path || (path === 'index.html' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
}

// ---- ACCORDION ----
function initAccordion() {
  document.querySelectorAll('.accordion-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const body = btn.nextElementSibling;
      const isOpen = btn.classList.contains('is-open');
      document.querySelectorAll('.accordion-btn').forEach(b => {
        b.classList.remove('is-open');
        b.nextElementSibling.classList.remove('is-open');
      });
      if (!isOpen) {
        btn.classList.add('is-open');
        body.classList.add('is-open');
      }
    });
  });
}

// ---- GALLERY THUMBNAILS ----
function initGallery() {
  const mainImg = document.querySelector('.gallery-main img');
  if (!mainImg) return;
  document.querySelectorAll('.gallery-thumb').forEach(thumb => {
    thumb.addEventListener('click', () => {
      const src = thumb.querySelector('img').src;
      mainImg.src = src;
      document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
    });
  });
}

// ---- PRODUCT PAGE: qty + add to cart (supports main + sticky buttons) ----
function initProductPage() {
  const qtySpan  = document.querySelector('.qty-input .qty-val');
  const qtyMinus = document.querySelector('.qty-minus');
  const qtyPlus  = document.querySelector('.qty-plus');
  const addBtns  = document.querySelectorAll('.btn-add-cart');
  if (!addBtns.length) return;

  let qty = 1;
  function setQty(n) {
    qty = Math.max(1, n);
    if (qtySpan) qtySpan.textContent = qty;
  }
  if (qtyMinus) qtyMinus.addEventListener('click', () => setQty(qty - 1));
  if (qtyPlus)  qtyPlus.addEventListener('click',  () => setQty(qty + 1));

  addBtns.forEach(addBtn => {
    addBtn.addEventListener('click', () => {
      addToCart({
        id:    addBtn.dataset.id,
        name:  addBtn.dataset.name,
        price: parseFloat(addBtn.dataset.price),
        cat:   addBtn.dataset.cat,
        img:   addBtn.dataset.img,
        qty,
      });
      addBtns.forEach(b => { b.textContent = '✓ Añadido'; });
      setTimeout(() => { addBtns.forEach(b => { b.textContent = 'Añadir al carrito'; }); }, 2000);
    });
  });
}

// ---- NEWSLETTER POPUP ----
function initNewsletterPopup() {
  const popup = document.getElementById('nlPopup');
  if (!popup) return;
  const KEY = 'civere_nl';
  try { if (localStorage.getItem(KEY)) return; } catch {}

  function show() {
    popup.classList.add('is-open');
    requestAnimationFrame(() => requestAnimationFrame(() => popup.classList.add('is-visible')));
  }
  function dismiss() {
    popup.classList.remove('is-visible');
    setTimeout(() => popup.classList.remove('is-open'), 360);
    try { localStorage.setItem(KEY, '1'); } catch {}
  }

  setTimeout(show, 4000);

  popup.querySelector('.nl-close')?.addEventListener('click', dismiss);
  popup.addEventListener('click', e => { if (e.target === popup) dismiss(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && popup.classList.contains('is-open')) dismiss(); });

  document.getElementById('nlForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const body = popup.querySelector('.nl-body');
    if (body) body.innerHTML = `
      <p class="nl-label">Listo</p>
      <h2 class="nl-title" style="font-size:1.5rem">¡Código enviado!</h2>
      <p class="nl-desc">Revisa tu email. Tu código de bienvenida es <strong style="color:var(--charcoal)">BIENVENIDA10</strong>.</p>
      <p class="nl-fine">Puedes cerrar esta ventana cuando quieras.</p>`;
    try { localStorage.setItem(KEY, '1'); } catch {}
    setTimeout(dismiss, 3500);
  });
}

// ---- STICKY ADD-TO-CART ----
function initStickyCart() {
  const mainActions = document.querySelector('.product-actions');
  const sticky = document.getElementById('stickyCta');
  if (!mainActions || !sticky) return;
  const observer = new IntersectionObserver(([entry]) => {
    const show = !entry.isIntersecting;
    sticky.classList.toggle('is-visible', show);
    sticky.setAttribute('aria-hidden', String(!show));
    if (show) { sticky.removeAttribute('inert'); }
    else { sticky.setAttribute('inert', ''); }
  });
  observer.observe(mainActions);
}

// ---- WISHLIST ----
function initWishlist() {
  const KEY = 'civere_wishlist';
  function getSaved() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
  }
  function setSaved(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch {}
  }

  document.querySelectorAll('.product-card__wish').forEach(btn => {
    const wrap = btn.closest('.product-card__img-wrap');
    const productId = wrap?.querySelector('.btn-quick-add')?.dataset?.id;
    if (!productId) return;

    if (getSaved().includes(productId)) {
      btn.classList.add('is-saved');
      btn.setAttribute('aria-label', 'Quitar de favoritos');
    }

    btn.addEventListener('click', e => {
      e.preventDefault();
      const isSaved = btn.classList.toggle('is-saved');
      btn.setAttribute('aria-label', isSaved ? 'Quitar de favoritos' : 'Guardar en favoritos');

      btn.classList.add('is-popping');
      btn.addEventListener('animationend', () => btn.classList.remove('is-popping'), { once: true });

      const list = getSaved();
      if (isSaved) {
        if (!list.includes(productId)) list.push(productId);
      } else {
        const idx = list.indexOf(productId);
        if (idx > -1) list.splice(idx, 1);
      }
      setSaved(list);
    });
  });
}

// ---- SOCIAL PROOF BUBBLE ----
function initSocialProof() {
  const events = [
    { name: 'Ana M.', city: 'Madrid', product: 'Sérum Rosehip Glow', time: 'hace 2 h', img: 'https://images.unsplash.com/photo-1613803745799-ba6c10aace85?w=120&q=70' },
    { name: 'Lucía R.', city: 'Valencia', product: 'Crema Aloe Shield', time: 'hace 3 h', img: 'https://images.unsplash.com/photo-1699885725100-18bfef4955d6?w=120&q=70' },
    { name: 'Marta G.', city: 'Sevilla', product: 'Aceite Argan Ritual', time: 'hace 5 h', img: 'https://images.unsplash.com/photo-1672062519474-1a4407fdf387?w=120&q=70' },
    { name: 'Sara T.', city: 'Bilbao', product: 'Sérum Rosehip Glow', time: 'hace 6 h', img: 'https://images.unsplash.com/photo-1613803745799-ba6c10aace85?w=120&q=70' },
    { name: 'Paula V.', city: 'Barcelona', product: 'Contorno Caffeine Boost', time: 'hace 8 h', img: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=120&q=70' },
    { name: 'Carmen L.', city: 'Zaragoza', product: 'Mascarilla Clay Detox', time: 'hace 1 h', img: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=120&q=70' },
    { name: 'Isabel F.', city: 'Málaga', product: 'Crema Aloe Shield', time: 'hace 4 h', img: 'https://images.unsplash.com/photo-1699885725100-18bfef4955d6?w=120&q=70' },
  ];

  const bubble = document.createElement('div');
  bubble.className = 'sp-bubble';
  bubble.setAttribute('role', 'status');
  bubble.setAttribute('aria-live', 'polite');
  bubble.innerHTML = `
    <img class="sp-bubble__img" src="" alt="" aria-hidden="true" loading="lazy">
    <div class="sp-bubble__body">
      <p class="sp-bubble__name"></p>
      <p class="sp-bubble__msg"></p>
      <p class="sp-bubble__time"></p>
    </div>
    <button class="sp-bubble__close" aria-label="Cerrar notificación">
      <svg viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>`;
  document.body.appendChild(bubble);

  const img  = bubble.querySelector('.sp-bubble__img');
  const name = bubble.querySelector('.sp-bubble__name');
  const msg  = bubble.querySelector('.sp-bubble__msg');
  const time = bubble.querySelector('.sp-bubble__time');
  const closeBtn = bubble.querySelector('.sp-bubble__close');

  let hideTimer, nextTimer;
  let idx = Math.floor(Math.random() * events.length);

  function hideBubble() {
    bubble.classList.remove('is-visible');
  }

  function showNext() {
    const ev = events[idx % events.length];
    idx++;
    img.src  = ev.img;
    name.textContent = `${ev.name} · ${ev.city}`;
    msg.textContent  = `acaba de comprar ${ev.product}`;
    time.textContent = ev.time;

    bubble.classList.add('is-visible');
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hideBubble, 5000);
    nextTimer = setTimeout(showNext, 18000 + Math.random() * 7000);
  }

  closeBtn.addEventListener('click', () => {
    clearTimeout(hideTimer);
    hideBubble();
  });

  // First show after 8s, then every ~18-25s
  nextTimer = setTimeout(showNext, 8000);
}

// ---- CATALOG: quick-add ----
function initQuickAdd() {
  document.querySelectorAll('.btn-quick-add').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      addToCart({
        id:    btn.dataset.id,
        name:  btn.dataset.name,
        price: parseFloat(btn.dataset.price),
        cat:   btn.dataset.cat,
        img:   btn.dataset.img,
        qty:   1,
      });
    });
  });
}

// ---- CATALOG: filter ----
function initFilter() {
  const links = document.querySelectorAll('.filter-group ul li a[data-filter], .filter-pill[data-filter]');
  links.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const container = link.closest('.filter-group') || link.closest('.filter-pills');
      if (container) container.querySelectorAll('[data-filter]').forEach(a => a.classList.remove('active'));
      link.classList.add('active');
      const cat = link.dataset.filter;
      document.querySelectorAll('.product-card').forEach(card => {
        const show = !cat || cat === 'all' || card.dataset.cat === cat;
        card.style.display = show ? '' : 'none';
      });
    });
  });
}

// ---- CART PAGE ----
function renderCart() {
  const container = document.querySelector('.cart-items');
  const emptyMsg  = document.querySelector('.cart-empty');
  const summaryEl = document.querySelector('.cart-summary');
  if (!container) return;

  const cart = getCart();
  if (cart.length === 0) {
    container.innerHTML = '';
    if (emptyMsg) emptyMsg.style.display = '';
    if (summaryEl) summaryEl.style.display = 'none';
    document.querySelectorAll('.cart-count-text').forEach(el => el.textContent = '0 productos');
    return;
  }
  if (emptyMsg) emptyMsg.style.display = 'none';
  if (summaryEl) summaryEl.style.display = '';

  container.innerHTML = cart.map(item => `
    <div class="cart-item" data-id="${item.id}">
      <div class="cart-item__img">
        <img src="${item.img}" alt="${item.name}" loading="lazy">
      </div>
      <div class="cart-item__info">
        <div class="cart-item__cat">${item.cat}</div>
        <div class="cart-item__name">${item.name}</div>
        <div class="cart-item__qty-row">
          <div class="qty-input">
            <button class="cart-qty-minus" data-id="${item.id}">−</button>
            <span>${item.qty}</span>
            <button class="cart-qty-plus" data-id="${item.id}">+</button>
          </div>
          <button class="cart-item__remove" data-id="${item.id}">Eliminar</button>
        </div>
      </div>
      <div class="cart-item__price">${(item.price * item.qty).toFixed(2)} €</div>
    </div>
  `).join('');

  // Events
  container.querySelectorAll('.cart-item__remove').forEach(btn => {
    btn.addEventListener('click', () => { removeFromCart(btn.dataset.id); renderCart(); });
  });
  container.querySelectorAll('.cart-qty-minus').forEach(btn => {
    btn.addEventListener('click', () => { updateQty(btn.dataset.id, -1); renderCart(); });
  });
  container.querySelectorAll('.cart-qty-plus').forEach(btn => {
    btn.addEventListener('click', () => { updateQty(btn.dataset.id,  1); renderCart(); });
  });

  // Summary
  const subtotal  = cartTotal();
  const shipping  = subtotal >= 50 ? 0 : 4.95;
  const total     = subtotal + shipping;
  const subEl     = document.querySelector('.summary-subtotal');
  const shipEl    = document.querySelector('.summary-shipping-cost');
  const totalEl   = document.querySelector('.summary-total');
  const freeEl    = document.querySelector('.summary-free-banner');
  if (subEl)   subEl.textContent   = subtotal.toFixed(2).replace('.', ',') + ' €';
  if (shipEl)  shipEl.textContent  = shipping === 0 ? 'Gratis' : shipping.toFixed(2).replace('.', ',') + ' €';
  if (totalEl) totalEl.textContent = total.toFixed(2).replace('.', ',') + ' €';
  if (freeEl)  freeEl.style.display = shipping === 0 ? '' : 'none';
  document.querySelectorAll('.cart-count-text').forEach(el => el.textContent = cartCount() + ' producto' + (cartCount() !== 1 ? 's' : ''));

  // Shipping progress bar
  const FREE_THRESHOLD = 50;
  const barFill = document.querySelector('.shipping-bar__fill');
  const barMsg  = document.querySelector('.shipping-bar__msg');
  const barOk   = document.querySelector('.shipping-bar__ok');
  const barDiff = document.querySelector('.shipping-bar__diff');
  if (barFill) {
    const pct = Math.min(100, (subtotal / FREE_THRESHOLD) * 100);
    barFill.style.transform = 'scaleX(' + (pct / 100) + ')';
    if (subtotal >= FREE_THRESHOLD) {
      if (barMsg) barMsg.hidden = true;
      if (barOk)  barOk.hidden  = false;
    } else {
      const diff = (FREE_THRESHOLD - subtotal).toFixed(2).replace('.', ',');
      if (barDiff) barDiff.textContent = diff + ' €';
      if (barMsg)  barMsg.hidden = false;
      if (barOk)   barOk.hidden  = true;
    }
  }

  // Upsell — show when cart has items
  const upsell = document.querySelector('.cart-upsell');
  if (upsell) upsell.hidden = cart.length === 0;
}

// ---- CHECKOUT MODAL ----
function initCheckout() {
  const btn = document.querySelector('.btn-checkout');
  const overlay = document.querySelector('.modal-overlay');
  const closeBtn = document.querySelector('.modal__close');
  if (!btn || !overlay) return;
  btn.addEventListener('click', () => {
    overlay.classList.add('is-open');
    saveCart([]);
    updateCartBadge();
    setTimeout(() => renderCart(), 300);
  });
  closeBtn?.addEventListener('click', () => overlay.classList.remove('is-open'));
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('is-open'); });
}

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  updateCartBadge();
  initNewsletterPopup();
  initSocialProof();
  initAccordion();
  initGallery();
  initProductPage();
  initStickyCart();
  initQuickAdd();
  initWishlist();
  initFilter();
  renderCart();
  initCheckout();
});
