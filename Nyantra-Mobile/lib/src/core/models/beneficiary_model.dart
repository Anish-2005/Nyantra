import 'package:cloud_firestore/cloud_firestore.dart';

class BeneficiaryModel {
  final String id;
  final String name;
  final String? phone;
  final String? aadhaar;
  final String? address;
  final String? bankAccount;
  final String? ifsc;
  final String ownerId;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  BeneficiaryModel({
    required this.id,
    required this.name,
    this.phone,
    this.aadhaar,
    this.address,
    this.bankAccount,
    this.ifsc,
    required this.ownerId,
    this.createdAt,
    this.updatedAt,
  });

  factory BeneficiaryModel.fromFirestore(Map<String, dynamic> data, String id) {
    return BeneficiaryModel(
      id: id,
      name: data['name'] as String? ?? '',
      phone: data['phone'] as String?,
      aadhaar: data['aadhaar'] as String?,
      address: data['address'] as String?,
      bankAccount: data['bankAccount'] as String?,
      ifsc: data['ifsc'] as String?,
      ownerId: data['ownerId'] as String? ?? '',
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
      'name': name,
      if (phone != null) 'phone': phone,
      if (aadhaar != null) 'aadhaar': aadhaar,
      if (address != null) 'address': address,
      if (bankAccount != null) 'bankAccount': bankAccount,
      if (ifsc != null) 'ifsc': ifsc,
      'ownerId': ownerId,
      if (createdAt != null) 'createdAt': Timestamp.fromDate(createdAt!),
      if (updatedAt != null) 'updatedAt': Timestamp.fromDate(updatedAt!),
    };
  }
}
