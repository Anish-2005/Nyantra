// ignore_for_file: deprecated_member_use, use_build_context_synchronously, avoid_unnecessary_containers, prefer_final_fields

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../../core/providers/locale_provider.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/widgets/loading_state.dart';
import '../../../core/services/data_service.dart';
import '../../../core/services/alert_service.dart';
import '../../../core/models/disbursement_model.dart';
import '../../../core/models/beneficiary_model.dart';
import '../../../core/models/alert_model.dart';

class DisbursementsPage extends StatefulWidget {
  const DisbursementsPage({super.key});

  @override
  State<DisbursementsPage> createState() => _DisbursementsPageState();
}

class _DisbursementsPageState extends State<DisbursementsPage> {
  List<DisbursementAlert> _alerts = [];
  Set<String> _dismissedAlerts = {};
  Set<String> _emailedAlerts = {};
  Set<String> _emailedEvents = {};
  bool _alertsLoaded = false;

  @override
  void initState() {
    super.initState();
    _loadAlertData();
  }

  Future<void> _loadAlertData() async {
    final dismissedAlerts = await AlertService.getDismissedAlerts();
    final emailedAlerts = await AlertService.getEmailedAlerts();
    final emailedEvents = await AlertService.getEmailedEvents();

    setState(() {
      _dismissedAlerts = dismissedAlerts;
      _emailedAlerts = emailedAlerts;
      _emailedEvents = emailedEvents;
      _alertsLoaded = true;
    });
  }

  Future<void> _dismissAlert(String alertId) async {
    await AlertService.dismissAlert(alertId);
    setState(() {
      _dismissedAlerts.add(alertId);
      _alerts.removeWhere((alert) => alert.id == alertId);
    });
  }

  Future<void> _dismissAllAlerts() async {
    final alertIds = _alerts.map((alert) => alert.id).toList();
    await AlertService.dismissAllAlerts(alertIds);
    setState(() {
      _dismissedAlerts.addAll(alertIds);
      _alerts.clear();
    });
  }

  Future<void> _generateAlertsForDisbursements(
    List<DisbursementModel> disbursements,
  ) async {
    final lastViewedTimestamp = await AlertService.getLastViewedTimestamp();

    final newAlerts = await AlertService.generateAlerts(
      disbursements,
      _dismissedAlerts,
      lastViewedTimestamp,
    );

    // Filter out already dismissed alerts and deduplicate
    final filteredAlerts = newAlerts
        .where((alert) => !_dismissedAlerts.contains(alert.id))
        .toList();
    final seenIds = <String>{};
    final uniqueAlerts = filteredAlerts
        .where((alert) => seenIds.add(alert.id))
        .toList();

    // Update alerts if there are new ones
    if (uniqueAlerts.isNotEmpty &&
        !_alerts.any(
          (existing) =>
              uniqueAlerts.any((newAlert) => newAlert.id == existing.id),
        )) {
      setState(() {
        _alerts.addAll(uniqueAlerts);
      });

      // Send email notifications
      final authProvider = context.read<AuthProvider>();
      final currentUser = authProvider.user;
      if (currentUser != null) {
        // Get beneficiary email (you might need to fetch this from Firestore)
        final beneficiaryEmail = await _getBeneficiaryEmail(currentUser.uid);
        if (beneficiaryEmail != null) {
          await AlertService.sendEmailNotifications(
            uniqueAlerts,
            beneficiaryEmail,
            _emailedAlerts,
            _emailedEvents,
          );
        }
      }
    }
  }

  Future<String?> _getBeneficiaryEmail(String userId) async {
    try {
      final beneficiaryDoc = await FirebaseFirestore.instance
          .collection('beneficiaries')
          .where('ownerId', isEqualTo: userId)
          .limit(1)
          .get();

      if (beneficiaryDoc.docs.isNotEmpty) {
        return beneficiaryDoc.docs.first.data()['email'] as String?;
      }
    } catch (e) {
      // Error fetching beneficiary email
    }
    return null;
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
                                    const Icon(
                                      Icons.account_balance_wallet,
                                      color: Colors.white,
                                      size: 16,
                                    ),
                                    const SizedBox(width: 6),
                                    Text(
                                      localeProvider.translate(
                                        'nav.disbursements',
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
                                  'dashboard.disbursements.pageTitle',
                                ),
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
                                  'dashboard.disbursements.pageSubtitle',
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

                // Disbursements List
                Expanded(
                  child: StreamBuilder<List<DisbursementModel>>(
                    stream: DataService.getDisbursements(),
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
                                color: theme.colorScheme.error.withOpacity(0.5),
                              ),
                              const SizedBox(height: 16),
                              Text(
                                localeProvider.translate(
                                  'dashboard.disbursements.errorLoading',
                                ),
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

                      final disbursements = snapshot.data ?? [];

                      // Generate alerts if data is loaded
                      if (_alertsLoaded && disbursements.isNotEmpty) {
                        _generateAlertsForDisbursements(disbursements);
                      }

                      if (disbursements.isEmpty) {
                        return Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                Icons.account_balance_wallet_outlined,
                                size: 64,
                                color: theme.textTheme.bodyMedium?.color
                                    ?.withOpacity(0.3),
                              ),
                              const SizedBox(height: 16),
                              Text(
                                localeProvider.translate(
                                  'dashboard.disbursements.noDisbursements',
                                ),
                                style: theme.textTheme.headlineSmall,
                                textAlign: TextAlign.center,
                              ),
                              const SizedBox(height: 8),
                              Text(
                                localeProvider.translate(
                                  'dashboard.disbursements.noDisbursementsDescription',
                                ),
                                style: theme.textTheme.bodyMedium?.copyWith(
                                  color: theme.textTheme.bodySmall?.color,
                                ),
                                textAlign: TextAlign.center,
                              ),
                            ],
                          ),
                        ).animate().fadeIn(duration: 600.ms, delay: 300.ms);
                      }

                      return Column(
                        children: [
                          // Alerts Section
                          if (_alerts.isNotEmpty)
                            Container(
                              margin: const EdgeInsets.symmetric(
                                horizontal: 20,
                                vertical: 10,
                              ),
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: theme.cardColor,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                  color: theme.dividerColor.withOpacity(0.1),
                                  width: 1,
                                ),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      const Icon(
                                        Icons.notifications_active,
                                        color: Colors.green,
                                        size: 20,
                                      ),
                                      const SizedBox(width: 8),
                                      Text(
                                        localeProvider.translate(
                                          'alerts.newUpdates',
                                        ),
                                        style: theme.textTheme.titleMedium
                                            ?.copyWith(
                                              fontWeight: FontWeight.w600,
                                              color: theme.primaryColor,
                                            ),
                                      ),
                                      const Spacer(),
                                      TextButton(
                                        onPressed: _dismissAllAlerts,
                                        child: Text(
                                          localeProvider.translate(
                                            'alerts.dismissAll',
                                          ),
                                          style: theme.textTheme.bodySmall
                                              ?.copyWith(
                                                color: theme.primaryColor,
                                              ),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 12),
                                  ..._alerts
                                      .take(3)
                                      .map(
                                        (alert) => Container(
                                          margin: const EdgeInsets.only(
                                            bottom: 8,
                                          ),
                                          padding: const EdgeInsets.all(12),
                                          decoration: BoxDecoration(
                                            color:
                                                theme.scaffoldBackgroundColor,
                                            borderRadius: BorderRadius.circular(
                                              8,
                                            ),
                                            border: Border.all(
                                              color: theme.dividerColor
                                                  .withOpacity(0.1),
                                            ),
                                          ),
                                          child: Row(
                                            children: [
                                              Icon(
                                                alert.type ==
                                                        AlertType
                                                            .newDisbursement
                                                    ? Icons.add_circle
                                                    : alert.type ==
                                                          AlertType
                                                              .installmentCompleted
                                                    ? Icons.check_circle
                                                    : Icons.done_all,
                                                color:
                                                    alert.type ==
                                                        AlertType
                                                            .newDisbursement
                                                    ? Colors.blue
                                                    : alert.type ==
                                                          AlertType
                                                              .installmentCompleted
                                                    ? Colors.green
                                                    : Colors.purple,
                                                size: 20,
                                              ),
                                              const SizedBox(width: 12),
                                              Expanded(
                                                child: Column(
                                                  crossAxisAlignment:
                                                      CrossAxisAlignment.start,
                                                  children: [
                                                    Text(
                                                      alert.type ==
                                                              AlertType
                                                                  .newDisbursement
                                                          ? localeProvider
                                                                .translate(
                                                                  'alerts.newDisbursement',
                                                                )
                                                          : alert.type ==
                                                                AlertType
                                                                    .installmentCompleted
                                                          ? localeProvider
                                                                .translate(
                                                                  'alerts.installmentReceived',
                                                                )
                                                          : localeProvider
                                                                .translate(
                                                                  'alerts.paymentCompleted',
                                                                ),
                                                      style: theme
                                                          .textTheme
                                                          .bodyMedium
                                                          ?.copyWith(
                                                            fontWeight:
                                                                FontWeight.w600,
                                                          ),
                                                    ),
                                                    Text(
                                                      alert.message,
                                                      style: theme
                                                          .textTheme
                                                          .bodySmall
                                                          ?.copyWith(
                                                            color: theme
                                                                .textTheme
                                                                .bodyMedium
                                                                ?.color
                                                                ?.withOpacity(
                                                                  0.7,
                                                                ),
                                                          ),
                                                    ),
                                                  ],
                                                ),
                                              ),
                                              IconButton(
                                                onPressed: () =>
                                                    _dismissAlert(alert.id),
                                                icon: Icon(
                                                  Icons.close,
                                                  size: 16,
                                                  color: theme
                                                      .textTheme
                                                      .bodyMedium
                                                      ?.color
                                                      ?.withOpacity(0.5),
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                      ),
                                  if (_alerts.length > 3)
                                    Center(
                                      child: Text(
                                        localeProvider
                                            .translate('alerts.moreUpdates', {
                                              'count': (_alerts.length - 3)
                                                  .toString(),
                                            }),
                                        style: theme.textTheme.bodySmall
                                            ?.copyWith(
                                              color: theme
                                                  .textTheme
                                                  .bodyMedium
                                                  ?.color
                                                  ?.withOpacity(0.5),
                                            ),
                                      ),
                                    ),
                                ],
                              ),
                            ).animate().fadeIn(duration: 500.ms),

                          // Disbursements List
                          Expanded(
                            child: ListView.builder(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 20,
                              ),
                              itemCount: disbursements.length,
                              itemBuilder: (context, index) {
                                final disbursement = disbursements[index];

                                return Container(
                                      margin: const EdgeInsets.only(bottom: 16),
                                      decoration: BoxDecoration(
                                        color: theme.cardColor,
                                        borderRadius: BorderRadius.circular(16),
                                        border: Border.all(
                                          color: theme.dividerColor.withOpacity(
                                            0.1,
                                          ),
                                          width: 1,
                                        ),
                                        boxShadow: [
                                          BoxShadow(
                                            color: theme.shadowColor
                                                .withOpacity(0.1),
                                            blurRadius: 8,
                                            offset: const Offset(0, 2),
                                          ),
                                        ],
                                      ),
                                      child: Padding(
                                        padding: const EdgeInsets.all(20),
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            // Header with amount and status
                                            Row(
                                              children: [
                                                Expanded(
                                                  child: Column(
                                                    crossAxisAlignment:
                                                        CrossAxisAlignment
                                                            .start,
                                                    children: [
                                                      Text(
                                                        localeProvider.translate(
                                                          'dashboard.disbursements.labels.amount',
                                                        ),
                                                        style: theme
                                                            .textTheme
                                                            .bodySmall
                                                            ?.copyWith(
                                                              color: theme
                                                                  .textTheme
                                                                  .bodyMedium
                                                                  ?.color
                                                                  ?.withOpacity(
                                                                    0.7,
                                                                  ),
                                                              fontWeight:
                                                                  FontWeight
                                                                      .w500,
                                                            ),
                                                      ),
                                                      Text(
                                                        '₹${disbursement.reliefAmount.toStringAsFixed(0)}',
                                                        style: theme
                                                            .textTheme
                                                            .titleMedium
                                                            ?.copyWith(
                                                              fontWeight:
                                                                  FontWeight
                                                                      .w600,
                                                              color: theme
                                                                  .primaryColor,
                                                            ),
                                                      ),
                                                    ],
                                                  ),
                                                ),
                                                Container(
                                                  padding:
                                                      const EdgeInsets.symmetric(
                                                        horizontal: 12,
                                                        vertical: 6,
                                                      ),
                                                  decoration: BoxDecoration(
                                                    color: disbursement
                                                        .statusColor
                                                        .withOpacity(0.1),
                                                    borderRadius:
                                                        BorderRadius.circular(
                                                          20,
                                                        ),
                                                    border: Border.all(
                                                      color: disbursement
                                                          .statusColor
                                                          .withOpacity(0.2),
                                                      width: 1,
                                                    ),
                                                  ),
                                                  child: Column(
                                                    children: [
                                                      Text(
                                                        localeProvider.translate(
                                                          'dashboard.disbursements.labels.status',
                                                        ),
                                                        style: theme
                                                            .textTheme
                                                            .bodySmall
                                                            ?.copyWith(
                                                              color: theme
                                                                  .textTheme
                                                                  .bodyMedium
                                                                  ?.color
                                                                  ?.withOpacity(
                                                                    0.7,
                                                                  ),
                                                              fontWeight:
                                                                  FontWeight
                                                                      .w500,
                                                            ),
                                                      ),
                                                      Row(
                                                        mainAxisSize:
                                                            MainAxisSize.min,
                                                        children: [
                                                          Icon(
                                                            disbursement.status ==
                                                                    DisbursementStatus
                                                                        .completed
                                                                ? Icons
                                                                      .check_circle
                                                                : Icons.pending,
                                                            color: disbursement
                                                                .statusColor,
                                                            size: 16,
                                                          ),
                                                          const SizedBox(
                                                            width: 4,
                                                          ),
                                                          Text(
                                                            disbursement
                                                                .statusText,
                                                            style: TextStyle(
                                                              color: disbursement
                                                                  .statusColor,
                                                              fontSize: 12,
                                                              fontWeight:
                                                                  FontWeight
                                                                      .w600,
                                                            ),
                                                          ),
                                                        ],
                                                      ),
                                                    ],
                                                  ),
                                                ),
                                              ],
                                            ),

                                            const SizedBox(height: 16),

                                            // Beneficiary Details
                                            FutureBuilder<DocumentSnapshot>(
                                              future: FirebaseFirestore.instance
                                                  .collection('beneficiaries')
                                                  .doc(
                                                    disbursement.beneficiaryId,
                                                  )
                                                  .get(),
                                              builder: (context, snapshot) {
                                                if (snapshot.connectionState ==
                                                    ConnectionState.waiting) {
                                                  return const Center(
                                                    child: SizedBox(
                                                      width: 20,
                                                      height: 20,
                                                      child:
                                                          CircularProgressIndicator(
                                                            strokeWidth: 2,
                                                          ),
                                                    ),
                                                  );
                                                }

                                                if (snapshot.hasError) {
                                                  return Center(
                                                    child: Text(
                                                      'Error loading beneficiary: ${snapshot.error}',
                                                      style: theme
                                                          .textTheme
                                                          .bodySmall
                                                          ?.copyWith(
                                                            color: theme
                                                                .colorScheme
                                                                .error,
                                                          ),
                                                    ),
                                                  );
                                                }

                                                BeneficiaryModel? beneficiary;
                                                if (snapshot.hasData &&
                                                    snapshot.data!.exists) {
                                                  beneficiary =
                                                      BeneficiaryModel.fromFirestore(
                                                        snapshot.data!.data()
                                                            as Map<
                                                              String,
                                                              dynamic
                                                            >,
                                                        snapshot.data!.id,
                                                      );
                                                }

                                                return Column(
                                                  crossAxisAlignment:
                                                      CrossAxisAlignment.start,
                                                  children: [
                                                    // Beneficiary Name and Amount section
                                                    Row(
                                                      children: [
                                                        Expanded(
                                                          child: _buildDetailItem(
                                                            context,
                                                            Icons.person,
                                                            localeProvider
                                                                .translate(
                                                                  'dashboard.disbursements.labels.beneficiaryName',
                                                                ),
                                                            beneficiary?.name ??
                                                                'Beneficiary ID: ${disbursement.beneficiaryId}',
                                                          ),
                                                        ),
                                                        Expanded(
                                                          child: _buildDetailItem(
                                                            context,
                                                            Icons
                                                                .calendar_today,
                                                            localeProvider
                                                                .translate(
                                                                  'dashboard.disbursements.labels.initiatedDate',
                                                                ),
                                                            disbursement
                                                                    .createdAt
                                                                    ?.toString()
                                                                    .split(
                                                                      ' ',
                                                                    )[0] ??
                                                                'Not available',
                                                          ),
                                                        ),
                                                      ],
                                                    ),

                                                    const SizedBox(height: 12),

                                                    // Contact Details
                                                    Row(
                                                      children: [
                                                        Expanded(
                                                          child: _buildDetailItem(
                                                            context,
                                                            Icons.phone,
                                                            localeProvider
                                                                .translate(
                                                                  'dashboard.disbursements.labels.phoneNumber',
                                                                ),
                                                            disbursement
                                                                    .userPhone ??
                                                                'Not provided',
                                                          ),
                                                        ),
                                                        const Expanded(
                                                          child: SizedBox(),
                                                        ),
                                                      ],
                                                    ),

                                                    const SizedBox(height: 12),

                                                    // Bank Details
                                                    Row(
                                                      children: [
                                                        Expanded(
                                                          child: _buildDetailItem(
                                                            context,
                                                            Icons
                                                                .account_balance,
                                                            localeProvider
                                                                .translate(
                                                                  'dashboard.disbursements.labels.bankAccount',
                                                                ),
                                                            disbursement
                                                                    .userBankAccount ??
                                                                'Not provided',
                                                          ),
                                                        ),
                                                        Expanded(
                                                          child: _buildDetailItem(
                                                            context,
                                                            Icons.code,
                                                            localeProvider
                                                                .translate(
                                                                  'dashboard.disbursements.labels.ifscCode',
                                                                ),
                                                            disbursement
                                                                    .userIFSC ??
                                                                'Not provided',
                                                          ),
                                                        ),
                                                      ],
                                                    ),

                                                    const SizedBox(height: 12),

                                                    // Address
                                                    _buildDetailItem(
                                                      context,
                                                      Icons.location_on,
                                                      localeProvider.translate(
                                                        'dashboard.disbursements.labels.address',
                                                      ),
                                                      disbursement
                                                              .userAddress ??
                                                          'Not provided',
                                                    ),

                                                    const SizedBox(height: 12),

                                                    // Transaction ID
                                                    _buildDetailItem(
                                                      context,
                                                      Icons.receipt,
                                                      localeProvider.translate(
                                                        'dashboard.disbursements.labels.transactionId',
                                                      ),
                                                      disbursement
                                                              .transactionId ??
                                                          'Not available',
                                                    ),

                                                    const SizedBox(height: 12),

                                                    // Progressive Payment Section
                                                    if (disbursement
                                                        .isProgressivePayment) ...[
                                                      Container(
                                                        padding:
                                                            const EdgeInsets.all(
                                                              12,
                                                            ),
                                                        decoration: BoxDecoration(
                                                          color: theme
                                                              .colorScheme
                                                              .primaryContainer
                                                              .withOpacity(0.1),
                                                          borderRadius:
                                                              BorderRadius.circular(
                                                                8,
                                                              ),
                                                          border: Border.all(
                                                            color: theme
                                                                .colorScheme
                                                                .primary
                                                                .withOpacity(
                                                                  0.2,
                                                                ),
                                                          ),
                                                        ),
                                                        child: Column(
                                                          crossAxisAlignment:
                                                              CrossAxisAlignment
                                                                  .start,
                                                          children: [
                                                            Row(
                                                              children: [
                                                                Icon(
                                                                  Icons
                                                                      .trending_up,
                                                                  size: 16,
                                                                  color: theme
                                                                      .colorScheme
                                                                      .primary,
                                                                ),
                                                                const SizedBox(
                                                                  width: 6,
                                                                ),
                                                                Text(
                                                                  'Progressive Payment',
                                                                  style: theme
                                                                      .textTheme
                                                                      .bodySmall
                                                                      ?.copyWith(
                                                                        color: theme
                                                                            .colorScheme
                                                                            .primary,
                                                                        fontWeight:
                                                                            FontWeight.w600,
                                                                      ),
                                                                ),
                                                              ],
                                                            ),
                                                            const SizedBox(
                                                              height: 8,
                                                            ),
                                                            Row(
                                                              children: [
                                                                Expanded(
                                                                  child: Column(
                                                                    crossAxisAlignment:
                                                                        CrossAxisAlignment
                                                                            .start,
                                                                    children: [
                                                                      Text(
                                                                        'Installments',
                                                                        style: theme.textTheme.bodySmall?.copyWith(
                                                                          color: theme
                                                                              .textTheme
                                                                              .bodyMedium
                                                                              ?.color
                                                                              ?.withOpacity(
                                                                                0.6,
                                                                              ),
                                                                        ),
                                                                      ),
                                                                      Text(
                                                                        '${disbursement.completedInstallments}/${disbursement.totalInstallments}',
                                                                        style: theme
                                                                            .textTheme
                                                                            .bodySmall
                                                                            ?.copyWith(
                                                                              fontWeight: FontWeight.w600,
                                                                            ),
                                                                      ),
                                                                    ],
                                                                  ),
                                                                ),
                                                                Expanded(
                                                                  child: Column(
                                                                    crossAxisAlignment:
                                                                        CrossAxisAlignment
                                                                            .start,
                                                                    children: [
                                                                      Text(
                                                                        'Disbursed',
                                                                        style: theme.textTheme.bodySmall?.copyWith(
                                                                          color: theme
                                                                              .textTheme
                                                                              .bodyMedium
                                                                              ?.color
                                                                              ?.withOpacity(
                                                                                0.6,
                                                                              ),
                                                                        ),
                                                                      ),
                                                                      Text(
                                                                        '₹${disbursement.disbursedAmount.toStringAsFixed(0)}',
                                                                        style: theme.textTheme.bodySmall?.copyWith(
                                                                          fontWeight:
                                                                              FontWeight.w600,
                                                                          color: theme
                                                                              .colorScheme
                                                                              .primary,
                                                                        ),
                                                                      ),
                                                                    ],
                                                                  ),
                                                                ),
                                                              ],
                                                            ),
                                                            const SizedBox(
                                                              height: 8,
                                                            ),
                                                            LinearProgressIndicator(
                                                              value:
                                                                  disbursement
                                                                          .totalInstallments >
                                                                      0
                                                                  ? disbursement
                                                                            .completedInstallments /
                                                                        disbursement
                                                                            .totalInstallments
                                                                  : 0,
                                                              backgroundColor: theme
                                                                  .colorScheme
                                                                  .surfaceVariant,
                                                              valueColor:
                                                                  AlwaysStoppedAnimation<
                                                                    Color
                                                                  >(
                                                                    theme
                                                                        .colorScheme
                                                                        .primary,
                                                                  ),
                                                            ),
                                                            const SizedBox(
                                                              height: 4,
                                                            ),
                                                            Text(
                                                              '${disbursement.disbursementProgress.toStringAsFixed(1)}% Complete',
                                                              style: theme
                                                                  .textTheme
                                                                  .bodySmall
                                                                  ?.copyWith(
                                                                    color: theme
                                                                        .colorScheme
                                                                        .onSurfaceVariant,
                                                                    fontSize:
                                                                        10,
                                                                  ),
                                                            ),
                                                          ],
                                                        ),
                                                      ),
                                                    ],
                                                  ],
                                                );
                                              },
                                            ),
                                          ],
                                        ),
                                      ),
                                    )
                                    .animate()
                                    .fadeIn(
                                      duration: 600.ms,
                                      delay: Duration(
                                        milliseconds: index * 100,
                                      ),
                                    )
                                    .slideY(begin: 0.1, end: 0);
                              },
                            ),
                          ),
                        ],
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
          color: theme.textTheme.bodyMedium?.color?.withOpacity(0.6),
        ),
        const SizedBox(width: 6),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.textTheme.bodyMedium?.color?.withOpacity(0.6),
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
