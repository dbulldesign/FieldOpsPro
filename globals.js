// FieldOps Pro — Global Window Assignments
// iOS WKWebView requires all functions to be on window object

// Explicit global assignments for iOS WKWebView compatibility
window.toggleTheme = toggleTheme;
window.mobTabSwitch = mobTabSwitch;
window.closeMobMore = closeMobMore;
window.toggleFabMenu = toggleFabMenu;
window.closeFabMenu = closeFabMenu;
window.requestPushPermission = requestPushPermission;
window.toggleDashWidget = toggleDashWidget;
window.renderWidgetToggles = renderWidgetToggles;
window.showSkeleton = showSkeleton;
window.applyTheme = applyTheme;
window.editTask = editTask;
window.editProject = editProject;
window.editPO = editPO;
window.editShipment = editShipment;
window.softDelete = softDelete;
window.softDeletePO = softDeletePO;
window.softDeleteShipment = softDeleteShipment;
window.openDetail = openDetail;
window.closeModal = closeModal;
window.openModal = openModal;
window.switchView = switchView;
window.saveTask = saveTask;
window.saveProject = saveProject;
window.savePO = savePO;
window.saveShipment = saveShipment;
window.filterTasks = filterTasks;
window.filterPOs = filterPOs;
window.filterShipping = filterShipping;
window.toggleQuickAdd = toggleQuickAdd;
window.saveQuickTask = saveQuickTask;
window.useBuiltInConfig = useBuiltInConfig;
window.saveFirebaseConfig = saveFirebaseConfig;
window.clearFirebaseConfig = clearFirebaseConfig;
window.toggleWidget = toggleWidget;
window.toggleCompact = toggleCompact;
window.deleteAllData = deleteAllData;
window.renderTroubleshoot = renderTroubleshoot;
window.deleteIssue = deleteIssue;
window.editIssue = editIssue;
window.saveIssue = saveIssue;
window.openAddModal = openAddModal;
window.haptic = haptic;
window.closeSidebar = closeSidebar;
window.toggleSidebar = toggleSidebar;
window.toggleNotifPanel = toggleNotifPanel;
window.markAllRead = markAllRead;
window.bulkSelectAll = bulkSelectAll;
window.bulkAction = bulkAction;
window.startBarcodeScan = startBarcodeScan;
window.closeBarcodeScanner = closeBarcodeScanner;
window.globalSearch = globalSearch;
window.closeSearchDropdown = closeSearchDropdown;
window.searchKeyNav = searchKeyNav;
window.selectSearchResult = selectSearchResult;
window.renderThingsHome = renderThingsHome;
window.updateThingsNav = updateThingsNav;
window.applyProjectFilter = applyProjectFilter;
window.cycleTaskStatus = cycleTaskStatus;
window.confirmDeleteTask = confirmDeleteTask;
window.bulkDeleteAllArchived = bulkDeleteAllArchived;
window.setTaskView = setTaskView;
window.archiveTask = archiveTask;
window.archiveProject = archiveProject;
window.unarchiveProject = unarchiveProject;
window.archivePO = archivePO;
window.unarchivePO = unarchivePO;
window.archiveShipment = archiveShipment;
window.unarchiveShipment = unarchiveShipment;
window.getTrackingUrl = getTrackingUrl;
window.unarchiveTask = unarchiveTask;
window.filterProjects = filterProjects;
window.softDeleteTask = softDeleteTask;
window.setDetailFooter = setDetailFooter;
window.autoDetectCarrier = autoDetectCarrier;


// ── OFFLINE SYNC QUEUE ──────────────────────────────────────────────
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


// ── SKELETON LOADING ────────────────────────────────────────────────
function showSkeleton(containerId, count) {
  var el = document.getElementById(containerId);
  if (!el) return;
  var html = '';
  for (var i = 0; i < (count||3); i++) {
    html += '<div class="skeleton-card">'
      + '<div class="skeleton skeleton-line w80" style="height:15px;margin-bottom:10px"></div>'
      + '<div class="skeleton skeleton-line w60" style="height:11px;margin-bottom:6px"></div>'
      + '<div class="skeleton skeleton-line w40" style="height:11px"></div>'
      + '</div>';
  }
  el.innerHTML = html;
}

// ── iOS TAB BAR ─────────────────────────────────────────────────────
function mobTabSwitch(v) {
  if (v === 'more') {
    openModal('mob-more-sheet');
    return;
  }
  // Update tab active states
  document.querySelectorAll('.mob-tab-item').forEach(function(t) { t.classList.remove('active'); });
  var tab = document.getElementById('tab-' + v);
  if (tab) tab.classList.add('active');
  switchView(v);
}

function closeMobMore(v) {
  closeModal('mob-more-sheet');
  setTimeout(function() {
    mobTabSwitch(v);
  }, 120);
}

function updateTabBadges() {
  var today = new Date(); today.setHours(0,0,0,0);
  var overdue = state.tasks.filter(function(t){ return !t.archived && t.status!=='done' && t.due && new Date(t.due)<today; }).length;
  var badge = document.getElementById('tab-badge-tasks');
  if (badge) {
    badge.textContent = overdue > 9 ? '9+' : String(overdue);
    badge.style.display = overdue > 0 ? 'flex' : 'none';
  }
}

// Show drag handle on mobile modals
function initDragHandles() {
  if (window.innerWidth > 768) return;
  document.querySelectorAll('.modal-drag-handle').forEach(function(h) {
    h.style.display = 'block';
    var modal = h.parentNode;
    var startY = 0;
    h.addEventListener('touchstart', function(e) { startY = e.touches[0].clientY; }, {passive:true});
    h.addEventListener('touchmove', function(e) {
      var dy = e.touches[0].clientY - startY;
      if (dy > 0) modal.style.transform = 'translateY(' + dy + 'px)';
    }, {passive:true});
    h.addEventListener('touchend', function(e) {
      var dy = e.changedTouches[0].clientY - startY;
      modal.style.transition = 'transform 0.3s cubic-bezier(0.32,0.72,0,1)';
      modal.style.transform = '';
      setTimeout(function(){ modal.style.transition = ''; }, 320);
      if (dy > 100) {
        var ov = modal.closest('.modal-overlay');
        if (ov) { ov.classList.remove('open'); ov.style.display = 'none'; }
      }
    });
  });
}

// ── SMART FAB ───────────────────────────────────────────────────────
function toggleFabMenu() {
  _fabOpen = !_fabOpen;
  var menu = document.getElementById('fab-menu');
  var overlay = document.getElementById('fab-overlay');
  var fab = document.getElementById('quickAddFab');
  var fabSpan = fab ? fab.querySelector('span') : null;
  if (menu) menu.classList.toggle('open', _fabOpen);
  if (overlay) overlay.classList.toggle('open', _fabOpen);
  if (fabSpan) fabSpan.textContent = _fabOpen ? '×' : '+';
}

function closeFabMenu() {
  _fabOpen = false;
  var menu = document.getElementById('fab-menu');
  var overlay = document.getElementById('fab-overlay');
  var fab = document.getElementById('quickAddFab');
  var fabSpan = fab ? fab.querySelector('span') : null;
  if (menu) menu.classList.remove('open');
  if (overlay) overlay.classList.remove('open');
  if (fabSpan) fabSpan.textContent = '+';
}

// ── DASHBOARD WIDGETS (desktop) ─────────────────────────────────────
function saveWidgets() { localStorage.setItem('fop_dash_v2', JSON.stringify(_widgets)); }

function renderWidgetToggles() {
  var bar = document.getElementById('dash-widget-bar');
  if (!bar || window.innerWidth <= 768) return;
  var _wkeys = []; for(var _wk in _widgets){ _wkeys.push(_wk); }
  bar.innerHTML = _wkeys.map(function(k) {
    return '<button onclick="toggleDashWidget(\'' + k + '\')" style="'
      + 'background:' + (_widgets[k] ? 'rgba(79,142,247,0.18)' : 'rgba(255,255,255,0.05)') + ';'
      + 'color:' + (_widgets[k] ? '#7ab3fa' : '#4a5e7a') + ';'
      + 'border:1px solid ' + (_widgets[k] ? 'rgba(79,142,247,0.35)' : 'rgba(255,255,255,0.08)') + ';'
      + 'border-radius:99px;padding:4px 12px;font-size:11px;font-weight:600;cursor:pointer;transition:all 0.15s">'
      + {overview:'Overview',tasks:'Tasks',shipping:'Shipping',alerts:'Alerts',activity:'Activity'}[k]
      + '</button>';
  }).join('');
}

function toggleDashWidget(k) {
  _widgets[k] = !_widgets[k];
  saveWidgets();
  renderWidgetToggles();
  applyWidgetVisibility();
}

function applyWidgetVisibility() {
  var map = {
    overview: 'dash-stat-grid',
    tasks: 'dash-task-card',
    shipping: 'dash-ship-card',
    alerts: 'dash-due-alerts',
    activity: 'dash-recently-viewed'
  };
  var _mkeys = []; for(var _mk in map){ _mkeys.push(_mk); }
  _mkeys.forEach(function(k) {
    var el = document.getElementById(map[k]);
    if (el) el.style.display = _widgets[k] ? '' : 'none';
  });
}

// ── PUSH NOTIFICATIONS ──────────────────────────────────────────────
function requestPushPermission() {
  if (!('Notification' in window)) { toast('Notifications not supported'); return; }
  if (Notification.permission === 'granted') { toast('Notifications already enabled ✓'); return; }
  // Support both callback (old Safari) and Promise (modern) APIs
  var handlePermission = function(result) {
    if (result === 'granted') {
      toast('Notifications enabled!');
      try { new Notification('FieldOps Pro', { body: 'You will now receive overdue task alerts.' }); } catch(e) {}
    } else {
      toast('Notification permission denied');
    }
  };
  try {
    var permResult = Notification.requestPermission(handlePermission);
    if (permResult && permResult.then) permResult.then(handlePermission);
  } catch(e) { toast('Notifications not available'); }
}

function sendPushNotif(title, body) {
  if (Notification.permission !== 'granted') return;
  if (document.visibilityState === 'visible') return; // Only push when tab hidden
  new Notification(title, { body: body, icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="%232563ff"/></svg>' });
}

function checkAndPushNotifs() {
  if (Notification.permission !== 'granted') return;
  var today = new Date(); today.setHours(0,0,0,0);
  var overdue = state.tasks.filter(function(t){ return !t.archived && t.status!=='done' && t.due && new Date(t.due)<today; });
  if (overdue.length > 0) {
    sendPushNotif('FieldOps Pro — Overdue Tasks', overdue.length + ' task' + (overdue.length!==1?'s are':' is') + ' overdue');
  }
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
