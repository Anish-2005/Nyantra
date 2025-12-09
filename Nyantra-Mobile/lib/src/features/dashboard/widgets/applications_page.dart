// ignore_for_file: curly_braces_in_flow_control_structures, use_build_context_synchronously, deprecated_member_use, avoid_unnecessary_containers, annotate_overrides

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/providers/locale_provider.dart';
import '../../../core/widgets/loading_state.dart';
import '../../../core/services/data_service.dart';
import '../../../core/models/application_model.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../screens/application_edit_page.dart';
import '../screens/application_create_page.dart';

// PoA Act Offences Data Structure
const Map<String, Map<String, dynamic>> poaOffences = {
  "1. Offences leading to Death / Murder": {
    "Murder of SC/ST person": 825000,
    "Death due to injury inflicted during atrocity": 825000,
    "Death after rape / gang rape": 825000,
  },
  "2. Rape and Sexual Offences": {
    "Rape": 500000,
    "Gang rape": 825000,
    "Attempt to rape": 100000,
    "Parading naked / semi-naked": 200000,
    "Sexual harassment / use of criminal force": 100000,
  },
  "3. Grievous Hurt / Injury": {
    "Grievous hurt": 125000,
    "Permanent disability": 500000,
    "Partial disability": 250000,
    "Acid attack â€“ deformity / disability": 825000,
    "Acid attack â€“ injury without deformity": 500000,
  },
  "4. Offences Against Women & Dignity": {
    "Outraging modesty of SC/ST woman": 100000,
    "Sexual exploitation / trafficking": 200000,
    "Forced to work naked / semi-naked": 200000,
  },
  "5. Property Damage / Arson": {
    "Burning of house / arson": "225000-425000",
    "Destruction of household / property": "100000-200000",
    "Destruction of crops": 100000,
    "Destruction of cattle / livestock": 60000,
  },
  "6. Land & Economic Offences": {
    "Wrongful dispossession from land": 200000,
    "Destruction of standing crops": 100000,
    "Economic boycott": 100000,
    "Social boycott": 100000,
    "Bonded labour / forced labour": 100000,
  },
  "7. Caste Atrocity / Humiliation Offences": {
    "Intentional insult, intimidation, caste abuse": 100000,
    "Preventing entry into public place": 100000,
    "Preventing access to public well/tank/roads": 100000,
    "Compelling to eat inedible / obnoxious substances": 100000,
  },
  "8. Kidnapping / Abduction": {
    "Kidnapping SC/ST person": "100000-200000",
    "Abduction with intent to outrage modesty": 200000,
  },
  "9. Mental Torture / Harassment": {
    "Harassing, humiliating, intimidating": 100000,
    "Public humiliation": "100000-200000",
  },
  "10. Other Serious Offences": {
    "Preventing from voting": 100000,
    "Poll violence against SC/ST": 200000,
    "False, malicious, vexatious legal cases": 100000,
  },
};

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
                                        'applications.pageTitle',
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
                                  'applications.pageTitle',
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
                                  'applications.pageSubtitle',
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
                                localeProvider.translate(
                                  'extracted.errorLoading',
                                ),
                                style: theme.textTheme.headlineSmall,
                              ),
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
                                localeProvider.translate(
                                  'extracted.noApplications',
                                ),
                                style: theme.textTheme.headlineSmall,
                                textAlign: TextAlign.center,
                              ),
                              const SizedBox(height: 8),
                              Text(
                                localeProvider.translate(
                                  'extracted.noApplicationsDescription',
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
                        itemCount: applications.length,
                        itemBuilder: (context, index) {
                          final application = applications[index];
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
                                            builder: (_) => ApplicationEditPage(
                                              application: application,
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
                                              'extracted.applicationSaved',
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
                                        // Header with status and amount
                                        Row(
                                          children: [
                                            Expanded(
                                              child: Row(
                                                children: [
                                                  Container(
                                                    padding:
                                                        const EdgeInsets.all(8),
                                                    decoration: BoxDecoration(
                                                      color: application
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
                                                      Icons.description,
                                                      color: application
                                                          .statusColor,
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
                                                          application
                                                                  .applicantName ??
                                                              localeProvider
                                                                  .translate(
                                                                    'extracted.unknownApplicant',
                                                                  ),
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
                                                          '${localeProvider.translate('applications.idLabel')} ${application.id}',
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
                                                // Edit button shown only when the current user is owner/user
                                                Builder(
                                                  builder: (context) {
                                                    final currentUser =
                                                        FirebaseAuth
                                                            .instance
                                                            .currentUser;
                                                    final canEdit =
                                                        currentUser != null &&
                                                        currentUser.uid ==
                                                            (application
                                                                    .ownerId ??
                                                                application
                                                                    .userId);
                                                    if (!canEdit)
                                                      return const SizedBox();
                                                    return Row(
                                                      mainAxisSize:
                                                          MainAxisSize.min,
                                                      children: [
                                                        IconButton(
                                                          icon: const Icon(
                                                            Icons.edit,
                                                            size: 20,
                                                          ),
                                                          onPressed: () async {
                                                            final res =
                                                                await Navigator.of(
                                                                  context,
                                                                ).push(
                                                                  MaterialPageRoute(
                                                                    builder: (_) =>
                                                                        ApplicationEditPage(
                                                                          application:
                                                                              application,
                                                                        ),
                                                                  ),
                                                                );
                                                            if (res == true) {
                                                              ScaffoldMessenger.of(
                                                                context,
                                                              ).showSnackBar(
                                                                SnackBar(
                                                                  content: Text(
                                                                    localeProvider
                                                                        .translate(
                                                                          'extracted.applicationSaved',
                                                                        ),
                                                                  ),
                                                                ),
                                                              );
                                                            }
                                                          },
                                                        ),
                                                        IconButton(
                                                          icon: const Icon(
                                                            Icons.delete,
                                                            size: 20,
                                                            color: Colors.red,
                                                          ),
                                                          onPressed: () =>
                                                              _showDeleteConfirmation(
                                                                application,
                                                              ),
                                                        ),
                                                      ],
                                                    );
                                                  },
                                                ),
                                                Container(
                                                  padding:
                                                      const EdgeInsets.symmetric(
                                                        horizontal: 10,
                                                        vertical: 5,
                                                      ),
                                                  decoration: BoxDecoration(
                                                    color:
                                                        application.statusColor,
                                                    borderRadius:
                                                        BorderRadius.circular(
                                                          16,
                                                        ),
                                                  ),
                                                  child: Text(
                                                    application.statusText,
                                                    style: TextStyle(
                                                      color: Colors.white,
                                                      fontSize: 11,
                                                      fontWeight:
                                                          FontWeight.w700,
                                                    ),
                                                  ),
                                                ),
                                                if (application.amount !=
                                                    null) ...[
                                                  const SizedBox(height: 8),
                                                  Text(
                                                    '₹${application.amount!.toStringAsFixed(0)}',
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
                                                Icons.category,
                                                localeProvider.translate(
                                                  'extracted.act_type',
                                                ),
                                                application.actType ??
                                                    localeProvider.translate(
                                                      'common.na',
                                                    ),
                                              ),
                                            ),
                                            Expanded(
                                              child: _buildDetailItem(
                                                context,
                                                Icons.priority_high,
                                                localeProvider.translate(
                                                  'extracted.priority',
                                                ),
                                                application.priority ??
                                                    localeProvider.translate(
                                                      'common.na',
                                                    ),
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
                                                Icons.location_on,
                                                localeProvider.translate(
                                                  'extracted.district',
                                                ),
                                                application.district ??
                                                    localeProvider.translate(
                                                      'common.na',
                                                    ),
                                              ),
                                            ),
                                            Expanded(
                                              child: _buildDetailItem(
                                                context,
                                                Icons.map,
                                                localeProvider.translate(
                                                  'extracted.state',
                                                ),
                                                application.state ??
                                                    localeProvider.translate(
                                                      'common.na',
                                                    ),
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
                                                Icons.event,
                                                localeProvider.translate(
                                                  'extracted.incidentDateHint',
                                                ),
                                                application.incidentDate ??
                                                    localeProvider.translate(
                                                      'common.na',
                                                    ),
                                              ),
                                            ),
                                            Expanded(
                                              child: _buildDetailItem(
                                                context,
                                                Icons.badge,
                                                localeProvider.translate(
                                                  'applications.beneficiaryId',
                                                ),
                                                application.beneficiaryId ??
                                                    localeProvider.translate(
                                                      'common.na',
                                                    ),
                                              ),
                                            ),
                                          ],
                                        ),
                                        const SizedBox(height: 12),

                                        // Case details row
                                        if (application.firReport != null ||
                                            application.medicalReport != null ||
                                            application.policeStation != null ||
                                            application.caseNumber != null)
                                          Column(
                                            crossAxisAlignment:
                                                CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                localeProvider.translate(
                                                  'applications.caseDetails',
                                                ),
                                                style: TextStyle(
                                                  fontSize: 14,
                                                  fontWeight: FontWeight.w600,
                                                  color: theme.primaryColor,
                                                ),
                                              ),
                                              const SizedBox(height: 8),
                                              if (application.firReport !=
                                                      null &&
                                                  application
                                                      .firReport!
                                                      .isNotEmpty)
                                                _buildDetailItem(
                                                  context,
                                                  Icons.description,
                                                  localeProvider.translate(
                                                    'applications.firReport',
                                                  ),
                                                  application.firReport!,
                                                ),
                                              if (application.medicalReport !=
                                                      null &&
                                                  application
                                                      .medicalReport!
                                                      .isNotEmpty)
                                                _buildDetailItem(
                                                  context,
                                                  Icons.medical_services,
                                                  localeProvider.translate(
                                                    'applications.medicalReport',
                                                  ),
                                                  application.medicalReport!,
                                                ),
                                              if (application.policeStation !=
                                                      null &&
                                                  application
                                                      .policeStation!
                                                      .isNotEmpty)
                                                _buildDetailItem(
                                                  context,
                                                  Icons.local_police,
                                                  localeProvider.translate(
                                                    'applications.policeStation',
                                                  ),
                                                  application.policeStation!,
                                                ),
                                              if (application.caseNumber !=
                                                      null &&
                                                  application
                                                      .caseNumber!
                                                      .isNotEmpty)
                                                _buildDetailItem(
                                                  context,
                                                  Icons.numbers,
                                                  localeProvider.translate(
                                                    'applications.caseNumber',
                                                  ),
                                                  application.caseNumber!,
                                                ),
                                              const SizedBox(height: 12),
                                            ],
                                          ),

                                        // Additional details: contact, beneficiary, owner, timestamps
                                        Row(
                                          children: [
                                            Expanded(
                                              child: _buildDetailItem(
                                                context,
                                                Icons.phone,
                                                localeProvider.translate(
                                                  'extracted.phone_number',
                                                ),
                                                application.contactNumber ??
                                                    localeProvider.translate(
                                                      'common.na',
                                                    ),
                                              ),
                                            ),
                                            Expanded(
                                              child: _buildDetailItem(
                                                context,
                                                Icons.email,
                                                localeProvider.translate(
                                                  'extracted.aadhaar',
                                                ),
                                                application.aadhaar ??
                                                    localeProvider.translate(
                                                      'common.na',
                                                    ),
                                              ),
                                            ),
                                          ],
                                        ),

                                        const SizedBox(height: 12),
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

          // Floating Action Button for adding new applications
          Positioned(
            bottom: 20,
            right: 20,
            child: FloatingActionButton(
              onPressed: () {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (context) => const ApplicationCreatePage(),
                  ),
                );
              },
              backgroundColor: theme.primaryColor,
              foregroundColor: Colors.white,
              elevation: 6,
              child: const Icon(Icons.add),
            ).animate().scale(delay: 800.ms),
          ),
        ],
      ),
    );
  }

  void _showDeleteConfirmation(ApplicationModel application) {
    final locale = context.read<LocaleProvider>();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(locale.translate('extracted.confirmDeleteTitle')),
        content: Text(
          locale.translate('extracted.confirmDeleteMessage', {
            'id': application.id,
          }),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: Text(locale.translate('cancel')),
          ),
          TextButton(
            onPressed: () async {
              Navigator.of(context).pop();
              await _deleteApplication(application);
            },
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: Text(locale.translate('delete')),
          ),
        ],
      ),
    );
  }

  Future<void> _deleteApplication(ApplicationModel application) async {
    try {
      await DataService.deleteApplication(application.id);
      if (mounted) {
        final locale = context.read<LocaleProvider>();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(locale.translate('extracted.deletedSuccess'))),
        );
      }
    } catch (e) {
      if (mounted) {
        final locale = context.read<LocaleProvider>();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              locale.translate('extracted.errorDeleting', {
                'error': e.toString(),
              }),
            ),
          ),
        );
      }
    }
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
