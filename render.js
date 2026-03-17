// FieldOps Pro — Render Functions
// All view rendering, filters, kanban, dashboard


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

function renderDashboard() {
  if (window.innerWidth <= 768 && currentView === 'dashboard') {
    renderThingsHome();
  }
  try { updateTabBadges(); } catch(e) {}
  var openTasks = state.tasks.filter(function(t){return t.status!=='done';});
  var highTasks = openTasks.filter(function(t){return t.priority==='high';}).length;
  var inTransit = state.shipping.filter(function(s){return s.status==='transit'||s.status==='out';}).length;
  var totalPO = state.pos.reduce(function(a,p){return a+parseFloat(p.total||0);},0);

  animateCount('stat-projects',state.projects.length);
  animateCount('stat-tasks',openTasks.length);
  document.getElementById('stat-tasks-sub').textContent = highTasks+' high priority';
  animateCount('stat-pos',state.pos.length);
  document.getElementById('stat-pos-sub').textContent = state.pos.length + ' purchase orders';
  animateCount('stat-shipping',state.shipping.length);
  updateOverdueBadge();
  document.getElementById('stat-ship-sub').textContent = inTransit+' in transit';

  document.getElementById('badge-projects').textContent = state.projects.length;
  document.getElementById('badge-tasks').textContent = openTasks.length;
  document.getElementById('badge-pos').textContent = state.pos.filter(function(p){return p.status!=='received'&&p.status!=='cancelled';}).length;
  document.getElementById('badge-shipping').textContent = inTransit;

  // Due date alerts
  var today = new Date(); today.setHours(0,0,0,0);
  var overdue = openTasks.filter(function(t){return t.due && new Date(t.due)<today && !t.archived;});
    var dueSoon = openTasks.filter(function(t){ if(!t.due||t.archived) return false; var d=new Date(t.due); return d>=today && d<=new Date(today.getTime()+3*86400000); });
  var alertEl = document.getElementById('dash-due-alerts');
  if (alertEl) {
    if (overdue.length || dueSoon.length) {
      alertEl.style.display = 'block';
      var aH='';if(overdue.length)aH+='<div style="padding:8px 12px;background:rgba(239,68,68,0.12);border-radius:10px;margin-bottom:6px;color:#f87171;font-weight:600">'+overdue.length+' overdue task'+(overdue.length>1?'s':'')+'</div>';if(dueSoon.length)aH+='<div style="padding:8px 12px;background:rgba(251,191,36,0.1);border-radius:10px;margin-bottom:6px;color:#fbbf24;font-weight:600">'+dueSoon.length+' due soon</div>';alertEl.innerHTML=aH;alertEl.style.display=aH?'block':'none';
    } else {
      alertEl.style.display = 'none';
    }
  }

  // Recent tasks
  var dt = document.getElementById('dash-tasks');
  var recent = openTasks.filter(function(t){return !t.archived;}).slice(-5).reverse();
  if(!recent.length) { dt.innerHTML='<div class="empty-state"><p>No open tasks</p></div>'; }
  else {
    dt.innerHTML='';
    recent.forEach(function(t){
      var d=document.createElement('div');
      d.style.cssText='display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.05);cursor:pointer';
      d.innerHTML='<div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:600;color:#f0f4ff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+escH(t.title)+'</div><div style="font-size:11px">'+fmtDateSmart(t.due)+'</div></div>'+statusBadge(t.status);
      (function(tid){d.addEventListener('click',function(){switchView('tasks');setTimeout(function(){openDetail('tasks',tid);},100);});
      d.addEventListener('touchend',function(e){e.preventDefault();switchView('tasks');setTimeout(function(){openDetail('tasks',tid);},100);});})(t.id);
      dt.appendChild(d);
    });
  }

  // Shipping
  var ds = document.getElementById('dash-shipping');
  var active = state.shipping.filter(function(s){return s.status!=='delivered';}).slice(-5).reverse();
  if(!active.length) { ds.innerHTML='<div class="empty-state"><p>No active shipments</p></div>'; }
  if(!active.length) { ds.innerHTML='<div class="empty-state"><p>No active shipments</p></div>'; }
  else {
    ds.innerHTML='';
    active.forEach(function(s){
      var d=document.createElement('div');
      d.style.cssText='display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);cursor:pointer';
      d.innerHTML='<div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:600;color:#f0f4ff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+escH(s.desc||s.tracking||'Shipment')+'</div><div style="font-size:11px;color:#4a5e7a">'+escH(s.carrier||'')+'</div></div>'+statusBadge(s.status);
      (function(sid){d.addEventListener('click',function(){switchView('shipping');setTimeout(function(){openDetail('shipping',sid);},100);});
      d.addEventListener('touchend',function(e){e.preventDefault();switchView('shipping');setTimeout(function(){openDetail('shipping',sid);},100);});})(s.id);
      ds.appendChild(d);
    });
  }
}

// ═══════════════════════════════════════════════
//  PROJECTS
// ═══════════════════════════════════════════════


function filterProjects(f, el) {
  projectFilter = f;
  document.querySelectorAll('#view-projects .tab').forEach(function(t){t.classList.remove('active');});
  el.classList.add('active');
  renderProjects();
}

function renderProjects() {
  var data=state.projects.slice();
  if(projectFilter==='archived') {
    data=data.filter(function(p){return p.archived;});
  } else if(projectFilter==='all') {
    data=data.filter(function(p){return !p.archived;});
  } else {
    data=data.filter(function(p){return p.status===projectFilter && !p.archived;});
  }
  var el=document.getElementById('projects-list');
  if(!data.length){el.innerHTML=buildEmptyState('X','rgba(79,142,247,0.12)','No projects yet','Tap + Add to create your first project.');return;}
  var sC={active:'#10b981',planning:'#3b82f6','on-hold':'#fbbf24',completed:'#64748b'};
  el.innerHTML='';var wrap=document.createElement('div');wrap.className='grid-2';
  data.forEach(function(p){
    var tasks=state.tasks.filter(function(t){return t.project===p.id;}),done=tasks.filter(function(t){return t.status==='done';}).length,pct=tasks.length?Math.round(done/tasks.length*100):0,bc=sC[p.status]||'#3b82f6',health=projectHealth(p);
    var card=document.createElement('div');card.className='card';card.style.cssText='cursor:pointer;border-left:4px solid '+bc+' !important';
    card.innerHTML='<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px"><div>'
      +'<div style="font-weight:700;font-size:16px;margin-bottom:4px"><span style="width:9px;height:9px;border-radius:50%;background:'+health.color+';display:inline-block;margin-right:7px;vertical-align:middle"></span>'+escH(p.name)+'</div>'
      +'<div style="font-size:12px;color:#64748b">'+escH(p.client||'No client')+(p.location?' &middot; '+escH(p.location):'')+' </div></div>'+statusBadge(p.status)+'</div>'
      +(p.system?'<div style="margin-bottom:10px"><span class="badge badge-cyan">&#x26A1; '+escH(p.system)+'</span></div>':'')
      +'<div style="display:flex;gap:16px;margin-bottom:12px;font-size:12px;color:#64748b"><span>'+escH(fmtDate(p.start)||'—')+'</span><span>'+escH(fmtDate(p.end)||'—')+'</span></div>'
      +'<div style="margin-bottom:8px;display:flex;justify-content:space-between;font-size:12px;color:#64748b"><span>Tasks: '+done+'/'+tasks.length+'</span><span>'+pct+'%</span></div>'
      +'<div class="progress-bar"><div class="progress-fill" style="width:'+pct+'%"></div></div>'
      +(p.archived
      ? ('<div style="display:flex;gap:8px;margin-top:12px">'
         +'<button class="btn btn-ghost btn-sm" style="font-size:11px;color:#10b981;border-color:rgba(16,185,129,0.4)" data-restore="1">Restore</button>'
         +'<button class="btn btn-danger btn-sm" style="font-size:11px" data-delete="1">Delete</button>'
         +'</div>')
      : ('<div style="display:flex;gap:8px;margin-top:12px">'
         +'<button class="btn btn-ghost btn-sm" style="font-size:11px;color:#f59e0b;border-color:rgba(245,158,11,0.4)" data-archive="1">Archive</button>'
         +'</div>'));
    (function(pid,pn,isArch){
      card.onclick = function(e) {
        var t=e.target;
        while(t && t!==card){if(t.tagName==='BUTTON')return;t=t.parentNode;}
        if(!isArch) editProject(pid);
      };
      var btns=card.querySelectorAll('button');
      for(var bi=0;bi<btns.length;bi++){
        (function(btn){
          btn.onclick=function(e){
            e.stopPropagation();
            if(btn.dataset.archive) archiveProject(pid);
            else if(btn.dataset.restore) unarchiveProject(pid);
            else if(btn.dataset.delete) { confirmInline('Delete permanently?', function(){ deleteItem('projects',pid); renderProjects(); }); }
          };
        })(btns[bi]);
      }
    })(p.id,p.name||'Project',!!p.archived);
    wrap.appendChild(card);
  });
  el.appendChild(wrap);
}

function filterTasks(f, el) {
  taskFilter = f;
  document.querySelectorAll('#view-tasks .tab').forEach(function(t){t.classList.remove('active');});
  el.classList.add('active');
  renderTasks();
}


function setTaskView(mode) {
  if(isMobile() && mode === 'kanban') mode = 'list';
  taskViewMode = mode;
  document.getElementById('tasks-list-view').style.display = mode==='list' ? '' : 'none';
  document.getElementById('tasks-kanban-view').style.display = mode==='kanban' ? '' : 'none';
  document.getElementById('task-view-list').className   = 'btn btn-sm ' + (mode==='list'   ? 'btn-primary' : 'btn-ghost');
  document.getElementById('task-view-kanban').className = 'btn btn-sm ' + (mode==='kanban' ? 'btn-primary' : 'btn-ghost');
  renderTasks();
}

function cycleTaskStatus(id, e) {
  e.stopPropagation();
  var task = state.tasks.find(function(t){return t.id===id;});
  if(!task) return;
  var cycle = ['todo','inprogress','done'];
  var next = cycle[(cycle.indexOf(task.status)+1) % cycle.length];
  updateItem('tasks', id, _merge({}, task, {status: next}));
  toast('Status: ' + next);
}

function archiveTask(id, e) {
  if(e) e.stopPropagation();
  var task = state.tasks.find(function(t){return t.id===id;});
  if(!task) return;
  updateItem('tasks', id, _merge({}, task, {archived: true}));
  haptic('medium');
  renderTasks();
  toast('Task archived');
}

function unarchiveTask(id, e) {
  if(e) e.stopPropagation();
  var task = state.tasks.find(function(t){return t.id===id;});
  if(!task) return;
  updateItem('tasks', id, _merge({}, task, {archived: false}));
  renderTasks();
  toast('Task restored');
}

function renderTasks() {
  var data = state.tasks.slice();
  if(taskFilter === 'archived') {
    data = data.filter(function(t){ return t.archived; });
  } else if(taskFilter === 'all') {
    data = data.filter(function(t){ return !t.archived; });
  } else if(taskFilter === 'active') {
    data = data.filter(function(t){ return (t.status === 'todo' || t.status === 'inprogress') && !t.archived; });
  } else {
    data = data.filter(function(t){ return t.status === taskFilter && !t.archived; });
  }
  if(taskProjectFilter) data = data.filter(function(t){ return t.project === taskProjectFilter; });
  
  if(isMobile()){
    var mWrap=document.getElementById('tasks-list-view');
    var mOld=document.getElementById('mob-tasks-cards');
    if(mOld) mOld.remove();
    var mList=document.createElement('div');
    mList.id='mob-tasks-cards';
    mList.style.cssText='padding:0 0 80px 0';
    var today3=new Date(); today3.setHours(0,0,0,0);
    for(var mi=0;mi<data.length;mi++){
      var mt=data[mi];
      var mOver=!!(mt.due&&!mt.archived&&new Date(mt.due)<today3&&mt.status!=='done');
      var card=document.createElement('div');
      card.style.cssText='background:rgba(255,255,255,0.04);border:1px solid '+(mOver?'rgba(239,68,68,0.4)':'rgba(255,255,255,0.09)')+';border-radius:14px;padding:14px 16px;margin-bottom:10px;cursor:pointer';
      card.innerHTML='<div style="font-size:15px;font-weight:700;color:#f0f4ff;margin-bottom:6px">'+escH(mt.title)+'</div>'
        +(mt.category?'<div style="font-size:11px;color:#4a5e7a;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.8px">'+escH(mt.category)+'</div>':'')
        +'<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px">'+priorityBadge(mt.priority)+statusBadge(mt.status)
        +(mt.project?'<span style="font-size:11px;color:#8da0c0;background:rgba(255,255,255,0.07);padding:2px 8px;border-radius:99px">'+escH(projectName(mt.project))+'</span>':'')
        +(mt.due?'<span style="font-size:11px;color:'+(mOver?'#ef4444':'#8da0c0')+';background:rgba(255,255,255,0.07);padding:2px 8px;border-radius:99px">'+escH(fmtDate(mt.due))+'</span>':'')
        +'</div>'
        +'<div style="display:flex;gap:8px;border-top:1px solid rgba(255,255,255,0.07);padding-top:10px">'
        +(mt.archived
          ? ('<button class="btn btn-ghost btn-sm" style="font-size:11px;color:#10b981;border-color:rgba(16,185,129,0.4)" data-restore="1">Restore</button>'
             +'<button class="btn btn-danger btn-sm" style="font-size:11px" data-delete="1">Delete</button>')
          : '<button class="btn btn-ghost btn-sm" style="font-size:11px;color:#f59e0b;border-color:rgba(245,158,11,0.4)" data-archive="1">Archive</button>')
        +'</div>';
      (function(tid,ttitle,isArch){
        var btns=card.querySelectorAll('button');
        for(var bi=0;bi<btns.length;bi++){(function(btn){
          btn.onclick=function(e){e.stopPropagation();
            if(btn.dataset.archive)archiveTask(tid,e);
            else if(btn.dataset.restore)unarchiveTask(tid,e);
            else if(btn.dataset.delete)confirmInline('Delete permanently?',function(){deleteItem('tasks',tid);renderTasks();});
          };
        })(btns[bi]);}
        card.onclick=function(e){var t=e.target;while(t&&t!==card){if(t.tagName==='BUTTON')return;t=t.parentNode;}if(!isArch)editTask(tid);};
      })(mt.id,mt.title||'Task',!!mt.archived);
      mList.appendChild(card);
    }
    var tWrap=document.querySelector('#tasks-list-view .table-wrap');
    if(tWrap) tWrap.style.display='none';
    if(mWrap) mWrap.appendChild(mList);
    return;
  }
  var mOldT=document.getElementById('mob-tasks-cards');
  if(mOldT){ mOldT.remove(); var tW2=document.querySelector('#tasks-list-view .table-wrap'); if(tW2) tW2.style.display=''; }
data.reverse();
  bulkSelected.clear();

  if(taskViewMode === 'kanban') { renderKanban(data); return; }

  var existingBar = document.getElementById('archive-bulk-bar');
  if(existingBar) existingBar.remove();
  if(taskFilter === 'archived' && data.length) {
    var bar = document.createElement('div');
    bar.id = 'archive-bulk-bar';
    bar.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:10px 16px;background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2);border-radius:12px;margin-bottom:12px';
    bar.innerHTML = '<span style="font-size:13px;color:#f59e0b;font-weight:600">Archived: '+data.length+' task'+(data.length!==1?'s':'')+'</span><button class="btn btn-danger btn-sm" onclick="bulkDeleteAllArchived()">Delete All</button>';
    var listView = document.getElementById('tasks-list-view');
    if(listView) listView.insertBefore(bar, listView.firstChild);
  }

  var tb = document.getElementById('tasks-tbody');
  if(!data.length) {
    tb.innerHTML = '<tr><td colspan="6">'+buildEmptyState(taskFilter==='archived'?'📦':'✓',taskFilter==='archived'?'rgba(245,158,11,0.12)':'rgba(16,185,129,0.12)',taskFilter==='archived'?'No archived tasks':'No tasks here',taskFilter==='archived'?'Archived tasks will appear here.':'Add a task using + Add or quick-add FAB.')+'</td></tr>';
    return;
  }

  var today2 = new Date(); today2.setHours(0,0,0,0);
  var html = '';
  for(var i=0; i<data.length; i++) {
    var t = data[i];
    var isOverdue = !!(t.due && !t.archived && new Date(t.due) < today2 && t.status !== 'done');
    var d2 = t.due ? new Date(t.due) : null;
    var isDueSoon = !!(d2 && !t.archived && !isOverdue && d2 >= today2 && d2 <= new Date(today2.getTime()+3*86400000));
    var rowAttrs = ' data-taskid="'+t.id+'" data-archived="'+(t.archived?1:0)+'"';
    if(t.archived) rowAttrs += ' style="opacity:0.55"';
    if(isOverdue) rowAttrs += ' class="task-overdue"';
    else if(isDueSoon) rowAttrs += ' class="task-due-soon"';
    html += '<tr'+rowAttrs+'>';
    html += '<td style="width:36px" onclick="event.stopPropagation()"><input type="checkbox" class="task-bulk-cb" data-id="'+t.id+'" style="width:16px;height:16px;cursor:pointer" onchange="toggleBulkSelect(this.dataset.id,this.checked)"></td>';
    html += '<td><div style="font-weight:600;color:#f0f4ff">'+escH(t.title)+'</div>'+(t.category?'<div style="font-size:11px;color:#4a5e7a;margin-top:2px">'+escH(t.category)+'</div>':'')+'</td>';
    html += '<td>'+(t.project?'<span style="font-size:12px;color:#8da0c0">'+escH(projectName(t.project))+'</span>':'<span style="color:#3a4a6a">-</span>')+'</td>';
    html += '<td>'+priorityBadge(t.priority)+'</td>';
    html += '<td onclick="event.stopPropagation()">';
    if(t.archived) html += '<span class="badge badge-gray" style="opacity:0.7">archived</span>';
    else html += '<button data-cid="'+t.id+'" onclick="cycleTaskStatus(this.dataset.cid,event)" style="background:none;border:none;cursor:pointer;padding:0">'+statusBadge(t.status)+'</button>';
    html += '</td>';
    html += '<td><span style="font-size:12px;color:'+(isOverdue?'#f87171':isDueSoon?'#fbbf24':'#4a5e7a')+'">'+escH(fmtDate(t.due))+'</span></td>';
    html += '<td onclick="event.stopPropagation()"><div style="display:flex;gap:5px">';
    if(t.archived) {
      html += '<button data-uid="'+t.id+'" class="btn btn-ghost btn-sm" title="Restore" style="color:#10b981;border-color:rgba(16,185,129,0.3)" onclick="unarchiveTask(this.dataset.uid,event)"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.43"/></svg></button>';
      html += '<button data-uid="'+t.id+'" class="btn btn-danger btn-sm" title="Delete" onclick="softDeleteTask(this.dataset.uid)"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg></button>';
    } else {
      html += '<button data-uid="'+t.id+'" class="btn btn-ghost btn-sm" title="Archive" style="color:#f59e0b;border-color:rgba(245,158,11,0.3)" onclick="archiveTask(this.dataset.uid,event)"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg></button>';
    }
    html += '</div></td></tr>';
  }
  tb.innerHTML = html;

  tb.onclick = null;
  tb.addEventListener('click', function(e) {
    // Walk up to find the row
    var el = e.target, row = null;
    while(el && el !== tb) {
      if(el.tagName === 'TR' && el.dataset && el.dataset.taskid) { row = el; break; }
      el = el.parentNode;
    }
    if(!row) return;
    // If click was on a button or input, let it handle itself
    var t = e.target;
    while(t && t !== row) {
      if(t.tagName === 'BUTTON' || t.tagName === 'INPUT') return;
      t = t.parentNode;
    }
    editTask(row.dataset.taskid);
  });

  var trows = tb.querySelectorAll('tr[data-taskid]');
  trows.forEach(function(row) {
    row.addEventListener('touchstart', function(e){ swipeStart(e, row); }, {passive:true});
    row.addEventListener('touchmove', function(e){ swipeMove(e, row); }, {passive:false});
    row.addEventListener('touchend', function(e){ swipeEnd(e, row, row.dataset.taskid, row.dataset.archived==='1'?'archived':'active'); });
  });
}

function buildEmptyState(icon, bgColor, title, sub) {
  return '<div class="empty-state-fancy">'
    + '<div class="es-icon" style="background:'+bgColor+'">'+icon+'</div>'
    + '<div class="es-title">'+escH(title)+'</div>'
    + '<div class="es-sub">'+escH(sub)+'</div>'
    + '</div>';
}

function confirmDeleteTask(id) {
  if(confirm('Delete permanently?')) { deleteItem('tasks',id); renderTasks(); toast('Deleted'); }
}

function bulkDeleteAllArchived() {
  confirmInline('Delete all archived tasks?', function(){
    state.tasks.filter(function(t){return t.archived;}).forEach(function(t){deleteItem('tasks',t.id);});
    renderTasks();
    toast('Cleared archive');
  });
}

function onTaskDragStart(e, taskId) {
  dragTaskId = taskId;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', taskId);
  setTimeout(function(){e.target.style.opacity='0.4';}, 0);
}

function onTaskDragEnd(e) {
  e.target.style.opacity = '';
  document.querySelectorAll('.kanban-col').forEach(function(col) {
    col.classList.remove('drag-over');
    col.style.borderColor = col.dataset.border;
  });
}

function onColDragOver(e, colEl) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  document.querySelectorAll('.kanban-col').forEach(function(c) {
    c.classList.remove('drag-over');
    c.style.borderColor = c.dataset.border;
  });
  colEl.classList.add('drag-over');
  colEl.style.borderColor = 'rgba(79,142,247,0.6)';
}

function onColDragLeave(e, colEl) {
  if (!colEl.contains(e.relatedTarget)) {
    colEl.classList.remove('drag-over');
    colEl.style.borderColor = colEl.dataset.border;
  }
}

function onColDrop(e, status) {
  e.preventDefault();
  var id = dragTaskId || e.dataTransfer.getData('text/plain');
  if (!id) return;
  var task = state.tasks.find(function(t){return t.id===id;});
  if (!task || task.status === status) return;
  updateItem('tasks', id, _merge({}, task, { status }));
  toast('Moved to ' + { todo:'To Do', inprogress:'In Progress', done:'Done' }[status]);
  dragTaskId = null;
}


function onTaskTouchStart(e, taskId) {
  touchTaskId = taskId;
  touchDragEl = e.currentTarget;
  var rect = touchDragEl.getBoundingClientRect();
  touchClone = touchDragEl.cloneNode(true);
  touchClone.style.cssText = 'position:fixed;top:'+rect.top+'px;left:'+rect.left+'px;width:'+rect.width+'px;opacity:0.85;pointer-events:none;z-index:9999;';
  document.body.appendChild(touchClone);
  touchDragEl.style.opacity = '0.3';
}

function onTaskTouchMove(e) {
  if (!touchClone) return;
  e.preventDefault();
  var t = e.touches[0];
  var rect = touchClone.getBoundingClientRect();
  touchClone.style.left = (t.clientX - rect.width/2) + 'px';
  touchClone.style.top  = (t.clientY - rect.height/2) + 'px';
  // Highlight drop target
  touchClone.style.display = 'none';
  var el = document.elementFromPoint(t.clientX, t.clientY);
  touchClone.style.display = '';
  document.querySelectorAll('.kanban-col').forEach(function(c) {
    c.style.borderColor = c.dataset.border;
    c.style.background = c.dataset.bg;
  });
  var col = el && el.closest('.kanban-col');
  if (col) {
    col.style.borderColor = 'rgba(79,142,247,0.7)';
    col.style.background = 'rgba(79,142,247,0.1)';
  }
}

function onTaskTouchEnd(e) {
  if (!touchClone) return;
  var t = e.changedTouches[0];
  touchClone.style.display = 'none';
  var el = document.elementFromPoint(t.clientX, t.clientY);
  touchClone.style.display = '';
  var col = el && el.closest('.kanban-col');
  if (col && touchTaskId) {
    var status = col.dataset.status;
    var task = state.tasks.find(function(t){return t.id===touchTaskId;});
    if (task && task.status !== status) {
      updateItem('tasks', touchTaskId, _merge({}, task, { status }));
      toast('Moved to ' + { todo:'To Do', inprogress:'In Progress', done:'Done' }[status]);
    }
  }
  document.body.removeChild(touchClone);
  if (touchDragEl) touchDragEl.style.opacity = '';
  touchClone = null; touchDragEl = null; touchTaskId = null;
  document.querySelectorAll('.kanban-col').forEach(function(c) {
    c.style.borderColor = c.dataset.border;
    c.style.background = c.dataset.bg;
  });
}

function filterPOs(f,el){
  poFilter=f;
  document.querySelectorAll('#view-pos .tab').forEach(function(t){t.classList.remove('active');});
  el.classList.add('active'); renderPOs();
}

function confirmDeletePO(id) {
  if(confirm('Delete this PO?')) { deleteItem('pos',id); renderPOs(); toast('PO deleted'); }
}

function confirmDeleteShipment(id) {
  if(confirm('Delete this shipment?')) { deleteItem('shipping',id); renderShipping(); toast('Deleted'); }
}

function renderPOs() {
  var data = state.pos.slice();
  if(poFilter==='archived') {
    data=data.filter(function(p){return p.archived;});
  } else if(poFilter==='all') {
    data=data.filter(function(p){return !p.archived;});
  } else {
    data=data.filter(function(p){return p.status===poFilter && !p.archived;});
  }
  var tb = document.getElementById('pos-tbody');
  if(!data.length){tb.innerHTML='<tr><td colspan="8">'+buildEmptyState('📄','rgba(245,158,11,0.12)','No purchase orders','Create a PO to track vendor orders and approvals.')+'</td></tr>';return;}
  
  if(isMobile()){
    var mWrap=document.getElementById('view-pos');
    var mTableWrap=mWrap ? mWrap.querySelector('.table-wrap') : null;
    var mOld=document.getElementById('mob-pos-cards');
    if(mOld) mOld.remove();
    var mList=document.createElement('div');
    mList.id='mob-pos-cards';
    mList.style.cssText='padding:0 0 80px 0';
    for(var mi=0;mi<data.length;mi++){
      var mp=data[mi];
      var mitems=(mp.items||'').split('\n').filter(Boolean).length;
      var card=document.createElement('div');
      card.style.cssText='background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.09);border-radius:14px;padding:14px 16px;margin-bottom:10px;cursor:pointer';
      card.innerHTML='<div style="font-size:15px;font-weight:700;color:#f0f4ff;margin-bottom:6px">'+(mp.number?'<span style="color:#3b82f6">'+escH(mp.number)+'</span> — ':'')+escH(mp.vendor||'PO')+'</div>'
        +'<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px">'+statusBadge(mp.status)
        +(mp.project?'<span style="font-size:11px;color:#8da0c0;background:rgba(255,255,255,0.07);padding:2px 8px;border-radius:99px">'+escH(projectName(mp.project))+'</span>':'')
        +'</div>'
        +(mitems?'<div style="font-size:12px;color:#8da0c0;margin-bottom:4px">'+mitems+' line item'+(mitems!==1?'s':'')+'</div>':'')
        +(mp.date?'<div style="font-size:12px;color:#4a5e7a;margin-bottom:10px">Date: '+escH(fmtDate(mp.date))+'</div>':'')
        +'<div style="display:flex;gap:8px;border-top:1px solid rgba(255,255,255,0.07);padding-top:10px">'
        +(mp.archived
          ? ('<button class="btn btn-ghost btn-sm" style="font-size:11px;color:#10b981;border-color:rgba(16,185,129,0.4)" data-restore="1">Restore</button>'
             +'<button class="btn btn-danger btn-sm" style="font-size:11px" data-delete="1">Delete</button>')
          : '<button class="btn btn-ghost btn-sm" style="font-size:11px;color:#f59e0b;border-color:rgba(245,158,11,0.4)" data-archive="1">Archive</button>')
        +'</div>';
      (function(pid,isArch){
        var btns=card.querySelectorAll('button');
        for(var bi=0;bi<btns.length;bi++){(function(b2){
          b2.onclick=function(e){e.stopPropagation();
            if(b2.dataset.archive)archivePO(pid);
            else if(b2.dataset.restore)unarchivePO(pid);
            else if(b2.dataset.delete)confirmInline('Delete permanently?',function(){deleteItem('pos',pid);renderPOs();});
          };
        })(btns[bi]);}
        card.onclick=function(e){var t=e.target;while(t&&t!==card){if(t.tagName==='BUTTON')return;t=t.parentNode;}if(!isArch)editPO(pid);};
      })(mp.id,!!mp.archived);
      mList.appendChild(card);
    }
    var tWrap=document.querySelector('#view-pos .table-wrap');
    if(tWrap) tWrap.style.display='none';
    if(mWrap) mWrap.appendChild(mList);
    return;
  }
  var mOldP=document.getElementById('mob-pos-cards');
  if(mOldP){ mOldP.remove(); var pW2=document.querySelector('#view-pos .table-wrap'); if(pW2) pW2.style.display=''; }
data.reverse();
  var html = '';
  for(var i=0;i<data.length;i++){
    var p=data[i];
    var items=(p.items||'').split('\n').filter(Boolean).length;
    html += '<tr data-poid="'+p.id+'" data-col="pos" class="swipe-row">';
    html += '<td><span style="font-size:12px;color:#3b82f6">'+escH(p.number||'-')+'</span></td>';
    html += '<td><span style="font-weight:600;color:#f0f4ff">'+escH(p.vendor||'-')+'</span></td>';
    html += '<td><span style="font-size:12px;color:#8da0c0">'+(p.project?escH(projectName(p.project)):'-')+'</span></td>';
    html += '<td><span style="font-size:12px;color:#8da0c0">'+items+' line items</span></td>';
    html += '<td>'+statusBadge(p.status)+'</td>';
    html += '<td><span style="font-size:12px;color:#4a5e7a">'+escH(fmtDate(p.date))+'</span></td>';
    html += '<td onclick="event.stopPropagation()"><div style="display:flex;gap:6px">';
    if(p.archived) {
      html += '<button data-uid="'+p.id+'" class="btn btn-ghost btn-sm" style="color:#10b981;border-color:rgba(16,185,129,0.3)" onclick="unarchivePO(this.dataset.uid)">Restore</button>';
      html += '<button data-uid="'+p.id+'" class="btn btn-danger btn-sm" onclick="confirmInline(\'Delete permanently?\',function(){deleteItem(\'pos\',' + JSON.stringify(p.id) + ');renderPOs();})">Delete</button>';
    } else {
      html += '<button data-uid="'+p.id+'" class="btn btn-ghost btn-sm" style="color:#f59e0b;border-color:rgba(245,158,11,0.3)" onclick="archivePO(this.dataset.uid)">Archive</button>';
    }
    html += '</div></td></tr>';
  }
  tb.innerHTML = html;
  tb.onclick = null;
  tb.addEventListener('click', function(e){
    var el=e.target, row=null;
    while(el && el!==tb){if(el.tagName==='TR'&&el.dataset&&el.dataset.poid){row=el;break;}el=el.parentNode;}
    if(!row) return;
    var t=e.target;
    while(t&&t!==row){if(t.tagName==='BUTTON')return;t=t.parentNode;}
    editPO(row.dataset.poid);
  });
  attachRowSwipe(tb, 'pos', 'poid');
}

function filterShipping(f,el){
  shipFilter=f;
  document.querySelectorAll('#view-shipping .tab').forEach(function(t){t.classList.remove('active');});
  el.classList.add('active'); renderShipping();
}

function renderShipping() {
  var data=state.shipping.slice();
  if(shipFilter==='archived') {
    data=data.filter(function(s){return s.archived;});
  } else if(shipFilter==='transit') {
    data=data.filter(function(s){return (s.status==='transit'||s.status==='out') && !s.archived;});
  } else if(shipFilter==='all') {
    data=data.filter(function(s){return !s.archived;});
  } else {
    data=data.filter(function(s){return s.status===shipFilter && !s.archived;});
  }
  var tb=document.getElementById('shipping-tbody');
  if(!data.length){tb.innerHTML='<tr><td colspan="7">'+buildEmptyState('📦','rgba(16,185,129,0.12)','No shipments','Add a shipment to track deliveries — tracking number is optional.')+'</td></tr>';return;}
  
  if(isMobile()){
    var mWrap=document.getElementById('view-shipping');
    var mTableWrap=mWrap ? mWrap.querySelector('.table-wrap') : null;
    var mOld=document.getElementById('mob-shipping-cards');
    if(mOld) mOld.remove();
    var mList=document.createElement('div');
    mList.id='mob-shipping-cards';
    mList.style.cssText='padding:0 0 80px 0';
    for(var mi=0;mi<data.length;mi++){
      var ms=data[mi];
      var card=document.createElement('div');
      card.style.cssText='background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.09);border-radius:14px;padding:14px 16px;margin-bottom:10px;cursor:pointer';
      card.innerHTML='<div style="font-size:15px;font-weight:700;color:#f0f4ff;margin-bottom:6px">'+escH(ms.desc||ms.tracking||'Shipment')+'</div>'
        +'<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px">'+statusBadge(ms.status)
        +(ms.carrier?'<span style="font-size:11px;color:#8da0c0;background:rgba(255,255,255,0.07);padding:2px 8px;border-radius:99px">'+escH(ms.carrier)+'</span>':'')
        +'</div>'
        +(ms.tracking?'<div style="font-size:12px;color:#4f8ef7;margin-bottom:4px">'+escH(ms.tracking)+'</div>':'')
        +(ms.po?'<div style="font-size:12px;color:#8da0c0;margin-bottom:4px">PO: '+escH(poName(ms.po))+'</div>':'')
        +(ms.eta?'<div style="font-size:12px;color:#4a5e7a;margin-bottom:10px">ETA: '+escH(fmtDate(ms.eta))+'</div>':'')
        +'<div style="display:flex;gap:8px;border-top:1px solid rgba(255,255,255,0.07);padding-top:10px">'
        +(ms.archived
          ? ('<button class="btn btn-ghost btn-sm" style="font-size:11px;color:#10b981;border-color:rgba(16,185,129,0.4)" data-restore="1">Restore</button>'
             +'<button class="btn btn-danger btn-sm" style="font-size:11px" data-delete="1">Delete</button>')
          : '<button class="btn btn-ghost btn-sm" style="font-size:11px;color:#f59e0b;border-color:rgba(245,158,11,0.4)" data-archive="1">Archive</button>')
        +(ms.tracking && ms.carrier && getTrackingUrl(ms.carrier,ms.tracking)
          ? '<a href="'+getTrackingUrl(ms.carrier,ms.tracking)+'" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;padding:4px 10px;border-radius:8px;font-size:11px;font-weight:600;background:rgba(79,142,247,0.15);color:#4f8ef7;border:1px solid rgba(79,142,247,0.3);text-decoration:none;margin-left:auto">Track &#x2197;</a>'
          : '')
        +'</div>';
      (function(sid,isArch){
        var btns=card.querySelectorAll('button');
        for(var bi=0;bi<btns.length;bi++){(function(b2){
          b2.onclick=function(e){e.stopPropagation();
            if(b2.dataset.archive)archiveShipment(sid);
            else if(b2.dataset.restore)unarchiveShipment(sid);
            else if(b2.dataset.delete)confirmInline('Delete permanently?',function(){deleteItem('shipping',sid);renderShipping();});
          };
        })(btns[bi]);}
        card.onclick=function(e){var t=e.target;while(t&&t!==card){if(t.tagName==='BUTTON'||t.tagName==='A')return;t=t.parentNode;}if(!isArch)editShipment(sid);};
      })(ms.id,!!ms.archived);
      mList.appendChild(card);
    }
    var tWrap=document.querySelector('#view-shipping .table-wrap');
    if(tWrap) tWrap.style.display='none';
    if(mWrap) mWrap.appendChild(mList);
    return;
  }
  var mOldS=document.getElementById('mob-shipping-cards');
  if(mOldS){ mOldS.remove(); var sW2=document.querySelector('#view-shipping .table-wrap'); if(sW2) sW2.style.display=''; }
data.reverse();
  var html='';
  for(var i=0;i<data.length;i++){
    var s=data[i];
    html+='<tr data-shid="'+s.id+'" data-col="shipping" class="swipe-row">';
    html+='<td><span style="font-size:12px;color:#4f8ef7">'+escH(s.tracking||'-')+'</span></td>';
    html+='<td><span style="font-weight:600;color:#f0f4ff">'+escH(s.desc||'-')+'</span></td>';
    html+='<td><span style="font-size:12px;font-weight:600;color:#8da0c0">'+escH(s.carrier||'-')+'</span></td>';
    html+='<td><span style="font-size:12px;color:#8da0c0">'+(s.po?escH(poName(s.po)):'-')+'</span></td>';
    html+=statusBadge(s.status)+'</td>';
    html+='<td><span style="font-size:12px;color:#4a5e7a">'+escH(fmtDate(s.eta))+'</span></td>';
    html+='<td onclick="event.stopPropagation()"><div style="display:flex;gap:6px">';
    if(s.archived) {
      html+='<button data-uid="'+s.id+'" class="btn btn-ghost btn-sm" style="color:#10b981;border-color:rgba(16,185,129,0.3)" onclick="unarchiveShipment(this.dataset.uid)">Restore</button>';
      html+='<button data-uid="'+s.id+'" class="btn btn-danger btn-sm" onclick="confirmInline(\'Delete permanently?\',function(){deleteItem(\'shipping\',' + JSON.stringify(s.id) + ');renderShipping();})">Delete</button>';
    } else {
      html+='<button data-uid="'+s.id+'" class="btn btn-ghost btn-sm" style="color:#f59e0b;border-color:rgba(245,158,11,0.3)" onclick="archiveShipment(this.dataset.uid)">Archive</button>';
    }
    if(s.tracking && s.carrier) {
      var turl=getTrackingUrl(s.carrier,s.tracking);
      if(turl) html+='<a href="'+turl+'" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;padding:3px 10px;border-radius:8px;font-size:11px;font-weight:600;background:rgba(79,142,247,0.1);color:#4f8ef7;border:1px solid rgba(79,142,247,0.3);text-decoration:none;cursor:pointer">Track &#x2197;</a>';
    }
    html+='</div></td></tr>';
  }
  tb.innerHTML=html;
  tb.onclick=null;
  tb.addEventListener('click',function(e){
    var el=e.target, row=null;
    while(el&&el!==tb){if(el.tagName==='TR'&&el.dataset&&el.dataset.shid){row=el;break;}el=el.parentNode;}
    if(!row) return;
    var t=e.target;
    while(t&&t!==row){if(t.tagName==='BUTTON')return;t=t.parentNode;}
    editShipment(row.dataset.shid);
  });
  attachRowSwipe(tb, 'shipping', 'shid');
}

function setDetailFooter(f, editFn, id) {
  f.innerHTML = '';
  if (editFn) {
    var editBtn = document.createElement('button');
    editBtn.className = 'btn btn-ghost';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', function(){ closeModal('modal-detail'); window[editFn](id); });
    f.appendChild(editBtn);
  }
  var closeBtn = document.createElement('button');
  closeBtn.className = 'btn btn-ghost';
  closeBtn.textContent = 'Close';
  closeBtn.addEventListener('click', function(){ closeModal('modal-detail'); });
  f.appendChild(closeBtn);
}

function openDetail(col, id) {
  trackView(col, id);
  var item = state[col] ? state[col].find(function(x){ return x.id===id; }) : null;
  if(!item) return;
  var modal = document.getElementById('modal-detail');
  var t = document.getElementById('detail-title');
  var b = document.getElementById('detail-body');
  var f = document.getElementById('detail-footer');
  if(!modal||!t||!b) return;
  modal.classList.add('open');
  function row(label, val) {
    return '<div class="detail-row"><div class="detail-label">'+escH(label)+'</div><div class="detail-val">'+val+'</div></div>';
  }
  if(col==='projects') {
    var ptasks = state.tasks.filter(function(x){ return x.project===id; });
    var pdone = ptasks.filter(function(x){ return x.status==='done'; }).length;
    var ppct = ptasks.length ? Math.round(pdone/ptasks.length*100) : 0;
    t.textContent = item.name;
    b.innerHTML = row('Client', escH(item.client||'—'))
      + row('Status', statusBadge(item.status))
      + row('Control System', item.system?'<span class="badge badge-cyan">'+escH(item.system)+'</span>':'—')
      + row('Location', escH(item.location||'—'))
      + row('Start', escH(fmtDate(item.start)))
      + row('End', escH(fmtDate(item.end)))
      + row('Progress', '<div style="display:flex;align-items:center;gap:10px"><span>'+pdone+'/'+ptasks.length+' tasks</span><div class="progress-bar" style="flex:1"><div class="progress-fill" style="width:'+ppct+'%"></div></div></div>')
      + (item.notes?row('Notes','<span style="white-space:pre-wrap">'+escH(item.notes)+'</span>'):'');
    setDetailFooter(f, 'editProject', id);
  }
  else if(col==='tasks') {
    t.textContent = item.title;
    b.innerHTML = row('Status', statusBadge(item.status))
      + row('Priority', priorityBadge(item.priority))
      + row('Category', escH(item.category||'General'))
      + row('Due', fmtDateSmart(item.due))
      + (item.recur?row('Repeats', escH(item.recur)):'')
      + (item.project?row('Project', escH(projectName(item.project))):'')
      + (item.desc?row('Notes','<span style="white-space:pre-wrap">'+escH(item.desc)+'</span>'):'');
    setDetailFooter(f, 'editTask', id);
  }
  else if(col==='pos') {
    t.textContent = item.number||item.vendor||'PO';
    var poLines = (item.items||'').split('\n').filter(Boolean);
    b.innerHTML = row('PO Number', escH(item.number||'—'))
      + row('Vendor', escH(item.vendor||'—'))
      + row('Project', item.project?escH(projectName(item.project)):'—')
      + row('Status', statusBadge(item.status))
      + row('Date', escH(fmtDate(item.date)))
      + row('Ship Method', escH(item.shipmethod||'—'))
      + row('Total', '<span style="color:#f59e0b;font-weight:600">'+escH(fmtCurrency(item.total))+'</span>')
      + (poLines.length?row('Line Items','<div style="font-size:12px">'+poLines.map(function(l){ return '<div style="padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.06)">'+escH(l)+'</div>'; }).join('')+'</div>'):'')
      + (item.notes?row('Notes','<span style="white-space:pre-wrap">'+escH(item.notes)+'</span>'):'');
    setDetailFooter(f, 'editPO', id);
  }
  else if(col==='shipping') {
    t.textContent = item.desc||item.tracking||'Shipment';
    var trackVal = item.tracking ? escH(item.tracking) : '<span style="color:#4a5e7a">Pending</span>';
    b.innerHTML = row('Tracking', trackVal)
      + row('Carrier', escH(item.carrier||'—'))
      + row('Description', escH(item.desc||'—'))
      + row('Status', statusBadge(item.status))
      + row('Linked PO', item.po?escH(poName(item.po)):'—')
      + row('Shipped', escH(fmtDate(item.date)))
      + row('Est. Delivery', fmtDateSmart(item.eta))
      + (item.notes?row('Notes','<span style="white-space:pre-wrap">'+escH(item.notes)+'</span>'):'');
    setDetailFooter(f, 'editShipment', id);
  }
  else if(col==='issues') {
    t.textContent = item.q||'Issue';
    b.innerHTML = row('Category', escH(item.cat||'—'))
      + row('Issue', escH(item.q||'—'))
      + row('Solution', '<span style="white-space:pre-wrap">'+escH((item.steps||[]).join('\n'))+'</span>');
    setDetailFooter(f, null, id);
  }
}

function renderTroubleshoot() {
  var cat = document.getElementById('troubleCategory').value;
  var search = document.getElementById('troubleSearch').value.toLowerCase();
  var data = state.issues.slice();
  if (cat !== 'all') data = data.filter(function(t){ return t.cat === cat; });
  if (search) data = data.filter(function(t){
    return (t.q||'').toLowerCase().indexOf(search)>=0 ||
           (t.tags||'').toLowerCase().indexOf(search)>=0 ||
           (t.a||'').toLowerCase().indexOf(search)>=0;
  });

  var el = document.getElementById('troubleshoot-list');
  if (!data.length) {
    el.innerHTML = '<div class="empty-state"><div class="icon">🔍</div><p>No matching issues — click + Add to create one</p></div>';
    return;
  }

  var catColors = {electrical:'#f59e0b', dimming:'#8b5cf6', commissioning:'#06b6d4', hardware:'#ef4444', network:'#10b981'};
  el.innerHTML = data.map(function(t, i) {
    var color = catColors[t.cat] || '#94a3b8';
    var steps = Array.isArray(t.steps) ? t.steps : (t.steps||'').split('\n').filter(Boolean);
    return '<div class="trouble-card cat-' + (t.cat||'') + '" id="tc-' + i + '">' +
      '<div style="display:flex;align-items:flex-start;gap:12px" onclick="toggleTrouble(' + i + ')">' +
        '<div style="flex:1">' +
          '<div class="trouble-q">' + escHtml(t.q||'') + '</div>' +
          '<div class="trouble-tag" style="margin-top:4px">' +
            '<span class="badge" style="border-color:' + color + '30;color:' + color + ';background:' + color + '18">' + (t.cat||'general') + '</span>' +
          '</div>' +
        '</div>' +
        '<div style="display:flex;gap:6px;align-items:center" onclick="event.stopPropagation()">' +
          '<button class="btn btn-ghost btn-sm" onclick="editIssue(\'' + t.id + '\')" title="Edit (E)">Edit</button>' +
          '<button class="btn btn-danger btn-sm" onclick="deleteIssue(\'' + t.id + '\')" title="Delete">Del</button>' +
        '</div>' +
        '<span style="color:#4a5e7a;font-size:18px;margin-top:2px;cursor:pointer" id="tc-arrow-' + i + '" onclick="toggleTrouble(' + i + ')">›</span>' +
      '</div>' +
      '<div class="trouble-answer">' +
        '<p style="margin-bottom:12px;color:#94a3b8">' + escHtml(t.a||'') + '</p>' +
        '<div class="trouble-steps">' +
          steps.map(function(s, n) {
            return '<div class="trouble-step"><div class="step-num">' + (n+1) + '</div><div>' + escHtml(s) + '</div></div>';
          }).join('') +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

function toggleTrouble(i) {
  var el = document.getElementById('tc-' + i);
  var arrow = document.getElementById('tc-arrow-' + i);
  el.classList.toggle('expanded');
  arrow.textContent = el.classList.contains('expanded') ? '∨' : '›';
}

function renderAll() {
  renderDashboard();
  renderProjects();
  renderTasks();
  renderPOs();
  renderShipping();
  window._dirtyViews = {projects:false, tasks:false, pos:false, shipping:false, troubleshoot:false};
}


// ═══════════════════════════════════════════════
//  SWIPE ACTIONS ON TASK ROWS
// ═══════════════════════════════════════════════


function swipeStart(e, el) {
  swipeTouchX = e.touches[0].clientX;
  swipeTouchY = e.touches[0].clientY;
  swipeEl = el;
  swipeActive = false;
}

function swipeMove(e, el) {
  var dx = e.touches[0].clientX - swipeTouchX;
  var dy = e.touches[0].clientY - swipeTouchY;
  if (!swipeActive && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) {
    swipeActive = true;
  }
  if (!swipeActive) return;
  e.preventDefault();
  var clamped = Math.max(-120, Math.min(0, dx));
  el.style.transform = 'translateX('+clamped+'px)';
  el.style.transition = 'none';
}

function swipeEnd(e, el, taskId, taskState) {
  if (!swipeActive) return;
  var dx = e.changedTouches[0].clientX - swipeTouchX;
  el.style.transition = 'transform 0.25s ease';
  el.style.transform = 'translateX(0)';
  if (dx < -80) {
    if (taskState === 'archived') {
      if (confirm('Delete this task permanently?')) {
        deleteItem('tasks', taskId);
        renderTasks();
        toast('Task deleted');
      }
    } else {
      archiveTask(taskId, e);
    }
  } else if (dx > 60) {
    var task = state.tasks.find(function(t){return t.id===taskId;});
    if (task && task.status !== 'done') {
      updateItem('tasks', taskId, _merge({}, task, {status:'done'}));
      renderTasks();
      toast('Marked done');
    }
  }
  swipeActive = false;
}

// ═══════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════


// ═══════════════════════════════════════════════
//  THEME — dark / light
// ═══════════════════════════════════════════════

function trackView(type, id) {
  var item = state[type] ? state[type].find(function(x){ return x.id === id; }) : null;
  if (!item) return;
  var labels = { tasks:'Task', projects:'Project', pos:'PO', shipping:'Shipment', issues:'Issue' };
  var icons  = { tasks:'✓', projects:'🏗', pos:'📄', shipping:'📦', issues:'⚡' };
  var entry = {
    type: type, id: id,
    label: labels[type] || type,
    icon: icons[type] || '•',
    name: item.title || item.name || item.vendor || item.tracking || item.q || id,
    ts: Date.now()
  };
  recentlyViewed = recentlyViewed.filter(function(r){ return !(r.type===type && r.id===id); });
  recentlyViewed.unshift(entry);
  if (recentlyViewed.length > 8) recentlyViewed = recentlyViewed.slice(0, 8);
  localStorage.setItem('fop_rv', JSON.stringify(recentlyViewed));
  renderRecentlyViewed();
}

function renderRecentlyViewed() {
  var wrap = document.getElementById('dash-recently-viewed');
  var chips = document.getElementById('rv-chips');
  if (!wrap || !chips) return;
  var valid = recentlyViewed.filter(function(r) {
    return state[r.type] && state[r.type].find(function(x){ return x.id === r.id; });
  });
  if (!valid.length) { wrap.style.display = 'none'; return; }
  wrap.style.display = 'block';
  chips.innerHTML = valid.map(function(r) {
    return '<div class="rv-chip" onclick="switchView(\''+r.type+'\');setTimeout(function(){openDetail(\''+r.type+'\',\''+r.id+'\')},100)">'
      + r.icon + ' ' + escH(r.name.length > 22 ? r.name.slice(0,22)+'...' : r.name)
      + '</div>';
  }).join('');
}

// Patch openDetail to track views


// ═══════════════════════════════════════════════
//  IN-APP NOTIFICATIONS
// ═══════════════════════════════════════════════


function renderNotifBadge() {
  var badge = document.getElementById('notif-badge');
  if (!badge) return;
  var unread = notifications.filter(function(n){ return !n.read; }).length;
  badge.textContent = unread > 9 ? '9+' : String(unread);
  badge.style.display = unread > 0 ? 'flex' : 'none';
}

function renderNotifList() {
  var list = document.getElementById('notif-list');
  if (!list) return;
  if (!notifications.length) {
    list.innerHTML = '<div style="padding:24px;text-align:center;color:#3a4a6a;font-size:13px">No notifications</div>';
    return;
  }
  list.innerHTML = notifications.slice(0,20).map(function(n) {
    var ago = timeAgo(n.ts);
    var borderClass = n.level === 'danger' ? 'danger' : n.level === 'warn' ? 'warn' : '';
    return '<div class="notif-item '+(n.read?'':'unread')+' '+borderClass+'" data-nid="'+n.id+'" onclick="notifClick(\''+n.id+'\')">'
      + '<div style="font-size:13px;color:#f0f4ff;line-height:1.4">'+escH(n.msg)+'</div>'
      + '<div style="font-size:11px;color:#4a5e7a;margin-top:4px">'+ago+'</div>'
      + '</div>';
  }).join('');
}

function notifClick(id) {
  var n = notifications.find(function(x){ return x.id === id; });
  if (!n) return;
  n.read = true;
  localStorage.setItem('fop_notifs', JSON.stringify(notifications));
  renderNotifBadge();
  renderNotifList();
  if (n.actionType && n.actionId) {
    var viewMap = { tasks:'tasks', projects:'projects', pos:'pos', shipping:'shipping' };
    var view = viewMap[n.actionType];
    if (view) { switchView(view); setTimeout(function(){ openDetail(n.actionType, n.actionId); }, 100); }
  }
  document.getElementById('notif-panel').classList.remove('open');
}

function markAllRead() {
  notifications.forEach(function(n){ n.read = true; });
  localStorage.setItem('fop_notifs', JSON.stringify(notifications));
  renderNotifBadge();
  renderNotifList();
}

function toggleNotifPanel() {
  var panel = document.getElementById('notif-panel');
  if (!panel) return;
  var isOpen = panel.classList.contains('open');
  closeSearchDropdown();
  if (isOpen) {
    panel.classList.remove('open');
    return;
  }
  renderNotifList();
  panel.classList.add('open');
  setTimeout(function(){
    function close(e) {
      if (!panel.contains(e.target) && !e.target.closest('#notif-btn')) {
        panel.classList.remove('open');
        document.removeEventListener('click', close, true);
        document.removeEventListener('touchend', close, true);
      }
    }
    document.addEventListener('click', close, true);
    document.addEventListener('touchend', close, true);
  }, 60);
}

function saveDashWidgets() {
  localStorage.setItem('fop_dash_widgets', JSON.stringify(dashWidgets));
}

function toggleWidget(key) {
  dashWidgets[key] = !dashWidgets[key];
  saveDashWidgets();
  renderDashboard();
  applyDashWidgets();
}

function applyDashWidgets() {
  var statGrid = document.getElementById('dash-stat-grid');
  var recentGrid = document.getElementById('dash-recent-grid');
  if (statGrid) statGrid.style.display = dashWidgets.stats ? '' : 'none';
  if (recentGrid) recentGrid.style.display = (dashWidgets.recentTasks || dashWidgets.recentShipments) ? '' : 'none';
  // Hide individual cards inside the grid
  var taskCard = document.getElementById('dash-task-card');
  var shipCard = document.getElementById('dash-ship-card');
  if (taskCard) taskCard.style.display = dashWidgets.recentTasks ? '' : 'none';
  if (shipCard) shipCard.style.display = dashWidgets.recentShipments ? '' : 'none';
  // Update widget toggle buttons
  ['stats','recentTasks','recentShipments'].forEach(function(k) {
    var btn = document.getElementById('widget-btn-'+k);
    if (btn) {
      btn.style.background = dashWidgets[k] ? 'rgba(79,142,247,0.2)' : 'rgba(255,255,255,0.05)';
      btn.style.borderColor = dashWidgets[k] ? 'rgba(79,142,247,0.4)' : 'rgba(255,255,255,0.08)';
      btn.style.color = dashWidgets[k] ? '#7ab3fa' : '#4a5e7a';
    }
  });
}

// ═══════════════════════════════════════════════════════════════════
//  COMPACT MOBILE LIST MODE
// ═══════════════════════════════════════════════════════════════════


function toggleCompact() {
  compactMode = !compactMode;
  localStorage.setItem('fop_compact', compactMode ? '1' : '0');
  document.body.classList.toggle('compact', compactMode);
  renderTasks();
  renderPOs();
  renderShipping();
  var btn = document.getElementById('compact-btn');
  if (btn) {
    btn.title = compactMode ? 'Switch to normal view' : 'Switch to compact view';
    btn.style.color = compactMode ? '#4f8ef7' : '';
  }
}

// ═══════════════════════════════════════════════════════════════════
//  SHIPMENT ETA ALERTS
// ═══════════════════════════════════════════════════════════════════

function attachRowSwipe(tbody, col, idAttr) {
  var rows = tbody.querySelectorAll('tr[data-'+idAttr+']');
  rows.forEach(function(row) {
    row.addEventListener('touchstart', function(e) {
      _rowSwipeTX = e.touches[0].clientX;
      _rowSwipeTY = e.touches[0].clientY;
      _rowSwipeEl = row;
      _rowSwipeActive = false;
    }, {passive: true});
    row.addEventListener('touchmove', function(e) {
      var dx = e.touches[0].clientX - _rowSwipeTX;
      var dy = e.touches[0].clientY - _rowSwipeTY;
      if (!_rowSwipeActive && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) _rowSwipeActive = true;
      if (!_rowSwipeActive) return;
      e.preventDefault();
      var clamped = Math.max(-100, Math.min(0, dx));
      row.style.transform = 'translateX('+clamped+'px)';
      row.style.transition = 'none';
    }, {passive: false});
    row.addEventListener('touchend', function(e) {
      if (!_rowSwipeActive) return;
      var dx = e.changedTouches[0].clientX - _rowSwipeTX;
      row.style.transition = 'transform 0.25s ease';
      row.style.transform = 'translateX(0)';
      var id = row.dataset[idAttr];
      if (dx < -70) {
        var label = col === 'pos' ? 'PO' : 'Shipment';
        softDelete(col, id, label);
        haptic('heavy');
      }
      _rowSwipeActive = false;
    });
  });
}


// ── ARCHIVE HELPERS ────────────────────────────────────────────────────────

function populateTemplatePicker() {
  var container = document.getElementById('template-task-pick');
  if (!container) return;
  var activeTasks = state.tasks.filter(function(t){ return !t.archived; });
  if (!activeTasks.length) {
    container.innerHTML = '<div style="color:#4a5e7a;font-size:13px;padding:8px 0">No active tasks to save</div>';
    return;
  }
  container.innerHTML = activeTasks.map(function(t) {
    return '<label style="display:flex;align-items:center;gap:8px;padding:6px 0;cursor:pointer;font-size:13px;color:#8da0c0">'
      + '<input type="checkbox" class="template-save-cb" data-id="'+t.id+'" checked style="width:14px;height:14px;accent-color:#2563ff">'
      + escH(t.title)
      + '</label>';
  }).join('');
}


// ═══════════════════════════════════════════════
//  DOWNLOAD HTML WITH CONFIG BAKED IN
// ═══════════════════════════════════════════════

function renderTemplateModal() {
  var list = document.getElementById('template-list');
  if (!list) return;
  if (!taskTemplates.length) {
    list.innerHTML = '<div style="padding:16px;text-align:center;color:#4a5e7a;font-size:13px">No templates yet</div>';
    return;
  }
  list.innerHTML = '';
  taskTemplates.forEach(function(tmpl) {
    var wrap = document.createElement('div');
    wrap.style.cssText = 'border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:16px;margin-bottom:10px;background:rgba(255,255,255,0.03)';
    var hdr = document.createElement('div');
    hdr.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:10px';
    hdr.innerHTML = '<div><div style="font-weight:700;font-size:14px;color:#f0f4ff">'+escH(tmpl.name)+'</div><div style="font-size:12px;color:#4a5e7a;margin-top:2px">'+tmpl.tasks.length+' tasks</div></div>';
    var delBtn = document.createElement('button');
    delBtn.className = 'btn btn-danger btn-sm'; delBtn.style.fontSize='11px'; delBtn.textContent='Delete';
    delBtn.addEventListener('click', function(){ deleteTemplate(tmpl.id); });
    hdr.appendChild(delBtn); wrap.appendChild(hdr);
    var row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:8px;align-items:center;flex-wrap:wrap';
    var sel = document.createElement('select');
    sel.id = 'proj-for-'+tmpl.id; sel.style.cssText = 'flex:1;min-width:120px;font-size:12px;padding:7px 10px';
    sel.innerHTML = '<option value="">No project</option>'+state.projects.map(function(p){ return '<option value="'+p.id+'">'+escH(p.name)+'</option>'; }).join('');
    row.appendChild(sel);
    var applyBtn = document.createElement('button');
    applyBtn.className='btn btn-primary btn-sm'; applyBtn.style.whiteSpace='nowrap'; applyBtn.textContent='Apply to Project';
    (function(tid,s){ applyBtn.addEventListener('click', function(){ applyTemplate(tid,s.value); }); })(tmpl.id,sel);
    row.appendChild(applyBtn); wrap.appendChild(row); list.appendChild(wrap);
  });
}

function openTemplateModal() { renderTemplateModal(); openModal('modal-templates'); }

function populateTemplatePicker() {
  var container = document.getElementById('template-task-pick');
  if (!container) return;
  var active = state.tasks.filter(function(t){ return !t.archived; });
  container.innerHTML = active.length ? active.map(function(t){
    return '<label style="display:flex;align-items:center;gap:8px;padding:6px 0;cursor:pointer;font-size:13px;color:#8da0c0">'
      +'<input type="checkbox" class="template-save-cb" data-id="'+t.id+'" checked style="width:14px;height:14px;accent-color:#2563ff">'+escH(t.title)+'</label>';
  }).join('') : '<div style="color:#4a5e7a;font-size:13px;padding:8px 0">No active tasks</div>';
}

function updateThingsNav(v) {
  var backBtn = document.getElementById('mob-back-btn');
  var menuBtn = document.getElementById('menuBtn');
  if (v === 'dashboard') {
    if (backBtn) backBtn.style.display = 'none';
    if (menuBtn) menuBtn.style.display = 'flex';
    document.body.classList.remove('mob-subview');
    var hw=document.getElementById('things-home-wrap');
    if(hw) hw.style.display='block';
    setTimeout(renderThingsHome, 0);
  } else {
    if (backBtn) backBtn.style.display = 'flex';
    if (menuBtn) menuBtn.style.display = 'none';
    document.body.classList.add('mob-subview');
    var hw=document.getElementById('things-home-wrap');
    if(hw) hw.style.display='none';
  }
  // Update large title
  var lt = document.getElementById('mob-large-title');
  if (lt) {
    var titles = {dashboard:'FieldOps Pro', projects:'Projects', tasks:'Tasks',
      pos:'Purchase Orders', shipping:'Shipping', troubleshoot:'Troubleshoot', settings:'Settings'};
    lt.textContent = titles[v] || v;
  }
}

function renderThingsHome() {
  var wrap = document.getElementById('things-home-wrap');
  if (wrap) wrap.style.display = 'block';
  var el = document.getElementById('things-home-cards');
  if (!el) return;
  var today = new Date(); today.setHours(0,0,0,0);
  var openTasks = state.tasks.filter(function(t){return !t.archived && t.status!=='done';});
  var overdue = openTasks.filter(function(t){return t.due && new Date(t.due)<today;});
  var dueToday = openTasks.filter(function(t){
    var d = t.due ? new Date(t.due) : null;
    return d && d.getFullYear()===today.getFullYear() && d.getMonth()===today.getMonth() && d.getDate()===today.getDate();
  });
  var activeProjects = state.projects.filter(function(p){return p.status==='active';});
  var inTransit = state.shipping.filter(function(s){return s.status==='transit'||s.status==='out';});
  var pendingPOs = state.pos.filter(function(p){return p.status==='draft'||p.status==='submitted';});

  var sections = [
    { view:'projects',    color:'#f59e0b', bg:'rgba(245,158,11,0.15)',
      icon:'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z',
      iconType:'path', title:'Projects',
      sub: activeProjects.length + ' active',
      count: state.projects.length, countAlert: false },
    { view:'tasks',       color:'#10b981', bg:'rgba(16,185,129,0.15)',
      icon:'polyline:9 11 12 14 22 4|path:M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11',
      iconType:'multi', title:'Tasks',
      sub: overdue.length ? overdue.length + ' overdue' : dueToday.length ? dueToday.length + ' due today' : openTasks.length + ' open',
      count: openTasks.length, countAlert: overdue.length > 0 },
    { view:'pos',         color:'#8b5cf6', bg:'rgba(139,92,246,0.15)',
      icon:'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z|polyline:14 2 14 8 20 8',
      iconType:'multi', title:'Purchase Orders',
      sub: pendingPOs.length + ' pending',
      count: state.pos.length, countAlert: false },
    { view:'shipping',    color:'#06b6d4', bg:'rgba(6,182,212,0.15)',
      icon:'rect:1,3,15,13,1|path:M16 8h4l3 5v3h-7V8z|circle:5.5,18.5,2.5|circle:18.5,18.5,2.5',
      iconType:'ship', title:'Shipping',
      sub: inTransit.length + ' in transit',
      count: state.shipping.length, countAlert: false },
    { view:'troubleshoot',color:'#ef4444', bg:'rgba(239,68,68,0.15)',
      icon:'circle:12,12,10|line:12,8,12,12|line:12,16,12.01,16',
      iconType:'trouble', title:'Troubleshoot',
      sub: state.issues.length + ' in database',
      count: state.issues.length, countAlert: false },
    { view:'settings',    color:'#94a3b8', bg:'rgba(148,163,184,0.12)',
      icon:'circle:12,12,3|settings',
      iconType:'settings', title:'Settings',
      sub: 'Firebase & appearance',
      count: 0, countAlert: false },
  ];

  el.innerHTML = '';
  // Fallback delegated handler on container
  el.onclick = function(e) {
    var card = e.target.closest ? e.target.closest('.things-card') : null;
    if (!card && e.target.className && e.target.className.indexOf('things-card') !== -1) card = e.target;
    if (card && card.dataset && card.dataset.view) { switchView(card.dataset.view); }
  };
  sections.forEach(function(s) {
    var div = document.createElement('div');
    div.className = 'things-card';
    div.dataset.view = s.view;
    div.style.cursor = 'pointer';
    div.style.touchAction = 'manipulation';

    // Icon
    var iconWrap = document.createElement('div');
    iconWrap.className = 'things-card-icon';
    iconWrap.style.background = s.bg;
    iconWrap.style.color = s.color;
    iconWrap.innerHTML = thingsIcon(s.view, s.color);
    div.appendChild(iconWrap);

    // Body
    var body = document.createElement('div');
    body.className = 'things-card-body';
    var title = document.createElement('div');
    title.className = 'things-card-title';
    title.textContent = s.title;
    var sub = document.createElement('div');
    sub.className = 'things-card-sub';
    sub.textContent = s.sub;
    body.appendChild(title);
    body.appendChild(sub);
    div.appendChild(body);

    // Count badge
    if (s.count > 0 || s.countAlert) {
      var badge = document.createElement('div');
      badge.className = 'things-card-count';
      badge.textContent = s.count;
      badge.style.background = s.countAlert ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.07)';
      badge.style.color = s.countAlert ? '#ef4444' : '#64748b';
      div.appendChild(badge);
    }

    // Chevron
    var chev = document.createElement('div');
    chev.className = 'things-card-chevron';
    chev.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>';
    div.appendChild(chev);

    (function(view) {
      div.onclick = function() { switchView(view); };
    })(s.view);
    el.appendChild(div);
  });
}

function thingsIcon(view, color) {
  var icons = {
    dashboard: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
    projects:  '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
    tasks:     '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
    pos:       '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
    shipping:  '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
    troubleshoot:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
    settings:  '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
  };
  return icons[view] || icons.settings;
}
