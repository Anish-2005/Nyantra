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
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _nameCtrl = TextEditingController(text: widget.beneficiary.name);
    _aadhaarCtrl = TextEditingController(text: widget.beneficiary.aadhaar);
    _bankCtrl = TextEditingController(text: widget.beneficiary.bankAccount);
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _aadhaarCtrl.dispose();
    _bankCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    setState(() => _saving = true);
    try {
      final updates = <String, dynamic>{};
      updates['name'] = _nameCtrl.text.trim();
      updates['aadhaar'] = _aadhaarCtrl.text.trim();
      updates['bankAccount'] = _bankCtrl.text.trim();

      await DataService.updateBeneficiary(widget.beneficiary.id, updates);
      if (mounted) Navigator.of(context).pop(true);
    } catch (e) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Error: $e')));
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
        child: Column(
          children: [
            TextField(
              controller: _nameCtrl,
              decoration: const InputDecoration(labelText: 'Name'),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _aadhaarCtrl,
              decoration: const InputDecoration(labelText: 'Aadhaar'),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _bankCtrl,
              decoration: const InputDecoration(labelText: 'Bank Account'),
            ),
          ],
        ),
      ),
    );
  }
}
