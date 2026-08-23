"use client";
import React from 'react';
import { motion } from 'framer-motion';
import {
  X, MessageCircle, Shield, Mic, MicOff, Send
} from 'lucide-react';
import type { Grievance, TranslateFn } from '../helpers';
import { getStatusColor, getStatusIcon, getTranslatedStatus } from '../helpers';

/**
 * Selected-grievance inspector: detail grid plus the officer communication
 * thread with text + optional voice input.
 */
export default function GrievanceInspector({
  grievance,
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
  t,
}: {
  grievance: Grievance;
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
  t: TranslateFn;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="theme-bg-card theme-border-glass border rounded-xl overflow-hidden"
    >
      {/* Inspector header bar */}
      <div className="h-12 px-4 flex items-center justify-between gap-3 border-b theme-border-glass">
        <div className="min-w-0 flex items-center gap-2.5">
          <h2 className="text-sm font-semibold theme-text-primary truncate">
            {grievance.category || 'General Grievance'}
          </h2>
          <span className="text-xs theme-text-muted truncate hidden sm:inline">·</span>
          <span className="font-mono text-xs theme-text-muted truncate hidden sm:inline">{grievance.id}</span>
          <span className={`shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${getStatusColor(grievance.status)}`}>
            {React.createElement(getStatusIcon(grievance.status), { className: 'w-3 h-3' })}
            {getTranslatedStatus(t, grievance.status)}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-md theme-text-muted hover:theme-bg-glass hover:theme-text-primary transition-colors shrink-0"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Inspector body */}
      <div className="px-4 py-3.5 space-y-4">
        <dl className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3">
          <div className="min-w-0">
            <dt className="text-[11px] font-medium uppercase tracking-wider theme-text-muted">{t('extracted.category_1')}</dt>
            <dd className="text-[13px] font-medium theme-text-primary mt-0.5 capitalize truncate">{grievance.category || 'General'}</dd>
          </div>
          <div className="min-w-0">
            <dt className="text-[11px] font-medium uppercase tracking-wider theme-text-muted">{t('extracted.assigned_to')}</dt>
            <dd className="text-[13px] font-medium theme-text-primary mt-0.5 truncate">{grievance.assignedTo || '—'}</dd>
          </div>
          <div className="min-w-0">
            <dt className="text-[11px] font-medium uppercase tracking-wider theme-text-muted">{t('extracted.filed')}</dt>
            <dd className="text-[13px] font-medium theme-text-primary mt-0.5 truncate tabular-nums">
              {grievance.createdDate ? new Date(grievance.createdDate).toLocaleString() : 'Recent'}
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="text-[11px] font-medium uppercase tracking-wider theme-text-muted">{t('extracted.last_updated')}</dt>
            <dd className="text-[13px] font-medium theme-text-primary mt-0.5 truncate tabular-nums">
              {grievance.lastUpdated ? new Date(grievance.lastUpdated).toLocaleString() : '—'}
            </dd>
          </div>
          <div className="min-w-0 col-span-2 md:col-span-1">
            <dt className="text-[11px] font-medium uppercase tracking-wider theme-text-muted">{t('extracted.grievance_id')}</dt>
            <dd className="mt-0.5">
              <span className="font-mono text-xs theme-text-primary theme-bg-glass px-2 py-1 rounded inline-block max-w-full truncate">
                {grievance.id}
              </span>
            </dd>
          </div>
          <div className="min-w-0 col-span-2 md:col-span-3">
            <dt className="text-[11px] font-medium uppercase tracking-wider theme-text-muted">{t('extracted.description_1')}</dt>
            <dd className="text-[13px] theme-text-primary mt-0.5 leading-relaxed">{grievance.description}</dd>
          </div>
        </dl>

        {/* Communication thread */}
        <div className="pt-4 border-t theme-border-glass">
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle className="w-3.5 h-3.5 theme-text-muted" />
            <h3 className="text-[11px] font-semibold uppercase tracking-wider theme-text-secondary">
              {t('extracted.communication')}
            </h3>
          </div>

          {/* Chat Messages Container */}
          <div
            ref={chatRef}
            className="h-64 overflow-y-auto px-3 py-3 space-y-2.5 rounded-md border theme-border-glass"
          >
            {(!grievance.communication || grievance.communication.length === 0) ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center theme-text-muted">
                  <Shield className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">{t('extracted.no_messages')}</p>
                  <p className="text-xs mt-1">{t('extracted.start_conversation')}</p>
                </div>
              </div>
            ) : (
              [...(grievance.communication || []), ...pendingMessages].map((comm, index) => {
                const isOfficer = comm.type === 'officer' || comm.user === 'Officer' || comm.user === 'Admin' || comm.user === 'You';
                return (
                  <div key={index} className={`flex ${isOfficer ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[75%] flex flex-col ${isOfficer ? 'items-start' : 'items-end'}`}>
                      <div
                        className={`${isOfficer
                          ? 'mr-auto rounded-lg theme-bg-glass theme-text-primary'
                          : 'ml-auto rounded-lg accent-gradient text-white'} text-[13px] px-3 py-2 leading-relaxed ${comm.pending ? 'opacity-70' : ''}`}
                      >
                        {comm.text}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] theme-text-muted mt-0.5">
                        {isOfficer && <Shield className="w-2.5 h-2.5" />}
                        <span>{isOfficer ? (t('extracted.officer') || 'Officer') : comm.user}</span>
                        <span>·</span>
                        <span>{comm.createdAt ? new Date(comm.createdAt).toLocaleString() : ''}</span>
                        {comm.pending && (
                          <span className="text-amber-500 font-medium">Sending...</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Message Input */}
          <div className="mt-3 pt-3 border-t theme-border-glass flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => onMessageChange(e.target.value)}
                placeholder={t('extracted.write_message')}
                className="w-full h-9 pl-3 pr-10 rounded-md border theme-border-glass theme-bg-input theme-text-primary text-sm placeholder:theme-text-muted focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
                onKeyPress={(e) => e.key === 'Enter' && onSend()}
              />
              {recognition && (
                <button
                  onClick={isRecording ? onStopRecording : onStartRecording}
                  className={`absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-colors ${
                    isRecording
                      ? 'bg-red-500/10 text-red-500 animate-pulse'
                      : 'theme-text-muted hover:theme-bg-glass hover:theme-text-primary'
                  }`}
                  aria-label={isRecording ? 'Stop recording' : 'Start voice recording'}
                  title={isRecording ? 'Stop recording' : 'Start voice recording'}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              )}
            </div>
            <button
              onClick={onSend}
              disabled={!newMessage.trim()}
              className="h-9 px-3 rounded-md accent-gradient text-white text-xs font-semibold inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              {t('extracted.send')}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
