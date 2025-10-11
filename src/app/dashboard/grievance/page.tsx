"use client";
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import type * as THREE from 'three';
import { Search, Filter, Download, Plus, Eye, Edit, MoreVertical, TrendingUp, Clock, Star, PieChart, PlayCircle, CheckCircle, Check, AlertCircle, AlertOctagon, MessageCircle, Send, PhoneCall, Video, MapPin, User, UserCheck, Scale, FileText, ChevronLeft, ChevronRight, X, Flag, Banknote, FileSearch, UserX, Zap, Timer, Calendar, Phone, Mail, MessageSquare, BarChart3, Users, Shield, Target, ArrowUpRight, Activity } from 'lucide-react';

// Mock data for grievances (expanded list for testing and pagination)
const mockGrievances = [
  {
    id: 'GRV-2024-001234',
    beneficiaryId: 'BEN-2024-001234',
    beneficiaryName: 'Rajesh Kumar',
    phone: '+91 98765-43210',
    email: 'rajesh.k@example.com',
    district: 'Patna',
    state: 'Bihar',
    actType: 'PCR Act',
    applicationId: 'APP-2024-001234',
    category: 'disbursement-delay',
    subCategory: 'payment-not-received',
    priority: 'high',
    status: 'open',
    assignedTo: 'Officer Sharma',
    assignedDate: '2024-03-15',
    createdDate: '2024-03-10',
    lastUpdated: '2024-03-18 14:30',
    resolutionDate: null,
    expectedResolution: '2024-03-25',
    description: 'Relief amount not received despite application approval 3 weeks ago. No communication regarding disbursement status.',
    attachments: 3,
    communication: [],
    escalationLevel: 1,
    satisfactionRating: null,
    followUpRequired: true,
    relatedGrievances: []
  },
  { id: 'GRV-2024-001235', beneficiaryId: 'BEN-2024-001235', beneficiaryName: 'Sunita Devi', phone: '+91 91234-56789', email: 'sunita.d@example.com', district: 'Gaya', state: 'Bihar', actType: 'PCR Act', applicationId: 'APP-2024-001235', category: 'document-issues', subCategory: 'missing-documents', priority: 'medium', status: 'in-progress', assignedTo: 'Officer Verma', assignedDate: '2024-03-12', createdDate: '2024-03-11', lastUpdated: '2024-03-17 09:10', resolutionDate: null, expectedResolution: '2024-03-22', description: 'Applicant missing identity proof, needs assistance to upload documents.', attachments: 1, communication: [], escalationLevel: 0, satisfactionRating: null, followUpRequired: false, relatedGrievances: [] },
  { id: 'GRV-2024-001236', beneficiaryId: 'BEN-2024-001236', beneficiaryName: 'Mohammed Ali', phone: '+91 99876-54321', email: 'm.ali@example.com', district: 'Muzaffarpur', state: 'Bihar', actType: 'PoA Act', applicationId: 'APP-2024-001236', category: 'application-status', subCategory: 'processing-delay', priority: 'low', status: 'resolved', assignedTo: 'Officer Kapoor', assignedDate: '2024-03-08', createdDate: '2024-03-05', lastUpdated: '2024-03-14 11:00', resolutionDate: '2024-03-14', expectedResolution: '2024-03-12', description: 'Application processing delayed due to backlog; resolved after manual intervention.', attachments: 0, communication: [], escalationLevel: 0, satisfactionRating: 4, followUpRequired: false, relatedGrievances: [] },
  { id: 'GRV-2024-001237', beneficiaryId: 'BEN-2024-001237', beneficiaryName: 'Anita Sharma', phone: '+91 90123-45678', email: 'anita.s@example.com', district: 'Patna', state: 'Bihar', actType: 'PCR Act', applicationId: 'APP-2024-001237', category: 'officer-behavior', subCategory: 'rude-staff', priority: 'high', status: 'escalated', assignedTo: 'Officer Rao', assignedDate: '2024-03-16', createdDate: '2024-03-15', lastUpdated: '2024-03-18 16:00', resolutionDate: null, expectedResolution: '2024-03-28', description: 'Complainant reported rude behaviour from local officer during verification.', attachments: 2, communication: [], escalationLevel: 2, satisfactionRating: null, followUpRequired: true, relatedGrievances: [] },
  { id: 'GRV-2024-001238', beneficiaryId: 'BEN-2024-001238', beneficiaryName: 'Ramesh Thakur', phone: '+91 98987-65432', email: 'r.thakur@example.com', district: 'Ara', state: 'Bihar', actType: 'PoA Act', applicationId: 'APP-2024-001238', category: 'information-correction', subCategory: 'name-mismatch', priority: 'medium', status: 'pending', assignedTo: 'Officer Singh', assignedDate: '2024-03-14', createdDate: '2024-03-13', lastUpdated: '2024-03-14 08:20', resolutionDate: null, expectedResolution: '2024-03-21', description: 'Applicant requests correction of name spelling in records.', attachments: 1, communication: [], escalationLevel: 0, satisfactionRating: null, followUpRequired: false, relatedGrievances: [] },
  { id: 'GRV-2024-001239', beneficiaryId: 'BEN-2024-001239', beneficiaryName: 'Seema K', phone: '+91 97654-32109', email: 'seema.k@example.com', district: 'Bhagalpur', state: 'Bihar', actType: 'PCR Act', applicationId: 'APP-2024-001239', category: 'technical-issues', subCategory: 'portal-error', priority: 'medium', status: 'open', assignedTo: 'Officer Mehta', assignedDate: '2024-03-18', createdDate: '2024-03-18', lastUpdated: '2024-03-18 12:00', resolutionDate: null, expectedResolution: '2024-03-23', description: 'Error encountered during submission on portal.', attachments: 0, communication: [], escalationLevel: 0, satisfactionRating: null, followUpRequired: false, relatedGrievances: [] },
  { id: 'GRV-2024-001240', beneficiaryId: 'BEN-2024-001240', beneficiaryName: 'Vijay Patel', phone: '+91 91234-00011', email: 'v.patel@example.com', district: 'Gaya', state: 'Bihar', actType: 'PoA Act', applicationId: 'APP-2024-001240', category: 'disbursement-delay', subCategory: 'bank-issue', priority: 'high', status: 'in-progress', assignedTo: 'Officer Sharma', assignedDate: '2024-03-10', createdDate: '2024-03-09', lastUpdated: '2024-03-16 10:00', resolutionDate: null, expectedResolution: '2024-03-22', description: 'Funds returned by bank due to incorrect account details; beneficiary needs re-verification.', attachments: 2, communication: [], escalationLevel: 1, satisfactionRating: null, followUpRequired: true, relatedGrievances: [] },
  { id: 'GRV-2024-001241', beneficiaryId: 'BEN-2024-001241', beneficiaryName: 'Poonam Devi', phone: '+91 99881-23456', email: 'poonam.d@example.com', district: 'Muzaffarpur', state: 'Bihar', actType: 'PCR Act', applicationId: 'APP-2024-001241', category: 'document-issues', subCategory: 'invalid-aadhaar', priority: 'low', status: 'resolved', assignedTo: 'Officer Verma', assignedDate: '2024-03-05', createdDate: '2024-03-02', lastUpdated: '2024-03-10', resolutionDate: '2024-03-10', expectedResolution: '2024-03-08', description: 'Aadhaar mismatch resolved after re-submission.', attachments: 1, communication: [], escalationLevel: 0, satisfactionRating: 5, followUpRequired: false, relatedGrievances: [] },
  { id: 'GRV-2024-001242', beneficiaryId: 'BEN-2024-001242', beneficiaryName: 'Kamal Kumar', phone: '+91 99777-33322', email: 'kamal.k@example.com', district: 'Patna', state: 'Bihar', actType: 'PoA Act', applicationId: 'APP-2024-001242', category: 'application-status', subCategory: 'pending-approval', priority: 'medium', status: 'pending', assignedTo: 'Officer Rao', assignedDate: '2024-03-11', createdDate: '2024-03-10', lastUpdated: '2024-03-12', resolutionDate: null, expectedResolution: '2024-03-19', description: 'Application awaiting managerial approval.', attachments: 0, communication: [], escalationLevel: 0, satisfactionRating: null, followUpRequired: false, relatedGrievances: [] },
  { id: 'GRV-2024-001243', beneficiaryId: 'BEN-2024-001243', beneficiaryName: 'Laxmi Devi', phone: '+91 94444-11122', email: 'laxmi.d@example.com', district: 'Gopalganj', state: 'Bihar', actType: 'PCR Act', applicationId: 'APP-2024-001243', category: 'officer-behavior', subCategory: 'delay-in-verification', priority: 'high', status: 'open', assignedTo: 'Officer Mehta', assignedDate: '2024-03-17', createdDate: '2024-03-16', lastUpdated: '2024-03-17 18:00', resolutionDate: null, expectedResolution: '2024-03-27', description: 'Officer delayed verification causing hardship to beneficiary.', attachments: 0, communication: [], escalationLevel: 1, satisfactionRating: null, followUpRequired: true, relatedGrievances: [] },
  { id: 'GRV-2024-001244', beneficiaryId: 'BEN-2024-001244', beneficiaryName: 'Rajiv Singh', phone: '+91 93333-22211', email: 'rajiv.s@example.com', district: 'Buxar', state: 'Bihar', actType: 'PoA Act', applicationId: 'APP-2024-001244', category: 'information-correction', subCategory: 'address-change', priority: 'low', status: 'resolved', assignedTo: 'Officer Singh', assignedDate: '2024-03-01', createdDate: '2024-02-28', lastUpdated: '2024-03-04', resolutionDate: '2024-03-04', expectedResolution: '2024-03-03', description: 'Address updated successfully.', attachments: 0, communication: [], escalationLevel: 0, satisfactionRating: 5, followUpRequired: false, relatedGrievances: [] },
  { id: 'GRV-2024-001245', beneficiaryId: 'BEN-2024-001245', beneficiaryName: 'Meera Patil', phone: '+91 91111-22233', email: 'meera.p@example.com', district: 'Begusarai', state: 'Bihar', actType: 'PCR Act', applicationId: 'APP-2024-001245', category: 'technical-issues', subCategory: 'otp-failure', priority: 'medium', status: 'in-progress', assignedTo: 'Officer Kapoor', assignedDate: '2024-03-09', createdDate: '2024-03-08', lastUpdated: '2024-03-15', resolutionDate: null, expectedResolution: '2024-03-20', description: 'OTP not received for verification step.', attachments: 0, communication: [], escalationLevel: 0, satisfactionRating: null, followUpRequired: true, relatedGrievances: [] },
  { id: 'GRV-2024-001246', beneficiaryId: 'BEN-2024-001246', beneficiaryName: 'Suresh Kumar', phone: '+91 92222-33344', email: 'suresh.k@example.com', district: 'Munger', state: 'Bihar', actType: 'PoA Act', applicationId: 'APP-2024-001246', category: 'disbursement-delay', subCategory: 'verification-hold', priority: 'medium', status: 'open', assignedTo: 'Officer Sharma', assignedDate: '2024-03-14', createdDate: '2024-03-13', lastUpdated: '2024-03-14', resolutionDate: null, expectedResolution: '2024-03-21', description: 'Verification pending for bank details.', attachments: 1, communication: [], escalationLevel: 0, satisfactionRating: null, followUpRequired: true, relatedGrievances: [] },
  { id: 'GRV-2024-001247', beneficiaryId: 'BEN-2024-001247', beneficiaryName: 'Radha Rani', phone: '+91 97777-44455', email: 'radha.r@example.com', district: 'Darbhanga', state: 'Bihar', actType: 'PCR Act', applicationId: 'APP-2024-001247', category: 'document-issues', subCategory: 'photo-mismatch', priority: 'low', status: 'resolved', assignedTo: 'Officer Verma', assignedDate: '2024-03-03', createdDate: '2024-02-28', lastUpdated: '2024-03-05', resolutionDate: '2024-03-05', expectedResolution: '2024-03-04', description: 'Profile photo mismatch corrected.', attachments: 1, communication: [], escalationLevel: 0, satisfactionRating: 4, followUpRequired: false, relatedGrievances: [] },
  { id: 'GRV-2024-001248', beneficiaryId: 'BEN-2024-001248', beneficiaryName: 'Amit Rao', phone: '+91 96666-55544', email: 'amit.r@example.com', district: 'Saharsa', state: 'Bihar', actType: 'PoA Act', applicationId: 'APP-2024-001248', category: 'application-status', subCategory: 'returned-docs', priority: 'high', status: 'in-progress', assignedTo: 'Officer Rao', assignedDate: '2024-03-02', createdDate: '2024-03-01', lastUpdated: '2024-03-10', resolutionDate: null, expectedResolution: '2024-03-18', description: 'Documents returned for correction; beneficiary needs guidance.', attachments: 2, communication: [], escalationLevel: 1, satisfactionRating: null, followUpRequired: true, relatedGrievances: [] },
  { id: 'GRV-2024-001249', beneficiaryId: 'BEN-2024-001249', beneficiaryName: 'Geeta Kumari', phone: '+91 95555-66633', email: 'geeta.k@example.com', district: 'Vaishali', state: 'Bihar', actType: 'PCR Act', applicationId: 'APP-2024-001249', category: 'officer-behavior', subCategory: 'negligence', priority: 'high', status: 'open', assignedTo: 'Officer Mehta', assignedDate: '2024-03-18', createdDate: '2024-03-17', lastUpdated: '2024-03-18', resolutionDate: null, expectedResolution: '2024-03-29', description: 'Officer negligence reported during field visit.', attachments: 0, communication: [], escalationLevel: 1, satisfactionRating: null, followUpRequired: true, relatedGrievances: [] },
  { id: 'GRV-2024-001250', beneficiaryId: 'BEN-2024-001250', beneficiaryName: 'Nisha Patel', phone: '+91 93322-11100', email: 'nisha.p@example.com', district: 'Bhagalpur', state: 'Bihar', actType: 'PoA Act', applicationId: 'APP-2024-001250', category: 'information-correction', subCategory: 'dob-correction', priority: 'low', status: 'resolved', assignedTo: 'Officer Singh', assignedDate: '2024-02-25', createdDate: '2024-02-20', lastUpdated: '2024-02-28', resolutionDate: '2024-02-28', expectedResolution: '2024-02-27', description: 'DOB corrected after verification.', attachments: 0, communication: [], escalationLevel: 0, satisfactionRating: 5, followUpRequired: false, relatedGrievances: [] },
  { id: 'GRV-2024-001251', beneficiaryId: 'BEN-2024-001251', beneficiaryName: 'Manoj Kumar', phone: '+91 94488-77766', email: 'manoj.k@example.com', district: 'Gaya', state: 'Bihar', actType: 'PCR Act', applicationId: 'APP-2024-001251', category: 'technical-issues', subCategory: 'server-timeout', priority: 'medium', status: 'in-progress', assignedTo: 'Officer Kapoor', assignedDate: '2024-03-12', createdDate: '2024-03-11', lastUpdated: '2024-03-16', resolutionDate: null, expectedResolution: '2024-03-21', description: 'Server timeout while processing application.', attachments: 0, communication: [], escalationLevel: 0, satisfactionRating: null, followUpRequired: true, relatedGrievances: [] },
  { id: 'GRV-2024-001252', beneficiaryId: 'BEN-2024-001252', beneficiaryName: 'Preeti Sharma', phone: '+91 91122-33344', email: 'preeti.s@example.com', district: 'Munger', state: 'Bihar', actType: 'PoA Act', applicationId: 'APP-2024-001252', category: 'disbursement-delay', subCategory: 'wrong-bank', priority: 'high', status: 'open', assignedTo: 'Officer Sharma', assignedDate: '2024-03-17', createdDate: '2024-03-16', lastUpdated: '2024-03-17', resolutionDate: null, expectedResolution: '2024-03-27', description: 'Disbursed to wrong bank account; needs reversal.', attachments: 1, communication: [], escalationLevel: 2, satisfactionRating: null, followUpRequired: true, relatedGrievances: [] },
  { id: 'GRV-2024-001253', beneficiaryId: 'BEN-2024-001253', beneficiaryName: 'Alok Verma', phone: '+91 97700-11122', email: 'alok.v@example.com', district: 'Darbhanga', state: 'Bihar', actType: 'PCR Act', applicationId: 'APP-2024-001253', category: 'document-issues', subCategory: 'signature-mismatch', priority: 'medium', status: 'pending', assignedTo: 'Officer Verma', assignedDate: '2024-03-13', createdDate: '2024-03-12', lastUpdated: '2024-03-13', resolutionDate: null, expectedResolution: '2024-03-20', description: 'Signature mismatch on submitted documents.', attachments: 1, communication: [], escalationLevel: 0, satisfactionRating: null, followUpRequired: false, relatedGrievances: [] },
  { id: 'GRV-2024-001254', beneficiaryId: 'BEN-2024-001254', beneficiaryName: 'Sanjay Yadav', phone: '+91 96600-22233', email: 'sanjay.y@example.com', district: 'Buxar', state: 'Bihar', actType: 'PoA Act', applicationId: 'APP-2024-001254', category: 'application-status', subCategory: 'awaiting-docs', priority: 'low', status: 'open', assignedTo: 'Officer Singh', assignedDate: '2024-03-18', createdDate: '2024-03-18', lastUpdated: '2024-03-18', resolutionDate: null, expectedResolution: '2024-03-24', description: 'Pending documents from applicant.', attachments: 0, communication: [], escalationLevel: 0, satisfactionRating: null, followUpRequired: false, relatedGrievances: [] },
  { id: 'GRV-2024-001255', beneficiaryId: 'BEN-2024-001255', beneficiaryName: 'Kiran Rai', phone: '+91 98888-33344', email: 'kiran.r@example.com', district: 'Begusarai', state: 'Bihar', actType: 'PCR Act', applicationId: 'APP-2024-001255', category: 'officer-behavior', subCategory: 'bribe-request', priority: 'high', status: 'escalated', assignedTo: 'Officer Mehta', assignedDate: '2024-03-15', createdDate: '2024-03-14', lastUpdated: '2024-03-16', resolutionDate: null, expectedResolution: '2024-03-30', description: 'Allegation of bribe request during application processing.', attachments: 2, communication: [], escalationLevel: 2, satisfactionRating: null, followUpRequired: true, relatedGrievances: [] },
  { id: 'GRV-2024-001256', beneficiaryId: 'BEN-2024-001256', beneficiaryName: 'Ritu Singh', phone: '+91 97788-44455', email: 'ritu.s@example.com', district: 'Vaishali', state: 'Bihar', actType: 'PoA Act', applicationId: 'APP-2024-001256', category: 'information-correction', subCategory: 'mobile-update', priority: 'low', status: 'resolved', assignedTo: 'Officer Rao', assignedDate: '2024-02-20', createdDate: '2024-02-18', lastUpdated: '2024-02-25', resolutionDate: '2024-02-25', expectedResolution: '2024-02-23', description: 'Mobile number updated in records.', attachments: 0, communication: [], escalationLevel: 0, satisfactionRating: 5, followUpRequired: false, relatedGrievances: [] }
];

const GrievancePage = () => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [actTypeFilter, setActTypeFilter] = useState('all');
  const [assignedToFilter, setAssignedToFilter] = useState('all');
  const [sortBy] = useState('createdDate');
  const [sortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGrievance, setSelectedGrievance] = useState<typeof mockGrievances[0] | null>(null);
  const [viewMode, setViewMode] = useState<'dashboard' | 'list'>('dashboard');
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Filter and sort grievances (same logic as before)
  const filteredGrievances = useMemo(() => {
    let filtered = [...mockGrievances];
    if (searchQuery) {
      filtered = filtered.filter(grievance =>
        grievance.beneficiaryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        grievance.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        grievance.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        grievance.applicationId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (statusFilter !== 'all') filtered = filtered.filter(g => g.status === statusFilter);
    if (categoryFilter !== 'all') filtered = filtered.filter(g => g.category === categoryFilter);
    if (priorityFilter !== 'all') filtered = filtered.filter(g => g.priority === priorityFilter);
    if (actTypeFilter !== 'all') filtered = filtered.filter(g => g.actType === actTypeFilter);
    if (assignedToFilter !== 'all') filtered = filtered.filter(g => g.assignedTo === assignedToFilter);
    
    filtered.sort((a, b) => {
      const getVal = (obj: Record<string, unknown>, key: string) => {
        const val = obj[key as keyof typeof obj];
        if (val === null || val === undefined) return '';
        if (typeof val === 'string') {
          const ts = Date.parse(val);
          if (!Number.isNaN(ts)) return ts;
          return val.toLowerCase();
        }
        return val as unknown as number | string;
      };
      const aVal = getVal(a, sortBy);
      const bVal = getVal(b, sortBy);
      if (aVal === bVal) return 0;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      const aStr = String(aVal);
      const bStr = String(bVal);
      return sortOrder === 'asc' ? (aStr > bStr ? 1 : -1) : (aStr < bStr ? 1 : -1);
    });
    return filtered;
  }, [searchQuery, statusFilter, categoryFilter, priorityFilter, actTypeFilter, assignedToFilter, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredGrievances.length / itemsPerPage);
  const paginatedGrievances = filteredGrievances.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Statistics
  const stats = useMemo(() => {
    const total = mockGrievances.length;
    const resolved = mockGrievances.filter(g => g.status === 'resolved' || g.status === 'closed').length;
    const inProgress = mockGrievances.filter(g => g.status === 'in-progress').length;
    const escalated = mockGrievances.filter(g => g.status === 'escalated').length;
    const avgResolutionTime = 5.2;
    const satisfactionRate = Math.round((mockGrievances.filter(g => g.satisfactionRating && g.satisfactionRating >= 4).length / resolved) * 100);
    
    return {
      total,
      open: mockGrievances.filter(g => g.status === 'open').length,
      inProgress,
      resolved,
      escalated,
      closed: mockGrievances.filter(g => g.status === 'closed').length,
      pending: mockGrievances.filter(g => g.status === 'pending').length,
      avgResolutionTime,
      satisfactionRate,
      highPriority: mockGrievances.filter(g => g.priority === 'high').length
    };
  }, []);

  // Category distribution
  const categoryStats = useMemo(() => {
    return {
      'disbursement-delay': mockGrievances.filter(g => g.category === 'disbursement-delay').length,
      'document-issues': mockGrievances.filter(g => g.category === 'document-issues').length,
      'application-status': mockGrievances.filter(g => g.category === 'application-status').length,
      'officer-behavior': mockGrievances.filter(g => g.category === 'officer-behavior').length,
      'information-correction': mockGrievances.filter(g => g.category === 'information-correction').length,
      'technical-issues': mockGrievances.filter(g => g.category === 'technical-issues').length
    };
  }, []);

  // Mobile detection
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      const matches = 'matches' in e ? e.matches : mq.matches;
      setIsMobile(matches);
    };
    handler(mq);
    mq.addEventListener('change', handler as EventListener);
    return () => mq.removeEventListener('change', handler as EventListener);
  }, []);

  // Three.js background
  useEffect(() => {
    if (!canvasRef.current) return;
    let cancelled = false;

    (async () => {
      const THREE = await import('three');
      if (cancelled) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current!, alpha: true, antialias: true });

      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      camera.position.z = 5;

      const particleColor = theme === 'dark' ? 0x3b82f6 : 0x1e40af;
      const lineColor = theme === 'dark' ? 0xf59e0b : 0xd97706;

      const particlesGeometry = new THREE.BufferGeometry();
      const particlesCount = 800;
      const posArray = new Float32Array(particlesCount * 3);

      for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 15;
      }

      particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

      const particlesMaterial = new THREE.PointsMaterial({
        size: theme === 'dark' ? 0.015 : 0.01,
        color: particleColor,
        transparent: true,
        opacity: theme === 'dark' ? 0.4 : 0.3,
      });

      const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
      scene.add(particlesMesh);

      const linesGeometry = new THREE.BufferGeometry();
      const linesMaterial = new THREE.LineBasicMaterial({ 
        color: lineColor, 
        transparent: true, 
        opacity: theme === 'dark' ? 0.1 : 0.08 
      });

      const linesPositions: number[] = [];
      for (let i = 0; i < 60; i++) {
        const x1 = (Math.random() - 0.5) * 12;
        const y1 = (Math.random() - 0.5) * 12;
        const z1 = (Math.random() - 0.5) * 12;
        const x2 = x1 + (Math.random() - 0.5) * 2;
        const y2 = y1 + (Math.random() - 0.5) * 2;
        const z2 = z1 + (Math.random() - 0.5) * 2;
        linesPositions.push(x1, y1, z1, x2, y2, z2);
      }

      linesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linesPositions, 3));
      const linesMesh = new THREE.LineSegments(linesGeometry, linesMaterial);
      scene.add(linesMesh);

      let animationId: number;
      const animate = () => {
        animationId = requestAnimationFrame(animate);
        particlesMesh.rotation.y += 0.0002;
        particlesMesh.rotation.x += 0.0001;
        linesMesh.rotation.y -= 0.00015;
        renderer.render(scene, camera);
      };

      animate();

      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };

      window.addEventListener('resize', handleResize);

      return () => {
        cancelled = true;
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationId);
        renderer.dispose();
      };
    })();
  }, [theme]);

  const getStatusColor = (status: string) => {
    const colors = {
      resolved: theme === 'dark' ? 'text-green-300 bg-green-900/30' : 'text-green-700 bg-green-100',
      closed: theme === 'dark' ? 'text-emerald-300 bg-emerald-900/30' : 'text-emerald-700 bg-emerald-100',
      'in-progress': theme === 'dark' ? 'text-blue-300 bg-blue-900/30' : 'text-blue-700 bg-blue-100',
      open: theme === 'dark' ? 'text-amber-300 bg-amber-900/30' : 'text-amber-700 bg-amber-100',
      pending: theme === 'dark' ? 'text-yellow-300 bg-yellow-900/30' : 'text-yellow-700 bg-yellow-100',
      escalated: theme === 'dark' ? 'text-red-300 bg-red-900/30' : 'text-red-700 bg-red-100'
    };
    return colors[status as keyof typeof colors] || 'text-gray-300 bg-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: theme === 'dark' ? 'text-red-300 bg-red-900/30' : 'text-red-700 bg-red-100',
      medium: theme === 'dark' ? 'text-amber-300 bg-amber-900/30' : 'text-amber-700 bg-amber-100',
      low: theme === 'dark' ? 'text-green-300 bg-green-900/30' : 'text-green-700 bg-green-100'
    };
    return colors[priority as keyof typeof colors] || 'text-gray-300 bg-gray-800';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      'open': AlertCircle,
      'pending': Clock,
      'in-progress': PlayCircle,
      'resolved': CheckCircle,
      'closed': Check,
      'escalated': AlertOctagon
    };
    return icons[status as keyof typeof icons] || AlertCircle;
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      'disbursement-delay': Banknote,
      'document-issues': FileText,
      'application-status': FileSearch,
      'officer-behavior': UserX,
      'information-correction': Edit,
      'technical-issues': Zap
    };
    return icons[category as keyof typeof icons] || AlertCircle;
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedGrievance) return;
    // Implementation would go here
    setNewMessage('');
  };

  const handleUpdateStatus = (newStatus: string) => {
    if (!selectedGrievance) return;
    // Implementation would go here
  };

  const handleEscalate = () => {
    if (!selectedGrievance) return;
    // Implementation would go here
  };

  return (
    <div data-theme={theme} className="min-h-screen p-4 lg:p-6 space-y-6 relative overflow-hidden">
      {/* Three.js Canvas Background */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none -z-10"
      />

      {/* Custom Theme Styles */}
      <style jsx global>{`
        [data-theme="dark"] {
          --bg-gradient: radial-gradient(1200px 600px at 10% 10%, rgba(30, 64, 175, 0.08), transparent 8%), 
                         radial-gradient(900px 500px at 90% 90%, rgba(245, 158, 11, 0.06), transparent 8%), 
                         linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%);
          --card-bg: rgba(15, 23, 42, 0.8);
          --card-border: rgba(255, 255, 255, 0.1);
          --nav-bg: rgba(15, 23, 42, 0.95);
          --text-primary: #f1f5f9;
          --text-secondary: #94a3b8;
          --text-muted: #64748b;
          --accent-primary: #06b6d4;
          --accent-secondary: #8b5cf6;
          --glass-bg: rgba(15, 23, 42, 0.6);
          --glass-border: rgba(255, 255, 255, 0.1);
        }

        [data-theme="light"] {
          --bg-gradient: radial-gradient(1200px 600px at 10% 10%, rgba(59, 130, 246, 0.08), transparent 8%), 
                         radial-gradient(900px 500px at 90% 90%, rgba(245, 158, 11, 0.06), transparent 8%), 
                         linear-gradient(180deg, #f8fafc 0%, #f0f9ff 100%);
          --card-bg: rgba(255, 255, 255, 0.9);
          --card-border: rgba(0, 0, 0, 0.08);
          --nav-bg: rgba(255, 255, 255, 0.95);
          --text-primary: #0f172a;
          --text-secondary: #475569;
          --text-muted: #64748b;
          --accent-primary: #fb7185;
          --accent-secondary: #fb923c;
          --glass-bg: rgba(255, 255, 255, 0.7);
          --glass-border: rgba(0, 0, 0, 0.08);
        }

        .theme-text-primary { color: var(--text-primary) !important; }
        .theme-text-secondary { color: var(--text-secondary) !important; }
        .theme-text-muted { color: var(--text-muted) !important; }
        .theme-bg-card { background: var(--card-bg) !important; }
        .theme-border-card { border-color: var(--card-border) !important; }
        .theme-bg-glass { background: var(--glass-bg) !important; }
        .theme-border-glass { border-color: var(--glass-border) !important; }
        
        .accent-gradient {
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)) !important;
        }
        
        .text-accent-gradient {
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .glass-effect {
          backdrop-filter: blur(16px) saturate(180%);
          -webkit-backdrop-filter: blur(16px) saturate(180%);
        }
      `}</style>

      {/* Header Section - Redesigned */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
      >
        <div className="text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl accent-gradient flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold theme-text-primary bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Grievance Hub
              </h1>
              <p className="theme-text-secondary text-lg">Advanced Redressal Management System</p>
            </div>
          </div>
          <p className="theme-text-muted max-w-2xl mx-auto lg:mx-0">
            Manage and resolve beneficiary grievances efficiently under PCR/PoA Acts with real-time tracking
          </p>
        </div>
        
        <div className="flex items-center justify-center lg:justify-end gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Export data"
            className={`px-6 py-3 rounded-xl border flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-offset-1 ${theme === 'light' ? 'bg-white text-gray-800 border-gray-200' : 'theme-bg-glass theme-border-glass'}`} 
          >
            <Download className={`w-5 h-5 ${theme === 'light' ? 'text-gray-800' : ''}`} />
            <span className="font-semibold">Export Data</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 rounded-xl accent-gradient text-white flex items-center gap-3 shadow-xl"
          >
            <Plus className="w-5 h-5" />
            <span className="font-semibold">New Case</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Dashboard Grid - New Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Analytics Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="xl:col-span-1 space-y-6"
        >
          {/* Quick Stats */}
          <div className="theme-bg-card theme-border-glass border rounded-2xl p-6 glass-effect">
            <h3 className="text-lg font-semibold theme-text-primary mb-4">Case Analytics</h3>
            <div className="space-y-4">
              {[
                { label: 'Active Cases', value: stats.open + stats.inProgress, trend: '+8%', icon: AlertCircle, color: 'from-amber-500 to-orange-500' },
                { label: 'Avg Resolution', value: `${stats.avgResolutionTime}d`, trend: '-1.2d', icon: Timer, color: 'from-blue-500 to-cyan-500' },
                { label: 'Satisfaction', value: `${stats.satisfactionRate}%`, trend: '+5%', icon: Star, color: 'from-yellow-500 to-amber-500' },
                { label: 'Escalated', value: stats.escalated, trend: '+2', icon: AlertOctagon, color: 'from-red-500 to-rose-500' }
              ].map((stat, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl theme-bg-glass">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold theme-text-primary">{stat.value}</p>
                      <p className="text-sm theme-text-muted">{stat.label}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold ${stat.trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                    {stat.trend}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="theme-bg-card theme-border-glass border rounded-2xl p-6 glass-effect">
            <h3 className="text-lg font-semibold theme-text-primary mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {[
                { label: 'Assign Cases', icon: UserCheck, color: 'bg-blue-500/20 text-blue-400' },
                { label: 'Bulk Update', icon: Edit, color: 'bg-purple-500/20 text-purple-400' },
                { label: 'Generate Report', icon: FileText, color: 'bg-green-500/20 text-green-400' },
                { label: 'Call Center', icon: PhoneCall, color: 'bg-orange-500/20 text-orange-400' }
              ].map((action, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ x: 4 }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl ${action.color} transition-colors`}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{action.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Category Distribution */}
          <div className="theme-bg-card theme-border-glass border rounded-2xl p-6 glass-effect">
            <h3 className="text-lg font-semibold theme-text-primary mb-4">Case Categories</h3>
            <div className="space-y-3">
              {Object.entries(categoryStats).map(([category, count], idx) => {
                const Icon = getCategoryIcon(category);
                return (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg theme-bg-glass">
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 theme-text-primary" />
                      <span className="text-sm theme-text-primary capitalize">{category.replace('-', ' ')}</span>
                    </div>
                    <span className="text-sm theme-text-muted">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Main Content Area */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="xl:col-span-3 space-y-6"
        >
          {/* View Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold theme-text-primary">
                Active Cases <span className="theme-text-muted text-lg">({filteredGrievances.length})</span>
              </h2>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative flex-1 lg:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 theme-text-muted" />
                <input
                  type="text"
                  placeholder="Search cases..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full lg:w-64 pl-10 pr-4 py-2.5 rounded-xl theme-bg-glass theme-border-glass border theme-text-primary"
                />
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-2 theme-bg-glass rounded-xl p-1">
                {['dashboard', 'list'].map((mode) => (
                  <motion.button
                    key={mode}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setViewMode(mode as 'dashboard' | 'list')}
                    className={`px-4 py-2 rounded-lg capitalize ${
                      viewMode === mode ? 'accent-gradient text-white' : 'theme-text-muted'
                    }`}
                  >
                    {mode}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Cases Grid / List - separate dashboard and list layouts */}
          {viewMode === 'dashboard' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {paginatedGrievances.map((grievance, idx) => (
                <motion.div
                  key={grievance.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.06 }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  className="theme-bg-card theme-border-glass border rounded-2xl p-6 glass-effect cursor-pointer group"
                  onClick={() => setSelectedGrievance(grievance)}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                        <div className="text-sm font-bold">
                          {grievance.beneficiaryName.split(' ').map(n => n[0]).join('')}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-bold theme-text-primary group-hover:text-accent-gradient transition-colors">
                          {grievance.beneficiaryName}
                        </h3>
                        <p className="theme-text-muted text-sm">{grievance.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 ${getPriorityColor(grievance.priority)} text-xs font-bold rounded-full`}>
                        {grievance.priority.toUpperCase()}
                      </span>
                      <button className="p-1 rounded-lg theme-bg-glass hover:theme-bg-card transition-colors text-theme-text-muted">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="theme-text-secondary text-sm mb-4 line-clamp-2">
                    {grievance.description}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-lg font-bold theme-text-primary">{grievance.attachments}</p>
                      <p className="theme-text-muted text-xs">Files</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold theme-text-primary">{grievance.communication.length}</p>
                      <p className="theme-text-muted text-xs">Messages</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold theme-text-primary">L{grievance.escalationLevel}</p>
                      <p className="theme-text-muted text-xs">Escalation</p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t theme-border-glass">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${getStatusColor(grievance.status)}`}>
                      {(() => {
                        const Icon = getStatusIcon(grievance.status);
                        return <Icon className="w-3 h-3" />;
                      })()}
                      {grievance.status.replace('-', ' ').toUpperCase()}
                    </span>
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => { e.stopPropagation(); setSelectedGrievance(grievance); }}
                        className="p-2 rounded-lg theme-bg-glass hover:bg-blue-500/20 transition-colors"
                        aria-label={`View ${grievance.id}`}
                      >
                        <Eye className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => { e.stopPropagation(); /* placeholder for call action */ }}
                        className="p-2 rounded-lg theme-bg-glass hover:bg-green-500/20 transition-colors"
                        aria-label={`Call ${grievance.id}`}
                      >
                        <PhoneCall className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            // List view: stacked cards on mobile, table on desktop
            <div>
              {isMobile ? (
                <div className="space-y-4">
                  {paginatedGrievances.map((g) => (
                    <div key={g.id} className="theme-bg-card theme-border-glass border rounded-2xl p-4 glass-effect">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold theme-text-primary">{g.beneficiaryName}</p>
                          <p className="text-xs theme-text-muted">{g.id} • {g.district}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 text-xs font-bold rounded-full ${getPriorityColor(g.priority)}`}>{g.priority.toUpperCase()}</span>
                          <div className="mt-2 flex items-center justify-end gap-2">
                            <button onClick={() => setSelectedGrievance(g)} className="p-2 rounded-lg theme-bg-glass">
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <p className="theme-text-secondary text-sm mt-2 line-clamp-2">{g.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="theme-bg-card theme-border-glass border rounded-2xl overflow-auto">
                  <table className="min-w-full table-fixed">
                      <thead className={`${theme === 'light' ? 'bg-white/80' : 'bg-gray-800'}`}>
                        <tr>
                          <th className={`px-4 py-3 text-left text-xs font-medium ${theme === 'light' ? 'text-gray-700' : 'theme-text-muted'}`}>ID</th>
                          <th className={`px-4 py-3 text-left text-xs font-medium ${theme === 'light' ? 'text-gray-700' : 'theme-text-muted'}`}>Beneficiary</th>
                          <th className={`px-4 py-3 text-left text-xs font-medium ${theme === 'light' ? 'text-gray-700' : 'theme-text-muted'}`}>District</th>
                          <th className={`px-4 py-3 text-left text-xs font-medium ${theme === 'light' ? 'text-gray-700' : 'theme-text-muted'}`}>Priority</th>
                          <th className={`px-4 py-3 text-left text-xs font-medium ${theme === 'light' ? 'text-gray-700' : 'theme-text-muted'}`}>Status</th>
                          <th className={`px-4 py-3 text-right text-xs font-medium ${theme === 'light' ? 'text-gray-700' : 'theme-text-muted'}`}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedGrievances.map((g) => (
                          <tr key={g.id} className={`border-b ${theme === 'light' ? 'border-gray-200 hover:bg-gray-50' : 'theme-border-glass hover:bg-theme-bg-glass'} transition-colors`}>
                            <td className="px-4 py-3 text-sm theme-text-primary">{g.id}</td>
                            <td className="px-4 py-3 text-sm theme-text-primary">{g.beneficiaryName}</td>
                            <td className="px-4 py-3 text-sm theme-text-muted">{g.district}</td>
                            <td className="px-4 py-3 text-sm"><span className={`px-2 py-1 text-xs font-bold rounded-full ${getPriorityColor(g.priority)}`}>{g.priority.toUpperCase()}</span></td>
                            <td className="px-4 py-3 text-sm theme-text-muted">{g.status}</td>
                            <td className="px-4 py-3 text-sm text-right">
                              <div className="inline-flex items-center gap-2">
                                <button onClick={() => setSelectedGrievance(g)} className={`p-2 rounded-lg ${theme === 'light' ? 'bg-white/70 hover:bg-gray-100' : 'theme-bg-glass'}`} aria-label={`View ${g.id}`}>
                                  <Eye className={`w-4 h-4 ${theme === 'light' ? 'text-gray-800' : ''}`} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                </div>
              )}
            </div>
          )}

          {/* Performance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Resolution Metrics */}
            <motion.div
              whileHover={{ y: -4 }}
              className="theme-bg-card theme-border-glass border rounded-2xl p-6 glass-effect"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold theme-text-primary">Resolution Metrics</h3>
                <Target className="w-5 h-5 theme-text-muted" />
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Within SLA', value: 78, color: 'bg-green-500' },
                  { label: 'Near SLA', value: 15, color: 'bg-amber-500' },
                  { label: 'Breached SLA', value: 7, color: 'bg-red-500' }
                ].map((metric, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${theme === 'light' ? 'text-gray-700' : 'theme-text-primary'}`}>{metric.label}</span>
                      <span className={`text-sm font-semibold ${theme === 'light' ? 'text-gray-800' : 'theme-text-primary'}`}>{metric.value}%</span>
                    </div>
                    <div className={`w-full rounded-full h-2 ${theme === 'light' ? 'bg-gray-200' : 'bg-gray-700'}`}>
                      <div 
                        className={`h-2 rounded-full ${metric.color} transition-all duration-1000`}
                        style={{ width: `${metric.value}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              whileHover={{ y: -4 }}
              className="theme-bg-card theme-border-glass border rounded-2xl p-6 glass-effect"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold theme-text-primary">Recent Updates</h3>
                <Activity className="w-5 h-5 theme-text-muted" />
              </div>
              <div className="space-y-4">
                {[
                  { action: 'Case Resolved', user: 'Officer Sharma', time: '2 min ago', status: 'success' },
                  { action: 'New Escalation', user: 'System', time: '5 min ago', status: 'warning' },
                  { action: 'Document Uploaded', user: 'Beneficiary', time: '10 min ago', status: 'info' },
                  { action: 'Follow-up Required', user: 'Officer Verma', time: '15 min ago', status: 'error' }
                ].map((activity, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-lg theme-bg-glass">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.status === 'success' ? 'bg-green-500' :
                      activity.status === 'warning' ? 'bg-amber-500' :
                      activity.status === 'error' ? 'bg-red-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium theme-text-primary truncate">{activity.action}</p>
                      <p className="text-xs theme-text-muted truncate">{activity.user} • {activity.time}</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 theme-text-muted flex-shrink-0" />
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Enhanced Grievance Detail Modal */}
      <AnimatePresence>
        {selectedGrievance && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedGrievance(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="theme-bg-card theme-border-glass border rounded-3xl w-full max-w-6xl max-h-[95vh] overflow-hidden glass-effect shadow-2xl"
            >
              {/* Enhanced Header */}
              <div className="sticky top-0 theme-bg-card backdrop-blur-xl border-b theme-border-glass p-8">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-16 h-16 rounded-2xl accent-gradient flex items-center justify-center text-white shadow-lg">
                      <Shield className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-3xl font-bold theme-text-primary">{selectedGrievance.id}</h2>
                        <span className="px-4 py-2 bg-amber-500/20 text-amber-400 text-sm font-bold rounded-full">
                          {selectedGrievance.priority.toUpperCase()} PRIORITY
                        </span>
                      </div>
                      <div className="flex items-center gap-4 flex-wrap">
                        <p className="theme-text-muted text-lg">{selectedGrievance.beneficiaryName}</p>
                        <span className="text-sm theme-text-muted">•</span>
                        <p className="theme-text-muted">{selectedGrievance.actType}</p>
                        <span className="text-sm theme-text-muted">•</span>
                        <p className="theme-text-muted">Created: {new Date(selectedGrievance.createdDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedGrievance(null)}
                    className="p-3 rounded-xl theme-bg-glass hover:bg-red-500/20 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Enhanced Tabs */}
              <div className="border-b theme-border-glass bg-gradient-to-r from-transparent via-theme-bg-glass to-transparent">
                <div className="flex overflow-x-auto px-8">
                  {[
                    { id: 'overview', label: 'Overview', icon: Eye },
                    { id: 'communication', label: 'Communication', icon: MessageCircle },
                    { id: 'timeline', label: 'Timeline', icon: Clock },
                    { id: 'documents', label: 'Documents', icon: FileText },
                    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-3 px-6 py-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600 theme-text-primary'
                          : 'border-transparent theme-text-muted hover:theme-text-primary hover:bg-theme-bg-glass'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-8 space-y-8 max-h-[calc(95vh-200px)] overflow-y-auto">
                {/* Content would go here based on active tab */}
                <div className="text-center py-12">
                  <Users className="w-16 h-16 theme-text-muted mx-auto mb-4" />
                  <h3 className="text-2xl font-bold theme-text-primary mb-2">Case Management</h3>
                  <p className="theme-text-muted text-lg">Select a tab to manage different aspects of this case</p>
                </div>
              </div>

              {/* Enhanced Action Buttons */}
              <div className="sticky bottom-0 theme-bg-card backdrop-blur-xl border-t theme-border-glass p-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-4 rounded-xl bg-green-500/20 text-green-300 border border-green-500/30 font-semibold flex items-center justify-center gap-3 hover:bg-green-500/30 transition-colors"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Resolve Case
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-4 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold flex items-center justify-center gap-3 hover:bg-purple-500/30 transition-colors"
                  >
                    <PhoneCall className="w-5 h-5" />
                    Call Now
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-4 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold flex items-center justify-center gap-3 hover:bg-blue-500/30 transition-colors"
                  >
                    <Mail className="w-5 h-5" />
                    Send Email
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-4 rounded-xl theme-bg-glass theme-border-glass border font-semibold flex items-center justify-center gap-3 hover:theme-bg-card transition-colors"
                  >
                    <AlertOctagon className="w-5 h-5" />
                    Escalate
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GrievancePage;