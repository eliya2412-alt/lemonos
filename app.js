/* ============================================================
   LemonVM — a virtual machine manager that runs in the browser
   ============================================================ */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const el = (tag, cls, html) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html != null) n.innerHTML = html;
  return n;
};
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const uid = () => Math.random().toString(36).slice(2, 9);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* ---------------- Icons ---------------- */
const ICO = {
  windows: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="8" height="8" rx="1.4" fill="#fff"/><rect x="13" y="3" width="8" height="8" rx="1.4" fill="#fff"/><rect x="3" y="13" width="8" height="8" rx="1.4" fill="#fff"/><rect x="13" y="13" width="8" height="8" rx="1.4" fill="#fff"/></svg>',
  ubuntu: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.6" fill="none" stroke="#fff" stroke-width="2"/><circle cx="12" cy="12" r="3.3" fill="none" stroke="#fff" stroke-width="2"/><circle cx="12" cy="4.4" r="1.6" fill="#fff"/><circle cx="18.6" cy="16" r="1.6" fill="#fff"/><circle cx="5.4" cy="16" r="1.6" fill="#fff"/></svg>',
  macos: '<svg viewBox="0 0 24 24"><text x="12" y="17.5" text-anchor="middle" font-size="19" font-family="system-ui" fill="#fff">⌘</text></svg>',
  kali: '<svg viewBox="0 0 24 24"><path d="M8 4v16M8 12l7.5-8M8 12l7.5 8" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  debian: '<svg viewBox="0 0 24 24"><path d="M12 3.2a8.8 8.8 0 1 0 8.3 11.6" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/><path d="M12 8a4 4 0 1 0 3.6 6.2" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/></svg>',
  fedora: '<svg viewBox="0 0 24 24"><path d="M15.5 4.8c-2.6 0-4.2 1.6-4.2 4.2V20" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><path d="M8 11.5h7.4" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/></svg>',
  arch: '<svg viewBox="0 0 24 24"><path d="M12 3.2 20.5 20H3.5z" fill="none" stroke="#fff" stroke-width="2.2" stroke-linejoin="round"/><path d="M12 3.2v8.6" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/></svg>',
  mint: '<svg viewBox="0 0 24 24"><path d="M5 19.5C5 11 11 5 19.5 5c0 8.5-6 14.5-14.5 14.5z" fill="none" stroke="#fff" stroke-width="2.2" stroke-linejoin="round"/><path d="M5 19.5C9 15.5 12.5 12 17 7.5" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/></svg>',
  freebsd: '<svg viewBox="0 0 24 24"><path d="M12 3.5V20" stroke="#fff" stroke-width="2.3" stroke-linecap="round"/><path d="M7.5 7.5 12 3.5l4.5 4" fill="none" stroke="#fff" stroke-width="2.3" stroke-linejoin="round"/><path d="M8 13.5h8" stroke="#fff" stroke-width="2.3" stroke-linecap="round"/></svg>',
  android: '<svg viewBox="0 0 24 24"><rect x="5.5" y="9" width="13" height="9.5" rx="4" fill="none" stroke="#fff" stroke-width="2.2"/><path d="M9 9 7 6M15 9l2-3" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/><circle cx="9.5" cy="13.5" r="1.2" fill="#fff"/><circle cx="14.5" cy="13.5" r="1.2" fill="#fff"/></svg>',
  linux: '<svg viewBox="0 0 24 24"><text x="12" y="18" text-anchor="middle" font-size="17">🐧</text></svg>',
};

/* ---------------- OS catalog ---------------- */
const OS = {
  windows: {
    name: "Windows 11", cat: "Windows", tile: "linear-gradient(140deg,#38bdf8,#0b5cd5)",
    a1: "#38bdf8", a2: "#6366f1", glyph: ICO.windows, mark: "🪟", logo: "🪟",
    wall: "radial-gradient(circle at 28% 18%, #1e40af 0%, #0b1220 62%)",
    defaults: { cpu: 4, ram: 8, disk: 64 },
    boot: [
      ["SeaBIOS (version 1.16.2-1)", "dimc"],
      ["Booting from Hard Disk...", ""],
      ["Windows Boot Manager", "ok"],
      ["Loading files... 100%", "ok"],
      ["Starting Windows...", ""],
    ],
  },
  ubuntu: {
    name: "Ubuntu 24.04", cat: "Linux", tile: "linear-gradient(140deg,#f97316,#b4281e)",
    a1: "#f97316", a2: "#e11d48", glyph: ICO.ubuntu, mark: "🟠", logo: "🟠",
    wall: "radial-gradient(circle at 70% 25%, #7c2d12 0%, #1a0e0a 62%)",
    defaults: { cpu: 2, ram: 4, disk: 32 },
    boot: [
      ["GNU GRUB version 2.06 — Ubuntu", "dimc"],
      ["Loading Linux 6.8.0-45-generic ...", ""],
      ["Loading initial ramdisk ...", ""],
      ["[  OK  ] Reached target Basic System", "ok"],
      ["[  OK  ] Started GNOME Display Manager", "ok"],
      ["[  OK  ] Started Network Manager", "ok"],
    ],
  },
  macos: {
    name: "macOS Sonoma", cat: "macOS", tile: "linear-gradient(140deg,#9ca3af,#374151)",
    a1: "#cbd5e1", a2: "#64748b", glyph: ICO.macos, mark: "⌘", logo: "⌘",
    wall: "linear-gradient(160deg,#0f172a 0%, #4c1d95 45%, #be185d 100%)",
    defaults: { cpu: 6, ram: 8, disk: 80 },
    boot: [
      ["AppleEFI 1.0 (Virtualization.framework)", "dimc"],
      ["Loading kernel cache ...", ""],
      ["Kernel is LP64", "dimc"],
      ["macOS Sonoma 14.6 starting up ...", "ok"],
    ],
  },
  kali: {
    name: "Kali Linux", cat: "Linux", tile: "linear-gradient(140deg,#22d3ee,#0e7490)",
    a1: "#22d3ee", a2: "#0ea5e9", glyph: ICO.kali, mark: "🐉", logo: "🐉",
    wall: "radial-gradient(circle at 40% 30%, #0f766e 0%, #071013 62%)",
    defaults: { cpu: 4, ram: 8, disk: 64 },
    boot: [
      ["Kali GNU/Linux Rolling — GRUB 2.12", "dimc"],
      ["Loading Linux 6.11-kali-amd64 ...", ""],
      ["[  OK  ] Mounted /home", "ok"],
      ["[  OK  ] Started WPA supplicant", "ok"],
      ["[  OK  ] Reached target Graphical Interface", "ok"],
    ],
  },
  debian: {
    name: "Debian 12", cat: "Linux", tile: "linear-gradient(140deg,#f472b6,#be123c)",
    a1: "#f472b6", a2: "#e11d48", glyph: ICO.debian, mark: "🌀", logo: "🌀",
    wall: "radial-gradient(circle at 60% 70%, #831843 0%, #120a12 62%)",
    defaults: { cpu: 2, ram: 4, disk: 40 },
    boot: [
      ["Debian GNU/Linux 12 (bookworm)", "dimc"],
      ["Loading Linux 6.1.0-25-amd64 ...", ""],
      ["[  OK  ] Reached target Local File Systems", "ok"],
      ["[  OK  ] Started OpenBSD Secure Shell server", "ok"],
    ],
  },
  fedora: {
    name: "Fedora 41", cat: "Linux", tile: "linear-gradient(140deg,#60a5fa,#1d4ed8)",
    a1: "#60a5fa", a2: "#3b82f6", glyph: ICO.fedora, mark: "🔵", logo: "🔵",
    wall: "radial-gradient(circle at 35% 30%, #1e3a8a 0%, #070b16 62%)",
    defaults: { cpu: 4, ram: 4, disk: 48 },
    boot: [
      ["Fedora Linux 41 (Workstation) — GRUB", "dimc"],
      ["Loading Linux 6.11.4-301.fc41 ...", ""],
      ["[  OK  ] Started plymouth-quit-wait.service", "ok"],
      ["[  OK  ] Started GNOME Shell", "ok"],
    ],
  },
  arch: {
    name: "Arch Linux", cat: "Linux", tile: "linear-gradient(140deg,#38bdf8,#0369a1)",
    a1: "#38bdf8", a2: "#0284c7", glyph: ICO.arch, mark: "🔺", logo: "🔺",
    wall: "radial-gradient(circle at 50% 20%, #075985 0%, #060b12 62%)",
    defaults: { cpu: 2, ram: 2, disk: 24 },
    boot: [
      ["Arch Linux — systemd-boot", "dimc"],
      ["Loading Linux linux ...", ""],
      ["[  OK  ] Reached target Multi-User System", "ok"],
      ["[  OK  ] Reached target Graphical Interface", "ok"],
    ],
  },
  mint: {
    name: "Linux Mint 22", cat: "Linux", tile: "linear-gradient(140deg,#4ade80,#15803d)",
    a1: "#4ade80", a2: "#16a34a", glyph: ICO.mint, mark: "🌿", logo: "🌿",
    wall: "radial-gradient(circle at 30% 70%, #14532d 0%, #07120c 62%)",
    defaults: { cpu: 2, ram: 4, disk: 40 },
    boot: [
      ["Linux Mint 22 — GRUB 2.12", "dimc"],
      ["Loading Linux 6.8.0-38-generic ...", ""],
      ["[  OK  ] Started Cinnamon Display Manager", "ok"],
      ["[  OK  ] Reached target Graphical Interface", "ok"],
    ],
  },
  freebsd: {
    name: "FreeBSD 14", cat: "Other", tile: "linear-gradient(140deg,#f87171,#991b1b)",
    a1: "#f87171", a2: "#dc2626", glyph: ICO.freebsd, mark: "😈", logo: "😈",
    wall: "radial-gradient(circle at 60% 25%, #7f1d1d 0%, #120708 62%)",
    defaults: { cpu: 4, ram: 4, disk: 40 },
    boot: [
      ["FreeBSD/amd64 EFI loader", "dimc"],
      ["Loading kernel ...", ""],
      ["Loading configured modules ...", "dimc"],
      ["Starting FreeBSD 14.1-RELEASE ...", "ok"],
    ],
  },
  android: {
    name: "Android 15", cat: "Other", tile: "linear-gradient(140deg,#86efac,#15803d)",
    a1: "#86efac", a2: "#22c55e", glyph: ICO.android, mark: "🤖", logo: "🤖",
    wall: "radial-gradient(circle at 40% 30%, #14532d 0%, #07120c 62%)",
    defaults: { cpu: 4, ram: 6, disk: 32 },
    boot: [
      ["Android bootloader (fastboot)", "dimc"],
      ["Loading kernel ...", ""],
      ["[  OK  ] Started SurfaceFlinger", "ok"],
      ["[  OK  ] Boot completed", "ok"],
    ],
  },
};
const OS_KEYS = Object.keys(OS);

/* ---------------- State ---------------- */
const DEFAULTS = {
  vms: [
    { id: uid(), name: "Windows 11", os: "windows", cpu: 4, ram: 8, disk: 64 },
    { id: uid(), name: "Ubuntu Server", os: "ubuntu", cpu: 2, ram: 4, disk: 32 },
    { id: uid(), name: "macOS Sonoma", os: "macos", cpu: 6, ram: 8, disk: 80 },
    { id: uid(), name: "Kali Linux", os: "kali", cpu: 4, ram: 8, disk: 64 },
    { id: uid(), name: "Debian 12", os: "debian", cpu: 2, ram: 4, disk: 40 },
  ],
};

const store = {
  get() {
    try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem("lemonvm") || "{}") }; }
    catch { return { ...DEFAULTS }; }
  },
  set(p) { const n = { ...this.get(), ...p }; localStorage.setItem("lemonvm", JSON.stringify(n)); return n; },
};

let state = store.get();
state.vms = state.vms.map((v) => ({ status: "stopped", ...v }));
let selectedId = null;
let view = "grid";
let category = "all";
let query = "";
const runtime = new Map();

const CATS = [
  { id: "all", name: "כל המכונות", ico: "🖥️" },
  { id: "macOS", name: "macOS", ico: "⌘" },
  { id: "Linux", name: "Linux", ico: "🐧" },
  { id: "Windows", name: "Windows", ico: "🪟" },
  { id: "Other", name: "אחר", ico: "🧩" },
];

/* ---------------- Helpers ---------------- */
const osIcon = (key, cls = "os-icon") => {
  const o = OS[key];
  return `<div class="${cls}" style="--os-bg:${o.tile}">${o.glyph}</div>`;
};
const statusLabel = { stopped: "כבויה", running: "פועלת", paused: "מושהית" };
const fmtGB = (g) => (g >= 1024 ? (g / 1024).toFixed(1) + " TB" : g + " GB");

function toast(msg, icon = "✓") {
  const t = el("div", "toast", `<span class="ti">${icon}</span><span>${esc(msg)}</span>`);
  $("#toasts").appendChild(t);
  setTimeout(() => { t.classList.add("out"); setTimeout(() => t.remove(), 300); }, 2600);
}

/* ---------------- Rendering ---------------- */
function renderSidebar() {
  const host = $("#catList");
  host.innerHTML = "";
  CATS.forEach((c) => {
    const count = c.id === "all" ? state.vms.length : state.vms.filter((v) => OS[v.os].cat === c.id).length;
    const node = el("div", "cat" + (category === c.id ? " active" : ""),
      `<span class="c-ico">${c.ico}</span><span class="c-name">${c.name}</span><span class="c-count">${count}</span>`);
    node.onclick = () => { category = c.id; renderSidebar(); renderContent(); };
    host.appendChild(node);
  });
  const used = state.vms.reduce((s, v) => s + v.disk, 0);
  $("#storageUsed").textContent = fmtGB(used);
  $("#storageFill").style.width = clamp((used / 512) * 100, 3, 100) + "%";
  $("#libCount").textContent = state.vms.length;
}

function visibleVms() {
  return state.vms.filter((v) => {
    const okCat = category === "all" || OS[v.os].cat === category;
    const okQ = !query || v.name.toLowerCase().includes(query.toLowerCase()) || OS[v.os].name.toLowerCase().includes(query.toLowerCase());
    return okCat && okQ;
  });
}

function renderContent() {
  const cat = CATS.find((c) => c.id === category);
  $("#contentTitle").textContent = cat ? cat.name : "כל המכונות";
  const list = visibleVms();
  const running = state.vms.filter((v) => v.status === "running").length;
  $("#contentSub").textContent = list.length
    ? `${list.length} מכונות · ${running} פועלות כעת`
    : "אין מכונות להצגה";

  const g = $("#gallery");
  g.className = "gallery " + view;
  g.innerHTML = "";
  list.forEach((vm, i) => g.appendChild(vmCard(vm, i)));
  const tile = el("div", "new-tile", `<div><div class="plus">＋</div><div>מכונה חדשה</div></div>`);
  tile.onclick = openWizard;
  g.appendChild(tile);

  renderStatusBar();
}

function vmCard(vm, i) {
  const o = OS[vm.os];
  const card = el("div", "vm-card" + (vm.id === selectedId ? " selected" : ""));
  card.style.setProperty("--os-accent", o.a1);
  card.style.setProperty("--os-accent2", o.a2);
  card.style.animationDelay = Math.min(i * 45, 400) + "ms";
  card.innerHTML = `
    <div class="card-actions">
      <button class="mini-btn play" title="${vm.status === "running" ? "עצור" : "הפעל"}">
        ${vm.status === "running"
          ? `<svg viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" rx="1.2" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1.2" fill="currentColor"/></svg>`
          : `<svg viewBox="0 0 24 24"><path d="M7 5.5v13l11-6.5z" fill="currentColor"/></svg>`}
      </button>
      <button class="mini-btn cfg" title="הגדרות"><svg viewBox="0 0 24 24"><path d="M12 8.5A3.5 3.5 0 1 0 12 15.5 3.5 3.5 0 0 0 12 8.5zm8 3.5-1.9-.6a6 6 0 0 0-.6-1.4l1-1.7-1.4-1.4-1.7 1a6 6 0 0 0-1.4-.6L13.4 4h-2.8l-.6 1.9a6 6 0 0 0-1.4.6l-1.7-1L5.5 6.9l1 1.7a6 6 0 0 0-.6 1.4L4 10.6v2.8l1.9.6a6 6 0 0 0 .6 1.4l-1 1.7 1.4 1.4 1.7-1a6 6 0 0 0 1.4.6l.6 1.9h2.8l.6-1.9a6 6 0 0 0 1.4-.6l1.7 1 1.4-1.4-1-1.7a6 6 0 0 0 .6-1.4l1.9-.6z" fill="none" stroke="currentColor" stroke-width="1.4"/></svg></button>
      <button class="mini-btn del" title="מחק"><svg viewBox="0 0 24 24"><path d="M6 7h12M9 7V5h6v2M8 7l1 12h6l1-12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
    </div>
    <div class="card-top">
      ${osIcon(vm.os)}
      <div class="vm-meta">
        <div class="vm-name">${esc(vm.name)}</div>
        <div class="vm-os">${o.name}</div>
        <span class="status ${vm.status}"><span class="s-dot"></span>${statusLabel[vm.status]}</span>
      </div>
    </div>
    <div class="card-specs">
      <span>⚙️ <b>${vm.cpu}</b> vCPU</span>
      <span>🧠 <b>${vm.ram}</b> GB</span>
      <span>💾 <b>${vm.disk}</b> GB</span>
    </div>`;

  card.onclick = (e) => {
    if (e.target.closest(".mini-btn")) return;
    select(vm.id);
  };
  card.ondblclick = () => startVM(vm.id);
  $(".mini-btn.play", card).onclick = (e) => { e.stopPropagation(); vm.status === "running" ? stopVM(vm.id) : startVM(vm.id); };
  $(".mini-btn.cfg", card).onclick = (e) => { e.stopPropagation(); select(vm.id); openWizard(vm.id); };
  $(".mini-btn.del", card).onclick = (e) => { e.stopPropagation(); removeVM(vm.id); };
  return card;
}

function select(id) {
  selectedId = id;
  renderContent();
  renderInspector();
}

function renderInspector() {
  const ins = $("#inspector");
  const vm = state.vms.find((v) => v.id === selectedId);
  if (!vm) {
    ins.className = "inspector empty";
    ins.innerHTML = `<div><div style="font-size:34px;margin-bottom:10px">🖥️</div>בחר מכונה כדי לראות פרטים</div>`;
    return;
  }
  ins.className = "inspector";
  const o = OS[vm.os];
  const running = vm.status === "running";
  ins.innerHTML = `
    <div class="ins-hero">
      ${osIcon(vm.os)}
      <div><h2>${esc(vm.name)}</h2><div class="sub">${o.name}</div></div>
      <span class="status ${vm.status}"><span class="s-dot"></span>${statusLabel[vm.status]}</span>
      <div class="ins-actions">
        <button class="btn play" id="insPlay">${running ? "⏸ השהה" : "▶ הפעל"}</button>
        <button class="btn" id="insCfg">הגדרות</button>
        <button class="btn danger ghost" id="insDel">מחק</button>
      </div>
    </div>
    <div class="ins-section">
      <h4>מפרט</h4>
      <div class="spec-row"><span class="k">ליבות מעבד</span><span class="v">${vm.cpu} vCPU</span></div>
      <div class="spec-row"><span class="k">זיכרון</span><span class="v">${vm.ram} GB</span></div>
      <div class="spec-row"><span class="k">דיסק</span><span class="v">${vm.disk} GB</span></div>
      <div class="spec-row"><span class="k">מזהה</span><span class="v">${vm.id}</span></div>
    </div>
    <div class="ins-section">
      <h4>כיוונון מהיר</h4>
      <div class="slider-row">
        <div class="sr-top"><span>מעבד</span><span class="v" id="lblCpu">${vm.cpu} vCPU</span></div>
        <input type="range" id="rngCpu" min="1" max="12" step="1" value="${vm.cpu}" />
      </div>
      <div class="slider-row">
        <div class="sr-top"><span>זיכרון</span><span class="v" id="lblRam">${vm.ram} GB</span></div>
        <input type="range" id="rngRam" min="1" max="32" step="1" value="${vm.ram}" />
      </div>
      <div class="slider-row">
        <div class="sr-top"><span>דיסק</span><span class="v" id="lblDisk">${vm.disk} GB</span></div>
        <input type="range" id="rngDisk" min="8" max="256" step="8" value="${vm.disk}" />
      </div>
    </div>`;

  $("#insPlay", ins).onclick = () => (running ? stopVM(vm.id) : startVM(vm.id));
  $("#insCfg", ins).onclick = () => openWizard(vm.id);
  $("#insDel", ins).onclick = () => removeVM(vm.id);
  const bind = (rngId, lblId, key, unit) => {
    $(rngId, ins).oninput = (e) => {
      vm[key] = +e.target.value;
      $(lblId, ins).textContent = vm[key] + " " + unit;
      persist(); renderSidebar(); renderContent(); syncMeters(vm);
    };
  };
  bind("#rngCpu", "#lblCpu", "cpu", "vCPU");
  bind("#rngRam", "#lblRam", "ram", "GB");
  bind("#rngDisk", "#lblDisk", "disk", "GB");
}

function renderStatusBar() {
  const running = state.vms.filter((v) => v.status === "running").length;
  $("#statusLeft").innerHTML = `LemonVM 2.0 <span class="ok">● hypervisor ready</span>`;
  $("#statusMid").textContent = `${state.vms.length} מכונות · ${running} פועלות`;
  $("#statusRight").textContent = new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
}

/* ---------------- Persistence ---------------- */
function persist() {
  const plain = state.vms.map((v) => ({ id: v.id, name: v.name, os: v.os, cpu: v.cpu, ram: v.ram, disk: v.disk }));
  localStorage.setItem("lemonvm", JSON.stringify({ vms: plain }));
}

function addVM(vm) { state.vms.push({ status: "stopped", ...vm }); persist(); renderSidebar(); renderContent(); }
function removeVM(id) {
  if (!confirm("למחוק את המכונה? הפעולה בלתי הפיכה.")) return;
  closeVMWin(id);
  state.vms = state.vms.filter((v) => v.id !== id);
  if (selectedId === id) selectedId = null;
  persist(); renderSidebar(); renderContent(); renderInspector();
  toast("המכונה נמחקה", "🗑️");
}

/* ---------------- VM windows ---------------- */
function startVM(id) {
  const vm = state.vms.find((v) => v.id === id);
  if (!vm) return;
  if (vm.status === "paused") { resumeVM(id); return; }
  if (vm.status === "running") { focusVMWin(id); return; }
  vm.status = "running";
  openVMWin(vm);
  renderContent(); renderInspector();
  toast(`מפעיל את ${vm.name}…`, "▶");
}

function stopVM(id) {
  const vm = state.vms.find((v) => v.id === id);
  if (!vm) return;
  const rt = runtime.get(id);
  if (rt) {
    clearTimers(rt);
    const con = $(".console", rt.win);
    if (con) {
      con.innerHTML = "";
      con.classList.remove("hidden");
      const lines = [["[  OK  ] Stopping services...", "dimc"], ["[  OK  ] Unmounting file systems...", "dimc"], ["System halted.", "warn"]];
      lines.forEach(([t, c], i) => setTimeout(() => con.appendChild(el("div", "ln " + c, t)), i * 220));
    }
    setTimeout(() => closeVMWin(id), 900);
  }
  vm.status = "stopped";
  renderContent(); renderInspector();
  toast(`כיביתי את ${vm.name}`, "⏹");
}

function pauseVM(id) {
  const vm = state.vms.find((v) => v.id === id);
  const rt = runtime.get(id);
  if (!vm || !rt) return;
  vm.status = "paused";
  clearTimers(rt);
  rt.win.classList.add("paused");
  renderContent(); renderInspector();
  toast(`${vm.name} הושהתה`, "⏸");
}

function resumeVM(id) {
  const vm = state.vms.find((v) => v.id === id);
  const rt = runtime.get(id);
  if (!vm) return;
  vm.status = "running";
  if (rt) { rt.win.classList.remove("paused"); rt.startedAt = Date.now() - (rt.elapsed || 0); startTimers(vm, rt); }
  renderContent(); renderInspector();
  toast(`${vm.name} ממשיכה לרוץ`, "▶");
}

function clearTimers(rt) {
  if (rt.tick) clearInterval(rt.tick);
  rt.tick = null;
  if (rt.bootTimeouts) { rt.bootTimeouts.forEach(clearTimeout); rt.bootTimeouts = []; }
}

function focusVMWin(id) {
  const rt = runtime.get(id);
  if (!rt) return;
  rt.win.classList.remove("minimized");
  rt.win.style.zIndex = ++zTop;
}

function closeVMWin(id) {
  const rt = runtime.get(id);
  if (!rt) return;
  clearTimers(rt);
  rt.win.remove();
  runtime.delete(id);
}

let zTop = 100;

function openVMWin(vm) {
  const o = OS[vm.os];
  const w = Math.min(820, window.innerWidth - 80);
  const h = Math.min(560, window.innerHeight - 140);
  const win = el("div", "vmwin");
  const off = (runtime.size % 5) * 26;
  win.style.cssText = `width:${w}px;height:${h}px;left:${Math.max(30, (window.innerWidth - w) / 2 + off - 40)}px;top:${Math.max(60, 70 + off)}px;z-index:${++zTop}`;
  win.innerHTML = `
    <div class="vmtop">
      <div class="traffic"><span class="tl close"></span><span class="tl min"></span><span class="tl max"></span></div>
      <div class="vmtitle">${esc(vm.name)} — Display</div>
      <span class="badge">${o.name}</span>
    </div>
    <div class="screen-wrap">
      <div class="console"></div>
      <div class="vignette"></div>
    </div>
    <div class="vmbottom">
      <button class="vm-btn" data-a="pause">⏸ השהה</button>
      <button class="vm-btn" data-a="restart">⟳ הפעל מחדש</button>
      <button class="vm-btn stop" data-a="stop">⏹ כבה</button>
      <span class="sp"></span>
      <span class="meter">CPU <svg class="spark" viewBox="0 0 54 18"><polyline points=""></polyline></svg> <span class="val cpu">0%</span></span>
      <span class="meter">RAM <span class="val ram">0.0 GB</span></span>
      <span class="meter">⏱ <span class="val up">00:00</span></span>
      <span class="sp"></span>
      <button class="vm-btn" data-a="fs">⛶ מסך מלא</button>
    </div>
    <div class="resize-handle"></div>`;

  $("#vmLayer").appendChild(win);

  const rt = { win, tick: null, bootTimeouts: [], cpu: 18, ram: vm.ram * 0.28, startedAt: Date.now(), elapsed: 0, paused: false };
  runtime.set(vm.id, rt);

  $(".tl.close", win).onclick = () => stopVM(vm.id);
  $(".tl.min", win).onclick = () => win.classList.add("minimized");
  $(".tl.max", win).onclick = () => {
    if (win.dataset.max) { Object.assign(win.style, JSON.parse(win.dataset.prev)); delete win.dataset.max; }
    else { win.dataset.prev = JSON.stringify({ left: win.style.left, top: win.style.top, width: win.style.width, height: win.style.height }); Object.assign(win.style, { left: "0px", top: "0px", width: "100vw", height: "100vh" }); win.dataset.max = "1"; }
  };
  win.addEventListener("mousedown", () => win.style.zIndex = ++zTop);
  win.querySelectorAll(".vm-btn").forEach((b) => {
    b.onclick = () => {
      const a = b.dataset.a;
      if (a === "pause") { vm.status === "paused" ? resumeVM(vm.id) : pauseVM(vm.id); b.textContent = vm.status === "paused" ? "▶ המשך" : "⏸ השהה"; }
      else if (a === "restart") { restartVM(vm); }
      else if (a === "stop") stopVM(vm.id);
      else if (a === "fs") {
        if (document.fullscreenElement) document.exitFullscreen();
        else win.requestFullscreen?.().catch(() => {});
      }
    };
  });

  makeDraggable(win, $(".vmtop", win));
  makeResizable(win, $(".resize-handle", win));

  bootSequence(vm, rt);
}

function restartVM(vm) {
  const rt = runtime.get(vm.id);
  if (!rt) return;
  clearTimers(rt);
  rt.elapsed = 0;
  rt.startedAt = Date.now();
  bootSequence(vm, rt);
  toast(`${vm.name} מאתחלת מחדש`, "⟳");
}

function bootSequence(vm, rt) {
  const o = OS[vm.os];
  const con = $(".console", rt.win);
  const wrap = $(".screen-wrap", rt.win);
  $$(".splash, .osdesk", wrap).forEach((n) => n.remove());
  con.innerHTML = "";
  con.classList.remove("hidden");
  rt.win.classList.remove("paused");

  const post = el("div", "ln", `<span class="cursor"></span>`);
  let delay = 200;
  o.boot.forEach(([text, cls]) => {
    const t = setTimeout(() => {
      const line = el("div", "ln " + cls, esc(text));
      con.insertBefore(line, post);
      con.appendChild(post);
      con.scrollTop = con.scrollHeight;
    }, delay);
    rt.bootTimeouts.push(t);
    delay += 320 + Math.random() * 320;
  });

  const t2 = setTimeout(() => showSplash(vm, rt), delay + 200);
  rt.bootTimeouts.push(t2);
  startTimers(vm, rt);
}

function showSplash(vm, rt) {
  const o = OS[vm.os];
  const wrap = $(".screen-wrap", rt.win);
  const con = $(".console", rt.win);
  con.classList.add("hidden");
  const splash = el("div", "splash", `<div class="logo">${o.logo}</div><div class="spinner"></div>`);
  splash.style.background = o.wall;
  wrap.appendChild(splash);
  const t = setTimeout(() => showDesktop(vm, rt), 1900);
  rt.bootTimeouts.push(t);
}

function showDesktop(vm, rt) {
  const o = OS[vm.os];
  const wrap = $(".screen-wrap", rt.win);
  $$(".splash", wrap).forEach((n) => n.remove());
  const desk = el("div", "osdesk");
  const isMac = vm.os === "macos";
  desk.innerHTML = `
    <div class="wall" style="background:${o.wall}"></div>
    <div class="topbar">
      <span>${isMac ? "🍋" : o.mark} ${esc(vm.name)}</span>
      <span class="sp"></span>
      <span>🔋</span><span>📶</span><span id="dclock">--:--</span>
    </div>
    <div class="center-mark">${o.logo}</div>
    <div class="fakewin" style="top:70px;${isMac ? "right" : "left"}:70px">
      <div class="fb"><i></i><i></i><i></i></div>
      <div class="fc">ברוך הבא ל-${o.name} 🎉<br>זו תצוגה מדומה בתוך LemonVM.<br>המכונה רצה במלואה בדפדפן.</div>
    </div>
    <div class="dock-fake"><span></span><span></span><span></span><span></span><span></span></div>`;
  wrap.appendChild(desk);
  const clk = () => { const c = $("#dclock", desk); if (c) c.textContent = new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }); };
  clk();
  rt.tickClock = setInterval(clk, 5000);
}

function startTimers(vm, rt) {
  if (rt.tick) clearInterval(rt.tick);
  const spark = $(".spark polyline", rt.win);
  const cpuVal = $(".cpu", rt.win);
  const ramVal = $(".ram", rt.win);
  const upVal = $(".up", rt.win);
  const hist = new Array(22).fill(20);
  rt.tick = setInterval(() => {
    const load = clamp(rt.cpu + (Math.random() - 0.5) * 16, 4, 96);
    rt.cpu = load;
    hist.push(load); hist.shift();
    spark.setAttribute("points", hist.map((v, i) => `${(i / (hist.length - 1)) * 54},${18 - (v / 100) * 16}`).join(" "));
    cpuVal.textContent = Math.round(load) + "%";
    rt.ram = clamp(vm.ram * 0.28 + (Math.random() - 0.5) * (vm.ram * 0.06), 0.2, vm.ram * 0.92);
    ramVal.textContent = rt.ram.toFixed(1) + " GB";
    rt.elapsed = Math.floor((Date.now() - rt.startedAt) / 1000);
    const m = String(Math.floor(rt.elapsed / 60)).padStart(2, "0");
    const s = String(rt.elapsed % 60).padStart(2, "0");
    upVal.textContent = `${m}:${s}`;
  }, 700);
}

function syncMeters(vm) {
  const rt = runtime.get(vm.id);
  if (rt) rt.ram = vm.ram * 0.28;
}

function makeDraggable(node, handle) {
  handle.addEventListener("mousedown", (e) => {
    if (e.target.closest(".tl")) return;
    if (node.dataset.max) return;
    const sx = e.clientX, sy = e.clientY;
    const ox = parseFloat(node.style.left) || 0, oy = parseFloat(node.style.top) || 0;
    const move = (ev) => {
      node.style.left = clamp(ox + ev.clientX - sx, -node.offsetWidth + 140, window.innerWidth - 80) + "px";
      node.style.top = clamp(oy + ev.clientY - sy, 0, window.innerHeight - 50) + "px";
    };
    const up = () => { document.removeEventListener("mousemove", move); document.removeEventListener("mouseup", up); };
    document.addEventListener("mousemove", move); document.addEventListener("mouseup", up);
    e.preventDefault();
  });
}
function makeResizable(node, handle) {
  handle.addEventListener("mousedown", (e) => {
    e.preventDefault(); e.stopPropagation();
    const sx = e.clientX, sy = e.clientY, ow = node.offsetWidth, oh = node.offsetHeight;
    const move = (ev) => { node.style.width = Math.max(420, ow + ev.clientX - sx) + "px"; node.style.height = Math.max(300, oh + ev.clientY - sy) + "px"; };
    const up = () => { document.removeEventListener("mousemove", move); document.removeEventListener("mouseup", up); };
    document.addEventListener("mousemove", move); document.addEventListener("mouseup", up);
  });
}

/* ---------------- Wizard ---------------- */
let wizard = null;

function openWizard(editId) {
  const editing = editId ? state.vms.find((v) => v.id === editId) : null;
  wizard = editing
    ? { step: 2, os: editing.os, name: editing.name, cpu: editing.cpu, ram: editing.ram, disk: editing.disk, editId }
    : { step: 1, os: null, name: "", cpu: 4, ram: 8, disk: 64, editId: null };
  $("#modal").classList.remove("hidden");
  paintWizard();
}

function closeWizard() { $("#modal").classList.add("hidden"); wizard = null; }

function paintWizard() {
  const card = $("#modalCard");
  const step = wizard.step;
  card.innerHTML = `
    <div class="modal-head">
      <h2>${wizard.editId ? "הגדרות מכונה" : "מכונה וירטואלית חדשה"}</h2>
      <div class="steps">${[1, 2, 3].map((s) => `<i class="${s <= step ? "on" : ""}"></i>`).join("")}</div>
    </div>
    <div class="modal-body" id="wizBody"></div>
    <div class="modal-foot" id="wizFoot"></div>`;
  const body = $("#wizBody", card);
  const foot = $("#wizFoot", card);

  if (step === 1) {
    body.innerHTML = `<div class="field"><label>בחר מערכת הפעלה</label></div>
      <div class="os-grid">${OS_KEYS.map((k) => `
        <div class="os-pick ${wizard.os === k ? "active" : ""}" data-os="${k}">
          ${osIcon(k)}<span>${OS[k].name}</span>
        </div>`).join("")}</div>`;
    $$(".os-pick", body).forEach((p) => p.onclick = () => { wizard.os = p.dataset.os; paintWizard(); });
    foot.innerHTML = `<button class="btn ghost" data-a="cancel">ביטול</button><span class="sp"></span>
      <button class="btn accent" data-a="next" ${wizard.os ? "" : "disabled style=opacity:.45"}>המשך →</button>`;
  } else if (step === 2) {
    const o = OS[wizard.os];
    body.innerHTML = `
      <div class="summary" style="margin-bottom:20px">${osIcon(wizard.os)}<div><h3>${o.name}</h3><p>${wizard.editId ? "עריכת הגדרות" : "הגדר את המשאבים"}</p></div></div>
      <div class="field"><label>שם המכונה</label><input class="text-input" id="wizName" value="${esc(wizard.name || o.name)}" /></div>
      <div class="field"><label>ליבות מעבד</label>
        <div class="slider-row"><div class="sr-top"><span>vCPU</span><span class="v" id="wc">${wizard.cpu}</span></div>
        <input type="range" id="wcR" min="1" max="12" value="${wizard.cpu}"></div></div>
      <div class="field"><label>זיכרון</label>
        <div class="slider-row"><div class="sr-top"><span>RAM</span><span class="v" id="wr">${wizard.ram} GB</span></div>
        <input type="range" id="wrR" min="1" max="32" value="${wizard.ram}"></div></div>
      <div class="field"><label>דיסק</label>
        <div class="slider-row"><div class="sr-top"><span>SSD</span><span class="v" id="wd">${wizard.disk} GB</span></div>
        <input type="range" id="wdR" min="8" max="256" step="8" value="${wizard.disk}"></div></div>`;
    $("#wizName", body).oninput = (e) => wizard.name = e.target.value;
    const bind = (r, l, key, u) => $(r, body).oninput = (e) => { wizard[key] = +e.target.value; $(l, body).textContent = wizard[key] + (u ? " " + u : ""); };
    bind("#wcR", "#wc", "cpu", ""); bind("#wrR", "#wr", "ram", "GB"); bind("#wdR", "#wd", "disk", "GB");
    foot.innerHTML = `<button class="btn ghost" data-a="back">← חזור</button><span class="sp"></span>
      <button class="btn accent" data-a="next">המשך →</button>`;
  } else {
    const o = OS[wizard.os];
    body.innerHTML = `
      <div class="summary">${osIcon(wizard.os)}<div>
        <h3>${esc(wizard.name || o.name)}</h3>
        <p>${o.name} · ${wizard.cpu} vCPU · ${wizard.ram} GB RAM · ${wizard.disk} GB SSD</p>
      </div></div>
      <p style="margin-top:16px;color:var(--dim);font-size:13px">המכונה תיווצר מקומית בדפדפן. לחץ "צור" כדי להתחיל.</p>`;
    foot.innerHTML = `<button class="btn ghost" data-a="back">← חזור</button><span class="sp"></span>
      <button class="btn accent" data-a="create">${wizard.editId ? "שמור" : "✨ צור מכונה"}</button>`;
  }

  foot.querySelectorAll("[data-a]").forEach((b) => b.onclick = () => {
    const a = b.dataset.a;
    if (a === "cancel") closeWizard();
    else if (a === "back") { wizard.step--; paintWizard(); }
    else if (a === "next") { if (wizard.step === 1 && !wizard.os) return; if (!wizard.name) wizard.name = OS[wizard.os].name; wizard.step++; paintWizard(); }
    else if (a === "create") {
      if (wizard.editId) {
        const vm = state.vms.find((v) => v.id === wizard.editId);
        Object.assign(vm, { os: wizard.os, name: wizard.name, cpu: wizard.cpu, ram: wizard.ram, disk: wizard.disk });
        persist(); renderSidebar(); renderContent(); renderInspector();
        toast("ההגדרות נשמרו", "💾");
      } else {
        const vm = { id: uid(), name: wizard.name || OS[wizard.os].name, os: wizard.os, cpu: wizard.cpu, ram: wizard.ram, disk: wizard.disk };
        addVM(vm); select(vm.id);
        toast(`נוצרה מכונה: ${vm.name}`, "✨");
      }
      closeWizard();
    }
  });
}

/* ---------------- Events ---------------- */
function initEvents() {
  $("#newVmBtn").onclick = openWizard;
  $("#modal").addEventListener("click", (e) => { if (e.target.dataset.close !== undefined) closeWizard(); });
  $("#sidebarToggle").onclick = () => $("#sidebar").classList.toggle("collapsed");
  $("#search").oninput = (e) => { query = e.target.value; renderContent(); };
  $$("#viewToggle button").forEach((b) => b.onclick = () => {
    view = b.dataset.view;
    $$("#viewToggle button").forEach((x) => x.classList.toggle("active", x === b));
    renderContent();
  });
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); $("#search").focus(); }
    if (e.key === "Escape") { if (!$("#modal").classList.contains("hidden")) closeWizard(); }
  });
  window.addEventListener("resize", () => {
    $$(".vmwin").forEach((w) => { if (w.dataset.max) Object.assign(w.style, { width: "100vw", height: "100vh" }); });
  });
  setInterval(renderStatusBar, 30000);
}

/* ---------------- Boot ---------------- */
function init() {
  renderSidebar();
  renderContent();
  renderInspector();
  initEvents();
}
init();
