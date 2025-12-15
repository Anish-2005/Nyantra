# Beneficiaries, Applications & Disbursements Documentation

## Overview

The Nyantara Direct Benefit Transfer (DBT) system manages the complete lifecycle of beneficiary assistance programs, from beneficiary registration through application submission to progressive disbursement of funds. This document provides comprehensive technical documentation for the core business logic components.

## Table of Contents

1. [Beneficiaries Management](#beneficiaries-management)
2. [Applications System](#applications-system)
3. [Disbursements & Progressive Payments](#disbursements--progressive-payments)
4. [Data Models](#data-models)
5. [API Integration](#api-integration)
6. [Business Logic](#business-logic)
7. [Security & Validation](#security--validation)

## Beneficiaries Management

### Overview

Beneficiaries are the core entities in the DBT system. Each beneficiary represents an individual eligible for government assistance programs. The system supports comprehensive beneficiary profiling with multi-layer verification.

### Key Features

- **Multi-layer Authentication**: Aadhaar-based verification with biometric integration
- **Comprehensive Profiling**: Personal details, banking information, caste certificates, and priority categorization
- **Document Management**: Secure storage of certificates and supporting documents
- **Status Tracking**: Real-time verification status and officer assignments
- **Priority Classification**: High, medium, low priority based on vulnerability assessment

### Beneficiary Data Structure

```typescript
interface Beneficiary {
  id: string;                    // Unique beneficiary ID (auto-generated)
  ownerId: string;              // Firebase Auth UID of the user
  name: string;                 // Full name
  fatherName: string;           // Father's name
  aadhaarNumber: string;        // 12-digit Aadhaar number
  phone: string;               // Contact phone number
  email: string;               // Email address
  district: string;            // District of residence
  state: string;               // State of residence
  address: string;             // Complete address
  registrationDate: Timestamp; // Registration timestamp
  priority: 'high' | 'medium' | 'low'; // Priority level
  assignedOfficer: string;     // Assigned case officer
  category: string;            // SC/ST/OBC/General category
  age: number;                 // Age in years
  gender: 'male' | 'female' | 'other'; // Gender
  maritalStatus: string;       // Marital status
  bankAccount: string;         // Bank account number
  ifsc: string;               // IFSC code
  status: 'active' | 'inactive' | 'suspended'; // Account status
  verificationStatus: 'pending' | 'verified' | 'rejected'; // Verification status
  documents: number;           // Number of uploaded documents
  lastUpdate: Timestamp;       // Last modification timestamp
  createdAt: Timestamp;        // Creation timestamp
  scStCertificate: string;     // Cloudinary URL for caste certificate
}
```

### Beneficiary ID Generation

Beneficiary IDs are auto-generated using a combination of state code, district code, and sequential numbering:

```typescript
// Example: MH-PUNE-000001
// Format: {StateCode}-{DistrictCode}-{SequentialNumber}
function generateBeneficiaryId(state: string, district: string): string {
  const stateCode = getStateCode(state);
  const districtCode = district.toUpperCase().replace(/\s+/g, '-');
  const sequentialNumber = getNextSequentialNumber();
  return `${stateCode}-${districtCode}-${sequentialNumber.toString().padStart(6, '0')}`;
}
```

### Verification Workflow

1. **Initial Registration**: User submits beneficiary details and documents
2. **Document Upload**: Caste certificates, Aadhaar verification, bank details
3. **Officer Review**: Assigned officer verifies documents and information
4. **Status Update**: Verification status updated to 'verified', 'pending', or 'rejected'
5. **Activation**: Verified beneficiaries can submit applications

## Applications System

### Overview

The applications system handles the submission and processing of DBT benefit applications under various acts. The system supports two primary legislation frameworks: Protection of Civil Rights (PCR) Act and Prevention of Atrocities (PoA) Act.

### Supported Acts

#### Prevention of Atrocities (PoA) Act 1989

The PoA Act covers caste-based atrocities with predefined compensation amounts:

```typescript
const POA_OFFENCES = {
  "1. Offences leading to Death / Murder": {
    "Murder of SC/ST person": 825000,
    "Death due to injury inflicted during atrocity": 825000,
    "Death after rape / gang rape": 825000
  },
  "2. Rape and Sexual Offences": {
    "Rape": 500000,
    "Gang rape": 825000,
    "Attempt to rape": 100000,
    "Parading naked / semi-naked": 200000
  },
  // ... additional categories
};
```

#### Protection of Civil Rights (PCR) Act 1955

PCR Act covers civil rights violations with compensation up to ₹500,000 based on incident severity.

### Application Data Structure

```typescript
interface Application {
  id: string;                    // Unique application ID
  ownerId: string;              // Firebase Auth UID
  applicantName: string;        // Applicant full name
  aadhaar: string;              // Aadhaar number
  phone: string;               // Contact phone
  district: string;            // Incident district
  state: string;               // Incident state
  actType: 'PoA' | 'PCR';      // Act type
  beneficiaryId: string;       // Linked beneficiary ID
  incidentDate: string;        // Date of incident
  firReport?: string;          // FIR report details
  medicalReport?: string;      // Medical report URL
  policeStation?: string;      // Police station name
  caseNumber?: string;         // FIR case number
  applicationDate: string;     // Submission date
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'disbursement_pending';
  amount: number;              // Approved amount
  priority: 'high' | 'medium' | 'low'; // Processing priority
  assignedOfficer: string;     // Assigned officer
  documents: number;           // Number of attachments
  lastUpdate: string;          // Last update timestamp
  fatherName?: string;         // Father's name
  email?: string;              // Email address
  address?: string;            // Address
  casteCategory?: string;      // Caste category
  bankAccount?: string;        // Bank account
  ifsc?: string;               // IFSC code
}
```

### Application Workflow

1. **Draft Creation**: User fills application form with incident details
2. **Document Attachment**: FIR reports, medical certificates, witness statements
3. **Beneficiary Linking**: Application linked to verified beneficiary profile
4. **Submission**: Application submitted for officer review
5. **Review Process**: Officer verifies documents and incident details
6. **Approval**: Amount calculated based on act and offence type
7. **Disbursement Setup**: Progressive payment schedule created

### Amount Calculation Logic

```typescript
function calculateCompensation(actType: string, offenceCategory: string, offenceType: string): number {
  if (actType === 'PoA') {
    return POA_OFFENCES[offenceCategory]?.[offenceType] || 0;
  } else if (actType === 'PCR') {
    // PCR amounts determined by officer based on incident severity
    return 0; // To be set during approval
  }
  return 0;
}
```

## Disbursements & Progressive Payments

### Overview

The disbursement system implements progressive payments to ensure beneficiary welfare and prevent fund misuse. Benefits are disbursed in installments rather than lump sums, with each installment requiring completion confirmation before the next becomes available.

### Progressive Payment Structure

```typescript
interface ProgressivePayment {
  isProgressivePayment: boolean;     // Enable progressive payments
  currentInstallment: number;        // Current installment number
  totalInstallments: number;         // Total number of installments
  installmentAmounts: number[];      // Amount for each installment
  installmentPercentages: number[];  // Percentage of total for each installment
  completedInstallments: number;     // Number of completed installments
  disbursementProgress: number;      // Overall progress percentage
  nextInstallmentAmount: number;     // Amount for next installment
  nextInstallmentPercentage: number; // Percentage for next installment
}
```

### Installment Calculation

The system supports flexible installment structures:

```typescript
// Example: 4 installments - 25% each
const installmentStructure = {
  totalInstallments: 4,
  installmentPercentages: [25, 25, 25, 25], // Equal distribution
  installmentAmounts: [25000, 25000, 25000, 25000] // For ₹100,000 total
};

// Example: Custom distribution
const customStructure = {
  totalInstallments: 3,
  installmentPercentages: [40, 30, 30], // 40% first, 30% each subsequent
  installmentAmounts: [40000, 30000, 30000] // For ₹100,000 total
};
```

### Disbursement Data Structure

```typescript
interface Disbursement {
  id: string;                    // Unique disbursement ID
  firestoreId?: string;          // Firestore document ID
  beneficiaryId: string;         // Linked beneficiary ID
  beneficiaryName: string;       // Beneficiary name
  district: string;             // Beneficiary district
  state: string;                // Beneficiary state
  transactionId: string;        // Bank transaction ID
  utrNumber: string;            // UTR reference number
  paymentMethod: 'bank_transfer' | 'upi' | 'cash'; // Payment method
  reliefAmount: number;         // Total approved amount
  transactionFee: number;       // Bank charges
  netAmount: number;            // Amount after fees
  disbursedAmount: number;      // Actually disbursed amount
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  initiatedDate: string;        // Initiation timestamp
  completedDate?: string;       // Completion timestamp
  actType: 'PoA' | 'PCR';       // Act type
  retryCount: number;           // Failed transaction retry count
  failureReason?: string;       // Failure description
  initiatedBy: string;          // Officer who initiated
  verifiedBy?: string;          // Verification officer
  applicationId: string;        // Linked application ID
  ownerId: string;              // Beneficiary owner ID

  // Progressive payment fields
  isProgressivePayment?: boolean;
  currentInstallment?: number;
  totalInstallments?: number;
  installmentAmounts?: number[];
  installmentPercentages?: number[];
  completedInstallments?: number;
  disbursementProgress?: number;
  nextInstallmentAmount?: number;
  nextInstallmentPercentage?: number;

  // User editable fields
  userPhone?: string;
  userEmail?: string;
  userBankAccount?: string;
  userIFSC?: string;
  userAddress?: string;

  // Officer only fields
  officerNotes?: string;
  internalReference?: string;
  verificationLevel?: string;
  priority?: string;
}
```

### Sequential Installment Logic

The system enforces sequential processing - users cannot skip installments:

```typescript
function getNextAvailableInstallment(completedInstallments: number, totalInstallments: number): number | null {
  if (completedInstallments >= totalInstallments) {
    return null; // All installments completed
  }
  return completedInstallments + 1; // Next sequential installment
}

// UI Logic for dropdown options
const availableInstallments = [];
for (let i = 1; i <= totalInstallments; i++) {
  if (i === completedInstallments + 1) {
    availableInstallments.push(i); // Only next installment available
  }
}
```

### Disbursement Workflow

1. **Initiation**: Officer creates disbursement record linked to approved application
2. **Progressive Setup**: Installment structure configured based on amount and beneficiary needs
3. **First Installment**: Initial payment processed and marked as completed
4. **Sequential Processing**: Subsequent installments become available only after previous completion
5. **Completion Tracking**: Each installment requires confirmation before next becomes available
6. **Final Disbursement**: All installments completed, application marked as fully disbursed

### Alert System

The system includes real-time alerts for new disbursements and installments:

```typescript
interface DisbursementAlert {
  id: string;
  type: 'new_disbursement' | 'installment_available' | 'payment_completed';
  beneficiaryId: string;
  applicationId: string;
  amount: number;
  installmentNumber?: number;
  timestamp: string;
  read: boolean;
}
```

## Data Models

### Firestore Collections

#### `beneficiaries`
- Primary collection for beneficiary profiles
- Indexed by `ownerId` for user-specific queries
- Contains complete beneficiary information and verification status

#### `applications`
- Stores all DBT applications
- Linked to beneficiaries via `beneficiaryId`
- Tracks application lifecycle from submission to disbursement

#### `disbursements`
- Records all payment transactions
- Supports progressive payment tracking
- Maintains audit trail for financial transactions

### Database Relationships

```
beneficiaries (1) ──── (many) applications
applications (1) ──── (many) disbursements
beneficiaries (1) ──── (many) disbursements (via beneficiaryId)
```

## API Integration

### Real-time Synchronization

All components use Firebase Firestore real-time listeners for live updates:

```typescript
// Beneficiary data synchronization
const beneficiaryQuery = query(
  collection(db, 'beneficiaries'),
  where('ownerId', '==', user.uid)
);

const unsubscribe = onSnapshot(beneficiaryQuery, (snapshot) => {
  // Handle real-time updates
});
```

### Data Validation

Client-side validation ensures data integrity:

```typescript
const validationRules = {
  aadhaar: {
    pattern: /^\d{12}$/,
    required: true,
    message: 'Aadhaar must be 12 digits'
  },
  phone: {
    pattern: /^\d{10}$/,
    required: true,
    message: 'Phone must be 10 digits'
  },
  bankAccount: {
    minLength: 9,
    maxLength: 18,
    required: true,
    message: 'Invalid bank account number'
  }
};
```

## Business Logic

### Priority Assignment

Beneficiaries are assigned priority based on vulnerability factors:

```typescript
function calculatePriority(beneficiary: Beneficiary): 'high' | 'medium' | 'low' {
  let score = 0;

  // Age factor
  if (beneficiary.age && beneficiary.age > 60) score += 2;
  if (beneficiary.age && beneficiary.age < 18) score += 1;

  // Category factor
  if (beneficiary.category === 'SC' || beneficiary.category === 'ST') score += 2;

  // Gender factor
  if (beneficiary.gender === 'female') score += 1;

  // Marital status factor
  if (beneficiary.maritalStatus === 'widow' || beneficiary.maritalStatus === 'widower') score += 1;

  if (score >= 4) return 'high';
  if (score >= 2) return 'medium';
  return 'low';
}
```

### Amount Approval Workflow

1. **Initial Assessment**: Officer reviews application and supporting documents
2. **Amount Calculation**: Based on act type and offence severity
3. **Progressive Payment Setup**: Determines installment structure
4. **Approval**: Final amount and payment schedule approved
5. **Disbursement Initiation**: Payment process begins

## Security & Validation

### Data Protection

- **Encryption**: Sensitive data encrypted at rest and in transit
- **Access Control**: Role-based permissions for officers and beneficiaries
- **Audit Trail**: All changes logged with timestamps and user identification
- **Document Security**: Secure cloud storage with access controls

### Input Validation

```typescript
const securityValidations = {
  // Prevent XSS attacks
  sanitizeInput: (input: string) => input.replace(/[<>]/g, ''),

  // Aadhaar masking for display
  maskAadhaar: (aadhaar: string) => {
    return aadhaar.replace(/(\d{4})(\d{4})(\d{4})/, '$1-XXXX-$3');
  },

  // Bank account validation
  validateBankAccount: (account: string) => {
    return /^\d{9,18}$/.test(account);
  }
};
```

### Error Handling

Comprehensive error handling for all operations:

```typescript
const errorHandlers = {
  networkError: 'Please check your internet connection',
  validationError: 'Please correct the highlighted fields',
  permissionError: 'You do not have permission for this action',
  duplicateError: 'This record already exists'
};
```

## Integration Points

### Blockchain Ledger

All disbursements are recorded in the blockchain for immutable audit trails:

```typescript
interface BlockchainRecord {
  transactionId: string;
  beneficiaryId: string;
  amount: number;
  timestamp: string;
  hash: string;
  previousHash: string;
  merkleRoot: string;
}
```

### Email Notifications

Automated email alerts for status changes:

- Application submission confirmation
- Approval/rejection notifications
- Disbursement confirmations
- Installment availability alerts

### Dashboard Analytics

Real-time metrics and reporting:

- Total beneficiaries served
- Application processing times
- Disbursement success rates
- Fund utilization tracking
- Geographic distribution analytics

This documentation covers the core business logic and technical implementation of the beneficiaries, applications, and disbursements system in the Nyantara DBT platform.