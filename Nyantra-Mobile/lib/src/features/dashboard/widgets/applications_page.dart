import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/providers/locale_provider.dart';
import '../../../core/widgets/loading_state.dart';
import '../../../core/services/data_service.dart';
import '../../../core/models/application_model.dart';

class ApplicationsPage extends StatefulWidget {
  const ApplicationsPage({super.key});

  @override
  State<ApplicationsPage> createState() => _ApplicationsPageState();
}

class _ApplicationsPageState extends State<ApplicationsPage> {
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
                                    .withValues(alpha: 77),
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
                                  color: Colors.white.withValues(alpha: 51),
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(
                                    color: Colors.white.withValues(alpha: 77),
                                    width: 1,
                                  ),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(
                                      Icons.file_copy,
                                      color: Colors.white,
                                      size: 16,
                                    ),
                                    const SizedBox(width: 6),
                                    Text(
                                      'Applications',
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
                                'Your Applications',
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
                                'Track and manage all your relief applications',
                                style: theme.textTheme.bodyMedium?.copyWith(
                                  color: Colors.white,
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

                // Applications List
                Expanded(
                  child: StreamBuilder<List<ApplicationModel>>(
                    stream: DataService.getApplications(),
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
                                'Error loading applications',
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

                      final applications = snapshot.data ?? [];

                      if (applications.isEmpty) {
                        return Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                Icons.file_copy_outlined,
                                size: 64,
                                color: theme.textTheme.bodyMedium?.color
                                    ?.withValues(alpha: 77),
                              ),
                              const SizedBox(height: 16),
                              Text(
                                'No applications found',
                                style: theme.textTheme.headlineSmall,
                                textAlign: TextAlign.center,
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'Your submitted applications will appear here',
                                style: theme.textTheme.bodyMedium?.copyWith(
                                  color: theme.textTheme.bodySmall?.color,
                                ),
                                textAlign: TextAlign.center,
                              ),
                            ],
                          ),
                        ).animate().fadeIn(duration: 600.ms, delay: 300.ms);
                      }

                      return ListView.builder(
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        itemCount: applications.length,
                        itemBuilder: (context, index) {
                          final application = applications[index];
                          return Container(
                                margin: const EdgeInsets.only(bottom: 16),
                                decoration: BoxDecoration(
                                  color: theme.cardColor,
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(
                                    color: theme.dividerColor.withValues(
                                      alpha: 26,
                                    ),
                                    width: 1,
                                  ),
                                  boxShadow: [
                                    BoxShadow(
                                      color: theme.shadowColor.withValues(
                                        alpha: 26,
                                      ),
                                      blurRadius: 8,
                                      offset: const Offset(0, 2),
                                    ),
                                  ],
                                ),
                                child: InkWell(
                                  onTap: () {
                                    // TODO: Navigate to application details
                                  },
                                  borderRadius: BorderRadius.circular(16),
                                  child: Padding(
                                    padding: const EdgeInsets.all(20),
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        // Header with status and amount
                                        Row(
                                          children: [
                                            Expanded(
                                              child: Column(
                                                crossAxisAlignment:
                                                    CrossAxisAlignment.start,
                                                children: [
                                                  Text(
                                                    application.applicantName ??
                                                        'Unknown Applicant',
                                                    style: theme
                                                        .textTheme
                                                        .titleMedium
                                                        ?.copyWith(
                                                          fontWeight:
                                                              FontWeight.w600,
                                                        ),
                                                  ),
                                                  const SizedBox(height: 4),
                                                  Text(
                                                    'ID: ${application.id}',
                                                    style: theme
                                                        .textTheme
                                                        .bodySmall
                                                        ?.copyWith(
                                                          color: theme
                                                              .textTheme
                                                              .bodyMedium
                                                              ?.color
                                                              ?.withValues(
                                                                alpha: 179,
                                                              ),
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
                                                        horizontal: 12,
                                                        vertical: 6,
                                                      ),
                                                  decoration: BoxDecoration(
                                                    color: application
                                                        .statusColor
                                                        .withValues(alpha: 26),
                                                    borderRadius:
                                                        BorderRadius.circular(
                                                          20,
                                                        ),
                                                    border: Border.all(
                                                      color: application
                                                          .statusColor
                                                          .withValues(
                                                            alpha: 51,
                                                          ),
                                                      width: 1,
                                                    ),
                                                  ),
                                                  child: Text(
                                                    application.statusText,
                                                    style: TextStyle(
                                                      color: application
                                                          .statusColor,
                                                      fontSize: 12,
                                                      fontWeight:
                                                          FontWeight.w600,
                                                    ),
                                                  ),
                                                ),
                                                if (application
                                                        .amountRequested !=
                                                    null) ...[
                                                  const SizedBox(height: 8),
                                                  Text(
                                                    '₹${application.amountRequested!.toStringAsFixed(0)}',
                                                    style: theme
                                                        .textTheme
                                                        .titleMedium
                                                        ?.copyWith(
                                                          fontWeight:
                                                              FontWeight.bold,
                                                          color: theme
                                                              .primaryColor,
                                                        ),
                                                  ),
                                                ],
                                              ],
                                            ),
                                          ],
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
                                                application.applicationDate
                                                    .toString()
                                                    .split(' ')[0],
                                              ),
                                            ),
                                            Expanded(
                                              child: _buildDetailItem(
                                                context,
                                                Icons.description,
                                                'Description',
                                                application.description ??
                                                    'N/A',
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
                                                Icons.category,
                                                'Act Type',
                                                application.actType ?? 'N/A',
                                              ),
                                            ),
                                            Expanded(
                                              child: _buildDetailItem(
                                                context,
                                                Icons.person,
                                                'User ID',
                                                application.userId ?? 'N/A',
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
