import 'package:flutter/material.dart';
import '../../../core/models/beneficiary_model.dart';
import '../../../core/services/data_service.dart';

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
  late TextEditingController _actTypeCtrl;
  late TextEditingController _reliefAmountCtrl;
  late TextEditingController _categoryCtrl;
  late TextEditingController _fatherNameCtrl;
  late TextEditingController _caseNumberCtrl;
  late TextEditingController _districtCtrl;
  late TextEditingController _stateCtrl;
  late TextEditingController _incidentDateCtrl;
  late TextEditingController _ageCtrl;
  late TextEditingController _genderCtrl;
  late TextEditingController _maritalStatusCtrl;
  late TextEditingController _ifscCtrl;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _nameCtrl = TextEditingController(text: widget.beneficiary.name);
    _aadhaarCtrl = TextEditingController(text: widget.beneficiary.aadhaar);
    _bankCtrl = TextEditingController(text: widget.beneficiary.bankAccount);
    _phoneCtrl = TextEditingController(text: widget.beneficiary.phone);
    _addressCtrl = TextEditingController(text: widget.beneficiary.address);
    _actTypeCtrl = TextEditingController(text: widget.beneficiary.actType);
    _reliefAmountCtrl = TextEditingController(
      text: widget.beneficiary.reliefAmount?.toString(),
    );
    _categoryCtrl = TextEditingController(text: widget.beneficiary.category);
    _fatherNameCtrl = TextEditingController(
      text: widget.beneficiary.fatherName,
    );
    _caseNumberCtrl = TextEditingController(
      text: widget.beneficiary.caseNumber,
    );
    _districtCtrl = TextEditingController(text: widget.beneficiary.district);
    _stateCtrl = TextEditingController(text: widget.beneficiary.state);
    _incidentDateCtrl = TextEditingController(
      text: widget.beneficiary.incidentDate,
    );
    _ageCtrl = TextEditingController(text: widget.beneficiary.age?.toString());
    _genderCtrl = TextEditingController(text: widget.beneficiary.gender);
    _maritalStatusCtrl = TextEditingController(
      text: widget.beneficiary.maritalStatus,
    );
    _ifscCtrl = TextEditingController(text: widget.beneficiary.ifsc);
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _aadhaarCtrl.dispose();
    _bankCtrl.dispose();
    _phoneCtrl.dispose();
    _addressCtrl.dispose();
    _actTypeCtrl.dispose();
    _reliefAmountCtrl.dispose();
    _categoryCtrl.dispose();
    _fatherNameCtrl.dispose();
    _caseNumberCtrl.dispose();
    _districtCtrl.dispose();
    _stateCtrl.dispose();
    _incidentDateCtrl.dispose();
    _ageCtrl.dispose();
    _genderCtrl.dispose();
    _maritalStatusCtrl.dispose();
    _ifscCtrl.dispose();
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
      updates['actType'] = _actTypeCtrl.text.trim();
      updates['caseNumber'] = _caseNumberCtrl.text.trim();
      // For incidentDate, we might need better parsing, but for now simple text
      if (_incidentDateCtrl.text.trim().isNotEmpty) {
        updates['incidentDate'] = _incidentDateCtrl.text.trim();
      }
      updates['reliefAmount'] =
          double.tryParse(_reliefAmountCtrl.text.trim()) ?? 0.0;
      updates['age'] = int.tryParse(_ageCtrl.text.trim());
      updates['gender'] = _genderCtrl.text.trim();
      updates['category'] = _categoryCtrl.text.trim();
      updates['maritalStatus'] = _maritalStatusCtrl.text.trim();
      updates['bankAccount'] = _bankCtrl.text.trim();
      updates['ifsc'] = _ifscCtrl.text.trim();

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
    return Scaffold(
      appBar: AppBar(
        title: const Text('Edit Beneficiary'),
        actions: [
          TextButton(
            onPressed: _saving ? null : _save,
            child: const Text('Save'),
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: SingleChildScrollView(
          child: Column(
            children: [
              TextField(
                controller: _nameCtrl,
                decoration: const InputDecoration(labelText: 'Full Name'),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _fatherNameCtrl,
                decoration: const InputDecoration(labelText: 'Father\'s Name'),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _aadhaarCtrl,
                decoration: const InputDecoration(labelText: 'Aadhaar Number'),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _phoneCtrl,
                decoration: const InputDecoration(labelText: 'Phone Number'),
                keyboardType: TextInputType.phone,
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
                controller: _addressCtrl,
                decoration: const InputDecoration(
                  labelText: 'Complete Address',
                ),
                maxLines: 3,
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _actTypeCtrl,
                decoration: const InputDecoration(labelText: 'Act Type'),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _caseNumberCtrl,
                decoration: const InputDecoration(labelText: 'Case Number'),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _incidentDateCtrl,
                decoration: const InputDecoration(
                  labelText: 'Incident Date (dd-mm-yyyy)',
                ),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _reliefAmountCtrl,
                decoration: const InputDecoration(
                  labelText: 'Relief Amount (₹)',
                ),
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _ageCtrl,
                decoration: const InputDecoration(labelText: 'Age'),
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _genderCtrl,
                decoration: const InputDecoration(labelText: 'Gender'),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _categoryCtrl,
                decoration: const InputDecoration(labelText: 'Category'),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _maritalStatusCtrl,
                decoration: const InputDecoration(labelText: 'Marital Status'),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _bankCtrl,
                decoration: const InputDecoration(labelText: 'Bank Account'),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _ifscCtrl,
                decoration: const InputDecoration(labelText: 'IFSC Code'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
