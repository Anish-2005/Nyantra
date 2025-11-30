import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/providers/locale_provider.dart';
import '../../../core/widgets/loading_state.dart';
import '../../../core/services/data_service.dart';
import '../../../core/models/beneficiary_model.dart';

class BeneficiariesPage extends StatelessWidget {
  const BeneficiariesPage({super.key});

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
            'Beneficiaries',
            style: theme.textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 24),
          Expanded(
            child: StreamBuilder<List<BeneficiaryModel>>(
              stream: DataService.getBeneficiaries(),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return LoadingState(
                    message: localeProvider.translate('common.loading'),
                  );
                }

                if (snapshot.hasError) {
                  return Center(child: Text('Error: ${snapshot.error}'));
                }

                final beneficiaries = snapshot.data ?? [];

                if (beneficiaries.isEmpty) {
                  return const Center(child: Text('No beneficiaries found'));
                }

                return ListView.builder(
                  itemCount: beneficiaries.length,
                  itemBuilder: (context, index) {
                    final beneficiary = beneficiaries[index];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: theme.primaryColor.withOpacity(0.1),
                          child: Icon(Icons.person, color: theme.primaryColor),
                        ),
                        title: Text(beneficiary.name),
                        subtitle: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            if (beneficiary.phone != null)
                              Text('Phone: ${beneficiary.phone}'),
                            if (beneficiary.aadhaar != null)
                              Text('Aadhaar: ${beneficiary.aadhaar}'),
                            if (beneficiary.address != null)
                              Text('Address: ${beneficiary.address}'),
                          ],
                        ),
                        trailing: beneficiary.bankAccount != null
                            ? const Icon(Icons.account_balance)
                            : null,
                        onTap: () {
                          // TODO: Navigate to beneficiary details
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
