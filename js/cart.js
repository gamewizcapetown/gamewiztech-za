const ZAR_TO_USD = 16.36;
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartUI();
}

function updateCartUI() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = count;
  });
}

function addToCart(id, name, price) {
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id, name, price: parseFloat(price), qty: 1 });
  }
  saveCart();
  showCart();
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
  renderCartModal();
}

function updateQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (item) {
    item.qty += delta;
    if (item.qty <= 0) {
      removeFromCart(id);
      return;
    }
    saveCart();
    renderCartModal();
  }
}

function getTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0).toFixed(2);
}

function getTotalUSD() {
  return (parseFloat(getTotal()) / ZAR_TO_USD).toFixed(2);
}

function renderCartModal() {
  const list = document.getElementById('cart-items-list');
  const totalEl = document.getElementById('cart-total-price');
  if (!list) return;

  if (cart.length === 0) {
    list.innerHTML = '<div class="cart-empty">Your cart is empty</div>';
    totalEl.textContent = 'R0.00';
    return;
  }

  list.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-info">
        <div>
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">R${item.price.toFixed(2)} <span class="usd-price">(~$${(item.price / ZAR_TO_USD).toFixed(2)})</span></div>
        </div>
      </div>
      <div class="cart-item-qty">
        <button class="qty-btn" onclick="updateQty('${item.id}', -1)">-</button>
        <span>${item.qty}</span>
        <button class="qty-btn" onclick="updateQty('${item.id}', 1)">+</button>
        <button class="remove-btn" onclick="removeFromCart('${item.id}')">Remove</button>
      </div>
    </div>
  `).join('');

    totalEl.textContent = `R${getTotal()} (~$${getTotalUSD()})`;
}

function showCart() {
  document.getElementById('cart-modal').classList.add('open');
  document.getElementById('cart-overlay').classList.add('open');
  renderCartModal();
}

function hideCart() {
  document.getElementById('cart-modal').classList.remove('open');
  document.getElementById('cart-overlay').classList.remove('open');
}

function checkout() {
  if (cart.length === 0) return;
  const items = cart.map(i => `${i.name} x${i.qty}`).join(', ');
  const total = getTotal();
  const totalUSD = getTotalUSD();
  hideCart();
  window.location.href = `contact.html?order=${encodeURIComponent(items)}&total=R${total} (~$${totalUSD})`;
}

document.addEventListener('DOMContentLoaded', updateCartUI);
