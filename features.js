// FieldOps Pro — Features
// Search, notifications, location, quick-add, tab bar, smart FAB, swipe


// Element.closest polyfill for older WebKit
if (!Element.prototype.closest) {
  Element.prototype.closest = function(sel) {
    var el = this;
    while (el && el.nodeType === 1) {
      if (el.matches ? el.matches(sel) : el.msMatchesSelector(sel)) return el;
      el = el.parentElement || el.parentNode;
    }
    return null;
  };
}
if (!Element.prototype.matches) {
  Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
}

// NodeList.forEach polyfill for older WebKit
if (typeof NodeList !== 'undefined' && NodeList.prototype && !NodeList.prototype.forEach) {
  NodeList.prototype.forEach = Array.prototype.forEach;
}
if (typeof HTMLCollection !== 'undefined' && HTMLCollection.prototype && !HTMLCollection.prototype.forEach) {
  HTMLCollection.prototype.forEach = Array.prototype.forEach;
}


window.onerror = function(msg, src, line, col, err) {
  // Suppress cross-origin errors - L0 or message is just "Script error."
  if (!line || line === 0) return true;
  if (msg === 'Script error.' || msg === 'Script error') return true;
  if (typeof msg === 'string' && msg.toLowerCase().indexOf('script error') === 0) return true;
  try {
    var div = document.createElement('div');
    div.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#ef4444;color:#fff;padding:12px;font-size:13px;z-index:99999;font-family:monospace;word-break:break-all';
    div.textContent = 'JS ERR L'+line+': '+msg+(err?' '+err.stack:'');
    document.body && document.body.appendChild(div);
    setTimeout(function(){ if(div&&div.parentNode) div.parentNode.removeChild(div); }, 10000);
  } catch(e2) {}
  return true;
};

window.addEventListener('unhandledrejection', function(e) {
  // Suppress cross-origin Firebase promise rejections
  e.preventDefault();
  if (e.reason && e.reason.message) {
    var msg = e.reason.message;
    if (msg.indexOf('Script error') !== -1) return;
  }
  console.warn('Unhandled rejection:', e.reason);
});

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

window.onerror = function(msg, src, line, col, err) {
  // Suppress cross-origin errors - L0 or message is just "Script error."
  if (!line || line === 0) return true;
  if (msg === 'Script error.' || msg === 'Script error') return true;
  if (typeof msg === 'string' && msg.toLowerCase().indexOf('script error') === 0) return true;
  try {
    var div = document.createElement('div');
    div.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#ef4444;color:#fff;padding:12px;font-size:13px;z-index:99999;font-family:monospace;word-break:break-all';
    div.textContent = 'JS ERR L'+line+': '+msg+(err?' '+err.stack:'');
    document.body && document.body.appendChild(div);
    setTimeout(function(){ if(div&&div.parentNode) div.parentNode.removeChild(div); }, 10000);
  } catch(e2) {}
  return true;
};

// Element.closest polyfill for older WebKit
if (!Element.prototype.closest) {
  Element.prototype.closest = function(sel) {
    var el = this;
    while (el && el.nodeType === 1) {
      if (el.matches ? el.matches(sel) : el.msMatchesSelector(sel)) return el;
      el = el.parentElement || el.parentNode;
    }
    return null;
  };
}
if (!Element.prototype.matches) {
  Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
}

// NodeList.forEach polyfill for older WebKit
if (typeof NodeList !== 'undefined' && NodeList.prototype && !NodeList.prototype.forEach) {
  NodeList.prototype.forEach = Array.prototype.forEach;
}
if (typeof HTMLCollection !== 'undefined' && HTMLCollection.prototype && !HTMLCollection.prototype.forEach) {
  HTMLCollection.prototype.forEach = Array.prototype.forEach;
}

function globalSearch(q) {
  var dropdown = document.getElementById('searchDropdown');
  var mobDrop = document.getElementById('mob-search-dropdown');
  if (!q || !q.trim()) {
    showSearchHistory();
    searchSelectedIdx = -1;
    return;
  }
  var results = smartSearch(q.trim());
  renderSearchDropdown(results, q.trim());
}

function smartSearch(raw) {
  var q = raw.toLowerCase();
  var words = q.split(/\s+/).filter(Boolean);
  var results = [];

  // Helper: score a string against query
  function score(str) {
    if (!str) return 0;
    var s = str.toLowerCase();
    if (s.indexOf(q)===0) return 100;
    if ((s.indexOf(q)>=0)) return 80;
    // All words present?
    if (words.every(function(w){return (s.indexOf(w)>=0);})) return 60;
    // Any word present?
    var matched = words.filter(function(w){return (s.indexOf(w)>=0);}).length;
    return matched > 0 ? 20 + matched * 10 : 0;
  }

  // Search PROJECTS
  state.projects.forEach(function(p) {
    var s = Math.max(
      score(p.name),
      score(p.client),
      score(p.location),
      score(p.system),
      score(p.notes),
      score(p.status)
    );
    if (s > 0) results.push({
      type: 'project', icon: '🏗️', score: s, id: p.id,
      title: p.name,
      sub: [p.client, p.location, p.status].filter(Boolean).join(' · '),
      view: 'projects'
    });
  });

  // Search TASKS (exclude archived)
  state.tasks.filter(function(t){return !t.archived;}).forEach(function(t) {
    var s = Math.max(
      score(t.title),
      score(t.category),
      score(t.desc),
      score(t.status),
      score(t.priority),
      score(projectName(t.project))
    );
    if (s > 0) results.push({
      type: 'task', icon: '✓', score: s, id: t.id,
      title: t.title,
      sub: [t.status, t.priority, projectName(t.project)].filter(Boolean).join(' · '),
      view: 'tasks',
      badge: t.status, badgeType: {todo:'badge-gray',inprogress:'badge-yellow',done:'badge-green'}[t.status]||'badge-gray'
    });
  });

  // Search PURCHASE ORDERS
  state.pos.forEach(function(p) {
    var s = Math.max(
      score(p.vendor),
      score(p.number),
      score(p.notes),
      score(p.status),
      score(projectName(p.project))
    );
    if (s > 0) results.push({
      type: 'po', icon: '📄', score: s, id: p.id,
      title: p.vendor || p.number || 'PO',
      sub: [p.number, p.status].filter(Boolean).join(' · '),
      view: 'pos',
      badge: p.status, badgeType: 'badge-blue'
    });
  });

  // Search SHIPMENTS
  state.shipping.forEach(function(s) {
    var sc = Math.max(
      score(s.tracking),
      score(s.desc),
      score(s.carrier),
      score(s.status),
      score(poName(s.po))
    );
    if (sc > 0) results.push({
      type: 'shipping', icon: '📦', score: sc, id: s.id,
      title: s.desc || s.tracking || 'Shipment',
      sub: [s.carrier, s.tracking, s.status].filter(Boolean).join(' · '),
      view: 'shipping',
      badge: s.status, badgeType: {transit:'badge-yellow',delivered:'badge-green',pending:'badge-gray',out:'badge-blue'}[s.status]||'badge-gray'
    });
  });

  // Search TROUBLESHOOT
  state.issues.forEach(function(issue) {
    var s = Math.max(
      score(issue.q),
      score(issue.a),
      score(issue.cat),
      (issue.steps||[]).reduce(function(m,step){return Math.max(m,score(step));},0)
    );
    if (s > 0) results.push({
      type: 'issue', icon: '⚡', score: s, id: issue.id,
      title: issue.q,
      sub: issue.cat || 'Troubleshoot',
      view: 'troubleshoot'
    });
  });

  // Sort by score desc, then type priority
  var typePriority = { project:5, task:4, po:3, shipping:2, issue:1 };
  results.sort(function(a,b){ return b.score-a.score || (typePriority[a.type]||9)-(typePriority[b.type]||9); });

  return results.slice(0, 12); // max 12 results
}

function renderSearchDropdown(results, q) {
  var dropdown = document.getElementById('searchDropdown');
  searchSelectedIdx = -1;

  if (!results.length) {
    var noHtml = '<div style="padding:20px;text-align:center;color:#3a4a6a;font-size:13px"><div style="font-size:24px;margin-bottom:8px;opacity:0.4">🔍</div>No results for &ldquo;'+escHtml(q)+'&rdquo;</div>';
    dropdown.style.display = 'block';
    dropdown.innerHTML = noHtml;
    var md = document.getElementById('mob-search-dropdown');
    if (md) { md.style.display = 'block'; md.innerHTML = noHtml; }
    return;
  }

  // Group by type
  var groups = {};
  var labels = { project:'Projects', task:'Tasks', po:'Purchase Orders', shipping:'Shipments', issue:'Troubleshoot' };
  results.forEach(function(r) { (groups[r.type] = groups[r.type]||[]).push(r); });

  var typeOrder = ['project','task','po','shipping','issue'];
  var html = '';
  var globalIdx = 0;

  typeOrder.forEach(function(type) {
    if (!groups[type]) return;
    html+='<div style="padding:8px 14px 4px;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#3a4a6a;border-top:1px solid rgba(255,255,255,0.05)">'+escH(labels[type]||type)+'</div>';
        groups[type].forEach(function(r) {
      var ridx = globalIdx++;
      var badge = r.badge ? '<span class="badge '+(r.badgeType||'badge-gray')+'" style="font-size:10px;flex-shrink:0">'+escH(r.badge)+'</span>' : '';
      html += '<div class="search-result-item" data-idx="'+ridx+'" data-id="'+r.id+'" data-view="'+r.view+'" data-type="'+r.type+'"'
        + ' onclick="selectSearchResult(this.dataset.view,this.dataset.id,this.dataset.type)"'
        + ' onmouseenter="setSearchIdx('+ridx+')"'
        + ' style="display:flex;align-items:center;gap:12px;padding:10px 16px;cursor:pointer;transition:background 0.1s">'
        + '<div style="width:32px;height:32px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;background:rgba(255,255,255,0.05)">'+r.icon+'</div>'
        + '<div style="flex:1;min-width:0">'
        + '<div style="font-size:13px;font-weight:600;color:#f0f4ff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+highlightMatch(r.title, q)+'</div>'
        + '<div style="font-size:11px;color:#4a5e7a;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+highlightMatch(r.sub||'', q)+'</div>'
        + '</div>'
        + badge
        + '</div>';
    });
  });

  html += '<div style="padding:10px 16px;border-top:1px solid rgba(255,255,255,0.05);text-align:center"><span style="font-size:11px;color:#3a4a6a">'+results.length+' result'+(results.length!==1?'s':'')+' · use ↑↓ to navigate</span></div>';

  dropdown.style.display = 'block';
  dropdown.innerHTML = html;
  // Mirror to mobile dropdown
  var mobDrop = document.getElementById('mob-search-dropdown');
  if (mobDrop) { mobDrop.style.display = 'block'; mobDrop.innerHTML = html; }
}

function highlightMatch(text, q) {
  if (!text || !q) return escHtml(text||'');
  var escaped = escHtml(text);
  var eq = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return escaped.replace(new RegExp('(' + eq + ')', 'gi'), '<mark style="background:rgba(79,142,247,0.3);color:#7ab3fa;border-radius:3px;padding:0 2px">$1</mark>');
}

function setSearchIdx(idx) {
  searchSelectedIdx = idx;
  document.querySelectorAll('.search-result-item').forEach(function(el, i) {
    el.style.background = i === idx ? 'rgba(79,142,247,0.12)' : '';
  });
}

function searchKeyNav(e) {
  var items = document.querySelectorAll('.search-result-item');
  if (!items.length) return;
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    setSearchIdx(Math.min(searchSelectedIdx + 1, items.length - 1));
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    setSearchIdx(Math.max(searchSelectedIdx - 1, 0));
  } else if (e.key === 'Enter' && searchSelectedIdx >= 0) {
    e.preventDefault();
    items[searchSelectedIdx].click();
  } else if (e.key === 'Escape') {
    closeSearchDropdown();
  }
}

function selectSearchResult(view, id, type) {
  var _qEl=document.getElementById('searchBar');if(_qEl&&_qEl.value)addSearchHistory(_qEl.value.trim());
  var _mEl=document.getElementById('mob-search-input');if(_mEl&&_mEl.value)addSearchHistory(_mEl.value.trim());
  closeSearchDropdown();
  if(_mEl)_mEl.value='';
  if(_qEl)_qEl.value='';
  switchView(view);
  // Open the detail panel after a brief render delay
  setTimeout(function(){ openDetail(type === 'issue' ? 'issues' : view.replace('troubleshoot','issues'), id); }, 80);
}

function closeSearchDropdown() {
  var d = document.getElementById('searchDropdown');
  if (d) d.style.display = 'none';
  var md = document.getElementById('mob-search-dropdown');
  if (md) md.style.display = 'none';
  var bar = document.getElementById('searchBar');
  if (bar) { bar.value = ''; bar.blur(); }
  var mbar = document.getElementById('mob-search-input');
  if (mbar) { mbar.value = ''; mbar.blur(); }
  searchSelectedIdx = -1;
}

// ═══════════════════════════════════════════════
//  RENDER ALL
// ═══════════════════════════════════════════════

function locationSearch(val) {
  clearTimeout(_locTimer);
  var dd = document.getElementById('location-dropdown');
  var sp = document.getElementById('location-spinner');
  _locHighlight = -1;

  if (!val || val.length < 3) {
    dd.style.display = 'none';
    return;
  }

  if (sp) sp.style.display = 'block';
  _locTimer = setTimeout(function() {
    var url = 'https://nominatim.openstreetmap.org/search?format=json&limit=6&addressdetails=1&q=' + encodeURIComponent(val);
    fetch(url, { headers: { 'Accept-Language': 'en' } })
      .then(function(r) { return r.json(); })
      .then(function(results) {
        if (sp) sp.style.display = 'none';
        _locResults = results;
        renderLocationDropdown(results);
      })
      .catch(function() {
        if (sp) sp.style.display = 'none';
        dd.style.display = 'none';
      });
  }, 350);
}

function renderLocationDropdown(results) {
  var dd = document.getElementById('location-dropdown');
  if (!results || !results.length) {
    dd.innerHTML = '<div class="location-no-results">No results found</div>';
    dd.style.display = 'block';
    return;
  }
  dd.innerHTML = results.map(function(r, i) {
    // Build a clean display address
    var addr = r.address || {};
    var name = r.name || addr.building || addr.amenity || addr.shop || '';
    var street = [addr.house_number, addr.road].filter(Boolean).join(' ');
    var city = addr.city || addr.town || addr.village || addr.county || '';
    var state = addr.state || '';
    var country = addr.country_code ? addr.country_code.toUpperCase() : '';
    var detail = [street, city, state, country].filter(Boolean).join(', ');
    var fullAddress = r.display_name || detail;
    // Short address for the input field
    var shortAddr = [street || name, city, state].filter(Boolean).join(', ');
    if (!shortAddr) shortAddr = fullAddress.split(',').slice(0,3).join(',').trim();

    var icon = getLocIcon(r.type, r.class, addr);

    return '<div class="location-item" id="loc-item-' + i + '" ' +
      'onclick="selectLocation(' + i + ')" ' +
      'onmouseover="highlightLocation(' + i + ')">' +
      '<span class="loc-icon">' + icon + '</span>' +
      '<div>' +
        '<div class="loc-name">' + escHtml(name || street || city) + '</div>' +
        '<div class="loc-detail">' + escHtml(detail || fullAddress.split(',').slice(0,4).join(',')) + '</div>' +
      '</div>' +
    '</div>';
  }).join('');
  dd.style.display = 'block';
}

function getLocIcon(type, cls, addr) {
  if (cls === 'building' || type === 'building') return '🏢';
  if (cls === 'office' || addr.office) return '🏢';
  if (type === 'hotel' || addr.hotel) return '🏨';
  if (cls === 'amenity' && (type === 'hospital' || type === 'clinic')) return '🏥';
  if (cls === 'amenity' && (type === 'school' || type === 'university')) return '🏫';
  if (cls === 'amenity' && type === 'place_of_worship') return '⛪';
  if (cls === 'shop' || addr.shop) return '🏪';
  if (type === 'residential' || addr.house_number) return '🏠';
  if (type === 'industrial' || type === 'warehouse') return '🏭';
  if (cls === 'highway' || addr.road) return '📍';
  if (type === 'city' || type === 'town' || type === 'village') return '🌆';
  return '📍';
}

function selectLocation(i) {
  var r = _locResults[i];
  if (!r) return;
  var addr = r.address || {};
  var street = [addr.house_number, addr.road].filter(Boolean).join(' ');
  var city = addr.city || addr.town || addr.village || addr.county || '';
  var state = addr.state || '';
  var zip = addr.postcode || '';
  // Build a clean short address for the field
  var parts = [street, city, state, zip].filter(Boolean);
  var shortAddr = parts.join(', ');
  if (!shortAddr) shortAddr = r.display_name.split(',').slice(0,3).join(',').trim();

  var input = document.getElementById('project-location');
  if (input) {
    input.value = shortAddr;
    input.focus();
  }
  closeLocationDropdown();
}

function highlightLocation(i) {
  _locHighlight = i;
  document.querySelectorAll('.location-item').forEach(function(el, idx) {
    el.classList.toggle('highlighted', idx === i);
  });
}

function locationKeydown(e) {
  var dd = document.getElementById('location-dropdown');
  if (dd.style.display === 'none') return;
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    _locHighlight = Math.min(_locHighlight + 1, _locResults.length - 1);
    highlightLocation(_locHighlight);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    _locHighlight = Math.max(_locHighlight - 1, 0);
    highlightLocation(_locHighlight);
  } else if (e.key === 'Enter' && _locHighlight >= 0) {
    e.preventDefault();
    selectLocation(_locHighlight);
  } else if (e.key === 'Escape') {
    closeLocationDropdown();
  }
}

function closeLocationDropdown() {
  var dd = document.getElementById('location-dropdown');
  if (dd) dd.style.display = 'none';
  _locResults = [];
  _locHighlight = -1;
}

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
  if (!e.target.closest || !e.target.closest('#modal-project')) {
    closeLocationDropdown();
  }
});

// Expose functions globally

function addNotif(msg, level, actionType, actionId) {
  var n = { id: Date.now()+'', msg: msg, level: level||'info', read: false, ts: Date.now(), actionType: actionType, actionId: actionId };
  notifications.unshift(n);
  if (notifications.length > 50) notifications = notifications.slice(0, 50);
  localStorage.setItem('fop_notifs', JSON.stringify(notifications));
  renderNotifBadge();
  renderNotifList();
}

function checkNotifications() {
  var today = new Date(); today.setHours(0,0,0,0);
  var notified = JSON.parse(localStorage.getItem('fop_notif_sent')||'{}');
  var today_key = today.toISOString().slice(0,10);

  state.tasks.filter(function(t){ return !t.archived && t.status !== 'done'; }).forEach(function(t) {
    if (!t.due) return;
    var due = new Date(t.due); due.setHours(0,0,0,0);
    var diff = (due - today) / 86400000;
    var key = t.id + '_' + today_key;
    if (notified[key]) return;
    if (diff < 0) {
      addNotif('Overdue: ' + t.title, 'danger', 'tasks', t.id);
      notified[key] = 1;
    } else if (diff <= 1) {
      addNotif('Due today: ' + t.title, 'warn', 'tasks', t.id);
      notified[key] = 1;
    } else if (diff <= 3) {
      addNotif('Due in ' + Math.round(diff) + ' days: ' + t.title, 'info', 'tasks', t.id);
      notified[key] = 1;
    }
  });
  localStorage.setItem('fop_notif_sent', JSON.stringify(notified));
  renderNotifBadge();
}

// ═══════════════════════════════════════════════
//  RECURRING TASKS
// ═══════════════════════════════════════════════

function checkShipmentETA() {
  var today = new Date(); today.setHours(0,0,0,0);
  var notified = JSON.parse(localStorage.getItem('fop_eta_sent') || '{}');
  var todayKey = today.toISOString().slice(0,10);

  state.shipping.forEach(function(s) {
    if (!s.eta || s.status === 'delivered') return;
    var eta = new Date(s.eta); eta.setHours(0,0,0,0);
    var diff = (eta - today) / 86400000;
    var name = s.desc || s.tracking || 'Shipment';
    var key = s.id + '_eta_' + todayKey;
    if (notified[key]) return;

    if (diff < 0 && (s.status === 'transit' || s.status === 'out' || s.status === 'pending')) {
      addNotif('Shipment possibly delayed — past ETA: ' + name, 'danger', 'shipping', s.id);
      notified[key] = 1;
    } else if (diff === 0) {
      addNotif('Delivery expected today: ' + name, 'warn', 'shipping', s.id);
      notified[key] = 1;
    } else if (diff === 1) {
      addNotif('Delivery expected tomorrow: ' + name, 'info', 'shipping', s.id);
      notified[key] = 1;
    }
  });
  localStorage.setItem('fop_eta_sent', JSON.stringify(notified));
}


// ─── GENERIC ROW SWIPE (POs, Shipping) ────────────────────────────────────────


function addSearchHistory(q){if(!q||q.length<2)return;_srchHist=_srchHist.filter(function(s){return s!==q;});_srchHist.unshift(q);if(_srchHist.length>8)_srchHist=_srchHist.slice(0,8);localStorage.setItem('fop_srch',JSON.stringify(_srchHist));}

function showSearchHistory(){var dd=document.getElementById('searchDropdown');if(!dd)return;if(!_srchHist.length){dd.style.display='none';return;}dd.style.display='block';dd.innerHTML='<div style="padding:8px 14px 4px;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#3a4a6a">Recent</div>'+_srchHist.map(function(s){return'<div class="search-result-item" style="display:flex;align-items:center;gap:10px;padding:9px 16px;cursor:pointer" onmousedown="event.preventDefault();document.getElementById(\'searchBar\').value=\''+escH(s)+'\';globalSearch(\''+escH(s)+'\')"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#4a5e7a" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><span style="flex:1;font-size:13px;color:#8da0c0">'+escH(s)+'</span><span onmousedown="event.stopPropagation();removeSearchHistory(\''+escH(s)+'\')" style="color:#3a4a6a;cursor:pointer;font-size:16px;padding:0 4px">&times;</span></div>';}).join('');
  var _mobDd=document.getElementById('mob-search-dropdown');if(_mobDd){_mobDd.style.display='block';_mobDd.innerHTML=dd.innerHTML;}
}

function removeSearchHistory(q){_srchHist=_srchHist.filter(function(s){return s!==q;});localStorage.setItem('fop_srch',JSON.stringify(_srchHist));showSearchHistory();}

function initBottomSheets(){if(window.innerWidth>768)return;document.querySelectorAll('.modal').forEach(function(modal){if(modal.dataset.bsinit)return;modal.dataset.bsinit='1';var h=document.createElement('div');h.style.cssText='width:40px;height:4px;background:rgba(255,255,255,0.18);border-radius:99px;margin:8px auto 0;cursor:grab;flex-shrink:0';modal.insertBefore(h,modal.firstChild);var y0=0;h.addEventListener('touchstart',function(e){y0=e.touches[0].clientY;},{passive:true});h.addEventListener('touchmove',function(e){var dy=e.touches[0].clientY-y0;if(dy>0)modal.style.transform='translateY('+dy+'px)';},{passive:true});h.addEventListener('touchend',function(e){var dy=e.changedTouches[0].clientY-y0;modal.style.transform='';modal.style.transition='transform 0.25s';setTimeout(function(){modal.style.transition='';},300);if(dy>90){var ov=modal.closest('.modal-overlay');if(ov)ov.classList.remove('open');}});});}


// Suppress unhandled Promise rejections from showing as "Script error" in WKWebView
window.addEventListener('unhandledrejection', function(e) {
  // Suppress cross-origin Firebase promise rejections
  e.preventDefault();
  if (e.reason && e.reason.message) {
    var msg = e.reason.message;
    if (msg.indexOf('Script error') !== -1) return;
  }
  console.warn('Unhandled rejection:', e.reason);
});

// ── iOS PULL-TO-REFRESH ─────────────────────────────
(function(){
  var _pty=0,_ptpulling=false,_ptind=null;
  function _ptget(){if(!_ptind){_ptind=document.createElement('div');_ptind.id='ptr-indicator';_ptind.style.cssText='position:fixed;top:60px;left:50%;transform:translateX(-50%) translateY(-40px);z-index:999;background:rgba(30,45,90,0.9);color:#4f8ef7;font-size:12px;font-weight:700;padding:6px 16px;border-radius:99px;pointer-events:none;opacity:0;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);transition:opacity 0.15s';_ptind.textContent='Pull to refresh';document.body.appendChild(_ptind);}return _ptind;}
  document.addEventListener('touchstart',function(e){var ct=document.getElementById('content');if(!ct||ct.scrollTop>4)return;_pty=e.touches[0].clientY;_ptpulling=true;},{passive:true});
  document.addEventListener('touchmove',function(e){if(!_ptpulling)return;var dy=e.touches[0].clientY-_pty;if(dy>10){var i=_ptget();i.style.opacity=Math.min(dy/60,1);i.style.transform='translateX(-50%) translateY('+Math.min(dy/3,20)+'px)';i.textContent=dy>60?'Release to refresh':'Pull to refresh';}},{passive:true});
  document.addEventListener('touchend',function(e){if(!_ptpulling)return;var dy=e.changedTouches[0].clientY-_pty;_ptpulling=false;var i=_ptget();if(dy>60){i.textContent='Refreshing…';i.style.opacity='1';setTimeout(function(){renderAll();if(typeof haptic==='function')haptic('medium');i.style.opacity='0';},700);}else{i.style.opacity='0';}});

})();

// ── THINGS-STYLE NAVIGATION ───────────────────────────────────────────

function toggleQuickAdd() {
  // On mobile, use smart FAB radial menu
  if (window.innerWidth <= 768) {
    toggleFabMenu();
    return;
  }
  // On non-task desktop views, open appropriate modal
  if (currentView !== 'tasks' && currentView !== 'dashboard') {
    openAddModal();
    return;
  }
  quickAddOpen = !quickAddOpen;
  var panel = document.getElementById('quickAddPanel');
  var fab = document.getElementById('quickAddFab');
  panel.style.display = quickAddOpen ? 'block' : 'none';
  if (fab) {
    fab.classList.toggle('qa-open', quickAddOpen);
    var fabSpan = fab.querySelector('span');
    if (fabSpan) fabSpan.textContent = quickAddOpen ? '×' : '+';
  }
  if (quickAddOpen) {
    populateProjectSelects();
    var qaProj = document.getElementById('qa-project');
    if (qaProj) {
      qaProj.innerHTML = '<option value="">No project</option>' +
        state.projects.map(function(p){return '<option value="'+p.id+'">'+escH(p.name)+'</option>';}).join('');
    }
    setTimeout(function(){ document.getElementById('qa-title').focus(); }, 50);
  }
}

function saveQuickTask() {
  var title = (document.getElementById('qa-title').value||'').trim();
  if (!title) { document.getElementById('qa-title').focus(); return; }
  var item = {
    title,
    priority: document.getElementById('qa-priority').value || 'medium',
    project: document.getElementById('qa-project').value || '',
    status: 'todo',
  };
  addItem('tasks', item);
  toast('Task added: ' + title);
  document.getElementById('qa-title').value = '';
  document.getElementById('qa-priority').selectedIndex = 0;
  renderDashboard();
  if (currentView === 'tasks') renderTasks();
}

// ═══════════════════════════════════════════════
//  FILTER TASKS BY PROJECT
// ═══════════════════════════════════════════════


function applyProjectFilter(pid) {
  taskProjectFilter = pid;
  renderTasks();
}

// ═══════════════════════════════════════════════
//  BULK TASK ACTIONS
// ═══════════════════════════════════════════════


// ── iOS PULL-TO-REFRESH ─────────────────────────────
(function(){
  var _pty=0,_ptpulling=false,_ptind=null;
  function _ptget(){if(!_ptind){_ptind=document.createElement('div');_ptind.id='ptr-indicator';_ptind.style.cssText='position:fixed;top:60px;left:50%;transform:translateX(-50%) translateY(-40px);z-index:999;background:rgba(30,45,90,0.9);color:#4f8ef7;font-size:12px;font-weight:700;padding:6px 16px;border-radius:99px;pointer-events:none;opacity:0;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);transition:opacity 0.15s';_ptind.textContent='Pull to refresh';document.body.appendChild(_ptind);}return _ptind;}
  document.addEventListener('touchstart',function(e){var ct=document.getElementById('content');if(!ct||ct.scrollTop>4)return;_pty=e.touches[0].clientY;_ptpulling=true;},{passive:true});
  document.addEventListener('touchmove',function(e){if(!_ptpulling)return;var dy=e.touches[0].clientY-_pty;if(dy>10){var i=_ptget();i.style.opacity=Math.min(dy/60,1);i.style.transform='translateX(-50%) translateY('+Math.min(dy/3,20)+'px)';i.textContent=dy>60?'Release to refresh':'Pull to refresh';}},{passive:true});
  document.addEventListener('touchend',function(e){if(!_ptpulling)return;var dy=e.changedTouches[0].clientY-_pty;_ptpulling=false;var i=_ptget();if(dy>60){i.textContent='Refreshing…';i.style.opacity='1';setTimeout(function(){renderAll();if(typeof haptic==='function')haptic('medium');i.style.opacity='0';},700);}else{i.style.opacity='0';}});

})();

window.addEventListener('load', function(){
  loadTheme();
  loadSavedConfig();

  // Close modals on overlay click
  document.querySelectorAll('.modal-overlay').forEach(function(overlay){
    overlay.addEventListener('click', function(e){ if(e.target===overlay) overlay.classList.remove('open'); });
  });

  // Close search dropdown on click outside
  document.addEventListener('click', function(e) {
    var wrap = e.target.closest('.search-wrap');
    if (!wrap) closeSearchDropdown();
  });

  // Offline/online indicator
  function updateOnlineStatus() {
    var dot = document.getElementById('syncDot');
    var label = document.getElementById('syncLabel');
    var bar = document.getElementById('offlineBar');
    if (!navigator.onLine) {
      if (dot) { dot.classList.add('offline'); }
      if (label) label.textContent = 'Offline';
      if (bar) bar.style.display = 'flex';
    } else {
      if (dot && !window._fbConnected) dot.classList.remove('offline');
      if (label && !window._fbConnected) label.textContent = 'Local only';
      if (bar) bar.style.display = 'none';
    }
  }
  // Online/offline handled by sync queue handlers above
  updateOnlineStatus();

  // Init notifications + features
  renderNotifBadge();
  renderRecentlyViewed();
  setTimeout(checkNotifications, 1500);
  setTimeout(checkShipmentETA, 2000);
  setInterval(checkNotifications, 5 * 60 * 1000);
  setInterval(checkShipmentETA, 10 * 60 * 1000);
  applyDashWidgets();
  if (compactMode) document.body.classList.add('compact');
  initBottomSheets();
  if (window.innerWidth <= 768) {
    // Tab bar mode — no need for Things nav
    renderThingsHome();
    var mds = document.getElementById('mob-sync-status');
    if (mds) mds.style.display = 'flex';
    var ctb = document.getElementById('compact-toggle-btn');
    if (ctb) ctb.style.display = 'flex';
  }
  updateSyncBar();
  updateTabBadges();
  initDragHandles();
  renderWidgetToggles();
  applyWidgetVisibility();
  setTimeout(checkAndPushNotifs, 3000);
  setInterval(checkAndPushNotifs, 10 * 60 * 1000);
  setInterval(updateTabBadges, 30000);

  // Close notif panel on outside click
  // notif outside-click handled in toggleNotifPanel

  // ── Keyboard Shortcuts ─────────────────────────────────────────────────
  document.addEventListener('keydown', function(e) {
    var tag = (e.target.tagName||'').toLowerCase();
    var inInput = tag === 'input' || tag === 'textarea' || tag === 'select';
    var modalOpen = document.querySelector('.modal-overlay.open');

    // Escape: close any open modal
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.open').forEach(function(m){ m.classList.remove('open'); });
      return;
    }

    // / or Ctrl+F: focus search
    if ((e.key === '/' || (e.ctrlKey && e.key === 'f')) && !inInput) {
      e.preventDefault();
      var sb = document.getElementById('searchBar');
      if (sb) { sb.focus(); sb.select(); }
      return;
    }

    // ? key: open shortcuts modal
    if (e.key === '?' && !inInput) {
      openModal('modal-shortcuts');
      return;
    }

    // Skip all other shortcuts if typing in a field or modal is open
    if (inInput || modalOpen) return;

    // K: toggle kanban/list view when on tasks
    if (e.key === 'k' || e.key === 'K') {
      if (typeof currentView !== 'undefined' && currentView === 'tasks') {
        setTaskView(taskViewMode === 'kanban' ? 'list' : 'kanban');
      }
      return;
    }

    switch(e.key.toLowerCase()) {
      case 'n': openAddModal(); break;              // N = New item
      case '1': switchView('dashboard'); break;
      case '2': switchView('projects'); break;
      case '3': switchView('tasks'); break;
      case '4': switchView('pos'); break;
      case '5': switchView('shipping'); break;
      case '6': switchView('troubleshoot'); break;
      case 'p': switchView('projects'); break;
      case 't': switchView('tasks'); break;
      case 'o': switchView('pos'); break;
      case 's': switchView('shipping'); break;
      case 'f': switchView('troubleshoot'); break;  // F = Fix / troubleshoot
      case 'h': switchView('dashboard'); break;     // H = Home
    }
  });

  // Show shortcut hint in topbar on desktop
  var hint = document.createElement('span');
  hint.style.cssText = 'font-size:11px;color:#4a5e7a;font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;white-space:nowrap';
  hint.innerHTML = '&#x2318; N&nbsp;&nbsp;/&nbsp;&nbsp;1-6&nbsp;&nbsp;/&nbsp;&nbsp;/ = search';
  var topbar = document.getElementById('topbar');
  if (topbar && window.innerWidth > 768) topbar.appendChild(hint);

  // Add some sample data if empty
  setTimeout(function(){
    // Seed built-in troubleshoot issues on first run
      renderTroubleshoot();

    if(!state.projects.length && !state.tasks.length) {
      addItem('projects', {name:'Office Tower HQ', client:'Acme Corp', status:'active', system:'Lutron Quantum', location:'123 Main St', start:'2025-01-15', end:'2025-06-30', notes:'Full lighting controls replacement. 12 floors.'});
      addItem('tasks', {title:'Verify GRAFIK Eye QS panel wiring', priority:'high', status:'inprogress', category:'install', due:'2025-04-01', assignee:'Mike T.'});
      addItem('tasks', {title:'Commission floor 3–5 scenes', priority:'medium', status:'todo', category:'commission', due:'2025-04-15', assignee:'Sara K.'});
      addItem('pos', {number:'PO-2025-042', vendor:'Lutron Electronics', status:'ordered', date:'2025-03-10', delivery:'2025-03-20', total:24850, items:'48 × GRAFIK Eye QS 6-zone — $295.00\n12 × Seetouch QS Keypad — $185.00\n1 × Quantum 3 Processor — $4200.00'});
      addItem('shipping', {tracking:'1Z9F92860318165784', carrier:'UPS', desc:'Lutron GRAFIK Eye QS units', status:'transit', eta:'2025-03-20'});
    }
  }, 1000);
});
