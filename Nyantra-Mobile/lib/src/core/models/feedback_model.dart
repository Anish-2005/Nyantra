import 'package:cloud_firestore/cloud_firestore.dart';

class FeedbackModel {
  final String id;
  final String userId;
  final String subject;
  final String message;
  final int rating;
  final String status;
  final DateTime createdAt;
  final DateTime updatedAt;

  FeedbackModel({
    required this.id,
    required this.userId,
    required this.subject,
    required this.message,
    required this.rating,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
  });

  factory FeedbackModel.fromMap(String id, Map<String, dynamic> data) {
    return FeedbackModel(
      id: id,
      userId: data['userId'] ?? '',
      subject: data['subject'] ?? '',
      message: data['message'] ?? '',
      rating: data['rating'] ?? 5,
      status: data['status'] ?? 'open',
      createdAt: data['createdAt'] is DateTime
          ? data['createdAt']
          : (data['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
      updatedAt: data['updatedAt'] is DateTime
          ? data['updatedAt']
          : (data['updatedAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'userId': userId,
      'subject': subject,
      'message': message,
      'rating': rating,
      'status': status,
      'createdAt': Timestamp.fromDate(createdAt),
      'updatedAt': Timestamp.fromDate(updatedAt),
    };
  }
}
