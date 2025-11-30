import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_animate/flutter_animate.dart';
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
    final isDark = theme.brightness == Brightness.dark;

    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: isDark
              ? [
                  const Color(0xFF0F172A),
                  const Color(0xFF1E293B),
                  const Color(0xFF334155),
                ]
              : [
                  const Color(0xFFF8FAFC),
                  const Color(0xFFF0F9FF),
                  const Color(0xFFE0F2FE),
                ],
        ),
      ),
      child: Stack(
        children: [
          // Background decorative elements
          Positioned.fill(
            child: Opacity(
              opacity: isDark ? 0.1 : 0.05,
              child: Container(
                decoration: BoxDecoration(
                  gradient: RadialGradient(
                    center: Alignment.topLeft,
                    radius: 1.5,
                    colors: isDark
                        ? [const Color(0xFF06B6D4), Colors.transparent]
                        : [const Color(0xFFFB7185), Colors.transparent],
                  ),
                ),
              ),
            ),
          ),
          Positioned.fill(
            child: Opacity(
              opacity: isDark ? 0.1 : 0.05,
              child: Container(
                decoration: BoxDecoration(
                  gradient: RadialGradient(
                    center: Alignment.bottomRight,
                    radius: 1.5,
                    colors: isDark
                        ? [const Color(0xFF8B5CF6), Colors.transparent]
                        : [const Color(0xFFFB923C), Colors.transparent],
                  ),
                ),
              ),
            ),
          ),

          // Main content
          SafeArea(
            child: Column(
              children: [
                // Hero Header Section
                Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(24),
                      margin: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: isDark
                              ? [
                                  const Color(0xFF06B6D4),
                                  const Color(0xFF8B5CF6),
                                ]
                              : [
                                  const Color(0xFFFB7185),
                                  const Color(0xFFFB923C),
                                ],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color:
                                (isDark
                                        ? const Color(0xFF06B6D4)
                                        : const Color(0xFFFB7185))
                                    .withOpacity(0.3),
                            blurRadius: 20,
                            spreadRadius: 2,
                            offset: const Offset(0, 8),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Badge
                          Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 12,
                                  vertical: 6,
                                ),
                                decoration: BoxDecoration(
                                  color: Colors.white.withOpacity(0.2),
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(
                                    color: Colors.white.withOpacity(0.3),
                                    width: 1,
                                  ),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(
                                      Icons.report_problem,
                                      color: Colors.white,
                                      size: 16,
                                    ),
                                    const SizedBox(width: 6),
                                    Text(
                                      'Grievances',
                                      style: theme.textTheme.bodySmall
                                          ?.copyWith(
                                            color: Colors.white,
                                            fontWeight: FontWeight.w600,
                                          ),
                                    ),
                                  ],
                                ),
                              )
                              .animate()
                              .fadeIn(duration: 600.ms)
                              .slideY(begin: -0.2, end: 0),

                          const SizedBox(height: 16),

                          // Title
                          Text(
                                'Your Grievances',
                                style: theme.textTheme.headlineMedium?.copyWith(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  height: 1.2,
                                ),
                              )
                              .animate()
                              .fadeIn(duration: 600.ms, delay: 200.ms)
                              .slideY(begin: -0.2, end: 0),

                          const SizedBox(height: 8),

                          // Subtitle
                          Text(
                                'Track and manage all your grievance reports',
                                style: theme.textTheme.bodyMedium?.copyWith(
                                  color: Colors.white.withOpacity(0.9),
                                  height: 1.4,
                                ),
                              )
                              .animate()
                              .fadeIn(duration: 600.ms, delay: 400.ms)
                              .slideY(begin: -0.2, end: 0),
                        ],
                      ),
                    )
                    .animate()
                    .fadeIn(duration: 800.ms)
                    .slideY(begin: -0.1, end: 0),

                // Grievances List
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
                              Icon(
                                Icons.error_outline,
                                size: 64,
                                color: theme.colorScheme.error.withValues(
                                  alpha: 128,
                                ),
                              ),
                              const SizedBox(height: 16),
                              Text(
                                'Error loading grievances',
                                style: theme.textTheme.headlineSmall,
                              ),
                              const SizedBox(height: 8),
                              Text(
                                '${snapshot.error}',
                                style: theme.textTheme.bodyMedium?.copyWith(
                                  color: theme.textTheme.bodySmall?.color,
                                ),
                                textAlign: TextAlign.center,
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
                                Icons.report_problem_outlined,
                                size: 64,
                                color: theme.textTheme.bodyMedium?.color
                                    ?.withValues(alpha: 77),
                              ),
                              const SizedBox(height: 16),
                              Text(
                                'No grievances found',
                                style: theme.textTheme.headlineSmall,
                                textAlign: TextAlign.center,
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'Your submitted grievances will appear here',
                                style: theme.textTheme.bodyMedium?.copyWith(
                                  color: theme.textTheme.bodySmall?.color,
                                ),
                                textAlign: TextAlign.center,
                              ),
                              const SizedBox(height: 16),
                              Container(
                                padding: const EdgeInsets.all(16),
                                margin: const EdgeInsets.symmetric(
                                  horizontal: 32,
                                ),
                                decoration: BoxDecoration(
                                  color: theme.cardColor,
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(
                                    color: theme.dividerColor.withValues(
                                      alpha: 77,
                                    ),
                                  ),
                                ),
                                child: Column(
                                  children: [
                                    Text(
                                      'To see grievances, add data to Firebase with your User ID:',
                                      style: theme.textTheme.bodySmall
                                          ?.copyWith(
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
                                        currentUser?.uid ??
                                            'No user ID available',
                                        style: theme.textTheme.bodySmall
                                            ?.copyWith(
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
                        ).animate().fadeIn(duration: 600.ms, delay: 300.ms);
                      }

                      return ListView.builder(
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        itemCount: grievances.length,
                        itemBuilder: (context, index) {
                          final grievance = grievances[index];
                          return Container(
                                margin: const EdgeInsets.only(bottom: 16),
                                decoration: BoxDecoration(
                                  color: theme.cardColor,
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(
                                    color: theme.dividerColor.withOpacity(0.1),
                                    width: 1,
                                  ),
                                  boxShadow: [
                                    BoxShadow(
                                      color: theme.shadowColor.withOpacity(0.1),
                                      blurRadius: 8,
                                      offset: const Offset(0, 2),
                                    ),
                                  ],
                                ),
                                child: InkWell(
                                  onTap: () {
                                    // TODO: Navigate to grievance details
                                  },
                                  borderRadius: BorderRadius.circular(16),
                                  child: Padding(
                                    padding: const EdgeInsets.all(20),
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        // Header with status
                                        Row(
                                          children: [
                                            Expanded(
                                              child: Row(
                                                children: [
                                                  Container(
                                                    padding:
                                                        const EdgeInsets.all(8),
                                                    decoration: BoxDecoration(
                                                      color: grievance
                                                          .statusColor
                                                          .withValues(
                                                            alpha: 51,
                                                          ),
                                                      borderRadius:
                                                          BorderRadius.circular(
                                                            8,
                                                          ),
                                                    ),
                                                    child: Icon(
                                                      grievance.status ==
                                                              GrievanceStatus
                                                                  .resolved
                                                          ? Icons.check_circle
                                                          : grievance.status ==
                                                                GrievanceStatus
                                                                    .inProgress
                                                          ? Icons.hourglass_top
                                                          : grievance.status ==
                                                                GrievanceStatus
                                                                    .closed
                                                          ? Icons.cancel
                                                          : Icons
                                                                .report_problem,
                                                      color:
                                                          grievance.statusColor,
                                                      size: 16,
                                                    ),
                                                  ),
                                                  const SizedBox(width: 12),
                                                  Expanded(
                                                    child: Column(
                                                      crossAxisAlignment:
                                                          CrossAxisAlignment
                                                              .start,
                                                      children: [
                                                        Text(
                                                          grievance.title ??
                                                              'Untitled Grievance',
                                                          style: theme
                                                              .textTheme
                                                              .titleMedium
                                                              ?.copyWith(
                                                                fontWeight:
                                                                    FontWeight
                                                                        .w600,
                                                              ),
                                                        ),
                                                        const SizedBox(
                                                          height: 4,
                                                        ),
                                                        Text(
                                                          'ID: ${grievance.id}',
                                                          style: theme
                                                              .textTheme
                                                              .bodySmall
                                                              ?.copyWith(
                                                                color: theme
                                                                    .textTheme
                                                                    .bodyMedium
                                                                    ?.color
                                                                    ?.withValues(
                                                                      alpha:
                                                                          179,
                                                                    ),
                                                              ),
                                                        ),
                                                      ],
                                                    ),
                                                  ),
                                                ],
                                              ),
                                            ),
                                            Column(
                                              crossAxisAlignment:
                                                  CrossAxisAlignment.end,
                                              children: [
                                                Container(
                                                  padding:
                                                      const EdgeInsets.symmetric(
                                                        horizontal: 10,
                                                        vertical: 5,
                                                      ),
                                                  decoration: BoxDecoration(
                                                    color: grievance.statusColor
                                                        .withValues(alpha: 102),
                                                    borderRadius:
                                                        BorderRadius.circular(
                                                          16,
                                                        ),
                                                    border: Border.all(
                                                      color: grievance
                                                          .statusColor
                                                          .withValues(
                                                            alpha: 153,
                                                          ),
                                                      width: 1,
                                                    ),
                                                  ),
                                                  child: Text(
                                                    grievance.statusText,
                                                    style: TextStyle(
                                                      color: Colors.white,
                                                      fontSize: 11,
                                                      fontWeight:
                                                          FontWeight.w700,
                                                    ),
                                                  ),
                                                ),
                                                if (grievance.priority !=
                                                    null) ...[
                                                  const SizedBox(height: 8),
                                                  Text(
                                                    'Priority: ${grievance.priority}',
                                                    style: theme
                                                        .textTheme
                                                        .bodySmall
                                                        ?.copyWith(
                                                          fontWeight:
                                                              FontWeight.w500,
                                                        ),
                                                  ),
                                                ],
                                              ],
                                            ),
                                          ],
                                        ),

                                        const SizedBox(height: 16),

                                        // Description
                                        Text(
                                          grievance.description ??
                                              'No description provided',
                                          style: theme.textTheme.bodyMedium
                                              ?.copyWith(height: 1.4),
                                          maxLines: 2,
                                          overflow: TextOverflow.ellipsis,
                                        ),

                                        const SizedBox(height: 16),

                                        // Details row
                                        Row(
                                          children: [
                                            Expanded(
                                              child: _buildDetailItem(
                                                context,
                                                Icons.calendar_today,
                                                'Date',
                                                grievance.createdDate
                                                        ?.toString()
                                                        .split(' ')[0] ??
                                                    'N/A',
                                              ),
                                            ),
                                            Expanded(
                                              child: _buildDetailItem(
                                                context,
                                                Icons.category,
                                                'Category',
                                                grievance.category ?? 'General',
                                              ),
                                            ),
                                          ],
                                        ),

                                        const SizedBox(height: 12),

                                        Row(
                                          children: [
                                            Expanded(
                                              child: _buildDetailItem(
                                                context,
                                                Icons.person,
                                                'User ID',
                                                grievance.userId ?? 'N/A',
                                              ),
                                            ),
                                            if (grievance.resolvedDate != null)
                                              Expanded(
                                                child: _buildDetailItem(
                                                  context,
                                                  Icons.check_circle,
                                                  'Resolved',
                                                  grievance.resolvedDate!
                                                      .toString()
                                                      .split(' ')[0],
                                                ),
                                              ),
                                          ],
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              )
                              .animate()
                              .fadeIn(
                                duration: 600.ms,
                                delay: Duration(milliseconds: index * 100),
                              )
                              .slideY(begin: 0.1, end: 0);
                        },
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailItem(
    BuildContext context,
    IconData icon,
    String label,
    String value,
  ) {
    final theme = Theme.of(context);

    return Row(
      children: [
        Icon(
          icon,
          size: 16,
          color: theme.textTheme.bodyMedium?.color?.withValues(alpha: 153),
        ),
        const SizedBox(width: 6),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.textTheme.bodyMedium?.color?.withValues(
                    alpha: 153,
                  ),
                  fontWeight: FontWeight.w500,
                ),
              ),
              Text(
                value,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.textTheme.bodyMedium?.color,
                  fontWeight: FontWeight.w600,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ],
    );
  }
}
