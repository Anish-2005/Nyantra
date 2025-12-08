import 'package:flutter/material.dart';
import '../../../core/models/beneficiary_model.dart';
import '../../../core/services/data_service.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'dart:math';

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

      // Generate a random 13-digit number for the beneficiary ID
      final random = Random();
      final randomId =
          '${random.nextInt(900000000) + 100000000}${random.nextInt(10000) + 1000}';

      final beneficiary = BeneficiaryModel(
        id: 'BEN$randomId',
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
        registrationDate: DateTime.now(),
        status: 'pending-verification',
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
              validator: (value) {
                if (value?.isEmpty ?? true) return 'Category is required';
                return null;
              },
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _fatherNameCtrl,
              decoration: const InputDecoration(
                labelText: 'Father\'s Name',
                border: OutlineInputBorder(),
              ),
              validator: (value) {
                if (value?.isEmpty ?? true) return 'Father\'s name is required';
                return null;
              },
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _districtCtrl,
              decoration: const InputDecoration(
                labelText: 'District',
                border: OutlineInputBorder(),
              ),
              validator: (value) {
                if (value?.isEmpty ?? true) return 'District is required';
                return null;
              },
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _stateCtrl,
              decoration: const InputDecoration(
                labelText: 'State',
                border: OutlineInputBorder(),
              ),
              validator: (value) {
                if (value?.isEmpty ?? true) return 'State is required';
                return null;
              },
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _scStCertificateCtrl,
              decoration: const InputDecoration(
                labelText: 'SC/ST Certificate URL',
                border: OutlineInputBorder(),
                hintText: 'https://example.com/certificate.pdf',
              ),
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
            const SizedBox(height: 16),
            TextFormField(
              controller: _ageCtrl,
              decoration: const InputDecoration(
                labelText: 'Age',
                border: OutlineInputBorder(),
              ),
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
            const SizedBox(height: 16),
            TextFormField(
              controller: _genderCtrl,
              decoration: const InputDecoration(
                labelText: 'Gender',
                border: OutlineInputBorder(),
              ),
              validator: (value) {
                if (value?.isEmpty ?? true) return 'Gender is required';
                return null;
              },
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _maritalStatusCtrl,
              decoration: const InputDecoration(
                labelText: 'Marital Status',
                border: OutlineInputBorder(),
              ),
              validator: (value) {
                if (value?.isEmpty ?? true) return 'Marital status is required';
                return null;
              },
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
