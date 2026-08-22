"use client";
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, Plus, Check, Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, orderBy, onSnapshot, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { useTheme } from '@/context/ThemeContext';
import { useLocale } from '@/context/LocaleContext';
import { useAuth } from '@/context/AuthContext';
import { POA_OFFENCES } from "@/components/dashboard/POAOffencesTable";

interface NewApplicationDrawerProps {
    onCancel: () => void;
    onCreated?: (newId: string) => void;
    initialData?: any | null;
    userBeneficiary?: any | null;
    onSaved?: () => void;
}

const inputCls = "w-full h-9 px-2.5 rounded-md border theme-border-glass theme-bg-input theme-text-primary text-sm placeholder:theme-text-muted focus:outline-none focus:border-[var(--accent-primary)] transition-colors";

const Label = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-[11px] font-medium uppercase tracking-wider theme-text-muted mb-1">{children}</label>
);

const NewApplicationDrawer = ({ onCancel, onCreated, initialData, userBeneficiary, onSaved }: NewApplicationDrawerProps) => {
    const { t } = useLocale();
    const { user } = useAuth();
    const isEditing = !!initialData?.id;
    const lockedBeneficiaryId = userBeneficiary?.id || (isEditing ? initialData.beneficiaryId : '');
    const [formData, setFormData] = useState({
        applicantName: '',
        aadhaar: '',
        phone: '',
        district: '',
        state: '',
        actType: '',
        beneficiaryId: '',
        incidentDate: '',
        firReport: '',
        medicalReport: '',
        policeStation: '',
        caseNumber: '',
        amount: '',
        priority: 'medium',
        assignedOfficer: '',
        offenceCategory: '',
        offenceType: '',
        fatherName: '',
        email: '',
        address: '',
        category: '',
        age: '',
        gender: '',
        maritalStatus: '',
        bankAccount: '',
        ifsc: ''
    });
    const [beneficiaryExists, setBeneficiaryExists] = useState<boolean | null>(null);
    const [beneficiaryAutoFilled, setBeneficiaryAutoFilled] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Lock body scroll + close on Escape while drawer is open
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onCancel();
        };
        window.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [onCancel]);

    // Fetch beneficiaries for dropdown
    useEffect(() => {
        const unsubscribe = onSnapshot(
            query(collection(db, 'beneficiaries'), orderBy('name')),
            (snapshot) => {
                setBeneficiaries(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
            },
            (error) => console.error('Error fetching beneficiaries:', error)
        );
        return () => unsubscribe();
    }, []);

    // Prefill when editing an existing application or bound to the user's beneficiary
    useEffect(() => {
        const toDateStr = (val: any): string => {
            if (!val) return '';
            if (typeof val === 'string') {
                const d = new Date(val);
                return isNaN(d.getTime()) ? val.slice(0, 10) : d.toISOString().split('T')[0];
            }
            if (val?.toDate && typeof val.toDate === 'function') {
                try { return val.toDate().toISOString().split('T')[0]; } catch { return ''; }
            }
            return '';
        };
        if (initialData) {
            setFormData(prev => ({
                ...prev,
                applicantName: initialData.applicantName || '',
                aadhaar: initialData.aadhaar || '',
                phone: initialData.phone || '',
                district: initialData.district || '',
                state: initialData.state || '',
                actType: initialData.actType || '',
                beneficiaryId: initialData.beneficiaryId || '',
                incidentDate: toDateStr(initialData.incidentDate),
                firReport: initialData.firReport || '',
                medicalReport: initialData.medicalReport || '',
                policeStation: initialData.policeStation || '',
                caseNumber: initialData.caseNumber || '',
                amount: String(initialData.amount || ''),
                priority: initialData.priority || 'medium',
                assignedOfficer: initialData.assignedOfficer || '',
                offenceCategory: initialData.offenceCategory || '',
                offenceType: initialData.offenceType || '',
                fatherName: initialData.fatherName || '',
                email: initialData.email || '',
                address: initialData.address || '',
                category: initialData.category || '',
                age: initialData.age ? String(initialData.age) : '',
                gender: initialData.gender || '',
                maritalStatus: initialData.maritalStatus || '',
                bankAccount: initialData.bankAccount || '',
                ifsc: initialData.ifsc || ''
            }));
            if (initialData.beneficiaryId) setBeneficiaryExists(true);
        } else if (userBeneficiary) {
            setFormData(prev => ({
                ...prev,
                applicantName: userBeneficiary.name || userBeneficiary.fullName || '',
                aadhaar: userBeneficiary.aadhaarNumber || userBeneficiary.aadhaar || '',
                phone: userBeneficiary.phone || '',
                district: userBeneficiary.district || '',
                state: userBeneficiary.state || '',
                actType: userBeneficiary.actType || '',
                beneficiaryId: userBeneficiary.id || '',
                incidentDate: toDateStr(userBeneficiary.incidentDate),
                amount: userBeneficiary.reliefAmount ? String(userBeneficiary.reliefAmount) : prev.amount,
                fatherName: userBeneficiary.fatherName || '',
                email: userBeneficiary.email || '',
                address: userBeneficiary.address || '',
                category: userBeneficiary.category || '',
                age: userBeneficiary.age ? String(userBeneficiary.age) : '',
                gender: userBeneficiary.gender || '',
                maritalStatus: userBeneficiary.maritalStatus || '',
                bankAccount: userBeneficiary.bankAccount || '',
                ifsc: userBeneficiary.ifsc || ''
            }));
            setBeneficiaryExists(true);
        }
    }, [initialData, userBeneficiary]);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => {
            const next = { ...prev, [field]: value };
            if (field === 'offenceType' && value && prev.offenceCategory) {
                const category = POA_OFFENCES[prev.offenceCategory as keyof typeof POA_OFFENCES];
                if (category && value in category) {
                    const compensation = category[value as keyof typeof category] as string | number;
                    next.amount = compensation.toString();
                }
            }
            if (field === 'actType' && value !== 'PoA Act') {
                next.offenceCategory = '';
                next.offenceType = '';
            }
            return next;
        });
        if (field === 'beneficiaryId') setBeneficiaryExists(null);
    };

    const applyBeneficiaryData = (data: any) => {
        const normalizeDate = (val: any): string | undefined => {
            if (!val) return undefined;
            if (val?.toDate && typeof val.toDate === 'function') {
                try { return val.toDate().toISOString().split('T')[0]; } catch { }
            }
            if (typeof val === 'string') {
                const d = new Date(val);
                if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
                return val.slice(0, 10);
            }
            if (typeof val === 'number') {
                try { return new Date(val).toISOString().split('T')[0]; } catch { }
            }
            return undefined;
        };

        setFormData(prev => ({
            ...prev,
            applicantName: data.name ?? data.fullName ?? data.applicantName ?? prev.applicantName ?? '',
            aadhaar: data.aadhaar ?? data.aadhar ?? data.aadharNumber ?? data.aadhaarNumber ?? prev.aadhaar ?? '',
            phone: data.phone ?? data.mobile ?? data.phoneNumber ?? prev.phone ?? '',
            district: data.district ?? (data.address && data.address.district) ?? prev.district ?? '',
            state: data.state ?? (data.address && data.address.state) ?? prev.state ?? '',
            actType: data.actType ?? data.act ?? data.caseType ?? prev.actType ?? '',
            incidentDate: normalizeDate(data.incidentDate) ?? normalizeDate(data.incident_date) ?? normalizeDate(data.dateOfIncident) ?? prev.incidentDate ?? '',
            amount: String(data.amount ?? data.reliefAmount ?? data.requestedAmount ?? data.request_amount ?? prev.amount ?? ''),
            priority: data.priority ?? prev.priority ?? 'medium',
        }));
        setBeneficiaryAutoFilled(true);
        window.setTimeout(() => setBeneficiaryAutoFilled(false), 3500);
    };

    const handleBeneficiarySelect = async (selectedId: string) => {
        handleInputChange('beneficiaryId', selectedId);
        if (!selectedId) return;
        try {
            const snap = await getDoc(doc(db, 'beneficiaries', selectedId));
            if (snap.exists()) {
                applyBeneficiaryData(snap.data() as any);
                setBeneficiaryExists(true);
            } else {
                setBeneficiaryExists(false);
            }
        } catch (err) {
            console.error('Error checking beneficiary', err);
            setBeneficiaryExists(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.beneficiaryId) {
            alert(t('applications.beneficiaryIdRequired'));
            return;
        }
        setIsSubmitting(true);
        try {
            const beneficiarySnap = await getDoc(doc(db, 'beneficiaries', formData.beneficiaryId));
            if (!beneficiarySnap.exists()) {
                alert(t('applications.beneficiaryNotFound'));
                setIsSubmitting(false);
                return;
            }

            if (isEditing) {
                const ref = doc(db, 'applications', initialData.id);
                await updateDoc(ref, {
                    applicantName: formData.applicantName,
                    aadhaar: formData.aadhaar,
                    phone: formData.phone,
                    district: formData.district,
                    state: formData.state,
                    actType: formData.actType,
                    beneficiaryId: formData.beneficiaryId,
                    incidentDate: formData.incidentDate,
                    firReport: formData.firReport || null,
                    medicalReport: formData.medicalReport || null,
                    policeStation: formData.policeStation || null,
                    caseNumber: formData.caseNumber || null,
                    fatherName: formData.fatherName || null,
                    email: formData.email || null,
                    address: formData.address || null,
                    lastUpdate: Timestamp.fromDate(new Date()),
                    status: initialData.status || 'pending',
                    amount: parseFloat(formData.amount) || 0,
                    priority: formData.priority,
                    assignedOfficer: formData.assignedOfficer,
                    documents: initialData.documents || 0,
                    offenceCategory: formData.actType === 'PoA Act' ? (formData.offenceCategory || null) : '',
                    offenceType: formData.actType === 'PoA Act' ? (formData.offenceType || null) : ''
                });
                onSaved?.();
            } else {
                const applicationsRef = collection(db, 'applications');
                const newId = `APP${Date.now()}`;
                const newApplication: Record<string, any> = {
                    applicantName: formData.applicantName,
                    aadhaar: formData.aadhaar,
                    phone: formData.phone,
                    district: formData.district,
                    state: formData.state,
                    actType: formData.actType,
                    beneficiaryId: formData.beneficiaryId,
                    incidentDate: formData.incidentDate,
                    firReport: formData.firReport || null,
                    medicalReport: formData.medicalReport || null,
                    policeStation: formData.policeStation || null,
                    caseNumber: formData.caseNumber || null,
                    fatherName: formData.fatherName || null,
                    email: formData.email || null,
                    address: formData.address || null,
                    applicationDate: Timestamp.fromDate(new Date()),
                    status: 'pending',
                    amount: parseFloat(formData.amount) || 0,
                    priority: formData.priority,
                    assignedOfficer: formData.assignedOfficer,
                    documents: 0,
                    lastUpdate: Timestamp.fromDate(new Date()),
                    offenceCategory: formData.actType === 'PoA Act' ? formData.offenceCategory : '',
                    offenceType: formData.actType === 'PoA Act' ? formData.offenceType : '',
                    id: newId
                };
                if (userBeneficiary) {
                    newApplication.ownerId = user?.uid;
                }
                await setDoc(doc(applicationsRef, newId), newApplication);
                onCreated?.(newId);
            }
        } catch (error) {
            console.error('Error saving application:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!mounted) return null;

    return createPortal(
        <>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={onCancel}
                className="fixed inset-0 bg-black/50 z-[60]"
            />

            {/* Panel */}
            <motion.aside
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
                className="fixed inset-y-0 right-0 w-full max-w-md z-[70] theme-drawer backdrop-blur-2xl border-l theme-border-glass flex flex-col shadow-2xl"
                role="dialog"
                aria-modal="true"
            >
                {/* Header */}
                <div className="h-12 px-4 flex items-center justify-between gap-3 border-b theme-border-glass shrink-0">
                    <h2 className="text-sm font-semibold tracking-tight theme-text-primary truncate">
                        {isEditing ? t('extracted.edit_application') : t("applications.createANewReliefApplication")}
                    </h2>
                    <button
                        onClick={onCancel}
                        className="p-1.5 rounded-md theme-text-muted hover:theme-bg-glass hover:theme-text-primary transition-colors shrink-0"
                        aria-label="Close"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} id="new-application-form" className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
                    {/* Beneficiary */}
                    <section>
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-[11px] font-semibold uppercase tracking-wider theme-text-secondary">Beneficiary</h3>
                            {beneficiaryAutoFilled && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                                    <Check className="w-3 h-3" /> Auto-filled
                                </span>
                            )}
                        </div>
                        {userBeneficiary ? (
                            <div className="h-9 px-2.5 rounded-md border theme-border-glass theme-bg-glass flex items-center text-sm theme-text-primary tabular-nums">
                                {lockedBeneficiaryId}
                            </div>
                        ) : (
                            <>
                                <select
                                    required
                                    value={formData.beneficiaryId}
                                    onChange={(e) => handleBeneficiarySelect(e.target.value)}
                                    className={inputCls}
                                >
                                    <option value="">{t('applications.selectBeneficiary') || 'Select Beneficiary'}</option>
                                    {beneficiaries.map((b) => (
                                        <option key={b.id} value={b.id}>
                                            {b.id} - {b.name} ({b.aadhaarNumber})
                                        </option>
                                    ))}
                                </select>
                                {beneficiaryExists === false && (
                                    <p className="text-red-500 text-xs mt-1.5">{t('applications.beneficiaryNotFound')}</p>
                                )}
                            </>
                        )}
                    </section>

                    {/* Applicant Information */}
                    <section className="pt-4 border-t theme-border-glass">
                        <h3 className="text-[11px] font-semibold uppercase tracking-wider theme-text-secondary mb-2.5">
                            {t('applications.applicantInformation')}
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2">
                                <Label>{t('extracted.full_name')} *</Label>
                                <input type="text" required value={formData.applicantName} onChange={(e) => handleInputChange('applicantName', e.target.value)} className={inputCls} placeholder={t('applications.enterApplicantFullName')} />
                            </div>
                            <div>
                                <Label>{t('extracted.phone_number')} *</Label>
                                <input type="tel" required value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} className={inputCls} placeholder={t('applications.enterPhoneNumber')} />
                            </div>
                            <div>
                                <Label>{t('extracted.aadhaar_number')} *</Label>
                                <input type="text" required value={formData.aadhaar} onChange={(e) => handleInputChange('aadhaar', e.target.value)} className={inputCls} placeholder={t('applications.enter12DigitAadhaarNumber')} />
                            </div>
                            <div>
                                <Label>{t('extracted.district')} *</Label>
                                <input type="text" required value={formData.district} onChange={(e) => handleInputChange('district', e.target.value)} className={inputCls} placeholder={t('applications.enterDistrict')} />
                            </div>
                            <div>
                                <Label>{t('extracted.state')} *</Label>
                                <input type="text" required value={formData.state} onChange={(e) => handleInputChange('state', e.target.value)} className={inputCls} placeholder={t('applications.enterState')} />
                            </div>
                        </div>
                    </section>

                    {/* Case Details */}
                    <section className="pt-4 border-t theme-border-glass">
                        <h3 className="text-[11px] font-semibold uppercase tracking-wider theme-text-secondary mb-2.5">
                            {t('applications.caseDetails')}
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>{t('extracted.act_type')} *</Label>
                                <select required value={formData.actType} onChange={(e) => handleInputChange('actType', e.target.value)} className={inputCls}>
                                    <option value="">{t('applications.selectActType')}</option>
                                    <option value="PCR Act">{t('extracted.pcr_act')}</option>
                                    <option value="PoA Act">{t('extracted.poa_act')}</option>
                                </select>
                            </div>
                            <div>
                                <Label>{t('extracted.incident_date')}</Label>
                                <input type="date" value={formData.incidentDate} onChange={(e) => handleInputChange('incidentDate', e.target.value)} className={inputCls} />
                            </div>
                            <div>
                                <Label>{t('applications.firReport')}</Label>
                                <input type="text" value={formData.firReport} onChange={(e) => handleInputChange('firReport', e.target.value)} className={inputCls} placeholder={t('applications.enterFirReport')} />
                            </div>
                            <div>
                                <Label>{t('applications.medicalReport')}</Label>
                                <input type="text" value={formData.medicalReport} onChange={(e) => handleInputChange('medicalReport', e.target.value)} className={inputCls} placeholder={t('applications.enterMedicalReport')} />
                            </div>
                            <div>
                                <Label>{t('applications.policeStation')}</Label>
                                <input type="text" value={formData.policeStation} onChange={(e) => handleInputChange('policeStation', e.target.value)} className={inputCls} placeholder={t('applications.enterPoliceStation')} />
                            </div>
                            <div>
                                <Label>{t('applications.caseNumber')}</Label>
                                <input type="text" value={formData.caseNumber} onChange={(e) => handleInputChange('caseNumber', e.target.value)} className={inputCls} placeholder={t('applications.enterCaseNumber')} />
                            </div>
                        </div>

                        {/* PoA Offence Classification */}
                        {formData.actType === 'PoA Act' && (
                            <div className="mt-3 pt-3 border-t theme-border-glass space-y-3">
                                <h4 className="text-[11px] font-semibold uppercase tracking-wider theme-text-secondary flex items-center gap-1.5">
                                    PoA Offence Classification
                                </h4>
                                <div>
                                    <Label>Offence Category *</Label>
                                    <select
                                        required={formData.actType === 'PoA Act'}
                                        value={formData.offenceCategory}
                                        onChange={(e) => setFormData(prev => ({ ...prev, offenceCategory: e.target.value, offenceType: '' }))}
                                        className={inputCls}
                                    >
                                        <option value="">Select Category</option>
                                        {Object.keys(POA_OFFENCES).map((category) => (
                                            <option key={category} value={category}>{category}</option>
                                        ))}
                                    </select>
                                </div>
                                {formData.offenceCategory && (
                                    <div>
                                        <Label>Specific Offence *</Label>
                                        <select
                                            required={formData.actType === 'PoA Act'}
                                            value={formData.offenceType}
                                            onChange={(e) => handleInputChange('offenceType', e.target.value)}
                                            className={inputCls}
                                        >
                                            <option value="">Select Offence</option>
                                            {Object.entries(POA_OFFENCES[formData.offenceCategory as keyof typeof POA_OFFENCES] || {}).map(([offence, compensation]) => {
                                                const compensationText = typeof compensation === 'string' && compensation.includes('-')
                                                    ? `₹${compensation.replace('-', ' - ₹')} (range)`
                                                    : `₹${(compensation as number).toLocaleString('en-IN')}`;
                                                return (
                                                    <option key={offence} value={offence}>{offence} • {compensationText}</option>
                                                );
                                            })}
                                        </select>
                                    </div>
                                )}
                            </div>
                        )}
                    </section>

                    {/* Assessment */}
                    <section className="pt-4 border-t theme-border-glass">
                        <h3 className="text-[11px] font-semibold uppercase tracking-wider theme-text-secondary mb-2.5">Assessment</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>{t('applications.reliefAmountINR')} *</Label>
                                <input type="number" required min="0" step="0.01" value={formData.amount} onChange={(e) => handleInputChange('amount', e.target.value)} className={`${inputCls} tabular-nums`} placeholder={t('applications.enterReliefAmount')} />
                            </div>
                            <div>
                                <Label>{t('applications.priorityLevel')}</Label>
                                <select value={formData.priority} onChange={(e) => handleInputChange('priority', e.target.value)} className={inputCls}>
                                    <option value="low">{t('extracted.low')}</option>
                                    <option value="medium">{t('extracted.medium')}</option>
                                    <option value="high">{t('extracted.high')}</option>
                                </select>
                            </div>
                            <div className="col-span-2">
                                <Label>{t('extracted.assigned_officer')}</Label>
                                <input type="text" value={formData.assignedOfficer} onChange={(e) => handleInputChange('assignedOfficer', e.target.value)} className={inputCls} placeholder={t('applications.enterAssignedOfficerNameOptional')} />
                            </div>
                        </div>
                    </section>
                </form>

                {/* Footer */}
                <div className="px-4 py-3 border-t theme-border-glass flex items-center gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 h-9 rounded-md border theme-border-glass theme-text-secondary text-xs font-medium hover:theme-bg-glass transition-colors"
                    >
                        {t('extracted.cancel')}
                    </button>
                    <button
                        type="submit"
                        form="new-application-form"
                        disabled={isSubmitting || !formData.beneficiaryId || beneficiaryExists === false}
                        className="flex-1 h-9 accent-gradient text-white rounded-md inline-flex items-center justify-center gap-1.5 text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        {isSubmitting
                            ? `${t('extracted.saving')}...`
                            : isEditing
                                ? t('extracted.save_changes')
                                : t('applications.createApplication')}
                    </button>
                </div>
            </motion.aside>
        </>,
        document.body
    );
};

export default NewApplicationDrawer;
