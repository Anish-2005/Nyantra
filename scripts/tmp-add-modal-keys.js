/* Adds disbursements.delete_title / delete_confirm keys to en/hi locales. */
const fs = require('fs');

const additions = {
  en: {
    delete_title: 'Delete Disbursement',
    delete_confirm: 'Are you sure you want to delete this disbursement? This action cannot be undone.',
  },
  hi: {
    delete_title: 'डिस्बर्समेंट हटाएँ',
    delete_confirm: 'क्या आप वाकई इस डिस्बर्समेंट को हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।',
  },
};

for (const lang of ['en', 'hi']) {
  const path = `src/locales/${lang}.json`;
  const data = JSON.parse(fs.readFileSync(path, 'utf8'));
  if (!data.disbursements) data.disbursements = {};
  for (const [k, v] of Object.entries(additions[lang])) {
    if (data.disbursements[k] === undefined) data.disbursements[k] = v;
  }
  fs.writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
  console.log(`${lang}: disbursements keys=${Object.keys(data.disbursements).length}`);
}
