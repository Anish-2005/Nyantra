import 'package:flutter/material.dart';

enum SyncStatus { idle, syncing, success, error }

class SyncStatusProvider with ChangeNotifier {
  SyncStatus _status = SyncStatus.idle;
  String? _lastError;
  DateTime? _lastSyncTime;
  int _pendingSyncCount = 0;

  SyncStatus get status => _status;
  String? get lastError => _lastError;
  DateTime? get lastSyncTime => _lastSyncTime;
  int get pendingSyncCount => _pendingSyncCount;
  bool get hasPendingSync => _pendingSyncCount > 0;

  void setStatus(SyncStatus status, {String? error}) {
    _status = status;
    if (status == SyncStatus.error && error != null) {
      _lastError = error;
    } else if (status == SyncStatus.success) {
      _lastSyncTime = DateTime.now();
      _lastError = null;
    }
    notifyListeners();
  }

  void setPendingSyncCount(int count) {
    _pendingSyncCount = count;
    notifyListeners();
  }

  void incrementPendingSync() {
    _pendingSyncCount++;
    notifyListeners();
  }

  void decrementPendingSync() {
    if (_pendingSyncCount > 0) {
      _pendingSyncCount--;
      notifyListeners();
    }
  }

  void clearError() {
    _lastError = null;
    notifyListeners();
  }

  String getStatusText() {
    switch (_status) {
      case SyncStatus.idle:
        return hasPendingSync ? '$_pendingSyncCount items to sync' : 'Synced';
      case SyncStatus.syncing:
        return 'Syncing...';
      case SyncStatus.success:
        return 'Synced successfully';
      case SyncStatus.error:
        return 'Sync error';
    }
  }

  Color getStatusColor() {
    switch (_status) {
      case SyncStatus.idle:
        return hasPendingSync ? Colors.orange : Colors.green;
      case SyncStatus.syncing:
        return Colors.blue;
      case SyncStatus.success:
        return Colors.green;
      case SyncStatus.error:
        return Colors.red;
    }
  }

  IconData getStatusIcon() {
    switch (_status) {
      case SyncStatus.idle:
        return hasPendingSync ? Icons.sync_problem : Icons.sync;
      case SyncStatus.syncing:
        return Icons.sync;
      case SyncStatus.success:
        return Icons.check_circle;
      case SyncStatus.error:
        return Icons.error;
    }
  }
}
