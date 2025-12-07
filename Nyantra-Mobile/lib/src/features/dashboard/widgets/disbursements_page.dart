// ignore_for_file: deprecated_member_use, use_build_context_synchronously, avoid_unnecessary_containers

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../../core/providers/locale_provider.dart';
import '../../../core/widgets/loading_state.dart';
import '../../../core/services/data_service.dart';
import '../../../core/models/disbursement_model.dart';
import '../../../core/models/beneficiary_model.dart';
import '../screens/disbursement_edit_page.dart';

class DisbursementsPage extends StatefulWidget {
  const DisbursementsPage({super.key});

  @override
  State<DisbursementsPage> createState() => _DisbursementsPageState();
}

class _DisbursementsPageState extends State<DisbursementsPage> {
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

                      return ListView.builder(
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        itemCount: disbursements.length,
                        itemBuilder: (context, index) {
                          final disbursement = disbursements[index];
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
                                  onTap: () async {
                                    final res = await Navigator.of(context)
                                        .push(
                                          MaterialPageRoute(
                                            builder: (_) =>
                                                DisbursementEditPage(
                                                  disbursement: disbursement,
                                                ),
                                          ),
                                        );
                                    if (res == true) {
                                      ScaffoldMessenger.of(
                                        context,
                                      ).showSnackBar(
                                        SnackBar(
                                          content: Text(
                                            localeProvider.translate(
                                              'dashboard.disbursements.savedSuccess',
                                            ),
                                          ),
                                        ),
                                      );
                                    }
                                  },
                                  borderRadius: BorderRadius.circular(16),
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
                                                    CrossAxisAlignment.start,
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
                                                              FontWeight.w500,
                                                        ),
                                                  ),
                                                  Text(
                                                    '₹${disbursement.reliefAmount.toStringAsFixed(0)}',
                                                    style: theme
                                                        .textTheme
                                                        .titleMedium
                                                        ?.copyWith(
                                                          fontWeight:
                                                              FontWeight.w600,
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
                                                color: disbursement.statusColor
                                                    .withOpacity(0.1),
                                                borderRadius:
                                                    BorderRadius.circular(20),
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
                                                              FontWeight.w500,
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
                                                            ? Icons.check_circle
                                                            : Icons.pending,
                                                        color: disbursement
                                                            .statusColor,
                                                        size: 16,
                                                      ),
                                                      const SizedBox(width: 4),
                                                      Text(
                                                        disbursement.statusText,
                                                        style: TextStyle(
                                                          color: disbursement
                                                              .statusColor,
                                                          fontSize: 12,
                                                          fontWeight:
                                                              FontWeight.w600,
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
                                              .doc(disbursement.beneficiaryId)
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
                                                        as Map<String, dynamic>,
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
                                                        localeProvider.translate(
                                                          'dashboard.disbursements.labels.beneficiaryName',
                                                        ),
                                                        beneficiary?.name ??
                                                            'Beneficiary ID: ${disbursement.beneficiaryId}',
                                                      ),
                                                    ),
                                                    Expanded(
                                                      child: _buildDetailItem(
                                                        context,
                                                        Icons.calendar_today,
                                                        localeProvider.translate(
                                                          'dashboard.disbursements.labels.initiatedDate',
                                                        ),
                                                        disbursement.createdAt
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
                                                        localeProvider.translate(
                                                          'dashboard.disbursements.labels.phoneNumber',
                                                        ),
                                                        disbursement
                                                                .userPhone ??
                                                            'Not provided',
                                                      ),
                                                    ),
                                                    const Expanded(
                                                      child:
                                                          SizedBox(), // Empty space for layout
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
                                                        Icons.account_balance,
                                                        localeProvider.translate(
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
                                                        localeProvider.translate(
                                                          'dashboard.disbursements.labels.ifscCode',
                                                        ),
                                                        disbursement.userIFSC ??
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
                                                  disbursement.userAddress ??
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
                                                  disbursement.transactionId ??
                                                      'Not available',
                                                ),
                                              ],
                                            );
                                          },
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
