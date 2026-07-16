/* ==========================================================================
   haolang-li.com — Finder engine
   Selection, navigation, menus, Quick Look, Get Info, window management.
   ========================================================================== */
(function () {
"use strict";

/* ================= file system ================= */
// dates are display strings; folders emptied on purpose — content comes later
const D = "Jul 16, 2026 at 1:24 AM";
const folder = (name, children = [], extra = {}) =>
  ({ name, kind: "Folder", icon: "i-folder-mac", date: D, size: "--", children, ...extra });
const pdf = (name, href) =>
  ({ name, kind: "PDF document", icon: "i-pdf-mac", date: D, size: "--", href });
const webloc = (name, href) =>
  ({ name: name + ".webloc", kind: "Web site location", icon: "i-webloc", date: D, size: "1 KB", href, external: true });

const ROOT = folder("Desktop", [
  folder("AI", [
    folder("AVA Studio"),
    folder("Test Footage"),
  ]),
  folder("FILM", [
    folder("Short Films"),
    folder("Cinematography"),
    folder("Festival & Sales"),
    folder("Poster Design"),
  ]),
  folder("WRITINGS", [
    folder("Randomness"),
    folder("Poems"),
  ]),
  folder("READINGS", [
    folder("Reading Notes"),
    folder("Papers"),
  ]),
  folder("FLAT THINGS", [
    folder("Digital"),
    folder("Celluloid"),
    folder("Randomness"),
    folder("Mappings"),
  ]),
  pdf("Self_Intro.pdf", "assets/files/Self_Intro.pdf"),
  pdf("CV_2026_6.pdf", "assets/files/CV_2026_6.pdf"),
  pdf("Recent_Writing.pdf", "assets/files/Recent_Writing.pdf"),
]);

// parent pointers + paths
(function link(node, parent) {
  node.parent = parent;
  (node.children || []).forEach(c => link(c, node));
})(ROOT, null);

const LINKS = [
  { name: "Vimeo", icon: "s-vimeo", href: "https://vimeo.com/YOUR_VIMEO" },
  { name: "Instagram", icon: "s-ig", href: "https://instagram.com/YOUR_IG" },
  { name: "Spotify", icon: "s-spotify", href: "https://open.spotify.com/user/YOUR_SPOTIFY" },
  { name: "Discord", icon: "s-discord", href: "https://discord.com/users/YOUR_DISCORD" },
  { name: "Email", icon: "s-mail", href: "mailto:you@haolang-li.com" },
  { name: "Arena", icon: "s-arena", href: "https://www.are.na/YOUR_ARENA" },
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
const els = {
  win: $("window"), sideNav: $("side-nav"), title: $("tb-title"),
  back: $("tb-back"), fwd: $("tb-fwd"), content: $("content"),
  iconView: $("icon-view"), listView: $("list-view"),
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
  h += sec("Writings") + item("Randomness", "s-folder") + item("Poems", "s-folder");
  h += sec("Readings") + item("Reading Notes", "s-folder") + item("Papers", "s-folder");
  h += sec("Flat Things") + item("Digital", "s-folder") + item("Celluloid", "s-folder")
     + item("Randomness", "s-folder", 'data-parent="FLAT THINGS"') + item("Mappings", "s-folder");
  h += sec("Links");
  LINKS.forEach(l => {
    h += `<button class="side-item side-link" data-href="${l.href}"><svg viewBox="0 0 20 20"><use href="#${l.icon}"/></svg><span>${l.name}</span></button>`;
  });
  els.sideNav.innerHTML = h;

  els.sideNav.addEventListener("click", e => {
    const btn = e.target.closest(".side-item");
    if (!btn) return;
    if (btn.dataset.href) { window.open(btn.dataset.href, "_blank", "noopener"); return; }
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
function iconSvg(node, cls = "file-icon") {
  return `<svg class="${cls}" viewBox="0 0 ${node.icon === "i-folder-mac" ? "160 128" : "120 150"}"><use href="#${node.icon}"/></svg>`;
}
function render() {
  const list = items();
  els.title.textContent = cwd.name;
  document.title = cwd === ROOT ? "Haolang Li" : `${cwd.name} — Haolang Li`;
  els.back.disabled = !history.length;
  els.fwd.disabled = !future.length;

  if (view === "icon") {
    els.iconView.hidden = false; els.listView.hidden = true;
    els.iconView.innerHTML = list.map((n, i) => `
      <div class="icon-item ${selection.has(n) ? "selected" : ""}" data-i="${i}">
        <div class="ic-frame">${iconSvg(n)}</div>
        <div class="ic-label">${n.name}</div>
      </div>`).join("");
  } else {
    els.iconView.hidden = true; els.listView.hidden = false;
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
        <div class="lv-cell c-date lv-dim">${n.date}</div>
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
      <svg viewBox="0 0 160 128"><use href="#i-folder-mac"/></svg>${n.name}
    </span>`).join("");
  els.pathbar.querySelectorAll(".pb-item").forEach(el => {
    el.addEventListener("dblclick", () => navigate(pathOf(cwd)[+el.dataset.depth]));
    el.addEventListener("click", () => navigate(pathOf(cwd)[+el.dataset.depth]));
  });

  updateStatus();
  syncSidebar();
}
function updateStatus() {
  const n = items().length;
  const sel = selection.size;
  els.status.textContent = sel
    ? `${sel} of ${n} selected, 480.36 GB available`
    : `${n} item${n === 1 ? "" : "s"}, 480.36 GB available`;
}

/* ================= selection ================= */
function elementsForItems() {
  return [...els.content.querySelectorAll(view === "icon" ? ".icon-item" : ".lv-row")];
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
  const el = e.target.closest(view === "icon" ? ".icon-item" : ".lv-row");
  if (!el) return false;
  const list = items();
  const idx = +el.dataset.i, node = list[idx];
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
    const el = e.target.closest(view === "icon" ? ".icon-item" : ".lv-row");
    if (el) { const node = items()[+el.dataset.i]; if (!selection.has(node)) selectOnly(node, +el.dataset.i); }
    return;
  }
  if (e.target.closest(".lv-head")) return;
  const hit = handleItemMousedown(e);
  if (!hit) startRubberBand(e);
  els.content.focus();
});
els.content.addEventListener("dblclick", e => {
  const el = e.target.closest(view === "icon" ? ".icon-item" : ".lv-row");
  if (el) openNode(items()[+el.dataset.i]);
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
  if ((e.metaKey || e.ctrlKey) && e.key === "ArrowUp") { e.preventDefault(); goUp(); return; }
  if ((e.metaKey || e.ctrlKey) && e.key === "ArrowDown") { e.preventDefault(); selection.size === 1 && openNode([...selection][0]); return; }
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
function setView(v) {
  if (v !== "icon" && v !== "list") return;
  view = v;
  $("tb-view-icon").innerHTML = `<use href="#${v === "icon" ? "t-grid" : "t-list"}"/>`;
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

const MENUS = {
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

document.querySelectorAll(".mb-item").forEach(btn => {
  btn.addEventListener("mousedown", e => {
    e.stopPropagation();
    if (openMenu && btn.classList.contains("open")) { closeMenus(); return; }
    const r = btn.getBoundingClientRect();
    showMenu(MENUS[btn.dataset.menu](), r.left, r.bottom + 4, btn);
  });
  btn.addEventListener("mouseenter", () => {
    if (openMenu && !btn.classList.contains("open")) {
      const r = btn.getBoundingClientRect();
      showMenu(MENUS[btn.dataset.menu](), r.left, r.bottom + 4, btn);
    }
  });
});

/* toolbar dropdowns */
$("tb-viewbtn").addEventListener("mousedown", e => {
  e.stopPropagation();
  const r = e.currentTarget.getBoundingClientRect();
  showMenu(
    mi("as Icons", "view-icon", "⌘1", { check: view === "icon" }) +
    mi("as List", "view-list", "⌘2", { check: view === "list" }) +
    mi("as Columns", null, "⌘3", { disabled: true }) +
    mi("as Gallery", null, "⌘4", { disabled: true }), r.left, r.bottom + 6);
});
$("tb-group").addEventListener("mousedown", e => {
  e.stopPropagation();
  const r = e.currentTarget.getBoundingClientRect();
  showMenu(mi("None", null, "", { check: true }) + mi("Name", null, "", { disabled: true }) +
    mi("Kind", null, "", { disabled: true }) + mi("Date", null, "", { disabled: true }), r.left, r.bottom + 6);
});
$("tb-more").addEventListener("mousedown", e => {
  e.stopPropagation();
  const r = e.currentTarget.getBoundingClientRect();
  showMenu(mi("New Folder", null, "", { disabled: true }) + mi("Get Info", "info-sel", "", { disabled: !selection.size }) +
    sep + mi("Show View Options", null, "⌘J", { disabled: true }), r.left, r.bottom + 6);
});
$("tb-share").addEventListener("click", () => {
  if (navigator.share) navigator.share({ title: "Haolang Li", url: location.href }).catch(() => {});
});
$("tb-tags").addEventListener("mousedown", e => {
  e.stopPropagation();
  const r = e.currentTarget.getBoundingClientRect();
  showMenu(tagRow, r.left, r.bottom + 6);
});
$("tb-search").addEventListener("click", () => { /* decorative, like a stage prop */ });
$("tb-back").addEventListener("click", goBack);
$("tb-fwd").addEventListener("click", goForward);
$("tb-sidebar").addEventListener("click", () => els.sidebar.classList.toggle("collapsed"));

/* ================= context menu ================= */
els.content.addEventListener("contextmenu", e => {
  e.preventDefault();
  const el = e.target.closest(view === "icon" ? ".icon-item" : ".lv-row");
  let html;
  if (el) {
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
    case "select-all": items().forEach(n => selection.add(n)); applySelectionClasses(); break;
    case "open-sel": [...selection].forEach(openNode); break;
    case "ql-sel": selection.size && quickLook([...selection][0]); break;
    case "info-sel": [...selection].slice(0, 3).forEach((n, i) => getInfo(n, i)); break;
    case "info-cwd": getInfo(cwd, 0); break;
    case "rename-sel": selection.size === 1 && startRename([...selection][0]); break;
    case "toggle-sidebar": els.sidebar.classList.toggle("collapsed"); break;
    case "minimize": hideWindow(); break;
    case "zoom": toggleFullscreen(); break;
    case "reopen": showWindow(); break;
    case "about": showAbout(); break;
  }
}

/* ================= quick look ================= */
function closeOverlays() { els.overlayLayer.innerHTML = ""; }
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
      <div class="gi-row"><b>Created:</b><span>${node.date}</span></div>
      <div class="gi-row"><b>Modified:</b><span>${node.date}</span></div>
    </div>`;
  els.overlayLayer.appendChild(box);
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
  box.querySelector(".gi-close").addEventListener("click", () => box.remove());
  makeDraggable(box, box.querySelector(".gi-bar"));
}

/* ================= window management ================= */
function hideWindow() { els.win.classList.add("hidden-away"); }
function showWindow() {
  els.win.classList.remove("hidden-away");
  const f = $("dock-finder");
  f.classList.add("bounce");
  setTimeout(() => f.classList.remove("bounce"), 1100);
}
function toggleFullscreen() {
  const fs = els.win.classList.toggle("fullscreen");
  document.body.classList.toggle("has-fullscreen", fs);   // real macOS hides the Dock
}

$("tl-close").addEventListener("click", hideWindow);
$("tl-min").addEventListener("click", hideWindow);
$("tl-zoom").addEventListener("click", toggleFullscreen);
$("dock-finder").addEventListener("click", showWindow);
$("dock-trash").addEventListener("click", () => {});

/* drag by toolbar / title */
function makeDraggable(box, handle, clampToDesktop = false) {
  handle.addEventListener("mousedown", e => {
    if (e.target.closest("button") || e.target.closest(".tb-btn")) return;
    if (box.classList.contains("fullscreen")) return;
    const startX = e.clientX, startY = e.clientY;
    const r = box.getBoundingClientRect();
    const parentR = clampToDesktop ? els.desktop.getBoundingClientRect() : { left: 0, top: 0 };
    const offL = r.left - parentR.left, offT = r.top - parentR.top;
    box.classList.add("dragging");
    const onMove = ev => {
      box.style.left = offL + (ev.clientX - startX) + "px";
      box.style.top = Math.max(0, offT + (ev.clientY - startY)) + "px";
    };
    const onUp = () => {
      box.classList.remove("dragging");
      window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove); window.addEventListener("mouseup", onUp);
  });
}
makeDraggable(els.win, $("toolbar"), true);
$("toolbar").addEventListener("dblclick", e => { if (!e.target.closest(".tb-btn")) hideWindow(); });

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
