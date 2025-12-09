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
  final _formKey = GlobalKey<FormState>();
  String? _selectedGender;
  String? _selectedCategory;
  String? _selectedMaritalStatus;

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
    _selectedGender = widget.beneficiary.gender ?? 'M';
    // Normalize gender values to match dropdown options
    if (_selectedGender == 'Male') _selectedGender = 'M';
    if (_selectedGender == 'Female') _selectedGender = 'F';
    _selectedCategory = widget.beneficiary.category ?? 'SC';
    _selectedMaritalStatus = widget.beneficiary.maritalStatus ?? 'Single';
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
    if (!(_formKey.currentState?.validate() ?? false)) return;
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
      updates['gender'] = _selectedGender;
      updates['category'] = _selectedCategory;
      updates['maritalStatus'] = _selectedMaritalStatus;
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
          child: Form(
            key: _formKey,
            child: Column(
              children: [
                const SizedBox(height: 12),
                _buildInput(
                  theme,
                  locale,
                  controller: _nameCtrl,
                  labelKey: 'beneficiaries.fullName',
                  keyboardType: TextInputType.name,
                  validator: (value) {
                    if (value?.isEmpty ?? true) return 'Name is required';
                    return null;
                  },
                ),
                const SizedBox(height: 8),
                _buildInput(
                  theme,
                  locale,
                  controller: _fatherNameCtrl,
                  labelKey: 'beneficiaries.fatherName',
                  validator: (value) {
                    if (value?.isEmpty ?? true)
                      // ignore: curly_braces_in_flow_control_structures
                      return 'Father\'s name is required';
                    return null;
                  },
                ),
                const SizedBox(height: 8),
                _buildInput(
                  theme,
                  locale,
                  controller: _aadhaarCtrl,
                  labelKey: 'beneficiaries.aadhaarNumber',
                  keyboardType: TextInputType.number,
                  validator: (value) {
                    if (value?.isEmpty ?? true) return 'Aadhaar is required';
                    if (value!.length != 12) return 'Aadhaar must be 12 digits';
                    return null;
                  },
                ),
                const SizedBox(height: 8),
                _buildInput(
                  theme,
                  locale,
                  controller: _phoneCtrl,
                  labelKey: 'beneficiaries.phoneNumber',
                  keyboardType: TextInputType.phone,
                  validator: (value) {
                    if (value?.isEmpty ?? true) return 'Phone is required';
                    return null;
                  },
                ),
                const SizedBox(height: 8),
                _buildInput(
                  theme,
                  locale,
                  controller: _districtCtrl,
                  labelKey: 'beneficiaries.district',
                  validator: (value) {
                    if (value?.isEmpty ?? true) return 'District is required';
                    return null;
                  },
                ),
                const SizedBox(height: 8),
                _buildInput(
                  theme,
                  locale,
                  controller: _stateCtrl,
                  labelKey: 'beneficiaries.state',
                  validator: (value) {
                    if (value?.isEmpty ?? true) return 'State is required';
                    return null;
                  },
                ),
                const SizedBox(height: 8),
                _buildInput(
                  theme,
                  locale,
                  controller: _addressCtrl,
                  labelKey: 'beneficiaries.completeAddress',
                  maxLines: 3,
                  validator: (value) {
                    if (value?.isEmpty ?? true) return 'Address is required';
                    return null;
                  },
                ),
                const SizedBox(height: 8),
                _buildInput(
                  theme,
                  locale,
                  controller: _ageCtrl,
                  labelKey: 'beneficiaries.age',
                  keyboardType: TextInputType.number,
                  validator: (value) {
                    if (value?.isEmpty ?? true) return 'Age is required';
                    final age = int.tryParse(value!);
                    if (age == null) return 'Please enter a valid age';
                    if (age < 0 || age > 120) {
                      return 'Please enter a valid age (0-120)';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 8),
                _buildGenderDropdown(
                  theme,
                  locale,
                  labelKey: 'beneficiaries.gender',
                  validator: (value) {
                    if (value?.isEmpty ?? true) return 'Gender is required';
                    return null;
                  },
                ),
                const SizedBox(height: 8),
                _buildCategoryDropdown(
                  theme,
                  locale,
                  labelKey: 'beneficiaries.category',
                  validator: (value) {
                    if (value?.isEmpty ?? true) return 'Category is required';
                    return null;
                  },
                ),
                const SizedBox(height: 8),
                _buildMaritalStatusDropdown(
                  theme,
                  locale,
                  labelKey: 'beneficiaries.maritalStatus',
                  validator: (value) {
                    if (value?.isEmpty ?? true) {
                      return 'Marital status is required';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 8),
                _buildInput(
                  theme,
                  locale,
                  controller: _bankCtrl,
                  labelKey: 'beneficiaries.bankAccount',
                  validator: (value) {
                    if (value?.isEmpty ?? true) {
                      return 'Bank account is required';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 8),
                _buildInput(
                  theme,
                  locale,
                  controller: _ifscCtrl,
                  labelKey: 'beneficiaries.ifscCode',
                  validator: (value) {
                    if (value?.isEmpty ?? true) return 'IFSC code is required';
                    return null;
                  },
                ),
                const SizedBox(height: 8),
                _buildInput(
                  theme,
                  locale,
                  controller: _scStCertificateCtrl,
                  labelKey: 'beneficiaries.sc_st_certificate',
                  validator: (value) {
                    if (value?.isEmpty ?? true) {
                      return 'SC/ST Certificate URL is required';
                    }
                    // Basic URL validation
                    final urlPattern = RegExp(r'^https?://[^\s/$.?#].[^\s]*$');
                    if (!urlPattern.hasMatch(value!)) {
                      return 'Please enter a valid URL (starting with http:// or https://)';
                    }
                    return null;
                  },
                ),
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
    int maxLines = 1,
    String? Function(String?)? validator,
  }) {
    final label =
        labelKey.startsWith('beneficiaries.') ||
            labelKey.startsWith('extracted.')
        ? locale.translate(labelKey)
        : labelKey;

    return TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      maxLines: maxLines,
      validator: validator,
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
    String? Function(String?)? validator,
  }) {
    final label =
        labelKey.startsWith('beneficiaries.') ||
            labelKey.startsWith('extracted.')
        ? locale.translate(labelKey)
        : labelKey;

    return DropdownButtonFormField<String>(
      value: _selectedGender,
      validator: validator,
      onChanged: (String? newValue) {
        if (newValue != null) {
          setState(() {
            _selectedGender = newValue;
          });
        }
      },
      items: ['M', 'F'].map<DropdownMenuItem<String>>((String value) {
        return DropdownMenuItem<String>(
          value: value,
          child: Text(
            value == 'M'
                ? locale.translate('applications.male')
                : locale.translate('applications.female'),
          ),
        );
      }).toList(),
      decoration: InputDecoration(
        labelText: label,
        filled: true,
        fillColor: theme.cardColor.withOpacity(0.03),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
      ),
    );
  }

  Widget _buildCategoryDropdown(
    ThemeData theme,
    LocaleProvider locale, {
    required String labelKey,
    String? Function(String?)? validator,
  }) {
    final label =
        labelKey.startsWith('beneficiaries.') ||
            labelKey.startsWith('extracted.')
        ? locale.translate(labelKey)
        : labelKey;

    return DropdownButtonFormField<String>(
      value: _selectedCategory,
      validator: validator,
      onChanged: (String? newValue) {
        if (newValue != null) {
          setState(() {
            _selectedCategory = newValue;
          });
        }
      },
      items: ['SC', 'ST'].map<DropdownMenuItem<String>>((String value) {
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

  Widget _buildMaritalStatusDropdown(
    ThemeData theme,
    LocaleProvider locale, {
    required String labelKey,
    String? Function(String?)? validator,
  }) {
    final label =
        labelKey.startsWith('beneficiaries.') ||
            labelKey.startsWith('extracted.')
        ? locale.translate(labelKey)
        : labelKey;

    return DropdownButtonFormField<String>(
      value: _selectedMaritalStatus,
      validator: validator,
      onChanged: (String? newValue) {
        if (newValue != null) {
          setState(() {
            _selectedMaritalStatus = newValue;
          });
        }
      },
      items: ['Single', 'Married', 'Divorced', 'Widowed']
          .map<DropdownMenuItem<String>>((String value) {
            return DropdownMenuItem<String>(value: value, child: Text(value));
          })
          .toList(),
      decoration: InputDecoration(
        labelText: label,
        filled: true,
        fillColor: theme.cardColor.withOpacity(0.03),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
      ),
    );
  }
}
