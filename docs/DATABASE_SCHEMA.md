# Database Schema Documentation

## Overview

This document provides comprehensive documentation of the Firestore database schema for the Nyantara Direct Benefit Transfer (DBT) management system. The schema is designed to support beneficiary management, application processing, disbursement tracking, grievance handling, and feedback collection.

## Table of Contents

1. [Database Architecture](#database-architecture)
2. [Collections Overview](#collections-overview)
3. [Detailed Schema](#detailed-schema)
4. [Indexes](#indexes)
5. [Security Rules](#security-rules)
6. [Data Relationships](#data-relationships)
7. [Migration Strategy](#migration-strategy)

## Database Architecture

### Firestore Structure

The database uses Firestore as the primary NoSQL database with the following characteristics:

- **Document-based storage** with hierarchical collections
- **Real-time synchronization** for live updates
- **Automatic scaling** and high availability
- **Strong consistency** for critical operations
- **Geographic distribution** for global access

### Collection Hierarchy

```
nyantara-dev (Project)
├── beneficiaries (Collection)
│   ├── {beneficiaryId} (Document)
│   │   ├── applications (Subcollection)
│   │   ├── disbursements (Subcollection)
│   │   └── grievances (Subcollection)
├── applications (Collection)
├── disbursements (Collection)
├── grievances (Collection)
├── feedbacks (Collection)
├── officers (Collection)
├── categories (Collection)
├── system (Collection)
└── audit_logs (Collection)
```

## Collections Overview

### Core Collections

| Collection | Purpose | Document Count (Estimated) |
|------------|---------|---------------------------|
| `beneficiaries` | Beneficiary profiles and verification data | 10M+ |
| `applications` | DBT applications with status tracking | 50M+ |
| `disbursements` | Payment records and installment tracking | 100M+ |
| `grievances` | User complaints and resolution tracking | 1M+ |
| `feedbacks` | User feedback and ratings | 5M+ |

### Supporting Collections

| Collection | Purpose | Document Count (Estimated) |
|------------|---------|---------------------------|
| `officers` | Officer profiles and assignments | 10K+ |
| `categories` | System categories and configurations | 100+ |
| `system` | System-wide settings and metadata | 50+ |
| `audit_logs` | Audit trail for all operations | 500M+ |

## Detailed Schema

### Beneficiaries Collection

**Path:** `/beneficiaries/{beneficiaryId}`

**Purpose:** Stores beneficiary profile information and verification status.

```typescript
interface Beneficiary {
  // Primary Identifiers
  id: string; // Unique beneficiary ID (BEN-XXXXXX)
  aadhaarNumber: string; // 12-digit Aadhaar number (encrypted)
  phone: string; // Primary phone number (+91-XXXXXXXXXX)

  // Personal Information
  name: string; // Full name
  dateOfBirth: Timestamp; // Date of birth
  gender: 'male' | 'female' | 'other'; // Gender
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';

  // Address Information
  address: {
    houseNumber: string;
    street: string;
    village: string;
    district: string;
    state: string;
    pincode: string;
  };

  // Socio-Economic Information
  caste: string; // Caste category
  incomeGroup: 'apl' | 'bpl' | 'aa'; // Above Poverty Line, Below Poverty Line, Antyodaya Anna
  occupation: string;
  educationLevel: string;

  // Verification Status
  verificationStatus: 'pending' | 'verified' | 'rejected' | 'under_review';
  verificationDate?: Timestamp;
  verifiedBy?: string; // Officer ID

  // Bank Account Details (Encrypted)
  bankDetails: {
    accountNumber: string; // Encrypted
    ifscCode: string;
    bankName: string;
    accountHolderName: string;
  };

  // Status and Metadata
  status: 'active' | 'inactive' | 'suspended' | 'deceased';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string; // Officer ID
  updatedBy?: string; // Officer ID

  // Additional Fields
  profilePicture?: string; // Firebase Storage URL
  alternatePhone?: string;
  email?: string;
  languages: string[]; // Preferred languages
  disabilities?: string[]; // Disability types
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
}
```

**Subcollections:**
- `applications`: Beneficiary's DBT applications
- `disbursements`: Beneficiary's payment records
- `grievances`: Beneficiary's complaints

### Applications Collection

**Path:** `/applications/{applicationId}`

**Purpose:** Tracks DBT application submissions and processing status.

```typescript
interface Application {
  // Primary Identifiers
  id: string; // Unique application ID (APP-XXXXXX)
  beneficiaryId: string; // Reference to beneficiary

  // Application Details
  actType: string; // Type of act (PoA, MGNREGA, etc.)
  category: string; // Application category
  subcategory?: string; // Application subcategory

  // Application Status
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'cancelled';
  statusHistory: Array<{
    status: string;
    timestamp: Timestamp;
    changedBy: string; // Officer ID
    remarks?: string;
  }>;

  // Financial Information
  requestedAmount: number; // Amount requested in rupees
  approvedAmount?: number; // Amount approved
  disbursedAmount: number; // Amount already disbursed (default: 0)

  // Processing Information
  submittedAt: Timestamp;
  reviewedAt?: Timestamp;
  approvedAt?: Timestamp;
  rejectedAt?: Timestamp;

  processedBy?: string; // Officer ID who processed
  reviewedBy?: string; // Officer ID who reviewed
  approvedBy?: string; // Officer ID who approved

  // Supporting Documents
  documents: Array<{
    type: string; // Document type (aadhaar, income_cert, etc.)
    url: string; // Firebase Storage URL
    uploadedAt: Timestamp;
    verified: boolean;
    verifiedBy?: string; // Officer ID
  }>;

  // Rejection Information
  rejectionReason?: string;
  rejectionRemarks?: string;

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  priority: 'low' | 'medium' | 'high' | 'urgent';

  // Additional Fields
  remarks?: string;
  tags?: string[]; // Custom tags for categorization
  source: 'web' | 'mobile' | 'bulk_upload' | 'api';
}
```

### Disbursements Collection

**Path:** `/disbursements/{disbursementId}`

**Purpose:** Records all payment disbursements and installment tracking.

```typescript
interface Disbursement {
  // Primary Identifiers
  id: string; // Unique disbursement ID (DIS-XXXXXX)
  applicationId: string; // Reference to application
  beneficiaryId: string; // Reference to beneficiary

  // Payment Details
  amount: number; // Disbursement amount in rupees
  installmentNumber: number; // Installment number (1, 2, 3, etc.)
  totalInstallments: number; // Total number of installments

  // Payment Status
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';

  // Transaction Details
  transactionId?: string; // Bank transaction ID
  referenceNumber: string; // Internal reference number
  paymentMethod: 'bank_transfer' | 'cash' | 'cheque' | 'digital_wallet';

  // Bank Details
  bankDetails: {
    accountNumber: string; // Encrypted
    ifscCode: string;
    bankName: string;
    branchName?: string;
  };

  // Processing Information
  scheduledDate: Timestamp; // When payment was scheduled
  processedDate?: Timestamp; // When payment was processed
  completedDate?: Timestamp; // When payment was completed

  processedBy?: string; // Officer ID or system
  approvedBy?: string; // Officer ID who approved

  // Failure Information
  failureReason?: string;
  failureCode?: string;
  retryCount: number; // Number of retry attempts (default: 0)

  // Audit Information
  createdAt: Timestamp;
  updatedAt: Timestamp;

  // Additional Fields
  remarks?: string;
  paymentProof?: string; // URL to payment receipt/proof
  reconciliationStatus: 'pending' | 'matched' | 'mismatched' | 'manual_review';
}
```

### Grievances Collection

**Path:** `/grievances/{grievanceId}`

**Purpose:** Manages user complaints and resolution tracking.

```typescript
interface Grievance {
  // Primary Identifiers
  id: string; // Unique grievance ID (GRV-XXXXXX)
  beneficiaryId: string; // Reference to beneficiary
  applicationId?: string; // Reference to related application
  disbursementId?: string; // Reference to related disbursement

  // Grievance Details
  title: string; // Short title of the complaint
  description: string; // Detailed description
  category: string; // Grievance category (payment, application, etc.)
  subcategory?: string; // Grievance subcategory

  // Grievance Status
  status: 'open' | 'investigating' | 'resolved' | 'closed' | 'escalated';
  priority: 'low' | 'medium' | 'high' | 'urgent';

  // Status History
  statusHistory: Array<{
    status: string;
    timestamp: Timestamp;
    changedBy: string; // Officer ID
    remarks?: string;
  }>;

  // Assignment Information
  assignedTo?: string; // Officer ID
  assignedAt?: Timestamp;
  escalatedTo?: string; // Higher authority officer ID
  escalatedAt?: Timestamp;

  // Resolution Information
  resolution?: string; // Resolution description
  resolvedAt?: Timestamp;
  resolvedBy?: string; // Officer ID

  // Communication
  messages: Array<{
    id: string;
    senderId: string; // Beneficiary or officer ID
    senderType: 'beneficiary' | 'officer' | 'system';
    message: string;
    timestamp: Timestamp;
    attachments?: string[]; // URLs to attachments
  }>;

  // Supporting Documents
  attachments: Array<{
    type: string;
    url: string; // Firebase Storage URL
    uploadedAt: Timestamp;
    uploadedBy: string; // User ID
  }>;

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  source: 'web' | 'mobile' | 'phone' | 'walk_in';
  slaBreach: boolean; // Whether SLA was breached

  // Additional Fields
  tags?: string[]; // Custom tags
  satisfactionRating?: number; // Post-resolution rating (1-5)
}
```

### Feedbacks Collection

**Path:** `/feedbacks/{feedbackId}`

**Purpose:** Collects user feedback and ratings for system improvement.

```typescript
interface Feedback {
  // Primary Identifiers
  id: string; // Unique feedback ID (FBK-XXXXXX)
  beneficiaryId?: string; // Reference to beneficiary (optional)
  officerId?: string; // Reference to officer (optional)

  // Feedback Details
  type: 'system' | 'officer' | 'process' | 'general';
  rating: number; // Rating from 1-5
  title?: string; // Optional title
  comments?: string; // Detailed feedback

  // Context Information
  applicationId?: string; // Related application
  grievanceId?: string; // Related grievance
  disbursementId?: string; // Related disbursement

  // Categorization
  categories: string[]; // Feedback categories
  sentiment: 'positive' | 'neutral' | 'negative';

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  source: 'web' | 'mobile' | 'survey' | 'api';
  deviceInfo?: {
    platform: string;
    version: string;
    userAgent?: string;
  };

  // Processing Status
  status: 'pending' | 'reviewed' | 'actioned' | 'closed';
  reviewedBy?: string; // Officer ID
  reviewedAt?: Timestamp;
  actionTaken?: string; // Description of action taken

  // Additional Fields
  tags?: string[]; // Custom tags for analysis
  isAnonymous: boolean; // Whether feedback is anonymous
}
```

### Officers Collection

**Path:** `/officers/{officerId}`

**Purpose:** Manages officer profiles and role assignments.

```typescript
interface Officer {
  // Primary Identifiers
  id: string; // Unique officer ID (OFF-XXXXXX)
  employeeId: string; // Government employee ID
  email: string; // Official email

  // Personal Information
  name: string;
  phone: string;
  designation: string; // Job title/position
  department: string; // Department name

  // Role and Permissions
  role: 'junior_officer' | 'senior_officer' | 'supervisor' | 'admin' | 'super_admin';
  permissions: string[]; // Array of permission strings

  // Assignment Information
  assignedDistricts: string[]; // Districts assigned to
  assignedCategories: string[]; // Application categories handled

  // Status
  status: 'active' | 'inactive' | 'suspended';
  lastLoginAt?: Timestamp;
  loginCount: number;

  // Profile Information
  profilePicture?: string; // Firebase Storage URL
  languages: string[]; // Languages spoken
  specializations?: string[]; // Areas of expertise

  // Performance Metrics
  performanceMetrics: {
    applicationsProcessed: number;
    grievancesResolved: number;
    averageResolutionTime: number; // in hours
    satisfactionRating: number;
  };

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string; // Admin officer ID
}
```

### Categories Collection

**Path:** `/categories/{categoryId}`

**Purpose:** System configuration for categories and settings.

```typescript
interface Category {
  // Primary Identifiers
  id: string; // Unique category ID
  type: 'act_type' | 'grievance_category' | 'feedback_category' | 'district' | 'department';

  // Category Details
  name: string; // Display name
  code: string; // Internal code
  description?: string;

  // Hierarchy
  parentId?: string; // Parent category ID
  level: number; // Hierarchy level

  // Configuration
  isActive: boolean;
  sortOrder: number;

  // Additional Settings
  metadata?: Record<string, any>; // Category-specific settings

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### System Collection

**Path:** `/system/{configId}`

**Purpose:** System-wide configuration and settings.

```typescript
interface SystemConfig {
  // Configuration Types
  type: 'app_config' | 'payment_config' | 'notification_config' | 'security_config';

  // Configuration Data
  config: Record<string, any>;

  // Metadata
  version: string;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  updatedBy: string; // Officer ID
}
```

### Audit Logs Collection

**Path:** `/audit_logs/{logId}`

**Purpose:** Comprehensive audit trail for all system operations.

```typescript
interface AuditLog {
  // Log Identifiers
  id: string; // Unique log ID
  timestamp: Timestamp;
  userId: string; // User who performed action
  userType: 'beneficiary' | 'officer' | 'system';

  // Action Details
  action: string; // Action performed (create, update, delete, etc.)
  resource: string; // Resource type (beneficiary, application, etc.)
  resourceId: string; // ID of the resource

  // Change Details
  changes: {
    field: string;
    oldValue?: any;
    newValue?: any;
  }[];

  // Context Information
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;

  // Additional Information
  metadata?: Record<string, any>;
  reason?: string; // Reason for the action
}
```

## Indexes

### Automatic Indexes

Firestore automatically creates indexes for simple queries. The following indexes are automatically managed:

- Single field indexes on all fields
- Composite indexes for equality queries

### Custom Indexes

The following custom indexes need to be created for optimal query performance:

```json
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "beneficiaries",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "district",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "applications",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "beneficiaryId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "submittedAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "disbursements",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "applicationId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "scheduledDate",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "grievances",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "priority",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "audit_logs",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "timestamp",
          "order": "DESCENDING"
        },
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "action",
          "order": "ASCENDING"
        }
      ]
    }
  ]
}
```

## Security Rules

### Firestore Security Rules

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOfficer() {
      return isAuthenticated() &&
             exists(/databases/$(database)/documents/officers/$(request.auth.uid));
    }

    function isBeneficiary() {
      return isAuthenticated() &&
             exists(/databases/$(database)/documents/beneficiaries/$(request.auth.uid));
    }

    function isAdmin() {
      return isOfficer() &&
             get(/databases/$(database)/documents/officers/$(request.auth.uid)).data.role in ['admin', 'super_admin'];
    }

    function canAccessBeneficiary(beneficiaryId) {
      return isAdmin() ||
             (isOfficer() && get(/databases/$(database)/documents/officers/$(request.auth.uid)).data.assignedDistricts.hasAny(
               [get(/databases/$(database)/documents/beneficiaries/$(beneficiaryId)).data.address.district]
             ));
    }

    // Beneficiaries collection
    match /beneficiaries/{beneficiaryId} {
      allow read: if isAuthenticated();
      allow write: if isOfficer() && canAccessBeneficiary(beneficiaryId);
      allow create: if isOfficer();

      // Subcollections
      match /applications/{applicationId} {
        allow read, write: if canAccessBeneficiary(beneficiaryId);
      }

      match /disbursements/{disbursementId} {
        allow read, write: if canAccessBeneficiary(beneficiaryId);
      }

      match /grievances/{grievanceId} {
        allow read, write: if canAccessBeneficiary(beneficiaryId) || resource.data.beneficiaryId == beneficiaryId;
      }
    }

    // Applications collection
    match /applications/{applicationId} {
      allow read: if isAuthenticated();
      allow write: if isOfficer();
      allow create: if isBeneficiary() || isOfficer();
    }

    // Disbursements collection
    match /disbursements/{disbursementId} {
      allow read: if isAuthenticated();
      allow write: if isOfficer();
    }

    // Grievances collection
    match /grievances/{grievanceId} {
      allow read: if isAuthenticated();
      allow write: if isOfficer();
      allow create: if isBeneficiary() || isOfficer();
    }

    // Feedbacks collection
    match /feedbacks/{feedbackId} {
      allow read: if isAdmin();
      allow write: if isAuthenticated();
      allow create: if isAuthenticated();
    }

    // Officers collection
    match /officers/{officerId} {
      allow read: if isOfficer();
      allow write: if isAdmin();
    }

    // Categories collection
    match /categories/{categoryId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }

    // System collection
    match /system/{configId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }

    // Audit logs collection
    match /audit_logs/{logId} {
      allow read: if isAdmin();
      allow write: if isAuthenticated();
    }
  }
}
```

## Data Relationships

### Entity Relationship Diagram

```
Beneficiary (1) ──── (M) Application
    │                       │
    │                       │
    └── (1) Grievance       └── (M) Disbursement
         (M)                     (1)

Beneficiary (1) ──── (M) Feedback
    │
    │
Officer (1) ──── (M) Assignment
```

### Key Relationships

1. **Beneficiary → Applications**: One-to-many relationship
2. **Application → Disbursements**: One-to-many relationship
3. **Beneficiary → Grievances**: One-to-many relationship
4. **Application → Grievances**: One-to-many relationship (optional)
5. **Officer → Applications**: Many-to-many through assignments
6. **Officer → Grievances**: Many-to-many through assignments

### Data Consistency

- **Referential Integrity**: Maintained through application logic
- **Cascading Deletes**: Handled by Cloud Functions
- **Data Validation**: Enforced at application and database level

## Migration Strategy

### Version Control

Database schema versions are tracked using the following approach:

```typescript
interface SchemaVersion {
  version: string; // Semantic version (e.g., "1.2.3")
  description: string;
  appliedAt: Timestamp;
  appliedBy: string;
  changes: string[]; // List of changes made
}
```

### Migration Process

1. **Development Phase**
   - Schema changes tested in development environment
   - Backward compatibility ensured
   - Migration scripts written

2. **Staging Phase**
   - Migration tested with production-like data
   - Rollback procedures validated
   - Performance impact assessed

3. **Production Deployment**
   - Zero-downtime migration preferred
   - Gradual rollout with feature flags
   - Monitoring for issues

### Migration Scripts

Example migration script structure:

```typescript
// migrations/v1.2.0_add_feedback_rating.ts
export async function migrateV120() {
  const db = getFirestore();

  // Add new field to existing documents
  const batch = db.batch();
  const feedbacksRef = db.collection('feedbacks');

  const snapshot = await feedbacksRef.get();
  snapshot.forEach((doc) => {
    const data = doc.data();
    if (!data.rating) {
      batch.update(doc.ref, {
        rating: 5, // Default rating
        updatedAt: Timestamp.now()
      });
    }
  });

  await batch.commit();
}
```

### Backup Strategy

- **Automatic Backups**: Daily Firestore exports to Cloud Storage
- **Point-in-Time Recovery**: Available for 7 days
- **Manual Backups**: Before major migrations
- **Cross-Region Replication**: For disaster recovery

This comprehensive database schema documentation provides the foundation for understanding and maintaining the Nyantara DBT system's data architecture.