export type Language = 'en' | 'kn' | 'hi' | 'te';

export interface Translations {
  appName: string;
  tagline: string;
  order: string;
  orders: string;
  ledger: string;
  profile: string;
  todayRate: string;
  perKg: string;
  repeatOrder: string;
  reviewOrder: string;
  placeOrder: string;
  orderPlaced: string;
  estimatedTotal: string;
  estimatedNote: string;
  cutoffAlert: string;
  totalKg: string;
  items: string;
  deliveryDate: string;
  deliverySlot: string;
  notesPlaceholder: string;
  outstandingBalance: string;
  creditLimit: string;
  availableCredit: string;
  recordPayment: string;
  invoice: string;
  deliveredWeight: string;
  orderedWeight: string;
  statusPlaced: string;
  statusConfirmed: string;
  statusOut: string;
  statusDelivered: string;
  statusCancelled: string;
  selectLanguage: string;
  logout: string;
  standingOrders: string;
  switchShop: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    appName: "ChickenLink",
    tagline: "Fresh Poultry Order & Delivery",
    order: "Order",
    orders: "Orders",
    ledger: "Ledger",
    profile: "Profile",
    todayRate: "Today's Rate",
    perKg: "/kg",
    repeatOrder: "Repeat Last Order",
    reviewOrder: "Review Order",
    placeOrder: "Place Order",
    orderPlaced: "Order Placed Successfully",
    estimatedTotal: "Estimated Total",
    estimatedNote: "Estimated amount. Final bill is based on exact delivered weight.",
    cutoffAlert: "Order before 9:00 PM for tomorrow morning delivery",
    totalKg: "Total Weight",
    items: "items",
    deliveryDate: "Delivery Date",
    deliverySlot: "Delivery Slot",
    notesPlaceholder: "Special cutting instructions or remarks (optional)",
    outstandingBalance: "Outstanding Balance",
    creditLimit: "Credit Limit",
    availableCredit: "Available Credit",
    recordPayment: "Make Payment",
    invoice: "Invoice",
    deliveredWeight: "Delivered Wt",
    orderedWeight: "Ordered Wt",
    statusPlaced: "Placed",
    statusConfirmed: "Confirmed",
    statusOut: "Out for Delivery",
    statusDelivered: "Delivered",
    statusCancelled: "Cancelled",
    selectLanguage: "Preferred Language",
    logout: "Log Out",
    standingOrders: "Standing Orders",
    switchShop: "Switch Shop (Demo)",
  },
  kn: {
    appName: "ಚಿಕನ್ ಲಿಂಕ್ (ChickenLink)",
    tagline: "ದೈನಂದಿನ ಕೋಳಿ ಮಾಂಸ ಆರ್ಡರ್ ಮತ್ತು ವಿತರಣೆ",
    order: "ಆರ್ಡರ್",
    orders: "ಆರ್ಡರ್‌ಗಳು",
    ledger: "ಖಾತೆ ಪುಸ್ತಕ",
    profile: "ವಿವರಗಳು",
    todayRate: "ಇಂದಿನ ದರ",
    perKg: "/ಕೆಜಿ",
    repeatOrder: "ಹಿಂದಿನ ಆರ್ಡರ್ ಪುನರಾವರ್ತಿಸಿ",
    reviewOrder: "ಆರ್ಡರ್ ಪರಿಶೀಲಿಸಿ",
    placeOrder: "ಆರ್ಡರ್ ಸಲ್ಲಿಸಿ",
    orderPlaced: "ಆರ್ಡರ್ ಯಶಸ್ವಿಯಾಗಿ ದಾಖಲಾಗಿದೆ",
    estimatedTotal: "ಅಂದಾಜು ಮೊತ್ತ",
    estimatedNote: "ಅಂದಾಜು ಮೊತ್ತ. ಅಂತಿಮ ಬಿಲ್ ವಿತರಿಸಿದ ತೂಕದ ಆಧಾರದ ಮೇಲೆ ಇರುತ್ತದೆ.",
    cutoffAlert: "ನಾಳೆ ಬೆಳಗಿನ ವಿತರಣೆಗಾಗಿ ರಾತ್ರಿ 9:00 ರೊಳಗೆ ಆರ್ಡರ್ ಮಾಡಿ",
    totalKg: "ಒಟ್ಟು ತೂಕ",
    items: "ವಸ್ತುಗಳು",
    deliveryDate: "ವಿತರಣಾ ದಿನಾಂಕ",
    deliverySlot: "ವಿತರಣಾ ಸಮಯ",
    notesPlaceholder: "ಕಟಿಂಗ್ ಸೂಚನೆಗಳು ಅಥವಾ ಟಿಪ್ಪಣಿಗಳು (ಐಚ್ಛಿಕ)",
    outstandingBalance: "ಬಾಕಿ ಉಳಿದ ಮೊತ್ತ",
    creditLimit: "ಕ್ರೆಡಿಟ್ ಮಿತಿ",
    availableCredit: "ಲಭ್ಯವಿರುವ ಕ್ರೆಡಿಟ್",
    recordPayment: "ಪಾವತಿ ಮಾಡಿ",
    invoice: "ಇನ್‌ವಾಯ್ಸ್",
    deliveredWeight: "ವಿತರಿಸಿದ ತೂಕ",
    orderedWeight: "ಕೋರಿದ ತೂಕ",
    statusPlaced: "ದಾಖಲಾಗಿದೆ",
    statusConfirmed: "ದೃಢೀಕರಿಸಲಾಗಿದೆ",
    statusOut: "ವಿತರಣೆಗೆ ಹೊರಟಿದೆ",
    statusDelivered: "ವಿತರಿಸಲಾಗಿದೆ",
    statusCancelled: "ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ",
    selectLanguage: "ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ",
    logout: "ಲಾಗ್ ಔಟ್",
    standingOrders: "ದೈನಂದಿನ ಪುನರಾವರ್ತಿತ ಆರ್ಡರ್‌ಗಳು",
    switchShop: "ಅಂಗಡಿ ಬದಲಾಯಿಸಿ (ಡೆಮೊ)",
  },
  hi: {
    appName: "चिकनलिंक (ChickenLink)",
    tagline: "ताज़ा पोल्ट्री ऑर्डर और डिलीवरी",
    order: "ऑर्डर",
    orders: "ऑर्डर सूची",
    ledger: "खाता / लेजर",
    profile: "प्रोफ़ाइल",
    todayRate: "आज का भाव",
    perKg: "/किग्रा",
    repeatOrder: "पिछला ऑर्डर दोहराएं",
    reviewOrder: "ऑर्डर जांचें",
    placeOrder: "ऑर्डर भेजें",
    orderPlaced: "ऑर्डर सफलतापूर्वक दर्ज हुआ",
    estimatedTotal: "अनुमानित कुल",
    estimatedNote: "अनुमानित राशि। अंतिम बिल डिलीवर किए गए वास्तविक वजन पर बनेगा।",
    cutoffAlert: "कल सुबह की डिलीवरी के लिए रात 9:00 बजे से पहले ऑर्डर दें",
    totalKg: "कुल वजन",
    items: "सामान",
    deliveryDate: "डिलीवरी की तारीख",
    deliverySlot: "डिलीवरी स्लॉट",
    notesPlaceholder: "कटिंग निर्देश या कोई विशेष नोट (वैकल्पिक)",
    outstandingBalance: "बकाया राशि",
    creditLimit: "क्रेडिट सीमा",
    availableCredit: "उपलब्ध क्रेडिट",
    recordPayment: "भुगतान करें",
    invoice: "बिल / इनवॉइस",
    deliveredWeight: "डिलीवर वजन",
    orderedWeight: "ऑर्डर वजन",
    statusPlaced: "दर्ज हुआ",
    statusConfirmed: "कन्फर्म हुआ",
    statusOut: "डिलीवरी पर निकला",
    statusDelivered: "डिलीवर हो गया",
    statusCancelled: "रद्द",
    selectLanguage: "भाषा चुनें",
    logout: "लॉग आउट",
    standingOrders: "नियमित स्थायी ऑर्डर",
    switchShop: "दुकान बदलें (डेमो)",
  },
  te: {
    appName: "చికెన్‌లింక్ (ChickenLink)",
    tagline: "తాజా చికెన్ ఆర్డర్ మరియు డెలివరీ",
    order: "ఆర్డర్",
    orders: "ఆర్డర్లు",
    ledger: "లెడ్జర్ ఖాతా",
    profile: "ప్రొఫైల్",
    todayRate: "నేటి ధర",
    perKg: "/కేజీ",
    repeatOrder: "గత ఆర్డర్ పునరావృతం చేయండి",
    reviewOrder: "ఆర్డర్ సమీక్షించండి",
    placeOrder: "ఆర్డర్ చేయండి",
    orderPlaced: "ఆర్డర్ విజయవంతంగా నమోదైంది",
    estimatedTotal: "అంచనా మొత్తం",
    estimatedNote: "అంచనా మొత్తం. తుది బిల్లు డెలివరీ చేసిన ఖచ్చితమైన బరువుపై ఆధారపడి ఉంటుంది.",
    cutoffAlert: "రేపటి ఉదయం డెలివరీ కోసం రాత్రి 9:00 లోపు ఆర్డర్ చేయండి",
    totalKg: "మొత్తం బరువు",
    items: "వస్తువులు",
    deliveryDate: "డెలివరీ తేదీ",
    deliverySlot: "డెలివరీ స్లాట్",
    notesPlaceholder: "కటింగ్ సూచనలు లేదా వివరాలు (ఐచ్ఛికం)",
    outstandingBalance: "బాకీ ఉన్న మొత్తం",
    creditLimit: "క్రెడిట్ పరిమితి",
    availableCredit: "అందుబాటులో ఉన్న క్రెడిట్",
    recordPayment: "చెల్లింపు చేయండి",
    invoice: "ఇన్‌వాయిస్",
    deliveredWeight: "డెలివరీ బరువు",
    orderedWeight: "ఆర్డర్ చేసిన బరువు",
    statusPlaced: "నమోదైంది",
    statusConfirmed: "ధృవీకరించబడింది",
    statusOut: "డెలివరీకి బయలుదేరింది",
    statusDelivered: "డెలివరీ పూర్తయింది",
    statusCancelled: "రద్దు చేయబడింది",
    selectLanguage: "భాషను ఎంచుకోండి",
    logout: "లాగ్ అవుట్",
    standingOrders: "రెగ్యులర్ ఆర్డర్లు",
    switchShop: "షాప్ మార్చండి (డెమో)",
  }
};
