import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';

enum ApplicationStatus { pending, approved, rejected, underReview }

class ApplicationModel {
  final String id;
  final String? applicantName;
  final String? actType;
  final ApplicationStatus status;
  final DateTime applicationDate;
  final double? amount;
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
  final String? firReport;
  final String? medicalReport;
  final String? policeStation;
  // PoA specific fields
  final String? offenceCategory;
  final String? offenceType;

  ApplicationModel({
    required this.id,
    this.applicantName,
    this.actType,
    required this.status,
    required this.applicationDate,
    this.amount,
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
    this.firReport,
    this.medicalReport,
    this.policeStation,
    this.offenceCategory,
    this.offenceType,
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
      amount: (data['amount'] as num?)?.toDouble(),
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
      firReport: data['firReport'] as String?,
      medicalReport: data['medicalReport'] as String?,
      policeStation: data['policeStation'] as String?,
      offenceCategory: data['offenceCategory'] as String?,
      offenceType: data['offenceType'] as String?,
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
      if (amount != null) 'amount': amount,
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
      if (firReport != null) 'firReport': firReport,
      if (medicalReport != null) 'medicalReport': medicalReport,
      if (policeStation != null) 'policeStation': policeStation,
      if (offenceCategory != null) 'offenceCategory': offenceCategory,
      if (offenceType != null) 'offenceType': offenceType,
    };
  }

  factory ApplicationModel.fromJson(Map<String, dynamic> json) {
    return ApplicationModel(
      id: json['id'],
      applicantName: json['applicantName'],
      actType: json['actType'],
      status: ApplicationStatus.values.firstWhere(
        (e) => e.name == (json['status'] ?? 'pending'),
        orElse: () => ApplicationStatus.pending,
      ),
      applicationDate: DateTime.parse(json['applicationDate']),
      amount: json['amount'],
      description: json['description'],
      userId: json['userId'],
      ownerId: json['ownerId'],
      beneficiaryId: json['beneficiaryId'],
      contactNumber: json['contactNumber'],
      contactEmail: json['contactEmail'],
      address: json['address'],
      bankAccount: json['bankAccount'],
      bankIfsc: json['bankIfsc'],
      aadhaar: json['aadhaar'],
      attachments: json['attachments'] != null
          ? List<String>.from(json['attachments'])
          : null,
      remarks: json['remarks'],
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : null,
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'])
          : null,
      district: json['district'],
      state: json['state'],
      incidentDate: json['incidentDate'],
      priority: json['priority'],
      assignedOfficer: json['assignedOfficer'],
      documents: json['documents'],
      lastUpdate: json['lastUpdate'],
      fatherName: json['fatherName'],
      email: json['email'],
      caseNumber: json['caseNumber'],
      registrationDate: json['registrationDate'],
      category: json['category'],
      age: json['age'],
      gender: json['gender'],
      maritalStatus: json['maritalStatus'],
      ifsc: json['ifsc'],
      firReport: json['firReport'],
      medicalReport: json['medicalReport'],
      policeStation: json['policeStation'],
      offenceCategory: json['offenceCategory'],
      offenceType: json['offenceType'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'applicantName': applicantName,
      'actType': actType,
      'status': status.name,
      'applicationDate': applicationDate.toIso8601String(),
      'amount': amount,
      'description': description,
      'userId': userId,
      'ownerId': ownerId,
      'beneficiaryId': beneficiaryId,
      'contactNumber': contactNumber,
      'contactEmail': contactEmail,
      'address': address,
      'bankAccount': bankAccount,
      'bankIfsc': bankIfsc,
      'aadhaar': aadhaar,
      'attachments': attachments,
      'remarks': remarks,
      'createdAt': createdAt?.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
      'district': district,
      'state': state,
      'incidentDate': incidentDate,
      'priority': priority,
      'assignedOfficer': assignedOfficer,
      'documents': documents,
      'lastUpdate': lastUpdate,
      'fatherName': fatherName,
      'email': email,
      'caseNumber': caseNumber,
      'registrationDate': registrationDate,
      'category': category,
      'age': age,
      'gender': gender,
      'maritalStatus': maritalStatus,
      'ifsc': ifsc,
      'firReport': firReport,
      'medicalReport': medicalReport,
      'policeStation': policeStation,
      'offenceCategory': offenceCategory,
      'offenceType': offenceType,
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
