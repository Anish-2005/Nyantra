// ignore_for_file: avoid_print

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
    if (!await isOnline()) return;

    try {
      // Sync users
      final usersSnapshot = await FirebaseService.firestore
          .collection('users')
          .get();
      for (var doc in usersSnapshot.docs) {
        final user = UserModel.fromFirestore(doc.data(), doc.id);
        await _dbHelper!.insertUser(user);
      }

      // Sync applications
      final applicationsSnapshot = await FirebaseService.firestore
          .collection('applications')
          .get();
      for (var doc in applicationsSnapshot.docs) {
        final application = ApplicationModel.fromFirestore(doc.data(), doc.id);
        await _dbHelper!.insertApplication(application);
      }

      // Sync beneficiaries
      final beneficiariesSnapshot = await FirebaseService.firestore
          .collection('beneficiaries')
          .get();
      for (var doc in beneficiariesSnapshot.docs) {
        final beneficiary = BeneficiaryModel.fromFirestore(doc.data(), doc.id);
        await _dbHelper!.insertBeneficiary(beneficiary);
      }

      // Sync disbursements
      final disbursementsSnapshot = await FirebaseService.firestore
          .collection('disbursements')
          .get();
      for (var doc in disbursementsSnapshot.docs) {
        final disbursement = DisbursementModel.fromFirestore(
          doc.data(),
          doc.id,
        );
        await _dbHelper!.insertDisbursement(disbursement);
      }

      // Sync grievances
      final grievancesSnapshot = await FirebaseService.firestore
          .collection('grievances')
          .get();
      for (var doc in grievancesSnapshot.docs) {
        final grievance = GrievanceModel.fromFirestore(doc.data(), doc.id);
        await _dbHelper!.insertGrievance(grievance);
      }

      // Sync feedback
      final feedbackSnapshot = await FirebaseService.firestore
          .collection('feedback')
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
    if (await isOnline()) {
      await syncFromFirestore();
    }
    return await _dbHelper!.getUsers();
  }

  Future<List<ApplicationModel>> getApplications() async {
    if (await isOnline()) {
      await syncFromFirestore();
    }
    return await _dbHelper!.getApplications();
  }

  Future<List<BeneficiaryModel>> getBeneficiaries() async {
    if (await isOnline()) {
      await syncFromFirestore();
    }
    return await _dbHelper!.getBeneficiaries();
  }

  Future<List<DisbursementModel>> getDisbursements() async {
    if (await isOnline()) {
      await syncFromFirestore();
    }
    return await _dbHelper!.getDisbursements();
  }

  Future<List<GrievanceModel>> getGrievances() async {
    if (await isOnline()) {
      await syncFromFirestore();
    }
    return await _dbHelper!.getGrievances();
  }

  Future<List<FeedbackModel>> getFeedback() async {
    if (await isOnline()) {
      await syncFromFirestore();
    }
    return await _dbHelper!.getFeedback();
  }

  Future<List<Report>> getReports() async {
    if (await isOnline()) {
      await syncFromFirestore();
    }
    return await _dbHelper!.getReports();
  }
}
