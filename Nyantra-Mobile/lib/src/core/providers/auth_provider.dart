import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import '../services/firebase_service.dart';
import '../services/sync_service.dart';
import 'sync_status_provider.dart';

class AuthProvider extends ChangeNotifier {
  User? _user;
  bool _isLoading = true;
  SyncStatusProvider? _syncStatusProvider;

  User? get user => _user;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _user != null;

  AuthProvider({SyncStatusProvider? syncStatusProvider}) {
    _syncStatusProvider = syncStatusProvider;
    _init();
  }

  Future<void> _init() async {
    FirebaseService.auth.authStateChanges().listen((User? user) {
      _user = user;
      _isLoading = false;

      // Initialize SyncService with SyncStatusProvider when user signs in
      if (user != null && _syncStatusProvider != null) {
        SyncService(syncStatusProvider: _syncStatusProvider);
      }

      notifyListeners();
    });
  }

  Future<void> signInWithGoogle() async {
    try {
      await FirebaseService.signInWithGoogle();
    } catch (e) {
      debugPrint('Error signing in with Google: $e');
      rethrow;
    }
  }

  Future<void> signOut() async {
    try {
      await FirebaseService.auth.signOut();
    } catch (e) {
      debugPrint('Error signing out: $e');
      rethrow;
    }
  }
}
