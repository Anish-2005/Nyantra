import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/providers/locale_provider.dart';
import '../../../core/widgets/loading_state.dart';
import '../../../core/services/data_service.dart';
import '../../../core/models/disbursement_model.dart';

class DisbursementsPage extends StatelessWidget {
  const DisbursementsPage({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final localeProvider = context.watch<LocaleProvider>();

    return Container(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Disbursements',
            style: theme.textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 24),
          Expanded(
            child: StreamBuilder<List<DisbursementModel>>(
              stream: DataService.getDisbursements(),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return LoadingState(message: localeProvider.translate('common.loading'));
                }

                if (snapshot.hasError) {
                  return Center(
                    child: Text('Error: ${snapshot.error}'),
                  );
                }

                final disbursements = snapshot.data ?? [];

                if (disbursements.isEmpty) {
                  return const Center(
                    child: Text('No disbursements found'),
                  );
                }

                return ListView.builder(
                  itemCount: disbursements.length,
                  itemBuilder: (context, index) {
                    final disbursement = disbursements[index];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: disbursement.status == DisbursementStatus.completed
                              ? Colors.green.withOpacity(0.1)
                              : Colors.orange.withOpacity(0.1),
                          child: Icon(
                            disbursement.status == DisbursementStatus.completed
                                ? Icons.check_circle
                                : Icons.pending,
                            color: disbursement.status == DisbursementStatus.completed
                                ? Colors.green
                                : Colors.orange,
                          ),
                        ),
                        title: Text('₹${disbursement.reliefAmount.toStringAsFixed(0)}'),
                        subtitle: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Application ID: ${disbursement.applicationId}'),
                            Text('Beneficiary ID: ${disbursement.beneficiaryId}'),
                            if (disbursement.disbursementDate != null)
                              Text('Date: ${disbursement.disbursementDate!.toString().split(' ')[0]}'),
                            if (disbursement.transactionId != null)
                              Text('Transaction: ${disbursement.transactionId}'),
                          ],
                        ),
                        trailing: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: disbursement.status == DisbursementStatus.completed
                                ? Colors.green.withOpacity(0.1)
                                : Colors.orange.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            disbursement.statusText,
                            style: TextStyle(
                              color: disbursement.status == DisbursementStatus.completed
                                  ? Colors.green
                                  : Colors.orange,
                              fontSize: 12,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                        onTap: () {
                          // TODO: Navigate to disbursement details
                        },
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
