/**
 * NER Logistics Intelligence Platform - Multilingual Localization Engine (i18n)
 * Supports 5 major languages of North East India:
 * 1. English (en)
 * 2. অসমীয়া / Assamese (as)
 * 3. हिंदी / Hindi (hi)
 * 4. বাংলা / Bengali (bn)
 * 5. মৈতৈলোন্ / Manipuri - Meitei (mn)
 */

const I18N_TRANSLATIONS = {
  en: {
    lang_name: "English",
    flag: "🇬🇧",
    gov_brand: "NER Logistics & Accessibility Intelligence",
    gov_sub: "Government of India • Ministry of Development of North Eastern Region (MDoNER)",
    driver_portal: "Driver Portal",
    field_ops: "Field Operations",
    admin_cmd: "Admin Command",
    sign_out: "Sign Out",
    user_role_driver: "Commercial Driver",
    offline_online: "Online",
    offline_mode: "Offline Mode",
    download_pack_title: "Cache Regional Corridors for Offline Use",
    search_placeholder: "Search destination or pick a regional corridor...",
    directions_btn: "Directions",
    mode_freight: "Freight",
    mode_lcv: "LCV",
    mode_bus: "Bus",
    mode_car: "Car/4×4",
    origin_placeholder: "Choose starting point or pick below...",
    dest_placeholder: "Choose destination in NER...",
    calc_corridors: "Calculate Highway Corridors",
    popular_corridors: "Popular Corridors:",
    cargo_label: "Cargo:",
    weight_label: "Weight:",
    cargo_pds: "PDS Supplies & Rations",
    cargo_meds: "Emergency Medicines & Oxygen",
    cargo_perishables: "Perishable Agro (Kiwi, Ginger)",
    cargo_const: "Construction Freight",
    tooltip_report_hazard: "Report Road Obstacle",
    tooltip_doppler: "Live Doppler Radar (RainViewer)",
    tooltip_weather_buffers: "Predictive Route Rain Buffers",
    tooltip_waterway: "NW-2 Brahmaputra Waterway",
    tooltip_traffic: "Traffic Conditions",
    tooltip_fleet: "Live GPS Fleet Tracking",
    tooltip_bridges: "Critical Bridge Telemetry",
    tooltip_basemap: "Basemap: Relief / Roads / Satellite",
    free_flow: "Free Flow",
    slow_crawl: "Slow Crawl",
    chokepoint: "Severe Chokepoint",
    rain_legend: "Live Doppler Radar / Forecast Precipitation",
    fastest_route: "Fastest verified real-highway route",
    sim_transit: "Simulate Transit",
    toggle_details: "Toggle Details",
    modal_report_title: "Report Road Obstacle / Hazard",
    modal_report_sub: "Dispatched directly to the Field Officer Verification Queue",
    modal_desc_label: "Obstacle Description:",
    modal_desc_placeholder: "e.g., Fallen Boulder / Tree on road margin",
    modal_cat_label: "Hazard Category:",
    modal_cat_landslide: "Landslide / Mud Debris",
    modal_cat_flood: "Waterlogging / Flash Runoff",
    modal_cat_hazard: "Fallen Boulders / Tree",
    modal_cat_bridge: "Bridge Damage / Narrow Passage",
    modal_sev_label: "Severity Level:",
    modal_sev_partial: "Single-Lane Crawl (Partial Blockage)",
    modal_sev_critical: "Complete Carriage-way Blocked",
    modal_geo_label: "Geo-Tagged Location Coordinates:",
    modal_latch_gps: "Latch GPS",
    modal_photo_label: "Attach Ground Photograph Evidence (Photo Upload):",
    modal_submit_report: "Transmit Report to Field Officer",
    hero_lockdown: "Enact Immediate Corridor Lockdown",
    hero_greencorridor: "Clear Priority Medical Green Corridor",
    hero_parking: "Broadcast Parking Bay Directive",
    alert_emergency_prefix: "EMERGENCY HIGHWAY BROADCAST",
    alert_divert_msg: "Active Landslide Ahead. AI Divergence Active: Divert to designated valley bypass.",
    notif_title: "Highway Safety Alerts",
    voice_alert_toggle: "Voice Alert",
    notif_btn_sms: "Simulate Regional Carrier SMS",
    btn_divert: "Reroute via Safe Bypass",
    notif_counter_active: "Active Warning",
    notif_sms_title: "Cell Broadcast Warning",
    notif_sms_desc: "SMS dispatched to registered commercial drivers via BSNL/Airtel gateway:",
    sms_sample_text: "Govt of India Emergency Warning: NH-6 blocked due to landslide at Lumshnong. Divert to AI-recommended NH-27 bypass.",
    // Login Portal
    ssl_tag: "256-Bit SSL Encrypted Gateway",
    login_portal_title: "Unified Single Sign-On Portal",
    login_portal_sub: "Commercial Drivers • Field Officers • Administrative Command",
    tab_signin: "Sign In",
    tab_register: "New Registration",
    tab_forgot: "Forgot Password",
    username_label: "Username / Registered Mobile / Email",
    username_placeholder: "e.g. driver, officer, admin or 10-digit mobile",
    password_label: "Password",
    captcha_label: "Security Captcha",
    btn_signin: "Sign In to Secure Gateway",
    quick_demo_label: "Quick Demo Access (Select Persona):",
    btn_demo_driver: "Driver Login",
    btn_demo_officer: "Field Officer",
    btn_demo_admin: "Admin Command",
    reg_fullname_label: "Full Name (as per Govt ID)",
    reg_role_label: "Operational Role",
    reg_phone_label: "Mobile Number (with +91)",
    reg_email_label: "Official / Work Email Address",
    reg_btn_otp: "Send Verification OTP",
    reg_otp_label: "One-Time Password (OTP)",
    reg_vehicle_class_label: "Assigned Vehicle Class",
    reg_vehicle_reg_label: "Vehicle Registration No.",
    reg_btn_submit: "Complete Registration & Sign In",
    forgot_phone_label: "Enter Registered Mobile / Email",
    forgot_btn_otp: "Send Verification Code",
    forgot_new_pw_label: "New Password",
    forgot_confirm_pw_label: "Confirm New Password",
    forgot_btn_submit: "Reset Password & Login"
  },
  as: {
    lang_name: "অসমীয়া",
    flag: "🇮🇳",
    gov_brand: "উত্তৰ-পূৰ্বাঞ্চল লজিষ্টিক আৰু প্ৰৱেশাধিকাৰ বুদ্ধিমত্তা",
    gov_sub: "ভাৰত চৰকাৰ • উত্তৰ পূৰ্বাঞ্চল উন্নয়ন মন্ত্ৰালয় (MDoNER)",
    driver_portal: "চালক প'ৰ্টেল",
    field_ops: "ক্ষেত্ৰ অভিযান",
    admin_cmd: "প্ৰশাসক কমাণ্ড",
    sign_out: "লগ আউট",
    user_role_driver: "বাণিজ্যিক চালক",
    offline_online: "অনলাইন",
    offline_mode: "অফলাইন মোড",
    download_pack_title: "অফলাইন ব্যৱহাৰৰ বাবে ক'ৰিডৰ সাঁচি ৰাখক",
    search_placeholder: "গন্তব্যস্থান সন্ধান কৰক বা আঞ্চলিক ক'ৰিডৰ বাছক...",
    directions_btn: "দিশ নিৰ্দেশনা",
    mode_freight: "মালবাহী",
    mode_lcv: "এলচিভি",
    mode_bus: "বাছ",
    mode_car: "গাড়ী/৪×৪",
    origin_placeholder: "যাত্ৰা আৰম্ভণি স্থান বাছক...",
    dest_placeholder: "উত্তৰ-পূবৰ গন্তব্যস্থান বাছক...",
    calc_corridors: "ৰাজপথৰ ক'ৰিডৰ গণনা কৰক",
    popular_corridors: "জনপ্ৰিয় ক'ৰিডৰসমূহ:",
    cargo_label: "সামগ্ৰী:",
    weight_label: "ওজন:",
    cargo_pds: "পিডিএছ খাদ্য যোগান আৰু ৰেচন",
    cargo_meds: "জৰুৰীকালীন ঔষধ আৰু অক্সিজেন",
    cargo_perishables: "বিনষ্টপ্ৰায় কৃষি সামগ্ৰী (কিউই, আদা)",
    cargo_const: "নিৰ্মাণ সামগ্ৰী পৰিবহণ",
    tooltip_report_hazard: "পথৰ বাধাৰ প্ৰতিবেদন দিয়ক",
    tooltip_doppler: "লাইভ ডপলাৰ ৰাডাৰ",
    tooltip_weather_buffers: "বৰষুণৰ সম্ভাৱ্য ক'ৰিডৰ",
    tooltip_waterway: "ৰাষ্ট্ৰীয় জলপথ-২ ব্ৰহ্মপুত্ৰ",
    tooltip_traffic: "যাতায়াতৰ অৱস্থা",
    tooltip_fleet: "লাইভ জিপিএছ যান-বাহন ট্ৰেকিং",
    tooltip_bridges: "গুৰুত্বপূৰ্ণ দলং টেলিমেট্ৰী",
    tooltip_basemap: "মেপ: ভূ-প্ৰকৃতি / পথ / উপগ্ৰহ",
    free_flow: "স্বাভাৱিক যাতায়াত",
    slow_crawl: "মন্থৰ গতি",
    chokepoint: "তীব্ৰ যানজঁট / অৱৰোধ",
    rain_legend: "লাইভ ডপলাৰ ৰাডাৰ / বৰষুণৰ পূৰ্বাভাস",
    fastest_route: "দ্ৰুততম পৰীক্ষিত ৰাজপথ ক'ৰিডৰ",
    sim_transit: "যাত্ৰা অনুৰূপ কৰক",
    toggle_details: "বিৱৰণ চাওক",
    modal_report_title: "পথৰ বাধাৰ প্ৰতিবেদন দিয়ক",
    modal_report_sub: "ক্ষেত্ৰ বিষয়াৰ পৰীক্ষা সূচীলৈ প্ৰেৰণ কৰা হ'ব",
    modal_desc_label: "বাধাৰ বিৱৰণ:",
    modal_desc_placeholder: "যেনে, পথত শিল খহি পৰা / গছ বাগৰি পৰা",
    modal_cat_label: "বিপত্তিৰ প্ৰকাৰ:",
    modal_cat_landslide: "ভূমিস্খলন / বোকাৰ স্তূপ",
    modal_cat_flood: "পানী জমা / আকস্মিক বান",
    modal_cat_hazard: "খহি পৰা শিল / গছ",
    modal_cat_bridge: "দলংৰ ক্ষতি / সংকীৰ্ণ পথ",
    modal_sev_label: "তীক্ষ্ণতাৰ মাত্ৰা:",
    modal_sev_partial: "একক লেনত মন্থৰ গতি (আংশিক বন্ধ)",
    modal_sev_critical: "সম্পূৰ্ণ পথ বন্ধ (অৱৰুদ্ধ)",
    modal_geo_label: "জিপিএছ স্থানৰ স্থানাংক:",
    modal_latch_gps: "জিপিএছ লওক",
    modal_photo_label: "ক্ষতিগ্ৰস্ত পথৰ আলোকচিত্ৰ সংলগ্ন কৰক:",
    modal_submit_report: "ক্ষেত্ৰ বিষয়ালৈ প্ৰতিবেদন প্ৰেৰণ কৰক",
    hero_lockdown: "তাৎক্ষণিক ক'ৰিডৰ লকডাউন জাৰি কৰক",
    hero_greencorridor: "চিকিৎসা সেৱাৰ বাবে গ্ৰীণ ক'ৰিডৰ মুকলি কৰক",
    hero_parking: "সুৰক্ষিত পাৰ্কিং অঞ্চল নিৰ্দেশনা প্ৰচাৰ কৰক",
    alert_emergency_prefix: "জৰুৰীকালীন ৰাজপথ সতৰ্কবাণী",
    alert_divert_msg: "আগত ভূমিস্খলনৰ আশংকা। এআই বিকল্প পথ সক্ৰিয়: নিৰ্ধাৰিত উপত্যকা বাইপাছেৰে যাওক।",
    notif_title: "ৰাজপথ সুৰক্ষা সতৰ্কবাৰ্তা",
    voice_alert_toggle: "শব্দ সতৰ্কবাৰ্তা",
    notif_btn_sms: "আঞ্চলিক এছএমএছ সম্প্ৰচাৰ",
    btn_divert: "নিৰাপদ বাইপাছেৰে যাওক",
    notif_counter_active: "সক্ৰিয় সতৰ্কবাৰ্তা",
    notif_sms_title: "চেল ব্ৰডকাষ্ট সতৰ্কবাৰ্তা",
    notif_sms_desc: "বিএছএনএল/এয়াৰটেল গেটৱেৰ জৰিয়তে পঞ্জীকৃত চালকসকললৈ প্ৰেৰণ কৰা এছএমএছ:",
    sms_sample_text: "ভাৰত চৰকাৰ জৰুৰী বাৰ্তা: NH-6 লুমছনঙত ভূমিস্খলনৰ বাবে পথ বন্ধ। এআই নিৰ্ধাৰিত NH-27 বাইপাছ ব্যৱহাৰ কৰক।",
    // Login Portal
    ssl_tag: "২৫৬-বিট এছএছএল সুৰক্ষিত গেটৱে",
    login_portal_title: "একত্ৰিত একক প্ৰৱেশদ্বাৰ প'ৰ্টেল",
    login_portal_sub: "বাণিজ্যিক চালক • ক্ষেত্ৰ বিষয়া • প্ৰশাসনিক কমাণ্ড",
    tab_signin: "লগ ইন",
    tab_register: "নতুন পঞ্জীয়ন",
    tab_forgot: "পাছৱৰ্ড পাহৰিলে",
    username_label: "ব্যৱহাৰকাৰীৰ নাম / ম'বাইল / ইমেইল",
    username_placeholder: "যেনে driver, officer, admin বা ম'বাইল নম্বৰ",
    password_label: "পাছৱৰ্ড",
    captcha_label: "নিৰাপত্তা কেপচা",
    btn_signin: "সুৰক্ষিত প্ৰৱেশদ্বাৰত প্ৰৱেশ কৰক",
    quick_demo_label: "দ্ৰুত ডেমো প্ৰৱেশ (ভূমিকা বাছক):",
    btn_demo_driver: "চালক লগইন",
    btn_demo_officer: "ক্ষেত্ৰ বিষয়া",
    btn_demo_admin: "প্ৰশাসক কমাণ্ড",
    reg_fullname_label: "সম্পূৰ্ণ নাম (চৰকাৰী পৰিচয় পত্ৰ অনুসৰি)",
    reg_role_label: "কাৰ্য্যকৰী ভূমিকা",
    reg_phone_label: "ম'বাইল নম্বৰ (+91 সহ)",
    reg_email_label: "চৰকাৰী / কাৰ্যালয়ৰ ইমেইল ঠিকনা",
    reg_btn_otp: "যাচাইকৰণ অ'টিপি প্ৰেৰণ কৰক",
    reg_otp_label: "ৱান-টাইম পাছৱৰ্ড (অ'টিপি)",
    reg_vehicle_class_label: "নিৰ্ধাৰিত বাহনৰ শ্ৰেণী",
    reg_vehicle_reg_label: "বাহন পঞ্জীয়ন নম্বৰ",
    reg_btn_submit: "পঞ্জীয়ন সম্পূৰ্ণ কৰক আৰু প্ৰৱেশ কৰক",
    forgot_phone_label: "পঞ্জীভুক্ত ম'বাইল / ইমেইল দিয়ক",
    forgot_btn_otp: "যাচাই সংকেত প্ৰেৰণ কৰক",
    forgot_new_pw_label: "নতুন পাছৱৰ্ড",
    forgot_confirm_pw_label: "নতুন পাছৱৰ্ড নিশ্চিত কৰক",
    forgot_btn_submit: "পাছৱৰ্ড সলনি কৰক আৰু প্ৰৱেশ কৰক"
  },
  hi: {
    lang_name: "हिंदी",
    flag: "🇮🇳",
    gov_brand: "पूर्वोत्तर क्षेत्र लॉजिस्टिक्स एवं पहुंच बुद्धिमत्ता",
    gov_sub: "भारत सरकार • पूर्वोत्तर क्षेत्र विकास मंत्रालय (MDoNER)",
    driver_portal: "चालक पोर्टल",
    field_ops: "क्षेत्रीय अभियान",
    admin_cmd: "प्रशासनिक कमान",
    sign_out: "साइन आउट",
    user_role_driver: "व्यावसायिक चालक",
    offline_online: "ऑनलाइन",
    offline_mode: "ऑफ़लाइन मोड",
    download_pack_title: "ऑफ़लाइन उपयोग हेतु गलियारा सहेजें",
    search_placeholder: "गंतव्य खोजें या क्षेत्रीय गलियारा चुनें...",
    directions_btn: "दिशानिर्देश",
    mode_freight: "मालवाहक",
    mode_lcv: "एलसीवी",
    mode_bus: "बस",
    mode_car: "कार/4×4",
    origin_placeholder: "प्रस्थान स्थल चुनें...",
    dest_placeholder: "पूर्वोत्तर में गंतव्य चुनें...",
    calc_corridors: "राजमार्ग गलियारों की गणना करें",
    popular_corridors: "प्रमुख गलियारे:",
    cargo_label: "सामग्री:",
    weight_label: "वजन:",
    cargo_pds: "पीडीएस खाद्य आपूर्ति एवं राशन",
    cargo_meds: "आपातकालीन दवाएं एवं ऑक्सीजन",
    cargo_perishables: "शीघ्र खराब होने वाली कृषि उपज (कीवी, अदरक)",
    cargo_const: "निर्माण सामग्री माल ढुलाई",
    tooltip_report_hazard: "सड़क अवरोध की सूचना दें",
    tooltip_doppler: "लाइव डॉपलर रडार",
    tooltip_weather_buffers: "मार्ग वर्षा पूर्वानुमान",
    tooltip_waterway: "राष्ट्रीय जलमार्ग-2 ब्रह्मपुत्र",
    tooltip_traffic: "यातायात स्थिति",
    tooltip_fleet: "लाइव जीपीएस वाहन ट्रैकिंग",
    tooltip_bridges: "महत्वपूर्ण पुल टेलीमेट्री",
    tooltip_basemap: "मानचित्र: भू-भाग / सड़क / उपग्रह",
    free_flow: "सुगम आवागमन",
    slow_crawl: "धीमी गति",
    chokepoint: "गंभीर अवरोध / जाम",
    rain_legend: "लाइव डॉपलर रडार / वर्षा पूर्वानुमान",
    fastest_route: "द्रुततम सत्यापित राजमार्ग मार्ग",
    sim_transit: "पारगमन सिमुलेशन",
    toggle_details: "विवरण देखें",
    modal_report_title: "सड़क बाधा / खतरे की सूचना दें",
    modal_report_sub: "क्षेत्रीय अधिकारी सत्यापन कतार में प्रेषित",
    modal_desc_label: "बाधा का विवरण:",
    modal_desc_placeholder: "उदा. सड़क किनारे बोल्डर या पेड़ गिरना",
    modal_cat_label: "खतरे की श्रेणी:",
    modal_cat_landslide: "भूस्खलन / कीचड़ मलबा",
    modal_cat_flood: "जलभराव / अचानक बाढ़",
    modal_cat_hazard: "गिरे हुए पत्थर / पेड़",
    modal_cat_bridge: "पुल क्षति / संकरा मार्ग",
    modal_sev_label: "तीव्रता स्तर:",
    modal_sev_partial: "एकल लेन धीमी गति (आंशिक अवरोध)",
    modal_sev_critical: "संपूर्ण मार्ग अवरुद्ध (पूर्ण बंद)",
    modal_geo_label: "जीपीएस स्थान निर्देशांक:",
    modal_latch_gps: "जीपीएस प्राप्त करें",
    modal_photo_label: "क्षतिग्रस्त स्थल का फोटो संलग्न करें:",
    modal_submit_report: "क्षेत्रीय अधिकारी को रिपोर्ट भेजें",
    hero_lockdown: "तत्काल गलियारा लॉकडाउन लागू करें",
    hero_greencorridor: "प्राथमिकता मेडिकल ग्रीन कॉरिडोर स्वीकृत करें",
    hero_parking: "पर्वतीय पार्किंग वे निर्देश प्रसारित करें",
    alert_emergency_prefix: "आपातकालीन राजमार्ग प्रसारण",
    alert_divert_msg: "आगे भूस्खलन। एआई वैकल्पिक मार्ग सक्रिय: निर्धारित घाटी बाईपास का उपयोग करें।",
    notif_title: "राजमार्ग सुरक्षा अलर्ट",
    voice_alert_toggle: "ध्वनि अलर्ट",
    notif_btn_sms: "क्षेत्रीय एसएमएस प्रसारण",
    btn_divert: "सुरक्षित बाईपास से जाएं",
    notif_counter_active: "सक्रिय चेतावनी",
    notif_sms_title: "सेल ब्रॉडकास्ट अलर्ट",
    notif_sms_desc: "बीएसएनएल/एयरटेल गेटवे द्वारा पंजीकृत वाणिज्यिक चालकों को प्रेषित एसएमएस:",
    sms_sample_text: "भारत सरकार आपातकालीन अलर्ट: NH-6 लुमशनॉन्ग में भूस्खलन के कारण बंद है। एआई द्वारा सुझाई गई NH-27 बाईपास का उपयोग करें।",
    // Login Portal
    ssl_tag: "256-बिट एसएसएल एन्क्रिप्टेड गेटवे",
    login_portal_title: "एकीकृत एकल साइन-ऑन पोर्टल",
    login_portal_sub: "व्यावसायिक चालक • क्षेत्रीय अधिकारी • प्रशासनिक कमान",
    tab_signin: "साइन इन",
    tab_register: "नया पंजीकरण",
    tab_forgot: "पासवर्ड भूल गए",
    username_label: "उपयोगकर्ता नाम / मोबाइल / ईमेल",
    username_placeholder: "उदा. driver, officer, admin या 10-अंक मोबाइल",
    password_label: "पासवर्ड",
    captcha_label: "सुरक्षा कैप्चा",
    btn_signin: "सुरक्षित गेटवे में साइन इन करें",
    quick_demo_label: "त्वरित डेमो एक्सेस (भूमिका चुनें):",
    btn_demo_driver: "चालक लॉगिन",
    btn_demo_officer: "क्षेत्रीय अधिकारी",
    btn_demo_admin: "प्रशासनिक कमान",
    reg_fullname_label: "पूरा नाम (सरकारी पहचान पत्रानुसार)",
    reg_role_label: "परिचालन भूमिका",
    reg_phone_label: "मोबाइल नंबर (+91 सहित)",
    reg_email_label: "आधिकारिक / कार्य ईमेल पता",
    reg_btn_otp: "सत्यापन ओटीपी भेजें",
    reg_otp_label: "वन-टाइम पासवर्ड (ओटीपी)",
    reg_vehicle_class_label: "निर्धारित वाहन वर्ग",
    reg_vehicle_reg_label: "वाहन पंजीकरण संख्या",
    reg_btn_submit: "पंजीकरण पूर्ण करें और साइन इन करें",
    forgot_phone_label: "पंजीकृत मोबाइल या ईमेल दर्ज करें",
    forgot_btn_otp: "सत्यापन कोड भेजें",
    forgot_new_pw_label: "नया पासवर्ड",
    forgot_confirm_pw_label: "नया पासवर्ड पुष्टि करें",
    forgot_btn_submit: "पासवर्ड रीसेट करें और लॉगिन करें"
  },
  bn: {
    lang_name: "বাংলা",
    flag: "🇮🇳",
    gov_brand: "উত্তর-পূর্বাঞ্চল লজিস্টিক ও অ্যাক্সেসিবিলিটি বুদ্ধিমত্তা",
    gov_sub: "ভারত সরকার • উত্তর-পূর্বাঞ্চল উন্নয়ন মন্ত্রক (MDoNER)",
    driver_portal: "চালক পোর্টাল",
    field_ops: "মাঠ পর্যায়ের কার্যক্রম",
    admin_cmd: "অ্যাডমিন কমান্ড",
    sign_out: "লগ আউট",
    user_role_driver: "বাণিজ্যিক চালক",
    offline_online: "অনলাইন",
    offline_mode: "অফলাইন মোড",
    download_pack_title: "অফলাইনে ব্যবহারের জন্য করিডোর সেভ করুন",
    search_placeholder: "গন্তব্য অনুসন্ধান করুন বা করিডোর বেছে নিন...",
    directions_btn: "দিকনির্দেশ",
    mode_freight: "মালবাহী ট্রাক",
    mode_lcv: "এলসিভি",
    mode_bus: "বাস",
    mode_car: "গাড়ি/৪×৪",
    origin_placeholder: "যাত্রার শুরু স্থান বেছে নিন...",
    dest_placeholder: "উত্তর-পূর্বে গন্তব্য বেছে নিন...",
    calc_corridors: "হাইওয়ে করিডোর হিসাব করুন",
    popular_corridors: "জনপ্রিয় করিডোরসমূহ:",
    cargo_label: "পণ্য:",
    weight_label: "ওজন:",
    cargo_pds: "পিডিএস খাদ্য সরবরাহ ও রেশন",
    cargo_meds: "জরুরি ওষুধ ও অক্সিজেন",
    cargo_perishables: "পচনশীল কৃষিজাত পণ্য (কিউই, আদা)",
    cargo_const: "নির্মাণ সামগ্রী পরিবহন",
    tooltip_report_hazard: "রাস্তার বাধার খবর দিন",
    tooltip_doppler: "লাইভ ডপলার রাডার",
    tooltip_weather_buffers: "বৃষ্টির পূর্বাভাস বাফার",
    tooltip_waterway: "জাতীয় জলপথ-২ ব্রহ্মপুত্র",
    tooltip_traffic: "যানজট পরিস্থিতি",
    tooltip_fleet: "লাইভ জিপিএস কনভয় ট্র্যাকিং",
    tooltip_bridges: "গুরুত্বপূর্ণ সেতু টেলিমেট্রি",
    tooltip_basemap: "ম্যাপ: ভূ-প্রকৃতি / রাস্তা / স্যাটেলাইট",
    free_flow: "স্বাভাবিক চলাচল",
    slow_crawl: "ধীর গতি",
    chokepoint: "মারাত্মক যানজট / বাধা",
    rain_legend: "লাইভ ডপলার রাডার / বৃষ্টির পূর্বাভাস",
    fastest_route: "দ্রুততম পরীক্ষিত মহাসড়ক রুট",
    sim_transit: "যাত্রার সিমুলেশন",
    toggle_details: "বিস্তারিত দেখুন",
    modal_report_title: "রাস্তার বিপদ বা বাধার খবর দিন",
    modal_report_sub: "মাঠ পর্যায়ের অফিসারের যাচাই তালিকায় পাঠানো হবে",
    modal_desc_label: "বাধার বিবরণ:",
    modal_desc_placeholder: "যেমন, রাস্তায় পাথর বা গাছ ভেঙে পড়া",
    modal_cat_label: "বিপদের ধরন:",
    modal_cat_landslide: "ভূমিধস / কাদা",
    modal_cat_flood: "জলমগ্ন / হড়পা বান",
    modal_cat_hazard: "পাথর বা গাছ ভেঙে পড়া",
    modal_cat_bridge: "সেতুর ক্ষতি / সংকীর্ণ রাস্তা",
    modal_sev_label: "তীব্রতার মাত্রা:",
    modal_sev_partial: "এক লেনে ধীর গতি (আংশিক বন্ধ)",
    modal_sev_critical: "সম্পূর্ণ রাস্তা বন্ধ",
    modal_geo_label: "জিপিএস অবস্থানের স্থানাঙ্ক:",
    modal_latch_gps: "জিপিএস সংগ্রহ করুন",
    modal_photo_label: "ক্ষতির ছবি সংযুক্ত করুন:",
    modal_submit_report: "ফিল্ড অফিসারের কাছে রিপোর্ট পাঠান",
    hero_lockdown: "অবিলম্বে করিডোর লকডাউন জারি করুন",
    hero_greencorridor: "জরুরি মেডিকেল গ্রিন করিডোর অনুমোদন করুন",
    hero_parking: "নিরাপদ পাহাড়ি পার্কিং নির্দেশ প্রচার করুন",
    alert_emergency_prefix: "জরুরি হাইওয়ে সতর্কবার্তা",
    alert_divert_msg: "সামনে ভূমিধস। এআই বিকল্প রুট সক্রিয়: নির্দিষ্ট উপত্যকা বাইপাস দিয়ে চলুন।",
    notif_title: "হাইওয়ে নিরাপত্তা সতর্কতা",
    voice_alert_toggle: "ভয়েস অ্যালার্ট",
    notif_btn_sms: "আঞ্চলিক এসএমএস সম্প্রচার",
    btn_divert: "নিরাপদ বাইপাস দিয়ে যান",
    notif_counter_active: "সক্রিয় সতর্কতা",
    notif_sms_title: "সেল ব্রডকাস্ট সতর্কতা",
    notif_sms_desc: "বিএসএনএল/এয়ারটেল গেটওয়ের মাধ্যমে নিবন্ধিত চালকদের পাঠানো এসএমএস:",
    sms_sample_text: "ভারত সরকার জরুরি সতর্কতা: NH-6 লুমশ্নং-এ ভূমিধসের কারণে বন্ধ। এআই নির্দেশিত NH-27 বাইপাস ব্যবহার করুন।",
    // Login Portal
    ssl_tag: "২৫৬-বিট এসএসএল এনক্রিপ্টেড গেটওয়ে",
    login_portal_title: "একত্রিত একক সাইন-অন পোর্টাল",
    login_portal_sub: "বাণিজ্যিক চালক • মাঠ পর্যায়ের কর্মকর্তা • অ্যাডমিন কমান্ড",
    tab_signin: "সাইন ইন",
    tab_register: "নতুন নিবন্ধন",
    tab_forgot: "পাসওয়ার্ড ভুলে গেছেন",
    username_label: "ব্যবহারকারীর নাম / মোবাইল / ইমেইল",
    username_placeholder: "যেমন driver, officer, admin বা মোবাইল",
    password_label: "পাসওয়ার্ড",
    captcha_label: "নিরাপত্তা ক্যাপচা",
    btn_signin: "সুরক্ষিত গেটওয়েতে সাইন ইন করুন",
    quick_demo_label: "দ্রুত ডেমো অ্যাক্সেস (ভূমিকা বেছে নিন):",
    btn_demo_driver: "চালক লগইন",
    btn_demo_officer: "মাঠ পর্যায়ের কর্মকর্তা",
    btn_demo_admin: "অ্যাডমিন কমান্ড",
    reg_fullname_label: "সম্পূর্ণ নাম (সরকারি পরিচয়পত্র অনুযায়ী)",
    reg_role_label: "কার্যকরী ভূমিকা",
    reg_phone_label: "মোবাইল নম্বর (+91 সহ)",
    reg_email_label: "অফিসিয়াল ইমেইল ঠিকানা",
    reg_btn_otp: "যাচাইকরণ ওটিপি পাঠান",
    reg_otp_label: "ওয়ান-টাইম পাসওয়ার্ড (ওটিপি)",
    reg_vehicle_class_label: "বরাদ্দকৃত গাড়ির শ্রেণি",
    reg_vehicle_reg_label: "গাড়ির নিবন্ধন নম্বর",
    reg_btn_submit: "নিবন্ধন সম্পন্ন করুন এবং সাইন ইন করুন",
    forgot_phone_label: "নিবন্ধিত মোবাইল বা ইমেইল লিখুন",
    forgot_btn_otp: "যাচাইকরণ কোড পাঠান",
    forgot_new_pw_label: "নতুন পাসওয়ার্ড",
    forgot_confirm_pw_label: "নতুন পাসওয়ার্ড নিশ্চিত করুন",
    forgot_btn_submit: "পাসওয়ার্ড রিসেট করুন এবং লগইন করুন"
  },
  mn: {
    lang_name: "মৈতৈলোন্ (Manipuri)",
    flag: "🇮🇳",
    gov_brand: "নোংপোক-অৱাংবা লমদম লজিষ্টিক অমসুং এক্সেসিবিলিটি",
    gov_sub: "ভারত সরকার • মিনিষ্ট্ৰি ওফ ডিভেলপমেণ্ট ওফ নোৰ্থ ইষ্টাৰ্ন ৰিজিয়ন (MDoNER)",
    driver_portal: "দ্ৰাইভার পোৰ্টেল",
    field_ops: "ফিল্ড ওপরেসন্স",
    admin_cmd: "এডমিন কমাণ্ড",
    sign_out: "সাইন আউত",
    user_role_driver: "কমর্সিয়াল দ্ৰাইভার",
    offline_online: "ওনলাইন",
    offline_mode: "ওফলাইন মোদ",
    download_pack_title: "ওফলাইনগীদমক লম্বী সেভ তৌবিয়ু",
    search_placeholder: "চৎফম থিবীয়ু নত্রগা লম্বী খনবীরকউ...",
    directions_btn: "লম্বী তাকপা",
    mode_freight: "ট্ৰাক",
    mode_lcv: "এলসিভি",
    mode_bus: "বস",
    mode_car: "গারী/৪×৪",
    origin_placeholder: "হৌদোকফম মফম খনবীরকউ...",
    dest_placeholder: "নোংপোক-অৱাংগী চৎফম খনবীরকউ...",
    calc_corridors: "হাইৱে লম্বীসিং শেমদোকউ",
    popular_corridors: "মশক থোকপা লম্বীসিং:",
    cargo_label: "পোৎলম:",
    weight_label: "অরুম্বা:",
    cargo_pds: "পিডিএস চান-থক অমসুং চেং",
    cargo_meds: "জরুরী হিদাক অমসুং ওক্সিজেন",
    cargo_perishables: "মাং-তাকপা য়াবা লৌমীগী পোৎথোক",
    cargo_const: "শাবা-শেমবগী পোৎলম",
    tooltip_report_hazard: "লম্বীগী অপনবা পাউদমবিয়ু",
    tooltip_doppler: "দপ্লাৰ ৰাডাৰ",
    tooltip_weather_buffers: "নোংগী ঈপাউ",
    tooltip_waterway: "ৱাতৰৱে-২ ব্রহ্মপুত্র",
    tooltip_traffic: "ট্ৰাফিক ফিভম",
    tooltip_fleet: "লাইভ জিপিএস গারী ট্ৰেকিং",
    tooltip_bridges: "থোংগী ফিভম য়েংবা",
    tooltip_basemap: "মেপ: চিং / লম্বী / উপগ্রহ",
    free_flow: "চিংলেম্বা চৎথোক",
    slow_crawl: "তপ্না চৎপা",
    chokepoint: "কনবা অয়েৎপা",
    rain_legend: "দপ্লাৰ ৰাডাৰ / নোংগী ঈপাউ",
    fastest_route: "খ্বায়দগী য়াংবা অফবা লম্বী",
    sim_transit: "চৎথোক সিম্যুলেসন",
    toggle_details: "মকুপ থোকপা য়েংবিয়ু",
    modal_report_title: "লম্বীগী অপনবা / খুদোংথিবগী পাউদম",
    modal_report_sub: "ফিল্ড ওফিসাৰগী লিষ্টতা থাগনি",
    modal_desc_label: "অপনবগী মকুপ:",
    modal_desc_placeholder: "লম্বীদা নুং / উপাল তাথরকপা",
    modal_cat_label: "খুদোংথিবগী মখল:",
    modal_cat_landslide: "লৈবাক কায়বা",
    modal_cat_flood: "ঈশিং তুম্বা / ঈচাও",
    modal_cat_hazard: "নুং / উপাল তাথরকপা",
    modal_cat_bridge: "থোং কায়বা",
    modal_sev_label: "কনবগী চাং:",
    modal_sev_partial: "লেন অমদা তপ্না চৎপা",
    modal_sev_critical: "লম্বী মপুংফানা থিংজিনবা",
    modal_geo_label: "জিপিএস মফমগী নম্বর:",
    modal_latch_gps: "জিপিএস লৌবিয়ু",
    modal_photo_label: "ফটো হাপচিনবিয়ু:",
    modal_submit_report: "ফিল্ড ওফিসাৰদা পাউদম থাবিয়ু",
    hero_lockdown: "লম্বী থিংজিলহন্নবা হুকুম পীবিয়ু",
    hero_greencorridor: "মেডিকেল গ্ৰীন কোৰিদোর শেমবিয়ু",
    hero_parking: "চিংগী পার্কিং এরিয়া নির্দেশ পীবিয়ু",
    alert_emergency_prefix: "জরুরী হাইৱে পাউদম",
    alert_divert_msg: "মাংদা লৈবাক কায়বগী খুদোংথিবা। এআই অতোপ্পা লম্বী শিজিন্নবিয়ু।",
    notif_title: "হাইৱে সেফটি পাউদম",
    voice_alert_toggle: "খোনজেল পাউদম",
    notif_btn_sms: "এসএমএস ব্রডকাষ্ট",
    btn_divert: "অতোপ্পা লম্বীদা চৎলু",
    notif_counter_active: "হৌজিক লৈরিবা পাউদম",
    notif_sms_title: "সেল ব্রডকাষ্ট পাউদম",
    notif_sms_desc: "রেজিষ্টার তৌবা দ্ৰাইভারশিংদা থাবা এসএমএস:",
    sms_sample_text: "ভারত সরকারগী জরুরী পাউদম: NH-6 লৈবাক কায়বগীদমক লম্বী থিংজিনখ্রে। এআইনা তাকপা NH-27 বাইপাস লম্বী শিজিন্নবিয়ু।",
    // Login Portal
    ssl_tag: "২৫৬-বিট এসএসএল সিক্যুর গেটৱে",
    login_portal_title: "পুন্না শিজিন্নবা সাইন-ওন পোৰ্টেল",
    login_portal_sub: "দ্ৰাইভার • ফিল্ড ওফিসাৰ • এডমিন",
    tab_signin: "সাইন ইন",
    tab_register: "অনৌবা রেজিষ্ট্রেসন",
    tab_forgot: "পাসৱাৰ্ড কাউথোকপা",
    username_label: "ইউজৰনেম / ফোন / ইমেল",
    username_placeholder: "driver, officer, admin নত্রগা ফোন",
    password_label: "পাসৱাৰ্ড",
    captcha_label: "কেপচা",
    btn_signin: "সাইন ইন তৌবিয়ু",
    quick_demo_label: "খোংজেল য়াংনা ডেমো চংবা:",
    btn_demo_driver: "দ্ৰাইভার চংবা",
    btn_demo_officer: "ফিল্ড ওফিসাৰ",
    btn_demo_admin: "এডমিন",
    reg_fullname_label: "অচুম্বা মিং",
    reg_role_label: "থৌদাং",
    reg_phone_label: "মোবাইল নম্বর",
    reg_email_label: "ইমেল এদ্ৰেস",
    reg_btn_otp: "ওটিপি থাবিয়ু",
    reg_otp_label: "ওটিপি",
    reg_vehicle_class_label: "গারীগী মখল",
    reg_vehicle_reg_label: "গারী নম্বর",
    reg_btn_submit: "রেজিষ্ট্রেসন লোইশিনবিয়ু",
    forgot_phone_label: "রেজিষ্টার তৌবা ফোন নত্রগা ইমেল",
    forgot_btn_otp: "ওটিপি থাবিয়ু",
    forgot_new_pw_label: "অনৌবা পাসৱাৰ্ড",
    forgot_confirm_pw_label: "পাসৱাৰ্ড অমুক হাপচিনবিয়ু",
    forgot_btn_submit: "পাসৱাৰ্ড শেমদোকউ অমসুং চংবিয়ু"
  }
};

let currentLang = localStorage.getItem("ner_lang") || "en";

/**
 * Get translated text for key
 */
function t(key, defaultVal = "") {
  const dict = I18N_TRANSLATIONS[currentLang] || I18N_TRANSLATIONS.en;
  return dict[key] || (I18N_TRANSLATIONS.en[key] || defaultVal);
}

/**
 * Apply language to DOM elements marked with data-i18n
 */
function applyLanguage(lang) {
  if (!I18N_TRANSLATIONS[lang]) lang = "en";
  currentLang = lang;
  localStorage.setItem("ner_lang", lang);

  const dict = I18N_TRANSLATIONS[lang];

  // Update elements with data-i18n attribute
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (dict[key]) {
      // If element is an input button/submit, update its value; otherwise innerText
      if (el.tagName === "INPUT" && (el.type === "button" || el.type === "submit")) {
        el.value = dict[key];
      } else {
        el.innerText = dict[key];
      }
    }
  });

  // Update elements with data-i18n-placeholder attribute
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (dict[key]) {
      el.placeholder = dict[key];
    }
  });

  // Update elements with data-i18n-title attribute
  document.querySelectorAll("[data-i18n-title]").forEach(el => {
    const key = el.getAttribute("data-i18n-title");
    if (dict[key]) {
      el.title = dict[key];
    }
  });

  // Update all language selector dropdowns in the DOM
  document.querySelectorAll(".lang-dropdown, #lang-switcher-select").forEach(sel => {
    if (sel.value !== lang) {
      sel.value = lang;
    }
  });

  // Dispatch custom event for dynamic components (charts, Leaflet popups, app.js drawers)
  window.dispatchEvent(new CustomEvent("ner_language_changed", { detail: { lang, dict } }));
}

/**
 * Creates the HTML for the Language Selector Dropdown
 */
function renderLanguageDropdownMarkup() {
  return `
    <div class="lang-selector-wrap" title="Select Regional Language (অসমীয়া, हिंदी, বাংলা, মৈতৈলোন্, English)">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;">
        <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
      <select class="lang-dropdown">
        <option value="en" ${currentLang === 'en' ? 'selected' : ''}>English (EN)</option>
        <option value="as" ${currentLang === 'as' ? 'selected' : ''}>অসমীয়া (AS)</option>
        <option value="hi" ${currentLang === 'hi' ? 'selected' : ''}>हिंदी (HI)</option>
        <option value="bn" ${currentLang === 'bn' ? 'selected' : ''}>বাংলা (BN)</option>
        <option value="mn" ${currentLang === 'mn' ? 'selected' : ''}>মৈতৈলোন্ (MN)</option>
      </select>
    </div>
  `;
}

/**
 * Initialize Language Switcher across all target containers in DOM
 */
function initLanguageSwitcher() {
  const containers = [
    document.getElementById("lang-switcher-container"),
    document.getElementById("login-lang-widget")
  ].filter(Boolean);

  if (containers.length === 0) return;

  containers.forEach(container => {
    container.innerHTML = renderLanguageDropdownMarkup();
    const sel = container.querySelector(".lang-dropdown");
    if (sel) {
      sel.addEventListener("change", (e) => {
        applyLanguage(e.target.value);
      });
    }
  });

  // Apply active language immediately to all tags
  applyLanguage(currentLang);
}

// Auto-initialize when script loads
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initLanguageSwitcher();
    });
  } else {
    initLanguageSwitcher();
  }
}
