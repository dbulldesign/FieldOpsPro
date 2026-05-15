// ═══════════════════════════════════════════════════════════════
//  FIELDOPS PRO — NEW LIGHTING TOOLS
//  1. Beam Spread Calculator       (view: beamspread,   key: B)
//  2. Circuit Load Calculator      (view: circuitload,  key: R)
//  3. Lux / Foot-candle Converter  (view: luxconvert,   key: U)
//  4. Art-Net / sACN Planner       (view: artnetplan,   key: A)
//  5. Tunable White Blender        (view: twblend,      key: N)
//  6. Cable Cut List               (view: cablecutlist, key: E)
//  7. Ohm's Law Calculator         (view: ohmslaw,      key: H)
//  8. IP Rating Reference          (view: iprating,     key: I)
// ═══════════════════════════════════════════════════════════════

// ── Shared mini-helpers ─────────────────────────────────────────
function _tPill(label, active, onclick) {
  return '<button onclick="'+onclick+'" style="padding:5px 12px;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;border:1px solid '+(active?'rgba(79,142,247,0.5)':'rgba(255,255,255,0.1)')+';background:'+(active?'rgba(79,142,247,0.15)':'rgba(255,255,255,0.04)')+';color:'+(active?'#4f8ef7':'#a3b8d4')+'">'+label+'</button>';
}
function _tLabel(txt) { return '<div style="font-size:10px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;color:#6e8aad;margin-bottom:7px">'+txt+'</div>'; }
function _tNumInput(id, val, fn, unit) {
  return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:14px"><input type="number" id="'+id+'" min="0" step="any" value="'+(val===0?'0':val||'')+'" oninput="'+fn+'" style="flex:1;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:10px 12px;color:#f0f4ff;font-size:17px;font-weight:600;outline:none;-moz-appearance:textfield;box-sizing:border-box">'+(unit?'<span style="font-size:14px;font-weight:700;color:#6e8aad;min-width:26px">'+unit+'</span>':'')+'</div>';
}
function _tStatBox(lbl, val, sub) {
  return '<div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:14px 12px"><div style="font-size:10px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;color:#6e8aad;margin-bottom:4px">'+lbl+'</div><div style="font-size:22px;font-weight:700;color:#4f8ef7;font-family:monospace;line-height:1.1;margin-bottom:3px">'+val+'</div>'+(sub?'<div style="font-size:11px;color:#6e8aad">'+sub+'</div>':'')+'</div>';
}
function _tResultBox(html) { return '<div style="background:rgba(79,142,247,0.07);border:1px solid rgba(79,142,247,0.2);border-radius:12px;padding:20px;margin-top:16px">'+html+'</div>'; }
function _tCard(html)      { return '<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:16px;margin-bottom:14px">'+html+'</div>'; }
function _tWrap(html)      { return '<div style="max-width:540px;margin:0 auto;padding:24px 16px 60px">'+html+'</div>'; }
function _tH(title, sub)   { return '<h2 style="font-size:18px;font-weight:700;color:#f0f4ff;margin:0 0 3px">'+title+'</h2><p style="font-size:12px;color:#6e8aad;margin:0 0 18px">'+sub+'</p>'; }

// ════════════════════════════════════════════════
//  1. BEAM SPREAD CALCULATOR
// ════════════════════════════════════════════════
var _bs = { h: 10, angle: 36, tilt: 0, unit: 'ft' };

function _bsCompute() {
  var h = parseFloat(_bs.h) || 0;
  var a = parseFloat(_bs.angle) || 0;
  var t = parseFloat(_bs.tilt) || 0;
  if (h <= 0 || a <= 0) return null;
  var r = h * Math.tan((a / 2) * Math.PI / 180);
  var d = 2 * r;
  var area = Math.PI * r * r;
  var tiltD = t > 0 ? d / Math.cos(t * Math.PI / 180) : 0;
  return { r: r, d: d, area: area, tiltD: tiltD, t: t };
}

function _bsRender() {
  var root = document.getElementById('bs-root'); if (!root) return;
  var u = _bs.unit;
  var angles = [10, 15, 19, 25, 36, 40, 50, 60, 70, 90];
  function ni(id, val, fn, suf) {
    return '<div style="display:flex;align-items:center;gap:8px"><input type="number" id="'+id+'" min="0" step="any" value="'+val+'" oninput="'+fn+'" style="flex:1;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:10px 12px;color:#f0f4ff;font-size:18px;font-weight:600;outline:none;-moz-appearance:textfield;box-sizing:border-box"><span style="font-size:14px;font-weight:700;color:#6e8aad;min-width:26px">'+suf+'</span></div>';
  }
  root.innerHTML = _tWrap(
    _tH('Beam Spread Calculator', 'Mounting height + beam angle → illuminated pool diameter on the floor')
    +'<div style="display:flex;gap:6px;margin-bottom:18px">'+_tPill('ft', u==='ft', "_bs.unit='ft';_bsRender()")+_tPill('m', u==='m', "_bs.unit='m';_bsRender()")+'</div>'
    +'<div style="margin-bottom:14px">'+_tLabel('Mounting Height ('+u+')')+ni('bs-h', _bs.h, '_bs.h=this.value;_bsUpdate()', u)+'</div>'
    +'<div style="margin-bottom:14px">'+_tLabel('Beam Angle (°)')
    +'<div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:8px">'+angles.map(function(a) { return _tPill(a+'°', parseFloat(_bs.angle)===a, '_bs.angle='+a+';var e=document.getElementById(\'bs-angle\');if(e)e.value='+a+';_bsUpdate()'); }).join('')+'</div>'
    +ni('bs-angle', _bs.angle, '_bs.angle=this.value;_bsUpdate()', '°')+'</div>'
    +'<div style="margin-bottom:20px">'+_tLabel('Tilt Angle (° from straight down, 0 = vertical)')+ni('bs-tilt', _bs.tilt, '_bs.tilt=this.value;_bsUpdate()', '°')+'</div>'
    +'<div id="bs-results"></div>'
  );
  _bsUpdate();
}

function _bsUpdate() {
  var eh = document.getElementById('bs-h'), ea = document.getElementById('bs-angle'), et = document.getElementById('bs-tilt');
  if (eh) _bs.h     = parseFloat(eh.value) || 0;
  if (ea) _bs.angle = parseFloat(ea.value) || 0;
  if (et) _bs.tilt  = parseFloat(et.value) || 0;
  var out = document.getElementById('bs-results'); if (!out) return;
  var c = _bsCompute(); var u = _bs.unit;
  if (!c) { out.innerHTML = '<div style="text-align:center;color:#6e8aad;font-size:13px;padding:20px">Enter height and beam angle to calculate</div>'; return; }
  function f(v) { return (+v.toFixed(2)).toString(); }
  var areaStr = (Math.round(c.area * 10) / 10).toLocaleString(undefined, {minimumFractionDigits:1, maximumFractionDigits:1});
  out.innerHTML = _tResultBox(
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">'
    +_tStatBox('Diameter', f(c.d)+' '+u, 'Pool width at floor')
    +_tStatBox('Radius', f(c.r)+' '+u, 'Centre to edge')
    +_tStatBox('Coverage Area', areaStr+' '+u+'²', 'Illuminated footprint')
    +(c.tiltD > 0 ? _tStatBox('Tilted Major Axis', f(c.tiltD)+' '+u, 'Long axis at '+parseFloat(c.t.toFixed(1))+'° tilt') : '')
    +'</div>'
    +'<div style="font-size:11px;color:#6e8aad;font-family:monospace">d = 2 × '+_bs.h+' × tan('+_bs.angle+'° ÷ 2) = '+f(c.d)+' '+u+'</div>'
  );
}

window._bsRender = _bsRender;
window._bsUpdate = _bsUpdate;


// ════════════════════════════════════════════════
//  2. CIRCUIT LOAD CALCULATOR
// ════════════════════════════════════════════════
var _cl = { voltage: 120, fixtures: [], nextName: '', nextWatts: '' };

var _clBreakers = [15, 20, 25, 30, 35, 40, 50, 60, 70, 80, 90, 100, 125, 150, 200];

function _clNextBreaker(amps) {
  for (var i = 0; i < _clBreakers.length; i++) { if (_clBreakers[i] >= amps) return _clBreakers[i]; }
  return Math.ceil(amps / 25) * 25;
}

function _clCompute() {
  var totalW = _cl.fixtures.reduce(function(s, f) { return s + (parseFloat(f.w) || 0); }, 0);
  var totalA = totalW / (_cl.voltage || 120);
  var necA   = totalA * 1.25;
  var breaker = _clNextBreaker(necA);
  var circuits20 = Math.ceil(totalA / (20 * 0.8));
  var circuits15 = Math.ceil(totalA / (15 * 0.8));
  return { totalW: totalW, totalA: totalA, necA: necA, breaker: breaker, circuits20: circuits20, circuits15: circuits15 };
}

function _clRender() {
  var root = document.getElementById('cl-root'); if (!root) return;
  var c = _clCompute();
  var voltages = [120, 208, 240, 277, 480];
  var hasFixtures = _cl.fixtures.length > 0;
  root.innerHTML = _tWrap(
    _tH('Circuit Load Calculator', 'Add fixtures by wattage — get total load, amps, and breaker sizing (NEC 80% rule)')
    +'<div style="margin-bottom:18px">'+_tLabel('Voltage')
    +'<div style="display:flex;gap:6px;flex-wrap:wrap">'+voltages.map(function(v) { return _tPill(v+'V', _cl.voltage===v, '_cl.voltage='+v+';_clRender()'); }).join('')+'</div></div>'
    // Add fixture row
    +_tCard(
      '<div style="font-size:13px;font-weight:700;color:#f0f4ff;margin-bottom:12px">Add Fixture</div>'
      +'<div style="display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap">'
      +'<div style="flex:2;min-width:120px">'+_tLabel('Fixture Name / Label')+'<input type="text" id="cl-name" placeholder="e.g. Downlight A" value="'+(_cl.nextName||'')+'" oninput="_cl.nextName=this.value" style="width:100%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:9px 12px;color:#f0f4ff;font-size:14px;outline:none;box-sizing:border-box"></div>'
      +'<div style="flex:1;min-width:90px">'+_tLabel('Watts (W)')+'<input type="number" id="cl-watts" min="0" step="any" placeholder="0" value="'+(_cl.nextWatts||'')+'" oninput="_cl.nextWatts=this.value" style="width:100%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:9px 12px;color:#f0f4ff;font-size:14px;outline:none;-moz-appearance:textfield;box-sizing:border-box"></div>'
      +'<button onclick="_clAdd()" style="padding:9px 18px;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;border:none;background:rgba(79,142,247,0.2);color:#4f8ef7;white-space:nowrap">+ Add</button>'
      +'</div>'
    )
    // Fixture list
    +(hasFixtures
      ? '<div style="margin-bottom:14px">'
        +_cl.fixtures.map(function(f, i) {
          return '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:8px;margin-bottom:6px">'
            +'<span style="font-size:13px;color:#f0f4ff;flex:1">'+f.name+'</span>'
            +'<span style="font-size:13px;font-weight:700;color:#a3b8d4;font-family:monospace;min-width:60px;text-align:right">'+parseFloat(f.w||0).toLocaleString()+' W</span>'
            +'<button onclick="_clRemove('+i+')" style="margin-left:12px;background:none;border:none;color:#6e8aad;cursor:pointer;font-size:16px;padding:0 4px;line-height:1">×</button>'
            +'</div>';
        }).join('')
        +'<button onclick="_cl.fixtures=[];_clRender()" style="margin-top:4px;background:none;border:none;color:#6e8aad;font-size:11px;cursor:pointer;padding:0">Clear all</button>'
        +'</div>'
      : ''
    )
    // Results
    +(hasFixtures ? _tResultBox(
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">'
      +_tStatBox('Total Load', c.totalW.toLocaleString()+' W', _cl.fixtures.length+' fixture'+(c===1?'':'s'))
      +_tStatBox('Total Amps', c.totalA.toFixed(2)+' A', 'at '+_cl.voltage+'V')
      +_tStatBox('NEC 125% (continuous)', c.necA.toFixed(2)+' A', 'minimum circuit rating')
      +_tStatBox('Min Breaker', c.breaker+' A', 'next standard size')
      +'</div>'
      +'<div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:14px;display:flex;gap:16px;flex-wrap:wrap">'
      +'<div style="font-size:12px;color:#6e8aad">20A circuits needed: <span style="color:#a3b8d4;font-weight:700">'+c.circuits20+'</span></div>'
      +'<div style="font-size:12px;color:#6e8aad">15A circuits needed: <span style="color:#a3b8d4;font-weight:700">'+c.circuits15+'</span></div>'
      +'</div>'
      +'<div style="margin-top:10px;font-size:11px;color:#6e8aad;font-family:monospace">'+c.totalW+' W ÷ '+_cl.voltage+' V = '+c.totalA.toFixed(2)+' A × 1.25 = '+c.necA.toFixed(2)+' A → '+c.breaker+'A breaker</div>'
    ) : '')
  );
}

function _clAdd() {
  var n = (_cl.nextName || '').trim() || 'Fixture '+(+_cl.fixtures.length+1);
  var w = parseFloat(_cl.nextWatts);
  if (!w || w <= 0) { alert('Enter a wattage greater than 0'); return; }
  _cl.fixtures.push({ name: n, w: w });
  _cl.nextName = ''; _cl.nextWatts = '';
  _clRender();
}

function _clRemove(i) {
  _cl.fixtures.splice(i, 1);
  _clRender();
}

window._clRender = _clRender;
window._clAdd    = _clAdd;
window._clRemove = _clRemove;


// ════════════════════════════════════════════════
//  3. LUX / FOOT-CANDLE CONVERTER
// ════════════════════════════════════════════════
var _lux = { tab: 'unit', val: 1000, dir: 'luxtfc', cd: 1000, dist: 3, distUnit: 'm', lumens: 5000, area: 20, areaUnit: 'm2' };
var _LFC = 10.7639;

function _luxRender() {
  var root = document.getElementById('lux-root'); if (!root) return;
  var t = _lux.tab;
  function tab(id, lbl) { return _tPill(lbl, t===id, "_lux.tab='"+id+"';_luxRender()"); }
  var body = '';
  if (t === 'unit') {
    var isL2F = _lux.dir === 'luxtfc';
    var v = parseFloat(_lux.val) || 0;
    var result = isL2F ? v / _LFC : v * _LFC;
    var fromUnit = isL2F ? 'lux' : 'fc';
    var toUnit   = isL2F ? 'fc'  : 'lux';
    body = '<div style="display:flex;gap:6px;margin-bottom:16px">'+_tPill('Lux → fc', isL2F, "_lux.dir='luxtfc';_luxRender()")+_tPill('fc → Lux', !isL2F, "_lux.dir='fctlux';_luxRender()")+'</div>'
      +_tLabel('Value in '+fromUnit)
      +_tNumInput('lux-val', _lux.val, '_lux.val=this.value;_luxUpdate()', fromUnit)
      +(v > 0 ? _tResultBox(
        '<div style="font-size:32px;font-weight:700;color:#4f8ef7;font-family:monospace;margin-bottom:6px">'+(Math.round(result*100)/100).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})+' '+toUnit+'</div>'
        +'<div style="font-size:12px;color:#6e8aad;font-family:monospace">'+v+' '+fromUnit+' '+(isL2F?'÷ 10.764':'× 10.764')+' = '+(Math.round(result*100)/100)+' '+toUnit+'</div>'
        +'<div style="margin-top:12px;font-size:11px;color:#6e8aad">1 foot-candle = 10.764 lux &nbsp;|&nbsp; 1 lux = 0.0929 fc</div>'
      ) : '');
  } else if (t === 'dist') {
    var cd = parseFloat(_lux.cd) || 0;
    var d  = parseFloat(_lux.dist) || 0;
    var dm = _lux.distUnit === 'm' ? d : d * 0.3048;
    var lx = cd > 0 && dm > 0 ? cd / (dm * dm) : 0;
    var fc = lx / _LFC;
    body = _tLabel('Intensity (candela, cd)')
      +_tNumInput('lux-cd', _lux.cd, '_lux.cd=this.value;_luxUpdate()', 'cd')
      +_tLabel('Distance to Surface')
      +'<div style="display:flex;gap:8px;align-items:center;margin-bottom:14px">'
      +'<input type="number" id="lux-dist" min="0" step="any" value="'+_lux.dist+'" oninput="_lux.dist=this.value;_luxUpdate()" style="flex:1;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:10px 12px;color:#f0f4ff;font-size:17px;font-weight:600;outline:none;-moz-appearance:textfield;box-sizing:border-box">'
      +'<div style="display:flex;gap:5px">'+_tPill('m', _lux.distUnit==='m', "_lux.distUnit='m';_luxRender()")+_tPill('ft', _lux.distUnit==='ft', "_lux.distUnit='ft';_luxRender()")+'</div>'
      +'</div>'
      +(cd > 0 && d > 0 ? _tResultBox(
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:10px">'
        +_tStatBox('Illuminance', (Math.round(lx*10)/10).toLocaleString()+' lux', 'at '+d+' '+_lux.distUnit)
        +_tStatBox('Illuminance', (Math.round(fc*10)/10)+' fc', 'foot-candles')
        +'</div>'
        +'<div style="font-size:11px;color:#6e8aad;font-family:monospace">E = I ÷ d² = '+cd+' ÷ '+dm.toFixed(2)+'² = '+(Math.round(lx*10)/10)+' lux</div>'
      ) : '');
  } else {
    var lm = parseFloat(_lux.lumens) || 0;
    var ar = parseFloat(_lux.area) || 0;
    var isSqFt = _lux.areaUnit === 'ft2';
    var arM2 = isSqFt ? ar * 0.0929 : ar;
    var lxA = lm > 0 && arM2 > 0 ? lm / arM2 : 0;
    var fcA = lxA / _LFC;
    body = _tLabel('Total Lumens (lm)')
      +_tNumInput('lux-lm', _lux.lumens, '_lux.lumens=this.value;_luxUpdate()', 'lm')
      +_tLabel('Room / Surface Area')
      +'<div style="display:flex;gap:8px;align-items:center;margin-bottom:14px">'
      +'<input type="number" id="lux-area" min="0" step="any" value="'+_lux.area+'" oninput="_lux.area=this.value;_luxUpdate()" style="flex:1;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:10px 12px;color:#f0f4ff;font-size:17px;font-weight:600;outline:none;-moz-appearance:textfield;box-sizing:border-box">'
      +'<div style="display:flex;gap:5px">'+_tPill('m²', !isSqFt, "_lux.areaUnit='m2';_luxRender()")+_tPill('ft²', isSqFt, "_lux.areaUnit='ft2';_luxRender()")+'</div>'
      +'</div>'
      +(lm > 0 && ar > 0 ? _tResultBox(
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:10px">'
        +_tStatBox('Avg Illuminance', Math.round(lxA).toLocaleString()+' lux', 'average maintained')
        +_tStatBox('Avg Illuminance', Math.round(fcA)+' fc', 'foot-candles')
        +'</div>'
        +'<div style="font-size:11px;color:#6e8aad;font-family:monospace">E = Φ ÷ A = '+lm+' ÷ '+arM2.toFixed(1)+' m² = '+Math.round(lxA)+' lux</div>'
      ) : '');
  }
  root.innerHTML = _tWrap(
    _tH('Lux / Foot-candle Converter', 'Unit conversion · Inverse-square law · Room illuminance')
    +'<div style="display:flex;gap:6px;margin-bottom:20px">'+tab('unit','Unit Convert')+tab('dist','From Candela')+tab('area','From Lumens')+'</div>'
    +body
  );
}

function _luxUpdate() {
  var ev = document.getElementById('lux-val');  if(ev) _lux.val    = ev.value;
  var ec = document.getElementById('lux-cd');   if(ec) _lux.cd     = ec.value;
  var ed = document.getElementById('lux-dist'); if(ed) _lux.dist   = ed.value;
  var el = document.getElementById('lux-lm');   if(el) _lux.lumens = el.value;
  var ea = document.getElementById('lux-area'); if(ea) _lux.area   = ea.value;
  _luxRender();
}

window._luxRender = _luxRender;
window._luxUpdate = _luxUpdate;


// ════════════════════════════════════════════════
//  4. ART-NET / sACN UNIVERSE PLANNER
// ════════════════════════════════════════════════
var _an = { fixtures: 24, chPerFix: 8, startUni: 0, protocol: 'sacn' };

function _anCompute() {
  var total = (parseFloat(_an.fixtures) || 0) * (parseFloat(_an.chPerFix) || 0);
  var unis   = total > 0 ? Math.ceil(total / 512) : 0;
  var list   = [];
  for (var i = 0; i < unis; i++) {
    var sStart = i * 512 + 1;
    var sEnd   = Math.min((i + 1) * 512, total);
    var uNum   = (_an.protocol === 'sacn') ? (i + 1 + parseInt(_an.startUni || 0)) : (i + parseInt(_an.startUni || 0));
    var mcIP   = '239.255.' + Math.floor(uNum / 256) + '.' + (uNum % 256);
    var fInUni = Math.floor((sEnd - sStart + 1) / (parseFloat(_an.chPerFix) || 1));
    list.push({ uNum: uNum, sStart: sStart, sEnd: sEnd, mcIP: mcIP, fInUni: fInUni });
  }
  return { total: total, unis: unis, list: list };
}

function _anRender() {
  var root = document.getElementById('an-root'); if (!root) return;
  var c = _anCompute();
  function ni(id, val, fn, suffix) {
    return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:14px"><input type="number" id="'+id+'" min="0" step="1" value="'+val+'" oninput="'+fn+'" style="flex:1;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:10px 12px;color:#f0f4ff;font-size:17px;font-weight:600;outline:none;-moz-appearance:textfield;box-sizing:border-box"><span style="font-size:13px;font-weight:700;color:#6e8aad;min-width:60px">'+suffix+'</span></div>';
  }
  var uniRows = c.list.map(function(u, i) {
    return '<tr style="border-bottom:1px solid rgba(255,255,255,0.06)">'
      +'<td style="padding:8px 10px;font-size:12px;font-weight:700;color:#4f8ef7;font-family:monospace">'+(_an.protocol==='sacn'?'sACN ':'Art-Net ')+u.uNum+'</td>'
      +'<td style="padding:8px 10px;font-size:12px;color:#a3b8d4;font-family:monospace">Ch '+u.sStart+'–'+u.sEnd+'</td>'
      +'<td style="padding:8px 10px;font-size:12px;color:#a3b8d4">'+u.fInUni+(u.fInUni===1?' fixture':' fixtures')+'</td>'
      +(_an.protocol==='sacn' ? '<td style="padding:8px 10px;font-size:11px;color:#6e8aad;font-family:monospace">'+u.mcIP+'</td>' : '<td style="padding:8px 10px;font-size:11px;color:#6e8aad;font-family:monospace">Net '+(Math.floor(u.uNum/256))+' / Sub-Net '+(Math.floor((u.uNum%256)/16))+' / U '+(u.uNum%16)+'</td>')
      +'</tr>';
  }).join('');
  root.innerHTML = _tWrap(
    _tH('Art-Net / sACN Universe Planner', 'Enter fixture count and channels per fixture to map your universes')
    +'<div style="display:flex;gap:6px;margin-bottom:18px">'
    +_tPill('sACN', _an.protocol==='sacn', "_an.protocol='sacn';_anRender()")
    +_tPill('Art-Net', _an.protocol==='artnet', "_an.protocol='artnet';_anRender()")
    +'</div>'
    +_tCard(
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">'
      +'<div>'+_tLabel('Fixture Count')+ni('an-fix', _an.fixtures, '_an.fixtures=this.value;_anRender()', 'fixtures')+'</div>'
      +'<div>'+_tLabel('Channels / Fixture')+ni('an-ch', _an.chPerFix, '_an.chPerFix=this.value;_anRender()', 'ch/fix')+'</div>'
      +'</div>'
      +_tLabel('Starting Universe ('+(_an.protocol==='sacn'?'1-based':'0-based')+')')
      +ni('an-start', _an.startUni, '_an.startUni=this.value;_anRender()', _an.protocol==='sacn'?'(sACN starts at 1)':'(Art-Net starts at 0)')
    )
    +(c.unis > 0 ? (
      _tResultBox(
        '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:16px">'
        +_tStatBox('Total Channels', c.total.toLocaleString(), (parseFloat(_an.fixtures)||0)+' × '+(parseFloat(_an.chPerFix)||0)+' ch')
        +_tStatBox('Universes Needed', c.unis.toString(), '512 ch each')
        +_tStatBox('Used in Last Uni', ((c.total % 512) || 512)+' / 512', 'channels utilised')
        +'</div>'
        +(c.list.length > 0 ? '<table style="width:100%;border-collapse:collapse"><thead><tr>'
          +'<th style="padding:6px 10px;font-size:10px;font-weight:700;text-transform:uppercase;color:#6e8aad;text-align:left;border-bottom:1px solid rgba(255,255,255,0.1)">Universe</th>'
          +'<th style="padding:6px 10px;font-size:10px;font-weight:700;text-transform:uppercase;color:#6e8aad;text-align:left;border-bottom:1px solid rgba(255,255,255,0.1)">Channels</th>'
          +'<th style="padding:6px 10px;font-size:10px;font-weight:700;text-transform:uppercase;color:#6e8aad;text-align:left;border-bottom:1px solid rgba(255,255,255,0.1)">Fixtures</th>'
          +'<th style="padding:6px 10px;font-size:10px;font-weight:700;text-transform:uppercase;color:#6e8aad;text-align:left;border-bottom:1px solid rgba(255,255,255,0.1)">'+(_an.protocol==='sacn'?'Multicast IP':'Addressing')+'</th>'
          +'</tr></thead><tbody>'+uniRows+'</tbody></table>' : '')
      )
    ) : '')
  );
}

window._anRender = _anRender;


// ════════════════════════════════════════════════
//  5. TUNABLE WHITE BLENDER
// ════════════════════════════════════════════════
var _tw = { warmPct: 80, coolPct: 20, warmCCT: 2700, coolCCT: 6500 };

function _twCCTtoRGB(k) {
  var t = k / 100, r, g, b;
  if (t <= 66) { r = 255; g = Math.max(0, Math.min(255, Math.round(99.47 * Math.log(t) - 161.12))); b = t <= 19 ? 0 : Math.max(0, Math.min(255, Math.round(138.52 * Math.log(t - 10) - 305.04))); }
  else { r = Math.max(0, Math.min(255, Math.round(329.70 * Math.pow(t-60,-0.133)))); g = Math.max(0, Math.min(255, Math.round(288.12 * Math.pow(t-60,-0.076)))); b = 255; }
  return { r: r, g: g, b: b };
}

function _twCompute() {
  var wc = Math.max(0, Math.min(100, parseFloat(_tw.warmPct) || 0));
  var cc = Math.max(0, Math.min(100, parseFloat(_tw.coolPct) || 0));
  var tot = wc + cc;
  if (tot === 0) return null;
  var resultCCT = Math.round((wc * parseFloat(_tw.warmCCT) + cc * parseFloat(_tw.coolCCT)) / tot);
  var rgb = _twCCTtoRGB(resultCCT);
  return { cct: resultCCT, rgb: rgb, wc: wc, cc: cc, tot: tot };
}

function _twRender() {
  var root = document.getElementById('tw-root'); if (!root) return;
  var c = _twCompute();
  function slider(id, val, fn, label, accent) {
    return '<div style="margin-bottom:14px"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><span style="font-size:12px;font-weight:700;color:'+accent+'">'+label+'</span><span id="'+id+'-disp" style="font-size:13px;font-weight:700;color:'+accent+';font-family:monospace">'+val+'%</span></div>'
      +'<input type="range" id="'+id+'" min="0" max="100" step="1" value="'+val+'" oninput="'+fn+'" style="width:100%;accent-color:'+accent+';height:20px;cursor:pointer;touch-action:none"></div>';
  }
  var warmRgb = _twCCTtoRGB(parseFloat(_tw.warmCCT)||2700);
  var coolRgb = _twCCTtoRGB(parseFloat(_tw.coolCCT)||6500);
  var gradWarm = 'rgb('+warmRgb.r+','+warmRgb.g+','+warmRgb.b+')';
  var gradCool = 'rgb('+coolRgb.r+','+coolRgb.g+','+coolRgb.b+')';
  root.innerHTML = _tWrap(
    _tH('Tunable White Blender', 'Estimate resulting CCT from warm and cool channel levels')
    +_tCard(
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">'
      +'<div>'+_tLabel('Warm CCT (K)')+'<input type="number" id="tw-wcct" min="1800" max="4000" step="100" value="'+_tw.warmCCT+'" oninput="_tw.warmCCT=this.value;_twRender()" style="width:100%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:9px 12px;color:#f0f4ff;font-size:15px;font-weight:600;outline:none;-moz-appearance:textfield;box-sizing:border-box"></div>'
      +'<div>'+_tLabel('Cool CCT (K)')+'<input type="number" id="tw-ccct" min="4000" max="10000" step="100" value="'+_tw.coolCCT+'" oninput="_tw.coolCCT=this.value;_twRender()" style="width:100%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:9px 12px;color:#f0f4ff;font-size:15px;font-weight:600;outline:none;-moz-appearance:textfield;box-sizing:border-box"></div>'
      +'</div>'
      +slider('tw-warm', _tw.warmPct, '_tw.warmPct=this.value;document.getElementById(\'tw-warm-disp\').textContent=this.value+\'%\';_twResults()', 'Warm Channel ('+_tw.warmCCT+'K)', '#fbbf24')
      +slider('tw-cool', _tw.coolPct, '_tw.coolPct=this.value;document.getElementById(\'tw-cool-disp\').textContent=this.value+\'%\';_twResults()', 'Cool Channel ('+_tw.coolCCT+'K)', '#93c5fd')
    )
    // CCT gradient bar
    +'<div style="height:24px;border-radius:8px;margin-bottom:16px;background:linear-gradient(to right,'+gradWarm+','+gradCool+');position:relative">'
    +(c ? '<div style="position:absolute;top:-4px;width:3px;height:32px;background:#fff;border-radius:2px;left:calc('+Math.round((c.cct - parseFloat(_tw.warmCCT)) / (parseFloat(_tw.coolCCT) - parseFloat(_tw.warmCCT)) * 100)+'% - 1.5px)"></div>' : '')
    +'</div>'
    +'<div id="tw-results"></div>'
  );
  _twResults();
}

function _twResults() {
  var wEl = document.getElementById('tw-warm'); if (wEl) _tw.warmPct = wEl.value;
  var cEl = document.getElementById('tw-cool'); if (cEl) _tw.coolPct = cEl.value;
  var out = document.getElementById('tw-results'); if (!out) return;
  var c = _twCompute();
  if (!c) { out.innerHTML = '<div style="text-align:center;color:#6e8aad;font-size:13px;padding:16px">Raise at least one channel above 0%</div>'; return; }
  var rgb = c.rgb;
  var swatch = 'rgb('+rgb.r+','+rgb.g+','+rgb.b+')';
  out.innerHTML = _tResultBox(
    '<div style="display:flex;align-items:center;gap:16px;margin-bottom:14px">'
    +'<div style="width:56px;height:56px;border-radius:10px;background:'+swatch+';flex-shrink:0;border:1px solid rgba(255,255,255,0.15)"></div>'
    +'<div><div style="font-size:32px;font-weight:700;color:#f0f4ff;font-family:monospace">'+c.cct.toLocaleString()+' K</div><div style="font-size:12px;color:#6e8aad">Estimated resulting CCT</div></div>'
    +'</div>'
    +'<div style="font-size:11px;color:#6e8aad;font-family:monospace;margin-bottom:8px">CCT = ('+c.wc+'% × '+_tw.warmCCT+'K + '+c.cc+'% × '+_tw.coolCCT+'K) ÷ '+(c.wc+c.cc)+'% = '+c.cct+'K</div>'
    +'<div style="font-size:11px;color:#6e8aad">Note: Weighted average is an approximation — actual perceived CCT depends on fixture phosphor curves and Duv.</div>'
  );
}

window._twRender  = _twRender;
window._twResults = _twResults;


// ════════════════════════════════════════════════
//  6. CABLE CUT LIST
// ════════════════════════════════════════════════
var _ccut = { cuts: [], nextLen: '', reelSize: 100, unit: 'm', customReel: '' };

var _ccutReelPresets = [
  { label:'50 m', val:50, u:'m' }, { label:'100 m', val:100, u:'m' }, { label:'150 m', val:150, u:'m' },
  { label:'300 m', val:300, u:'m' }, { label:'165 ft', val:165, u:'ft' }, { label:'330 ft', val:330, u:'ft' },
  { label:'500 ft', val:500, u:'ft' }, { label:'1000 ft', val:1000, u:'ft' }
];

function _ccutPlan(cuts, reelSize) {
  var sorted = cuts.slice().sort(function(a,b){return b-a;});
  var reels = [];
  sorted.forEach(function(cut) {
    var placed = false;
    for (var i = 0; i < reels.length; i++) {
      if (reels[i].rem >= cut - 0.001) { reels[i].cuts.push(cut); reels[i].rem -= cut; placed = true; break; }
    }
    if (!placed) reels.push({ cuts: [cut], rem: reelSize - cut });
  });
  return reels;
}

function _ccutRender() {
  var root = document.getElementById('ccut-root'); if (!root) return;
  var u = _ccut.unit;
  var reels = _ccut.cuts.length > 0 ? _ccutPlan(_ccut.cuts, _ccut.reelSize) : [];
  root.innerHTML = _tWrap(
    _tH('Cable Cut List', 'Enter required cut lengths — get an optimised cut plan from standard reels')
    // Unit
    +'<div style="display:flex;gap:6px;margin-bottom:16px">'+_tPill('metres', u==='m', "_ccut.unit='m';_ccutRender()")+_tPill('feet', u==='ft', "_ccut.unit='ft';_ccutRender()")+'</div>'
    // Reel size
    +_tCard(
      _tLabel('Reel Size ('+u+')')
      +'<div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:8px">'
      +_ccutReelPresets.filter(function(p){return p.u===u;}).map(function(p){ return _tPill(p.label, _ccut.reelSize===p.val, '_ccut.reelSize='+p.val+';_ccutRender()'); }).join('')
      +'</div>'
      +'<div style="display:flex;align-items:center;gap:8px">'
      +'<input type="number" id="ccut-reel" min="1" step="any" placeholder="Custom reel size" value="'+(_ccutReelPresets.some(function(p){return p.val===_ccut.reelSize&&p.u===u;})?'':_ccut.reelSize)+'" oninput="_ccut.reelSize=parseFloat(this.value)||100;_ccutRender()" style="width:160px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:8px 12px;color:#f0f4ff;font-size:14px;outline:none;-moz-appearance:textfield;box-sizing:border-box">'
      +'<span style="font-size:13px;color:#6e8aad">'+u+'</span>'
      +'</div>'
    )
    // Add cut
    +_tCard(
      '<div style="font-size:13px;font-weight:700;color:#f0f4ff;margin-bottom:10px">Add Required Cut Length</div>'
      +'<div style="display:flex;gap:8px;align-items:center">'
      +'<input type="number" id="ccut-next" min="0.01" step="any" placeholder="Length" value="'+(_ccut.nextLen||'')+'" oninput="_ccut.nextLen=this.value" onkeydown="if(event.key===\'Enter\')_ccutAdd()" style="flex:1;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:9px 12px;color:#f0f4ff;font-size:15px;font-weight:600;outline:none;-moz-appearance:textfield;box-sizing:border-box">'
      +'<span style="font-size:13px;color:#6e8aad">'+u+'</span>'
      +'<button onclick="_ccutAdd()" style="padding:9px 16px;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;border:none;background:rgba(79,142,247,0.2);color:#4f8ef7">+ Add</button>'
      +'</div>'
    )
    // Cut list
    +(_ccut.cuts.length > 0
      ? '<div style="margin-bottom:14px">'+_tLabel('Required Cuts ('+_ccut.cuts.length+')')
        +'<div style="display:flex;flex-wrap:wrap;gap:6px;">'
        +_ccut.cuts.map(function(len, i) {
          return '<div style="display:flex;align-items:center;gap:4px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:6px;padding:4px 10px">'
            +'<span style="font-size:12px;font-weight:700;color:#f0f4ff;font-family:monospace">'+len+' '+u+'</span>'
            +'<button onclick="_ccutRemove('+i+')" style="background:none;border:none;color:#6e8aad;cursor:pointer;font-size:14px;padding:0 0 0 4px;line-height:1">×</button>'
            +'</div>';
        }).join('')
        +'<button onclick="_ccut.cuts=[];_ccutRender()" style="background:none;border:none;color:#6e8aad;font-size:11px;cursor:pointer;padding:4px 8px;align-self:center">Clear all</button>'
        +'</div></div>'
      : ''
    )
    // Cut plan results
    +(reels.length > 0
      ? _tResultBox(
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">'
        +_tStatBox('Reels Required', reels.length.toString(), 'at '+_ccut.reelSize+' '+u+' each')
        +_tStatBox('Total Waste', reels.reduce(function(s,r){return s+r.rem;},0).toFixed(2)+' '+u, 'total unused cable')
        +'</div>'
        +reels.map(function(r, i) {
          return '<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:12px;margin-bottom:8px">'
            +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">'
            +'<span style="font-size:12px;font-weight:700;color:#4f8ef7">Reel '+(i+1)+'</span>'
            +'<span style="font-size:11px;color:#6e8aad">'+r.rem.toFixed(2)+' '+u+' remaining</span>'
            +'</div>'
            +'<div style="display:flex;flex-wrap:wrap;gap:5px">'
            +r.cuts.map(function(c){return '<span style="background:rgba(79,142,247,0.12);border:1px solid rgba(79,142,247,0.25);border-radius:5px;padding:2px 8px;font-size:12px;font-weight:700;color:#a3b8d4;font-family:monospace">'+c+' '+u+'</span>';}).join('')
            +'</div>'
            +'</div>';
        }).join('')
      ) : ''
    )
  );
}

function _ccutAdd() {
  var v = parseFloat(_ccut.nextLen);
  if (!v || v <= 0) return;
  if (v > _ccut.reelSize) { alert('Cut length ('+v+' '+_ccut.unit+') exceeds reel size ('+_ccut.reelSize+' '+_ccut.unit+')'); return; }
  _ccut.cuts.push(v);
  _ccut.nextLen = '';
  _ccutRender();
}

function _ccutRemove(i) { _ccut.cuts.splice(i, 1); _ccutRender(); }

window._ccutRender = _ccutRender;
window._ccutAdd    = _ccutAdd;
window._ccutRemove = _ccutRemove;


// ════════════════════════════════════════════════
//  7. OHM'S LAW CALCULATOR
// ════════════════════════════════════════════════
var _ohm = { solve: 'p', v: '', i: '', r: '', p: '' };

function _ohmCalc(vals, solve) {
  var v = parseFloat(vals.v), i = parseFloat(vals.i), r = parseFloat(vals.r), p = parseFloat(vals.p);
  var res = { v: vals.v, i: vals.i, r: vals.r, p: vals.p };
  var ok = function(x) { return isFinite(x) && x > 0; };
  if (solve === 'p') {
    if (ok(v) && ok(i)) { res.p = v * i; res.formula = 'P = V × I = '+v+' × '+i+' = '+res.p.toFixed(4); }
    else if (ok(i) && ok(r)) { res.p = i * i * r; res.formula = 'P = I² × R = '+i+'² × '+r+' = '+res.p.toFixed(4); }
    else if (ok(v) && ok(r)) { res.p = v * v / r; res.formula = 'P = V² ÷ R = '+v+'² ÷ '+r+' = '+res.p.toFixed(4); }
    else return null;
  } else if (solve === 'v') {
    if (ok(i) && ok(r)) { res.v = i * r; res.formula = 'V = I × R = '+i+' × '+r+' = '+res.v.toFixed(4); }
    else if (ok(p) && ok(i)) { res.v = p / i; res.formula = 'V = P ÷ I = '+p+' ÷ '+i+' = '+res.v.toFixed(4); }
    else if (ok(p) && ok(r)) { res.v = Math.sqrt(p * r); res.formula = 'V = √(P × R) = √('+p+' × '+r+') = '+res.v.toFixed(4); }
    else return null;
  } else if (solve === 'i') {
    if (ok(v) && ok(r)) { res.i = v / r; res.formula = 'I = V ÷ R = '+v+' ÷ '+r+' = '+res.i.toFixed(6); }
    else if (ok(p) && ok(v)) { res.i = p / v; res.formula = 'I = P ÷ V = '+p+' ÷ '+v+' = '+res.i.toFixed(6); }
    else if (ok(p) && ok(r)) { res.i = Math.sqrt(p / r); res.formula = 'I = √(P ÷ R) = √('+p+' ÷ '+r+') = '+res.i.toFixed(6); }
    else return null;
  } else if (solve === 'r') {
    if (ok(v) && ok(i)) { res.r = v / i; res.formula = 'R = V ÷ I = '+v+' ÷ '+i+' = '+res.r.toFixed(4); }
    else if (ok(p) && ok(i)) { res.r = p / (i * i); res.formula = 'R = P ÷ I² = '+p+' ÷ '+i+'² = '+res.r.toFixed(4); }
    else if (ok(v) && ok(p)) { res.r = v * v / p; res.formula = 'R = V² ÷ P = '+v+'² ÷ '+p+' = '+res.r.toFixed(4); }
    else return null;
  }
  if (res[solve] !== undefined && typeof res[solve] === 'number') {
    res[solve+'_disp'] = parseFloat(res[solve].toPrecision(5)).toString();
  }
  return res;
}

function _ohmRender() {
  var root = document.getElementById('ohm-root'); if (!root) return;
  var s = _ohm.solve;
  var fields = [
    { k:'v', label:'Voltage', unit:'V', color:'#f59e0b' },
    { k:'i', label:'Current', unit:'A', color:'#4f8ef7' },
    { k:'r', label:'Resistance', unit:'Ω', color:'#10b981' },
    { k:'p', label:'Power',    unit:'W', color:'#a855f7' }
  ];
  var result = _ohmCalc(_ohm, s);
  function fieldHtml(f) {
    var isSolve = f.k === s;
    var dispVal = isSolve ? (result && result[f.k] !== undefined ? parseFloat(result[f.k].toPrecision(5)).toString() : '') : _ohm[f.k];
    return '<div>'
      +'<div style="font-size:10px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;color:'+(isSolve?f.color:'#6e8aad')+';margin-bottom:5px">'+f.label+' ('+f.unit+')'+(isSolve?' — solving':'')+'</div>'
      +'<div style="display:flex;align-items:center;gap:6px">'
      +'<input type="number" id="ohm-'+f.k+'" '+(isSolve?'readonly':'oninput="_ohm.'+f.k+'=this.value;_ohmUpdate()"')+' min="0" step="any" value="'+escH(dispVal)+'" placeholder="'+(isSolve?'result':'')+'" style="flex:1;background:'+(isSolve?'rgba('+_ohmHex2rgba(f.color)+',0.06)':'rgba(255,255,255,0.06)')+';border:1px solid '+(isSolve?f.color.replace('#','rgba(')+'88)':'rgba(255,255,255,0.1)')+';border-radius:8px;padding:9px 10px;color:'+(isSolve?f.color:'#f0f4ff')+';font-size:16px;font-weight:700;outline:none;-moz-appearance:textfield;box-sizing:border-box;width:100%">'
      +'<span style="font-size:15px;font-weight:700;color:#6e8aad;min-width:20px">'+f.unit+'</span>'
      +'</div></div>';
  }
  root.innerHTML = _tWrap(
    _tH('Ohm\'s Law Calculator', 'V = IR — fill in any two values, choose what to solve for')
    +_tCard(
      _tLabel('Solve for')
      +'<div style="display:flex;gap:6px;margin-bottom:16px">'
      +fields.map(function(f){return _tPill(f.label, s===f.k, "_ohm.solve='"+f.k+"';_ohmRender()");}).join('')
      +'</div>'
      +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">'
      +fields.map(fieldHtml).join('')
      +'</div>'
    )
    +(result
      ? _tResultBox(
        '<div style="font-size:28px;font-weight:700;color:#4f8ef7;font-family:monospace;margin-bottom:6px">'
        +fields.filter(function(f){return f.k===s;})[0].label+' = '+parseFloat(result[s].toPrecision(5))+' '+fields.filter(function(f){return f.k===s;})[0].unit+'</div>'
        +'<div style="font-size:11px;color:#6e8aad;font-family:monospace">'+result.formula+'</div>'
        +'<div style="margin-top:14px;border-top:1px solid rgba(255,255,255,0.08);padding-top:14px;display:grid;grid-template-columns:repeat(4,1fr);gap:10px">'
        +fields.map(function(f){
          var val = f.k===s ? parseFloat(result[f.k].toPrecision(5)) : parseFloat(_ohm[f.k]);
          return '<div><div style="font-size:10px;color:#6e8aad;font-weight:700;letter-spacing:0.5px;text-transform:uppercase">'+f.label+'</div><div style="font-size:14px;font-weight:700;color:#a3b8d4;font-family:monospace">'+(isFinite(val)&&val>0?val:'-')+' '+f.unit+'</div></div>';
        }).join('')
        +'</div>'
      )
      : _tCard('<div style="text-align:center;color:#6e8aad;font-size:13px">Enter any two values above to calculate '+(fields.filter(function(f){return f.k===s;})[0].label).toLowerCase()+'</div>')
    )
    // Reference triangle
    +_tCard(
      '<div style="font-size:12px;font-weight:700;color:#f0f4ff;margin-bottom:10px">Quick Reference</div>'
      +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:11px;font-family:monospace;color:#a3b8d4">'
      +'<div>V = I × R</div><div>P = V × I</div>'
      +'<div>I = V ÷ R</div><div>P = I² × R</div>'
      +'<div>R = V ÷ I</div><div>P = V² ÷ R</div>'
      +'<div>V = P ÷ I</div><div>I = P ÷ V</div>'
      +'</div>'
    )
  );
}

function _ohmHex2rgba(hex) {
  var r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return r+','+g+','+b;
}

function _ohmUpdate() {
  ['v','i','r','p'].forEach(function(k) {
    var el = document.getElementById('ohm-'+k);
    if (el && !el.readOnly) _ohm[k] = el.value;
  });
  var result = _ohmCalc(_ohm, _ohm.solve);
  var sEl = document.getElementById('ohm-'+_ohm.solve);
  if (sEl && result) sEl.value = parseFloat(result[_ohm.solve].toPrecision(5));
  var fields = [
    { k:'v', label:'Voltage', unit:'V', color:'#f59e0b' },
    { k:'i', label:'Current', unit:'A', color:'#4f8ef7' },
    { k:'r', label:'Resistance', unit:'Ω', color:'#10b981' },
    { k:'p', label:'Power',    unit:'W', color:'#a855f7' }
  ];
  // Update result box
  var rb = document.getElementById('ohm-root');
  if (!rb) return;
  _ohmRender();
}

window._ohmRender = _ohmRender;
window._ohmUpdate = _ohmUpdate;


// ════════════════════════════════════════════════
//  8. IP RATING REFERENCE
// ════════════════════════════════════════════════
var _ipSearch = '';

var _ipSolid = [
  { n:'0', d:'No protection', note:'Indoor only — dry locations' },
  { n:'1', d:'Solid ≥ 50 mm', note:'Indoor — protected from large objects' },
  { n:'2', d:'Solid ≥ 12.5 mm', note:'Indoor — protected from fingers' },
  { n:'3', d:'Solid ≥ 2.5 mm', note:'Tools, thick wires' },
  { n:'4', d:'Solid ≥ 1 mm', note:'Most wires, screws and small tools' },
  { n:'5', d:'Dust protected', note:'Outdoor surface mount — some dust ingress allowed' },
  { n:'6', d:'Dust tight', note:'Completely sealed — outdoor, landscape fixtures' }
];
var _ipLiquid = [
  { n:'0', d:'No protection', note:'Indoor dry only' },
  { n:'1', d:'Dripping water (vertical)', note:'Condensation — not outdoor' },
  { n:'2', d:'Dripping water (15° tilt)', note:'Minimal moisture exposure' },
  { n:'3', d:'Spraying water (60° arc)', note:'Rain — wall-mount outdoor OK' },
  { n:'4', d:'Splashing water (all directions)', note:'Outdoor exposed — rain, splash' },
  { n:'5', d:'Water jets (6.3 mm nozzle)', note:'Outdoor — hose-down clean' },
  { n:'6', d:'Powerful water jets', note:'Marine, industrial wash-down' },
  { n:'7', d:'Immersion up to 1 m / 30 min', note:'Wet locations, temporary immersion' },
  { n:'8', d:'Immersion beyond 1 m', note:'Pool / fountain fixtures, in-grade' },
  { n:'9K', d:'High-pressure hot water jets', note:'Industrial wash-down at temp' }
];
var _ipCommon = [
  { code:'IP20', use:'Indoor ceiling fixtures, drivers, panels' },
  { code:'IP44', use:'Damp locations — bathroom Zone 2, exterior sheltered' },
  { code:'IP54', use:'Outdoor surface — partially sheltered, some dust' },
  { code:'IP65', use:'Outdoor exposed — rain, dust tight. Wallpacks, strip lights' },
  { code:'IP66', use:'Outdoor — high-pressure hose-down environments' },
  { code:'IP67', use:'Temporary immersion — in-ground uplights, landscape runs' },
  { code:'IP68', use:'Continuous immersion — pool, fountain, underwater lighting' },
  { code:'IP69K', use:'High-pressure wash-down — food service, industrial' }
];
var _ikCodes = [
  { code:'IK00', d:'No protection' }, { code:'IK01', d:'0.14 J' }, { code:'IK02', d:'0.2 J' },
  { code:'IK03', d:'0.35 J' }, { code:'IK04', d:'0.5 J' }, { code:'IK05', d:'0.7 J' },
  { code:'IK06', d:'1 J' }, { code:'IK07', d:'2 J — IK07+ for most outdoor fixtures' },
  { code:'IK08', d:'5 J — vandal resistant' }, { code:'IK09', d:'10 J' },
  { code:'IK10', d:'20 J — high-impact vandal resistant' }
];

function _ipRender() {
  var root = document.getElementById('ip-root'); if (!root) return;
  var q = _ipSearch.toLowerCase();
  function solidColor(n) { var v=[0,1,2,3,4,5,6].indexOf(+n); var pct=v/6; return 'rgba('+(Math.round(239-pct*150))+','+(Math.round(68+pct*120))+','+(Math.round(68+pct*50))+',0.8)'; }
  function liqColor(n)   { var v=[0,1,2,3,4,5,6,7,8,9].indexOf(n==='9K'?9:+n); var pct=v/9; return 'rgba('+(Math.round(239-pct*200))+','+(Math.round(68+pct*150))+','+(Math.round(68+pct*80))+',0.8)'; }
  var filterRow = function(rows) { if (!q) return rows; return rows.filter(function(r){ return JSON.stringify(r).toLowerCase().indexOf(q)>=0; }); };
  function tableRows(data, keyFn) {
    return filterRow(data).map(function(row) {
      return '<tr style="border-bottom:1px solid rgba(255,255,255,0.05)">'
        +'<td style="padding:9px 12px;font-size:12px;font-weight:700;color:#f0f4ff;font-family:monospace;white-space:nowrap">'+keyFn(row)+'</td>'
        +'<td style="padding:9px 12px;font-size:12px;color:#a3b8d4">'+row.d+'</td>'
        +'<td style="padding:9px 12px;font-size:11px;color:#6e8aad">'+row.note+'</td>'
        +'</tr>';
    }).join('');
  }
  root.innerHTML = _tWrap(
    _tH('IP Rating Reference', 'Ingress Protection and Impact Protection ratings for lighting fixtures')
    +'<input type="search" placeholder="Search ratings..." value="'+escH(_ipSearch)+'" oninput="_ipSearch=this.value;_ipRender()" style="width:100%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:10px 14px;color:#f0f4ff;font-size:14px;outline:none;box-sizing:border-box;margin-bottom:20px">'
    // Common in lighting
    +'<div style="font-size:13px;font-weight:700;color:#f0f4ff;margin-bottom:10px">Common Ratings in Lighting</div>'
    +(filterRow(_ipCommon).length > 0 ? '<div style="display:flex;flex-direction:column;gap:6px;margin-bottom:20px">'+filterRow(_ipCommon).map(function(r){
      return '<div style="display:flex;align-items:flex-start;gap:12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:8px;padding:10px 12px">'
        +'<span style="font-size:12px;font-weight:800;color:#4f8ef7;font-family:monospace;min-width:48px">'+r.code+'</span>'
        +'<span style="font-size:12px;color:#a3b8d4">'+r.use+'</span>'
        +'</div>';
    }).join('')+'</div>' : '')
    // First digit
    +'<div style="font-size:13px;font-weight:700;color:#f0f4ff;margin-bottom:2px">First Digit — Solid Particle Protection</div>'
    +'<div style="font-size:11px;color:#6e8aad;margin-bottom:10px">IP<span style="color:#f59e0b">X</span>Y — the X digit</div>'
    +('<table style="width:100%;border-collapse:collapse;margin-bottom:20px"><thead><tr>'
      +'<th style="padding:6px 12px;font-size:10px;font-weight:700;text-transform:uppercase;color:#6e8aad;text-align:left;border-bottom:1px solid rgba(255,255,255,0.1);width:40px">Digit</th>'
      +'<th style="padding:6px 12px;font-size:10px;font-weight:700;text-transform:uppercase;color:#6e8aad;text-align:left;border-bottom:1px solid rgba(255,255,255,0.1)">Solid Protection</th>'
      +'<th style="padding:6px 12px;font-size:10px;font-weight:700;text-transform:uppercase;color:#6e8aad;text-align:left;border-bottom:1px solid rgba(255,255,255,0.1)">Typical Use</th>'
      +'</tr></thead><tbody>'+tableRows(_ipSolid, function(r){ return '<span style="background:'+solidColor(r.n)+';padding:1px 7px;border-radius:4px">'+r.n+'</span>'; })+'</tbody></table>')
    // Second digit
    +'<div style="font-size:13px;font-weight:700;color:#f0f4ff;margin-bottom:2px">Second Digit — Liquid Ingress Protection</div>'
    +'<div style="font-size:11px;color:#6e8aad;margin-bottom:10px">IPX<span style="color:#4f8ef7">Y</span> — the Y digit</div>'
    +('<table style="width:100%;border-collapse:collapse;margin-bottom:20px"><thead><tr>'
      +'<th style="padding:6px 12px;font-size:10px;font-weight:700;text-transform:uppercase;color:#6e8aad;text-align:left;border-bottom:1px solid rgba(255,255,255,0.1);width:50px">Digit</th>'
      +'<th style="padding:6px 12px;font-size:10px;font-weight:700;text-transform:uppercase;color:#6e8aad;text-align:left;border-bottom:1px solid rgba(255,255,255,0.1)">Liquid Protection</th>'
      +'<th style="padding:6px 12px;font-size:10px;font-weight:700;text-transform:uppercase;color:#6e8aad;text-align:left;border-bottom:1px solid rgba(255,255,255,0.1)">Typical Use</th>'
      +'</tr></thead><tbody>'+tableRows(_ipLiquid, function(r){ return '<span style="background:'+liqColor(r.n)+';padding:1px 7px;border-radius:4px">'+r.n+'</span>'; })+'</tbody></table>')
    // IK codes
    +'<div style="font-size:13px;font-weight:700;color:#f0f4ff;margin-bottom:10px">IK Codes — Impact Protection</div>'
    +'<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:6px;margin-bottom:20px">'
    +filterRow(_ikCodes).map(function(r){
      return '<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:8px;padding:8px 10px"><div style="font-size:12px;font-weight:800;color:#10b981;font-family:monospace;margin-bottom:2px">'+r.code+'</div><div style="font-size:11px;color:#6e8aad">'+r.d+'</div></div>';
    }).join('')
    +'</div>'
  );
}

window._ipRender = _ipRender;
