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
  final String? actType;
  final String? category;
  final DateTime? registrationDate;
  final String? status;
  final String? fatherName;
  final String? district;
  final String? state;
  final int? age;
  final String? gender;
  final String? maritalStatus;
  final String? scStCertificate;

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
    this.actType,
    this.category,
    this.registrationDate,
    this.status,
    this.fatherName,
    this.district,
    this.state,
    this.age,
    this.gender,
    this.maritalStatus,
    this.scStCertificate,
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
      actType: data['actType'] as String?,
      category: data['category'] as String?,
      registrationDate: data['registrationDate'] != null
          ? (data['registrationDate'] as Timestamp).toDate()
          : null,
      status: data['status'] as String?,
      fatherName: data['fatherName'] as String?,
      district: data['district'] as String?,
      state: data['state'] as String?,
      age: data['age'] as int?,
      gender: data['gender'] as String?,
      maritalStatus: data['maritalStatus'] as String?,
      scStCertificate: data['scStCertificate'] as String?,
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
      if (actType != null) 'actType': actType,
      if (category != null) 'category': category,
      if (registrationDate != null)
        'registrationDate': Timestamp.fromDate(registrationDate!),
      if (status != null) 'status': status,
      if (fatherName != null) 'fatherName': fatherName,
      if (district != null) 'district': district,
      if (state != null) 'state': state,
      if (age != null) 'age': age,
      if (gender != null) 'gender': gender,
      if (maritalStatus != null) 'maritalStatus': maritalStatus,
      if (scStCertificate != null) 'scStCertificate': scStCertificate,
    };
  }

  factory BeneficiaryModel.fromJson(Map<String, dynamic> json) {
    return BeneficiaryModel(
      id: json['id'],
      name: json['name'],
      phone: json['phone'],
      aadhaar: json['aadhaar'],
      address: json['address'],
      bankAccount: json['bankAccount'],
      ifsc: json['ifsc'],
      ownerId: json['ownerId'],
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : null,
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'])
          : null,
      actType: json['actType'],
      category: json['category'],
      registrationDate: json['registrationDate'] != null
          ? DateTime.parse(json['registrationDate'])
          : null,
      status: json['status'],
      fatherName: json['fatherName'],
      district: json['district'],
      state: json['state'],
      age: json['age'],
      gender: json['gender'],
      maritalStatus: json['maritalStatus'],
      scStCertificate: json['scStCertificate'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'phone': phone,
      'aadhaar': aadhaar,
      'address': address,
      'bankAccount': bankAccount,
      'ifsc': ifsc,
      'ownerId': ownerId,
      'createdAt': createdAt?.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
      'actType': actType,
      'category': category,
      'registrationDate': registrationDate?.toIso8601String(),
      'status': status,
      'fatherName': fatherName,
      'district': district,
      'state': state,
      'age': age,
      'gender': gender,
      'maritalStatus': maritalStatus,
      'scStCertificate': scStCertificate,
    };
  }
}
