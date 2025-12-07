import 'package:flutter/material.dart';
import '../../../core/models/beneficiary_model.dart';
import '../../../core/services/data_service.dart';
import 'package:firebase_auth/firebase_auth.dart';

class BeneficiaryFormPage extends StatefulWidget {
  const BeneficiaryFormPage({super.key});

  @override
  State<BeneficiaryFormPage> createState() => _BeneficiaryFormPageState();
}

class _BeneficiaryFormPageState extends State<BeneficiaryFormPage> {
  final _formKey = GlobalKey<FormState>();
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
    _nameCtrl = TextEditingController();
    _aadhaarCtrl = TextEditingController();
    _bankCtrl = TextEditingController();
    _phoneCtrl = TextEditingController();
    _addressCtrl = TextEditingController();
    _categoryCtrl = TextEditingController();
    _fatherNameCtrl = TextEditingController();
    _districtCtrl = TextEditingController();
    _stateCtrl = TextEditingController();
    _ageCtrl = TextEditingController();
    _genderCtrl = TextEditingController();
    _maritalStatusCtrl = TextEditingController();
    _ifscCtrl = TextEditingController();
    _scStCertificateCtrl = TextEditingController();
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

  Future<void> _saveBeneficiary() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _saving = true);

    try {
      final user = FirebaseAuth.instance.currentUser;
      if (user == null) {
        throw Exception('User not authenticated');
      }

      final beneficiary = BeneficiaryModel(
        id: '',
        name: _nameCtrl.text.trim(),
        aadhaar: _aadhaarCtrl.text.trim(),
        bankAccount: _bankCtrl.text.trim(),
        phone: _phoneCtrl.text.trim(),
        address: _addressCtrl.text.trim(),
        category: _categoryCtrl.text.trim(),
        fatherName: _fatherNameCtrl.text.trim(),
        district: _districtCtrl.text.trim(),
        state: _stateCtrl.text.trim(),
        age: int.tryParse(_ageCtrl.text.trim()),
        gender: _genderCtrl.text.trim(),
        maritalStatus: _maritalStatusCtrl.text.trim(),
        ifsc: _ifscCtrl.text.trim(),
        scStCertificate: _scStCertificateCtrl.text.trim(),
        ownerId: user.uid,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );

      await DataService.createBeneficiary(beneficiary);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Beneficiary profile created successfully'),
          ),
        );
        Navigator.of(context).pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error creating beneficiary: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _saving = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Add Beneficiary Profile'),
        backgroundColor: theme.colorScheme.primary,
        foregroundColor: theme.colorScheme.onPrimary,
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            TextFormField(
              controller: _nameCtrl,
              decoration: const InputDecoration(
                labelText: 'Full Name',
                border: OutlineInputBorder(),
              ),
              validator: (value) {
                if (value?.isEmpty ?? true) return 'Name is required';
                return null;
              },
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _aadhaarCtrl,
              decoration: const InputDecoration(
                labelText: 'Aadhaar Number',
                border: OutlineInputBorder(),
              ),
              validator: (value) {
                if (value?.isEmpty ?? true) return 'Aadhaar is required';
                if (value!.length != 12) return 'Aadhaar must be 12 digits';
                return null;
              },
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _phoneCtrl,
              decoration: const InputDecoration(
                labelText: 'Phone Number',
                border: OutlineInputBorder(),
              ),
              validator: (value) {
                if (value?.isEmpty ?? true) return 'Phone is required';
                return null;
              },
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _addressCtrl,
              decoration: const InputDecoration(
                labelText: 'Address',
                border: OutlineInputBorder(),
              ),
              validator: (value) {
                if (value?.isEmpty ?? true) return 'Address is required';
                return null;
              },
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _bankCtrl,
              decoration: const InputDecoration(
                labelText: 'Bank Account Number',
                border: OutlineInputBorder(),
              ),
              validator: (value) {
                if (value?.isEmpty ?? true) return 'Bank account is required';
                return null;
              },
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _ifscCtrl,
              decoration: const InputDecoration(
                labelText: 'IFSC Code',
                border: OutlineInputBorder(),
              ),
              validator: (value) {
                if (value?.isEmpty ?? true) return 'IFSC code is required';
                return null;
              },
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _categoryCtrl,
              decoration: const InputDecoration(
                labelText: 'Category',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _fatherNameCtrl,
              decoration: const InputDecoration(
                labelText: 'Father\'s Name',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _districtCtrl,
              decoration: const InputDecoration(
                labelText: 'District',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _stateCtrl,
              decoration: const InputDecoration(
                labelText: 'State',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _scStCertificateCtrl,
              decoration: const InputDecoration(
                labelText: 'SC/ST Certificate Number',
                border: OutlineInputBorder(),
              ),
              validator: (value) {
                if (value?.isEmpty ?? true) {
                  return 'SC/ST Certificate Number is required';
                }
                if (value!.length < 5) {
                  return 'Certificate Number must be at least 5 characters';
                }
                if (value.length > 20) {
                  return 'Certificate Number must be less than 20 characters';
                }
                // Basic pattern validation - alphanumeric with possible slashes or hyphens
                final certPattern = RegExp(r'^[A-Za-z0-9/-]+$');
                if (!certPattern.hasMatch(value)) {
                  return 'Certificate Number can only contain letters, numbers, slashes, and hyphens';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _ageCtrl,
              decoration: const InputDecoration(
                labelText: 'Age',
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _genderCtrl,
              decoration: const InputDecoration(
                labelText: 'Gender',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _maritalStatusCtrl,
              decoration: const InputDecoration(
                labelText: 'Marital Status',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: _saving ? null : _saveBeneficiary,
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
                backgroundColor: theme.colorScheme.primary,
                foregroundColor: theme.colorScheme.onPrimary,
              ),
              child: _saving
                  ? const CircularProgressIndicator()
                  : const Text('Create Beneficiary Profile'),
            ),
          ],
        ),
      ),
    );
  }
}
