# One-shot splice: rebuild user applications render as tracker-style UI
import io

P = 'src/features/applications/UserApplicationsPage.tsx'
raw = io.open(P, encoding='utf-8', newline='').read()
lines = raw.split('\n')

start = next(i for i, l in enumerate(lines) if '{/* Header Section */}' in l)
toast = next(i for i, l in enumerate(lines) if '{/* Toast container */}' in l)

NEW = '''        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-lg font-semibold tracking-tight theme-text-primary truncate">
              {t('extracted.my_applications')} <span className="text-accent-gradient">{t('extracted.dashboard')}</span>
            </h1>
            <p className="text-xs theme-text-muted mt-0.5 truncate">
              {stats.total > 0
                ? t('extracted.you_have_applications', { count: stats.total })
                : t('extracted.manage_your_relief_applications')}
            </p>
          </div>
          <button
            onClick={() => {
              setEditingApplication(null);
              setShowNewApplicationForm(true);
            }}
            disabled={!userBeneficiary}
            className="h-9 px-3.5 accent-gradient text-white rounded-md inline-flex items-center gap-1.5 text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            {t('extracted.new_application')}
          </button>
        </div>

        {/* Beneficiary prerequisite */}
        {!userBeneficiary && (
          <div className="theme-bg-card border border-amber-500/40 rounded-xl p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 grid place-items-center shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium theme-text-primary">{t('extracted.create_beneficiary_first')}</p>
              <p className="text-xs theme-text-muted mt-0.5">{t('extracted.start_by_creating_application')}</p>
            </div>
          </div>
        )}

        {/* New / Edit Application Drawer */}
        <AnimatePresence>
          {showNewApplicationForm && (
            <NewApplicationDrawer
              onCancel={() => {
                setShowNewApplicationForm(false);
                setEditingApplication(null);
              }}
              initialData={editingApplication}
              userBeneficiary={userBeneficiary}
              onSaved={() => {
                setShowNewApplicationForm(false);
                setEditingApplication(null);
                showToast('success', t('applications.savedSuccess'));
              }}
            />
          )}
        </AnimatePresence>

        {/* Delete Confirmation */}
        <ConfirmDeleteModal
          open={!!deleteTargetId}
          message={t('applications.confirmDeleteMessage')}
          onCancel={() => setDeleteTargetId(null)}
          onConfirm={() => {
            if (deleteTargetId) deleteApplication(deleteTargetId);
            setDeleteTargetId(null);
          }}
        />

        {/* Status filter pills */}
        {stats.total > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { key: 'all', label: t('applications.allStatuses'), count: stats.total },
              { key: 'pending', label: t('applications.pending'), count: stats.pending },
              { key: 'in-review', label: t('applications.inReview'), count: stats.inReview },
              { key: 'approved', label: t('applications.approved'), count: stats.approved },
              { key: 'documents-required', label: t('applications.documentsRequired'), count: stats.documentsRequired },
              { key: 'rejected', label: t('applications.rejected'), count: stats.rejected },
            ].filter(s => s.key === 'all' || s.count > 0).map(s => (
              <button
                key={s.key}
                onClick={() => setStatusFilter(s.key)}
                className={`h-8 px-3 rounded-full inline-flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                  statusFilter === s.key
                    ? 'accent-gradient text-white shadow-sm'
                    : 'border theme-border-glass theme-bg-glass theme-text-muted hover:theme-text-primary'
                }`}
              >
                {s.label}
                <span className={`tabular-nums ${statusFilter === s.key ? 'opacity-80' : 'opacity-60'}`}>{s.count}</span>
              </button>
            ))}
          </div>
        )}

        {/* Tracker list */}
        {filteredApplications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="theme-bg-card theme-border-glass border rounded-xl px-6 py-16 text-center"
          >
            <div className="mx-auto w-16 h-16 rounded-2xl accent-gradient text-white grid place-items-center mb-4 shadow-lg">
              <FileText className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-semibold tracking-tight theme-text-primary">
              {applications.length === 0 ? t('extracted.no_applications_yet') : t('extracted.no_matching_applications')}
            </h2>
            <p className="text-sm theme-text-muted mt-1 max-w-md mx-auto">
              {applications.length === 0
                ? t('extracted.create_your_first_application')
                : t('extracted.try_adjusting_search_terms')}
            </p>
            {applications.length === 0 && userBeneficiary && (
              <button
                onClick={() => {
                  setEditingApplication(null);
                  setShowNewApplicationForm(true);
                }}
                className="mt-5 h-10 px-4 rounded-md accent-gradient text-white text-sm font-semibold hover:opacity-90 inline-flex items-center gap-2 transition-opacity"
              >
                <Plus className="w-4 h-4" />
                {t('extracted.new_application')}
              </button>
            )}
          </motion.div>
        ) : (
          <div className="space-y-2.5">
            {filteredApplications.map((application) => {
              const expanded = expandedId === application.id;
              const rejected = application.status === 'rejected';
              const currentStage = stageIndex(application.status);

              return (
                <motion.div
                  key={application.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`theme-bg-card border rounded-xl overflow-hidden transition-colors ${
                    expanded ? 'border-[var(--accent-primary)]' : 'theme-border-glass hover:theme-bg-hover'
                  }`}
                >
                  {/* Card header — always visible */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setExpandedId(expanded ? null : application.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setExpandedId(expanded ? null : application.id);
                      }
                    }}
                    className={`w-full text-left p-4 cursor-pointer focus:outline-none ${expanded ? 'theme-bg-glass' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg accent-gradient text-white grid place-items-center shrink-0 shadow-sm">
                        <FileText className="w-4.5 h-4.5 w-[18px] h-[18px]" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <h4 className="text-sm font-semibold theme-text-primary truncate leading-tight">
                            {application.applicantName || '\u2014'}
                          </h4>
                          <span className={`hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide shrink-0 ${getStatusColor(application.status)}`}>
                            {createElement(getStatusIcon(application.status), { className: 'w-3 h-3' })}
                            {getTranslatedStatus(application.status)}
                          </span>
                        </div>
                        <p className="text-xs theme-text-muted truncate mt-0.5">
                          <span className="font-mono">{application.id}</span>
                          {' \\u00b7 '}
                          {formatDate(application.applicationDate)}
                          {application.actType ? ` \\u00b7 ${application.actType}` : ''}
                        </p>
                      </div>

                      <div className="hidden md:block text-right shrink-0">
                        <p className="text-sm font-semibold tabular-nums theme-text-primary leading-tight">
                          {formatCurrency(application.amount)}
                        </p>
                        <p className="text-[11px] theme-text-muted mt-0.5">{application.district}</p>
                      </div>

                      <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            setEditingApplication(application);
                            setShowNewApplicationForm(true);
                          }}
                          className="p-1.5 rounded-md theme-text-muted hover:theme-bg-glass hover:text-blue-500 transition-colors"
                          title={t('extracted.edit_application')}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => requestDeleteApplication(application.id)}
                          className="p-1.5 rounded-md theme-text-muted hover:bg-red-500/10 hover:text-red-500 transition-colors"
                          title={t('extracted.delete_application')}
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                        <ChevronDown
                          className={`w-4 h-4 theme-text-muted transition-transform duration-200 ml-1 ${expanded ? 'rotate-180' : ''}`}
                        />
                      </div>
                    </div>

                    {/* Compact journey strip */}
                    <div className="flex items-center mt-3" aria-hidden="true">
                      {[0, 1, 2, 3].map((i) => {
                        const reached = !rejected && i <= Math.min(currentStage, 3);
                        const isCurrent = !rejected && i === Math.min(currentStage, 3);
                        return (
                          <React.Fragment key={i}>
                            {i > 0 && (
                              <div
                                className={`flex-1 h-px mx-1 ${reached ? 'bg-emerald-500/60' : 'bg-black/10 dark:bg-white/10'}`}
                              />
                            )}
                            <span
                              className={`block w-1.5 h-1.5 rounded-full transition-colors ${
                                reached ? 'bg-emerald-500' : 'bg-black/15 dark:bg-white/20'
                              } ${isCurrent ? 'ring-4 ring-emerald-500/20' : ''}`}
                            />
                          </React.Fragment>
                        );
                      })}
                      <span className={`ml-2.5 sm:hidden inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${getStatusColor(application.status)}`}>
                        {createElement(getStatusIcon(application.status), { className: 'w-3 h-3' })}
                        {getTranslatedStatus(application.status)}
                      </span>
                    </div>
                  </div>

                  {/* Expanded details */}
                  <AnimatePresence>
                    {expanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-1 border-t theme-border-glass space-y-4">
                          {/* Full journey */}
                          <div className="flex items-start pt-4 pb-1" aria-label={t('extracted.status')}>
                            {[
                              t('extracted.submitted'),
                              t('applications.inReview'),
                              t('extracted.approved'),
                              t('extracted.disbursed'),
                            ].map((label, i) => {
                              const reached = !rejected && i <= currentStage;
                              const isCurrent = !rejected && i === currentStage;
                              return (
                                <React.Fragment key={label}>
                                  {i > 0 && (
                                    <div
                                      className={`flex-1 h-px mt-[7px] mx-1.5 ${reached ? 'bg-emerald-500/60' : 'bg-black/10 dark:bg-white/10'}`}
                                    />
                                  )}
                                  <div className="flex flex-col items-center gap-1 shrink-0 min-w-0">
                                    <span
                                      className={`block w-2 h-2 rounded-full transition-colors ${reached ? 'bg-emerald-500' : 'bg-black/15 dark:bg-white/20'} ${isCurrent ? 'ring-4 ring-emerald-500/20' : ''}`}
                                    />
                                    <span
                                      className={`text-[9px] uppercase tracking-wide whitespace-nowrap ${isCurrent ? 'font-semibold text-emerald-600 dark:text-emerald-400' : 'theme-text-muted'}`}
                                    >
                                      {label}
                                    </span>
                                  </div>
                                </React.Fragment>
                              );
                            })}
                          </div>

                          {/* Applicant snapshot */}
                          <dl className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-3">
                            <Field label={t('extracted.applicant')} value={application.applicantName || '\u2014'} />
                            <Field label={t('extracted.aadhaar_number')} value={application.aadhaar || '\u2014'} mono />
                            <Field label={t('extracted.phone_number')} value={application.phone || '\u2014'} mono />
                            <Field label={t('extracted.location')} value={`${application.district}, ${application.state}`} />
                            <Field label={t('extracted.act_type')} value={application.actType || '\u2014'} />
                            <Field label={t('extracted.amount')} value={formatCurrency(application.amount)} />
                            <Field label={t('extracted.priority')} value={getTranslatedPriority(application.priority)} />
                            <Field label={t('extracted.beneficiary_id')} value={application.beneficiaryId || '\u2014'} mono />
                          </dl>

                          {/* PoA Offence Information */}
                          {application.actType === 'PoA Act' && (application.offenceCategory || application.offenceType) && (
                            <div className="pt-3 border-t theme-border-glass">
                              <div className="text-sm font-medium theme-text-primary mb-2.5">{t('applications.poa_act_offence_details')}</div>
                              <div className="space-y-1.5">
                                {application.offenceCategory && (
                                  <div className="flex justify-between gap-3">
                                    <span className="text-sm theme-text-muted">{t('applications.offence_category')}</span>
                                    <span className="text-sm font-medium theme-text-primary text-right">{application.offenceCategory}</span>
                                  </div>
                                )}
                                {application.offenceType && (
                                  <div className="flex justify-between gap-3">
                                    <span className="text-sm theme-text-muted">{t('applications.specific_offence')}</span>
                                    <span className="text-sm font-medium theme-text-primary text-right">{application.offenceType}</span>
                                  </div>
                                )}
                                {application.offenceCategory && application.offenceType && (
                                  <div className="flex justify-between gap-3">
                                    <span className="text-sm theme-text-muted">{t('applications.expected_compensation')}</span>
                                    <span className="text-sm font-medium text-green-600 dark:text-green-400 text-right">
                                      {(() => {
                                        const category = POA_OFFENCES[application.offenceCategory as keyof typeof POA_OFFENCES];
                                        const compensation = category && application.offenceType in category
                                          ? category[application.offenceType as keyof typeof category] as string | number
                                          : null;
                                        if (compensation && typeof compensation === "string" && compensation.includes("-")) {
                                          return `\\u20b9${compensation.replace("-", " - \\u20b9")}`;
                                        }
                                        return compensation ? `\\u20b9${(compensation as number).toLocaleString("en-IN")}` : "\\u20b90";
                                      })()}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Case Details */}
                          {(application.incidentDate || application.firReport || application.medicalReport || application.policeStation || application.caseNumber) && (
                            <div className="pt-3 border-t theme-border-glass">
                              <div className="text-sm font-medium theme-text-primary mb-2.5">{t('applications.caseDetails')}</div>
                              <dl className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3">
                                {application.incidentDate && (
                                  <Field label={t('extracted.incident_date')} value={new Date(application.incidentDate).toLocaleDateString()} />
                                )}
                                {application.firReport && (
                                  <Field label={t('applications.firReport')} value={application.firReport} />
                                )}
                                {application.medicalReport && (
                                  <Field label={t('applications.medicalReport')} value={application.medicalReport} />
                                )}
                                {application.policeStation && (
                                  <Field label={t('applications.policeStation')} value={application.policeStation} />
                                )}
                                {application.caseNumber && (
                                  <Field label={t('applications.caseNumber')} value={application.caseNumber} mono />
                                )}
                              </dl>
                            </div>
                          )}

                          <p className="text-xs theme-text-muted pt-1">
                            {t('extracted.submitted')}: {formatDate(application.applicationDate)}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}'''

out = lines[:start] + NEW.split('\n') + lines[toast:]
io.open(P, 'w', encoding='utf-8', newline='').write('\n'.join(out))
print('spliced ok: replaced', start + 1, '..', toast, '| new total', len(out))
