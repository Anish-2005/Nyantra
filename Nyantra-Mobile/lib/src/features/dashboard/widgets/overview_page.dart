// ignore_for_file: deprecated_member_use, avoid_print, avoid_unnecessary_containers

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:intl/intl.dart';
import '../../../core/providers/locale_provider.dart';
import '../../../core/widgets/loading_state.dart';
import '../../../core/services/data_service.dart';
import '../../../core/models/activity_model.dart';

class OverviewPage extends StatefulWidget {
  final Function(int)? onNavigate;

  const OverviewPage({super.key, this.onNavigate});

  @override
  State<OverviewPage> createState() => _OverviewPageState();
}

class _OverviewPageState extends State<OverviewPage> {
  bool _isLoading = true;
  Map<String, dynamic> _stats = {};
  List<ActivityModel> _recentActivities = [];
  bool _isLoadingActivities = true;

  @override
  void initState() {
    super.initState();
    _loadStats();
    _loadRecentActivities();
  }

  Future<void> _loadStats() async {
    try {
      final stats = await DataService.getDashboardStats();
      if (mounted) {
        setState(() {
          _stats = stats;
          _isLoading = false;
        });
      }
    } catch (e) {
      print('Error loading stats: $e');
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _loadRecentActivities() async {
    try {
      final activities = await DataService.getRecentActivities(limit: 5);
      if (mounted) {
        setState(() {
          _recentActivities = activities;
          _isLoadingActivities = false;
        });
      }
    } catch (e) {
      print('Error loading recent activities: $e');
      if (mounted) {
        setState(() => _isLoadingActivities = false);
      }
    }
  }

  Widget _buildStatCard(
    BuildContext context,
    String value,
    String label,
    IconData icon,
    bool isDark,
    int index,
  ) {
    final theme = Theme.of(context);

    return Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: theme.cardColor.withOpacity(0.9),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: theme.dividerColor.withOpacity(0.1),
              width: 1,
            ),
            boxShadow: [
              BoxShadow(
                color: theme.shadowColor.withOpacity(0.1),
                blurRadius: 8,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: isDark
                        ? [const Color(0xFF06B6D4), const Color(0xFF8B5CF6)]
                        : [const Color(0xFFFB7185), const Color(0xFFFB923C)],
                  ),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: Colors.white, size: 24),
              ),
              const SizedBox(height: 12),
              Text(
                value,
                style: theme.textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: theme.textTheme.bodyLarge?.color,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 4),
              Text(
                label,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.textTheme.bodyMedium?.color?.withOpacity(0.7),
                ),
                textAlign: TextAlign.center,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        )
        .animate()
        .fadeIn(duration: 600.ms, delay: (800 + index * 100).ms)
        .scale(begin: const Offset(0.9, 0.9));
  }

  Widget _buildActionCard(
    BuildContext context,
    String title,
    String subtitle,
    IconData icon,
    VoidCallback onTap,
    bool isDark,
    int index,
  ) {
    final theme = Theme.of(context);

    return InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(16),
          child: Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: theme.cardColor.withOpacity(0.9),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: theme.dividerColor.withOpacity(0.1),
                width: 1,
              ),
              boxShadow: [
                BoxShadow(
                  color: theme.shadowColor.withOpacity(0.1),
                  blurRadius: 8,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: theme.primaryColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(icon, color: theme.primaryColor, size: 24),
                ),
                const SizedBox(height: 12),
                Text(
                  title,
                  style: theme.textTheme.bodyLarge?.copyWith(
                    fontWeight: FontWeight.w600,
                    color: theme.textTheme.bodyLarge?.color,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.textTheme.bodyMedium?.color?.withOpacity(0.7),
                  ),
                  textAlign: TextAlign.center,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        )
        .animate()
        .fadeIn(duration: 600.ms, delay: (1200 + index * 100).ms)
        .scale(begin: const Offset(0.9, 0.9));
  }

  Widget _buildActivityItem(
    String text,
    String time,
    IconData icon,
    Color color,
  ) {
    final theme = Theme.of(context);

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 32,
          height: 32,
          padding: const EdgeInsets.all(6),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(6),
          ),
          child: Icon(icon, color: color, size: 20),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                text,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.textTheme.bodyLarge?.color,
                  fontWeight: FontWeight.w500,
                ),
                softWrap: true,
                maxLines: 4,
                overflow: TextOverflow.ellipsis,
              ),
              Text(
                time,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.textTheme.bodyMedium?.color?.withValues(
                    alpha: 0.6,
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  String _formatTimeAgo(DateTime timestamp) {
    final now = DateTime.now();
    final difference = now.difference(timestamp);

    if (difference.inDays > 0) {
      return '${difference.inDays} ${difference.inDays == 1 ? 'day' : 'days'} ago';
    } else if (difference.inHours > 0) {
      return '${difference.inHours} ${difference.inHours == 1 ? 'hour' : 'hours'} ago';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes} ${difference.inMinutes == 1 ? 'minute' : 'minutes'} ago';
    } else {
      return 'Just now';
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final localeProvider = context.watch<LocaleProvider>();
    final isDark = theme.brightness == Brightness.dark;
    if (_isLoading) {
      return LoadingState(message: localeProvider.translate('common.loading'));
    }

    // Ensure translations are loaded before rendering UI to avoid showing raw keys
    if (!localeProvider.hasTranslations) {
      return LoadingState(message: 'Loading...');
    }

    return Container(
      child: Stack(
        children: [
          // Main content
          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Hero Welcome Section
                  Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(24),
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
                                        Icons.rocket_launch,
                                        color: Colors.white,
                                        size: 16,
                                      ),
                                      const SizedBox(width: 6),
                                      Text(
                                        localeProvider.translate(
                                          'dashboard.welcomeBack',
                                        ),
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
                                  localeProvider.translate(
                                    'dashboard.yourDashboard',
                                  ),
                                  style: theme.textTheme.headlineMedium
                                      ?.copyWith(
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
                                  localeProvider.translate(
                                    'dashboard.dashboardSubtitle',
                                  ),
                                  style: theme.textTheme.bodyLarge?.copyWith(
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
                      .scale(begin: const Offset(0.95, 0.95)),

                  const SizedBox(height: 32),

                  // Stats Section
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        localeProvider.translate('dashboard.yourImpact'),
                        style: theme.textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: theme.textTheme.bodyLarge?.color,
                        ),
                      ).animate().fadeIn(duration: 600.ms, delay: 600.ms),

                      const SizedBox(height: 16),

                      // Stats Grid
                      GridView.count(
                        crossAxisCount: 2,
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        mainAxisSpacing: 16,
                        crossAxisSpacing: 16,
                        children: [
                          _buildStatCard(
                            context,
                            '${_stats['totalApplications'] ?? 0}',
                            localeProvider.translate(
                              'dashboard.stats.totalApplications',
                            ),
                            Icons.file_copy,
                            isDark,
                            0,
                          ),
                          _buildStatCard(
                            context,
                            // Format total disbursed as Indian currency without 'L' suffix
                            NumberFormat.currency(
                              locale: 'en_IN',
                              symbol: '₹',
                              decimalDigits: 0,
                            ).format(
                              (_stats['totalDisbursed'] as double?) ?? 0.0,
                            ),
                            localeProvider.translate(
                              'dashboard.stats.totalDisbursed',
                            ),
                            Icons.account_balance_wallet,
                            isDark,
                            1,
                          ),
                          _buildStatCard(
                            context,
                            '${_stats['pendingApplications'] ?? 0}',
                            localeProvider.translate('dashboard.stats.pending'),
                            Icons.pending,
                            isDark,
                            2,
                          ),
                          _buildStatCard(
                            context,
                            '${_stats['approvedApplications'] ?? 0}',
                            localeProvider.translate(
                              'dashboard.stats.approved',
                            ),
                            Icons.check_circle,
                            isDark,
                            3,
                          ),
                        ],
                      ),
                    ],
                  ).animate().fadeIn(duration: 600.ms, delay: 800.ms),

                  const SizedBox(height: 32),

                  // Quick Actions Section
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        localeProvider.translate(
                          'dashboard.sections.quickActions',
                        ),
                        style: theme.textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: theme.textTheme.bodyLarge?.color,
                        ),
                      ).animate().fadeIn(duration: 600.ms, delay: 1000.ms),

                      const SizedBox(height: 16),

                      // Action Cards
                      GridView.count(
                        crossAxisCount: 2,
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        mainAxisSpacing: 16,
                        crossAxisSpacing: 16,
                        children: [
                          _buildActionCard(
                            context,
                            localeProvider.translate(
                              'dashboard.quickActions.newApplication.title',
                            ),
                            localeProvider.translate(
                              'dashboard.quickActions.newApplication.subtitle',
                            ),
                            Icons.add,
                            () {
                              // Navigate to applications page
                              widget.onNavigate?.call(1);
                            },
                            isDark,
                            0,
                          ),
                          _buildActionCard(
                            context,
                            localeProvider.translate(
                              'dashboard.quickActions.checkStatus.title',
                            ),
                            localeProvider.translate(
                              'dashboard.quickActions.checkStatus.subtitle',
                            ),
                            Icons.search,
                            () {
                              // Navigate to applications page
                              widget.onNavigate?.call(1);
                            },
                            isDark,
                            1,
                          ),
                          _buildActionCard(
                            context,
                            localeProvider.translate(
                              'dashboard.quickActions.fileGrievance.title',
                            ),
                            localeProvider.translate(
                              'dashboard.quickActions.fileGrievance.subtitle',
                            ),
                            Icons.message,
                            () {
                              // Navigate to grievance page
                              widget.onNavigate?.call(5);
                            },
                            isDark,
                            2,
                          ),
                          _buildActionCard(
                            context,
                            localeProvider.translate(
                              'dashboard.quickActions.viewBeneficiaries.title',
                            ),
                            localeProvider.translate(
                              'dashboard.quickActions.viewBeneficiaries.subtitle',
                            ),
                            Icons.people,
                            () {
                              // Navigate to beneficiaries page
                              widget.onNavigate?.call(2);
                            },
                            isDark,
                            3,
                          ),
                        ],
                      ),
                    ],
                  ).animate().fadeIn(duration: 600.ms, delay: 1200.ms),

                  const SizedBox(height: 32),

                  // Recent Activity Preview
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: theme.cardColor.withOpacity(0.8),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: theme.dividerColor.withOpacity(0.1),
                        width: 1,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: theme.shadowColor.withOpacity(0.1),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(
                              Icons.history,
                              color: theme.primaryColor,
                              size: 24,
                            ),
                            const SizedBox(width: 12),
                            Text(
                              localeProvider.translate(
                                'dashboard.recentActivity.recentActivity',
                              ),
                              style: theme.textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.bold,
                                color: theme.textTheme.bodyLarge?.color,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        // Constrain recent activity list height so it doesn't overflow
                        ConstrainedBox(
                          constraints: const BoxConstraints(maxHeight: 220),
                          child: _isLoadingActivities
                              ? const Center(
                                  child: Padding(
                                    padding: EdgeInsets.all(20),
                                    child: CircularProgressIndicator(),
                                  ),
                                )
                              : _recentActivities.isEmpty
                              ? Center(
                                  child: Padding(
                                    padding: const EdgeInsets.all(20),
                                    child: Text(
                                      localeProvider.translate(
                                        'dashboard.recentActivity.noActivity',
                                      ),
                                      style: theme.textTheme.bodyMedium
                                          ?.copyWith(
                                            color: theme
                                                .textTheme
                                                .bodyMedium
                                                ?.color
                                                ?.withOpacity(0.6),
                                          ),
                                      textAlign: TextAlign.center,
                                    ),
                                  ),
                                )
                              : SingleChildScrollView(
                                  child: Column(
                                    children: _recentActivities.map<Widget>((
                                      activity,
                                    ) {
                                      return Padding(
                                        padding: const EdgeInsets.only(
                                          bottom: 12,
                                        ),
                                        child: _buildActivityItem(
                                          activity.title,
                                          _formatTimeAgo(activity.timestamp),
                                          activity.icon,
                                          activity.color,
                                        ),
                                      );
                                    }).toList(),
                                  ),
                                ),
                        ),
                      ],
                    ),
                  ).animate().fadeIn(duration: 600.ms, delay: 1400.ms),

                  const SizedBox(height: 32),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
