// ignore_for_file: deprecated_member_use

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/models/beneficiary_model.dart';
import '../../../core/services/data_service.dart';
import '../../../core/providers/locale_provider.dart';

class BeneficiaryEditPage extends StatefulWidget {
  final BeneficiaryModel beneficiary;

  const BeneficiaryEditPage({super.key, required this.beneficiary});

  @override
  State<BeneficiaryEditPage> createState() => _BeneficiaryEditPageState();
}

class _BeneficiaryEditPageState extends State<BeneficiaryEditPage> {
  late TextEditingController _nameCtrl;
  late TextEditingController _aadhaarCtrl;
  late TextEditingController _bankCtrl;
  late TextEditingController _phoneCtrl;
  late TextEditingController _addressCtrl;
  late TextEditingController _categoryCtrl;
  late TextEditingController _fatherNameCtrl;
  late TextEditingController _districtCtrl;
  late TextEditingController _stateCtrl;
  late TextEditingController _ageCtrl;
  late TextEditingController _genderCtrl;
  late TextEditingController _maritalStatusCtrl;
  late TextEditingController _ifscCtrl;
  late TextEditingController _scStCertificateCtrl;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _nameCtrl = TextEditingController(text: widget.beneficiary.name);
    _aadhaarCtrl = TextEditingController(text: widget.beneficiary.aadhaar);
    _bankCtrl = TextEditingController(text: widget.beneficiary.bankAccount);
    _phoneCtrl = TextEditingController(text: widget.beneficiary.phone);
    _addressCtrl = TextEditingController(text: widget.beneficiary.address);
    _categoryCtrl = TextEditingController(text: widget.beneficiary.category);
    _fatherNameCtrl = TextEditingController(
      text: widget.beneficiary.fatherName,
    );
    _districtCtrl = TextEditingController(text: widget.beneficiary.district);
    _stateCtrl = TextEditingController(text: widget.beneficiary.state);
    _ageCtrl = TextEditingController(text: widget.beneficiary.age?.toString());
    _genderCtrl = TextEditingController(text: widget.beneficiary.gender);
    _maritalStatusCtrl = TextEditingController(
      text: widget.beneficiary.maritalStatus,
    );
    _ifscCtrl = TextEditingController(text: widget.beneficiary.ifsc);
    _scStCertificateCtrl = TextEditingController(
      text: widget.beneficiary.scStCertificate,
    );
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _aadhaarCtrl.dispose();
    _bankCtrl.dispose();
    _phoneCtrl.dispose();
    _addressCtrl.dispose();
    _categoryCtrl.dispose();
    _fatherNameCtrl.dispose();
    _districtCtrl.dispose();
    _stateCtrl.dispose();
    _ageCtrl.dispose();
    _genderCtrl.dispose();
    _maritalStatusCtrl.dispose();
    _ifscCtrl.dispose();
    _scStCertificateCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    setState(() => _saving = true);
    try {
      final updates = <String, dynamic>{};
      updates['name'] = _nameCtrl.text.trim();
      updates['fatherName'] = _fatherNameCtrl.text.trim();
      updates['aadhaar'] = _aadhaarCtrl.text.trim();
      updates['phone'] = _phoneCtrl.text.trim();
      updates['district'] = _districtCtrl.text.trim();
      updates['state'] = _stateCtrl.text.trim();
      updates['address'] = _addressCtrl.text.trim();
      updates['age'] = int.tryParse(_ageCtrl.text.trim());
      updates['gender'] = _genderCtrl.text.trim();
      updates['category'] = _categoryCtrl.text.trim();
      updates['maritalStatus'] = _maritalStatusCtrl.text.trim();
      updates['bankAccount'] = _bankCtrl.text.trim();
      updates['ifsc'] = _ifscCtrl.text.trim();
      updates['scStCertificate'] = _scStCertificateCtrl.text.trim();

      await DataService.updateBeneficiary(widget.beneficiary.id, updates);
      if (mounted) Navigator.of(context).pop(true);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error: $e')));
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
        title: Text(locale.translate('beneficiaries.editBeneficiary')),
        actions: [
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
      body: Padding(
        padding: const EdgeInsets.fromLTRB(16.0, 24.0, 16.0, 16.0),
        child: SingleChildScrollView(
          child: Column(
            children: [
              const SizedBox(height: 12),
              _buildInput(
                theme,
                locale,
                controller: _nameCtrl,
                labelKey: 'beneficiaries.fullName',
                keyboardType: TextInputType.name,
              ),
              const SizedBox(height: 8),
              _buildInput(
                theme,
                locale,
                controller: _fatherNameCtrl,
                labelKey: 'beneficiaries.fatherName',
              ),
              const SizedBox(height: 8),
              _buildInput(
                theme,
                locale,
                controller: _aadhaarCtrl,
                labelKey: 'beneficiaries.aadhaarNumber',
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 8),
              _buildInput(
                theme,
                locale,
                controller: _phoneCtrl,
                labelKey: 'beneficiaries.phoneNumber',
                keyboardType: TextInputType.phone,
              ),
              const SizedBox(height: 8),
              _buildInput(
                theme,
                locale,
                controller: _districtCtrl,
                labelKey: 'beneficiaries.district',
              ),
              const SizedBox(height: 8),
              _buildInput(
                theme,
                locale,
                controller: _stateCtrl,
                labelKey: 'beneficiaries.state',
              ),
              const SizedBox(height: 8),
              _buildInput(
                theme,
                locale,
                controller: _addressCtrl,
                labelKey: 'beneficiaries.completeAddress',
                maxLines: 3,
              ),
              const SizedBox(height: 8),
              _buildInput(
                theme,
                locale,
                controller: _ageCtrl,
                labelKey: 'beneficiaries.age',
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 8),
              _buildInput(
                theme,
                locale,
                controller: _genderCtrl,
                labelKey: 'beneficiaries.gender',
              ),
              const SizedBox(height: 8),
              _buildInput(
                theme,
                locale,
                controller: _categoryCtrl,
                labelKey: 'beneficiaries.category',
              ),
              const SizedBox(height: 8),
              _buildInput(
                theme,
                locale,
                controller: _maritalStatusCtrl,
                labelKey: 'beneficiaries.maritalStatus',
              ),
              const SizedBox(height: 8),
              _buildInput(
                theme,
                locale,
                controller: _bankCtrl,
                labelKey: 'beneficiaries.bankAccount',
              ),
              const SizedBox(height: 8),
              _buildInput(
                theme,
                locale,
                controller: _ifscCtrl,
                labelKey: 'beneficiaries.ifscCode',
              ),
              const SizedBox(height: 8),
              _buildInput(
                theme,
                locale,
                controller: _scStCertificateCtrl,
                labelKey: 'beneficiaries.sc_st_certificate',
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
    final label =
        labelKey.startsWith('beneficiaries.') ||
            labelKey.startsWith('extracted.')
        ? locale.translate(labelKey)
        : labelKey;

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
