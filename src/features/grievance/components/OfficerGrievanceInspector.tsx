"use client";
import React from 'react';
import {
  X, Eye, MessageCircle, Clock, FileText, BarChart3,
  Shield, Mic, MicOff, CheckCircle, PhoneCall, Mail, AlertOctagon
} from 'lucide-react';
import type { Grievance, TranslateFn } from '../helpers';
import {
  inputCls, ghostBtn, primaryBtn, iconBtn, pillCls,
  Label, SectionTitle, DetailItem, getOfficerPriorityColor
} from '../officerHelpers';

// Module-scope tab definitions: icons resolved via map + React.createElement
const OFFICER_INSPECTOR_TABS = [
  { id: 'overview', labelKey: 'extracted.tab_overview', icon: Eye },
  { id: 'communication', labelKey: 'extracted.tab_communication', icon: MessageCircle },
  { id: 'timeline', labelKey: 'extracted.tab_timeline', icon: Clock },
  { id: 'documents', labelKey: 'extracted.tab_documents', icon: FileText },
  { id: 'analytics', labelKey: 'extracted.tab_analytics', icon: BarChart3 }
];

/** Selected-case inspector: tabbed overview / communication / timeline / documents / analytics with action bar. */
export default function OfficerGrievanceInspector({
  grievance,
  scrollRef,
  activeTab,
  onTabChange,
  onClose,
  chatRef,
  pendingMessages,
  newMessage,
  onMessageChange,
  onSend,
  recognition,
  isRecording,
  onStartRecording,
  onStopRecording,
  onResolve,
  statusUpdating,
  t,
}: {
  grievance: Grievance;
  scrollRef: React.RefObject<HTMLElement | null>;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onClose: () => void;
  chatRef: React.RefObject<HTMLDivElement | null>;
  pendingMessages: any[];
  newMessage: string;
  onMessageChange: (v: string) => void;
  onSend: () => void;
  recognition: SpeechRecognition | null;
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onResolve: () => void;
  statusUpdating: string | null;
  t: TranslateFn;
}) {
  return (
    <section ref={scrollRef} className="theme-bg-card theme-border-glass border rounded-lg overflow-hidden scroll-mt-20">
      <div className="h-12 px-4 flex items-center justify-between gap-3 border-b theme-border-glass">
        <div className="flex items-center gap-2 min-w-0">
          <h2 className="text-sm font-semibold tracking-tight theme-text-primary truncate">{grievance.id}</h2>
          <span className={`${pillCls} ${getOfficerPriorityColor(grievance.priority)} shrink-0`}>
            {grievance.priority ? grievance.priority.toUpperCase() : '-'}
          </span>
        </div>
        <button onClick={onClose} className={`${iconBtn} shrink-0`} aria-label="Close">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="px-4 border-b theme-border-glass flex overflow-x-auto no-scrollbar">
        {OFFICER_INSPECTOR_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-2.5 -mb-px text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-[var(--accent-primary)] theme-text-primary'
                : 'border-transparent theme-text-muted hover:theme-text-primary'
            }`}
          >
            {React.createElement(tab.icon, { className: 'w-3.5 h-3.5' })}
            {t((tab as any).labelKey)}
          </button>
        ))}
      </div>

      <div className="px-4 py-3.5">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <dl className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-3">
              <DetailItem label={t('extracted.beneficiary')} value={grievance.beneficiaryName || '\u2014'} />
              <DetailItem label="ID" value={grievance.beneficiaryId || '\u2014'} />
              <DetailItem label={t('extracted.phone_number') || 'Phone'} value={grievance.phone || '-'} />
              <DetailItem label={t('extracted.email') || 'Email'} value={grievance.email || '-'} />
              <DetailItem label={t('extracted.district')} value={`${grievance.district || '-'}, ${grievance.state || '-'}`} />
              <DetailItem label={t('extracted.act')} value={grievance.actType || '-'} />
            </dl>

            <div className="pt-4 border-t theme-border-glass">
              <SectionTitle>{t('extracted.case_details')}</SectionTitle>
              <dl className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-3">
                <DetailItem label={t('extracted.category')} value={grievance.category || '-'} />
                <DetailItem label={t('extracted.sub_category')} value={grievance.subCategory || '-'} />
                <DetailItem label={t('extracted.priority')} value={grievance.priority ? grievance.priority.toUpperCase() : '-'} />
                <DetailItem label={t('extracted.status')} value={grievance.status || '-'} />
                <DetailItem label={t('extracted.assigned_to')} value={grievance.assignedTo || '-'} />
                <DetailItem label={t('extracted.application_id')} value={grievance.applicationId || '\u2014'} />
              </dl>
            </div>

            <div className="pt-4 border-t theme-border-glass">
              <SectionTitle>{t('extracted.timestamps')}</SectionTitle>
              <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3">
                <DetailItem label={t('extracted.created')} value={grievance.createdDate ? new Date(grievance.createdDate).toLocaleString() : '\u2014'} />
                <DetailItem label={t('extracted.last_updated')} value={grievance.lastUpdated ? new Date(grievance.lastUpdated).toLocaleString() : '\u2014'} />
                <DetailItem label={t('extracted.expected_resolution')} value={grievance.expectedResolution ? new Date(grievance.expectedResolution).toLocaleString() : '\u2014'} />
                <DetailItem label={t('extracted.resolution_date')} value={grievance.resolutionDate ? new Date(grievance.resolutionDate).toLocaleString() : '\u2014'} />
              </dl>
            </div>

            <div className="pt-4 border-t theme-border-glass">
              <SectionTitle>{t('extracted.attachments_communication')}</SectionTitle>
              <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3">
                <DetailItem label={t('extracted.attachments_label')} value={grievance.attachments ?? 0} />
                <DetailItem label={t('extracted.messages_label')} value={grievance.communication?.length ?? 0} />
              </dl>
              {(grievance.communication?.length ?? 0) > 0 && (
                <div className="mt-3 space-y-1.5">
                  {(grievance.communication ?? []).slice(0, 3).map((c, i) => (
                    <div key={i} className="text-xs theme-text-muted">
                      <span className="font-medium theme-text-secondary">{c.user || (t('extracted.user') || 'User')}:</span> {String(c.text || c.message || c.body || '\u2014')}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'communication' && (
          <div className="space-y-3">
            <div
              ref={chatRef}
              className="max-h-80 overflow-y-auto p-3 space-y-3 border theme-border-glass rounded-md theme-bg-glass scroll-smooth"
            >
              {(grievance.communication ?? []).length === 0 && pendingMessages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-8 h-8 theme-text-muted mx-auto mb-2 opacity-50" />
                  <p className="text-sm theme-text-secondary">{t('extracted.no_messages') || 'No messages yet'}</p>
                  <p className="text-xs theme-text-muted mt-1">{t('extracted.start_conversation') || 'Start a conversation with the beneficiary'}</p>
                </div>
              ) : (
                <>
                  {(grievance.communication ?? []).map((c, i) => {
                    const isOfficerMsg = c.type !== 'user';
                    return (
                      <div key={i} className={`max-w-[85%] sm:max-w-md rounded-lg border p-3 ${isOfficerMsg ? 'ml-auto bg-blue-500/10 border-blue-500/20' : 'mr-auto theme-bg-card theme-border-glass'}`}>
                        <div className="flex items-center justify-between gap-3 mb-1">
                          <span className="text-[11px] font-medium uppercase tracking-wider theme-text-muted">
                            {isOfficerMsg ? (t('extracted.officer') || 'Officer') : (c.user || (t('extracted.user') || 'User'))}
                          </span>
                          <span className="text-[10px] theme-text-muted">
                            {c.createdAt ? (new Date(c.createdAt?.toDate ? c.createdAt.toDate() : c.createdAt).toLocaleString()) : ''}
                          </span>
                        </div>
                        <p className="text-[13px] theme-text-primary break-words">{String(c.text || c.message || c.body || '')}</p>
                      </div>
                    );
                  })}
                  {pendingMessages.map((c, i) => (
                    <div key={`pending-${i}`} className="max-w-[85%] sm:max-w-md ml-auto rounded-lg border p-3 opacity-60 bg-blue-500/10 border-blue-500/20">
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <span className="text-[11px] font-medium uppercase tracking-wider theme-text-muted">{t('extracted.officer') || 'Officer'}</span>
                        <span className="text-[10px] theme-text-muted">{t('extracted.sending') || 'Sending...'}</span>
                      </div>
                      <p className="text-[13px] theme-text-primary break-words">{c.text}</p>
                    </div>
                  ))}
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                value={newMessage}
                onChange={(e) => onMessageChange(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && onSend()}
                placeholder={t('extracted.write_message') || 'Write a message...'}
                className={`${inputCls} flex-1 min-w-[10rem]`}
              />
              {recognition && (
                <button
                  onClick={isRecording ? onStopRecording : onStartRecording}
                  className={`max-sm:h-11 max-sm:w-11 h-9 w-9 shrink-0 inline-flex items-center justify-center rounded-md transition-colors ${
                    isRecording ? 'bg-red-500 text-white animate-pulse' : 'border theme-border-glass theme-text-secondary hover:theme-bg-glass'
                  }`}
                  aria-label={isRecording ? 'Stop recording' : 'Start voice recording'}
                  title={isRecording ? 'Stop recording' : 'Start voice recording'}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              )}
              <button
                onClick={onSend}
                disabled={!newMessage.trim()}
                className="max-sm:h-11 max-sm:w-11 h-9 w-9 shrink-0 inline-flex items-center justify-center rounded-md accent-gradient text-white disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                aria-label={t('extracted.send_message') || 'Send message'}
              >
                <MessageCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="space-y-4">
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3">
              <DetailItem label={t('extracted.created')} value={grievance.createdDate ? new Date(grievance.createdDate).toLocaleString() : '\u2014'} />
              <DetailItem label={t('extracted.last_updated')} value={grievance.lastUpdated ? new Date(grievance.lastUpdated).toLocaleString() : '\u2014'} />
            </dl>
            <div className="pt-4 border-t theme-border-glass">
              <SectionTitle>{t('extracted.activity')}</SectionTitle>
              {(grievance.communication ?? []).length === 0 ? (
                <p className="text-sm theme-text-muted">{t('extracted.no_activity')}</p>
              ) : (
                <ul className="list-disc pl-5 space-y-2">
                  {(grievance.communication ?? []).map((c, i) => (
                    <li key={i} className="text-sm theme-text-muted flex items-start gap-2">
                      {(c.type === 'officer' || c.user === 'Officer') && <Shield className="w-3 h-3 text-blue-500 mt-0.5 shrink-0" />}
                      <span>
                        {(c.type === 'officer' || c.user === 'Officer') ? (t('extracted.officer') || 'Officer') : (c.user || (t('extracted.user') || 'User'))} \u2014 {String(c.text || c.message || c.body || '')}
                        <span className="text-xs block">{c.createdAt ? (new Date(c.createdAt?.toDate ? c.createdAt.toDate() : c.createdAt).toLocaleString()) : ''}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-4">
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3">
              <DetailItem label={t('extracted.attachments_label')} value={grievance.attachments ?? 0} />
            </dl>
            <p className="text-xs theme-text-muted">{t('extracted.upload_download_note')}</p>
            <div className="pt-4 border-t theme-border-glass">
              <Label>{t('extracted.add_document_not_implemented')}</Label>
              <input type="file" disabled className="block text-xs theme-text-muted" />
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px theme-bg-glass theme-border-glass border rounded-lg overflow-hidden">
            <div className="theme-bg-card p-3.5 text-center">
              <p className="text-xl font-semibold tracking-tight theme-text-primary tabular-nums">{grievance.communication?.length ?? 0}</p>
              <p className="text-[11px] font-medium uppercase tracking-wider theme-text-muted mt-1">{t('extracted.messages')}</p>
            </div>
            <div className="theme-bg-card p-3.5 text-center">
              <p className="text-xl font-semibold tracking-tight theme-text-primary tabular-nums">{grievance.attachments ?? 0}</p>
              <p className="text-[11px] font-medium uppercase tracking-wider theme-text-muted mt-1">{t('extracted.attachments_label')}</p>
            </div>
            <div className="theme-bg-card p-3.5 text-center">
              <p className="text-xl font-semibold tracking-tight theme-text-primary tabular-nums">{(() => {
                const created = grievance.createdDate ? new Date(grievance.createdDate).getTime() : Date.now();
                const diff = Date.now() - created;
                return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
              })()}</p>
              <p className="text-[11px] font-medium uppercase tracking-wider theme-text-muted mt-1">{t('extracted.days_open')}</p>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 py-3 border-t theme-border-glass flex flex-wrap items-center gap-2">
        <button
          onClick={onResolve}
          disabled={statusUpdating === grievance.id || grievance.status === 'closed'}
          className={`${ghostBtn} ${statusUpdating === grievance.id ? 'opacity-60 cursor-wait' : ''}`}
        >
          <CheckCircle className="w-3.5 h-3.5" />
          {grievance.status === 'closed' ? (t('extracted.resolved') || 'Resolved') : (t('extracted.resolve_case') || 'Resolve')}
        </button>
        {grievance.phone ? (
          <a href={`tel:${grievance.phone.trim()}`} target="_blank" rel="noreferrer" className={ghostBtn} aria-label={t('extracted.call_now')}>
            <PhoneCall className="w-3.5 h-3.5" />
            {t('extracted.call_now')}
          </a>
        ) : (
          <button disabled className={ghostBtn} aria-disabled>
            <PhoneCall className="w-3.5 h-3.5" />
            {t('extracted.call_now')}
          </button>
        )}
        {grievance.email ? (
          <a href={`mailto:${grievance.email.trim()}`} target="_blank" rel="noreferrer" className={ghostBtn} aria-label={t('extracted.send_email')}>
            <Mail className="w-3.5 h-3.5" />
            {t('extracted.send_email')}
          </a>
        ) : (
          <button disabled className={ghostBtn} aria-disabled>
            <Mail className="w-3.5 h-3.5" />
            {t('extracted.send_email')}
          </button>
        )}
        <button className={`${primaryBtn} ml-auto`}>
          <AlertOctagon className="w-3.5 h-3.5" />
          {t('extracted.escalate_case')}
        </button>
      </div>
    </section>
  );
}
