/* ============================================================
   LemonOS — a little computer that lives in your browser
   ============================================================ */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const el = (tag, cls, html) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html != null) n.innerHTML = html;
  return n;
};

/* ---------------- Persistent state ---------------- */
const DEFAULTS = {
  accent: "#2f81f7",
  wallpaper: "linear-gradient(135deg, #1b2a4a 0%, #2d1b4e 45%, #4a1b3d 100%)",
  theme: "dark",
  notes: "ברוך הבא ל-LemonOS 📝\n\nזהו עורך הפתקים. כל מה שתכתוב נשמר אוטומטית בדפדפן.\nנסה את הטרמינל — כתוב help.",
};

const store = {
  get() {
    try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem("lemonos") || "{}") }; }
    catch { return { ...DEFAULTS }; }
  },
  set(patch) {
    const next = { ...this.get(), ...patch };
    localStorage.setItem("lemonos", JSON.stringify(next));
    return next;
  },
};

let settings = store.get();

/* ---------------- Wallpapers ---------------- */
const WALLPAPERS = [
  "linear-gradient(135deg, #1b2a4a 0%, #2d1b4e 45%, #4a1b3d 100%)",
  "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
  "linear-gradient(135deg, #42275a 0%, #734b6d 100%)",
  "linear-gradient(135deg, #134e5e 0%, #71b280 100%)",
  "linear-gradient(135deg, #232526 0%, #414345 100%)",
  "linear-gradient(135deg, #f5af19 0%, #f12711 100%)",
  "linear-gradient(135deg, #c94b4b 0%, #4b134f 100%)",
  "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
];
const ACCENTS = ["#2f81f7", "#28c840", "#f5d76e", "#ff5f57", "#c084fc", "#fb923c"];

/* ---------------- Virtual file system ---------------- */
const VFS = {
  "~": {
    type: "dir",
    children: {
      Documents: {
        type: "dir",
        children: {
          "resume.txt": { type: "file", content: "הקורות חיים שלי…" },
          "budget.csv": { type: "file", content: "item,price\ncoffee,12\n" },
        },
      },
      Pictures: { type: "dir", children: { "sunset.png": { type: "file" }, "cat.jpg": { type: "file" } } },
      Projects: {
        type: "dir",
        children: { "lemonos.html": { type: "file", content: "<!-- it works -->" }, "app.js": { type: "file", content: "console.log('hi')" } },
      },
      "readme.md": { type: "file", content: "# LemonOS\nמערכת הפעלה קטנה שרצה בדפדפן." },
      "notes.txt": { type: "file", content: "לקנות לימונים 🍋" },
    },
  },
};

function vfsResolve(cwd, path) {
  if (!path || path === ".") return cwd;
  let parts = path.startsWith("/") ? path.split("/").filter(Boolean) : [...cwd.split("/").filter(Boolean), ...path.split("/").filter(Boolean)];
  const out = [];
  for (const p of parts) {
    if (p === ".") continue;
    if (p === "..") { out.pop(); continue; }
    out.push(p);
  }
  return out.join("/");
}
function vfsGet(path) {
  if (path === "" || path === "~") return VFS["~"];
  let node = VFS["~"];
  for (const p of path.split("/").filter(Boolean)) {
    if (!node.children || !node.children[p]) return null;
    node = node.children[p];
  }
  return node;
}

/* ---------------- App registry ---------------- */
const APPS = {
  files: {
    name: "קבצים", icon: "📁", w: 640, h: 420,
    render(body, win) {
      const state = { path: "", sel: null };
      body.innerHTML = "";
      const wrap = el("div", "files");
      const side = el("div", "files-side");
      const main = el("div", "files-main");
      const pathBar = el("div", "files-path");
      const right = el("div"); right.style.cssText = "flex:1;display:flex;flex-direction:column;min-width:0";

      const places = [["~", "🏠", "בית"], ["Documents", "📄", "מסמכים"], ["Pictures", "🖼️", "תמונות"], ["Projects", "💻", "פרויקטים"]];
      places.forEach(([p, ic, label]) => {
        const item = el("div", "side-item", `<span>${ic}</span><span>${label}</span>`);
        item.onclick = () => { state.path = p === "~" ? "" : p; renderMain(); };
        side.appendChild(item);
      });

      function renderMain() {
        $$(".side-item", side).forEach((n, i) => n.classList.toggle("active", places[i][0] === (state.path || "~")));
        pathBar.textContent = "🏠 / " + (state.path || "בית").split("/").join(" / ");
        main.innerHTML = "";
        const node = vfsGet(state.path) || VFS["~"];
        if (state.path) {
          const up = el("div", "file-card", `<div class="ico">⬆️</div><div>..</div>`);
          up.onclick = () => { state.path = state.path.split("/").slice(0, -1).join("/"); renderMain(); };
          main.appendChild(up);
        }
        Object.entries(node.children || {}).forEach(([name, child]) => {
          const ic = child.type === "dir" ? "📁" : name.match(/\.(png|jpg|jpeg|gif)$/i) ? "🖼️" : name.match(/\.(csv)$/i) ? "📊" : "📄";
          const card = el("div", "file-card", `<div class="ico">${ic}</div><div>${name}</div>`);
          card.ondblclick = () => {
            if (child.type === "dir") { state.path = (state.path ? state.path + "/" : "") + name; renderMain(); }
            else if (child.content) openApp("notes", { text: child.content, title: name });
          };
          card.onclick = () => { $$(".file-card", main).forEach((c) => c.style.background = ""); card.style.background = "var(--accent-soft)"; };
          main.appendChild(card);
        });
      }
      right.append(pathBar, main);
      wrap.append(side, right);
      body.appendChild(wrap);
      renderMain();
    },
  },

  terminal: {
    name: "טרמינל", icon: ">_", w: 660, h: 400,
    render(body) {
      body.innerHTML = "";
      const term = el("div", "term");
      const history = [];
      let cwd = "";
      let histIdx = -1;

      const banner = [
        "LemonOS 1.0  (build 2026.10)",
        "הקלד 'help' כדי לראות את הפקודות הזמינות.",
        "",
      ];
      banner.forEach((l) => term.appendChild(el("div", "term-line", l)));

      const inputLine = el("div", "term-input-line");
      const prompt = el("span", "term-prompt", "");
      const input = el("input");
      inputLine.append(prompt, input);
      term.appendChild(inputLine);
      body.appendChild(term);

      const setPrompt = () => (prompt.textContent = `lemon@lemonos:~/${cwd}$`);
      const print = (txt = "", cls = "") => term.insertBefore(el("div", "term-line " + cls, txt), inputLine);

      const CMDS = {
        help: () => print(
          "פקודות זמינות:\n" +
          "  help              רשימת פקודות\n" +
          "  ls [path]         הצג תיקייה\n" +
          "  cd <path>         שנה תיקייה\n" +
          "  pwd               נתיב נוכחי\n" +
          "  cat <file>        הצג קובץ\n" +
          "  echo <text>       הדפס טקסט\n" +
          "  date              תאריך ושעה\n" +
          "  whoami            שם המשתמש\n" +
          "  open <app>        פתח אפליקציה (files/notes/calc/settings/browser)\n" +
          "  neofetch          מידע על המערכת\n" +
          "  clear             נקה מסך"
        ),
        ls: (args) => {
          const p = vfsResolve(cwd, args[0] || "");
          const node = vfsGet(p);
          if (!node) return print(`ls: ${args[0]}: אין קובץ או תיקייה כזו`, "err");
          if (node.type === "file") return print(args[0]);
          const names = Object.entries(node.children || {}).map(([n, c]) => (c.type === "dir" ? n + "/" : n));
          print(names.length ? names.join("   ") : "(ריק)");
        },
        cd: (args) => {
          const p = vfsResolve(cwd, args[0] || "");
          const node = vfsGet(p);
          if (!node || node.type !== "dir") return print(`cd: ${args[0] || ""}: אין תיקייה כזו`, "err");
          cwd = p; setPrompt();
        },
        pwd: () => print("/home/lemon" + (cwd ? "/" + cwd : "")),
        cat: (args) => {
          if (!args[0]) return print("cat: חסר שם קובץ", "err");
          const node = vfsGet(vfsResolve(cwd, args[0]));
          if (!node) return print(`cat: ${args[0]}: אין קובץ כזה`, "err");
          print(node.content || "(קובץ ריק)");
        },
        echo: (args) => print(args.join(" ")),
        date: () => print(new Date().toString()),
        whoami: () => print("lemon"),
        uname: () => print("LemonOS 1.0 web-kernel x86_64"),
        clear: () => { $$(".term-line", term).forEach((n) => n.remove()); },
        open: (args) => {
          const id = (args[0] || "").toLowerCase();
          if (APPS[id]) { openApp(id); print(`פותח את ${APPS[id].name}…`); }
          else print(`open: אין אפליקציה בשם '${args[0]}'`, "err");
        },
        neofetch: () => {
          const info = [
            "        🍋        lemon@lemonos",
            "       /  \\       ---------------",
            "      /____\\      OS: LemonOS 1.0",
            "     /      \\     Kernel: web-5.x",
            "    /________\\    Shell: lemonsh",
            "   /          \\   WM: LemonWM",
            "  /____________\\  Uptime: " + Math.floor(performance.now() / 1000) + "s",
            "                  Resolution: " + window.innerWidth + "x" + window.innerHeight,
          ];
          print(info.join("\n"));
        },
      };
      CMDS["sudo"] = (args) => print(args.join(" ") ? "nice try 😏" : "sudo: חסר פקודה", "err");

      function run(raw) {
        print(prompt.textContent + " " + raw);
        const parts = raw.trim().split(/\s+/);
        const cmd = parts.shift();
        if (!cmd) return;
        history.push(raw); histIdx = history.length;
        if (CMDS[cmd]) CMDS[cmd](parts);
        else print(`lemonsh: ${cmd}: פקודה לא נמצאה`, "err");
      }

      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") { const v = input.value; input.value = ""; run(v); term.scrollTop = term.scrollHeight; }
        else if (e.key === "ArrowUp") { if (histIdx > 0) { histIdx--; input.value = history[histIdx]; } e.preventDefault(); }
        else if (e.key === "ArrowDown") { if (histIdx < history.length - 1) { histIdx++; input.value = history[histIdx]; } else { histIdx = history.length; input.value = ""; } e.preventDefault(); }
      });
      term.addEventListener("click", () => input.focus());
      setPrompt();
      setTimeout(() => input.focus(), 60);
    },
  },

  notes: {
    name: "פתקים", icon: "📝", w: 520, h: 400,
    render(body, win, opts = {}) {
      body.innerHTML = "";
      const wrap = el("div", "notes-wrap");
      const bar = el("div", "notes-toolbar");
      const status = el("span", "", "נשמר ✓");
      const clear = el("button", "chip", "נקה");
      const area = el("textarea", "notes-area");
      area.value = opts.text != null ? opts.text : settings.notes;
      area.spellcheck = false;

      let t;
      area.addEventListener("input", () => {
        status.textContent = "שומר…";
        clearTimeout(t);
        t = setTimeout(() => {
          if (opts.text != null) { status.textContent = "תצוגה בלבד"; return; }
          settings = store.set({ notes: area.value });
          status.textContent = "נשמר ✓";
        }, 400);
      });
      clear.onclick = () => { area.value = ""; area.dispatchEvent(new Event("input")); };

      bar.append(el("span", "", opts.title ? "📄 " + opts.title : "📝 הפתקים שלי"), status, clear);
      wrap.append(bar, area);
      body.appendChild(wrap);
      setTimeout(() => area.focus(), 60);
    },
  },

  calc: {
    name: "מחשבון", icon: "🧮", w: 340, h: 460,
    render(body) {
      body.innerHTML = "";
      const wrap = el("div", "calc");
      const screen = el("div", "calc-screen");
      const expr = el("div", "calc-expr", "");
      const out = el("div", "", "0");
      screen.append(expr, out);
      const grid = el("div", "calc-grid");

      let current = "";
      const keys = ["C", "( )", "%", "÷", "7", "8", "9", "×", "4", "5", "6", "−", "1", "2", "3", "+", "0", ".", "⌫", "="];
      let paren = 0;

      function show() { out.textContent = current || "0"; expr.textContent = ""; }

      function evaluate(str) {
        let s = str.replace(/÷/g, "/").replace(/×/g, "*").replace(/−/g, "-");
        if (!/^[-+*/(). \d]*$/.test(s)) throw new Error("bad");
        // eslint-disable-next-line no-new-func
        const val = Function(`"use strict";return (${s})`)();
        if (!isFinite(val)) throw new Error("math");
        return Math.round(val * 1e10) / 1e10;
      }

      grid.addEventListener("click", (e) => {
        const b = e.target.closest("button");
        if (!b) return;
        const k = b.textContent;
        if (k === "C") { current = ""; paren = 0; }
        else if (k === "⌫") current = current.slice(0, -1);
        else if (k === "=") {
          try { expr.textContent = current; current = String(evaluate(current)); paren = 0; out.textContent = current; return; }
          catch { out.textContent = "שגיאה"; current = ""; expr.textContent = ""; return; }
        } else if (k === "( )") { current += paren % 2 === 0 ? "(" : ")"; paren++; }
        else current += k;
        show();
      });

      keys.forEach((k) => {
        const b = el("button", k === "=" ? "eq" : /[÷×−+%]/.test(k) ? "op" : "", k);
        grid.appendChild(b);
      });
      wrap.append(screen, grid);
      body.appendChild(wrap);
    },
  },

  settings: {
    name: "הגדרות", icon: "⚙️", w: 520, h: 480,
    render(body, win) {
      const paint = () => {
        body.innerHTML = "";
        const wrap = el("div", "settings");

        const g1 = el("div", "set-group", "<h4>רקע שולחן העבודה</h4>");
        const sw = el("div", "swatches");
        WALLPAPERS.forEach((w) => {
          const s = el("div", "swatch" + (w === settings.wallpaper ? " active" : ""));
          s.style.background = w;
          s.onclick = () => { settings = store.set({ wallpaper: w }); applySettings(); paint(); };
          sw.appendChild(s);
        });
        g1.appendChild(sw);

        const g2 = el("div", "set-group", "<h4>צבע הדגשה</h4>");
        const accs = el("div", "accents");
        ACCENTS.forEach((c) => {
          const a = el("div", "acc" + (c === settings.accent ? " active" : ""));
          a.style.background = c;
          a.onclick = () => { settings = store.set({ accent: c }); applySettings(); paint(); };
          accs.appendChild(a);
        });
        g2.appendChild(accs);

        const g3 = el("div", "set-group", "<h4>מראה</h4>");
        const row = el("div", "row", "<span>מצב כהה</span>");
        const toggle = el("button", "chip" + (settings.theme === "dark" ? " active" : ""), settings.theme === "dark" ? "פעיל" : "כבוי");
        toggle.onclick = () => { settings = store.set({ theme: settings.theme === "dark" ? "light" : "dark" }); applySettings(); paint(); };
        row.appendChild(toggle);
        g3.appendChild(row);

        const g4 = el("div", "set-group", "<h4>מערכת</h4>");
        const r2 = el("div", "row", "<span>גרסת מערכת</span><span>LemonOS 1.0</span>");
        const r3 = el("div", "row", "<span>אחסון מקומי</span>");
        const reset = el("button", "chip", "אפס הגדרות");
        reset.onclick = () => { settings = store.set(DEFAULTS); applySettings(); paint(); };
        r3.appendChild(reset);
        g4.append(r2, r3);

        wrap.append(g1, g2, g3, g4);
        body.appendChild(wrap);
      };
      paint();
    },
  },

  about: {
    name: "אודות המערכת", icon: "🍋", w: 420, h: 460,
    render(body) {
      const specs = [
        ["דגם", "LemonBook Pro (Web)"],
        ["מעבד", "LemonSilicon W1 · 8 ליבות"],
        ["זיכרון", "16 GB מאוחד"],
        ["אחסון", "512 GB SSD"],
        ["מערכת הפעלה", "LemonOS 1.0"],
        ["דפדפן", navigator.userAgent.split(") ")[0].split("(")[0].trim() || "—"],
        ["רזולוציה", window.innerWidth + " × " + window.innerHeight],
        ["שפה", navigator.language || "he"],
      ];
      body.innerHTML = "";
      const wrap = el("div", "about");
      wrap.innerHTML = `<div class="big-logo">🍋</div><h2>LemonOS</h2><div class="ver">גרסה 1.0 · build 2026.10</div>`;
      const list = el("div", "spec-list");
      specs.forEach(([k, v]) => list.appendChild(el("div", "row", `<span>${k}</span><span>${v}</span>`)));
      wrap.appendChild(list);
      body.appendChild(wrap);
    },
  },

  browser: {
    name: "דפדפן", icon: "🌐", w: 620, h: 440,
    render(body) {
      body.innerHTML = "";
      const bar = el("div", "app-toolbar");
      const url = el("div", "chip", "🔒  lemon://start");
      url.style.flex = "1";
      bar.append(el("span", "chip", "◀"), el("span", "chip", "▶"), url, el("span", "chip", "⟳"));
      const page = el("div", "web");
      page.innerHTML = `
        <h3>ברוך הבא לדפדפן של LemonOS 🌐</h3>
        <p>זהו דפדפן מדומה — הוא לא טוען אתרים אמיתיים, אבל הוא חלק מהמחשב הזה.</p>
        <p>אפשר לפתוח אפליקציות אחרות מהטרמינל עם <code>open files</code>, <code>open notes</code> וכן הלאה.</p>
        <p>טיפ: לחץ קליק ימני על שולחן העבודה כדי לפתוח תפריט הקשר.</p>
      `;
      body.append(bar, page);
    },
  },
};

const DESKTOP_ICONS = ["files", "terminal", "notes", "browser", "about"];
const DOCK_ORDER = ["files", "terminal", "notes", "calc", "browser", "settings", "about"];

/* ---------------- Window manager ---------------- */
let zTop = 20;
const openWindows = new Map(); // id -> { node, appId }

function openApp(appId, opts = {}) {
  const app = APPS[appId];
  if (!app) return;

  if (openWindows.has(appId) && !opts.force) {
    const rec = openWindows.get(appId);
    if (rec.node.classList.contains("minimized")) rec.node.classList.remove("minimized");
    focusWin(rec.node);
    updateDock();
    return rec.node;
  }

  const node = el("div", "window");
  const w = Math.min(app.w, window.innerWidth - 40);
  const h = Math.min(app.h, window.innerHeight - 120);
  const offset = (openWindows.size % 6) * 28;
  node.style.width = w + "px";
  node.style.height = h + "px";
  node.style.left = Math.max(20, Math.min(window.innerWidth - w - 20, (window.innerWidth - w) / 2 + offset - 60)) + "px";
  node.style.top = Math.max(40, 60 + offset) + "px";
  node.style.zIndex = ++zTop;

  const bar = el("div", "titlebar");
  const lights = el("div", "lights");
  const bClose = el("button", "light close", "<span>✕</span>");
  const bMin = el("button", "light min", "<span>–</span>");
  const bMax = el("button", "light max", "<span>+</span>");
  lights.append(bClose, bMin, bMax);
  const title = el("div", "win-title", app.name);
  bar.append(lights, title);

  const body = el("div", "win-body");
  const resize = el("div", "resize-handle");

  node.append(bar, body, resize);
  $("#windowsLayer").appendChild(node);

  bClose.onclick = (e) => { e.stopPropagation(); closeWin(node); };
  bMin.onclick = (e) => { e.stopPropagation(); node.classList.add("minimized"); updateDock(); };
  bMax.onclick = (e) => { e.stopPropagation(); toggleMax(node); };
  node.addEventListener("mousedown", () => focusWin(node));

  makeDraggable(node, bar);
  makeResizable(node, resize);
  app.render(body, node, opts);

  openWindows.set(appId, { node, appId });
  focusWin(node);
  updateDock();
  updateActiveAppName(app.name);
  return node;
}

function closeWin(node) {
  for (const [id, rec] of openWindows) if (rec.node === node) openWindows.delete(id);
  node.remove();
  updateDock();
  updateActiveAppName("Finder");
}

function focusWin(node) {
  node.style.zIndex = ++zTop;
  $$(".window").forEach((n) => n.style.opacity = n === node ? "1" : "0.985");
}

function toggleMax(node) {
  if (node.classList.contains("maximized")) {
    const r = node._restore;
    node.classList.remove("maximized");
    Object.assign(node.style, r);
  } else {
    node._restore = { left: node.style.left, top: node.style.top, width: node.style.width, height: node.style.height };
    node.classList.add("maximized");
    Object.assign(node.style, { left: "0px", top: "30px", width: "100vw", height: "calc(100vh - 30px)" });
  }
}

function makeDraggable(node, handle) {
  handle.addEventListener("mousedown", (e) => {
    if (e.target.closest(".light")) return;
    if (node.classList.contains("maximized")) return;
    const startX = e.clientX, startY = e.clientY;
    const ox = parseFloat(node.style.left) || 0, oy = parseFloat(node.style.top) || 0;
    const move = (ev) => {
      let nx = ox + (ev.clientX - startX);
      let ny = oy + (ev.clientY - startY);
      ny = Math.max(30, Math.min(window.innerHeight - 40, ny));
      nx = Math.max(-node.offsetWidth + 120, Math.min(window.innerWidth - 60, nx));
      node.style.left = nx + "px";
      node.style.top = ny + "px";
    };
    const up = () => { document.removeEventListener("mousemove", move); document.removeEventListener("mouseup", up); };
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
    e.preventDefault();
  });
}

function makeResizable(node, handle) {
  handle.addEventListener("mousedown", (e) => {
    if (node.classList.contains("maximized")) return;
    e.preventDefault(); e.stopPropagation();
    const startX = e.clientX, startY = e.clientY;
    const ow = node.offsetWidth, oh = node.offsetHeight;
    const move = (ev) => {
      node.style.width = Math.max(320, ow + (ev.clientX - startX)) + "px";
      node.style.height = Math.max(220, oh + (ev.clientY - startY)) + "px";
    };
    const up = () => { document.removeEventListener("mousemove", move); document.removeEventListener("mouseup", up); };
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  });
}

function updateActiveAppName(name) { $("#activeAppName").textContent = name; }

/* ---------------- Dock & desktop icons ---------------- */
function buildDock() {
  const dock = $("#dock");
  dock.innerHTML = "";
  DOCK_ORDER.forEach((id) => {
    const app = APPS[id];
    const b = el("button", "dock-item", `<span>${app.icon}</span><span class="dot"></span><span class="dock-tip">${app.name}</span>`);
    b.dataset.app = id;
    b.onclick = () => {
      const rec = openWindows.get(id);
      if (rec && !rec.node.classList.contains("minimized")) {
        rec.node.classList.add("minimized");
      } else openApp(id);
      updateDock();
    };
    dock.appendChild(b);
  });
  updateDock();
}

function updateDock() {
  $$(".dock-item").forEach((b) => b.classList.toggle("running", openWindows.has(b.dataset.app)));
}

function buildDesktopIcons() {
  const host = $("#desktopIcons");
  host.innerHTML = "";
  DESKTOP_ICONS.forEach((id) => {
    const app = APPS[id];
    const d = el("div", "desk-icon", `<div class="ico">${app.icon}</div><div>${app.name}</div>`);
    d.ondblclick = () => openApp(id);
    d.onclick = () => { $$(".desk-icon").forEach((n) => n.style.background = ""); d.style.background = "rgba(255,255,255,0.16)"; };
    host.appendChild(d);
  });
}

/* ---------------- Context menu ---------------- */
function initContextMenu() {
  const menu = $("#contextMenu");
  $("#desktop").addEventListener("contextmenu", (e) => {
    if (e.target.closest(".window")) return;
    e.preventDefault();
    menu.classList.remove("hidden");
    const x = Math.min(e.clientX, window.innerWidth - 200);
    const y = Math.min(e.clientY, window.innerHeight - 190);
    menu.style.left = x + "px";
    menu.style.top = y + "px";
  });
  document.addEventListener("click", () => menu.classList.add("hidden"));
  menu.addEventListener("click", (e) => {
    const item = e.target.closest(".ctx-item");
    if (!item) return;
    const a = item.dataset.ctx;
    if (a === "terminal") openApp("terminal");
    else if (a === "files") openApp("files");
    else if (a === "about") openApp("about");
    else if (a === "wallpaper") openApp("settings");
    menu.classList.add("hidden");
  });
}

/* ---------------- Menubar ---------------- */
function initMenubar() {
  $("#appleMenu").onclick = (e) => {
    e.stopPropagation();
    const menu = $("#contextMenu");
    menu.classList.remove("hidden");
    const r = e.target.getBoundingClientRect();
    menu.style.left = r.left + "px";
    menu.style.top = "32px";
  };
  $$(".menu-item").forEach((m) => {
    m.onclick = () => {
      const which = m.dataset.menu;
      if (which === "system") openApp("settings");
      else if (which === "view") openApp("settings");
      else if (which === "help") openApp("browser");
    };
  });
  $("#statusUser").onclick = () => openApp("about");
}

/* ---------------- Clock ---------------- */
function tickClock() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  $("#statusClock").textContent = `${hh}:${mm}`;
}

/* ---------------- Theme ---------------- */
function applySettings() {
  document.documentElement.style.setProperty("--accent", settings.accent);
  document.documentElement.style.setProperty("--accent-soft", hexToRgba(settings.accent, 0.18));
  document.documentElement.style.setProperty("--wallpaper", settings.wallpaper);
  document.body.classList.toggle("light", settings.theme === "light");
}
function hexToRgba(hex, a) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

/* ---------------- Boot sequence ---------------- */
function boot() {
  applySettings();
  const fill = $("#bootFill");
  let p = 0;
  const iv = setInterval(() => {
    p += Math.random() * 18 + 6;
    if (p >= 100) {
      p = 100;
      clearInterval(iv);
      fill.style.width = "100%";
      setTimeout(() => {
        $("#boot").classList.add("fade");
        setTimeout(() => {
          $("#boot").classList.add("hidden");
          $("#login").classList.remove("hidden");
        }, 500);
      }, 350);
    }
    fill.style.width = Math.min(100, p) + "%";
  }, 220);
}

function enterDesktop() {
  $("#login").classList.add("hidden");
  $("#desktop").classList.remove("hidden");
  buildDesktopIcons();
  buildDock();
  initContextMenu();
  initMenubar();
  tickClock();
  setInterval(tickClock, 1000);
  // welcome window
  setTimeout(() => openApp("about"), 300);
}

/* ---------------- Init ---------------- */
$("#loginBtn").onclick = enterDesktop;
$("#login").addEventListener("click", (e) => { if (e.target.id === "login") enterDesktop(); });
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !$("#login").classList.contains("hidden")) enterDesktop();
  if (e.key === "Escape") $("#contextMenu").classList.add("hidden");
});
window.addEventListener("resize", () => {
  $$(".window").forEach((n) => {
    if (n.classList.contains("maximized")) Object.assign(n.style, { width: "100vw", height: "calc(100vh - 30px)" });
  });
});

boot();
