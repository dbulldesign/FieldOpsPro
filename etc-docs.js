// ═══════════════════════════════════════════════
//  ETC SPEC LIBRARY DATA + RENDER
// ═══════════════════════════════════════════════
var _etcDocs = [
  // Consoles — Eos Family
  {name:'Eos Ti Console',cat:'Consoles',desc:'Flagship Eos Ti lighting control console — 2×21" touchscreens, 96 motorised faders, full DMX/Art-Net/sACN output.',url:'https://www.etcconnect.com/WorkArea/DownloadAsset.aspx?id=10737481191'},
  {name:'Ion Xe Console',cat:'Consoles',desc:'Ion Xe mid-size console — 2 integral screens, 2,048 outputs, Eos family software.',url:'https://www.etcconnect.com/WorkArea/DownloadAsset.aspx?id=10737492145'},
  {name:'Ion Xe 20 Console',cat:'Consoles',desc:'Ion Xe with 20 motorised faders — compact form factor for touring and fixed install.',url:'https://www.etcconnect.com/WorkArea/DownloadAsset.aspx?id=10737492144'},
  {name:'Ion Xe RPU (Remote Processor Unit)',cat:'Consoles',desc:'Rack-mount remote processor unit for Ion Xe — runs full Eos software headlessly.',url:'https://www.etcconnect.com/WorkArea/DownloadAsset.aspx?id=10737492138'},
  {name:'Element 2 Console',cat:'Consoles',desc:'Element 2 — 500 cue, 1,024-output console with 40 submasters. Entry Eos family.',url:'https://www.etcconnect.com/WorkArea/DownloadAsset.aspx?id=10737494273'},
  {name:'Eos Apex 5 Console',cat:'Consoles',desc:'Eos Apex 5 — next-gen console with OLED fader tiles and expanded I/O.',url:'https://www.etcconnect.com/WorkArea/DownloadAsset.aspx?id=10737510498'},
  {name:'Eos Apex 10 Console',cat:'Consoles',desc:'Eos Apex 10 — mid-size Apex platform console.',url:'https://www.etcconnect.com/WorkArea/DownloadAsset.aspx?id=10737510499'},
  {name:'Eos Apex 20 Console',cat:'Consoles',desc:'Eos Apex 20 — flagship Apex platform console.',url:'https://www.etcconnect.com/WorkArea/DownloadAsset.aspx?id=10737510500'},
  {name:'ColorSource 20 Console',cat:'Consoles',desc:'ColorSource 20 — 20-fader entry-level console with 1,024 DMX outputs and full color engine.',url:'https://www.etcconnect.com/WorkArea/DownloadAsset.aspx?id=10737484358'},
  {name:'ColorSource 40 Console',cat:'Consoles',desc:'ColorSource 40 — 40-fader version of the entry-level ColorSource platform.',url:'https://www.etcconnect.com/WorkArea/DownloadAsset.aspx?id=10737484358'},
  {name:'Eos Family Documentation Index',cat:'Consoles',desc:'Landing page for all current Eos family datasheets, user manuals, and specs.',url:'https://www.etcconnect.com/Products/Consoles/Eos-Consoles/All-Eos-Downloads/Datasheets.aspx'},
  // Console Accessories
  {name:'Universal Fader Wing',cat:'Console Accessory',desc:'60-fader expansion wing for any Eos family console — USB, motorised faders.',url:'https://www.etcconnect.com/WorkArea/DownloadAsset.aspx?id=10737481197'},
  {name:'Universal Fader Wing Spec Sheet',cat:'Console Accessory',desc:'Formal specification document for the Universal Fader Wing (dimensions, power, connectivity).',url:'https://www.etcconnect.com/WorkArea/DownloadAsset.aspx?id=10737462215'},
  // LED Fixtures — Source Four LED
  {name:'Source Four LED Series 3 Datasheet',cat:'LED Fixture',desc:'Source Four LED Series 3 (Lustr X8 and Daylight HD variants) — photometrics, beam angles, and specs.',url:'https://www.etcconnect.com/WorkArea/DownloadAsset.aspx?id=10737506242'},
  {name:'Source Four LED Series 3 Spec Sheet',cat:'LED Fixture',desc:'Detailed specification sheet for the Series 3 platform including fixture dimensions and electrical data.',url:'https://www.etcconnect.com/WorkArea/DownloadAsset.aspx?id=10737513330'},
  {name:'Source Four LED Series 3 Documentation',cat:'LED Fixture',desc:'Full documentation index — all S4 LED Series 3 downloads including IES files and installation guides.',url:'https://www.etcconnect.com/Products/Entertainment-Fixtures/Source-Four-LED-Series-3/Documentation.aspx'},
  // Ellipsoidals — Source Four Standard
  {name:'Source Four 10° Ellipsoidal',cat:'Ellipsoidal',desc:'Spec sheet for the Source Four 10° narrow-beam ellipsoidal (hard-edge spot fixture).',url:'https://www.etcconnect.com/WorkArea/DownloadAsset.aspx?id=10737460591'},
  {name:'Source Four 36° Ellipsoidal',cat:'Ellipsoidal',desc:'Spec sheet for the Source Four 36° medium-beam ellipsoidal.',url:'https://www.etcconnect.com/workarea/DownloadAsset.aspx?id=10737460423'},
  {name:'Source Four 50° Ellipsoidal',cat:'Ellipsoidal',desc:'Spec sheet for the Source Four 50° wide-beam ellipsoidal.',url:'https://www.etcconnect.com/WorkArea/DownloadAsset.aspx?id=10737460305'},
  {name:'Source Four Zoom Ellipsoidal',cat:'Ellipsoidal',desc:'Spec sheet for the Source Four variable-beam zoom ellipsoidal.',url:'https://www.etcconnect.com/WorkArea/DownloadAsset.aspx?id=10737460417'},
  {name:'Source Four Mini LED',cat:'Ellipsoidal',desc:'Spec sheet for the Source Four Mini LED — compact LED ellipsoidal replacement for the Jr.',url:'https://www.etcconnect.com/workarea/DownloadAsset.aspx?id=10737484388'},
  // LED Wash — Selador
  {name:'Selador Classic Series Lustr Spec',cat:'LED Wash',desc:'Spec sheet for the Selador Classic Lustr LED wash luminaire with 7-colour mixing.',url:'https://www.etcconnect.com/workarea/DownloadAsset.aspx?id=10737460389'},
  {name:'Selador Application Sheet',cat:'LED Wash',desc:'Application sheet covering the full Selador LED wash fixture family.',url:'https://www.etcconnect.com/workarea/downloadasset.aspx?Id=10737461771'},
  // Dimmer Racks — Sensor3
  {name:'Sensor3 120V Power Control Modules',cat:'Dimmer Rack',desc:'Datasheet for 120V Sensor3 dimmer and relay modules — electrical and physical specs.',url:'https://www.etcconnect.com/WorkArea/DownloadAsset.aspx?id=10737515007'},
  {name:'Sensor3 240V Power Control Modules',cat:'Dimmer Rack',desc:'Datasheet for 240V Sensor3 dimmer modules.',url:'https://www.etcconnect.com/WorkArea/DownloadAsset.aspx?id=10737515006'},
  {name:'Sensor3 230V Power Control Modules (CE)',cat:'Dimmer Rack',desc:'Datasheet for 230V CE-rated Sensor3 dimmer modules.',url:'https://www.etcconnect.com/WorkArea/DownloadAsset.aspx?id=10737515005'},
  {name:'Sensor3 120V Installation Enclosures (SR3)',cat:'Dimmer Rack',desc:'Datasheet for SR3 120V installation rack enclosures.',url:'https://www.etcconnect.com/WorkArea/DownloadAsset.aspx?id=10737513958'},
  {name:'Sensor3 240V Installation Enclosures (HSR3)',cat:'Dimmer Rack',desc:'Datasheet for HSR3 240V installation rack enclosures.',url:'https://www.etcconnect.com/WorkArea/DownloadAsset.aspx?id=10737504423'},
  {name:'Sensor3 230V Installation Enclosures (ESR3)',cat:'Dimmer Rack',desc:'Datasheet for ESR3 230V CE-rated installation racks.',url:'https://www.etcconnect.com/WorkArea/DownloadAsset.aspx?id=10737504438'},
  {name:'Sensor3 Large Touring Rack (SP3)',cat:'Dimmer Rack',desc:'Datasheet for the large-frame Sensor3 touring dimmer rack.',url:'https://www.etcconnect.com/WorkArea/DownloadAsset.aspx?id=10737460569'},
  {name:'Sensor3 Small Touring Rack (SP3)',cat:'Dimmer Rack',desc:'Datasheet for the small-frame Sensor3 touring dimmer rack.',url:'https://www.etcconnect.com/WorkArea/DownloadAsset.aspx?id=10737460024'},
  {name:'Sensor3 Documentation Index',cat:'Dimmer Rack',desc:'Full documentation index for Sensor3 — all datasheets, specs, and installation manuals.',url:'https://www.etcconnect.com/Products/Power-Controls/Racks-and-Panels/Sensor3/Documentation.aspx'},
  // Dimmer Modules
  {name:'CEM3 Power Control Module — Datasheet',cat:'Dimmer Module',desc:'Datasheet for the CEM3 control electronics module used in Sensor3 racks.',url:'https://www.etcconnect.com/WorkArea/DownloadAsset.aspx?id=10737460330'},
  {name:'CEM3 Power Control Module — Spec',cat:'Dimmer Module',desc:'Formal specification document for the CEM3 module.',url:'https://www.etcconnect.com/WorkArea/DownloadAsset.aspx?id=10737462340'},
  {name:'PhaseAdept Auto-Sensing Dimmer Module',cat:'Dimmer Module',desc:'Datasheet for the PhaseAdept module — auto-detects load type, forward/reverse phase.',url:'https://www.etcconnect.com/WorkArea/DownloadAsset.aspx?id=10737498696'},
  // Control Electronics — CEM+ / Unison
  {name:'Sensor+ CEM+ Racks Spec',cat:'Control Electronics',desc:'Spec sheet for Sensor+ racks with CEM+ control electronics module.',url:'https://www.etcconnect.com/workarea/DownloadAsset.aspx?id=10737460203',legacy:true},
  {name:'CEM Classic Documentation Index',cat:'Control Electronics',desc:'Full documentation for the legacy CEM Classic control electronics module.',url:'https://www.etcconnect.com/Products/Legacy/Power-Controls/Sensor/CEM-Classic/Documentation.aspx',legacy:true},
  {name:'Unison 120V Dimming Racks Spec',cat:'Control Electronics',desc:'Spec for Unison 120V dimming racks with various module configs.',url:'https://www.etcconnect.com/workarea/DownloadAsset.aspx?id=10737460646',legacy:true},
  {name:'Unison CE (DRd) 230V Dimming Rack',cat:'Control Electronics',desc:'Spec for CE-rated Unison DRd 230V rack enclosure.',url:'https://www.etcconnect.com/workarea/DownloadAsset.aspx?id=10737504440',legacy:true},
  {name:'Unison ELV10 Reverse Phase Module',cat:'Control Electronics',desc:'Spec for the Unison ELV10 120V electronic reverse-phase dimmer module.',url:'https://www.etcconnect.com/workarea/DownloadAsset.aspx?id=10737460393',legacy:true},
  // Architectural Control — Paradigm
  {name:'Paradigm Architectural Control Processor (P-ACP)',cat:'Architectural Control',desc:'Datasheet for the Paradigm ACP — central processor for fixed architectural lighting systems.',url:'https://www.etcconnect.com/WorkArea/DownloadAsset.aspx?id=10737481308'},
  {name:'Paradigm Architectural Controls Brochure',cat:'Architectural Control',desc:'Product brochure for the full Paradigm architectural lighting control system.',url:'https://www.etcconnect.com/WorkArea/DownloadAsset.aspx?id=10737494181'},
  {name:'Paradigm Documentation Index',cat:'Architectural Control',desc:'Full documentation index for Paradigm — datasheets, manuals, and specs.',url:'https://www.etcconnect.com/Products/Architectural-Systems/Paradigm/Control-and-Dimming/Architectural-Controls/Documentation.aspx'},
  // Architectural Control — Mosaic
  {name:'Mosaic Show Controller (MSC)',cat:'Architectural Control',desc:'Datasheet for the Mosaic Show Controller — standalone show and installation control processor.',url:'https://www.etcconnect.com/WorkArea/DownloadAsset.aspx?id=10737481036'},
  {name:'Mosaic Expansion I/O Modules',cat:'Architectural Control',desc:'Spec for Mosaic expansion I/O modules — contact closures, relay outputs.',url:'https://www.etcconnect.com/workarea/DownloadAsset.aspx?id=10737460548'},
  {name:'Mosaic Wall-Mount Button Station',cat:'Architectural Control',desc:'Spec for Mosaic wall-mount button station controls.',url:'https://www.etcconnect.com/workarea/DownloadAsset.aspx?id=10737479299'},
  {name:'Mosaic Touchscreen Station',cat:'Architectural Control',desc:'Spec for the Mosaic touchscreen wall station.',url:'https://www.etcconnect.com/workarea/DownloadAsset.aspx?id=10737492519'},
  {name:'Mosaic Show Controller Brochure',cat:'Architectural Control',desc:'Product brochure for the full Mosaic show controller family.',url:'https://www.etcconnect.com/WorkArea/DownloadAsset.aspx?id=10737494180'},
  {name:'Mosaic Documentation Index',cat:'Architectural Control',desc:'Full documentation index for Mosaic controllers.',url:'https://www.etcconnect.com/Products/Architectural-Systems/Mosaic/Controllers/Show-Controller/Documentation.aspx'},
  // DMX Gateways — Response Mk2
  {name:'Response Mk2 — 1-Port Gateway',cat:'DMX Gateway',desc:'Datasheet for the 1-port Response Mk2 Art-Net/sACN to DMX512 gateway.',url:'https://www.etcconnect.com/WorkArea/DownloadAsset.aspx?id=10737499814'},
  {name:'Response Mk2 — 2-Port Gateway',cat:'DMX Gateway',desc:'Datasheet for the 2-port Response Mk2 gateway.',url:'https://www.etcconnect.com/WorkArea/DownloadAsset.aspx?id=10737499813'},
  {name:'Response Mk2 — 4-Port Gateway',cat:'DMX Gateway',desc:'Datasheet for the 4-port Response Mk2 gateway.',url:'https://www.etcconnect.com/WorkArea/DownloadAsset.aspx?id=10737499812'},
  {name:'Response Mk2 — 8-Port Gateway',cat:'DMX Gateway',desc:'Datasheet for the 8-port Response Mk2 gateway.',url:'https://www.etcconnect.com/WorkArea/DownloadAsset.aspx?id=10737519939'},
  {name:'Response Mk2 — DIN-Rail Gateways',cat:'DMX Gateway',desc:'Datasheet for the DIN-rail mount Response Mk2 gateway variants.',url:'https://www.etcconnect.com/WorkArea/DownloadAsset.aspx?id=10737506241'},
  {name:'Response Mk2 Documentation Index',cat:'DMX Gateway',desc:'Full documentation index for all Response Mk2 gateway variants.',url:'https://www.etcconnect.com/Products/Networking/Response-Mk2/Documentation.aspx'},
  // Networking
  {name:'Net3 Concert Software — Documentation',cat:'Networking Software',desc:'Product page for Net3 Concert — ETC network configuration and management software.',url:'https://www.etcconnect.com/Products/Networking/System-Configuration/Software/Concert.aspx'},
  {name:'Net3 Other Documentation',cat:'Networking Software',desc:'ETC documentation index for Net3 networking products.',url:'https://www.etcconnect.com/Support/Networking/Net-3/Other-Documentation.aspx'}
];

function _etcDocsRender() {
  _specLibRender('etcdocs-root', 'ETC (Electronic Theatre Controls)', '79,142,247', _etcDocs);
}
window._etcDocsRender = _etcDocsRender;
