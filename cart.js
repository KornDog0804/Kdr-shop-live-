
const $ = (s)=>document.querySelector(s);
const fmt = (n)=>'$'+n.toFixed(2);

// Discount tiers
const TIER10 = 120; // 10% at $120+
const TIER15 = 200; // 15% at $200+

export const Cart = {
  key: 'kdr.cart.v2',
  items: [],
  el: {
    drawer: $('#cart'),
    items: $('#cartItems'),
    total: $('#cartTotal'),
    count: $('#cartCount'),
    breakdown: $('#breakdown'),
    paypal: $('#paypalContainer'),
  },
  load(){
    try { this.items = JSON.parse(localStorage.getItem(this.key)||'[]'); } catch { this.items = []; }
    this.render();
  },
  save(){ localStorage.setItem(this.key, JSON.stringify(this.items)); this.render(); },
  add(item){
    // Respect defaultQty / maxQty from item (if provided by JSON)
    const defaultQty = Math.max(1, item.defaultQty || 1);
    const maxQty = item.maxQty || 1;
    const ix = this.items.findIndex(i=>i.id===item.id);
    if(ix>-1){
      this.items[ix].qty = Math.min(maxQty, this.items[ix].qty + 1);
    } else {
      const startQty = Math.min(maxQty, defaultQty);
      this.items.push({ ...item, qty: startQty });
    }
    this.save();
  },
  remove(id){ this.items = this.items.filter(i=>i.id!==id); this.save(); },
  qty(id, delta){
    const it = this.items.find(i=>i.id===id); if(!it) return;
    it.qty = Math.max(1, it.qty + delta);
    this.save();
  },
  clear(){ this.items = []; this.save(); },
  subtotal(){ return this.items.reduce((s,i)=>s + Number(i.price||0) * i.qty, 0); },
  totals(){
    const sub = this.subtotal();
    const rate = sub >= TIER15 ? 0.15 : (sub >= TIER10 ? 0.10 : 0);
    const disc = +(sub * rate).toFixed(2);
    const total = +(sub - disc).toFixed(2);
    return { sub, rate, disc, total };
  },
  render(){
    // Items
    this.el.items.innerHTML = this.items.map(i=>`
      <div class="cart-item">
        <img src="${i.image}" alt="${i.title}"/>
        <div style="flex:1">
          <div style="font-weight:800">${i.title}</div>
          <div class="muted">${fmt(+i.price)} × ${i.qty}</div>
          <div style="margin-top:6px;display:flex;gap:6px">
            <button class="btn" onclick="Cart.qty('${i.id}',-1)">−</button>
            <button class="btn" onclick="Cart.qty('${i.id}',+1)">+</button>
            <button class="btn" style="margin-left:auto" onclick="Cart.remove('${i.id}')">Remove</button>
          </div>
        </div>
      </div>
    `).join('');
    // Counts
    const c = this.items.reduce((n,i)=>n+i.qty,0);
    this.el.count.textContent = c;
    // Totals
    const { sub, rate, disc, total } = this.totals();
    this.el.total.textContent = fmt(total);
    this.el.breakdown.textContent = `Subtotal: ${fmt(sub)}${ rate? ` • Discount (${Math.round(rate*100)}%): -${fmt(disc)}`:'' }`;
    // Clear button
    $('#clearCart')?.addEventListener('click', ()=> this.clear());
    // PayPal
    this.mountPayPal();
  },
  open(){ this.el.drawer.classList.add('open'); },
  close(){ this.el.drawer.classList.remove('open'); },
  async mountPayPal(){
    this.el.paypal.innerHTML='';
    if(this.items.length===0) return;
    const cfg = await fetch('/.netlify/functions/paypal-config').then(r=>r.json()).catch(()=>({clientId:''}));
    if(!cfg.clientId){
      const warn = document.createElement('div'); warn.className='muted'; warn.textContent='Add PAYPAL_CLIENT_ID env var to enable checkout.';
      this.el.paypal.appendChild(warn); return;
    }
    await new Promise((resolve,reject)=>{
      if(window.paypal) return resolve();
      const s = document.createElement('script');
      s.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(cfg.clientId)}&currency=${cfg.currency||'USD'}`;
      s.onload=resolve; s.onerror=reject; document.head.appendChild(s);
    });
    const totals = this.totals();
    window.paypal.Buttons({
      style:{ layout:'horizontal' },
      createOrder: (data, actions)=> actions.order.create({ purchase_units:[{ amount:{ value: totals.total.toFixed(2) } }] }),
      onApprove: async (data, actions)=>{
        const detail = await actions.order.capture();
        // Decrement inventory for items with trackInventory=true
        try{
          const key = 'content/live.json';
          const content = await fetch('/.netlify/functions/get-content?key='+encodeURIComponent(key)).then(r=>r.json());
          for(const ci of Cart.items){
            for(const section of content.sections || []){
              for(const it of section.items || []){
                if(it.title === ci.title && it.trackInventory){
                  const cur = Math.max(0, Number(it.stock||1) - ci.qty);
                  it.stock = cur;
                }
              }
            }
          }
          await fetch('/.netlify/functions/publish', {
            method:'POST', headers:{'content-type':'application/json'},
            body: JSON.stringify({ key, data: content })
          });
        }catch(e){ console.warn('Inventory update failed:', e); }
        Cart.clear();
        Cart.close();
        alert('Payment complete. Thanks!');
      },
      onError: (err)=> alert('PayPal error: '+(err?.message||err))
    }).render(this.el.paypal);
  }
};

window.Cart = Cart; // expose for onclick
$('#openCart')?.addEventListener('click', ()=>Cart.open());
$('#closeCart')?.addEventListener('click', ()=>Cart.close());
Cart.load();
