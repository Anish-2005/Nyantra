# One-shot splice: replace table+pagination+inspector with single-beneficiary profile UI
import io

P = 'src/features/beneficiaries/UserBeneficiariesPage.tsx'
raw = io.open(P, encoding='utf-8', newline='').read()
lines = raw.split('\n')

start = None
for i, l in enumerate(lines):
    if '{/* Beneficiaries List */}' in l:
        start = i
        break
assert start is not None, 'marker not found'

# Find trailing close of the render return: locate last '  );' followed by '}'
end = None
for i in range(len(lines) - 1, 0, -1):
    if lines[i] == '}' and lines[i - 1].strip() == ');':
        end = i - 1  # index of '  );'
        break
assert end is not None, 'closing not found'

NEW = '''      {/* Single Beneficiary Profile */}
      {!profile ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="theme-bg-card theme-border-glass border rounded-xl px-6 py-16 text-center"
        >
          <div className="mx-auto w-16 h-16 rounded-2xl accent-gradient text-white grid place-items-center mb-4 shadow-lg">
            <UserPlus className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-semibold tracking-tight theme-text-primary">
            {t('extracted.no_beneficiaries_yet')}
          </h2>
          <p className="text-sm theme-text-muted mt-1 max-w-md mx-auto">
            {t('extracted.add_your_beneficiary_details_to_get_started')}
          </p>
          <button
            onClick={createNewBeneficiary}
            className="mt-5 h-10 px-4 rounded-md accent-gradient text-white text-sm font-semibold hover:opacity-90 inline-flex items-center gap-2 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            {t('extracted.add_beneficiary')}
          </button>
        </motion.div>
      ) : (
        <>
          {/* ID card hero */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="theme-bg-card theme-border-glass border rounded-xl overflow-hidden relative"
          >
            <div className="absolute inset-x-0 top-0 h-1 accent-gradient" aria-hidden="true" />
            <div className="p-5 flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="w-14 h-14 rounded-xl accent-gradient text-white text-lg font-bold grid place-items-center uppercase shrink-0 shadow-md">
                {(profile.name || '?').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <h2 className="text-lg font-semibold tracking-tight theme-text-primary truncate">
                    {profile.name || '\\u2014'}
                  </h2>
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-blue-500/10 text-blue-600 dark:text-blue-400 flex-shrink-0">
                    {profile.category}
                  </span>
                </div>
                <p className="text-xs theme-text-muted font-mono mt-0.5">{profile.id}</p>

                <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${getStatusColor(profile.status)}`}>
                    {createElement(getStatusIcon(profile.status), { className: 'w-3 h-3' })}
                    {humanize(profile.status)}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${getVerificationColor(profile.verificationStatus)}`}>
                    {createElement(getVerificationIcon(profile.verificationStatus), { className: 'w-3 h-3' })}
                    {humanize(profile.verificationStatus)}
                  </span>
                </div>

                <div className="flex items-center gap-4 mt-3 flex-wrap text-xs theme-text-muted">
                  <span className="inline-flex items-center gap-1.5 min-w-0">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{profile.district}, {profile.state}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 tabular-nums">
                    <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                    {formatDate(profile.registrationDate)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-stretch sm:self-auto sm:flex-col lg:flex-row">
                {profile.scStCertificate && (
                  <a
                    href={profile.scStCertificate}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-md border theme-border-glass grid place-items-center theme-text-muted hover:text-green-500 hover:theme-bg-glass transition-colors"
                    title={t('extracted.view_certificate')}
                  >
                    <Eye className="w-4 h-4" />
                  </a>
                )}
                <button
                  onClick={() => {
                    setEditingBeneficiary(profile);
                    setShowNewBeneficiaryForm(true);
                  }}
                  className="h-9 px-3.5 rounded-md accent-gradient text-white text-xs font-semibold hover:opacity-90 inline-flex items-center justify-center gap-1.5 transition-opacity"
                >
                  <Edit className="w-3.5 h-3.5" />
                  {t('extracted.edit')}
                </button>
                <button
                  onClick={() => confirmDelete(profile.id)}
                  className="w-9 h-9 rounded-md border theme-border-glass grid place-items-center theme-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  title={t('extracted.delete')}
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
            {/* Verification rail */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="theme-bg-card theme-border-glass border rounded-xl overflow-hidden lg:sticky lg:top-20"
            >
              <div className="px-4 py-3 border-b theme-border-glass flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold theme-text-primary">{t('extracted.verification')}</h3>
                <Shield className={`w-4 h-4 flex-shrink-0 ${completedChecks === profileChecks.length ? 'text-emerald-500' : 'theme-text-muted'}`} />
              </div>

              <div className="p-4">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="tabular-nums theme-text-primary leading-none">
                    <span className="text-3xl font-semibold tracking-tight">{completedChecks}</span>
                    <span className="text-base theme-text-muted">/{profileChecks.length}</span>
                  </p>
                  <span className="text-[11px] font-medium uppercase tracking-wider theme-text-muted">{t('extracted.completion_rate')}</span>
                </div>
                <div
                  className="mt-2.5 h-1.5 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden"
                  role="progressbar"
                  aria-valuenow={completedChecks}
                  aria-valuemin={0}
                  aria-valuemax={profileChecks.length}
                >
                  <div
                    className="h-full rounded-full accent-gradient transition-all duration-500"
                    style={{ width: `${profileChecks.length > 0 ? (completedChecks / profileChecks.length) * 100 : 0}%` }}
                  />
                </div>

                <div className="mt-5 relative">
                  <div className="absolute left-[15px] top-3 bottom-3 w-px bg-black/10 dark:bg-white/10" aria-hidden="true" />
                  <div className="space-y-4 relative">
                    {profileChecks.map(({ icon: Icon, ok, label, detail }) => (
                      <div key={label} className="flex items-start gap-3 relative">
                        <span
                          className={`relative z-10 w-8 h-8 rounded-full grid place-items-center shrink-0 transition-colors ${
                            ok ? 'bg-emerald-500 text-white shadow-sm' : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </span>
                        <div className="min-w-0 pt-0.5">
                          <p className="text-xs font-semibold theme-text-primary truncate leading-tight">{label}</p>
                          <p className="text-[11px] theme-text-muted truncate leading-tight mt-0.5">{detail}</p>
                        </div>
                        {!ok && <AlertCircle className="w-3.5 h-3.5 text-amber-500 ml-auto shrink-0 mt-1" />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Details */}
            <div className="lg:col-span-2 space-y-4 min-w-0">
              {/* Personal details */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                className="theme-bg-card theme-border-glass border rounded-xl overflow-hidden"
              >
                <div className="px-4 py-3 border-b theme-border-glass flex items-center gap-2">
                  <User className="w-4 h-4 theme-text-muted flex-shrink-0" />
                  <h3 className="text-sm font-semibold theme-text-primary">{t('extracted.personal_details')}</h3>
                </div>
                <div className="px-4 py-3.5">
                  <dl className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3">
                    <Pair label={t('extracted.full_name')} value={profile.name || '\\u2014'} />
                    <Pair label={t('extracted.fatheraposs_name')} value={profile.fatherName || '\\u2014'} />
                    <Pair label={t('extracted.aadhaar_number')} value={profile.aadhaarNumber || '\\u2014'} mono />
                    <Pair label={t('extracted.age') || 'Age'} value={profile.age ?? '\\u2014'} />
                    <Pair label={t('extracted.gender') || 'Gender'} value={profile.gender || '\\u2014'} />
                    <Pair label={t('extracted.marital_status') || 'Marital Status'} value={profile.maritalStatus || '\\u2014'} />
                  </dl>
                </div>
              </motion.div>

              {/* Contact & location */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.11 }}
                className="theme-bg-card theme-border-glass border rounded-xl overflow-hidden"
              >
                <div className="px-4 py-3 border-b theme-border-glass flex items-center gap-2">
                  <Phone className="w-4 h-4 theme-text-muted flex-shrink-0" />
                  <h3 className="text-sm font-semibold theme-text-primary">{t('extracted.contact')}</h3>
                </div>
                <div className="px-4 py-3.5">
                  <dl className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3">
                    <Pair label={t('extracted.phone')} value={profile.phone || '\\u2014'} mono />
                    <Pair label={t('extracted.email')} value={profile.email || '\\u2014'} />
                    <Pair label={t('extracted.district') || 'District'} value={profile.district || '\\u2014'} />
                    <Pair label={t('extracted.state') || 'State'} value={profile.state || '\\u2014'} />
                    <Pair label={t('extracted.registered_on')} value={formatDate(profile.createdAt)} />
                    <Pair label={t('extracted.last_updated')} value={formatDate(profile.lastUpdate)} />
                  </dl>
                  <div className="mt-3 pt-3 border-t theme-border-glass">
                    <Pair label={t('extracted.complete_address')} value={profile.address || '\\u2014'} />
                  </div>
                </div>
              </motion.div>

              {/* Bank details */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.14 }}
                className="theme-bg-card theme-border-glass border rounded-xl overflow-hidden"
              >
                <div className="px-4 py-3 border-b theme-border-glass flex items-center gap-2">
                  <Landmark className="w-4 h-4 theme-text-muted flex-shrink-0" />
                  <h3 className="text-sm font-semibold theme-text-primary">{t('extracted.bank_account_details')}</h3>
                </div>
                <div className="px-4 py-3.5">
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                    <Pair label={t('extracted.bank_account') || 'Bank Account'} value={profile.bankAccount || '\\u2014'} mono />
                    <Pair label={t('extracted.ifsc_code') || 'IFSC'} value={profile.ifsc || '\\u2014'} mono />
                  </dl>
                </div>
              </motion.div>
            </div>
          </div>
        </>
      )}'''

out = lines[:start] + NEW.split('\n') + lines[end:]
io.open(P, 'w', encoding='utf-8', newline='').write('\n'.join(out))
print('spliced ok: replaced lines', start + 1, 'to', end, '| new total', len(out))
