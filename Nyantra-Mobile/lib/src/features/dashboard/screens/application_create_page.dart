// ignore_for_file: use_build_context_synchronously, deprecated_member_use

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/models/application_model.dart';
import '../../../core/services/data_service.dart';
import '../../../core/providers/locale_provider.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

// PoA Act Offences Data Structure
const Map<String, Map<String, dynamic>> poaOffences = {
  "1. Offences leading to Death / Murder": {
    "Murder of SC/ST person": 825000,
    "Death due to injury inflicted during atrocity": 825000,
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
  },
};

class ApplicationCreatePage extends StatefulWidget {
  const ApplicationCreatePage({super.key});

  @override
  State<ApplicationCreatePage> createState() => _ApplicationCreatePageState();
}

class _ApplicationCreatePageState extends State<ApplicationCreatePage> {
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

  Future<void> _saveApplication() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _saving = true);

    try {
      final user = FirebaseAuth.instance.currentUser;
      if (user == null) throw Exception('User not authenticated');

      final application = ApplicationModel(
        id: '',
        userId: user.uid,
        beneficiaryId: _beneficiaryIdCtrl.text.trim(),
        applicantName: _applicantNameCtrl.text.trim(),
        contactNumber: _contactNumberCtrl.text.trim(),
        contactEmail: _emailCtrl.text.trim(),
        aadhaar: _aadhaarCtrl.text.trim(),
        fatherName: _fatherNameCtrl.text.trim(),
        address: _addressCtrl.text.trim(),
        district: _districtCtrl.text.trim(),
        state: _stateCtrl.text.trim(),
        incidentDate: _incidentDateCtrl.text.trim(),
        amount: double.tryParse(_amountCtrl.text) ?? 0,
        priority: _priorityCtrl.text.trim(),
        caseNumber: _caseNumberCtrl.text.trim(),
        category: _categoryCtrl.text.trim(),
        age: int.tryParse(_ageCtrl.text) ?? 0,
        gender: _selectedGender ?? 'M',
        maritalStatus: _maritalStatusCtrl.text.trim(),
        bankAccount: _bankAccountCtrl.text.trim(),
        bankIfsc: _ifscCtrl.text.trim(),
        firReport: _firReportCtrl.text.trim(),
        medicalReport: _medicalReportCtrl.text.trim(),
        policeStation: _policeStationCtrl.text.trim(),
        actType: _selectedActType ?? 'PCR Act',
        offenceCategory: _selectedOffenceCategory,
        offenceType: _selectedOffenceType,
        status: ApplicationStatus.pending,
        applicationDate: DateTime.now(),
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );

      await DataService.createApplication(application);

      if (mounted) {
        final locale = context.read<LocaleProvider>();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(locale.translate('extracted.applicationCreated')),
            backgroundColor: Colors.green,
          ),
        );
        Navigator.of(context).pop();
      }
    } catch (e) {
      if (mounted) {
        final locale = context.read<LocaleProvider>();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              locale.translate('extracted.errorCreatingApplication'),
            ),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _saving = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final localeProvider = context.watch<LocaleProvider>();
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      appBar: AppBar(
        backgroundColor: theme.appBarTheme.backgroundColor,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: theme.iconTheme.color),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          localeProvider.translate('applications.newApplication'),
          style: theme.textTheme.titleLarge?.copyWith(
            color: theme.textTheme.titleLarge?.color,
            fontWeight: FontWeight.w600,
          ),
        ),
        actions: [
          TextButton(
            onPressed: _saving ? null : _saveApplication,
            child: _saving
                ? SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(
                        theme.primaryColor,
                      ),
                    ),
                  )
                : Text(
                    localeProvider.translate('common.save'),
                    style: TextStyle(
                      color: theme.primaryColor,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
          ),
        ],
      ),
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: isDark
                ? [
                    theme.scaffoldBackgroundColor,
                    theme.scaffoldBackgroundColor.withOpacity(0.8),
                  ]
                : [
                    theme.scaffoldBackgroundColor,
                    theme.scaffoldBackgroundColor.withOpacity(0.9),
                  ],
          ),
        ),
        child: SafeArea(
          child: Form(
            key: _formKey,
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header Section
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
                                        Icons.add_circle_outline,
                                        color: Colors.white,
                                        size: 16,
                                      ),
                                      const SizedBox(width: 6),
                                      Text(
                                        localeProvider.translate(
                                          'applications.newApplication',
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
                                    'applications.createNewApplication',
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
                                    'applications.fillDetailsBelow',
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

                  const SizedBox(height: 32),

                  // Form Fields
                  _buildFormSection(
                    localeProvider.translate(
                      'applications.beneficiaryInformation',
                    ),
                    [
                      _buildBeneficiaryIdField(),
                      _buildTextField(
                        _applicantNameCtrl,
                        localeProvider.translate('applications.applicantName'),
                        Icons.person,
                        validator: (value) => value?.isEmpty ?? true
                            ? localeProvider.translate(
                                'extracted.requiredField',
                              )
                            : null,
                      ),
                      _buildTextField(
                        _fatherNameCtrl,
                        localeProvider.translate('applications.fatherName'),
                        Icons.family_restroom,
                      ),
                      _buildDropdownField(
                        _selectedGender,
                        ['M', 'F', 'O'],
                        localeProvider.translate('applications.gender'),
                        Icons.wc,
                        (value) => setState(() => _selectedGender = value),
                        displayMapper: (value) => value == 'M'
                            ? localeProvider.translate('applications.male')
                            : value == 'F'
                            ? localeProvider.translate('applications.female')
                            : localeProvider.translate('applications.other'),
                      ),
                      _buildTextField(
                        _ageCtrl,
                        localeProvider.translate('applications.age'),
                        Icons.calendar_today,
                        keyboardType: TextInputType.number,
                      ),
                      _buildDropdownField(
                        _selectedMaritalStatus,
                        ['Single', 'Married', 'Divorced', 'Widowed'],
                        localeProvider.translate('applications.maritalStatus'),
                        Icons.favorite,
                        (value) => setState(
                          () => _maritalStatusCtrl.text = value ?? '',
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 24),

                  _buildFormSection(
                    localeProvider.translate('applications.contactInformation'),
                    [
                      _buildTextField(
                        _contactNumberCtrl,
                        localeProvider.translate('applications.contactNumber'),
                        Icons.phone,
                        keyboardType: TextInputType.phone,
                        validator: (value) => value?.isEmpty ?? true
                            ? localeProvider.translate(
                                'extracted.requiredField',
                              )
                            : null,
                      ),
                      _buildTextField(
                        _emailCtrl,
                        localeProvider.translate('applications.email'),
                        Icons.email,
                        keyboardType: TextInputType.emailAddress,
                      ),
                      _buildTextField(
                        _aadhaarCtrl,
                        localeProvider.translate('applications.aadhaarNumber'),
                        Icons.credit_card,
                        keyboardType: TextInputType.number,
                      ),
                      _buildTextField(
                        _addressCtrl,
                        localeProvider.translate('applications.address'),
                        Icons.location_on,
                        maxLines: 3,
                      ),
                      _buildTextField(
                        _districtCtrl,
                        localeProvider.translate('applications.district'),
                        Icons.location_city,
                      ),
                      _buildTextField(
                        _stateCtrl,
                        localeProvider.translate('applications.state'),
                        Icons.map,
                      ),
                    ],
                  ),

                  const SizedBox(height: 24),

                  _buildFormSection(
                    localeProvider.translate('applications.incidentDetails'),
                    [
                      _buildDropdownField(
                        _selectedActType,
                        ['PCR Act', 'PoA Act'],
                        localeProvider.translate('applications.actType'),
                        Icons.gavel,
                        (value) => setState(() => _selectedActType = value),
                      ),
                      _buildOffenceCategoryField(),
                      _buildOffenceTypeField(),
                      _buildTextField(
                        _incidentDateCtrl,
                        localeProvider.translate('applications.incidentDate'),
                        Icons.event,
                        readOnly: true,
                        onTap: () async {
                          final date = await showDatePicker(
                            context: context,
                            initialDate: DateTime.now(),
                            firstDate: DateTime(2000),
                            lastDate: DateTime.now(),
                          );
                          if (date != null) {
                            _incidentDateCtrl.text = date.toString().split(
                              ' ',
                            )[0];
                          }
                        },
                      ),
                      _buildTextField(
                        _caseNumberCtrl,
                        localeProvider.translate('applications.caseNumber'),
                        Icons.numbers,
                      ),
                      _buildTextField(
                        _policeStationCtrl,
                        localeProvider.translate('applications.policeStation'),
                        Icons.local_police,
                      ),
                      _buildTextField(
                        _firReportCtrl,
                        localeProvider.translate('applications.firReport'),
                        Icons.description,
                      ),
                      _buildTextField(
                        _medicalReportCtrl,
                        localeProvider.translate('applications.medicalReport'),
                        Icons.medical_services,
                      ),
                    ],
                  ),

                  const SizedBox(height: 24),

                  _buildFormSection(
                    localeProvider.translate(
                      'applications.financialInformation',
                    ),
                    [
                      _buildTextField(
                        _amountCtrl,
                        localeProvider.translate('applications.amount'),
                        Icons.currency_rupee,
                        keyboardType: TextInputType.number,
                        validator: (value) => value?.isEmpty ?? true
                            ? localeProvider.translate(
                                'extracted.requiredField',
                              )
                            : null,
                      ),
                      _buildDropdownField(
                        _priorityCtrl.text,
                        ['low', 'medium', 'high'],
                        localeProvider.translate('applications.priority'),
                        Icons.priority_high,
                        (value) => setState(
                          () => _priorityCtrl.text = value ?? 'medium',
                        ),
                        displayMapper: (value) => localeProvider.translate(
                          'applications.${value}Priority',
                        ),
                      ),
                      _buildTextField(
                        _bankAccountCtrl,
                        localeProvider.translate('applications.bankAccount'),
                        Icons.account_balance,
                        keyboardType: TextInputType.number,
                      ),
                      _buildTextField(
                        _ifscCtrl,
                        localeProvider.translate('applications.ifsc'),
                        Icons.account_balance_wallet,
                      ),
                    ],
                  ),

                  const SizedBox(height: 40),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildFormSection(String title, List<Widget> children) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

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
            color: (isDark ? Colors.white : Colors.black).withOpacity(0.05),
            blurRadius: 10,
            spreadRadius: 0,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: isDark
                    ? [
                        theme.cardColor.withOpacity(0.8),
                        theme.cardColor.withOpacity(0.6),
                      ]
                    : [
                        theme.cardColor.withOpacity(0.9),
                        theme.cardColor.withOpacity(0.7),
                      ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(16),
                topRight: Radius.circular(16),
              ),
            ),
            child: Text(
              title,
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
                color: theme.textTheme.titleMedium?.color,
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(children: children),
          ),
        ],
      ),
    ).animate().fadeIn(duration: 600.ms).slideY(begin: 0.1, end: 0);
  }

  Widget _buildTextField(
    TextEditingController controller,
    String label,
    IconData icon, {
    TextInputType? keyboardType,
    int maxLines = 1,
    bool readOnly = false,
    VoidCallback? onTap,
    String? Function(String?)? validator,
  }) {
    final theme = Theme.of(context);

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      child: TextFormField(
        controller: controller,
        keyboardType: keyboardType,
        maxLines: maxLines,
        readOnly: readOnly,
        onTap: onTap,
        validator: validator,
        style: theme.textTheme.bodyMedium,
        decoration: InputDecoration(
          labelText: label,
          prefixIcon: Icon(icon, color: theme.iconTheme.color),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: theme.dividerColor),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: theme.dividerColor.withOpacity(0.5)),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: theme.primaryColor, width: 2),
          ),
          filled: true,
          fillColor: theme.inputDecorationTheme.fillColor,
          contentPadding: const EdgeInsets.all(16),
        ),
      ),
    );
  }

  Widget _buildDropdownField<T>(
    T? value,
    List<T> items,
    String label,
    IconData icon,
    Function(T?) onChanged, {
    String Function(T)? displayMapper,
  }) {
    final theme = Theme.of(context);

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      child: DropdownButtonFormField<T>(
        value: value,
        items: items.map((item) {
          return DropdownMenuItem<T>(
            value: item,
            child: Text(displayMapper?.call(item) ?? item.toString()),
          );
        }).toList(),
        onChanged: onChanged,
        style: theme.textTheme.bodyMedium,
        decoration: InputDecoration(
          labelText: label,
          prefixIcon: Icon(icon, color: theme.iconTheme.color),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: theme.dividerColor),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: theme.dividerColor.withOpacity(0.5)),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: theme.primaryColor, width: 2),
          ),
          filled: true,
          fillColor: theme.inputDecorationTheme.fillColor,
          contentPadding: const EdgeInsets.all(16),
        ),
      ),
    );
  }

  Widget _buildBeneficiaryIdField() {
    final theme = Theme.of(context);
    final localeProvider = context.watch<LocaleProvider>();

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          TextFormField(
            controller: _beneficiaryIdCtrl,
            style: theme.textTheme.bodyMedium,
            decoration: InputDecoration(
              labelText: localeProvider.translate('applications.beneficiaryId'),
              prefixIcon: Icon(Icons.badge, color: theme.iconTheme.color),
              suffixIcon: _checkingBeneficiary
                  ? SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation<Color>(
                          theme.primaryColor,
                        ),
                      ),
                    )
                  : _beneficiaryValid
                  ? Icon(Icons.check_circle, color: Colors.green)
                  : _beneficiaryError != null
                  ? Icon(Icons.error, color: Colors.red)
                  : null,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: theme.dividerColor),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(
                  color: _beneficiaryError != null
                      ? Colors.red
                      : _beneficiaryValid
                      ? Colors.green
                      : theme.dividerColor.withOpacity(0.5),
                ),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(
                  color: _beneficiaryError != null
                      ? Colors.red
                      : theme.primaryColor,
                  width: 2,
                ),
              ),
              filled: true,
              fillColor: theme.inputDecorationTheme.fillColor,
              contentPadding: const EdgeInsets.all(16),
            ),
            onChanged: _validateBeneficiary,
            validator: (value) => value?.isEmpty ?? true
                ? localeProvider.translate('extracted.requiredField')
                : _beneficiaryError,
          ),
          if (_beneficiaryError != null)
            Padding(
              padding: const EdgeInsets.only(top: 8, left: 16),
              child: Text(
                _beneficiaryError!,
                style: theme.textTheme.bodySmall?.copyWith(color: Colors.red),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildOffenceCategoryField() {
    final theme = Theme.of(context);
    final localeProvider = context.watch<LocaleProvider>();

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      child: DropdownButtonFormField<String>(
        value: _selectedOffenceCategory,
        items: poaOffences.keys.map((category) {
          return DropdownMenuItem<String>(
            value: category,
            child: Text(category),
          );
        }).toList(),
        onChanged: (value) {
          setState(() {
            _selectedOffenceCategory = value;
            _selectedOffenceType =
                null; // Reset offence type when category changes
          });
        },
        style: theme.textTheme.bodyMedium,
        decoration: InputDecoration(
          labelText: localeProvider.translate('applications.offenceCategory'),
          prefixIcon: Icon(Icons.category, color: theme.iconTheme.color),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: theme.dividerColor),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: theme.dividerColor.withOpacity(0.5)),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: theme.primaryColor, width: 2),
          ),
          filled: true,
          fillColor: theme.inputDecorationTheme.fillColor,
          contentPadding: const EdgeInsets.all(16),
        ),
      ),
    );
  }

  Widget _buildOffenceTypeField() {
    final theme = Theme.of(context);
    final localeProvider = context.watch<LocaleProvider>();

    if (_selectedOffenceCategory == null) {
      return const SizedBox.shrink();
    }

    final offenceTypes =
        poaOffences[_selectedOffenceCategory!] as Map<String, dynamic>;

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      child: DropdownButtonFormField<String>(
        value: _selectedOffenceType,
        items: offenceTypes.keys.map((offence) {
          return DropdownMenuItem<String>(value: offence, child: Text(offence));
        }).toList(),
        onChanged: (value) {
          setState(() {
            _selectedOffenceType = value;
            // Auto-populate amount based on selected offence
            if (value != null && offenceTypes[value] != null) {
              final amount = offenceTypes[value];
              if (amount is String && amount.contains('-')) {
                // Range amount, take the first value
                _amountCtrl.text = amount.split('-')[0].trim();
              } else if (amount is String) {
                _amountCtrl.text = amount;
              } else if (amount is int) {
                _amountCtrl.text = amount.toString();
              }
            }
          });
        },
        style: theme.textTheme.bodyMedium,
        decoration: InputDecoration(
          labelText: localeProvider.translate('applications.offenceType'),
          prefixIcon: Icon(Icons.warning, color: theme.iconTheme.color),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: theme.dividerColor),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: theme.dividerColor.withOpacity(0.5)),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: theme.primaryColor, width: 2),
          ),
          filled: true,
          fillColor: theme.inputDecorationTheme.fillColor,
          contentPadding: const EdgeInsets.all(16),
        ),
      ),
    );
  }
}
