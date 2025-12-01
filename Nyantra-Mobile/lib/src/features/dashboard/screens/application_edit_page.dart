import 'package:flutter/material.dart';
import '../../../core/models/application_model.dart';
import '../../../core/services/data_service.dart';

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
  bool _saving = false;

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
      updates['actType'] = _actCtrl.text.trim();
      final amount = double.tryParse(_amountCtrl.text.trim());
      if (amount != null) updates['amount'] = amount;
      updates['description'] = _descCtrl.text.trim();
      updates['district'] = _districtCtrl.text.trim();
      updates['state'] = _stateCtrl.text.trim();
      updates['incidentDate'] = _incidentDateCtrl.text.trim();
      updates['priority'] = _priorityCtrl.text.trim();
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
      updates['gender'] = _genderCtrl.text.trim();
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
    return Scaffold(
      appBar: AppBar(
        title: const Text('Edit Application'),
        actions: [
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
                controller: _contactNumberCtrl,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(labelText: 'Phone Number'),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _aadhaarCtrl,
                decoration: const InputDecoration(labelText: 'Aadhaar Number'),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _beneficiaryIdCtrl,
                decoration: const InputDecoration(labelText: 'Beneficiary ID'),
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
                controller: _actCtrl,
                decoration: const InputDecoration(labelText: 'Act Type'),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _incidentDateCtrl,
                decoration: const InputDecoration(labelText: 'Incident Date'),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _amountCtrl,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Relief Amount (₹)',
                ),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _stateCtrl,
                decoration: const InputDecoration(labelText: 'State'),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _incidentDateCtrl,
                decoration: const InputDecoration(labelText: 'Incident Date'),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _priorityCtrl,
                decoration: const InputDecoration(labelText: 'Priority Level'),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _aadhaarCtrl,
                decoration: const InputDecoration(labelText: 'Aadhaar Number'),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _beneficiaryIdCtrl,
                decoration: const InputDecoration(labelText: 'Beneficiary ID'),
              ),
            ],
          ),
        ),
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
  bool _saving = false;

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
      updates['actType'] = _actCtrl.text.trim();
      final amount = double.tryParse(_amountCtrl.text.trim());
      if (amount != null) updates['amount'] = amount;
      updates['description'] = _descCtrl.text.trim();
      updates['district'] = _districtCtrl.text.trim();
      updates['state'] = _stateCtrl.text.trim();
      updates['incidentDate'] = _incidentDateCtrl.text.trim();
      updates['priority'] = _priorityCtrl.text.trim();
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
      updates['gender'] = _genderCtrl.text.trim();
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
        top: 16,
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
            const SizedBox(height: 8),
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
              decoration: const InputDecoration(labelText: 'Incident Date'),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _priorityCtrl,
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
          ],
        ),
      ),
    );
  }
}
