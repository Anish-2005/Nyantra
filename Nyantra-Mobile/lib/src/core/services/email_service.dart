// ignore_for_file: avoid_print

import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/alert_model.dart';

class EmailService {
  // API endpoint for sending emails (same as web app)
  // Update this to your deployed API URL
  static const String _apiBaseUrl =
      'https://your-api-domain.com'; // Replace with your actual API URL
  static const String _sendEmailEndpoint = '/api/send-email';

  static Future<void> sendDisbursementNotification({
    required DisbursementAlert alert,
    required String beneficiaryEmail,
  }) async {
    if (beneficiaryEmail.isEmpty) return;

    final subject = _getSubjectForAlertType(alert.type);
    final htmlContent = _generateHtmlContent(alert);

    try {
      final response = await http.post(
        Uri.parse('$_apiBaseUrl$_sendEmailEndpoint'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'to': beneficiaryEmail,
          'subject': subject,
          'html': htmlContent,
        }),
      );

      if (response.statusCode == 200) {
        print('📧 Email sent successfully to $beneficiaryEmail');
      } else {
        print('❌ Failed to send email: HTTP ${response.statusCode}');
        print('Response: ${response.body}');
      }
    } catch (e) {
      print('❌ Failed to send email: $e');
      rethrow;
    }
  }

  static String _getSubjectForAlertType(AlertType type) {
    switch (type) {
      case AlertType.newDisbursement:
        return 'New Disbursement Initiated - Nyantra';
      case AlertType.installmentCompleted:
        return 'Installment Payment Received - Nyantra';
      case AlertType.statusCompleted:
        return 'Payment Completed - Nyantra';
    }
  }

  static String _generateHtmlContent(DisbursementAlert alert) {
    final disbursement = alert.data?['disbursement'] as Map<String, dynamic>?;

    return '''
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Nyantra</h1>
          <p style="color: white; margin: 5px 0 0 0; opacity: 0.9;">Direct Benefit Transfer System</p>
        </div>
        
        <div style="background: #f8fafc; padding: 30px; border-radius: 10px; border-left: 4px solid #3b82f6;">
          <h2 style="color: #1e40af; margin-top: 0;">
            ${_getTitleForAlertType(alert.type)}
          </h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #374151;">
            ${alert.message}
          </p>
          
          ${_generateDisbursementDetails(disbursement)}
          
          ${_generateInstallmentNote(alert)}
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #6b7280; font-size: 14px;">
              This is an automated notification from the Nyantra Direct Benefit Transfer System.
            </p>
            <p style="color: #6b7280; font-size: 14px;">
              If you have any questions, please contact your assigned officer.
            </p>
          </div>
        </div>
      </div>
    ''';
  }

  static String _getTitleForAlertType(AlertType type) {
    switch (type) {
      case AlertType.newDisbursement:
        return 'New Disbursement Initiated';
      case AlertType.installmentCompleted:
        return 'Installment Payment Received';
      case AlertType.statusCompleted:
        return 'Payment Completed';
    }
  }

  static String _generateDisbursementDetails(
    Map<String, dynamic>? disbursement,
  ) {
    if (disbursement == null) return '';

    final transactionId = disbursement['transactionId'] ?? 'N/A';
    final reliefAmount = disbursement['reliefAmount'] ?? 0;
    final status = disbursement['status'] ?? 'Unknown';
    final actType = disbursement['actType'];

    return '''
      <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
        <h3 style="margin-top: 0; color: #1e40af;">Disbursement Details:</h3>
        <ul style="list-style: none; padding: 0;">
          <li style="padding: 5px 0;"><strong>Transaction ID:</strong> $transactionId</li>
          <li style="padding: 5px 0;"><strong>Amount:</strong> ₹${reliefAmount.toStringAsFixed(0)}</li>
          <li style="padding: 5px 0;"><strong>Status:</strong> $status</li>
          ${actType != null ? '<li style="padding: 5px 0;"><strong>Act Type:</strong> $actType</li>' : ''}
        </ul>
      </div>
    ''';
  }

  static String _generateInstallmentNote(DisbursementAlert alert) {
    if (alert.type != AlertType.installmentCompleted) return '';

    final disbursement = alert.data?['disbursement'] as Map<String, dynamic>?;
    final completedInstallments = disbursement?['completedInstallments'] ?? 0;
    final totalInstallments = disbursement?['totalInstallments'] ?? 1;

    return '''
      <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0;">
        <p style="margin: 0; color: #065f46; font-weight: 500;">
          ✅ Installment $completedInstallments of $totalInstallments has been successfully disbursed to your account.
        </p>
      </div>
    ''';
  }
}
