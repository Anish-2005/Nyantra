# Development Setup Guide

## Overview

This guide provides step-by-step instructions for setting up the development environment for the Nyantara Direct Benefit Transfer (DBT) management system. The system consists of a Next.js web application and a Flutter mobile application.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Repository Setup](#repository-setup)
3. [Web Application Setup](#web-application-setup)
4. [Mobile Application Setup](#mobile-application-setup)
5. [Firebase Configuration](#firebase-configuration)
6. [Database Setup](#database-setup)
7. [Development Tools](#development-tools)
8. [Testing Setup](#testing-setup)
9. [Code Quality](#code-quality)
10. [Contributing Guidelines](#contributing-guidelines)

## Prerequisites

### System Requirements

- **Operating System**: Windows 10/11, macOS 12+, or Ubuntu 20.04+
- **Processor**: Intel Core i5 or equivalent (8GB RAM minimum, 16GB recommended)
- **Storage**: 20GB free space
- **Internet**: Stable broadband connection

### Required Software

#### For Web Development
- **Node.js**: v18.0.0 or higher ([Download](https://nodejs.org/))
- **npm**: v9.0.0 or higher (comes with Node.js)
- **Git**: v2.30.0 or higher ([Download](https://git-scm.com/))

#### For Mobile Development
- **Flutter SDK**: v3.10.0 or higher ([Installation Guide](https://flutter.dev/docs/get-started/install))
- **Dart SDK**: v3.0.0 or higher (comes with Flutter)
- **Android Studio**: Latest stable version ([Download](https://developer.android.com/studio))
- **Xcode**: Latest version (macOS only, [Download from App Store](https://apps.apple.com/us/app/xcode/id497799835))

#### For Firebase Development
- **Firebase CLI**: v12.0.0 or higher
- **Google Cloud SDK**: Latest version (optional)

### Development Accounts

1. **GitHub Account**: For repository access
2. **Firebase Account**: For Firebase services
3. **Google Cloud Account**: For cloud services
4. **Apple Developer Account**: For iOS development (macOS only)
5. **Google Play Console**: For Android publishing

## Repository Setup

### Clone Repository

```bash
# Clone the repository
git clone https://github.com/your-organization/nyantara.git

# Navigate to project directory
cd nyantara

# Verify the structure
ls -la
```

### Branch Strategy

```bash
# Create and checkout development branch
git checkout -b development

# Create feature branch for your work
git checkout -b feature/your-feature-name
```

### Initial Setup

```bash
# Install root dependencies
npm install

# Setup git hooks (if using husky)
npm run prepare

# Verify installation
npm run dev --version
```

## Web Application Setup

### Environment Configuration

1. **Create Environment Files**
```bash
# Copy environment template
cp .env.example .env.local

# Edit with your local configuration
nano .env.local
```

2. **Environment Variables**
```env
# Firebase Configuration (Development)
NEXT_PUBLIC_FIREBASE_API_KEY=your-dev-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-dev.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-dev
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-dev.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Application Configuration
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Development Settings
NEXT_PUBLIC_DEBUG=true
NEXT_PUBLIC_LOG_LEVEL=debug

# External Services (Development keys)
STRIPE_PUBLISHABLE_KEY=pk_test_...
SENDGRID_API_KEY=SG.test...
```

### Install Dependencies

```bash
# Install all dependencies
npm install

# Install additional development dependencies
npm install --save-dev @types/node typescript eslint prettier

# Verify installation
npm list --depth=0
```

### Development Server

```bash
# Start development server
npm run dev

# Server will be available at http://localhost:3000
```

### Build for Production (Testing)

```bash
# Build production version
npm run build

# Start production server locally
npm start

# Server will be available at http://localhost:3000
```

## Mobile Application Setup

### Flutter Environment Setup

1. **Verify Flutter Installation**
```bash
# Check Flutter version
flutter --version

# Check Flutter doctor
flutter doctor

# Accept Android licenses
flutter doctor --android-licenses
```

2. **Configure IDE**

**For Android Studio:**
- Open Android Studio
- Install Flutter and Dart plugins
- Open project: `File > Open > Nyantra-Mobile`

**For VS Code:**
- Install Flutter and Dart extensions
- Open folder: `Nyantra-Mobile`

### Mobile Dependencies

```bash
# Navigate to mobile app
cd Nyantra-Mobile

# Install Flutter dependencies
flutter pub get

# Upgrade dependencies (if needed)
flutter pub upgrade

# Clean and get dependencies
flutter clean && flutter pub get
```

### Mobile Configuration

1. **Firebase Configuration**
```bash
# Add Firebase to Flutter app
flutterfire configure

# Select your Firebase project
# Choose platforms: android, ios
```

2. **Environment Configuration**
```dart
// lib/core/config/app_config.dart
class AppConfig {
  static const bool isProduction = false;
  static const String apiBaseUrl = 'http://10.0.2.2:3000/api'; // Android emulator
  // static const String apiBaseUrl = 'http://localhost:3000/api'; // iOS simulator

  static const String firebaseProjectId = 'your-project-dev';
}
```

### Run Mobile App

```bash
# Run on Android emulator
flutter run

# Run on iOS simulator (macOS only)
flutter run --device-id=$(flutter devices | grep iphone | head -1 | awk '{print $1}')

# Run on connected device
flutter run --device-id=YOUR_DEVICE_ID
```

### Build Mobile App

```bash
# Build APK for Android
flutter build apk --debug

# Build iOS app (macOS only)
flutter build ios --debug
```

## Firebase Configuration

### Create Firebase Project

1. **Development Project**
```bash
# Create Firebase project
firebase projects:create nyantara-dev

# Set as default project
firebase use nyantara-dev
```

2. **Enable Services**
```bash
# Enable required services
firebase services:enable firestore
firebase services:enable auth
firebase services:enable storage
firebase services:enable hosting
```

### Firestore Setup

1. **Initialize Firestore**
```bash
# Initialize Firebase in project
firebase init firestore

# Choose Firestore when prompted
# Select development project
```

2. **Deploy Rules and Indexes**
```bash
# Deploy Firestore security rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes
```

### Authentication Setup

1. **Configure Auth Providers**
```bash
# Enable Email/Password authentication
# Go to Firebase Console > Authentication > Sign-in method
# Enable Email/Password and Phone providers
```

2. **Configure OAuth (Optional)**
```bash
# Enable Google, Facebook, etc. as needed
# Add OAuth client IDs to Firebase Console
```

### Storage Setup

1. **Configure Storage Rules**
```bash
# Initialize storage
firebase init storage

# Deploy storage rules
firebase deploy --only storage
```

## Database Setup

### Firestore Collections

The application uses the following Firestore collections:

```javascript
// Main collections
- beneficiaries: Beneficiary profiles and verification data
- applications: DBT applications with status tracking
- disbursements: Payment records and installment tracking
- grievances: User complaints and resolution tracking
- feedbacks: User feedback and ratings
- officers: Officer profiles and assignments
- categories: System categories and configurations
```

### Seed Data

```typescript
// Run seed script for development data
npm run seed:dev

// Or manually seed data
node scripts/seed-development-data.js
```

### Development Data

```typescript
// Sample beneficiary data
const sampleBeneficiaries = [
  {
    id: 'BEN-DEV-001',
    name: 'John Doe',
    aadhaarNumber: '123456789012',
    phone: '+91-9876543210',
    district: 'Mumbai',
    status: 'active',
    verificationStatus: 'verified'
  }
];

// Sample application data
const sampleApplications = [
  {
    id: 'APP-DEV-001',
    beneficiaryId: 'BEN-DEV-001',
    actType: 'PoA',
    status: 'approved',
    amount: 50000
  }
];
```

## Development Tools

### Code Editor Setup

#### VS Code Configuration

```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "emmet.includeLanguages": {
    "typescript": "typescriptreact",
    "typescriptreact": "typescriptreact"
  },
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

#### Recommended Extensions

```json
// .vscode/extensions.json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json",
    "Dart-Code.dart-code",
    "Dart-Code.flutter",
    "ms-vscode.vscode-flutter-helper"
  ]
}
```

### Development Scripts

```json
// package.json scripts
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "seed:dev": "node scripts/seed-development-data.js",
    "firebase:emulators": "firebase emulators:start",
    "clean": "rm -rf .next node_modules/.cache"
  }
}
```

### Firebase Emulators

```bash
# Start Firebase emulators
npm run firebase:emulators

# Emulators available at:
# - Firestore: http://localhost:8080
# - Authentication: http://localhost:9099
# - Storage: http://localhost:9199
# - Hosting: http://localhost:5000
```

### Debugging Tools

#### Web Application Debugging

```typescript
// Add to .env.local for debugging
NEXT_PUBLIC_DEBUG=true
NEXT_PUBLIC_LOG_LEVEL=debug

// Console logging
console.log('Debug info:', data);
console.error('Error:', error);
```

#### Mobile Application Debugging

```bash
# Enable Flutter debugging
flutter run --debug

# Use DevTools for performance profiling
flutter pub global run devtools
flutter pub global run devtools --app-size
```

## Testing Setup

### Unit Testing

```bash
# Install testing dependencies
npm install --save-dev jest @testing-library/react @testing-library/jest-dom

# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Integration Testing

```typescript
// Example test file
// __tests__/components/BeneficiaryForm.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import BeneficiaryForm from '@/components/BeneficiaryForm';

test('renders beneficiary form', () => {
  render(<BeneficiaryForm />);
  expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
});

test('validates Aadhaar number', async () => {
  render(<BeneficiaryForm />);
  const aadhaarInput = screen.getByLabelText(/aadhaar/i);
  fireEvent.change(aadhaarInput, { target: { value: '123' } });
  expect(screen.getByText(/must be 12 digits/i)).toBeInTheDocument();
});
```

### Mobile Testing

```bash
# Run Flutter tests
flutter test

# Run integration tests
flutter drive --target=test_driver/app.dart
```

### End-to-End Testing

```bash
# Install Playwright for E2E testing
npm install --save-dev @playwright/test

# Run E2E tests
npx playwright test

# Install browsers
npx playwright install
```

## Code Quality

### Linting and Formatting

```bash
# ESLint configuration
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Type checking
npm run type-check
```

### Pre-commit Hooks

```bash
# Install husky for git hooks
npm install --save-dev husky

# Setup pre-commit hook
npx husky add .husky/pre-commit "npm run lint && npm run type-check"

# Setup pre-push hook
npx husky add .husky/pre-push "npm run test"
```

### Code Quality Tools

```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

## Contributing Guidelines

### Development Workflow

1. **Create Feature Branch**
```bash
git checkout -b feature/your-feature-name
```

2. **Make Changes**
```bash
# Write code
# Add tests
# Update documentation
```

3. **Commit Changes**
```bash
git add .
git commit -m "feat: add new feature description"
```

4. **Push and Create PR**
```bash
git push origin feature/your-feature-name
# Create pull request on GitHub
```

### Code Review Process

1. **Automated Checks**
   - Linting passes
   - Tests pass
   - Type checking passes
   - Build succeeds

2. **Manual Review**
   - Code quality
   - Security considerations
   - Performance impact
   - Documentation updates

### Commit Message Convention

```bash
# Format: type(scope): description

# Examples:
feat(auth): add biometric authentication
fix(disbursement): resolve progressive payment bug
docs(api): update endpoint documentation
test(grievance): add resolution workflow tests
refactor(components): optimize beneficiary form
```

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots
If applicable, add screenshots

## Checklist
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] Security considerations addressed
```

### Release Process

1. **Version Bumping**
```bash
npm version patch  # or minor, major
```

2. **Changelog Update**
```markdown
# Changelog

## [1.2.3] - 2025-12-15
### Added
- New feature description

### Fixed
- Bug fix description

### Changed
- Breaking change description
```

3. **Release Creation**
```bash
# Create release branch
git checkout -b release/v1.2.3

# Tag release
git tag v1.2.3

# Push tags
git push origin v1.2.3
```

This comprehensive development setup guide ensures developers can quickly get started with the Nyantara DBT system and follow best practices for code quality and collaboration.