// FieldOps Pro — Global Variables
// All global state lives here. Loaded first, before any other app script.
// Non-module <script> tags share the global scope — vars declared once here.

// ── Firebase & Data ─────────────────────────────────────────────────
var db = null;
var unsubscribers = [];
var COLLECTIONS = ['projects','tasks','pos','shipping','issues','events'];
var state = { projects:[], tasks:[], pos:[], shipping:[], issues:[], events:[] };
var _syncQueue = JSON.parse(localStorage.getItem('fop_sync_queue') || '[]');
var _isOnline = navigator.onLine;

var LOCAL = {
  get: function(col) { try { return JSON.parse(localStorage.getItem('fop_'+col)||'[]'); } catch(e) { return []; } },
  set: function(col, data) { localStorage.setItem('fop_'+col, JSON.stringify(data)); },
  add: function(col, item) { var d = LOCAL.get(col); d.push(item); LOCAL.set(col,d); },
  update: function(col, id, item) {
    var d = LOCAL.get(col);
    var i = -1;
    for(var _j=0;_j<d.length;_j++){ if(d[_j].id===id){i=_j;break;} }
    if(i>=0) { var merged={}; var k; for(k in d[i]){merged[k]=d[i][k];} for(k in item){merged[k]=item[k];} d[i]=merged; }
    LOCAL.set(col,d);
  },
  delete: function(col, id) { LOCAL.set(col, LOCAL.get(col).filter(function(x){ return x.id!==id; })); }
};

// ── Navigation & UI ─────────────────────────────────────────────────
var currentView = 'dashboard';
var viewTitles = {
  dashboard:'Dashboard', projects:'Projects', tasks:'Tasks',
  pos:'Purchase Orders', shipping:'Shipping', troubleshoot:'Troubleshoot DB', settings:'Sync Setup'
};
var editingId = null;

// ── Task state ───────────────────────────────────────────────────────
var taskFilter = 'active';
var taskViewMode = 'list';
var taskProjectFilter = '';
var dragTaskId = null;
var bulkSelected = {
  _d:{},
  add:function(v){this._d[String(v)]=1;},
  remove:function(v){delete this._d[String(v)];},
  has:function(v){return this._d[String(v)]===1;},
  clear:function(){this._d={};},
  count:function(){var n=0;for(var k in this._d){if(this._d[k])n++;}return n;},
  forEach:function(fn){for(var k in this._d){if(this._d[k])fn(k);}}
};
bulkSelected.delete = bulkSelected.remove;

// ── Filter state ─────────────────────────────────────────────────────
var projectFilter = 'all';
var poFilter = 'all';
var shipFilter = 'all';

// ── Modal & form state ───────────────────────────────────────────────
var comboCustomOptions = JSON.parse(localStorage.getItem('fop_combo_opts')||'{}');
var taskTemplates = JSON.parse(localStorage.getItem('fop_templates') || '[]');
var COMBO_DEFAULTS = {
  'task-category': ['General','Installation','Programming','Commissioning','Testing','Punch List','Admin'],
  'project-system': ['Lutron RadioRA3','Lutron Homeworks QSX','Lutron Caseta','Crestron','Control4','Savant','Leviton','Custom'],
  'project-status': ['Planning','Active','On Hold','Completed'],
  'po-status': ['Draft','Submitted','Approved','Received'],
  'po-shipmethod': ['Standard','Expedited','Overnight','Will Call','Freight'],
  'ship-carrier': ['UPS','FedEx','USPS','DHL','OnTrac','XPO','Other'],
  'ship-status': ['Pending','In Transit','Out for Delivery','Delivered','Exception'],
};

// ── Features state ───────────────────────────────────────────────────
var searchSelectedIdx = -1;
var _srchHist = JSON.parse(localStorage.getItem('fop_srch')||'[]');
var recentlyViewed = JSON.parse(localStorage.getItem('fop_rv') || '[]');
var notifications = JSON.parse(localStorage.getItem('fop_notifs') || '[]');
var dashWidgets = JSON.parse(localStorage.getItem('fop_dash_widgets') || JSON.stringify({
  stats:true, recentTasks:true, recentShipments:true, alerts:true
}));
var _widgets = JSON.parse(localStorage.getItem('fop_dash_v2') || JSON.stringify({
  overview:true, tasks:true, shipping:true, alerts:true, activity:true
}));
var compactMode = localStorage.getItem('fop_compact') === '1';
var quickAddOpen = false;
var _fabOpen = false;
var _locTimer = null;
var _locResults = [];
var _locHighlight = -1;
var _undoStack = [];
var _undoTimer = null;
var barcodeStream = null;

// ── Swipe tracking ───────────────────────────────────────────────────
var swipeTouchX = 0, swipeTouchY = 0, swipeEl = null, swipeActive = false;
var touchDragEl = null, touchClone = null, touchTaskId = null;
var _rowSwipeTX = 0, _rowSwipeTY = 0, _rowSwipeEl = null, _rowSwipeActive = false;
