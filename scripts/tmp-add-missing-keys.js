const fs = require('fs');

const enPath = './src/locales/en.json';
const hiPath = './src/locales/hi.json';
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const hi = JSON.parse(fs.readFileSync(hiPath, 'utf8'));

// key path -> [english, hindi]
const ADDITIONS = {
  // top-level
  'act_type': ['Act Type', 'अधिनियम का प्रकार'],
  'categories': ['Categories', 'श्रेणियाँ'],
  'confirm_delete_beneficiary': ['Are you sure you want to delete this beneficiary? This action cannot be undone.', 'क्या आप वाकई इस लाभार्थी को हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।'],
  'confirm_delete_beneficiary_title': ['Delete Beneficiary', 'लाभार्थी हटाएँ'],
  'deleted_failed': ['Failed to delete', 'हटाने में विफल'],
  'deleted_success': ['Deleted successfully', 'सफलतापूर्वक हटाया गया'],
  'initiated_date': ['Initiated Date', 'प्रारंभ तिथि'],
  'loading_applications': ['Loading applications…', 'आवेदन लोड हो रहे हैं…'],
  'loading_beneficiaries': ['Loading beneficiaries…', 'लाभार्थी लोड हो रहे हैं…'],
  'loading_disbursements': ['Loading disbursements…', 'वितरण लोड हो रहे हैं…'],
  'loading_feedback': ['Loading feedback…', 'प्रतिक्रिया लोड हो रही है…'],
  'location': ['Location', 'स्थान'],
  'no_permission_delete': ['Insufficient permissions to delete beneficiary. Contact your administrator.', 'लाभार्थी हटाने के लिए अपर्याप्त अनुमतियाँ। कृपया अपने व्यवस्थापक से संपर्क करें।'],
  'timeline_1': ['Timeline', 'समय-रेखा'],
  'transaction_id': ['Transaction ID', 'लेनदेन आईडी'],
  'utr_number': ['UTR Number', 'यूटीआर नंबर'],

  // applications.*
  'applications.approved': ['Approved', 'स्वीकृत'],
  'applications.inReview': ['In Review', 'समीक्षा में'],
  'applications.documentsRequired': ['Documents Required', 'दस्तावेज़ आवश्यक'],
  'applications.savedSuccess': ['Application saved successfully', 'आवेदन सफलतापूर्वक सहेजा गया'],
  'applications.deletedSuccess': ['Application deleted successfully', 'आवेदन सफलतापूर्वक हटाया गया'],
  'applications.deletedFailed': ['Failed to delete application', 'आवेदन हटाने में विफल'],

  // dashboard.*
  'dashboard.common.generationProgress': ['Generation Progress', 'जनरेशन प्रगति'],
  'dashboard.disbursements.noRecords': ['No disbursements found.', 'कोई वितरण नहीं मिला।'],
  'dashboard.status.maintenance': ['Maintenance', 'रखरखाव में'],
  'dashboard.status.down': ['Down', 'डाउन'],

  // disbursements.*
  'disbursements.no_records': ['No disbursements found.', 'कोई वितरण नहीं मिला।'],

  // extracted.*
  'extracted.adjust_amount': ['Adjust Relief Amount', 'राहत राशि समायोजित करें'],
  'extracted.all_cases': ['All Cases', 'सभी मामले'],
  'extracted.all_fields_required_for_progressive': ['All fields are required for progressive disbursement.', 'प्रगतिशील वितरण के लिए सभी फ़ील्ड आवश्यक हैं।'],
  'extracted.avg_first_response': ['Avg First Response', 'औसत प्रथम प्रतिक्रिया'],
  'extracted.bank_name': ['Bank Name', 'बैंक का नाम'],
  'extracted.beneficiary_feedback': ['Beneficiary Feedback', 'लाभार्थी प्रतिक्रिया'],
  'extracted.beneficiary_not_found': ['Beneficiary not found', 'लाभार्थी नहीं मिला'],
  'extracted.beneficiary_updated': ['Beneficiary updated successfully', 'लाभार्थी सफलतापूर्वक अपडेट किया गया'],
  'extracted.choose_export_options': ['Choose export options', 'निर्यात विकल्प चुनें'],
  'extracted.choose_role': ['Choose Your Role', 'अपनी भूमिका चुनें'],
  'extracted.click_create_to_get_started': ['Click Create to get started', 'शुरू करने के लिए \u201cबनाएँ\u201d पर क्लिक करें'],
  'extracted.closed': ['Closed', 'बंद'],
  'extracted.comprehensiveExport': ['Comprehensive Export', 'व्यापक निर्यात'],
  'extracted.comprehensiveExportDescription': ['Export all data including analytics and summaries', 'विश्लेषण और सारांश सहित सभी डेटा निर्यात करें'],
  'extracted.create_beneficiary_first': ['Create a beneficiary first', 'पहले एक लाभार्थी बनाएँ'],
  'extracted.delete_application': ['Delete Application', 'आवेदन हटाएँ'],
  'extracted.edit_application': ['Edit Application', 'आवेदन संपादित करें'],
  'extracted.export_subtitle': ['Select the data and format for your export', 'अपने निर्यात के लिए डेटा और प्रारूप चुनें'],
  'extracted.failed_create_beneficiary': ['Failed to create beneficiary', 'लाभार्थी बनाने में विफल'],
  'extracted.father_name': ["Father's Name", 'पिता का नाम'],
  'extracted.filtered_cases': ['Filtered cases', 'फ़िल्टर किए गए मामले'],
  'extracted.five_star_percentage': ['5-Star Percentage', '5-स्टार प्रतिशत'],
  'extracted.high_priority_open': ['High Priority Open', 'उच्च प्राथमिकता वाले खुले मामले'],
  'extracted.internal_reference': ['Internal Reference', 'आंतरिक संदर्भ'],
  'extracted.login_to_view_applications': ['Please log in to view your applications', 'कृपया अपने आवेदन देखने के लिए लॉग इन करें'],
  'extracted.lookup_failed': ['Lookup failed', 'खोज विफल रही'],
  'extracted.needs_attention': ['Needs Attention', 'ध्यान देने की आवश्यकता'],
  'extracted.no_disbursements_match_filters': ['No disbursements match your filters', 'आपके फ़िल्टर से मेल खाता कोई वितरण नहीं मिला'],
  'extracted.no_matching_applications': ['No matching applications found', 'कोई मेल खाता आवेदन नहीं मिला'],
  'extracted.not_created': ['Not created yet', 'अभी तक नहीं बनाया गया'],
  'extracted.officer_notes': ['Officer Notes', 'अधिकारी की टिप्पणियाँ'],
  'extracted.open_over_7d': ['Open > 7 Days', '7+ दिनों से खुला'],
  'extracted.performance_overview': ['Performance Overview', 'प्रदर्शन का अवलोकन'],
  'extracted.please_enter_valid_email': ['Please enter a valid email address', 'कृपया एक वैध ईमेल पता दर्ज करें'],
  'extracted.provider_1': ['Provider', 'प्रदाता'],
  'extracted.rating_distribution': ['Rating Distribution', 'रेटिंग वितरण'],
  'extracted.resolution_rate': ['Resolution Rate', 'समाधान दर'],
  'extracted.secure_identity_verification_description': ['Secure Aadhaar-based identity verification for Nyantra DBT portal beneficiaries.', 'न्यान्त्रा DBT पोर्टल लाभार्थियों के लिए सुरक्षित आधार-आधारित पहचान सत्यापन।'],
  'extracted.select_installment_first': ['Please select an installment to disburse.', 'कृपया वितरित करने के लिए एक किस्त चुनें।'],
  'extracted.select_your_role_description': ['Select how you want to use Nyantra - as a beneficiary or as an officer.', 'चुनें कि आप न्यान्त्रा का उपयोग कैसे करना चाहते हैं - लाभार्थी के रूप में या अधिकारी के रूप में।'],
  'extracted.send_message': ['Send Message', 'संदेश भेजें'],
  'extracted.sla_compliance': ['SLA Compliance', 'एसएलए अनुपालन'],
  'extracted.sortOptions.initiatedDate': ['Initiated Date', 'प्रारंभ तिथि'],
  'extracted.sortOrderOptions.highToLow': ['High to Low', 'उच्च से निम्न'],
  'extracted.sortOrderOptions.lowToHigh': ['Low to High', 'निम्न से उच्च'],
  'extracted.sortOrderOptions.pendingToCompleted': ['Pending to Completed', 'लंबित से पूर्ण तक'],
  'extracted.sortOrderOptions.completedToPending': ['Completed to Pending', 'पूर्ण से लंबित तक'],
  'extracted.total_responses': ['Total Responses', 'कुल प्रतिक्रियाएँ'],
  'extracted.upload_download_note': ['Upload .xlsx or .csv files, or download the template below.', '.xlsx या .csv फ़ाइलें अपलोड करें, या नीचे दिया टेम्पलेट डाउनलोड करें।'],
  'extracted.verify_identity': ['Verify Identity', 'पहचान सत्यापित करें'],
  'extracted.view_file': ['View File', 'फ़ाइल देखें'],
};

// Fill empty hi strings too
const HI_FILL = {
  'extracted.average_rating': 'औसत रेटिंग',
  'extracted.date': 'दिनांक',
  'extracted.rating': 'रेटिंग',
  'extracted.sending': 'भेजा जा रहा है…',
};

function ensurePath(obj, pathParts) {
  let node = obj;
  for (const p of pathParts.slice(0, -1)) {
    if (typeof node[p] !== 'object' || node[p] === null) node[p] = {};
    node = node[p];
  }
  return node;
}

let addedEn = 0;
let addedHi = 0;
for (const [key, [enVal, hiVal]] of Object.entries(ADDITIONS)) {
  const parts = key.split('.');
  const enNode = ensurePath(en, parts);
  if (!(parts[parts.length - 1] in enNode)) { enNode[parts[parts.length - 1]] = enVal; addedEn++; }
  const hiNode = ensurePath(hi, parts);
  const leaf = parts[parts.length - 1];
  if (!(leaf in hiNode) || (typeof hiNode[leaf] === 'string' && hiNode[leaf].trim() === '')) {
    hiNode[leaf] = hiVal; addedHi++;
  }
}
for (const [key, val] of Object.entries(HI_FILL)) {
  const parts = key.split('.');
  const hiNode = ensurePath(hi, parts);
  const leaf = parts[parts.length - 1];
  if (!(leaf in hiNode) || hiNode[leaf].trim() === '') { hiNode[leaf] = val; addedHi++; }
}

fs.writeFileSync(enPath, JSON.stringify(en, null, 2) + '\n');
fs.writeFileSync(hiPath, JSON.stringify(hi, null, 2) + '\n');
console.log(`Added ${addedEn} keys to en.json, ${addedHi} to hi.json`);
