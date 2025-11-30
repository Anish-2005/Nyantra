import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';

enum DisbursementStatus { pending, completed, failed, cancelled }

class DisbursementModel {
  final String id;
  final String beneficiaryId;
  final String applicationId;
  final double reliefAmount;
  final DisbursementStatus status;
  final DateTime? disbursementDate;
  final String? transactionId;
  final String? notes;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  DisbursementModel({
    required this.id,
    required this.beneficiaryId,
    required this.applicationId,
    required this.reliefAmount,
    required this.status,
    this.disbursementDate,
    this.transactionId,
    this.notes,
    this.createdAt,
    this.updatedAt,
  });

  factory DisbursementModel.fromFirestore(
    Map<String, dynamic> data,
    String id,
  ) {
    return DisbursementModel(
      id: id,
      beneficiaryId: data['beneficiaryId'] as String? ?? '',
      applicationId: data['applicationId'] as String? ?? '',
      reliefAmount: (data['reliefAmount'] as num?)?.toDouble() ?? 0.0,
      status: DisbursementStatus.values.firstWhere(
        (e) => e.name == (data['status'] as String? ?? 'pending'),
        orElse: () => DisbursementStatus.pending,
      ),
      disbursementDate: data['disbursementDate'] != null
          ? (data['disbursementDate'] as Timestamp).toDate()
          : null,
      transactionId: data['transactionId'] as String?,
      notes: data['notes'] as String?,
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
      'beneficiaryId': beneficiaryId,
      'applicationId': applicationId,
      'reliefAmount': reliefAmount,
      'status': status.name,
      if (disbursementDate != null)
        'disbursementDate': Timestamp.fromDate(disbursementDate!),
      if (transactionId != null) 'transactionId': transactionId,
      if (notes != null) 'notes': notes,
      if (createdAt != null) 'createdAt': Timestamp.fromDate(createdAt!),
      if (updatedAt != null) 'updatedAt': Timestamp.fromDate(updatedAt!),
    };
  }

  String get statusText {
    switch (status) {
      case DisbursementStatus.pending:
        return 'Pending';
      case DisbursementStatus.completed:
        return 'Completed';
      case DisbursementStatus.failed:
        return 'Failed';
      case DisbursementStatus.cancelled:
        return 'Cancelled';
    }
  }

  Color get statusColor {
    switch (status) {
      case DisbursementStatus.pending:
        return Colors.orange;
      case DisbursementStatus.completed:
        return Colors.green;
      case DisbursementStatus.failed:
        return Colors.red;
      case DisbursementStatus.cancelled:
        return Colors.grey;
    }
  }
}
