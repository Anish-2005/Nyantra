// ignore_for_file: deprecated_member_use, use_build_context_synchronously, avoid_print, avoid_unnecessary_containers

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/providers/locale_provider.dart';
import '../../../core/widgets/loading_state.dart';
import '../../../core/models/report_model.dart';
import '../../../core/services/sync_service.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';

class ReportsPage extends StatefulWidget {
  const ReportsPage({super.key});

  @override
  State<ReportsPage> createState() => _ReportsPageState();
}

class _ReportsPageState extends State<ReportsPage> {
  final TextEditingController _searchController = TextEditingController();
  String _selectedCategory = 'all';
  String _selectedStatus = 'all';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final localeProvider = context.watch<LocaleProvider>();
    final isDark = theme.brightness == Brightness.dark;

    return Container(
      child: Stack(
        children: [
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
                                      Icons.file_copy,
                                      color: Colors.white,
                                      size: 16,
                                    ),
                                    const SizedBox(width: 6),
                                    Text(
                                      localeProvider.translate(
                                        'reports.pageTitle',
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
                                localeProvider.translate('reports.pageTitle'),
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
                                localeProvider.translate(
                                  'reports.pageSubtitle',
                                ),
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

                // Search and Filters
                Container(
                  margin: const EdgeInsets.symmetric(horizontal: 20),
                  child: Column(
                    children: [
                      // Search Bar
                      Container(
                        margin: const EdgeInsets.only(bottom: 20),
                        decoration: BoxDecoration(
                          color: theme.cardColor.withOpacity(0.8),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: theme.dividerColor.withOpacity(0.1),
                          ),
                        ),
                        child: TextField(
                          controller: _searchController,
                          decoration: InputDecoration(
                            hintText: localeProvider.translate(
                              'reports.searchReports',
                            ),
                            prefixIcon: Icon(
                              Icons.search,
                              color: theme.textTheme.bodyMedium?.color
                                  ?.withOpacity(0.6),
                            ),
                            border: InputBorder.none,
                            contentPadding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 16,
                            ),
                          ),
                          onChanged: (value) => setState(() {}),
                        ),
                      ),

                      // Filters
                      Container(
                        margin: const EdgeInsets.only(bottom: 20),
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: theme.cardColor.withOpacity(0.8),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: theme.dividerColor.withOpacity(0.1),
                          ),
                        ),
                        child: Row(
                          children: [
                            Expanded(
                              child: DropdownButtonFormField<String>(
                                value: _selectedCategory,
                                decoration: InputDecoration(
                                  labelText: localeProvider.translate(
                                    'reports.category',
                                  ),
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(12),
                                    borderSide: BorderSide.none,
                                  ),
                                  filled: true,
                                  fillColor:
                                      theme.inputDecorationTheme.fillColor,
                                  contentPadding: const EdgeInsets.symmetric(
                                    horizontal: 16,
                                    vertical: 12,
                                  ),
                                ),
                                items: [
                                  DropdownMenuItem(
                                    value: 'all',
                                    child: Text(
                                      localeProvider.translate(
                                        'reports.allCategories',
                                      ),
                                    ),
                                  ),
                                  DropdownMenuItem(
                                    value: 'financial',
                                    child: Text(
                                      localeProvider.translate(
                                        'reports.financial',
                                      ),
                                    ),
                                  ),
                                  DropdownMenuItem(
                                    value: 'compliance',
                                    child: Text(
                                      localeProvider.translate(
                                        'reports.compliance',
                                      ),
                                    ),
                                  ),
                                  DropdownMenuItem(
                                    value: 'performance',
                                    child: Text(
                                      localeProvider.translate(
                                        'reports.performance',
                                      ),
                                    ),
                                  ),
                                  DropdownMenuItem(
                                    value: 'statistical',
                                    child: Text(
                                      localeProvider.translate(
                                        'reports.statistical',
                                      ),
                                    ),
                                  ),
                                  DropdownMenuItem(
                                    value: 'analytical',
                                    child: Text(
                                      localeProvider.translate(
                                        'reports.analytical',
                                      ),
                                    ),
                                  ),
                                  DropdownMenuItem(
                                    value: 'technical',
                                    child: Text(
                                      localeProvider.translate(
                                        'reports.technical',
                                      ),
                                    ),
                                  ),
                                ],
                                onChanged: (value) =>
                                    setState(() => _selectedCategory = value!),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: DropdownButtonFormField<String>(
                                value: _selectedStatus,
                                decoration: InputDecoration(
                                  labelText: localeProvider.translate(
                                    'reports.status',
                                  ),
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(12),
                                    borderSide: BorderSide.none,
                                  ),
                                  filled: true,
                                  fillColor:
                                      theme.inputDecorationTheme.fillColor,
                                  contentPadding: const EdgeInsets.symmetric(
                                    horizontal: 16,
                                    vertical: 12,
                                  ),
                                ),
                                items: [
                                  DropdownMenuItem(
                                    value: 'all',
                                    child: Text(
                                      localeProvider.translate(
                                        'reports.allStatuses',
                                      ),
                                    ),
                                  ),
                                  DropdownMenuItem(
                                    value: 'completed',
                                    child: Text(
                                      localeProvider.translate(
                                        'reports.completed',
                                      ),
                                    ),
                                  ),
                                  DropdownMenuItem(
                                    value: 'processing',
                                    child: Text(
                                      localeProvider.translate(
                                        'reports.processing',
                                      ),
                                    ),
                                  ),
                                  DropdownMenuItem(
                                    value: 'scheduled',
                                    child: Text(
                                      localeProvider.translate(
                                        'reports.scheduled',
                                      ),
                                    ),
                                  ),
                                  DropdownMenuItem(
                                    value: 'failed',
                                    child: Text(
                                      localeProvider.translate(
                                        'reports.failed',
                                      ),
                                    ),
                                  ),
                                ],
                                onChanged: (value) =>
                                    setState(() => _selectedStatus = value!),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

                // Reports List
                Expanded(
                  child: Container(
                    margin: const EdgeInsets.symmetric(horizontal: 20),
                    child: RefreshIndicator(
                      onRefresh: () async {
                        // Force refresh by clearing any cached state
                        setState(() {});
                      },
                      child: FutureBuilder<List<Report>>(
                        future: SyncService().getReports(),
                        builder: (context, snapshot) {
                          if (snapshot.connectionState ==
                              ConnectionState.waiting) {
                            return LoadingState(
                              message: localeProvider.translate(
                                'common.loading',
                              ),
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
                                    color: Colors.white.withOpacity(0.7),
                                  ),
                                  const SizedBox(height: 16),
                                  Text(
                                    'Error loading reports: ${snapshot.error}',
                                    style: theme.textTheme.headlineSmall,
                                    textAlign: TextAlign.center,
                                  ),
                                ],
                              ),
                            );
                          }

                          final reports = snapshot.data ?? [];
                          print(
                            'ReportsPage: Retrieved ${reports.length} reports from SyncService',
                          );

                          // Apply filters
                          final filteredReports = reports.where((report) {
                            final matchesSearch =
                                _searchController.text.isEmpty ||
                                report.name.toLowerCase().contains(
                                  _searchController.text.toLowerCase(),
                                ) ||
                                report.description.toLowerCase().contains(
                                  _searchController.text.toLowerCase(),
                                );

                            final matchesCategory =
                                _selectedCategory == 'all' ||
                                report.category == _selectedCategory;
                            final matchesStatus =
                                _selectedStatus == 'all' ||
                                report.status == _selectedStatus;

                            print(
                              'ReportsPage: Report ${report.name} - category: ${report.category}, status: ${report.status}, matches: search=$matchesSearch, category=$matchesCategory, status=$matchesStatus',
                            );

                            return matchesSearch &&
                                matchesCategory &&
                                matchesStatus;
                          }).toList();

                          print(
                            'ReportsPage: After filtering, ${filteredReports.length} reports remain',
                          );

                          if (filteredReports.isEmpty) {
                            return Center(
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(
                                    Icons.file_copy_outlined,
                                    size: 64,
                                    color: theme.textTheme.bodyMedium?.color
                                        ?.withOpacity(0.5),
                                  ),
                                  const SizedBox(height: 16),
                                  Text(
                                    localeProvider.translate(
                                      'reports.noReports',
                                    ),
                                    style: theme.textTheme.headlineSmall,
                                    textAlign: TextAlign.center,
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    localeProvider.translate(
                                      'reports.noReportsDescription',
                                    ),
                                    style: theme.textTheme.bodyMedium?.copyWith(
                                      color: theme.textTheme.bodySmall?.color,
                                    ),
                                    textAlign: TextAlign.center,
                                  ),
                                  const SizedBox(height: 16),
                                  // Debug information
                                  Container(
                                    padding: const EdgeInsets.all(16),
                                    margin: const EdgeInsets.symmetric(
                                      horizontal: 32,
                                    ),
                                    decoration: BoxDecoration(
                                      color: theme.cardColor.withOpacity(0.5),
                                      borderRadius: BorderRadius.circular(12),
                                      border: Border.all(
                                        color: theme.dividerColor.withOpacity(
                                          0.2,
                                        ),
                                      ),
                                    ),
                                    child: Column(
                                      children: [
                                        Text(
                                          'Debug Info:',
                                          style: theme.textTheme.bodySmall
                                              ?.copyWith(
                                                fontWeight: FontWeight.bold,
                                              ),
                                        ),
                                        const SizedBox(height: 8),
                                        Text(
                                          'Total reports fetched: ${reports.length}',
                                          style: theme.textTheme.bodySmall,
                                        ),
                                        Text(
                                          'Selected filters - Category: $_selectedCategory, Status: $_selectedStatus',
                                          style: theme.textTheme.bodySmall,
                                        ),
                                        Text(
                                          'Search query: "${_searchController.text}"',
                                          style: theme.textTheme.bodySmall,
                                        ),
                                        const SizedBox(height: 12),
                                        ElevatedButton.icon(
                                          onPressed: () {
                                            setState(() {});
                                          },
                                          icon: const Icon(
                                            Icons.refresh,
                                            size: 16,
                                          ),
                                          label: const Text('Refresh'),
                                          style: ElevatedButton.styleFrom(
                                            backgroundColor: theme.primaryColor,
                                            foregroundColor: Colors.white,
                                            padding: const EdgeInsets.symmetric(
                                              horizontal: 16,
                                              vertical: 8,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            );
                          }

                          return ListView.builder(
                            padding: const EdgeInsets.all(0),
                            itemCount: filteredReports.length,
                            itemBuilder: (context, index) {
                              final report = filteredReports[index];
                              return _buildReportCard(
                                context,
                                report,
                                localeProvider,
                                theme,
                                isDark,
                              );
                            },
                          );
                        },
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildReportCard(
    BuildContext context,
    Report report,
    LocaleProvider localeProvider,
    ThemeData theme,
    bool isDark,
  ) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: theme.cardColor.withOpacity(0.8),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: theme.dividerColor.withOpacity(0.1)),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () => _showReportDetailModal(context, report),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: _getCategoryColor(
                        report.category,
                      ).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(
                      _getCategoryIcon(report.category),
                      color: _getCategoryColor(report.category),
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          report.name,
                          style: theme.textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          report.id,
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: theme.textTheme.bodySmall?.color
                                ?.withOpacity(0.6),
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: _getStatusColor(report.status).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Text(
                      report.status,
                      style: TextStyle(
                        color: _getStatusColor(report.status),
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 16),

              // Description
              Text(
                report.description,
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: theme.textTheme.bodyMedium?.color?.withOpacity(0.8),
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),

              const SizedBox(height: 16),

              // Stats
              Row(
                children: [
                  _buildStatItem(
                    localeProvider.translate('reports.records'),
                    report.recordCount?.toString() ?? '--',
                    theme,
                  ),
                  const SizedBox(width: 16),
                  _buildStatItem(
                    localeProvider.translate('reports.size'),
                    report.fileSize ?? '--',
                    theme,
                  ),
                  const SizedBox(width: 16),
                  _buildStatItem(
                    localeProvider.translate('reports.downloads'),
                    report.downloadCount.toString(),
                    theme,
                  ),
                ],
              ),

              const SizedBox(height: 16),

              // Footer
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    '${localeProvider.translate('reports.type')}: ${report.type}',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.textTheme.bodySmall?.color?.withOpacity(0.6),
                    ),
                  ),
                  ElevatedButton.icon(
                    onPressed: report.status == 'completed'
                        ? () => _downloadReport(report)
                        : null,
                    icon: Icon(
                      Icons.download,
                      size: 16,
                      color: report.status == 'completed'
                          ? Colors.white
                          : theme.textTheme.bodySmall?.color?.withOpacity(0.5),
                    ),
                    label: Text(localeProvider.translate('reports.download')),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: report.status == 'completed'
                          ? theme.primaryColor
                          : theme.disabledColor,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 10,
                      ),
                      textStyle: const TextStyle(fontSize: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatItem(String label, String value, ThemeData theme) {
    return Expanded(
      child: Column(
        children: [
          Text(
            value,
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.bold,
              color: theme.primaryColor,
            ),
          ),
          Text(
            label,
            style: theme.textTheme.bodySmall?.copyWith(
              color: theme.textTheme.bodySmall?.color?.withOpacity(0.6),
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Color _getCategoryColor(String category) {
    switch (category) {
      case 'financial':
        return Colors.green;
      case 'compliance':
        return Colors.blue;
      case 'performance':
        return Colors.orange;
      case 'statistical':
        return Colors.purple;
      case 'analytical':
        return Colors.teal;
      case 'technical':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  IconData _getCategoryIcon(String category) {
    switch (category) {
      case 'financial':
        return Icons.account_balance_wallet;
      case 'compliance':
        return Icons.verified;
      case 'performance':
        return Icons.trending_up;
      case 'statistical':
        return Icons.bar_chart;
      case 'analytical':
        return Icons.analytics;
      case 'technical':
        return Icons.settings;
      default:
        return Icons.file_copy;
    }
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'completed':
        return Colors.green;
      case 'processing':
        return Colors.blue;
      case 'scheduled':
        return Colors.orange;
      case 'failed':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  void _showReportDetailModal(BuildContext context, Report report) {
    final theme = Theme.of(context);
    final localeProvider = context.read<LocaleProvider>();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: theme.scaffoldBackgroundColor.withOpacity(0.9),
      builder: (context) => Container(
        height: MediaQuery.of(context).size.height * 0.8,
        decoration: BoxDecoration(
          color: theme.cardColor,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          children: [
            // Header
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: theme.cardColor,
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(20),
                ),
                border: Border(
                  bottom: BorderSide(
                    color: theme.dividerColor.withOpacity(0.1),
                    width: 1,
                  ),
                ),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: _getCategoryColor(
                        report.category,
                      ).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(
                      _getCategoryIcon(report.category),
                      color: _getCategoryColor(report.category),
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          report.name,
                          style: theme.textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          report.id,
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: theme.textTheme.bodySmall?.color
                                ?.withOpacity(0.6),
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    onPressed: () => Navigator.of(context).pop(),
                    icon: Icon(Icons.close, color: theme.iconTheme.color),
                  ),
                ],
              ),
            ),

            // Content
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Status Badge
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: _getStatusColor(report.status).withOpacity(0.1),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: _getStatusColor(
                            report.status,
                          ).withOpacity(0.3),
                          width: 1,
                        ),
                      ),
                      child: Text(
                        report.status.toUpperCase(),
                        style: TextStyle(
                          color: _getStatusColor(report.status),
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),

                    const SizedBox(height: 24),

                    // Report Details Section
                    Text(
                      localeProvider.translate('reports.report_details'),
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: theme.cardColor.withOpacity(0.5),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: theme.dividerColor.withOpacity(0.1),
                        ),
                      ),
                      child: Column(
                        children: [
                          _buildDetailRow(
                            localeProvider.translate('reports.type'),
                            report.type,
                            theme,
                          ),
                          _buildDetailRow(
                            localeProvider.translate('reports.category'),
                            report.category,
                            theme,
                          ),
                          _buildDetailRow(
                            localeProvider.translate('reports.frequency'),
                            report.frequency,
                            theme,
                          ),
                          _buildDetailRow('Format', report.fileFormat, theme),
                        ],
                      ),
                    ),

                    const SizedBox(height: 24),

                    // Generation Info Section
                    Text(
                      localeProvider.translate('reports.generation_info'),
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: theme.cardColor.withOpacity(0.5),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: theme.dividerColor.withOpacity(0.1),
                        ),
                      ),
                      child: Column(
                        children: [
                          _buildDetailRow(
                            localeProvider.translate('reports.generated_by'),
                            report.generatedBy ?? 'System',
                            theme,
                          ),
                          _buildDetailRow(
                            localeProvider.translate('reports.generated_date'),
                            _formatDateTime(report.generatedDate),
                            theme,
                          ),
                          _buildDetailRow(
                            localeProvider.translate('reports.last_run'),
                            _formatDateTime(report.lastRun),
                            theme,
                          ),
                          _buildDetailRow(
                            localeProvider.translate('reports.next_run'),
                            _formatDateTime(report.nextRun),
                            theme,
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 24),

                    // Statistics Section
                    Text(
                      localeProvider.translate('reports.statistics'),
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: theme.cardColor.withOpacity(0.5),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: theme.dividerColor.withOpacity(0.1),
                        ),
                      ),
                      child: Column(
                        children: [
                          _buildDetailRow(
                            localeProvider.translate('reports.record_count'),
                            report.recordCount?.toString() ?? '--',
                            theme,
                          ),
                          _buildDetailRow(
                            localeProvider.translate('reports.file_size'),
                            report.fileSize ?? '--',
                            theme,
                          ),
                          _buildDetailRow(
                            localeProvider.translate('reports.download_count'),
                            report.downloadCount.toString(),
                            theme,
                          ),
                          _buildDetailRow(
                            localeProvider.translate('reports.is_scheduled'),
                            report.isScheduled
                                ? localeProvider.translate('reports.yes')
                                : localeProvider.translate('reports.no'),
                            theme,
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 24),

                    // Description Section
                    Text(
                      localeProvider.translate('reports.description'),
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: theme.cardColor.withOpacity(0.5),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: theme.dividerColor.withOpacity(0.1),
                        ),
                      ),
                      child: Text(
                        report.description.isNotEmpty
                            ? report.description
                            : localeProvider.translate(
                                'reports.no_description_available',
                              ),
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: theme.textTheme.bodyMedium?.color?.withOpacity(
                            0.8,
                          ),
                          height: 1.5,
                        ),
                      ),
                    ),

                    const SizedBox(height: 32),

                    // Download Button
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: report.status == 'completed'
                            ? () {
                                Navigator.of(context).pop();
                                _downloadReport(report);
                              }
                            : null,
                        icon: const Icon(Icons.download),
                        label: Text(
                          report.status == 'completed'
                              ? localeProvider.translate(
                                  'reports.download_report',
                                )
                              : localeProvider.translate(
                                  'reports.report_not_available',
                                ),
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: report.status == 'completed'
                              ? theme.primaryColor
                              : theme.disabledColor,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value, ThemeData theme) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              '$label:',
              style: theme.textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.w500,
                color: theme.textTheme.bodyMedium?.color?.withOpacity(0.7),
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.textTheme.bodyMedium?.color?.withOpacity(0.9),
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _formatDateTime(String? dateTimeString) {
    if (dateTimeString == null || dateTimeString.isEmpty) return '--';
    try {
      final dateTime = DateTime.parse(dateTimeString);
      final now = DateTime.now();
      final difference = now.difference(dateTime);

      // If less than 24 hours ago, show relative time
      if (difference.inHours < 24) {
        if (difference.inHours > 0) {
          return '${difference.inHours}h ago';
        } else if (difference.inMinutes > 0) {
          return '${difference.inMinutes}m ago';
        } else {
          return 'Just now';
        }
      }

      // Otherwise show formatted date
      return '${dateTime.day.toString().padLeft(2, '0')}/${dateTime.month.toString().padLeft(2, '0')}/${dateTime.year} ${dateTime.hour.toString().padLeft(2, '0')}:${dateTime.minute.toString().padLeft(2, '0')}';
    } catch (e) {
      return '--';
    }
  }

  Future<void> _downloadReport(Report report) async {
    try {
      // Update download count
      await FirebaseFirestore.instance
          .collection('reports')
          .doc(report.id)
          .update({
            'downloadCount': FieldValue.increment(1),
            'lastUpdated': FieldValue.serverTimestamp(),
          });

      // Generate PDF
      final pdf = pw.Document();

      pdf.addPage(
        pw.Page(
          build: (pw.Context context) {
            return pw.Column(
              crossAxisAlignment: pw.CrossAxisAlignment.start,
              children: [
                pw.Header(
                  level: 0,
                  child: pw.Text(
                    'Report Download',
                    style: pw.TextStyle(
                      fontSize: 24,
                      fontWeight: pw.FontWeight.bold,
                    ),
                  ),
                ),
                pw.SizedBox(height: 20),
                pw.Text(
                  'Report Name: ${report.name}',
                  style: const pw.TextStyle(fontSize: 14),
                ),
                pw.SizedBox(height: 10),
                pw.Text(
                  'Report ID: ${report.id}',
                  style: const pw.TextStyle(fontSize: 14),
                ),
                pw.SizedBox(height: 10),
                pw.Text(
                  'Generated at: ${DateTime.now().toString()}',
                  style: const pw.TextStyle(fontSize: 14),
                ),
                pw.SizedBox(height: 10),
                pw.Text(
                  'Category: ${report.category}',
                  style: const pw.TextStyle(fontSize: 14),
                ),
                pw.SizedBox(height: 10),
                pw.Text(
                  'Type: ${report.type}',
                  style: const pw.TextStyle(fontSize: 14),
                ),
                pw.SizedBox(height: 10),
                pw.Text(
                  'Status: ${report.status}',
                  style: const pw.TextStyle(fontSize: 14),
                ),
                pw.SizedBox(height: 20),
                pw.Text(
                  'Description:',
                  style: pw.TextStyle(
                    fontSize: 16,
                    fontWeight: pw.FontWeight.bold,
                  ),
                ),
                pw.SizedBox(height: 10),
                pw.Text(
                  report.description,
                  style: const pw.TextStyle(fontSize: 12),
                ),
              ],
            );
          },
        ),
      );

      // Save the PDF
      final fileName =
          '${report.name.replaceAll(RegExp(r'[^a-zA-Z0-9]'), '_').toLowerCase()}_${report.id}.pdf';
      await Printing.sharePdf(bytes: await pdf.save(), filename: fileName);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Report "${report.name}" downloaded successfully!'),
          backgroundColor: Colors.green,
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to download report: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }
}
