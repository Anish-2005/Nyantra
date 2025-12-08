// ignore_for_file: avoid_print

import 'package:flutter/foundation.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'database_helper.dart';
import 'firebase_service.dart';
import '../models/user_model.dart';
import '../models/application_model.dart';
import '../models/beneficiary_model.dart';
import '../models/disbursement_model.dart';
import '../models/grievance_model.dart';
import '../models/feedback_model.dart';
import '../models/report_model.dart';
import '../providers/sync_status_provider.dart';

class SyncService {
  static SyncService? _instance;
  static DatabaseHelper? _dbHelper;
  static Connectivity? _connectivity;
  static SyncStatusProvider? _syncStatusProvider;

  factory SyncService({SyncStatusProvider? syncStatusProvider}) {
    _instance ??= SyncService._internal();
    if (syncStatusProvider != null) {
      _syncStatusProvider = syncStatusProvider;
    }
    return _instance!;
  }

  static void setSyncStatusProvider(SyncStatusProvider provider) {
    _syncStatusProvider = provider;
  }

  SyncService._internal() {
    _dbHelper = DatabaseHelper();
    _connectivity = Connectivity();
  }

  Future<bool> isOnline() async {
    var connectivityResults = await _connectivity!.checkConnectivity();
    return connectivityResults.isNotEmpty &&
        connectivityResults.any((result) => result != ConnectivityResult.none);
  }

  // Sync data from Firestore to local DB
  Future<void> syncFromFirestore() async {
    if (kIsWeb) return;
    if (!await isOnline()) return;

    final currentUser = FirebaseService.auth.currentUser;
    if (currentUser == null) return;
    try {
      // Sync current user's profile
      final userDoc = await FirebaseService.firestore
          .collection('users')
          .doc(currentUser.uid)
          .get();
      if (userDoc.exists) {
        final user = UserModel.fromFirestore(userDoc.data()!, userDoc.id);
        await _dbHelper!.insertUser(user);
      }

      // Sync user's beneficiaries
      final beneficiariesSnapshot = await FirebaseService.firestore
          .collection('beneficiaries')
          .where('ownerId', isEqualTo: currentUser.uid)
          .get();
      for (var doc in beneficiariesSnapshot.docs) {
        final beneficiary = BeneficiaryModel.fromFirestore(doc.data(), doc.id);
        await _dbHelper!.insertBeneficiary(beneficiary);
      }

      final beneficiaryIds = beneficiariesSnapshot.docs
          .map((doc) => doc.id)
          .toList();

      // Sync applications owned by user or related to user's beneficiaries
      final applicationsQuery1 = await FirebaseService.firestore
          .collection('applications')
          .where('ownerId', isEqualTo: currentUser.uid)
          .get();

      List applications = [...applicationsQuery1.docs];

      if (beneficiaryIds.isNotEmpty) {
        final applicationsQuery2 = await FirebaseService.firestore
            .collection('applications')
            .where('beneficiaryId', whereIn: beneficiaryIds)
            .get();
        applications.addAll(applicationsQuery2.docs);
      }

      // Remove duplicates
      final applicationIds = <String>{};
      final uniqueApplications = applications.where((doc) {
        if (applicationIds.contains(doc.id)) return false;
        applicationIds.add(doc.id);
        return true;
      }).toList();

      for (var doc in uniqueApplications) {
        final application = ApplicationModel.fromFirestore(doc.data(), doc.id);
        await _dbHelper!.insertApplication(application);
      }

      // Sync disbursements for user's applications
      if (applicationIds.isNotEmpty) {
        final disbursementsSnapshot = await FirebaseService.firestore
            .collection('disbursements')
            .where('applicationId', whereIn: applicationIds.toList())
            .get();
        for (var doc in disbursementsSnapshot.docs) {
          final disbursement = DisbursementModel.fromFirestore(
            doc.data(),
            doc.id,
          );
          await _dbHelper!.insertDisbursement(disbursement);
        }
      }

      // Also sync disbursements directly for user's beneficiaries
      if (beneficiaryIds.isNotEmpty) {
        final beneficiaryDisbursementsSnapshot = await FirebaseService.firestore
            .collection('disbursements')
            .where('beneficiaryId', whereIn: beneficiaryIds.take(10))
            .get();
        for (var doc in beneficiaryDisbursementsSnapshot.docs) {
          final disbursement = DisbursementModel.fromFirestore(
            doc.data(),
            doc.id,
          );
          await _dbHelper!.insertDisbursement(disbursement);
        }
      }

      // Sync grievances created by user or related to user's beneficiaries
      final grievancesQuery1 = await FirebaseService.firestore
          .collection('grievances')
          .where('userId', isEqualTo: currentUser.uid)
          .get();

      List grievances = [...grievancesQuery1.docs];

      if (beneficiaryIds.isNotEmpty) {
        final grievancesQuery2 = await FirebaseService.firestore
            .collection('grievances')
            .where('beneficiaryId', whereIn: beneficiaryIds)
            .get();
        grievances.addAll(grievancesQuery2.docs);
      }

      // Remove duplicates
      final grievanceIds = <String>{};
      final uniqueGrievances = grievances.where((doc) {
        if (grievanceIds.contains(doc.id)) return false;
        grievanceIds.add(doc.id);
        return true;
      }).toList();

      for (var doc in uniqueGrievances) {
        final grievance = GrievanceModel.fromFirestore(doc.data(), doc.id);
        await _dbHelper!.insertGrievance(grievance);
      }

      // Sync user's feedback
      final feedbackSnapshot = await FirebaseService.firestore
          .collection('feedback')
          .where('userId', isEqualTo: currentUser.uid)
          .get();
      for (var doc in feedbackSnapshot.docs) {
        final feedback = FeedbackModel.fromMap(doc.id, doc.data());
        await _dbHelper!.insertFeedback(feedback);
      }

      // Sync reports
      print('SyncService: syncFromFirestore - Syncing reports');
      final reportsSnapshot = await FirebaseService.firestore
          .collection('reports')
          .get();
      print(
        'SyncService: syncFromFirestore - Found ${reportsSnapshot.docs.length} reports in Firestore',
      );

      // If no reports exist in Firestore, create some sample reports
      if (reportsSnapshot.docs.isEmpty) {
        print(
          'SyncService: No reports found in Firestore, creating sample reports',
        );

        // Check if sample reports already exist in local DB to avoid duplicates
        final localReports = await _dbHelper!.getReports();
        final hasSampleReports = localReports.any(
          (report) =>
              report.name.contains('Monthly Applications') ||
              report.name.contains('Beneficiary Disbursement') ||
              report.name.contains('Grievance Resolution') ||
              report.name.contains('User Feedback') ||
              report.name.contains('System Performance'),
        );

        if (!hasSampleReports) {
          await _createSampleReports();
        }

        // Re-fetch after creating samples (or if they already exist)
        final updatedReportsSnapshot = await FirebaseService.firestore
            .collection('reports')
            .get();
        for (var doc in updatedReportsSnapshot.docs) {
          final report = Report.fromJson(doc.data(), doc.id);
          await _dbHelper!.insertReport(report);
          print(
            'SyncService: syncFromFirestore - Synced sample report: ${report.name}',
          );
        }
      } else {
        // Sync existing reports from Firestore, but avoid duplicates
        final localReports = await _dbHelper!.getReports();
        final localReportIds = localReports.map((r) => r.id).toSet();

        for (var doc in reportsSnapshot.docs) {
          // Only sync if this report doesn't already exist locally
          if (!localReportIds.contains(doc.id)) {
            final report = Report.fromJson(doc.data(), doc.id);
            await _dbHelper!.insertReport(report);
            print(
              'SyncService: syncFromFirestore - Synced new report: ${report.name}',
            );
          }
        }
      }
    } catch (e) {
      print('Error syncing from Firestore: $e');
    }
  }

  // Create or update beneficiary with sync tracking
  Future<void> createOrUpdateBeneficiary(BeneficiaryModel beneficiary) async {
    await _dbHelper!.upsertWithSync(
      'beneficiaries',
      beneficiary.toJson(),
      markForSync: true,
    );
    await _dbHelper!.insertBeneficiary(beneficiary); // Ensure it's in the DB
    _syncStatusProvider?.incrementPendingSync();

    // Try to sync immediately if online
    if (await isOnline()) {
      try {
        await syncToFirestore();
      } catch (e) {
        print('Error syncing beneficiary immediately: $e');
      }
    }
  }

  // Create or update application with sync tracking
  Future<void> createOrUpdateApplication(ApplicationModel application) async {
    await _dbHelper!.upsertWithSync(
      'applications',
      application.toJson(),
      markForSync: true,
    );
    await _dbHelper!.insertApplication(application); // Ensure it's in the DB
    _syncStatusProvider?.incrementPendingSync();

    // Try to sync immediately if online
    if (await isOnline()) {
      try {
        await syncToFirestore();
      } catch (e) {
        print('Error syncing application immediately: $e');
      }
    }
  }

  // Create or update grievance with sync tracking
  Future<void> createOrUpdateGrievance(GrievanceModel grievance) async {
    await _dbHelper!.upsertWithSync(
      'grievances',
      grievance.toJson(),
      markForSync: true,
    );
    await _dbHelper!.insertGrievance(grievance); // Ensure it's in the DB
    _syncStatusProvider?.incrementPendingSync();

    // Try to sync immediately if online
    if (await isOnline()) {
      try {
        await syncToFirestore();
      } catch (e) {
        print('Error syncing grievance immediately: $e');
      }
    }
  }

  // Create or update feedback with sync tracking
  Future<void> createOrUpdateFeedback(FeedbackModel feedback) async {
    await _dbHelper!.upsertWithSync(
      'feedback',
      feedback.toMap(),
      markForSync: true,
    );
    await _dbHelper!.insertFeedback(feedback); // Ensure it's in the DB
    _syncStatusProvider?.incrementPendingSync();

    // Try to sync immediately if online
    if (await isOnline()) {
      try {
        await syncToFirestore();
      } catch (e) {
        print('Error syncing feedback immediately: $e');
      }
    }
  }

  // Sync local changes to Firestore
  Future<void> syncToFirestore() async {
    if (!await isOnline()) return;

    _syncStatusProvider?.setStatus(SyncStatus.syncing);

    try {
      final currentUser = FirebaseService.auth.currentUser;
      if (currentUser == null) {
        _syncStatusProvider?.setStatus(
          SyncStatus.error,
          error: 'User not authenticated',
        );
        return;
      }

      // Get pending sync count
      final unsyncedBeneficiaries = await _dbHelper!.getRecordsNeedingSync(
        'beneficiaries',
      );
      final unsyncedApplications = await _dbHelper!.getRecordsNeedingSync(
        'applications',
      );
      final unsyncedGrievances = await _dbHelper!.getRecordsNeedingSync(
        'grievances',
      );
      final unsyncedFeedback = await _dbHelper!.getRecordsNeedingSync(
        'feedback',
      );

      final totalPending =
          unsyncedBeneficiaries.length +
          unsyncedApplications.length +
          unsyncedGrievances.length +
          unsyncedFeedback.length;

      _syncStatusProvider?.setPendingSyncCount(totalPending);

      // Sync beneficiaries that need syncing
      for (var beneficiaryData in unsyncedBeneficiaries) {
        try {
          final beneficiary = BeneficiaryModel.fromJson(beneficiaryData);
          if (beneficiary.ownerId == currentUser.uid) {
            await FirebaseService.firestore
                .collection('beneficiaries')
                .doc(beneficiary.id)
                .set(beneficiary.toJson());
            await _dbHelper!.markAsSynced('beneficiaries', beneficiary.id);
            _syncStatusProvider?.decrementPendingSync();
            print(
              'SyncService: syncToFirestore - Synced beneficiary: ${beneficiary.name}',
            );
          }
        } catch (e) {
          print('Error syncing beneficiary ${beneficiaryData['id']}: $e');
        }
      }

      // Sync applications that need syncing
      for (var applicationData in unsyncedApplications) {
        try {
          final application = ApplicationModel.fromJson(applicationData);
          if (application.ownerId == currentUser.uid) {
            await FirebaseService.firestore
                .collection('applications')
                .doc(application.id)
                .set(application.toJson());
            await _dbHelper!.markAsSynced('applications', application.id);
            _syncStatusProvider?.decrementPendingSync();
            print(
              'SyncService: syncToFirestore - Synced application: ${application.id}',
            );
          }
        } catch (e) {
          print('Error syncing application ${applicationData['id']}: $e');
        }
      }

      // Sync grievances that need syncing
      for (var grievanceData in unsyncedGrievances) {
        try {
          final grievance = GrievanceModel.fromJson(grievanceData);
          if (grievance.userId == currentUser.uid) {
            await FirebaseService.firestore
                .collection('grievances')
                .doc(grievance.id)
                .set(grievance.toJson());
            await _dbHelper!.markAsSynced('grievances', grievance.id);
            _syncStatusProvider?.decrementPendingSync();
            print(
              'SyncService: syncToFirestore - Synced grievance: ${grievance.title}',
            );
          }
        } catch (e) {
          print('Error syncing grievance ${grievanceData['id']}: $e');
        }
      }

      // Sync feedback that need syncing
      for (var feedbackData in unsyncedFeedback) {
        try {
          final feedback = FeedbackModel.fromMap(
            feedbackData['id'],
            feedbackData,
          );
          if (feedback.userId == currentUser.uid) {
            await FirebaseService.firestore
                .collection('feedback')
                .doc(feedback.id)
                .set(feedback.toMap());
            await _dbHelper!.markAsSynced('feedback', feedback.id);
            _syncStatusProvider?.decrementPendingSync();
            print(
              'SyncService: syncToFirestore - Synced feedback: ${feedback.id}',
            );
          }
        } catch (e) {
          print('Error syncing feedback ${feedbackData['id']}: $e');
        }
      }

      _syncStatusProvider?.setStatus(SyncStatus.success);
      print('SyncService: syncToFirestore - Upload sync completed');
    } catch (e) {
      _syncStatusProvider?.setStatus(SyncStatus.error, error: e.toString());
      print('Error syncing to Firestore: $e');
    }
  }

  // Get data with fallback to local DB if offline
  Future<List<UserModel>> getUsers() async {
    if (kIsWeb) {
      // On web, fetch directly from Firebase
      try {
        final currentUser = FirebaseService.auth.currentUser;
        if (currentUser == null) return [];
        final userDoc = await FirebaseService.firestore
            .collection('users')
            .doc(currentUser.uid)
            .get();
        if (userDoc.exists) {
          return [UserModel.fromFirestore(userDoc.data()!, userDoc.id)];
        }
        return [];
      } catch (e) {
        print('Error fetching users from Firebase: $e');
        return [];
      }
    }
    if (await isOnline()) {
      await syncFromFirestore();
    }
    return await _dbHelper!.getUsers();
  }

  Future<List<ApplicationModel>> getApplications() async {
    if (kIsWeb) {
      // On web, fetch directly from Firebase
      try {
        final currentUser = FirebaseService.auth.currentUser;
        if (currentUser == null) return [];
        final applicationsSnapshot = await FirebaseService.firestore
            .collection('applications')
            .where('ownerId', isEqualTo: currentUser.uid)
            .get();
        return applicationsSnapshot.docs
            .map((doc) => ApplicationModel.fromFirestore(doc.data(), doc.id))
            .toList();
      } catch (e) {
        print('Error fetching applications from Firebase: $e');
        return [];
      }
    }
    if (await isOnline()) {
      await syncFromFirestore();
    }
    return await _dbHelper!.getApplications();
  }

  Future<List<BeneficiaryModel>> getBeneficiaries() async {
    if (kIsWeb) {
      // On web, fetch directly from Firebase
      try {
        final currentUser = FirebaseService.auth.currentUser;
        if (currentUser == null) return [];
        final beneficiariesSnapshot = await FirebaseService.firestore
            .collection('beneficiaries')
            .where('ownerId', isEqualTo: currentUser.uid)
            .get();
        return beneficiariesSnapshot.docs
            .map((doc) => BeneficiaryModel.fromFirestore(doc.data(), doc.id))
            .toList();
      } catch (e) {
        print('Error fetching beneficiaries from Firebase: $e');
        return [];
      }
    }
    if (await isOnline()) {
      await syncFromFirestore();
    }
    return await _dbHelper!.getBeneficiaries();
  }

  Future<List<DisbursementModel>> getDisbursements() async {
    if (kIsWeb) {
      // On web, fetch directly from Firebase
      try {
        final currentUser = FirebaseService.auth.currentUser;
        if (currentUser == null) return [];

        // First get user's applications to get application IDs
        final applicationsSnapshot = await FirebaseService.firestore
            .collection('applications')
            .where('ownerId', isEqualTo: currentUser.uid)
            .get();

        if (applicationsSnapshot.docs.isEmpty) return [];

        final applicationIds = applicationsSnapshot.docs
            .map((doc) => doc.id)
            .toList();

        // Then get disbursements for these applications
        final disbursementsSnapshot = await FirebaseService.firestore
            .collection('disbursements')
            .where('applicationId', whereIn: applicationIds)
            .get();

        return disbursementsSnapshot.docs
            .map((doc) => DisbursementModel.fromFirestore(doc.data(), doc.id))
            .toList();
      } catch (e) {
        print('Error fetching disbursements from Firebase: $e');
        return [];
      }
    }
    if (await isOnline()) {
      await syncFromFirestore();
    }
    return await _dbHelper!.getDisbursements();
  }

  Future<List<GrievanceModel>> getGrievances() async {
    if (kIsWeb) {
      // On web, fetch directly from Firebase
      try {
        final currentUser = FirebaseService.auth.currentUser;
        if (currentUser == null) return [];

        // Get grievances created by user
        final grievancesQuery1 = await FirebaseService.firestore
            .collection('grievances')
            .where('userId', isEqualTo: currentUser.uid)
            .get();

        List grievances = [...grievancesQuery1.docs];

        // Get user's beneficiaries to get beneficiary IDs
        final beneficiariesSnapshot = await FirebaseService.firestore
            .collection('beneficiaries')
            .where('ownerId', isEqualTo: currentUser.uid)
            .get();

        if (beneficiariesSnapshot.docs.isNotEmpty) {
          final beneficiaryIds = beneficiariesSnapshot.docs
              .map((doc) => doc.id)
              .toList();

          // Get grievances related to user's beneficiaries
          final grievancesQuery2 = await FirebaseService.firestore
              .collection('grievances')
              .where('beneficiaryId', whereIn: beneficiaryIds)
              .get();

          grievances.addAll(grievancesQuery2.docs);
        }

        // Remove duplicates
        final grievanceIds = <String>{};
        final uniqueGrievances = grievances.where((doc) {
          if (grievanceIds.contains(doc.id)) return false;
          grievanceIds.add(doc.id);
          return true;
        }).toList();

        return uniqueGrievances
            .map((doc) => GrievanceModel.fromFirestore(doc.data(), doc.id))
            .toList();
      } catch (e) {
        print('Error fetching grievances from Firebase: $e');
        return [];
      }
    }
    if (await isOnline()) {
      await syncFromFirestore();
    }
    return await _dbHelper!.getGrievances();
  }

  Future<List<FeedbackModel>> getFeedback() async {
    if (kIsWeb) {
      // On web, fetch directly from Firebase
      try {
        final currentUser = FirebaseService.auth.currentUser;
        if (currentUser == null) return [];
        final feedbackSnapshot = await FirebaseService.firestore
            .collection('feedback')
            .where('userId', isEqualTo: currentUser.uid)
            .get();
        return feedbackSnapshot.docs
            .map((doc) => FeedbackModel.fromMap(doc.id, doc.data()))
            .toList();
      } catch (e) {
        print('Error fetching feedback from Firebase: $e');
        return [];
      }
    }
    if (await isOnline()) {
      await syncFromFirestore();
    }
    return await _dbHelper!.getFeedback();
  }

  Future<List<Report>> getReports() async {
    if (kIsWeb) {
      // On web, fetch directly from Firebase
      try {
        final reportsSnapshot = await FirebaseService.firestore
            .collection('reports')
            .get();
        return reportsSnapshot.docs
            .map((doc) => Report.fromJson(doc.data(), doc.id))
            .toList();
      } catch (e) {
        print('Error fetching reports from Firebase: $e');
        return [];
      }
    }

    // First try to get from local DB
    final localReports = await _dbHelper!.getReports();
    print(
      'SyncService: getReports - Retrieved ${localReports.length} reports from local DB',
    );

    // If we have local reports, try to sync in background but return local data immediately
    if (localReports.isNotEmpty) {
      final online = await isOnline();
      print('SyncService: getReports - Online status: $online');
      if (online) {
        print(
          'SyncService: getReports - Starting background sync from Firestore',
        );
        try {
          await syncFromFirestore();
          print('SyncService: getReports - Background sync completed');
        } catch (e) {
          print('SyncService: getReports - Background sync failed: $e');
        }
      }
      return localReports;
    }

    // If no local reports, try to fetch from Firebase directly
    final online = await isOnline();
    print('SyncService: getReports - No local reports, online status: $online');

    if (online) {
      try {
        print(
          'SyncService: getReports - Fetching reports directly from Firestore',
        );
        final reportsSnapshot = await FirebaseService.firestore
            .collection('reports')
            .get();
        print(
          'SyncService: getReports - Found ${reportsSnapshot.docs.length} reports in Firestore',
        );

        final reports = reportsSnapshot.docs
            .map((doc) => Report.fromJson(doc.data(), doc.id))
            .toList();

        // Save to local DB for future use
        for (var report in reports) {
          await _dbHelper!.insertReport(report);
        }

        print(
          'SyncService: getReports - Saved ${reports.length} reports to local DB',
        );
        return reports;
      } catch (e) {
        print('SyncService: getReports - Error fetching from Firestore: $e');
        return [];
      }
    } else {
      print('SyncService: getReports - Offline and no local reports available');
      return [];
    }
  }

  Future<void> _createSampleReports() async {
    final sampleReports = [
      {
        'name': 'Monthly Applications Report',
        'type': 'applications',
        'category': 'statistical',
        'frequency': 'monthly',
        'status': 'completed',
        'fileSize': '2.5 MB',
        'fileFormat': 'PDF',
        'generatedDate': DateTime.now()
            .subtract(const Duration(days: 5))
            .toIso8601String(),
        'generatedBy': 'System',
        'lastRun': DateTime.now()
            .subtract(const Duration(days: 5))
            .toIso8601String(),
        'nextRun': DateTime.now()
            .add(const Duration(days: 25))
            .toIso8601String(),
        'recordCount': 150,
        'description':
            'Comprehensive report of all applications submitted in the current month',
        'parameters': {'month': 'December', 'year': 2024},
        'downloadCount': 5,
        'isScheduled': true,
        'recipients': ['admin@nyantara.com'],
        'columns': ['id', 'name', 'status', 'amount', 'date'],
        'createdAt': DateTime.now().toIso8601String(),
        'updatedAt': DateTime.now().toIso8601String(),
      },
      {
        'name': 'Beneficiary Disbursement Summary',
        'type': 'disbursements',
        'category': 'financial',
        'frequency': 'weekly',
        'status': 'completed',
        'fileSize': '1.8 MB',
        'fileFormat': 'PDF',
        'generatedDate': DateTime.now()
            .subtract(const Duration(days: 2))
            .toIso8601String(),
        'generatedBy': 'System',
        'lastRun': DateTime.now()
            .subtract(const Duration(days: 2))
            .toIso8601String(),
        'nextRun': DateTime.now()
            .add(const Duration(days: 5))
            .toIso8601String(),
        'recordCount': 89,
        'description':
            'Weekly summary of all disbursements made to beneficiaries',
        'parameters': {'week': '48', 'year': 2024},
        'downloadCount': 3,
        'isScheduled': true,
        'recipients': ['finance@nyantara.com'],
        'columns': ['beneficiaryId', 'amount', 'date', 'status'],
        'createdAt': DateTime.now().toIso8601String(),
        'updatedAt': DateTime.now().toIso8601String(),
      },
      {
        'name': 'Grievance Resolution Report',
        'type': 'grievances',
        'category': 'performance',
        'frequency': 'quarterly',
        'status': 'processing',
        'fileSize': null,
        'fileFormat': 'PDF',
        'generatedDate': null,
        'generatedBy': 'System',
        'lastRun': null,
        'nextRun': DateTime.now()
            .add(const Duration(days: 30))
            .toIso8601String(),
        'recordCount': null,
        'description':
            'Analysis of grievance resolution times and effectiveness',
        'parameters': {'quarter': 'Q4', 'year': 2024},
        'downloadCount': 0,
        'isScheduled': true,
        'recipients': ['support@nyantara.com'],
        'columns': ['id', 'type', 'status', 'resolutionTime'],
        'createdAt': DateTime.now().toIso8601String(),
        'updatedAt': DateTime.now().toIso8601String(),
      },
      {
        'name': 'User Feedback Analysis',
        'type': 'feedback',
        'category': 'analytical',
        'frequency': 'monthly',
        'status': 'scheduled',
        'fileSize': null,
        'fileFormat': 'PDF',
        'generatedDate': null,
        'generatedBy': 'System',
        'lastRun': null,
        'nextRun': DateTime.now()
            .add(const Duration(days: 10))
            .toIso8601String(),
        'recordCount': null,
        'description': 'Analysis of user feedback and satisfaction metrics',
        'parameters': {'month': 'December', 'year': 2024},
        'downloadCount': 0,
        'isScheduled': true,
        'recipients': ['ux@nyantara.com'],
        'columns': ['rating', 'category', 'comments', 'date'],
        'createdAt': DateTime.now().toIso8601String(),
        'updatedAt': DateTime.now().toIso8601String(),
      },
      {
        'name': 'System Performance Report',
        'type': 'technical',
        'category': 'technical',
        'frequency': 'daily',
        'status': 'completed',
        'fileSize': '500 KB',
        'fileFormat': 'PDF',
        'generatedDate': DateTime.now()
            .subtract(const Duration(hours: 6))
            .toIso8601String(),
        'generatedBy': 'System',
        'lastRun': DateTime.now()
            .subtract(const Duration(hours: 6))
            .toIso8601String(),
        'nextRun': DateTime.now()
            .add(const Duration(hours: 18))
            .toIso8601String(),
        'recordCount': 24,
        'description': 'Daily system performance metrics and uptime statistics',
        'parameters': {'date': DateTime.now().toIso8601String().split('T')[0]},
        'downloadCount': 1,
        'isScheduled': true,
        'recipients': ['tech@nyantara.com'],
        'columns': ['metric', 'value', 'timestamp'],
        'createdAt': DateTime.now().toIso8601String(),
        'updatedAt': DateTime.now().toIso8601String(),
      },
    ];

    for (final reportData in sampleReports) {
      try {
        await FirebaseService.firestore.collection('reports').add(reportData);
        print('SyncService: Created sample report: ${reportData['name']}');
      } catch (e) {
        print(
          'SyncService: Error creating sample report ${reportData['name']}: $e',
        );
      }
    }
  }
}
