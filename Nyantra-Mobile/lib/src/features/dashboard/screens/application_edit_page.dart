// ignore_for_file: use_build_context_synchronously, deprecated_member_use

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/models/application_model.dart';
import '../../../core/services/data_service.dart';
import '../../../core/providers/locale_provider.dart';

class ApplicationEditPage extends StatefulWidget {
  final ApplicationModel application;

  const ApplicationEditPage({super.key, required this.application});

  @override
  State<ApplicationEditPage> createState() => _ApplicationEditPageState();
}

class _ApplicationEditPageState extends State<ApplicationEditPage> {
  late TextEditingController _nameCtrl;
  late TextEditingController _actCtrl;
  late TextEditingController _amountCtrl;
  late TextEditingController _descCtrl;
  late TextEditingController _districtCtrl;
  late TextEditingController _stateCtrl;
  late TextEditingController _incidentDateCtrl;
  late TextEditingController _priorityCtrl;
  late TextEditingController _contactNumberCtrl;
  late TextEditingController _emailCtrl;
  late TextEditingController _aadhaarCtrl;
  late TextEditingController _beneficiaryIdCtrl;
  late TextEditingController _fatherNameCtrl;
  late TextEditingController _addressCtrl;
  late TextEditingController _caseNumberCtrl;
  late TextEditingController _categoryCtrl;
  late TextEditingController _ageCtrl;
  late TextEditingController _genderCtrl;
  late TextEditingController _maritalStatusCtrl;
  late TextEditingController _bankAccountCtrl;
  late TextEditingController _ifscCtrl;
  late TextEditingController _firReportCtrl;
  late TextEditingController _medicalReportCtrl;
  late TextEditingController _policeStationCtrl;
  bool _saving = false;
  final _formKey = GlobalKey<FormState>();
  String? _selectedActType;
  String? _selectedGender;

  @override
  void initState() {
    super.initState();
    _nameCtrl = TextEditingController(text: widget.application.applicantName);
    _actCtrl = TextEditingController(text: widget.application.actType);
    _amountCtrl = TextEditingController(
      text: widget.application.amount?.toStringAsFixed(0) ?? '',
    );
    _descCtrl = TextEditingController(text: widget.application.description);
    _districtCtrl = TextEditingController(text: widget.application.district);
    _stateCtrl = TextEditingController(text: widget.application.state);
    _incidentDateCtrl = TextEditingController(
      text: widget.application.incidentDate,
    );
    _priorityCtrl = TextEditingController(text: widget.application.priority);
    _contactNumberCtrl = TextEditingController(
      text: widget.application.contactNumber,
    );
    _emailCtrl = TextEditingController(
      text: widget.application.email ?? widget.application.contactEmail,
    );
    _aadhaarCtrl = TextEditingController(text: widget.application.aadhaar);
    _beneficiaryIdCtrl = TextEditingController(
      text: widget.application.beneficiaryId,
    );
    _beneficiaryIdCtrl = TextEditingController(
      text: widget.application.beneficiaryId,
    );
    _fatherNameCtrl = TextEditingController(
      text: widget.application.fatherName,
    );
    _addressCtrl = TextEditingController(text: widget.application.address);
    _caseNumberCtrl = TextEditingController(
      text: widget.application.caseNumber,
    );
    _categoryCtrl = TextEditingController(text: widget.application.category);
    _ageCtrl = TextEditingController(text: widget.application.age?.toString());
    _genderCtrl = TextEditingController(text: widget.application.gender);
    _maritalStatusCtrl = TextEditingController(
      text: widget.application.maritalStatus,
    );
    _bankAccountCtrl = TextEditingController(
      text: widget.application.bankAccount,
    );
    _ifscCtrl = TextEditingController(
      text: widget.application.ifsc ?? widget.application.bankIfsc,
    );
    _firReportCtrl = TextEditingController(text: widget.application.firReport);
    _medicalReportCtrl = TextEditingController(
      text: widget.application.medicalReport,
    );
    _policeStationCtrl = TextEditingController(
      text: widget.application.policeStation,
    );
    _selectedActType = widget.application.actType ?? 'PCR';
    _selectedGender = widget.application.gender ?? 'M';
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _actCtrl.dispose();
    _amountCtrl.dispose();
    _descCtrl.dispose();
    _districtCtrl.dispose();
    _stateCtrl.dispose();
    _incidentDateCtrl.dispose();
    _priorityCtrl.dispose();
    _contactNumberCtrl.dispose();
    _emailCtrl.dispose();
    _aadhaarCtrl.dispose();
    _fatherNameCtrl.dispose();
    _beneficiaryIdCtrl.dispose();
    _addressCtrl.dispose();
    _caseNumberCtrl.dispose();
    _categoryCtrl.dispose();
    _ageCtrl.dispose();
    _genderCtrl.dispose();
    _maritalStatusCtrl.dispose();
    _bankAccountCtrl.dispose();
    _ifscCtrl.dispose();
    _beneficiaryIdCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    setState(() => _saving = true);
    try {
      final updates = <String, dynamic>{};
      updates['applicantName'] = _nameCtrl.text.trim();
      updates['actType'] = _selectedActType;
      final amount = double.tryParse(_amountCtrl.text.trim());
      if (amount != null) updates['amount'] = amount;
      updates['description'] = _descCtrl.text.trim();
      updates['district'] = _districtCtrl.text.trim();
      updates['state'] = _stateCtrl.text.trim();
      updates['incidentDate'] = _incidentDateCtrl.text.trim();
      updates['contactNumber'] = _contactNumberCtrl.text.trim();
      updates['email'] = _emailCtrl.text.trim();
      updates['aadhaar'] = _aadhaarCtrl.text.trim();
      updates['fatherName'] = _fatherNameCtrl.text.trim();
      updates['beneficiaryId'] = _beneficiaryIdCtrl.text.trim();
      updates['address'] = _addressCtrl.text.trim();
      updates['caseNumber'] = _caseNumberCtrl.text.trim();
      updates['category'] = _categoryCtrl.text.trim();
      final age = int.tryParse(_ageCtrl.text.trim());
      if (age != null) updates['age'] = age;
      updates['gender'] = _selectedGender;
      updates['maritalStatus'] = _maritalStatusCtrl.text.trim();
      updates['bankAccount'] = _bankAccountCtrl.text.trim();
      updates['ifsc'] = _ifscCtrl.text.trim();

      await DataService.updateApplication(widget.application.id, updates);
      if (mounted) Navigator.of(context).pop(true);
    } catch (e) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Error saving: $e')));
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
        title: Text(locale.translate('applications.editANewReliefApplication')),
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
          child: Form(
            key: _formKey,
            child: Column(
              children: [
                const SizedBox(height: 12),
                _buildInput(
                  theme,
                  locale,
                  controller: _nameCtrl,
                  labelKey: 'applications.applicant_name',
                  keyboardType: TextInputType.name,
                  validator: (value) => value?.isEmpty ?? true
                      ? locale.translate('common.required')
                      : null,
                ),
                const SizedBox(height: 8),
                _buildInput(
                  theme,
                  locale,
                  controller: _contactNumberCtrl,
                  labelKey: 'applications.phone_number',
                  keyboardType: TextInputType.phone,
                  validator: (value) => value?.isEmpty ?? true
                      ? locale.translate('common.required')
                      : null,
                ),
                const SizedBox(height: 8),
                _buildInput(
                  theme,
                  locale,
                  controller: _aadhaarCtrl,
                  labelKey: 'applications.aadhaar',
                  validator: (value) => value?.isEmpty ?? true
                      ? locale.translate('common.required')
                      : null,
                ),
                const SizedBox(height: 8),
                _buildInput(
                  theme,
                  locale,
                  controller: _beneficiaryIdCtrl,
                  labelKey: 'applications.beneficiaryId',
                  validator: (value) => value?.isEmpty ?? true
                      ? locale.translate('common.required')
                      : null,
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      child: _buildInput(
                        theme,
                        locale,
                        controller: _districtCtrl,
                        labelKey: 'applications.district',
                        validator: (value) => value?.isEmpty ?? true
                            ? locale.translate('common.required')
                            : null,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: _buildInput(
                        theme,
                        locale,
                        controller: _stateCtrl,
                        labelKey: 'applications.state',
                        validator: (value) => value?.isEmpty ?? true
                            ? locale.translate('common.required')
                            : null,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                _buildActTypeDropdown(
                  theme,
                  locale,
                  labelKey: 'applications.act_type',
                ),
                const SizedBox(height: 8),
                _buildDateInput(
                  theme,
                  locale,
                  controller: _incidentDateCtrl,
                  labelKey: 'applications.incidentDateHint',
                  validator: (value) => value?.isEmpty ?? true
                      ? locale.translate('common.required')
                      : null,
                ),
                const SizedBox(height: 8),
                _buildInput(
                  theme,
                  locale,
                  controller: _amountCtrl,
                  labelKey: 'applications.reliefAmountINR',
                  keyboardType: TextInputType.number,
                  validator: (value) => value?.isEmpty ?? true
                      ? locale.translate('common.required')
                      : null,
                ),
                const SizedBox(height: 8),
                _buildInput(
                  theme,
                  locale,
                  controller: _priorityCtrl,
                  labelKey: 'applications.priorityLevel',
                  readOnly: true,
                ),
                const SizedBox(height: 8),
                _buildInput(
                  theme,
                  locale,
                  controller: _emailCtrl,
                  labelKey: 'extracted.email',
                  keyboardType: TextInputType.emailAddress,
                ),
                const SizedBox(height: 8),
                _buildInput(
                  theme,
                  locale,
                  controller: _fatherNameCtrl,
                  labelKey: 'applications.fatherName',
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: _addressCtrl,
                  maxLines: 3,
                  decoration: InputDecoration(
                    labelText: locale.translate('extracted.address'),
                    filled: true,
                    fillColor: theme.cardColor.withOpacity(0.03),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      child: _buildInput(
                        theme,
                        locale,
                        controller: _ageCtrl,
                        labelKey: 'extracted.age',
                        keyboardType: TextInputType.number,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: _buildGenderDropdown(
                        theme,
                        locale,
                        labelKey: 'extracted.gender',
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      child: _buildInput(
                        theme,
                        locale,
                        controller: _bankAccountCtrl,
                        labelKey: 'applications.bankAccount',
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: _buildInput(
                        theme,
                        locale,
                        controller: _ifscCtrl,
                        labelKey: 'applications.ifsc',
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                _buildInput(
                  theme,
                  locale,
                  controller: _firReportCtrl,
                  labelKey: 'applications.firReport',
                ),
                const SizedBox(height: 8),
                _buildInput(
                  theme,
                  locale,
                  controller: _medicalReportCtrl,
                  labelKey: 'applications.medicalReport',
                ),
                const SizedBox(height: 8),
                _buildInput(
                  theme,
                  locale,
                  controller: _policeStationCtrl,
                  labelKey: 'applications.policeStation',
                ),

                const SizedBox(height: 16),
              ],
            ),
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
    bool readOnly = false,
    String? Function(String?)? validator,
  }) {
    final label =
        labelKey.startsWith('applications.') ||
            labelKey.startsWith('extracted.')
        ? locale.translate(labelKey)
        : labelKey;

    return TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      readOnly: readOnly,
      validator: validator,
      decoration: InputDecoration(
        labelText: label,
        filled: true,
        fillColor: theme.cardColor.withOpacity(0.03),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
      ),
    );
  }

  Widget _buildDateInput(
    ThemeData theme,
    LocaleProvider locale, {
    required TextEditingController controller,
    required String labelKey,
    String? Function(String?)? validator,
  }) {
    final label =
        labelKey.startsWith('applications.') ||
            labelKey.startsWith('extracted.')
        ? locale.translate(labelKey)
        : labelKey;

    return TextFormField(
      controller: controller,
      readOnly: true,
      validator: validator,
      onTap: () async {
        final DateTime? picked = await showDatePicker(
          context: context,
          initialDate: DateTime.tryParse(controller.text) ?? DateTime.now(),
          firstDate: DateTime(2000),
          lastDate: DateTime.now(),
        );
        if (picked != null) {
          controller.text = picked.toIso8601String().split(
            'T',
          )[0]; // Format as YYYY-MM-DD
        }
      },
      decoration: InputDecoration(
        labelText: label,
        filled: true,
        fillColor: theme.cardColor.withOpacity(0.03),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
        suffixIcon: Icon(Icons.calendar_today),
      ),
    );
  }

  Widget _buildActTypeDropdown(
    ThemeData theme,
    LocaleProvider locale, {
    required String labelKey,
  }) {
    final label =
        labelKey.startsWith('applications.') ||
            labelKey.startsWith('extracted.')
        ? locale.translate(labelKey)
        : labelKey;

    return DropdownButtonFormField<String>(
      value: _selectedActType,
      onChanged: (String? newValue) {
        if (newValue != null) {
          setState(() {
            _selectedActType = newValue;
          });
        }
      },
      items: ['PCR Act', 'PoA Act'].map<DropdownMenuItem<String>>((
        String value,
      ) {
        return DropdownMenuItem<String>(value: value, child: Text(value));
      }).toList(),
      decoration: InputDecoration(
        labelText: label,
        filled: true,
        fillColor: theme.cardColor.withOpacity(0.03),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
      ),
    );
  }

  Widget _buildGenderDropdown(
    ThemeData theme,
    LocaleProvider locale, {
    required String labelKey,
  }) {
    final label =
        labelKey.startsWith('applications.') ||
            labelKey.startsWith('extracted.')
        ? locale.translate(labelKey)
        : labelKey;

    return DropdownButtonFormField<String>(
      value: _selectedGender,
      onChanged: (String? newValue) {
        if (newValue != null) {
          setState(() {
            _selectedGender = newValue;
          });
        }
      },
      items: ['M', 'F'].map<DropdownMenuItem<String>>((String value) {
        return DropdownMenuItem<String>(value: value, child: Text(value));
      }).toList(),
      decoration: InputDecoration(
        labelText: label,
        filled: true,
        fillColor: theme.cardColor.withOpacity(0.03),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
      ),
    );
  }
}

// Reusable form widget for use inside modal sheets
class ApplicationEditForm extends StatefulWidget {
  final ApplicationModel application;
  const ApplicationEditForm({super.key, required this.application});

  @override
  State<ApplicationEditForm> createState() => _ApplicationEditFormState();
}

class _ApplicationEditFormState extends State<ApplicationEditForm> {
  late TextEditingController _nameCtrl;
  late TextEditingController _actCtrl;
  late TextEditingController _amountCtrl;
  late TextEditingController _descCtrl;
  late TextEditingController _districtCtrl;
  late TextEditingController _stateCtrl;
  late TextEditingController _incidentDateCtrl;
  late TextEditingController _priorityCtrl;
  late TextEditingController _contactNumberCtrl;
  late TextEditingController _emailCtrl;
  late TextEditingController _aadhaarCtrl;
  late TextEditingController _beneficiaryIdCtrl;
  late TextEditingController _fatherNameCtrl;
  late TextEditingController _addressCtrl;
  late TextEditingController _caseNumberCtrl;
  late TextEditingController _categoryCtrl;
  late TextEditingController _ageCtrl;
  late TextEditingController _genderCtrl;
  late TextEditingController _maritalStatusCtrl;
  late TextEditingController _bankAccountCtrl;
  late TextEditingController _ifscCtrl;
  late TextEditingController _firReportCtrl;
  late TextEditingController _medicalReportCtrl;
  late TextEditingController _policeStationCtrl;
  bool _saving = false;
  String? _selectedActType;
  String? _selectedGender;

  @override
  void initState() {
    super.initState();
    _nameCtrl = TextEditingController(text: widget.application.applicantName);
    _actCtrl = TextEditingController(text: widget.application.actType);
    _amountCtrl = TextEditingController(
      text: widget.application.amount?.toStringAsFixed(0) ?? '',
    );
    _descCtrl = TextEditingController(text: widget.application.description);
    _districtCtrl = TextEditingController(text: widget.application.district);
    _stateCtrl = TextEditingController(text: widget.application.state);
    _incidentDateCtrl = TextEditingController(
      text: widget.application.incidentDate,
    );
    _priorityCtrl = TextEditingController(text: widget.application.priority);
    _contactNumberCtrl = TextEditingController(
      text: widget.application.contactNumber,
    );
    _emailCtrl = TextEditingController(
      text: widget.application.email ?? widget.application.contactEmail,
    );
    _aadhaarCtrl = TextEditingController(text: widget.application.aadhaar);
    _beneficiaryIdCtrl = TextEditingController(
      text: widget.application.beneficiaryId,
    );
    _beneficiaryIdCtrl = TextEditingController(
      text: widget.application.beneficiaryId,
    );
    _fatherNameCtrl = TextEditingController(
      text: widget.application.fatherName,
    );
    _addressCtrl = TextEditingController(text: widget.application.address);
    _caseNumberCtrl = TextEditingController(
      text: widget.application.caseNumber,
    );
    _categoryCtrl = TextEditingController(text: widget.application.category);
    _ageCtrl = TextEditingController(text: widget.application.age?.toString());
    _genderCtrl = TextEditingController(text: widget.application.gender);
    _maritalStatusCtrl = TextEditingController(
      text: widget.application.maritalStatus,
    );
    _bankAccountCtrl = TextEditingController(
      text: widget.application.bankAccount,
    );
    _ifscCtrl = TextEditingController(
      text: widget.application.ifsc ?? widget.application.bankIfsc,
    );
    _firReportCtrl = TextEditingController(text: widget.application.firReport);
    _medicalReportCtrl = TextEditingController(
      text: widget.application.medicalReport,
    );
    _policeStationCtrl = TextEditingController(
      text: widget.application.policeStation,
    );
    _selectedActType = widget.application.actType ?? 'PCR';
    _selectedGender = widget.application.gender ?? 'M';
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _actCtrl.dispose();
    _amountCtrl.dispose();
    _descCtrl.dispose();
    _districtCtrl.dispose();
    _stateCtrl.dispose();
    _incidentDateCtrl.dispose();
    _priorityCtrl.dispose();
    _contactNumberCtrl.dispose();
    _emailCtrl.dispose();
    _aadhaarCtrl.dispose();
    _fatherNameCtrl.dispose();
    _beneficiaryIdCtrl.dispose();
    _addressCtrl.dispose();
    _caseNumberCtrl.dispose();
    _categoryCtrl.dispose();
    _ageCtrl.dispose();
    _genderCtrl.dispose();
    _maritalStatusCtrl.dispose();
    _bankAccountCtrl.dispose();
    _ifscCtrl.dispose();
    _beneficiaryIdCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    setState(() => _saving = true);
    try {
      final updates = <String, dynamic>{};
      updates['applicantName'] = _nameCtrl.text.trim();
      updates['actType'] = _selectedActType;
      final amount = double.tryParse(_amountCtrl.text.trim());
      if (amount != null) updates['amount'] = amount;
      updates['description'] = _descCtrl.text.trim();
      updates['district'] = _districtCtrl.text.trim();
      updates['state'] = _stateCtrl.text.trim();
      updates['incidentDate'] = _incidentDateCtrl.text.trim();
      updates['contactNumber'] = _contactNumberCtrl.text.trim();
      updates['email'] = _emailCtrl.text.trim();
      updates['aadhaar'] = _aadhaarCtrl.text.trim();
      updates['fatherName'] = _fatherNameCtrl.text.trim();
      updates['beneficiaryId'] = _beneficiaryIdCtrl.text.trim();
      updates['address'] = _addressCtrl.text.trim();
      updates['caseNumber'] = _caseNumberCtrl.text.trim();
      updates['category'] = _categoryCtrl.text.trim();
      final age = int.tryParse(_ageCtrl.text.trim());
      if (age != null) updates['age'] = age;
      updates['gender'] = _selectedGender;
      updates['maritalStatus'] = _maritalStatusCtrl.text.trim();
      updates['bankAccount'] = _bankAccountCtrl.text.trim();
      updates['ifsc'] = _ifscCtrl.text.trim();

      await DataService.updateApplication(widget.application.id, updates);
      if (mounted) Navigator.of(context).pop(true);
    } catch (e) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Error saving: $e')));
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final bottom = MediaQuery.of(context).viewInsets.bottom;

    return Padding(
      padding: EdgeInsets.only(
        left: 16,
        right: 16,
        top: 24,
        bottom: bottom + 16,
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              children: [
                const Expanded(
                  child: Text(
                    'Edit Application',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
                  ),
                ),
                TextButton(
                  onPressed: _saving ? null : _save,
                  child: _saving
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text('Save'),
                ),
              ],
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _nameCtrl,
              decoration: const InputDecoration(labelText: 'Applicant Name'),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _actCtrl,
              decoration: const InputDecoration(labelText: 'Act Type'),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _amountCtrl,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'Amount Requested'),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _descCtrl,
              maxLines: 4,
              decoration: const InputDecoration(labelText: 'Description'),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _districtCtrl,
              decoration: const InputDecoration(labelText: 'District'),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _stateCtrl,
              decoration: const InputDecoration(labelText: 'State'),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _incidentDateCtrl,
              readOnly: true,
              onTap: () async {
                final DateTime? picked = await showDatePicker(
                  context: context,
                  initialDate:
                      DateTime.tryParse(_incidentDateCtrl.text) ??
                      DateTime.now(),
                  firstDate: DateTime(2000),
                  lastDate: DateTime.now(),
                );
                if (picked != null) {
                  _incidentDateCtrl.text = picked.toIso8601String().split(
                    'T',
                  )[0]; // Format as YYYY-MM-DD
                }
              },
              decoration: const InputDecoration(
                labelText: 'Incident Date',
                suffixIcon: Icon(Icons.calendar_today),
              ),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _priorityCtrl,
              readOnly: true,
              decoration: const InputDecoration(labelText: 'Priority'),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _contactNumberCtrl,
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(labelText: 'Contact Number'),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _emailCtrl,
              keyboardType: TextInputType.emailAddress,
              decoration: const InputDecoration(labelText: 'Email'),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _aadhaarCtrl,
              decoration: const InputDecoration(labelText: 'Aadhaar'),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _fatherNameCtrl,
              decoration: const InputDecoration(labelText: 'Father Name'),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _addressCtrl,
              maxLines: 3,
              decoration: const InputDecoration(labelText: 'Address'),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _caseNumberCtrl,
              decoration: const InputDecoration(labelText: 'Case Number'),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _categoryCtrl,
              decoration: const InputDecoration(labelText: 'Category'),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _ageCtrl,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'Age'),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _genderCtrl,
              decoration: const InputDecoration(labelText: 'Gender'),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _maritalStatusCtrl,
              decoration: const InputDecoration(labelText: 'Marital Status'),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _bankAccountCtrl,
              decoration: const InputDecoration(labelText: 'Bank Account'),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _ifscCtrl,
              decoration: const InputDecoration(labelText: 'IFSC'),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _firReportCtrl,
              decoration: const InputDecoration(labelText: 'FIR Report'),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _medicalReportCtrl,
              decoration: const InputDecoration(labelText: 'Medical Report'),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _policeStationCtrl,
              decoration: const InputDecoration(labelText: 'Police Station'),
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }
}
