# API Reference Documentation

## Overview

The Nyantara Direct Benefit Transfer (DBT) system provides a comprehensive REST API for managing beneficiaries, applications, disbursements, grievances, and feedback. This document outlines all available API endpoints, request/response formats, and authentication requirements.

## Table of Contents

1. [Authentication](#authentication)
2. [Beneficiaries API](#beneficiaries-api)
3. [Applications API](#applications-api)
4. [Disbursements API](#disbursements-api)
5. [Grievances API](#grievances-api)
6. [Feedback API](#feedback-api)
7. [Blockchain API](#blockchain-api)
8. [Analytics API](#analytics-api)
9. [Error Handling](#error-handling)
10. [Rate Limiting](#rate-limiting)

## Authentication

### Firebase Authentication

All API endpoints require Firebase Authentication tokens. Include the Bearer token in the Authorization header:

```http
Authorization: Bearer <firebase-id-token>
```

### Token Validation

```typescript
// Client-side token retrieval
const getAuthToken = async (): Promise<string> => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  return await user.getIdToken();
};

// API request with authentication
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = await getAuthToken();

  return fetch(endpoint, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
};
```

### Role-Based Access

- **Beneficiary**: Can access their own data and submit applications/feedback
- **Officer**: Can view and manage assigned cases, update statuses
- **Administrator**: Full system access including analytics and configuration

## Beneficiaries API

### Create Beneficiary

```http
POST /api/beneficiaries
```

**Request Body:**
```json
{
  "name": "John Doe",
  "fatherName": "Robert Doe",
  "aadhaarNumber": "123456789012",
  "phone": "+91-9876543210",
  "email": "john.doe@example.com",
  "district": "Mumbai",
  "state": "Maharashtra",
  "address": "123 Main Street, Mumbai, Maharashtra",
  "priority": "medium",
  "category": "SC",
  "age": 35,
  "gender": "male",
  "maritalStatus": "married",
  "bankAccount": "1234567890",
  "ifsc": "SBIN0001234"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "BEN-20251215-0001",
    "ownerId": "firebase-user-id",
    "status": "pending",
    "verificationStatus": "pending",
    "createdAt": "2025-12-15T10:30:00Z"
  }
}
```

### Get Beneficiary

```http
GET /api/beneficiaries/{beneficiaryId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "BEN-20251215-0001",
    "name": "John Doe",
    "fatherName": "Robert Doe",
    "aadhaarNumber": "XXXX-XXXX-9012",
    "phone": "+91-9876543210",
    "email": "john.doe@example.com",
    "district": "Mumbai",
    "state": "Maharashtra",
    "status": "active",
    "verificationStatus": "verified",
    "documents": 3,
    "lastUpdate": "2025-12-15T11:00:00Z"
  }
}
```

### Update Beneficiary

```http
PUT /api/beneficiaries/{beneficiaryId}
```

**Request Body:**
```json
{
  "phone": "+91-9876543211",
  "email": "john.doe.new@example.com",
  "address": "456 New Street, Mumbai, Maharashtra"
}
```

### List Beneficiaries

```http
GET /api/beneficiaries?status=active&district=Mumbai&page=1&limit=20
```

**Query Parameters:**
- `status`: Filter by status (active, inactive, suspended)
- `district`: Filter by district
- `state`: Filter by state
- `verificationStatus`: Filter by verification status
- `page`: Page number for pagination
- `limit`: Number of results per page

## Applications API

### Submit Application

```http
POST /api/applications
```

**Request Body:**
```json
{
  "beneficiaryId": "BEN-20251215-0001",
  "actType": "PoA",
  "incidentDate": "2025-11-15",
  "firReport": "FIR No. 123/2025",
  "policeStation": "Mumbai Central Police Station",
  "caseNumber": "12345/2025",
  "description": "Incident description...",
  "amount": 50000,
  "priority": "high",
  "documents": ["fir_copy.pdf", "medical_report.pdf"]
}
```

### Get Application

```http
GET /api/applications/{applicationId}
```

### Update Application Status

```http
PUT /api/applications/{applicationId}/status
```

**Request Body:**
```json
{
  "status": "approved",
  "approvedAmount": 50000,
  "assignedOfficer": "OFF-001",
  "comments": "Application approved after document verification"
}
```

### List Applications

```http
GET /api/applications?status=pending&actType=PoA&page=1&limit=10
```

## Disbursements API

### Initiate Disbursement

```http
POST /api/disbursements
```

**Request Body:**
```json
{
  "applicationId": "APP-20251215-0001",
  "beneficiaryId": "BEN-20251215-0001",
  "reliefAmount": 50000,
  "isProgressivePayment": true,
  "totalInstallments": 4,
  "installmentPercentages": [25, 25, 25, 25],
  "paymentMethod": "bank_transfer"
}
```

### Get Disbursement

```http
GET /api/disbursements/{disbursementId}
```

### Process Installment

```http
POST /api/disbursements/{disbursementId}/installments
```

**Request Body:**
```json
{
  "installmentNumber": 1,
  "amount": 12500,
  "notes": "First installment processed successfully"
}
```

### Update Disbursement Status

```http
PUT /api/disbursements/{disbursementId}/status
```

**Request Body:**
```json
{
  "status": "completed",
  "transactionId": "TXN-20251215-0001",
  "utrNumber": "UTR123456789",
  "completedDate": "2025-12-15T14:30:00Z"
}
```

## Grievances API

### Submit Grievance

```http
POST /api/grievances
```

**Request Body:**
```json
{
  "beneficiaryId": "BEN-20251215-0001",
  "category": "disbursement-delay",
  "subCategory": "payment-not-received",
  "priority": "high",
  "subject": "Payment delay issue",
  "description": "Payment not received after 15 days of approval",
  "attachments": ["receipt.pdf"]
}
```

### Add Communication

```http
POST /api/grievances/{grievanceId}/communication
```

**Request Body:**
```json
{
  "message": "We are investigating the payment delay. Will update you within 24 hours.",
  "senderType": "officer",
  "attachments": []
}
```

### Update Grievance Status

```http
PUT /api/grievances/{grievanceId}/status
```

**Request Body:**
```json
{
  "status": "resolved",
  "resolutionDate": "2025-12-15T16:00:00Z",
  "satisfactionRating": 4
}
```

## Feedback API

### Submit Feedback

```http
POST /api/feedback
```

**Request Body:**
```json
{
  "subject": "Great user experience",
  "message": "The application process was smooth and user-friendly",
  "rating": 5,
  "category": "user_interface"
}
```

### Get User Feedback

```http
GET /api/feedback/user/{userId}
```

### Update Feedback

```http
PUT /api/feedback/{feedbackId}
```

**Request Body:**
```json
{
  "status": "resolved",
  "officerResponse": "Thank you for your positive feedback!"
}
```

## Blockchain API

### Record Transaction

```http
POST /api/blockchain/transactions
```

**Request Body:**
```json
{
  "transactionId": "TXN-20251215-0001",
  "beneficiaryId": "BEN-20251215-0001",
  "amount": 12500,
  "transactionType": "disbursement",
  "metadata": {
    "applicationId": "APP-20251215-0001",
    "installmentNumber": 1
  }
}
```

### Get Transaction History

```http
GET /api/blockchain/transactions/{beneficiaryId}
```

### Verify Transaction

```http
GET /api/blockchain/verify/{transactionId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionId": "TXN-20251215-0001",
    "verified": true,
    "blockHash": "a1b2c3d4...",
    "merkleRoot": "e5f6g7h8...",
    "timestamp": "2025-12-15T14:30:00Z"
  }
}
```

## Analytics API

### Get Dashboard Metrics

```http
GET /api/analytics/dashboard?period=month
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalBeneficiaries": 15420,
    "activeApplications": 2340,
    "pendingDisbursements": 890,
    "resolvedGrievances": 1250,
    "averageProcessingTime": 7.5,
    "satisfactionRating": 4.2
  }
}
```

### Get Performance Metrics

```http
GET /api/analytics/performance?startDate=2025-11-01&endDate=2025-11-30
```

### Export Data

```http
GET /api/analytics/export?type=applications&format=csv&startDate=2025-11-01&endDate=2025-11-30
```

## Error Handling

### Standard Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "aadhaarNumber",
      "reason": "Must be 12 digits"
    }
  }
}
```

### Error Codes

- `AUTHENTICATION_ERROR`: Invalid or missing authentication
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `VALIDATION_ERROR`: Invalid input data
- `NOT_FOUND_ERROR`: Resource not found
- `RATE_LIMIT_ERROR`: Too many requests
- `INTERNAL_ERROR`: Server error

### Client Error Handling

```typescript
const handleApiError = (error: ApiError) => {
  switch (error.code) {
    case 'AUTHENTICATION_ERROR':
      // Redirect to login
      redirectToLogin();
      break;
    case 'VALIDATION_ERROR':
      // Show validation errors
      showValidationErrors(error.details);
      break;
    case 'RATE_LIMIT_ERROR':
      // Show rate limit message
      showRateLimitMessage(error.retryAfter);
      break;
    default:
      // Show generic error
      showGenericError(error.message);
  }
};
```

## Rate Limiting

### Rate Limits

- **Beneficiary endpoints**: 100 requests per minute
- **Application submission**: 10 requests per hour
- **Feedback submission**: 5 requests per hour
- **Analytics endpoints**: 50 requests per minute

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
X-RateLimit-Retry-After: 60
```

### Rate Limit Response

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_ERROR",
    "message": "Too many requests",
    "retryAfter": 60
  }
}
```

## WebSocket Integration

### Real-time Updates

The API supports WebSocket connections for real-time updates:

```javascript
const ws = new WebSocket('wss://api.nyantara.com/ws');

ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  handleRealTimeUpdate(update);
};

// Subscribe to updates
ws.send(JSON.stringify({
  type: 'subscribe',
  channels: ['applications', 'disbursements', 'grievances']
}));
```

### Supported Channels

- `applications`: Application status updates
- `disbursements`: Disbursement progress updates
- `grievances`: Grievance status and communication updates
- `feedback`: Feedback responses and status updates

## SDK and Libraries

### JavaScript SDK

```javascript
import { NyantaraAPI } from '@nyantara/api-sdk';

const api = new NyantaraAPI({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.nyantara.com'
});

// Authenticate
await api.authenticate(firebaseToken);

// Use API
const beneficiaries = await api.beneficiaries.list();
const application = await api.applications.create(applicationData);
```

### Mobile SDK (Flutter)

```dart
import 'package:nyantara_mobile_sdk/nyantara_mobile_sdk.dart';

final api = NyantaraAPI(
  apiKey: 'your-api-key',
  baseUrl: 'https://api.nyantara.com'
);

// Authenticate with Firebase
await api.authenticateWithFirebase();

// Submit application
final application = await api.applications.submit(applicationData);
```

This comprehensive API reference provides all the information needed to integrate with the Nyantara DBT system programmatically.