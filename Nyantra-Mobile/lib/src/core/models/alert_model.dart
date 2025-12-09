enum AlertType { newDisbursement, installmentCompleted, statusCompleted }

class DisbursementAlert {
  final String id;
  final AlertType type;
  final String disbursementId;
  final String message;
  final DateTime timestamp;
  final Map<String, dynamic>? data;

  DisbursementAlert({
    required this.id,
    required this.type,
    required this.disbursementId,
    required this.message,
    required this.timestamp,
    this.data,
  });

  factory DisbursementAlert.fromJson(Map<String, dynamic> json) {
    return DisbursementAlert(
      id: json['id'] as String,
      type: AlertType.values.firstWhere(
        (e) => e.name == json['type'],
        orElse: () => AlertType.newDisbursement,
      ),
      disbursementId: json['disbursementId'] as String,
      message: json['message'] as String,
      timestamp: DateTime.parse(json['timestamp'] as String),
      data: json['data'] as Map<String, dynamic>?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type.name,
      'disbursementId': disbursementId,
      'message': message,
      'timestamp': timestamp.toIso8601String(),
      if (data != null) 'data': data,
    };
  }
}
