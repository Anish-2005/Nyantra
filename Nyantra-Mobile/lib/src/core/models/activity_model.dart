import 'package:flutter/material.dart';

enum ActivityType {
  applicationSubmitted,
  applicationApproved,
  applicationRejected,
  grievanceFiled,
  grievanceResolved,
  disbursementCompleted,
  beneficiaryUpdated,
}

class ActivityModel {
  final String id;
  final ActivityType type;
  final String title;
  final String description;
  final DateTime timestamp;
  final String? relatedId; // ID of related application/grievance/disbursement

  ActivityModel({
    required this.id,
    required this.type,
    required this.title,
    required this.description,
    required this.timestamp,
    this.relatedId,
  });

  // Helper method to get icon for activity type
  IconData get icon {
    switch (type) {
      case ActivityType.applicationSubmitted:
        return Icons.assignment_turned_in;
      case ActivityType.applicationApproved:
        return Icons.check_circle;
      case ActivityType.applicationRejected:
        return Icons.cancel;
      case ActivityType.grievanceFiled:
        return Icons.report_problem;
      case ActivityType.grievanceResolved:
        return Icons.done_all;
      case ActivityType.disbursementCompleted:
        return Icons.account_balance_wallet;
      case ActivityType.beneficiaryUpdated:
        return Icons.person;
    }
  }

  // Helper method to get color for activity type
  Color get color {
    switch (type) {
      case ActivityType.applicationSubmitted:
        return Colors.blue;
      case ActivityType.applicationApproved:
        return Colors.green;
      case ActivityType.applicationRejected:
        return Colors.red;
      case ActivityType.grievanceFiled:
        return Colors.orange;
      case ActivityType.grievanceResolved:
        return Colors.green;
      case ActivityType.disbursementCompleted:
        return Colors.purple;
      case ActivityType.beneficiaryUpdated:
        return Colors.teal;
    }
  }
}
