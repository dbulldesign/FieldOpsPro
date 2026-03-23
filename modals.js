// FieldOps Pro — Modals & Forms
// All modal open/close, save/edit handlers, combo boxes


function switchView(v) {
  if (v === 'tasks') {
    setTimeout(function() {
      var pf = document.getElementById('task-project-filter');
      if (pf) {
        pf.innerHTML = '<option value="">All Projects</option>' +
          state.projects.map(function(p){return '<option value="'+p.id+'"'+(taskProjectFilter===p.id?' selected':'')+'>'+escH(p.name)+'</option>';}).join('');
      }
      var fab = document.getElementById('quickAddFab');
      if (fab) fab.style.display = 'flex';
    }, 50);
  } else {
    // Show FAB on all views - it opens the appropriate modal for that view
    var fab = document.getElementById('quickAddFab');
    if (fab) fab.style.display = 'flex';
    var panel = document.getElementById('quickAddPanel');
    if (panel) panel.style.display = 'none';
    quickAddOpen = false;
  }
  currentView = v;
  document.querySelectorAll('.view').forEach(function(el){el.classList.remove('active');});
  document.getElementById('view-'+v).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(function(el){el.classList.remove('active');});
  document.querySelectorAll('.mobile-nav-item').forEach(function(el){el.classList.remove('active');});
  var ni=document.querySelector('.nav-item[onclick*="\''+v+'\'"');
  if(ni) ni.classList.add('active');
  var mi=null;
  if(mi) mi.classList.add('active');
  document.getElementById('topbarTitle').textContent = viewTitles[v];
  closeSidebar();
  if(v==='troubleshoot') renderTroubleshoot();
  // Lazy render: render view if dirty
  if (window._dirtyViews && window._dirtyViews[v]) {
    window._dirtyViews[v] = false;
    if (v==='projects') renderProjects();
    else if (v==='tasks') renderTasks();
    else if (v==='pos') renderPOs();
    else if (v==='shipping') renderShipping();
    else if (v==='troubleshoot') renderTroubleshoot();
  }
  haptic('light');
  document.title = (viewTitles[v]||'FieldOps Pro') + ' · FieldOps Pro';
  if (window.innerWidth <= 768) updateThingsNav(v);
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebarOverlay').classList.toggle('open');
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('open');
}

// ═══════════════════════════════════════════════
//  MODAL
// ═══════════════════════════════════════════════


function openAddModal() {
  editingId = null;
  var modals = {
    dashboard: 'modal-task', projects: 'modal-project', tasks: 'modal-task',
    pos: 'modal-po', shipping: 'modal-shipping', troubleshoot: 'modal-issue',
    commissioning: 'modal-event'
  };
  var m = modals[currentView] || 'modal-task';
  clearForm(m);
  if(m !== 'modal-issue') populateProjectSelects();
  openModal(m);
}
// openModal defined below with combo init

function closeModal(id) {
  var el = document.getElementById(id);
  if (el) {
    el.classList.remove('open');
    el.style.display = 'none';
  }
}

function clearForm(modalId) {
  document.querySelectorAll('#'+modalId+' input, #'+modalId+' textarea').forEach(function(el){el.value='';});
  document.querySelectorAll('#'+modalId+' select').forEach(function(el){el.selectedIndex=0;});
  document.querySelectorAll('#'+modalId+' .combo-input').forEach(function(el){el.value='';el.dataset.value='';});
}

function populateProjectSelects() {
  var projOpts = '<option value="">— None —</option>' +state.projects.map(function(p){return '<option value="'+p.id+'">'+escH(p.name)+'</option>';}).join('');
  ['task-project','po-project','ship-project','event-project'].forEach(function(id){
    var el = document.getElementById(id);
    if(el) el.innerHTML = projOpts;
  });
  // Populate ship-po with PO options
  var poEl = document.getElementById('ship-po');
  if(poEl) {
    poEl.innerHTML = '<option value="">— None —</option>' +
      state.pos.map(function(p){return '<option value="'+p.id+'">'+(p.number?escH(p.number)+' - ':'')+escH(p.vendor||'PO')+'</option>';}).join('');
  }
  // Populate task-shipment with shipping options
  var taskShipEl = document.getElementById('task-shipment');
  if(taskShipEl) {
    taskShipEl.innerHTML = '<option value="">— None —</option>' +
      state.shipping.map(function(s){return '<option value="'+s.id+'">'+escH(s.desc||s.tracking||'Shipment')+'</option>';}).join('');
  }
  // Populate ship-task with task options
  var taskEl = document.getElementById('ship-task');
  if(taskEl) {
    taskEl.innerHTML = '<option value="">— None —</option>' +
      state.tasks.filter(function(t){return !t.archived;}).map(function(t){return '<option value="'+t.id+'">'+escH(t.title)+'</option>';}).join('');
  }
  // Populate event task + shipment selects
  var evTaskEl = document.getElementById('event-task');
  if(evTaskEl) {
    evTaskEl.innerHTML = '<option value="">— None —</option>' +
      state.tasks.filter(function(t){return !t.archived;}).map(function(t){return '<option value="'+t.id+'">'+escH(t.title)+'</option>';}).join('');
  }
  var evShipEl = document.getElementById('event-shipment');
  if(evShipEl) {
    evShipEl.innerHTML = '<option value="">— None —</option>' +
      state.shipping.map(function(s){return '<option value="'+s.id+'">'+escH(s.desc||s.tracking||'Shipment')+'</option>';}).join('');
  }
}

// ═══════════════════════════════════════════════
//  COMMISSIONING EVENTS
// ═══════════════════════════════════════════════

function saveEvent() {
  var title = document.getElementById('event-title').value.trim();
  if (!title) { toast('Enter an event title'); return; }
  var item = {
    title: title,
    type: document.getElementById('event-type').value || 'other',
    date: document.getElementById('event-date').value,
    endDate: document.getElementById('event-end-date').value,
    status: document.getElementById('event-status').value || 'scheduled',
    project: document.getElementById('event-project').value,
    task: document.getElementById('event-task').value,
    shipment: document.getElementById('event-shipment').value,
    notes: document.getElementById('event-notes').value.trim()
  };
  if (editingId) { updateItem('events', editingId, item); toast('Event updated'); }
  else { addItem('events', item); toast('Event added'); }
  closeModal('modal-event');
  renderCommissioning();
  if (currentView === 'calendar') renderCalendar();
}

function editEvent(id) {
  var ev = state.events.find(function(x){ return x.id === id; });
  if (!ev) return;
  editingId = id;
  populateProjectSelects();
  document.getElementById('event-modal-title').textContent = 'Edit Event';
  document.getElementById('event-title').value = ev.title || '';
  document.getElementById('event-type').value = ev.type || 'other';
  document.getElementById('event-date').value = ev.date || '';
  document.getElementById('event-end-date').value = ev.endDate || '';
  document.getElementById('event-status').value = ev.status || 'scheduled';
  document.getElementById('event-project').value = ev.project || '';
  document.getElementById('event-task').value = ev.task || '';
  document.getElementById('event-shipment').value = ev.shipment || '';
  document.getElementById('event-notes').value = ev.notes || '';
  openModal('modal-event');
}

function confirmDeleteEvent(id) {
  var ev = state.events.find(function(x){ return x.id === id; });
  softDelete('events', id, ev ? ev.title : 'Event');
  renderCommissioning();
  if (currentView === 'calendar') renderCalendar();
}

// ═══════════════════════════════════════════════
//  RENDER HELPERS
// ═══════════════════════════════════════════════

function saveProject() {
  var _pn = document.getElementById('project-name'); if(!_pn) return; var name = _pn.value.trim();
  if(!name) { toast('Enter project name'); return; }
  var item = {
    name, client: document.getElementById('project-client').value.trim(),
    status: document.getElementById('project-status').value,
    start: document.getElementById('project-start').value,
    end: document.getElementById('project-end').value,
    location: document.getElementById('project-location').value.trim(),
    system: document.getElementById('project-system').value,
    notes: document.getElementById('project-notes').value.trim(),
  };
  if(editingId) { updateItem('projects', editingId, item); toast('Project updated'); }
  else { addItem('projects', item); toast('Project created'); }
  closeModal('modal-project');
}

function editProject(id) {
  var p = state.projects.find(function(x){return x.id===id;});
  if(!p) return;
  editingId = id;
  document.getElementById('project-modal-title').textContent = 'Edit Project';
  document.getElementById('project-name').value = p.name||'';
  document.getElementById('project-client').value = p.client||'';
  document.getElementById('project-status').value = p.status||'planning';
  document.getElementById('project-start').value = p.start||'';
  document.getElementById('project-end').value = p.end||'';
  document.getElementById('project-location').value = p.location||'';
  document.getElementById('project-system').value = p.system||'';
  document.getElementById('project-notes').value = p.notes||'';
  openModal('modal-project');
}

// ═══════════════════════════════════════════════
//  TASKS
// ═══════════════════════════════════════════════


function saveTask() {
  var title = document.getElementById('task-title').value.trim();
  if(!title){toast('Enter task title');return;}
  var recur = document.getElementById('task-recur').value;
  var item = {
    title, project:document.getElementById('task-project').value,
    priority:document.getElementById('task-priority').value,
    status:document.getElementById('task-status').value,
    due:document.getElementById('task-due').value,
    category:comboGet('task-category'),
    desc:document.getElementById('task-desc').value.trim(),
    recur: recur || null,
    shipment: document.getElementById('task-shipment').value || null,
  };
  if(editingId){
    updateItem('tasks',editingId,item);
    toast('Task updated');
  } else {
    addItem('tasks',item);
    if(recur) scheduleNextRecur(item);
    toast('Task added' + (recur ? ' · Repeats ' + recur : ''));
  }
  closeModal('modal-task');
}

function editTask(id) {
  var t = state.tasks.find(function(x){return x.id===id;});
  if(!t)return;
  editingId=id;
  populateProjectSelects();
  document.getElementById('task-modal-title').textContent='Edit Task';
  document.getElementById('task-title').value=t.title||'';
  document.getElementById('task-project').value=t.project||'';
  document.getElementById('task-priority').value=t.priority||'medium';
  document.getElementById('task-status').value=t.status||'todo';
  document.getElementById('task-due').value=t.due||'';
  comboSet('task-category', t.category||'');
  document.getElementById('task-recur').value=t.recur||'';
  document.getElementById('task-shipment').value=t.shipment||'';
  document.getElementById('task-desc').value=t.desc||'';
  openModal('modal-task');
}

// ═══════════════════════════════════════════════
//  PURCHASE ORDERS
// ═══════════════════════════════════════════════


function savePO() {
  var number = document.getElementById('po-number').value.trim();
  var vendor = document.getElementById('po-vendor').value.trim();
  if(!number||!vendor){toast('Enter PO number and vendor');return;}
  var item = {
    number, vendor, project:document.getElementById('po-project').value,
    status:document.getElementById('po-status').value,
    date:document.getElementById('po-date').value,
    delivery:document.getElementById('po-delivery').value,
    items:document.getElementById('po-items').value.trim(),
    shipmethod:document.getElementById('po-shipmethod').value,
    notes:document.getElementById('po-notes').value.trim(),
  };
  if(editingId){updateItem('pos',editingId,item);toast('PO updated');}
  else{addItem('pos',item);toast('PO created');}
  closeModal('modal-po');
}

function editPO(id) {
  var p = state.pos.find(function(x){return x.id===id;});
  if(!p)return;
  editingId=id;
  populateProjectSelects();
  document.getElementById('po-modal-title').textContent='Edit PO';
  document.getElementById('po-number').value=p.number||'';
  document.getElementById('po-vendor').value=p.vendor||'';
  document.getElementById('po-project').value=p.project||'';
  document.getElementById('po-status').value=p.status||'draft';
  document.getElementById('po-date').value=p.date||'';
  document.getElementById('po-delivery').value=p.delivery||'';
  document.getElementById('po-items').value=p.items||'';
  document.getElementById('po-shipmethod').value=p.shipmethod||'';
  document.getElementById('po-notes').value=p.notes||'';
  openModal('modal-po');
}

// ═══════════════════════════════════════════════
//  SHIPPING
// ═══════════════════════════════════════════════

function saveShipment() {
  var desc=document.getElementById('ship-desc').value.trim();
  var tracking=document.getElementById('ship-tracking').value.trim();
  if(!desc && !tracking){toast('Enter a description or tracking number');return;}
  var item = {
    tracking, carrier:document.getElementById('ship-carrier').value,
    desc, po:document.getElementById('ship-po').value,
    task:document.getElementById('ship-task').value,
    status:document.getElementById('ship-status').value,
    date:document.getElementById('ship-date').value,
    eta:document.getElementById('ship-eta').value,
    notes:document.getElementById('ship-notes').value.trim(),
  };
  if(editingId){updateItem('shipping',editingId,item);toast('Shipment updated');}
  else{addItem('shipping',item);toast('Shipment added');}
  closeModal('modal-shipping');
}

function editShipment(id) {
  var s=state.shipping.find(function(x){return x.id===id;});
  if(!s)return;
  editingId=id;
  populateProjectSelects();
  document.getElementById('ship-modal-title').textContent='Edit Shipment';
  document.getElementById('ship-tracking').value=s.tracking||'';
  document.getElementById('ship-carrier').value=s.carrier||'';
  document.getElementById('ship-desc').value=s.desc||'';
  document.getElementById('ship-po').value=s.po||'';
  document.getElementById('ship-task').value=s.task||'';
  document.getElementById('ship-project').value=s.project||'';
  document.getElementById('ship-status').value=s.status||'pending';
  document.getElementById('ship-date').value=s.date||'';
  document.getElementById('ship-eta').value=s.eta||'';
  document.getElementById('ship-notes').value=s.notes||'';
  openModal('modal-shipping');
}

// ═══════════════════════════════════════════════
//  DETAIL VIEW
// ═══════════════════════════════════════════════

function editIssue(id) {
  var t = state.issues.find(function(x){ return x.id === id; });
  if (!t) return;
  editingId = id;
  document.getElementById('issue-modal-title').textContent = 'Edit Issue';
  document.getElementById('issue-q').value = t.q || '';
  document.getElementById('issue-cat').value = t.cat || 'electrical';
  var isysEl = document.getElementById('issue-system'); if(isysEl) isysEl.value = t.system || '';
  document.getElementById('issue-tags').value = t.tags || '';
  document.getElementById('issue-a').value = t.a || '';
  document.getElementById('issue-steps').value = Array.isArray(t.steps) ? t.steps.join('\n') : (t.steps||'');
  openModal('modal-issue');
}

function saveIssue() {
  var q = document.getElementById('issue-q').value.trim();
  if (!q) { toast('Enter the issue/question'); return; }
  var stepsRaw = document.getElementById('issue-steps').value.trim();
  var steps = stepsRaw.split('\n').map(function(s){ return s.trim(); }).filter(Boolean);
  var item = {
    q: q,
    cat: document.getElementById('issue-cat').value,
    system: document.getElementById('issue-system') ? document.getElementById('issue-system').value : '',
    tags: document.getElementById('issue-tags').value.trim(),
    a: document.getElementById('issue-a').value.trim(),
    steps: steps,
    builtin: false
  };
  if (editingId) { updateItem('issues', editingId, item); toast('Issue updated'); }
  else { addItem('issues', item); toast('Issue added'); }
  closeModal('modal-issue');
  renderTroubleshoot();
}

function deleteIssue(id) {
  if (!confirm('Delete this issue?')) return;
  deleteItem('issues', id);
  renderTroubleshoot();
  toast('Issue deleted');
}


// ═══════════════════════════════════════════════
//  GLOBAL SEARCH
// ═══════════════════════════════════════════════
// ═══════════════════════════════════════════════
//  SMART GLOBAL SEARCH
// ═══════════════════════════════════════════════


function saveComboOpts() {
  localStorage.setItem('fop_combo_opts', JSON.stringify(comboCustomOptions));
}


function comboOptions(id) {
  var defaults = COMBO_DEFAULTS[id] || [];
  var custom = comboCustomOptions[id] || [];
  return defaults.concat(custom.filter(function(x){ return defaults.indexOf(x) === -1; }));
}

function comboInit(id, currentVal) {
  var wrap = document.getElementById('combo-' + id);
  if (!wrap) return;
  wrap.innerHTML = '';

  var input = document.createElement('input');
  input.type = 'text';
  input.className = 'combo-input';
  input.id = 'comboinput-' + id;
  input.dataset.id = id;
  input.dataset.value = currentVal || '';
  input.value = currentVal || '';
  input.placeholder = 'Type or select...';
  input.autocomplete = 'off';

  var arrow = document.createElement('span');
  arrow.className = 'combo-arrow';
  arrow.innerHTML = '&#9660;';

  var dropdown = document.createElement('div');
  dropdown.className = 'combo-dropdown';
  dropdown.id = 'combodrop-' + id;

  wrap.appendChild(input);
  wrap.appendChild(arrow);
  wrap.appendChild(dropdown);

  function renderOptions(filter) {
    var opts = comboOptions(id);
    var filtered = filter ? opts.filter(function(o){ return (o.toLowerCase().indexOf(filter.toLowerCase())>=0); }) : opts;
    var html = '';
    if (!filtered.length && filter) {
      html = '<div class="combo-option add-new" data-val="'+escH(filter)+'">' + escH(filter) + ' (add new)</div>';
    } else {
      filtered.forEach(function(o) {
        html += '<div class="combo-option" data-val="'+escH(o)+'">'+escH(o)+'</div>';
      });
      if (filter && filtered.indexOf(filter) === -1) {
        html += '<div class="combo-option add-new" data-val="'+escH(filter)+'">' + escH(filter) + ' (add new)</div>';
      }
    }
    dropdown.innerHTML = html || '<div class="combo-empty">No options</div>';
    dropdown.querySelectorAll('.combo-option').forEach(function(opt) {
      opt.addEventListener('mousedown', function(e) {
        e.preventDefault();
        var val = opt.dataset.val;
        if (opt.classList.contains('add-new')) {
          if (!comboCustomOptions[id]) comboCustomOptions[id] = [];
          if (comboCustomOptions[id].indexOf(val) === -1) {
            comboCustomOptions[id].push(val);
            saveComboOpts();
          }
        }
        input.value = val;
        input.dataset.value = val;
        dropdown.classList.remove('open');
        input.blur();
      });
    });
  }

  input.addEventListener('focus', function() {
    renderOptions(input.value);
    dropdown.classList.add('open');
  });
  input.addEventListener('input', function() {
    renderOptions(input.value);
    dropdown.classList.add('open');
  });
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      var val = input.value.trim();
      if (!val) return;
      if (!comboCustomOptions[id]) comboCustomOptions[id] = [];
      if (comboCustomOptions[id].indexOf(val) === -1 && !((COMBO_DEFAULTS[id]||[]).indexOf(val)>=0)) {
        comboCustomOptions[id].push(val);
        saveComboOpts();
        toast('Saved "' + val + '" for future use');
      }
      input.dataset.value = val;
      dropdown.classList.remove('open');
    } else if (e.key === 'Escape') {
      dropdown.classList.remove('open');
    }
  });
  input.addEventListener('blur', function() {
    setTimeout(function() { dropdown.classList.remove('open'); }, 150);
    input.dataset.value = input.value.trim();
  });
  arrow.addEventListener('mousedown', function(e) {
    e.preventDefault();
    if (dropdown.classList.contains('open')) {
      dropdown.classList.remove('open');
    } else {
      input.focus();
    }
  });
}

function comboGet(id) {
  var el = document.getElementById('comboinput-' + id);
  return el ? (el.dataset.value || el.value || '') : '';
}

function comboSet(id, val) {
  var el = document.getElementById('comboinput-' + id);
  if (el) { el.value = val || ''; el.dataset.value = val || ''; }
}

// Init all combos when a modal opens

function openModal(id) {
  // Show the modal - must override inline display:none
  var el = document.getElementById(id);
  if (el) {
    el.style.display = 'flex';
    el.classList.add('open');
  }
  // Init combo dropdowns after the modal is visible
  setTimeout(function() {
    if (id === 'modal-task') comboInit('task-category', comboGet('task-category'));
    if (id === 'modal-project') {
      replaceSelectWithCombo('project-system');
      replaceSelectWithCombo('project-status');
    }
    if (id === 'modal-po') {
      replaceSelectWithCombo('po-status');
      replaceSelectWithCombo('po-shipmethod');
    }
    if (id === 'modal-shipping') {
      replaceSelectWithCombo('ship-carrier');
      replaceSelectWithCombo('ship-status');
      // Re-apply carrier detection after combo init (timing fix)
      var tr = document.getElementById('ship-tracking');
      if (tr && tr.value) autoDetectCarrier(tr.value);
      // Clear detected badge when opening fresh
      var oldBadge = document.getElementById('carrier-detected-badge');
      if (oldBadge) oldBadge.remove();
    }
  }, 10);
}

function replaceSelectWithCombo(id) {
  var sel = document.getElementById(id);
  if (!sel || sel.dataset.comboreplaced) return;
  var currentVal = sel.value;
  var wrap = document.createElement('div');
  wrap.className = 'combo-wrap';
  wrap.id = 'combo-' + id;
  sel.parentNode.insertBefore(wrap, sel);
  sel.style.display = 'none';
  sel.dataset.comboreplaced = '1';
  comboInit(id, currentVal);
  // Proxy: keep original select value in sync
  var origInput = document.getElementById('comboinput-' + id);
  if (origInput) {
    origInput.addEventListener('blur', function() {
      sel.value = origInput.dataset.value || origInput.value || '';
    });
    // Watch for programmatic changes to select
    sel.addEventListener('change', function() {
      comboSet(id, sel.value);
    });
  }
}

// ═══════════════════════════════════════════════
//  RECENTLY VIEWED
// ═══════════════════════════════════════════════


function scheduleNextRecur(task) {
  if (!task.recur || !task.due) return;
  var due = new Date(task.due);
  var offsets = { daily:1, weekly:7, biweekly:14, monthly:30 };
  var days = offsets[task.recur] || 7;
  due.setDate(due.getDate() + days);
  var next = _merge({}, task, {
    id: genId(),
    status: 'todo',
    archived: false,
    due: due.toISOString().slice(0,10),
    createdAt: new Date().toISOString()
  });
  delete next.archived;
  addItem('tasks', next);
  addNotif('Recurring task created: ' + task.title, 'info', 'tasks', next.id);
}

// Patch updateItem to spawn next recurrence when task is marked done


// ─── AUTO-DETECT SHIPPING CARRIER ────────────────────────────────────────────

function getTrackingUrl(carrier, tracking) {
  if(!tracking) return '';
  var t = encodeURIComponent(tracking.trim());
  var urls = {
    'UPS':   'https://www.ups.com/track?tracknum=' + t,
    'FedEx': 'https://www.fedex.com/apps/fedextrack/?tracknumbers=' + t,
    'USPS':  'https://tools.usps.com/go/TrackConfirmAction?qtc_tLabels1=' + t,
    'DHL':   'https://www.dhl.com/en/express/tracking.html?AWB=' + t,
    'OnTrac':'https://www.ontrac.com/trackres.asp?tracking_number=' + t,
    'Other': ''
  };
  return urls[carrier] || '';
}

function detectCarrier(tracking) {
  if (!tracking) return '';
  var t = tracking.trim().toUpperCase().replace(/[\s\-]/g,'');
  // UPS: starts with 1Z (most reliable UPS indicator)
  if (/^1Z[A-Z0-9]{16}$/.test(t)) return 'UPS';
  // UPS additional formats
  if (/^(\d{9}|\d{26}|T\d{10})$/.test(t)) return 'UPS';
  // FedEx Express: 12 digits
  if (/^\d{12}$/.test(t)) return 'FedEx';
  // FedEx: 15, 20, 22 digits
  if (/^\d{15}$/.test(t) || /^\d{20}$/.test(t) || /^\d{22}$/.test(t)) return 'FedEx';
  // FedEx Ground 96 prefix
  if (/^96\d{18,22}$/.test(t)) return 'FedEx';
  // FedEx SmartPost 9261/9274
  if (/^(9261|9274)\d{16}$/.test(t)) return 'FedEx';
  // USPS Priority/First Class: starts with 94/93/92/91/90
  if (/^9[01234]\d{18,20}$/.test(t)) return 'USPS';
  // USPS with ZIP+4 prefix (420)
  if (/^420\d{22,26}$/.test(t)) return 'USPS';
  // USPS international: 2 letters + 9 digits + US
  if (/^[A-Z]{2}\d{9}US$/.test(t)) return 'USPS';
  // USPS 13-char international
  if (/^[A-Z]{2}\d{9}[A-Z]{2}$/.test(t)) return 'USPS';
  // DHL Express: starts with JD, or GM, or 10 digits
  if (/^(JD|GM|LX|RX)\d{16,18}$/.test(t)) return 'DHL';
  // DHL eCommerce: 10-11 digit numeric (only if nothing else matched)
  // OnTrac: C + 14 digits
  if (/^C\d{14}$/.test(t)) return 'OnTrac';
  // XPO: starts with numeric 10-digit or specific prefix
  if (/^\d{10}$/.test(t)) return 'Other';
  return '';
}

function autoDetectCarrier(val) {
  var detected = detectCarrier(val);
  if (!detected) return;
  // Update native select
  var sel = document.getElementById('ship-carrier');
  if (sel) sel.value = detected;
  // Update combobox if active (may not exist yet if modal just opened)
  var comboInput = document.getElementById('comboinput-ship-carrier');
  if (comboInput) {
    comboInput.value = detected;
    comboInput.dataset.value = detected;
  }
  // Visual badge on the tracking field
  var badge = document.getElementById('carrier-detected-badge');
  if (!badge) {
    var wrap = document.querySelector('#ship-tracking').parentNode;
    badge = document.createElement('span');
    badge.id = 'carrier-detected-badge';
    badge.style.cssText = 'position:absolute;top:-20px;right:0;font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;background:rgba(16,185,129,0.15);color:#34d399;border:1px solid rgba(16,185,129,0.3);white-space:nowrap;pointer-events:none';
    if (wrap) { wrap.style.position='relative'; wrap.appendChild(badge); }
  }
  if (badge) badge.textContent = detected + ' detected';
}

// ═══════════════════════════════════════════════════════════════════
//  HAPTIC FEEDBACK
// ═══════════════════════════════════════════════════════════════════

function archiveProject(id) {
  var p = state.projects.find(function(x){return x.id===id;});
  if(!p) return;
  updateItem('projects', id, _merge({}, p, {archived: true}));
  renderProjects();
  toast('Project archived');
}

function unarchiveProject(id) {
  var p = state.projects.find(function(x){return x.id===id;});
  if(!p) return;
  updateItem('projects', id, _merge({}, p, {archived: false}));
  renderProjects();
  toast('Project restored');
}

function archivePO(id) {
  var p = state.pos.find(function(x){return x.id===id;});
  if(!p) return;
  updateItem('pos', id, _merge({}, p, {archived: true}));
  renderPOs();
  toast('PO archived');
}

function unarchivePO(id) {
  var p = state.pos.find(function(x){return x.id===id;});
  if(!p) return;
  updateItem('pos', id, _merge({}, p, {archived: false}));
  renderPOs();
  toast('PO restored');
}

function archiveShipment(id) {
  var s = state.shipping.find(function(x){return x.id===id;});
  if(!s) return;
  updateItem('shipping', id, _merge({}, s, {archived: true}));
  renderShipping();
  toast('Shipment archived');
}

function unarchiveShipment(id) {
  var s = state.shipping.find(function(x){return x.id===id;});
  if(!s) return;
  updateItem('shipping', id, _merge({}, s, {archived: false}));
  renderShipping();
  toast('Shipment restored');
}

function softDeletePO(id) {
  var p = state.pos.find(function(x){return x.id===id;});
  if(!p) return;
  confirmInline('Delete this PO?', function(){
    softDelete('pos', id, (p.number||p.vendor||'PO'));
    renderPOs();
  });
}

function softDeleteShipment(id) {
  var s = state.shipping.find(function(x){return x.id===id;});
  if(!s) return;
  confirmInline('Delete this shipment?', function(){
    softDelete('shipping', id, (s.desc||s.tracking||'Shipment'));
    renderShipping();
  });
}

function softDeleteTask(id) {
  var t = state.tasks.find(function(x){return x.id===id;});
  if(!t) return;
  confirmInline('Delete permanently?', function(){
    softDelete('tasks', id, t.title||'Task');
    renderTasks();
  });
}

function saveTemplates() { localStorage.setItem('fop_templates', JSON.stringify(taskTemplates)); }

function applyTemplate(templateId, projectId) {
  var tmpl = taskTemplates.find(function(t){ return t.id === templateId; });
  if (!tmpl) return;
  var added = 0;
  tmpl.tasks.forEach(function(taskDef) {
    addItem('tasks', _merge({}, taskDef, { id: genId(), project: projectId||'', createdAt: new Date().toISOString() }));
    added++;
  });
  toast(added + ' tasks added from "' + tmpl.name + '"');
  haptic('medium');
  closeModal('modal-templates');
  if (currentView === 'tasks') renderTasks();
  renderDashboard();
}

function applyTemplateFromBtn(btn) {
  var tid = btn.dataset.tid;
  var sel = document.getElementById('proj-for-' + tid);
  applyTemplate(tid, sel ? sel.value : '');
}

function saveAsTemplate() {
  var name = (document.getElementById('new-template-name').value||'').trim();
  if (!name) { toast('Enter a template name'); return; }
  var checked = document.querySelectorAll('.template-save-cb:checked');
  if (!checked.length) { toast('Select at least one task'); return; }
  var tasks = [];
  checked.forEach(function(cb) {
    var t = state.tasks.find(function(x){ return x.id === cb.dataset.id; });
    if (t) tasks.push({ title:t.title, priority:t.priority, category:t.category, status:'todo' });
  });
  taskTemplates.push({ id: genId(), name: name, tasks: tasks });
  saveTemplates();
  toast('Template saved with ' + tasks.length + ' tasks');
  haptic('light');
  renderTemplateModal();
}

function deleteTemplate(id) {
  if (!confirm('Delete this template?')) return;
  taskTemplates = taskTemplates.filter(function(t){ return t.id !== id; });
  saveTemplates();
  renderTemplateModal();
}

function bulkSelectAll(checked) {
  var checkboxes = document.querySelectorAll('.task-bulk-cb');
  checkboxes.forEach(function(cb) {
    cb.checked = checked;
    if (checked) bulkSelected.add(cb.dataset.id);
    else bulkSelected.delete(cb.dataset.id);
  });
  updateBulkBar();
}

function toggleBulkSelect(id, checked) {
  if (checked) bulkSelected.add(id);
  else bulkSelected.delete(id);
  updateBulkBar();
}

function updateBulkBar() {
  var bar = document.getElementById('bulk-action-bar');
  if (!bar) return;
  if (bulkSelected.count() > 0) {
    bar.style.display = 'flex';
    bar.querySelector('#bulk-count').textContent = bulkSelected.count() + ' selected';
  } else {
    bar.style.display = 'none';
  }
}

function bulkAction(action) {
  if (!bulkSelected.count()) return;
  var ids = true ? (function(){ var a=[]; bulkSelected.forEach(function(v){a.push(v);}); return a; })() : (function(){ var a=[]; bulkSelected.forEach(function(v){ a.push(v); }); return a; })();
  if (action === 'archive') {
    ids.forEach(function(id) {
      var t = state.tasks.find(function(x){return x.id===id;});
      if (t) updateItem('tasks', id, _merge({}, t, {archived: true}));
    });
    toast(ids.length + ' tasks archived');
  } else if (action === 'done') {
    ids.forEach(function(id) {
      var t = state.tasks.find(function(x){return x.id===id;});
      if (t) updateItem('tasks', id, _merge({}, t, {status: 'done', archived: false}));
    });
    toast(ids.length + ' tasks marked done');
  } else if (action === 'delete') {
    if (!confirm('Permanently delete ' + ids.length + ' tasks?')) return;
    ids.forEach(function(id){ deleteItem('tasks', id); });
    toast(ids.length + ' tasks deleted');
  }
  bulkSelected.clear();
  renderTasks();
}

// ═══════════════════════════════════════════════
//  BARCODE / QR SCANNER
// ═══════════════════════════════════════════════


function startBarcodeScan() {
  var overlay = document.getElementById('barcode-overlay');
  if (!overlay) return;
  overlay.style.display = 'flex';
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    toast('Camera not available on this device');
    overlay.style.display = 'none';
    return;
  }
  navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
    .then(function(stream) {
      barcodeStream = stream;
      var video = document.getElementById('barcode-video');
      video.srcObject = stream;
      video.play();
      scanBarcode(video);
    })
    .catch(function() {
      toast('Camera permission denied');
      overlay.style.display = 'none';
    });
}

function scanBarcode(video) {
  if (!window.BarcodeDetector) {
    // Fallback: manual entry
    var overlay = document.getElementById('barcode-overlay');
    var manual = document.getElementById('barcode-manual');
    if (manual) manual.style.display = 'block';
    return;
  }
  var detector = new BarcodeDetector({ formats: ['code_128','code_39','qr_code','data_matrix','ean_13'] });
  var scan = function() {
    if (!barcodeStream) return;
    detector.detect(video).then(function(codes) {
      if (codes.length > 0) {
        var val = codes[0].rawValue;
        closeBarcodeScanner();
        document.getElementById('ship-tracking').value = val;
        toast('Scanned: ' + val);
      } else {
        requestAnimationFrame(scan);
      }
    }).catch(function(){ requestAnimationFrame(scan); });
  };
  video.addEventListener('loadeddata', scan);
}

function closeBarcodeScanner() {
  if (barcodeStream) {
    barcodeStream.getTracks().forEach(function(t){ t.stop(); });
    barcodeStream = null;
  }
  var overlay = document.getElementById('barcode-overlay');
  if (overlay) overlay.style.display = 'none';
}
