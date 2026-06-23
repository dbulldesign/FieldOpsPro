/* ============================================================
   FieldOps Pro — PIN Auth & Role-Based Tool Access
   ------------------------------------------------------------
   Self-contained module. Loaded last (after the main app script)
   so all app globals (switchView, viewTitles, db, toast) exist.

   - Lock screen (4-digit PIN) gates the whole app.
   - Two roles: 'admin' (full access + user management) and
     'user' (only the tools an admin granted).
   - Admins create users and choose which tools each can access.
   - Users pick which of their granted tools to show in the nav.
   - Accounts + PINs sync via Firestore (_app_state/users), with a
     localStorage mirror for offline / first-paint.

   Defaults seeded on first run:
     Admin  — PIN 4116  (all tools)
     TEST   — PIN 1565  (no tools until granted)
   ============================================================ */
(function () {
  'use strict';

  var USERS_DOC = { col: '_app_state', doc: 'users' };
  var LS_USERS   = 'fop_users';
  var LS_SESSION = 'fop_session';

  // Settings is always kept so users can always reach the tool-picker /
  // lock controls. Everything else — including Dashboard — is grantable.
  var ALWAYS_ON = { settings: 1 };

  // Catalog of grantable tools, grouped to mirror the app's sidebar.
  var TOOL_SECTIONS = [
    { name: 'Workspace',  tools: ['dashboard', 'projects', 'calendar'] },
    { name: 'Operations', tools: ['pos', 'shipping'] },
    { name: 'Field Work', tools: ['punchlist', 'fieldlog', 'systainer', 'mapview', 'timekeeping'] },
    { name: 'Calculators & Tools', tools: ['dmxcalc', 'ledcalc', 'colorcalc', 'dipcalc', 'voltcalc',
      'wiringref', 'lutronlink', 'dmxaddrcalc', 'lutroncheck', 'photometrics', 'beamspread',
      'sectionstudy', 'circuitload', 'luxconvert', 'artnetplan', 'twblend', 'cablecutlist',
      'ohmslaw', 'iprating', 'etccablecross', 'fixturedb'] },
    { name: 'Knowledge',  tools: ['troubleshoot', 'specdocs', 'vendors'] },
    { name: 'System',     tools: ['settings'] }
  ];
  var LABELS_FALLBACK = { timekeeping: 'Time Tracking' };

  // Containers whose nav entries we hide for tools a user can't see.
  // (The switchView guard below is the real enforcement; this is cosmetic.)
  var NAV_CONTAINERS = ['#sidebar', '#mob-tab-bar', '#mob-more-sheet', '#fab-menu', '#desk-add-menu'];
  // Mobile-tab ids that should never hide regardless of grants.
  var TAB_ALWAYS = { quicktasks: 1, settings: 1 };

  // ---- module state ----
  var users = [];                 // [{id,name,pin,role,allowedTools,enabledTools,createdAt}]
  var currentUser = null;
  var remoteUpdatedAt = 0;        // last updatedAt seen from Firestore
  var seeded = false;
  var origSwitchView = null;

  // ---------------------------------------------------------
  // helpers
  // ---------------------------------------------------------
  function toolLabel(id) {
    return (window.viewTitles && window.viewTitles[id]) || LABELS_FALLBACK[id] || id;
  }
  function esc(s) {
    return (window.escH ? window.escH(s) : String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'));
  }
  function notify(msg) {
    if (typeof window.toast === 'function') window.toast(msg);
    else console.log('[auth]', msg);
  }
  function allToolIds() {
    var ids = [];
    TOOL_SECTIONS.forEach(function (s) { s.tools.forEach(function (t) { ids.push(t); }); });
    return ids;
  }
  function genId() {
    return 'u_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }
  function isAdmin(u) { return !!u && u.role === 'admin'; }

  // Effective set of tools a user is permitted to open.
  function allowedSet(u) {
    var set = {};
    if (isAdmin(u)) { allToolIds().forEach(function (t) { set[t] = 1; }); return set; }
    Object.keys(ALWAYS_ON).forEach(function (t) { set[t] = 1; });
    (u && u.allowedTools || []).forEach(function (t) { set[t] = 1; });
    return set;
  }
  // Subset the user has chosen to actually show in nav.
  function visibleSet(u) {
    if (isAdmin(u)) return allowedSet(u);
    var allowed = allowedSet(u);
    var enabled = (u && u.enabledTools) ? u.enabledTools : (u && u.allowedTools) || [];
    var set = {};
    Object.keys(ALWAYS_ON).forEach(function (t) { set[t] = 1; });
    enabled.forEach(function (t) { if (allowed[t]) set[t] = 1; });
    return set;
  }

  // ---------------------------------------------------------
  // persistence (localStorage mirror + Firestore sync)
  // ---------------------------------------------------------
  function loadCache() {
    try {
      var raw = localStorage.getItem(LS_USERS);
      if (raw) {
        var obj = JSON.parse(raw);
        if (obj && obj.list) { users = obj.list; remoteUpdatedAt = obj.updatedAt || 0; return true; }
      }
    } catch (e) {}
    return false;
  }
  function saveCache() {
    try { localStorage.setItem(LS_USERS, JSON.stringify({ list: users, updatedAt: remoteUpdatedAt })); } catch (e) {}
  }

  function defaultUsers() {
    var now = Date.now();
    return [
      { id: genId(), name: 'Admin', pin: '4116', role: 'admin', allowedTools: allToolIds(), enabledTools: [], createdAt: now },
      { id: genId(), name: 'TEST',  pin: '1565', role: 'user',  allowedTools: [], enabledTools: [], createdAt: now + 1 }
    ];
  }

  // Persist the current `users` array (cache always; Firestore if online).
  function persist() {
    remoteUpdatedAt = Date.now();
    saveCache();
    pushRemote();
  }
  function pushRemote() {
    var db = window.db;
    if (!db) return;
    try {
      db.collection(USERS_DOC.col).doc(USERS_DOC.doc)
        .set({ list: users, updatedAt: remoteUpdatedAt })
        .catch(function (e) { console.warn('[auth] push failed', e && e.message); });
    } catch (e) {}
  }

  var listenerAttached = false;
  function attachRemote() {
    var db = window.db;
    if (!db || listenerAttached) return;
    listenerAttached = true;
    try {
      db.collection(USERS_DOC.col).doc(USERS_DOC.doc).onSnapshot(function (snap) {
        if (!snap.exists) {
          // No accounts doc yet — first device online seeds it.
          if (!seeded && users.length) { seeded = true; pushRemote(); }
          return;
        }
        var d = snap.data() || {};
        if (!d.list) return;
        // Remote is authoritative when newer (or equal, to converge).
        if ((d.updatedAt || 0) >= remoteUpdatedAt) {
          users = d.list;
          remoteUpdatedAt = d.updatedAt || Date.now();
          seeded = true;
          saveCache();
          onUsersChanged();
        } else {
          // Local cache is newer (offline edits) — push it up.
          pushRemote();
        }
      }, function (err) { console.warn('[auth] users snapshot error', err && err.message); });
    } catch (e) { listenerAttached = false; }
  }

  // db is created ~1.2s after load and re-created on reconnect; poll for it.
  function waitForDb() {
    if (window.db) { attachRemote(); if (!seeded) pushRemote(); }
    setInterval(function () {
      if (window.db && !listenerAttached) attachRemote();
    }, 1500);
  }

  // Re-apply access + refresh any open management UI when the list changes.
  function onUsersChanged() {
    if (currentUser) {
      var fresh = userById(currentUser.id);
      if (!fresh) { lock(); return; }           // account was deleted elsewhere
      currentUser = fresh;
      applyAccess();
    }
    if (document.getElementById('fop-account-card')) renderAccountCard();
    if (isModalOpen('fop-users-modal')) renderUsersList();
  }

  function userById(id) {
    for (var i = 0; i < users.length; i++) if (users[i].id === id) return users[i];
    return null;
  }
  function userByPin(pin) {
    for (var i = 0; i < users.length; i++) if (users[i].pin === pin) return users[i];
    return null;
  }

  // ---------------------------------------------------------
  // access control application
  // ---------------------------------------------------------
  function navTargetOf(el) {
    var oc = el.getAttribute('onclick') || '';
    var m = oc.match(/switchView\('([^']+)'\)/) ||
            oc.match(/mobTabSwitch\('([^']+)'\)/) ||
            oc.match(/closeMobMore\('([^']+)'\)/);
    return m ? m[1] : null;
  }

  function applyAccess() {
    var u = currentUser;
    var vis = visibleSet(u);
    window._fopUser = u;
    window._fopAllowed = allowedSet(u);

    NAV_CONTAINERS.forEach(function (sel) {
      var root = document.querySelector(sel);
      if (!root) return;
      var nodes = root.querySelectorAll('[onclick]');
      Array.prototype.forEach.call(nodes, function (el) {
        var v = navTargetOf(el);
        if (!v) return;
        if (TAB_ALWAYS[v]) return;                 // Tasks / Settings tabs stay
        var keep = !!vis[v];
        // Hide the clickable row itself (nav-item / tab / option).
        // Use a class with !important so app CSS rules can't override us.
        var row = el.closest ? el.closest('.nav-item,.mob-tab-item,.fab-option,.desk-add-opt') || el : el;
        row.classList.toggle('fop-hidden', !keep);
      });
    });

    // Empty nav-section headers (all children hidden) — hide the label too.
    Array.prototype.forEach.call(document.querySelectorAll('#sidebar .nav-section'), function (sec) {
      var items = sec.querySelectorAll('.nav-item');
      var anyVisible = Array.prototype.some.call(items, function (it) { return !it.classList.contains('fop-hidden'); });
      var label = sec.querySelector('.nav-label');
      if (label && items.length) label.classList.toggle('fop-hidden', !anyVisible);
    });

    // If current view is now off-limits, bounce to a safe landing.
    if (window.currentView && !window._fopAllowed[window.currentView]) {
      gotoLanding();
    }
    if (document.getElementById('fop-account-card')) renderAccountCard();
  }

  function gotoLanding() {
    var target = firstVisible();
    if (origSwitchView) origSwitchView(target); else if (window.switchView) window.switchView(target);
  }
  // First tool the user can see; falls back to Settings if they have none.
  function firstVisible() {
    var vis = visibleSet(currentUser);
    var ids = allToolIds();
    for (var i = 0; i < ids.length; i++) if (vis[ids[i]] && ids[i] !== 'settings') return ids[i];
    return 'settings';
  }

  // Wrap switchView so disallowed views can't be opened by any path.
  function installSwitchGuard() {
    if (origSwitchView || typeof window.switchView !== 'function') return;
    origSwitchView = window.switchView;
    window.switchView = function (v) {
      if (currentUser && !isAdmin(currentUser)) {
        var allowed = window._fopAllowed || allowedSet(currentUser);
        if (v && !allowed[v]) {
          notify('You don’t have access to ' + toolLabel(v));
          gotoLanding();
          return;
        }
      }
      return origSwitchView.apply(this, arguments);
    };
  }

  // ---------------------------------------------------------
  // session
  // ---------------------------------------------------------
  function login(u) {
    currentUser = u;
    try { localStorage.setItem(LS_SESSION, u.id); } catch (e) {}
    installSwitchGuard();
    applyAccess();
    hideLock();
    injectAccountCard();
    gotoLanding();
    notify('Welcome, ' + u.name);
  }
  function lock() {
    currentUser = null;
    try { localStorage.removeItem(LS_SESSION); } catch (e) {}
    showLock();
  }
  window.fopLock = lock;
  window.fopLogout = lock;

  function restoreSession() {
    var id = null;
    try { id = localStorage.getItem(LS_SESSION); } catch (e) {}
    var u = id && userById(id);
    if (u) { login(u); return true; }
    showLock();
    return false;
  }

  // ---------------------------------------------------------
  // styles
  // ---------------------------------------------------------
  function injectStyles() {
    if (document.getElementById('fop-auth-styles')) return;
    var css =
      '#fop-lock{position:fixed;inset:0;z-index:999999;display:flex;align-items:center;justify-content:center;' +
        'background:var(--bg,#0d1526);background-image:radial-gradient(1200px 600px at 50% -10%,rgba(79,142,247,0.18),transparent);' +
        'font-family:"Plus Jakarta Sans",system-ui,sans-serif;-webkit-user-select:none;user-select:none}' +
      '#fop-lock .fl-card{width:min(92vw,360px);text-align:center;padding:8px 4px}' +
      '#fop-lock .fl-logo{width:64px;height:64px;margin:0 auto 18px;border-radius:18px;background:linear-gradient(145deg,#1a2540,#0e1828);' +
        'display:flex;align-items:center;justify-content:center;font-size:30px;box-shadow:0 16px 40px rgba(0,0,0,.45)}' +
      '#fop-lock h1{font-size:22px;font-weight:800;color:var(--text,#f0f4ff);margin:0 0 4px;letter-spacing:-.02em}' +
      '#fop-lock h1 span{color:var(--orange,#f97316)}' +
      '#fop-lock .fl-sub{font-size:13px;color:var(--text-muted,#6e8aad);margin-bottom:26px}' +
      '#fop-lock .fl-dots{display:flex;gap:16px;justify-content:center;margin-bottom:30px}' +
      '#fop-lock .fl-dot{width:15px;height:15px;border-radius:50%;border:2px solid var(--border-strong,rgba(255,255,255,.25));transition:.15s}' +
      '#fop-lock .fl-dot.on{background:var(--accent,#4f8ef7);border-color:var(--accent,#4f8ef7);box-shadow:0 0 12px rgba(79,142,247,.6)}' +
      '#fop-lock.shake .fl-dots{animation:flShake .4s}' +
      '@keyframes flShake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-9px)}40%,80%{transform:translateX(9px)}}' +
      '#fop-lock .fl-pad{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;max-width:280px;margin:0 auto}' +
      '#fop-lock .fl-key{height:68px;border-radius:50%;border:1px solid var(--border,rgba(255,255,255,.12));' +
        'background:var(--surface,#111d30);color:var(--text,#f0f4ff);font-size:26px;font-weight:600;cursor:pointer;' +
        'display:flex;align-items:center;justify-content:center;transition:.12s;-webkit-tap-highlight-color:transparent}' +
      '#fop-lock .fl-key:hover{background:var(--surface-2,#141f35)}' +
      '#fop-lock .fl-key:active{transform:scale(.93);background:var(--accent,#4f8ef7);color:#fff}' +
      '#fop-lock .fl-key.fl-blank{background:none;border:none;cursor:default}' +
      '#fop-lock .fl-key.fl-act{font-size:20px;background:none;border:none;color:var(--text-muted,#6e8aad)}' +
      '#fop-lock .fl-hint{margin-top:26px;font-size:11px;color:var(--text-muted,#6e8aad);opacity:.7}' +
      /* account + users UI */
      '#fop-account-card .fop-row{display:flex;align-items:center;gap:12px;flex-wrap:wrap}' +
      '.fop-btn{display:inline-flex;align-items:center;gap:7px;border:1px solid var(--border,rgba(255,255,255,.12));' +
        'background:var(--surface-2,#141f35);color:var(--text,#f0f4ff);border-radius:11px;padding:9px 15px;font-size:13px;' +
        'font-weight:600;cursor:pointer;transition:.12s;font-family:inherit}' +
      '.fop-btn:hover{border-color:var(--border-strong,rgba(255,255,255,.25))}' +
      '.fop-btn.primary{background:var(--accent,#4f8ef7);border-color:var(--accent,#4f8ef7);color:#fff}' +
      '.fop-btn.danger{background:rgba(239,68,68,.12);border-color:rgba(239,68,68,.4);color:#f87171}' +
      '.fop-badge{font-size:10px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;padding:3px 9px;border-radius:99px}' +
      '.fop-badge.admin{background:rgba(249,115,22,.18);color:var(--orange,#f97316)}' +
      '.fop-badge.user{background:rgba(79,142,247,.18);color:var(--accent,#4f8ef7)}' +
      '.fop-overlay{position:fixed;inset:0;z-index:99990;background:rgba(0,0,0,.6);backdrop-filter:blur(4px);' +
        'display:flex;align-items:center;justify-content:center;padding:16px}' +
      '.fop-modal{width:min(94vw,560px);max-height:88vh;overflow:auto;background:var(--surface,#111d30);' +
        'border:1px solid var(--border,rgba(255,255,255,.12));border-radius:20px;padding:22px;' +
        'box-shadow:0 30px 80px rgba(0,0,0,.6);font-family:"Plus Jakarta Sans",system-ui,sans-serif}' +
      '.fop-modal h3{font-size:18px;font-weight:800;color:var(--text,#f0f4ff);margin:0}' +
      '.fop-modal label{display:block;font-size:12px;font-weight:700;color:var(--text-secondary,#a3b8d4);margin:14px 0 6px}' +
      '.fop-modal input[type=text],.fop-modal input[type=tel],.fop-modal select{width:100%;padding:11px 13px;border-radius:11px;' +
        'border:1px solid var(--border,rgba(255,255,255,.12));background:var(--surface-2,#141f35);color:var(--text,#f0f4ff);' +
        'font-size:14px;font-family:inherit;box-sizing:border-box}' +
      '.fop-ulist{display:flex;flex-direction:column;gap:10px;margin-top:6px}' +
      '.fop-urow{display:flex;align-items:center;gap:12px;padding:13px;border-radius:13px;' +
        'border:1px solid var(--border,rgba(255,255,255,.1));background:var(--surface-2,#141f35)}' +
      '.fop-urow .nm{font-size:14px;font-weight:700;color:var(--text,#f0f4ff)}' +
      '.fop-urow .mt{font-size:11px;color:var(--text-muted,#6e8aad)}' +
      '.fop-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:6px}' +
      '.fop-tool{display:flex;align-items:center;gap:9px;padding:9px 11px;border-radius:10px;cursor:pointer;' +
        'border:1px solid var(--border,rgba(255,255,255,.1));background:var(--surface-2,#141f35);font-size:13px;' +
        'color:var(--text,#f0f4ff)}' +
      '.fop-tool input{width:16px;height:16px;accent-color:var(--accent,#4f8ef7)}' +
      '.fop-tool.locked{opacity:.55;cursor:not-allowed}' +
      '.fop-sech{grid-column:1/-1;font-size:11px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;' +
        'color:var(--text-muted,#6e8aad);margin:10px 0 2px}' +
      '.fop-hidden{display:none !important}' +
      '@media(max-width:520px){.fop-grid{grid-template-columns:1fr}}';
    var st = document.createElement('style');
    st.id = 'fop-auth-styles';
    st.textContent = css;
    document.head.appendChild(st);
  }

  // ---------------------------------------------------------
  // lock screen
  // ---------------------------------------------------------
  var entry = '';
  function buildLock() {
    if (document.getElementById('fop-lock')) return;
    var el = document.createElement('div');
    el.id = 'fop-lock';
    var keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'blank', '0', 'back'];
    var pad = keys.map(function (k) {
      if (k === 'blank') return '<button class="fl-key fl-blank" tabindex="-1"></button>';
      if (k === 'back')  return '<button class="fl-key fl-act" data-k="back" aria-label="Delete">⌫</button>';
      return '<button class="fl-key" data-k="' + k + '">' + k + '</button>';
    }).join('');
    el.innerHTML =
      '<div class="fl-card">' +
        '<div class="fl-logo">⛑️</div>' +
        '<h1>FieldOps<span> Pro</span></h1>' +
        '<div class="fl-sub">Enter your 4-digit PIN</div>' +
        '<div class="fl-dots">' +
          '<div class="fl-dot"></div><div class="fl-dot"></div><div class="fl-dot"></div><div class="fl-dot"></div>' +
        '</div>' +
        '<div class="fl-pad">' + pad + '</div>' +
        '<div class="fl-hint">FieldOps Pro · Lighting Control Suite</div>' +
      '</div>';
    document.body.appendChild(el);

    el.addEventListener('click', function (e) {
      var b = e.target.closest('[data-k]');
      if (!b) return;
      var k = b.getAttribute('data-k');
      if (k === 'back') { entry = entry.slice(0, -1); paintDots(); return; }
      if (entry.length >= 4) return;
      entry += k;
      paintDots();
      if (entry.length === 4) setTimeout(tryPin, 120);
    });
    // hardware keyboard support
    document.addEventListener('keydown', function (e) {
      if (!isLockVisible()) return;
      if (/^[0-9]$/.test(e.key)) { if (entry.length < 4) { entry += e.key; paintDots(); if (entry.length === 4) setTimeout(tryPin, 120); } }
      else if (e.key === 'Backspace') { entry = entry.slice(0, -1); paintDots(); }
    });
  }
  function paintDots() {
    var dots = document.querySelectorAll('#fop-lock .fl-dot');
    Array.prototype.forEach.call(dots, function (d, i) { d.classList.toggle('on', i < entry.length); });
  }
  function tryPin() {
    var u = userByPin(entry);
    if (u) { entry = ''; paintDots(); login(u); }
    else {
      var lk = document.getElementById('fop-lock');
      lk.classList.add('shake');
      setTimeout(function () { lk.classList.remove('shake'); entry = ''; paintDots(); }, 420);
    }
  }
  function isLockVisible() {
    var l = document.getElementById('fop-lock');
    return l && l.style.display !== 'none';
  }
  function showLock() { buildLock(); entry = ''; paintDots(); var l = document.getElementById('fop-lock'); if (l) l.style.display = 'flex'; }
  function hideLock() { var l = document.getElementById('fop-lock'); if (l) l.style.display = 'none'; }

  // ---------------------------------------------------------
  // account card (injected into Settings view)
  // ---------------------------------------------------------
  function injectAccountCard() {
    var view = document.getElementById('view-settings');
    if (!view) return;
    var wrap = view.querySelector('div');
    if (!wrap) return;
    var card = document.getElementById('fop-account-card');
    if (!card) {
      card = document.createElement('div');
      card.id = 'fop-account-card';
      card.className = 'card';
      card.style.marginBottom = '20px';
      wrap.insertBefore(card, wrap.firstChild);
    }
    renderAccountCard();
  }
  function renderAccountCard() {
    var card = document.getElementById('fop-account-card');
    if (!card || !currentUser) return;
    var u = currentUser;
    var html =
      '<div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">' +
        '<span style="font-size:24px">👤</span>' +
        '<div><div class="section-title">Account</div>' +
        '<div class="section-sub">Signed in as <strong>' + esc(u.name) + '</strong> ' +
        '<span class="fop-badge ' + (isAdmin(u) ? 'admin' : 'user') + '">' + (isAdmin(u) ? 'Admin' : 'User') + '</span></div></div>' +
      '</div>' +
      '<div class="fop-row">' +
        '<button class="fop-btn" onclick="fopLock()">🔒 Lock</button>' +
        (isAdmin(u)
          ? '<button class="fop-btn primary" onclick="fopOpenUsers()">👥 Manage Users</button>'
          : '<button class="fop-btn primary" onclick="fopOpenMyTools()">🧰 My Tools</button>') +
      '</div>';

    if (!isAdmin(u)) {
      var allowed = (u.allowedTools || []);
      html += '<div style="margin-top:14px;font-size:12px;color:var(--text-muted,#6e8aad)">' +
        (allowed.length
          ? 'You have access to ' + allowed.length + ' tool' + (allowed.length === 1 ? '' : 's') + '. Tap “My Tools” to choose which appear in your menu.'
          : 'No tools have been assigned to your account yet. Ask an admin to grant access.') +
        '</div>';
    }
    card.innerHTML = html;
  }

  // ---------------------------------------------------------
  // generic modal helpers
  // ---------------------------------------------------------
  function openModal(id, innerHtml) {
    closeModalEl(id);
    var ov = document.createElement('div');
    ov.className = 'fop-overlay';
    ov.id = id;
    ov.innerHTML = '<div class="fop-modal">' + innerHtml + '</div>';
    ov.addEventListener('click', function (e) { if (e.target === ov) closeModalEl(id); });
    document.body.appendChild(ov);
    return ov;
  }
  function closeModalEl(id) { var e = document.getElementById(id); if (e) e.parentNode.removeChild(e); }
  function isModalOpen(id) { return !!document.getElementById(id); }
  window.fopCloseModal = closeModalEl;

  // ---------------------------------------------------------
  // user management (admin)
  // ---------------------------------------------------------
  window.fopOpenUsers = function () {
    closeModalEl('fop-edit-modal');
    openModal('fop-users-modal',
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">' +
        '<h3>👥 Manage Users</h3>' +
        '<button class="fop-btn" onclick="fopCloseModal(\'fop-users-modal\')">✕</button>' +
      '</div>' +
      '<div style="font-size:12px;color:var(--text-muted,#6e8aad);margin-bottom:8px">Create accounts and choose which tools each user can access.</div>' +
      '<div id="fop-ulist" class="fop-ulist"></div>' +
      '<div style="margin-top:16px"><button class="fop-btn primary" onclick="fopEditUser(null)">➕ Add User</button></div>');
    renderUsersList();
  };

  function renderUsersList() {
    var box = document.getElementById('fop-ulist');
    if (!box) return;
    box.innerHTML = users.map(function (u) {
      var count = isAdmin(u) ? 'All tools' : ((u.allowedTools || []).length + ' tools');
      var you = currentUser && u.id === currentUser.id;
      return '<div class="fop-urow">' +
        '<div style="flex:1;min-width:0">' +
          '<div class="nm">' + esc(u.name) + ' <span class="fop-badge ' + (isAdmin(u) ? 'admin' : 'user') + '">' + (isAdmin(u) ? 'Admin' : 'User') + '</span>' + (you ? ' <span class="mt">(you)</span>' : '') + '</div>' +
          '<div class="mt">PIN •••• · ' + count + '</div>' +
        '</div>' +
        '<button class="fop-btn" onclick="fopEditUser(\'' + u.id + '\')">Edit</button>' +
        (you ? '' : '<button class="fop-btn danger" onclick="fopDeleteUser(\'' + u.id + '\')">Delete</button>') +
      '</div>';
    }).join('');
  }

  window.fopDeleteUser = function (id) {
    var u = userById(id);
    if (!u) return;
    if (isAdmin(u) && users.filter(function (x) { return isAdmin(x); }).length <= 1) {
      notify('Can’t delete the only admin'); return;
    }
    if (!window.confirm('Delete user "' + u.name + '"? This cannot be undone.')) return;
    users = users.filter(function (x) { return x.id !== id; });
    persist();
    renderUsersList();
    notify('User deleted');
  };

  // Add (id=null) or edit an existing user.
  window.fopEditUser = function (id) {
    var u = id ? userById(id) : null;
    var isNew = !u;
    var draft = u || { id: genId(), name: '', pin: '', role: 'user', allowedTools: [], enabledTools: [], createdAt: Date.now() };
    closeModalEl('fop-users-modal');
    var allowed = {};
    (draft.allowedTools || []).forEach(function (t) { allowed[t] = 1; });

    var toolsHtml = TOOL_SECTIONS.map(function (sec) {
      var rows = sec.tools.map(function (t) {
        var lock = ALWAYS_ON[t];
        var checked = lock || allowed[t] ? 'checked' : '';
        return '<label class="fop-tool' + (lock ? ' locked' : '') + '">' +
          '<input type="checkbox" data-tool="' + t + '" ' + checked + (lock ? ' disabled' : '') + '>' +
          '<span>' + esc(toolLabel(t)) + (lock ? ' 🔒' : '') + '</span></label>';
      }).join('');
      return '<div class="fop-sech">' + esc(sec.name) + '</div>' + rows;
    }).join('');

    openModal('fop-edit-modal',
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">' +
        '<h3>' + (isNew ? 'Add User' : 'Edit User') + '</h3>' +
        '<button class="fop-btn" onclick="fopOpenUsers()">✕</button>' +
      '</div>' +
      '<label>Name</label><input type="text" id="fop-f-name" value="' + esc(draft.name) + '" placeholder="e.g. Jordan" autocomplete="off">' +
      '<label>4-digit PIN</label><input type="tel" id="fop-f-pin" value="' + esc(draft.pin) + '" maxlength="4" inputmode="numeric" pattern="[0-9]*" placeholder="0000" autocomplete="off">' +
      '<label>Role</label><select id="fop-f-role">' +
        '<option value="user"' + (draft.role === 'user' ? ' selected' : '') + '>User — limited to granted tools</option>' +
        '<option value="admin"' + (draft.role === 'admin' ? ' selected' : '') + '>Admin — full access + manage users</option>' +
      '</select>' +
      '<div id="fop-tools-wrap"><label>Tool access</label>' +
        '<div style="font-size:11px;color:var(--text-muted,#6e8aad);margin-bottom:6px">Settings is always available.</div>' +
        '<div class="fop-grid" id="fop-tool-grid">' + toolsHtml + '</div></div>' +
      '<div class="fop-row" style="margin-top:18px;justify-content:flex-end">' +
        '<button class="fop-btn" onclick="fopOpenUsers()">Cancel</button>' +
        '<button class="fop-btn primary" onclick="fopSaveUser(\'' + draft.id + '\',' + isNew + ')">Save</button>' +
      '</div>');

    // Hide the tool grid for admins (they get everything).
    var roleSel = document.getElementById('fop-f-role');
    function syncToolVis() {
      var w = document.getElementById('fop-tools-wrap');
      if (w) w.style.display = roleSel.value === 'admin' ? 'none' : '';
    }
    roleSel.addEventListener('change', syncToolVis);
    syncToolVis();
  };

  window.fopSaveUser = function (id, isNew) {
    var name = (document.getElementById('fop-f-name').value || '').trim();
    var pin = (document.getElementById('fop-f-pin').value || '').trim();
    var role = document.getElementById('fop-f-role').value;
    if (!name) { notify('Name is required'); return; }
    if (!/^\d{4}$/.test(pin)) { notify('PIN must be exactly 4 digits'); return; }
    var clash = userByPin(pin);
    if (clash && clash.id !== id) { notify('That PIN is already used by ' + clash.name); return; }

    var picked = [];
    if (role !== 'admin') {
      Array.prototype.forEach.call(document.querySelectorAll('#fop-tool-grid input[data-tool]'), function (cb) {
        if (cb.checked && !cb.disabled) picked.push(cb.getAttribute('data-tool'));
      });
    }

    var existing = userById(id);
    if (existing) {
      // Demoting the only admin? block it.
      if (isAdmin(existing) && role !== 'admin' && users.filter(function (x) { return isAdmin(x); }).length <= 1) {
        notify('At least one admin is required'); return;
      }
      var prevAllowed = existing.allowedTools || [];
      var prevEnabled = existing.enabledTools || [];
      existing.name = name; existing.pin = pin; existing.role = role;
      if (role === 'admin') { existing.allowedTools = allToolIds(); }
      else {
        existing.allowedTools = picked;
        // Preserve the user's own show/hide choices for tools they already had,
        // and show any newly granted tool by default.
        var en = prevEnabled.filter(function (t) { return picked.indexOf(t) !== -1; });
        picked.forEach(function (t) {
          if (prevAllowed.indexOf(t) === -1 && en.indexOf(t) === -1) en.push(t); // newly granted
        });
        existing.enabledTools = en.length ? en : picked.slice();
      }
    } else {
      users.push({
        id: id, name: name, pin: pin, role: role,
        allowedTools: role === 'admin' ? allToolIds() : picked,
        enabledTools: role === 'admin' ? [] : picked.slice(),
        createdAt: Date.now()
      });
    }
    persist();
    notify(isNew ? 'User created' : 'User updated');
    window.fopOpenUsers();
  };

  // ---------------------------------------------------------
  // "My Tools" picker (regular user)
  // ---------------------------------------------------------
  window.fopOpenMyTools = function () {
    var u = currentUser;
    if (!u) return;
    var allowed = (u.allowedTools || []);
    if (!allowed.length) {
      openModal('fop-mytools-modal',
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">' +
          '<h3>🧰 My Tools</h3><button class="fop-btn" onclick="fopCloseModal(\'fop-mytools-modal\')">✕</button></div>' +
        '<div style="font-size:13px;color:var(--text-muted,#6e8aad)">No tools have been assigned to your account yet. Ask an admin to grant you access.</div>');
      return;
    }
    var enabled = {};
    (u.enabledTools && u.enabledTools.length ? u.enabledTools : allowed).forEach(function (t) { enabled[t] = 1; });
    var allowedByOrder = allToolIds().filter(function (t) { return allowed.indexOf(t) !== -1; });

    var grid = TOOL_SECTIONS.map(function (sec) {
      var rows = sec.tools.filter(function (t) { return allowed.indexOf(t) !== -1; }).map(function (t) {
        return '<label class="fop-tool"><input type="checkbox" data-tool="' + t + '" ' + (enabled[t] ? 'checked' : '') + '>' +
          '<span>' + esc(toolLabel(t)) + '</span></label>';
      }).join('');
      return rows ? '<div class="fop-sech">' + esc(sec.name) + '</div>' + rows : '';
    }).join('');

    openModal('fop-mytools-modal',
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">' +
        '<h3>🧰 My Tools</h3><button class="fop-btn" onclick="fopCloseModal(\'fop-mytools-modal\')">✕</button></div>' +
      '<div style="font-size:12px;color:var(--text-muted,#6e8aad);margin-bottom:8px">Choose which tools show in your menu.</div>' +
      '<div class="fop-grid">' + grid + '</div>' +
      '<div class="fop-row" style="margin-top:18px;justify-content:flex-end">' +
        '<button class="fop-btn" onclick="fopCloseModal(\'fop-mytools-modal\')">Cancel</button>' +
        '<button class="fop-btn primary" onclick="fopSaveMyTools()">Save</button>' +
      '</div>');
  };

  window.fopSaveMyTools = function () {
    var u = currentUser;
    if (!u) return;
    var picked = [];
    Array.prototype.forEach.call(document.querySelectorAll('#fop-mytools-modal input[data-tool]'), function (cb) {
      if (cb.checked) picked.push(cb.getAttribute('data-tool'));
    });
    var live = userById(u.id);
    if (live) { live.enabledTools = picked; currentUser = live; }
    persist();
    applyAccess();
    closeModalEl('fop-mytools-modal');
    notify('Menu updated');
  };

  // ---------------------------------------------------------
  // boot
  // ---------------------------------------------------------
  function boot() {
    injectStyles();
    if (!loadCache()) { users = defaultUsers(); seeded = false; saveCache(); }
    installSwitchGuard();
    buildLock();
    restoreSession();
    waitForDb();
    // Re-assert nav visibility after the app finishes its own late renders.
    setTimeout(function () { if (currentUser) applyAccess(); }, 1500);
    setTimeout(function () { if (currentUser) { injectAccountCard(); applyAccess(); } }, 3000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
