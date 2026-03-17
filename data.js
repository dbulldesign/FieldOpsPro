// FieldOps Pro — Data Layer
// Firebase sync, localStorage fallback, CRUD operations


// Local storage fallback


function saveSyncQueue() {
  localStorage.setItem('fop_sync_queue', JSON.stringify(_syncQueue));
}


function updateSyncBar() {
  var bar = document.getElementById('sync-queue-bar');
  var txt = document.getElementById('sync-queue-text');
  var msd = document.getElementById('mobSyncDot');
  var msl = document.getElementById('mobSyncLabel');
  if (!bar) return;
  if (!_isOnline) {
    bar.classList.add('show');
    if (txt) txt.textContent = 'Offline' + (_syncQueue.length ? ' — ' + _syncQueue.length + ' change' + (_syncQueue.length!==1?'s':'') + ' pending' : '');
    if (msd) msd.style.background = '#ef4444';
    if (msl) msl.textContent = 'Offline';
  } else if (_syncQueue.length > 0) {
    bar.classList.add('show');
    if (txt) txt.textContent = 'Syncing ' + _syncQueue.length + ' pending change' + (_syncQueue.length!==1?'s':'') + '…';
    if (msd) msd.style.background = '#f59e0b';
    if (msl) msl.textContent = 'Syncing…';
  } else {
    bar.classList.remove('show');
  }
}


function flushSyncQueue() {
  if (!_isOnline || !db || !_syncQueue.length) return;
  var queue = _syncQueue.slice();
  queue.forEach(function(op) {
    try {
      if (op.type === 'set') db.collection(op.col).doc(op.id).set(op.data, {merge:true});
      else if (op.type === 'delete') db.collection(op.col).doc(op.id).delete();
    } catch(e) {}
  });
  _syncQueue = [];
  saveSyncQueue();

  // Show push notification prompt on desktop after 3rd visit
  if (window.innerWidth > 768 && Notification && Notification.permission === 'default') {
    var visits = parseInt(localStorage.getItem('fop_visits')||'0') + 1;
    localStorage.setItem('fop_visits', visits);
    if (visits >= 3) {
      var pp = document.getElementById('push-prompt');
      if (pp) pp.style.display = 'flex';
    }
  }
  updateSyncBar();
  toast('Synced ' + queue.length + ' pending change' + (queue.length!==1?'s':''));
}

window.addEventListener('online', function() {
  _isOnline = true;
  updateSyncBar();
  setTimeout(flushSyncQueue, 500);
  toast('Back online — syncing…');
});
window.addEventListener('offline', function() {
  _isOnline = false;
  updateSyncBar();
  toast('You are offline — changes saved locally');
});

// ── SKELETON LOADING ────────────────────────────────────────────────

function addItem(col, item) {
  item.id = item.id || genId();
  item.createdAt = item.createdAt || new Date().toISOString();
  if (db) {
    db.collection(col).doc(item.id).set(item).catch(function(e) {
      console.warn('Firebase addItem error:', e);
      LOCAL.add(col, item);
      state[col] = LOCAL.get(col);
      renderAll();
    });
    return item;
  }
  LOCAL.add(col, item);
  state[col] = LOCAL.get(col);
  renderAll();
  return item;
}


function updateItem(col, id, data) {
  // Check recurring task completion before any write
  if (col === 'tasks' && data && data.status === 'done') {
    var prev = state['tasks'] ? state['tasks'].find(function(x){ return x.id === id; }) : null;
    if (prev && prev.status !== 'done' && data.recur) {
      scheduleNextRecur(data);
      toast('Done! Next recurrence scheduled.');
    }
  }
  if (db) {
    db.collection(col).doc(id).set(data, {merge: true}).catch(function(e) {
      console.warn('Firebase updateItem error:', e);
      LOCAL.update(col, id, data);
      state[col] = LOCAL.get(col);
      renderAll();
    });
    return;
  }
  LOCAL.update(col, id, data);
  state[col] = LOCAL.get(col);
  renderAll();
}


function deleteItem(col, id) {
  if (db) {
    db.collection(col).doc(id).delete().catch(function(e) {
      console.warn('Firebase deleteItem error:', e);
      LOCAL.delete(col, id);
      state[col] = LOCAL.get(col);
      renderAll();
    });
    return;
  }
  LOCAL.delete(col, id);
  state[col] = LOCAL.get(col);
  renderAll();
}


function initFirebase(config) {
  try {
    // Tear down existing listeners first
    unsubscribers.forEach(function(u){ u(); });
    unsubscribers = [];
    db = null;

    // Delete any existing app with this name — must await so it finishes before re-init
    var existingApp = firebase.apps.find(function(a){ return a.name === 'fieldops'; });
    if (existingApp) { try { existingApp.delete(); } catch(e) {} }

    var app = firebase.initializeApp(config, 'fieldops');
    db = firebase.firestore(app);

    COLLECTIONS.forEach(function(col) {
      var unsub = db.collection(col)
        .orderBy('createdAt', 'asc')
        .onSnapshot(function(snap) {
          try {
            state[col] = snap.docs.map(function(d){ return _merge({id: d.id}, d.data()); });
            renderAll();
          } catch(renderErr) {
            console.error('renderAll error in onSnapshot:', renderErr);
            if(window._dbgDiv) window._dbgDiv.parentNode && window._dbgDiv.parentNode.removeChild(window._dbgDiv);
            window._dbgDiv = document.createElement('div');
            window._dbgDiv.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#b91c1c;color:#fff;padding:10px 14px;font-size:12px;z-index:99999;font-family:monospace;word-break:break-all;max-height:120px;overflow:auto';
            window._dbgDiv.textContent = 'RENDER ERR: '+(renderErr.message||renderErr)+(renderErr.stack ? ' @ '+renderErr.stack.split('\n')[1] : '');
            document.body && document.body.appendChild(window._dbgDiv);
          }
        }, function(err) { console.warn('Firestore error:', err); });
      unsubscribers.push(unsub);
    });

    var _sdr=document.getElementById('syncDot'); if(_sdr) _sdr.classList.remove('offline');
    var _slr=document.getElementById('syncLabel'); if(_slr) _slr.textContent='Synced';
    var _msdr=document.getElementById('mobSyncDot'); if(_msdr) _msdr.style.background='#10b981';
    var _mslr=document.getElementById('mobSyncLabel'); if(_mslr) _mslr.textContent='Synced';
    var _msdr=document.getElementById('mobSyncDot'); if(_msdr) _msdr.style.background='#10b981';
    var _mslr=document.getElementById('mobSyncLabel'); if(_mslr) _mslr.textContent='Synced';
    var _fs=document.getElementById('firebase-status'); if(_fs) _fs.innerHTML='<span style="color:#10b981">&#x2705; Connected to Firebase!</span>';
    toast('🔥 Firebase connected — syncing!');
  } catch(e) {
    var _fse=document.getElementById('firebase-status'); if(_fse) _fse.innerHTML='<span style="color:#ef4444">&#x274C; Error: '+e.message+'</span>';
    toast('Firebase error: ' + e.message);
  }
}


function loadLocalData() {
  COLLECTIONS.forEach(function(col){ state[col] = LOCAL.get(col); });
  var _sd=document.getElementById('syncDot'); if(_sd) _sd.classList.add('offline');
  var _sl=document.getElementById('syncLabel'); if(_sl) _sl.textContent='Local only';
  var _msd=document.getElementById('mobSyncDot'); if(_msd) _msd.style.background='#f59e0b';
  var _msl=document.getElementById('mobSyncLabel'); if(_msl) _msl.textContent='Local';
  var _msd=document.getElementById('mobSyncDot'); if(_msd) _msd.style.background='#f59e0b';
  var _msl=document.getElementById('mobSyncLabel'); if(_msl) _msl.textContent='Local';
  try { renderAll(); } catch(e) {
    console.error('renderAll error:', e);
    if(document.body) {
      var dbg = document.createElement('div');
      dbg.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#b91c1c;color:#fff;padding:10px;font-size:12px;z-index:99999;font-family:monospace;word-break:break-all';
      dbg.textContent = 'RENDER ERR: '+(e.message||e);
      document.body.appendChild(dbg);
    }
  }
}

// Firebase config persistence

function parseFirebaseConfig(raw) {
  // Strip JS variable declarations and extract just the object
  var text = raw.trim();
  // Remove: var firebaseConfig = ... or var firebaseConfig = ... or firebase.initializeApp(
  text = text.replace(/var\s+\w+\s*=\s*/g, '');
  text = text.replace(/var\s+\w+\s*=\s*/g, '');
  text = text.replace(/var\s+\w+\s*=\s*/g, '');
  text = text.replace(/firebase\.initializeApp\s*\(/g, '');
  text = text.replace(/initializeApp\s*\(/g, '');
  // Remove trailing ); or ;
  text = text.replace(/\)\s*;?\s*$/, '');
  text = text.replace(/;\s*$/, '');
  // Convert unquoted keys to quoted keys: apiKey: -> "apiKey":
  text = text.replace(/(\w+)\s*:/g, '"$1":');
  // Try to parse as JSON
  try {
    return JSON.parse(text);
  } catch(e) {
    // Try extracting key:value pairs manually with regex
    var cfg = {};
    var pairs = raw.match(/(\w+)\s*:\s*["\'](.*?)["\']\s*[,}]/g);
    if (pairs) {
      pairs.forEach(function(pair) {
        var m = pair.match(/(\w+)\s*:\s*["\'](.*?)["\'][,}]/);
        if (m) cfg[m[1]] = m[2];
      });
    }
    if (cfg.apiKey) return cfg;
    return null;
  }
}


function saveFirebaseConfig() {
  var raw = document.getElementById('cfg-paste').value.trim();
  if (!raw) { toast('Paste your Firebase config first'); return; }

  var cfg = parseFirebaseConfig(raw);
  if (!cfg || !cfg.apiKey || !cfg.projectId) {
    var _fsv=document.getElementById('firebase-status'); if(_fsv) _fsv.innerHTML='<span style="color:#ef4444">&#x274C; Could not read config. Make sure you pasted the full block from Firebase.</span>';
    return;
  }
  localStorage.setItem('fop_firebase_cfg', JSON.stringify(cfg));
  updateCfgDisplay(cfg);
  initFirebase(cfg);
}


function clearFirebaseConfig() {
  localStorage.removeItem('fop_firebase_cfg');
  db = null;
  unsubscribers.forEach(function(u){u();}); unsubscribers=[];
  loadLocalData();
  toast('Disconnected from Firebase');
  var _fsc=document.getElementById('firebase-status'); if(_fsc) _fsc.innerHTML='';
  var wrap = document.getElementById('cfg-current-wrap'); if(wrap) wrap.style.display='none';
  var paste = document.getElementById('cfg-paste'); if(paste) paste.value = '';
}


function updateCfgDisplay(cfg) {
  var el = document.getElementById('cfg-current');
  var wrap = document.getElementById('cfg-current-wrap');
  if (el && cfg) {
    el.innerHTML = 'Project: <span style="color:#3b82f6">' + (cfg.projectId||'?') + '</span>   API Key: <span style="color:#64748b">' + (cfg.apiKey||'').slice(0,14) + '...</span>';
    if (wrap) wrap.style.display = 'block';
  }
  // Pre-fill the paste textarea so config survives page reloads
  var raw = localStorage.getItem('fop_firebase_cfg');
  var paste = document.getElementById('cfg-paste');
  if (paste && raw) {
    try {
      var stored = JSON.parse(raw);
      paste.value = 'var firebaseConfig = ' + JSON.stringify(stored, null, 2) + ';';
    } catch(ex) {}
  }
}


function loadSavedConfig() {
  // Check for config baked directly into the HTML first
  var cfg = window._embeddedFirebaseConfig || null;
  if (!cfg) {
    var raw = localStorage.getItem('fop_firebase_cfg');
    if (raw) {
      try { cfg = JSON.parse(raw); } catch(e) {}
    }
  }
  if (!cfg) {
    loadLocalData();
    var notice = document.getElementById('firebaseNotice');
    if (notice) notice.style.display = 'flex';
    return;
  }
  // Save to localStorage so it persists even if HTML is re-uploaded without config
  localStorage.setItem('fop_firebase_cfg', JSON.stringify(cfg));
  updateCfgDisplay(cfg);
  initFirebase(cfg);
}

// ═══════════════════════════════════════════════
//  NAVIGATION
// ═══════════════════════════════════════════════


function deleteAllData(scope) {
  var labels = {
    tasks:'all tasks', projects:'all projects', pos:'all purchase orders',
    shipping:'all shipments', issues:'all troubleshoot items', all:'ALL data'
  };
  var label = labels[scope] || scope;
  if(!confirm('Permanently delete ' + label + '? This cannot be undone.')) return;
  if(scope === 'all') {
    ['tasks','projects','pos','shipping','issues'].forEach(function(key) {
      state[key].slice().forEach(function(item){ deleteItem(key, item.id); });
    });
    toast('All data deleted');
  } else {
    state[scope].slice().forEach(function(item){ deleteItem(scope, item.id); });
    toast('Deleted ' + label);
  }
  renderAll();
}


// ═══════════════════════════════════════════════
//  SMART COMBOBOX — searchable + add-new selects
// ═══════════════════════════════════════════════


function pasteFromClipboard() {
  if (!navigator.clipboard || !navigator.clipboard.readText) {
    toast('Clipboard API not available — paste manually');
    return;
  }
  navigator.clipboard.readText().then(function(text) {
    var ta = document.getElementById('cfg-paste');
    if (ta) {
      ta.value = text;
      toast('Pasted from clipboard');
    }
  }).catch(function() {
    toast('Clipboard permission denied — paste manually');
  });
}


function downloadWithConfig() {
  var raw = localStorage.getItem('fop_firebase_cfg');
  if (!raw) { toast('No Firebase config saved yet — connect first'); return; }
  var cfg;
  try { cfg = JSON.parse(raw); } catch(e) { toast('Invalid config'); return; }
  var html = document.documentElement.outerHTML;
  // Use split string to avoid HTML parser misreading script tags
  var scr = '<scr'+'ipt';
  var escr = '<'+'/scr'+'ipt>';
  html = html.replace(new RegExp(scr+'[^>]*id=["\']embedded-firebase-cfg["\'][\\s\\S]*?'+escr, 'g'), '');
  var configScript = scr+' id="embedded-firebase-cfg">window._embeddedFirebaseConfig = '
    + JSON.stringify(cfg) + ';'+escr;
  html = html.replace('<head>', '<head>\n' + configScript);
  var blob = new Blob(['<!DOCTYPE html>\n' + html], { type: 'text/html' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url; a.download = 'FieldOps-Pro.html';
  document.body.appendChild(a); a.click();
  setTimeout(function() { URL.revokeObjectURL(url); document.body.removeChild(a); }, 1000);
  toast('Downloaded FieldOps-Pro.html with Firebase config saved');
}


function useBuiltInConfig() {
  var cfg = {
    apiKey: "AIzaSyCgRSws8fOvssYsqED4QSkzIw2mwxk2XVs",
    authDomain: "fieldopspro-e47cd.firebaseapp.com",
    projectId: "fieldopspro-e47cd",
    storageBucket: "fieldopspro-e47cd.firebasestorage.app",
    messagingSenderId: "130089981211",
    appId: "1:130089981211:web:200b400a16c4cfd838afbe"
  };
  localStorage.setItem('fop_firebase_cfg', JSON.stringify(cfg));
  updateCfgDisplay(cfg);
  toast('Connecting to Firebase…');
  initFirebase(cfg);
}

_merge(window, {
  switchView: switchView,
  openAddModal: openAddModal,
  openModal: openModal,
  closeModal: closeModal,
  saveProject: saveProject,
  editProject: editProject,
  filterProjects: filterProjects,
  saveTask: saveTask,
  editTask: editTask,
  filterTasks: filterTasks,
  setTaskView: setTaskView,
  cycleTaskStatus: cycleTaskStatus,
  renderTasks: renderTasks,
  archiveTask: archiveTask,
  unarchiveTask: unarchiveTask,
  bulkDeleteAllArchived: bulkDeleteAllArchived,
  confirmDeleteTask: confirmDeleteTask,
  escH: escH,
  onTaskDragStart: onTaskDragStart,
  onTaskDragEnd: onTaskDragEnd,
  onColDragOver: onColDragOver,
  onColDragLeave: onColDragLeave,
  onColDrop: onColDrop,
  onTaskTouchStart: onTaskTouchStart,
  onTaskTouchMove: onTaskTouchMove,
  onTaskTouchEnd: onTaskTouchEnd,
  savePO: savePO,
  editPO: editPO,
  filterPOs: filterPOs,
  saveShipment: saveShipment,
  editShipment: editShipment,
  filterShipping: filterShipping,
  deleteItem: deleteItem,
  openDetail: openDetail,
  setDetailFooter: setDetailFooter,
  confirmDeletePO: confirmDeletePO,
  confirmDeleteShipment: confirmDeleteShipment,
  renderTroubleshoot: renderTroubleshoot,
  toggleTrouble: toggleTrouble,
  editIssue: editIssue,
  saveIssue: saveIssue,
  deleteIssue: deleteIssue,
  saveFirebaseConfig: saveFirebaseConfig,
  clearFirebaseConfig: clearFirebaseConfig,
  globalSearch: globalSearch,
  toggleSidebar: toggleSidebar,
  closeSidebar: closeSidebar,
  toast: toast,
  closeSearchDropdown: closeSearchDropdown,
  searchKeyNav: searchKeyNav,
  selectSearchResult: selectSearchResult,
  setSearchIdx: setSearchIdx,
  toggleTheme: toggleTheme,
  loadTheme: loadTheme,
  deleteAllData: deleteAllData,
  autoDetectCarrier: autoDetectCarrier,
  detectCarrier: detectCarrier,
  fmtDateSmart: fmtDateSmart,
  animateCount: animateCount,
  updateOverdueBadge: updateOverdueBadge,
  projectHealth: projectHealth,
  updateThingsNav: updateThingsNav,
  renderThingsHome: renderThingsHome,
  thingsIcon: thingsIcon,
  confirmInline: confirmInline,
  inlineConfirmYes: inlineConfirmYes,
  inlineConfirmNo: inlineConfirmNo,
  addSearchHistory: addSearchHistory,
  showSearchHistory: showSearchHistory,
  removeSearchHistory: removeSearchHistory,
  initBottomSheets: initBottomSheets,
  haptic: haptic,
  softDelete: softDelete,
  undoLastDelete: undoLastDelete,
  softDeletePO: softDeletePO,
  softDeleteShipment: softDeleteShipment,
  softDeleteTask: softDeleteTask,
  toggleWidget: toggleWidget,
  applyDashWidgets: applyDashWidgets,
  toggleCompact: toggleCompact,
  checkShipmentETA: checkShipmentETA,
  buildEmptyState: buildEmptyState,
  attachRowSwipe: attachRowSwipe,
  comboInit: comboInit,
  comboGet: comboGet,
  comboSet: comboSet,
  replaceSelectWithCombo: replaceSelectWithCombo,
  toggleNotifPanel: toggleNotifPanel,
  markAllRead: markAllRead,
  notifClick: notifClick,
  renderRecentlyViewed: renderRecentlyViewed,
  scheduleNextRecur: scheduleNextRecur,
  checkNotifications: checkNotifications,
  locationSearch: locationSearch,
  locationKeydown: locationKeydown,
  selectLocation: selectLocation,
  highlightLocation: highlightLocation,
  closeLocationDropdown: closeLocationDropdown,
  toggleQuickAdd: toggleQuickAdd,
  saveQuickTask: saveQuickTask,
  applyProjectFilter: applyProjectFilter,
  bulkSelectAll: bulkSelectAll,
  bulkAction: bulkAction,
  startBarcodeScan: startBarcodeScan,
  closeBarcodeScanner: closeBarcodeScanner
});

// ═══════════════════════════════════════════════
//  QUICK ADD
// ═══════════════════════════════════════════════
