
// KornDog Records — v3.2 (UpCloud live publish)
// - 2x2 mobile grid, kitty toasts, locked discounts 10%/15%, clear cart
// - Admin edits + UpCloud upload + Publish Live to catalog.json

const PAYPAL_EMAIL = "tians.rule1215@gmail.com"; // locked
const ADMIN_PASSWORD = "......";                  // six dots
const CLOUD_CATALOG_URL = "https://kdr-live.nyc1.upcloudobjects.com/catalog.json"; // change host if needed

const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } };
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const DBKEY = "kdr_data_v3_2";
const IMGKEY = "kdr_images_v3_2";
const SETTINGSKEY = "kdr_settings_v3_2";

const seed = {
  settings: {
    shipping: 7.99,
    aboutLeft: "Vinyl therapy is always on deck. This is our little corner for records, memories, and the chaos that keeps us grounded.",
    aboutRight: "Kitties, chaos and grooves. Thanks for rolling through our tiny shop — enjoy the hunt!",
    heroes: { home:"korndog_logo.png", collect:"ozzy_box.png", aboutLeft:"kitty_purple.png", aboutRight:"kitty_green.png" }
  },
  records: [
    { id:"sleep_token", title:"Sleep Token — Even in Arcadia", price:65.00, type:"Vinyl", qtyDefault:1, condition:"New", imgFront:null, imgBack:null },
    { id:"bfmv_poison", title:"Bullet For My Valentine — The Poison (20th Anniversary)", price:35.00, type:"Vinyl", qtyDefault:1, condition:"New", imgFront:null, imgBack:null },
    { id:"sevendust_home", title:"Sevendust — Home (EU Import)", price:50.00, type:"Vinyl", qtyDefault:1, condition:"New", imgFront:null, imgBack:null },
    { id:"rhcp_cal", title:"RHCP — Californication", price:30.00, type:"Vinyl", qtyDefault:1, condition:"Used", imgFront:"korndog_logo.png", imgBack:"korndog_logo.png" },
    { id:"random_10", title:"$10 Dolla Holla (Random Record)", price:10.00, type:"Vinyl", qtyDefault:2, condition:"Mystery", imgFront:"korndog_logo.png", imgBack:"korndog_logo.png" },
  ],
  collectibles: [
    { id:"post_malone", title:"Post Malone", price:15.00, type:"Figure", qtyDefault:1, condition:"New", imgFront:"korndog_logo.png", imgBack:"korndog_logo.png" },
    { id:"eddie_vh", title:"Eddie Van Halen", price:15.00, type:"Figure", qtyDefault:1, condition:"New", imgFront:"korndog_logo.png", imgBack:"korndog_logo.png" },
    { id:"hot_tamales", title:"Hot Tamales", price:10.00, type:"Figure", qtyDefault:1, condition:"New", imgFront:"korndog_logo.png", imgBack:"korndog_logo.png" },
    { id:"jerry_lawler", title:'Jerry "The King" Lawler', price:15.00, type:"Figure", qtyDefault:1, condition:"New", imgFront:"korndog_logo.png", imgBack:"korndog_logo.png" },
    { id:"mystery_funko", title:"Mystery Funko", price:10.00, type:"Figure", qtyDefault:2, condition:"Mystery", imgFront:"ozzy_box.png", imgBack:"ozzy_box.png" },
  ]
};

(async function hydrateFromCloud(){
  try{
    const r = await fetch(CLOUD_CATALOG_URL + "?ts=" + Date.now(), { cache: "no-store" });
    if (r.ok) {
      const json = await r.json();
      if (json.records && json.collectibles) save(DBKEY, {records: json.records, collectibles: json.collectibles});
      if (json.settings) save(SETTINGSKEY, json.settings);
      if (json.images) save(IMGKEY, json.images);
    }
  }catch(e){}
})();

(function bootstrap(){
  if (!localStorage.getItem(DBKEY)) save(DBKEY, {records:seed.records, collectibles:seed.collectibles});
  if (!localStorage.getItem(SETTINGSKEY)) save(SETTINGSKEY, seed.settings);
  if (!localStorage.getItem(IMGKEY)) {
    const imgs = {}; ["korndog_logo.png","kitty_green.png","kitty_purple.png","ozzy_box.png","bob_ross.png"].forEach(n => imgs[n] = {kind:"file", name:n});
    save(IMGKEY, imgs);
  }
})();

function uc(url, transform='-/scale_crop/900x900/center/') {
  return url && url.includes('ucarecdn.com') ? `${url}${transform}` : url;
}
function resolveImg(key){
  if (!key) return 'assets/korndog_logo.png';
  if (/^https?:\/\//.test(key)) return key; // UpCloud public URL
  const lib = load(IMGKEY, {}); const entry = lib[key];
  if (!entry) return 'assets/' + key;
  if (entry.kind === 'data') return entry.data;
  return 'assets/' + entry.name;
}
const blurbs = [
  "Meow! Added to the crate.",
  "Zombie kitty approves this pickup.",
  "Nice snag. Spin it loud!",
  "Cart updated — chaos rising.",
  "Good taste. We salute you.",
  "Collectors gonna collect.",
  "Wax therapy engaged.",
  "Keep digging, friend.",
  "This one slaps. Trust.",
  "Approved by the kitty council."
];
let state = { tab: location.hash.replace('#','') || '/shop', unlocked: false, cart: load('kdr_cart', []) };
window.addEventListener('hashchange', () => { state.tab = location.hash.replace('#','') || '/shop'; render(); });
function setCart(cart){ state.cart = cart; save('kdr_cart', cart); updateCartBadge(); }

function nav(){
  const links = [['Shop','/shop'],['Collectibles','/collectibles'],['Past Drops','/past'],['Cart','/cart'],['About','/about'],['Admin','/admin']];
  return `<header><div class="nav">`+links.map(([t,h])=>`<a href="#${h}" class="${state.tab===h?'active':''}">${t}</a>`).join('')+`</div></header>`;
}
function hero(kind){
  const s = load(SETTINGSKEY, seed.settings);
  const klass = kind==='collect' ? 'hero red' : 'hero';
  const title = kind==='collect' ? 'Collectibles' : 'KornDog Records';
  const imgKey = kind==='collect' ? s.heroes.collect : s.heroes.home;
  const buttons = kind==='collect'
    ? `<div class="cta"><a class="btn" href="#/collectibles">Collectibles</a><a class="btn secondary" href="#/shop">Records</a></div>`
    : `<div class="cta"><a class="btn" href="#/shop">Enter Shop</a><a class="btn secondary" href="#/collectibles">Collectibles</a></div>`;
  return `<div class="${klass}"><img class="icon" src="${resolveImg(imgKey)}" alt="icon"/><h1>${title}</h1>${buttons}</div>`;
}
function productCard(p){
  const qtyId = `qty_${p.id}`;
  const img = resolveImg(p.imgFront || 'korndog_logo.png');
  return `<div class="card">
    <div class="img"><img src="${img}" alt="${p.title}"/></div>
    <div class="body">
      <h3>${p.title}</h3>
      <div class="row"><span class="badge">${p.type}${p.condition?` • ${p.condition}`:''}</span><span class="price">$${p.price.toFixed(2)}</span></div>
      <div class="row" style="margin-top:8px">
        <input id="${qtyId}" class="qty" type="number" min="1" step="1" value="${p.qtyDefault??1}"/>
        <button class="btn" onclick="addToCart('${p.id}','${p.title}',${p.price}, document.getElementById('${qtyId}').value, '${p.type}')">Add to cart</button>
      </div>
    </div>
  </div>`;
}
function shopPage(){
  const db = load(DBKEY, {records:[], collectibles:[]});
  return `<div class="main"> ${hero('home')}
    <div class="section-title">Records</div>
    <div class="grid">${db.records.map(productCard).join('')}</div>
    <div class="footer">© 2025 KornDog Records — Vinyl Therapy on Deck</div>
  </div>`;
}
function collectPage(){
  const db = load(DBKEY, {records:[], collectibles:[]});
  return `<div class="main"> ${hero('collect')}
    <div class="section-title">Collectibles</div>
    <div class="grid">${db.collectibles.map(productCard).join('')}</div>
    <div class="footer">© 2025 KornDog Records — Vinyl Therapy on Deck</div>
  </div>`;
}
function aboutPage(){
  const s = load(SETTINGSKEY, seed.settings);
  const left = resolveImg(s.heroes.aboutLeft || 'kitty_purple.png');
  const right = resolveImg(s.heroes.aboutRight || 'kitty_green.png');
  return `<div class="main">
    <div class="hero"><h1>About</h1></div>
    <div class="about-grid">
      <div class="about-card">
        <div class="img"><img src="${left}" alt="Kitty purple"></div>
        <div class="about-text">${escapeHtml(s.aboutLeft)}</div>
      </div>
      <div class="about-card">
        <div class="img"><img src="${right}" alt="Kitty green"></div>
        <div class="about-text">${escapeHtml(s.aboutRight)}</div>
      </div>
    </div>
    <div class="dot-secret"><a href="#/admin" title="Admin"></a></div>
    <div class="footer">© 2025 KornDog Records — Vinyl Therapy on Deck</div>
  </div>`;
}
function dropsPage(){ return `<div class="main"><h1>Past Drops</h1><p class="badge">Coming soon</p></div>`; }

function discountRate(subtotal){
  if (subtotal >= 200) return 0.15;
  if (subtotal >= 120) return 0.10;
  return 0;
}
function cartPage(){
  const s = load(SETTINGSKEY, seed.settings);
  const items = state.cart;
  const subtotal = items.reduce((a,i)=>a+i.price*i.qty,0);
  const rate = discountRate(subtotal);
  const discount = subtotal * rate;
  const shipping = items.length? (s.shipping||0) : 0;
  const total = Math.max(0, subtotal - discount) + shipping;
  const note = rate ? `${Math.round(rate*100)}% auto-discount applied` : `Auto-discount: 10% @ $120+, 15% @ $200+`;
  return `<div class="main">
    <h1>Your Cart</h1>
    <div class="input-row" style="justify-content:flex-end">
      <button class="btn secondary" onclick="clearCart()">Clear cart</button>
    </div>
    ${items.length? items.map(i=>`
      <div class="admin item" data-cart-item>
        <div class="row">
          <strong>${i.title}</strong>
          <span>$${(i.price*i.qty).toFixed(2)}</span>
        </div>
        <div class="row">
          <input class="qty" type="number" min="1" value="${i.qty}" onchange="updateQty('${i.id}', this.value)"/>
          <button class="btn secondary" onclick="removeItem('${i.id}')">Remove</button>
        </div>
      </div>
    `).join('') : '<p>Your cart is empty.</p>'}
    <div class="admin item">
      <div class="row"><span>Subtotal</span><strong>$${subtotal.toFixed(2)}</strong></div>
      <div class="row"><span>Discount (${note})</span><strong>-$${discount.toFixed(2)}</strong></div>
      <div class="row"><span>Shipping (flat)</span><strong>$${shipping.toFixed(2)}</strong></div>
      <div class="row" style="font-size:20px"><span>Total</span><strong>$${total.toFixed(2)}</strong></div>
      <div style="margin-top:10px">
        <button class="btn" onclick="checkout()">Checkout with PayPal</button>
      </div>
    </div>
    <div class="footer">© 2025 KornDog Records — Vinyl Therapy on Deck</div>
  </div>`;
}
function ensureToastWrap(){ let w=document.querySelector('.toast-wrap'); if(!w){ w=document.createElement('div'); w.className='toast-wrap'; document.body.appendChild(w);} return w; }
function toast(msg, img){ const w=ensureToastWrap(); const t=document.createElement('div'); t.className='toast'; t.innerHTML=`<img src="${img}"/><p>${msg}</p>`; w.appendChild(t); setTimeout(()=>{ t.style.opacity='0'; t.style.transform='translateX(-8px)'; setTimeout(()=>t.remove(), 350); }, 2600); }

function adminPage(){
  const db = load(DBKEY, {records:[], collectibles:[]});
  const s = load(SETTINGSKEY, seed.settings);
  return `<div class="main admin">
    <div class="input-row">
      <input id="pw" type="password" placeholder="Password"/>
      <button class="btn" onclick="unlock()">Unlock</button>
      <span class="badge">${state.unlocked? 'Unlocked.' : 'Locked.'}</span>
    </div>
    <h1>Hero Images</h1>
    <div class="grid">
      ${heroPicker('Home Icon (Korndog teal)','home', s.heroes.home)}
      ${heroPicker('Collectibles Icon (Ozzy)','collect', s.heroes.collect)}
      ${heroPicker('About Left (Kitty purple)','aboutLeft', s.heroes.aboutLeft)}
      ${heroPicker('About Right (Kitty green)','aboutRight', s.heroes.aboutRight)}
    </div>
    <h1>Shop Settings</h1>
    <div class="input-row">
      <label>Flat-rate shipping ($)</label><input id="ship" type="number" step="0.01" value="${s.shipping}"/>
      <span class="badge">Discount locked: 10% @ $120+, 15% @ $200+</span>
      <button class="btn" onclick="saveSettings()">Save Settings</button>
      <button class="btn secondary" onclick="backup()">Backup</button>
      <button class="btn secondary" onclick="restore()">Restore</button>
      <button id="publishBtn" class="btn" onclick="publishLive()">Publish Live</button>
    </div>
    <div class="input-row" style="margin-top:8px">
      <label>About Left text</label><textarea id="aboutL">${escapeAttr(s.aboutLeft)}</textarea>
      <label>About Right text</label><textarea id="aboutR">${escapeAttr(s.aboutRight)}</textarea>
    </div>
    <h1>Records</h1>
    ${db.records.map(editItem).join('')}
    <h1>Collectibles</h1>
    ${db.collectibles.map(editItem).join('')}
    <div class="library">
      <h3>Library</h3>
      <div class="input-row">
        <input id="libfile" type="file" accept="image/*"/>
        <input id="libkey" type="text" placeholder="filename (e.g., bob_ross.png)"/>
        <button class="btn" onclick="addToLibrary()">Add to Library (local)</button>
      </div>
      <div class="badge" id="keys"></div>
    </div>
    <div class="footer">© 2025 KornDog Records — Vinyl Therapy on Deck</div>
  </div>`;
}
function heroPicker(label, key, current){
  const src = resolveImg(current);
  return `<div class="item">
    <div class="small-thumb"><img src="${src}" alt=""></div>
    <label>${label}</label>
    <div class="input-row">
      <input type="file" accept="image/*" onchange="uploadHeroUpCloud(this, '${key}')"/>
      <button class="btn secondary" onclick="chooseFromLibraryHero('${key}')">Choose from library</button>
    </div>
  </div>`;
}
function editItem(p){
  return `<div class="item">
    <h2>${p.title} ($${p.price.toFixed(2)})</h2>
    <div class="grid">
      <div>
        <label>Front</label>
        <div class="small-thumb"><img src="${resolveImg(p.imgFront) || resolveImg('korndog_logo.png')}" alt=""></div>
        <input type="file" accept="image/*" onchange="uploadUpCloud('${p.id}','front',this)"/>
        <button class="btn secondary" onclick="chooseFromLibrary('${p.id}','front')">Choose from library</button>
      </div>
      <div>
        <label>Back / Figure</label>
        <div class="small-thumb"><img src="${resolveImg(p.imgBack) || resolveImg('korndog_logo.png')}" alt=""></div>
        <input type="file" accept="image/*" onchange="uploadUpCloud('${p.id}','back',this)"/>
        <button class="btn secondary" onclick="chooseFromLibrary('${p.id}','back')">Choose from library</button>
      </div>
    </div>
    <div class="input-row" style="margin-top:10px">
      <label>Title</label><input type="text" id="t_${p.id}" value="${escapeAttr(p.title)}"/>
      <label>Price</label><input type="number" id="pr_${p.id}" value="${p.price}" step="0.01"/>
      <label>Condition</label><input type="text" id="c_${p.id}" value="${escapeAttr(p.condition||'')}"/>
      <label>Qty Default</label><input type="number" id="q_${p.id}" value="${p.qtyDefault||1}" step="1"/>
      <button class="btn" onclick="saveItem('${p.id}')">Save Item</button>
    </div>
  </div>`;
}

// ---- UpCloud helpers via Netlify Functions
async function uploadToUpCloud(file){
  if(!file) throw new Error("No file selected");
  const ct = file.type || "application/octet-stream";
  const name = encodeURIComponent(file.name || `file-${Date.now()}`);
  const s = await fetch(`/.netlify/functions/s3-sign?filename=${name}&contentType=${encodeURIComponent(ct)}`).then(r=>r.json());
  const up = await fetch(s.uploadUrl, { method:"PUT", headers:{ "Content-Type": ct }, body: file });
  if (!up.ok) throw new Error("Upload failed");
  return s.fileUrl;
}
async function publishCatalog(catalogObj){
  const res = await fetch(`/.netlify/functions/catalog-publish`, { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(catalogObj) });
  if(!res.ok){ const t=await res.text(); throw new Error("Publish failed: "+t); }
  return res.json();
}

// ---- Admin event handlers
function ensureUnlocked(next){
  if (state.unlocked) return next && next();
  const v = prompt('Enter admin password:');
  if (v === ADMIN_PASSWORD){ state.unlocked = true; alert('Admin unlocked'); render(); next && next(); }
  else alert('Wrong password');
}
async function uploadUpCloud(id, which, input){
  ensureUnlocked(async ()=>{
    const f = input.files?.[0]; if (!f) return;
    const url = await uploadToUpCloud(f);
    assignImgDirect(id, which, url);
  });
}
async function uploadHeroUpCloud(input, which){
  ensureUnlocked(async ()=>{
    const f = input.files?.[0]; if (!f) return;
    const url = await uploadToUpCloud(f);
    saveHero(which, url);
  });
}
function assignImgDirect(id, which, url){
  const db = load(DBKEY, {records:[], collectibles:[]});
  const item = [...db.records, ...db.collectibles].find(x=>x.id===id);
  if (!item) return;
  item[which==='front'?'imgFront':'imgBack'] = url;
  save(DBKEY, db); render();
}
function saveHero(which, value){
  const s = load(SETTINGSKEY, seed.settings);
  s.heroes[which] = value; save(SETTINGSKEY, s); render();
}
function chooseFromLibrary(id, which){
  ensureUnlocked(()=>{
    const keys = Object.keys(load(IMGKEY, {}));
    const pick = prompt("Enter image key from library:\n"+keys.join(", "));
    if (!pick) return;
    assignImgDirect(id, which, pick);
  });
}
function chooseFromLibraryHero(which){
  ensureUnlocked(()=>{
    const keys = Object.keys(load(IMGKEY, {}));
    const pick = prompt("Enter image key from library:\n"+keys.join(", "));
    if (!pick) return;
    saveHero(which, pick);
  });
}

function unlock(){ const v=document.getElementById('pw').value; if (v===ADMIN_PASSWORD){ state.unlocked=true; alert('Admin unlocked'); render(); } else alert('Wrong password'); }
function saveItem(id){
  ensureUnlocked(()=>{
    const db = load(DBKEY, {records:[], collectibles:[]});
    const upd = (list)=>{ const i=list.findIndex(x=>x.id===id); if(i>=0){ list[i].title=document.getElementById('t_'+id).value; list[i].price=parseFloat(document.getElementById('pr_'+id).value||0); list[i].condition=document.getElementById('c_'+id).value; list[i].qtyDefault=parseInt(document.getElementById('q_'+id).value||1); } };
    upd(db.records); upd(db.collectibles); save(DBKEY, db);
    const s = load(SETTINGSKEY, seed.settings); toast('Saved!', resolveImg(s.heroes.aboutRight)); render();
  });
}
function saveSettings(){
  ensureUnlocked(()=>{
    const s = load(SETTINGSKEY, seed.settings);
    s.shipping = parseFloat(document.getElementById('ship').value||0);
    s.aboutLeft = document.getElementById('aboutL').value;
    s.aboutRight = document.getElementById('aboutR').value;
    save(SETTINGSKEY, s); toast('Settings saved.', resolveImg(s.heroes.aboutLeft)); render();
  });
}
async function publishLive(){
  ensureUnlocked(async ()=>{
    const data     = load(DBKEY, {});
    const settings = load(SETTINGSKEY, {});
    const images   = load(IMGKEY, {});
    const catalog  = { ...data, settings, images };
    const out = await publishCatalog(catalog);
    alert("Published to:\n" + out.url);
  });
}
function backup(){
  const blob = new Blob([JSON.stringify({ data: load(DBKEY, {}), settings: load(SETTINGSKEY, {}), images: load(IMGKEY, {}) }, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='kdr_backup_v3_2.json'; a.click(); URL.revokeObjectURL(url);
}
function restore(){
  const input = document.createElement('input'); input.type='file'; input.accept='application/json';
  input.onchange = () => { const f=input.files[0]; if(!f) return; const fr=new FileReader(); fr.onload=()=>{ try{ const j=JSON.parse(fr.result); if(j.data) save(DBKEY,j.data); if(j.settings) save(SETTINGSKEY,j.settings); if(j.images) save(IMGKEY,j.images); alert('Restored.'); render(); }catch(e){ alert('Bad file'); } }; fr.readAsText(f); };
  input.click();
}

// Cart & checkout
function addToCart(id,title,price,qty,type){
  qty = parseInt(qty||1);
  const cart = [...state.cart]; const i=cart.findIndex(x=>x.id===id);
  if (i>=0) cart[i].qty += qty; else cart.push({id,title,price,qty});
  setCart(cart);
  const s = load(SETTINGSKEY, seed.settings);
  const img = (type==='Figure') ? resolveImg(s.heroes.aboutLeft).replace('kitty_purple','kitty_green') : resolveImg(s.heroes.aboutRight).replace('kitty_green','kitty_purple');
  toast(blurbs[Math.floor(Math.random()*blurbs.length)], img);
}
function updateQty(id, v){ const cart=[...state.cart]; const i=cart.findIndex(x=>x.id===id); if(i>=0){ cart[i].qty=parseInt(v||1); setCart(cart); render(); } }
function removeItem(id){ setCart(state.cart.filter(x=>x.id!==id)); render(); }
function clearCart(){ if(!confirm('Clear everything in your cart?')) return; setCart([]); ['kdr_cart','kdr_cart_v2','cart','cartItems'].forEach(k=>localStorage.removeItem(k)); render(); }
function updateCartBadge(){ const badge=document.querySelector('a[href="#/cart"]'); if(!badge) return; const n=state.cart.reduce((a,i)=>a+i.qty,0); badge.textContent='Cart'+(n?` (${n})`:''); }
function checkout(){
  const s = load(SETTINGSKEY, seed.settings);
  const items = state.cart; if (!items.length) return alert('Cart is empty');
  const subtotal = items.reduce((a,i)=>a+i.price*i.qty,0);
  const rate = discountRate(subtotal);
  const discount = subtotal * rate;
  const shipping = items.length? (s.shipping||0) : 0;
  const total = Math.max(0, subtotal - discount) + shipping;

  const q = new URLSearchParams();
  q.set('cmd','_cart'); q.set('upload','1'); q.set('business', PAYPAL_EMAIL);
  q.set('item_name_1','KornDog Records order');
  q.set('amount_1', total.toFixed(2));
  q.set('quantity_1','1');
  const url = 'https://www.paypal.com/cgi-bin/webscr?' + q.toString();
  location.href = url;
}

// Utils & render
function escapeHtml(s){ return (s??'').replace(/[&<>]/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]));}
function escapeAttr(s){ return (s??'').replace(/"/g,'&quot;'); }

function render(){
  let content='';
  switch(state.tab){
    case '/shop': content=shopPage(); break;
    case '/collectibles': content=collectPage(); break;
    case '/about': content=aboutPage(); break;
    case '/cart': content=cartPage(); break;
    case '/admin': content=adminPage(); break;
    case '/past': content=dropsPage(); break;
    default: content=shopPage(); break;
  }
  document.getElementById('app').innerHTML = nav() + content;
  updateCartBadge();
  const keysEl=document.getElementById('keys'); if(keysEl){ keysEl.textContent = Object.keys(load(IMGKEY, {})).join(', ') || '(empty)'; }
}
render();
