// ignore_for_file: deprecated_member_use

import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

class LoadingState extends StatelessWidget {
  final String? message;
  final double? size;
  final bool fullScreen;

  const LoadingState({
    super.key,
    this.message,
    this.size,
    this.fullScreen = true,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final loadingWidget = Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Animated loading spinner
          Container(
            width: size ?? 60,
            height: size ?? 60,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: LinearGradient(
                colors: isDark
                    ? [const Color(0xFF06B6D4), const Color(0xFF8B5CF6)]
                    : [const Color(0xFFFB7185), const Color(0xFFFB923C)],
              ),
            ),
            child: const CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
              strokeWidth: 3,
            ),
          ).animate(
            effects: [
              const ScaleEffect(
                begin: Offset(0.8, 0.8),
                end: Offset(1.0, 1.0),
                duration: Duration(milliseconds: 600),
              ),
              const RotateEffect(
                begin: 0,
                end: 0.1,
                duration: Duration(milliseconds: 800),
                curve: Curves.easeInOut,
              ),
            ],
          ),
          if (message != null) ...[
            const SizedBox(height: 24),
            Text(
              message!,
              style: theme.textTheme.bodyLarge?.copyWith(
                color: theme.textTheme.bodyLarge?.color?.withOpacity(0.8),
              ),
              textAlign: TextAlign.center,
            ).animate(
              effects: [
                const FadeEffect(
                  begin: 0,
                  end: 1,
                  delay: Duration(milliseconds: 300),
                  duration: Duration(milliseconds: 400),
                ),
                const SlideEffect(
                  begin: Offset(0, 0.2),
                  end: Offset.zero,
                  delay: Duration(milliseconds: 300),
                  duration: Duration(milliseconds: 400),
                ),
              ],
            ),
          ],
        ],
      ),
    );

    if (fullScreen) {
      return Scaffold(
        backgroundColor: theme.scaffoldBackgroundColor,
        body: loadingWidget,
      );
    }

    return loadingWidget;
  }
}
