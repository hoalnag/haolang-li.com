/* ==========================================================================
   haolang-li.com — Finder engine
   Selection, navigation, menus, Quick Look, Get Info, window management.
   ========================================================================== */
(function () {
"use strict";

/* ================= file system ================= */
/* `at` is the modified date (ISO). Recently Updated derives itself from these,
   so adding an entry with a newer date is all it takes to surface it. */
const BASE = "2026-07-01T12:00";
const folder = (name, at = BASE, children = []) =>
  ({ name, kind: "Folder", icon: "i-folder-mac", at, size: "--", children });
const pdf = (name, at, href) =>
  ({ name, kind: "PDF document", icon: "i-pdf-mac", at, size: "--", href });
const mov = (name, at, href) =>
  ({ name, kind: "QuickTime movie", icon: "i-mov-mac", at, size: "--", href });
const webloc = (name, at, href) =>
  ({ name: name + ".webloc", kind: "Web site location", icon: "i-webloc", at, size: "1 KB", href, external: true });

const ROOT = folder("Desktop", "2026-07-18T09:00", [
  folder("AI", "2026-07-14T16:20", [
    folder("AVA Studio", "2026-07-14T16:20"),
    folder("Test Footage", "2026-07-09T21:05"),
  ]),
  folder("FILM", "2026-07-16T11:40", [
    folder("Short Films", "2026-07-16T11:40"),
    folder("Cinematography", "2026-07-02T18:15"),
    folder("Festival & Sales", "2026-06-28T10:30"),
    folder("Poster Design", "2026-06-20T14:00"),
  ]),
  folder("WRITINGS", "2026-07-17T23:10", [
    folder("Self Talk", "2026-07-17T23:10"),
    folder("Poems", "2026-07-11T08:45"),
  ]),
  folder("READINGS", "2026-07-05T19:30", [
    folder("Reading Notes", "2026-07-05T19:30"),
    folder("Papers", "2026-06-30T13:20"),
  ]),
  folder("FLAT THINGS", "2026-06-25T15:00", [
    folder("Digital", "2026-06-25T15:00"),
    folder("Celluloid", "2026-06-22T12:10"),
    folder("Randomness", "2026-06-18T17:40"),
    folder("Mappings", "2026-06-12T09:25"),
  ]),
  pdf("Self_Intro.pdf", "2026-07-10T14:05", "assets/files/Self_Intro.pdf"),
  pdf("CV-2026-7.pdf", "2026-07-18T09:00", "assets/files/CV-2026-7.pdf"),
  mov("Filmmaker's Reel.mov", "2026-07-15T20:35", "assets/files/Filmmakers_Reel.mov"),
]);

// parent pointers + paths
(function link(node, parent) {
  node.parent = parent;
  (node.children || []).forEach(c => link(c, node));
})(ROOT, null);

const LINKS = [
  { id: "vimeo", name: "Vimeo", icon: "s-vimeo", href: "https://vimeo.com/YOUR_VIMEO",
    desc: "Films and video work — shorts, cinematography, AI experiments." },
  { id: "instagram", name: "Instagram", icon: "s-ig", href: "https://instagram.com/YOUR_IG",
    desc: "Stills, behind-the-scenes, and everything in between." },
  { id: "spotify", name: "Spotify", icon: "s-spotify", href: "https://open.spotify.com/user/YOUR_SPOTIFY",
    desc: "What I listen to while cutting." },
  { id: "discord", name: "Discord", icon: "s-discord", href: "https://discord.com/users/YOUR_DISCORD",
    desc: "Reach me where the AI video people hang out." },
  { id: "email", name: "Email", icon: "s-mail", href: "mailto:you@haolang-li.com",
    desc: "For collaborations, screenings, and everything serious." },
  { id: "arena", name: "Are.na", icon: "s-arena", href: "https://www.are.na/YOUR_ARENA",
    desc: "Research boards — references, moods, maps." },
];

const TAG_COLORS = ["#FF9F0A", "#FF453A", "#0A84FF", "#FFD60A", "#BF5AF2", "#FF9F0A", "#FF453A"];

/* ================= state ================= */
let cwd = ROOT;                 // current folder
let history = [], future = [];  // navigation stacks
let view = "icon";              // 'icon' | 'list'
let selection = new Set();      // of nodes
let anchorIndex = -1;           // for shift-select
let sortAsc = true;

const $ = id => document.getElementById(id);

/* ================= motion: springs, projection, rubber-band =================
   Apple-style fluid motion (see: Designing Fluid Interfaces, WWDC18).
   Springs are interruptible and velocity-aware; re-targeting carries velocity. */
const REDUCED = matchMedia("(prefers-reduced-motion: reduce)");
const FINE_POINTER = matchMedia("(pointer: fine)");

const springStates = new WeakMap(); // el -> { props: {x:{val,vel,target}...}, raf, onDone }
function springApply(el, p) {
  const s = (p.sx || p.sy)
    ? `scale(${p.sx ? p.sx.val : 1}, ${p.sy ? p.sy.val : 1})`   // FLIP resizes stretch like a real surface
    : `scale(${p.scale ? p.scale.val : 1})`;
  el.style.transform = `translate3d(${p.x?.val || 0}px, ${p.y?.val || 0}px, 0) ${s}`;
  if (p.opacity) el.style.opacity = p.opacity.val;
}
const UNIT_PROPS = new Set(["scale", "opacity", "sx", "sy"]); // dimensionless props default to 1
function springTo(el, targets, { damping = 1, response = 0.35, velocity = {}, onDone } = {}) {
  let st = springStates.get(el);
  if (!st) { st = { props: {}, raf: 0 }; springStates.set(el, st); }
  st.onDone = onDone;
  for (const k in targets) {
    const cur = st.props[k] || { val: UNIT_PROPS.has(k) ? 1 : 0, vel: 0 };
    cur.target = targets[k];
    if (velocity[k] !== undefined) cur.vel = velocity[k];
    st.props[k] = cur;
  }
  if (REDUCED.matches) { // gentler equivalent: settle instantly, no travel
    for (const k in st.props) { st.props[k].val = st.props[k].target; st.props[k].vel = 0; }
    springApply(el, st.props);
    st.onDone && st.onDone();
    return;
  }
  if (st.raf) return; // loop already running; targets just changed (interruption = re-target)
  const stiffness = Math.pow((2 * Math.PI) / response, 2);
  const dampCoef = damping * 2 * Math.sqrt(stiffness);
  let last = performance.now();
  const tick = (now) => {
    // advance in real time even if rAF is throttled; small substeps keep integration stable
    let remaining = Math.min((now - last) / 1000, 0.25); last = now;
    while (remaining > 0) {
      const h = Math.min(remaining, 1 / 120); remaining -= h;
      for (const k in st.props) {
        const p = st.props[k];
        const accel = stiffness * (p.target - p.val) - dampCoef * p.vel;
        p.vel += accel * h;
        p.val += p.vel * h;
      }
    }
    let settled = true;
    for (const k in st.props) {
      const p = st.props[k];
      const eps = UNIT_PROPS.has(k) ? 0.002 : 0.05; // unit-aware tolerance
      if (Math.abs(p.vel) > eps * 4 || Math.abs(p.target - p.val) > eps) settled = false;
    }
    if (settled) {
      for (const k in st.props) { st.props[k].val = st.props[k].target; st.props[k].vel = 0; }
      springApply(el, st.props);
      st.raf = 0;
      st.onDone && st.onDone();
      return;
    }
    springApply(el, st.props);
    st.raf = requestAnimationFrame(tick);
  };
  st.raf = requestAnimationFrame(tick);
}
/* momentum projection — where the flick is going, not where it stopped */
function project(v, deceleration = 0.998) { return (v / 1000) * deceleration / (1 - deceleration); }
/* progressive resistance at a boundary */
function rubberband(overshoot, dimension = 300, c = 0.55) {
  return (overshoot * dimension * c) / (dimension + c * Math.abs(overshoot));
}
/* write the live (presentation) value directly — 1:1 tracking during a gesture;
   a later springTo starts from exactly here, so hand-off has no seam */
function setPresentation(el, vals) {
  let st = springStates.get(el);
  if (!st) { st = { props: {}, raf: 0 }; springStates.set(el, st); }
  for (const k in vals) {
    const p = st.props[k] || { val: 0, vel: 0, target: vals[k] };
    p.val = vals[k]; p.target = vals[k];
    st.props[k] = p;
  }
  springApply(el, st.props);
}
/* pointer velocity from a short move history */
function makeVelocityTracker() {
  let hist = [];
  return {
    push(x, y) { const t = performance.now(); hist.push({ x, y, t }); hist = hist.filter(h => t - h.t < 90); },
    read() {
      if (hist.length < 2) return { vx: 0, vy: 0 };
      const a = hist[0], b = hist[hist.length - 1], dt = (b.t - a.t) / 1000;
      return dt > 0 ? { vx: (b.x - a.x) / dt, vy: (b.y - a.y) / dt } : { vx: 0, vy: 0 };
    },
  };
}
const els = {
  win: $("window"), sideNav: $("side-nav"), title: $("tb-title"),
  back: $("tb-back"), fwd: $("tb-fwd"), content: $("content"),
  iconView: $("icon-view"), listView: $("list-view"), deskView: $("desk-view"),
  columnsView: $("columns-view"), galleryView: $("gallery-view"),
  pathbar: $("pathbar"), status: $("status-text"), rubber: $("rubber-band"),
  menuLayer: $("menu-layer"), overlayLayer: $("overlay-layer"),
  sidebar: $("sidebar"), desktop: $("desktop"),
};

const findByName = (name) => {
  let hit = null;
  (function walk(n) { if (hit) return; if (n.name === name && n.children) hit = n; (n.children || []).forEach(walk); })(ROOT);
  return hit;
};
const items = () => {
  const list = (cwd.children || []).slice();
  if (view === "list") list.sort((a, b) => sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
  return list;
};
const pathOf = (node) => { const p = []; for (let n = node; n; n = n.parent) p.unshift(n); return p; };

/* ---- dates ---- */
const DATE_FMT = new Intl.DateTimeFormat("en-US", {
  month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
});
const dateOf = (n) => n.at ? DATE_FMT.format(new Date(n.at)).replace(",", "").replace(/(\d{4}) /, "$1 at ") : "—";
function since(at) {
  const mins = Math.round((Date.now() - new Date(at)) / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.round(hrs / 24);
  if (days < 31) return `${days}d`;
  return `${Math.round(days / 30)}mo`;
}
/* Recently Updated builds itself from the tree: newest `at` first. Top-level
   folders are skipped — they already sit as blocks right above the list. */
function recentUpdates(limit = 5) {
  const found = [];
  (function walk(node, depth) {
    (node.children || []).forEach(child => {
      if (!(depth === 0 && child.children)) found.push(child);
      walk(child, depth + 1);
    });
  })(ROOT, 0);
  return found.filter(n => n.at).sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, limit);
}

/* ================= sidebar ================= */
function buildSidebar() {
  const sec = (label) => `<div class="side-sec">${label}</div>`;
  const item = (name, icon, attrs = "") =>
    `<button class="side-item" data-target="${name}" ${attrs}><svg viewBox="0 0 20 20"><use href="#${icon}"/></svg><span>${name}</span></button>`;
  let h = "";
  h += sec("Favorites");
  h += item("Desktop", "s-desktop");
  h += sec("AI") + item("AVA Studio", "s-folder") + item("Test Footage", "s-folder");
  h += sec("Film") + item("Short Films", "s-folder") + item("Cinematography", "s-folder")
     + item("Festival & Sales", "s-folder") + item("Poster Design", "s-folder");
  h += sec("Writings") + item("Self Talk", "s-folder") + item("Poems", "s-folder");
  h += sec("Readings") + item("Reading Notes", "s-folder") + item("Papers", "s-folder");
  h += sec("Flat Things") + item("Digital", "s-folder") + item("Celluloid", "s-folder")
     + item("Randomness", "s-folder", 'data-parent="FLAT THINGS"') + item("Mappings", "s-folder");
  h += sec("Links");
  LINKS.forEach(l => {
    h += `<button class="side-item side-link" data-app="${l.id}"><svg viewBox="0 0 20 20"><use href="#${l.icon}"/></svg><span>${l.name}</span></button>`;
  });
  els.sideNav.innerHTML = h;

  els.sideNav.addEventListener("click", e => {
    const btn = e.target.closest(".side-item");
    if (!btn) return;
    if (btn.dataset.app) { openApp(btn.dataset.app); return; }
    let node;
    if (btn.dataset.parent) node = (findByName(btn.dataset.parent).children || []).find(c => c.name === btn.dataset.target);
    else node = findByName(btn.dataset.target);
    if (node) navigate(node);
  });
}
function syncSidebar() {
  els.sideNav.querySelectorAll(".side-item").forEach(b => {
    const match = !b.dataset.href && b.dataset.target === cwd.name &&
      (!b.dataset.parent || (cwd.parent && cwd.parent.name === b.dataset.parent));
    b.classList.toggle("active", match);
  });
}

/* ================= navigation ================= */
function navigate(node, { record = true } = {}) {
  if (node === cwd) return;
  if (record) { history.push(cwd); future = []; }
  cwd = node;
  selection.clear(); anchorIndex = -1;
  render();
}
function goBack() { if (history.length) { future.push(cwd); cwd = history.pop(); selection.clear(); render(); } }
function goForward() { if (future.length) { history.push(cwd); cwd = future.pop(); selection.clear(); render(); } }
function goUp() { if (cwd.parent) navigate(cwd.parent); }

/* ================= rendering ================= */
const ICON_BOX = { "i-folder-mac": "0 0 128 128", "i-doc-mac": "0 0 116 128", "i-pdf-mac": "0 0 116 128", "i-mov-mac": "0 0 116 128", "i-webloc": "0 0 120 150" };
function iconSvg(node, cls = "file-icon") {
  return `<svg class="${cls}" viewBox="${ICON_BOX[node.icon] || "0 0 120 150"}"><use href="#${node.icon}"/></svg>`;
}
function render() {
  const list = items();
  els.title.textContent = cwd.name;
  document.title = cwd === ROOT ? "Haolang Li" : `${cwd.name} — Haolang Li`;
  els.back.disabled = !history.length;
  els.fwd.disabled = !future.length;

  // the Desktop has its own arrangement; every other folder uses the plain grid
  const onDesk = view === "icon" && cwd === ROOT;
  stopPortrait();
  els.deskView.hidden = !onDesk;
  els.iconView.hidden = view !== "icon" || onDesk;
  els.listView.hidden = view !== "list";
  els.columnsView.hidden = view !== "columns";
  els.galleryView.hidden = view !== "gallery";

  if (onDesk) {
    renderDesk(list);
  } else if (view === "icon") {
    els.iconView.innerHTML = list.map((n, i) => `
      <div class="icon-item ${selection.has(n) ? "selected" : ""}" data-i="${i}">
        <div class="ic-frame">${iconSvg(n)}</div>
        <div class="ic-label">${n.name}</div>
      </div>`).join("");
  } else if (view === "columns") {
    renderColumns(list);
  } else if (view === "gallery") {
    renderGallery(list);
  } else {
    els.listView.innerHTML = `
      <div class="lv-head">
        <div class="lv-col c-name" id="lv-sort">Name <span class="sort-arrow">${sortAsc ? "▲" : "▼"}</span></div>
        <div class="lv-col c-date">Date Modified</div>
        <div class="lv-col c-size">Size</div>
        <div class="lv-col c-kind">Kind</div>
      </div>
      ${list.map((n, i) => `
      <div class="lv-row ${selection.has(n) ? "selected" : ""}" data-i="${i}">
        <div class="lv-cell c-name">${iconSvg(n, "")}<span>${n.name}</span></div>
        <div class="lv-cell c-date lv-dim">${dateOf(n)}</div>
        <div class="lv-cell c-size lv-dim">${n.size}</div>
        <div class="lv-cell c-kind lv-dim">${n.kind}</div>
      </div>`).join("")}`;
    const sortBtn = $("lv-sort");
    if (sortBtn) sortBtn.onclick = () => { sortAsc = !sortAsc; render(); };
  }

  // path bar
  els.pathbar.innerHTML = pathOf(cwd).map((n, i, arr) => `
    ${i ? '<span class="pb-sep">›</span>' : ""}
    <span class="pb-item" data-depth="${i}">
      <svg viewBox="0 0 128 128"><use href="#i-folder-mac"/></svg>${n.name}
    </span>`).join("");
  els.pathbar.querySelectorAll(".pb-item").forEach(el => {
    el.addEventListener("dblclick", () => navigate(pathOf(cwd)[+el.dataset.depth]));
    el.addEventListener("click", () => navigate(pathOf(cwd)[+el.dataset.depth]));
  });

  updateStatus();
  syncSidebar();
}
/* ---- the desk: portrait, weather, papers, and the folders as blocks ---- */
const CITIES = [
  { name: "New York", lat: 40.7128, lon: -74.006, tz: "America/New_York" },
  { name: "Beijing",  lat: 39.9042, lon: 116.4074, tz: "Asia/Shanghai" },
];
const PORTRAITS = [1, 2, 3, 4, 5, 6].map(i => `assets/photos/portrait-0${i}.jpg`);

function renderDesk(list) {
  const folders = list.filter(n => n.children);
  const papers = list.filter(n => !n.children);
  els.deskView.innerHTML = `
    <section class="desk-aside">
      <div class="wx" id="wx">
        ${CITIES.map(c => `
          <div class="wx-row" data-city="${c.name}">
            <span class="wx-city">${c.name}</span>
            <span class="wx-time" data-tz="${c.tz}">—</span>
            <span class="wx-temp">—</span>
          </div>`).join("")}
      </div>
      <ul class="desk-files">
        ${papers.map(n => `
          <li class="desk-item desk-file" data-i="${list.indexOf(n)}">
            ${iconSvg(n, "")}
            <span class="df-name">${n.name.replace(/\.[^.]+$/, "").replace(/_/g, " ")}</span>
            <span class="df-kind">${(n.name.split(".").pop() || "").toUpperCase()}</span>
          </li>`).join("")}
      </ul>
    </section>

    <figure class="portrait">
      <div class="pt-frame" id="pt-frame"><span class="pt-mono">HL</span></div>
      <figcaption class="pt-cap"><span>Haolang Li</span><span class="pt-dots" id="pt-dots"></span></figcaption>
    </figure>

    <section class="desk-folders">
      ${folders.map(n => `
        <button class="desk-item desk-block" data-i="${list.indexOf(n)}">
          <span class="db-count">${n.children.length || ""}</span>
          <span class="db-name">${n.name}</span>
        </button>`).join("")}
    </section>

    <section class="desk-recent">
      <h2 class="dr-head">Recently Updated</h2>
      <ul class="dr-list">
        ${recentUpdates().map(n => `
          <li class="dr-row" data-path="${pathOf(n).map(p => p.name).join("/")}">
            ${iconSvg(n, "")}
            <span class="dr-name">${n.name.replace(/\.[^.]+$/, "").replace(/_/g, " ")}</span>
            <span class="dr-where">${n.parent && n.parent !== ROOT ? n.parent.name : "Desktop"}</span>
            <span class="dr-when">${since(n.at)}</span>
          </li>`).join("")}
      </ul>
    </section>`;

  els.deskView.querySelectorAll(".dr-row").forEach(row => {
    row.addEventListener("click", () => {
      const names = row.dataset.path.split("/").slice(1);
      let node = ROOT;
      for (const nm of names) node = (node.children || []).find(c => c.name === nm) || node;
      node.children ? navigate(node) : openNode(node);
    });
  });

  startPortrait();
  tickCityClocks();
  loadWeather();
}

/* portrait: keep only the frames that actually load, then cross-fade them */
let ptTimer = 0, clockTimer = 0;
function stopPortrait() { clearInterval(ptTimer); ptTimer = 0; clearInterval(clockTimer); clockTimer = 0; }
function startPortrait() {
  const frame = $("pt-frame"), dots = $("pt-dots");
  if (!frame) return;
  const found = new Array(PORTRAITS.length);
  let pending = PORTRAITS.length;
  const settle = () => {
    if (--pending) return;
    const srcs = found.filter(Boolean);
    if (!srcs.length) { frame.classList.add("empty"); return; }   // monogram stands in
    frame.classList.remove("empty");
    frame.innerHTML = srcs.map((s, i) => `<img src="${s}" alt="" class="${i ? "" : "on"}">`).join("");
    if (dots && srcs.length > 1) dots.innerHTML = srcs.map((_, i) => `<i class="${i ? "" : "on"}"></i>`).join("");
    if (srcs.length < 2 || REDUCED.matches) return;
    let i = 0;
    ptTimer = setInterval(() => {
      const imgs = frame.querySelectorAll("img"), pips = dots ? dots.querySelectorAll("i") : [];
      imgs[i].classList.remove("on"); pips[i] && pips[i].classList.remove("on");
      i = (i + 1) % imgs.length;
      imgs[i].classList.add("on"); pips[i] && pips[i].classList.add("on");
    }, 4600);
  };
  PORTRAITS.forEach((src, idx) => {
    const im = new Image();
    im.onload = () => { found[idx] = src; settle(); };
    im.onerror = settle;
    im.src = src;
  });
}

function tickCityClocks() {
  const paint = () => {
    document.querySelectorAll(".wx-time[data-tz]").forEach(el => {
      el.textContent = new Intl.DateTimeFormat("en-US", {
        hour: "numeric", minute: "2-digit", timeZone: el.dataset.tz,
      }).format(new Date());
    });
  };
  paint();
  clockTimer = setInterval(paint, 30000);
}

/* live temperature from Open-Meteo (public, no key); falls back quietly */
async function loadWeather() {
  await Promise.all(CITIES.map(async c => {
    const cell = document.querySelector(`.wx-row[data-city="${c.name}"] .wx-temp`);
    if (!cell) return;
    try {
      const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lon}&current=temperature_2m`);
      if (!r.ok) throw new Error(r.status);
      const j = await r.json();
      const t = j?.current?.temperature_2m;
      cell.textContent = Number.isFinite(t) ? `${Math.round(t)}°` : "—";
    } catch { cell.textContent = "—"; }
  }));
}

/* ---- columns: every level of the path stays on screen, left to right ---- */
function renderColumns(list) {
  const chain = pathOf(cwd);                    // root … cwd
  const sel = selection.size === 1 ? [...selection][0] : null;
  const cols = chain.map((node, depth) => {
    const next = chain[depth + 1];
    const kids = node.children || [];
    const rows = kids.length ? kids.map(c => {
      const onPath = c === next;
      const isSel = depth === chain.length - 1 && selection.has(c);
      return `<div class="col-row ${onPath ? "on-path" : ""} ${isSel ? "selected" : ""}"
                   data-depth="${depth}" data-name="${c.name}"
                   ${depth === chain.length - 1 ? `data-i="${list.indexOf(c)}"` : ""}>
                ${iconSvg(c, "")}<span>${c.name}</span>${c.children ? '<span class="chev">›</span>' : ""}
              </div>`;
    }).join("") : `<div class="col-empty">Empty folder</div>`;
    return `<div class="col" data-depth="${depth}">${rows}</div>`;
  });
  // a file selected in the last column gets a preview column of its own
  if (sel && !sel.children) {
    cols.push(`<div class="col-preview">${iconSvg(sel, "")}
      <div class="cp-name">${sel.name}</div>
      <div class="cp-meta">${sel.kind}${sel.size !== "--" ? ` — ${sel.size}` : ""}</div></div>`);
  } else if (sel && sel.children) {
    const kids = sel.children;
    cols.push(`<div class="col">${kids.length
      ? kids.map(c => `<div class="col-row">${iconSvg(c, "")}<span>${c.name}</span>${c.children ? '<span class="chev">›</span>' : ""}</div>`).join("")
      : '<div class="col-empty">Empty folder</div>'}</div>`);
  }
  els.columnsView.innerHTML = cols.join("");

  els.columnsView.querySelectorAll(".col-row[data-name]").forEach(row => {
    row.addEventListener("click", () => {
      const depth = +row.dataset.depth;
      const node = (chain[depth].children || []).find(c => c.name === row.dataset.name);
      if (!node) return;
      if (depth < chain.length - 1) { navigate(node.children ? node : chain[depth]); return; }
      selectOnly(node, list.indexOf(node));
      renderColumns(items());
    });
    row.addEventListener("dblclick", () => {
      const depth = +row.dataset.depth;
      const node = (chain[depth].children || []).find(c => c.name === row.dataset.name);
      node && openNode(node);
    });
  });
  els.columnsView.scrollLeft = els.columnsView.scrollWidth;
}

/* ---- gallery: one subject large, the rest as a filmstrip ---- */
function renderGallery(list) {
  const star = selection.size ? [...selection][0] : list[0];
  els.galleryView.innerHTML = star ? `
    <div class="gal-stage">
      ${iconSvg(star, "")}
      <div class="gal-name">${star.name}</div>
      <div class="gal-meta">${star.kind}${star.children ? ` — ${star.children.length} item${star.children.length === 1 ? "" : "s"}` : ""} · ${dateOf(star)}</div>
    </div>
    <div class="gal-strip">
      ${list.map((n, i) => `
        <div class="gal-thumb ${n === star ? "selected" : ""}" data-i="${i}">
          ${iconSvg(n, "")}<span>${n.name}</span>
        </div>`).join("")}
    </div>` : `<div class="gal-stage"><div class="gal-meta">Empty folder</div></div>`;

  els.galleryView.querySelectorAll(".gal-thumb").forEach(t => {
    t.addEventListener("click", () => { selectOnly(list[+t.dataset.i], +t.dataset.i); renderGallery(list); });
    t.addEventListener("dblclick", () => openNode(list[+t.dataset.i]));
  });
  const on = els.galleryView.querySelector(".gal-thumb.selected");
  on && on.scrollIntoView({ block: "nearest", inline: "nearest" });
}

function updateStatus() {
  const n = items().length;
  const sel = selection.size;
  els.status.textContent = sel ? `${sel} of ${n} selected` : `${n} item${n === 1 ? "" : "s"}`;
}

/* ================= selection ================= */
const ITEM_SEL = { icon: ".icon-item, .desk-item", list: ".lv-row", columns: ".col-row[data-i]", gallery: ".gal-thumb" };
function elementsForItems() {
  return [...els.content.querySelectorAll(ITEM_SEL[view])]
    .filter(el => el.dataset.i !== undefined && +el.dataset.i >= 0);
}
function applySelectionClasses() {
  const list = items();
  elementsForItems().forEach(el => {
    el.classList.toggle("selected", selection.has(list[+el.dataset.i]));
  });
  updateStatus();
}
function selectOnly(node, idx) { selection.clear(); if (node) selection.add(node); anchorIndex = idx; applySelectionClasses(); }

function handleItemMousedown(e) {
  const el = e.target.closest(ITEM_SEL[view]);
  if (!el || el.dataset.i === undefined) return false;
  const list = items();
  const idx = +el.dataset.i, node = list[idx];
  if (!node) return false;
  if (e.metaKey || e.ctrlKey) {
    selection.has(node) ? selection.delete(node) : selection.add(node);
    anchorIndex = idx;
  } else if (e.shiftKey && anchorIndex >= 0) {
    selection.clear();
    const [a, b] = [Math.min(anchorIndex, idx), Math.max(anchorIndex, idx)];
    for (let i = a; i <= b; i++) selection.add(list[i]);
  } else if (!selection.has(node)) {
    selection.clear(); selection.add(node); anchorIndex = idx;
  }
  applySelectionClasses();
  return true;
}

function openNode(node) {
  if (!node) return;
  if (node.children) navigate(node);
  else if (node.external) window.open(node.href, "_blank", "noopener");
  else if (node.href) window.open(node.href, "_blank", "noopener");
}

/* content clicks */
els.content.addEventListener("mousedown", e => {
  if (e.button === 2) { // right click: select target under cursor
    const el = e.target.closest(ITEM_SEL[view]);
    if (el && el.dataset.i !== undefined) {
      const node = items()[+el.dataset.i];
      if (node && !selection.has(node)) selectOnly(node, +el.dataset.i);
    }
    return;
  }
  if (e.target.closest(".lv-head")) return;
  // columns and gallery wire their own clicks; only icon/list drag-select
  if (view === "columns" || view === "gallery") { els.content.focus(); return; }
  const hit = handleItemMousedown(e);
  if (!hit) startRubberBand(e);
  els.content.focus();
});
els.content.addEventListener("dblclick", e => {
  if (view === "columns" || view === "gallery") return;
  const el = e.target.closest(ITEM_SEL[view]);
  if (el && el.dataset.i !== undefined) openNode(items()[+el.dataset.i]);
});

/* rubber band */
function startRubberBand(e) {
  if (e.button !== 0) return;
  const rect = els.content.getBoundingClientRect();
  const ox = e.clientX - rect.left + els.content.scrollLeft;
  const oy = e.clientY - rect.top + els.content.scrollTop;
  if (!e.metaKey && !e.shiftKey) { selection.clear(); applySelectionClasses(); }
  const band = els.rubber;
  let moved = false;

  const onMove = (ev) => {
    const x = ev.clientX - rect.left + els.content.scrollLeft;
    const y = ev.clientY - rect.top + els.content.scrollTop;
    if (!moved && Math.hypot(x - ox, y - oy) < 4) return;
    moved = true; band.hidden = false;
    const L = Math.min(ox, x), T = Math.min(oy, y), W = Math.abs(x - ox), H = Math.abs(y - oy);
    Object.assign(band.style, { left: L + "px", top: T + "px", width: W + "px", height: H + "px" });
    const bandRect = { left: L, top: T, right: L + W, bottom: T + H };
    const list = items();
    elementsForItems().forEach(el => {
      const r = el.getBoundingClientRect();
      const er = {
        left: r.left - rect.left + els.content.scrollLeft, top: r.top - rect.top + els.content.scrollTop,
        right: r.right - rect.left + els.content.scrollLeft, bottom: r.bottom - rect.top + els.content.scrollTop,
      };
      const inside = !(er.right < bandRect.left || er.left > bandRect.right || er.bottom < bandRect.top || er.top > bandRect.bottom);
      const node = list[+el.dataset.i];
      inside ? selection.add(node) : selection.delete(node);
      el.classList.toggle("selected", selection.has(node));
    });
    updateStatus();
  };
  const onUp = () => {
    band.hidden = true;
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("mouseup", onUp);
  };
  window.addEventListener("mousemove", onMove);
  window.addEventListener("mouseup", onUp);
}

/* keyboard */
els.content.addEventListener("keydown", e => {
  const list = items();
  const idxOf = n => list.indexOf(n);
  const selIdx = [...selection].map(idxOf).sort((a, b) => a - b);
  const cols = view === "icon"
    ? Math.max(1, Math.floor(els.iconView.clientWidth / (parseInt(getComputedStyle(document.documentElement).getPropertyValue("--icon-size")) + 50)))
    : 1;

  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "a") { e.preventDefault(); list.forEach(n => selection.add(n)); applySelectionClasses(); return; }
  if ((e.metaKey || e.ctrlKey) && e.key === "1") { e.preventDefault(); setView("icon"); return; }
  if ((e.metaKey || e.ctrlKey) && e.key === "2") { e.preventDefault(); setView("list"); return; }
  if ((e.metaKey || e.ctrlKey) && e.key === "3") { e.preventDefault(); setView("columns"); return; }
  if ((e.metaKey || e.ctrlKey) && e.key === "4") { e.preventDefault(); setView("gallery"); return; }
  if ((e.metaKey || e.ctrlKey) && e.key === "ArrowUp") { e.preventDefault(); goUp(); return; }
  if ((e.metaKey || e.ctrlKey) && e.key === "ArrowDown") { e.preventDefault(); selection.size === 1 && openNode([...selection][0]); return; }
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "m") { e.preventDefault(); hideWindow("min"); return; }
  if ((e.metaKey || e.ctrlKey) && e.key === "[") { e.preventDefault(); goBack(); return; }
  if ((e.metaKey || e.ctrlKey) && e.key === "]") { e.preventDefault(); goForward(); return; }
  if (e.key === " " || e.code === "Space") {
    e.preventDefault(); e.stopPropagation();
    if (els.overlayLayer.querySelector(".qlook")) closeOverlays();   // space toggles Quick Look, like Finder
    else if (selection.size) quickLook([...selection][0]);
    return;
  }
  if (e.key === "Escape") { closeOverlays(); selection.clear(); applySelectionClasses(); return; }
  if (e.key === "Enter") { e.preventDefault(); if (selection.size === 1) startRename([...selection][0]); return; }

  const arrows = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -cols, ArrowDown: cols };
  if (e.key in arrows && list.length) {
    e.preventDefault();
    let next;
    if (!selection.size) next = 0;
    else {
      const cur = arrows[e.key] > 0 ? selIdx[selIdx.length - 1] : selIdx[0];
      next = Math.min(list.length - 1, Math.max(0, cur + arrows[e.key]));
    }
    if (e.shiftKey && anchorIndex >= 0) {
      selection.clear();
      const [a, b] = [Math.min(anchorIndex, next), Math.max(anchorIndex, next)];
      for (let i = a; i <= b; i++) selection.add(list[i]);
      applySelectionClasses();
    } else selectOnly(list[next], next);
    const el = elementsForItems()[next];
    el && el.scrollIntoView({ block: "nearest" });
  }
});

/* rename (visual only — resets on reload, like a demo desk) */
function startRename(node) {
  if (view !== "icon") return;
  const list = items();
  const el = elementsForItems()[list.indexOf(node)];
  if (!el) return;
  const label = el.querySelector(".ic-label");
  label.innerHTML = `<input value="${node.name}">`;
  const input = label.querySelector("input");
  input.focus(); input.select();
  const commit = () => { node.name = input.value.trim() || node.name; render(); };
  input.addEventListener("keydown", ev => {
    ev.stopPropagation();
    if (ev.key === "Enter") commit();
    if (ev.key === "Escape") render();
  });
  input.addEventListener("blur", commit);
  input.addEventListener("mousedown", ev => ev.stopPropagation());
}

/* ================= view switching ================= */
const VIEW_ICON = { icon: "t-grid", list: "t-list", columns: "t-columns", gallery: "t-gallery" };
function setView(v) {
  if (!VIEW_ICON[v]) return;
  view = v;
  $("tb-view-icon").innerHTML = `<use href="#${VIEW_ICON[v]}"/>`;
  render();
}

/* ================= dropdown menus ================= */
let openMenu = null;
function closeMenus() {
  els.menuLayer.innerHTML = "";
  document.querySelectorAll(".mb-item.open").forEach(b => b.classList.remove("open"));
  openMenu = null;
}
function showMenu(html, x, y, ownerBtn) {
  closeMenus();
  const dd = document.createElement("div");
  dd.className = "dropdown";
  dd.innerHTML = html;
  els.menuLayer.appendChild(dd);
  const r = dd.getBoundingClientRect();
  dd.style.left = Math.min(x, innerWidth - r.width - 8) + "px";
  dd.style.top = Math.min(y, innerHeight - r.height - 8) + "px";
  // menus grow out of the point that summoned them (§7 anchored origins)
  dd.style.transformOrigin = `${Math.max(8, x - parseFloat(dd.style.left))}px top`;
  if (ownerBtn) ownerBtn.classList.add("open");
  openMenu = dd;
  dd.addEventListener("click", e => {
    const it = e.target.closest(".dd-item");
    if (!it || it.classList.contains("disabled")) return;
    const act = it.dataset.act;
    closeMenus();
    act && runAction(act, it.dataset.arg);
  });
  return dd;
}
const mi = (label, act, kbd = "", opts = {}) =>
  `<div class="dd-item ${opts.disabled ? "disabled" : ""}" ${act ? `data-act="${act}"` : ""} ${opts.arg ? `data-arg="${opts.arg}"` : ""}>
     <span><span class="check">${opts.check ? "✓" : ""}</span>${label}</span>${kbd ? `<span class="kbd">${kbd}</span>` : ""}</div>`;
const sep = '<div class="dd-sep"></div>';
const tagRow = `<div class="dd-tags">${TAG_COLORS.map(c => `<i style="background:${c}"></i>`).join("")}</div>`;

/* eslint-disable no-unused-vars */
const MENUS_RETIRED = {
  apple: () => mi("About This Mac", "about") + sep + mi("System Settings…", null, "", { disabled: true }) +
    mi("App Store…", null, "", { disabled: true }) + sep + mi("Sleep", null, "", { disabled: true }) +
    mi("Restart…", null, "", { disabled: true }) + mi("Shut Down…", null, "", { disabled: true }) +
    sep + mi("Lock Screen", null, "⌃⌘Q", { disabled: true }),
  finder: () => mi("About Finder", "about") + sep + mi("Settings…", null, "⌘,", { disabled: true }) +
    sep + mi("Empty Trash…", null, "⇧⌘⌫", { disabled: true }) + sep + mi("Hide Finder", null, "⌘H", { disabled: true }),
  file: () => mi("New Finder Window", "reopen", "⌘N") + mi("New Folder", null, "⇧⌘N", { disabled: true }) +
    sep + mi("Open", "open-sel", "⌘O", { disabled: !selection.size }) +
    mi("Quick Look", "ql-sel", "Space", { disabled: !selection.size }) +
    mi("Get Info", "info-sel", "⌘I", { disabled: !selection.size }) +
    sep + mi("Rename", "rename-sel", "", { disabled: selection.size !== 1 }) +
    mi("Duplicate", null, "⌘D", { disabled: true }) + mi("Make Alias", null, "⌃⌘A", { disabled: true }) +
    sep + mi("Move to Trash", null, "⌘⌫", { disabled: true }),
  edit: () => mi("Undo", null, "⌘Z", { disabled: true }) + mi("Redo", null, "⇧⌘Z", { disabled: true }) + sep +
    mi("Cut", null, "⌘X", { disabled: true }) + mi("Copy", null, "⌘C", { disabled: !selection.size }) +
    mi("Paste", null, "⌘V", { disabled: true }) + mi("Select All", "select-all", "⌘A"),
  view: () => mi("as Icons", "view-icon", "⌘1", { check: view === "icon" }) +
    mi("as List", "view-list", "⌘2", { check: view === "list" }) +
    mi("as Columns", null, "⌘3", { disabled: true }) + mi("as Gallery", null, "⌘4", { disabled: true }) +
    sep + mi("Toggle Sidebar", "toggle-sidebar", "⌥⌘S") +
    sep + mi("Show Path Bar", null, "⌥⌘P", { check: true, disabled: true }) +
    mi("Show Status Bar", null, "⌘/", { check: true, disabled: true }),
  go: () => mi("Back", "back", "⌘[", { disabled: !history.length }) +
    mi("Forward", "fwd", "⌘]", { disabled: !future.length }) +
    mi("Enclosing Folder", "up", "⌘↑", { disabled: !cwd.parent }) + sep +
    mi("&nbsp;Desktop", "goto", "⇧⌘D", { arg: "Desktop" }) +
    mi("&nbsp;AI", "goto", "", { arg: "AI" }) + mi("&nbsp;FILM", "goto", "", { arg: "FILM" }) +
    mi("&nbsp;WRITINGS", "goto", "", { arg: "WRITINGS" }) + mi("&nbsp;READINGS", "goto", "", { arg: "READINGS" }) +
    mi("&nbsp;FLAT THINGS", "goto", "", { arg: "FLAT THINGS" }),
  window: () => mi("Minimize", "minimize", "⌘M") + mi("Zoom", "zoom") + sep + mi("Haolang Li", "reopen", "", { check: true }),
  help: () => mi("About this site", "about") + sep + mi("macOS Help", null, "", { disabled: true }),
};

/* ================= build footer =================
   The browser will happily serve a cached style.css/app.js after a deploy.
   This refetches both with cache:"reload" — which replaces the HTTP cache
   entries — then reloads on a fresh URL so the HTML isn't cached either. */
(function buildFooter() {
  const btn = $("side-refresh"), tag = $("sf-build");
  if (!btn) return;
  const assetUrls = () => [
    ...document.querySelectorAll('link[rel="stylesheet"][href]'),
    ...document.querySelectorAll("script[src]"),
  ].map(el => el.href || el.src).filter(u => u.startsWith(location.origin));

  const mine = document.currentScript?.src || assetUrls().find(u => u.includes("app.js")) || "";
  if (tag) tag.textContent = (mine.match(/[?&]v=([^&]+)/) || [, "dev"])[1];

  btn.addEventListener("click", async () => {
    btn.classList.add("spin");
    try {
      await Promise.all(assetUrls().map(u => fetch(u, { cache: "reload" })));
    } catch { /* offline or blocked — reload anyway */ }
    const url = new URL(location.href);
    url.searchParams.set("r", Date.now().toString(36));
    location.replace(url);
  });
})();

/* ================= menu bar: name + appearance ================= */
$("mb-name").addEventListener("click", () => openWindow());

const THEME_KEY = "hl-theme";
function applyTheme(t) {
  document.documentElement.dataset.theme = t;
  $("mb-theme").title = t === "dark" ? "Switch to light appearance" : "Switch to dark appearance";
}
applyTheme(localStorage.getItem(THEME_KEY)
  || (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"));
$("mb-theme").addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(next);
  try { localStorage.setItem(THEME_KEY, next); } catch {}
});

/* toolbar dropdowns */
$("tb-viewbtn").addEventListener("mousedown", e => {
  e.stopPropagation();
  const r = e.currentTarget.getBoundingClientRect();
  showMenu(
    mi("as Icons", "view-icon", "⌘1", { check: view === "icon" }) +
    mi("as List", "view-list", "⌘2", { check: view === "list" }) +
    mi("as Columns", "view-columns", "⌘3", { check: view === "columns" }) +
    mi("as Gallery", "view-gallery", "⌘4", { check: view === "gallery" }), r.left, r.bottom + 6);
});
$("tb-group").addEventListener("mousedown", e => {
  e.stopPropagation();
  const r = e.currentTarget.getBoundingClientRect();
  showMenu(mi("None", null, "", { check: true }) + mi("Name", null, "", { disabled: true }) +
    mi("Kind", null, "", { disabled: true }) + mi("Date", null, "", { disabled: true }), r.left, r.bottom + 6);
});
$("tb-share").addEventListener("click", () => {
  if (navigator.share) navigator.share({ title: "Haolang Li", url: location.href }).catch(() => {});
});
$("tb-back").addEventListener("click", goBack);
$("tb-fwd").addEventListener("click", goForward);
$("tb-sidebar").addEventListener("click", () => els.sidebar.classList.toggle("collapsed"));

/* ================= context menu ================= */
els.content.addEventListener("contextmenu", e => {
  e.preventDefault();
  const el = e.target.closest(ITEM_SEL[view]);
  let html;
  if (el && el.dataset.i !== undefined && items()[+el.dataset.i]) {
    const node = items()[+el.dataset.i];
    if (!selection.has(node)) selectOnly(node, +el.dataset.i);
    html =
      mi("Open", "open-sel") + mi("Open With", null, "", { disabled: true }) + sep +
      mi("Move to Trash", null, "", { disabled: true }) + sep +
      mi("Get Info", "info-sel", "⌘I") + mi("Rename", "rename-sel", "", { disabled: selection.size !== 1 }) +
      mi("Duplicate", null, "⌘D", { disabled: true }) + mi("Make Alias", null, "", { disabled: true }) +
      mi(`Quick Look “${node.name}”`, "ql-sel", "Space") + sep +
      mi("Copy", null, "⌘C", { disabled: true }) + mi("Share…", null, "", { disabled: true }) + sep +
      tagRow + mi("Tags…", null, "", { disabled: true }) + sep +
      mi("Quick Actions", null, "", { disabled: true }) + sep + mi("Services", null, "", { disabled: true });
  } else {
    html =
      mi("New Folder", null, "", { disabled: true }) + sep +
      mi("Get Info", "info-cwd", "⌘I") + sep +
      mi("View", null, "", { disabled: true }) + mi("Sort By", null, "", { disabled: true }) + sep +
      mi("Show View Options", null, "", { disabled: true });
  }
  showMenu(html, e.clientX, e.clientY);
});
window.addEventListener("mousedown", e => {
  if (!e.target.closest(".dropdown") && !e.target.closest(".mb-item")) closeMenus();
});
window.addEventListener("blur", closeMenus);

/* ================= actions ================= */
function runAction(act, arg) {
  switch (act) {
    case "back": goBack(); break;
    case "fwd": goForward(); break;
    case "up": goUp(); break;
    case "goto": { const n = findByName(arg); n && navigate(n); break; }
    case "view-icon": setView("icon"); break;
    case "view-list": setView("list"); break;
    case "view-columns": setView("columns"); break;
    case "view-gallery": setView("gallery"); break;
    case "select-all": items().forEach(n => selection.add(n)); applySelectionClasses(); break;
    case "open-sel": [...selection].forEach(openNode); break;
    case "ql-sel": selection.size && quickLook([...selection][0]); break;
    case "info-sel": [...selection].slice(0, 3).forEach((n, i) => getInfo(n, i)); break;
    case "info-cwd": getInfo(cwd, 0); break;
    case "rename-sel": selection.size === 1 && startRename([...selection][0]); break;
    case "toggle-sidebar": els.sidebar.classList.toggle("collapsed"); break;
    case "minimize": hideWindow("min"); break;
    case "zoom": toggleFullscreen(); break;
    case "reopen": openWindow(); break;
    case "about": showAbout(); break;
  }
}

/* ================= quick look ================= */
function closeOverlays() { els.overlayLayer.innerHTML = ""; }
function anchorRectFor(node) {
  const el = elementsForItems()[items().indexOf(node)];
  return el ? el.getBoundingClientRect() : null;
}
/* a surface arrives as a material — scale in from the element that summoned it */
function materialize(box, anchorRect) {
  const rect = box.getBoundingClientRect();
  box.style.left = rect.left + "px"; box.style.top = rect.top + "px";
  if (!anchorRect) {
    setPresentation(box, { scale: 0.94, opacity: 0 });
    springTo(box, { scale: 1, opacity: 1 }, { response: 0.3 });
    return;
  }
  const dx = anchorRect.left + anchorRect.width / 2 - (rect.left + rect.width / 2);
  const dy = anchorRect.top + anchorRect.height / 2 - (rect.top + rect.height / 2);
  setPresentation(box, { x: dx, y: dy, scale: 0.2, opacity: 0 });
  springTo(box, { x: 0, y: 0, scale: 1, opacity: 1 }, { response: 0.38 });
}
function quickLook(node) {
  closeOverlays();
  const box = document.createElement("div");
  box.className = "qlook";
  let body;
  if (node.href && /\.pdf$/i.test(node.name)) body = `<iframe src="${node.href}" title="${node.name}"></iframe>`;
  else if (node.href && node.external) body = `${iconSvg(node)}`;
  else body = iconSvg(node);
  box.innerHTML = `
    <div class="ql-bar"><button class="ql-close" aria-label="Close"></button><div class="ql-title">${node.name}</div></div>
    <div class="ql-body">${body}</div>
    <div class="ql-meta">${node.kind}${node.children ? ` — ${node.children.length} item${node.children.length === 1 ? "" : "s"}` : ""}</div>`;
  els.overlayLayer.appendChild(box);
  materialize(box, anchorRectFor(node));
  box.querySelector(".ql-close").addEventListener("click", closeOverlays);
  const esc = ev => { if (ev.key === "Escape" || ev.key === " " || ev.code === "Space") { ev.preventDefault(); closeOverlays(); window.removeEventListener("keydown", esc); } };
  window.addEventListener("keydown", esc);
}

/* ================= get info ================= */
function getInfo(node, offset) {
  const box = document.createElement("div");
  box.className = "getinfo";
  box.style.left = (120 + offset * 30) + "px";
  box.style.top = (90 + offset * 30) + "px";
  const where = pathOf(node).slice(0, -1).map(n => n.name).join(" ▸ ") || "—";
  box.innerHTML = `
    <div class="gi-bar"><button class="gi-close" aria-label="Close"></button><div class="gi-title">${node.name} Info</div></div>
    <div class="gi-head">${iconSvg(node, "")}<div><div class="gi-name">${node.name}</div><div class="gi-sub">${node.size === "--" ? "" : node.size}</div></div></div>
    <div class="gi-sec"><h4>General</h4>
      <div class="gi-row"><b>Kind:</b><span>${node.kind}</span></div>
      <div class="gi-row"><b>Size:</b><span>${node.size === "--" ? (node.children ? `${node.children.length} items` : "—") : node.size}</span></div>
      <div class="gi-row"><b>Where:</b><span>${where}</span></div>
      <div class="gi-row"><b>Created:</b><span>${dateOf(node)}</span></div>
      <div class="gi-row"><b>Modified:</b><span>${dateOf(node)}</span></div>
    </div>`;
  els.overlayLayer.appendChild(box);
  materialize(box, anchorRectFor(node));
  box.querySelector(".gi-close").addEventListener("click", () => box.remove());
  makeDraggable(box, box.querySelector(".gi-bar"));
}

/* ================= about ================= */
function showAbout() {
  closeOverlays();
  const box = document.createElement("div");
  box.className = "getinfo";
  box.style.left = "calc(50% - 135px)"; box.style.top = "26%";
  box.innerHTML = `
    <div class="gi-bar"><button class="gi-close"></button><div class="gi-title">About</div></div>
    <div class="gi-sec" style="border-top:0;text-align:center;padding-bottom:18px">
      <div style="font-size:15px;font-weight:700;padding:6px 0 2px">Haolang Li</div>
      <div class="gi-sub">filmmaker & AI video creator</div>
      <div class="gi-sub" style="padding-top:10px">This site is a working replica of macOS Finder.<br>Double-click around. Press Space for Quick Look.</div>
    </div>`;
  els.overlayLayer.appendChild(box);
  materialize(box, null);
  box.querySelector(".gi-close").addEventListener("click", () => box.remove());
  makeDraggable(box, box.querySelector(".gi-bar"));
}

/* ================= in-OS browser: external links stay inside the Mac ================= */
function openApp(id) {
  const app = LINKS.find(l => l.id === id);
  if (!app) return;
  closeOverlays();
  const dockIcon = document.querySelector(`.dock-item[data-app="${id}"]`);
  if (dockIcon) { dockIcon.classList.add("bounce"); setTimeout(() => dockIcon.classList.remove("bounce"), 1100); }
  const host = app.href.startsWith("mailto:") ? app.href.replace("mailto:", "") : app.href.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const win = document.createElement("div");
  win.className = "appwin";
  win.innerHTML = `
    <div class="aw-bar">
      <button class="aw-close" aria-label="Close"></button>
      <div class="aw-url"><svg viewBox="0 0 20 20"><path d="M6.5 9V6.8a3.5 3.5 0 0 1 7 0V9M5.5 9h9A1.5 1.5 0 0 1 16 10.5v5A1.5 1.5 0 0 1 14.5 17h-9A1.5 1.5 0 0 1 4 15.5v-5A1.5 1.5 0 0 1 5.5 9Z" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>${host}</div>
    </div>
    <div class="aw-body">
      <div class="aw-app">${dockIcon ? dockIcon.querySelector("svg").outerHTML : ""}</div>
      <div class="aw-name">${app.name}</div>
      <div class="aw-desc">${app.desc}</div>
      <div class="aw-actions">
        <button class="aw-btn primary">${app.id === "email" ? "Write to me" : "Visit " + app.name} ↗</button>
        <button class="aw-btn quiet">Stay here</button>
      </div>
    </div>`;
  els.overlayLayer.appendChild(win);

  // the window materializes out of its dock icon and dismisses back into it (§7 spatial consistency)
  const rect = win.getBoundingClientRect();
  win.style.left = rect.left + "px"; win.style.top = rect.top + "px";
  const anchor = dockIcon ? dockIcon.getBoundingClientRect() : { left: innerWidth / 2, top: innerHeight, width: 0, height: 0 };
  const fromX = () => ({
    dx: anchor.left + anchor.width / 2 - (parseFloat(win.style.left) + rect.width / 2),
    dy: anchor.top + anchor.height / 2 - (parseFloat(win.style.top) + rect.height / 2),
  });
  const d0 = fromX();
  setPresentation(win, { x: d0.dx, y: d0.dy, scale: 0.08, opacity: 0 });
  springTo(win, { x: 0, y: 0, scale: 1, opacity: 1 }, { response: 0.4 });

  const dismissToDock = () => {
    const d = fromX();
    springTo(win, { x: d.dx, y: d.dy, scale: 0.08, opacity: 0 }, { response: 0.34, onDone: () => win.remove() });
  };
  const flickAway = ({ vx, vy }) => {   // thrown: momentum carries it off-screen
    springTo(win, { x: project(vx) / 3, y: innerHeight, opacity: 0 },
      { response: 0.5, velocity: { x: vx, y: vy }, onDone: () => win.remove() });
  };
  win.querySelector(".aw-close").addEventListener("click", dismissToDock);
  win.querySelector(".aw-btn.quiet").addEventListener("click", dismissToDock);
  win.querySelector(".aw-btn.primary").addEventListener("click", () => {
    if (app.href.startsWith("mailto:")) location.href = app.href;
    else window.open(app.href, "_blank", "noopener");
  });
  makeDraggable(win, win.querySelector(".aw-bar"), { onFlickDown: flickAway });
}
document.querySelectorAll(".dock-item[data-app]").forEach(btn =>
  btn.addEventListener("click", () => openApp(btn.dataset.app)));

/* ================= window management: traffic lights ================= */
let winHidden = false;
function hideWindow(kind) {
  if (winHidden) return;
  winHidden = true;
  const r = els.win.getBoundingClientRect();
  // minimize sinks toward the dock; close poofs in place — exit hints at where it went (§8)
  const dy = kind === "min" ? innerHeight - r.top - r.height / 2 : 70;
  springTo(els.win, { y: dy, scale: 0.08, opacity: 0 },
    { response: 0.42, onDone: () => els.win.classList.add("win-gone") });
}
function openWindow() {
  if (!winHidden) return;
  winHidden = false;
  els.win.classList.remove("win-gone");
  springTo(els.win, { y: 0, scale: 1, opacity: 1 }, { response: 0.42 });
}
function toggleFullscreen() {
  if (winHidden) return;
  const win = els.win;
  const r0 = win.getBoundingClientRect();
  const fs = !win.classList.contains("fullscreen");
  win.classList.toggle("fullscreen", fs);
  document.body.classList.toggle("has-fullscreen", fs);
  const r1 = win.getBoundingClientRect();
  // FLIP: jump to the new layout, then spring the visual difference away
  win.style.transformOrigin = "0 0";
  setPresentation(win, {
    x: r0.left - r1.left, y: r0.top - r1.top,
    sx: r0.width / r1.width, sy: r0.height / r1.height,
  });
  springTo(win, { x: 0, y: 0, sx: 1, sy: 1 }, { response: 0.45 });
}
$("tl-close").addEventListener("click", () => hideWindow("close"));
$("tl-min").addEventListener("click", () => hideWindow("min"));
$("tl-zoom").addEventListener("click", toggleFullscreen);
/* the desktop is the way back in: double-click any empty spot */
els.desktop.addEventListener("dblclick", e => { if (e.target === els.desktop) openWindow(); });

/* drag by toolbar / title — pointer events, 1:1 with grab offset, velocity-aware.
   Top edge rubber-bands instead of hard-stopping; release springs back. */
function makeDraggable(box, handle, { clampToDesktop = false, onFlickDown } = {}) {
  handle.addEventListener("pointerdown", e => {
    if (e.button !== 0 || e.target.closest("button") || e.target.closest(".tb-btn")) return;
    handle.setPointerCapture(e.pointerId);
    const startX = e.clientX, startY = e.clientY;
    const r = box.getBoundingClientRect();
    const parentR = clampToDesktop ? els.desktop.getBoundingClientRect() : { left: 0, top: 0 };
    // fold any in-flight spring translate into the base position (animate from presentation value)
    const st = springStates.get(box);
    const tx = st?.props.x?.val || 0, ty = st?.props.y?.val || 0;
    if (st) { for (const k of ["x", "y"]) if (st.props[k]) { st.props[k].val = 0; st.props[k].target = 0; st.props[k].vel = 0; } }
    const offL = r.left - parentR.left - tx, offT = r.top - parentR.top - ty;
    const vt = makeVelocityTracker();
    let moved = false;
    box.classList.add("dragging");
    const onMove = ev => {
      const dx = ev.clientX - startX, dy = ev.clientY - startY;
      if (!moved && Math.hypot(dx, dy) < 3) return;
      moved = true;
      vt.push(ev.clientX, ev.clientY);
      const rawTop = offT + dy;
      box.style.left = offL + dx + "px";
      box.style.top = (rawTop < 0 ? rubberband(rawTop) : rawTop) + "px";
    };
    const onUp = ev => {
      box.classList.remove("dragging");
      handle.releasePointerCapture(e.pointerId);
      handle.removeEventListener("pointermove", onMove);
      handle.removeEventListener("pointerup", onUp);
      handle.removeEventListener("pointercancel", onUp);
      if (!moved) return;
      const { vx, vy } = vt.read();
      if (onFlickDown && vy > 900) { onFlickDown({ vx, vy }); return; }
      const top = parseFloat(box.style.top);
      if (top < 0) { // was rubber-banding: spring home from the presentation value
        box.style.top = "0px";
        setPresentation(box, { y: top });
        springTo(box, { y: 0 }, { velocity: { y: vy }, response: 0.35 });
      }
    };
    handle.addEventListener("pointermove", onMove);
    handle.addEventListener("pointerup", onUp);
    handle.addEventListener("pointercancel", onUp);
  });
}
/* the whole top strip moves the window — toolbar and the sidebar's title area */
makeDraggable(els.win, $("toolbar"), { clampToDesktop: true });
makeDraggable(els.win, $("traffic"), { clampToDesktop: true });

/* resize */
$("resize-handle").addEventListener("mousedown", e => {
  e.preventDefault();
  const startX = e.clientX, startY = e.clientY;
  const r = els.win.getBoundingClientRect();
  els.win.classList.add("resizing");
  const onMove = ev => {
    els.win.style.width = Math.max(430, r.width + ev.clientX - startX) + "px";
    els.win.style.height = Math.max(300, r.height + ev.clientY - startY) + "px";
  };
  const onUp = () => {
    els.win.classList.remove("resizing");
    window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp);
  };
  window.addEventListener("mousemove", onMove); window.addEventListener("mouseup", onUp);
});

/* ================= dock magnification =================
   Tracks the pointer 1:1 (direct manipulation); springs back on leave. */
/* Centre every dock glyph on its plate and give the set one optical size,
   whatever coordinate space each mark was drawn in. */
function fitGlyphs() {
  const TARGET = 26, PLATE_STROKE = 2.7;   // both in the 64-unit plate space
  let measured = true;
  document.querySelectorAll(".dock-item .glyph").forEach(g => {
    const b = g.getBBox();
    if (!b.width && !b.height) { measured = false; return; }  // laid out yet?
    const stroked = g.querySelector(".mark-s");
    // getBBox ignores stroke, so add it back before measuring the visual box
    const s = TARGET / (Math.max(b.width, b.height) + (stroked ? PLATE_STROKE : 0));
    const cx = b.x + b.width / 2, cy = b.y + b.height / 2;
    g.setAttribute("transform", `translate(32 32) scale(${s.toFixed(5)}) translate(${-cx} ${-cy})`);
    if (stroked) g.setAttribute("stroke-width", (PLATE_STROKE / s).toFixed(3));
  });
  return measured;
}
// getBBox reads zeros before first layout, so measure once a frame exists
requestAnimationFrame(() => {
  if (!fitGlyphs()) window.addEventListener("load", fitGlyphs, { once: true });
});

(function dockMagnify() {
  const dock = $("dock");
  const tip = $("dock-tip");
  if (!dock) return;
  const apps = [...dock.querySelectorAll(".dock-item")];
  const AMP = 0.55, SIGMA = 78;   // growth and how far the swell reaches

  const showTip = (it) => {
    const r = it.getBoundingClientRect();
    tip.textContent = it.getAttribute("aria-label");
    tip.hidden = false;
    tip.style.left = r.left + r.width / 2 + "px";
    tip.style.top = r.top - 10 + "px";
  };
  const hideTip = () => { tip.hidden = true; };

  if (!FINE_POINTER.matches) {   // touch: no magnification, but names on tap-hold
    apps.forEach(it => {
      it.addEventListener("pointerdown", () => showTip(it));
      it.addEventListener("pointerup", hideTip);
      it.addEventListener("pointercancel", hideTip);
    });
    return;
  }

  let hovered = null;
  dock.addEventListener("pointermove", e => {
    if (REDUCED.matches) return;
    const dr = dock.getBoundingClientRect();
    // 1. how much each icon swells
    const scales = apps.map(it => {
      const home = dr.left + it.offsetLeft + it.offsetWidth / 2;
      const d = e.clientX - home;
      return 1 + AMP * Math.exp(-(d * d) / (2 * SIGMA * SIGMA));
    });
    // 2. push neighbours outward by the width the swell adds, so nothing crowds
    const extras = scales.map((s, i) => (s - 1) * apps[i].offsetWidth);
    const total = extras.reduce((a, b) => a + b, 0);
    let run = 0;
    apps.forEach((it, i) => {
      const shift = run + extras[i] / 2 - total / 2;
      run += extras[i];
      setPresentation(it, { x: shift, y: -(scales[i] - 1) * 26, scale: scales[i] });
    });
    // 3. the name rides above whichever icon is biggest
    const top = scales.indexOf(Math.max(...scales));
    if (scales[top] > 1.12) {
      if (apps[top] !== hovered) { hovered = apps[top]; }
      showTip(apps[top]);
    } else { hovered = null; hideTip(); }
  });
  dock.addEventListener("pointerleave", () => {
    hovered = null; hideTip();
    apps.forEach(it => springTo(it, { x: 0, y: 0, scale: 1 }, { response: 0.34 }));
  });
})();

/* ================= icon throw =================
   Grab an icon past the 10px hysteresis and throw it; it springs home
   carrying the release velocity (momentum gesture → a little bounce). */
els.content.addEventListener("pointerdown", e => {
  if (view !== "icon" || e.button !== 0) return;
  const el = e.target.closest(".icon-item");
  if (!el || e.target.tagName === "INPUT") return;
  const startX = e.clientX, startY = e.clientY;
  const vt = makeVelocityTracker();
  let dragging = false;
  const onMove = ev => {
    const dx = ev.clientX - startX, dy = ev.clientY - startY;
    if (!dragging) {
      if (Math.hypot(dx, dy) < 10) return;
      dragging = true;
      el.classList.add("lifted");
    }
    vt.push(ev.clientX, ev.clientY);
    setPresentation(el, { x: dx, y: dy });
  };
  const onUp = () => {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    if (!dragging) return;
    const { vx, vy } = vt.read();
    springTo(el, { x: 0, y: 0 },
      { damping: 0.8, response: 0.42, velocity: { x: vx, y: vy }, onDone: () => el.classList.remove("lifted") });
  };
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
});

/* ================= misc chrome ================= */
/* live clock — same format as the macOS menu bar */
function tickClock() {
  const d = new Date();
  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"], months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  let h = d.getHours(); const ap = h >= 12 ? "PM" : "AM"; h = h % 12 || 12;
  $("mb-clock").textContent = `${days[d.getDay()]} ${months[d.getMonth()]} ${d.getDate()} ${h}:${String(d.getMinutes()).padStart(2, "0")} ${ap}`;
}
tickClock(); setInterval(tickClock, 15000);

/* icon size slider */
$("size-slider").addEventListener("input", e => {
  document.documentElement.style.setProperty("--icon-size", e.target.value + "px");
});

/* collapse the sidebar on narrow screens, restore it when there is room */
const narrowMQ = matchMedia("(max-width: 740px)");
const syncNarrow = () => els.sidebar.classList.toggle("collapsed", narrowMQ.matches);
narrowMQ.addEventListener("change", syncNarrow);
syncNarrow();

/* ================= boot ================= */
buildSidebar();
render();
els.content.focus();

})();
