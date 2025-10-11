"use client";
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Grv = { 
  id: string; 
  subject: string; 
  description: string; 
  status: 'open'|'in-progress'|'resolved'; 
  priority: 'low'|'medium'|'high'; 
  date: string;
  category?: string;
};

const STORAGE_KEY = 'nyantra_user_grievances_v1';

export default function GrievancePage() {
  const [list, setList] = useState<Grv[]>([]);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Grv['priority']>('medium');
  const [category, setCategory] = useState('general');
  const [filter, setFilter] = useState<'all' | 'open' | 'in-progress' | 'resolved'>('all');
  const [selectedGrv, setSelectedGrv] = useState<Grv | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    try { 
      const raw = localStorage.getItem(STORAGE_KEY); 
      setList(raw ? JSON.parse(raw) : []); 
    } catch { 
      setList([]); 
    }
  }, []);

  const submitGrievance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;
    
    const grievance: Grv = { 
      id: `GRV-${Date.now()}`, 
      subject: subject.trim(), 
      description: description.trim(), 
      status: 'open', 
      priority, 
      date: new Date().toISOString(),
      category
    };
    
    const next = [grievance, ...list];
    setList(next); 
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSubject(''); 
    setDescription(''); 
    setPriority('medium');
    setCategory('general');
  };

  const setStatus = (id: string, status: Grv['status']) => {
    const next = list.map(l => l.id === id ? {...l, status} : l);
    setList(next); 
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    if (selectedGrv?.id === id) {
      setSelectedGrv({...selectedGrv, status});
    }
  };

  const deleteGrievance = (id: string) => {
    if (!window.confirm('Are you sure you want to delete this grievance?')) return;
    
    const next = list.filter(l => l.id !== id);
    setList(next); 
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    if (selectedGrv?.id === id) setSelectedGrv(null);
  };

  const filteredList = list.filter(g => {
    if (filter !== 'all' && g.status !== filter) return false;
    if (searchTerm && !g.subject.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !g.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const getStatusColor = (status: Grv['status']) => {
    const colors = {
      'open': 'text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300',
      'in-progress': 'text-blue-700 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300',
      'resolved': 'text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-300'
    };
    return colors[status];
  };

  const getPriorityColor = (priority: Grv['priority']) => {
    const colors = {
      'low': 'text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-300',
      'medium': 'text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300',
      'high': 'text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-300'
    };
    return colors[priority];
  };

  const getStatusIcon = (status: Grv['status']) => {
    const icons = {
      'open': (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      'in-progress': (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      'resolved': (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    };
    return icons[status];
  };

  const openCount = list.filter(l => l.status === 'open').length;
  const inProgressCount = list.filter(l => l.status === 'in-progress').length;
  const resolvedCount = list.filter(l => l.status === 'resolved').length;

  return (
    <div className="min-h-screen p-4 md:p-6 theme-bg-primary">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 md:mb-8"
        >
          <h1 className="text-2xl md:text-3xl font-bold theme-text-primary">
            Grievance Portal
          </h1>
          <p className="theme-text-muted mt-2 text-sm md:text-base">
            File and track grievances related to your applications and payments
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Grievance Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="theme-bg-card theme-border-glass border rounded-2xl p-4 md:p-6"
            >
              <h2 className="text-xl font-semibold theme-text-primary mb-4">File New Grievance</h2>
              
              <form onSubmit={submitGrievance} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium theme-text-muted block mb-2">
                      Category
                    </label>
                   <div className="inline-flex items-center flex-nowrap sm:flex-wrap theme-bg-glass border theme-border-glass rounded-full p-1 gap-2 overflow-x-auto sm:overflow-x-visible w-full sm:bg-transparent sm:border-0 sm:rounded-none sm:p-0 sm:gap-3 sm:justify-start">
  {['general', 'application', 'payment', 'technical', 'other'].map(option => {
    const isActive = category === option;
    const label =
      option.charAt(0).toUpperCase() + option.slice(1); // Capitalize first letter

    return (
      <button
        key={option}
        onClick={() => setCategory(option)}
        role="tab"
        aria-pressed={isActive}
    className={`inline-flex items-center justify-center whitespace-nowrap text-sm font-medium rounded-full transition-all duration-200 px-3 sm:px-4 py-2 sm:py-1.5 min-w-[7.5rem] sm:min-w-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${isActive ? 'accent-gradient text-white shadow-md sm:shadow-none sm:ring-1 sm:ring-white/10 sm:scale-105' : 'bg-transparent theme-text-primary hover:theme-bg-glass sm:bg-transparent sm:border sm:border-gray-200 dark:sm:border-gray-700 sm:hover:border-gray-300 dark:sm:hover:border-gray-600'}`}
      >
        {label}
      </button>
    );
  })}
</div>

                  </div>
                  
                  <div>
                    <label className="text-sm font-medium theme-text-muted block mb-2">
                      Priority
                    </label>
                    <div className="inline-flex items-center flex-nowrap sm:flex-wrap theme-bg-glass border theme-border-glass rounded-full p-1 gap-2 overflow-x-auto sm:overflow-x-visible w-full sm:bg-transparent sm:border-0 sm:rounded-none sm:p-0 sm:gap-3 sm:justify-start">
  {['low', 'medium', 'high'].map(option => {
    const isActive = priority === option;
    const label = option.charAt(0).toUpperCase() + option.slice(1); // Capitalize first letter

    return (
      <button
        key={option}
        onClick={() => setPriority(option as Grv['priority'])}
        role="tab"
        aria-pressed={isActive}
    className={`inline-flex items-center justify-center whitespace-nowrap text-sm font-medium rounded-full transition-all duration-200 px-3 sm:px-4 py-2 sm:py-1.5 min-w-[7.5rem] sm:min-w-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${isActive ? 'accent-gradient text-white shadow-md sm:shadow-none sm:ring-1 sm:ring-white/10 sm:scale-105' : 'bg-transparent theme-text-primary hover:theme-bg-glass sm:bg-transparent sm:border sm:border-gray-200 dark:sm:border-gray-700 sm:hover:border-gray-300 dark:sm:hover:border-gray-600'}`}
      >
        {label}
      </button>
    );
  })}
</div>

                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium theme-text-muted block mb-2">
                    Subject *
                  </label>
                  <input 
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="Brief description of your grievance"
                    className="w-full px-4 py-3 rounded-lg border theme-border-glass theme-bg-input theme-text-primary placeholder-theme-muted focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium theme-text-muted block mb-2">
                    Description *
                  </label>
                  <textarea 
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Please provide detailed information about your grievance..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border theme-border-glass theme-bg-input theme-text-primary placeholder-theme-muted focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-vertical"
                    required
                  />
                </div>

                <button 
                  type="submit"
                  disabled={!subject.trim() || !description.trim()}
                  className="w-full accent-gradient text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Submit Grievance
                </button>
              </form>
            </motion.div>

            {/* Grievances List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="theme-bg-card theme-border-glass border rounded-2xl p-4 md:p-6"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                <h3 className="text-lg font-semibold theme-text-primary">
                  Your Grievances ({filteredList.length})
                </h3>
                
                <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
                  <div className="relative flex-1 sm:flex-none sm:w-64">
                    <input
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      placeholder="Search grievances..."
                      className="w-full px-4 py-2 pl-10 rounded-lg border theme-border-glass theme-bg-input theme-text-primary placeholder-theme-muted focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <svg className="absolute left-3 top-2.5 w-4 h-4 theme-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  
                  <div className="relative w-full sm:w-auto">
                    <div className="inline-flex items-center flex-nowrap sm:flex-wrap theme-bg-glass border theme-border-glass rounded-full p-1 gap-2 overflow-x-auto sm:overflow-x-visible w-full sm:w-auto sm:bg-transparent sm:border-0 sm:rounded-none sm:p-0 sm:gap-3 sm:justify-end">
  {['all', 'open', 'in-progress', 'resolved'].map(option => {
    const isActive = filter === option;
    const label =
      option === 'all' ? 'All Status' :
      option === 'in-progress' ? 'In Progress' :
      option.charAt(0).toUpperCase() + option.slice(1);

    return (
      <button
        key={option}
        onClick={() => setFilter(option as 'all' | 'open' | 'in-progress' | 'resolved')}
        role="tab"
        aria-pressed={isActive}
    className={`inline-flex items-center justify-center whitespace-nowrap text-sm font-medium rounded-full transition-all duration-200 px-3 sm:px-4 py-2 sm:py-1.5 min-w-[7.5rem] sm:min-w-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${isActive ? 'accent-gradient text-white shadow-md sm:shadow-none sm:ring-1 sm:ring-white/10 sm:scale-105' : 'bg-transparent theme-text-primary hover:theme-bg-glass sm:bg-transparent sm:border sm:border-gray-200 dark:sm:border-gray-700 sm:hover:border-gray-300 dark:sm:hover:border-gray-600'}`}
      >
        {label}
      </button>
    );
  })}
</div>

                    
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <AnimatePresence>
                  {filteredList.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-12 theme-bg-glass rounded-xl border theme-border-glass"
                    >
                      <div className="mx-auto w-16 h-16 theme-bg-primary rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 theme-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="theme-text-muted mb-2">
                        {list.length === 0 ? 'No grievances filed yet' : 'No matching grievances found'}
                      </p>
                      <p className="text-sm theme-text-muted">
                        {list.length === 0 
                          ? "File your first grievance using the form above." 
                          : "Try adjusting your search or filter criteria."}
                      </p>
                    </motion.div>
                  ) : (
                    filteredList.map((grievance, index) => (
                      <motion.div
                        key={grievance.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 rounded-xl border theme-border-glass cursor-pointer transition-all hover:scale-[1.02] ${
                          selectedGrv?.id === grievance.id 
                            ? 'accent-gradient text-white' 
                            : 'theme-bg-glass hover:theme-border-primary'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div 
                            className="flex-1 min-w-0"
                            onClick={() => setSelectedGrv(grievance)}
                          >
                            <div className="flex items-start gap-3 mb-2">
                              <div className="flex-1 min-w-0">
                                <h4 className={`font-semibold mb-1 ${
                                  selectedGrv?.id === grievance.id ? 'text-white' : 'theme-text-primary'
                                }`}>
                                  {grievance.subject}
                                </h4>
                                <div className="flex flex-wrap gap-2 mb-2">
                                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(grievance.status)}`}>
                                    {getStatusIcon(grievance.status)}
                                    {grievance.status}
                                  </span>
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(grievance.priority)}`}>
                                    {grievance.priority} priority
                                  </span>
                                  {grievance.category && (
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                      selectedGrv?.id === grievance.id 
                                        ? 'bg-white/20 text-white' 
                                        : 'theme-bg-card theme-text-muted'
                                    }`}>
                                      {grievance.category}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <p className={`text-sm line-clamp-2 ${
                              selectedGrv?.id === grievance.id ? 'text-white/90' : 'theme-text-muted'
                            }`}>
                              {grievance.description}
                            </p>
                            
                            <div className={`text-xs mt-2 ${
                              selectedGrv?.id === grievance.id ? 'text-white/80' : 'theme-text-muted'
                            }`}>
                              Filed: {new Date(grievance.date).toLocaleString()}
                            </div>
                          </div>
                          
                          <div className="flex sm:flex-col gap-2 sm:gap-1">
                            {grievance.status !== 'resolved' && (
                              <>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setStatus(grievance.id, 'in-progress'); }}
                                  className="p-2 rounded-lg theme-bg-card theme-text-muted hover:theme-border-primary transition-all hover:scale-110"
                                  title="Mark in progress"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setStatus(grievance.id, 'resolved'); }}
                                  className="p-2 rounded-lg theme-bg-card text-green-600 hover:theme-border-primary transition-all hover:scale-110"
                                  title="Resolve"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </button>
                              </>
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteGrievance(grievance.id); }}
                              className="p-2 rounded-lg theme-bg-card text-red-600 hover:theme-border-primary transition-all hover:scale-110"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Summary Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="theme-bg-card theme-border-glass border rounded-2xl p-4 md:p-6"
            >
              <h3 className="font-semibold theme-text-primary mb-4">Grievance Summary</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="theme-bg-glass rounded-xl p-4 border theme-border-glass text-center">
                  <div className="text-2xl font-bold theme-text-primary mb-1">{list.length}</div>
                  <div className="text-xs theme-text-muted">Total</div>
                </div>
                <div className="theme-bg-glass rounded-xl p-4 border theme-border-glass text-center">
                  <div className="text-2xl font-bold text-amber-600 mb-1">{openCount}</div>
                  <div className="text-xs theme-text-muted">Urgent</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-lg theme-bg-glass border theme-border-glass">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm theme-text-muted">Open</span>
                    <span className="text-sm font-semibold theme-text-primary">{openCount}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-amber-500 h-2 rounded-full" 
                      style={{ width: `${list.length ? (openCount / list.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="p-3 rounded-lg theme-bg-glass border theme-border-glass">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm theme-text-muted">In Progress</span>
                    <span className="text-sm font-semibold theme-text-primary">{inProgressCount}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${list.length ? (inProgressCount / list.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="p-3 rounded-lg theme-bg-glass border theme-border-glass">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm theme-text-muted">Resolved</span>
                    <span className="text-sm font-semibold theme-text-primary">{resolvedCount}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${list.length ? (resolvedCount / list.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Selected Grievance Details */}
            <AnimatePresence>
              {selectedGrv && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="theme-bg-card theme-border-glass border rounded-2xl p-4 md:p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold theme-text-primary">Grievance Details</h4>
                    <button
                      onClick={() => setSelectedGrv(null)}
                      className="p-1 rounded-lg theme-text-muted hover:theme-bg-glass transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="text-sm theme-text-muted mb-1">Subject</div>
                      <div className="font-medium theme-text-primary">{selectedGrv.subject}</div>
                    </div>

                    <div>
                      <div className="text-sm theme-text-muted mb-1">Description</div>
                      <div className="theme-text-primary text-sm leading-relaxed">
                        {selectedGrv.description}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm theme-text-muted mb-1">Status</div>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedGrv.status)}`}>
                          {getStatusIcon(selectedGrv.status)}
                          {selectedGrv.status}
                        </span>
                      </div>
                      
                      <div>
                        <div className="text-sm theme-text-muted mb-1">Priority</div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedGrv.priority)}`}>
                          {selectedGrv.priority}
                        </span>
                      </div>
                    </div>

                    {selectedGrv.category && (
                      <div>
                        <div className="text-sm theme-text-muted mb-1">Category</div>
                        <div className="font-medium theme-text-primary capitalize">
                          {selectedGrv.category}
                        </div>
                      </div>
                    )}

                    <div className="pt-2 border-t theme-border-glass">
                      <div className="text-sm theme-text-muted mb-1">Grievance ID</div>
                      <div className="font-mono text-xs theme-text-primary bg-theme-glass px-2 py-1 rounded">
                        {selectedGrv.id}
                      </div>
                      <div className="text-xs theme-text-muted mt-2">
                        Filed: {new Date(selectedGrv.date).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}