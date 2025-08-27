
import { Cart } from "./cart.js";

const API = '/.netlify/functions';
const KEY = 'content/live.json';

const CHIBI = "https://jii3i.upcloudobjects.com/korndog-media/chibi_kitty.png";
const ZOMBIE = "https://jii3i.upcloudobjects.com/korndog-media/zombie_kitty.png";
const BLURBS_FUNKO = [
  "Fresh vinyl-friend added 🧸",
  "Funko fate smiles on you.",
  "Pop! goes the dopamine.",
  "Cart leveled up. Again.",
  "Addicted? Nah—curated.",
  "Another box, another grin.",
  "Shelf space is a myth.",
  "Collect 'em? You bet.",
  "Heat check: 🔥 pulled.",
  "Approved by Chibi Kitty."
];
const BLURBS_RECORD = [
  "A-side energy, B-side soul.",
  "Needle drops, serotonin pops.",
  "Wax therapy acquired.",
  "Pressing matters handled.",
  "Spin to win, friend.",
  "Static? Only on the record.",
  "Limited groove unlocked.",
  "Audiophile handshake 🤝",
  "Mastered for your mood.",
  "Zombie Kitty approves."
];

const el = (sel)=>document.querySelector(sel);
const page = window.KDR_PAGE || "home";

function showModal(src){ el('#modalImg')?.setAttribute('src',src); el('#imgModal')?.classList.add('open'); }
document.getElementById('imgModal')?.addEventListener('click', ()=> el('#imgModal').classList.remove('open'));

function kittyToast(kind){
  const box = el('#kittyToast'); if(!box) return;
  const pic = el('#kittyPic'); const bl = el('#kittyBlurb');
  const arr = (kind==='funko') ? BLURBS_FUNKO : BLURBS_RECORD;
  pic.src = kind==='funko' ? CHIBI : ZOMBIE;
  bl.textContent = arr[Math.floor(Math.random()*arr.length)];
  box.style.display = 'flex';
  clearTimeout(box._t);
  box._t = setTimeout(()=> box.style.display = 'none', 2600);
}

function cardTemplate(item, category){
  const id = (item.id || item.title).replace(/\s+/g,'-').toLowerCase();
  const price = Number(item.price||0);
  const soldOut = item.trackInventory && (+item.stock <= 0);
  const isOzzy = /ozzy/i.test(item.title || '');
  const frontImg = `<img src="${item.image}" alt="${item.title}" />`;
  const frontLink = isOzzy ? `<a href="/collectables/">${frontImg}</a>` : frontImg;
  return `
  <div class="card" ${soldOut?'aria-disabled="true"':''}>
    <div class="card-inner">
      <div class="face">
        ${frontLink}
        ${soldOut?'<div class="sold">SOLD OUT</div>':''}
      </div>
      <div class="face back">
        <div class="pad">
          <div style="font-weight:800">${item.title||'Untitled'}</div>
          <div class="muted" style="margin:6px 0">$${price.toFixed(2)}</div>
          <div style="display:flex;gap:8px;justify-content:center">
            <button class="btn" onclick="document.getElementById('imgModal').classList.add('open');document.getElementById('modalImg').src='${item.image}'">View</button>
            ${soldOut ? '<button class="btn" disabled>Sold</button>' :
              `<button class="btn primary" onclick="window.__addToCart('${id}', '${(item.title||'').replace(/'/g,&quot;\\'&quot;)}', ${price}, '${item.image}', '${category}')">Add</button>`}
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

// Global add function so inline onclick can call it
window.__addToCart = (id, title, price, image, category) => {
  Cart.add({ id, title, price: Number(price), image, category });
  kittyToast(category === 'funko' ? 'funko' : 'record');
  el('#openCart')?.click();
};

async function getContent(){
  const r = await fetch(`${API}/get-content?key=${encodeURIComponent(KEY)}`, { cache:'no-store' });
  if(!r.ok) throw new Error('Content load failed');
  return r.json();
}

function renderHome(data){
  // Hero
  el('#hero').innerHTML = `
    <div>
      <h2 style="margin:0 0 6px">${data.hero?.headline||'Welcome'}</h2>
      <div class="muted" style="margin-bottom:10px">${data.hero?.subhead||''}</div>
      <a class="btn" href="${data.hero?.ctaLink||'/admin/'}">${data.hero?.ctaText||'Open Admin'}</a>
    </div>
    <div>${data.hero?.image ? `<img src="${data.hero.image}" alt="hero"/>` : ''}</div>
  `;

  // Sections
  const k = data.sections?.find(s=>/kitt/i.test(s.title))?.items || [];
  const f = data.sections?.find(s=>/funko/i.test(s.title))?.items || [];
  el('#grid-kitties').innerHTML = k.map(it=>cardTemplate(it,'record')).join('');
  el('#grid-funkos').innerHTML = f.map(it=>cardTemplate(it,'funko')).join('');
}

function renderCollectables(data){
  el('#hero').innerHTML = `
    <div>
      <h2 style="margin:0 0 6px">Funkos & Collectables</h2>
      <div class="muted" style="margin-bottom:10px">Click a box to flip; Add when ready.</div>
      <a class="btn" href="/">Back to home</a>
    </div>
    <div>${data.hero?.image ? `<img src="${data.hero.image}" alt="hero"/>` : ''}</div>
  `;
  const f = data.sections?.find(s=>/funko/i.test(s.title))?.items || [];
  el('#grid-funkos').innerHTML = f.map(it=>cardTemplate(it,'funko')).join('');
}

(async () => {
  try {
    const data = await getContent();
    if(page === 'collectables') renderCollectables(data);
    else renderHome(data);
  } catch (e) {
    el('.container').insertAdjacentHTML('beforeend', `<div class="muted">Failed to load content.</div>`);
  }
})();
