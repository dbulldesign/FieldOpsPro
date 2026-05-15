// ═══════════════════════════════════════════════
//  LUTRON SPEC LIBRARY DATA + RENDER
// ═══════════════════════════════════════════════
var _lutronDocs = [
  // HomeWorks QS — Processor
  {name:'HomeWorks QS Processor (HQP6)',cat:'Processor',desc:'Spec submittal for the HomeWorks QS central processor — main QS bus controller.',url:'https://assets.lutron.com/a/documents/369-376_hwqs_processor.pdf'},
  {name:'HomeWorks QSX Processor',cat:'Processor',desc:'Spec for QSX processor — supports Clear Connect Type X gateway and expanded RF.',url:'https://assets.lutron.com/a/documents/3691127_eng.pdf'},
  {name:'HomeWorks QSX System Equipment Overview',cat:'System',desc:'Equipment type overview for the full HomeWorks QSX platform.',url:'https://www.lutron.com/TechnicalDocumentLibrary/Homeworks_QSX_Equipment.pdf'},
  {name:'HomeWorks QS DIN Panels and Accessories',cat:'Panel',desc:'Spec for DIN rail panels and system accessories for HWQS.',url:'https://www.lutron.com/TechnicalDocumentLibrary/369788_ENG.pdf'},
  {name:'HomeWorks QS System Overview Brochure',cat:'System',desc:'Full system energy-saving overview for HomeWorks QS.',url:'https://assets.lutron.com/a/documents/3672335_EA_Homeworks_QS.pdf'},
  // HomeWorks QS — Keypads
  {name:'HomeWorks QS Wired Palladiom Keypad',cat:'Keypad',desc:'Spec sheet for wired Palladiom keypads — premium glass-face engraved buttons.',url:'https://assets.lutron.com/a/documents/369881_eng.pdf'},
  {name:'HomeWorks QS Wired Palladiom Bespoke Keypads',cat:'Keypad',desc:'Spec for Palladiom bespoke/custom wired keypads with custom engraving.',url:'https://www.lutron.com/TechnicalDocumentLibrary/3691141_ENG.pdf'},
  {name:'HomeWorks QS Wired seeTouch Architectural Keypads',cat:'Keypad',desc:'Spec for wired seeTouch architectural keypad lineup for HWQS.',url:'https://assets.lutron.com/a/documents/369353_hwqs_wired_arch.pdf'},
  {name:'HomeWorks QS RF seeTouch Tabletop Keypads',cat:'Keypad',desc:'Spec for RF seeTouch tabletop remote keypads.',url:'https://assets.lutron.com/a/documents/369349.pdf'},
  {name:'HomeWorks QS Wired Maestro Designer Local Controls',cat:'Keypad',desc:'Spec for wired Maestro Designer controls in the HomeWorks QS system.',url:'https://assets.lutron.com/a/documents/369700_eng.pdf'},
  {name:'HomeWorks QS RF Plug-In Module',cat:'Module',desc:'Spec for the RF plug-in load control module for HWQS.',url:'https://assets.lutron.com/a/documents/hwqs_plug-in_module_369306.pdf'},
  // HomeWorks Illumination (Legacy)
  {name:'HomeWorks Illumination Technical Reference Guide',cat:'System',desc:'Comprehensive technical reference covering HWI components, wiring, and architecture.',url:'https://assets.lutron.com/a/documents/366-963h_full.pdf',legacy:true},
  // RadioRA 3
  {name:'RadioRA 3 Main Repeater / Processor (RR-PROC)',cat:'Processor',desc:'Spec sheet for the RadioRA 3 main processor/repeater — hub of the RA3 system.',url:'https://www.lutron.com/TechnicalDocumentLibrary/3691221_ENG.pdf'},
  {name:'RadioRA 3 Auxiliary Repeater',cat:'Module',desc:'Spec for the wireless auxiliary repeater — extends RA3 RF range.',url:'https://assets.lutron.com/a/documents/3691073_wireless_repeater.pdf'},
  {name:'RadioRA 3 RF Sunnata Dimmers and Switches',cat:'Dimmer',desc:'Spec for RF Sunnata in-wall dimmers and switches in the RadioRA 3 system.',url:'https://assets.lutron.com/a/documents/3691169_eng.pdf'},
  {name:'RadioRA 3 Lamp Dimmer (Plug-In)',cat:'Dimmer',desc:'Spec for the plug-in lamp dimmer for table and floor lamps.',url:'https://assets.lutron.com/a/documents/3691313.pdf'},
  {name:'RadioRA 3 Sunnata Keypads',cat:'Keypad',desc:'Spec for Sunnata series keypads used within the RadioRA 3 system.',url:'https://assets.lutron.com/a/documents/3691168_eng.pdf'},
  {name:'RadioRA 3 RF Relay Module with Softswitch',cat:'Module',desc:'Spec for the RF relay switching module compatible with RadioRA 3.',url:'https://assets.lutron.com/a/documents/369769_ENG.pdf'},
  {name:'RadioRA 3 System Architecture Diagram',cat:'System',desc:'System architecture one-line diagram for RadioRA 3.',url:'https://assets.lutron.com/a/documents/3686138_radiora3_domestic_architecture.pdf'},
  // Caséta Wireless
  {name:'Caséta Smart Bridge / Smart Bridge Pro',cat:'Hub',desc:'Spec for Caséta Smart Bridge and Pro hub — supports up to 75 devices.',url:'https://assets.lutron.com/a/documents/369816_Smart_Bridge_Pro_Spec.pdf'},
  {name:'Caséta In-Wall Dimmer (PD-6WCL)',cat:'Dimmer',desc:'Spec for the standard Caséta wireless in-wall C·L dimmer.',url:'https://assets.lutron.com/a/documents/369804b_Caseta%20In-Wall%20Dimmer%20Spec.pdf'},
  {name:'Caséta In-Wall Dimmer PRO (PD-10NXD)',cat:'Dimmer',desc:'Spec for the PRO series 10A Caséta in-wall dimmer.',url:'https://assets.lutron.com/a/documents/369919_web.pdf'},
  {name:'Caséta Load Controls (General)',cat:'Dimmer',desc:'General spec for all Caséta wireless load control devices.',url:'https://assets.lutron.com/a/documents/369987_eng.pdf'},
  {name:'Caséta Wireless Motion Sensor',cat:'Sensor',desc:'Spec for the Caséta wireless PIR motion and occupancy sensor.',url:'https://assets.lutron.com/a/documents/3691125_ENG.pdf'},
  // GRAFIK Eye QS
  {name:'GRAFIK Eye QS Wired Triac Control Unit',cat:'Controller',desc:'Spec for the wired triac preset dimming control unit with 3–8 zones.',url:'https://assets.lutron.com/a/documents/369309.pdf'},
  {name:'GRAFIK Eye QS Wireless Control Unit',cat:'Controller',desc:'Spec for the wireless GRAFIK Eye QS control unit.',url:'https://assets.lutron.com/a/documents/369313_eng.pdf'},
  {name:'GRAFIK Eye QS Wireless with EcoSystem',cat:'Controller',desc:'Spec for wireless GRAFIK Eye QS with EcoSystem digital ballast control.',url:'https://www.lutron.com/TechnicalDocumentLibrary/QSGRJ-xE%20Sub.pdf'},
  {name:'GRAFIK Eye QS Wired DALI',cat:'Controller',desc:'Spec for the GRAFIK Eye QS wired DALI version.',url:'https://assets.lutron.com/a/documents/qsgr-xd%20spec%20submittal.pdf'},
  {name:'GRAFIK Eye QS Design and Application Guide',cat:'System',desc:'Design guide covering GRAFIK Eye QS system applications and wiring.',url:'https://assets.lutron.com/a/documents/grafik%20eye%20qs%20design%20guide%20367-1338(final).pdf'},
  // Vive
  {name:'Vive Hub (HJS)',cat:'Hub',desc:'Spec for the Vive wireless lighting control hub — supports up to 100 devices per hub.',url:'https://assets.lutron.com/a/documents/369902_eng.pdf'},
  {name:'Vive Integral Fixture Controls',cat:'Module',desc:'Spec for Vive integral fixture control devices.',url:'https://assets.lutron.com/a/documents/3691039.pdf'},
  {name:'Vive PowPak CCO Module',cat:'Module',desc:'Spec for Vive PowPak contact closure output module.',url:'https://assets.lutron.com/a/documents/369909_eng.pdf'},
  {name:'Vive PowPak Single Zone with EcoSystem',cat:'Module',desc:'Spec for Vive PowPak 0–10V/EcoSystem single zone module.',url:'https://assets.lutron.com/a/documents/3691103.pdf'},
  {name:'Vive PowPak Relay Module with Softswitch',cat:'Module',desc:'Spec for Vive PowPak relay switching module with Softswitch.',url:'https://www.lutron.com/TechnicalDocumentLibrary/369908_ENG.pdf'},
  {name:'Vive PowPak Dimming Module 0–10V',cat:'Module',desc:'Spec for Vive PowPak 0–10V dimming module.',url:'https://assets.lutron.com/a/documents/369913_eng.pdf'},
  {name:'Vive Phase Select Dim Module',cat:'Module',desc:'Spec for Vive phase-selectable dimming module.',url:'https://assets.lutron.com/a/documents/3691150.pdf'},
  {name:'Vive Application Guide',cat:'System',desc:'Full application guide for the Vive wireless lighting system.',url:'https://assets.lutron.com/a/documents/3672673ch_vive_application_guide.pdf'},
  {name:'Vive Design Guide',cat:'System',desc:'Design reference guide for Vive — zones, grouping, coverage, and device limits.',url:'https://www.lutron.com/TechnicalDocumentLibrary/367-2597_Vive_Design_Guide.pdf'},
  // Quantum
  {name:'Quantum Light Management Hub QP3',cat:'Processor',desc:'Spec for Quantum QP3 processor/hub — manages lighting across large commercial facilities.',url:'https://www.lutron.com/TechnicalDocumentLibrary/369423.pdf'},
  {name:'Quantum Light Management Hub QP2',cat:'Processor',desc:'Spec for the earlier Quantum QP2 hub.',url:'https://assets.lutron.com/a/documents/369375.pdf'},
  {name:'Quantum Total Light Management Suite',cat:'System',desc:'System-level spec for the full Quantum Total Light Management suite.',url:'https://www.lutron.com/TechnicalDocumentLibrary/369778_ENG.pdf'},
  {name:'Quantum DIN Rail Panel',cat:'Panel',desc:'Spec for Quantum DIN rail power panel with phase-adaptive dimming modules.',url:'https://www.lutron.com/TechnicalDocumentLibrary/369783_ENG.pdf'},
  // Maestro
  {name:'Maestro MA-PRO Dimmer',cat:'Dimmer',desc:'Spec for the Maestro Pro in-wall dimmer — up to 150W LED, advanced features.',url:'https://assets.lutron.com/a/documents/3691112_eng.pdf'},
  {name:'Maestro LED+ Dimmer Sensor',cat:'Dimmer',desc:'Spec for the Maestro LED+ dimmer with integrated occupancy sensor.',url:'https://www.lutron.com/TechnicalDocumentLibrary/369748.pdf'},
  {name:'Maestro RF Dimmer and Switch',cat:'Dimmer',desc:'Spec for the Maestro RF wireless dimmer and switch.',url:'https://assets.lutron.com/a/documents/369904_eng.pdf'},
  {name:'Maestro 0–10V Dimmer Sensor',cat:'Dimmer',desc:'Spec for the Maestro 0–10V dimmer sensor model.',url:'https://assets.lutron.com/a/documents/369833.pdf'},
  // Diva
  {name:'Diva LED+ Dimmer (C·L Gen 2)',cat:'Dimmer',desc:'Spec for the Diva LED+/C·L Gen 2 in-wall dimmer.',url:'https://assets.lutron.com/a/documents/369682.pdf'},
  {name:'Diva 250W LED+ Dimmer',cat:'Dimmer',desc:'Spec for the Diva 250W LED+ dimmer.',url:'https://assets.lutron.com/a/documents/369810.pdf'},
  {name:'Diva ELV Reverse Phase Dimmer',cat:'Dimmer',desc:'Spec for the Diva electronic low-voltage (ELV) reverse-phase dimmer.',url:'https://assets.lutron.com/a/documents/3691041.pdf'},
  {name:'Diva 0–10V Controls',cat:'Dimmer',desc:'Spec for Diva 0–10V dimmer and switch controls.',url:'https://assets.lutron.com/a/documents/369147.pdf'},
  // Nova T
  {name:'Nova T Dimmer Controls Spec',cat:'Dimmer',desc:'Main spec submittal for the Nova T dimmer control family.',url:'https://assets.lutron.com/a/documents/novatb.pdf'},
  {name:'Nova T Spec Guide Volume 1',cat:'Dimmer',desc:'Spec guide covering the full Nova T dimmer line with load specs and dimensions.',url:'https://assets.lutron.com/a/documents/spec%20guide%20volume%201%20novat.pdf'},
  // Sivoia Shades
  {name:'Sivoia QS Wireless Roller 64 Shade',cat:'Shade',desc:'Spec for Sivoia QS wireless roller motorised shade (64-series).',url:'https://assets.lutron.com/a/documents/085705.pdf'},
  {name:'Sivoia QS Roller 150 Shade',cat:'Shade',desc:'Spec for Sivoia QS Roller 150 motorised shade.',url:'https://www.lutron.com/TechnicalDocumentLibrary/085-267.pdf'},
  {name:'Sivoia QS Roller 225 Shade',cat:'Shade',desc:'Spec for Sivoia QS Roller 225 motorised shade.',url:'https://www.lutron.com/TechnicalDocumentLibrary/086105%20a.pdf'},
  {name:'Sivoia QS Roller 300 LIFT Shade',cat:'Shade',desc:'Spec for Sivoia QS Roller 300 LIFT motorised shade.',url:'https://assets.lutron.com/a/documents/085286.pdf'},
  {name:'Sivoia QS System Overview',cat:'Shade',desc:'System overview brochure for the full Sivoia QS shading solutions range.',url:'https://assets.lutron.com/a/documents/367-1374_ea.pdf'},
  // EcoSystem LED Drivers
  {name:'EcoSystem 5-Series LED Driver (50W)',cat:'LED Driver',desc:'Spec for EcoSystem 5-Series 50W LED driver — 0.1% dimming, digital EcoSystem protocol.',url:'https://assets.lutron.com/a/documents/369815_eng.pdf'},
  {name:'EcoSystem 5-Series LED Driver Spec Submittal',cat:'LED Driver',desc:'Spec submittal for the EcoSystem 5-Series driver family.',url:'https://assets.lutron.com/a/documents/369823_eng.pdf'},
  {name:'Hi-lume Premier 0.1% EcoSystem LED Driver',cat:'LED Driver',desc:'Spec for the premium Hi-lume driver — industry-leading 0.1% low-end dimming.',url:'https://assets.lutron.com/a/documents/3691077_eng.pdf'},
  {name:'Hi-lume 1% EcoSystem LED Driver (Soft-on / Fade-to-Black)',cat:'LED Driver',desc:'Spec for Hi-lume 1% driver with soft-on and fade-to-black features.',url:'https://assets.lutron.com/a/documents/369832_eng.pdf'},
  {name:'Hi-lume 1% EcoSystem / 3-Wire L3D Driver',cat:'LED Driver',desc:'Spec for Hi-lume 1% driver with 3-wire L3D control interface.',url:'https://assets.lutron.com/a/documents/369325_eng.pdf'},
  {name:'EcoSystem LED Driver Overview',cat:'LED Driver',desc:'General overview spec for the EcoSystem LED driver family.',url:'https://assets.lutron.com/a/documents/369341_eng.pdf'},
  // Energi Savr Node
  {name:'Energi Savr Node with EcoSystem',cat:'Controller',desc:'Spec for EcoSystem-connected Energi Savr Node — digital addressable zone controller.',url:'https://assets.lutron.com/a/documents/3691211.pdf'},
  {name:'Energi Savr Node for 0–10V with Softswitch',cat:'Controller',desc:'Spec for 0–10V Energi Savr Node — zone controller for 0–10V dimmable drivers.',url:'https://assets.lutron.com/a/documents/369-241_eng.pdf'},
  {name:'T-Series Energi Savr Node',cat:'Controller',desc:'Spec for the T-Series Energi Savr Node zone controller.',url:'https://assets.lutron.com/a/documents/3691096.pdf'},
  {name:'Energi Savr Node for DALI',cat:'Controller',desc:'Spec for the DALI-compatible Energi Savr Node.',url:'https://intl.lutron.com/TechnicalDocumentLibrary/ESN_DALI_369243c.pdf'},
  // PowPak (standalone)
  {name:'PowPak CCO Module',cat:'Module',desc:'Spec for standalone PowPak contact closure output module.',url:'https://assets.lutron.com/a/documents/369433e_eng.pdf'},
  {name:'PowPak Relay Module with Softswitch',cat:'Module',desc:'Spec for PowPak relay module with Softswitch technology.',url:'https://assets.lutron.com/a/documents/369-428e_english.pdf'},
  {name:'PowPak 20A Receptacle Control Relay Module',cat:'Module',desc:'Spec for the PowPak 20A receptacle switching module.',url:'https://assets.lutron.com/a/documents/369966_eng.pdf'},
  // Integration
  {name:'GRX-TVI Ten Volt AV Interface',cat:'AV Interface',desc:'Main spec submittal for the GRX-TVI — interfaces AV systems with Lutron via 0–10V.',url:'https://assets.lutron.com/a/documents/grx-tvi.pdf'},
  {name:'QSE-IO Contact Closure Integration Module',cat:'Integration',desc:'Spec for the QSE-IO — provides 8 contact closure inputs/outputs for third-party integration.',url:'https://assets.lutron.com/a/documents/qse-io.pdf'},
  {name:'QSE-IO Control Interface Spec (369640)',cat:'Integration',desc:'Product specifications for the QSE-IO module.',url:'https://www.lutron.com/TechnicalDocumentLibrary/369640_ENG.pdf'},
  {name:'QSE-CI-NWK-E Ethernet Integration Module',cat:'Integration',desc:'Spec for the QSE-CI-NWK-E — Ethernet integration interface for HWQS.',url:'https://assets.lutron.com/a/documents/369373_qse-ci-nwk-e_eng.pdf'},
  // Sensors
  {name:'Radio Powr Savr Wireless Ceiling Occupancy Sensor (LRF2)',cat:'Sensor',desc:'Spec for wireless ceiling-mount occupancy/vacancy sensor — 360° PIR.',url:'https://assets.lutron.com/a/documents/369480_eng.pdf'},
  {name:'Radio Powr Savr Wireless Wall-Mount Sensor',cat:'Sensor',desc:'Spec for wireless wall-mount occupancy/vacancy sensor.',url:'https://assets.lutron.com/a/documents/spec_sheet_369481a_eng.pdf'},
  {name:'LOS-CDT Series Wired Occupancy Sensor',cat:'Sensor',desc:'Spec for the LOS-CDT series wired ceiling occupancy sensor.',url:'https://assets.lutron.com/a/documents/369653.pdf'},
  {name:'LOS-CIR Series Wired Ceiling Occupancy Sensor',cat:'Sensor',desc:'Spec for the LOS-CIR series wired ceiling occupancy sensor.',url:'https://assets.lutron.com/a/documents/369655.pdf'},
  {name:'Maestro Dual-Technology Sensor Switch',cat:'Sensor',desc:'Spec for the Maestro dual-tech (PIR + ultrasonic) sensor switch.',url:'https://assets.lutron.com/a/documents/369773_eng.pdf'},
  {name:'Residential Sensor Specification Guide',cat:'Sensor',desc:'Comprehensive guide covering the full Lutron residential sensor lineup.',url:'https://assets.lutron.com/a/documents/3672236_Sensor_Spec_Guide.pdf'},
  {name:'Occupancy/Vacancy Sensor Design and Application Guide',cat:'Sensor',desc:'Full design and application guide for all Lutron occupancy and vacancy sensors.',url:'https://assets.lutron.com/a/documents/3683197.pdf'}
];

function _lutronDocsRender() {
  _specLibRender('lutrondocs-root', 'Lutron', '245,158,11', _lutronDocs);
}
window._lutronDocsRender = _lutronDocsRender;
