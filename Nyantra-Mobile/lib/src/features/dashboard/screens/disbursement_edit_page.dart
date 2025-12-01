import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../../core/models/disbursement_model.dart';
import '../../../core/models/beneficiary_model.dart';
import '../../../core/services/data_service.dart';

class DisbursementEditPage extends StatefulWidget {
  final DisbursementModel disbursement;

  const DisbursementEditPage({super.key, required this.disbursement});

  @override
  State<DisbursementEditPage> createState() => _DisbursementEditPageState();
}

class _DisbursementEditPageState extends State<DisbursementEditPage> {
  late TextEditingController _phoneCtrl;
  late TextEditingController _bankAccountCtrl;
  late TextEditingController _ifscCtrl;
  late TextEditingController _addressCtrl;
  BeneficiaryModel? _beneficiary;
  bool _saving = false;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _phoneCtrl = TextEditingController(
      text: widget.disbursement.userPhone ?? '',
    );
    _bankAccountCtrl = TextEditingController(
      text: widget.disbursement.userBankAccount ?? '',
    );
    _ifscCtrl = TextEditingController(text: widget.disbursement.userIFSC ?? '');
    _addressCtrl = TextEditingController(
      text: widget.disbursement.userAddress ?? '',
    );
    _loadBeneficiaryData();
  }

  @override
  void dispose() {
    _phoneCtrl.dispose();
    _bankAccountCtrl.dispose();
    _ifscCtrl.dispose();
    _addressCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadBeneficiaryData() async {
    try {
      final beneficiaryDoc = await FirebaseFirestore.instance
          .collection('beneficiaries')
          .doc(widget.disbursement.beneficiaryId)
          .get();

      if (beneficiaryDoc.exists) {
        final beneficiary = BeneficiaryModel.fromFirestore(
          beneficiaryDoc.data()!,
          beneficiaryDoc.id,
        );
        setState(() {
          _beneficiary = beneficiary;
          _loading = false;
        });
      } else {
        setState(() => _loading = false);
      }
    } catch (e) {
      setState(() => _loading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading beneficiary data: $e')),
        );
      }
    }
  }

  Future<void> _save() async {
    setState(() => _saving = true);
    try {
      final updates = <String, dynamic>{
        'userPhone': _phoneCtrl.text.trim(),
        'userBankAccount': _bankAccountCtrl.text.trim(),
        'userIFSC': _ifscCtrl.text.trim(),
        'userAddress': _addressCtrl.text.trim(),
      };

      await DataService.updateDisbursement(widget.disbursement.id, updates);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Disbursement details updated successfully'),
          ),
        );
        Navigator.of(context).pop(true);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error updating disbursement: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Edit Disbursement Details'),
        actions: [
          if (!_loading)
            TextButton(
              onPressed: _saving ? null : _save,
              child: _saving
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text('Save'),
            ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _beneficiary == null
          ? const Center(child: Text('Beneficiary data not found'))
          : Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Disbursement Details',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: _phoneCtrl,
                    decoration: const InputDecoration(
                      labelText: 'Phone Number',
                    ),
                    keyboardType: TextInputType.phone,
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: _bankAccountCtrl,
                    decoration: const InputDecoration(
                      labelText: 'Bank Account',
                    ),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: _ifscCtrl,
                    decoration: const InputDecoration(labelText: 'IFSC Code'),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: _addressCtrl,
                    decoration: const InputDecoration(labelText: 'Address'),
                    maxLines: 3,
                  ),
                ],
              ),
            ),
    );
  }
}
