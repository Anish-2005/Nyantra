import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/providers/locale_provider.dart';
import '../../../core/providers/auth_provider.dart' as app_auth;
import '../../../core/widgets/loading_state.dart';
import '../../../core/services/data_service.dart';
import '../../../core/models/grievance_model.dart';

class GrievancePage extends StatefulWidget {
  const GrievancePage({super.key});

  @override
  State<GrievancePage> createState() => _GrievancePageState();
}

class _GrievancePageState extends State<GrievancePage> {
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
            'Grievances',
            style: theme.textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 24),
          Expanded(
            child: StreamBuilder<List<GrievanceModel>>(
              stream: DataService.getGrievances(),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return LoadingState(
                    message: localeProvider.translate('common.loading'),
                  );
                }

                if (snapshot.hasError) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.error, size: 48, color: Colors.red),
                        const SizedBox(height: 16),
                        Text(
                          'Error loading grievances: ${snapshot.error}',
                          textAlign: TextAlign.center,
                          style: const TextStyle(color: Colors.red),
                        ),
                        const SizedBox(height: 16),
                        ElevatedButton(
                          onPressed: () {
                            // Try to refresh
                            setState(() {});
                          },
                          child: const Text('Retry'),
                        ),
                      ],
                    ),
                  );
                }

                final grievances = snapshot.data ?? [];

                if (grievances.isEmpty) {
                  final currentUser = context
                      .watch<app_auth.AuthProvider>()
                      .user;
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.message,
                          size: 64,
                          color: theme.textTheme.bodyMedium?.color?.withOpacity(
                            0.3,
                          ),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'No grievances found',
                          style: theme.textTheme.titleMedium?.copyWith(
                            color: theme.textTheme.bodyMedium?.color
                                ?.withOpacity(0.5),
                          ),
                        ),
                        const SizedBox(height: 8),
                        Container(
                          padding: const EdgeInsets.all(16),
                          margin: const EdgeInsets.symmetric(horizontal: 32),
                          decoration: BoxDecoration(
                            color: theme.cardColor,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: theme.dividerColor.withOpacity(0.3),
                            ),
                          ),
                          child: Column(
                            children: [
                              Text(
                                'To see grievances, add data to Firebase with your User ID:',
                                style: theme.textTheme.bodySmall?.copyWith(
                                  fontWeight: FontWeight.w500,
                                ),
                                textAlign: TextAlign.center,
                              ),
                              const SizedBox(height: 8),
                              Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: theme.scaffoldBackgroundColor,
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: SelectableText(
                                  currentUser?.uid ?? 'No user ID available',
                                  style: theme.textTheme.bodySmall?.copyWith(
                                    fontFamily: 'monospace',
                                    fontWeight: FontWeight.w600,
                                  ),
                                  textAlign: TextAlign.center,
                                ),
                              ),
                              const SizedBox(height: 12),
                              Text(
                                'Create a grievance in Firebase Console with userId: "${currentUser?.uid ?? 'your-user-id'}"',
                                style: theme.textTheme.bodySmall,
                                textAlign: TextAlign.center,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  );
                }

                return ListView.builder(
                  itemCount: grievances.length,
                  itemBuilder: (context, index) {
                    final grievance = grievances[index];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor:
                              grievance.status == GrievanceStatus.resolved
                              ? Colors.green.withOpacity(0.1)
                              : grievance.status == GrievanceStatus.inProgress
                              ? Colors.blue.withOpacity(0.1)
                              : Colors.orange.withOpacity(0.1),
                          child: Icon(
                            grievance.status == GrievanceStatus.resolved
                                ? Icons.check_circle
                                : grievance.status == GrievanceStatus.inProgress
                                ? Icons.hourglass_top
                                : Icons.report_problem,
                            color: grievance.status == GrievanceStatus.resolved
                                ? Colors.green
                                : grievance.status == GrievanceStatus.inProgress
                                ? Colors.blue
                                : Colors.orange,
                          ),
                        ),
                        title: Text(grievance.title),
                        subtitle: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              grievance.description,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                            Text(
                              'Date: ${grievance.createdDate.toString().split(' ')[0]}',
                            ),
                            if (grievance.resolvedDate != null)
                              Text(
                                'Resolved: ${grievance.resolvedDate!.toString().split(' ')[0]}',
                              ),
                          ],
                        ),
                        trailing: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: grievance.status == GrievanceStatus.resolved
                                ? Colors.green.withOpacity(0.1)
                                : grievance.status == GrievanceStatus.inProgress
                                ? Colors.blue.withOpacity(0.1)
                                : Colors.orange.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            grievance.statusText,
                            style: TextStyle(
                              color:
                                  grievance.status == GrievanceStatus.resolved
                                  ? Colors.green
                                  : grievance.status ==
                                        GrievanceStatus.inProgress
                                  ? Colors.blue
                                  : Colors.orange,
                              fontSize: 12,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                        onTap: () {
                          // TODO: Navigate to grievance details
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
