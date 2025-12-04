import 'package:flutter/material.dart';
import 'package:connectivity_plus/connectivity_plus.dart';

class ConnectivityProvider with ChangeNotifier {
  List<ConnectivityResult> _connectivityResults = [];
  bool get isOnline =>
      _connectivityResults.isNotEmpty &&
      _connectivityResults.any((result) => result != ConnectivityResult.none);

  ConnectivityProvider() {
    _initConnectivity();
    _listenConnectivity();
  }

  Future<void> _initConnectivity() async {
    _connectivityResults = await Connectivity().checkConnectivity();
    notifyListeners();
  }

  void _listenConnectivity() {
    Connectivity().onConnectivityChanged.listen((
      List<ConnectivityResult> results,
    ) {
      _connectivityResults = results;
      notifyListeners();
    });
  }

  List<ConnectivityResult> get connectivityResults => _connectivityResults;
}
