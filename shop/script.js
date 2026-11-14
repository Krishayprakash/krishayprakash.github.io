const grid = document.getElementById('product-grid');
const filter = document.getElementById('category-filter');
const cartPanel = document.getElementById('cart-panel');
const overlay = document.getElementById('overlay');
const cartItemsEl = document.getElementById('cart-items');
const cartCountEl = document.getElementById('cart-count');
const cartTotalEl = document.getElementById('cart-total');
const checkoutButton = document.getElementById('checkout-button');
const checkoutDialog = document.getElementById('checkout-dialog');
let products = [];
let cart = JSON.parse(localStorage.getItem('kp-shop-cart') || '{}');

const money = value => new Intl.NumberFormat('en-IN', {style:'currency', currency:'INR', maximumFractionDigits:0}).format(value);
const safe = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

async function loadProducts() {
  try {
    const response = await fetch('./products.json');
    if (!response.ok) throw new Error('Catalogue could not be loaded');
    products = await response.json();
    renderProducts();
    renderCart();
  } catch (error) {
    grid.innerHTML = '<p class="loading">The catalogue could not be loaded. Please refresh the page.</p>';
  }
}
function renderProducts() {
  const category = filter.value;
  const visible = products.filter(p => (category === 'all' || p.category === category));
  if (!visible.length) { grid.innerHTML = '<p class="loading">No items in this category yet.</p>'; return; }
  grid.innerHTML = visible.map(p => {
    const active = p.active === true && Number.isFinite(Number(p.price)) && Number(p.price) > 0;
    const art = p.image ? `<img src="${safe(p.image)}" alt="${safe(p.name)}">` : (p.category === 'Books' ? '▤' : p.category === 'Services' ? '✦' : '♞');
    return `<article class="product-card">
      <div class="product-art">${art}</div>
      <div class="product-info">
        <span class="product-category">${safe(p.category)}</span>
        <h3>${safe(p.name)}</h3><p>${safe(p.description)}</p>
        <div class="product-bottom">
          <span class="price">${Number.isFinite(Number(p.price)) && Number(p.price) > 0 ? money(Number(p.price)) : '<span class="availability">Price to be announced</span>'}</span>
          <button class="add-button" data-add="${safe(p.id)}" ${active ? '' : 'disabled'}>${active ? 'Add to cart' : 'Unavailable'}</button>
        </div>
      </div></article>`;
  }).join('');
}
function saveCart() { localStorage.setItem('kp-shop-cart', JSON.stringify(cart)); renderCart(); }
function addToCart(id) {
  const product = products.find(p => p.id === id);
  if (!product || !product.active || !(Number(product.price) > 0)) return;
  cart[id] = (cart[id] || 0) + 1; saveCart();
}
function renderCart() {
  const entries = Object.entries(cart).filter(([id, qty]) => products.some(p => p.id === id && p.active && Number(p.price) > 0) && qty > 0);
  const count = entries.reduce((sum, [,qty]) => sum + qty, 0);
  const total = entries.reduce((sum, [id,qty]) => sum + Number(products.find(p => p.id === id).price) * qty, 0);
  cartCountEl.textContent = count;
  cartTotalEl.textContent = money(total);
  checkoutButton.disabled = count === 0;
  if (!entries.length) { cartItemsEl.innerHTML = '<p class="empty-cart">Your cart is empty.</p>'; return; }
  cartItemsEl.innerHTML = entries.map(([id,qty]) => {
    const p = products.find(item => item.id === id);
    return `<div class="cart-row"><div><h3>${safe(p.name)}</h3><p>${money(Number(p.price))} each</p></div><div class="quantity"><button data-change="${safe(id)}" data-delta="-1" aria-label="Decrease quantity">−</button><span>${qty}</span><button data-change="${safe(id)}" data-delta="1" aria-label="Increase quantity">+</button></div></div>`;
  }).join('');
}
function showCart(open) {
  cartPanel.classList.toggle('open', open);
  cartPanel.setAttribute('aria-hidden', String(!open));
  overlay.hidden = !open;
}
function orderSummary() {
  const lines = Object.entries(cart).filter(([id,qty]) => qty > 0 && products.some(p => p.id === id)).map(([id,qty]) => {
    const p = products.find(item => item.id === id);
    return `${p.name} x ${qty} = ${money(Number(p.price) * qty)}`;
  });
  const total = Object.entries(cart).reduce((sum,[id,qty]) => {
    const p = products.find(item => item.id === id);
    return sum + (p ? Number(p.price) * qty : 0);
  }, 0);
  return `ORDER ENQUIRY - KRISHAY PRAKASH STORE\n${lines.join('\n')}\nSubtotal: ${money(total)}`;
}
grid.addEventListener('click', e => { const button = e.target.closest('[data-add]'); if (button) addToCart(button.dataset.add); });
cartItemsEl.addEventListener('click', e => {
  const button = e.target.closest('[data-change]');
  if (!button) return;
  const id = button.dataset.change; cart[id] = (cart[id] || 0) + Number(button.dataset.delta);
  if (cart[id] <= 0) delete cart[id];
  saveCart();
});
filter.addEventListener('change', renderProducts);
document.getElementById('open-cart').addEventListener('click', () => showCart(true));
document.getElementById('close-cart').addEventListener('click', () => showCart(false));
overlay.addEventListener('click', () => showCart(false));
checkoutButton.addEventListener('click', () => { showCart(false); checkoutDialog.showModal(); });
document.getElementById('cancel-checkout').addEventListener('click', () => checkoutDialog.close());
document.getElementById('copy-order').addEventListener('click', async () => {
  const name = document.getElementById('customer-name').value.trim();
  const email = document.getElementById('customer-email').value.trim();
  const notes = document.getElementById('customer-notes').value.trim();
  const status = document.getElementById('checkout-status');
  if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    status.textContent = 'Enter your name and a valid email address first.'; return;
  }
  const message = `${orderSummary()}\nName: ${name}\nEmail: ${email}\nNotes: ${notes || 'None'}\n\nPayment is pending confirmation.`;
  try {
    await navigator.clipboard.writeText(message);
    status.textContent = 'Order summary copied. Send it to the store owner through the contact details published on the main website.';
  } catch {
    status.textContent = 'Clipboard access was blocked. Please copy the order details manually: ' + message;
  }
});
document.getElementById('year').textContent = new Date().getFullYear();
loadProducts();
