// ignore_for_file: deprecated_member_use, curly_braces_in_flow_control_structures, annotate_overrides

import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:provider/provider.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/providers/locale_provider.dart';
import '../../../core/providers/auth_provider.dart' as app_auth;
import '../../../core/widgets/loading_state.dart';
import '../../../core/services/data_service.dart';
import '../../../core/models/grievance_model.dart';
import '../../../core/models/beneficiary_model.dart';

class GrievancePage extends StatefulWidget {
  const GrievancePage({super.key});

  @override
  State<GrievancePage> createState() => _GrievancePageState();
}

class _GrievancePageState extends State<GrievancePage> {
  // Form state variables
  final _formKey = GlobalKey<FormState>();
  final _beneficiaryIdController = TextEditingController();
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  String? _selectedCategory;
  String? _selectedPriority;
  BeneficiaryModel? _selectedBeneficiary;
  bool _isValidatingBeneficiary = false;
  bool _isSubmitting = false;

  final List<String> _categoryKeys = [
    'general',
    'paymentIssue',
    'documentation',
    'technicalIssue',
    'serviceQuality',
    'other',
  ];

  final List<String> _priorityKeys = ['low', 'medium', 'high', 'urgent'];

  @override
  void dispose() {
    _beneficiaryIdController.dispose();
    _titleController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _validateBeneficiaryId(String beneficiaryId) async {
    if (beneficiaryId.trim().isEmpty) {
      setState(() {
        _selectedBeneficiary = null;
        _isValidatingBeneficiary = false;
      });
      return;
    }

    setState(() {
      _isValidatingBeneficiary = true;
    });

    try {
      final doc = await FirebaseFirestore.instance
          .collection('beneficiaries')
          .doc(beneficiaryId.trim())
          .get();

      if (doc.exists) {
        final data = doc.data() ?? {};
        final beneficiary = BeneficiaryModel.fromFirestore(data, doc.id);

        setState(() {
          _selectedBeneficiary = beneficiary;
          _isValidatingBeneficiary = false;
        });
      } else {
        setState(() {
          _selectedBeneficiary = null;
          _isValidatingBeneficiary = false;
        });
      }
    } catch (e) {
      setState(() {
        _selectedBeneficiary = null;
        _isValidatingBeneficiary = false;
      });
    }
  }

  Future<void> _submitGrievance() async {
    final localeProvider = context.read<LocaleProvider>();
    if (!_formKey.currentState!.validate()) return;

    if (_selectedBeneficiary == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            localeProvider.translate('grievances.invalidBeneficiaryId'),
          ),
        ),
      );
      return;
    }

    setState(() {
      _isSubmitting = true;
    });

    try {
      final currentUser = context.read<app_auth.AuthProvider>().user;
      if (currentUser == null) throw Exception('User not authenticated');

      final grievance = GrievanceModel(
        id: '',
        beneficiaryId: _selectedBeneficiary!.id,
        userId: currentUser.uid,
        beneficiaryName: _selectedBeneficiary!.name,
        phone: _selectedBeneficiary!.phone,
        email: null,
        district: _selectedBeneficiary!.district,
        state: _selectedBeneficiary!.state,
        actType: _selectedBeneficiary!.actType,
        applicationId: null,
        category: _selectedCategory,
        subCategory: null,
        priority: _selectedPriority,
        status: GrievanceStatus.open,
        assignedTo: null,
        assignedDate: null,
        createdDate: DateTime.now(),
        lastUpdated: null,
        resolvedDate: null,
        expectedResolution: null,
        title: _titleController.text.trim(),
        description: _descriptionController.text.trim(),
        attachments: 0,
        communication: [],
        escalationLevel: 0,
        satisfactionRating: null,
        followUpRequired: false,
        relatedGrievances: [],
      );

      await DataService.createGrievance(grievance);

      // reset
      _beneficiaryIdController.clear();
      _titleController.clear();
      _descriptionController.clear();
      setState(() {
        _selectedCategory = null;
        _selectedPriority = null;
        _selectedBeneficiary = null;
      });

      if (mounted) {
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              localeProvider.translate('grievances.grievanceSubmitted'),
            ),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              '${localeProvider.translate('grievances.failedToSubmitGrievance')}: $e',
            ),
          ),
        );
      }
    } finally {
      setState(() {
        _isSubmitting = false;
      });
    }
  }

  void _showAddGrievanceDialog() {
    final localeProvider = context.read<LocaleProvider>();
    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          title: Text(
            localeProvider.translate('grievances.submitNewGrievance'),
          ),
          content: SingleChildScrollView(
            child: Form(
              key: _formKey,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextFormField(
                    controller: _beneficiaryIdController,
                    decoration: InputDecoration(
                      labelText: localeProvider.translate(
                        'grievances.beneficiaryIdRequired',
                      ),
                      hintText: localeProvider.translate(
                        'grievances.enterBeneficiaryId',
                      ),
                      suffixIcon: _isValidatingBeneficiary
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : _selectedBeneficiary != null
                          ? const Icon(Icons.check_circle, color: Colors.green)
                          : null,
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return localeProvider.translate(
                          'grievances.beneficiaryIdRequiredError',
                        );
                      }
                      if (_selectedBeneficiary == null) {
                        return localeProvider.translate(
                          'grievances.invalidBeneficiaryId',
                        );
                      }
                      return null;
                    },
                    onChanged: (value) => _validateBeneficiaryId(value),
                  ),
                  const SizedBox(height: 16),

                  if (_selectedBeneficiary != null) ...[
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.green.withValues(alpha: 0.06),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: Colors.green.withValues(alpha: 0.12),
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            localeProvider.translate(
                              'grievances.beneficiaryDetails',
                            ),
                            style: Theme.of(context).textTheme.titleSmall
                                ?.copyWith(fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            '${localeProvider.translate('grievances.name')}: ${_selectedBeneficiary!.name}',
                          ),
                          if (_selectedBeneficiary!.phone != null)
                            Text(
                              '${localeProvider.translate('grievances.phone')}: ${_selectedBeneficiary!.phone}',
                            ),
                          if (_selectedBeneficiary!.district != null)
                            Text(
                              '${localeProvider.translate('grievances.district')}: ${_selectedBeneficiary!.district}',
                            ),
                          if (_selectedBeneficiary!.state != null)
                            Text(
                              '${localeProvider.translate('grievances.state')}: ${_selectedBeneficiary!.state}',
                            ),
                          if (_selectedBeneficiary!.actType != null)
                            Text(
                              '${localeProvider.translate('grievances.actType')}: ${_selectedBeneficiary!.actType}',
                            ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],

                  TextFormField(
                    controller: _titleController,
                    decoration: InputDecoration(
                      labelText: localeProvider.translate(
                        'grievances.titleRequired',
                      ),
                      hintText: localeProvider.translate(
                        'grievances.briefTitleHint',
                      ),
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return localeProvider.translate(
                          'grievances.titleRequiredError',
                        );
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),

                  DropdownButtonFormField<String>(
                    value: _selectedCategory,
                    decoration: InputDecoration(
                      labelText: localeProvider.translate(
                        'grievances.categoryRequired',
                      ),
                      hintText: localeProvider.translate(
                        'grievances.selectCategoryHint',
                      ),
                    ),
                    items: _categoryKeys.map((categoryKey) {
                      return DropdownMenuItem(
                        value: categoryKey,
                        child: Text(
                          localeProvider.translate(
                            'grievances.categories.$categoryKey',
                          ),
                        ),
                      );
                    }).toList(),
                    onChanged: (value) {
                      setState(() {
                        _selectedCategory = value;
                      });
                    },
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return localeProvider.translate(
                          'grievances.categoryRequiredError',
                        );
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),

                  DropdownButtonFormField<String>(
                    value: _selectedPriority,
                    decoration: InputDecoration(
                      labelText: localeProvider.translate(
                        'grievances.priorityRequired',
                      ),
                      hintText: localeProvider.translate(
                        'grievances.selectPriorityHint',
                      ),
                    ),
                    items: _priorityKeys.map((priorityKey) {
                      return DropdownMenuItem(
                        value: priorityKey,
                        child: Text(
                          localeProvider.translate(
                            'grievances.priorities.$priorityKey',
                          ),
                        ),
                      );
                    }).toList(),
                    onChanged: (value) {
                      setState(() {
                        _selectedPriority = value;
                      });
                    },
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return localeProvider.translate(
                          'grievances.priorityRequiredError',
                        );
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),

                  TextFormField(
                    controller: _descriptionController,
                    decoration: InputDecoration(
                      labelText: localeProvider.translate(
                        'grievances.descriptionRequired',
                      ),
                      hintText: localeProvider.translate(
                        'grievances.detailedDescriptionHint',
                      ),
                    ),
                    maxLines: 4,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return localeProvider.translate(
                          'grievances.descriptionRequiredError',
                        );
                      }
                      return null;
                    },
                  ),
                ],
              ),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: Text(localeProvider.translate('grievances.cancel')),
            ),
            ElevatedButton(
              onPressed: _isSubmitting ? null : _submitGrievance,
              child: _isSubmitting
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : Text(localeProvider.translate('grievances.submit')),
            ),
          ],
        ),
      ),
    );
  }

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
                                      Icons.report_problem,
                                      color: Colors.white,
                                      size: 16,
                                    ),
                                    const SizedBox(width: 6),
                                    Text(
                                      localeProvider.translate(
                                        'grievances.pageTitle',
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

                          // Add-grievance button in header
                          Align(
                            alignment: Alignment.topRight,
                            child: IconButton(
                              tooltip: localeProvider.translate(
                                'grievances.addGrievance',
                              ),
                              icon: const Icon(Icons.add, color: Colors.white),
                              onPressed: _showAddGrievanceDialog,
                            ),
                          ),

                          const SizedBox(height: 16),

                          // Title
                          Text(
                                localeProvider.translate(
                                  'grievances.pageTitle',
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
                                  'grievances.pageSubtitle',
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

                // Grievances List
                Expanded(
                  child: Container(
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
                            decoration: InputDecoration(
                              hintText: localeProvider.translate(
                                'grievances.searchGrievances',
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
                            style: theme.textTheme.bodyMedium,
                          ),
                        ),

                        // Grievances Grid/List Content
                        Expanded(
                          child: StreamBuilder<List<GrievanceModel>>(
                            stream: DataService.getGrievances(),
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
                                        color: theme.textTheme.bodyMedium?.color
                                            ?.withOpacity(0.7),
                                      ),
                                      const SizedBox(height: 16),
                                      Text(
                                        localeProvider.translate(
                                          'grievances.errorLoadingGrievances',
                                        ),
                                        style: theme.textTheme.headlineSmall,
                                      ),
                                      const SizedBox(height: 8),
                                      Text(
                                        '${snapshot.error}',
                                        style: theme.textTheme.bodyMedium
                                            ?.copyWith(
                                              color: theme
                                                  .textTheme
                                                  .bodySmall
                                                  ?.color,
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
                                        localeProvider.translate(
                                          'grievances.noGrievances',
                                        ),
                                        style: theme.textTheme.headlineSmall,
                                        textAlign: TextAlign.center,
                                      ),
                                      const SizedBox(height: 8),
                                      Text(
                                        localeProvider.translate(
                                          'grievances.noGrievancesDescription',
                                        ),
                                        style: theme.textTheme.bodyMedium
                                            ?.copyWith(
                                              color: theme
                                                  .textTheme
                                                  .bodySmall
                                                  ?.color,
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
                                          borderRadius: BorderRadius.circular(
                                            12,
                                          ),
                                          border: Border.all(
                                            color: theme.dividerColor
                                                .withValues(alpha: 77),
                                          ),
                                        ),
                                        child: Column(
                                          children: [
                                            Text(
                                              localeProvider.translate(
                                                'grievances.firebaseInstruction',
                                              ),
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
                                                color: theme
                                                    .scaffoldBackgroundColor,
                                                borderRadius:
                                                    BorderRadius.circular(8),
                                              ),
                                              child: SelectableText(
                                                currentUser?.uid ??
                                                    localeProvider.translate(
                                                      'grievances.noUserId',
                                                    ),
                                                style: theme.textTheme.bodySmall
                                                    ?.copyWith(
                                                      fontFamily: 'monospace',
                                                      fontWeight:
                                                          FontWeight.w600,
                                                    ),
                                                textAlign: TextAlign.center,
                                              ),
                                            ),
                                            const SizedBox(height: 12),
                                            Text(
                                              '${localeProvider.translate('grievances.firebaseConsoleInstruction')} "${currentUser?.uid ?? 'your-user-id'}"',
                                              style: theme.textTheme.bodySmall,
                                              textAlign: TextAlign.center,
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                ).animate().fadeIn(
                                  duration: 600.ms,
                                  delay: 300.ms,
                                );
                              }

                              return ListView.builder(
                                padding: const EdgeInsets.all(16),
                                itemCount: grievances.length,
                                itemBuilder: (context, index) {
                                  final grievance = grievances[index];
                                  return Container(
                                        margin: const EdgeInsets.only(
                                          bottom: 16,
                                        ),
                                        decoration: BoxDecoration(
                                          color: theme.cardColor,
                                          borderRadius: BorderRadius.circular(
                                            16,
                                          ),
                                          border: Border.all(
                                            color: theme.dividerColor
                                                .withOpacity(0.1),
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
                                        child: InkWell(
                                          onTap: () {
                                            Navigator.of(context).push(
                                              MaterialPageRoute(
                                                builder: (_) =>
                                                    GrievanceDetailsScreen(
                                                      grievance: grievance,
                                                    ),
                                              ),
                                            );
                                          },
                                          borderRadius: BorderRadius.circular(
                                            16,
                                          ),
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
                                                                const EdgeInsets.all(
                                                                  8,
                                                                ),
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
                                                                  ? Icons
                                                                        .check_circle
                                                                  : grievance
                                                                            .status ==
                                                                        GrievanceStatus
                                                                            .inProgress
                                                                  ? Icons
                                                                        .hourglass_top
                                                                  : grievance
                                                                            .status ==
                                                                        GrievanceStatus
                                                                            .closed
                                                                  ? Icons.cancel
                                                                  : Icons
                                                                        .report_problem,
                                                              color: grievance
                                                                  .statusColor,
                                                              size: 16,
                                                            ),
                                                          ),
                                                          const SizedBox(
                                                            width: 12,
                                                          ),
                                                          Expanded(
                                                            child: Column(
                                                              crossAxisAlignment:
                                                                  CrossAxisAlignment
                                                                      .start,
                                                              children: [
                                                                Text(
                                                                  grievance
                                                                          .title ??
                                                                      localeProvider
                                                                          .translate(
                                                                            'grievances.untitledGrievance',
                                                                          ),
                                                                  style: theme
                                                                      .textTheme
                                                                      .titleMedium
                                                                      ?.copyWith(
                                                                        fontWeight:
                                                                            FontWeight.w600,
                                                                      ),
                                                                ),
                                                                const SizedBox(
                                                                  height: 4,
                                                                ),
                                                                Text(
                                                                  '${localeProvider.translate('grievances.idLabel')} ${grievance.id}',
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
                                                        ],
                                                      ),
                                                    ),
                                                    Column(
                                                      crossAxisAlignment:
                                                          CrossAxisAlignment
                                                              .end,
                                                      children: [
                                                        Container(
                                                          padding:
                                                              const EdgeInsets.symmetric(
                                                                horizontal: 10,
                                                                vertical: 5,
                                                              ),
                                                          decoration: BoxDecoration(
                                                            color: grievance
                                                                .statusColor,
                                                            borderRadius:
                                                                BorderRadius.circular(
                                                                  16,
                                                                ),
                                                          ),
                                                          child: Text(
                                                            grievance
                                                                .statusText,
                                                            style: TextStyle(
                                                              color:
                                                                  Colors.white,
                                                              fontSize: 11,
                                                              fontWeight:
                                                                  FontWeight
                                                                      .w700,
                                                            ),
                                                          ),
                                                        ),
                                                        if (grievance
                                                                .priority !=
                                                            null) ...[
                                                          const SizedBox(
                                                            height: 8,
                                                          ),
                                                          Text(
                                                            '${localeProvider.translate('grievances.priorityLabel')} ${localeProvider.translate('grievances.priorities.${grievance.priority}')}',
                                                            style: theme
                                                                .textTheme
                                                                .bodySmall
                                                                ?.copyWith(
                                                                  fontWeight:
                                                                      FontWeight
                                                                          .w500,
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
                                                      localeProvider.translate(
                                                        'grievances.noDescription',
                                                      ),
                                                  style: theme
                                                      .textTheme
                                                      .bodyMedium
                                                      ?.copyWith(height: 1.4),
                                                  maxLines: 2,
                                                  overflow:
                                                      TextOverflow.ellipsis,
                                                ),

                                                const SizedBox(height: 16),

                                                // Details row
                                                Row(
                                                  children: [
                                                    Expanded(
                                                      child: _buildDetailItem(
                                                        context,
                                                        Icons.calendar_today,
                                                        localeProvider
                                                            .translate(
                                                              'grievances.date',
                                                            ),
                                                        grievance.createdDate
                                                                ?.toString()
                                                                .split(
                                                                  ' ',
                                                                )[0] ??
                                                            localeProvider
                                                                .translate(
                                                                  'grievances.notAvailable',
                                                                ),
                                                      ),
                                                    ),
                                                    Expanded(
                                                      child: _buildDetailItem(
                                                        context,
                                                        Icons.category,
                                                        localeProvider.translate(
                                                          'grievances.category',
                                                        ),
                                                        localeProvider.translate(
                                                          'grievances.categories.${grievance.category ?? 'general'}',
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
                                                        Icons.person,
                                                        localeProvider.translate(
                                                          'grievances.userId',
                                                        ),
                                                        grievance.userId ??
                                                            localeProvider
                                                                .translate(
                                                                  'grievances.notAvailable',
                                                                ),
                                                      ),
                                                    ),
                                                    if (grievance
                                                            .resolvedDate !=
                                                        null)
                                                      Expanded(
                                                        child: _buildDetailItem(
                                                          context,
                                                          Icons.check_circle,
                                                          localeProvider.translate(
                                                            'grievances.resolved',
                                                          ),
                                                          grievance
                                                              .resolvedDate!
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
                                        delay: Duration(
                                          milliseconds: index * 100,
                                        ),
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

class GrievanceDetailsScreen extends StatefulWidget {
  final GrievanceModel grievance;

  const GrievanceDetailsScreen({super.key, required this.grievance});

  @override
  State<GrievanceDetailsScreen> createState() => _GrievanceDetailsScreenState();
}

class _GrievanceDetailsScreenState extends State<GrievanceDetailsScreen> {
  final _messageCtrl = TextEditingController();
  bool _sending = false;

  @override
  void dispose() {
    _messageCtrl.dispose();
    super.dispose();
  }

  Future<void> _sendMessage() async {
    final text = _messageCtrl.text.trim();
    if (text.isEmpty) return;

    setState(() => _sending = true);

    try {
      final currentUser = context.read<app_auth.AuthProvider>().user;
      if (currentUser == null) throw Exception('Not authenticated');

      final message = {
        'senderId': currentUser.uid,
        'senderRole': 'user',
        'text': text,
        // Use client-side ISO timestamp so it can be stored inside arrayUnion
        'timestamp': DateTime.now().toIso8601String(),
      };

      await DataService.appendGrievanceMessage(widget.grievance.id, message);
      _messageCtrl.clear();
    } catch (e) {
      if (mounted) {
        final localeProvider = context.read<LocaleProvider>();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              '${localeProvider.translate('grievances.failedToSendMessage')}: $e',
            ),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final localeProvider = context.watch<LocaleProvider>();

    if (widget.grievance.id.isEmpty) {
      return Scaffold(
        appBar: AppBar(
          title: Text(localeProvider.translate('grievances.grievanceDetails')),
        ),
        body: Center(
          child: Text(
            localeProvider.translate('grievances.invalidGrievanceId'),
          ),
        ),
      );
    }

    final docRef = FirebaseFirestore.instance
        .collection('grievances')
        .doc(widget.grievance.id);

    return Scaffold(
      appBar: AppBar(
        title: Text(
          widget.grievance.title ??
              localeProvider.translate('grievances.grievanceDetails'),
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: StreamBuilder<DocumentSnapshot>(
              stream: docRef.snapshots(),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }

                if (!snapshot.hasData || !snapshot.data!.exists) {
                  return Center(
                    child: Text(
                      localeProvider.translate('grievances.grievanceNotFound'),
                    ),
                  );
                }

                final data = snapshot.data!.data() as Map<String, dynamic>;
                final comm = List<Map<String, dynamic>>.from(
                  (data['communication'] as List<dynamic>?) ?? [],
                );

                // Sort by timestamp (support Timestamp or ISO timestamp string)
                comm.sort((a, b) {
                  final ta = a['timestamp'];
                  final tb = b['timestamp'];

                  DateTime? da;
                  DateTime? db;

                  if (ta is Timestamp)
                    da = ta.toDate();
                  else if (ta is String) {
                    try {
                      da = DateTime.parse(ta);
                    } catch (_) {
                      da = null;
                    }
                  }

                  if (tb is Timestamp)
                    db = tb.toDate();
                  else if (tb is String) {
                    try {
                      db = DateTime.parse(tb);
                    } catch (_) {
                      db = null;
                    }
                  }

                  if (da != null && db != null) return da.compareTo(db);
                  if (da != null) return 1;
                  if (db != null) return -1;
                  return 0;
                });

                final currentUser = context.read<app_auth.AuthProvider>().user;

                return ListView.builder(
                  padding: const EdgeInsets.all(20),
                  itemCount: comm.length + 1,
                  itemBuilder: (context, index) {
                    if (index == 0) {
                      // Header block with basic grievance info
                      return Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '${localeProvider.translate('grievances.idLabel')} ${widget.grievance.id}',
                            style: theme.textTheme.bodySmall,
                          ),
                          const SizedBox(height: 6),
                          Text(
                            '${localeProvider.translate('grievances.status')}: ${widget.grievance.statusText}',
                            style: theme.textTheme.titleMedium,
                          ),
                          const SizedBox(height: 8),
                        ],
                      );
                    }

                    final msg = comm[index - 1];

                    // Support multiple message shapes used across web and mobile:
                    // - Mobile: { senderId, senderRole, text, timestamp }
                    // - Web: { user, text, createdAt, type }
                    final senderId = msg['senderId'] as String?;
                    String senderRole = 'officer';
                    if (msg.containsKey('senderRole') &&
                        msg['senderRole'] is String) {
                      senderRole = msg['senderRole'] as String;
                    } else if (msg.containsKey('type') &&
                        msg['type'] is String) {
                      senderRole = msg['type'] as String;
                    } else if (msg.containsKey('user') &&
                        msg['user'] is String) {
                      final u = (msg['user'] as String).toLowerCase();
                      if (u == 'you' || u == 'user') senderRole = 'user';
                      if (u == 'officer' || u == 'admin')
                        senderRole = 'officer';
                    }

                    final text =
                        (msg['text'] ?? msg['message'] ?? msg['body'])
                            as String? ??
                        '';
                    final ts = msg['timestamp'] ?? msg['createdAt'];
                    final timeStr = (ts is Timestamp)
                        ? ts.toDate().toString()
                        : (ts is String ? ts : '');

                    bool isMe = false;
                    if (currentUser != null) {
                      if (senderId != null && senderId == currentUser.uid) {
                        isMe = true;
                      } else if (senderRole.toLowerCase() == 'user') {
                        isMe = true;
                      } else if (msg.containsKey('user') &&
                          msg['user'] is String) {
                        final u = msg['user'] as String;
                        final currentName =
                            (currentUser.displayName ?? currentUser.email ?? '')
                                .toString();
                        if (u == 'You' || u == currentName) isMe = true;
                      }
                    }

                    return Container(
                      margin: const EdgeInsets.symmetric(vertical: 6),
                      alignment: isMe
                          ? Alignment.centerRight
                          : Alignment.centerLeft,
                      child: ConstrainedBox(
                        constraints: BoxConstraints(
                          maxWidth: MediaQuery.of(context).size.width * 0.75,
                        ),
                        child: DecoratedBox(
                          decoration: BoxDecoration(
                            color: isMe
                                ? theme.primaryColor.withOpacity(0.9)
                                : theme.cardColor.withOpacity(0.8),
                            borderRadius: isMe
                                ? const BorderRadius.only(
                                    topLeft: Radius.circular(16),
                                    topRight: Radius.circular(16),
                                    bottomLeft: Radius.circular(16),
                                    bottomRight: Radius.circular(4),
                                  )
                                : const BorderRadius.only(
                                    topLeft: Radius.circular(16),
                                    topRight: Radius.circular(16),
                                    bottomLeft: Radius.circular(4),
                                    bottomRight: Radius.circular(16),
                                  ),
                            border: Border.all(
                              color: theme.dividerColor.withOpacity(0.1),
                            ),
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(10),
                            child: Column(
                              crossAxisAlignment: isMe
                                  ? CrossAxisAlignment.end
                                  : CrossAxisAlignment.start,
                              children: [
                                // Show 'You' for messages from the current user, otherwise show role/name
                                Text(
                                  isMe
                                      ? localeProvider.translate(
                                          'grievances.you',
                                        )
                                      : (senderRole.isNotEmpty
                                            ? (senderRole == 'officer'
                                                  ? localeProvider.translate(
                                                      'grievances.officer',
                                                    )
                                                  : senderRole)
                                            : localeProvider.translate(
                                                'grievances.officer',
                                              )),
                                  style: theme.textTheme.bodySmall?.copyWith(
                                    fontWeight: FontWeight.w700,
                                    color: isMe
                                        ? Colors.white70
                                        : theme.textTheme.bodySmall?.color,
                                  ),
                                ),
                                const SizedBox(height: 6),
                                Align(
                                  alignment: isMe
                                      ? Alignment.centerRight
                                      : Alignment.centerLeft,
                                  child: Text(
                                    text,
                                    style: theme.textTheme.bodyMedium?.copyWith(
                                      color: isMe ? Colors.white : null,
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  timeStr,
                                  style: theme.textTheme.bodySmall?.copyWith(
                                    fontSize: 10,
                                    color: isMe
                                        ? Colors.white70
                                        : theme.textTheme.bodySmall?.color,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ),

          // Input area
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              child: Container(
                decoration: BoxDecoration(
                  color: theme.cardColor.withOpacity(0.8),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: theme.dividerColor.withOpacity(0.1),
                  ),
                ),
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _messageCtrl,
                        decoration: InputDecoration(
                          hintText: localeProvider.translate(
                            'grievances.writeMessageHint',
                          ),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide.none,
                          ),
                          filled: true,
                          fillColor: theme.inputDecorationTheme.fillColor,
                          contentPadding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 12,
                          ),
                        ),
                        minLines: 1,
                        maxLines: 4,
                      ),
                    ),
                    const SizedBox(width: 12),
                    ElevatedButton(
                      onPressed: _sending ? null : _sendMessage,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: theme.primaryColor,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.all(12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: _sending
                          ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.white,
                              ),
                            )
                          : Icon(Icons.send, color: Colors.white),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
