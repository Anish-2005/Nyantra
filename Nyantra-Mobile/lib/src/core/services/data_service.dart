import 'dart:async';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../models/user_model.dart';
import '../models/application_model.dart';
import '../models/beneficiary_model.dart';
import '../models/disbursement_model.dart';
import '../models/grievance_model.dart';

class DataService {
  static final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  static final FirebaseAuth _auth = FirebaseAuth.instance;

  // Dashboard Stats - filtered by current user
  static Future<Map<String, dynamic>> getDashboardStats() async {
    try {
      final currentUser = _auth.currentUser;
      if (currentUser == null) {
        return {
          'totalApplications': 0,
          'approvedApplications': 0,
          'pendingApplications': 0,
          'totalDisbursed': 0.0,
          'beneficiariesCount': 0,
        };
      }

      // Get user's beneficiaries first
      final beneficiariesQuery = await _firestore
          .collection('beneficiaries')
          .where('ownerId', isEqualTo: currentUser.uid)
          .get();

      final beneficiaryIds = beneficiariesQuery.docs
          .map((doc) => doc.id)
          .toList();

      // Get applications by user (ownerId) or by beneficiary
      final applicationsQuery1 = await _firestore
          .collection('applications')
          .where('ownerId', isEqualTo: currentUser.uid)
          .get();

      final applicationsQuery2 = beneficiaryIds.isNotEmpty
          ? await _firestore
                .collection('applications')
                .where('beneficiaryId', whereIn: beneficiaryIds)
                .get()
          : null;

      final allApplicationDocs = [
        ...applicationsQuery1.docs,
        if (applicationsQuery2 != null) ...applicationsQuery2.docs,
      ];

      // Remove duplicates
      final applicationIds = <String>{};
      final uniqueApplications = allApplicationDocs.where((doc) {
        if (applicationIds.contains(doc.id)) return false;
        applicationIds.add(doc.id);
        return true;
      }).toList();

      // Get disbursements for user's applications
      final applicationIdsList = uniqueApplications
          .map((doc) => doc.id)
          .toList();
      final disbursementsQuery = applicationIdsList.isNotEmpty
          ? await _firestore
                .collection('disbursements')
                .where(
                  'applicationId',
                  whereIn: applicationIdsList.take(10),
                ) // Firestore limit
                .get()
          : null;

      final applications = uniqueApplications;
      final disbursements = disbursementsQuery?.docs ?? [];

      // Calculate stats
      final totalApplications = applications.length;
      final approvedApplications = applications
          .where((doc) => doc.data()['status'] == 'approved')
          .length;
      final pendingApplications = applications
          .where((doc) => doc.data()['status'] == 'pending')
          .length;

      final totalDisbursed = disbursements
          .where((doc) => doc.data()['status'] == 'completed')
          .fold<double>(
            0.0,
            (sum, doc) =>
                sum + ((doc.data()['reliefAmount'] as num?)?.toDouble() ?? 0.0),
          );

      final beneficiariesCount = beneficiariesQuery.docs.length;

      return {
        'totalApplications': totalApplications,
        'approvedApplications': approvedApplications,
        'pendingApplications': pendingApplications,
        'totalDisbursed': totalDisbursed,
        'beneficiariesCount': beneficiariesCount,
      };
    } catch (e) {
      print('Error fetching dashboard stats: $e');
      return {
        'totalApplications': 0,
        'approvedApplications': 0,
        'pendingApplications': 0,
        'totalDisbursed': 0.0,
        'beneficiariesCount': 0,
      };
    }
  }

  // Applications - filtered by current user (ownerId) or user's beneficiaries
  static Stream<List<ApplicationModel>> getApplications() {
    final currentUser = _auth.currentUser;
    if (currentUser == null) {
      return Stream.value([]);
    }

    // First get user's beneficiaries to get beneficiary IDs
    return _firestore
        .collection('beneficiaries')
        .where('ownerId', isEqualTo: currentUser.uid)
        .snapshots()
        .asyncMap((beneficiariesSnapshot) async {
          final beneficiaryIds = beneficiariesSnapshot.docs
              .map((doc) => doc.id)
              .toList();

          // Get applications where ownerId is current user
          final applicationsQuery1 = await _firestore
              .collection('applications')
              .where('ownerId', isEqualTo: currentUser.uid)
              .get();

          // Get applications where beneficiaryId is in user's beneficiaries
          final applicationsQuery2 = beneficiaryIds.isNotEmpty
              ? await _firestore
                    .collection('applications')
                    .where(
                      'beneficiaryId',
                      whereIn: beneficiaryIds.take(10),
                    ) // Firestore limit
                    .get()
              : null;

          final allApplicationDocs = [
            ...applicationsQuery1.docs,
            if (applicationsQuery2 != null) ...applicationsQuery2.docs,
          ];

          // Remove duplicates
          final applicationIds = <String>{};
          final uniqueApplications = allApplicationDocs.where((doc) {
            if (applicationIds.contains(doc.id)) return false;
            applicationIds.add(doc.id);
            return true;
          }).toList();

          return uniqueApplications.map((doc) {
            return ApplicationModel.fromFirestore(doc.data(), doc.id);
          }).toList();
        });
  }

  static Future<void> createApplication(ApplicationModel application) async {
    await _firestore.collection('applications').add(application.toFirestore());
  }

  // Beneficiaries - filtered by current user
  static Stream<List<BeneficiaryModel>> getBeneficiaries() {
    final currentUser = _auth.currentUser;
    if (currentUser == null) {
      return Stream.value([]);
    }

    return _firestore
        .collection('beneficiaries')
        .where('ownerId', isEqualTo: currentUser.uid)
        .snapshots()
        .map((snapshot) {
          return snapshot.docs.map((doc) {
            return BeneficiaryModel.fromFirestore(doc.data(), doc.id);
          }).toList();
        });
  }

  static Future<void> createBeneficiary(BeneficiaryModel beneficiary) async {
    await _firestore.collection('beneficiaries').add(beneficiary.toFirestore());
  }

  // Disbursements - filtered by current user's applications or user's beneficiaries
  static Stream<List<DisbursementModel>> getDisbursements() {
    final currentUser = _auth.currentUser;
    if (currentUser == null) {
      return Stream.value([]);
    }

    // First get user's beneficiaries and applications
    return _firestore
        .collection('beneficiaries')
        .where('ownerId', isEqualTo: currentUser.uid)
        .snapshots()
        .asyncMap((beneficiariesSnapshot) async {
          final beneficiaryIds = beneficiariesSnapshot.docs
              .map((doc) => doc.id)
              .toList();

          // Get applications where ownerId is current user
          final applicationsQuery1 = await _firestore
              .collection('applications')
              .where('ownerId', isEqualTo: currentUser.uid)
              .get();

          // Get applications where beneficiaryId is in user's beneficiaries
          final applicationsQuery2 = beneficiaryIds.isNotEmpty
              ? await _firestore
                    .collection('applications')
                    .where(
                      'beneficiaryId',
                      whereIn: beneficiaryIds.take(10),
                    ) // Firestore limit
                    .get()
              : null;

          final allApplicationDocs = [
            ...applicationsQuery1.docs,
            if (applicationsQuery2 != null) ...applicationsQuery2.docs,
          ];

          // Remove duplicates
          final applicationIds = <String>{};
          final uniqueApplicationIds = allApplicationDocs
              .where((doc) {
                if (applicationIds.contains(doc.id)) return false;
                applicationIds.add(doc.id);
                return true;
              })
              .map((doc) => doc.id)
              .toList();

          if (uniqueApplicationIds.isEmpty) {
            return [];
          }

          // Get disbursements for these applications
          final disbursementsSnapshot = await _firestore
              .collection('disbursements')
              .where(
                'applicationId',
                whereIn: uniqueApplicationIds.take(10),
              ) // Firestore limit
              .get();

          return disbursementsSnapshot.docs.map((doc) {
            return DisbursementModel.fromFirestore(doc.data(), doc.id);
          }).toList();
        });
  }

  static Future<void> createDisbursement(DisbursementModel disbursement) async {
    await _firestore
        .collection('disbursements')
        .add(disbursement.toFirestore());
  }

  // Grievances - proper implementation with user filtering and beneficiary filtering
  static Stream<List<GrievanceModel>> getGrievances() {
    final currentUser = _auth.currentUser;
    if (currentUser == null) {
      return Stream.value([]);
    }

    // Stream for grievances created by the current user
    final userGrievancesStream = _firestore
        .collection('grievances')
        .where('userId', isEqualTo: currentUser.uid)
        .snapshots()
        .map((snapshot) {
          return snapshot.docs.map((doc) {
            return GrievanceModel.fromFirestore(doc.data(), doc.id);
          }).toList();
        });

    // Stream for grievances associated with user's beneficiaries
    final beneficiaryGrievancesStream = _firestore
        .collection('beneficiaries')
        .where('ownerId', isEqualTo: currentUser.uid)
        .snapshots()
        .asyncMap((beneficiariesSnapshot) async {
          final beneficiaryIds = beneficiariesSnapshot.docs
              .map((doc) => doc.id)
              .toList();

          if (beneficiaryIds.isEmpty) {
            return <GrievanceModel>[];
          }

          // Fetch grievances for each beneficiary ID
          final grievanceLists = await Future.wait(
            beneficiaryIds.map(
              (beneficiaryId) => _firestore
                  .collection('grievances')
                  .where('beneficiaryId', isEqualTo: beneficiaryId)
                  .get()
                  .then(
                    (snapshot) => snapshot.docs
                        .map(
                          (doc) =>
                              GrievanceModel.fromFirestore(doc.data(), doc.id),
                        )
                        .toList(),
                  ),
            ),
          );

          // Flatten the list of lists
          return grievanceLists.expand((list) => list).toList();
        });

    // Combine both streams using a StreamController
    final controller = StreamController<List<GrievanceModel>>();

    StreamSubscription? userSubscription;
    StreamSubscription? beneficiarySubscription;
    List<GrievanceModel>? latestUserGrievances;
    List<GrievanceModel>? latestBeneficiaryGrievances;

    void emitCombined() {
      if (latestUserGrievances != null && latestBeneficiaryGrievances != null) {
        // Combine and deduplicate by ID
        final allGrievances = <String, GrievanceModel>{};
        for (final grievance in latestUserGrievances!) {
          allGrievances[grievance.id] = grievance;
        }
        for (final grievance in latestBeneficiaryGrievances!) {
          allGrievances[grievance.id] = grievance;
        }

        // Sort by creation date (newest first), handling null dates
        final sortedGrievances = allGrievances.values.toList()
          ..sort((a, b) {
            final aDate = a.createdDate;
            final bDate = b.createdDate;
            if (aDate == null && bDate == null) return 0;
            if (aDate == null) return 1; // null dates go to the end
            if (bDate == null) return -1;
            return bDate.compareTo(aDate);
          });

        controller.add(sortedGrievances);
      }
    }

    userSubscription = userGrievancesStream.listen((userGrievances) {
      latestUserGrievances = userGrievances;
      emitCombined();
    });

    beneficiarySubscription = beneficiaryGrievancesStream.listen((
      beneficiaryGrievances,
    ) {
      latestBeneficiaryGrievances = beneficiaryGrievances;
      emitCombined();
    });

    controller.onCancel = () {
      userSubscription?.cancel();
      beneficiarySubscription?.cancel();
    };

    return controller.stream;
  }

  static Future<void> createGrievance(GrievanceModel grievance) async {
    await _firestore.collection('grievances').add(grievance.toFirestore());
  }

  // User Profile
  static Future<UserModel?> getUserProfile(String userId) async {
    try {
      final doc = await _firestore.collection('users').doc(userId).get();
      if (doc.exists) {
        return UserModel.fromFirestore(doc.data()!, doc.id);
      }
      return null;
    } catch (e) {
      print('Error fetching user profile: $e');
      return null;
    }
  }

  static Future<void> updateUserProfile(String userId, UserModel user) async {
    await _firestore.collection('users').doc(userId).update(user.toFirestore());
  }

  static Future<void> createUserProfile(UserModel user) async {
    await _firestore.collection('users').doc(user.id).set(user.toFirestore());
  }
}
