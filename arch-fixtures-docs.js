// ═══════════════════════════════════════════════
//  ARCHITECTURAL FIXTURES & POWER SUPPLIES
// ═══════════════════════════════════════════════
var _archFixturesDocs = [
  // ── Linear Fixtures ──
  {name:'Focal Point Groove Linear',cat:'Linear Fixture',desc:'Recessed linear LED family — narrow aperture, tunable white and static CCT options, flanged and flangeless trims.',url:'https://focalpointlights.com/files/spec-sheets/FP_Groove_SpecSheet.pdf'},
  {name:'Focal Point Tilt Linear',cat:'Linear Fixture',desc:'Adjustable-aim linear LED — 30° tilt range, ideal for wall-wash and accent applications.',url:'https://focalpointlights.com/files/spec-sheets/FP_Tilt_SpecSheet.pdf'},
  {name:'Lumenwerx Line Recessed Linear',cat:'Linear Fixture',desc:'Low-profile recessed linear LED in 4" and 6" aperture widths, continuous-run capable.',url:'https://www.lumenwerx.com/en/products/recessed/line/'},
  {name:'Vode Phos Linear Suspension',cat:'Linear Fixture',desc:'Slim suspended linear LED, direct/indirect distribution, field-adjustable ratio, tunable white.',url:'https://vode.com/product/phos/'},
  {name:'Selux DQ Linear LED',cat:'Linear Fixture',desc:'Architectural recessed and surface linear family — high CRI, precise optics, DALI dimmable.',url:'https://www.selux.com/us/en/products/indoor/recessed/'},
  {name:'Amerlux Lira Recessed Linear',cat:'Linear Fixture',desc:'Narrow-aperture recessed linear, 1" slot, continuous runs up to 40 ft with single feed.',url:'https://amerlux.com/products/lira/'},
  {name:'Axis Lighting Skim Linear',cat:'Linear Fixture',desc:'Ultra-slim surface and suspended linear LED, 2" wide profile, driver remote or on-board.',url:'https://axislighting.com/product/skim/'},
  {name:'Lumenpulse Lumenbeam Linear',cat:'Linear Fixture',desc:'High-output recessed linear for large-scale commercial and institutional projects.',url:'https://www.lumenpulse.com/products/lumenbeam-linear'},
  {name:'USAI LCO Recessed Linear',cat:'Linear Fixture',desc:'Low-profile recessed linear with optically precise reflectors, 90+ CRI, 2700–5000K.',url:'https://www.usailighting.com/product/lco'},
  {name:'Deltalight LINO Recessed Linear',cat:'Linear Fixture',desc:'European-style minimal recessed linear — surface, recessed, pendant; flanged and flangeless.',url:'https://www.deltalight.com/en/products/lino'},

  // ── Recessed Downlights ──
  {name:'USAI BeveLED 2.0 Round Adjustable',cat:'Recessed Downlight',desc:'Adjustable aperture downlight, 4" and 6", 15°–40° beam, tunable white, up to 3000 lm.',url:'https://www.usailighting.com/product/bevelED-adjustable'},
  {name:'USAI BeveLED 2.0 Round Fixed',cat:'Recessed Downlight',desc:'Fixed aperture downlight, 4" and 6", high CRI, narrow to wide beam options.',url:'https://www.usailighting.com/product/bevelED-fixed'},
  {name:'Lucifer Lighting Staccato Downlight',cat:'Recessed Downlight',desc:'Precision-engineered minimal aperture downlight — 2" round and square trims, dark-sky compliant.',url:'https://luciferlighting.com/Products/Downlights'},
  {name:'Nora Lighting NIOTQ Quantum Downlight',cat:'Recessed Downlight',desc:'Quantum adjustable LED downlight, 4" and 6", 90+ CRI, CCT selectable 2700–5000K.',url:'https://www.noralighting.com/niotq-quantum-adjustable-downlight/'},
  {name:'Nora Lighting NIO-4 / NIO-6 Iolite Series',cat:'Recessed Downlight',desc:'Iolite recessed downlight family — fixed, adjustable, wall wash trims, 90+ CRI.',url:'https://www.noralighting.com/iolite/'},
  {name:'Juno Trac-Lites & Recessed (Acuity)',cat:'Recessed Downlight',desc:'Acuity/Juno recessed downlight family spec sheets — 4" and 6" LED retrofit and new construction.',url:'https://www.acuitybrands.com/brands/juno'},
  {name:'Prudential Lighting LED Downlight',cat:'Recessed Downlight',desc:'Commercial recessed downlight in 4" and 6" formats — open reflector and lensed trims.',url:'https://www.prudentiallighting.com/products/downlights/'},
  {name:'Gammalux Gimble Adjustable Downlight',cat:'Recessed Downlight',desc:'Trim-free adjustable downlight, 40° tilt, 358° rotation, airtight housing available.',url:'https://www.gammalux.com/products/downlights'},
  {name:'Belfer Architectural Recessed Downlight',cat:'Recessed Downlight',desc:'Deep-cone downlight family — multiple aperture diameters, specular and matte finishes.',url:'https://www.belfer.com/downlights/'},
  {name:'Mark Architectural Trimless Downlight',cat:'Recessed Downlight',desc:'Plaster-in trimless downlight, 2"–6" aperture, very-high-CRI LED modules.',url:'https://www.markarchitectural.com/products/downlights'},

  // ── Adjustable Accent ──
  {name:'Lucifer Lighting Coppa Adjustable Accent',cat:'Adjustable Accent',desc:'Recessed adjustable accent, narrow to flood beam, 10°–40°, 95+ CRI, flangeless trim.',url:'https://luciferlighting.com/Products/Adjustable-Accent'},
  {name:'Iguzzini Laser Blade Adjustable',cat:'Adjustable Accent',desc:'Blade-profile recessed adjustable, minimal aperture, anti-glare baffle, DALI dimming.',url:'https://www.iguzzini.com/en/products/indoor/recessed/'},
  {name:'Erco Parscan Adjustable Spotlight',cat:'Adjustable Accent',desc:'Recessed adjustable spotlight — 15°–55° beam angle, precise optic system, 95+ CRI.',url:'https://www.erco.com/en/products/indoor/recessed-luminaires/'},
  {name:'Zumtobel Panos Adjustable',cat:'Adjustable Accent',desc:'Adjustable recessed luminaire — DALI2 ready, tunable white, multiple aperture sizes.',url:'https://www.zumtobel.com/en-gb/products/panos.html'},
  {name:'Artemide Vector Adjustable',cat:'Adjustable Accent',desc:'Architectural adjustable accent, 2" and 3" round, high-quality reflector optics, 90+ CRI.',url:'https://www.artemide.com/en/subfamily/architectural/adjustable-recessed'},
  {name:'Axis Lighting Gyro Adjustable',cat:'Adjustable Accent',desc:'360° rotation, 35° tilt adjustable accent — recessed round, multiple lumen packages.',url:'https://axislighting.com/product/gyro/'},

  // ── Track & Surface ──
  {name:'Erco Parscan Track Spotlight',cat:'Track & Surface',desc:'Track-mounted spotlight with precise beam control — 3-circuit and 1-circuit variants.',url:'https://www.erco.com/en/products/indoor/track-mounted-luminaires/'},
  {name:'Iguzzini Laser Blade Track',cat:'Track & Surface',desc:'Ultra-slim track spotlight, blade profile, 95+ CRI, multiple beam angles.',url:'https://www.iguzzini.com/en/products/indoor/track-lights/'},
  {name:'Acuity Juno Track System',cat:'Track & Surface',desc:'Juno track heads and rail system — 1-circuit, 2-circuit and 3-circuit configurations.',url:'https://www.acuitybrands.com/brands/juno/juno-track'},

  // ── Pendant ──
  {name:'Focal Point Seem 4 Pendant',cat:'Pendant',desc:'Architectural linear pendant — direct/indirect distribution, curved end caps, tunable white.',url:'https://focalpointlights.com/product/seem-4/'},
  {name:'Vode Hue Linear Pendant',cat:'Pendant',desc:'Minimal suspended linear LED pendant, direct-only and direct/indirect, 24V or 48V DC.',url:'https://vode.com/product/hue/'},
  {name:'Artemide Talo Pendant',cat:'Pendant',desc:'Minimalist suspended linear — anodised aluminium, 90+ CRI, 2700K or 3000K.',url:'https://www.artemide.com/en/subfamily/talo'},

  // ── Outdoor / Facade ──
  {name:'Erco Grasshopper Ground Fixture',cat:'Outdoor',desc:'In-grade uplight for facade and landscape applications — IP67, multiple beam angles.',url:'https://www.erco.com/en/products/outdoor/in-ground/'},
  {name:'Iguzzini Trace Wall Washer',cat:'Outdoor',desc:'Linear wall-wash luminaire for facades — IP65, single and asymmetric distributions.',url:'https://www.iguzzini.com/en/products/outdoor/'},
  {name:'Zumtobel Resclite Outdoor Recessed',cat:'Outdoor',desc:'Recessed outdoor luminaire — in-ground and in-floor, IP67, wide/narrow beam.',url:'https://www.zumtobel.com/en-gb/products/outdoor-recessed.html'},
  {name:'RAB Lighting WPLED Wallpack',cat:'Outdoor',desc:'LED wallpack with full-cutoff optics, dusk-to-dawn photocell option, DLC Premium listed.',url:'https://www.rablighting.com/products/wallpacks'},

  // ── LED Drivers ──
  {name:'eldoLED SOLOdrive 75i',cat:'LED Driver',desc:'Constant-current LED driver, 75W, 0–100% flicker-free dimming, DALI2 / Lutron / 0–10V.',url:'https://www.eldoled.com/led-drivers/solodrive/'},
  {name:'eldoLED POWERdrive 150e',cat:'LED Driver',desc:'High-efficiency constant-current driver, 150W, EcoSystem / DALI2 / 0–10V, THD <10%.',url:'https://www.eldoled.com/led-drivers/powerdrive/'},
  {name:'Tridonic EXCITE 50 fixC SR',cat:'LED Driver',desc:'Constant-current driver, 50W, DALI2 searchable / SR wireless ready, remote mount.',url:'https://www.tridonic.com/com/en/products/led-drivers/constant-current.asp'},
  {name:'Tridonic PREMIUM 75W DALI2',cat:'LED Driver',desc:'75W constant-current DALI2 driver, tunable white output, high precision dimming to 0.1%.',url:'https://www.tridonic.com/com/en/products/led-drivers.asp'},
  {name:'Inventronics EUM-075S280DT',cat:'LED Driver',desc:'75W constant-current driver, 280mA–700mA adjustable, 0–10V / DALI, UL listed.',url:'https://www.inventronics-co.com/product/eum-series/'},
  {name:'TCI DC MAXI JOLLY DALI Driver',cat:'LED Driver',desc:'Constant-current DC DALI driver, 100W, widerange CC output, IP20, DIN rail mountable.',url:'https://www.tcilighting.com/en/prodotti/dc-maxi-jolly-dali/'},
  {name:'TCI Taylor DALI Linear Driver',cat:'LED Driver',desc:'Ultra-slim DALI constant-current driver for recessed linear luminaires, 50W.',url:'https://www.tcilighting.com/en/prodotti/taylor/'},
  {name:'Osram OTi DALI Driver',cat:'LED Driver',desc:'Osram constant-current DALI driver family, 35W–75W, NFC programmable output current.',url:'https://www.osram.com/ecat/Constant Current LED Control Gear/com/en/GPS01_1023560/'},

  // ── Power Supplies (Constant Voltage) ──
  {name:'Mean Well ELG-100 LED Driver',cat:'Power Supply',desc:'100W CV+CC LED driver, 24V or 48V output, 3-in-1 dimming (0–10V / PWM / resistance), IP67.',url:'https://www.meanwell.com/webapp/product/search.aspx?prod=ELG-100'},
  {name:'Mean Well ELG-150 LED Driver',cat:'Power Supply',desc:'150W CV+CC LED driver, 24V or 48V output, 3-in-1 dimming, IP65/IP67, UL8750 listed.',url:'https://www.meanwell.com/webapp/product/search.aspx?prod=ELG-150'},
  {name:'Mean Well ELG-200 LED Driver',cat:'Power Supply',desc:'200W CV+CC LED driver, 24V or 48V output, 3-in-1 dimming, IP65/IP67.',url:'https://www.meanwell.com/webapp/product/search.aspx?prod=ELG-200'},
  {name:'Mean Well HLG-150H LED Driver',cat:'Power Supply',desc:'150W high-efficiency (94%) constant-voltage driver, 24V, 3-in-1 dimming, IP67.',url:'https://www.meanwell.com/webapp/product/search.aspx?prod=HLG-150H'},
  {name:'Mean Well HLG-240H LED Driver',cat:'Power Supply',desc:'240W constant-voltage driver, 24V or 48V, 3-in-1 dimming, IP65/IP67.',url:'https://www.meanwell.com/webapp/product/search.aspx?prod=HLG-240H'},
  {name:'Mean Well CLG-150 Constant Current',cat:'Power Supply',desc:'150W constant-current LED driver, adjustable output 43–86V / 1.5–2.1A, IP67.',url:'https://www.meanwell.com/webapp/product/search.aspx?prod=CLG-150'},
  {name:'Mean Well PWM-120D Dimming Supply',cat:'Power Supply',desc:'120W PWM-output constant voltage supply, 24V, phase-cut and 0–10V dimming input.',url:'https://www.meanwell.com/webapp/product/search.aspx?prod=PWM-120D'},
  {name:'Mean Well Product Library & Spec PDFs',cat:'Power Supply',desc:'Full Mean Well product catalog — search and download spec sheets for all LED driver series.',url:'https://www.meanwell.com/download_product.aspx'},
  {name:'MOSO XRC-200D LED Power Supply',cat:'Power Supply',desc:'200W triac/0–10V dimmable constant-voltage supply, 24V DC, high power factor, IP20.',url:'https://www.moso-power.com/power-supply/led-driver/'},
  {name:'Inventronics EUC Constant Voltage Series',cat:'Power Supply',desc:'Constant-voltage LED power supply, 24V/48V, 35–150W range, 0–10V and DALI dimming.',url:'https://www.inventronics-co.com/product/euc-series/'}
];

function _archFixturesRender() {
  _specLibRender('archfixtures-root', 'Architectural Fixtures & Power Supplies', '16,185,129', _archFixturesDocs);
}
window._archFixturesRender = _archFixturesRender;
