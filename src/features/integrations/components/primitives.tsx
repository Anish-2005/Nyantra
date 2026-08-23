"use client";
/**
 * Tiny form primitives shared by the integrations page, filter sidebar and drawer.
 */
import React from 'react';
import { INPUT_CLS } from '../helpers';

/** Standard text/select/textarea input classes. */
export const inputCls = INPUT_CLS;

/** Uppercased micro label above a form field. */
export const Label = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-[11px] font-medium uppercase tracking-wider theme-text-muted mb-1">{children}</label>
);

/** Uppercased micro heading for a drawer section. */
export const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-[11px] font-semibold uppercase tracking-wider theme-text-secondary mb-2.5">{children}</h3>
);

/** Definition-list cell with truncated value. */
export const DefPair = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="min-w-0">
        <dt className="text-[11px] uppercase tracking-wider theme-text-muted">{label}</dt>
        <dd className="text-[13px] font-medium theme-text-primary mt-0.5 truncate">{children}</dd>
    </div>
);

/** Hairline stat tile used inside metric grids. */
export const StatCell = ({ label, value, dot, hint }: { label: string; value: React.ReactNode; dot?: string; hint?: string }) => (
    <div className="theme-bg-card p-3.5 min-w-0">
        <div className="flex items-center gap-1.5">
            {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />}
            <span className="text-[11px] uppercase tracking-wider theme-text-muted truncate">{label}</span>
        </div>
        <p className="text-xl font-semibold tabular-nums theme-text-primary mt-1 truncate">{value}</p>
        {hint && <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-0.5 tabular-nums">{hint}</p>}
    </div>
);
