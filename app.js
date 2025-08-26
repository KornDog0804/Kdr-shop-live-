async function load() {
  const root = document.getElementById("inventory");
  try {
    const res = await fetch("/content/live.json?bust=" + Date.now());
    if (!res.ok) throw new Error("live.json not found. Use Admin to save once.");
    const data = await res.json();

    const frag = document.createDocumentFragment();

    if (data.hero) {
      const h = document.createElement("section");
      h.className = "hero";
      h.innerHTML = `
        <img src="${data.hero.image || ""}" alt="">
        <div>
          <h2>${data.hero.headline || ""}</h2>
          <p class="muted">${data.hero.subhead || ""}</p>
          ${data.hero.ctaLink ? `<a class="btn" href="${data.hero.ctaLink}">${data.hero.ctaText||"Open Admin"}</a>` : ""}
        </div>`;
      frag.appendChild(h);
    }

    (data.sections || []).forEach(sec => {
      const s = document.createElement("section");
      s.innerHTML = `<h3>${sec.title || ""}</h3>`;
      const grid = document.createElement("div");
      grid.className = "grid";
      (sec.items || []).forEach(it => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
          <img src="${it.image || ""}" alt="">
          <div class="pad">
            <div style="font-weight:600">${it.title || ""}</div>
            <div class="muted">${(it.price!=null)?("$"+it.price):""}</div>
          </div>`;
        grid.appendChild(card);
      });
      s.appendChild(grid);
      frag.appendChild(s);
    });

    root.innerHTML = "";
    root.appendChild(frag);
  } catch (e) {
    root.innerHTML = `<p class="muted">Failed to load content: ${e.message}</p>`;
  }
}
load();
