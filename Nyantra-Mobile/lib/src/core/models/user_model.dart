import 'package:cloud_firestore/cloud_firestore.dart';

class UserModel {
  final String id;
  final String? email;
  final String? displayName;
  final String? role; // 'user' or 'officer'
  final bool? verified;
  final DateTime? createdAt;

  UserModel({
    required this.id,
    this.email,
    this.displayName,
    this.role,
    this.verified,
    this.createdAt,
  });

  factory UserModel.fromFirestore(Map<String, dynamic> data, String id) {
    return UserModel(
      id: id,
      email: data['email'] as String?,
      displayName: data['displayName'] as String?,
      role: data['role'] as String?,
      verified: data['verified'] as bool?,
      createdAt: data['createdAt'] != null
          ? (data['createdAt'] as Timestamp).toDate()
          : null,
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      if (email != null) 'email': email,
      if (displayName != null) 'displayName': displayName,
      if (role != null) 'role': role,
      if (verified != null) 'verified': verified,
      if (createdAt != null) 'createdAt': Timestamp.fromDate(createdAt!),
    };
  }

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'],
      email: json['email'],
      displayName: json['displayName'],
      role: json['role'],
      verified: json['verified'] == 1,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'displayName': displayName,
      'role': role,
      'verified': verified == true ? 1 : 0,
      'createdAt': createdAt?.toIso8601String(),
    };
  }
}
