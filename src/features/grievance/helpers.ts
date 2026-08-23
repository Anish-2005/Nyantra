"use client";
import React, { useEffect } from 'react';
import { Clock, Zap, CheckCircle2, AlertTriangle } from 'lucide-react';
import { collection, query, onSnapshot, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type TranslateFn = (key: string, vars?: Record<string, string | number>) => string;

// Grievance type definition matching the admin page
export type Grievance = {
  id: string;
  beneficiaryId?: string;
  userId?: string;
  beneficiaryName: string;
  phone?: string;
  email?: string;
  district?: string;
  state?: string;
  actType?: string;
  applicationId?: string;
  category?: string;
  subCategory?: string;
  priority?: string;
  status?: string;
  assignedTo?: string;
  assignedDate?: string;
  createdDate?: string | null;
  lastUpdated?: string;
  resolutionDate?: string | null;
  expectedResolution?: string;
  description?: string;
  attachments?: number;
  communication?: any[];
  escalationLevel?: number;
  satisfactionRating?: number | null;
  followUpRequired?: boolean;
  relatedGrievances?: string[];
};

// Hook to get user-specific grievances from Firestore
export const useUserGrievances = (setState: React.Dispatch<React.SetStateAction<Grievance[]>>, beneficiaries: any[], userId: string) => {
  useEffect(() => {
    if (!userId || beneficiaries.length === 0) {
      setState([]);
      return;
    }

    // Get all beneficiary IDs
    const beneficiaryIds = beneficiaries.map(b => b.id);

    // Query for grievances by userId OR by beneficiaryIds
    const userQuery = query(
      collection(db, 'grievances'),
      where('userId', '==', userId)
    );

    const unsubscribers: (() => void)[] = [];
    const allGrievances: Grievance[] = [];

    // Query for grievances created by this user (new format)
    const unsub1 = onSnapshot(userQuery, (snapshot) => {
      const userGrievances: Grievance[] = snapshot.docs.map((d) => {
        const data = d.data() as any;
        const toIso = (v: any) => v && typeof v.toDate === 'function' ? v.toDate().toISOString() : (v ? String(v) : null);
        const created = toIso(data?.createdDate);
        const lastUpdated = toIso(data?.lastUpdated);
        const resolutionDate = toIso(data?.resolutionDate);
        const expectedResolution = toIso(data?.expectedResolution);

        return {
          id: d.id,
          beneficiaryName: data.beneficiaryName || data.name || '—',
          beneficiaryId: data.beneficiaryId,
          userId: data.userId,
          phone: data.phone,
          email: data.email,
          district: data.district,
          state: data.state,
          actType: data.actType,
          applicationId: data.applicationId,
          category: data.category,
          subCategory: data.subCategory,
          priority: data.priority,
          status: data.status,
          assignedTo: data.assignedTo,
          assignedDate: data.assignedDate,
          createdDate: created,
          lastUpdated: lastUpdated,
          resolutionDate: resolutionDate,
          expectedResolution: expectedResolution,
          description: data.description,
          attachments: data.attachments || 0,
          communication: data.communication || [],
          escalationLevel: data.escalationLevel || 0,
          satisfactionRating: data.satisfactionRating ?? null,
          followUpRequired: data.followUpRequired || false,
          relatedGrievances: data.relatedGrievances || []
        };
      });

      // Update combined list
      allGrievances.splice(0, allGrievances.length, ...userGrievances);

      // Sort by createdDate descending
      allGrievances.sort((a, b) => {
        const da = a.createdDate || '';
        const db = b.createdDate || '';
        if (da === db) return 0;
        return da < db ? 1 : -1;
      });

      setState([...allGrievances]);
    });

    unsubscribers.push(unsub1);

    // Also query for grievances by beneficiary IDs (legacy support)
    beneficiaryIds.forEach((beneficiaryId) => {
      const beneficiaryQuery = query(
        collection(db, 'grievances'),
        where('beneficiaryId', '==', beneficiaryId)
      );

      const unsub = onSnapshot(beneficiaryQuery, (snapshot) => {
        const beneficiaryGrievances: Grievance[] = snapshot.docs.map((d) => {
          const data = d.data() as any;
          // Skip if this grievance already exists in userGrievances (avoid duplicates)
          if (allGrievances.some(g => g.id === d.id)) return;

          const toIso = (v: any) => v && typeof v.toDate === 'function' ? v.toDate().toISOString() : (v ? String(v) : null);
          const created = toIso(data?.createdDate);
          const lastUpdated = toIso(data?.lastUpdated);
          const resolutionDate = toIso(data?.resolutionDate);
          const expectedResolution = toIso(data?.expectedResolution);

          return {
            id: d.id,
            beneficiaryName: data.beneficiaryName || data.name || '—',
            beneficiaryId: data.beneficiaryId,
            userId: data.userId,
            phone: data.phone,
            email: data.email,
            district: data.district,
            state: data.state,
            actType: data.actType,
            applicationId: data.applicationId,
            category: data.category,
            subCategory: data.subCategory,
            priority: data.priority,
            status: data.status,
            assignedTo: data.assignedTo,
            assignedDate: data.assignedDate,
            createdDate: created,
            lastUpdated: lastUpdated,
            resolutionDate: resolutionDate,
            expectedResolution: expectedResolution,
            description: data.description,
            attachments: data.attachments || 0,
            communication: data.communication || [],
            escalationLevel: data.escalationLevel || 0,
            satisfactionRating: data.satisfactionRating ?? null,
            followUpRequired: data.followUpRequired || false,
            relatedGrievances: data.relatedGrievances || []
          };
        }).filter(Boolean) as Grievance[]; // Filter out undefined results

        // Add new grievances to combined list
        beneficiaryGrievances.forEach(grievance => {
          if (!allGrievances.some(g => g.id === grievance.id)) {
            allGrievances.push(grievance);
          }
        });

        // Sort by createdDate descending
        allGrievances.sort((a, b) => {
          const da = a.createdDate || '';
          const db = b.createdDate || '';
          if (da === db) return 0;
          return da < db ? 1 : -1;
        });

        setState([...allGrievances]);
      });

      unsubscribers.push(unsub);
    });

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [setState, beneficiaries, userId]);
};

// Module-scope status maps shared by the list card and inspector
export const GRIEVANCE_STATUS_COLORS: Record<string, string> = {
  'open': 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  'in-progress': 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  'pending': 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  'resolved': 'bg-green-500/10 text-green-600 dark:text-green-400',
  'closed': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  'escalated': 'bg-red-500/10 text-red-600 dark:text-red-400',
};

export const getStatusColor = (status?: string) =>
  GRIEVANCE_STATUS_COLORS[(status || '').toLowerCase()] || 'bg-gray-500/10 text-gray-600 dark:text-gray-400';

export const GRIEVANCE_STATUS_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'open': Clock,
  'pending': Clock,
  'in-progress': Zap,
  'resolved': CheckCircle2,
  'closed': CheckCircle2,
  'escalated': AlertTriangle,
};

export const getStatusIcon = (status?: string) =>
  GRIEVANCE_STATUS_ICONS[(status || '').toLowerCase()] || Clock;

const STATUS_TEXT_KEYS: Record<string, string> = {
  'open': 'extracted.open',
  'in-progress': 'extracted.in_progress',
  'resolved': 'extracted.resolved',
  'closed': 'extracted.closed',
};

const FALLBACK_STATUS_KEY = 'extracted.open';

export const getTranslatedStatus = (t: TranslateFn, status?: string) => {
  const key = status ? STATUS_TEXT_KEYS[status] : undefined;
  if (key) return t(key);
  return status || t(FALLBACK_STATUS_KEY);
};
