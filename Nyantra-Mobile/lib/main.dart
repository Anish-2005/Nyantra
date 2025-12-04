import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'src/core/services/firebase_service.dart';
import 'src/core/services/sync_service.dart';
import 'src/core/providers/theme_provider.dart';
import 'src/core/providers/locale_provider.dart';
import 'src/core/providers/auth_provider.dart';
import 'src/core/providers/connectivity_provider.dart';
import 'src/features/auth/screens/login_screen.dart';
import 'src/features/dashboard/screens/dashboard_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Firebase
  await FirebaseService.initialize();

  // Initialize sync service
  final syncService = SyncService();
  if (await syncService.isOnline()) {
    await syncService.syncFromFirestore();
  }

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
        ChangeNotifierProvider(create: (_) => LocaleProvider()),
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => ConnectivityProvider()),
      ],
      child: Consumer3<ThemeProvider, LocaleProvider, AuthProvider>(
        builder: (context, themeProvider, localeProvider, authProvider, child) {
          return MaterialApp(
            title: 'Nyantra User Dashboard',
            theme: themeProvider.themeData,
            locale: localeProvider.flutterLocale,
            localizationsDelegates: const [
              GlobalMaterialLocalizations.delegate,
              GlobalWidgetsLocalizations.delegate,
              GlobalCupertinoLocalizations.delegate,
            ],
            supportedLocales: const [Locale('en'), Locale('hi')],
            home: authProvider.isLoading
                ? const SplashScreen()
                : authProvider.isAuthenticated
                ? const DashboardScreen()
                : const LoginScreen(),
            debugShowCheckedModeBanner: false,
          );
        },
      ),
    );
  }
}

class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(body: Center(child: CircularProgressIndicator()));
  }
}
