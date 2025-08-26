async function loadJSON(path){
  const res = await fetch(path, {cache:'no-store'});
  if(!res.ok) throw new Error('Failed to load '+path);
  return res.json();
}

async function init(){
  // HERO
  const hero = await loadJSON('/content/hero.json');
  const heroEl = document.getElementById('hero');
  const titleEl = document.getElementById('hero-title');
  const subEl = document.getElementById('hero-subtitle');
  if(hero.image) heroEl.style.backgroundImage = `url(${hero.image})`;
  titleEl.textContent = hero.title || 'Korndog Records';
  subEl.textContent = hero.subtitle || '';

  // RECORDS
  const data = await loadJSON('/content/records.json');
  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  for(const item of (data.items || [])){
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <img src="${item.image || ''}" alt="${item.name || ''}">
      <div class="info">
        <div class="name">${item.name || ''}</div>
        <div class="meta">${item.category || ''} · $${(item.price ?? 0).toFixed(2)}</div>
        ${item.description ? `<p>${item.description}</p>` : ''}
      </div>
    `;
    grid.appendChild(div);
  }
}

init().catch(err=>{
  console.error(err);
  document.getElementById('grid').textContent = 'Failed to load content.';
});
