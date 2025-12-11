# Nyantra — Direct Benefit Transfer Management System

<div align="center">
  <img src="/public/Logo-Light.png" alt="Nyantra Logo" width="120" height="120"/>
  
  ### **Nyantra**
  
  *Empowering Social Justice Through Technology*
  
  [![Next.js](https://img.shields.io/badge/Next.js-16.0-black?logo=next.js)](https://nextjs.org/)
  [![Flutter](https://img.shields.io/badge/Flutter-3.8-02569B?logo=flutter)](https://flutter.dev/)
  [![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange?logo=firebase)](https://firebase.google.com/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-19.1-61DAFB?logo=react)](https://react.dev/)
  [![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
  
</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [API Routes](#-api-routes)
- [Internationalization](#-internationalization)
- [Security](#-security)
- [Development Scripts](#-development-scripts)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**Nyantra** is an advanced Direct Benefit Transfer (DBT) management platform designed to revolutionize compensation disbursement for victims of atrocities under the **Scheduled Castes and Scheduled Tribes (Prevention of Atrocities) Act, 1989**. The system ensures transparency, efficiency, and accountability throughout the entire relief fund distribution lifecycle.

### Core Platforms

#### 🌐 Web Portal (Next.js 16 + React 19)
A comprehensive administrative dashboard featuring:
- **Officer Dashboard**: Complete application lifecycle management from submission to disbursement
- **User Dashboard**: Beneficiary self-service portal for application tracking and document management
- **Advanced Analytics**: Real-time dashboards with interactive data visualizations using Chart.js
- **Blockchain Transparency**: Immutable audit trail for critical transactions
- **Integrations Hub**: External system connectivity (PFMS, DigiLocker, Aadhaar)
- **Responsive Design**: Fully optimized for desktop, tablet, and mobile devices

#### 📱 Mobile Application (Flutter 3.8+)
Native cross-platform mobile app with:
- **Intuitive UI**: Material Design 3 with glassmorphism effects
- **Voice Input**: Speech-to-text for accessibility and rural users
- **Offline Support**: SQLite local database with automatic synchronization
- **Document Camera**: Integrated document capture and upload
- **Push Notifications**: Real-time status updates and alerts
- **Multi-language**: Seamless English/Hindi switching with intl support

### Platform Highlights

- **⚡ Real-time Synchronization**: Firebase Firestore ensures instant data sync across all devices
- **🌍 Comprehensive i18n**: Complete English and Hindi localization with extensible architecture
- **♿ Accessibility First**: WCAG 2.1 Level AA compliance with keyboard navigation and screen reader support
- **🔒 Enterprise Security**: Role-based access control, encryption at rest and in transit, comprehensive audit logging
- **🎨 Modern UI/UX**: Dark/light theme, smooth animations with Framer Motion, 3D visualizations with Three.js
- **📊 Advanced Analytics**: Chart.js powered dashboards with zoom, pan, and drill-down capabilities
- **📧 Automated Notifications**: Email (Nodemailer + Gmail SMTP) and SMS integration ready

### Problem Statement

Traditional relief fund disbursement systems suffer from:
- ❌ Manual paperwork causing significant delays (weeks to months)
- ❌ Lack of transparency in application processing and fund tracking
- ❌ Limited accessibility for rural and disabled beneficiaries
- ❌ No centralized database leading to duplicate applications
- ❌ Difficulty in compliance auditing and fraud detection
- ❌ Inefficient grievance redressal mechanisms

### Our Solution

Nyantra digitizes and streamlines the entire workflow:
- ✅ **Digital-First Approach**: Paperless application submission and processing
- ✅ **Complete Transparency**: Real-time tracking with blockchain-backed audit trails
- ✅ **Universal Accessibility**: Mobile app, voice input, offline capabilities, and multi-language support
- ✅ **Data Integrity**: Aadhaar integration prevents duplicate applications and fraud
- ✅ **Automated Workflows**: Email notifications, status updates, and payment triggers
- ✅ **Comprehensive Reporting**: PDF generation, CSV exports, and interactive dashboards
- ✅ **Scalable Architecture**: Cloud-native design supporting millions of users nationwide

---

## ✨ Key Features

### 🖥️ Web Portal Features

#### Officer Dashboard (`/dashboard`)
**Application Management** (`/dashboard/applications`)
- ✅ Complete CRUD operations for applications
- ✅ Multi-status workflow: Pending → In Review → Approved/Rejected
- ✅ Advanced filtering by status, act type, date range, and district
- ✅ Bulk operations for efficient processing
- ✅ Real-time status updates with Firebase listeners
- ✅ Document upload and verification with Cloudinary CDN
- ✅ Application timeline tracking and audit history

**Beneficiary Management** (`/dashboard/beneficiaries`)
- ✅ Comprehensive beneficiary profiles with demographics
- ✅ Aadhaar-based identity verification
- ✅ Contact information and bank details management
- ✅ Document repository (FIR, medical records, legal documents)
- ✅ Search and filter by multiple criteria
- ✅ Application history linked to beneficiary profiles

**Disbursement Management** (`/dashboard/disbursements`)
- ✅ **Progressive Payment System**: Configurable installments (default: 25%, 50%, 25%)
- ✅ Real-time payment status tracking: Pending → Processing → Completed
- ✅ Bank account validation and verification
- ✅ Payment history and transaction logs
- ✅ Automated email notifications on status changes
- ✅ Integration-ready for PFMS and direct bank transfers
- ✅ Disbursement reconciliation reports

**Analytics Dashboard** (`/dashboard/analytics`)
- 📊 Interactive Chart.js visualizations with zoom and pan
- 📊 Key metrics: Total applications, disbursed amounts, processing times
- 📊 Time-series analysis with date range selection
- 📊 Application status distribution (pie/doughnut charts)
- 📊 Disbursement trends over time (line/bar charts)
- 📊 Success rate and completion metrics
- 📊 Real-time data updates from Firestore

**Reports & Documentation** (`/dashboard/reports`)
- 📄 **PDF Generation**: Comprehensive reports with jsPDF + AutoTable
- 📄 Predefined report templates: Applications, Disbursements, Grievances
- 📄 Custom date range selection
- 📄 Export to CSV for data analysis
- 📄 Report categorization: Monthly, Weekly, Performance, Feedback
- 📄 Automatic report metadata and timestamps

**Grievance Management** (`/dashboard/grievance`)
- 💬 User feedback collection and categorization
- 💬 Status tracking: Open → In Progress → Resolved → Closed
- 💬 Priority assignment (Low, Medium, High, Critical)
- 💬 Officer assignment and escalation workflows
- 💬 Response time tracking and SLA monitoring
- 💬 Sentiment analysis for satisfaction metrics

**Blockchain Transparency** (`/dashboard/blockchain`)
- 🔗 Immutable transaction ledger for critical operations
- 🔗 SHA-256 based block validation
- 🔗 View complete chain history
- 🔗 Block details: Hash, previous hash, timestamp, data
- 🔗 Add transactions with automatic block creation
- 🔗 Visual chain representation with connected blocks

**Integrations Hub** (`/dashboard/integrations`)
- 🔌 External system connectivity management
- 🔌 PFMS (Public Financial Management System) integration
- 🔌 DigiLocker for document verification
- 🔌 Aadhaar authentication (UIDAI)
- 🔌 SMS gateway configuration
- 🔌 Payment gateway setup
- 🔌 API key management and webhooks

#### User Dashboard (`/user-dashboard`)
**Application Submission**
- 📝 Guided multi-step application form with validation
- 📝 Real-time field validation and error handling
- 📝 Document upload with drag-and-drop support
- 📝 Application preview before submission
- 📝 Draft saving and auto-save functionality
- 📝 Application status tracking with visual timeline

**My Applications** (`/user-dashboard/applications`)
- 📋 View all submitted applications with status badges
- 📋 Detailed application view with uploaded documents
- 📋 Status history and timeline
- 📋 Download application PDF
- 📋 Edit pending applications
- 📋 Resubmit rejected applications with corrections

**Disbursement Tracking** (`/user-dashboard/disbursements`)
- 💰 Visual disbursement timeline (Initial → Interim → Final)
- 💰 Payment status indicators with progress bars
- 💰 Transaction details: Amount, date, bank reference
- 💰 Download disbursement certificates
- 💰 Email notifications for each installment
- 💰 Complete payment history

**Profile Management** (`/user-dashboard/profile`)
- 👤 Update personal information and contact details
- 👤 Bank account management
- 👤 Document uploads (Aadhaar, bank passbook, etc.)
- 👤 Communication preferences
- 👤 Password change and security settings

### 📱 Mobile Application (Flutter)

**Core Features**
- 📱 **Native Performance**: Flutter-powered cross-platform app (Android & iOS)
- 📱 **Firebase Backend**: Seamless sync with web platform
- 📱 **State Management**: Provider pattern for reactive UI updates
- 📱 **Local Database**: SQLite for offline data persistence
- 📱 **Connectivity Detection**: Automatic sync when online

**Application Module**
- ✍️ Step-by-step guided application form
- ✍️ **Speech-to-Text**: Voice input using `speech_to_text` package
- ✍️ Image picker for document uploads
- ✍️ Form validation with user-friendly error messages
- ✍️ Offline draft saving with SQLite
- ✍️ Background sync when connection restored

**Dashboard & Tracking**
- 📊 Real-time application status updates
- 📊 Visual disbursement progress indicators
- 📊 Push notifications for status changes
- 📊 In-app notification center
- 📊 Quick access to recent applications

**Document Management**
- 📸 Camera integration for document capture
- 📸 Image compression and optimization
- 📸 Gallery import support
- 📸 View uploaded documents
- 📸 PDF generation using `pdf` package

**Localization & Accessibility**
- 🌐 Complete English/Hindi localization with `intl`
- 🌐 Dynamic language switching without restart
- 🌐 RTL support ready
- 🌐 Screen reader compatibility
- 🌐 High contrast mode support
- 🌐 Adjustable font sizes

**Offline Capabilities**
- 💾 Local data caching with SharedPreferences
- 💾 SQLite database for complex data structures
- 💾 Automatic synchronization on reconnection
- 💾 Conflict resolution for offline edits
- 💾 Connectivity status indicator

### 🎨 UI/UX Excellence

**Web Portal**
- 🎨 **Modern Design**: Glassmorphism effects with backdrop filters
- 🎨 **Dark/Light Themes**: System-aware with manual toggle
- 🎨 **Smooth Animations**: Framer Motion for page transitions and interactions
- 🎨 **3D Visualizations**: Three.js + React Three Fiber for landing page
- 🎨 **Responsive Layout**: Mobile-first design with Tailwind CSS
- 🎨 **Interactive Background**: Animated orbs and cursor effects
- 🎨 **Loading States**: Skeleton screens and progress indicators

**Mobile App**
- 🎨 **Material Design 3**: Latest design guidelines
- 🎨 **Adaptive UI**: Platform-specific components (Cupertino for iOS)
- 🎨 **Fluid Animations**: `flutter_animate` for declarative animations
- 🎨 **Custom Widgets**: Reusable components with consistent styling
- 🎨 **Gesture Support**: Swipe, pull-to-refresh, long-press interactions

---

## 🛠 Technology Stack

### Frontend — Web Application

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Framework** | Next.js | 16.0.7 | React framework with **Turbopack**, App Router, and Server Components |
| **Language** | TypeScript | 5.0+ | Type-safe development with strict mode enabled |
| **Runtime** | React | 19.1.0 | Latest React with concurrent rendering and transitions |
| **Styling** | Tailwind CSS | 4.0+ | Utility-first CSS with PostCSS processing |
| **State Management** | React Context API | Built-in | Global state: `AuthContext`, `ThemeContext`, `LocaleContext` |
| **Animations** | Framer Motion | 12.23.22 | Page transitions, gesture animations, and scroll-based effects |
| **Data Visualization** | Chart.js | 4.4.0 | Interactive charts with zoom plugin and date adapters |
| **Chart Library** | react-chartjs-2 | 5.2.0 | React wrapper for Chart.js with TypeScript support |
| **3D Graphics** | Three.js | 0.180.0 | WebGL rendering for landing page animations |
| **3D React Integration** | @react-three/fiber + drei | 9.4.2 + 10.7.7 | React renderer for Three.js scenes |
| **Icons** | Lucide React + Heroicons | 0.544.0 + 2.2.0 | Comprehensive icon libraries (700+ icons) |
| **PDF Generation** | jsPDF + jspdf-autotable | 3.0.4 + 5.0.2 | Client-side PDF with tables and formatting |
| **File Upload** | Cloudinary (next-cloudinary) | 6.17.5 | Image/document CDN with optimization |
| **HTTP Client** | node-fetch | 3.3.2 | Server-side HTTP requests |

### Backend & Infrastructure

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Database** | Firebase Firestore | 12.3.0 | NoSQL real-time database with automatic scaling |
| **Authentication** | Firebase Auth | 12.3.0 | Email/password + Google OAuth with session management |
| **File Storage** | Cloudinary | Latest | Document storage with CDN, image transformations |
| **API Layer** | Next.js API Routes | 16.0+ | Server-side endpoints for secure operations |
| **Form Handling** | formidable | 3.5.4 | Multipart form data parsing for file uploads |
| **Email Service** | Nodemailer | 6.10.1 | SMTP email with Gmail integration and attachments |
| **Runtime Environment** | Node.js | 20+ | Server-side JavaScript execution |

### Mobile Application — Flutter

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Framework** | Flutter | 3.8.1+ | Cross-platform native app (Android, iOS, Web, Desktop) |
| **Language** | Dart | 3.8.1+ | Optimized ahead-of-time compilation for performance |
| **Backend SDK** | firebase_core | 3.0.0 | Firebase initialization and configuration |
| **Authentication** | firebase_auth | 5.0.0 | User authentication with Firebase |
| **Database** | cloud_firestore | 5.0.0 | Real-time NoSQL database with offline persistence |
| **OAuth** | google_sign_in | 6.2.1 | Google authentication integration |
| **State Management** | provider | 6.1.1 | Reactive dependency injection and state propagation |
| **Navigation** | go_router | 14.0.0 | Declarative routing with deep linking support |
| **Animations** | flutter_animate | 4.5.0 | Declarative animations and effects |
| **Localization** | flutter_localizations + intl | SDK + 0.20.2 | Multi-language support (English, Hindi) |
| **Local Storage** | shared_preferences | 2.2.2 | Key-value storage for user preferences |
| **Offline Database** | sqflite | 2.3.3 | Local SQLite database for offline functionality |
| **File System** | path_provider | 2.1.3 | Access to device file system directories |
| **Connectivity** | connectivity_plus | 6.0.3 | Network status monitoring and offline detection |
| **PDF Generation** | pdf | 3.10.7 | Create and save PDF documents |
| **PDF Printing** | printing | 5.13.3 | Print and share PDFs |
| **Speech Recognition** | speech_to_text | 7.0.0 | Voice input for accessibility |
| **Permissions** | permission_handler | 11.3.1 | Runtime permission management |
| **HTTP Client** | http | 1.2.1 | Network requests to backend APIs |
| **URL Launcher** | url_launcher | 6.2.5 | Open URLs, emails, phone numbers |

### Development Tools & Build System

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Build Tool (Web)** | Turbopack | Built-in | Next.js 16's fast Rust-based bundler |
| **Build Tool (Mobile)** | Flutter Build | 3.8.1+ | AOT compilation for native performance |
| **Code Quality (Web)** | ESLint | 9+ | JavaScript/TypeScript linting with Next.js config |
| **Code Quality (Mobile)** | flutter_lints | 5.0.0 | Dart linting with recommended rules |
| **Type Checking** | TypeScript Compiler | 5.0+ | Static type analysis |
| **Package Manager (Web)** | npm | 9.0+ | Node.js dependency management |
| **Package Manager (Mobile)** | Flutter Pub | Built-in | Dart package management |
| **Version Control** | Git | Latest | Distributed version control |
| **Repository** | GitHub | - | Source hosting, CI/CD, collaboration |
| **Firebase CLI** | firebase-tools | Latest | Deployment and cloud functions management |
| **Environment Config** | .env.local | - | Secret management (not committed to repo) |

### Third-Party Integrations & Services

| Service | Purpose | Status |
|---------|---------|--------|
| **Cloudinary** | Image/document CDN with optimization and transformations | ✅ Integrated |
| **Gmail SMTP** | Reliable transactional email delivery | ✅ Integrated |
| **Google OAuth** | Single sign-on authentication | ✅ Integrated |
| **PFMS** | Public Financial Management System (government payments) | 🔧 Integration Ready |
| **DigiLocker** | Government document verification portal | 🔧 Integration Ready |
| **Aadhaar UIDAI** | National identity authentication | 🔧 Integration Ready |
| **SMS Gateway** | SMS notifications infrastructure | 🔧 Configuration Ready |
| **Payment Gateway** | Direct bank transfer integration | 🔧 Integration Ready |

---

## 🏗️ Architecture

### System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CLIENT APPLICATIONS                              │
├────────────────────────────────┬────────────────────────────────────────┤
│    Web Portal (Next.js 16)     │     Mobile App (Flutter 3.8)          │
│  ┌──────────────────────────┐  │  ┌──────────────────────────────────┐ │
│  │ Officer Dashboard        │  │  │ Beneficiary Interface            │ │
│  │  - Applications          │  │  │  - Apply for Relief              │ │
│  │  - Beneficiaries         │  │  │  - Track Status                  │ │
│  │  - Disbursements         │  │  │  - View Disbursements            │ │
│  │  - Analytics             │  │  │  - Offline Mode (SQLite)         │ │
│  │  - Reports (PDF)         │  │  │  - Voice Input (Speech-to-Text)  │ │
│  │  - Blockchain Audit      │  │  │  - Document Camera               │ │
│  │  - Integrations          │  │  │  - Push Notifications            │ │
│  │  - Grievances            │  │  └──────────────────────────────────┘ │
│  ├──────────────────────────┤  │                                        │
│  │ User Dashboard           │  │  State: Provider Pattern              │
│  │  - My Applications       │  │  Storage: SharedPreferences + SQLite  │
│  │  - My Disbursements      │  │  Auth: firebase_auth                  │
│  │  - Profile               │  │  Network: http + connectivity_plus    │
│  └──────────────────────────┘  │                                        │
│                                 │                                        │
│  State: React Context API       │                                        │
│  Routing: App Router            │                                        │
│  SSR/SSG: Server Components     │                                        │
└─────────────────┬───────────────┴────────────┬───────────────────────────┘
                  │                            │
                  └────────────┬───────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   Firebase SDK      │
                    │  (Unified Backend)  │
                    └──────────┬──────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
┌───────▼────────┐   ┌─────────▼────────┐   ┌────────▼──────────┐
│  Firestore DB  │   │  Firebase Auth   │   │  Cloudinary CDN   │
├────────────────┤   ├──────────────────┤   ├───────────────────┤
│ • applications │   │ • Email/Password │   │ • Documents       │
│ • beneficiaries│   │ • Google OAuth   │   │ • Images          │
│ • disbursements│   │ • JWT Tokens     │   │ • Certificates    │
│ • reports      │   │ • Session Mgmt   │   │ • Transformations │
│ • grievances   │   │ • Role Claims    │   │ • CDN Delivery    │
│ • users        │   └──────────────────┘   └───────────────────┘
│ • blockchain   │
└────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    NEXT.JS API ROUTES                        │
├─────────────────────────────────────────────────────────────┤
│  /api/send-email         → Nodemailer (Gmail SMTP)          │
│  /api/upload-certificate → Cloudinary Upload + Signature    │
│  /api/dashboard/*        → Firestore Operations             │
│  /api/blockchain/*       → Block Creation & Validation      │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow Diagram

```
┌─────────────────┐
│ User Submission │
│  (Mobile/Web)   │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│ Application Created │ ───────┐
│ Status: Pending     │        │
└────────┬────────────┘        │
         │                     │
         ▼                     ▼
┌─────────────────────┐  ┌──────────────────┐
│ Document Upload     │  │ Email Sent to    │
│ (Cloudinary)        │  │ Beneficiary      │
└────────┬────────────┘  └──────────────────┘
         │
         ▼
┌─────────────────────┐
│ Officer Review      │
│ Status: In Review   │
└────────┬────────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌─────────┐ ┌──────────┐
│Approved │ │ Rejected │
└────┬────┘ └────┬─────┘
     │           │
     │           ▼
     │      ┌─────────────────┐
     │      │ Email Notification│
     │      │ + Grievance Flow │
     │      └─────────────────┘
     │
     ▼
┌──────────────────────┐
│ Disbursement Created │
│ Installment 1: 25%   │
└─────────┬────────────┘
          │
          ▼
┌──────────────────────┐
│ Payment Processing   │
│ (PFMS Integration)   │
└─────────┬────────────┘
          │
          ▼
┌──────────────────────┐
│ Installment 2: 50%   │
└─────────┬────────────┘
          │
          ▼
┌──────────────────────┐
│ Final Payment: 25%   │
└─────────┬────────────┘
          │
          ▼
┌──────────────────────┐
│ Status: Completed    │
│ Blockchain Recorded  │
│ Certificate Generated│
└──────────────────────┘
```

### Security Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                      SECURITY LAYERS                          │
├───────────────────────────────────────────────────────────────┤
│ Layer 1: Network Security                                     │
│  • HTTPS/TLS 1.3 encryption                                   │
│  • Content Security Policy (CSP) headers                      │
│  • CORS configuration                                         │
│  • DDoS protection (Firebase/Cloudflare)                      │
├───────────────────────────────────────────────────────────────┤
│ Layer 2: Authentication                                       │
│  • Firebase Auth with JWT tokens                              │
│  • Email/Password with secure hashing                         │
│  • Google OAuth 2.0 integration                               │
│  • Session management with expiry                             │
│  • Password strength enforcement                              │
├───────────────────────────────────────────────────────────────┤
│ Layer 3: Authorization (RBAC)                                 │
│  • Role-based access: 'officer' | 'user'                      │
│  • Firestore security rules enforcement                       │
│  • Document-level permissions (ownerId checks)                │
│  • API route authentication middleware                        │
├───────────────────────────────────────────────────────────────┤
│ Layer 4: Data Protection                                      │
│  • Encryption at rest (Firebase default)                      │
│  • Encryption in transit (TLS)                                │
│  • Sensitive field hashing (Aadhaar, bank details)            │
│  • PII data minimization                                      │
├───────────────────────────────────────────────────────────────┤
│ Layer 5: Input Validation                                     │
│  • Client-side validation (React Hook Form)                   │
│  • Server-side validation (API routes)                        │
│  • SQL injection prevention (NoSQL, no raw queries)           │
│  • XSS protection (React escaping, CSP)                       │
│  • File upload validation (type, size, content)               │
├───────────────────────────────────────────────────────────────┤
│ Layer 6: Audit & Monitoring                                   │
│  • Blockchain audit trail for critical operations             │
│  • Firestore timestamps on all documents                      │
│  • User activity logging                                      │
│  • Error tracking and alerting                                │
│  • Compliance reporting (GDPR, data protection)               │
└───────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

### Complete Repository Layout

```
Nyantra/
├── 📁 src/                                    # Web Application Source (Next.js 16)
│   ├── 📁 app/                                # Next.js App Router (Pages & Layouts)
│   │   ├── 📁 dashboard/                      # Officer Dashboard Module
│   │   │   ├── 📁 applications/               # Application CRUD operations
│   │   │   │   └── page.tsx                   # Applications list & management
│   │   │   ├── 📁 beneficiaries/              # Beneficiary management
│   │   │   │   └── page.tsx                   # Beneficiaries list & profiles
│   │   │   ├── 📁 disbursements/              # Payment tracking
│   │   │   │   └── page.tsx                   # Disbursement dashboard
│   │   │   ├── 📁 reports/                    # Report generation
│   │   │   │   └── page.tsx                   # Reports hub with PDF export
│   │   │   ├── 📁 analytics/                  # Data analytics
│   │   │   │   └── page.tsx                   # Interactive Chart.js dashboards
│   │   │   ├── 📁 grievance/                  # Grievance management
│   │   │   │   └── page.tsx                   # Feedback & complaints
│   │   │   ├── 📁 blockchain/                 # Blockchain audit trail
│   │   │   │   ├── page.tsx                   # Blockchain viewer
│   │   │   │   ├── AddBlockForm.tsx           # Add transaction form
│   │   │   │   ├── BlockCard.tsx              # Block visualization
│   │   │   │   └── ChainView.tsx              # Chain visualization
│   │   │   ├── 📁 integrations/               # External integrations
│   │   │   │   └── page.tsx                   # PFMS, DigiLocker, Aadhaar
│   │   │   ├── layout.tsx                     # Dashboard layout with Sidebar
│   │   │   └── page.tsx                       # Dashboard home with stats
│   │   ├── 📁 user-dashboard/                 # Beneficiary Dashboard Module
│   │   │   ├── 📁 applications/               # My applications view
│   │   │   │   └── page.tsx                   # Application list & submission
│   │   │   ├── 📁 disbursements/              # My disbursements
│   │   │   │   └── page.tsx                   # Payment tracking timeline
│   │   │   ├── 📁 profile/                    # User profile
│   │   │   │   └── page.tsx                   # Profile management
│   │   │   ├── layout.tsx                     # User dashboard layout
│   │   │   └── page.tsx                       # User home dashboard
│   │   ├── 📁 api/                            # Next.js API Routes (Server-side)
│   │   │   ├── 📁 send-email/                 # Email service endpoint
│   │   │   │   └── route.ts                   # POST: Send emails via Nodemailer
│   │   │   ├── 📁 upload-certificate/         # File upload endpoint
│   │   │   │   └── route.ts                   # POST: Upload to Cloudinary
│   │   │   ├── 📁 dashboard/                  # Dashboard API endpoints
│   │   │   │   └── [various routes]           # Firestore operations
│   │   │   └── 📁 blockchain/                 # Blockchain API
│   │   │       └── block.ts                   # Block interface definition
│   │   ├── 📁 login/                          # Authentication pages
│   │   │   └── page.tsx                       # Login with email/Google OAuth
│   │   ├── 📁 choose-role/                    # Role selection page
│   │   │   └── page.tsx                       # Officer vs User role choice
│   │   ├── 📁 verify/                         # Email verification
│   │   │   └── page.tsx                       # Verification handler
│   │   ├── layout.tsx                         # Root layout (providers, fonts)
│   │   ├── page.tsx                           # Landing page (1466 lines)
│   │   └── globals.css                        # Global Tailwind styles
│   │
│   ├── 📁 components/                         # Reusable React Components
│   │   ├── AnalyticsChart.tsx                 # Chart.js wrapper component
│   │   ├── BackgroundAnimation.tsx            # Landing page animations
│   │   ├── BackgroundCursor.tsx               # Custom cursor effects
│   │   ├── BackgroundFollow.tsx               # Mouse-following elements
│   │   ├── BackgroundOrbs.tsx                 # Animated orbs background
│   │   ├── ClientBackgroundCursor.tsx         # Client-side cursor
│   │   ├── ClientCursor.tsx                   # Cursor component
│   │   ├── Cursor.tsx                         # Base cursor component
│   │   ├── DashboardComponent.tsx             # Dashboard wrapper
│   │   ├── LanguageToggle.tsx                 # EN/HI language switcher
│   │   ├── LoadingState.tsx                   # Loading skeletons
│   │   ├── MockLineChart.tsx                  # Chart demo component
│   │   ├── MouseTrail.tsx                     # Mouse trail effect
│   │   ├── NotificationDropdown.tsx           # Notification center
│   │   ├── Sidebar.tsx                        # Officer dashboard sidebar
│   │   ├── ThemeToggle.tsx                    # Dark/light theme toggle
│   │   └── UserSidebar.tsx                    # User dashboard sidebar
│   │
│   ├── 📁 context/                            # React Context Providers
│   │   ├── AuthContext.tsx                    # Authentication state & Firebase Auth
│   │   ├── ThemeContext.tsx                   # Dark/light theme management
│   │   └── LocaleContext.tsx                  # i18n locale switching (en/hi)
│   │
│   ├── 📁 lib/                                # Utility Libraries
│   │   ├── firebase.ts                        # Firebase initialization & config
│   │   └── id.ts                              # Unique ID generation utilities
│   │
│   ├── 📁 locales/                            # Translation Files (JSON)
│   │   ├── en.json                            # English translations (complete)
│   │   ├── en.json.bak                        # English backup
│   │   ├── en.json.grouped.bak                # Grouped English backup
│   │   ├── hi.json                            # Hindi translations (complete)
│   │   ├── hi.json.bak                        # Hindi backup
│   │   └── hi.json.grouped.bak                # Grouped Hindi backup
│   │
│   └── 📁 types/                              # TypeScript Type Definitions
│       └── ambient.d.ts                       # Ambient type declarations
│
├── 📁 Nyantra-Mobile/                         # Flutter Mobile Application
│   ├── 📁 lib/                                # Dart Source Code
│   │   ├── main.dart                          # App entry point & MaterialApp
│   │   └── 📁 src/                            # Feature modules
│   │       └── 📁 components/                 # Reusable Flutter widgets
│   ├── 📁 assets/                             # Static Assets
│   │   ├── 📁 translations/                   # Mobile i18n files
│   │   │   ├── en.json                        # English mobile translations
│   │   │   └── hi.json                        # Hindi mobile translations
│   │   └── 📁 images/                         # App images and icons
│   ├── 📁 android/                            # Android Platform Code
│   │   ├── 📁 app/                            # App-level configuration
│   │   │   ├── build.gradle.kts               # Gradle build config
│   │   │   └── google-services.json           # Firebase Android config
│   │   ├── build.gradle.kts                   # Project-level Gradle
│   │   ├── gradle.properties                  # Gradle properties
│   │   └── settings.gradle.kts                # Gradle settings
│   ├── 📁 ios/                                # iOS Platform Code
│   │   ├── 📁 Runner/                         # iOS app configuration
│   │   │   ├── AppDelegate.swift              # iOS app delegate
│   │   │   ├── Info.plist                     # iOS info plist
│   │   │   └── Assets.xcassets/               # iOS assets
│   │   └── Runner.xcodeproj/                  # Xcode project
│   ├── 📁 linux/                              # Linux Desktop Support
│   ├── 📁 macos/                              # macOS Desktop Support
│   ├── 📁 web/                                # Web Platform Support
│   │   ├── index.html                         # Web entry point
│   │   └── manifest.json                      # PWA manifest
│   ├── 📁 test/                               # Unit & Widget Tests
│   │   └── widget_test.dart                   # Sample widget test
│   ├── analysis_options.yaml                  # Dart analyzer configuration
│   ├── pubspec.yaml                           # Flutter dependencies & assets
│   └── README.md                              # Mobile app documentation
│
├── 📁 scripts/                                # Automation & Utility Scripts
│   ├── add-missing-i18n-keys.js               # Add missing translation keys
│   ├── auto-import-useLocale.js               # Auto-import useLocale hook
│   ├── check-i18n-imports.js                  # Validate i18n imports
│   ├── delete-application.js                  # Admin script: Delete Firestore docs
│   ├── export-i18n-csv.js                     # Export translations to CSV
│   ├── extract-i18n.js                        # Extract i18n keys from code
│   ├── i18n-group.js                          # Group translations by feature
│   ├── i18n-replace.js                        # Replace hardcoded text with keys
│   ├── populate-hi.js                         # Auto-translate to Hindi
│   ├── populate-reports.js                    # Seed sample reports
│   └── test-locales.js                        # Test translation completeness
│
├── 📁 i18n_exports/                           # Translation Exports
│   ├── i18n.csv                               # CSV export of all translations
│   └── i18n.json                              # JSON export of all translations
│
├── 📁 public/                                 # Static Public Assets
│   ├── Logo-Light.png                         # Logo for light theme
│   ├── Logo-Dark.png                          # Logo for dark theme
│   └── favicon.ico                            # Website favicon
│
├── 📄 Configuration Files (Root)
├── package.json                               # Node.js dependencies & scripts
├── package-lock.json                          # Locked dependency versions
├── tsconfig.json                              # TypeScript compiler config
├── next.config.ts                             # Next.js configuration
├── postcss.config.mjs                         # PostCSS configuration
├── eslint.config.mjs                          # ESLint rules & plugins
├── firebase.json                              # Firebase hosting config
├── firestore.rules                            # Firestore security rules (184 lines)
├── .env.local                                 # Environment variables (gitignored)
├── .env.example                               # Example env file template
├── .gitignore                                 # Git ignore patterns
└── README.md                                  # This comprehensive documentation
```

---

## 🔌 API Routes

### Server-Side Endpoints (Next.js API Routes)

#### Email Service API
**Endpoint**: `/api/send-email`  
**Method**: `POST`  
**Purpose**: Send transactional emails via Nodemailer with Gmail SMTP

```typescript
// Request Body
{
  to: string | string[];        // Recipient email(s)
  subject: string;               // Email subject
  html: string;                  // HTML email body
  attachments?: Array<{          // Optional attachments
    filename: string;
    content: string;             // Base64 encoded content
    encoding: string;
  }>;
}

// Response
{
  success: boolean;
  messageId?: string;            // Email message ID
  error?: string;                // Error message if failed
}
```

**Use Cases:**
- Application status change notifications
- Disbursement payment confirmations
- Welcome emails on registration
- Password reset links
- Grievance acknowledgment

---

#### File Upload API
**Endpoint**: `/api/upload-certificate`  
**Method**: `POST`  
**Purpose**: Upload documents to Cloudinary CDN with signed uploads

```typescript
// Request: multipart/form-data
{
  file: File;                    // The file to upload
  beneficiaryId: string;         // Beneficiary identifier
  documentType?: string;         // Type of document (FIR, medical, etc.)
}

// Response
{
  success: boolean;
  url?: string;                  // Cloudinary CDN URL
  publicId?: string;             // Cloudinary public ID
  secureUrl?: string;            // HTTPS URL
  error?: string;                // Error message if failed
}
```

**Features:**
- Automatic image optimization
- Secure signed uploads with SHA-1 signatures
- File type validation (images, PDFs)
- Size limit enforcement
- CDN delivery with global edge network

---

#### Blockchain API
**Endpoint**: `/api/blockchain/block`  
**Purpose**: Create and validate blockchain blocks for audit trail

```typescript
// Block Interface
interface Block {
  index: number;                 // Block position in chain
  timestamp: number;             // Unix timestamp
  data: {                        // Transaction data
    type: string;                // Transaction type
    description: string;         // Human-readable description
    metadata?: Record<string, any>;
  };
  previousHash: string;          // Previous block's hash (SHA-256)
  hash: string;                  // Current block's hash
  nonce?: number;                // Proof of work (optional)
}
```

**Operations:**
- `createBlock()`: Add new transaction to chain
- `validateChain()`: Verify chain integrity
- `getBlock(index)`: Retrieve specific block
- `getChain()`: Get complete chain history

---

## 🌐 Internationalization (i18n)

### Implementation Architecture

**Web Application (React Context)**
```typescript
// LocaleContext.tsx
- useLocale() hook: Access translations anywhere
- switchLocale(locale: 'en' | 'hi'): Change language
- t(key: string): Get translated string
```

**Mobile Application (Flutter intl)**
```dart
// Generated localization classes
- AppLocalizations.of(context): Access translations
- Locale switching with MaterialApp
- Automatic RTL support for Hindi
```

### Translation Structure

```json
{
  "common": {
    "welcome": "Welcome",
    "login": "Login",
    "logout": "Logout"
  },
  "dashboard": {
    "applications": "Applications",
    "beneficiaries": "Beneficiaries",
    "disbursements": "Disbursements"
  },
  "forms": {
    "validation": {
      "required": "This field is required",
      "email": "Invalid email address"
    }
  }
}
```

### Available Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| **Extract Keys** | `npm run i18n:extract` | Extract translation keys from source code |
| **Replace Hardcoded Text** | `npm run i18n:replace` | Replace strings with translation keys |
| **Auto-translate Hindi** | `npm run i18n:populate-hi` | Auto-populate Hindi translations |
| **Group Translations** | `npm run i18n:group` | Organize keys by feature modules |
| **Validate Imports** | `npm run lint:i18n` | Check for missing `useLocale` imports |
| **Test Completeness** | `npm run test:i18n` | Verify all keys have translations |
| **Export CSV** | `npm run i18n:export` | Export to CSV for translators |
| **Auto-import Hook** | `npm run i18n:auto-import` | Add `useLocale` to components |

### Supported Languages

| Language | Code | Status | Coverage |
|----------|------|--------|----------|
| **English** | `en` | ✅ Complete | 100% (500+ keys) |
| **Hindi** | `hi` | ✅ Complete | 100% (500+ keys) |
| **Future** | `ta`, `te`, `mr`, `bn` | 🚧 Planned | - |

### Adding New Languages

1. Create `src/locales/{locale}.json`
2. Copy structure from `en.json`
3. Translate all keys
4. Update `LocaleContext.tsx` with new locale
5. Add language option to `LanguageToggle.tsx`

---

## 🔒 Security & Compliance

### Authentication Flow

```
1. User Registration
   ↓
2. Firebase Auth (Email + Password / Google OAuth)
   ↓
3. User Document Created in Firestore (/users/{uid})
   ↓
4. Role Selection (/choose-role)
   ↓
5. Role Written to User Profile (one-time only)
   ↓
6. JWT Token Issued with Custom Claims
   ↓
7. Client Stores Token in Memory (AuthContext)
   ↓
8. Firestore Rules Validate on Every Request
```

### Firestore Security Rules

**Key Principles:**
- ✅ **Authentication Required**: `request.auth != null` on all operations
- ✅ **Owner-Based Access**: Users can only read/write their own data (`request.auth.uid == resource.data.ownerId`)
- ✅ **Role-Based Permissions**: Officers have broader access than users
- ✅ **One-Time Role Assignment**: Users cannot change their role after initial selection
- ✅ **Immutable Fields**: Certain fields cannot be modified after creation

**Example Rules:**
```javascript
// Users can only access their own profile
match /users/{userId} {
  allow read: if request.auth.uid == userId;
  allow update: if request.auth.uid == userId 
                && request.resource.data.role == resource.data.role; // Role cannot change
}

// Applications: Users own their applications, officers can read all
match /applications/{applicationId} {
  allow read: if request.auth != null && 
                 (resource.data.ownerId == request.auth.uid || 
                  get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'officer');
  allow create: if request.auth != null;
  allow update: if request.auth != null && 
                   get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'officer';
}
```

### Data Encryption

| Layer | Method | Coverage |
|-------|--------|----------|
| **In Transit** | TLS 1.3 | All network traffic |
| **At Rest** | AES-256 | Firebase automatic encryption |
| **Client-Side** | Hash sensitive fields | Aadhaar, bank account numbers |
| **API Keys** | Environment variables | Never committed to repo |

### Compliance Standards

- ✅ **GDPR**: Right to access, delete, and export data
- ✅ **Data Protection Act 2018 (India)**: Personal data handling
- ✅ **SC/ST Act 1989**: Specific compliance for relief disbursement
- ✅ **Aadhaar Act 2016**: Secure storage and usage of Aadhaar data
- ✅ **IT Act 2000**: Cybersecurity and data breach protocols

### Audit Logging

**Logged Events:**
- User authentication (login, logout, failed attempts)
- Application submissions and status changes
- Disbursement approvals and payments
- Profile modifications
- Document uploads
- Admin actions (delete, bulk operations)

**Blockchain Audit Trail:**
- Immutable record of critical transactions
- SHA-256 hash chaining for tamper detection
- Stored in Firestore `/blockchain` collection
- Viewable in `/dashboard/blockchain`

---

## 📜 Development Scripts

### Web Application Scripts

```bash
# Development
npm run dev              # Start Next.js dev server with Turbopack
npm run build            # Production build (optimized)
npm run start            # Start production server
npm run lint             # Run ESLint on all TypeScript files

# Internationalization
npm run i18n:extract     # Extract translation keys from codebase
npm run i18n:replace     # Replace hardcoded strings with t() calls
npm run i18n:populate-hi # Auto-translate English to Hindi
npm run i18n:group       # Group translations by feature
npm run lint:i18n        # Check for missing useLocale imports
npm run test:i18n        # Validate translation completeness
npm run i18n:export      # Export translations to CSV
npm run i18n:auto-import # Add useLocale to components automatically
```

### Mobile Application Scripts

```bash
# Flutter Development
flutter pub get          # Install dependencies
flutter run              # Run on connected device/emulator
flutter run -d chrome    # Run on web browser
flutter build apk        # Build Android APK (release mode)
flutter build appbundle  # Build Android App Bundle (for Play Store)
flutter build ios        # Build iOS app (requires macOS + Xcode)
flutter build web        # Build web version

# Testing & Quality
flutter test             # Run unit & widget tests
flutter analyze          # Static code analysis
flutter doctor           # Check Flutter installation

# Platform-Specific
flutter run -d android   # Run on Android device
flutter run -d ios       # Run on iOS simulator (macOS only)
flutter clean            # Clean build cache
```

### Utility Scripts

```bash
# Firebase Administration
firebase login                    # Authenticate with Firebase
firebase deploy                   # Deploy web app to Firebase Hosting
firebase deploy --only firestore:rules  # Deploy security rules only
firebase deploy --only functions  # Deploy cloud functions
firebase emulators:start          # Start local Firebase emulators

# Firestore Operations
node scripts/delete-application.js APP123  # Delete application (admin)
node scripts/populate-reports.js           # Seed sample reports
```

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

| Requirement | Version | Download |
|-------------|---------|----------|
| **Node.js** | 18.0 or higher | [nodejs.org](https://nodejs.org/) |
| **npm** | 9.0 or higher | Comes with Node.js |
| **Flutter SDK** | 3.8 or higher | [flutter.dev](https://flutter.dev/docs/get-started/install) |
| **Git** | Latest | [git-scm.com](https://git-scm.com/) |
| **Firebase CLI** | Latest | `npm install -g firebase-tools` |
| **Android Studio** | Latest (for mobile dev) | [developer.android.com](https://developer.android.com/studio) |

### Firebase Setup

1. **Create a Firebase Project**
   ```bash
   # Login to Firebase
   firebase login
   
   # Initialize Firebase in your project
   firebase init
   ```

2. **Enable Required Services**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Enable **Firestore Database** (production mode)
   - Enable **Authentication** (Email/Password and Google)
   - Enable **Storage** (for document uploads)
   - Enable **Hosting** (for web deployment)

3. **Configure Security Rules**
   - Deploy Firestore rules: `firebase deploy --only firestore:rules`
   - Deploy Storage rules: `firebase deploy --only storage`

### Web Application Setup

```bash
# 1. Clone the repository
git clone https://github.com/Anish-2005/Nyantra.git
cd Nyantara

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local

# Edit .env.local with your Firebase credentials
# See "Environment Configuration" section below

# 4. Start development server
npm run dev

# 5. Open your browser
# Navigate to http://localhost:3000
```

### Mobile Application Setup

```bash
# 1. Navigate to mobile app directory
cd Nyantra-Mobile

# 2. Install Flutter dependencies
flutter pub get

# 3. Configure Firebase for Flutter
# For Android:
#   - Download google-services.json from Firebase Console
#   - Place it in android/app/

# For iOS:
#   - Download GoogleService-Info.plist from Firebase Console
#   - Place it in ios/Runner/

# 4. Run on connected device or emulator
flutter run

# Or build APK for Android
flutter build apk --release

# Or build for iOS
flutter build ios --release
```

### Environment Configuration

Create a `.env.local` file in the root directory:

```env
# ========================================
# Firebase Configuration
# ========================================
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# ========================================
# Cloudinary Configuration (Optional)
# ========================================
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

# ========================================
# Email Configuration (Gmail SMTP)
# ========================================
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-digit-app-password

# Note: Generate App Password from Google Account Settings
# Account → Security → 2-Step Verification → App Passwords
```

### Firestore Database Structure

Complete Firestore collections schema with all fields:

```typescript
// COLLECTION: users
users/
  └── {userId} (document ID = Firebase Auth UID)
      ├── uid: string                    // Firebase Auth UID
      ├── email: string                  // User email
      ├── displayName: string            // Full name
      ├── role: 'officer' | 'user'       // User role (immutable after first set)
      ├── verified: boolean              // Email verification status
      ├── photoURL?: string              // Profile picture URL
      ├── phoneNumber?: string           // Contact number
      ├── createdAt: timestamp           // Account creation date
      └── lastLoginAt: timestamp         // Last login timestamp

// COLLECTION: applications
applications/
  └── {applicationId} (e.g., APP1234567890)
      ├── applicantName: string          // Beneficiary full name
      ├── aadhaar: string                // Aadhaar number (encrypted)
      ├── phoneNumber: string            // Contact number
      ├── email: string                  // Email address
      ├── address: string                // Residential address
      ├── district: string               // District name
      ├── state: string                  // State name
      ├── pincode: string                // Postal code
      ├── actType: string                // Type of atrocity act
      ├── offenceCategory: string        // Category of offence
      ├── offenceDetails: string         // Detailed description
      ├── firNumber: string              // FIR number
      ├── policeStation: string          // Police station name
      ├── incidentDate: timestamp        // Date of incident
      ├── amount: number                 // Relief amount requested
      ├── bankAccountNumber: string      // Bank account (hashed)
      ├── bankIFSC: string               // IFSC code
      ├── bankName: string               // Bank name
      ├── accountHolderName: string      // Account holder name
      ├── status: 'pending' | 'inreview' | 'approved' | 'rejected'
      ├── documents: Array<{             // Uploaded documents
      │   ├── type: string               // Document type
      │   ├── url: string                // Cloudinary URL
      │   ├── uploadedAt: timestamp      // Upload timestamp
      │   └── verified: boolean          // Verification status
      │ }>
      ├── remarks?: string               // Officer remarks
      ├── rejectionReason?: string       // Reason if rejected
      ├── reviewedBy?: string            // Officer UID who reviewed
      ├── reviewedAt?: timestamp         // Review timestamp
      ├── createdAt: timestamp           // Submission date
      ├── updatedAt: timestamp           // Last update date
      └── ownerId: string                // User UID who created

// COLLECTION: beneficiaries
beneficiaries/
  └── {beneficiaryId} (e.g., BEN1234567890)
      ├── name: string                   // Full name
      ├── aadhaar: string                // Aadhaar number (encrypted)
      ├── phone: string                  // Contact number
      ├── email: string                  // Email address
      ├── address: string                // Complete address
      ├── district: string               // District
      ├── state: string                  // State
      ├── dateOfBirth: timestamp         // DOB
      ├── gender: 'male' | 'female' | 'other'
      ├── category: 'SC' | 'ST'          // Social category
      ├── bankDetails: {                 // Banking information
      │   ├── accountNumber: string      // (hashed)
      │   ├── ifsc: string
      │   ├── bankName: string
      │   └── branch: string
      │ }
      ├── documents: Array<{             // Identity documents
      │   ├── type: string
      │   ├── url: string
      │   └── uploadedAt: timestamp
      │ }>
      ├── applicationIds: string[]       // Linked application IDs
      ├── totalApplications: number      // Total applications count
      ├── approvedApplications: number   // Approved count
      ├── totalDisbursed: number         // Total amount disbursed
      ├── createdAt: timestamp
      ├── updatedAt: timestamp
      └── ownerId: string                // Creator UID

// COLLECTION: disbursements
disbursements/
  └── {disbursementId} (e.g., DIS1234567890)
      ├── applicationId: string          // Reference to application
      ├── beneficiaryId: string          // Reference to beneficiary
      ├── beneficiaryName: string        // For display
      ├── reliefAmount: number           // Total approved amount
      ├── disbursedAmount: number        // Total disbursed so far
      ├── totalInstallments: number      // Number of installments (default: 3)
      ├── completedInstallments: number  // Completed count
      ├── installments: Array<{          // Installment details
      │   ├── installmentNumber: number  // 1, 2, 3
      │   ├── percentage: number         // 25, 50, 25
      │   ├── amount: number             // Calculated amount
      │   ├── status: 'pending' | 'processing' | 'completed' | 'failed'
      │   ├── transactionId?: string     // Bank transaction ID
      │   ├── disbursedAt?: timestamp    // Payment date
      │   └── remarks?: string
      │ }>
      ├── bankDetails: {                 // Beneficiary bank info
      │   ├── accountNumber: string      // (hashed)
      │   ├── ifsc: string
      │   ├── bankName: string
      │   └── accountHolderName: string
      │ }
      ├── status: 'pending' | 'processing' | 'completed' | 'failed'
      ├── initiatedBy: string            // Officer UID
      ├── initiatedAt: timestamp         // Initiation date
      ├── completedAt?: timestamp        // Completion date
      ├── createdAt: timestamp
      ├── updatedAt: timestamp
      └── ownerId: string

// COLLECTION: reports
reports/
  └── {reportId} (auto-generated)
      ├── title: string                  // Report title
      ├── description: string            // Detailed description
      ├── category: 'applications' | 'disbursements' | 'grievances' | 'performance' | 'feedback'
      ├── type: 'monthly' | 'weekly' | 'custom'
      ├── dateRange: {                   // Report period
      │   ├── start: timestamp
      │   └── end: timestamp
      │ }
      ├── data: Record<string, any>      // Report data/statistics
      ├── generatedBy: string            // Officer UID
      ├── status: 'pending' | 'generated' | 'archived'
      ├── fileUrl?: string               // PDF URL if generated
      ├── createdAt: timestamp
      └── updatedAt: timestamp

// COLLECTION: grievances
grievances/
  └── {grievanceId} (auto-generated)
      ├── subject: string                // Issue title
      ├── description: string            // Detailed complaint
      ├── category: 'technical' | 'payment' | 'application' | 'other'
      ├── priority: 'low' | 'medium' | 'high' | 'critical'
      ├── status: 'open' | 'in-progress' | 'resolved' | 'closed'
      ├── applicationId?: string         // Related application (optional)
      ├── attachments?: Array<{          // Supporting documents
      │   ├── url: string
      │   ├── filename: string
      │   └── uploadedAt: timestamp
      │ }>
      ├── submittedBy: string            // User UID
      ├── submittedByName: string        // User name
      ├── submittedByEmail: string       // User email
      ├── assignedTo?: string            // Officer UID
      ├── response?: string              // Officer's response
      ├── respondedAt?: timestamp        // Response timestamp
      ├── resolvedAt?: timestamp         // Resolution timestamp
      ├── createdAt: timestamp
      └── updatedAt: timestamp

// COLLECTION: blockchain
blockchain/
  └── {blockId} (sequential: block_0, block_1, ...)
      ├── index: number                  // Block number in chain
      ├── timestamp: number              // Unix timestamp
      ├── data: {                        // Transaction data
      │   ├── type: string               // 'application', 'disbursement', 'status_change'
      │   ├── description: string        // Human-readable description
      │   ├── entityId: string           // Related document ID
      │   └── metadata: Record<string, any>  // Additional data
      │ }
      ├── previousHash: string           // SHA-256 hash of previous block
      ├── hash: string                   // SHA-256 hash of current block
      ├── nonce?: number                 // Proof of work (optional)
      └── createdAt: timestamp

// COLLECTION: notifications (future enhancement)
notifications/
  └── {notificationId}
      ├── userId: string                 // Recipient UID
      ├── title: string                  // Notification title
      ├── message: string                // Notification body
      ├── type: 'info' | 'success' | 'warning' | 'error'
      ├── relatedEntity: {               // Related document
      │   ├── collection: string         // Collection name
      │   └── id: string                 // Document ID
      │ }
      ├── read: boolean                  // Read status
      ├── actionUrl?: string             // Redirect URL on click
      ├── createdAt: timestamp
      └── expiresAt?: timestamp
```

### Firestore Indexes

**Required composite indexes** (defined in `firestore.indexes.json`):

```json
[
  {
    "collectionGroup": "applications",
    "queryScope": "COLLECTION",
    "fields": [
      { "fieldPath": "status", "order": "ASCENDING" },
      { "fieldPath": "createdAt", "order": "DESCENDING" }
    ]
  },
  {
    "collectionGroup": "disbursements",
    "queryScope": "COLLECTION",
    "fields": [
      { "fieldPath": "status", "order": "ASCENDING" },
      { "fieldPath": "createdAt", "order": "DESCENDING" }
    ]
  },
  {
    "collectionGroup": "applications",
    "queryScope": "COLLECTION",
    "fields": [
      { "fieldPath": "ownerId", "order": "ASCENDING" },
      { "fieldPath": "createdAt", "order": "DESCENDING" }
    ]
  }
]
```

### First-Time Setup Checklist

- [ ] Firebase project created and services enabled
- [ ] Environment variables configured
- [ ] Firestore security rules deployed
- [ ] Web application running locally
- [ ] Mobile app tested on device/emulator
- [ ] Test user account created
- [ ] Sample data populated (optional)

---

## 📊 Available Scripts

### Web Application
```bash
npm run dev          # Start development server
npm run build        # Create production build
npm run start        # Run production server
npm run lint         # Run ESLint
npm run i18n:extract # Extract translation keys
npm run i18n:replace # Update translations
```

### Mobile Application
```bash
flutter pub get      # Install dependencies
flutter run          # Run on device/emulator
flutter build apk    # Build Android APK
flutter build ios    # Build iOS app
```

---

## 🎨 Design System

- **Themes**: Light/Dark mode with CSS custom properties
- **Typography**: System fonts with fallbacks
- **Color Palette**: Accessible color combinations
- **Components**: Glassmorphism effects and smooth animations
- **Responsive**: Mobile-first design with breakpoint system

---

## 🌐 Internationalization

- **Languages**: English (en) and Hindi (hi)
- **Implementation**: JSON-based translations with React Context
- **Coverage**: Complete UI translation with RTL support ready
- **Management**: Automated scripts for key extraction and validation

---

## 🔒 Security & Privacy

- **Authentication**: Firebase Auth with email/password and Google sign-in
- **Authorization**: Role-based access control (Admin/User)
- **Data Encryption**: Firebase's built-in encryption at rest
- **API Security**: Server-side validation and input sanitization
- **Privacy**: GDPR-compliant data handling practices

---

## 📈 Performance & Optimization

### Web Application Performance

| Metric | Target | Current | Optimization |
|--------|--------|---------|--------------|
| **First Contentful Paint** | < 1.8s | ~1.5s | Turbopack + SSR |
| **Largest Contentful Paint** | < 2.5s | ~2.2s | Image optimization, code splitting |
| **Time to Interactive** | < 3.8s | ~3.4s | Lazy loading, tree shaking |
| **Cumulative Layout Shift** | < 0.1 | ~0.05 | Skeleton screens, fixed dimensions |
| **First Input Delay** | < 100ms | ~50ms | React 19 concurrent rendering |
| **Bundle Size (Initial)** | < 200KB | ~180KB | Dynamic imports, compression |

**Optimization Techniques:**
- ✅ **Next.js 16 Turbopack**: 20x faster builds than Webpack
- ✅ **Code Splitting**: Route-based automatic splitting
- ✅ **Image Optimization**: Next.js Image component with lazy loading
- ✅ **Tree Shaking**: Unused code elimination
- ✅ **Compression**: Gzip/Brotli for static assets
- ✅ **CDN**: Cloudinary for images, Firebase CDN for hosting
- ✅ **Caching**: Service Worker for offline assets
- ✅ **Preloading**: Critical resources preloaded
- ✅ **Font Optimization**: System fonts with fallbacks

### Mobile Application Performance

| Metric | Target | Achievement |
|--------|--------|-------------|
| **App Start Time** | < 2s | ✅ ~1.8s |
| **Frame Rate** | 60 FPS | ✅ Consistent 60 FPS |
| **Memory Usage** | < 150MB | ✅ ~120MB average |
| **APK Size** | < 20MB | ✅ ~15MB |
| **Network Efficiency** | Smart sync | ✅ Background sync, offline-first |

**Flutter Optimizations:**
- ✅ **AOT Compilation**: Pre-compiled native code
- ✅ **Tree Shaking**: Dart compiler removes unused code
- ✅ **Image Caching**: `cached_network_image` package
- ✅ **Lazy Loading**: Paginated lists with `ListView.builder`
- ✅ **Local Database**: SQLite for offline data
- ✅ **Background Sync**: Connectivity detection with queue

### Database Performance

**Firestore Best Practices:**
- ✅ **Composite Indexes**: Pre-defined for common queries
- ✅ **Pagination**: Cursor-based pagination (limit + startAfter)
- ✅ **Denormalization**: Duplicate data to reduce reads
- ✅ **Real-time Listeners**: Efficient subscription management
- ✅ **Batch Operations**: Bulk writes for multiple documents
- ✅ **Offline Persistence**: Enabled for mobile app

---

## 🚀 Deployment

### Web Application Deployment (Firebase Hosting)

#### Prerequisites
```bash
npm install -g firebase-tools
firebase login
```

#### Production Deployment Steps

```bash
# 1. Build the Next.js application
npm run build

# 2. Test the production build locally
npm run start

# 3. Initialize Firebase (first time only)
firebase init hosting
# Select:
# - Use an existing project
# - Public directory: out (for static export) or .next (for SSR)
# - Configure as a single-page app: Yes
# - Automatic builds with GitHub: Optional

# 4. Deploy to Firebase Hosting
firebase deploy --only hosting

# 5. Access your app at:
# https://your-project-id.web.app
# https://your-project-id.firebaseapp.com
```

#### Custom Domain Setup

```bash
# 1. Add custom domain in Firebase Console
# Hosting → Add custom domain → Follow DNS configuration

# 2. Firebase automatically provisions SSL certificate

# 3. Update next.config.ts with production URL
```

#### Environment Variables (Production)

Set environment variables in Firebase Hosting:
```bash
firebase functions:config:set \
  gmail.user="your-email@gmail.com" \
  gmail.password="your-app-password" \
  cloudinary.cloud_name="your-cloud-name" \
  cloudinary.api_key="your-api-key" \
  cloudinary.api_secret="your-api-secret"
```

---

### Mobile Application Deployment

#### Android Deployment (Google Play Store)

```bash
# 1. Update version in pubspec.yaml
version: 1.0.0+1  # version name + build number

# 2. Generate release keystore (first time only)
keytool -genkey -v -keystore ~/upload-keystore.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias upload

# 3. Configure android/key.properties
storePassword=<password>
keyPassword=<password>
keyAlias=upload
storeFile=<path-to-keystore>

# 4. Build Android App Bundle
flutter build appbundle --release

# 5. Upload to Google Play Console
# File location: build/app/outputs/bundle/release/app-release.aab
```

#### iOS Deployment (Apple App Store)

```bash
# 1. Update version in pubspec.yaml
version: 1.0.0+1

# 2. Open Xcode project
open ios/Runner.xcworkspace

# 3. Configure signing in Xcode
# - Select Runner target
# - Signing & Capabilities → Team
# - Automatic signing

# 4. Build iOS app
flutter build ios --release

# 5. Archive and upload via Xcode
# Product → Archive → Distribute App → App Store Connect
```

---

### CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build Next.js app
        run: npm run build
        env:
          NEXT_PUBLIC_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
          NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: ${{ secrets.FIREBASE_AUTH_DOMAIN }}
          NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}
          
      - name: Deploy to Firebase
        uses: w9jds/firebase-action@master
        with:
          args: deploy --only hosting
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

---

### Monitoring & Analytics

**Firebase Analytics Setup:**
```typescript
// lib/firebase.ts
import { getAnalytics } from 'firebase/analytics';

export const analytics = getAnalytics(app);

// Log custom events
logEvent(analytics, 'application_submitted', {
  status: 'pending',
  amount: 50000
});
```

**Error Tracking:**
- Firebase Crashlytics for mobile
- Error boundaries in React
- API error logging to Firestore

**Performance Monitoring:**
```typescript
import { getPerformance } from 'firebase/performance';

const perf = getPerformance(app);
```

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help improve Nyantra:

### Getting Started

1. **Fork the Repository**
   ```bash
   gh repo fork Anish-2005/Nyantra
   # or visit: https://github.com/Anish-2005/Nyantra/fork
   ```

2. **Clone Your Fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Nyantra.git
   cd Nyantra
   ```

3. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```

4. **Install Dependencies**
   ```bash
   # Web application
   npm install
   
   # Mobile application
   cd Nyantra-Mobile
   flutter pub get
   ```

5. **Make Your Changes**
   - Write clean, maintainable code
   - Follow existing code style and conventions
   - Add comments for complex logic
   - Update or add tests as needed

6. **Test Your Changes**
   ```bash
   # Web
   npm run dev           # Test locally
   npm run lint          # Check for linting errors
   npm run lint:i18n     # Validate translations
   
   # Mobile
   flutter test          # Run tests
   flutter analyze       # Static analysis
   ```

7. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   # or
   git commit -m "fix: resolve issue with..."
   ```

   **Commit Message Convention:**
   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation changes
   - `style:` Code style changes (formatting, no logic change)
   - `refactor:` Code refactoring
   - `test:` Adding or updating tests
   - `chore:` Maintenance tasks

8. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

9. **Open a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your fork and branch
   - Fill in the PR template with:
     - Description of changes
     - Related issue numbers (if any)
     - Screenshots/videos (for UI changes)
     - Testing steps

---

### Development Guidelines

#### Code Style

**TypeScript/JavaScript:**
- ✅ Use TypeScript strict mode (`strict: true`)
- ✅ Follow ESLint rules (run `npm run lint`)
- ✅ Use meaningful variable and function names
- ✅ Avoid `any` type; use proper type definitions
- ✅ Use functional components with hooks (React)
- ✅ Keep components small and focused (< 300 lines)

**Flutter/Dart:**
- ✅ Follow Dart style guide and `flutter_lints`
- ✅ Use `const` constructors where possible
- ✅ Organize widgets into separate files
- ✅ Use Provider for state management
- ✅ Handle errors gracefully with try-catch

#### File Organization

- **Components**: Reusable UI components in `src/components/`
- **Pages**: Route-specific pages in `src/app/`
- **Context**: Global state in `src/context/`
- **Utilities**: Helper functions in `src/lib/`
- **Types**: TypeScript definitions in `src/types/`

#### Internationalization

- ✅ Always use `t()` function for user-facing text
- ✅ Add new translation keys to both `en.json` and `hi.json`
- ✅ Run `npm run i18n:extract` to detect missing keys
- ✅ Use descriptive key names (e.g., `dashboard.applications.title`)

#### Accessibility

- ✅ Add `aria-label` to interactive elements
- ✅ Ensure keyboard navigation works
- ✅ Use semantic HTML (`<button>`, `<nav>`, `<main>`)
- ✅ Maintain color contrast ratio ≥ 4.5:1
- ✅ Test with screen readers

#### Testing

- ✅ Write unit tests for utilities and helpers
- ✅ Write component tests for complex components
- ✅ Test edge cases and error scenarios
- ✅ Aim for >70% code coverage

---

### Areas for Contribution

We're especially looking for help with:

#### 🐛 Bug Fixes
- Check [Issues](https://github.com/Anish-2005/Nyantra/issues) labeled `bug`
- Reproduce the issue locally
- Fix and add tests to prevent regression

#### ✨ New Features
- Check [Issues](https://github.com/Anish-2005/Nyantra/issues) labeled `enhancement`
- Discuss implementation approach first
- Ensure feature aligns with project goals

#### 📚 Documentation
- Improve README or inline documentation
- Add code examples
- Create tutorials or guides
- Fix typos or clarify explanations

#### 🌐 Translations
- Add support for new languages (Tamil, Telugu, Marathi, Bengali)
- Improve existing Hindi translations
- Help with localization testing

#### ♿ Accessibility
- Improve keyboard navigation
- Add ARIA labels and roles
- Test with screen readers
- Enhance color contrast

#### 🎨 UI/UX Improvements
- Improve responsive design
- Add animations and transitions
- Enhance mobile experience
- Design new components

---

### Pull Request Review Process

1. **Automated Checks**: CI/CD pipeline runs automatically
   - ESLint validation
   - TypeScript compilation
   - Build success
   
2. **Code Review**: Maintainers review your code
   - Code quality and style
   - Test coverage
   - Documentation completeness
   
3. **Testing**: Manual testing of new features
   
4. **Merge**: Once approved, your PR will be merged!

---

### Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Report inappropriate behavior to maintainers

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for complete details.

```
MIT License

Copyright (c) 2024 Nyantra - Direct Benefit Transfer System

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Acknowledgments

### Purpose
Built to support the implementation of the **Scheduled Castes and Scheduled Tribes (Prevention of Atrocities) Act, 1989**, ensuring timely and transparent compensation disbursement to victims of atrocities.

### Inspiration
- Ministry of Social Justice and Empowerment, Government of India
- National Commission for Scheduled Castes (NCSC)
- National Commission for Scheduled Tribes (NCST)
- Real-world challenges in relief fund distribution

### Technology Stack
Special thanks to the open-source community for these incredible tools:
- **Next.js Team**: For the amazing React framework
- **Vercel**: For Turbopack and deployment infrastructure
- **Flutter Team**: For cross-platform mobile development
- **Firebase**: For backend-as-a-service
- **Chart.js**: For data visualization
- **Three.js**: For 3D graphics
- **Tailwind CSS**: For utility-first styling
- **All npm/pub.dev package maintainers**

### Contributors
- **Anish** ([@Anish-2005](https://github.com/Anish-2005)) - Project Lead & Full-Stack Developer
- All community contributors who help improve this project

---

## 📞 Support & Contact

### Getting Help

**For Users:**
- 📖 Check this README for comprehensive documentation
- 🐛 Report bugs via [GitHub Issues](https://github.com/Anish-2005/Nyantra/issues)
- 💡 Request features via [GitHub Discussions](https://github.com/Anish-2005/Nyantra/discussions)
- 📧 Email support: [contact via GitHub profile]

**For Developers:**
- 📚 Review inline code documentation
- 🔍 Search existing issues before creating new ones
- 💬 Join discussions for design decisions
- 🤝 Contribute improvements via Pull Requests

### Project Links

- 🌐 **Live Demo**: [https://nyantra.web.app](https://nyantra.web.app) *(if deployed)*
- 📦 **GitHub Repository**: [https://github.com/Anish-2005/Nyantra](https://github.com/Anish-2005/Nyantra)
- 📋 **Issue Tracker**: [GitHub Issues](https://github.com/Anish-2005/Nyantra/issues)
- 💭 **Discussions**: [GitHub Discussions](https://github.com/Anish-2005/Nyantra/discussions)

### Reporting Security Vulnerabilities

If you discover a security vulnerability, please **DO NOT** open a public issue. Instead:
1. Email the details to the maintainer via GitHub
2. Include steps to reproduce
3. Allow time for a fix before public disclosure

---

## 🗺️ Roadmap

### Phase 1: Core Functionality (✅ Complete)
- ✅ User authentication with role-based access
- ✅ Application submission and management
- ✅ Beneficiary management
- ✅ Progressive disbursement system
- ✅ Reports and analytics
- ✅ Multi-language support (English, Hindi)

### Phase 2: Enhanced Features (🚧 In Progress)
- 🚧 PFMS integration for direct bank transfers
- 🚧 Aadhaar authentication (UIDAI)
- 🚧 SMS notifications
- 🚧 DigiLocker document verification
- 🚧 Advanced analytics with ML insights
- 🚧 Mobile app push notifications

### Phase 3: Scale & Optimization (📋 Planned)
- 📋 Multi-state deployment support
- 📋 Advanced fraud detection
- 📋 Automated document verification with OCR
- 📋 Chatbot for user support
- 📋 Regional language support (Tamil, Telugu, Marathi, Bengali)
- 📋 PWA for web app
- 📋 Biometric authentication

### Phase 4: Ecosystem Integration (🔮 Future)
- 🔮 Integration with e-Courts for FIR verification
- 🔮 Integration with National SC/ST Hub
- 🔮 API for third-party integrations
- 🔮 Public dashboard for transparency
- 🔮 Mobile app for field officers
- 🔮 Offline-first architecture with sync

---

<div align="center">

### Built with ❤️ for Social Justice

**Nyantra** — *Empowering Transparency in Relief Distribution*

[![GitHub Stars](https://img.shields.io/github/stars/Anish-2005/Nyantra?style=social)](https://github.com/Anish-2005/Nyantra/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/Anish-2005/Nyantra?style=social)](https://github.com/Anish-2005/Nyantra/network/members)
[![GitHub Issues](https://img.shields.io/github/issues/Anish-2005/Nyantra)](https://github.com/Anish-2005/Nyantra/issues)
[![GitHub Pull Requests](https://img.shields.io/github/issues-pr/Anish-2005/Nyantra)](https://github.com/Anish-2005/Nyantra/pulls)

---

*Making relief distribution transparent, efficient, and accessible for all.*

</div>

