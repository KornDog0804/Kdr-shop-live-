
const API_BASE = '/.netlify/functions';
const DEFAULT_KEY = 'content/live.json';

const state = { content: null };

async function fetchJSON() {
  try {
    const res = await fetch(`${API_BASE}/get-content?key=${encodeURIComponent(DEFAULT_KEY)}`, {cache:'no-store'});
    if(!res.ok) throw new Error('Failed to fetch content JSON');
    return await res.json();
  } catch (e) {
    console.warn('Content load failed, using fallback:', e);
    return {
      hero: {
        headline: "Fresh arrivals in the shop",
        subhead: "Kitties, records & Funkos",
        image: "https://jii3i.upcloudobjects.com/korndog-media/kitty_green.png",
        ctaText: "Open Admin",
        ctaLink: "/admin/"
      },
      sections: [
        {
          title: "Kitties",
          items: [
            { title:"Kitty Green", price: 12, image: "https://jii3i.upcloudobjects.com/korndog-media/kitty_green.png" },
            { title:"Kitty Purple", price: 12, image: "https://jii3i.upcloudobjects.com/korndog-media/kitty_purple.png" },
            { title:"Bob Ross", price: 12, image: "https://jii3i.upcloudobjects.com/korndog-media/bob_ross.png" },
            { title:"KDR Logo", price: 0, image: "https://jii3i.upcloudobjects.com/korndog-media/korndog_logo.png" },
          ]
        },
        {
          title: "Funkos",
          items: [
            { title:"OZZY", price: 18, image: "https://jii3i.upcloudobjects.com/korndog-media/ozzy_box.png" },
            { title:"Green Kitty (alt)", price: 12, image: "https://jii3i.upcloudobjects.com/korndog-media/kitty_green.png" },
            { title:"Purple Kitty (alt)", price: 12, image: "https://jii3i.upcloudobjects.com/korndog-media/kitty_purple.png" },
            { title:"Record", price: 25, image: "https://jii3i.upcloudobjects.com/korndog-media/PXL_20250821_001651326.jpg" }
          ]
        }
      ]
    };
  }
}

function el(tag, attrs={}, ...children){
  const n = document.createElement(tag);
  for(const [k,v] of Object.entries(attrs)) {
    if(k==='class') n.className = v;
    else if(k.startsWith('on') && typeof v==='function') n.addEventListener(k.substring(2), v);
    else if(v!=null) n.setAttribute(k,v);
  }
  for(const c of children){
    if(c==null) continue;
    n.appendChild(typeof c==='string' ? document.createTextNode(c) : c);
  }
  return n;
}

function openModal(src){
  const m = document.getElementById('modal');
  document.getElementById('modalImg').src = src;
  m.classList.add('open'); m.setAttribute('aria-hidden','false');
}
window.closeModal = function(){
  const m = document.getElementById('modal');
  m.classList.remove('open'); m.setAttribute('aria-hidden','true');
  document.getElementById('modalImg').src='';
}

function render(content){
  // Hero
  document.getElementById('headline').textContent = content.hero.headline;
  document.getElementById('subhead').textContent = content.hero.subhead;
  document.getElementById('heroImg').src = content.hero.image;
  const cta = document.getElementById('ctaLink');
  cta.textContent = content.hero.ctaText || 'Open Admin';
  cta.href = content.hero.ctaLink || '/admin/';

  const sectionsRoot = document.getElementById('sections');
  sectionsRoot.innerHTML = '';
  for(const section of content.sections){
    const sec = el('section', {class:'section'});
    sec.append(
      el('h2', {}, el('span', {class:'dot'}), ' ', section.title)
    );
    const grid = el('div', {class:'grid'});
    for(const item of section.items){
      const card = el('div', {class:'card', tabindex:'0'});
      const inner = el('div', {class:'inner'});
      const front = el('div', {class:'face front'});
      const img = el('img', {src:item.image, alt:item.title, loading:'lazy'});
      img.addEventListener('click', ()=>openModal(item.image));
      front.append(img);

      const back = el('div', {class:'face back'});
      back.append(
        el('div', {class:'title'}, item.title),
        el('div', {class:'price'}, `$${item.price}`),
        el('button', {class:'btn', onclick:()=>openModal(item.image)}, 'Quick view')
      );
      inner.append(front, back);
      card.append(inner);
      grid.append(card);
    }
    sec.append(grid);
    sectionsRoot.append(sec);
  }
}

(async () => {
  const data = await fetchJSON();
  state.content = data;
  render(data);
})();
