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
  final DateTime? createdAt;
  final DateTime? updatedAt;

  ApplicationModel({
    required this.id,
    this.applicantName,
    this.actType,
    required this.status,
    required this.applicationDate,
    this.amountRequested,
    this.description,
    this.userId,
    this.createdAt,
    this.updatedAt,
  });

  factory ApplicationModel.fromFirestore(Map<String, dynamic> data, String id) {
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
      createdAt: data['createdAt'] != null
          ? (data['createdAt'] as Timestamp).toDate()
          : null,
      updatedAt: data['updatedAt'] != null
          ? (data['updatedAt'] as Timestamp).toDate()
          : null,
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      if (applicantName != null) 'applicantName': applicantName,
      if (actType != null) 'actType': actType,
      'status': status.name,
      'applicationDate': Timestamp.fromDate(applicationDate),
      if (amountRequested != null) 'amountRequested': amountRequested,
      if (description != null) 'description': description,
      if (userId != null) 'userId': userId,
      if (createdAt != null) 'createdAt': Timestamp.fromDate(createdAt!),
      if (updatedAt != null) 'updatedAt': Timestamp.fromDate(updatedAt!),
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
