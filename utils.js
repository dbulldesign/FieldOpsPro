// FieldOps Pro — Utility Functions
// helpers, theme, toast, formatters, badges

function isMobile(){ return window.innerWidth<=768; }


// ═══════════════════════════════════════════════
//  DATA LAYER — Local + Firebase sync
// ═══════════════════════════════════════════════


// Local storage fallback


// In-memory state


function _merge() {
  var r = {};
  for(var a=0;a<arguments.length;a++){
    var o=arguments[a]; if(!o) continue;
    for(var k in o){ if(Object.prototype.hasOwnProperty.call(o,k)) r[k]=o[k]; }
  }
  return r;
}


function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2,6); }


function statusBadge(s) {
  var map = {
    active:'badge-green', planning:'badge-blue', 'on-hold':'badge-yellow', completed:'badge-gray',
    todo:'badge-blue', inprogress:'badge-yellow', done:'badge-green',
    draft:'badge-gray', submitted:'badge-cyan', approved:'badge-green',
    ordered:'badge-purple', received:'badge-green', cancelled:'badge-red',
    pending:'badge-gray', transit:'badge-blue transit', out:'badge-yellow', delivered:'badge-green', exception:'badge-red',
    freight:'badge-gold', ground:'badge-gray', '2day':'badge-blue', overnight:'badge-purple',
    scheduled:'badge-blue', 'in-progress':'badge-yellow', handoff:'badge-gray'
  };
  var cls = map[s] || 'badge-gray';
  var label = {
    todo:'To Do', inprogress:'In Progress', done:'Done ✓',
    transit:'In Transit', out:'Out for Delivery', delivered:'Delivered ✓',
    active:'Active', planning:'Planning', 'on-hold':'On Hold', completed:'Completed',
    draft:'Draft', submitted:'Submitted', approved:'Approved', ordered:'Ordered',
    received:'Received', cancelled:'Cancelled', pending:'Pending', exception:'Exception ⚠',
    scheduled:'Scheduled', 'in-progress':'In Progress', handoff:'Handoff'
  }[s] || s;
  return '<span class="badge '+cls+'" style="text-transform:none;letter-spacing:0">'+escH(label||'—')+'</span>';
}

function priorityBadge(p) {
  return '<span class="priority priority-'+(p||'low')+'">'+escH(p||'low')+'</span>';
}

function poName(id) {
  var p = state.pos.find(function(p){return p.id===id;});
  return p ? (p.number ? p.number+' - '+p.vendor : p.vendor||'PO') : '—';
}

function projectName(id) {
  var p = state.projects.find(function(x){return x.id===id;});
  return p ? p.name : '—';
}

function fmtDate(d) {
  if(!d) return '—';
  return new Date(d+'T00:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
}

function fmtCurrency(v) {
  return v ? '$'+parseFloat(v).toLocaleString('en-US',{minimumFractionDigits:2}) : '—';
}


function toast(msg) {
  var el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.style.cssText = 'position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:#1e293b;color:#f0f4ff;padding:10px 20px;border-radius:99px;font-size:14px;font-weight:600;z-index:9999;pointer-events:none;opacity:0;transition:opacity 0.2s;white-space:nowrap;box-shadow:0 4px 20px rgba(0,0,0,0.4)';
    document.body.appendChild(el);
  }
  if(window._toastTimer) clearTimeout(window._toastTimer);
  el.textContent = msg;
  el.style.opacity = '1';
  el.classList.add('show');
  window._toastTimer = setTimeout(function(){ el.style.opacity = '0'; el.classList.remove('show'); }, 2500);
}

// ═══════════════════════════════════════════════
//  DASHBOARD
// ═══════════════════════════════════════════════

function escH(s) { return s ? String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') : ''; }


function buildEmptyState(icon, bgColor, title, sub) {
  return '<div class="empty-state-fancy">'
    + '<div class="es-icon" style="background:'+bgColor+'">'+icon+'</div>'
    + '<div class="es-title">'+escH(title)+'</div>'
    + '<div class="es-sub">'+escH(sub)+'</div>'
    + '</div>';
}


function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}


function applyTheme(theme){
  var isDark=(theme==='dark');
  document.documentElement.setAttribute('data-theme',theme);
  if(isDark){
    document.body.classList.remove('light-mode');
    document.body.classList.add('dark-mode');
    document.body.style.cssText = 'background:#080d1a; color:#f0f4ff;';
    var _app2=document.getElementById('app'); if(_app2) _app2.style.background='#080d1a';
    var _main2=document.getElementById('main'); if(_main2) _main2.style.background='#080d1a';
    var _ct2=document.getElementById('content'); if(_ct2) _ct2.style.background='#080d1a';
    var _tb2=document.getElementById('topbar'); if(_tb2) _tb2.style.background='';
  } else {
    document.body.classList.remove('dark-mode');
    document.body.classList.add('light-mode');
    document.body.style.cssText = 'background:#f0f4fa !important; color:#0f172a !important;';
    var _app=document.getElementById('app'); if(_app) _app.style.background='#f0f4fa';
    var _main=document.getElementById('main'); if(_main) _main.style.background='#f0f4fa';
    var _ct=document.getElementById('content'); if(_ct) _ct.style.background='#f0f4fa';
    var _tb=document.getElementById('topbar'); if(_tb) _tb.style.background='rgba(255,255,255,0.96)';
  }
  var pill=document.getElementById('toggle-pill');
  var icon=document.getElementById('theme-icon');
  var label=document.getElementById('theme-label');
  var sub=document.getElementById('theme-sub');
  if(pill) pill.classList.toggle('on',!isDark);
  if(icon) icon.textContent=isDark?'🌙':'☀️';
  if(label) label.textContent=isDark?'Dark Mode':'Light Mode';
  if(sub) sub.textContent=isDark?'Currently using dark theme':'Currently using light theme';
}

function toggleTheme() {
  var current = document.documentElement.getAttribute('data-theme') || 'dark';
  var next = (current === 'dark') ? 'light' : 'dark';
  localStorage.setItem('fop_theme', next);
  applyTheme(next);
}


function loadTheme() {
  var saved = localStorage.getItem('fop_theme') || 'dark';
  applyTheme(saved);
}

// ═══════════════════════════════════════════════
//  LOCATION AUTOCOMPLETE — OpenStreetMap Nominatim
// ═══════════════════════════════════════════════


function timeAgo(ts) {
  var diff = Date.now() - ts;
  var m = Math.floor(diff/60000);
  if (m < 1) return 'Just now';
  if (m < 60) return m + 'm ago';
  var h = Math.floor(m/60);
  if (h < 24) return h + 'h ago';
  return Math.floor(h/24) + 'd ago';
}

// Check for notifications periodically

function haptic(style) {
  // style: 'light' | 'medium' | 'heavy'
  if (!navigator.vibrate) return;
  var patterns = { light: 10, medium: 20, heavy: [30, 10, 30] };
  navigator.vibrate(patterns[style] || 10);
}

// ═══════════════════════════════════════════════════════════════════
//  UNDO LAST DELETE
// ═══════════════════════════════════════════════════════════════════


function softDelete(col, id, label) {
  var item = state[col] ? state[col].find(function(x){ return x.id === id; }) : null;
  if (!item) return;
  // Push to undo stack
  _undoStack.push({ col: col, id: id, item: JSON.parse(JSON.stringify(item)), label: label || 'item' });
  if (_undoStack.length > 5) _undoStack.shift();
  // Perform the actual delete
  deleteItem(col, id);
  haptic('medium');
  showUndoToast(label || 'Item');
}


function showUndoToast(label) {
  if (_undoTimer) clearTimeout(_undoTimer);
  var toastEl = document.getElementById('toast');
  if (!toastEl) return;
  // Hijack toast with undo button
  toastEl.innerHTML = escH(label) + ' deleted &nbsp;<button onclick="undoLastDelete()" style="background:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.3);border-radius:6px;color:#fff;font-size:12px;padding:2px 10px;cursor:pointer;font-weight:700;margin-left:4px">Undo</button>';
  toastEl.classList.add('show');
  _undoTimer = setTimeout(function() {
    toastEl.classList.remove('show');
    setTimeout(function(){ toastEl.innerHTML = ''; }, 400);
  }, 5000);
}


function undoLastDelete() {
  if (!_undoStack.length) return;
  var entry = _undoStack.pop();
  clearTimeout(_undoTimer);
  document.getElementById('toast').classList.remove('show');
  // Re-add the item
  addItem(entry.col, entry.item);
  haptic('light');
  toast('Restored: ' + entry.label);
}

// ═══════════════════════════════════════════════════════════════════
//  DASHBOARD WIDGETS — user can toggle sections
// ═══════════════════════════════════════════════════════════════════


function fmtDateSmart(d){if(!d)return'\u2014';var date=new Date(d+'T00:00:00'),today=new Date();today.setHours(0,0,0,0);var diff=Math.round((date-today)/86400000);if(diff===0)return'<span style="color:#10b981;font-weight:600">Today</span>';if(diff===1)return'<span style="color:#fbbf24;font-weight:600">Tomorrow</span>';if(diff===-1)return'<span style="color:#ef4444;font-weight:600">Yesterday</span>';if(diff<0)return'<span style="color:#ef4444">'+Math.abs(diff)+'d overdue</span>';if(diff<=7)return'<span style="color:#fbbf24">'+diff+' days</span>';return date.toLocaleDateString('en-US',{month:'short',day:'numeric'});}

function animateCount(elId,target){var el=document.getElementById(elId);if(!el)return;var t0=null;function step(ts){if(!t0)t0=ts;var p=Math.min((ts-t0)/600,1),e=1-Math.pow(1-p,3);el.textContent=Math.round(target*e);if(p<1)requestAnimationFrame(step);else el.textContent=target;}requestAnimationFrame(step);}

function updateOverdueBadge(){var today=new Date();today.setHours(0,0,0,0);var n=state.tasks.filter(function(t){return !t.archived&&t.status!=='done'&&t.due&&new Date(t.due)<today;}).length;var mob=document.getElementById('mob-overdue-badge');if(mob){mob.textContent=n;mob.style.display=n>0?'inline-block':'none';}var badge=document.getElementById('overdue-nav-badge');if(!badge){var items=document.querySelectorAll('.nav-item');for(var i=0;i<items.length;i++){if(items[i].textContent.indexOf('Tasks')>-1){badge=document.createElement('span');badge.id='overdue-nav-badge';badge.style.cssText='margin-left:auto;background:#ef4444;color:#fff;font-size:10px;font-weight:700;padding:1px 7px;border-radius:99px;min-width:18px;text-align:center;display:none';items[i].appendChild(badge);break;}}}if(badge){badge.textContent=n;badge.style.display=n>0?'inline-block':'none';}
  var mb=document.getElementById('mob-notif-badge');if(mb){mb.textContent=n;mb.style.display=n>0?'inline-block':'none';}}

function projectHealth(p){var today=new Date();today.setHours(0,0,0,0);var tasks=state.tasks.filter(function(t){return t.project===p.id&&!t.archived;});var overdue=tasks.filter(function(t){return t.status!=='done'&&t.due&&new Date(t.due)<today;});if(overdue.length)return{color:'#ef4444',label:overdue.length+' overdue'};if(p.end){var end=new Date(p.end+'T00:00:00'),days=Math.round((end-today)/86400000);if(days<0&&p.status!=='completed')return{color:'#ef4444',label:'Past deadline'};if(days<=7&&p.status!=='completed')return{color:'#fbbf24',label:days+'d left'};}if(tasks.length&&tasks.every(function(t){return t.status==='done';}))return{color:'#10b981',label:'All done'};return{color:'#3b82f6',label:'On track'};}

function confirmInline(msg,cb){var el=document.getElementById('toast');if(!el){if(confirm(msg))cb();return;}if(window._toastTimer){clearTimeout(window._toastTimer);window._toastTimer=null;}if(window._undoTimer){clearTimeout(window._undoTimer);window._undoTimer=null;}if(window._ict){clearTimeout(window._ict);}el.style.opacity='';el.innerHTML=escH(msg)+' <button onclick="inlineConfirmYes()" style="background:rgba(239,68,68,0.3);border:1px solid rgba(239,68,68,0.5);border-radius:6px;color:#fff;font-size:12px;padding:2px 10px;cursor:pointer;font-weight:700;margin-left:6px">Yes</button> <button onclick="inlineConfirmNo()" style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:6px;color:#fff;font-size:12px;padding:2px 10px;cursor:pointer;margin-left:4px">No</button>';el.classList.add('show');window._icb=cb;window._ict=setTimeout(function(){el.classList.remove('show');setTimeout(function(){el.innerHTML='';},400);},7000);}

function inlineConfirmYes(){var cb=window._icb;clearTimeout(window._ict);var el=document.getElementById('toast');if(el){el.classList.remove('show');setTimeout(function(){el.innerHTML='';},400);}if(cb)cb();window._icb=null;}

function inlineConfirmNo(){clearTimeout(window._ict);window._icb=null;var el=document.getElementById('toast');if(el){el.classList.remove('show');setTimeout(function(){el.innerHTML='';},400);}}
