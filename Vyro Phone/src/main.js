/* -- main.js — VYRO clothing store -- */
import { products, CATEGORIES, PROMOS, SHIPPING_METHODS, getProduct, FALLBACK_IMG } from './data.js';
import { store, money } from './store.js';

/* ---------------- Helpers ---------------- */
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function toast(msg, dur = 2600) {
  const t = $('#toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove('show'), dur);
}

function stars(rating) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - (half ? 1 : 0));
}

function updateBadges() {
  const cartN = store.cartCount();
  const wishN = store.wishlist.length;
  const cartBadge = $('#cart-badge');
  const wishBadge = $('#wish-badge');
  cartBadge.textContent = cartN;
  cartBadge.hidden = cartN === 0;
  wishBadge.textContent = wishN;
  wishBadge.hidden = wishN === 0;
}

/* ---------------- View state ---------------- */
let shopState = { cat: 'all', sort: 'featured' };
let searchQ = '';
let productSel = { size: null, color: null, qty: 1 };

/* ---------------- Shared partials ---------------- */
function productCard(p) {
  const wished = store.inWishlist(p.id);
  const sale = p.oldPrice ? `<span class="badge sale">−${Math.round((1 - p.price / p.oldPrice) * 100)}%</span>` : '';
  const isNew = p.tags.includes('new') ? `<span class="badge new">NEW</span>` : '';
  return `
  <article class="p-card" data-id="${p.id}">
    <a class="p-img" href="#/product/${p.id}">
      <img src="${p.img}" alt="${esc(p.name)}" loading="lazy" width="400" height="520">
      <span class="badges">${isNew}${sale}</span>
    </a>
    <button class="wish-fab ${wished ? 'on' : ''}" data-action="toggle-wish" data-id="${p.id}" aria-label="Toggle wishlist">
      <i class="${wished ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
    </button>
    <a class="p-meta" href="#/product/${p.id}">
      <span class="p-cat">${esc(p.category)}</span>
      <h3>${esc(p.name)}</h3>
      <div class="p-foot">
        <span class="p-price">${money(p.price)}${p.oldPrice ? ` <s>${money(p.oldPrice)}</s>` : ''}</span>
        <span class="p-rate">${stars(p.rating)}</span>
      </div>
    </a>
  </article>`;
}

function productGrid(list) {
  if (!list.length) {
    return `<div class="empty-state">
      <i class="fa-solid fa-ruler-combined"></i>
      <p>No products found.</p>
      <a class="btn btn-dark" href="#/shop">Browse all styles</a>
    </div>`;
  }
  return `<div class="p-grid">${list.map(productCard).join('')}</div>`;
}

function sectionHead(title, href, linkText = 'View all') {
  return `<div class="section-head"><h2>${esc(title)}</h2>${href ? `<a href="${href}">${linkText} <i class="fa-solid fa-arrow-right"></i></a>` : ''}</div>`;
}

/* ---------------- Views ---------------- */
const views = {

  /* ---------- HOME ---------- */
  home() {
    const news = products.filter(p => p.tags.includes('new')).slice(0, 4);
    const best = products.filter(p => p.tags.includes('bestseller')).slice(0, 6);
    return `
    <section class="hero">
      <img class="hero-img" src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=80" alt="Fashion boutique" width="1400" height="700">
      <div class="hero-overlay"></div>
      <div class="hero-copy">
        <span class="eyebrow">Autumn / Winter ’26</span>
        <h1>New Season,<br>New You.</h1>
        <p>Curated clothing, shoes, and accessories — free shipping over $75.</p>
        <div class="hero-actions">
          <a class="btn btn-light" href="#/shop">Shop Collection</a>
          <a class="btn btn-ghost" href="#/shop?cat=women">Women</a>
        </div>
      </div>
    </section>

    <section class="cats-strip">
      ${CATEGORIES.map(c => `
        <a class="cat-tile" href="#/shop?cat=${c.id}">
          <img src="${c.img}" alt="${c.name}" loading="lazy" width="400" height="400">
          <span>${c.name}</span>
        </a>`).join('')}
    </section>

    <div class="promo-strip">
      <i class="fa-solid fa-tag"></i>
      <div>
        <strong>Mid-Season Sale</strong>
        <span>Use code <code>SAVE15</code> for 15% off — or <code>VIP20</code> on orders $200+</span>
      </div>
      <a href="#/shop?cat=all">Shop sale</a>
    </div>

    <section class="section">
      ${sectionHead('New Arrivals', '#/shop')}
      ${productGrid(news)}
    </section>

    <section class="section">
      ${sectionHead('Bestsellers', '#/shop')}
      ${productGrid(best)}
    </section>`;
  },

  /* ---------- SHOP ---------- */
  shop(query) {
    const cat = query.get('cat') || shopState.cat || 'all';
    shopState.cat = cat;
    let list = cat === 'all' ? [...products] : products.filter(p => p.group === cat);
    switch (shopState.sort) {
      case 'price-asc':  list.sort((a, b) => a.price - b.price); break;
      case 'price-desc': list.sort((a, b) => b.price - a.price); break;
      case 'rating':     list.sort((a, b) => b.rating - a.rating); break;
      case 'newest':     list.sort((a, b) => (b.tags.includes('new') ? 1 : 0) - (a.tags.includes('new') ? 1 : 0)); break;
      default:           list.sort((a, b) => (b.tags.includes('bestseller') ? 1 : 0) - (a.tags.includes('bestseller') ? 1 : 0));
    }
    const title = cat === 'all' ? 'All Products' : (CATEGORIES.find(c => c.id === cat)?.name || 'Shop');
    return `
    <section class="section shop-view">
      <div class="shop-top">
        <h1>${esc(title)}</h1>
        <span class="count">${list.length} item${list.length === 1 ? '' : 's'}</span>
      </div>
      <div class="chip-row">
        <a class="chip ${cat === 'all' ? 'on' : ''}" href="#/shop?cat=all">All</a>
        ${CATEGORIES.map(c => `<a class="chip ${cat === c.id ? 'on' : ''}" href="#/shop?cat=${c.id}">${c.name}</a>`).join('')}
      </div>
      <div class="sort-row">
        <label for="sort-select">Sort by</label>
        <select id="sort-select">
          <option value="featured" ${shopState.sort === 'featured' ? 'selected' : ''}>Featured</option>
          <option value="newest" ${shopState.sort === 'newest' ? 'selected' : ''}>Newest</option>
          <option value="rating" ${shopState.sort === 'rating' ? 'selected' : ''}>Top rated</option>
          <option value="price-asc" ${shopState.sort === 'price-asc' ? 'selected' : ''}>Price: low → high</option>
          <option value="price-desc" ${shopState.sort === 'price-desc' ? 'selected' : ''}>Price: high → low</option>
        </select>
      </div>
      ${productGrid(list)}
    </section>`;
  },

  /* ---------- PRODUCT ---------- */
  product(id) {
    const p = getProduct(id);
    if (!p) {
      return `<div class="empty-state">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <p>Product not found.</p>
        <a class="btn btn-dark" href="#/shop">Back to shop</a>
      </div>`;
    }
    productSel = { size: null, color: p.colors[0].name, qty: 1 };
    const wished = store.inWishlist(p.id);
    const related = products.filter(x => x.group === p.group && x.id !== p.id).slice(0, 4);
    const discount = p.oldPrice ? `<s>${money(p.oldPrice)}</s><span class="off">−${Math.round((1 - p.price / p.oldPrice) * 100)}%</span>` : '';
    return `
    <section class="section pdp">
      <nav class="crumbs">
        <a href="#/shop">Shop</a> <i class="fa-solid fa-chevron-right"></i>
        <a href="#/shop?cat=${p.group}">${esc(p.group)}</a> <i class="fa-solid fa-chevron-right"></i>
        <span>${esc(p.name)}</span>
      </nav>

      <div class="pdp-grid">
        <div class="pdp-gallery">
          <div class="pdp-main-img">
            <img id="pdp-img" src="${p.img}" alt="${esc(p.name)}" width="800" height="1000">
            ${p.oldPrice ? `<span class="badge sale big">SALE</span>` : ''}
          </div>
          <div class="pdp-thumbs">
            <button class="thumb on" data-action="gallery" data-src="${p.img}"><img src="${p.img}" alt="" width="80" height="100"></button>
            <button class="thumb" data-action="gallery" data-src="${p.img.replace('w=800', 'w=900')}"><img src="${p.img.replace('w=800', 'w=900')}" alt="" width="80" height="100"></button>
            <button class="thumb" data-action="gallery" data-src="${p.img.replace('fit=crop', 'fit=crop&crop=entropy')}"><img src="${p.img.replace('fit=crop', 'fit=crop&crop=entropy')}" alt="" width="80" height="100"></button>
          </div>
        </div>

        <div class="pdp-info">
          <span class="p-cat">${esc(p.category)}</span>
          <h1>${esc(p.name)}</h1>
          <div class="pdp-rating">
            <span class="stars">${stars(p.rating)}</span>
            <span>${p.rating} · ${p.reviews} reviews</span>
          </div>
          <div class="pdp-price">${money(p.price)} ${discount}</div>

          <div class="opt-block">
            <div class="opt-label">Colour: <strong id="sel-color">${esc(productSel.color)}</strong></div>
            <div class="color-row">
              ${p.colors.map((c, i) => `
                <button class="color-dot ${i === 0 ? 'on' : ''}" data-action="color" data-color="${esc(c.name)}"
                        style="--dot:${c.hex}" aria-label="${esc(c.name)}" title="${esc(c.name)}"></button>`).join('')}
            </div>
          </div>

          <div class="opt-block">
            <div class="opt-label">Size: <strong id="sel-size">Select</strong>
              <button class="link-btn" data-action="size-guide">Size guide</button>
            </div>
            <div class="size-row">
              ${p.sizes.map(s => `<button class="size-pill" data-action="size" data-size="${esc(s)}">${esc(s)}</button>`).join('')}
            </div>
          </div>

          <div class="opt-block buy-row">
            <div class="qty-selector">
              <button class="qty-btn" data-action="pdp-qty" data-step="-" type="button" aria-label="Decrease">−</button>
              <span class="qty-value" id="pdp-qty">1</span>
              <button class="qty-btn" data-action="pdp-qty" data-step="+" type="button" aria-label="Increase">+</button>
            </div>
            <button class="btn btn-dark btn-grow" data-action="pdp-add" data-id="${p.id}">
              <i class="fa-solid fa-bag-shopping"></i> Add to Cart
            </button>
            <button class="wish-btn ${wished ? 'on' : ''}" data-action="toggle-wish" data-id="${p.id}" aria-label="Toggle wishlist">
              <i class="${wished ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
            </button>
          </div>
          <button class="btn btn-outline btn-block" data-action="buy-now" data-id="${p.id}">Buy it now</button>

          <p class="pdp-desc">${esc(p.desc)}</p>
          <ul class="pdp-details">
            ${p.details.map(d => `<li>${esc(d)}</li>`).join('')}
          </ul>
          <div class="pdp-perks">
            <span><i class="fa-solid fa-truck-fast"></i> Free shipping over $75</span>
            <span><i class="fa-solid fa-rotate-left"></i> 30-day free returns</span>
            <span><i class="fa-solid fa-shield-halved"></i> Secure checkout</span>
          </div>
        </div>
      </div>

      ${related.length ? `
      <div class="section">
        ${sectionHead('You may also like', null)}
        ${productGrid(related)}
      </div>` : ''}
    </section>`;
  },

  /* ---------- CART ---------- */
  cart() {
    const pr = store.pricing();
    if (!pr.lines.length) {
      return `<section class="section">
        <h1 class="page-title">Your Cart</h1>
        <div class="empty-state">
          <i class="fa-solid fa-bag-shopping"></i>
          <p>Your cart is empty.</p>
          <a class="btn btn-dark" href="#/shop">Start shopping</a>
        </div>
      </section>`;
    }
    return `
    <section class="section">
      <h1 class="page-title">Your Cart <span class="count">${store.cartCount()} items</span></h1>

      <div class="cart-lines">
        ${pr.lines.map(l => `
          <div class="cart-line" data-key="${esc(l.key)}">
            <a class="line-img" href="#/product/${l.id}"><img src="${l.product.img}" alt="${esc(l.product.name)}" width="90" height="112"></a>
            <div class="line-info">
              <div class="line-top">
                <a href="#/product/${l.id}" class="line-name">${esc(l.product.name)}</a>
                <button class="icon-btn subtle" data-action="cart-remove" data-key="${esc(l.key)}" aria-label="Remove">
                  <i class="fa-regular fa-trash-can"></i>
                </button>
              </div>
              <span class="line-meta">${esc(l.color)} · Size ${esc(l.size)}</span>
              <div class="line-bottom">
                <div class="qty-selector">
                  <button class="qty-btn" data-action="cart-qty" data-key="${esc(l.key)}" data-step="-" type="button">−</button>
                  <span class="qty-value">${l.qty}</span>
                  <button class="qty-btn" data-action="cart-qty" data-key="${esc(l.key)}" data-step="+" type="button">+</button>
                </div>
                <span class="line-price">${money(l.amount)}</span>
              </div>
            </div>
          </div>`).join('')}
      </div>

      <form class="promo-row" id="promo-form">
        <input type="text" id="promo-input" placeholder="Promo code (try WELCOME10)" value="${esc(pr.promo || '')}" ${pr.promo ? 'disabled' : ''}>
        ${pr.promo
          ? `<button type="button" class="btn btn-outline" data-action="remove-promo">Remove</button>`
          : `<button type="submit" class="btn btn-dark">Apply</button>`}
      </form>
      ${pr.promo ? `<p class="promo-ok"><i class="fa-solid fa-circle-check"></i> ${esc(pr.promo)} applied — ${PROMOS[pr.promo]?.label || ''}</p>` : ''}

      <div class="summary-card">
        <h2>Order Summary</h2>
        <div class="sum-row"><span>Subtotal</span><span>${money(pr.subtotal)}</span></div>
        ${pr.discount ? `<div class="sum-row discount"><span>Discount (${esc(pr.promo)})</span><span>−${money(pr.discount)}</span></div>` : ''}
        <div class="sum-row"><span>Shipping</span><span>${pr.shipping === 0 ? 'FREE' : money(pr.shipping)}</span></div>
        <div class="sum-row"><span>Estimated tax</span><span>${money(pr.tax)}</span></div>
        <div class="sum-row total"><span>Total</span><span>${money(pr.total)}</span></div>
        <a class="btn btn-dark btn-block" href="#/checkout">Checkout · ${money(pr.total)}</a>
      </div>
    </section>`;
  },

  /* ---------- WISHLIST ---------- */
  wishlist() {
    const items = store.wishlist.map(getProduct).filter(Boolean);
    if (!items.length) {
      return `<section class="section">
        <h1 class="page-title">Wishlist</h1>
        <div class="empty-state">
          <i class="fa-regular fa-heart"></i>
          <p>Nothing saved yet.</p>
          <a class="btn btn-dark" href="#/shop">Discover pieces</a>
        </div>
      </section>`;
    }
    return `
    <section class="section">
      <div class="shop-top">
        <h1 class="page-title">Wishlist <span class="count">${items.length} items</span></h1>
        <button class="btn btn-dark" data-action="move-all">Move All to Cart</button>
      </div>
      ${productGrid(items)}
    </section>`;
  },

  /* ---------- CHECKOUT ---------- */
  checkout() {
    const pr = store.pricing();
    if (!pr.lines.length) {
      return `<section class="section">
        <div class="empty-state">
          <i class="fa-solid fa-lock"></i>
          <p>Your cart is empty — nothing to check out.</p>
          <a class="btn btn-dark" href="#/shop">Shop now</a>
        </div>
      </section>`;
    }
    const pf = store.profile;
    const ship = store.state.shippingMethod;
    const pay = store.state.paymentMethod;
    return `
    <section class="section checkout-view">
      <h1 class="page-title">Checkout</h1>

      <form id="checkout-form" novalidate>
        <div class="co-grid">
          <div class="co-main">
            <div class="co-card">
              <h2><span class="step-num">1</span> Shipping Address</h2>
              <div class="form-grid">
                <label class="field"><span>Full name</span>
                  <input name="name" type="text" value="${esc(pf.name)}" autocomplete="name">
                  <em class="err"></em>
                </label>
                <label class="field"><span>Email</span>
                  <input name="email" type="email" value="${esc(pf.email)}" autocomplete="email">
                  <em class="err"></em>
                </label>
                <label class="field"><span>Phone</span>
                  <input name="phone" type="tel" value="${esc(pf.phone)}" autocomplete="tel">
                  <em class="err"></em>
                </label>
                <label class="field full"><span>Address</span>
                  <input name="address" type="text" value="${esc(pf.address)}" autocomplete="street-address">
                  <em class="err"></em>
                </label>
                <label class="field"><span>City</span>
                  <input name="city" type="text" value="${esc(pf.city)}" autocomplete="address-level2">
                  <em class="err"></em>
                </label>
                <label class="field"><span>ZIP code</span>
                  <input name="zip" type="text" value="${esc(pf.zip)}" autocomplete="postal-code">
                  <em class="err"></em>
                </label>
              </div>
            </div>

            <div class="co-card">
              <h2><span class="step-num">2</span> Shipping Method</h2>
              ${Object.entries(SHIPPING_METHODS).map(([id, m]) => {
                const cost = m.freeOver && pr.subtotal >= m.freeOver ? 0 : m.cost;
                return `
                <label class="option-row ${ship === id ? 'on' : ''}">
                  <input type="radio" name="shipping" value="${id}" ${ship === id ? 'checked' : ''}>
                  <div class="opt-info">
                    <strong>${m.label}</strong>
                    <span>${m.note}</span>
                  </div>
                  <span class="opt-cost">${cost === 0 ? 'FREE' : money(cost)}</span>
                </label>`;
              }).join('')}
            </div>

            <div class="co-card">
              <h2><span class="step-num">3</span> Payment</h2>
              <label class="option-row ${pay === 'cod' ? 'on' : ''}">
                <input type="radio" name="payment" value="cod" ${pay === 'cod' ? 'checked' : ''}>
                <div class="opt-info"><strong>Cash on Delivery</strong><span>Pay when your order arrives</span></div>
              </label>
              <label class="option-row ${pay === 'card' ? 'on' : ''}">
                <input type="radio" name="payment" value="card" ${pay === 'card' ? 'checked' : ''}>
                <div class="opt-info"><strong>Credit / Debit Card</strong><span>Visa, Mastercard, Amex</span></div>
              </label>
              <div class="card-fields" id="card-fields" ${pay === 'card' ? '' : 'hidden'}>
                <label class="field full"><span>Card number</span>
                  <input name="cardNumber" inputmode="numeric" placeholder="4242 4242 4242 4242" maxlength="19">
                  <em class="err"></em>
                </label>
                <div class="form-grid">
                  <label class="field"><span>Expiry</span>
                    <input name="cardExp" placeholder="MM/YY" maxlength="5">
                    <em class="err"></em>
                  </label>
                  <label class="field"><span>CVV</span>
                    <input name="cardCvv" inputmode="numeric" placeholder="123" maxlength="4">
                    <em class="err"></em>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <aside class="co-side">
            <div class="summary-card sticky">
              <h2>Your Order</h2>
              <div class="co-items">
                ${pr.lines.map(l => `
                  <div class="co-item">
                    <img src="${l.product.img}" alt="" width="48" height="60">
                    <div>
                      <strong>${esc(l.product.name)}</strong>
                      <span>${esc(l.color)} · ${esc(l.size)} · ×${l.qty}</span>
                    </div>
                    <span>${money(l.amount)}</span>
                  </div>`).join('')}
              </div>
              <div class="sum-row"><span>Subtotal</span><span>${money(pr.subtotal)}</span></div>
              ${pr.discount ? `<div class="sum-row discount"><span>Discount</span><span>−${money(pr.discount)}</span></div>` : ''}
              <div class="sum-row"><span>Shipping</span><span>${pr.shipping === 0 ? 'FREE' : money(pr.shipping)}</span></div>
              <div class="sum-row"><span>Tax</span><span>${money(pr.tax)}</span></div>
              <div class="sum-row total"><span>Total</span><span>${money(pr.total)}</span></div>
              <button type="submit" class="btn btn-dark btn-block">Place Order · ${money(pr.total)}</button>
              <p class="co-note"><i class="fa-solid fa-lock"></i> Secure checkout — your data stays private.</p>
            </div>
          </aside>
        </div>
      </form>
    </section>`;
  },

  /* ---------- CONFIRMATION ---------- */
  confirm(id) {
    const order = store.getOrder(id);
    if (!order) {
      return `<div class="empty-state">
        <i class="fa-solid fa-circle-question"></i>
        <p>Order not found.</p>
        <a class="btn btn-dark" href="#/home">Go home</a>
      </div>`;
    }
    const d = new Date(order.date);
    return `
    <section class="section confirm-view">
      <div class="confirm-hero">
        <div class="confirm-check"><i class="fa-solid fa-check"></i></div>
        <h1>Thank you, ${esc(order.customer.name.split(' ')[0])}!</h1>
        <p>Order <strong>${esc(order.id)}</strong> placed on ${d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}.</p>
        <p class="muted">A confirmation email is on its way to ${esc(order.customer.email)}.</p>
      </div>

      <div class="co-card">
        <h2>Order items</h2>
        <div class="co-items">
          ${order.items.map(it => `
            <div class="co-item">
              <img src="${it.img}" alt="" width="48" height="60">
              <div>
                <strong>${esc(it.name)}</strong>
                <span>${esc(it.color)} · ${esc(it.size)} · ×${it.qty}</span>
              </div>
              <span>${money(it.price * it.qty)}</span>
            </div>`).join('')}
        </div>
        <div class="sum-row"><span>Subtotal</span><span>${money(order.totals.subtotal)}</span></div>
        ${order.totals.discount ? `<div class="sum-row discount"><span>Discount</span><span>−${money(order.totals.discount)}</span></div>` : ''}
        <div class="sum-row"><span>Shipping (${esc(SHIPPING_METHODS[order.shippingMethod]?.label || order.shippingMethod)})</span><span>${order.totals.shipping === 0 ? 'FREE' : money(order.totals.shipping)}</span></div>
        <div class="sum-row"><span>Tax</span><span>${money(order.totals.tax)}</span></div>
        <div class="sum-row total"><span>Total paid</span><span>${money(order.totals.total)}</span></div>
      </div>

      <div class="co-card">
        <h2>Delivery details</h2>
        <p class="detail-lines">
          ${esc(order.customer.name)}<br>
          ${esc(order.customer.address)}, ${esc(order.customer.city)} ${esc(order.customer.zip)}<br>
          ${esc(order.customer.phone)} · ${esc(order.customer.email)}<br>
          Payment: ${order.payment === 'cod' ? 'Cash on Delivery' : 'Card'}
        </p>
      </div>

      <div class="confirm-actions">
        <a class="btn btn-dark" href="#/shop">Continue Shopping</a>
        <a class="btn btn-outline" href="#/profile">View My Orders</a>
      </div>
    </section>`;
  },

  /* ---------- PROFILE ---------- */
  profile() {
    const pf = store.profile;
    const orders = store.orders;
    return `
    <section class="section profile-view">
      <div class="profile-head">
        <div class="avatar-circle">${esc(pf.name.trim().split(/\s+/).map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase())}</div>
        <div>
          <h1>${esc(pf.name)}</h1>
          <p class="muted">${esc(pf.email)}</p>
        </div>
      </div>

      <form class="co-card" id="profile-form">
        <h2>My Details</h2>
        <div class="form-grid">
          <label class="field"><span>Full name</span><input name="name" type="text" value="${esc(pf.name)}"></label>
          <label class="field"><span>Email</span><input name="email" type="email" value="${esc(pf.email)}"></label>
          <label class="field"><span>Phone</span><input name="phone" type="tel" value="${esc(pf.phone)}"></label>
          <label class="field"><span>ZIP code</span><input name="zip" type="text" value="${esc(pf.zip)}"></label>
          <label class="field full"><span>Address</span><input name="address" type="text" value="${esc(pf.address)}"></label>
          <label class="field full"><span>City</span><input name="city" type="text" value="${esc(pf.city)}"></label>
        </div>
        <button type="submit" class="btn btn-dark">Save Changes</button>
      </form>

      <div class="co-card">
        <h2>My Orders <span class="count">${orders.length}</span></h2>
        ${orders.length ? orders.map(o => {
          const d = new Date(o.date);
          return `
          <div class="order-row" data-action="order-toggle" data-id="${esc(o.id)}" role="button" tabindex="0" aria-expanded="false">
            <div class="order-top">
              <div>
                <strong>${esc(o.id)}</strong>
                <span class="muted">${d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })} · ${o.items.reduce((s, i) => s + i.qty, 0)} items</span>
              </div>
              <div class="order-right">
                <div class="order-meta">
                  <span class="order-total">${money(o.totals.total)}</span>
                  <span class="order-status">Confirmed</span>
                </div>
                <i class="fa-solid fa-chevron-down order-chevron" aria-hidden="true"></i>
              </div>
            </div>
            <div class="order-detail" hidden>
              ${o.items.map(it => `<div class="co-item"><img src="${it.img}" alt="" width="40" height="50"><div><strong>${esc(it.name)}</strong><span>${esc(it.color)} · ${esc(it.size)} · ×${it.qty}</span></div><span>${money(it.price * it.qty)}</span></div>`).join('')}
              <p class="muted">Delivering to: ${esc(o.customer.address)}, ${esc(o.customer.city)}</p>
            </div>
          </div>`;
        }).join('') : `<p class="muted">No orders yet — your purchases will appear here.</p>`}
      </div>

      <button class="btn btn-outline btn-block reset-btn" data-action="reset-demo">Reset demo data</button>
    </section>`;
  },

  /* ---------- SEARCH ---------- */
  search(query) {
    searchQ = query.get('q') || '';
    return `
    <section class="section search-view">
      <div class="search-bar">
        <div class="search-input-wrapper">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input type="search" id="search-input" placeholder="Search dresses, sneakers, bags…" value="${esc(searchQ)}" autocomplete="off">
          <button class="icon-btn subtle" id="search-clear" ${searchQ ? '' : 'hidden'} aria-label="Clear"><i class="fa-solid fa-xmark"></i></button>
        </div>
      </div>

      <div class="recent-block" id="recent-block" ${searchQ ? 'hidden' : ''}>
        <div class="section-head">
          <h2>Recent searches</h2>
          ${store.recentSearches.length ? `<button class="link-btn" data-action="clear-recent">Clear all</button>` : ''}
        </div>
        <div class="recent-chips">
          ${store.recentSearches.length
            ? store.recentSearches.map(s => `<button class="chip" data-action="recent-q" data-q="${esc(s)}">${esc(s)}</button>`).join('')
            : '<span class="muted">Search for anything — we will remember it here.</span>'}
        </div>
      </div>

      <div id="search-results">${searchResultsHTML(searchQ)}</div>
    </section>`;
  }
};

function searchResultsHTML(q) {
  const term = q.trim().toLowerCase();
  if (!term) return '';
  const list = products.filter(p =>
    p.name.toLowerCase().includes(term) ||
    p.category.toLowerCase().includes(term) ||
    p.group.toLowerCase().includes(term) ||
    p.tags.some(t => t.includes(term)) ||
    p.desc.toLowerCase().includes(term)
  );
  return `
    <div class="shop-top">
      <h2>${list.length} result${list.length === 1 ? '' : 's'} for “${esc(q.trim())}”</h2>
    </div>
    ${productGrid(list)}`;
}

/* ---------------- Router ---------------- */
const TITLES = {
  home: 'VYRO', shop: 'Shop', product: 'Product', cart: 'Cart',
  wishlist: 'Wishlist', checkout: 'Checkout', confirm: 'Order Confirmed',
  profile: 'My Account', search: 'Search'
};
const BACK_ROUTES = new Set(['product', 'checkout', 'confirm', 'search']);
const NAV_FOR = { home: 'home', shop: 'shop', product: 'shop', cart: 'cart', checkout: 'cart', confirm: 'cart', wishlist: 'wishlist', profile: 'profile', search: null };

function parseHash() {
  const raw = location.hash.replace(/^#\/?/, '') || 'home';
  const [path, qs] = raw.split('?');
  const [name, param] = path.split('/');
  return { name: name || 'home', param: param || null, query: new URLSearchParams(qs || '') };
}

function render(preserveScroll = false) {
  const { name, param, query } = parseHash();
  const view = views[name] || views.home;
  const y = window.scrollY;

  $('#content').innerHTML = view(param || query);
  document.title = `${TITLES[name] || 'VYRO'} — VYRO`;

  $('#back-btn').hidden = !BACK_ROUTES.has(name);
  $$('#bottom-nav a').forEach(a => a.classList.toggle('on', NAV_FOR[name] === a.dataset.nav));

  updateBadges();
  bindView(name);
  if (preserveScroll) window.scrollTo(0, y);
  else window.scrollTo(0, 0);
}

/* ---------------- Per-view bindings ---------------- */
function bindView(name) {
  if (name === 'shop') {
    $('#sort-select')?.addEventListener('change', e => {
      shopState.sort = e.target.value;
      render(true);
    });
  }

  if (name === 'search') {
    const input = $('#search-input');
    const clear = $('#search-clear');
    input?.focus();
    input?.addEventListener('input', () => {
      searchQ = input.value;
      clear.hidden = !searchQ;
      $('#recent-block').hidden = !!searchQ;
      $('#search-results').innerHTML = searchResultsHTML(searchQ);
    });
    input?.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        store.addRecentSearch(input.value);
        $('#search-results').innerHTML = searchResultsHTML(input.value);
      }
    });
    clear?.addEventListener('click', () => {
      searchQ = '';
      input.value = '';
      clear.hidden = true;
      $('#recent-block').hidden = false;
      $('#search-results').innerHTML = '';
      input.focus();
    });
  }

  if (name === 'checkout') {
    const form = $('#checkout-form');
    form?.addEventListener('change', e => {
      if (e.target.name === 'shipping') {
        store.setShipping(e.target.value);
        render(true);
      }
      if (e.target.name === 'payment') {
        store.setPayment(e.target.value);
        $$('.option-row', form).forEach(r => r.classList.toggle('on', r.querySelector('input')?.checked));
        const cf = $('#card-fields');
        if (cf) cf.hidden = e.target.value !== 'card';
      }
    });
    form?.addEventListener('submit', e => {
      e.preventDefault();
      if (validateCheckout(form)) {
        const data = Object.fromEntries(new FormData(form).entries());
        const order = store.placeOrder({
          name: data.name.trim(), email: data.email.trim(), phone: data.phone.trim(),
          address: data.address.trim(), city: data.city.trim(), zip: data.zip.trim()
        });
        if (order) {
          toast('Order placed successfully!');
          location.hash = `#/confirm/${order.id}`;
        }
      } else {
        toast('Please fix the highlighted fields');
      }
    });

    // card number formatting
    form?.querySelector('[name=cardNumber]')?.addEventListener('input', e => {
      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
    });
    form?.querySelector('[name=cardExp]')?.addEventListener('input', e => {
      let v = e.target.value.replace(/\D/g, '').slice(0, 4);
      if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2);
      e.target.value = v;
    });
  }

  if (name === 'cart') {
    $('#promo-form')?.addEventListener('submit', e => {
      e.preventDefault();
      const res = store.applyPromo($('#promo-input').value);
      toast(res.msg);
      if (res.ok) render(true);
    });
  }

  if (name === 'profile') {
    $('#profile-form')?.addEventListener('submit', e => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.target).entries());
      if (!data.name.trim() || !/^\S+@\S+\.\S+$/.test(data.email)) {
        toast('Please enter a valid name and email');
        return;
      }
      store.saveProfile({
        name: data.name.trim(), email: data.email.trim(),
        phone: data.phone.trim(), address: data.address.trim(),
        city: data.city.trim(), zip: data.zip.trim()
      });
      toast('Profile saved');
      render(true);
    });
  }
}

/* ---------------- Checkout validation ---------------- */
function validateCheckout(form) {
  let ok = true;
  const setErr = (input, msg) => {
    const field = input.closest('.field');
    field?.classList.toggle('error', !!msg);
    const em = field?.querySelector('.err');
    if (em) em.textContent = msg || '';
    if (msg) ok = false;
  };
  const v = n => (form.querySelector(`[name=${n}]`)?.value || '').trim();

  const name = v('name');
  setErr(form.querySelector('[name=name]'), name.length < 2 ? 'Enter your full name' : '');
  const email = v('email');
  setErr(form.querySelector('[name=email]'), !/^\S+@\S+\.\S+$/.test(email) ? 'Enter a valid email' : '');
  const phone = v('phone');
  setErr(form.querySelector('[name=phone]'), phone.replace(/\D/g, '').length < 7 ? 'Enter a valid phone' : '');
  const address = v('address');
  setErr(form.querySelector('[name=address]'), address.length < 5 ? 'Enter your street address' : '');
  const city = v('city');
  setErr(form.querySelector('[name=city]'), city.length < 2 ? 'Enter your city' : '');
  const zip = v('zip');
  setErr(form.querySelector('[name=zip]'), zip.length < 4 ? 'Enter a valid ZIP' : '');

  if (store.state.paymentMethod === 'card') {
    const num = v('cardNumber').replace(/\s/g, '');
    setErr(form.querySelector('[name=cardNumber]'), num.length !== 16 ? 'Enter a 16-digit card number' : '');
    const exp = v('cardExp');
    setErr(form.querySelector('[name=cardExp]'), !/^(0[1-9]|1[0-2])\/\d{2}$/.test(exp) ? 'MM/YY' : '');
    const cvv = v('cardCvv');
    setErr(form.querySelector('[name=cardCvv]'), !/^\d{3,4}$/.test(cvv) ? '3–4 digits' : '');
  }

  if (!ok) form.querySelector('.field.error input')?.focus();
  return ok;
}

/* ---------------- Global interactions ---------------- */
document.addEventListener('click', e => {
  const t = e.target;

  const nav = t.closest('[data-nav]');
  if (nav) {
    e.preventDefault();
    location.hash = `#/${nav.dataset.nav}`;
    return;
  }

  if (t.closest('#back-btn')) {
    location.hash = backTarget || '#/home';
    return;
  }

  const act = t.closest('[data-action]');
  if (!act) return;
  const action = act.dataset.action;

  switch (action) {
    case 'toggle-wish': {
      const on = store.toggleWishlist(act.dataset.id);
      toast(on ? 'Saved to wishlist ♥' : 'Removed from wishlist');
      updateBadges();
      if (parseHash().name === 'wishlist') render(true);
      else {
        act.classList.toggle('on', on);
        const icon = act.querySelector('i');
        if (icon) icon.className = on ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
      }
      break;
    }

    case 'gallery': {
      const img = $('#pdp-img');
      if (img && act.dataset.src) {
        img.src = act.dataset.src;
        $$('.thumb').forEach(th => th.classList.toggle('on', th === act));
      }
      break;
    }

    case 'color': {
      $$('.color-dot').forEach(d => d.classList.toggle('on', d === act));
      productSel.color = act.dataset.color;
      const label = $('#sel-color');
      if (label) label.textContent = productSel.color;
      break;
    }

    case 'size': {
      $$('.size-pill').forEach(s => s.classList.toggle('on', s === act));
      productSel.size = act.dataset.size;
      const label = $('#sel-size');
      if (label) label.textContent = productSel.size;
      break;
    }

    case 'size-guide':
      toast('XS 32–34 · S 36–38 · M 38–40 · L 42–44 · XL 46');
      break;

    case 'pdp-qty': {
      productSel.qty = Math.max(1, Math.min(10, productSel.qty + (act.dataset.step === '+' ? 1 : -1)));
      const q = $('#pdp-qty');
      if (q) q.textContent = productSel.qty;
      break;
    }

    case 'pdp-add': {
      if (!productSel.size) { toast('Please select a size'); return; }
      store.addToCart(act.dataset.id, productSel.size, productSel.color, productSel.qty);
      toast('Added to cart ✓');
      updateBadges();
      break;
    }

    case 'buy-now': {
      if (!productSel.size) { toast('Please select a size'); return; }
      store.addToCart(act.dataset.id, productSel.size, productSel.color, productSel.qty);
      updateBadges();
      location.hash = '#/checkout';
      break;
    }

    case 'cart-qty': {
      const line = store.cart.find(l => l.key === act.dataset.key);
      if (!line) return;
      store.setQty(line.key, line.qty + (act.dataset.step === '+' ? 1 : -1));
      render(true);
      break;
    }

    case 'cart-remove': {
      store.removeFromCart(act.dataset.key);
      toast('Removed from cart');
      render(true);
      break;
    }

    case 'remove-promo': {
      store.removePromo();
      render(true);
      break;
    }

    case 'move-all': {
      const n = store.moveWishlistToCart();
      toast(n ? `${n} item${n === 1 ? '' : 's'} moved to cart` : 'Wishlist is empty');
      updateBadges();
      render(true);
      break;
    }

    case 'recent-q': {
      searchQ = act.dataset.q;
      const input = $('#search-input');
      if (input) input.value = searchQ;
      $('#recent-block').hidden = true;
      $('#search-clear').hidden = false;
      $('#search-results').innerHTML = searchResultsHTML(searchQ);
      break;
    }

    case 'clear-recent': {
      store.clearRecentSearches();
      render(true);
      break;
    }

    case 'order-toggle': {
      const detail = act.querySelector('.order-detail');
      if (detail) {
        detail.hidden = !detail.hidden;
        act.classList.toggle('open', !detail.hidden);
        act.setAttribute('aria-expanded', String(!detail.hidden));
      }
      break;
    }

    case 'reset-demo': {
      if (confirm('Reset cart, wishlist, orders, and profile to defaults?')) {
        localStorage.removeItem('vyro-store-v1');
        location.reload();
      }
      break;
    }
  }
});

/* ---------------- Keyboard: activate role=button rows ---------------- */
document.addEventListener('keydown', e => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches?.('.order-row[role="button"]')) {
    e.preventDefault();
    e.target.click();
  }
});

/* ---------------- Image fallback ---------------- */
document.addEventListener('error', e => {
  const img = e.target;
  if (img.tagName === 'IMG' && !img.dataset.fb) {
    img.dataset.fb = '1';
    img.src = FALLBACK_IMG;
  }
}, true);

/* ---------------- Boot ---------------- */
let backTarget = '#/home';
let lastHash = location.hash || '#/home';

window.addEventListener('hashchange', () => {
  if (lastHash !== location.hash) backTarget = lastHash;
  lastHash = location.hash;
  render(false);
});

render(false);
lastHash = location.hash || '#/home';
