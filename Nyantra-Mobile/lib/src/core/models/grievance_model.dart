import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';

enum GrievanceStatus { open, inProgress, resolved, closed }

class GrievanceModel {
  final String id;
  final String? beneficiaryId;
  final String? userId;
  final String? beneficiaryName;
  final String? phone;
  final String? email;
  final String? district;
  final String? state;
  final String? actType;
  final String? applicationId;
  final String? category;
  final String? subCategory;
  final String? priority;
  final GrievanceStatus status;
  final String? assignedTo;
  final String? assignedDate;
  final DateTime? createdDate;
  final String? lastUpdated;
  final DateTime? resolvedDate;
  final String? expectedResolution;
  final String? title;
  final String? description;
  final int? attachments;
  final List<dynamic>? communication;
  final int? escalationLevel;
  final double? satisfactionRating;
  final bool? followUpRequired;
  final List<String>? relatedGrievances;

  GrievanceModel({
    required this.id,
    this.beneficiaryId,
    this.userId,
    this.beneficiaryName,
    this.phone,
    this.email,
    this.district,
    this.state,
    this.actType,
    this.applicationId,
    this.category,
    this.subCategory,
    this.priority,
    required this.status,
    this.assignedTo,
    this.assignedDate,
    this.createdDate,
    this.lastUpdated,
    this.resolvedDate,
    this.expectedResolution,
    this.title,
    this.description,
    this.attachments,
    this.communication,
    this.escalationLevel,
    this.satisfactionRating,
    this.followUpRequired,
    this.relatedGrievances,
  });

  factory GrievanceModel.fromFirestore(Map<String, dynamic> data, String id) {
    return GrievanceModel(
      id: id,
      beneficiaryId: data['beneficiaryId'] as String?,
      userId: data['userId'] as String?,
      beneficiaryName:
          data['beneficiaryName'] as String? ?? data['name'] as String?,
      phone: data['phone'] as String?,
      email: data['email'] as String?,
      district: data['district'] as String?,
      state: data['state'] as String?,
      actType: data['actType'] as String?,
      applicationId: data['applicationId'] as String?,
      category: data['category'] as String?,
      subCategory: data['subCategory'] as String?,
      priority: data['priority'] as String?,
      status: GrievanceStatus.values.firstWhere(
        (e) => e.name == (data['status'] as String? ?? 'open'),
        orElse: () => GrievanceStatus.open,
      ),
      assignedTo: data['assignedTo'] as String?,
      assignedDate: data['assignedDate'] as String?,
      createdDate: data['createdDate'] != null
          ? (data['createdDate'] as Timestamp).toDate()
          : DateTime.now(),
      lastUpdated: data['lastUpdated'] != null
          ? (data['lastUpdated'] as Timestamp).toDate().toString()
          : null,
      resolvedDate: data['resolvedDate'] != null
          ? (data['resolvedDate'] as Timestamp).toDate()
          : null,
      expectedResolution: data['expectedResolution'] != null
          ? (data['expectedResolution'] as Timestamp).toDate().toString()
          : null,
      title: data['title'] as String?,
      description: data['description'] as String?,
      attachments: data['attachments'] as int? ?? 0,
      communication: data['communication'] as List<dynamic>? ?? [],
      escalationLevel: data['escalationLevel'] as int? ?? 0,
      satisfactionRating: (data['satisfactionRating'] as num?)?.toDouble(),
      followUpRequired: data['followUpRequired'] as bool? ?? false,
      relatedGrievances:
          (data['relatedGrievances'] as List<dynamic>?)?.cast<String>() ?? [],
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      if (beneficiaryId != null) 'beneficiaryId': beneficiaryId,
      if (userId != null) 'userId': userId,
      if (beneficiaryName != null) 'beneficiaryName': beneficiaryName,
      if (phone != null) 'phone': phone,
      if (email != null) 'email': email,
      if (district != null) 'district': district,
      if (state != null) 'state': state,
      if (actType != null) 'actType': actType,
      if (applicationId != null) 'applicationId': applicationId,
      if (category != null) 'category': category,
      if (subCategory != null) 'subCategory': subCategory,
      if (priority != null) 'priority': priority,
      'status': status.name,
      if (assignedTo != null) 'assignedTo': assignedTo,
      if (assignedDate != null) 'assignedDate': assignedDate,
      if (createdDate != null) 'createdDate': Timestamp.fromDate(createdDate!),
      if (lastUpdated != null)
        'lastUpdated': Timestamp.fromDate(DateTime.parse(lastUpdated!)),
      if (resolvedDate != null)
        'resolvedDate': Timestamp.fromDate(resolvedDate!),
      if (expectedResolution != null)
        'expectedResolution': Timestamp.fromDate(
          DateTime.parse(expectedResolution!),
        ),
      if (title != null) 'title': title,
      if (description != null) 'description': description,
      if (attachments != null) 'attachments': attachments,
      if (communication != null) 'communication': communication,
      if (escalationLevel != null) 'escalationLevel': escalationLevel,
      if (satisfactionRating != null) 'satisfactionRating': satisfactionRating,
      if (followUpRequired != null) 'followUpRequired': followUpRequired,
      if (relatedGrievances != null) 'relatedGrievances': relatedGrievances,
    };
  }

  factory GrievanceModel.fromJson(Map<String, dynamic> json) {
    return GrievanceModel(
      id: json['id'],
      beneficiaryId: json['beneficiaryId'],
      userId: json['userId'],
      beneficiaryName: json['beneficiaryName'],
      phone: json['phone'],
      email: json['email'],
      district: json['district'],
      state: json['state'],
      actType: json['actType'],
      applicationId: json['applicationId'],
      category: json['category'],
      subCategory: json['subCategory'],
      priority: json['priority'],
      status: GrievanceStatus.values.firstWhere(
        (e) => e.name == (json['status'] ?? 'open'),
        orElse: () => GrievanceStatus.open,
      ),
      assignedTo: json['assignedTo'],
      assignedDate: json['assignedDate'],
      createdDate: json['createdDate'] != null
          ? DateTime.parse(json['createdDate'])
          : null,
      lastUpdated: json['lastUpdated'],
      resolvedDate: json['resolvedDate'] != null
          ? DateTime.parse(json['resolvedDate'])
          : null,
      expectedResolution: json['expectedResolution'],
      title: json['title'],
      description: json['description'],
      attachments: json['attachments'],
      communication: json['communication'],
      escalationLevel: json['escalationLevel'],
      satisfactionRating: json['satisfactionRating'],
      followUpRequired: json['followUpRequired'] == 1,
      relatedGrievances: json['relatedGrievances'] != null
          ? List<String>.from(json['relatedGrievances'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'beneficiaryId': beneficiaryId,
      'userId': userId,
      'beneficiaryName': beneficiaryName,
      'phone': phone,
      'email': email,
      'district': district,
      'state': state,
      'actType': actType,
      'applicationId': applicationId,
      'category': category,
      'subCategory': subCategory,
      'priority': priority,
      'status': status.name,
      'assignedTo': assignedTo,
      'assignedDate': assignedDate,
      'createdDate': createdDate?.toIso8601String(),
      'lastUpdated': lastUpdated,
      'resolvedDate': resolvedDate?.toIso8601String(),
      'expectedResolution': expectedResolution,
      'title': title,
      'description': description,
      'attachments': attachments,
      'communication': communication,
      'escalationLevel': escalationLevel,
      'satisfactionRating': satisfactionRating,
      'followUpRequired': followUpRequired == true ? 1 : 0,
      'relatedGrievances': relatedGrievances,
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
