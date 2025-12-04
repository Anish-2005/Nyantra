// ignore_for_file: deprecated_member_use

import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

enum AppTheme { light, dark }

class ThemeProvider extends ChangeNotifier {
  static const String _themeKey = 'nyantra_theme';
  AppTheme _theme = AppTheme.dark;

  AppTheme get theme => _theme;

  bool get isDark => _theme == AppTheme.dark;

  ThemeData get themeData => _getThemeData();

  ThemeProvider() {
    _loadTheme();
  }

  Future<void> _loadTheme() async {
    final prefs = await SharedPreferences.getInstance();
    final themeString = prefs.getString(_themeKey);

    if (themeString == 'light') {
      _theme = AppTheme.light;
    } else if (themeString == 'dark') {
      _theme = AppTheme.dark;
    } else {
      // Check system preference
      final brightness =
          WidgetsBinding.instance.platformDispatcher.platformBrightness;
      _theme = brightness == Brightness.dark ? AppTheme.dark : AppTheme.light;
    }

    notifyListeners();
  }

  Future<void> setTheme(AppTheme theme) async {
    _theme = theme;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_themeKey, theme.name);
    notifyListeners();
  }

  void toggleTheme() {
    setTheme(isDark ? AppTheme.light : AppTheme.dark);
  }

  ThemeData _getThemeData() {
    final baseTheme = isDark ? ThemeData.dark() : ThemeData.light();

    return baseTheme.copyWith(
      primaryColor: isDark ? const Color(0xFF06B6D4) : const Color(0xFFFB7185),
      scaffoldBackgroundColor: isDark
          ? const Color(0xFF0F172A)
          : const Color(0xFFF8FAFC),
      cardColor: isDark
          ? const Color(0xFF1E293B).withOpacity(0.7)
          : const Color(0xFFFFFFFF).withOpacity(0.8),
      textTheme: baseTheme.textTheme.apply(
        fontFamily: 'Inter',
        bodyColor: isDark ? const Color(0xFFF1F5F9) : const Color(0xFF0F172A),
        displayColor: isDark
            ? const Color(0xFFF1F5F9)
            : const Color(0xFF0F172A),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: isDark
            ? const Color(0xFF1E293B).withOpacity(0.95)
            : const Color(0xFFFFFFFF).withOpacity(0.95),
        foregroundColor: isDark
            ? const Color(0xFFF1F5F9)
            : const Color(0xFF0F172A),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: isDark
              ? const Color(0xFF06B6D4)
              : const Color(0xFFFB7185),
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        ),
      ),
    );
  }
}
