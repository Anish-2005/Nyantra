// ignore_for_file: deprecated_member_use

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../../core/models/disbursement_model.dart';
import '../../../core/models/beneficiary_model.dart';
import '../../../core/services/data_service.dart';
import '../../../core/providers/locale_provider.dart';

class DisbursementEditPage extends StatefulWidget {
  final DisbursementModel disbursement;

  const DisbursementEditPage({super.key, required this.disbursement});

  @override
  State<DisbursementEditPage> createState() => _DisbursementEditPageState();
}

class _DisbursementEditPageState extends State<DisbursementEditPage> {
  late TextEditingController _phoneCtrl;
  late TextEditingController _bankAccountCtrl;
  late TextEditingController _ifscCtrl;
  late TextEditingController _addressCtrl;
  BeneficiaryModel? _beneficiary;
  bool _saving = false;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _phoneCtrl = TextEditingController(
      text: widget.disbursement.userPhone ?? '',
    );
    _bankAccountCtrl = TextEditingController(
      text: widget.disbursement.userBankAccount ?? '',
    );
    _ifscCtrl = TextEditingController(text: widget.disbursement.userIFSC ?? '');
    _addressCtrl = TextEditingController(
      text: widget.disbursement.userAddress ?? '',
    );
    _loadBeneficiaryData();
  }

  @override
  void dispose() {
    _phoneCtrl.dispose();
    _bankAccountCtrl.dispose();
    _ifscCtrl.dispose();
    _addressCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadBeneficiaryData() async {
    try {
      final beneficiaryDoc = await FirebaseFirestore.instance
          .collection('beneficiaries')
          .doc(widget.disbursement.beneficiaryId)
          .get();

      if (beneficiaryDoc.exists) {
        final beneficiary = BeneficiaryModel.fromFirestore(
          beneficiaryDoc.data()!,
          beneficiaryDoc.id,
        );
        setState(() {
          _beneficiary = beneficiary;
          _loading = false;
        });
      } else {
        setState(() => _loading = false);
      }
    } catch (e) {
      setState(() => _loading = false);
      if (mounted) {
        final locale = context.read<LocaleProvider>();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(locale.translate('disbursements.errorLoading')),
          ),
        );
      }
    }
  }

  Future<void> _save() async {
    setState(() => _saving = true);
    try {
      final updates = <String, dynamic>{
        'userPhone': _phoneCtrl.text.trim(),
        'userBankAccount': _bankAccountCtrl.text.trim(),
        'userIFSC': _ifscCtrl.text.trim(),
        'userAddress': _addressCtrl.text.trim(),
      };

      await DataService.updateDisbursement(widget.disbursement.id, updates);
      if (mounted) {
        final locale = context.read<LocaleProvider>();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(locale.translate('disbursements.updateSuccess')),
          ),
        );
        Navigator.of(context).pop(true);
      }
    } catch (e) {
      if (mounted) {
        final locale = context.read<LocaleProvider>();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(locale.translate('disbursements.updateError')),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final locale = context.watch<LocaleProvider>();

    return Scaffold(
      appBar: AppBar(
        title: Text(
          locale.translate('dashboard.disbursements.editDisbursement'),
        ),
        actions: [
          if (!_loading)
            TextButton(
              onPressed: _saving ? null : _save,
              child: _saving
                  ? SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: theme.colorScheme.onPrimary,
                      ),
                    )
                  : Text(locale.translate('extracted.save')),
            ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : Padding(
              padding: const EdgeInsets.fromLTRB(16.0, 24.0, 16.0, 16.0),
              child: SingleChildScrollView(
                child: Column(
                  children: [
                    // Show beneficiary info if available
                    if (_beneficiary != null) ...[
                      Container(
                        padding: const EdgeInsets.all(16),
                        margin: const EdgeInsets.only(bottom: 16),
                        decoration: BoxDecoration(
                          color: theme.cardColor,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: theme.dividerColor.withOpacity(0.1),
                          ),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Beneficiary Information',
                              style: theme.textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text('Name: ${_beneficiary!.name}'),
                            if (_beneficiary!.phone != null)
                              Text('Phone: ${_beneficiary!.phone}'),
                            if (_beneficiary!.district != null)
                              Text('District: ${_beneficiary!.district}'),
                          ],
                        ),
                      ),
                    ] else ...[
                      Container(
                        padding: const EdgeInsets.all(16),
                        margin: const EdgeInsets.only(bottom: 16),
                        decoration: BoxDecoration(
                          color: theme.colorScheme.errorContainer.withOpacity(
                            0.1,
                          ),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: theme.colorScheme.error.withOpacity(0.3),
                          ),
                        ),
                        child: Row(
                          children: [
                            Icon(Icons.warning, color: theme.colorScheme.error),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                'Beneficiary data not found for ID: ${widget.disbursement.beneficiaryId}. You can still edit the disbursement details.',
                                style: theme.textTheme.bodyMedium?.copyWith(
                                  color: theme.colorScheme.error,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                    const SizedBox(height: 12),
                    _buildInput(
                      theme,
                      locale,
                      controller: _phoneCtrl,
                      labelKey: 'dashboard.disbursements.labels.phoneNumber',
                      keyboardType: TextInputType.phone,
                    ),
                    const SizedBox(height: 8),
                    _buildInput(
                      theme,
                      locale,
                      controller: _bankAccountCtrl,
                      labelKey: 'dashboard.disbursements.labels.bankAccount',
                    ),
                    const SizedBox(height: 8),
                    _buildInput(
                      theme,
                      locale,
                      controller: _ifscCtrl,
                      labelKey: 'dashboard.disbursements.labels.ifscCode',
                    ),
                    const SizedBox(height: 8),
                    _buildInput(
                      theme,
                      locale,
                      controller: _addressCtrl,
                      labelKey: 'dashboard.disbursements.labels.address',
                      maxLines: 3,
                    ),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildInput(
    ThemeData theme,
    LocaleProvider locale, {
    required TextEditingController controller,
    required String labelKey,
    TextInputType keyboardType = TextInputType.text,
    int maxLines = 1,
  }) {
    final label = locale.translate(labelKey);

    return TextField(
      controller: controller,
      keyboardType: keyboardType,
      maxLines: maxLines,
      decoration: InputDecoration(
        labelText: label,
        filled: true,
        fillColor: theme.cardColor.withOpacity(0.03),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
      ),
    );
  }
}
