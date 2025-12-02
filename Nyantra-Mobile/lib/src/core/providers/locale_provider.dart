import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';

enum AppLocale { en, hi }

class LocaleProvider extends ChangeNotifier {
  static const String _localeKey = 'nyantra_locale';
  AppLocale _locale = AppLocale.hi;
  Map<String, dynamic> _translations = {};

  AppLocale get locale => _locale;
  Locale get flutterLocale =>
      _locale == AppLocale.en ? const Locale('en') : const Locale('hi');

  LocaleProvider() {
    _loadLocale();
  }

  Future<void> _loadLocale() async {
    final prefs = await SharedPreferences.getInstance();
    final localeString = prefs.getString(_localeKey);

    if (localeString == 'en') {
      _locale = AppLocale.en;
    } else if (localeString == 'hi') {
      _locale = AppLocale.hi;
    } else {
      // Check system language
      final systemLocale = WidgetsBinding.instance.platformDispatcher.locale;
      _locale = systemLocale.languageCode.startsWith('hi')
          ? AppLocale.hi
          : AppLocale.en;
    }

    await _loadTranslations();
    notifyListeners();
  }

  Future<void> _loadTranslations() async {
    final localeFile = _locale == AppLocale.en ? 'en.json' : 'hi.json';
    try {
      final jsonString = await rootBundle.loadString(
        'assets/translations/$localeFile',
      );
      _translations = json.decode(jsonString);
    } catch (e) {
      _translations = {}; // Fallback to empty map
    }
  }

  Future<void> setLocale(AppLocale locale) async {
    _locale = locale;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_localeKey, locale.name);
    await _loadTranslations();
    notifyListeners();
  }

  String translate(String key, [Map<String, dynamic>? args]) {
    try {
      final keys = key.split('.');
      dynamic value = _translations;

      for (final k in keys) {
        if (value is Map<String, dynamic>) {
          value = value[k];
        } else {
          return key; // Return key if translation not found
        }
      }

      if (value is String && args != null) {
        String result = value;
        args.forEach((argKey, argValue) {
          result = result.replaceAll('{$argKey}', argValue.toString());
        });
        return result;
      }

      return value?.toString() ?? key;
    } catch (e) {
      return key;
    }
  }

  String Function(String, [Map<String, dynamic>?]) get t => translate;

  bool get hasTranslations => _translations.isNotEmpty;
}
