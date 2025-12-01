import 'package:flutter/material.dart';
import '../../../core/models/disbursement_model.dart';
import '../../../core/services/data_service.dart';

class DisbursementEditPage extends StatefulWidget {
  final DisbursementModel disbursement;

  const DisbursementEditPage({super.key, required this.disbursement});

  @override
  State<DisbursementEditPage> createState() => _DisbursementEditPageState();
}

class _DisbursementEditPageState extends State<DisbursementEditPage> {
  late TextEditingController _txCtrl;
  late TextEditingController _amountCtrl;
  DisbursementStatus? _status;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _txCtrl = TextEditingController(text: widget.disbursement.transactionId);
    _amountCtrl = TextEditingController(
      text: widget.disbursement.reliefAmount.toStringAsFixed(0),
    );
    _status = widget.disbursement.status;
  }

  @override
  void dispose() {
    _txCtrl.dispose();
    _amountCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    setState(() => _saving = true);
    try {
      final updates = <String, dynamic>{};
      updates['transactionId'] = _txCtrl.text.trim();
      final amount = double.tryParse(_amountCtrl.text.trim());
      if (amount != null) updates['reliefAmount'] = amount;
      if (_status != null) updates['status'] = _status!.name;

      await DataService.updateDisbursement(widget.disbursement.id, updates);
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
        title: const Text('Edit Disbursement'),
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
              controller: _txCtrl,
              decoration: const InputDecoration(labelText: 'Transaction ID'),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _amountCtrl,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'Amount'),
            ),
            const SizedBox(height: 8),
            DropdownButtonFormField<DisbursementStatus>(
              value: _status,
              items: DisbursementStatus.values
                  .map((s) => DropdownMenuItem(value: s, child: Text(s.name)))
                  .toList(),
              onChanged: (v) => setState(() => _status = v),
              decoration: const InputDecoration(labelText: 'Status'),
            ),
          ],
        ),
      ),
    );
  }
}
