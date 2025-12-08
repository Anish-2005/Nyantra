// ignore_for_file: use_build_context_synchronously, deprecated_member_use, avoid_unnecessary_containers

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:flutter/services.dart';
import '../../../core/providers/locale_provider.dart';
import '../../../core/widgets/loading_state.dart';
import '../../../core/services/data_service.dart';
import '../../../core/models/beneficiary_model.dart';
import '../screens/beneficiary_edit_page.dart';
import '../screens/beneficiary_form_page.dart';

class BeneficiariesPage extends StatefulWidget {
  const BeneficiariesPage({super.key});

  @override
  State<BeneficiariesPage> createState() => _BeneficiariesPageState();
}

class _BeneficiariesPageState extends State<BeneficiariesPage> {
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
                                      Icons.people,
                                      color: Colors.white,
                                      size: 16,
                                    ),
                                    const SizedBox(width: 6),
                                    Text(
                                      localeProvider.translate(
                                        'beneficiaries.pageTitle',
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
                                  'beneficiaries.pageTitle',
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
                                  'beneficiaries.pageSubtitle',
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

                // Beneficiaries List
                Expanded(
                  child: StreamBuilder<List<BeneficiaryModel>>(
                    stream: DataService.getBeneficiaries(),
                    builder: (context, snapshot) {
                      if (snapshot.connectionState == ConnectionState.waiting) {
                        return LoadingState(
                          message: localeProvider.translate(
                            'extracted.loading',
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
                                color: theme.colorScheme.error.withValues(
                                  alpha: 128,
                                ),
                              ),
                              const SizedBox(height: 16),
                              Text(
                                localeProvider.translate(
                                  'beneficiaries.errorLoading',
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

                      final beneficiaries = snapshot.data ?? [];

                      if (beneficiaries.isEmpty) {
                        return Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                Icons.people_outline,
                                size: 64,
                                color: theme.textTheme.bodyMedium?.color
                                    ?.withValues(alpha: 77),
                              ),
                              const SizedBox(height: 16),
                              Text(
                                localeProvider.translate(
                                  'beneficiaries.noBeneficiaries',
                                ),
                                style: theme.textTheme.headlineSmall,
                                textAlign: TextAlign.center,
                              ),
                              const SizedBox(height: 8),
                              Text(
                                localeProvider.translate(
                                  'beneficiaries.createPrompt',
                                ),
                                style: theme.textTheme.bodyMedium?.copyWith(
                                  color: theme.textTheme.bodySmall?.color,
                                ),
                                textAlign: TextAlign.center,
                              ),
                              const SizedBox(height: 24),
                              ElevatedButton.icon(
                                onPressed: _addNewBeneficiary,
                                icon: const Icon(Icons.add),
                                label: Text(
                                  localeProvider.translate(
                                    'beneficiaries.addBeneficiaryButton',
                                  ),
                                ),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: theme.primaryColor,
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 24,
                                    vertical: 12,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ).animate().fadeIn(duration: 600.ms, delay: 300.ms);
                      }

                      return ListView.builder(
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        itemCount: beneficiaries.length,
                        itemBuilder: (context, index) {
                          final beneficiary = beneficiaries[index];
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
                                            builder: (_) => BeneficiaryEditPage(
                                              beneficiary: beneficiary,
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
                                              'beneficiaries.savedSuccess',
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
                                        // Beneficiary ID at the top with copy button
                                        Container(
                                          padding: const EdgeInsets.symmetric(
                                            horizontal: 12,
                                            vertical: 8,
                                          ),
                                          decoration: BoxDecoration(
                                            color: theme.colorScheme.primary
                                                .withValues(alpha: 0.1),
                                            borderRadius: BorderRadius.circular(
                                              8,
                                            ),
                                          ),
                                          child: Row(
                                            children: [
                                              Icon(
                                                Icons.badge,
                                                size: 16,
                                                color:
                                                    theme.colorScheme.primary,
                                              ),
                                              const SizedBox(width: 8),
                                              Text(
                                                '${localeProvider.translate('extracted.beneficiaryId')}: ${beneficiary.id}',
                                                style: theme.textTheme.bodySmall
                                                    ?.copyWith(
                                                      color: theme
                                                          .colorScheme
                                                          .primary,
                                                      fontWeight:
                                                          FontWeight.w600,
                                                    ),
                                              ),
                                              const Spacer(),
                                              IconButton(
                                                onPressed: () async {
                                                  await Clipboard.setData(
                                                    ClipboardData(
                                                      text: beneficiary.id,
                                                    ),
                                                  );
                                                  ScaffoldMessenger.of(
                                                    context,
                                                  ).showSnackBar(
                                                    SnackBar(
                                                      content: Text(
                                                        localeProvider.translate(
                                                          'copied_to_clipboard',
                                                        ),
                                                      ),
                                                      duration: const Duration(
                                                        seconds: 2,
                                                      ),
                                                    ),
                                                  );
                                                },
                                                icon: Icon(
                                                  Icons.copy,
                                                  size: 16,
                                                  color:
                                                      theme.colorScheme.primary,
                                                ),
                                                tooltip: localeProvider
                                                    .translate('copy_id'),
                                                padding: EdgeInsets.zero,
                                                constraints:
                                                    const BoxConstraints(),
                                              ),
                                            ],
                                          ),
                                        ),

                                        const SizedBox(height: 16),

                                        // Header with name and bank account indicator
                                        Row(
                                          children: [
                                            Expanded(
                                              child: Row(
                                                children: [
                                                  Container(
                                                    padding:
                                                        const EdgeInsets.all(8),
                                                    decoration: BoxDecoration(
                                                      color: Colors.blue
                                                          .withValues(
                                                            alpha: 51,
                                                          ),
                                                      borderRadius:
                                                          BorderRadius.circular(
                                                            8,
                                                          ),
                                                    ),
                                                    child: Icon(
                                                      Icons.person,
                                                      color: Colors.blue,
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
                                                          beneficiary.name,
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
                                                        if (beneficiary
                                                                .aadhaar !=
                                                            null)
                                                          Text(
                                                            '${localeProvider.translate('beneficiaries.aadhaarLabel')} ${beneficiary.aadhaar}',
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
                                          ],
                                        ),

                                        const SizedBox(height: 16),

                                        // Details row
                                        Row(
                                          children: [
                                            Expanded(
                                              child: _buildDetailItem(
                                                context,
                                                Icons.phone,
                                                localeProvider.translate(
                                                  'extracted.phone',
                                                ),
                                                beneficiary.phone ?? 'N/A',
                                              ),
                                            ),
                                            Expanded(
                                              child: _buildDetailItem(
                                                context,
                                                Icons.location_on,
                                                localeProvider.translate(
                                                  'extracted.address',
                                                ),
                                                beneficiary.address ?? 'N/A',
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
                                                Icons.location_city,
                                                localeProvider.translate(
                                                  'extracted.district',
                                                ),
                                                beneficiary.district ?? 'N/A',
                                              ),
                                            ),
                                            Expanded(
                                              child: _buildDetailItem(
                                                context,
                                                Icons.map,
                                                localeProvider.translate(
                                                  'extracted.state',
                                                ),
                                                beneficiary.state ?? 'N/A',
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
                                                Icons.event_available,
                                                localeProvider.translate(
                                                  'extracted.created',
                                                ),
                                                beneficiary.createdAt != null
                                                    ? beneficiary.createdAt!
                                                          .toString()
                                                          .split(' ')[0]
                                                    : 'N/A',
                                              ),
                                            ),
                                            Expanded(
                                              child: _buildDetailItem(
                                                context,
                                                Icons.label,
                                                localeProvider.translate(
                                                  'extracted.category',
                                                ),
                                                beneficiary.category ?? 'N/A',
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
                                                Icons.info,
                                                localeProvider.translate(
                                                  'extracted.status',
                                                ),
                                                beneficiary.status ?? 'N/A',
                                              ),
                                            ),
                                            Expanded(
                                              child: _buildDetailItem(
                                                context,
                                                Icons.family_restroom,
                                                localeProvider.translate(
                                                  'applications.fatherName',
                                                ),
                                                beneficiary.fatherName ?? 'N/A',
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
                                                localeProvider.translate(
                                                  'extracted.aadhaar',
                                                ),
                                                beneficiary.aadhaar ?? 'N/A',
                                              ),
                                            ),
                                            Expanded(
                                              child: _buildDetailItem(
                                                context,
                                                Icons.cake,
                                                localeProvider.translate(
                                                  'extracted.age',
                                                ),
                                                beneficiary.age?.toString() ??
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
                                                Icons.wc,
                                                localeProvider.translate(
                                                  'extracted.gender',
                                                ),
                                                beneficiary.gender ?? 'N/A',
                                              ),
                                            ),
                                            Expanded(
                                              child: _buildDetailItem(
                                                context,
                                                Icons.favorite,
                                                localeProvider.translate(
                                                  'applications.maritalStatus',
                                                ),
                                                beneficiary.maritalStatus ??
                                                    'N/A',
                                              ),
                                            ),
                                          ],
                                        ),

                                        const SizedBox(height: 12),

                                        const SizedBox(height: 12),

                                        Row(
                                          children: [
                                            Expanded(
                                              child: _buildDetailItem(
                                                context,
                                                Icons.account_balance,
                                                localeProvider.translate(
                                                  'applications.bankAccount',
                                                ),
                                                beneficiary.bankAccount ??
                                                    'N/A',
                                              ),
                                            ),
                                            Expanded(
                                              child: _buildDetailItem(
                                                context,
                                                Icons.code,
                                                localeProvider.translate(
                                                  'applications.ifsc',
                                                ),
                                                beneficiary.ifsc ?? 'N/A',
                                              ),
                                            ),
                                          ],
                                        ),

                                        const SizedBox(height: 12),

                                        // Certificate section
                                        if (beneficiary.scStCertificate !=
                                                null &&
                                            beneficiary
                                                .scStCertificate!
                                                .isNotEmpty)
                                          Container(
                                            padding: const EdgeInsets.all(12),
                                            decoration: BoxDecoration(
                                              color: theme.colorScheme.primary
                                                  .withValues(alpha: 0.1),
                                              borderRadius:
                                                  BorderRadius.circular(8),
                                              border: Border.all(
                                                color: theme.colorScheme.primary
                                                    .withValues(alpha: 0.2),
                                              ),
                                            ),
                                            child: Row(
                                              children: [
                                                Icon(
                                                  Icons.description,
                                                  size: 20,
                                                  color:
                                                      theme.colorScheme.primary,
                                                ),
                                                const SizedBox(width: 8),
                                                Expanded(
                                                  child: Column(
                                                    crossAxisAlignment:
                                                        CrossAxisAlignment
                                                            .start,
                                                    children: [
                                                      Text(
                                                        localeProvider.translate(
                                                          'beneficiaries.sc_st_certificate',
                                                        ),
                                                        style: theme
                                                            .textTheme
                                                            .bodySmall
                                                            ?.copyWith(
                                                              color: theme
                                                                  .colorScheme
                                                                  .primary,
                                                              fontWeight:
                                                                  FontWeight
                                                                      .w500,
                                                            ),
                                                      ),
                                                      const SizedBox(height: 2),
                                                      Text(
                                                        beneficiary
                                                            .scStCertificate!,
                                                        style: theme
                                                            .textTheme
                                                            .bodySmall
                                                            ?.copyWith(
                                                              color: theme
                                                                  .colorScheme
                                                                  .primary
                                                                  .withValues(
                                                                    alpha: 0.8,
                                                                  ),
                                                            ),
                                                        maxLines: 1,
                                                        overflow: TextOverflow
                                                            .ellipsis,
                                                      ),
                                                    ],
                                                  ),
                                                ),
                                                IconButton(
                                                  onPressed: () async {
                                                    final url = beneficiary
                                                        .scStCertificate!;
                                                    if (await canLaunchUrl(
                                                      Uri.parse(url),
                                                    )) {
                                                      await launchUrl(
                                                        Uri.parse(url),
                                                        mode: LaunchMode
                                                            .externalApplication,
                                                      );
                                                    } else {
                                                      ScaffoldMessenger.of(
                                                        context,
                                                      ).showSnackBar(
                                                        SnackBar(
                                                          content: Text(
                                                            localeProvider
                                                                .translate(
                                                                  'extracted.cannotOpenUrl',
                                                                ),
                                                          ),
                                                        ),
                                                      );
                                                    }
                                                  },
                                                  icon: Icon(
                                                    Icons.open_in_new,
                                                    size: 20,
                                                    color: theme
                                                        .colorScheme
                                                        .primary,
                                                  ),
                                                  tooltip: localeProvider.translate(
                                                    'extracted.viewCertificate',
                                                  ),
                                                ),
                                              ],
                                            ),
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

  void _addNewBeneficiary() {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (context) => const BeneficiaryFormPage()),
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
