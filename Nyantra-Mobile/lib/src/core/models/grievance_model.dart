import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';

enum GrievanceStatus { open, inProgress, resolved, closed }

class GrievanceModel {
  final String id;
  final String beneficiaryId;
  final String userId;
  final String title;
  final String description;
  final GrievanceStatus status;
  final DateTime createdDate;
  final DateTime? resolvedDate;
  final String? resolution;
  final String? assignedTo;
  final DateTime? updatedAt;

  GrievanceModel({
    required this.id,
    required this.beneficiaryId,
    required this.userId,
    required this.title,
    required this.description,
    required this.status,
    required this.createdDate,
    this.resolvedDate,
    this.resolution,
    this.assignedTo,
    this.updatedAt,
  });

  factory GrievanceModel.fromFirestore(Map<String, dynamic> data, String id) {
    return GrievanceModel(
      id: id,
      beneficiaryId: data['beneficiaryId'] as String? ?? '',
      userId: data['userId'] as String? ?? '',
      title: data['title'] as String? ?? '',
      description: data['description'] as String? ?? '',
      status: GrievanceStatus.values.firstWhere(
        (e) => e.name == (data['status'] as String? ?? 'open'),
        orElse: () => GrievanceStatus.open,
      ),
      createdDate: data['createdDate'] != null
          ? (data['createdDate'] as Timestamp).toDate()
          : DateTime.now(),
      resolvedDate: data['resolvedDate'] != null
          ? (data['resolvedDate'] as Timestamp).toDate()
          : null,
      resolution: data['resolution'] as String?,
      assignedTo: data['assignedTo'] as String?,
      updatedAt: data['updatedAt'] != null
          ? (data['updatedAt'] as Timestamp).toDate()
          : null,
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'beneficiaryId': beneficiaryId,
      'userId': userId,
      'title': title,
      'description': description,
      'status': status.name,
      'createdDate': Timestamp.fromDate(createdDate),
      if (resolvedDate != null)
        'resolvedDate': Timestamp.fromDate(resolvedDate!),
      if (resolution != null) 'resolution': resolution,
      if (assignedTo != null) 'assignedTo': assignedTo,
      if (updatedAt != null) 'updatedAt': Timestamp.fromDate(updatedAt!),
    };
  }

  String get statusText {
    switch (status) {
      case GrievanceStatus.open:
        return 'Open';
      case GrievanceStatus.inProgress:
        return 'In Progress';
      case GrievanceStatus.resolved:
        return 'Resolved';
      case GrievanceStatus.closed:
        return 'Closed';
    }
  }

  Color get statusColor {
    switch (status) {
      case GrievanceStatus.open:
        return Colors.red;
      case GrievanceStatus.inProgress:
        return Colors.blue;
      case GrievanceStatus.resolved:
        return Colors.green;
      case GrievanceStatus.closed:
        return Colors.grey;
    }
  }
}
