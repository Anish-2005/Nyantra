import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
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
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _nameCtrl = TextEditingController(text: widget.application.applicantName);
    _actCtrl = TextEditingController(text: widget.application.actType);
    _amountCtrl = TextEditingController(
      text: widget.application.amountRequested?.toStringAsFixed(0) ?? '',
    );
    _descCtrl = TextEditingController(text: widget.application.description);
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _actCtrl.dispose();
    _amountCtrl.dispose();
    _descCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    setState(() => _saving = true);
    try {
      final updates = <String, dynamic>{};
      updates['applicantName'] = _nameCtrl.text.trim();
      updates['actType'] = _actCtrl.text.trim();
      final amount = double.tryParse(_amountCtrl.text.trim());
      if (amount != null) updates['amountRequested'] = amount;
      updates['description'] = _descCtrl.text.trim();

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
        child: Column(
          children: [
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
          ],
        ),
      ),
    );
  }
}
