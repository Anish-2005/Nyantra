import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';

enum ApplicationStatus { pending, approved, rejected, underReview }

class ApplicationModel {
  final String id;
  final String? applicantName;
  final String? actType;
  final ApplicationStatus status;
  final DateTime applicationDate;
  final double? amountRequested;
  final String? description;
  final String? userId;
  final String? ownerId;
  final String? beneficiaryId;
  final String? contactNumber;
  final String? contactEmail;
  final String? address;
  final String? bankAccount;
  final String? bankIfsc;
  final String? aadhaar;
  final List<String>? attachments;
  final String? remarks;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  // Additional fields from web app
  final String? district;
  final String? state;
  final String? incidentDate;
  final String? priority;
  final String? assignedOfficer;
  final int? documents;
  final String? lastUpdate;
  final String? fatherName;
  final String? email;
  final String? caseNumber;
  final String? registrationDate;
  final String? category;
  final int? age;
  final String? gender;
  final String? maritalStatus;
  final String? ifsc;

  ApplicationModel({
    required this.id,
    this.applicantName,
    this.actType,
    required this.status,
    required this.applicationDate,
    this.amountRequested,
    this.description,
    this.userId,
    this.ownerId,
    this.beneficiaryId,
    this.contactNumber,
    this.contactEmail,
    this.address,
    this.bankAccount,
    this.bankIfsc,
    this.aadhaar,
    this.attachments,
    this.remarks,
    this.createdAt,
    this.updatedAt,
    this.district,
    this.state,
    this.incidentDate,
    this.priority,
    this.assignedOfficer,
    this.documents,
    this.lastUpdate,
    this.fatherName,
    this.email,
    this.caseNumber,
    this.registrationDate,
    this.category,
    this.age,
    this.gender,
    this.maritalStatus,
    this.ifsc,
  });

  factory ApplicationModel.fromFirestore(Map<String, dynamic> data, String id) {
    // Helper function to convert date fields that might be String or Timestamp
    String? convertDateField(dynamic value) {
      if (value == null) return null;
      if (value is Timestamp) return value.toDate().toIso8601String();
      if (value is String) return value;
      return value.toString();
    }

    return ApplicationModel(
      id: id,
      applicantName: data['applicantName'] as String?,
      actType: data['actType'] as String?,
      status: ApplicationStatus.values.firstWhere(
        (e) => e.name == (data['status'] as String? ?? 'pending'),
        orElse: () => ApplicationStatus.pending,
      ),
      applicationDate: data['applicationDate'] != null
          ? (data['applicationDate'] as Timestamp).toDate()
          : DateTime.now(),
      amountRequested: (data['amountRequested'] as num?)?.toDouble(),
      description: data['description'] as String?,
      userId: data['userId'] as String?,
      ownerId: data['ownerId'] as String?,
      beneficiaryId: data['beneficiaryId'] as String?,
      contactNumber: data['contactNumber'] as String?,
      contactEmail: data['contactEmail'] as String?,
      address: data['address'] as String?,
      bankAccount: data['bankAccount'] as String?,
      bankIfsc: data['bankIfsc'] as String?,
      aadhaar: data['aadhaar'] as String?,
      attachments: (data['attachments'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
      remarks: data['remarks'] as String?,
      createdAt: data['createdAt'] != null
          ? (data['createdAt'] as Timestamp).toDate()
          : null,
      updatedAt: data['updatedAt'] != null
          ? (data['updatedAt'] as Timestamp).toDate()
          : null,
      district: data['district'] as String?,
      state: data['state'] as String?,
      incidentDate: convertDateField(data['incidentDate']),
      priority: data['priority'] as String?,
      assignedOfficer: data['assignedOfficer'] as String?,
      documents: (data['documents'] as num?)?.toInt(),
      lastUpdate: convertDateField(data['lastUpdate']),
      fatherName: data['fatherName'] as String?,
      email: data['email'] as String?,
      caseNumber: data['caseNumber'] as String?,
      registrationDate: convertDateField(data['registrationDate']),
      category: data['category'] as String?,
      age: (data['age'] as num?)?.toInt(),
      gender: data['gender'] as String?,
      maritalStatus: data['maritalStatus'] as String?,
      ifsc: data['ifsc'] as String?,
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      if (applicantName != null) 'applicantName': applicantName,
      if (actType != null) 'actType': actType,
      if (ownerId != null) 'ownerId': ownerId,
      if (beneficiaryId != null) 'beneficiaryId': beneficiaryId,
      if (contactNumber != null) 'contactNumber': contactNumber,
      if (contactEmail != null) 'contactEmail': contactEmail,
      if (address != null) 'address': address,
      if (bankAccount != null) 'bankAccount': bankAccount,
      if (bankIfsc != null) 'bankIfsc': bankIfsc,
      if (aadhaar != null) 'aadhaar': aadhaar,
      if (attachments != null) 'attachments': attachments,
      if (remarks != null) 'remarks': remarks,
      'status': status.name,
      'applicationDate': Timestamp.fromDate(applicationDate),
      if (amountRequested != null) 'amountRequested': amountRequested,
      if (description != null) 'description': description,
      if (userId != null) 'userId': userId,
      if (createdAt != null) 'createdAt': Timestamp.fromDate(createdAt!),
      if (updatedAt != null) 'updatedAt': Timestamp.fromDate(updatedAt!),
      if (district != null) 'district': district,
      if (state != null) 'state': state,
      if (incidentDate != null) 'incidentDate': incidentDate,
      if (priority != null) 'priority': priority,
      if (assignedOfficer != null) 'assignedOfficer': assignedOfficer,
      if (documents != null) 'documents': documents,
      if (lastUpdate != null) 'lastUpdate': lastUpdate,
      if (fatherName != null) 'fatherName': fatherName,
      if (email != null) 'email': email,
      if (caseNumber != null) 'caseNumber': caseNumber,
      if (registrationDate != null) 'registrationDate': registrationDate,
      if (category != null) 'category': category,
      if (age != null) 'age': age,
      if (gender != null) 'gender': gender,
      if (maritalStatus != null) 'maritalStatus': maritalStatus,
      if (ifsc != null) 'ifsc': ifsc,
    };
  }

  String get statusText {
    switch (status) {
      case ApplicationStatus.pending:
        return 'Pending';
      case ApplicationStatus.approved:
        return 'Approved';
      case ApplicationStatus.rejected:
        return 'Rejected';
      case ApplicationStatus.underReview:
        return 'Under Review';
    }
  }

  Color get statusColor {
    switch (status) {
      case ApplicationStatus.pending:
        return Colors.orange;
      case ApplicationStatus.approved:
        return Colors.green;
      case ApplicationStatus.rejected:
        return Colors.red;
      case ApplicationStatus.underReview:
        return Colors.blue;
    }
  }
}
