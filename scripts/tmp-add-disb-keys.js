/* Adds disbursements.* UI keys + fixes junk extracted.financial_overview in en/hi locales. */
const fs = require('fs');

const additions = {
  en: {
    financial_overview: 'Financial Overview',
    total_sanctioned: 'Total Sanctioned',
    progressive_total: 'Progressive Total',
    installments_released: 'Installments Released',
    installments_remaining: 'Installments Remaining',
    new_updates: 'New Updates',
    dismiss_all: 'Dismiss All',
    more_updates: 'more updates',
    pct_disbursed: '% disbursed',
    installment_word: 'Installment',
    installments_word: 'installments',
    select: 'Select',
    disburse: 'Disburse',
    alert_new: 'New Disbursement',
    alert_installment: 'Installment Received',
    alert_completed: 'Payment Completed',
  },
  hi: {
    financial_overview: 'वित्तीय अवलोकन',
    total_sanctioned: 'कुल स्वीकृत राशि',
    progressive_total: 'प्रगतिशील कुल',
    installments_released: 'जारी किए गए किस्त',
    installments_remaining: 'शेष किस्त',
    new_updates: 'नए अपडेट',
    dismiss_all: 'सभी हटाएँ',
    more_updates: 'और अपडेट',
    pct_disbursed: '% वितरित',
    installment_word: 'किस्त',
    installments_word: 'किस्त',
    select: 'चुनें',
    disburse: 'वितरित करें',
    alert_new: 'नया वितरण',
    alert_installment: 'किस्त प्राप्त हुई',
    alert_completed: 'भुगतान पूर्ण',
  },
};

for (const lang of ['en', 'hi']) {
  const path = `src/locales/${lang}.json`;
  const data = JSON.parse(fs.readFileSync(path, 'utf8'));
  data.extracted = data.extracted || {};
  for (const [k, v] of Object.entries(additions[lang])) {
    if (!data.disbursements) data.disbursements = {};
    // disbursements namespace keeps page-specific strings
    if (k === 'financial_overview' || k === 'total_sanctioned') continue;
    if (data.disbursements[k] === undefined) data.disbursements[k] = v;
  }
  // Fix junk JSX-comment values
  if (
    typeof data.extracted.financial_overview !== 'string' ||
    data.extracted.financial_overview.includes('/*')
  ) {
    data.extracted.financial_overview = additions[lang].financial_overview;
  }
  fs.writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
  console.log(`${lang}: disbursements keys=${Object.keys(data.disbursements).length}, financial_overview="${data.extracted.financial_overview}"`);
}
