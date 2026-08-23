const fs = require('fs');

const enPath = './src/locales/en.json';
const hiPath = './src/locales/hi.json';
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const hi = JSON.parse(fs.readFileSync(hiPath, 'utf8'));

// key path -> [english, hindi]
const ADDITIONS = {
  'login.tagline': ['Empowering Justice Through Technology', 'तकनीक के माध्यम से न्याय को सशक्त बनाना'],
  'login.headline_1': ['Direct Benefits,', 'प्रत्यक्ष लाभ,'],
  'login.headline_highlight': ['Delivered with Dignity', 'गरिमा के साथ पहुँचाए गए'],
  'login.description': [
    'Nyantra brings speed and transparency to social justice entitlements under the PCR & PoA Acts — from application to money in your bank.',
    'न्यान्त्रा PCR और PoA अधिनियमों के अंतर्गत सामाजिक न्याय के अधिकारों में गति और पारदर्शिता लाता है - आवेदन से लेकर आपके बैंक खाते तक।',
  ],
  'login.feature_secure_title': ['Bank-grade Security', 'बैंक-स्तरीय सुरक्षा'],
  'login.feature_secure_desc': [
    'Aadhaar-verified identities with encrypted, auditable records',
    'आधार-सत्यापित पहचान, एन्क्रिप्टेड और ऑडिटयोग्य रिकॉर्ड के साथ',
  ],
  'login.feature_track_title': ['Real-time Tracking', 'रीयल-टाइम ट्रैकिंग'],
  'login.feature_track_desc': [
    'Follow every application and disbursement as it happens',
    'हर आवेदन और वितरण को होते हुए देखें',
  ],
  'login.feature_dbt_title': ['Direct DBT Transfers', 'प्रत्यक्ष DBT स्थानांतरण'],
  'login.feature_dbt_desc': [
    'Benefits delivered straight to verified bank accounts via PFMS',
    'PFMS के माध्यम से सत्यापित बैंक खातों में सीधे लाभ पहुँचाए जाते हैं',
  ],
  'login.stat_1_value': ['99.5%', '99.5%'],
  'login.stat_1_label': ['Verification accuracy', 'सत्यापन सटीकता'],
  'login.stat_2_value': ['72%', '72%'],
  'login.stat_2_label': ['Faster processing', 'तेज़ प्रक्रिया'],
  'login.stat_3_value': ['100%', '100%'],
  'login.stat_3_label': ['Transparent tracking', 'पारदर्शी ट्रैकिंग'],
  'login.sign_in_tab': ['Sign In', 'साइन इन'],
  'login.register_tab': ['Register', 'पंजीकरण करें'],
  'login.sign_in_subtitle': ['Sign in to continue to your dashboard', 'अपने डैशबोर्ड पर जारी रखने के लिए साइन इन करें'],
  'login.register_subtitle': ['Create your account to get started', 'शुरू करने के लिए अपना खाता बनाएँ'],
  'login.toggle_to_sign_in': ['Have an account?', 'क्या आपके पास खाता है?'],
  'login.toggle_to_register': ["Don't have an account?", 'खाता नहीं है?'],
  'login.sign_in_action': ['Sign in', 'साइन इन करें'],
  'login.create_account_action': ['Create account', 'खाता बनाएँ'],
  'login.welcome_back_title': ['Welcome back', 'वापसी पर स्वागत है'],
  'login.role_user_title': ['I am a Beneficiary', 'मैं एक लाभार्थी हूँ'],
  'login.role_user_desc': [
    'Apply for benefits, track payments and raise grievances',
    'लाभ के लिए आवेदन करें, भुगतान ट्रैक करें और शिकायतें दर्ज करें',
  ],
  'login.role_officer_title': ['I am an Officer', 'मैं एक अधिकारी हूँ'],
  'login.role_officer_desc': [
    'Review applications, verify documents and manage disbursements',
    'आवेदनों की समीक्षा करें, दस्तावेज़ सत्यापित करें और वितरण प्रबंधित करें',
  ],
  'login.role_footer_note': [
    'Your role can be updated later by platform administrators if needed.',
    'आवश्यकता होने पर आपकी भूमिका बाद में प्लेटफ़ॉर्म व्यवस्थापक द्वारा अपडेट की जा सकती है।',
  ],
};

function ensurePath(obj, pathParts) {
  let node = obj;
  for (const p of pathParts.slice(0, -1)) {
    if (typeof node[p] !== 'object' || node[p] === null) node[p] = {};
    node = node[p];
  }
  return node;
}

let count = 0;
for (const [key, [enVal, hiVal]] of Object.entries(ADDITIONS)) {
  const parts = key.split('.');
  const leaf = parts[parts.length - 1];
  const enNode = ensurePath(en, parts);
  if (!(leaf in enNode)) { enNode[leaf] = enVal; count++; }
  const hiNode = ensurePath(hi, parts);
  if (!(leaf in hiNode)) { hiNode[leaf] = hiVal; count++; }
}

fs.writeFileSync(enPath, JSON.stringify(en, null, 2) + '\n');
fs.writeFileSync(hiPath, JSON.stringify(hi, null, 2) + '\n');
console.log(`Added ${count} locale entries`);
