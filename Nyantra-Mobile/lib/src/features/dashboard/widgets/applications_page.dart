// ignore_for_file: curly_braces_in_flow_control_structures, use_build_context_synchronously, deprecated_member_use, avoid_unnecessary_containers

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
  final _aadhaarCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _districtCtrl = TextEditingController();
  final _stateCtrl = TextEditingController();
  final _actTypeCtrl = TextEditingController();
  final _beneficiaryIdCtrl = TextEditingController();
  final _incidentDateCtrl = TextEditingController();
  final _amountCtrl = TextEditingController();
  final _firReportCtrl = TextEditingController();
  final _medicalReportCtrl = TextEditingController();
  final _policeStationCtrl = TextEditingController();
  final _caseNumberCtrl = TextEditingController();
  bool _saving = false;
  bool _beneficiaryValid = false;
  bool _checkingBeneficiary = false;
  String? _beneficiaryError;

  @override
  void initState() {
    super.initState();
    _beneficiaryValid = false;
    _checkingBeneficiary = false;
    _beneficiaryError = null;
  }

  @override
  void dispose() {
    _applicantNameCtrl.dispose();
    _aadhaarCtrl.dispose();
    _phoneCtrl.dispose();
    _districtCtrl.dispose();
    _stateCtrl.dispose();
    _actTypeCtrl.dispose();
    _beneficiaryIdCtrl.dispose();
    _incidentDateCtrl.dispose();
    _amountCtrl.dispose();
    _firReportCtrl.dispose();
    _medicalReportCtrl.dispose();
    _policeStationCtrl.dispose();
    _caseNumberCtrl.dispose();
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
          if (_aadhaarCtrl.text.isEmpty) {
            _aadhaarCtrl.text = data['aadhaar'] ?? '';
          }
          if (_phoneCtrl.text.isEmpty) {
            _phoneCtrl.text = data['phone'] ?? '';
          }
          if (_districtCtrl.text.isEmpty) {
            _districtCtrl.text = data['district'] ?? '';
          }
          if (_stateCtrl.text.isEmpty) {
            _stateCtrl.text = data['state'] ?? '';
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
        aadhaar: _aadhaarCtrl.text.trim(),
        contactNumber: _phoneCtrl.text.trim(),
        district: _districtCtrl.text.trim(),
        state: _stateCtrl.text.trim(),
        actType: _actTypeCtrl.text.trim(),
        beneficiaryId: _beneficiaryIdCtrl.text.trim(),
        incidentDate: _incidentDateCtrl.text.trim(),
        firReport: _firReportCtrl.text.trim().isNotEmpty
            ? _firReportCtrl.text.trim()
            : null,
        medicalReport: _medicalReportCtrl.text.trim().isNotEmpty
            ? _medicalReportCtrl.text.trim()
            : null,
        policeStation: _policeStationCtrl.text.trim().isNotEmpty
            ? _policeStationCtrl.text.trim()
            : null,
        caseNumber: _caseNumberCtrl.text.trim().isNotEmpty
            ? _caseNumberCtrl.text.trim()
            : null,
        amount: double.tryParse(_amountCtrl.text.trim()),
        status: ApplicationStatus.pending,
        applicationDate: DateTime.now(),
        priority: 'medium',
        ownerId: currentUser.uid,
        userId: currentUser.uid,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
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

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final localeProvider = context.watch<LocaleProvider>();

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Container(
        constraints: const BoxConstraints(maxWidth: 600, maxHeight: 640),
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
                        TextFormField(
                          controller: _applicantNameCtrl,
                          autofocus: true,
                          decoration: InputDecoration(
                            labelText: localeProvider.translate(
                              'extracted.applicant_name',
                            ),
                            filled: true,
                            fillColor: theme.cardColor.withOpacity(0.03),
                            labelStyle: theme.textTheme.bodySmall,
                            contentPadding: const EdgeInsets.symmetric(
                              vertical: 12,
                              horizontal: 12,
                            ),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                          validator: (value) => value?.isEmpty ?? true
                              ? localeProvider.translate('common.required')
                              : null,
                        ),
                        const SizedBox(height: 16),
                        const SizedBox(height: 16),
                        TextFormField(
                          controller: _aadhaarCtrl,
                          decoration: InputDecoration(
                            labelText: localeProvider.translate(
                              'extracted.aadhaar',
                            ),
                            filled: true,
                            fillColor: theme.cardColor.withOpacity(0.03),
                            contentPadding: const EdgeInsets.symmetric(
                              vertical: 12,
                              horizontal: 12,
                            ),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                          validator: (value) => value?.isEmpty ?? true
                              ? localeProvider.translate('common.required')
                              : null,
                        ),
                        const SizedBox(height: 16),
                        const SizedBox(height: 16),
                        TextFormField(
                          controller: _phoneCtrl,
                          decoration: InputDecoration(
                            labelText: localeProvider.translate(
                              'extracted.phone_number',
                            ),
                            filled: true,
                            fillColor: theme.cardColor.withOpacity(0.03),
                            contentPadding: const EdgeInsets.symmetric(
                              vertical: 12,
                              horizontal: 12,
                            ),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                          keyboardType: TextInputType.phone,
                          validator: (value) => value?.isEmpty ?? true
                              ? localeProvider.translate('common.required')
                              : null,
                        ),
                        const SizedBox(height: 16),
                        Row(
                          children: [
                            Expanded(
                              child: TextFormField(
                                controller: _districtCtrl,
                                decoration: InputDecoration(
                                  labelText: localeProvider.translate(
                                    'extracted.district',
                                  ),
                                  filled: true,
                                  fillColor: theme.cardColor.withOpacity(0.03),
                                  contentPadding: const EdgeInsets.symmetric(
                                    vertical: 12,
                                    horizontal: 12,
                                  ),
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                ),
                                validator: (value) => value?.isEmpty ?? true
                                    ? localeProvider.translate(
                                        'common.required',
                                      )
                                    : null,
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: TextFormField(
                                controller: _stateCtrl,
                                decoration: InputDecoration(
                                  labelText: localeProvider.translate(
                                    'extracted.state',
                                  ),
                                  filled: true,
                                  fillColor: theme.cardColor.withOpacity(0.03),
                                  contentPadding: const EdgeInsets.symmetric(
                                    vertical: 12,
                                    horizontal: 12,
                                  ),
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                ),
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
                        const SizedBox(height: 16),
                        TextFormField(
                          controller: _actTypeCtrl,
                          decoration: InputDecoration(
                            labelText: localeProvider.translate(
                              'extracted.act_type',
                            ),
                            filled: true,
                            fillColor: theme.cardColor.withOpacity(0.03),
                            contentPadding: const EdgeInsets.symmetric(
                              vertical: 12,
                              horizontal: 12,
                            ),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                          validator: (value) => value?.isEmpty ?? true
                              ? localeProvider.translate('common.required')
                              : null,
                        ),
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
                        const SizedBox(height: 16),
                        const SizedBox(height: 16),
                        TextFormField(
                          controller: _incidentDateCtrl,
                          decoration: InputDecoration(
                            labelText: localeProvider.translate(
                              'extracted.incidentDateHint',
                            ),
                            filled: true,
                            fillColor: theme.cardColor.withOpacity(0.03),
                            contentPadding: const EdgeInsets.symmetric(
                              vertical: 12,
                              horizontal: 12,
                            ),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),

                        // Case Details Section
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: theme.primaryColor.withOpacity(0.05),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                              color: theme.primaryColor.withOpacity(0.2),
                            ),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                localeProvider.translate(
                                  'applications.caseDetails',
                                ),
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w600,
                                  color: theme.primaryColor,
                                ),
                              ),
                              const SizedBox(height: 16),
                              TextFormField(
                                controller: _firReportCtrl,
                                decoration: InputDecoration(
                                  labelText: localeProvider.translate(
                                    'applications.firReport',
                                  ),
                                  hintText: localeProvider.translate(
                                    'applications.enterFirReport',
                                  ),
                                  filled: true,
                                  fillColor: theme.cardColor.withOpacity(0.03),
                                  contentPadding: const EdgeInsets.symmetric(
                                    vertical: 12,
                                    horizontal: 12,
                                  ),
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                ),
                                maxLines: 3,
                              ),
                              const SizedBox(height: 16),
                              TextFormField(
                                controller: _medicalReportCtrl,
                                decoration: InputDecoration(
                                  labelText: localeProvider.translate(
                                    'applications.medicalReport',
                                  ),
                                  hintText: localeProvider.translate(
                                    'applications.enterMedicalReport',
                                  ),
                                  filled: true,
                                  fillColor: theme.cardColor.withOpacity(0.03),
                                  contentPadding: const EdgeInsets.symmetric(
                                    vertical: 12,
                                    horizontal: 12,
                                  ),
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                ),
                                maxLines: 3,
                              ),
                              const SizedBox(height: 16),
                              TextFormField(
                                controller: _policeStationCtrl,
                                decoration: InputDecoration(
                                  labelText: localeProvider.translate(
                                    'applications.policeStation',
                                  ),
                                  hintText: localeProvider.translate(
                                    'applications.enterPoliceStation',
                                  ),
                                  filled: true,
                                  fillColor: theme.cardColor.withOpacity(0.03),
                                  contentPadding: const EdgeInsets.symmetric(
                                    vertical: 12,
                                    horizontal: 12,
                                  ),
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                ),
                              ),
                              const SizedBox(height: 16),
                              TextFormField(
                                controller: _caseNumberCtrl,
                                decoration: InputDecoration(
                                  labelText: localeProvider.translate(
                                    'applications.caseNumber',
                                  ),
                                  hintText: localeProvider.translate(
                                    'applications.enterCaseNumber',
                                  ),
                                  filled: true,
                                  fillColor: theme.cardColor.withOpacity(0.03),
                                  contentPadding: const EdgeInsets.symmetric(
                                    vertical: 12,
                                    horizontal: 12,
                                  ),
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                ),
                              ),
                              const SizedBox(height: 16),
                            ],
                          ),
                        ),
                        const SizedBox(height: 16),

                        const SizedBox(height: 16),
                        TextFormField(
                          controller: _amountCtrl,
                          decoration: InputDecoration(
                            labelText: localeProvider.translate(
                              'applications.amountRequested',
                            ),
                            filled: true,
                            fillColor: theme.cardColor.withOpacity(0.03),
                            contentPadding: const EdgeInsets.symmetric(
                              vertical: 12,
                              horizontal: 12,
                            ),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                          keyboardType: TextInputType.number,
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
