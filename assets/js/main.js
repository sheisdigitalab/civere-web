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

// ---- PRODUCT PAGE: qty + add to cart ----
function initProductPage() {
  const qtySpan  = document.querySelector('.qty-input .qty-val');
  const qtyMinus = document.querySelector('.qty-minus');
  const qtyPlus  = document.querySelector('.qty-plus');
  const addBtn   = document.querySelector('.btn-add-cart');
  if (!addBtn) return;

  let qty = 1;
  function setQty(n) {
    qty = Math.max(1, n);
    if (qtySpan) qtySpan.textContent = qty;
  }
  if (qtyMinus) qtyMinus.addEventListener('click', () => setQty(qty - 1));
  if (qtyPlus)  qtyPlus.addEventListener('click',  () => setQty(qty + 1));

  addBtn.addEventListener('click', () => {
    addToCart({
      id:    addBtn.dataset.id,
      name:  addBtn.dataset.name,
      price: parseFloat(addBtn.dataset.price),
      cat:   addBtn.dataset.cat,
      img:   addBtn.dataset.img,
      qty,
    });
    addBtn.textContent = '✓ Añadido';
    setTimeout(() => { addBtn.textContent = 'Añadir al carrito'; }, 2000);
  });
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
  document.querySelectorAll('.filter-group ul li a').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const parent = link.closest('.filter-group');
      parent.querySelectorAll('a').forEach(a => a.classList.remove('active'));
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
  if (subEl)   subEl.textContent   = subtotal.toFixed(2) + ' €';
  if (shipEl)  shipEl.textContent  = shipping === 0 ? 'Gratis' : shipping.toFixed(2) + ' €';
  if (totalEl) totalEl.textContent = total.toFixed(2) + ' €';
  if (freeEl)  freeEl.style.display = shipping === 0 ? '' : 'none';
  document.querySelectorAll('.cart-count-text').forEach(el => el.textContent = cartCount() + ' producto' + (cartCount() !== 1 ? 's' : ''));
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
  initAccordion();
  initGallery();
  initProductPage();
  initQuickAdd();
  initFilter();
  renderCart();
  initCheckout();
});
