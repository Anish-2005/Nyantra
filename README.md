# Nyantra — Disaster Relief Management System

<div style="display:flex;gap:12px;align-items:center;margin-bottom:12px">
  <img src="/Logo-Light.png" alt="Nyantra" width="64" height="64" style="border-radius:8px;object-fit:cover;background:#fff;padding:6px"/>
  <div>
    <h1 style="margin:0">Nyantra</h1>
    <p style="margin:4px 0 0;color:#6b7280;max-width:60ch">A comprehensive disaster relief management platform with web and mobile applications for efficient beneficiary management, application processing, and fund disbursement tracking.</p>
  </div>
</div>

---

## 🌟 Overview

Nyantra is a dual-platform solution designed to streamline disaster relief operations under schemes like the Prime Minister's Citizen Assistance and Relief in Emergency Situations (PM-CARES) Fund. The system provides:

- **Web Portal**: Administrative dashboard for officers to manage applications, beneficiaries, disbursements, and analytics
- **Mobile App**: User-friendly interface for beneficiaries to submit applications, track status, and receive updates
- **Real-time Tracking**: End-to-end monitoring of relief fund distribution with progressive payment support
- **Multi-language Support**: English and Hindi localization
- **Accessibility**: WCAG-compliant design with keyboard navigation and screen reader support

---

## 🚀 Features

### Web Portal (Admin Dashboard)
- **Beneficiary Management**: Register and manage disaster-affected individuals
- **Application Processing**: Review and approve relief applications
- **Disbursement Tracking**: Monitor fund distribution with progressive payment support
- **Analytics & Reports**: Comprehensive dashboards with real-time statistics
- **Grievance Management**: Handle feedback and complaints
- **Multi-language Interface**: English/Hindi toggle with persistent preferences

### Mobile Application
- **Application Submission**: Easy form-based relief application process
- **Status Tracking**: Real-time updates on application and disbursement status
- **Document Upload**: Secure submission of supporting documents
- **Offline Capability**: Basic functionality without internet connection
- **Push Notifications**: Updates on application progress

### Core Functionality
- **Progressive Payments**: Support for installment-based disbursements (25%, 50%, 25% model)
- **Real-time Synchronization**: Firebase-powered data sync between web and mobile
- **Secure Authentication**: Firebase Auth with role-based access
- **Audit Trail**: Complete transaction history and user activity logs
- **Export Capabilities**: PDF reports and CSV data exports

---

## 🛠 Tech Stack

### Web Application
- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom theme variables
- **State Management**: React Context API
- **Backend**: Firebase (Firestore, Auth, Storage)
- **Animations**: Framer Motion
- **Charts**: Chart.js with date adapters

### Mobile Application
- **Framework**: Flutter
- **Language**: Dart
- **State Management**: Provider pattern
- **Backend**: Firebase (same as web)
- **Local Storage**: Shared Preferences
- **PDF Generation**: pdf package
- **Speech Recognition**: speech_to_text plugin

### Shared Infrastructure
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **File Storage**: Firebase Storage / Cloudinary
- **Email Service**: Gmail SMTP
- **Deployment**: Docker-ready

---

## 📁 Project Structure

```
nyantara/
├── src/                          # Web Application (Next.js)
│   ├── app/                      # Next.js App Router pages
│   │   ├── dashboard/            # Admin dashboard pages
│   │   ├── user-dashboard/       # Beneficiary dashboard pages
│   │   └── api/                  # API routes
│   ├── components/               # Reusable UI components
│   ├── context/                  # React contexts (Auth, Theme, Locale)
│   ├── lib/                      # Utilities and Firebase config
│   ├── locales/                  # Translation files (en.json, hi.json)
│   └── types/                    # TypeScript type definitions
├── Nyantra-Mobile/               # Flutter Mobile Application
│   ├── lib/                      # Dart source code
│   │   ├── src/                  # Feature modules
│   │   └── main.dart             # App entry point
│   ├── android/                  # Android-specific files
│   ├── ios/                      # iOS-specific files
│   └── pubspec.yaml              # Flutter dependencies
├── i18n/                         # Internationalization utilities
├── scripts/                      # Build and utility scripts
├── public/                       # Static assets
└── firebase.json                 # Firebase configuration
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Flutter SDK 3.0+
- Firebase project with Firestore enabled
- Android Studio (for mobile development)

### Web Application Setup

```bash
# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
# Edit .env.local with your Firebase credentials

# Start development server
npm run dev

# Open http://localhost:3000
```

### Mobile Application Setup

```bash
# Navigate to mobile app directory
cd Nyantra-Mobile

# Install Flutter dependencies
flutter pub get

# Configure Firebase (add google-services.json for Android)
# Follow Firebase Flutter setup guide

# Run on connected device/emulator
flutter run
```

### Environment Configuration

Create `.env.local` in the root directory:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Additional Services
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_URL=your_cloudinary_url
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_app_password
```

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

