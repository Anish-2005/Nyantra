import 'package:cloud_firestore/cloud_firestore.dart';

class Report {
  final String id;
  final String name;
  final String type;
  final String category;
  final String frequency;
  final String status;
  final String? fileSize;
  final String fileFormat;
  final String? generatedDate;
  final String? generatedBy;
  final Map<String, dynamic>? schedule;
  final String? lastRun;
  final String? nextRun;
  final int? recordCount;
  final String description;
  final Map<String, dynamic>? parameters;
  final int downloadCount;
  final bool isScheduled;
  final List<String> recipients;
  final List<String> columns;
  final String? createdAt;
  final String? updatedAt;

  Report({
    required this.id,
    required this.name,
    required this.type,
    required this.category,
    required this.frequency,
    required this.status,
    this.fileSize,
    this.fileFormat = 'PDF',
    this.generatedDate,
    this.generatedBy,
    this.schedule,
    this.lastRun,
    this.nextRun,
    this.recordCount,
    required this.description,
    this.parameters,
    required this.downloadCount,
    required this.isScheduled,
    required this.recipients,
    required this.columns,
    this.createdAt,
    this.updatedAt,
  });

  factory Report.fromJson(Map<String, dynamic> json, String id) {
    // Helper function to convert Firestore timestamp to ISO string
    String? toIsoString(dynamic value) {
      if (value == null) return null;
      if (value is Timestamp) {
        return value.toDate().toIso8601String();
      }
      return value.toString();
    }

    try {
      final name = json['name'] ?? 'Unnamed Report';
      final type = json['type'] ?? 'general';
      final category = json['category'] ?? 'analytical';
      final frequency = json['frequency'] ?? 'once';
      final status = json['status'] ?? 'completed';
      final description = json['description'] ?? '';

      return Report(
        id: id,
        name: name,
        type: type,
        category: category,
        frequency: frequency,
        status: status,
        fileSize: json['fileSize']?.toString(),
        fileFormat: json['fileFormat'] ?? 'PDF',
        generatedDate: toIsoString(json['generatedDate']),
        generatedBy: json['generatedBy']?.toString(),
        schedule: json['schedule'],
        lastRun: toIsoString(json['lastRun']),
        nextRun: toIsoString(json['nextRun']),
        recordCount: json['recordCount'] is int
            ? json['recordCount']
            : int.tryParse(json['recordCount']?.toString() ?? ''),
        description: description,
        parameters: json['parameters'],
        downloadCount: json['downloadCount'] is int
            ? json['downloadCount']
            : int.tryParse(json['downloadCount']?.toString() ?? '0') ?? 0,
        isScheduled: json['isScheduled'] ?? false,
        recipients: json['recipients'] is List
            ? List<String>.from(json['recipients'])
            : [],
        columns: json['columns'] is List
            ? List<String>.from(json['columns'])
            : [],
        createdAt: toIsoString(json['createdAt']),
        updatedAt: toIsoString(json['updatedAt']),
      );
    } catch (e) {
      print('Error parsing Report with id $id: $e');
      print('Report data keys: ${json.keys.toList()}');
      print('Report data: $json');
      // Return a basic report to avoid crashes
      return Report(
        id: id,
        name: json['name']?.toString() ?? 'Error Report',
        type: 'error',
        category: 'error',
        frequency: 'once',
        status: 'failed',
        description: 'Error parsing report data: $e',
        downloadCount: 0,
        isScheduled: false,
        recipients: [],
        columns: [],
      );
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'type': type,
      'category': category,
      'frequency': frequency,
      'status': status,
      'fileSize': fileSize,
      'fileFormat': fileFormat,
      'generatedDate': generatedDate,
      'generatedBy': generatedBy,
      'schedule': schedule,
      'lastRun': lastRun,
      'nextRun': nextRun,
      'recordCount': recordCount,
      'description': description,
      'parameters': parameters,
      'downloadCount': downloadCount,
      'isScheduled': isScheduled,
      'recipients': recipients,
      'columns': columns,
      'createdAt': createdAt,
      'updatedAt': updatedAt,
    };
  }
}
