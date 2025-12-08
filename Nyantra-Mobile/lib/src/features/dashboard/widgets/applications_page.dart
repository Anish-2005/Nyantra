// ignore_for_file: curly_braces_in_flow_control_structures, use_build_context_synchronously, deprecated_member_use, avoid_unnecessary_containers, annotate_overrides

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'dart:math';
import '../../../core/providers/locale_provider.dart';
import '../../../core/widgets/loading_state.dart';
import '../../../core/services/data_service.dart';
import '../../../core/models/application_model.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../screens/application_edit_page.dart';

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
    "Acid attack – deformity / disability": 825000,
    "Acid attack – injury without deformity": 500000,
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
              onPressed: _showNewApplicationDialog,
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

  void _showNewApplicationDialog() {
    showDialog(
      context: context,
      builder: (context) => const NewApplicationDialog(),
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

class NewApplicationDialog extends StatefulWidget {
  const NewApplicationDialog({super.key});

  @override
  State<NewApplicationDialog> createState() => _NewApplicationDialogState();
}

class _NewApplicationDialogState extends State<NewApplicationDialog> {
  final _formKey = GlobalKey<FormState>();
  final _applicantNameCtrl = TextEditingController();
  final _contactNumberCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _aadhaarCtrl = TextEditingController();
  final _beneficiaryIdCtrl = TextEditingController();
  final _fatherNameCtrl = TextEditingController();
  final _addressCtrl = TextEditingController();
  final _districtCtrl = TextEditingController();
  final _stateCtrl = TextEditingController();
  final _incidentDateCtrl = TextEditingController();
  final _amountCtrl = TextEditingController();
  final _priorityCtrl = TextEditingController(text: 'medium');
  final _caseNumberCtrl = TextEditingController();
  final _categoryCtrl = TextEditingController();
  final _ageCtrl = TextEditingController();
  final _maritalStatusCtrl = TextEditingController();
  final _bankAccountCtrl = TextEditingController();
  final _ifscCtrl = TextEditingController();
  final _firReportCtrl = TextEditingController();
  final _medicalReportCtrl = TextEditingController();
  final _policeStationCtrl = TextEditingController();
  bool _saving = false;
  bool _beneficiaryValid = false;
  bool _checkingBeneficiary = false;
  String? _beneficiaryError;
  String? _selectedActType;
  String? _selectedGender;
  String? _selectedMaritalStatus;
  String? _selectedOffenceCategory;
  String? _selectedOffenceType;

  @override
  void initState() {
    super.initState();
    _beneficiaryValid = false;
    _checkingBeneficiary = false;
    _beneficiaryError = null;
    _selectedActType = 'PCR Act';
    _selectedGender = 'M';
    _selectedMaritalStatus = 'Single';
    _selectedOffenceCategory = null;
    _selectedOffenceType = null;
  }

  @override
  void dispose() {
    _applicantNameCtrl.dispose();
    _contactNumberCtrl.dispose();
    _emailCtrl.dispose();
    _aadhaarCtrl.dispose();
    _beneficiaryIdCtrl.dispose();
    _fatherNameCtrl.dispose();
    _addressCtrl.dispose();
    _districtCtrl.dispose();
    _stateCtrl.dispose();
    _incidentDateCtrl.dispose();
    _amountCtrl.dispose();
    _priorityCtrl.dispose();
    _caseNumberCtrl.dispose();
    _categoryCtrl.dispose();
    _ageCtrl.dispose();
    _maritalStatusCtrl.dispose();
    _bankAccountCtrl.dispose();
    _ifscCtrl.dispose();
    _firReportCtrl.dispose();
    _medicalReportCtrl.dispose();
    _policeStationCtrl.dispose();
    super.dispose();
  }

  Future<void> _validateBeneficiary(String beneficiaryId) async {
    if (beneficiaryId.trim().isEmpty) {
      setState(() {
        _beneficiaryValid = false;
        _beneficiaryError = null;
      });
      return;
    }

    setState(() {
      _checkingBeneficiary = true;
      _beneficiaryError = null;
    });

    try {
      final beneficiaryDoc = await FirebaseFirestore.instance
          .collection('beneficiaries')
          .doc(beneficiaryId.trim())
          .get();

      if (beneficiaryDoc.exists) {
        final data = beneficiaryDoc.data()!;

        // Auto-populate common fields from beneficiary data
        setState(() {
          _beneficiaryValid = true;
          _checkingBeneficiary = false;

          // Populate fields if they're empty
          if (_applicantNameCtrl.text.isEmpty) {
            _applicantNameCtrl.text = data['name'] ?? '';
          }
          if (_contactNumberCtrl.text.isEmpty) {
            _contactNumberCtrl.text = data['phone'] ?? '';
          }
          if (_emailCtrl.text.isEmpty) {
            _emailCtrl.text = data['email'] ?? '';
          }
          if (_aadhaarCtrl.text.isEmpty) {
            _aadhaarCtrl.text = data['aadhaar'] ?? '';
          }
          if (_fatherNameCtrl.text.isEmpty) {
            _fatherNameCtrl.text = data['fatherName'] ?? '';
          }
          if (_addressCtrl.text.isEmpty) {
            _addressCtrl.text = data['address'] ?? '';
          }
          if (_districtCtrl.text.isEmpty) {
            _districtCtrl.text = data['district'] ?? '';
          }
          if (_stateCtrl.text.isEmpty) {
            _stateCtrl.text = data['state'] ?? '';
          }
          if (_ageCtrl.text.isEmpty && data['age'] != null) {
            _ageCtrl.text = data['age'].toString();
          }
          if (_selectedGender == null || _selectedGender!.isEmpty) {
            _selectedGender = data['gender'] ?? 'M';
          }
          if (_maritalStatusCtrl.text.isEmpty) {
            _maritalStatusCtrl.text = data['maritalStatus'] ?? '';
          }
          if (_bankAccountCtrl.text.isEmpty) {
            _bankAccountCtrl.text = data['bankAccount'] ?? '';
          }
          if (_ifscCtrl.text.isEmpty) {
            _ifscCtrl.text = data['ifsc'] ?? '';
          }
        });
      } else {
        setState(() {
          _beneficiaryValid = false;
          _checkingBeneficiary = false;
          final locale = context.read<LocaleProvider>();
          _beneficiaryError = locale.translate('extracted.beneficiaryNotFound');
        });
      }
    } catch (e) {
      setState(() {
        _beneficiaryValid = false;
        _checkingBeneficiary = false;
        final locale = context.read<LocaleProvider>();
        _beneficiaryError = locale.translate(
          'extracted.errorValidatingBeneficiary',
        );
      });
    }
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;

    // Check if beneficiary is valid
    if (!_beneficiaryValid) {
      final locale = context.read<LocaleProvider>();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            locale.translate('extracted.pleaseEnterValidBeneficiary'),
          ),
        ),
      );
      return;
    }

    setState(() => _saving = true);
    try {
      final currentUser = FirebaseAuth.instance.currentUser;
      if (currentUser == null) throw 'User not authenticated';

      // Generate a random 13-digit number for the application ID
      final random = Random();
      final randomId =
          '${random.nextInt(900000000) + 100000000}${random.nextInt(10000) + 1000}';

      final application = ApplicationModel(
        id: 'APP$randomId',
        applicantName: _applicantNameCtrl.text.trim(),
        contactNumber: _contactNumberCtrl.text.trim(),
        email: _emailCtrl.text.trim().isNotEmpty
            ? _emailCtrl.text.trim()
            : null,
        aadhaar: _aadhaarCtrl.text.trim(),
        beneficiaryId: _beneficiaryIdCtrl.text.trim(),
        fatherName: _fatherNameCtrl.text.trim().isNotEmpty
            ? _fatherNameCtrl.text.trim()
            : null,
        address: _addressCtrl.text.trim().isNotEmpty
            ? _addressCtrl.text.trim()
            : null,
        district: _districtCtrl.text.trim(),
        state: _stateCtrl.text.trim(),
        actType: _selectedActType ?? 'PCR Act',
        incidentDate: _incidentDateCtrl.text.trim(),
        amount: double.tryParse(_amountCtrl.text.trim()),
        priority: _priorityCtrl.text.trim(),
        caseNumber: _caseNumberCtrl.text.trim().isNotEmpty
            ? _caseNumberCtrl.text.trim()
            : null,
        category: _categoryCtrl.text.trim().isNotEmpty
            ? _categoryCtrl.text.trim()
            : null,
        age: int.tryParse(_ageCtrl.text.trim()),
        gender: _selectedGender,
        maritalStatus: _maritalStatusCtrl.text.trim().isNotEmpty
            ? _maritalStatusCtrl.text.trim()
            : null,
        bankAccount: _bankAccountCtrl.text.trim().isNotEmpty
            ? _bankAccountCtrl.text.trim()
            : null,
        ifsc: _ifscCtrl.text.trim().isNotEmpty ? _ifscCtrl.text.trim() : null,
        firReport: _firReportCtrl.text.trim().isNotEmpty
            ? _firReportCtrl.text.trim()
            : null,
        medicalReport: _medicalReportCtrl.text.trim().isNotEmpty
            ? _medicalReportCtrl.text.trim()
            : null,
        policeStation: _policeStationCtrl.text.trim().isNotEmpty
            ? _policeStationCtrl.text.trim()
            : null,
        status: ApplicationStatus.pending,
        applicationDate: DateTime.now(),
        ownerId: currentUser.uid,
        userId: currentUser.uid,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
        offenceCategory: _selectedOffenceCategory,
        offenceType: _selectedOffenceType,
      );

      await DataService.createApplication(application);

      if (mounted) {
        Navigator.of(context).pop();
        final locale = context.read<LocaleProvider>();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(locale.translate('extracted.createdSuccess'))),
        );
      }
    } catch (e) {
      if (mounted) {
        final locale = context.read<LocaleProvider>();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              locale.translate('extracted.errorGeneral', {
                'error': e.toString(),
              }),
            ),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  Widget _buildInput(
    ThemeData theme,
    LocaleProvider locale, {
    required TextEditingController controller,
    required String labelKey,
    TextInputType keyboardType = TextInputType.text,
    bool readOnly = false,
    String? Function(String?)? validator,
  }) {
    final label =
        labelKey.startsWith('applications.') ||
            labelKey.startsWith('extracted.')
        ? locale.translate(labelKey)
        : labelKey;

    return TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      readOnly: readOnly,
      validator: validator,
      decoration: InputDecoration(
        labelText: label,
        filled: true,
        fillColor: theme.cardColor.withOpacity(0.03),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
      ),
    );
  }

  Widget _buildDateInput(
    ThemeData theme,
    LocaleProvider locale, {
    required TextEditingController controller,
    required String labelKey,
    String? Function(String?)? validator,
  }) {
    final label =
        labelKey.startsWith('applications.') ||
            labelKey.startsWith('extracted.')
        ? locale.translate(labelKey)
        : labelKey;

    return TextFormField(
      controller: controller,
      readOnly: true,
      validator: validator,
      onTap: () async {
        final DateTime? picked = await showDatePicker(
          context: context,
          initialDate: DateTime.tryParse(controller.text) ?? DateTime.now(),
          firstDate: DateTime(2000),
          lastDate: DateTime.now(),
        );
        if (picked != null) {
          controller.text = picked.toIso8601String().split('T')[0];
        }
      },
      decoration: InputDecoration(
        labelText: label,
        filled: true,
        fillColor: theme.cardColor.withOpacity(0.03),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
        suffixIcon: Icon(Icons.calendar_today),
      ),
    );
  }

  Widget _buildActTypeDropdown(
    ThemeData theme,
    LocaleProvider locale, {
    required String labelKey,
  }) {
    final label =
        labelKey.startsWith('applications.') ||
            labelKey.startsWith('extracted.')
        ? locale.translate(labelKey)
        : labelKey;

    return DropdownButtonFormField<String>(
      value: _selectedActType,
      isExpanded: true,
      onChanged: (String? newValue) {
        if (newValue != null) {
          setState(() {
            _selectedActType = newValue;
          });
        }
      },
      items: ['PCR Act', 'PoA Act'].map<DropdownMenuItem<String>>((
        String value,
      ) {
        return DropdownMenuItem<String>(value: value, child: Text(value));
      }).toList(),
      decoration: InputDecoration(
        labelText: label,
        filled: true,
        fillColor: theme.cardColor.withOpacity(0.03),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
      ),
    );
  }

  Widget _buildGenderDropdown(
    ThemeData theme,
    LocaleProvider locale, {
    required String labelKey,
  }) {
    final label =
        labelKey.startsWith('applications.') ||
            labelKey.startsWith('extracted.')
        ? locale.translate(labelKey)
        : labelKey;

    return DropdownButtonFormField<String>(
      value: _selectedGender,
      onChanged: (String? newValue) {
        if (newValue != null) {
          setState(() {
            _selectedGender = newValue;
          });
        }
      },
      items: ['M', 'F'].map<DropdownMenuItem<String>>((String value) {
        return DropdownMenuItem<String>(value: value, child: Text(value));
      }).toList(),
      decoration: InputDecoration(
        labelText: label,
        filled: true,
        fillColor: theme.cardColor.withOpacity(0.03),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
      ),
    );
  }

  Widget _buildMaritalStatusDropdown(
    ThemeData theme,
    LocaleProvider locale, {
    required String labelKey,
  }) {
    final label =
        labelKey.startsWith('applications.') ||
            labelKey.startsWith('extracted.')
        ? locale.translate(labelKey)
        : labelKey;

    return DropdownButtonFormField<String>(
      value: _selectedMaritalStatus,
      onChanged: (String? newValue) {
        if (newValue != null) {
          setState(() {
            _selectedMaritalStatus = newValue;
          });
        }
      },
      items: ['Single', 'Married', 'Divorced', 'Widowed']
          .map<DropdownMenuItem<String>>((String value) {
            return DropdownMenuItem<String>(value: value, child: Text(value));
          })
          .toList(),
      decoration: InputDecoration(
        labelText: label,
        filled: true,
        fillColor: theme.cardColor.withOpacity(0.03),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
      ),
    );
  }

  Widget _buildOffenceCategoryDropdown(
    ThemeData theme,
    LocaleProvider locale, {
    required String labelKey,
  }) {
    final label = 'Offence Category';

    return DropdownButtonFormField<String>(
      value: _selectedOffenceCategory,
      isExpanded: true,
      onChanged: (String? newValue) {
        if (newValue != null) {
          setState(() {
            _selectedOffenceCategory = newValue;
            _selectedOffenceType =
                null; // Reset offence type when category changes
            // Auto-set amount based on first offence in category
            final category = poaOffences[newValue];
            if (category != null && category.isNotEmpty) {
              final firstOffence = category.keys.first;
              final compensation = category[firstOffence];
              if (compensation is int) {
                _amountCtrl.text = compensation.toString();
              } else if (compensation is String && compensation.contains('-')) {
                // For range values, take the first value
                final firstValue = compensation.split('-')[0];
                _amountCtrl.text = firstValue;
              }
            }
          });
        }
      },
      items: poaOffences.keys.map<DropdownMenuItem<String>>((String value) {
        return DropdownMenuItem<String>(
          value: value,
          child: Text(value, overflow: TextOverflow.ellipsis, softWrap: true),
        );
      }).toList(),
      decoration: InputDecoration(
        labelText: label,
        filled: true,
        fillColor: theme.cardColor.withOpacity(0.03),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
      ),
    );
  }

  Widget _buildOffenceTypeDropdown(
    ThemeData theme,
    LocaleProvider locale, {
    required String labelKey,
  }) {
    final label = 'Specific Offence';

    if (_selectedOffenceCategory == null) {
      return Container(); // Don't show if no category selected
    }

    final offences = poaOffences[_selectedOffenceCategory!] ?? {};

    return DropdownButtonFormField<String>(
      value: _selectedOffenceType,
      isExpanded: true,
      onChanged: (String? newValue) {
        if (newValue != null) {
          setState(() {
            _selectedOffenceType = newValue;
            // Auto-set amount based on selected offence
            final compensation = offences[newValue];
            if (compensation is int) {
              _amountCtrl.text = compensation.toString();
            } else if (compensation is String && compensation.contains('-')) {
              // For range values, take the first value
              final firstValue = compensation.split('-')[0];
              _amountCtrl.text = firstValue;
            }
          });
        }
      },
      items: offences.keys.map<DropdownMenuItem<String>>((String offence) {
        final compensation = offences[offence];
        final compensationText = compensation is int
            ? '₹${compensation.toString()}'
            : compensation is String && compensation.contains('-')
            ? '₹${compensation.replaceAll('-', ' - ₹')} (range)'
            : '₹${compensation.toString()}';
        return DropdownMenuItem<String>(
          value: offence,
          child: Container(
            constraints: const BoxConstraints(maxWidth: 400),
            child: Text(
              '$offence • $compensationText',
              overflow: TextOverflow.ellipsis,
              softWrap: true,
              maxLines: 2,
            ),
          ),
        );
      }).toList(),
      decoration: InputDecoration(
        labelText: label,
        filled: true,
        fillColor: theme.cardColor.withOpacity(0.03),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
      ),
    );
  }

  String _getCompensationText() {
    if (_selectedOffenceCategory == null || _selectedOffenceType == null) {
      return '₹0';
    }

    final category = poaOffences[_selectedOffenceCategory];
    if (category == null) return '₹0';

    final amount = category[_selectedOffenceType];
    if (amount == null) return '₹0';

    if (amount is int) {
      return '₹${amount.toStringAsFixed(0)}';
    } else if (amount is String && amount.contains('-')) {
      // For range values, show the range
      return '₹${amount.replaceAll('-', ' - ₹')}';
    } else {
      return '₹${amount.toString()}';
    }
  }

  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final localeProvider = context.watch<LocaleProvider>();

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Container(
        constraints: const BoxConstraints(maxWidth: 900, maxHeight: 700),
        decoration: BoxDecoration(
          color: theme.dialogBackgroundColor,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(Icons.add, color: theme.primaryColor),
                    const SizedBox(width: 12),
                    Text(
                      localeProvider.translate('applications.newApplication'),
                      style: theme.textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Expanded(
                  child: SingleChildScrollView(
                    child: Column(
                      children: [
                        _buildInput(
                          theme,
                          localeProvider,
                          controller: _applicantNameCtrl,
                          labelKey: 'applications.applicant_name',
                          keyboardType: TextInputType.name,
                          validator: (value) => value?.isEmpty ?? true
                              ? localeProvider.translate('common.required')
                              : null,
                        ),
                        const SizedBox(height: 8),
                        _buildInput(
                          theme,
                          localeProvider,
                          controller: _aadhaarCtrl,
                          labelKey: 'applications.aadhaar',
                          validator: (value) => value?.isEmpty ?? true
                              ? localeProvider.translate('common.required')
                              : null,
                        ),
                        const SizedBox(height: 8),
                        _buildInput(
                          theme,
                          localeProvider,
                          controller: _contactNumberCtrl,
                          labelKey: 'applications.phone_number',
                          keyboardType: TextInputType.phone,
                          validator: (value) => value?.isEmpty ?? true
                              ? localeProvider.translate('common.required')
                              : null,
                        ),
                        const SizedBox(height: 16),
                        Row(
                          children: [
                            Expanded(
                              child: _buildInput(
                                theme,
                                localeProvider,
                                controller: _districtCtrl,
                                labelKey: 'applications.district',
                                validator: (value) => value?.isEmpty ?? true
                                    ? localeProvider.translate(
                                        'common.required',
                                      )
                                    : null,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: _buildInput(
                                theme,
                                localeProvider,
                                controller: _stateCtrl,
                                labelKey: 'applications.state',
                                validator: (value) => value?.isEmpty ?? true
                                    ? localeProvider.translate(
                                        'common.required',
                                      )
                                    : null,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        _buildActTypeDropdown(
                          theme,
                          localeProvider,
                          labelKey: 'applications.act_type',
                        ),
                        const SizedBox(height: 16),
                        // PoA Offence Selection - only show when PoA is selected
                        if (_selectedActType == 'PoA Act') ...[
                          _buildOffenceCategoryDropdown(
                            theme,
                            localeProvider,
                            labelKey: 'offence_category',
                          ),
                          const SizedBox(height: 16),
                          if (_selectedOffenceCategory != null)
                            _buildOffenceTypeDropdown(
                              theme,
                              localeProvider,
                              labelKey: 'offence_type',
                            ),
                          if (_selectedOffenceCategory != null &&
                              _selectedOffenceType != null)
                            Container(
                              margin: const EdgeInsets.only(top: 16),
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: Colors.green.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(
                                  color: Colors.green.withOpacity(0.3),
                                ),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Icon(
                                        Icons.account_balance_wallet,
                                        color: Colors.green[700],
                                        size: 20,
                                      ),
                                      const SizedBox(width: 8),
                                      Expanded(
                                        child: Text(
                                          'Expected Compensation',
                                          style: TextStyle(
                                            fontWeight: FontWeight.bold,
                                            color: Colors.green[700],
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    _getCompensationText(),
                                    style: TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.green[800],
                                    ),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    'Based on PoA Act compensation guidelines',
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: Colors.green[600],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                        ],
                        const SizedBox(height: 16),
                        TextFormField(
                          controller: _beneficiaryIdCtrl,
                          decoration: InputDecoration(
                            labelText: localeProvider.translate(
                              'extracted.beneficiaryId',
                            ),
                            filled: true,
                            fillColor: theme.cardColor.withOpacity(0.03),
                            contentPadding: const EdgeInsets.symmetric(
                              vertical: 12,
                              horizontal: 12,
                            ),
                            suffixIcon: _checkingBeneficiary
                                ? const SizedBox(
                                    width: 20,
                                    height: 20,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                    ),
                                  )
                                : _beneficiaryIdCtrl.text.isNotEmpty
                                ? Icon(
                                    _beneficiaryValid
                                        ? Icons.check_circle
                                        : Icons.error,
                                    color: _beneficiaryValid
                                        ? Colors.green
                                        : Colors.red,
                                  )
                                : null,
                            errorText: _beneficiaryError,
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                          validator: (value) {
                            if (value?.isEmpty ?? true)
                              return localeProvider.translate(
                                'common.required',
                              );
                            if (!_beneficiaryValid)
                              return localeProvider.translate(
                                'extracted.invalidBeneficiary',
                              );
                            return null;
                          },
                          onChanged: (value) {
                            // Debounce the validation
                            Future.delayed(
                              const Duration(milliseconds: 500),
                              () {
                                if (mounted &&
                                    _beneficiaryIdCtrl.text == value) {
                                  _validateBeneficiary(value);
                                }
                              },
                            );
                          },
                        ),
                        const SizedBox(height: 8),
                        _buildDateInput(
                          theme,
                          localeProvider,
                          controller: _incidentDateCtrl,
                          labelKey: 'applications.incidentDateHint',
                          validator: (value) => value?.isEmpty ?? true
                              ? localeProvider.translate('common.required')
                              : null,
                        ),
                        const SizedBox(height: 8),
                        _buildInput(
                          theme,
                          localeProvider,
                          controller: _amountCtrl,
                          labelKey: 'applications.reliefAmountINR',
                          keyboardType: TextInputType.number,
                          validator: (value) => value?.isEmpty ?? true
                              ? localeProvider.translate('common.required')
                              : null,
                        ),
                        const SizedBox(height: 8),
                        _buildInput(
                          theme,
                          localeProvider,
                          controller: _emailCtrl,
                          labelKey: 'extracted.email',
                          keyboardType: TextInputType.emailAddress,
                        ),
                        const SizedBox(height: 8),
                        _buildInput(
                          theme,
                          localeProvider,
                          controller: _fatherNameCtrl,
                          labelKey: 'applications.fatherName',
                        ),
                        const SizedBox(height: 8),
                        TextField(
                          controller: _addressCtrl,
                          maxLines: 3,
                          decoration: InputDecoration(
                            labelText: localeProvider.translate(
                              'extracted.address',
                            ),
                            filled: true,
                            fillColor: theme.cardColor.withOpacity(0.03),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            Expanded(
                              child: _buildInput(
                                theme,
                                localeProvider,
                                controller: _ageCtrl,
                                labelKey: 'extracted.age',
                                keyboardType: TextInputType.number,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: _buildGenderDropdown(
                                theme,
                                localeProvider,
                                labelKey: 'extracted.gender',
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        _buildMaritalStatusDropdown(
                          theme,
                          localeProvider,
                          labelKey: 'applications.maritalStatus',
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            Expanded(
                              child: _buildInput(
                                theme,
                                localeProvider,
                                controller: _bankAccountCtrl,
                                labelKey: 'applications.bankAccount',
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: _buildInput(
                                theme,
                                localeProvider,
                                controller: _ifscCtrl,
                                labelKey: 'applications.ifsc',
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        _buildInput(
                          theme,
                          localeProvider,
                          controller: _firReportCtrl,
                          labelKey: 'applications.firReport',
                        ),
                        const SizedBox(height: 8),
                        _buildInput(
                          theme,
                          localeProvider,
                          controller: _medicalReportCtrl,
                          labelKey: 'applications.medicalReport',
                        ),
                        const SizedBox(height: 8),
                        _buildInput(
                          theme,
                          localeProvider,
                          controller: _policeStationCtrl,
                          labelKey: 'applications.policeStation',
                        ),
                        const SizedBox(height: 8),
                        _buildInput(
                          theme,
                          localeProvider,
                          controller: _caseNumberCtrl,
                          labelKey: 'applications.caseNumber',
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    OutlinedButton(
                      onPressed: _saving
                          ? null
                          : () => Navigator.of(context).pop(),
                      style: OutlinedButton.styleFrom(
                        side: BorderSide(
                          color: theme.dividerColor.withOpacity(0.1),
                        ),
                      ),
                      child: Text(localeProvider.translate('extracted.cancel')),
                    ),
                    const SizedBox(width: 12),
                    ElevatedButton.icon(
                      onPressed: _saving ? null : _save,
                      icon: _saving
                          ? const SizedBox(
                              width: 16,
                              height: 16,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.white,
                              ),
                            )
                          : const Icon(Icons.save, size: 16),
                      label: Text(localeProvider.translate('extracted.save')),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: theme.primaryColor,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(
                          vertical: 12,
                          horizontal: 18,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
