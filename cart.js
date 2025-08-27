          /* cart.js  — KornDog Records
   Cart logic + PayPal checkout (LIVE)
   -------------------------------------------------- */

/* === PayPal config (EDIT IF NEEDED) ====================== */
// Your live PayPal business email (Netlify env vars can't be read in the browser)
const PAYPAL_BUSINESS =
  (window.PAYPAL_BUSINESS && String(window.PAYPAL_BUSINESS)) ||
  "tians.rule1215@gmail.com";       // <— your live PayPal email

const PAYPAL_MODE     = "live";     // 'live' | 'sandbox'
const PAYPAL_CURRENCY = "USD";
const PAYPAL_BASE =
  PAYPAL_MODE === "live"
    ? "https://www.paypal.com/cgi-bin/webscr"
    : "https://www.sandbox.paypal.com/cgi-bin/webscr";
/* ======================================================== */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const money = n => `$${Number(n || 0).toFixed(2)}`;
const STORE_KEY = "kdr.cart.v2";

/* ---------- Drawer UI (auto-injected if missing) ---------- */
function ensureDrawer() {
  if ($("#cartDrawer")) return;

  const style = document.createElement("style");
  style.textContent = `
  .kdr-btn{all:unset;cursor:pointer;background:#2d2f3a;color:#dbe8ff;padding:.6rem .9rem;border-radius:.6rem}
  .kdr-btn.primary{background:linear-gradient(135deg,#7c4dff,#00c2a8);color:#001018;font-weight:700}
  .kdr-btn[disabled]{opacity:.5;cursor:not-allowed}
  #openCart{position:fixed;top:14px;right:14px;background:#a88bff;color:#0b1020;padding:.45rem .7rem;border-radius:.6rem;font-weight:700}
  #cartDrawer{position:fixed;inset:0 0 0 auto;width:min(94vw,420px);background:#0c1220;color:#d9e2ff;transform:translateX(100%);
    transition:transform .28s ease;z-index:60;display:flex;flex-direction:column;box-shadow:-6px 0 24px rgba(0,0,0,.35)}
  #cartDrawer.open{transform:translateX(0)}
  #cartHeader{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid #1b2437}
  #cartItems{flex:1;overflow:auto;padding:8px 10px}
  .kdr-row{display:grid;grid-template-columns:56px 1fr auto;gap:10px;align-items:center;padding:10px;border-bottom:1px dashed #1b2437}
  .kdr-row img{width:56px;height:56px;object-fit:cover;border-radius:.5rem;border:1px solid #283047}
  .kdr-qty{display:flex;gap:6px;align-items:center}
  .kdr-qty button{width:26px;height:26px;border-radius:.5rem;background:#1a2132;color:#cfe2ff;border:none}
  .kdr-qty input{width:36px;text-align:center;background:#0c1220;color:#fff;border:1px solid #1a243a;border-radius:.4rem;height:26px}
  #cartFooter{padding:12px 14px;border-top:1px solid #1b2437}
  #cartFooter .sum{display:flex;justify-content:space-between;margin:6px 0}
  #cartFooter .actions{display:flex;gap:8px;margin-top:10px}
  `;
  document.head.appendChild(style);

  const toggle = document.createElement("button");
  toggle.id = "openCart";
  toggle.className = "kdr-btn";
  toggle.textContent = "Cart";
  document.body.appendChild(toggle);

  const drawer = document.createElement("aside");
  drawer.id = "cartDrawer";
  drawer.innerHTML = `
    <div id="cartHeader">
      <div style="font-weight:800">Your Cart</div>
      <button id="closeCart" class="kdr-btn">Close</button>
    </div>
    <div id="cartItems"></div>
    <div id="cartFooter">
      <div class="sum"><span>Subtotal:</span><span id="cartSubtotal">$0.00</span></div>
      <div class="sum"><span>Total:</span><span id="cartTotal">$0.00</span></div>
      <div class="actions">
        <button id="clearCart" class="kdr-btn">Clear cart</button>
        <button id="checkoutBtn" class="kdr-btn primary">Checkout</button>
      </div>
    </div>
  `;
  document.body.appendChild(drawer);

  toggle.addEventListener("click", () => drawer.classList.add("open"));
  $("#closeCart").addEventListener("click", () => drawer.classList.remove("open"));
}

/* ---------- Core cart state ---------- */
const CartState = {
  list: [],
  load() {
    try { this.list = JSON.parse(localStorage.getItem(STORE_KEY) || "[]"); }
    catch { this.list = []; }
  },
  save() {
    localStorage.setItem(STORE_KEY, JSON.stringify(this.list));
    Cart.render();
  },
  find(id) { return this.list.find(x => x.id === id); },
  remove(id) { this.list = this.list.filter(x => x.id !== id); this.save(); },
  clear() { this.list = []; this.save(); },
  total() { return this.list.reduce((s, x) => s + x.price * (x.qty || 1), 0); }
};
CartState.load();

/* ---------- PayPal URL ---------- */
function buildPayPalUrl(items) {
  const p = new URLSearchParams({
    cmd: "_cart",
    upload: "1",
    currency_code: PAYPAL_CURRENCY,
    business: PAYPAL_BUSINESS
  });
  items.forEach((it, i) => {
    const n = i + 1;
    p.set(`item_name_${n}`, it.title);
    p.set(`amount_${n}`, Number(it.price).toFixed(2));
    p.set(`quantity_${n}`, it.qty || 1);
  });
  return `${PAYPAL_BASE}?${p.toString()}`;
}

/* ---------- Rendering ---------- */
function rowTemplate(it) {
  return `
    <div class="kdr-row" data-id="${it.id}">
      <img src="${it.image || ""}" alt="">
      <div>
        <div style="font-weight:700">${it.title}</div>
        <div class="kdr-qty" style="margin-top:6px">
          <button data-act="dec">-</button>
          <input data-act="qty" value="${it.qty || 1}" inputmode="numeric" />
          <button data-act="inc">+</button>
          <button data-act="rm" style="margin-left:10px" class="kdr-btn">remove</button>
        </div>
      </div>
      <div style="font-weight:700">${money(it.price * (it.qty || 1))}</div>
    </div>
  `;
}

/* ---------- Public API ---------- */
export const Cart = {
  /* Add item: { id, title, price, image, category, qty? } */
  add(item) {
    ensureDrawer();
    const qty = Number(item.qty || 1);
    const ex = CartState.find(item.id);
    if (ex) ex.qty = (ex.qty || 1) + qty;
    else CartState.list.push({ id: item.id, title: item.title, price: Number(item.price || 0), image: item.image, category: item.category, qty });
    CartState.save();
  },
  remove(id) { CartState.remove(id); },
  clear() { CartState.clear(); },
  items() { return [...CartState.list]; },
  total() { return CartState.total(); },

  render() {
    ensureDrawer();
    const items = CartState.list;
    const box = $("#cartItems");
    if (!box) return;

    box.innerHTML = items.length
      ? items.map(rowTemplate).join("")
      : `<div style="padding:18px;color:#8aa0c8">Cart is empty.</div>`;

    $("#cartSubtotal").textContent = money(CartState.total());
    $("#cartTotal").textContent = money(CartState.total());

    // row controls
    $$(".kdr-row").forEach(row => {
      const id = row.getAttribute("data-id");
      row.addEventListener("click", e => {
        const act = e.target?.getAttribute("data-act");
        const it = CartState.find(id);
        if (!it) return;

        if (act === "inc") it.qty = (it.qty || 1) + 1;
        if (act === "dec") it.qty = Math.max(1, (it.qty || 1) - 1);
        if (act === "qty") {
          const v = Number(e.target.value || 1);
          it.qty = isFinite(v) && v > 0 ? Math.floor(v) : 1;
        }
        if (act === "rm") CartState.remove(id);
        CartState.save();
      });
    });

    // footer actions
    $("#clearCart")?.addEventListener("click", () => Cart.clear());
    $("#checkoutBtn")?.addEventListener("click", () => {
      if (!CartState.list.length) return;
      window.location.href = buildPayPalUrl(CartState.list);
    });
  }
};

// First render on load
document.addEventListener("DOMContentLoaded", () => Cart.render());

// Optional external triggers (if your HTML already has these IDs)
$("#openCart")?.addEventListener("click", () => $("#cartDrawer")?.classList.add("open"));
$("#closeCart")?.addEventListener("click", () => $("#cartDrawer")?.classList.remove("open"));
