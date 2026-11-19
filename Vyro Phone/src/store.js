/* -- store.js — cart / wishlist / orders / profile with localStorage -- */
import { getProduct, PROMOS, SHIPPING_METHODS, TAX_RATE } from './data.js';

const KEY = 'vyro-store-v1';

const DEFAULTS = {
  cart: [],            // [{ key, id, size, color, qty }]
  wishlist: [],        // [productId]
  orders: [],          // [{ id, date, ... }]
  profile: {
    name: 'Alex Gilles',
    email: 'alex@example.com',
    phone: '+1 555 010 2030',
    address: '1901 Thornridge Cir.',
    city: 'Shiloh',
    zip: '81063'
  },
  recentSearches: ['sneakers', 'linen blazer', 'gold hoops'],
  promo: null,
  shippingMethod: 'standard',
  paymentMethod: 'cod'
};

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY));
    if (!raw || typeof raw !== 'object') return structuredClone(DEFAULTS);
    return { ...structuredClone(DEFAULTS), ...raw, profile: { ...DEFAULTS.profile, ...(raw.profile || {}) } };
  } catch {
    return structuredClone(DEFAULTS);
  }
}

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(store.state)); } catch { /* private mode */ }
}

export const lineKey = (id, size, color) => `${id}::${size}::${color}`;

export const store = {
  state: load(),

  /* ---------- Cart ---------- */
  get cart() { return this.state.cart; },

  cartCount() {
    return this.state.cart.reduce((s, l) => s + l.qty, 0);
  },

  addToCart(id, size, color, qty = 1) {
    const key = lineKey(id, size, color);
    const line = this.state.cart.find(l => l.key === key);
    if (line) line.qty = Math.min(10, line.qty + qty);
    else this.state.cart.push({ key, id, size, color, qty: Math.min(10, qty) });
    save();
    return key;
  },

  setQty(key, qty) {
    const line = this.state.cart.find(l => l.key === key);
    if (!line) return;
    line.qty = Math.max(1, Math.min(10, qty));
    save();
  },

  removeFromCart(key) {
    this.state.cart = this.state.cart.filter(l => l.key !== key);
    save();
  },

  clearCart() {
    this.state.cart = [];
    save();
  },

  /* ---------- Wishlist ---------- */
  get wishlist() { return this.state.wishlist; },

  inWishlist(id) { return this.state.wishlist.includes(id); },

  toggleWishlist(id) {
    const i = this.state.wishlist.indexOf(id);
    if (i >= 0) this.state.wishlist.splice(i, 1);
    else this.state.wishlist.push(id);
    save();
    return this.inWishlist(id);
  },

  removeFromWishlist(id) {
    this.state.wishlist = this.state.wishlist.filter(w => w !== id);
    save();
  },

  moveWishlistToCart() {
    let moved = 0;
    this.state.wishlist.forEach(id => {
      const p = getProduct(id);
      if (!p) return;
      this.addToCart(id, p.sizes[0], p.colors[0].name, 1);
      moved++;
    });
    this.state.wishlist = [];
    save();
    return moved;
  },

  /* ---------- Promo ---------- */
  applyPromo(code) {
    const c = (code || '').trim().toUpperCase();
    if (!c) return { ok: false, msg: 'Enter a code' };
    const promo = PROMOS[c];
    if (!promo) return { ok: false, msg: 'Invalid promo code' };
    const { subtotal } = this.pricing();
    if (promo.minSubtotal && subtotal < promo.minSubtotal) {
      return { ok: false, msg: `Requires ${money(promo.minSubtotal)} subtotal` };
    }
    this.state.promo = c;
    save();
    return { ok: true, msg: `${c} applied — ${promo.label}` };
  },

  removePromo() {
    this.state.promo = null;
    save();
  },

  setShipping(method) {
    if (SHIPPING_METHODS[method]) { this.state.shippingMethod = method; save(); }
  },

  setPayment(method) {
    this.state.paymentMethod = method;
    save();
  },

  /* ---------- Pricing ---------- */
  pricing() {
    const lines = this.state.cart.map(l => {
      const p = getProduct(l.id);
      return p ? { ...l, product: p, amount: p.price * l.qty } : null;
    }).filter(Boolean);
    const subtotal = lines.reduce((s, l) => s + l.amount, 0);

    let discount = 0;
    const promo = this.state.promo && PROMOS[this.state.promo];
    if (promo && (!promo.minSubtotal || subtotal >= promo.minSubtotal)) {
      discount = +(subtotal * promo.pct / 100).toFixed(2);
    }

    const method = SHIPPING_METHODS[this.state.shippingMethod] || SHIPPING_METHODS.standard;
    let shipping = 0;
    if (lines.length) {
      shipping = (method.freeOver && subtotal >= method.freeOver) ? 0 : method.cost;
    }

    const tax = +((subtotal - discount) * TAX_RATE).toFixed(2);
    const total = +(subtotal - discount + shipping + tax).toFixed(2);

    return { lines, subtotal, discount, shipping, tax, total, promo: promo ? this.state.promo : null, method };
  },

  /* ---------- Orders ---------- */
  placeOrder(customer) {
    const p = this.pricing();
    if (!p.lines.length) return null;
    const order = {
      id: 'VY-' + Date.now().toString(36).toUpperCase(),
      date: new Date().toISOString(),
      customer: { ...customer },
      payment: this.state.paymentMethod,
      shippingMethod: this.state.shippingMethod,
      promo: p.promo,
      items: p.lines.map(l => ({
        id: l.id, name: l.product.name, size: l.size, color: l.color,
        qty: l.qty, price: l.product.price, img: l.product.img
      })),
      totals: { subtotal: p.subtotal, discount: p.discount, shipping: p.shipping, tax: p.tax, total: p.total }
    };
    this.state.orders.unshift(order);
    this.state.cart = [];
    this.state.promo = null;
    save();
    return order;
  },

  getOrder(id) { return this.state.orders.find(o => o.id === id); },
  get orders() { return this.state.orders; },

  /* ---------- Profile ---------- */
  get profile() { return this.state.profile; },

  saveProfile(patch) {
    Object.assign(this.state.profile, patch);
    save();
  },

  /* ---------- Recent searches ---------- */
  get recentSearches() { return this.state.recentSearches; },

  addRecentSearch(q) {
    const term = q.trim();
    if (!term) return;
    const list = this.state.recentSearches.filter(s => s.toLowerCase() !== term.toLowerCase());
    list.unshift(term);
    this.state.recentSearches = list.slice(0, 8);
    save();
  },

  clearRecentSearches() {
    this.state.recentSearches = [];
    save();
  }
};

export function money(n) {
  return `$${Number(n).toFixed(2)}`;
}
