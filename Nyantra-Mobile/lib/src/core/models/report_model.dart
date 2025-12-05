// ignore_for_file: avoid_print

import 'package:cloud_firestore/cloud_firestore.dart';
import 'dart:convert';

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

    // Helper function to parse JSON strings back to maps
    Map<String, dynamic>? parseJsonMap(dynamic value) {
      if (value == null) return null;
      if (value is Map<String, dynamic>) return value;
      if (value is String) {
        try {
          // Try to decode JSON string
          return jsonDecode(value) as Map<String, dynamic>;
        } catch (e) {
          print('Error parsing JSON map: $e');
          return null;
        }
      }
      return null;
    }

    // Helper function to parse JSON strings back to lists
    List<String> parseJsonList(dynamic value) {
      if (value == null) return [];
      if (value is List) return List<String>.from(value);
      if (value is String) {
        try {
          // Try to decode JSON string
          final decoded = jsonDecode(value);
          if (decoded is List) {
            return List<String>.from(decoded);
          }
          return [];
        } catch (e) {
          print('Error parsing JSON list: $e');
          return [];
        }
      }
      return [];
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
        schedule: parseJsonMap(json['schedule']),
        lastRun: toIsoString(json['lastRun']),
        nextRun: toIsoString(json['nextRun']),
        recordCount: json['recordCount'] is int
            ? json['recordCount']
            : json['recordCount'] is String
            ? int.tryParse(json['recordCount'])
            : null,
        description: description,
        parameters: parseJsonMap(json['parameters']),
        downloadCount: json['downloadCount'] is int
            ? json['downloadCount']
            : json['downloadCount'] is String
            ? int.tryParse(json['downloadCount']) ?? 0
            : 0,
        isScheduled: json['isScheduled'] is bool
            ? json['isScheduled']
            : json['isScheduled']?.toString().toLowerCase() == 'true',
        recipients: parseJsonList(json['recipients']),
        columns: parseJsonList(json['columns']),
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
