"use client";
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Feedback = {
  id: string;
  subject: string;
  message: string;
  type: 'grievance' | 'feedback';
  status: 'open' | 'in-review' | 'resolved';
  createdAt: string;
  priority?: 'low' | 'medium' | 'high';
};

const STORAGE_KEY = 'nyantra_user_feedback_v1';

export default function FeedbackPage() {
  const [list, setList] = useState<Feedback[]>([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<Feedback['type']>('feedback');
  const [priority, setPriority] = useState<Feedback['priority']>('medium');
  const [filter, setFilter] = useState<'all' | 'open' | 'in-review' | 'resolved'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'grievance' | 'feedback'>('all');
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setList(raw ? JSON.parse(raw).slice().reverse() : []);
    } catch {
      setList([]);
    }
  }, []);

  const persist = (items: Feedback[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice().reverse()));
    setList(items.slice().reverse());
  };

  const submitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      alert('Please provide subject and message');
      return;
    }
    
    const fb: Feedback = { 
      id: `FB-${Date.now()}`, 
      subject: subject.trim(), 
      message: message.trim(), 
      type, 
      status: 'open', 
      createdAt: new Date().toISOString(),
      priority: type === 'grievance' ? priority : undefined
    };
    
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const prev: Feedback[] = raw ? JSON.parse(raw) : [];
      const next = [fb, ...prev];
      persist(next);
      setSubject(''); 
      setMessage(''); 
      setType('feedback');
      setPriority('medium');
    } catch (e) {
      console.error(e);
    }
  };

  const setStatus = (id: string, status: Feedback['status']) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const prev: Feedback[] = raw ? JSON.parse(raw) : [];
      const next = prev.map(p => p.id === id ? { ...p, status } : p);
      persist(next);
      if (selectedFeedback?.id === id) {
        setSelectedFeedback({...selectedFeedback, status});
      }
    } catch { }
  };

  const deleteFeedback = (id: string) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) return;
    
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const prev: Feedback[] = raw ? JSON.parse(raw) : [];
      const next = prev.filter(p => p.id !== id);
      persist(next);
      if (selectedFeedback?.id === id) setSelectedFeedback(null);
    } catch { }
  };

  const filteredList = list.filter(f => {
    if (filter !== 'all' && f.status !== filter) return false;
    if (typeFilter !== 'all' && f.type !== typeFilter) return false;
    if (searchTerm && !f.subject.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !f.message.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const getStatusColor = (status: Feedback['status']) => {
    const colors = {
      'open': 'text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300',
      'in-review': 'text-blue-700 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300',
      'resolved': 'text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-300'
    };
    return colors[status];
  };

  const getTypeColor = (type: Feedback['type']) => {
    const colors = {
      'feedback': 'text-purple-700 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300',
      'grievance': 'text-orange-700 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-300'
    };
    return colors[type];
  };

  const getPriorityColor = (priority?: Feedback['priority']) => {
    const colors = {
      'low': 'text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-300',
      'medium': 'text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300',
      'high': 'text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-300'
    };
    return priority ? colors[priority] : '';
  };

  const getStatusIcon = (status: Feedback['status']) => {
    const icons = {
      'open': (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      'in-review': (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
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

  const openCount = list.filter(f => f.status === 'open').length;
  const inReviewCount = list.filter(f => f.status === 'in-review').length;
  const resolvedCount = list.filter(f => f.status === 'resolved').length;
  const grievanceCount = list.filter(f => f.type === 'grievance').length;
  const feedbackCount = list.filter(f => f.type === 'feedback').length;

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
            Feedback & Grievance Portal
          </h1>
          <p className="theme-text-muted mt-2 text-sm md:text-base">
            Submit feedback or report grievances. This demo stores items locally for preview.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Feedback Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="theme-bg-card theme-border-glass border rounded-2xl p-4 md:p-6"
            >
              <h2 className="text-xl font-semibold theme-text-primary mb-4">Submit New</h2>
              
              <form onSubmit={submitFeedback} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium theme-text-muted block mb-2">
                      Type *
                    </label>
                    <div className="relative">
                      <select 
                        value={type} 
                        onChange={e => setType(e.target.value as 'feedback' | 'grievance')} 
                        className="w-full px-4 py-3 pr-10 rounded-lg border theme-border-glass theme-bg-input theme-text-primary appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        <option value="feedback">General Feedback</option>
                        <option value="grievance">Grievance</option>
                      </select>
                      <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 theme-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  
                  {type === 'grievance' && (
                    <div>
                      <label className="text-sm font-medium theme-text-muted block mb-2">
                        Priority
                      </label>
                      <div className="relative">
                        <select 
                          value={priority}
                          onChange={e => setPriority(e.target.value as Feedback['priority'])}
                          className="w-full px-4 py-3 pr-10 rounded-lg border theme-border-glass theme-bg-input theme-text-primary appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                        <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 theme-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium theme-text-muted block mb-2">
                    Subject *
                  </label>
                  <input 
                    value={subject} 
                    onChange={e => setSubject(e.target.value)} 
                    placeholder="Brief summary of your feedback or grievance"
                    className="w-full px-4 py-3 rounded-lg border theme-border-glass theme-bg-input theme-text-primary placeholder-theme-muted focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium theme-text-muted block mb-2">
                    Message *
                  </label>
                  <textarea 
                    value={message} 
                    onChange={e => setMessage(e.target.value)} 
                    placeholder="Please provide detailed information..."
                    rows={4} 
                    className="w-full px-4 py-3 rounded-lg border theme-border-glass theme-bg-input theme-text-primary placeholder-theme-muted focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-vertical"
                    required
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button 
                    type="submit"
                    disabled={!subject.trim() || !message.trim()}
                    className="flex-1 accent-gradient text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Submit {type === 'grievance' ? 'Grievance' : 'Feedback'}
                  </button>
                  
                  <button 
                    type="button"
                    onClick={() => { setSubject(''); setMessage(''); setType('feedback'); setPriority('medium'); }}
                    className="px-6 py-3 border theme-border-glass theme-text-muted hover:theme-bg-glass font-medium rounded-lg transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </form>
            </motion.div>

            {/* Feedback List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="theme-bg-card theme-border-glass border rounded-2xl p-4 md:p-6"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                <h3 className="text-lg font-semibold theme-text-primary">
                  Your Submissions ({filteredList.length})
                </h3>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1 sm:flex-none sm:w-64">
                    <input
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      placeholder="Search submissions..."
                      className="w-full px-4 py-2 pl-10 rounded-lg border theme-border-glass theme-bg-input theme-text-primary placeholder-theme-muted focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <svg className="absolute left-3 top-2.5 w-4 h-4 theme-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  
                  <div className="flex gap-2">
                    <div className="relative">
                      <select 
                        value={typeFilter}
                        onChange={e => setTypeFilter(e.target.value as any)}
                        className="px-4 py-2 pr-8 rounded-lg border theme-border-glass theme-bg-input theme-text-primary appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        <option value="all">All Types</option>
                        <option value="feedback">Feedback</option>
                        <option value="grievance">Grievance</option>
                      </select>
                      <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 theme-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    
                    <div className="relative">
                      <select 
                        value={filter}
                        onChange={e => setFilter(e.target.value as any)}
                        className="px-4 py-2 pr-8 rounded-lg border theme-border-glass theme-bg-input theme-text-primary appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        <option value="all">All Status</option>
                        <option value="open">Open</option>
                        <option value="in-review">In Review</option>
                        <option value="resolved">Resolved</option>
                      </select>
                      <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 theme-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
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
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                      </div>
                      <p className="theme-text-muted mb-2">
                        {list.length === 0 ? 'No submissions yet' : 'No matching submissions found'}
                      </p>
                      <p className="text-sm theme-text-muted">
                        {list.length === 0 
                          ? "Submit your first feedback or grievance using the form above." 
                          : "Try adjusting your search or filter criteria."}
                      </p>
                    </motion.div>
                  ) : (
                    filteredList.map((feedback, index) => (
                      <motion.div
                        key={feedback.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 rounded-xl border theme-border-glass cursor-pointer transition-all hover:scale-[1.02] ${
                          selectedFeedback?.id === feedback.id 
                            ? 'accent-gradient text-white' 
                            : 'theme-bg-glass hover:theme-border-primary'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div 
                            className="flex-1 min-w-0"
                            onClick={() => setSelectedFeedback(feedback)}
                          >
                            <div className="flex items-start gap-3 mb-2">
                              <div className="flex-1 min-w-0">
                                <h4 className={`font-semibold mb-1 ${
                                  selectedFeedback?.id === feedback.id ? 'text-white' : 'theme-text-primary'
                                }`}>
                                  {feedback.subject}
                                </h4>
                                <div className="flex flex-wrap gap-2 mb-2">
                                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(feedback.type)}`}>
                                    {feedback.type}
                                  </span>
                                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(feedback.status)}`}>
                                    {getStatusIcon(feedback.status)}
                                    {feedback.status}
                                  </span>
                                  {feedback.priority && (
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(feedback.priority)}`}>
                                      {feedback.priority} priority
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <p className={`text-sm line-clamp-2 ${
                              selectedFeedback?.id === feedback.id ? 'text-white/90' : 'theme-text-muted'
                            }`}>
                              {feedback.message}
                            </p>
                            
                            <div className={`text-xs mt-2 ${
                              selectedFeedback?.id === feedback.id ? 'text-white/80' : 'theme-text-muted'
                            }`}>
                              Submitted: {new Date(feedback.createdAt).toLocaleString()}
                            </div>
                          </div>
                          
                          <div className="flex sm:flex-col gap-2 sm:gap-1">
                            {feedback.status !== 'in-review' && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setStatus(feedback.id, 'in-review'); }}
                                className="p-2 rounded-lg theme-bg-card theme-text-muted hover:theme-border-primary transition-all hover:scale-110"
                                title="Mark in review"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </button>
                            )}
                            {feedback.status !== 'resolved' && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setStatus(feedback.id, 'resolved'); }}
                                className="p-2 rounded-lg theme-bg-card text-green-600 hover:theme-border-primary transition-all hover:scale-110"
                                title="Resolve"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteFeedback(feedback.id); }}
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
              <h3 className="font-semibold theme-text-primary mb-4">Submission Summary</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="theme-bg-glass rounded-xl p-4 border theme-border-glass text-center">
                  <div className="text-2xl font-bold theme-text-primary mb-1">{list.length}</div>
                  <div className="text-xs theme-text-muted">Total</div>
                </div>
                <div className="theme-bg-glass rounded-xl p-4 border theme-border-glass text-center">
                  <div className="text-2xl font-bold text-orange-600 mb-1">{grievanceCount}</div>
                  <div className="text-xs theme-text-muted">Grievances</div>
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
                    <span className="text-sm theme-text-muted">In Review</span>
                    <span className="text-sm font-semibold theme-text-primary">{inReviewCount}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${list.length ? (inReviewCount / list.length) * 100 : 0}%` }}
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

            {/* Selected Feedback Details */}
            <AnimatePresence>
              {selectedFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="theme-bg-card theme-border-glass border rounded-2xl p-4 md:p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold theme-text-primary">Submission Details</h4>
                    <button
                      onClick={() => setSelectedFeedback(null)}
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
                      <div className="font-medium theme-text-primary">{selectedFeedback.subject}</div>
                    </div>

                    <div>
                      <div className="text-sm theme-text-muted mb-1">Message</div>
                      <div className="theme-text-primary text-sm leading-relaxed">
                        {selectedFeedback.message}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm theme-text-muted mb-1">Type</div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(selectedFeedback.type)}`}>
                          {selectedFeedback.type}
                        </span>
                      </div>
                      
                      <div>
                        <div className="text-sm theme-text-muted mb-1">Status</div>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedFeedback.status)}`}>
                          {getStatusIcon(selectedFeedback.status)}
                          {selectedFeedback.status}
                        </span>
                      </div>
                    </div>

                    {selectedFeedback.priority && (
                      <div>
                        <div className="text-sm theme-text-muted mb-1">Priority</div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedFeedback.priority)}`}>
                          {selectedFeedback.priority}
                        </span>
                      </div>
                    )}

                    <div className="pt-2 border-t theme-border-glass">
                      <div className="text-sm theme-text-muted mb-1">Submission ID</div>
                      <div className="font-mono text-xs theme-text-primary bg-theme-glass px-2 py-1 rounded">
                        {selectedFeedback.id}
                      </div>
                      <div className="text-xs theme-text-muted mt-2">
                        Submitted: {new Date(selectedFeedback.createdAt).toLocaleString()}
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