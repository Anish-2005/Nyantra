# Nyantara — Direct Benefit Transfer Management System

<div align="center">
  <img src="/public/Logo-Light.png" alt="Nyantara Logo" width="120" height="120"/>
  
  ### **Nyantara**
  
  *Empowering Social Justice Through Technology*
  
  [![Next.js](https://img.shields.io/badge/Next.js-16.0-black?logo=next.js)](https://nextjs.org/)
  [![Flutter](https://img.shields.io/badge/Flutter-3.8-02569B?logo=flutter)](https://flutter.dev/)
  [![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange?logo=firebase)](https://firebase.google.com/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
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
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**Nyantara** is a comprehensive Direct Benefit Transfer (DBT) management platform designed to streamline compensation disbursement for victims of atrocities under the Scheduled Castes and Scheduled Tribes (Prevention of Atrocities) Act, 1989. The system ensures transparency, efficiency, and accountability in relief fund distribution through:

- **🌐 Web Portal**: Full-featured administrative dashboard for government officials to manage applications, beneficiaries, disbursements, grievances, and comprehensive analytics
- **📱 Mobile Application**: User-friendly Flutter app enabling beneficiaries to submit applications, upload documents, track status, and receive real-time notifications
- **⚡ Real-time Synchronization**: Firebase-powered instant data sync across all platforms
- **🌍 Multi-language Support**: Complete English and Hindi localization with easy extensibility
- **♿ Accessibility First**: WCAG 2.1 Level AA compliant with keyboard navigation and screen reader support
- **🔒 Security & Privacy**: End-to-end encryption, role-based access control, and audit logging

### Problem Statement

Traditional relief fund disbursement systems face challenges like:
- Manual paperwork causing delays and inefficiencies
- Lack of transparency in application processing
- Difficulty in tracking fund distribution status
- Limited accessibility for rural beneficiaries
- No centralized database for beneficiary management

### Our Solution

Nyantara digitizes the entire workflow from application submission to fund disbursement, providing:
- **Transparency**: Real-time tracking of every stage
- **Efficiency**: Automated workflows and notifications
- **Accessibility**: Mobile-first design with offline capabilities
- **Accountability**: Complete audit trails and reporting
- **Scalability**: Cloud-based architecture supporting millions of users

---

## ✨ Key Features

### 🖥️ Web Portal (Administrative Dashboard)

#### Application Management
- **Smart Application Processing**: Review, approve, or reject applications with detailed workflow tracking
- **Document Verification**: Secure document upload and verification with Aadhaar integration
- **Bulk Operations**: Process multiple applications simultaneously
- **Advanced Filters**: Search and filter by status, act type, priority, district, and date ranges
- **Application Analytics**: Real-time statistics and trend analysis

#### Beneficiary Management
- **Comprehensive Profiles**: Complete beneficiary information with contact details and demographics
- **Aadhaar Integration**: Secure identity verification and validation
- **Document Repository**: Centralized storage for FIR reports, medical records, and legal documents
- **Beneficiary Search**: Quick lookup by name, Aadhaar, phone number, or application ID
- **History Tracking**: Complete transaction and interaction history

#### Disbursement Management
- **Progressive Payment System**: Installment-based disbursements (Initial 25%, Interim 50%, Final 25%)
- **Payment Tracking**: Real-time status updates from initiation to completion
- **Bank Integration Ready**: Support for PFMS and direct bank transfer integration
- **Automated Alerts**: Email and SMS notifications for payment milestones
- **Disbursement Reports**: Detailed transaction logs and reconciliation reports

#### Reports & Analytics
- **Interactive Dashboards**: Real-time visualizations with Chart.js
- **Custom Report Generation**: PDF exports with comprehensive data
- **Performance Metrics**: Application processing times, success rates, and disbursement analytics
- **Trend Analysis**: Historical data visualization and forecasting
- **Export Capabilities**: CSV and PDF export for offline analysis

#### Grievance Management
- **Feedback System**: Collect and manage user feedback and complaints
- **Issue Tracking**: Status-based grievance monitoring
- **Resolution Workflows**: Automated assignment and escalation
- **Sentiment Analysis**: Track user satisfaction and system performance

### 📱 Mobile Application (Beneficiary Interface)

#### Application Features
- **Guided Application Form**: Step-by-step application submission with validation
- **Speech-to-Text Input**: Voice-enabled form filling for accessibility
- **Document Upload**: Camera integration for document capture
- **Offline Draft Saving**: Continue applications without internet connectivity
- **Auto-save Functionality**: Never lose your progress

#### Status Tracking
- **Real-time Updates**: Live application status with push notifications
- **Disbursement Timeline**: Visual progress indicator for payment stages
- **Alert System**: In-app notifications for important updates
- **Email Notifications**: Automated email alerts for status changes
- **History View**: Complete application and payment history

#### User Experience
- **Intuitive UI**: Material Design 3 with glassmorphism effects
- **Dark Mode**: System-aware theme switching
- **Multi-language**: Seamless English/Hindi language toggle
- **Responsive Design**: Optimized for all screen sizes
- **Accessibility**: Screen reader support and high contrast modes

### 🔧 Core System Features

#### Progressive Payment System
- **Three-Stage Disbursement**: 25% initial, 50% interim, 25% final payments
- **Configurable Installments**: Flexible payment schedules based on case requirements
- **Automatic Calculations**: Smart amount distribution across installments
- **Payment Validation**: Bank account verification and duplicate detection
- **Transaction Logging**: Complete audit trail for all financial transactions

#### Integration Capabilities
- **Firebase Suite**: Firestore, Authentication, Cloud Storage, and Cloud Functions
- **Email Service**: SMTP integration for automated notifications
- **SMS Gateway Ready**: Infrastructure for SMS notification integration
- **PFMS Integration**: Ready for Public Financial Management System connection
- **DigiLocker Support**: Document verification through government portal
- **Aadhaar Authentication**: UIDAI integration for identity verification

#### Security & Compliance
- **Role-Based Access Control**: Admin and beneficiary roles with granular permissions
- **Data Encryption**: End-to-end encryption for sensitive information
- **Audit Logging**: Complete activity tracking for compliance
- **Session Management**: Secure token-based authentication
- **Privacy Compliance**: GDPR and data protection standards adherence
- **Secure File Storage**: Encrypted document storage with access controls

#### Reporting & Analytics
- **Dynamic Dashboards**: Customizable widgets and metrics
- **Advanced Filtering**: Multi-dimensional data analysis
- **Export Formats**: PDF, CSV, and JSON export options
- **Scheduled Reports**: Automated report generation and distribution
- **Data Visualization**: Interactive charts with drill-down capabilities

---

## 🛠 Technology Stack

### Frontend — Web Application

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Framework** | Next.js | 16.0+ | React framework with App Router and Server Components |
| **Language** | TypeScript | 5.0+ | Type-safe development with strict mode |
| **Styling** | Tailwind CSS | 4.0+ | Utility-first CSS with custom design system |
| **UI Components** | React 19 | 19.1.0 | Component-based architecture with concurrent features |
| **State Management** | React Context API | Built-in | Global state for auth, theme, and localization |
| **Animations** | Framer Motion | 12.23+ | Smooth transitions and interactive animations |
| **Data Visualization** | Chart.js | 4.4+ | Interactive charts and graphs |
| **3D Graphics** | Three.js + R3F | 0.180+ | WebGL-based 3D visualizations |
| **Icons** | Lucide React | 0.544+ | Beautiful, consistent icon set |
| **Forms** | React Hook Form | Native | Form validation and management |
| **PDF Generation** | jsPDF | 3.0+ | Client-side PDF generation with AutoTable |

### Backend & Database

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Database** | Firebase Firestore | NoSQL real-time database with offline support |
| **Authentication** | Firebase Auth | Email/password and OAuth (Google) authentication |
| **File Storage** | Firebase Storage + Cloudinary | Secure document and image storage |
| **API Routes** | Next.js API Routes | Server-side endpoints for secure operations |
| **Email Service** | Nodemailer + Gmail SMTP | Automated email notifications |
| **Serverless Functions** | Firebase Cloud Functions | Background processing and triggers |

### Mobile Application — Flutter

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Framework** | Flutter | 3.8+ | Cross-platform mobile development |
| **Language** | Dart | 3.8+ | Optimized for mobile performance |
| **State Management** | Provider | 6.1+ | Reactive state management pattern |
| **Backend** | Firebase SDK | 3.0+ | Same backend as web application |
| **Local Storage** | Shared Preferences | 2.2+ | Persistent local data storage |
| **Offline Support** | SQLite (sqflite) | 2.3+ | Local database for offline functionality |
| **PDF Generation** | pdf + printing | 3.10+ / 5.13+ | Mobile PDF creation and export |
| **Speech Input** | speech_to_text | 7.0+ | Voice-enabled form filling |
| **Navigation** | go_router | 14.0+ | Declarative routing and deep linking |
| **Animations** | flutter_animate | 4.5+ | Declarative animations |
| **Network** | http + connectivity_plus | 1.2+ / 6.0+ | API calls and network monitoring |

### Development Tools & Infrastructure

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Version Control** | Git + GitHub | Source code management and collaboration |
| **Package Management** | npm + Flutter Pub | Dependency management |
| **Code Quality** | ESLint + Flutter Lints | Code linting and formatting |
| **Build Tools** | Next.js Turbopack + Flutter Build | Optimized production builds |
| **Deployment** | Firebase Hosting | Web application hosting |
| **CI/CD** | GitHub Actions | Automated testing and deployment |
| **Environment Config** | .env files | Secure configuration management |

### Third-Party Integrations

| Service | Purpose |
|---------|---------|
| **Cloudinary** | Advanced image optimization and CDN |
| **Gmail SMTP** | Reliable email delivery service |
| **Firebase Analytics** | User behavior and performance tracking |
| **Firebase Crashlytics** | Mobile app crash reporting |
| **Google Sign-In** | OAuth authentication provider |

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Applications                       │
├──────────────────────────┬──────────────────────────────────┤
│   Web Portal (Next.js)   │   Mobile App (Flutter)           │
│   - Admin Dashboard      │   - Beneficiary Interface        │
│   - Officer Portal       │   - Application Submission       │
│   - Analytics & Reports  │   - Status Tracking              │
└──────────────┬───────────┴────────────┬─────────────────────┘
               │                        │
               └────────────┬───────────┘
                            │
                    ┌───────▼────────┐
                    │  Firebase SDK  │
                    └───────┬────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌──────▼───────┐  ┌───────▼─────────┐
│   Firestore    │  │  Firebase    │  │   Firebase      │
│   Database     │  │  Auth        │  │   Storage       │
│                │  │              │  │                 │
│  - Applications│  │  - Email/    │  │  - Documents    │
│  - Beneficiaries│ │    Password  │  │  - Images       │
│  - Disbursements│ │  - OAuth     │  │  - Reports      │
│  - Reports     │  │  - Sessions  │  │                 │
└────────────────┘  └──────────────┘  └─────────────────┘
```

### Data Flow

```
Application Submission → Document Upload → Review Process → 
Approval Decision → Disbursement Initiation → Payment Tracking → 
Completion & Notification
```

### Security Architecture

```
┌──────────────────────────────────────────────────┐
│              Security Layers                      │
├──────────────────────────────────────────────────┤
│  1. Authentication (Firebase Auth)               │
│  2. Authorization (Role-Based Access Control)    │
│  3. Data Encryption (TLS + At-Rest)              │
│  4. Input Validation (Client + Server)           │
│  5. Audit Logging (All Operations)               │
│  6. Session Management (Secure Tokens)           │
└──────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
Nyantara/
├── 📁 src/                                    # Web Application (Next.js)
│   ├── 📁 app/                                # Next.js App Router
│   │   ├── 📁 dashboard/                      # Admin Dashboard
│   │   │   ├── 📁 applications/               # Application management
│   │   │   ├── 📁 beneficiaries/              # Beneficiary management
│   │   │   ├── 📁 disbursements/              # Disbursement tracking
│   │   │   ├── 📁 reports/                    # Reports & analytics
│   │   │   ├── 📁 grievances/                 # Grievance management
│   │   │   └── page.tsx                       # Dashboard home
│   │   ├── 📁 user-dashboard/                 # Beneficiary Dashboard
│   │   │   ├── 📁 applications/               # My applications
│   │   │   ├── 📁 disbursements/              # Payment tracking
│   │   │   └── 📁 profile/                    # Profile management
│   │   ├── 📁 api/                            # API Routes
│   │   │   ├── 📁 applications/               # Application APIs
│   │   │   ├── 📁 beneficiaries/              # Beneficiary APIs
│   │   │   ├── 📁 upload/                     # File upload handler
│   │   │   └── 📁 email/                      # Email service
│   │   ├── 📁 login/                          # Authentication pages
│   │   ├── 📁 choose-role/                    # Role selection
│   │   ├── layout.tsx                         # Root layout
│   │   ├── page.tsx                           # Landing page
│   │   └── globals.css                        # Global styles
│   ├── 📁 components/                         # Reusable UI Components
│   │   ├── AnalyticsChart.tsx                 # Chart components
│   │   ├── Sidebar.tsx                        # Navigation sidebar
│   │   ├── UserSidebar.tsx                    # User sidebar
│   │   ├── ThemeToggle.tsx                    # Dark mode toggle
│   │   ├── LanguageToggle.tsx                 # Language switcher
│   │   ├── NotificationDropdown.tsx           # Notifications
│   │   └── LoadingState.tsx                   # Loading indicators
│   ├── 📁 context/                            # React Context Providers
│   │   ├── AuthContext.tsx                    # Authentication state
│   │   ├── ThemeContext.tsx                   # Theme management
│   │   └── LocaleContext.tsx                  # Internationalization
│   ├── 📁 lib/                                # Utilities & Config
│   │   ├── firebase.ts                        # Firebase initialization
│   │   └── id.ts                              # ID generation utilities
│   ├── 📁 locales/                            # Translation Files
│   │   ├── en.json                            # English translations
│   │   └── hi.json                            # Hindi translations
│   └── 📁 types/                              # TypeScript Definitions
│       ├── application.ts                     # Application types
│       ├── beneficiary.ts                     # Beneficiary types
│       └── disbursement.ts                    # Disbursement types
│
├── 📁 Nyantra-Mobile/                         # Flutter Mobile Application
│   ├── 📁 lib/                                # Dart Source Code
│   │   ├── main.dart                          # App entry point
│   │   └── 📁 src/                            # Feature Modules
│   │       ├── 📁 core/                       # Core Functionality
│   │       │   ├── 📁 models/                 # Data models
│   │       │   ├── 📁 providers/              # State management
│   │       │   ├── 📁 services/               # Business logic
│   │       │   └── 📁 widgets/                # Shared widgets
│   │       └── 📁 features/                   # Feature Modules
│   │           ├── 📁 authentication/         # Login & registration
│   │           ├── 📁 dashboard/              # Main dashboard
│   │           │   ├── 📁 screens/            # Screen components
│   │           │   └── 📁 widgets/            # Feature widgets
│   │           ├── 📁 beneficiaries/          # Beneficiary features
│   │           ├── 📁 disbursements/          # Payment features
│   │           └── 📁 grievances/             # Feedback features
│   ├── 📁 assets/                             # Static Assets
│   │   ├── 📁 translations/                   # i18n JSON files
│   │   │   ├── en.json                        # English
│   │   │   └── hi.json                        # Hindi
│   │   └── 📁 images/                         # App images
│   ├── 📁 android/                            # Android Configuration
│   ├── 📁 ios/                                # iOS Configuration
│   └── pubspec.yaml                           # Flutter Dependencies
│
├── 📁 scripts/                                # Utility Scripts
│   ├── extract-i18n.js                        # Extract translation keys
│   ├── i18n-replace.js                        # Update translations
│   ├── check-i18n-imports.js                  # Validate i18n usage
│   └── export-i18n-csv.js                     # Export to CSV
│
├── 📁 public/                                 # Static Assets
│   ├── Logo-Light.png                         # App logo (light)
│   ├── Logo-Dark.png                          # App logo (dark)
│   └── favicon.ico                            # Favicon
│
├── 📄 Configuration Files
├── package.json                               # Node.js dependencies
├── tsconfig.json                              # TypeScript config
├── next.config.ts                             # Next.js config
├── tailwind.config.ts                         # Tailwind CSS config
├── eslint.config.mjs                          # ESLint config
├── firebase.json                              # Firebase config
├── firestore.rules                            # Firestore security rules
├── firestore.indexes.json                     # Firestore indexes
├── .env.local                                 # Environment variables (not in repo)
└── README.md                                  # This file
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

Initialize your Firestore database with these collections:

```javascript
// Collections Structure
applications/
  └── {applicationId}
      ├── applicantName: string
      ├── aadhaar: string
      ├── phoneNumber: string
      ├── actType: string
      ├── offenceCategory: string
      ├── amount: number
      ├── status: 'pending' | 'inreview' | 'approved' | 'rejected'
      ├── createdAt: timestamp
      └── ownerId: string

beneficiaries/
  └── {beneficiaryId}
      ├── name: string
      ├── aadhaar: string
      ├── phone: string
      ├── email: string
      ├── address: string
      ├── ownerId: string
      └── createdAt: timestamp

disbursements/
  └── {disbursementId}
      ├── applicationId: string
      ├── beneficiaryId: string
      ├── reliefAmount: number
      ├── disbursedAmount: number
      ├── totalInstallments: number
      ├── completedInstallments: number
      ├── status: 'pending' | 'processing' | 'completed'
      └── createdAt: timestamp

reports/
  └── {reportId}
      ├── title: string
      ├── description: string
      ├── category: string
      ├── status: string
      └── createdAt: timestamp
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

## 📈 Performance

- **Web Vitals**: Optimized for Core Web Vitals
- **Bundle Size**: Tree-shaken imports and lazy loading
- **Caching**: Intelligent caching strategies
- **Mobile**: Optimized for low-bandwidth environments
- **PWA Ready**: Service worker and offline capabilities

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript strict mode
- Use ESLint and Prettier for code formatting
- Write tests for new features
- Update documentation for API changes
- Ensure accessibility compliance

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built for disaster relief management under PM-CARES initiatives
- Inspired by real-world humanitarian aid workflows
- Thanks to the open-source community for the amazing tools and libraries

---

## 📞 Support

For support and questions:
- Create an issue in this repository
- Contact the development team
- Check the documentation in `/docs` folder

---

*Built with ❤️ for efficient disaster relief operations*

