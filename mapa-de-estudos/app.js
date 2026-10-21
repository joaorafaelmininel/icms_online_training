/* Mapa de Estudos — offline mind maps for study, with shareable map packages. */
(() => {
"use strict";
const $ = s => document.querySelector(s);
const rid = () => Math.random().toString(36).slice(2, 10);
const NCOL = 8;
const REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;
const COARSE = matchMedia("(pointer: coarse)").matches;
const ST = {
  review:   { label: "A revisar", key: "1" },
  learning: { label: "Estudando", key: "2" },
  done:     { label: "Dominado",  key: "3" }
};
const KINDS = {
  concept: "Conceito", def: "Definição", example: "Exemplo",
  formula: "Fórmula", question: "Pergunta", key: "Importante"
};
const PALETTES = {
  joias: { name: "Joias", colors: [
    ["#6382ff", "#3d55d6", "#5b78f5", "#ffffff"], ["#34d1a0", "#0f9b72", "#1fb487", "#ffffff"],
    ["#c77dff", "#8b3fd0", "#a95ef0", "#ffffff"], ["#ff9a6b", "#e0573a", "#f27a50", "#ffffff"],
    ["#ff6fa5", "#cf3a76", "#ec5590", "#ffffff"], ["#3cc8e0", "#1290b0", "#22abc9", "#ffffff"],
    ["#f7cb5a", "#d99a1c", "#dfa632", "#2a1d00"], ["#9ed46f", "#5a982a", "#7bb846", "#ffffff"] ] },
  aquarela: { name: "Aquarela", colors: [
    ["#d8e0ff", "#b3c3ff", "#7f93f0", "#1d2350"], ["#cff5e6", "#9de6c9", "#3fb98c", "#0f3a2b"],
    ["#efdeff", "#d9b8ff", "#a77ce6", "#321850"], ["#ffe1d2", "#ffc1a5", "#ec8a60", "#4a2010"],
    ["#ffdbe8", "#ffb5d0", "#e0689a", "#4a1028"], ["#d2f2f8", "#a3e2ef", "#38adc7", "#0c3a45"],
    ["#fff2c8", "#ffe08e", "#d4a423", "#3d2c00"], ["#e6f7d4", "#c9ecaa", "#78b843", "#22380e"] ] },
  grafite: { name: "Grafite", colors: Array.from({ length: NCOL }, () => ["var(--mono-a)", "var(--mono-b)", "var(--mono-line)", "var(--mono-ink)"]) }
};
const ICON = {
  review: '<svg class="mk review" width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="8" cy="8" r="6.3"/><path d="M8 4.6v3.8M8 11.2v.1"/></svg>',
  learning: '<svg class="mk learning" width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="8" cy="8" r="6.3"/><path d="M8 1.7a6.3 6.3 0 0 1 0 12.6Z" fill="currentColor" stroke="none"/></svg>',
  done: '<svg class="mk done" width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="6.3"/><path d="m5.2 8.2 2 2 3.6-4"/></svg>'
};
const NOTE_ICON = '<svg class="nt" width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M3 2.5h7l3 3v8H3z"/><path d="M5.5 7.5h5M5.5 10.5h3.5"/></svg>';
const CHEVRON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>';
const SHARE_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11M7.5 8.5 12 4l4.5 4.5"/><path d="M5 14v4.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V14"/></svg>';
const MORE_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="5.5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="18.5" cy="12" r="1.6"/></svg>';

function ring(pct, size = 34, sw = 3.5) {
  const r = (size - sw) / 2, c = 2 * Math.PI * r, off = c * (1 - Math.max(0, Math.min(1, pct)));
  return `<svg class="ring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--hair-strong)" stroke-width="${sw}"/><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--done)" stroke-width="${sw}" stroke-linecap="round" stroke-dasharray="${c.toFixed(2)}" stroke-dashoffset="${off.toFixed(2)}" transform="rotate(-90 ${size / 2} ${size / 2})"/></svg>`;
}
function ago(t) {
  if (!t) return "";
  const s = (Date.now() - t) / 1000;
  if (s < 60) return "agora";
  if (s < 3600) return `há ${Math.floor(s / 60)} min`;
  if (s < 86400) return `há ${Math.floor(s / 3600)} h`;
  const d = Math.floor(s / 86400);
  if (d < 30) return d === 1 ? "ontem" : `há ${d} dias`;
  return new Date(t).toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
}
function h(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

/* ---------- Example map (shown until the library has maps of its own) ---------- */
function N(text, kids = [], extra = {}) { return { id: rid(), text, children: kids, ...extra }; }
function exampleMap() {
  return {
    id: null, example: true, updatedAt: 0, palette: "joias", folder: null,
    root: N("Biologia Celular", [
      N("Membrana plasmática", [
        N("Modelo do mosaico fluido", [], { kind: "concept", status: "done", note: "Singer e Nicolson, 1972.\nBicamada de fosfolipídios com proteínas que se deslocam lateralmente, como peças de um mosaico em movimento." }),
        N("Transporte passivo", [
          N("Difusão simples", [], { status: "done", note: "Soluto passa direto pela bicamada, a favor do gradiente. Ex.: O₂ e CO₂." }),
          N("Difusão facilitada", [], { status: "learning", note: "A favor do gradiente, com proteínas carreadoras ou canais. Sem gasto de energia. Ex.: glicose." }),
          N("Osmose", [], { kind: "def", status: "review", note: "Passagem de água pela membrana semipermeável, do meio hipotônico (menos concentrado) para o hipertônico." })
        ], { note: "Sempre a favor do gradiente de concentração e sem gasto de ATP." }),
        N("Transporte ativo", [
          N("Bomba de Na⁺/K⁺", [], { kind: "key", status: "review", note: "Expulsa 3 Na⁺ e coloca 2 K⁺ para dentro, gastando 1 ATP. Mantém o potencial de membrana." }),
          N("Endocitose e exocitose", [], { note: "Transporte em massa por vesículas. Fagocitose e pinocitose são tipos de endocitose." })
        ], { note: "Contra o gradiente, com gasto de energia (ATP)." })
      ], { side: "R", c: 0 }),
      N("Citoplasma e organelas", [
        N("Mitocôndria", [
          N("Respiração celular", [], { kind: "formula", status: "learning", note: "C₆H₁₂O₆ + 6 O₂ → 6 CO₂ + 6 H₂O + energia (ATP)" }),
          N("DNA próprio", [], { status: "done", note: "Herança materna. Base da teoria endossimbiótica." })
        ], { note: "Organela de dupla membrana responsável pela respiração celular aeróbica." }),
        N("Retículo endoplasmático", [N("Rugoso: síntese de proteínas"), N("Liso: síntese de lipídios")]),
        N("Complexo de Golgi", [], { status: "review", note: "Modifica, empacota e endereça proteínas. Forma o acrossomo e os lisossomos." }),
        N("Lisossomos", [], { note: "Vesículas com enzimas hidrolíticas para digestão intracelular." })
      ], { side: "R", c: 1 }),
      N("Núcleo", [
        N("Carioteca", [], { status: "done", note: "Envoltório nuclear de dupla membrana, com poros." }),
        N("Cromatina", [N("Eucromatina", [], { note: "Menos condensada, geneticamente ativa." }), N("Heterocromatina", [], { note: "Mais condensada, pouco ativa." })]),
        N("Nucléolo", [], { note: "Região onde se produz o RNA ribossômico." })
      ], { side: "L", c: 2 }),
      N("Divisão celular", [
        N("Mitose", [N("Prófase"), N("Metáfase"), N("Anáfase"), N("Telófase")], { status: "learning", note: "Gera 2 células-filhas idênticas à mãe (2n → 2n). Crescimento e regeneração." }),
        N("Meiose", [
          N("Crossing-over", [], { kind: "concept", status: "review", note: "Troca de segmentos entre cromossomos homólogos na prófase I. Aumenta a variabilidade genética." }),
          N("Por que o número de cromossomos cai pela metade?", [], { kind: "question", note: "Porque na meiose I os cromossomos homólogos se separam: cada célula recebe só um de cada par (2n → n)." })
        ], { note: "Gera 4 células haploides (2n → n). Formação de gametas." })
      ], { side: "L", c: 3 })
    ])
  };
}

/* ---------- State ---------- */
let maps = new Map();          // id -> stored record {id, title, root, updatedAt, palette, folder, stats}
let cur = exampleMap();
let sel = cur.root.id;
let undoStack = [], redoStack = [];
let view = { x: 0, y: 0, s: 1 };
let mode = "map";              // "map" or "list"
let editing = null;            // {id, before, fresh, undoTree}
let query = "";
let hitIdx = -1;
let saveTimer = null, saving = null, dirty = false;
const pending = new Map();     // id -> record waiting to be written, one write at a time
let idx = { byId: new Map(), parent: new Map(), depth: new Map(), color: new Map(), side: new Map() };
const els = new Map();
let disp = new Map();          // id -> {x, y, a} as currently drawn
let animId = 0;

const app = $("#app"), stage = $("#stage"), world = $("#world"), nodesEl = $("#nodes"), edgesEl = $("#edges"), outline = $("#outline");
const isPhone = () => innerWidth <= 640;
const isDocked = () => innerWidth > 1100;

/* ---------- Device storage (IndexedDB, with a localStorage fallback) ---------- */
const Store = {
  db: null, fallback: false, LS: "mapa-estudos:maps",
  async open() {
    try {
      this.db = await new Promise((res, rej) => {
        const r = indexedDB.open("mapa-de-estudos", 1);
        r.onupgradeneeded = () => { if (!r.result.objectStoreNames.contains("maps")) r.result.createObjectStore("maps", { keyPath: "id" }); };
        r.onsuccess = () => res(r.result);
        r.onerror = () => rej(r.error);
        r.onblocked = () => rej(new Error("blocked"));
      });
    } catch (e) { this.fallback = true; }
  },
  req(mode, fn) {
    return new Promise((res, rej) => {
      const t = this.db.transaction("maps", mode);
      const q = fn(t.objectStore("maps"));
      t.oncomplete = () => res(q && q.result);
      t.onerror = () => rej(t.error);
      t.onabort = () => rej(t.error);
    });
  },
  lsAll() { try { return JSON.parse(localStorage.getItem(this.LS) || "{}") || {}; } catch (e) { return {}; } },
  async all() { return this.fallback ? Object.values(this.lsAll()) : this.req("readonly", s => s.getAll()); },
  async get(id) { return this.fallback ? this.lsAll()[id] : this.req("readonly", s => s.get(id)); },
  async put(rec) {
    if (!this.fallback) return this.req("readwrite", s => s.put(rec));
    const all = this.lsAll(); all[rec.id] = rec;
    try { localStorage.setItem(this.LS, JSON.stringify(all)); } catch (e) { throw { code: "quota" }; }
  },
  async del(id) {
    if (!this.fallback) return this.req("readwrite", s => s.delete(id));
    const all = this.lsAll(); delete all[id]; try { localStorage.setItem(this.LS, JSON.stringify(all)); } catch (e) {}
  }
};
const channel = "BroadcastChannel" in window ? new BroadcastChannel("mapa-de-estudos") : null;
let persistAsked = false;

/* ---------- Tree helpers ---------- */
function reindex() {
  const i = { byId: new Map(), parent: new Map(), depth: new Map(), color: new Map(), side: new Map() };
  const walk = (n, p, d, c, s) => {
    i.byId.set(n.id, n); i.parent.set(n.id, p); i.depth.set(n.id, d);
    i.color.set(n.id, c); i.side.set(n.id, s);
    n.children.forEach((k, j) => {
      let kc = c, ks = s;
      if (d === 0) { if (k.c == null) k.c = j % NCOL; kc = k.c; if (!k.side) k.side = "R"; ks = k.side; }
      walk(k, n, d + 1, kc, ks);
    });
  };
  walk(cur.root, null, 0, 0, "R");
  idx = i;
}
const node = id => idx.byId.get(id);
const parentOf = n => idx.parent.get(n.id);
const isAncestor = (a, b) => { for (let p = b; p; p = idx.parent.get(p.id)) if (p === a) return true; return false; };
const visibleKids = n => n.collapsed ? [] : n.children;
const pal = () => PALETTES[cur.palette] || PALETTES.joias;
const colorOf = id => pal().colors[(idx.color.get(id) || 0) % NCOL];
const firstLine = t => (t || "").split("\n")[0];
function countAll(n) { let c = 0; const w = x => x.children.forEach(k => { c++; w(k); }); w(n); return c; }
function statsOf(root) {
  const s = { total: 0, review: 0, learning: 0, done: 0 };
  const w = n => n.children.forEach(k => { s.total++; if (k.status) s[k.status]++; w(k); });
  w(root); return s;
}
function pathOf(n) { const p = []; for (let a = idx.parent.get(n.id); a; a = idx.parent.get(a.id)) p.unshift(firstLine(a.text)); return p; }
function clone(o) { return JSON.parse(JSON.stringify(o)); }
function norm(s) { return (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); }
function freshIds(n) { n.id = rid(); n.children.forEach(freshIds); return n; }
function cleanTree(n) {
  if (!n || typeof n !== "object") return { id: rid(), text: "Tópico", children: [] };
  return { id: typeof n.id === "string" && n.id ? n.id.slice(0, 40) : rid(), text: String(n.text ?? n.title ?? "").slice(0, 4000) || "Tópico",
    children: (Array.isArray(n.children) ? n.children : []).map(cleanTree),
    ...(n.collapsed ? { collapsed: true } : {}), ...(ST[n.status] ? { status: n.status } : {}),
    ...(KINDS[n.kind] ? { kind: n.kind } : {}),
    ...(n.note ? { note: String(n.note).slice(0, 20000) } : {}), ...(n.side === "L" || n.side === "R" ? { side: n.side } : {}), ...(Number.isInteger(n.c) ? { c: n.c % NCOL } : {}) };
}
function stripTop(n) { delete n.side; delete n.c; }
function uniqueIds(root) { const seen = new Set(); const w = n => { if (seen.has(n.id)) n.id = rid(); seen.add(n.id); n.children.forEach(w); }; w(root); return root; }

/* ---------- Map rendering ---------- */
function nodeClass(n) {
  const d = idx.depth.get(n.id);
  let c = "node " + (d === 0 ? "d0" : d === 1 ? "d1" : d === 2 ? "d2" : "dn");
  c += idx.side.get(n.id) === "L" ? " sl" : " sr";
  if (n.children.length) c += " has-kids";
  if (n.collapsed && n.children.length) c += " collapsed";
  if (n.status) c += " st-" + n.status;
  if (n.id === sel) c += " sel";
  if (editing && editing.id === n.id) c += " editing";
  if (query) c += matches(n) ? " hit" : " dim";
  return c;
}
function matches(n) { const q = norm(query); return norm(n.text).includes(q) || norm(n.note).includes(q); }

function render(opts = {}) {
  reindex();
  if (mode === "list") renderOutline(); else renderMap(opts);
  updateChrome();
}
function renderMap(opts) {
  const seen = new Set();
  const visit = n => {
    seen.add(n.id);
    let el = els.get(n.id);
    if (!el) {
      el = document.createElement("div");
      el.dataset.id = n.id;
      el.innerHTML = '<span class="pre"></span><span class="body"><span class="eb"></span><span class="tx"></span></span><span class="post"></span><button class="tog" tabindex="-1"></button>';
      el._pre = el.children[0]; el._eb = el.querySelector(".eb"); el._tx = el.querySelector(".tx"); el._post = el.children[2]; el._tog = el.children[3];
      nodesEl.appendChild(el);
      els.set(n.id, el);
    }
    el.className = nodeClass(n);
    const d = idx.depth.get(n.id);
    const col = colorOf(n.id), ck = col.join();
    if (d > 0 && el._ck !== ck) {
      el.style.setProperty("--ca", col[0]); el.style.setProperty("--cb", col[1]);
      el.style.setProperty("--line", col[2]); el.style.setProperty("--ink", col[3]);
      el._ck = ck;
    }
    const pre = n.status ? ICON[n.status] : "";
    if (el._preS !== pre) { el._pre.innerHTML = pre; el._pre.hidden = !pre; el._preS = pre; }
    const post = n.note ? NOTE_ICON : "";
    if (el._postS !== post) { el._post.innerHTML = post; el._post.hidden = !post; el._postS = post; }
    const eb = d === 0 ? (cur.folder || "Mapa de estudo") : (n.kind && KINDS[n.kind]) || "";
    if (el._eb.textContent !== eb) el._eb.textContent = eb;
    el._eb.hidden = !eb;
    if (!(editing && editing.id === n.id) && el._tx.textContent !== n.text) el._tx.textContent = n.text;
    const t = n.collapsed ? String(countAll(n)) : "−";
    if (el._tog.textContent !== t) el._tog.textContent = t;
    el._tog.title = n.collapsed ? "Expandir" : "Recolher";
    visibleKids(n).forEach(visit);
  };
  visit(cur.root);
  for (const [id, el] of els) if (!seen.has(id)) { el.remove(); els.delete(id); disp.delete(id); }
  layout(opts.instant);
}

const GAPY = d => d === 1 ? 26 : d === 2 ? 12 : 7;
const GAPX = d => d === 1 ? 74 : d === 2 ? 44 : 30;
function layout(instant) {
  if (mode !== "map") return;
  const root = cur.root;
  const measure = n => { const el = els.get(n.id); n._w = el.offsetWidth; n._h = el.offsetHeight; visibleKids(n).forEach(measure); };
  measure(root);
  const subH = (n, d) => {
    let sum = 0;
    visibleKids(n).forEach((k, i) => { sum += subH(k, d + 1) + (i ? GAPY(d + 1) : 0); });
    n._sh = Math.max(n._h, sum); return n._sh;
  };
  const stack = (kids, px, pw, cy, dir, d) => {
    const total = kids.reduce((a, k, i) => a + k._sh + (i ? GAPY(d) : 0), 0);
    let y = cy - total / 2;
    kids.forEach(k => { place(k, px + dir * (pw / 2 + GAPX(d)), y + k._sh / 2, dir, d); y += k._sh + GAPY(d); });
  };
  const place = (n, nearX, cy, dir, d) => {
    n._x = nearX + dir * n._w / 2; n._y = cy;
    stack(visibleKids(n), n._x, n._w, cy, dir, d + 1);
  };
  root._x = 0; root._y = 0;
  const kids = visibleKids(root);
  kids.forEach(k => subH(k, 1));
  stack(kids.filter(k => k.side !== "L"), 0, root._w, 0, 1, 1);
  stack(kids.filter(k => k.side === "L"), 0, root._w, 0, -1, 1);

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const targets = new Map();
  const walk = n => {
    targets.set(n.id, { x: n._x, y: n._y });
    minX = Math.min(minX, n._x - n._w / 2); maxX = Math.max(maxX, n._x + n._w / 2);
    minY = Math.min(minY, n._y - n._h / 2); maxY = Math.max(maxY, n._y + n._h / 2);
    visibleKids(n).forEach(walk);
  };
  walk(root);
  cur._bbox = { minX, minY, maxX, maxY };
  animateTo(targets, instant || REDUCE);
}

/* Moves every node from where it is drawn to its new place; new nodes grow out of their parent. */
function animateTo(targets, instant) {
  const from = new Map();
  for (const [id, t] of targets) {
    let f = disp.get(id);
    if (!f) {
      const p = idx.parent.get(id);
      const pf = p && (disp.get(p.id) || targets.get(p.id));
      f = pf && !instant ? { x: pf.x, y: pf.y, a: 0 } : { x: t.x, y: t.y, a: 1 };
    }
    from.set(id, f);
  }
  const my = ++animId;
  if (instant) { disp = new Map([...targets].map(([id, t]) => [id, { x: t.x, y: t.y, a: 1 }])); draw(disp); return; }
  const t0 = performance.now(), D = 340;
  const step = now => {
    if (my !== animId) return;
    const k = Math.min(1, (now - t0) / D), e = 1 - Math.pow(1 - k, 3);
    const m = new Map();
    for (const [id, t] of targets) {
      const f = from.get(id);
      m.set(id, { x: f.x + (t.x - f.x) * e, y: f.y + (t.y - f.y) * e, a: f.a + (1 - f.a) * e });
    }
    disp = m; draw(m);
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function taper(ax, ay, bx, by, dir, w0, w1) {
  const dx = Math.abs(bx - ax), c1 = ax + dir * dx * .52, c2 = bx - dir * dx * .52, h0 = w0 / 2, h1 = w1 / 2;
  const f = v => v.toFixed(1);
  return `M${f(ax)} ${f(ay - h0)}C${f(c1)} ${f(ay - h0)} ${f(c2)} ${f(by - h1)} ${f(bx)} ${f(by - h1)}L${f(bx)} ${f(by + h1)}C${f(c2)} ${f(by + h1)} ${f(c1)} ${f(ay + h0)} ${f(ax)} ${f(ay + h0)}Z`;
}
function draw(pos) {
  const paths = [];
  const walk = (n, d) => {
    const p = pos.get(n.id); const el = els.get(n.id);
    if (!p || !el) return;
    el.style.transform = `translate(${(p.x - n._w / 2).toFixed(1)}px,${(p.y - n._h / 2).toFixed(1)}px)`;
    el.style.opacity = p.a < 1 ? p.a.toFixed(3) : "";
    visibleKids(n).forEach(k => {
      const q = pos.get(k.id); if (!q) return;
      const dir = idx.side.get(k.id) === "L" ? -1 : 1;
      let ax, ay, w0, bx, by, w1;
      if (d === 0) { ax = p.x + dir * (n._w / 2 - 26); ay = p.y; w0 = 11; }
      else if (d === 1) { ax = p.x + dir * n._w / 2; ay = p.y; w0 = 4.2; }
      else { ax = p.x + dir * n._w / 2; ay = p.y + n._h / 2 - (d === 2 ? 1 : .75); w0 = d === 2 ? 2 : 1.5; }
      if (d === 0) { bx = q.x - dir * k._w / 2 + dir * 2; by = q.y; w1 = 3.6; }
      else { bx = q.x - dir * k._w / 2; by = q.y + k._h / 2 - (d + 1 === 2 ? 1 : .75); w1 = d + 1 === 2 ? 2 : 1.5; }
      const op = q.a < 1 ? ` opacity="${q.a.toFixed(3)}"` : "";
      paths.push(`<path style="fill:${colorOf(k.id)[2]}"${op} d="${taper(ax, ay, bx, by, dir, w0, w1)}"/>`);
      walk(k, d + 1);
    });
  };
  walk(cur.root, 0);
  edgesEl.innerHTML = paths.join("");
}

function applyView(anim) {
  world.classList.toggle("anim", !!anim);
  world.style.transform = `translate(${view.x}px,${view.y}px) scale(${view.s})`;
  $("#z-pct").textContent = Math.round(view.s * 100) + "%";
  hideNote();
}
function freeRect() {
  const r = stage.getBoundingClientRect();
  let l = 0, rt = 0;
  if (isDocked()) {
    if (app.classList.contains("lib-open")) l = 288 + 16;
    if (app.classList.contains("insp-open")) rt = 340 + 16;
  }
  const vh = window.visualViewport ? Math.min(r.height, visualViewport.height) : r.height;
  let bottom = vh - 76;
  if (isPhone() && app.classList.contains("insp-open")) bottom = Math.min(bottom, r.height - $("#insp").offsetHeight - 12);
  return { left: l, right: r.width - rt, top: isPhone() ? 62 : 70, bottom, w: r.width, h: r.height };
}
function fit(anim = true) {
  const b = cur._bbox; if (!b || mode !== "map") return;
  const f = freeRect(), pad = isPhone() ? 16 : 40;
  const aw = f.right - f.left - pad * 2, ah = f.bottom - f.top - pad * 2;
  const s = Math.min(1.15, Math.max(.15, Math.min(aw / (b.maxX - b.minX || 1), ah / (b.maxY - b.minY || 1))));
  view.s = s;
  view.x = (f.left + f.right) / 2 - ((b.minX + b.maxX) / 2) * s;
  view.y = (f.top + f.bottom) / 2 - ((b.minY + b.maxY) / 2) * s;
  applyView(anim);
}
/* Opening view: the whole map when it reads well, otherwise a readable zoom centered on the central theme. */
function initialView() {
  if (mode !== "map") return;
  fit(false);
  const min = isDocked() ? .62 : .5;
  if (view.s >= min) return;
  const f = freeRect(), r = cur.root;
  view.s = min;
  view.x = (f.left + f.right) / 2 - r._x * min; view.y = (f.top + f.bottom) / 2 - r._y * min;
  applyView(false);
}
function ensureVisible(n, anim = true) {
  if (!n || n._x == null || mode !== "map") return;
  const f = freeRect();
  const sx = view.x + n._x * view.s, sy = view.y + n._y * view.s;
  const hw = n._w * view.s / 2 + 24, hh = n._h * view.s / 2 + 20;
  let dx = 0, dy = 0;
  if (sx - hw < f.left) dx = f.left + hw - sx; else if (sx + hw > f.right) dx = f.right - (sx + hw);
  if (sy - hh < f.top) dy = f.top + hh - sy; else if (sy + hh > f.bottom) dy = f.bottom - (sy + hh);
  if (dx || dy) { view.x += dx; view.y += dy; applyView(anim); }
}
function centerOn(n) {
  if (mode !== "map" || n._x == null) return;
  const f = freeRect();
  view.x = (f.left + f.right) / 2 - n._x * view.s; view.y = (f.top + f.bottom) / 2 - n._y * view.s; applyView(true);
}
function zoomAt(k, cx, cy) {
  const s2 = Math.min(3, Math.max(.15, view.s * k));
  view.x = cx - (cx - view.x) * (s2 / view.s); view.y = cy - (cy - view.y) * (s2 / view.s); view.s = s2;
  applyView(false);
}
function zoomCenter(k) { const f = freeRect(); zoomAt(k, (f.left + f.right) / 2, (f.top + f.bottom) / 2); }

/* ---------- Reading list view ---------- */
function renderOutline() {
  const box = $("#ol-inner");
  const scroll = outline.scrollTop;
  box.innerHTML = "";
  const st = statsOf(cur.root);
  const head = h("header", "ol-head" + (sel === cur.root.id ? " sel" : ""));
  head.dataset.id = cur.root.id;
  head.appendChild(h("div", "eyebrow", cur.folder ? "Pacote · " + cur.folder : "Mapa de estudo"));
  head.appendChild(h("h1", null, cur.root.text));
  const sum = h("div", "ol-sum");
  sum.append(h("span", null, `${st.total} tópicos`), h("span", null, `${st.done} dominados`), h("span", null, `${st.review} a revisar`));
  head.appendChild(sum);
  if (cur.root.note) { const p = h("p", "muted", cur.root.note); p.style.marginTop = "10px"; head.appendChild(p); }
  box.appendChild(head);
  const build = (kids, d) => {
    const ul = h("ul", "ol-list");
    kids.forEach(k => {
      const li = h("li", "ol-item " + (d === 1 ? "d1" : "dn") + (k.status ? " st-" + k.status : ""));
      const col = colorOf(k.id);
      li.style.setProperty("--ca", col[0]); li.style.setProperty("--cb", col[1]); li.style.setProperty("--line", col[2]);
      const row = h("div", "ol-row" + (k.id === sel ? " sel" : "") + (query ? (matches(k) ? " hit" : " dim") : ""));
      row.dataset.id = k.id;
      const tog = h("button", "ol-tog" + (k.collapsed ? " closed" : ""));
      tog.tabIndex = -1;
      if (k.children.length) { tog.innerHTML = CHEVRON; tog.dataset.fold = k.id; tog.setAttribute("aria-label", k.collapsed ? "Expandir" : "Recolher"); }
      else tog.innerHTML = '<span class="dot"></span>';
      const main = h("div", "ol-main");
      if (k.kind) main.appendChild(h("span", "eb", KINDS[k.kind]));
      main.appendChild(h("span", "ol-text", k.text + (k.collapsed && k.children.length ? `  (+${countAll(k)})` : "")));
      if (k.note) main.appendChild(h("span", "ol-note", k.note));
      const stEl = h("span", "ol-st"); if (k.status) stEl.innerHTML = ICON[k.status];
      row.append(tog, main, stEl);
      li.appendChild(row);
      if (k.children.length && !k.collapsed) li.appendChild(build(k.children, d + 1));
      ul.appendChild(li);
    });
    return ul;
  };
  if (cur.root.children.length) box.appendChild(build(cur.root.children, 1));
  else box.appendChild(h("p", "muted", "Este mapa ainda não tem tópicos. Use o botão de subtópico na barra de baixo para começar."));
  outline.scrollTop = scroll;
}
outline.addEventListener("click", e => {
  const fold = e.target.closest("[data-fold]");
  if (fold) { toggleFold(node(fold.dataset.fold)); return; }
  const row = e.target.closest(".ol-row, .ol-head");
  if (!row) return;
  sel = row.dataset.id; render();
  if (!isDocked()) setPanel("insp", true);
});
outline.addEventListener("dblclick", e => {
  const row = e.target.closest(".ol-row, .ol-head");
  if (row) { sel = row.dataset.id; editInPanel(true); }
});
function scrollRowIntoView(id) {
  const row = outline.querySelector(`[data-id="${CSS.escape(id)}"]`);
  if (row) row.scrollIntoView({ block: "nearest", behavior: REDUCE ? "auto" : "smooth" });
}

function setMode(m) {
  if (editing) commitEdit();
  if (mode === m) return;
  mode = m;
  app.classList.toggle("view-list", m === "list");
  outline.hidden = m !== "list";
  stage.hidden = m === "list";
  $("#v-map").classList.toggle("on", m === "map"); $("#v-list").classList.toggle("on", m === "list");
  $("#v-map").setAttribute("aria-pressed", m === "map"); $("#v-list").setAttribute("aria-pressed", m === "list");
  hideNote();
  try { localStorage.setItem("mapa-estudos:mode", m); } catch (e) {}
  if (m === "map") { resetCanvas(); render({ instant: true }); const n = sel && node(sel); if (n && n !== cur.root) centerOn(n); else initialView(); }
  else { render(); if (sel) scrollRowIntoView(sel); }
}
$("#v-map").onclick = () => setMode("map");
$("#v-list").onclick = () => setMode("list");

/* ---------- Chrome: header, library, inspector ---------- */
const mapTitle = root => firstLine(root.text) || "Sem título";
function updateChrome() {
  const st = statsOf(cur.root);
  const mt = $("#map-title"); mt.textContent = mapTitle(cur.root);
  if (cur.example) { const t = h("span", "tag-ex", "exemplo"); t.style.cssText = "margin-left:8px;vertical-align:3px;font-style:normal"; mt.appendChild(t); }
  const pct = st.total ? st.done / st.total : 0;
  $("#head-ring").innerHTML = ring(pct, 30, 3.5);
  $("#head-pct").textContent = Math.round(pct * 100) + "%";
  $("#head-sub").textContent = `${st.done} de ${st.total} dominados`;
  $("#btn-undo").disabled = !undoStack.length;
  $("#btn-redo").disabled = !redoStack.length;
  const n = sel && node(sel);
  $("#t-del").disabled = !n || n === cur.root;
  $("#t-sib").disabled = !n;
  $("#t-child").disabled = !n;
  $("#t-edit").disabled = !n;
  $("#t-fold").disabled = !n || !n.children.length || n === cur.root;
  renderInspector(st);
  renderLibrary();
}

function buildChips() {
  const types = $("#insp-types");
  for (const [k, label] of Object.entries(KINDS)) {
    const b = h("button", "chip", label); b.dataset.kind = k;
    b.onclick = () => setKind(k); types.appendChild(b);
  }
  const sts = $("#insp-status");
  const none = h("button", "chip st", "Sem marca"); none.dataset.st = ""; none.title = "Limpar (Alt+0)";
  sts.appendChild(none);
  for (const [k, v] of Object.entries(ST)) {
    const b = h("button", "chip st"); b.dataset.st = k; b.innerHTML = ICON[k]; b.append(v.label); b.title = `${v.label} (Alt+${v.key})`;
    sts.appendChild(b);
  }
  sts.querySelectorAll("button").forEach(b => b.onclick = () => setStatus(b.dataset.st));
  const sw = $("#swatches");
  for (const [k, p] of Object.entries(PALETTES)) {
    const b = h("button", "swatch"); b.dataset.pal = k;
    b.innerHTML = '<span class="dots">' + p.colors.slice(0, 4).map(c => `<i style="background:linear-gradient(135deg,${c[0]},${c[1]})"></i>`).join("") + "</span>";
    b.appendChild(h("span", null, p.name));
    b.onclick = () => { if (cur.palette === k) return; cur.palette = k; changed(); render(); };
    sw.appendChild(b);
  }
}

function autosize(ta) { ta.style.height = "auto"; ta.style.height = ta.scrollHeight + "px"; }
function renderInspector(st) {
  const n = sel && node(sel);
  $("#insp-node").hidden = !n;
  $("#insp-map").hidden = !!n;
  if (n) {
    const d = idx.depth.get(n.id);
    const path = pathOf(n);
    $("#insp-kind").textContent = d === 0 ? "Tema central" : (path.length > 1 ? path.slice(1).join(" › ") : (d === 1 ? "Tópico principal" : "Subtópico"));
    const ti = $("#insp-text");
    if (document.activeElement !== ti) { ti.value = n.text; autosize(ti); }
    $("#insp-types").parentElement.hidden = d === 0;
    document.querySelectorAll("#insp-types .chip").forEach(b => b.classList.toggle("on", n.kind === b.dataset.kind));
    document.querySelectorAll("#insp-status .chip").forEach(b => { const on = (n.status || "") === b.dataset.st; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on); });
    $("#insp-status").parentElement.hidden = d === 0;
    const ss = statsOf(n);
    $("#insp-branch").hidden = !ss.total;
    $("#insp-bar").style.width = (ss.total ? ss.done / ss.total * 100 : 0) + "%";
    $("#insp-sub").textContent = `${ss.done}/${ss.total} dominados`;
    $("#btn-train-branch").hidden = !ss.total;
    $("#btn-train-branch").textContent = d === 0 ? "Treinar o mapa inteiro" : "Treinar este ramo";
    const ta = $("#insp-note");
    if (document.activeElement !== ta) ta.value = n.note || "";
  } else {
    $("#ov-eyebrow").textContent = cur.folder ? "Pacote · " + cur.folder : "Visão geral";
    $("#insp-map-title").textContent = mapTitle(cur.root);
    const pct = st.total ? st.done / st.total : 0;
    $("#ov-ring").innerHTML = ring(pct, 64, 6);
    $("#ov-pct").textContent = Math.round(pct * 100) + "%";
    $("#ov-sub").textContent = `${st.done} de ${st.total} tópicos dominados`;
    $("#s-review").textContent = st.review; $("#s-learning").textContent = st.learning; $("#s-done").textContent = st.done;
    document.querySelectorAll(".swatch").forEach(b => b.classList.toggle("on", (cur.palette || "joias") === b.dataset.pal));
    $("#btn-folder").textContent = cur.folder ? `“${cur.folder}” · mudar` : "Colocar num pacote";
  }
  const list = $("#rev-list"); list.innerHTML = "";
  const items = [];
  const w = (x, path) => x.children.forEach(k => { if (k.status === "review") items.push([k, path]); w(k, path.concat(firstLine(k.text))); });
  w(cur.root, []);
  if (!items.length) list.appendChild(h("li", "muted", "Nada marcado como “A revisar”. Marque no painel ou durante o treino."));
  items.forEach(([k, path]) => {
    const li = h("li"); const bt = h("button");
    bt.innerHTML = ICON.review;
    bt.append(h("span", null, firstLine(k.text)), h("span", "path", path.join(" › ")));
    bt.onclick = () => revealAndSelect(k.id);
    li.appendChild(bt); list.appendChild(li);
  });
}

function libraryRows() {
  const rows = [...maps.values()].map(m => m.id === cur.id
    ? { id: m.id, title: mapTitle(cur.root), stats: statsOf(cur.root), t: cur.updatedAt, folder: cur.folder || null }
    : { id: m.id, title: m.title || "Sem título", stats: m.stats || { total: 0, done: 0 }, t: m.updatedAt, folder: m.folder || null });
  if (!cur.example && cur.id && !maps.has(cur.id)) rows.push({ id: cur.id, title: mapTitle(cur.root), stats: statsOf(cur.root), t: cur.updatedAt, folder: cur.folder || null });
  return rows;
}
function folders() { return [...new Set(libraryRows().map(r => r.folder).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR")); }
function renderLibrary() {
  const box = $("#lib-scroll"); box.innerHTML = "";
  const rows = libraryRows();
  const groups = new Map();
  if (cur.example) groups.set("\u0000ex", [{ id: null, title: mapTitle(cur.root), stats: statsOf(cur.root), t: 0, ex: true }]);
  rows.sort((a, b) => (b.t || 0) - (a.t || 0));
  for (const r of rows) { const k = r.folder || "\u0001"; if (!groups.has(k)) groups.set(k, []); groups.get(k).push(r); }
  const keys = [...groups.keys()].sort((a, b) => a === "\u0000ex" ? -1 : b === "\u0000ex" ? 1 : a === "\u0001" ? 1 : b === "\u0001" ? -1 : a.localeCompare(b, "pt-BR"));
  for (const k of keys) {
    const sec = h("section", "folder");
    const head = h("div", "folder-head");
    const label = k === "\u0000ex" ? "Exemplo" : k === "\u0001" ? (keys.length > 1 ? "Mapas avulsos" : "Meus mapas") : k;
    head.appendChild(h("span", "eyebrow", label + (k.startsWith("\u0000") ? "" : ` · ${groups.get(k).length}`)));
    if (!k.startsWith("\u0000") && !k.startsWith("\u0001")) {
      const sh = h("button", "icon-btn"); sh.innerHTML = SHARE_ICON; sh.title = `Compartilhar o pacote “${k}”`; sh.setAttribute("aria-label", sh.title);
      sh.onclick = () => shareFolder(k);
      head.appendChild(sh);
    }
    sec.appendChild(head);
    const ul = h("ul", "map-list");
    for (const r of groups.get(k)) {
      const li = h("li", "map-item" + ((r.ex && cur.example) || (r.id && r.id === cur.id) ? " cur" : ""));
      li.tabIndex = 0;
      li.appendChild(h("div", "nm", r.title));
      const meta = h("div", "meta");
      if (r.ex) meta.appendChild(h("span", "tag-ex", "exemplo"));
      meta.appendChild(h("span", null, `${r.stats.total} tópicos` + (r.t ? ` · ${ago(r.t)}` : "")));
      li.appendChild(meta);
      li.insertAdjacentHTML("beforeend", ring(r.stats.total ? r.stats.done / r.stats.total : 0, 32, 3.2));
      if (!r.ex) {
        const more = h("button", "icon-btn more"); more.innerHTML = MORE_ICON; more.setAttribute("aria-label", "Opções do mapa " + r.title); more.title = "Opções";
        more.onclick = e => { e.stopPropagation(); mapMenu(r.id, more); };
        li.appendChild(more);
      }
      const open = () => { if (!r.ex && r.id !== cur.id) openMap(r.id); if (!isDocked()) setPanel("lib", false); };
      li.onclick = open;
      li.onkeydown = e => { if (e.key === "Enter" && e.target === li) open(); };
      ul.appendChild(li);
    }
    sec.appendChild(ul);
    box.appendChild(sec);
  }
}

/* ---------- Panels ---------- */
function setPanel(which, open) {
  const cls = which === "lib" ? "lib-open" : "insp-open";
  if (open == null) open = !app.classList.contains(cls);
  if (isPhone() && open) app.classList.remove(which === "lib" ? "insp-open" : "lib-open");
  app.classList.toggle(cls, open);
  if (which === "insp" && !open) $("#insp").classList.remove("full");
  $("#btn-lib").classList.toggle("on", app.classList.contains("lib-open"));
  $("#btn-insp").classList.toggle("on", app.classList.contains("insp-open"));
  try { if (isDocked()) localStorage.setItem("mapa-estudos:panels", JSON.stringify({ lib: app.classList.contains("lib-open"), insp: app.classList.contains("insp-open") })); } catch (e) {}
}
$("#btn-lib").onclick = () => setPanel("lib");
$("#lib-close").onclick = () => setPanel("lib", false);
$("#btn-insp").onclick = () => setPanel("insp");
$("#t-details").onclick = () => setPanel("insp", true);
$("#insp-close").onclick = () => setPanel("insp", false);
$("#scrim").onclick = () => setPanel("lib", false);

/* Phone bottom sheet: tap the handle to expand, drag it down to close. */
(() => {
  const handle = $("#sheet-handle"), sheet = $("#insp");
  let y0 = null, dy = 0, moved = false;
  handle.addEventListener("pointerdown", e => { y0 = e.clientY; dy = 0; moved = false; handle.setPointerCapture(e.pointerId); sheet.style.transition = "none"; });
  handle.addEventListener("pointermove", e => {
    if (y0 == null) return;
    dy = e.clientY - y0; if (Math.abs(dy) > 4) moved = true;
    sheet.style.transform = dy > 0 ? `translateY(${dy}px)` : "";
  });
  const end = () => {
    if (y0 == null) return;
    y0 = null; sheet.style.transition = ""; sheet.style.transform = "";
    if (!moved) { sheet.classList.toggle("full"); return; }
    if (dy > 80) setPanel("insp", false);
    else if (dy < -50) sheet.classList.add("full");
  };
  handle.addEventListener("pointerup", end);
  handle.addEventListener("pointercancel", end);
})();

/* ---------- Mutations, undo ---------- */
function snapshot() { return JSON.stringify(cleanTree(cur.root)); }
function pushUndo(s = snapshot()) { undoStack.push({ tree: s, sel }); if (undoStack.length > 150) undoStack.shift(); redoStack = []; }
function changed() {
  if (cur.example) { cur.example = false; cur.id = "m" + rid() + rid(); }
  cur.updatedAt = Date.now(); dirty = true;
  scheduleSave();
}
function mutate(fn) { pushUndo(); fn(); changed(); render(); }
function undo() {
  if (editing) commitEdit();
  const u = undoStack.pop(); if (!u) return;
  redoStack.push({ tree: snapshot(), sel });
  cur.root = JSON.parse(u.tree); sel = u.sel; changed(); render();
}
function redo() {
  const r = redoStack.pop(); if (!r) return;
  undoStack.push({ tree: snapshot(), sel });
  cur.root = JSON.parse(r.tree); sel = r.sel; changed(); render();
}

function nextColor() {
  const used = cur.root.children.map(k => k.c), n = cur.root.children.length;
  for (let i = 0; i < NCOL; i++) if (!used.includes((n + i) % NCOL)) return (n + i) % NCOL;
  return n % NCOL;
}
function pickSide() {
  let r = 0, l = 0;
  cur.root.children.forEach(k => { const hh = (k._sh || 30) + 26; if (k.side === "L") l += hh; else r += hh; });
  return l < r ? "L" : "R";
}
function newChildOf(p, text, at) {
  const n = N(text);
  if (p === cur.root) { n.side = pickSide(); n.c = nextColor(); }
  p.collapsed = false;
  if (at == null) p.children.push(n); else p.children.splice(at, 0, n);
  return n;
}
function addChild() {
  const p = node(sel); if (!p) return;
  let n;
  mutate(() => { n = newChildOf(p, idx.depth.get(p.id) === 0 ? "Tópico principal" : "Subtópico"); sel = n.id; });
  editNew(n.id);
}
function addSibling() {
  const s = node(sel); if (!s) return;
  const p = parentOf(s);
  if (!p) return addChild();
  let n;
  mutate(() => {
    n = newChildOf(p, p === cur.root ? "Tópico principal" : "Subtópico", p.children.indexOf(s) + 1);
    if (p === cur.root) n.side = s.side;
    sel = n.id;
  });
  editNew(n.id);
}
function editNew(id) { if (mode === "map") startEdit(id, true, true); else { scrollRowIntoView(id); editInPanel(true); } }
function deleteSel() {
  const s = node(sel); if (!s || s === cur.root) return;
  const p = parentOf(s);
  mutate(() => {
    const i = p.children.indexOf(s);
    p.children.splice(i, 1);
    const same = p.children.filter(k => p !== cur.root || k.side === s.side);
    const nx = same.find(k => p.children.indexOf(k) >= i) || same[same.length - 1];
    sel = (nx || p).id;
  });
  toast("Tópico excluído.", "Desfazer", undo);
}
function toggleFold(n = node(sel)) {
  if (!n || !n.children.length || n === cur.root) return;
  mutate(() => { n.collapsed = !n.collapsed; });
}
function setStatus(st) {
  const n = node(sel); if (!n || n === cur.root) return;
  if ((n.status || "") === st) return;
  mutate(() => { if (st) n.status = st; else delete n.status; });
}
function setKind(k) {
  const n = node(sel); if (!n || n === cur.root) return;
  mutate(() => { if (n.kind === k) delete n.kind; else n.kind = k; });
}
function moveSibling(dir) {
  const s = node(sel); const p = s && parentOf(s); if (!p) return;
  const peers = p === cur.root ? p.children.filter(k => k.side === s.side) : p.children;
  const i = peers.indexOf(s), j = i + dir;
  if (j < 0 || j >= peers.length) return;
  mutate(() => {
    const a = p.children.indexOf(s), b = p.children.indexOf(peers[j]);
    p.children.splice(a, 1); p.children.splice(b, 0, s);
  });
}
function reparent(n, target, how) {
  if (!n || n === cur.root || n === target || isAncestor(n, target)) return;
  mutate(() => {
    const op = parentOf(n);
    op.children.splice(op.children.indexOf(n), 1);
    let np, at;
    if (how === "in") { np = target; at = null; target.collapsed = false; }
    else { np = parentOf(target); at = np.children.indexOf(target) + (how === "after" ? 1 : 0); }
    if (np === cur.root) {
      if (n.c == null || op !== cur.root) n.c = nextColor();
      n.side = how === "in" ? (op === cur.root && n.side ? n.side : pickSide()) : target.side;
    } else stripTop(n);
    if (at == null) np.children.push(n); else np.children.splice(at, 0, n);
    sel = n.id;
  });
}

/* ---------- Editing ---------- */
function startEdit(id, selectAll = false, fresh = false, initial = null) {
  if (mode !== "map") { sel = id; editInPanel(selectAll); return; }
  if (editing) commitEdit();
  const n = node(id); const el = els.get(id); if (!n || !el) return;
  sel = id; hideNote();
  editing = { id, before: n.text, fresh, undoTree: fresh ? null : snapshot() };
  const tx = el._tx;
  try { tx.contentEditable = "plaintext-only"; } catch (e) { tx.contentEditable = "true"; }
  if (tx.contentEditable !== "plaintext-only") tx.contentEditable = "true";
  tx.setAttribute("enterkeyhint", "done");
  if (initial != null) tx.textContent = initial;
  el.className = nodeClass(n);
  tx.focus({ preventScroll: true });
  const r = document.createRange(); r.selectNodeContents(tx); if (!selectAll) r.collapse(false);
  const s = getSelection(); s.removeAllRanges(); s.addRange(r);
  layout(true);
  ensureVisible(n);
}
function commitEdit(cancel = false) {
  if (!editing) return;
  const { id, before, fresh, undoTree } = editing;
  const n = node(id); const el = els.get(id);
  editing = null;
  if (!n || !el) return;
  const tx = el._tx;
  tx.removeAttribute("contenteditable");
  let text = (tx.innerText || "").replace(/ /g, " ").replace(/\n{3,}/g, "\n\n").trim();
  if (cancel || !text) text = before;
  if (text !== n.text) {
    if (!fresh) pushUndo(undoTree);
    n.text = text; changed();
  }
  tx.textContent = n.text;
  render();
  if (!COARSE) stage.focus({ preventScroll: true });
}
/* In the list view (and as an alternative on touch screens) text is edited in the panel. */
function editInPanel(selectAll) {
  render();
  setPanel("insp", true);
  const ti = $("#insp-text");
  requestAnimationFrame(() => { ti.focus({ preventScroll: true }); if (selectAll) ti.select(); });
}
nodesEl.addEventListener("input", () => { if (editing) layout(true); });
nodesEl.addEventListener("focusout", () => setTimeout(() => {
  if (editing && !nodesEl.contains(document.activeElement)) commitEdit();
}, 0));
if (window.visualViewport) visualViewport.addEventListener("resize", () => { if (editing) ensureVisible(node(editing.id), false); });

/* ---------- Keyboard navigation ---------- */
function nav(key) {
  const n = node(sel); if (!n) { sel = cur.root.id; render(); return; }
  if (mode === "list") {
    const rows = [...outline.querySelectorAll("[data-id]")].map(r => r.dataset.id);
    const i = rows.indexOf(sel);
    let t = null;
    if (key === "ArrowDown") t = rows[i + 1]; else if (key === "ArrowUp") t = rows[i - 1];
    else if (key === "ArrowLeft") { if (n.children.length && !n.collapsed && n !== cur.root) return toggleFold(n); t = parentOf(n) && parentOf(n).id; }
    else if (key === "ArrowRight") { if (n.collapsed) return toggleFold(n); t = n.children[0] && n.children[0].id; }
    if (t) { sel = t; render(); scrollRowIntoView(t); }
    return;
  }
  const d = idx.depth.get(n.id), side = idx.side.get(n.id);
  const kidsOn = s => visibleKids(n).filter(k => d !== 0 || (k.side || "R") === s);
  const nearest = arr => arr.reduce((b, k) => !b || Math.abs(k._y - n._y) < Math.abs(b._y - n._y) ? k : b, null);
  let t = null;
  if (key === "ArrowRight") t = d === 0 ? nearest(kidsOn("R")) : side === "L" ? parentOf(n) : nearest(kidsOn(side));
  else if (key === "ArrowLeft") t = d === 0 ? nearest(kidsOn("L")) : side === "R" ? parentOf(n) : nearest(kidsOn(side));
  else if (d > 0) {
    const p = parentOf(n);
    const peers = p === cur.root ? p.children.filter(k => (k.side || "R") === side) : p.children;
    const i = peers.indexOf(n);
    t = key === "ArrowUp" ? peers[i - 1] : peers[i + 1];
    if (!t) {
      const dirY = key === "ArrowUp" ? -1 : 1;
      let best = null;
      for (const m of idx.byId.values()) {
        if (m === n || m === cur.root || m._y == null || !els.has(m.id) || idx.side.get(m.id) !== side) continue;
        const dy = (m._y - n._y) * dirY; if (dy <= 4) continue;
        const score = dy + Math.abs(m._x - n._x) * .6;
        if (!best || score < best.score) best = { m, score };
      }
      t = best && best.m;
    }
  }
  if (t) { sel = t.id; render(); ensureVisible(t); }
}
function revealAndSelect(id) {
  reindex();
  let opened = false;
  for (let p = idx.parent.get(id); p; p = idx.parent.get(p.id)) if (p.collapsed) { p.collapsed = false; opened = true; }
  if (opened) changed();
  sel = id; render({ instant: true });
  if (mode === "list") scrollRowIntoView(id);
  else { const n = node(id); if (n) centerOn(n); }
  if (isPhone()) setPanel("insp", false);
}

/* ---------- Note preview on hover (mouse only) ---------- */
let noteFor = null;
function showNote(n, el) {
  if (!n.note || editing || drag || pan) return;
  noteFor = n.id;
  const r = el.getBoundingClientRect(), ar = app.getBoundingClientRect();
  $("#nc-eb").textContent = (n.kind && KINDS[n.kind]) || "Nota";
  $("#nc-text").textContent = n.note.length > 420 ? n.note.slice(0, 420) + "…" : n.note;
  const card = $("#notecard"); card.hidden = false;
  const w = 280, side = idx.side.get(n.id) === "L" ? -1 : 1;
  let x = side > 0 ? r.right + 14 : r.left - w - 14;
  if (x + w > ar.right - 12) x = r.left - w - 14;
  if (x < ar.left + 12) x = Math.min(ar.right - w - 12, r.right + 14);
  const y = Math.max(ar.top + 70, Math.min(r.top - 6, ar.bottom - card.offsetHeight - 80));
  card.style.left = x - ar.left + "px"; card.style.top = y - ar.top + "px";
}
function hideNote() { noteFor = null; $("#notecard").hidden = true; }
nodesEl.addEventListener("pointerover", e => {
  if (e.pointerType !== "mouse") return;
  const el = e.target.closest(".node"); if (!el) return;
  const n = node(el.dataset.id);
  if (n && n.id !== noteFor) { hideNote(); clearTimeout(nodesEl._nt); nodesEl._nt = setTimeout(() => showNote(n, el), 350); }
});
nodesEl.addEventListener("pointerout", e => {
  const to = e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest(".node");
  if (to && to === e.target.closest(".node")) return;
  clearTimeout(nodesEl._nt); hideNote();
});

/* ---------- Pointer: pan, pinch, select, drag (mouse: drag at once; touch: press and hold) ---------- */
const pointers = new Map();
let pan = null, drag = null, pinch = null, lastTap = {};
stage.tabIndex = 0;
function startPan(e, x0, y0) {
  pan = { x0, y0, vx: view.x, vy: view.y, moved: false };
  try { stage.setPointerCapture(e.pointerId); } catch (err) {}
  stage.classList.add("panning");
}
function cancelDrag() { if (drag) { clearTimeout(drag.timer); const el = els.get(drag.id); if (el) el.classList.remove("lifted"); } drag = null; }
stage.addEventListener("pointerdown", e => {
  const tog = e.target.closest(".tog");
  const nEl = e.target.closest(".node");
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  hideNote(); closeMenu();
  if (pointers.size === 2) {
    const [a, b] = [...pointers.values()];
    pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), s: view.s }; pan = null; cancelDrag(); return;
  }
  if (e.button === 2) return;
  if (tog && nEl) { e.preventDefault(); toggleFold(node(nEl.dataset.id)); return; }
  if (nEl) {
    const id = nEl.dataset.id;
    if (editing && editing.id === id) return;
    if (editing) commitEdit();
    e.preventDefault();
    if (!COARSE) stage.focus({ preventScroll: true });
    if (sel !== id) { sel = id; render(); }
    const touch = e.pointerType !== "mouse";
    drag = { id, x0: e.clientX, y0: e.clientY, on: false, pid: e.pointerId, touch, armed: !touch };
    if (touch) drag.timer = setTimeout(() => {
      if (!drag || drag.id !== id) return;
      drag.armed = true;
      const el = els.get(id); if (el) el.classList.add("lifted");
      if (navigator.vibrate) navigator.vibrate(12);
    }, 420);
    return;
  }
  if (editing) commitEdit();
  if (!COARSE) stage.focus({ preventScroll: true });
  startPan(e, e.clientX, e.clientY);
});
stage.addEventListener("pointermove", e => {
  if (pointers.has(e.pointerId)) pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (pinch && pointers.size === 2) {
    const [a, b] = [...pointers.values()];
    const r = stage.getBoundingClientRect();
    const d = Math.hypot(a.x - b.x, a.y - b.y);
    zoomAt((pinch.s * d / pinch.d) / view.s, (a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top);
    return;
  }
  if (pan) {
    const dx = e.clientX - pan.x0, dy = e.clientY - pan.y0;
    if (Math.abs(dx) + Math.abs(dy) > 3) pan.moved = true;
    view.x = pan.vx + dx; view.y = pan.vy + dy; applyView(false); return;
  }
  if (!drag) return;
  const dist = Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0);
  if (drag.touch && !drag.armed) {
    // a finger that moves before the hold completes pans the canvas instead
    if (dist > 8) { const d = drag; cancelDrag(); startPan(e, d.x0, d.y0); pan.moved = true; view.x = pan.vx + e.clientX - d.x0; view.y = pan.vy + e.clientY - d.y0; applyView(false); }
    return;
  }
  const n = node(drag.id);
  if (!drag.on) {
    if (n === cur.root || dist < 6) return;
    drag.on = true;
    try { stage.setPointerCapture(drag.pid); } catch (err) {}
    drag.ghost = h("div", "ghost", firstLine(n.text));
    document.body.appendChild(drag.ghost);
    const el = els.get(n.id); el.classList.add("dragging"); el.classList.remove("lifted");
  }
  drag.ghost.style.left = e.clientX + 14 + "px"; drag.ghost.style.top = e.clientY - (drag.touch ? 44 : -10) + "px";
  clearDropMarks();
  const t = document.elementFromPoint(e.clientX, e.clientY);
  const tEl = t && t.closest(".node");
  drag.target = null;
  if (tEl && tEl.dataset.id !== drag.id) {
    const tn = node(tEl.dataset.id);
    if (tn && !isAncestor(n, tn)) {
      const r = tEl.getBoundingClientRect();
      const fy = (e.clientY - r.top) / r.height;
      let how = "in";
      if (tn !== cur.root && fy < .28) how = "before"; else if (tn !== cur.root && fy > .72) how = "after";
      drag.target = { id: tn.id, how };
      tEl.classList.add(how === "in" ? "drop-in" : "drop-" + how);
    }
  } else if (!tEl && parentOf(n) === cur.root) {
    const r = stage.getBoundingClientRect();
    drag.target = { side: (e.clientX - r.left - view.x) / view.s < 0 ? "L" : "R" };
  }
});
function clearDropMarks() { nodesEl.querySelectorAll(".drop-in,.drop-before,.drop-after").forEach(x => x.classList.remove("drop-in", "drop-before", "drop-after")); }
function endPointer(e) {
  pointers.delete(e.pointerId);
  if (pinch) { if (pointers.size < 2) pinch = null; return; }
  stage.classList.remove("panning");
  if (pan) {
    if (!pan.moved && sel) { sel = null; render(); }
    pan = null;
  }
  if (!drag) return;
  const d = drag; cancelDrag();
  if (d.on) {
    d.ghost.remove(); clearDropMarks();
    const el = els.get(d.id); if (el) el.classList.remove("dragging");
    const n = node(d.id);
    if (d.target && d.target.id) reparent(n, node(d.target.id), d.target.how);
    else if (d.target && d.target.side && n.side !== d.target.side) mutate(() => { n.side = d.target.side; });
  } else if (d.touch && d.armed && e.type === "pointerup") {
    nodeMenu(d.id, { x: e.clientX, y: e.clientY });
  } else if (e.type === "pointerup") {
    const now = Date.now();
    if (lastTap.id === d.id && now - lastTap.t < 380) { lastTap = {}; startEdit(d.id, true); }
    else lastTap = { id: d.id, t: now };
  }
}
stage.addEventListener("pointerup", endPointer);
stage.addEventListener("pointercancel", endPointer);
stage.addEventListener("dblclick", e => { if (!e.target.closest(".node")) fit(); });
stage.addEventListener("contextmenu", e => {
  const nEl = e.target.closest(".node"); e.preventDefault();
  if (nEl && !COARSE) { sel = nEl.dataset.id; render(); nodeMenu(sel, { x: e.clientX, y: e.clientY }); }
});
stage.addEventListener("wheel", e => {
  e.preventDefault();
  const r = stage.getBoundingClientRect();
  if (e.ctrlKey || e.metaKey) zoomAt(Math.exp(-e.deltaY * .0022), e.clientX - r.left, e.clientY - r.top);
  else { view.x -= e.deltaX; view.y -= e.deltaY; applyView(false); }
}, { passive: false });

function nodeMenu(id, at) {
  sel = id; render();
  const n = node(id); if (!n) return;
  const items = [
    { label: "Editar texto", onClick: () => startEdit(id, true) },
    { label: "Adicionar subtópico", onClick: addChild }
  ];
  if (n !== cur.root) items.push({ label: "Adicionar tópico irmão", onClick: addSibling });
  items.push({ label: "Notas, tipo e situação", onClick: () => setPanel("insp", true) });
  if (n !== cur.root && n.children.length) items.push({ label: n.collapsed ? "Expandir ramo" : "Recolher ramo", onClick: () => toggleFold(n) });
  if (n !== cur.root) items.push("-", { label: "Excluir tópico", danger: true, onClick: deleteSel });
  openMenu(at, items);
}

/* ---------- Keyboard ---------- */
const typingInField = t => t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
document.addEventListener("keydown", e => {
  const mod = e.ctrlKey || e.metaKey;
  if (!$("#trainer").hidden) { trainerKey(e); return; }
  if ($("#dialog-root").firstChild) { if (e.key === "Escape") closeDialog(); return; }
  if (menuEl && e.key === "Escape") { closeMenu(); return; }
  if (editing) {
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); commitEdit(); }
    else if (e.key === "Escape") { e.preventDefault(); commitEdit(true); }
    else if (e.key === "Tab") { e.preventDefault(); commitEdit(); if (e.shiftKey) addSibling(); else addChild(); }
    return;
  }
  if (mod && e.key.toLowerCase() === "f") { e.preventDefault(); openSearch(); return; }
  if (typingInField(e.target)) return;
  if ((e.key === "Enter" || e.key === " ") && e.target.closest && e.target.closest("button, a, li[tabindex]")) return;
  if (mod && e.key.toLowerCase() === "z") { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
  if (mod && e.key.toLowerCase() === "y") { e.preventDefault(); redo(); return; }
  if (mod && e.code === "Period") { e.preventDefault(); toggleFold(); return; }
  if (mod && (e.key === "=" || e.key === "+")) { e.preventDefault(); zoomCenter(1.2); return; }
  if (mod && e.key === "-") { e.preventDefault(); zoomCenter(1 / 1.2); return; }
  if (mod && e.key === "0") { e.preventDefault(); fit(); return; }
  if (e.altKey && /^Digit[0-3]$/.test(e.code)) { e.preventDefault(); setStatus(["", "review", "learning", "done"][+e.code.slice(5)]); return; }
  if (e.altKey && (e.key === "ArrowUp" || e.key === "ArrowDown")) { e.preventDefault(); moveSibling(e.key === "ArrowUp" ? -1 : 1); return; }
  if (!sel) {
    if (e.key.startsWith("Arrow") || e.key === "Tab" || e.key === "Enter") { e.preventDefault(); sel = cur.root.id; render(); }
    else if (!mod && e.key.toLowerCase() === "t") { e.preventDefault(); openTrainer(); }
    else if (!mod && e.key.toLowerCase() === "l") { e.preventDefault(); setMode(mode === "map" ? "list" : "map"); }
    return;
  }
  switch (e.key) {
    case "Tab": e.preventDefault(); e.shiftKey ? addSibling() : addChild(); return;
    case "Enter": e.preventDefault(); addSibling(); return;
    case "Insert": e.preventDefault(); addChild(); return;
    case "Delete": case "Backspace": e.preventDefault(); deleteSel(); return;
    case "F2": case " ": e.preventDefault(); startEdit(sel, e.key === "F2"); return;
    case "Escape": sel = null; render(); return;
    case "ArrowUp": case "ArrowDown": case "ArrowLeft": case "ArrowRight": e.preventDefault(); nav(e.key); return;
  }
  if (!mod && !e.altKey && e.key.length === 1 && !e.isComposing && mode === "map") { e.preventDefault(); startEdit(sel, false, false, e.key); }
});

/* ---------- Clipboard: copy a branch as an outline, paste an outline as topics ---------- */
function toOutline(n, depth = 0, out = []) {
  out.push("  ".repeat(depth) + (depth ? "- " : "") + n.text.split("\n").join(" "));
  n.children.forEach(k => toOutline(k, depth + 1, out));
  return out;
}
const clipOk = () => !editing && !typingInField(document.activeElement) && sel && $("#trainer").hidden && !$("#dialog-root").firstChild;
document.addEventListener("copy", e => {
  if (!clipOk()) return;
  const n = node(sel); if (!n) return;
  e.preventDefault();
  e.clipboardData.setData("text/plain", toOutline(n).join("\n"));
  toast("Ramo copiado como lista.");
});
document.addEventListener("cut", e => {
  if (!clipOk()) return;
  const n = node(sel); if (!n || n === cur.root) return;
  e.preventDefault();
  e.clipboardData.setData("text/plain", toOutline(n).join("\n"));
  deleteSel();
});
document.addEventListener("paste", e => {
  if (!clipOk()) return;
  const text = e.clipboardData && e.clipboardData.getData("text/plain");
  if (!text || !text.trim()) return;
  e.preventDefault();
  const t = parseOutline(text);
  const items = t.text === "\u0000" ? t.children : [t];
  const p = node(sel); if (!p || !items.length) return;
  mutate(() => {
    items.forEach(it => {
      const n = newChildOf(p, it.text); n.children = it.children;
      if (it.note) n.note = it.note; if (it.status) n.status = it.status; if (it.kind) n.kind = it.kind;
    });
  });
  toast(items.length === 1 ? "Tópico colado." : `${items.length} tópicos colados.`);
});

/* Parses markdown headings, bullet lists or plain indented text into a tree. */
const KIND_BY_LABEL = Object.fromEntries(Object.entries(KINDS).map(([k, v]) => [norm(v), k]));
function parseOutline(text) {
  const lines = text.replace(/\r/g, "").split("\n");
  const root = { text: "\u0000", children: [], lvl: -1 };
  const stack = [root];
  let headingBase = 0, lastHeading = -1;
  for (const raw of lines) {
    if (!raw.trim()) continue;
    const exp = raw.replace(/\t/g, "    ");
    let m, lvl, txt;
    if ((m = exp.match(/^\s{0,3}(#{1,6})\s+(.*)$/))) { lvl = m[1].length - 1; lastHeading = lvl; txt = m[2]; headingBase = lvl + 1; }
    else if ((m = exp.match(/^\s*>\s?(.*)$/))) { const t = stack[stack.length - 1]; if (t !== root) t.note = (t.note ? t.note + "\n" : "") + m[1]; continue; }
    else {
      const ind = exp.match(/^\s*/)[0].length;
      txt = exp.trim().replace(/^([-*+•]|\d+[.)])\s+/, "").replace(/^\[( |x|X)\]\s+/, s => (s.toLowerCase().includes("x") ? "\u0001" : ""));
      lvl = (lastHeading >= 0 ? headingBase : 0) + Math.floor(ind / 2);
    }
    let status, kind;
    if (txt.startsWith("\u0001")) { txt = txt.slice(1); status = "done"; }
    if (/\s_\(revisar\)_$/.test(txt)) { txt = txt.replace(/\s_\(revisar\)_$/, ""); status = "review"; }
    else if (/\s_\(estudando\)_$/.test(txt)) { txt = txt.replace(/\s_\(estudando\)_$/, ""); status = "learning"; }
    const km = txt.match(/^\*\*([^*:]+):\*\*\s+(.*)$/);
    if (km && KIND_BY_LABEL[norm(km[1])]) { kind = KIND_BY_LABEL[norm(km[1])]; txt = km[2]; }
    txt = txt.replace(/\*\*(.+?)\*\*/g, "$1").replace(/__(.+?)__/g, "$1").trim();
    if (!txt) continue;
    while (stack.length > 1 && stack[stack.length - 1].lvl >= lvl) stack.pop();
    const n = { id: rid(), text: txt, children: [], lvl };
    if (status) n.status = status;
    if (kind) n.kind = kind;
    stack[stack.length - 1].children.push(n);
    stack.push(n);
  }
  const strip = n => { delete n.lvl; n.children.forEach(strip); return n; };
  strip(root);
  if (root.children.length === 1) return root.children[0];
  return root;
}

/* ---------- Toolbar & inspector wiring ---------- */
$("#t-child").onclick = addChild;
$("#t-sib").onclick = addSibling;
$("#t-del").onclick = deleteSel;
$("#t-fold").onclick = () => toggleFold();
$("#t-edit").onclick = () => { if (!sel) return; if (COARSE && isPhone()) editInPanel(true); else startEdit(sel, true); };
$("#z-in").onclick = () => zoomCenter(1.2);
$("#z-out").onclick = () => zoomCenter(1 / 1.2);
$("#z-pct").onclick = () => zoomCenter(1 / view.s);
$("#z-fit").onclick = () => fit();
$("#btn-undo").onclick = undo;
$("#btn-redo").onclick = redo;
$("#btn-train").onclick = () => openTrainer();
$("#btn-train-branch").onclick = () => { const n = node(sel); openTrainer(n && n !== cur.root ? n : null); };
$("#btn-folder").onclick = () => folderDialog(cur.id);

let textUndoTaken = false;
const ti = $("#insp-text");
ti.addEventListener("focus", () => { textUndoTaken = false; });
ti.addEventListener("input", () => {
  autosize(ti);
  const n = node(sel); if (!n) return;
  if (!textUndoTaken) { pushUndo(); textUndoTaken = true; }
  n.text = ti.value.trim() ? ti.value : "Tópico"; changed(); render({ instant: true });
});
ti.addEventListener("keydown", e => { if ((e.key === "Enter" && !e.shiftKey) || e.key === "Escape") { e.preventDefault(); ti.blur(); if (!COARSE) stage.focus(); } });
let noteUndoTaken = false;
$("#insp-note").addEventListener("focus", () => { noteUndoTaken = false; });
$("#insp-note").addEventListener("input", e => {
  const n = node(sel); if (!n) return;
  if (!noteUndoTaken) { pushUndo(); noteUndoTaken = true; }
  const had = !!n.note;
  if (e.target.value) n.note = e.target.value; else delete n.note;
  changed();
  if (had !== !!n.note || mode === "list") render({ instant: true });
});

/* Search: a field in the header on wide screens, a bar under it on phones and tablets. */
function onSearchInput(v) { query = v.trim(); hitIdx = -1; render({ instant: true }); }
function onSearchKey(e) {
  if (e.key === "Escape") { closeSearch(); return; }
  if (e.key !== "Enter") return;
  e.preventDefault();
  const hits = []; const w = n => { if (query && matches(n)) hits.push(n.id); n.children.forEach(w); }; w(cur.root);
  if (!hits.length) { toast("Nenhum tópico encontrado."); return; }
  hitIdx = (hitIdx + (e.shiftKey ? -1 : 1) + hits.length) % hits.length;
  revealAndSelect(hits[hitIdx]);
  toast(`${hitIdx + 1} de ${hits.length}`);
}
function openSearch() {
  if (innerWidth > 860) { $("#search").focus(); $("#search").select(); return; }
  $("#searchbar").hidden = false; $("#search-m").value = query; $("#search-m").focus();
}
function closeSearch() {
  $("#search").value = ""; $("#search-m").value = ""; $("#searchbar").hidden = true;
  if (query) { query = ""; render({ instant: true }); }
}
for (const id of ["#search", "#search-m"]) {
  $(id).addEventListener("input", e => onSearchInput(e.target.value));
  $(id).addEventListener("keydown", onSearchKey);
}
$("#btn-search").onclick = () => $("#searchbar").hidden ? openSearch() : closeSearch();
$("#search-close").onclick = closeSearch;

let toastT = null;
function toast(msg, actionLabel, action) {
  const t = $("#toast"); t.textContent = ""; t.appendChild(h("span", null, msg));
  if (actionLabel) { const b = h("button", null, actionLabel); b.onclick = () => { t.hidden = true; action(); }; t.appendChild(b); }
  t.hidden = false;
  t.style.animation = "none"; void t.offsetWidth; t.style.animation = "";
  clearTimeout(toastT); toastT = setTimeout(() => t.hidden = true, actionLabel ? 4500 : 2600);
}

/* ---------- Menus and dialogs ---------- */
let menuEl = null;
function openMenu(at, items) {
  closeMenu();
  const m = h("div", "menu"); m.setAttribute("role", "menu");
  for (const it of items) {
    if (it === "-") { m.appendChild(h("hr")); continue; }
    const b = h("button", it.danger ? "danger" : null);
    b.setAttribute("role", "menuitem");
    b.appendChild(h("span", null, it.label));
    if (it.sub) b.appendChild(h("small", null, it.sub));
    b.onclick = () => { closeMenu(); it.onClick(); };
    m.appendChild(b);
  }
  app.appendChild(m); menuEl = m;
  const ar = app.getBoundingClientRect();
  let x, y;
  if (at instanceof Element) { const r = at.getBoundingClientRect(); x = r.right - m.offsetWidth; y = r.bottom + 8; if (x < 12) x = r.left; }
  else { x = at.x; y = at.y + 6; }
  x = Math.max(12, Math.min(x, ar.width - m.offsetWidth - 12));
  if (y + m.offsetHeight > ar.height - 12) y = Math.max(12, (at instanceof Element ? at.getBoundingClientRect().top - 8 : at.y) - m.offsetHeight);
  m.style.left = x + "px"; m.style.top = y + "px";
  const first = m.querySelector("button"); if (first && !COARSE) first.focus({ preventScroll: true });
}
function closeMenu() { if (menuEl) { menuEl.remove(); menuEl = null; } }
document.addEventListener("pointerdown", e => { if (menuEl && !menuEl.contains(e.target) && !e.target.closest("#btn-share, .more")) closeMenu(); }, true);

function openDialog({ title, body, actions = [], onClose }) {
  closeDialog();
  const wrap = h("div", "dialog-wrap");
  const d = h("div", "dialog"); d.setAttribute("role", "dialog"); d.setAttribute("aria-modal", "true");
  d.appendChild(h("h3", null, title));
  if (body) (Array.isArray(body) ? body : [body]).forEach(b => d.appendChild(typeof b === "string" ? h("p", null, b) : b));
  if (actions.length) {
    const row = h("div", "row");
    for (const a of actions) {
      const b = h("button", "btn" + (a.primary ? " primary" : ""), a.label);
      if (a.danger) { b.style.background = "var(--review)"; b.style.color = "#fff"; b.style.borderColor = "transparent"; }
      b.onclick = async () => { const keep = a.onClick ? await a.onClick() : false; if (keep !== true) closeDialog(); };
      row.appendChild(b);
    }
    d.appendChild(row);
  }
  wrap.appendChild(d);
  wrap.addEventListener("pointerdown", e => { if (e.target === wrap) closeDialog(); });
  wrap._onClose = onClose;
  $("#dialog-root").appendChild(wrap);
  const f = d.querySelector("input, .btn.primary"); if (f && !COARSE) f.focus();
  return d;
}
function closeDialog() { const w = $("#dialog-root").firstChild; if (w) { w.remove(); if (w._onClose) w._onClose(); } }

/* ---------- Trainer (flashcards) ---------- */
let tr = null;
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function openTrainer(scope, only) {
  if (editing) commitEdit();
  reindex();
  const base = scope || cur.root;
  let all = [];
  const w = n => n.children.forEach(k => { all.push(k); w(k); });
  w(base);
  if (only) all = all.filter(k => only.has(k.id));
  if (!all.length) { toast("Adicione tópicos ao mapa para treinar."); return; }
  const rich = all.filter(k => k.note || k.children.length);
  const pool = only ? all : (rich.length >= 3 ? rich : all);
  const rank = { review: 0, learning: 1, undefined: 2, done: 3 };
  const groups = [[], [], [], []];
  pool.forEach(k => groups[rank[k.status]].push(k.id));
  tr = { cards: groups.flatMap(g => shuffle(g)), i: 0, flipped: false, res: { review: 0, learning: 0, done: 0 }, missed: new Set(), scope };
  $("#tr-scope").textContent = "Treino · " + (scope ? firstLine(scope.text) : mapTitle(cur.root));
  $("#trainer").hidden = false; hideNote(); closeMenu();
  showCard();
}
function showCard() {
  const c = $("#card");
  $("#tr-bar").style.width = (tr.i / tr.cards.length * 100) + "%";
  if (tr.i >= tr.cards.length) return finishTrainer();
  $("#tr-play").hidden = false; $("#tr-done").hidden = true;
  $("#tr-count").textContent = `${tr.i + 1} / ${tr.cards.length}`;
  const n = node(tr.cards[tr.i]);
  if (!n) { tr.i++; return showCard(); }
  const path = pathOf(n), col = colorOf(n.id);
  for (const id of ["#cf-crumb", "#cb-crumb"]) {
    const el = $(id); el.innerHTML = `<i style="background:${col[2]}"></i>`;
    el.appendChild(h("span", null, path.join(" › ")));
  }
  $("#cf-kind").textContent = (n.kind && KINDS[n.kind]) || (n.children.length ? "Explique" : "Lembre");
  $("#cf-text").textContent = n.text;
  $("#cf-hint").textContent = COARSE ? "Lembre o que sabe e toque para virar o cartão" : "Lembre o que sabe sobre isso e vire o cartão";
  $("#cb-title").textContent = firstLine(n.text);
  const ans = $("#cb-ans"); ans.textContent = n.note || "";
  if (n.children.length) {
    const ul = h("ul");
    n.children.slice(0, 14).forEach(k => ul.appendChild(h("li", null, firstLine(k.text))));
    if (n.children.length > 14) ul.appendChild(h("li", null, `e mais ${n.children.length - 14}`));
    ans.appendChild(ul);
  }
  if (!n.note && !n.children.length) ans.appendChild(h("p", "muted", "Este tópico ainda não tem notas. Avalie pelo que você lembrou e depois escreva uma nota para os próximos treinos."));
  tr.flipped = false;
  $("#card-move").style.transform = "";
  c.classList.remove("flipped", "enter"); void c.offsetWidth; c.classList.add("enter");
  setActions();
}
function setActions() {
  const a = $("#tr-actions"); a.innerHTML = "";
  $("#tr-swipe-hint").hidden = !(COARSE && tr.flipped);
  if (!tr.flipped) {
    a.className = "tr-actions one";
    const b = h("button", "rate show"); b.innerHTML = "Mostrar resposta<small>" + (COARSE ? "TOQUE NO CARTÃO" : "ESPAÇO") + "</small>"; b.onclick = flipCard; a.appendChild(b);
  } else {
    a.className = "tr-actions";
    [["review", "r", "Errei", "1"], ["learning", "l", "Quase", "2"], ["done", "d", "Acertei", "3"]].forEach(([st, cls, label, key]) => {
      const b = h("button", "rate " + cls); b.innerHTML = `${label}<small>${COARSE ? "" : key}</small>`; b.onclick = () => rate(st); a.appendChild(b);
    });
  }
}
function flipCard() { tr.flipped = !tr.flipped; $("#card").classList.toggle("flipped", tr.flipped); setActions(); }
function rate(st) {
  const n = node(tr.cards[tr.i]);
  if (n && (n.status || "") !== st) { pushUndo(); n.status = st; changed(); }
  tr.res[st]++; if (st === "review" && n) tr.missed.add(n.id);
  tr.i++; showCard();
}
function finishTrainer() {
  $("#tr-play").hidden = true; $("#tr-done").hidden = false;
  $("#tr-count").textContent = "";
  const total = tr.res.review + tr.res.learning + tr.res.done;
  $("#td-title").textContent = total === 1 ? "1 conceito revisado" : `${total} conceitos revisados`;
  $("#td-r").textContent = tr.res.review; $("#td-l").textContent = tr.res.learning; $("#td-d").textContent = tr.res.done;
  $("#td-again").hidden = !tr.missed.size;
}
function closeTrainer() { $("#trainer").hidden = true; tr = null; render(); if (!COARSE) stage.focus({ preventScroll: true }); }
function trainerKey(e) {
  if (e.key === "Escape") { e.preventDefault(); closeTrainer(); return; }
  if (!tr || tr.i >= tr.cards.length) return;
  if (e.key === " " || e.key === "Enter") { e.preventDefault(); if (!tr.flipped) flipCard(); return; }
  if (tr.flipped && ["1", "2", "3"].includes(e.key)) { e.preventDefault(); rate(["review", "learning", "done"][+e.key - 1]); }
}
/* Tap flips the card; once flipped it can be swiped: left = errei, up = quase, right = acertei. */
(() => {
  const card = $("#card"), mv = $("#card-move");
  let s = null;
  const tags = { l: $("#sw-l"), r: $("#sw-r"), u: $("#sw-u") };
  const setTags = (dx, dy) => {
    tags.l.style.opacity = Math.max(0, Math.min(1, -dx / 90));
    tags.r.style.opacity = Math.max(0, Math.min(1, dx / 90));
    tags.u.style.opacity = Math.abs(dx) < 50 ? Math.max(0, Math.min(1, -dy / 90)) : 0;
  };
  card.addEventListener("pointerdown", e => { if (!tr) return; s = { x: e.clientX, y: e.clientY, dx: 0, dy: 0, moved: false }; card.setPointerCapture(e.pointerId); });
  card.addEventListener("pointermove", e => {
    if (!s) return;
    s.dx = e.clientX - s.x; s.dy = e.clientY - s.y;
    if (Math.abs(s.dx) + Math.abs(s.dy) > 8) s.moved = true;
    if (!tr.flipped || !s.moved) return;
    mv.classList.add("dragging");
    mv.style.transform = `translate(${s.dx}px, ${Math.min(0, s.dy)}px) rotate(${s.dx / 22}deg)`;
    setTags(s.dx, s.dy);
  });
  const end = () => {
    if (!s) return;
    const { dx, dy, moved } = s; s = null;
    mv.classList.remove("dragging"); setTags(0, 0);
    if (!moved) { flipCard(); return; }
    if (!tr.flipped) return;
    let st = null;
    if (dx > 90) st = "done"; else if (dx < -90) st = "review"; else if (dy < -90) st = "learning";
    if (!st) { mv.style.transform = ""; return; }
    const off = st === "done" ? "translate(140%, 0) rotate(18deg)" : st === "review" ? "translate(-140%, 0) rotate(-18deg)" : "translate(0, -140%)";
    mv.style.transform = off;
    setTimeout(() => rate(st), REDUCE ? 0 : 220);
  };
  card.addEventListener("pointerup", end);
  card.addEventListener("pointercancel", () => { s = null; mv.classList.remove("dragging"); mv.style.transform = ""; setTags(0, 0); });
})();
$("#tr-close").onclick = closeTrainer;
$("#td-close").onclick = closeTrainer;
$("#td-again").onclick = () => { const m = tr.missed, s = tr.scope; openTrainer(s, m); };

/* ---------- Maps: open, create, duplicate, move, delete ---------- */
function resetCanvas() { for (const el of els.values()) el.remove(); els.clear(); disp = new Map(); }
function loadCurrent(rec) {
  cur = { id: rec.id, root: clone(rec.root), updatedAt: rec.updatedAt || 0, palette: rec.palette || "joias", folder: rec.folder || null };
}
function openMap(id) {
  if (editing) commitEdit();
  flushSave();
  const m = maps.get(id); if (!m) return;
  loadCurrent(m);
  sel = null; undoStack = []; redoStack = []; closeSearch();
  resetCanvas(); render({ instant: true }); initialView();
  if (mode === "list") outline.scrollTop = 0;
  try { localStorage.setItem("mapa-estudos:last", id); } catch (e) {}
}
function newMap(root, opts = {}) {
  if (editing) commitEdit();
  flushSave();
  const fresh = !root;
  root = root || N("Novo tema de estudo");
  cur = { id: opts.id || "m" + rid() + rid(), root, updatedAt: opts.updatedAt || Date.now(), palette: opts.palette || "joias", folder: opts.folder || null };
  sel = cur.root.id; undoStack = []; redoStack = [];
  resetCanvas();
  dirty = true; queueCurrent();
  render({ instant: true }); initialView();
  if (fresh) editNew(cur.root.id);
  try { localStorage.setItem("mapa-estudos:last", cur.id); } catch (e) {}
}
$("#btn-new").onclick = () => { if (!isDocked()) setPanel("lib", false); newMap(null, { folder: cur.folder && !cur.example ? cur.folder : null }); };

function recordOf(id) { if (id === cur.id) { flushSave(); } return maps.get(id); }
function mapMenu(id, anchor) {
  const rec = recordOf(id); if (!rec) return;
  openMenu(anchor, [
    { label: "Compartilhar este mapa", sub: "WhatsApp, e-mail, arquivo", onClick: () => sharePackage([rec], rec.title, null) },
    { label: rec.folder ? "Mudar de pacote…" : "Colocar num pacote…", onClick: () => folderDialog(id) },
    { label: "Duplicar", onClick: () => duplicateMap(id) },
    "-",
    { label: "Excluir mapa", danger: true, onClick: () => confirmDelete(id) }
  ]);
}
function duplicateMap(id) {
  const rec = recordOf(id); if (!rec) return;
  const root = freshIds(clone(rec.root)); root.text = mapTitle(root) + " (cópia)";
  newMap(root, { palette: rec.palette, folder: rec.folder });
  toast("Mapa duplicado.");
}
function confirmDelete(id) {
  const rec = recordOf(id); if (!rec) return;
  openDialog({
    title: `Excluir “${rec.title}”?`,
    body: "O mapa sai deste aparelho. Se ele veio de um pacote, você pode abrir o pacote de novo para recuperá-lo.",
    actions: [{ label: "Cancelar" }, { label: "Excluir", danger: true, onClick: () => deleteMap(id) }]
  });
}
function deleteMap(id) {
  maps.delete(id); pending.delete(id);
  if (cur.id === id) { dirty = false; clearTimeout(saveTimer); }
  Store.del(id).catch(() => toast("Não deu para excluir agora. Tente de novo."));
  if (channel) channel.postMessage({ type: "deleted", id });
  if (cur.id === id) {
    const next = newestId();
    if (next) openMap(next); else { cur = exampleMap(); sel = cur.root.id; resetCanvas(); render({ instant: true }); initialView(); }
  } else renderLibrary();
  toast("Mapa excluído.");
}
function folderDialog(id) {
  const rec = id === cur.id ? null : maps.get(id);
  const currentFolder = rec ? rec.folder : cur.folder;
  const input = h("input", "field"); input.value = currentFolder || ""; input.placeholder = "Nome do pacote, ex.: Biologia 1º bimestre"; input.setAttribute("list", "folder-list"); input.id = "folder-input";
  const dl = h("datalist"); dl.id = "folder-list"; folders().forEach(f => { const o = h("option"); o.value = f; dl.appendChild(o); });
  const chips = h("div", "chips");
  folders().forEach(f => { const c = h("button", "chip" + (f === currentFolder ? " on" : ""), f); c.onclick = () => { input.value = f; chips.querySelectorAll(".chip").forEach(x => x.classList.toggle("on", x === c)); }; chips.appendChild(c); });
  const apply = folder => {
    folder = (folder || "").trim().slice(0, 80) || null;
    if (id === cur.id || (cur.example && !id)) { cur.folder = folder; changed(); render(); }
    else if (rec) { rec.folder = folder; rec.updatedAt = Date.now(); maps.set(id, rec); Store.put(rec).catch(() => {}); renderLibrary(); }
    toast(folder ? `Mapa no pacote “${folder}”.` : "Mapa fora de pacotes.");
  };
  openDialog({
    title: "Pacote do mapa",
    body: ["Pacotes agrupam mapas na biblioteca e são compartilhados juntos, num único arquivo.", input, dl, ...(folders().length ? [chips] : [])],
    actions: [
      ...(currentFolder ? [{ label: "Tirar do pacote", onClick: () => apply(null) }] : []),
      { label: "Cancelar" },
      { label: "Salvar", primary: true, onClick: () => apply(input.value) }
    ]
  });
  input.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); apply(input.value); closeDialog(); } });
}

/* ---------- Saving ---------- */
function recFor(m) {
  const root = cleanTree(m.root);
  const st = statsOf(root);
  return { id: m.id, title: mapTitle(root), root, updatedAt: m.updatedAt, palette: m.palette || "joias", folder: m.folder || null, stats: { total: st.total, done: st.done } };
}
function setSaveState(t, kind) {
  $("#save-state").textContent = t;
  const d = $("#save-dot"); d.classList.toggle("busy", kind === "busy"); d.classList.toggle("err", kind === "err");
}
function scheduleSave(delay = 500) {
  if (cur.example || !cur.id) return;
  setSaveState("Salvando", "busy");
  clearTimeout(saveTimer);
  saveTimer = setTimeout(queueCurrent, delay);
}
function flushSave() { clearTimeout(saveTimer); if (dirty) queueCurrent(); }
function queueCurrent() {
  if (cur.example || !cur.id) return;
  const r = recFor(cur);
  maps.set(cur.id, r); pending.set(cur.id, r); dirty = false;
  pump();
}
async function pump() {
  if (saving || !Store.ready) return;
  const first = pending.entries().next();
  if (first.done) return;
  const [id, rec] = first.value;
  pending.delete(id);
  saving = { id, rec };
  try {
    await Store.put(rec);
    if (channel) channel.postMessage({ type: "saved", id, updatedAt: rec.updatedAt });
    if (!pending.size && !dirty) setSaveState("Salvo no aparelho");
    if (!persistAsked && navigator.storage && navigator.storage.persist) { persistAsked = true; navigator.storage.persist().catch(() => {}); }
  } catch (err) {
    if (id === cur.id) dirty = true;
    setSaveState("Não salvo", "err");
    toast(err && err.code === "quota" ? "O espaço do aparelho para o app acabou. Exclua mapas antigos." : "Falha ao salvar no aparelho. Vou tentar de novo na próxima alteração.");
  } finally {
    saving = null;
    pump();
  }
}
addEventListener("pagehide", flushSave);
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") flushSave(); });
if (channel) channel.onmessage = async ({ data }) => {
  if (data.type === "deleted") { maps.delete(data.id); if (cur.id === data.id && !dirty) { const n = newestId(); n ? openMap(n) : renderLibrary(); } else renderLibrary(); return; }
  const rec = await Store.get(data.id); if (!rec) return;
  maps.set(rec.id, rec);
  if (cur.id === rec.id && !dirty && !editing && (rec.updatedAt || 0) > (cur.updatedAt || 0)) { loadCurrent(rec); if (!idxHas(sel)) sel = null; resetCanvas(); render({ instant: true }); }
  else renderLibrary();
};
const newestId = () => { const e = [...maps.values()].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))[0]; return e && e.id; };
function idxHas(id) { const w = n => n.id === id || n.children.some(w); return !!id && w(cur.root); }

/* ---------- Packages: share and receive ---------- */
const PKG_EXT = ".mapas.json";
const fileSafe = s => (s || "mapas").replace(/[\\/:*?"<>|\u0000-\u001f]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 80) || "mapas";
function packagePayload(recs, title, folder) {
  return {
    app: "mapa-de-estudos", type: "pacote", version: 3, title, folder: folder || null, createdAt: new Date().toISOString(),
    maps: recs.map(r => ({ id: r.id, title: r.title, root: r.root, palette: r.palette, folder: r.folder || folder || null, updatedAt: r.updatedAt }))
  };
}
async function shareOrSave(name, data, mime, text) {
  const file = new File([data], name, { type: mime });
  if (COARSE && navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], title: name, text }); return "shared"; }
    catch (e) { if (e && e.name === "AbortError") return "cancel"; }
  }
  const url = URL.createObjectURL(file);
  const a = h("a"); a.href = url; a.download = name; a.rel = "noopener"; a.style.display = "none"; document.body.appendChild(a); a.click();
  setTimeout(() => { a.remove(); URL.revokeObjectURL(url); }, 5000);
  toast(`Arquivo “${name}” salvo. Envie-o por WhatsApp ou e-mail.`);
  return "saved";
}
async function sharePackage(recs, title, folder) {
  if (!recs.length) return;
  const payload = packagePayload(recs, title, folder);
  const total = recs.reduce((a, r) => a + ((r.stats && r.stats.total) || 0), 0);
  const text = recs.length === 1 ? `Mapa de estudo “${title}” (${total} tópicos). Abra no app Mapa de Estudos.` : `Pacote “${title}” com ${recs.length} mapas de estudo. Abra no app Mapa de Estudos.`;
  await shareOrSave(fileSafe(title) + PKG_EXT, JSON.stringify(payload), "application/json", text);
}
function shareCurrent() {
  if (cur.example) { cur.example = false; cur.id = "m" + rid() + rid(); cur.updatedAt = Date.now(); dirty = true; render(); }
  flushSave();
  const rec = maps.get(cur.id) || recFor(cur);
  sharePackage([rec], rec.title, null);
}
function shareFolder(folder) {
  flushSave();
  const recs = [...maps.values()].filter(m => m.folder === folder).sort((a, b) => a.title.localeCompare(b.title, "pt-BR"));
  sharePackage(recs, folder, folder);
}

/* Keeps the learner's own marks when a newer version of a map arrives. */
function mergeProgress(incoming, local) {
  const marks = new Map();
  const w = n => { if (n.status) marks.set(n.id, n.status); n.children.forEach(w); };
  w(local);
  const a = n => { if (marks.has(n.id)) n.status = marks.get(n.id); n.children.forEach(a); };
  a(incoming);
  return incoming;
}
function validatePackage(data) {
  const list = Array.isArray(data) ? data : data && (data.maps || (data.root ? [data] : null));
  if (!list || !list.length) throw new Error("O arquivo não contém mapas.");
  return list.map(m => {
    const root = uniqueIds(cleanTree(m.root));
    let r = 0, l = 0;
    root.children.forEach((k, i) => {
      if (k.c == null) k.c = i % NCOL;
      if (!k.side) { const hh = 1 + countAll(k); if (r <= l) { k.side = "R"; r += hh; } else { k.side = "L"; l += hh; } }
      const strip = (n, d) => { if (d > 1) stripTop(n); n.children.forEach(c => strip(c, d + 1)); };
      strip(k, 1);
    });
    return {
      id: typeof m.id === "string" && /^[\w-]{1,60}$/.test(m.id) ? m.id : "r" + root.id,
      root, palette: PALETTES[m.palette] ? m.palette : "joias",
      folder: typeof m.folder === "string" && m.folder.trim() ? m.folder.trim().slice(0, 80) : (data.folder || null),
      updatedAt: Number(m.updatedAt) || Date.now()
    };
  });
}
function previewImport(title, items) {
  const list = h("ul", "pkg-list");
  let news = 0, ups = 0;
  for (const it of items) {
    const ex = maps.get(it.id);
    const li = h("li");
    li.appendChild(h("span", null, mapTitle(it.root)));
    let tag;
    if (!ex) { tag = h("span", "tag new", "novo"); news++; }
    else if ((ex.updatedAt || 0) < it.updatedAt) { tag = h("span", "tag up", "atualização"); ups++; }
    else tag = h("span", "tag", "já na biblioteca");
    li.appendChild(tag); list.appendChild(li);
  }
  const folder = items.find(i => i.folder) && items.find(i => i.folder).folder;
  const notes = [];
  if (folder) notes.push(`Os mapas ficam no pacote “${folder}” da sua biblioteca.`);
  if (ups) notes.push("Nas atualizações, suas marcações de estudo (revisar, estudando, dominado) são mantidas.");
  openDialog({
    title: items.length === 1 ? `Abrir “${mapTitle(items[0].root)}”` : `Pacote “${title}”`,
    body: [list, ...(notes.length ? [notes.join(" ")] : [])],
    actions: [{ label: "Cancelar" }, { label: news || ups ? "Adicionar à biblioteca" : "Abrir", primary: true, onClick: () => applyImport(items) }]
  });
}
async function applyImport(items) {
  if (editing) commitEdit();
  flushSave();
  let news = 0, ups = 0;
  for (const it of items) {
    const ex = maps.get(it.id);
    if (ex && (ex.updatedAt || 0) >= it.updatedAt) continue;
    const root = ex ? mergeProgress(it.root, ex.root) : it.root;
    const rec = recFor({ id: it.id, root, updatedAt: it.updatedAt, palette: it.palette, folder: it.folder || (ex && ex.folder) || null });
    maps.set(rec.id, rec);
    try { await Store.put(rec); } catch (e) { toast("Falha ao guardar o mapa no aparelho."); return; }
    if (channel) channel.postMessage({ type: "saved", id: rec.id, updatedAt: rec.updatedAt });
    ex ? ups++ : news++;
  }
  openMap(items[0].id);
  const parts = [];
  if (news) parts.push(news === 1 ? "1 mapa novo" : `${news} mapas novos`);
  if (ups) parts.push(ups === 1 ? "1 atualizado" : `${ups} atualizados`);
  toast(parts.length ? parts.join(", ") + "." : "Esses mapas já estavam na biblioteca.");
}

/* ---------- Import files ---------- */
$("#btn-import").onclick = () => $("#file").click();
$("#file").addEventListener("change", e => { const files = [...e.target.files]; e.target.value = ""; importFiles(files); });
async function importFiles(files) {
  if (!isDocked()) setPanel("lib", false);
  for (const f of files) {
    try {
      const name = (f.name || "").toLowerCase();
      const head = name.endsWith(".xmind") ? "" : (await f.slice(0, 64).text()).trimStart();
      if (name.endsWith(".json") || f.type === "application/json" || head.startsWith("{") || head.startsWith("[")) {
        const data = JSON.parse(await f.text());
        const items = validatePackage(data);
        previewImport(data.title || f.name.replace(/(\.mapas)?\.json$/i, ""), items);
        return; // one package at a time, so the person can review it
      }
      const roots = await importOther(f);
      roots.forEach(r => newMap(r));
      toast(roots.length === 1 ? "Mapa importado." : `${roots.length} mapas importados.`);
    } catch (err) {
      toast(`Não consegui abrir “${f.name}”. ${err.message || ""}`);
    }
  }
}
async function importOther(f) {
  const name = f.name.toLowerCase();
  if (name.endsWith(".xmind")) {
    if (!window.JSZip) throw new Error("O leitor de arquivos .xmind não carregou.");
    const zip = await JSZip.loadAsync(f);
    const cj = zip.file("content.json");
    if (cj) {
      const sheets = JSON.parse(await cj.async("string"));
      return (Array.isArray(sheets) ? sheets : [sheets]).map(s => fromXmindTopic(s.rootTopic, 0));
    }
    const cx = zip.file("content.xml");
    if (!cx) throw new Error("O arquivo não tem conteúdo de mapa.");
    const doc = new DOMParser().parseFromString(await cx.async("string"), "application/xml");
    return [...doc.getElementsByTagName("sheet")].map(sh => fromXmindXml([...sh.children].find(c => c.localName === "topic"), 0)).filter(Boolean);
  }
  const text = await f.text();
  if (name.endsWith(".opml")) {
    const doc = new DOMParser().parseFromString(text, "application/xml");
    const body = doc.querySelector("body");
    if (!body) throw new Error("OPML inválido.");
    const conv = o => ({ id: rid(), text: o.getAttribute("text") || o.getAttribute("title") || "Tópico", children: [...o.children].filter(c => c.localName === "outline").map(conv), ...(o.getAttribute("_note") ? { note: o.getAttribute("_note") } : {}) });
    const outs = [...body.children].filter(c => c.localName === "outline").map(conv);
    const title = (doc.querySelector("head > title") || {}).textContent || f.name.replace(/\.[^.]+$/, "");
    return [fixImported(outs.length === 1 ? outs[0] : { id: rid(), text: title, children: outs })];
  }
  return [outlineToRoot(text, f.name.replace(/\.[^.]+$/, ""))];
}
function outlineToRoot(text, fallbackTitle) {
  const t = parseOutline(text);
  if (t.text === "\u0000") t.text = fallbackTitle || "Mapa importado";
  if (!t.children.length && !t.text) throw new Error("Arquivo vazio.");
  return fixImported(t);
}
function fromXmindTopic(t, d) {
  const n = { id: rid(), text: (t.title || "").trim() || "Tópico", children: [] };
  n.children = ((t.children && t.children.attached) || []).map(k => fromXmindTopic(k, d + 1));
  const note = t.notes && t.notes.plain && t.notes.plain.content;
  if (note) n.note = note.trim();
  if (t.branch === "folded" && n.children.length) n.collapsed = true;
  const mk = (t.markers || []).map(m => m.markerId || "");
  if (mk.some(m => m === "task-done" || m === "symbol-right")) n.status = "done";
  else if (mk.some(m => /^task-/.test(m))) n.status = "learning";
  else if (mk.some(m => /^(flag-|symbol-exclam|priority-1|symbol-question)/.test(m))) n.status = "review";
  return d === 0 ? fixImported(n) : n;
}
function fromXmindXml(t, d) {
  if (!t) return null;
  const child = (el, name) => [...el.children].find(c => c.localName === name);
  const titleEl = child(t, "title");
  const n = { id: rid(), text: (titleEl ? titleEl.textContent : "").trim() || "Tópico", children: [] };
  const ch = child(t, "children");
  if (ch) [...ch.children].filter(c => c.localName === "topics" && (c.getAttribute("type") || "attached") === "attached")
    .forEach(ts => [...ts.children].filter(c => c.localName === "topic").forEach(k => n.children.push(fromXmindXml(k, d + 1))));
  const notes = child(t, "notes"); const plain = notes && child(notes, "plain");
  if (plain && plain.textContent.trim()) n.note = plain.textContent.trim();
  if (t.getAttribute("branch") === "folded" && n.children.length) n.collapsed = true;
  return d === 0 ? fixImported(n) : n;
}
function fixImported(root) {
  root = cleanTree(root); freshIds(root);
  const walk = (n, d) => { if (d > 1) stripTop(n); n.children.forEach(k => walk(k, d + 1)); };
  walk(root, 0);
  let r = 0, l = 0;
  root.children.forEach((k, i) => {
    if (k.c == null) k.c = i % NCOL;
    if (k.side !== "L" && k.side !== "R") { const hh = 1 + countAll(k); if (r <= l) { k.side = "R"; r += hh; } else { k.side = "L"; l += hh; } }
  });
  return root;
}

/* ---------- Export ---------- */
$("#btn-share").onclick = e => {
  e.stopPropagation();
  if (menuEl) { closeMenu(); return; }
  if (editing) commitEdit();
  const name = fileSafe(mapTitle(cur.root));
  const items = [{ label: "Compartilhar este mapa", sub: "Arquivo para WhatsApp, e-mail ou outro aparelho", onClick: shareCurrent }];
  if (cur.folder && !cur.example) {
    const count = libraryRows().filter(r => r.folder === cur.folder).length;
    items.push({ label: `Compartilhar o pacote “${cur.folder}”`, sub: count === 1 ? "1 mapa num arquivo" : `${count} mapas num único arquivo`, onClick: () => shareFolder(cur.folder) });
  }
  items.push("-",
    { label: "Imagem PNG", sub: "O mapa inteiro em alta resolução", onClick: async () => { if (mode === "list") setMode("map"); const b = await toPng(); shareOrSave(name + ".png", b, "image/png"); } },
    { label: "Markdown (.md)", sub: "Tópicos em lista, com tipos e notas", onClick: () => shareOrSave(name + ".md", toMarkdown(cur.root), "text/markdown") },
    { label: "Copiar como texto", sub: "Lista com recuo", onClick: async () => { try { await navigator.clipboard.writeText(toOutline(cur.root).join("\n")); toast("Mapa copiado como lista."); } catch (err) { toast("A cópia foi bloqueada neste aparelho."); } } },
    "-",
    { label: "Backup da biblioteca", sub: "Todos os mapas num arquivo", onClick: () => { flushSave(); const recs = [...maps.values()]; if (!recs.length) { toast("A biblioteca ainda está vazia."); return; } const p = packagePayload(recs, "Biblioteca completa", null); shareOrSave(`Backup Mapa de Estudos ${new Date().toISOString().slice(0, 10)}${PKG_EXT}`, JSON.stringify(p), "application/json"); } }
  );
  openMenu($("#btn-share"), items);
};
function toMarkdown(root) {
  const out = ["# " + root.text.split("\n").join(" "), ""];
  if (root.note) out.push(root.note.split("\n").map(l => "> " + l).join("\n"), "");
  const mark = { done: "[x] ", learning: "[ ] ", review: "[ ] " };
  const tag = { review: " _(revisar)_", learning: " _(estudando)_", done: "" };
  const w = (n, d) => n.children.forEach(k => {
    const pad = "  ".repeat(d);
    out.push(pad + "- " + (k.status ? mark[k.status] : "") + (k.kind ? `**${KINDS[k.kind]}:** ` : "") + k.text.split("\n").join(" ") + (k.status ? tag[k.status] : ""));
    if (k.note) k.note.split("\n").forEach(l => out.push(pad + "  > " + l));
    w(k, d + 1);
  });
  w(root, 0);
  return out.join("\n") + "\n";
}

/* PNG: redraws the finished layout on a canvas with the live theme colors and the DOM's own line breaks. */
async function toPng() {
  animId++;
  const targets = new Map(); const tw = n => { targets.set(n.id, { x: n._x, y: n._y, a: 1 }); visibleKids(n).forEach(tw); }; tw(cur.root);
  disp = targets; draw(targets);
  const b = cur._bbox, pad = 56, scale = 2;
  const W = Math.ceil(b.maxX - b.minX + pad * 2), H = Math.ceil(b.maxY - b.minY + pad * 2);
  const cv = document.createElement("canvas"); cv.width = W * scale; cv.height = H * scale;
  const ctx = cv.getContext("2d"); ctx.scale(scale, scale);
  const cs = getComputedStyle(document.documentElement);
  ctx.fillStyle = cs.getPropertyValue("--canvas").trim(); ctx.fillRect(0, 0, W, H);
  ctx.translate(pad - b.minX, pad - b.minY);
  for (const p of edgesEl.querySelectorAll("path")) { ctx.fillStyle = getComputedStyle(p).fill; ctx.fill(new Path2D(p.getAttribute("d"))); }
  const rr = (x, y, w, hh, r) => { ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, w, hh, r); else ctx.rect(x, y, w, hh); };
  const drawText = (span, el, x, y, k) => {
    const tn = span.firstChild; if (!tn || tn.nodeType !== 3) return;
    const st = getComputedStyle(span), elR = el.getBoundingClientRect();
    ctx.fillStyle = st.color; ctx.globalAlpha = parseFloat(st.opacity) || 1;
    ctx.font = `${st.fontStyle} ${st.fontWeight} ${st.fontSize} ${st.fontFamily}`;
    if ("letterSpacing" in ctx) ctx.letterSpacing = st.letterSpacing === "normal" ? "0px" : st.letterSpacing;
    const t = st.textTransform === "uppercase" ? tn.textContent.toUpperCase() : tn.textContent;
    let start = 0, top = null, left = 0;
    const flush = end => { const s = t.slice(start, end).replace(/\n$/, ""); if (s) ctx.fillText(s, x + left, y + top); };
    for (let i = 0; i < t.length; i++) {
      const r = document.createRange(); r.setStart(tn, i); r.setEnd(tn, i + 1);
      const rc = r.getClientRects()[0]; if (!rc) continue;
      const tp = (rc.bottom - elR.top) * k - parseFloat(st.fontSize) * .24;
      if (top === null) { top = tp; left = (rc.left - elR.left) * k; }
      else if (Math.abs(tp - top) > 2) { flush(i); start = i; top = tp; left = (rc.left - elR.left) * k; }
    }
    flush(t.length);
    ctx.globalAlpha = 1;
  };
  const walk = n => {
    const el = els.get(n.id); if (!el) return;
    const st = getComputedStyle(el);
    const x = n._x - n._w / 2, y = n._y - n._h / 2, d = idx.depth.get(n.id);
    const rad = parseFloat(st.borderTopLeftRadius) || 0;
    if (d === 0) { ctx.fillStyle = st.backgroundColor; rr(x, y, n._w, n._h, rad); ctx.fill(); ctx.strokeStyle = "rgba(230,192,110,.4)"; ctx.lineWidth = 1; rr(x + .5, y + .5, n._w - 1, n._h - 1, rad); ctx.stroke(); }
    else if (d === 1) {
      const g = ctx.createLinearGradient(x, y, x + n._w, y + n._h);
      g.addColorStop(0, st.getPropertyValue("--ca").trim()); g.addColorStop(1, st.getPropertyValue("--cb").trim());
      ctx.fillStyle = g; rr(x, y, n._w, n._h, rad); ctx.fill();
    } else {
      ctx.fillStyle = st.getPropertyValue("--line").trim(); ctx.fillRect(x, y + n._h - (d === 2 ? 2 : 1.5), n._w, d === 2 ? 2 : 1.5);
    }
    const elR = el.getBoundingClientRect(), k = n._w / elR.width;
    if (!el._eb.hidden) drawText(el._eb, el, x, y, k);
    drawText(el._tx, el, x, y, k);
    if (n.status) {
      const mk = el.querySelector(".mk"); const mr = mk.getBoundingClientRect();
      const col = getComputedStyle(mk).color;
      const cx = x + (mr.left - elR.left + mr.width / 2) * k, cy = y + (mr.top - elR.top + mr.height / 2) * k;
      ctx.strokeStyle = col; ctx.lineWidth = 1.6; ctx.lineCap = "round"; ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.stroke();
      if (n.status === "done") { ctx.beginPath(); ctx.moveTo(cx - 2.8, cy + .2); ctx.lineTo(cx - .8, cy + 2.2); ctx.lineTo(cx + 2.8, cy - 1.8); ctx.stroke(); }
      if (n.status === "learning") { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(cx, cy, 6, -Math.PI / 2, Math.PI / 2); ctx.fill(); }
      if (n.status === "review") { ctx.beginPath(); ctx.moveTo(cx, cy - 3.2); ctx.lineTo(cx, cy + .4); ctx.moveTo(cx, cy + 3); ctx.lineTo(cx, cy + 3.1); ctx.stroke(); }
    }
    visibleKids(n).forEach(walk);
  };
  walk(cur.root);
  return new Promise((res, rej) => cv.toBlob(bl => bl ? res(bl) : rej(new Error("png")), "image/png"));
}

/* ---------- Offline, install, receiving shared files ---------- */
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
function setOffline(state) {
  const dot = $("#off-dot"), txt = $("#off-text");
  dot.classList.toggle("busy", state === "pending"); dot.classList.toggle("err", state === "none");
  txt.textContent = state === "ready" ? "Pronto para usar sem internet. Os mapas ficam guardados neste aparelho."
    : state === "file" ? "Aberto como arquivo. Para usar sem internet, abra pelo endereço do app e instale."
    : state === "none" ? "Este navegador não guarda o app para uso sem internet."
    : "Abra uma vez com internet para usar sem conexão depois.";
}
let updateRequested = false;
function initOffline() {
  if (location.protocol === "file:") { setOffline("file"); return; }
  if (!("serviceWorker" in navigator)) { setOffline("none"); return; }
  setOffline("pending");
  navigator.serviceWorker.register("sw.js").then(reg => {
    navigator.serviceWorker.ready.then(() => setOffline("ready"));
    const onWaiting = w => { $("#update-bar").hidden = false; $("#btn-update").onclick = () => { updateRequested = true; flushSave(); w.postMessage("skip-waiting"); }; };
    if (reg.waiting && navigator.serviceWorker.controller) onWaiting(reg.waiting);
    reg.addEventListener("updatefound", () => {
      const w = reg.installing; if (!w) return;
      w.addEventListener("statechange", () => { if (w.state === "installed" && navigator.serviceWorker.controller) onWaiting(w); });
    });
    setInterval(() => reg.update().catch(() => {}), 60 * 60 * 1000);
  }).catch(() => setOffline("none"));
  navigator.serviceWorker.addEventListener("controllerchange", () => { if (updateRequested) location.reload(); });
}
let installEvt = null;
addEventListener("beforeinstallprompt", e => { e.preventDefault(); installEvt = e; $("#btn-install").hidden = false; });
addEventListener("appinstalled", () => { installEvt = null; $("#btn-install").hidden = true; toast("App instalado. Ele abre direto da tela inicial, mesmo sem internet."); });
if (isIOS && !standalone) $("#btn-install").hidden = false;
$("#btn-install").onclick = async () => {
  if (installEvt) { installEvt.prompt(); try { await installEvt.userChoice; } catch (e) {} installEvt = null; $("#btn-install").hidden = true; return; }
  const steps = h("ol", "steps");
  [["Toque em ", "Compartilhar", " (o quadrado com a seta para cima) na barra do Safari."], ["Escolha ", "Adicionar à Tela de Início", "."], ["Toque em ", "Adicionar", ". O ícone Mapas aparece na tela inicial e abre mesmo sem internet."]]
    .forEach(([a, b, c]) => { const li = h("li"); li.append(a, h("b", null, b), c); steps.appendChild(li); });
  openDialog({ title: "Instalar no iPhone ou iPad", body: ["Abra este endereço no Safari e siga os passos:", steps], actions: [{ label: "Entendi", primary: true }] });
};
$("#btn-help").onclick = () => {
  const mk = (items) => { const ol = h("ol", "steps"); items.forEach(parts => { const li = h("li"); parts.forEach((p, i) => li.append(i % 2 ? h("b", null, p) : p)); ol.appendChild(li); }); return ol; };
  const sec = (t) => { const e = h("div", "eyebrow", t); e.style.marginTop = "4px"; return e; };
  openDialog({
    title: "Compartilhar pacotes de mapas",
    body: [
      "Um pacote é um arquivo terminado em .mapas.json com um ou vários mapas. Ele vai por WhatsApp, e-mail ou qualquer app de arquivos.",
      sec("Enviar"),
      mk([["No menu ", "⋯", " de um mapa, escolha ", "Colocar num pacote", "."], ["Na biblioteca, toque no ícone de compartilhar ao lado do nome do pacote."], ["Escolha ", "WhatsApp", " ou ", "e-mail", ". No computador, o arquivo é salvo para você anexar."]]),
      sec("Abrir no iPhone ou iPad"),
      mk([["Toque no arquivo recebido e use ", "Compartilhar → Salvar em Arquivos", "."], ["No app, abra a ", "Biblioteca", " e toque em ", "Abrir", "."], ["Escolha o arquivo. Os mapas entram na biblioteca e funcionam sem internet."]]),
      sec("Abrir no Android"),
      mk([["Com o app instalado, toque e segure o arquivo no WhatsApp e use ", "Compartilhar → Mapa de Estudos", "."], ["Ou baixe o arquivo e use ", "Abrir", " na biblioteca."]]),
      "Quando você envia uma versão nova de um pacote, quem abrir de novo recebe as mudanças e mantém as próprias marcações de estudo."
    ],
    actions: [{ label: "Fechar", primary: true }]
  });
};
async function receiveShared() {
  const params = new URLSearchParams(location.search);
  if (!params.has("shared")) return;
  history.replaceState(null, "", location.pathname);
  try {
    const cache = await caches.open("mapa-estudos-inbox");
    const keys = await cache.keys();
    const files = []; let text = "";
    for (const k of keys) {
      const res = await cache.match(k);
      if (k.url.endsWith("/inbox/text")) text = await res.text();
      else files.push(new File([await res.blob()], decodeURIComponent(res.headers.get("X-Filename") || "arquivo"), { type: res.headers.get("Content-Type") || "" }));
      await cache.delete(k);
    }
    if (files.length) importFiles(files);
    else if (text.trim()) { newMap(outlineToRoot(text, "Mapa recebido")); toast("Texto recebido virou um mapa novo."); }
  } catch (e) { toast("Não consegui ler o arquivo compartilhado."); }
}
if ("launchQueue" in window) launchQueue.setConsumer(async p => {
  if (!p.files || !p.files.length) return;
  const files = await Promise.all(p.files.map(f => f.getFile()));
  importFiles(files);
});

/* ---------- Boot ---------- */
async function boot() {
  buildChips();
  if (isDocked()) {
    try {
      const p = JSON.parse(localStorage.getItem("mapa-estudos:panels") || "null");
      if (p) { app.classList.toggle("lib-open", !!p.lib); app.classList.toggle("insp-open", !!p.insp); }
      else if (innerWidth < 1240) app.classList.remove("lib-open");
    } catch (e) {}
  } else app.classList.remove("lib-open", "insp-open");
  setPanel("lib", app.classList.contains("lib-open"));
  setPanel("insp", app.classList.contains("insp-open"));
  let m = null; try { m = localStorage.getItem("mapa-estudos:mode"); } catch (e) {}
  if (m === "list") setMode("list");
  render({ instant: true });
  initialView();
  initOffline();
  await Store.open();
  try { (await Store.all()).forEach(r => { if (r && r.id && r.root) maps.set(r.id, r); }); } catch (e) { toast("Não consegui ler a biblioteca deste aparelho."); }
  Store.ready = true;
  let last = null; try { last = localStorage.getItem("mapa-estudos:last"); } catch (e) {}
  if (cur.example && maps.size) openMap(maps.has(last) ? last : newestId());
  else { flushSave(); pump(); renderLibrary(); }
  if (document.fonts) document.fonts.ready.then(() => { if (mode === "map") { render({ instant: true }); } });
  receiveShared();
}
let lastW = innerWidth;
addEventListener("resize", () => {
  const was = lastW; lastW = innerWidth;
  const crossed = (a, b, bp) => (a <= bp) !== (b <= bp);
  if (crossed(was, innerWidth, 1100) || crossed(was, innerWidth, 640)) {
    if (!isDocked()) app.classList.remove("lib-open");
    if (isPhone()) app.classList.remove("insp-open");
    setPanel("lib", app.classList.contains("lib-open"));
  }
});
boot();
})();
