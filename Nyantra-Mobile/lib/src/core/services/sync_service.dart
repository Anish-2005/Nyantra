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

class SyncService {
  static final SyncService _instance = SyncService._internal();
  static DatabaseHelper? _dbHelper;
  static Connectivity? _connectivity;

  factory SyncService() => _instance;

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
      final reportsSnapshot = await FirebaseService.firestore
          .collection('reports')
          .get();
      for (var doc in reportsSnapshot.docs) {
        final report = Report.fromJson(doc.data(), doc.id);
        await _dbHelper!.insertReport(report);
      }
    } catch (e) {
      print('Error syncing from Firestore: $e');
    }
  }

  // Sync local changes to Firestore
  Future<void> syncToFirestore() async {
    if (!await isOnline()) return;

    try {
      // For now, assume all local data is synced. In a full implementation,
      // you'd track changes and only sync modified records.
      // This is a simplified version.
    } catch (e) {
      print('Error syncing to Firestore: $e');
    }
  }

  // Get data with fallback to local DB if offline
  Future<List<UserModel>> getUsers() async {
    if (kIsWeb) return [];
    if (await isOnline()) {
      await syncFromFirestore();
    }
    return await _dbHelper!.getUsers();
  }

  Future<List<ApplicationModel>> getApplications() async {
    if (kIsWeb) return [];
    if (await isOnline()) {
      await syncFromFirestore();
    }
    return await _dbHelper!.getApplications();
  }

  Future<List<BeneficiaryModel>> getBeneficiaries() async {
    if (kIsWeb) return [];
    if (await isOnline()) {
      await syncFromFirestore();
    }
    return await _dbHelper!.getBeneficiaries();
  }

  Future<List<DisbursementModel>> getDisbursements() async {
    if (kIsWeb) return [];
    if (await isOnline()) {
      await syncFromFirestore();
    }
    return await _dbHelper!.getDisbursements();
  }

  Future<List<GrievanceModel>> getGrievances() async {
    if (kIsWeb) return [];
    if (await isOnline()) {
      await syncFromFirestore();
    }
    return await _dbHelper!.getGrievances();
  }

  Future<List<FeedbackModel>> getFeedback() async {
    if (kIsWeb) return [];
    if (await isOnline()) {
      await syncFromFirestore();
    }
    return await _dbHelper!.getFeedback();
  }

  Future<List<Report>> getReports() async {
    if (kIsWeb) return [];
    if (await isOnline()) {
      await syncFromFirestore();
    }
    return await _dbHelper!.getReports();
  }
}
