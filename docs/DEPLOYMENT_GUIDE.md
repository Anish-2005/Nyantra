# Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the Nyantara Direct Benefit Transfer (DBT) management system to various environments including development, staging, and production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Firebase Configuration](#firebase-configuration)
4. [Web Application Deployment](#web-application-deployment)
5. [Mobile Application Deployment](#mobile-application-deployment)
6. [Database Setup](#database-setup)
7. [Security Configuration](#security-configuration)
8. [Monitoring Setup](#monitoring-setup)
9. [Backup and Recovery](#backup-and-recovery)
10. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Flutter**: v3.10.0 or higher
- **Dart**: v3.0.0 or higher
- **Firebase CLI**: v12.0.0 or higher
- **Docker**: v20.10.0 or higher (optional)
- **Kubernetes**: v1.24.0 or higher (for production)

### Infrastructure Requirements

- **Firebase Project**: With Firestore, Authentication, Storage, and Hosting enabled
- **Cloud Storage**: For document storage and backups
- **CDN**: For static asset delivery
- **SSL Certificate**: For HTTPS encryption
- **Domain**: Registered domain name

### Access Requirements

- Firebase project owner/admin access
- Google Cloud Platform access
- Apple Developer Program (for iOS deployment)
- Google Play Console (for Android deployment)

## Environment Setup

### Development Environment

1. **Clone Repository**
```bash
git clone https://github.com/your-org/nyantara.git
cd nyantara
```

2. **Install Dependencies**
```bash
# Web application
npm install

# Mobile application
cd Nyantra-Mobile
flutter pub get
cd ..
```

3. **Environment Variables**
```bash
# Create .env.local file
cp .env.example .env.local

# Edit with your configuration
nano .env.local
```

### Staging Environment

1. **Create Firebase Project**
```bash
# Create new Firebase project for staging
firebase projects:create nyantara-staging

# Set as active project
firebase use nyantara-staging
```

2. **Configure Environment**
```bash
# Create staging environment file
cp .env.example .env.staging

# Update with staging configuration
nano .env.staging
```

### Production Environment

1. **Create Production Firebase Project**
```bash
firebase projects:create nyantara-production
firebase use nyantara-production
```

2. **Production Environment Configuration**
```bash
cp .env.example .env.production
nano .env.production
```

## Firebase Configuration

### Project Setup

1. **Enable Required Services**
```bash
# Enable Firestore
firebase services:enable firestore

# Enable Authentication
firebase services:enable auth

# Enable Storage
firebase services:enable storage

# Enable Hosting
firebase services:enable hosting
```

2. **Configure Authentication Providers**
```bash
# Enable Email/Password authentication
firebase auth:config:set auth.emailPassword.enabled true

# Enable Phone authentication
firebase auth:config:set auth.phone.enabled true

# Configure OAuth providers (Google, etc.)
firebase auth:config:set auth.google.enabled true
```

3. **Firestore Security Rules**
```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes
```

### Environment Variables

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Application Configuration
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://api.your-domain.com

# Security
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-domain.com

# External Services
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
SENDGRID_API_KEY=SG....

# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Redis (for caching)
REDIS_URL=redis://localhost:6379

# Monitoring
SENTRY_DSN=https://your-sentry-dsn
```

## Web Application Deployment

### Vercel Deployment (Recommended)

1. **Connect Repository**
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link project
vercel link
```

2. **Configure Build Settings**
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["sin1"],
  "functions": {
    "src/pages/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    }
  ]
}
```

3. **Environment Variables**
```bash
# Set environment variables
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
vercel env add NEXTAUTH_SECRET
# ... add all required variables
```

4. **Deploy**
```bash
# Deploy to production
vercel --prod
```

### Firebase Hosting Deployment

1. **Build Application**
```bash
npm run build
```

2. **Configure Firebase Hosting**
```json
// firebase.json
{
  "hosting": {
    "public": ".next/static",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

3. **Deploy to Firebase**
```bash
firebase deploy --only hosting
```

### Docker Deployment

1. **Create Dockerfile**
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

2. **Build and Run**
```bash
# Build Docker image
docker build -t nyantara-web .

# Run container
docker run -p 3000:3000 nyantara-web
```

## Mobile Application Deployment

### Android Deployment

1. **Configure Keystore**
```bash
# Generate keystore
keytool -genkey -v -keystore nyantara.keystore -alias nyantara -keyalg RSA -keysize 2048 -validity 10000

# Move to android/app/
mv nyantara.keystore Nyantra-Mobile/android/app/
```

2. **Update Build Configuration**
```gradle
// android/app/build.gradle
android {
    signingConfigs {
        release {
            storeFile file('nyantara.keystore')
            storePassword 'your-store-password'
            keyAlias 'nyantara'
            keyPassword 'your-key-password'
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

3. **Build APK**
```bash
cd Nyantra-Mobile

# Build release APK
flutter build apk --release

# Build app bundle for Play Store
flutter build appbundle --release
```

4. **Deploy to Google Play**
```bash
# Upload to Play Console
# Use Google Play Console web interface or fastlane
```

### iOS Deployment

1. **Configure App Store Connect**
```bash
# Install fastlane
gem install fastlane

# Initialize fastlane
cd Nyantra-Mobile/ios
fastlane init
```

2. **Update Fastlane Configuration**
```ruby
# fastlane/Fastfile
platform :ios do
  desc "Deploy to TestFlight"
  lane :beta do
    build_app(
      scheme: "Runner",
      export_method: "app-store"
    )

    upload_to_testflight
  end

  desc "Deploy to App Store"
  lane :release do
    build_app(
      scheme: "Runner",
      export_method: "app-store"
    )

    upload_to_app_store
  end
end
```

3. **Build and Deploy**
```bash
cd Nyantra-Mobile/ios

# Deploy to TestFlight
fastlane beta

# Deploy to App Store
fastlane release
```

## Database Setup

### Firestore Configuration

1. **Initialize Firestore**
```javascript
// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

2. **Deploy Database Rules**
```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy indexes
firebase deploy --only firestore:indexes
```

### Data Migration

1. **Export Data (if migrating)**
```bash
# Export from existing database
firebase firestore:export backup-data

# Import to new database
firebase firestore:import backup-data
```

2. **Seed Initial Data**
```typescript
// Seed script for initial data
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const seedData = async () => {
  // Seed categories, priorities, etc.
  const categories = [
    { id: 'disbursement-delay', name: 'Disbursement Delay' },
    { id: 'document-issues', name: 'Document Issues' },
    // ... more categories
  ];

  for (const category of categories) {
    await addDoc(collection(db, 'categories'), category);
  }
};

seedData();
```

## Security Configuration

### SSL/TLS Setup

1. **Firebase Hosting (Automatic)**
```json
// firebase.json
{
  "hosting": {
    "public": "build",
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**",
        "headers": [
          {
            "key": "Strict-Transport-Security",
            "value": "max-age=31536000; includeSubDomains"
          },
          {
            "key": "X-Frame-Options",
            "value": "DENY"
          },
          {
            "key": "X-Content-Type-Options",
            "value": "nosniff"
          }
        ]
      }
    ]
  }
}
```

2. **Custom Domain SSL**
```bash
# Firebase automatic SSL
firebase hosting:enable-ssl

# Or use custom certificate
firebase hosting:ssl-certificates:create your-domain.com certificate.pem private-key.pem
```

### Authentication Security

1. **Configure Security Rules**
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Beneficiaries can only access their own data
    match /beneficiaries/{beneficiaryId} {
      allow read, write: if request.auth != null &&
        (request.auth.uid == resource.data.ownerId ||
         exists(/databases/$(database)/documents/officers/$(request.auth.uid)));
    }

    // Applications security
    match /applications/{applicationId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null &&
        request.resource.data.ownerId == request.auth.uid;
      allow update: if request.auth != null &&
        exists(/databases/$(database)/documents/officers/$(request.auth.uid));
    }
  }
}
```

2. **API Security**
```typescript
// API middleware for authentication
import { NextApiRequest, NextApiResponse } from 'next';
import { auth } from '@/lib/firebase-admin';

export const requireAuth = async (req: NextApiRequest, res: NextApiResponse) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    (req as any).user = decodedToken;
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

## Monitoring Setup

### Application Monitoring

1. **Sentry Integration**
```typescript
// sentry.client.config.js
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
```

2. **Performance Monitoring**
```typescript
// Performance monitoring
import { getPerformance } from 'firebase/performance';

const perf = getPerformance(app);

// Custom performance traces
const trace = perf.trace('application_submission');
trace.start();

// ... application logic

trace.stop();
```

### Infrastructure Monitoring

1. **Firebase Monitoring**
```bash
# Enable Firebase Performance Monitoring
firebase deploy --only hosting

# View metrics in Firebase Console
# https://console.firebase.google.com/project/your-project/performance
```

2. **Uptime Monitoring**
```bash
# Use services like:
# - Pingdom
# - UptimeRobot
# - New Relic
# - DataDog
```

## Backup and Recovery

### Automated Backups

1. **Firestore Backups**
```bash
# Schedule daily backups
firebase firestore:export backup-$(date +%Y%m%d)

# Store in Cloud Storage
gsutil cp backup-* gs://nyantara-backups/
```

2. **Storage Backups**
```bash
# Backup uploaded files
gsutil rsync -r gs://nyantara-uploads gs://nyantara-backups/uploads
```

### Disaster Recovery

1. **Recovery Procedures**
```bash
# Restore Firestore data
firebase firestore:import backup-20251215

# Restore storage files
gsutil rsync -r gs://nyantara-backups/uploads gs://nyantara-uploads
```

2. **Business Continuity Plan**
- **RTO (Recovery Time Objective)**: 4 hours
- **RPO (Recovery Point Objective)**: 1 hour
- **Backup Frequency**: Hourly for critical data, daily for full backups

## Troubleshooting

### Common Deployment Issues

1. **Build Failures**
```bash
# Clear cache and rebuild
rm -rf node_modules .next
npm install
npm run build

# Check for TypeScript errors
npx tsc --noEmit
```

2. **Firebase Deployment Issues**
```bash
# Check Firebase project
firebase projects:list
firebase use your-project-id

# Reinitialize if needed
firebase init
```

3. **Environment Variable Issues**
```bash
# Verify environment variables
printenv | grep NEXT_PUBLIC

# Check for missing variables
node -e "console.log(process.env)"
```

### Performance Issues

1. **Optimize Bundle Size**
```bash
# Analyze bundle
npm install --save-dev @next/bundle-analyzer
npm run build:analyze
```

2. **Database Performance**
```bash
# Add composite indexes for complex queries
firebase firestore:indexes:list
firebase deploy --only firestore:indexes
```

### Mobile App Issues

1. **Android Build Issues**
```bash
cd Nyantra-Mobile

# Clean and rebuild
flutter clean
flutter pub get
flutter build apk --debug

# Check for native code issues
flutter doctor -v
```

2. **iOS Build Issues**
```bash
cd Nyantra-Mobile

# Clean iOS build
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..

# Rebuild
flutter clean
flutter pub get
flutter build ios --debug
```

### Monitoring and Alerts

1. **Set Up Alerts**
```bash
# Firebase alerts
firebase functions:config:set alerts.error_threshold=10

# Custom monitoring alerts
# - Error rate > 5%
# - Response time > 3 seconds
# - Database connection failures
```

2. **Log Analysis**
```bash
# View Firebase logs
firebase functions:log

# Application logs
# Use logging service like Winston or Pino
```

This deployment guide provides comprehensive instructions for successfully deploying the Nyantara DBT system across different environments while ensuring security, performance, and reliability.