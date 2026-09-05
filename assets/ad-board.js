/* ==========================================================================
   AD Schedule — the live shooting board (FILMS › AD Schedule)
   A 1st AD's strip board: tap each item in and out, and the whole day
   re-times itself so the hard walls (interior hard out, actors wrapped,
   company wrap) stay where they are — the minutes come out of the
   turnarounds and the scenes instead of out of the end of the day.

   Public read, key-gated write: whoever holds #k=<key> can run the board,
   everyone else watches it live. See supabase-ad-schedule.sql.

   Self-contained: window.ADBoard.mount(el) / .unmount(). No dependencies.
   ========================================================================== */
window.ADBoard = (function () {
"use strict";

/* Supabase — same public project as the rest of the site. Repeated here
   rather than reached for across files so this board stays droppable. */
const SUPA = {
  url: "https://knpwwgqkpcfjupsegouu.supabase.co",
  key: "sb_publishable_2xqtnwBkGZeYEyJJf7VtyA_dm9c-pFf",
};
const SHOOT_ID = "advene-2026fall-d1";
const LS_STATE = "hl-ad-" + SHOOT_ID;
const LS_KEY   = "hl-ad-key-" + SHOOT_ID;

/* ================= the schedule =================
   Public build: roles, not the cast's legal names; neighbourhood, not the
   street address of a private home. The timing — which is what the board is
   for — is the real thing. */
const CAST = { 1: "Celeste", 2: "Ellen", 3: "Lisa", 4: "Julian" };
const CAST_NOTE = {
  1: "young working mom", 2: "Brooklyn wanderer / grandma",
  3: "art history student", 4: "child",
};
const LOCNAME = {
  1: "Loc 01 · Brooklyn (interior)",
  2: "Loc 02 · Brooklyn (farmer's market)",
  3: "Loc 03 · Fort Greene Park",
};

// k: scene-int | scene-ext | turn | meal | move | setup | strike | wrap | marker
const BLOCKS = [
 {id:"b01",k:"setup",     s:480, m:60, t:"CREW CALL & SET-UP", sub:"Camera set-up (1 hr) · Wardrobe fittings begin · Art dept set dress · Breakfast", loc:1},
 {id:"b02",k:"scene-int", s:540, m:45, t:"SCENE 04 — INT. Kitchen", dn:"D", cast:[2], loc:1},
 {id:"b03",k:"turn",      s:585, m:20, t:"TURNAROUND → Sc. 01", sub:"Set change · Art Director: fitting · MU: prep next"},
 {id:"b04",k:"scene-int", s:605, m:50, t:"SCENE 01 — INT. Living Room Table", sub:"Look / Hero Bag", dn:"D", cast:[1], loc:1},
 {id:"b05",k:"turn",      s:655, m:20, t:"TURNAROUND → Sc. 05", sub:"Set change · Art Director: fitting · MU: prep next"},
 {id:"b06",k:"scene-int", s:675, m:45, t:"SCENE 05 — INT. Day Bed", dn:"D", cast:[3], loc:1},
 {id:"b07",k:"meal",      s:720, m:30, t:"LUNCH", sub:"30 min — never squeezed"},
 {id:"b08",k:"turn",      s:750, m:20, t:"TURNAROUND → Sc. 06", sub:"Reset to “waiting for car” · Art Director: fitting"},
 {id:"b09",k:"scene-int", s:770, m:45, t:"SCENE 06 — INT/EXT. Day Bed → Waiting for Car", dn:"D", cast:[3], loc:1},
 {id:"b10",k:"turn",      s:815, m:20, t:"TURNAROUND → Sc. 07", sub:"Art Director: fitting — Grandma into farmer's-market wardrobe · MU: all 3"},
 {id:"b11",k:"scene-int", s:835, m:50, t:"SCENE 07 — INT. Keys", dn:"D", cast:[1,2,3], loc:1},
 {id:"b12",k:"strike",    s:885, m:45, t:"INTERIOR STRIKE / wrap-out", sub:"May begin during Sc. 06 — the first place to find time"},
 {id:"b13",k:"marker",    s:930, m:0,  t:"INTERIOR HARD OUT", sub:"Lisa (3) wraps · Julian (4) call time @ interior", hard:true, short:"Interior hard out"},
 {id:"b14",k:"move",      s:930, m:15, t:"COMPANY MOVE — Interior → Exterior", sub:"15 min · Loc 01 → Loc 02"},
 {id:"b15",k:"setup",     s:945, m:30, t:"CAMERA + ACTOR SET-UP @ exterior", sub:"30 min · MU / wardrobe: Julian (4)", loc:2},
 {id:"b16",k:"scene-ext", s:975, m:40, t:"SCENE 03 — EXT. Farmer's Market", sub:"Julian + Celeste familiarize / rehearse nearby", dn:"D", cast:[2], loc:2},
 {id:"b17",k:"marker",    s:1015,m:0,  t:"ELLEN (2) WRAPS", short:"Ellen wraps"},
 {id:"b18",k:"turn",      s:1015,m:20, t:"TURNAROUND / move to Park → Sc. 02", sub:"Art Director: fitting (Celeste)"},
 {id:"b19",k:"scene-ext", s:1035,m:45, t:"SCENE 02 — EXT. Park", dn:"D", cast:[1,4], loc:3},
 {id:"b20",k:"marker",    s:1080,m:0,  t:"FINAL SHOT · ALL ACTORS WRAP", sub:"Celeste (1) + Julian (4) wrap", hard:true, short:"All actors wrapped"},
 {id:"b21",k:"wrap",      s:1080,m:60, t:"CAMERA / GEAR WRAP"},
 {id:"b22",k:"marker",    s:1140,m:0,  t:"FULL COMPANY WRAP — END OF DAY", hard:true, short:"Full company wrap"},
];

const KEY_NOTES = [
  "Interior <b>8:00 call</b>, <b>3:30 PM hard out</b> — the location clears on the dot.",
  "Shooting 9:00 AM – 2:45 PM (Sc. 04 / 01 / 05 / 06 / 07), each ~45–50 min.",
  "Every turnaround is 20 min: Art Director runs the fitting, MU preps the next actor.",
  "All actors wrapped by <b>6:00 PM</b>; full company wrap <b>7:00 PM</b>.",
  "Grandma stays in the farmer's-market wardrobe from Sc. 07 straight into Sc. 03 (continuity).",
  "DP note: no summer cues in the exterior.",
  "Interior strike may start during Sc. 06 — when the day slips, that's the first place to look.",
];

/* ================= floors & ceilings ================= */
const FLEX = new Set(["turn", "setup", "strike", "move", "wrap"]);
const isScene = (b) => b.k === "scene-int" || b.k === "scene-ext";
function floorOf(b) {
  const base = plan(b);
  switch (b.k) {
    case "scene-int": case "scene-ext": return Math.min(base, 30);
    case "turn":   return Math.min(base, 10);
    case "setup":  return Math.min(base, 15);
    case "strike": return Math.min(base, 20);
    case "move":   return Math.min(base, 10);
    case "wrap":   return Math.min(base, 30);
    default:       return base;                 // lunch and markers never move
  }
}
function ceilOf(b) {
  const base = plan(b);
  if (isScene(b)) return base + 25;
  if (b.k === "strike" || b.k === "wrap") return base + 15;
  return base;
}

/* ================= state ================= */
const DAY0 = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); })();
const pms = (min) => DAY0 + min * 60000;
let NOW = Date.now();

let S = { mode: "absorb", autoNext: true, blocks: {} };
let WRITE_KEY = null;            // null → read-only visitor
let APPLYING = false;            // suppress echo while adopting a remote state
let mounted = false, root = null, timer = 0, poll = 0, pushTimer = 0;
let lastRemoteAt = 0, syncState = "idle";
const R = {};                    // per-row DOM refs

const st = (b) => S.blocks[b.id];
const plan = (b) => Math.max(0, b.m + (S.blocks[b.id].adj || 0));
const idx = (b) => BLOCKS.indexOf(b);
const isPending = (b) => st(b).status === "pending";
const canWrite = () => Boolean(WRITE_KEY);

function blankState() {
  const blocks = {};
  BLOCKS.forEach(b => { blocks[b.id] = { status: "pending", start: null, end: null, adj: 0, note: "", etaEnd: null }; });
  return blocks;
}
function normalise() {
  BLOCKS.forEach(b => {
    S.blocks[b.id] = Object.assign({ status: "pending", start: null, end: null, adj: 0, note: "", etaEnd: null }, S.blocks[b.id] || {});
  });
  // Repair a board that already recorded two things rolling at once (an old
  // double-tap): the latest one is what the floor is actually shooting, and
  // the earlier ones closed when it began.
  const live = BLOCKS.filter(b => st(b).status === "running");
  if (live.length > 1) {
    const keep = live[live.length - 1];
    live.slice(0, -1).forEach(b => {
      const s = st(b);
      s.status = "done";
      s.end = st(keep).start || Date.now();
      if (s.start == null || s.start > s.end) s.start = s.end;
      s.etaEnd = null;
    });
  }
}
function loadLocal() {
  S = { mode: "absorb", autoNext: true, blocks: blankState() };
  try { const raw = localStorage.getItem(LS_STATE); if (raw) S = Object.assign(S, JSON.parse(raw)); } catch {}
  normalise();
}
function saveLocal() { try { localStorage.setItem(LS_STATE, JSON.stringify(S)); } catch {} }
function save() { saveLocal(); if (!APPLYING) pushSoon(); }

/* ================= projection engine ================= */
function baseDur() { const d = {}; BLOCKS.forEach(b => d[b.id] = plan(b)); return d; }

function runProjection(dur) {
  let cursor = pms(BLOCKS[0].s);
  const out = {};
  for (const b of BLOCKS) {
    const s = st(b);
    let ps, pe;
    if (s.status === "done" && s.start != null && s.end != null) { ps = s.start; pe = s.end; }
    // An overrunning block pinned at NOW quietly reports the day is fine right
    // up until it isn't. When the AD has called an ETA, project from that.
    else if (s.status === "running" && s.start != null) { ps = s.start; pe = Math.max(NOW, s.etaEnd || (s.start + dur[b.id] * 60000)); }
    else if (s.status === "skipped") { ps = cursor; pe = cursor; }
    else { ps = cursor; pe = ps + dur[b.id] * 60000; }
    out[b.id] = { ps, pe };
    cursor = pe;
  }
  return out;
}
function frontier() {
  let f = -1;
  BLOCKS.forEach((b, i) => { const s = st(b); if (s.status === "done" || s.status === "running" || s.status === "skipped") f = i; });
  return f;
}
/* pull `need` minutes out of a group (need > 0 = cut, need < 0 = hand back) */
function applyTo(list, d, need) {
  for (let round = 0; round < 24 && need !== 0; round++) {
    const able = list.filter(b => need > 0 ? d[b.id] > floorOf(b) : d[b.id] < ceilOf(b));
    if (!able.length) break;
    const per = need > 0 ? Math.max(1, Math.floor(need / able.length)) : Math.min(-1, Math.ceil(need / able.length));
    for (const b of able) {
      if (need === 0) break;
      const step = need > 0 ? Math.min(per, d[b.id] - floorOf(b), need)
                            : Math.max(per, d[b.id] - ceilOf(b), need);
      d[b.id] -= step; need -= step;
    }
  }
  return need;
}

let LAST = { residual: 0, anchor: null, need: 0, donors: [], atFloor: new Set() };

/* Walk every hard wall still ahead, nearest first, and make each land on time
   by taking minutes out of the blocks in front of it. Running ahead hands the
   surplus back to the remaining scenes, never to the buffers. */
function redistribute() {
  const d = baseDur();
  LAST = { residual: 0, anchor: null, need: 0, donors: [], atFloor: new Set() };
  if (S.mode === "cascade") return d;

  const f = frontier();
  const anchors = BLOCKS.filter((b, i) => b.hard && i > f);
  if (!anchors.length) return d;

  const before = {}; BLOCKS.forEach(b => before[b.id] = d[b.id]);
  let residual = 0;

  anchors.forEach((anchor, n) => {
    const p = runProjection(d);
    let need = Math.round((p[anchor.id].ps - pms(anchor.s)) / 60000);
    if (n === 0) { LAST.anchor = anchor; LAST.need = need; }

    const ia = idx(anchor);
    const pend = BLOCKS.filter((b, i) => i < ia && i > f && isPending(b) && b.m > 0);

    if (need < 0) { if (n === 0) applyTo(pend.filter(isScene), d, need); return; }
    if (need === 0) return;

    const groups = S.mode === "absorb"
      ? [pend.filter(b => FLEX.has(b.k)), pend.filter(isScene)]
      : [pend.filter(isScene), pend.filter(b => FLEX.has(b.k))];
    for (const g of groups) { if (need === 0) break; need = applyTo(g, d, need); }
    residual = Math.max(residual, need);
  });

  LAST.residual = residual;
  LAST.donors = BLOCKS.filter(b => d[b.id] !== before[b.id]).map(b => ({ b, delta: d[b.id] - before[b.id] }));
  BLOCKS.forEach(b => { if (b.m > 0 && isPending(b) && d[b.id] === floorOf(b) && d[b.id] < plan(b)) LAST.atFloor.add(b.id); });
  return d;
}

/* ================= formatting ================= */
function fmt(ms) {
  const dt = new Date(ms); let h = dt.getHours(); const m = dt.getMinutes();
  const ap = h >= 12 ? "PM" : "AM"; h = h % 12 || 12;
  return h + ":" + String(m).padStart(2, "0") + " " + ap;
}
function fmtShort(ms) {
  const dt = new Date(ms); let h = dt.getHours(); const m = dt.getMinutes();
  h = h % 12 || 12; return h + ":" + String(m).padStart(2, "0");
}
const signed = (n) => (n > 0 ? "+" : n < 0 ? "−" : "±") + Math.abs(n);
const shortName = (b) => { const m = b.t.match(/SCENE \d+/); return m ? m[0] : b.t.split("—")[0].trim(); };
const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

/* ================= sync ================= */
async function rpc(fn, body) {
  const r = await fetch(`${SUPA.url}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: { apikey: SUPA.key, Authorization: `Bearer ${SUPA.key}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(await r.text() || r.status);
  return r.json();
}
function snapshotForSync() {
  const blocks = {};
  BLOCKS.forEach(b => { const x = st(b); blocks[b.id] = { status: x.status, start: x.start, end: x.end, adj: x.adj || 0, note: x.note || "", etaEnd: x.etaEnd || null }; });
  return { blocks, mode: S.mode, autoNext: S.autoNext, v: 3 };
}
function setSync(state, txt) {
  syncState = state;
  const p = root && root.querySelector("#ad-sync");
  if (p) { p.dataset.s = state; p.querySelector("span").textContent = txt; }
}
function pushSoon() {
  if (!canWrite()) return;
  setSync("pending", "Saving…");
  clearTimeout(pushTimer);
  pushTimer = setTimeout(async () => {
    try {
      const ts = await rpc("shoot_put", { p_id: SHOOT_ID, p_key: WRITE_KEY, p_state: snapshotForSync() });
      lastRemoteAt = new Date(ts).getTime();
      setSync("on", "Synced " + fmtShort(Date.now()));
    } catch (e) {
      setSync("err", /bad key/.test(String(e)) ? "Key rejected — local only" : "Offline — local only");
    }
  }, 700);
}
function applyRemote(d) {
  if (!d || !d.blocks) return;
  APPLYING = true;
  BLOCKS.forEach(b => {
    const cur = st(b), nx = d.blocks[b.id];
    if (!nx) return;
    cur.status = nx.status || "pending";
    cur.start = nx.start ?? null;
    cur.end = nx.end ?? null;
    cur.adj = nx.adj || 0;
    cur.note = nx.note || "";
    cur.etaEnd = nx.etaEnd ?? null;
    const inp = R[b.id] && R[b.id].note;
    if (inp && document.activeElement !== inp) inp.value = cur.note;
  });
  // Only trust a mode written by a build that knows holding the wrap is the
  // default; an older document would otherwise drag the board back to cascade.
  if (d.mode && d.v >= 3) S.mode = d.mode;
  if (typeof d.autoNext === "boolean") S.autoNext = d.autoNext;
  normalise();
  saveLocal();
  APPLYING = false;
  syncControls(); paintAllActions(); tick();
}
async function pullOnce(initial) {
  try {
    const rows = await rpc("shoot_get", { p_id: SHOOT_ID });
    const row = Array.isArray(rows) ? rows[0] : rows;
    if (!row) { if (initial && canWrite()) pushSoon(); return; }
    const at = new Date(row.updated_at).getTime();
    if (at <= lastRemoteAt && !initial) return;
    lastRemoteAt = at;
    if (row.state && row.state.blocks) applyRemote(row.state);
    setSync(canWrite() ? "on" : "read", canWrite() ? "Synced" : "Live · read-only");
  } catch {
    setSync("err", canWrite() ? "Offline — local only" : "Offline");
  }
}

/* ================= actions ================= */
function nextActionable(from) {
  for (let i = from + 1; i < BLOCKS.length; i++) if (BLOCKS[i].m > 0 && st(BLOCKS[i]).status === "pending") return BLOCKS[i];
  return null;
}
function act(b, a) {
  if (!canWrite()) return;
  const s = st(b), t = Date.now();
  // A double-tap on Done used to close the block twice and auto-start a second
  // item alongside the one already rolling. Only a running block can be done.
  if (a === "done" && s.status !== "running") return;
  if (a === "start" && s.status === "running") return;
  if (a === "start") {
    BLOCKS.forEach(x => { if (st(x).status === "running") { st(x).status = "done"; st(x).end = t; } });
    s.status = "running"; s.start = t; s.end = null; s.etaEnd = null;
  } else if (a === "done") {
    s.status = "done"; s.end = t; s.etaEnd = null;
    if (S.autoNext && !BLOCKS.some(x => st(x).status === "running")) {
      const n = nextActionable(idx(b));
      if (n) { st(n).status = "running"; st(n).start = t; st(n).end = null; st(n).etaEnd = null; }
    }
  } else if (a === "reopen") { s.status = "running"; s.end = null; if (s.start == null) s.start = t; }
  else if (a === "cancel") { s.status = "pending"; s.start = null; s.end = null; s.etaEnd = null; }
  else if (a === "eta5") { s.etaEnd = t + 5 * 60000; }
  else if (a === "eta10") { s.etaEnd = t + 10 * 60000; }
  else if (a === "eta15") { s.etaEnd = t + 15 * 60000; }
  else if (a === "etaClear") { s.etaEnd = null; }
  else if (a === "skip") { s.status = "skipped"; s.start = null; s.end = null; }
  else if (a === "plus") { s.adj = (s.adj || 0) + 5; }
  else if (a === "plus10") { s.adj = (s.adj || 0) + 10; }
  else if (a === "minus") { s.adj = (s.adj || 0) - 5; if (b.m + s.adj < 5) s.adj = 5 - b.m; }
  else if (a === "edit") {
    const r = R[b.id]; r.edit.classList.toggle("on");
    if (r.edit.classList.contains("on")) {
      if (s.start != null) r.tin.value = toTimeVal(s.start);
      if (s.end != null) r.tout.value = toTimeVal(s.end);
    }
    return;
  }
  save(); paintAllActions(); tick();
}
const toTimeVal = (ms) => { const d = new Date(ms); return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); };
function setActual(b, which, val) {
  if (!val || !canWrite()) return;
  const [h, m] = val.split(":").map(Number);
  st(b)[which] = DAY0 + (h * 60 + m) * 60000;
  if (which === "end" && st(b).status === "running") st(b).status = "done";
  save(); paintAllActions(); tick();
}

/* ================= markup ================= */
function shell() {
  return `
  <div class="ad-slab">
    <div class="ad-slab-top">
      <div class="ad-prod">ADVEVE <em>2026 Fall</em></div>
      <div class="ad-daytag">Day 1 · Sat 5 Sep 2026 · Brooklyn</div>
      <div class="ad-clock"><b id="ad-clock">--:--</b><span>now</span></div>
    </div>
    <div class="ad-stats">
      <div class="ad-stat"><div class="k">Running</div><div class="v" id="ad-var">±0</div><div class="s" id="ad-var-s">not started</div></div>
      <div class="ad-stat"><div class="k">Next wall</div><div class="v" id="ad-wall">3:30</div><div class="s" id="ad-wall-s">Interior hard out</div></div>
      <div class="ad-stat"><div class="k">Company wrap</div><div class="v" id="ad-wrap">7:00</div><div class="s" id="ad-wrap-s">plan 7:00 PM</div></div>
      <div class="ad-stat"><div class="k">Progress</div><div class="v" id="ad-prog">0/16</div><div class="s" id="ad-prog-s">—</div></div>
    </div>
    <div class="ad-now">
      <div class="ad-now-l">
        <div class="lbl" id="ad-now-lbl">Standby</div>
        <div class="ttl" id="ad-now-ttl">—</div>
        <div class="meta" id="ad-now-meta"></div>
        <div class="ad-track"><i id="ad-now-fill"></i></div>
      </div>
      <div class="ad-now-acts" id="ad-now-acts"></div>
    </div>
    <div class="ad-daybar" id="ad-daybar"></div>
  </div>

  <div class="ad-ribbon">
    <div class="ad-seg" id="ad-modes">
      <button data-mode="absorb">Hold wrap · squeeze buffers</button>
      <button data-mode="rebalance">Hold wrap · squeeze scenes</button>
      <button data-mode="cascade">Let it slide</button>
    </div>
    <label class="ad-pill"><input type="checkbox" id="ad-auto"> Auto-start next</label>
    <span class="ad-pill ad-sync" id="ad-sync" data-s="idle"><i></i><span>…</span></span>
    <span class="ad-spacer"></span>
    <button class="ad-pill" id="ad-report">Day report</button>
    <button class="ad-pill" id="ad-reset">Reset day</button>
  </div>
  <div class="ad-modenote" id="ad-modenote"></div>
  <div class="ad-donors" id="ad-donors" hidden></div>
  <div class="ad-readonly" id="ad-readonly" hidden>
    Watching live. The AD running the board holds the key that changes it.
  </div>

  <div class="ad-rail" id="ad-rail"></div>

  <div class="ad-board">
    <div class="ad-bhead"><div></div><div>Actual / plan</div><div>Item</div><div class="r">Min</div><div class="r">Run</div></div>
    <div id="ad-rows"></div>
  </div>

  <div class="ad-panels">
    <div class="ad-panel">
      <h3>Key notes</h3>
      <ul class="ad-notes">${KEY_NOTES.map(n => `<li>${n}</li>`).join("")}</ul>
    </div>
    <div class="ad-panel">
      <h3>Cast</h3>
      <div class="ad-deflist">${[1,2,3,4].map(c =>
        `<div class="ad-def"><span class="n">${c}</span><span class="a"><b>${CAST[c]}</b>${CAST_NOTE[c]}</span></div>`).join("")}</div>
      <h3 style="margin-top:14px">Locations</h3>
      <div class="ad-deflist">${[1,2,3].map(l =>
        `<div class="ad-def"><span class="n">0${l}</span><span class="a">${LOCNAME[l].split(" · ")[1]}</span></div>`).join("")}</div>
    </div>
  </div>

  <div class="ad-foot">
    Planned times come from the Sept 5 shooting schedule; projected times are recomputed from the AD's taps.
    Cast are listed by role and locations by neighbourhood.
  </div>`;
}

function buildRows() {
  const host = root.querySelector("#ad-rows");
  host.innerHTML = "";
  for (const b of BLOCKS) {
    const s = st(b);
    const el = document.createElement("div");
    el.className = "ad-strip";
    el.dataset.k = b.k;
    el.dataset.st = s.status;

    const chips = [];
    if (b.dn) chips.push(`<span class="ad-chip dn">${b.dn}</span>`);
    (b.cast || []).forEach(c => chips.push(`<span class="ad-chip cast">${c} ${CAST[c]}</span>`));
    if (b.loc) chips.push(`<span class="ad-chip loc">${LOCNAME[b.loc]}</span>`);

    el.innerHTML =
      `<span class="ad-edge"></span>
       <div class="ad-c-time">
         <div class="tp" data-r="tp">—</div>
         <div class="tpl" data-r="tpl"></div>
         <div class="shift" data-r="shift"></div>
       </div>
       <div class="ad-c-main">
         <div class="ad-ttl">${esc(b.t)}</div>
         ${b.sub ? `<div class="ad-sub">${b.sub}</div>` : ""}
         ${chips.length ? `<div class="ad-chips">${chips.join("")}</div>` : ""}
         ${b.m > 0 ? `<div class="ad-rowtrack" data-r="track" hidden><i data-r="fill"></i></div>` : ""}
         ${b.m > 0 ? `<input class="ad-note" data-r="note" placeholder="note" value="${esc(s.note || "")}">` : ""}
         ${b.m > 0 ? `<div class="ad-editrow" data-r="edit">
            <label>in</label><input type="time" data-r="tin">
            <label>out</label><input type="time" data-r="tout"></div>` : ""}
       </div>
       <div class="ad-c-dur">
         ${b.m > 0 ? `<div class="d" data-r="d">${b.m}</div><div class="dd" data-r="dd"></div>` : `<div class="du">wall</div>`}
       </div>
       <div class="ad-c-act"><div class="arow" data-r="acts"></div></div>`;

    host.appendChild(el);
    const q = (n) => el.querySelector(`[data-r="${n}"]`);
    R[b.id] = { el, tp: q("tp"), tpl: q("tpl"), shift: q("shift"), track: q("track"), fill: q("fill"),
                note: q("note"), d: q("d"), dd: q("dd"), acts: q("acts"), edit: q("edit"), tin: q("tin"), tout: q("tout") };
    if (R[b.id].note) {
      R[b.id].note.readOnly = !canWrite();
      R[b.id].note.addEventListener("input", e => { s.note = e.target.value; save(); });
    }
    if (R[b.id].tin) {
      R[b.id].tin.addEventListener("change", e => setActual(b, "start", e.target.value));
      R[b.id].tout.addEventListener("change", e => setActual(b, "end", e.target.value));
    }
    paintActions(b);
  }
}

function paintActions(b) {
  const r = R[b.id], s = st(b);
  if (!r) return;
  r.el.dataset.st = s.status;
  if (b.m === 0 || !canWrite()) { r.acts.innerHTML = ""; return; }
  let h = "";
  if (s.status === "pending")      h = `<button class="ad-btn go" data-a="start">Start</button><button class="ad-btn t" data-a="skip">Skip</button>`;
  else if (s.status === "running") h = `<button class="ad-btn fin" data-a="done">Done</button><button class="ad-btn t" data-a="cancel">Undo</button>`
    + `<div class="ad-brk"></div><span class="ad-etalbl">needs</span>`
    + `<button class="ad-btn t" data-a="eta5">5</button><button class="ad-btn t" data-a="eta10">10</button><button class="ad-btn t" data-a="eta15">15</button>`
    + (s.etaEnd ? `<button class="ad-btn t" data-a="etaClear">×</button>` : "");
  else if (s.status === "done")    h = `<button class="ad-btn t" data-a="reopen">Reopen</button>`;
  else                             h = `<button class="ad-btn t" data-a="cancel">Restore</button>`;
  h += s.status === "running"
     ? `<div class="ad-brk"></div><button class="ad-btn t" data-a="edit">✎</button>`
     : `<div class="ad-brk"></div>
        <button class="ad-btn t" data-a="minus">−5</button>
        <button class="ad-btn t" data-a="plus">+5</button>
        <button class="ad-btn t" data-a="plus10">+10</button>`
       + (s.status === "pending" ? "" : `<button class="ad-btn t" data-a="edit">✎</button>`);
  r.acts.innerHTML = h;
  r.acts.querySelectorAll("button").forEach(btn => btn.addEventListener("click", () => act(b, btn.dataset.a)));
  if (s.status === "pending" && r.edit) r.edit.classList.remove("on");
}
const paintAllActions = () => BLOCKS.forEach(paintActions);

function syncControls() {
  root.querySelectorAll("#ad-modes button").forEach(x => x.setAttribute("aria-pressed", String(x.dataset.mode === S.mode)));
  const a = root.querySelector("#ad-auto");
  if (a) a.checked = S.autoNext;
}

/* ================= tick ================= */
function $r(id) { return root.querySelector("#" + id); }

function tick() {
  if (!mounted) return;
  NOW = Date.now();
  $r("ad-clock").textContent = fmt(NOW);

  const d = redistribute();
  const P = runProjection(d);

  for (const b of BLOCKS) {
    const r = R[b.id], s = st(b), p = P[b.id];
    r.tp.textContent = fmt(p.ps);
    r.tpl.textContent = b.m === 0 ? "plan " + fmt(pms(b.s)) : "plan " + fmtShort(pms(b.s)) + "–" + fmtShort(pms(b.s + b.m));
    const shift = Math.round((p.ps - pms(b.s)) / 60000);
    r.shift.textContent = shift === 0 ? "" : signed(shift) + "m";
    r.shift.className = "shift " + (shift === 0 ? "" : shift > 0 ? "bad" : "good");

    if (b.m > 0) {
      const used = (s.status === "done" && s.start != null && s.end != null) ? Math.round((s.end - s.start) / 60000)
                 : (s.status === "running" && s.start != null) ? Math.round((NOW - s.start) / 60000) : null;
      const target = d[b.id];
      if (s.status === "done") {
        r.d.textContent = used;
        const dd = used - plan(b);
        r.dd.textContent = dd === 0 ? "on plan" : signed(dd) + "m";
        r.dd.className = "dd " + (dd > 0 ? "bad" : dd < 0 ? "good" : "");
      } else if (s.status === "running") {
        r.d.innerHTML = `${used}<small>/${target}</small>`;
        const left = target - used;
        if (s.etaEnd && s.etaEnd > NOW) {
          r.dd.textContent = "out ~" + fmtShort(s.etaEnd);
          r.dd.className = "dd eta";
        } else {
          r.dd.textContent = left >= 0 ? left + "m left" : signed(-left) + "m over";
          r.dd.className = "dd " + (left < 0 ? "bad" : "");
        }
      } else {
        const changed = target !== b.m;
        r.d.innerHTML = changed ? `<s>${b.m}</s>${target}` : String(target);
        const dd = target - b.m;
        const atFloor = LAST.atFloor.has(b.id);
        r.dd.textContent = dd === 0 ? "" : signed(dd) + "m" + (atFloor ? " · floor" : "");
        r.dd.className = "dd " + (dd === 0 ? "" : atFloor ? "floor" : "adj");
      }
      if (r.track) {
        if (s.status === "running") {
          r.track.hidden = false;
          r.fill.style.width = Math.min(100, (used / Math.max(1, target)) * 100) + "%";
          r.fill.classList.toggle("over", used > target);
        } else r.track.hidden = true;
      }
    }
  }

  const f = frontier();
  let varMin = 0, varSrc = "not started";
  if (f >= 0) {
    const fb = BLOCKS[f];
    varMin = Math.round((P[fb.id].pe - pms(fb.s + fb.m)) / 60000);
    varSrc = (st(fb).status === "running" ? "on " : "through ") + shortName(fb);
  }
  const v = $r("ad-var");
  v.textContent = varMin === 0 ? "±0" : signed(varMin) + "m";
  v.className = "v " + (varMin > 0 ? "bad" : varMin < 0 ? "good" : "");
  $r("ad-var-s").textContent = varSrc + (varMin > 0 ? " · behind" : varMin < 0 ? " · ahead" : "");

  const wall = BLOCKS.find((b, i) => b.hard && i > f);
  if (wall) {
    const slip = Math.round((P[wall.id].ps - pms(wall.s)) / 60000);
    $r("ad-wall").textContent = fmtShort(pms(wall.s));
    $r("ad-wall").className = "v " + (slip > 0 ? "bad" : slip < 0 ? "good" : "");
    $r("ad-wall-s").textContent = wall.short + " · proj " + fmtShort(P[wall.id].ps);
  } else { $r("ad-wall").textContent = "—"; $r("ad-wall").className = "v"; $r("ad-wall-s").textContent = "all clear"; }

  const last = BLOCKS[BLOCKS.length - 1];
  const wrapSlip = Math.round((P[last.id].ps - pms(last.s)) / 60000);
  $r("ad-wrap").textContent = fmtShort(P[last.id].ps);
  $r("ad-wrap").className = "v " + (wrapSlip > 0 ? "bad" : wrapSlip < 0 ? "good" : "");
  $r("ad-wrap-s").textContent = "plan 7:00 PM · " + signed(wrapSlip) + "m";

  const work = BLOCKS.filter(b => b.m > 0);
  const doneN = work.filter(b => st(b).status === "done" || st(b).status === "skipped").length;
  $r("ad-prog").textContent = doneN + "/" + work.length;
  $r("ad-prog-s").textContent = "scenes " + BLOCKS.filter(b => isScene(b) && st(b).status === "done").length + "/" + BLOCKS.filter(isScene).length;

  /* now bar */
  const cur = BLOCKS.find(b => st(b).status === "running");
  const acts = $r("ad-now-acts");
  if (cur) {
    const s = st(cur), target = d[cur.id], used = Math.round((NOW - s.start) / 60000), left = target - used;
    const taken = LAST.donors.filter(x => x.delta < 0).reduce((a, x) => a - x.delta, 0);
    $r("ad-now-lbl").textContent = "On the floor — since " + fmt(s.start);
    $r("ad-now-ttl").textContent = cur.t;
    const outAt = s.etaEnd && s.etaEnd > NOW ? ` · out ~${fmt(s.etaEnd)}` : "";
    $r("ad-now-meta").textContent = `${used} / ${target} min${outAt} · ${left >= 0 ? left + " min left" : (-left) + " min over"}`
      + (S.mode !== "cascade" && taken ? ` · ${taken} min taken from ${LAST.donors.filter(x => x.delta < 0).length} later items, wrap unchanged` : "")
      + ` · next: ${nextActionable(idx(cur)) ? nextActionable(idx(cur)).t : "wrap"}`;
    const span = s.etaEnd && s.etaEnd > NOW ? Math.round((s.etaEnd - s.start) / 60000) : target;
    $r("ad-now-fill").style.width = Math.min(100, (used / Math.max(1, span)) * 100) + "%";
    $r("ad-now-fill").classList.toggle("over", used > target);
    if (canWrite() && acts.dataset.for !== cur.id) {
      acts.dataset.for = cur.id;
      acts.innerHTML = `<button class="ad-big" data-g="done">Done</button>
                        <span class="ad-etalbl big">still needs</span>
                        <button class="ad-big ghost" data-g="eta5">5 min</button>
                        <button class="ad-big ghost" data-g="eta10">10 min</button>
                        <button class="ad-big ghost" data-g="eta15">15 min</button>`;
      acts.querySelectorAll("button").forEach(x => x.addEventListener("click", () => act(cur, x.dataset.g)));
    }
  } else {
    const nx = nextActionable(f);
    $r("ad-now-lbl").textContent = "Standby";
    $r("ad-now-ttl").textContent = nx ? "Next — " + nx.t : "Day complete";
    $r("ad-now-meta").textContent = nx ? `plan ${fmt(pms(nx.s))} · projected ${fmt(P[nx.id].ps)} · ${d[nx.id]} min` : "That's a wrap.";
    $r("ad-now-fill").style.width = "0%";
    if (canWrite() && acts.dataset.for !== (nx ? nx.id : "none")) {
      acts.dataset.for = nx ? nx.id : "none";
      acts.innerHTML = nx ? `<button class="ad-big" data-g="start">Start</button>` : "";
      if (nx) acts.querySelector("button").addEventListener("click", () => act(nx, "start"));
    }
  }
  if (!canWrite()) acts.innerHTML = "";

  /* mode note + donor ledger */
  let note;
  if (S.mode === "cascade") {
    note = "<b>Letting it slide.</b> Nothing is squeezed — every overrun pushes the end of the day later. Useful for seeing the true cost.";
  } else {
    const a = LAST.anchor;
    const how = S.mode === "absorb" ? "turnarounds, set-ups and strike first; scenes only once those hit their floor"
                                    : "the remaining scenes first, turnarounds kept whole";
    if (!a) note = "Every hard wall is behind us.";
    else if (LAST.need === 0) note = `<b>Wrap is held.</b> Squeezing ${how}. Dead on <b>${a.short} ${fmtShort(pms(a.s))}</b> right now — nothing has been touched.`;
    else if (LAST.need > 0) note = `<b>Wrap is held.</b> The <b>${LAST.need} min</b> overrun has been taken out of later items, so <b>${a.short} ${fmtShort(pms(a.s))}</b> and the 7:00 PM wrap both stand. Squeezing ${how}.`
      + (LAST.residual > 0 ? ` <b class="warn">${LAST.residual} min can't be found</b> — something has to be cut, or that wall moves.` : "");
    else note = `<b>${-LAST.need} min ahead.</b> The surplus has gone back into the remaining scenes (up to +25 min each) — take more coverage.`;
  }
  $r("ad-modenote").innerHTML = note;

  const dl = $r("ad-donors");
  if (!LAST.donors.length) dl.hidden = true;
  else {
    const cut = LAST.donors.filter(x => x.delta < 0), give = LAST.donors.filter(x => x.delta > 0);
    const total = LAST.donors.reduce((a, x) => a + Math.abs(x.delta), 0);
    const chip = (x) => `<span class="dchip ${x.delta < 0 ? "cut" : "give"}"><b>${esc(shortName(x.b))}</b>${signed(x.delta)}m</span>`;
    const h = `<span class="cap">${cut.length ? "Where the time came from" : "Where the time went"} · ${total} min</span>`
            + cut.map(chip).join("") + give.map(chip).join("");
    if (dl.dataset.h !== h) { dl.dataset.h = h; dl.innerHTML = h; }
    dl.hidden = false;
  }

  renderCast(P);
  renderDayBar(P);
}

function renderCast(P) {
  const rail = $r("ad-rail");
  const html = [1, 2, 3, 4].map(c => {
    const mine = BLOCKS.filter(b => (b.cast || []).includes(c));
    const pend = mine.filter(b => st(b).status === "pending");
    const run = mine.find(b => st(b).status === "running");
    let s, line;
    if (run) { s = "working"; line = "Shooting · " + shortName(run); }
    else if (pend.length) {
      const t = P[pend[0].id].ps, mins = Math.round((t - NOW) / 60000);
      s = mins <= 45 ? "soon" : "idle";
      line = `${shortName(pend[0])} · ${fmtShort(t)}${mins > 0 ? " · in " + (mins >= 60 ? Math.floor(mins / 60) + "h " + (mins % 60) + "m" : mins + "m") : ""}`;
    }
    else if (mine.some(b => st(b).status === "done")) { s = "wrapped"; line = "Wrapped ✓"; }
    else { s = "idle"; line = "—"; }
    return `<div class="ad-cast" data-s="${s}"><div class="num">Cast ${c}</div><div class="nm">${CAST[c]}</div><div class="stt">${line}</div></div>`;
  }).join("");
  if (rail.dataset.h !== html) { rail.dataset.h = html; rail.innerHTML = html; }
}

function renderDayBar(P) {
  const bar = $r("ad-daybar");
  const start = pms(BLOCKS[0].s);
  const end = Math.max(P[BLOCKS[BLOCKS.length - 1].id].pe, pms(1140));
  const span = end - start;
  const COL = { "scene-int": "var(--folder)", "scene-ext": "var(--accent)", turn: "#5A6472", meal: "#2A8C93",
                move: "#8E7CDA", setup: "#4A525F", strike: "#4A525F", wrap: "#4A525F" };
  let h = "";
  for (const b of BLOCKS) {
    if (b.m === 0) continue;
    const w = ((P[b.id].pe - P[b.id].ps) / span) * 100;
    const alive = st(b).status === "running";
    h += `<span style="width:${w.toFixed(3)}%;background:${COL[b.k]};opacity:${st(b).status === "done" ? .4 : alive ? 1 : .78}${alive ? ";box-shadow:inset 0 0 0 1.5px #fff" : ""}"></span>`;
  }
  BLOCKS.filter(b => b.hard).forEach(b => {
    h += `<span class="anch" style="left:${(((pms(b.s) - start) / span) * 100).toFixed(3)}%"></span>`;
  });
  if (NOW > start && NOW < end) h += `<span class="nowline" style="left:${(((NOW - start) / span) * 100).toFixed(3)}%"></span>`;
  if (bar.dataset.h !== h) { bar.dataset.h = h; bar.innerHTML = h; }
}

/* ================= day report ================= */
function dayReport() {
  const d = redistribute(), P = runProjection(d);
  const pad = (s, n) => { s = String(s); return s.length >= n ? s.slice(0, n - 1) + " " : s + " ".repeat(n - s.length); };
  const L = ["ADVEVE 2026 FALL — DAY 1 · Sat 5 Sep 2026 · Brooklyn",
             "Actual vs planned — " + fmt(NOW), "",
             pad("ITEM", 46) + pad("PLAN", 16) + pad("ACTUAL/PROJ", 16) + pad("MIN", 9) + "Δ",
             "─".repeat(96)];
  for (const b of BLOCKS) {
    const s = st(b), p = P[b.id];
    const planTxt = b.m === 0 ? fmtShort(pms(b.s)) : fmtShort(pms(b.s)) + "–" + fmtShort(pms(b.s + b.m));
    const actTxt = b.m === 0 ? fmtShort(p.ps) : fmtShort(p.ps) + "–" + fmtShort(p.pe);
    const used = (s.status === "done" && s.start != null && s.end != null) ? Math.round((s.end - s.start) / 60000) : d[b.id];
    const delta = b.m === 0 ? Math.round((p.ps - pms(b.s)) / 60000) : used - b.m;
    const flag = s.status === "done" ? "" : s.status === "running" ? "  «shooting»" : s.status === "skipped" ? "  «skipped»" : "  (proj)";
    L.push(pad(b.t.slice(0, 44), 46) + pad(planTxt, 16) + pad(actTxt, 16) + pad(b.m === 0 ? "—" : used + "/" + b.m, 9) + (delta === 0 ? "±0" : signed(delta)) + flag);
    if (s.note) L.push("    ↳ " + s.note);
  }
  L.push("─".repeat(96));
  const last = BLOCKS[BLOCKS.length - 1];
  L.push("Projected full company wrap: " + fmt(P[last.id].ps) + "  (plan 7:00 PM, " + signed(Math.round((P[last.id].ps - pms(last.s)) / 60000)) + " min)");
  return L.join("\n");
}

/* ================= mount / unmount ================= */
function readKey() {
  const m = /(?:^|[#&])k=([A-Za-z0-9_-]{12,})/.exec(location.hash || "");
  if (m) { try { localStorage.setItem(LS_KEY, m[1]); } catch {} return m[1]; }
  try { return localStorage.getItem(LS_KEY) || null; } catch { return null; }
}

function mount(host) {
  if (mounted) return;
  root = host; mounted = true;
  WRITE_KEY = readKey();
  loadLocal();
  root.innerHTML = shell();
  root.classList.toggle("ad-ro", !canWrite());
  $r("ad-readonly").hidden = canWrite();

  buildRows();
  syncControls();

  root.querySelectorAll("#ad-modes button").forEach(btn => btn.addEventListener("click", () => {
    if (!canWrite()) return;
    S.mode = btn.dataset.mode; save(); syncControls(); tick();
  }));
  const auto = $r("ad-auto");
  auto.disabled = !canWrite();
  auto.addEventListener("change", () => { S.autoNext = auto.checked; save(); });
  const reset = $r("ad-reset");
  reset.hidden = !canWrite();
  reset.addEventListener("click", () => {
    if (!canWrite()) return;
    if (!confirm("Clear every start, finish, nudge and note for today? Every device sees this.")) return;
    S.blocks = blankState();
    save(); buildRows(); syncControls(); tick();
  });
  $r("ad-report").addEventListener("click", () => {
    const t = dayReport();
    navigator.clipboard && navigator.clipboard.writeText(t).catch(() => {});
    window.ADBoardReport ? window.ADBoardReport(t) : alert(t);
  });

  setSync(canWrite() ? "pending" : "read", canWrite() ? "Connecting…" : "Live · read-only");
  pullOnce(true);
  tick();
  timer = setInterval(tick, 1000);
  poll = setInterval(() => pullOnce(false), 8000);
}

function unmount() {
  if (!mounted) return;
  mounted = false;
  clearInterval(timer); clearInterval(poll); clearTimeout(pushTimer);
  Object.keys(R).forEach(k => delete R[k]);
  if (root) root.innerHTML = "";
  root = null;
}

return { mount, unmount, report: dayReport };
})();
