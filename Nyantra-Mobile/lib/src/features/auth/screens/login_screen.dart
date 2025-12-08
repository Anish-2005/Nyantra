// ignore_for_file: deprecated_member_use

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'dart:math';
import '../../../core/providers/auth_provider.dart';
import '../../../core/providers/locale_provider.dart';
import '../../../core/providers/theme_provider.dart';
import '../../../components/AnimatedBackground.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen>
    with TickerProviderStateMixin {
  bool _isLoading = false;
  late AnimationController _backgroundController;
  late AnimationController _particleController;

  @override
  void initState() {
    super.initState();
    _backgroundController = AnimationController(
      duration: const Duration(seconds: 10),
      vsync: this,
    )..repeat();
    _particleController = AnimationController(
      duration: const Duration(seconds: 20),
      vsync: this,
    )..repeat();
  }

  @override
  void dispose() {
    _backgroundController.dispose();
    _particleController.dispose();
    super.dispose();
  }

  Future<void> _signInWithGoogle() async {
    final localeProvider = context.read<LocaleProvider>();
    setState(() => _isLoading = true);
    try {
      await context.read<AuthProvider>().signInWithGoogle();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              '${localeProvider.translate('auth.googleSignInFailed')}: $e',
            ),
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final localeProvider = context.watch<LocaleProvider>();
    final themeProvider = context.watch<ThemeProvider>();
    final authProvider = context.watch<AuthProvider>();
    final isDark = theme.brightness == Brightness.dark;

    // Show welcome back screen if user is already authenticated
    if (authProvider.isAuthenticated && !authProvider.isLoading) {
      return _buildWelcomeBackScreen(
        context,
        theme,
        localeProvider,
        themeProvider,
        authProvider,
        isDark,
      );
    }

    // Show login screen if not authenticated
    return _buildLoginScreen(
      context,
      theme,
      localeProvider,
      themeProvider,
      isDark,
    );
  }

  Widget _buildLoginScreen(
    BuildContext context,
    ThemeData theme,
    LocaleProvider localeProvider,
    ThemeProvider themeProvider,
    bool isDark,
  ) {
    return Scaffold(
      body: Stack(
        children: [
          // Animated Background
          AnimatedBackground(isDark: isDark),

          // Main Content
          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const SizedBox(height: 60),

                  // Logo/Brand with enhanced animation
                  Container(
                        width: 80,
                        height: 80,
                        decoration: BoxDecoration(
                          image: DecorationImage(
                            image: AssetImage(
                              isDark
                                  ? 'assets/images/Logo-Dark.png'
                                  : 'assets/images/Logo-Light.png',
                            ),
                            fit: BoxFit.contain,
                          ),
                        ),
                      )
                      .animate()
                      .fadeIn(duration: 800.ms)
                      .scale(
                        begin: const Offset(0.8, 0.8),
                        end: const Offset(1.0, 1.0),
                      )
                      .then()
                      .shimmer(duration: 2000.ms),

                  const SizedBox(height: 40),

                  // Title with gradient text effect
                  ShaderMask(
                        shaderCallback: (bounds) => LinearGradient(
                          colors: isDark
                              ? [
                                  const Color(0xFF06B6D4),
                                  const Color(0xFF8B5CF6),
                                ]
                              : [
                                  const Color(0xFFFB7185),
                                  const Color(0xFFFB923C),
                                ],
                        ).createShader(bounds),
                        child: Text(
                          localeProvider.translate('nav.brandName'),
                          style: theme.textTheme.displayMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                            height: 1.2,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      )
                      .animate()
                      .fadeIn(duration: 800.ms, delay: 200.ms)
                      .slideY(begin: -0.2, end: 0),

                  const SizedBox(height: 16),

                  // Subtitle
                  Text(
                        localeProvider.translate('hero.description'),
                        style: theme.textTheme.bodyLarge?.copyWith(
                          color: theme.textTheme.bodyLarge?.color?.withOpacity(
                            0.8,
                          ),
                          height: 1.5,
                        ),
                        textAlign: TextAlign.center,
                      )
                      .animate()
                      .fadeIn(duration: 800.ms, delay: 400.ms)
                      .slideY(begin: -0.2, end: 0),

                  const SizedBox(height: 60),

                  // Welcome Section with key features
                  Container(
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        child: Column(
                          children: [
                            // Feature 1: Quick Access
                            _buildFeatureCard(
                              icon: Icons.access_time,
                              title: localeProvider.translate(
                                'auth.features.quickAccess.title',
                              ),
                              description: localeProvider.translate(
                                'auth.features.quickAccess.description',
                              ),
                              isDark: isDark,
                              theme: theme,
                            ),
                            const SizedBox(height: 20),
                            // Feature 2: Transparent Process
                            _buildFeatureCard(
                              icon: Icons.visibility,
                              title: localeProvider.translate(
                                'auth.features.transparentProcess.title',
                              ),
                              description: localeProvider.translate(
                                'auth.features.transparentProcess.description',
                              ),
                              isDark: isDark,
                              theme: theme,
                            ),
                            const SizedBox(height: 20),
                            // Feature 3: 24/7 Support
                            _buildFeatureCard(
                              icon: Icons.support_agent,
                              title: localeProvider.translate(
                                'auth.features.support247.title',
                              ),
                              description: localeProvider.translate(
                                'auth.features.support247.description',
                              ),
                              isDark: isDark,
                              theme: theme,
                            ),
                          ],
                        ),
                      )
                      .animate()
                      .fadeIn(duration: 800.ms, delay: 600.ms)
                      .slideY(begin: 0.2, end: 0),

                  const SizedBox(height: 60),

                  // Login Button with enhanced styling
                  Container(
                        width: double.infinity,
                        height: 64,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(16),
                          gradient: LinearGradient(
                            colors: isDark
                                ? [
                                    const Color(0xFF06B6D4),
                                    const Color(0xFF8B5CF6),
                                  ]
                                : [
                                    const Color(0xFFFB7185),
                                    const Color(0xFFFB923C),
                                  ],
                          ),
                          boxShadow: [
                            BoxShadow(
                              color:
                                  (isDark
                                          ? const Color(0xFF06B6D4)
                                          : const Color(0xFFFB7185))
                                      .withOpacity(0.3),
                              blurRadius: 20,
                              spreadRadius: 2,
                              offset: const Offset(0, 8),
                            ),
                          ],
                        ),
                        child: ElevatedButton(
                          onPressed: _isLoading ? null : _signInWithGoogle,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.transparent,
                            shadowColor: Colors.transparent,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                            ),
                          ),
                          child: _isLoading
                              ? const SizedBox(
                                  width: 24,
                                  height: 24,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    valueColor: AlwaysStoppedAnimation<Color>(
                                      Colors.white,
                                    ),
                                  ),
                                )
                              : Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Container(
                                      width: 24,
                                      height: 24,
                                      decoration: BoxDecoration(
                                        color: Colors.white,
                                        borderRadius: BorderRadius.circular(
                                          400,
                                        ),
                                      ),
                                      child: Padding(
                                        padding: const EdgeInsets.all(2),
                                        child: Image.network(
                                          'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1200px-Google_%22G%22_logo.svg.png',
                                          fit: BoxFit.contain,
                                          errorBuilder:
                                              (context, error, stackTrace) {
                                                // Fallback to the original "G" if image fails to load
                                                return Container(
                                                  decoration:
                                                      const BoxDecoration(
                                                        color: Colors.blue,
                                                        shape: BoxShape.circle,
                                                      ),
                                                  child: const Center(
                                                    child: Text(
                                                      'G',
                                                      style: TextStyle(
                                                        color: Colors.white,
                                                        fontSize: 16,
                                                        fontWeight:
                                                            FontWeight.bold,
                                                      ),
                                                    ),
                                                  ),
                                                );
                                              },
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    Text(
                                      _isLoading
                                          ? localeProvider.translate(
                                              'auth.signingIn',
                                            )
                                          : localeProvider.translate(
                                              'auth.continueWithGoogle',
                                            ),
                                      style: const TextStyle(
                                        fontSize: 18,
                                        fontWeight: FontWeight.w600,
                                        color: Colors.white,
                                      ),
                                    ),
                                  ],
                                ),
                        ),
                      )
                      .animate()
                      .fadeIn(duration: 800.ms, delay: 800.ms)
                      .slideY(begin: 0.2, end: 0),

                  const SizedBox(height: 32),

                  // Language and Theme Toggles with enhanced styling
                  Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 20,
                          vertical: 12,
                        ),
                        decoration: BoxDecoration(
                          color: theme.cardColor.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: theme.dividerColor.withOpacity(0.2),
                            width: 1,
                          ),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            // Language Toggle
                            Row(
                              children: [
                                Text(
                                  localeProvider.locale == AppLocale.en
                                      ? localeProvider.translate(
                                          'auth.languageHindi',
                                        )
                                      : localeProvider.translate(
                                          'auth.languageEnglish',
                                        ),
                                  style: TextStyle(
                                    color: theme.primaryColor,
                                    fontWeight: FontWeight.w500,
                                    fontSize: 16,
                                  ),
                                ),
                                const SizedBox(width: 8),
                                IconButton(
                                  onPressed: () =>
                                      context.read<LocaleProvider>().setLocale(
                                        localeProvider.locale == AppLocale.en
                                            ? AppLocale.hi
                                            : AppLocale.en,
                                      ),
                                  icon: Icon(
                                    Icons.language,
                                    color: theme.primaryColor,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(width: 16),
                            // Theme Toggle
                            IconButton(
                              onPressed: () =>
                                  context.read<ThemeProvider>().toggleTheme(),
                              icon: Icon(
                                isDark ? Icons.light_mode : Icons.dark_mode,
                                color: theme.primaryColor,
                              ),
                            ),
                          ],
                        ),
                      )
                      .animate()
                      .fadeIn(duration: 800.ms, delay: 1000.ms)
                      .slideY(begin: 0.2, end: 0),

                  const SizedBox(height: 40),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWelcomeBackScreen(
    BuildContext context,
    ThemeData theme,
    LocaleProvider localeProvider,
    ThemeProvider themeProvider,
    AuthProvider authProvider,
    bool isDark,
  ) {
    return Scaffold(
      body: Stack(
        children: [
          // Animated Background (same as login screen)
          AnimatedBuilder(
            animation: _backgroundController,
            builder: (context, child) {
              return Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: isDark
                        ? [
                            Color.lerp(
                              const Color(0xFF0F172A),
                              const Color(0xFF1E1B4B),
                              _backgroundController.value,
                            )!,
                            Color.lerp(
                              const Color(0xFF1E293B),
                              const Color(0xFF312E81),
                              _backgroundController.value,
                            )!,
                            Color.lerp(
                              const Color(0xFF334155),
                              const Color(0xFF4338CA),
                              _backgroundController.value,
                            )!,
                          ]
                        : [
                            Color.lerp(
                              const Color(0xFFF8FAFC),
                              const Color(0xFFF0F9FF),
                              _backgroundController.value,
                            )!,
                            Color.lerp(
                              const Color(0xFFF1F5F9),
                              const Color(0xFFE0F2FE),
                              _backgroundController.value,
                            )!,
                            Color.lerp(
                              const Color(0xFFE2E8F0),
                              const Color(0xFFBAE6FD),
                              _backgroundController.value,
                            )!,
                          ],
                  ),
                ),
              );
            },
          ),

          // Animated Particles Background (same as login screen)
          AnimatedBuilder(
            animation: _particleController,
            builder: (context, child) {
              return CustomPaint(
                painter: ParticlePainter(
                  animation: _particleController,
                  isDark: isDark,
                ),
                size: MediaQuery.of(context).size,
              );
            },
          ),

          // Floating Decorative Elements (same as login screen)
          Positioned(
            top: MediaQuery.of(context).size.height * 0.1,
            left: MediaQuery.of(context).size.width * 0.1,
            child: AnimatedBuilder(
              animation: _backgroundController,
              builder: (context, child) {
                return Transform.rotate(
                  angle: _backgroundController.value * 2 * pi,
                  child: Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: LinearGradient(
                        colors: isDark
                            ? [
                                const Color(0xFF06B6D4).withOpacity(0.3),
                                const Color(0xFF8B5CF6).withOpacity(0.3),
                              ]
                            : [
                                const Color(0xFFFB7185).withOpacity(0.2),
                                const Color(0xFFFB923C).withOpacity(0.2),
                              ],
                      ),
                      boxShadow: [
                        BoxShadow(
                          color:
                              (isDark
                                      ? const Color(0xFF06B6D4)
                                      : const Color(0xFFFB7185))
                                  .withOpacity(0.3),
                          blurRadius: 20,
                          spreadRadius: 5,
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),

          Positioned(
            bottom: MediaQuery.of(context).size.height * 0.15,
            right: MediaQuery.of(context).size.width * 0.15,
            child: AnimatedBuilder(
              animation: _backgroundController,
              builder: (context, child) {
                return Transform.rotate(
                  angle: -_backgroundController.value * 2 * pi,
                  child: Container(
                    width: 60,
                    height: 60,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: LinearGradient(
                        colors: isDark
                            ? [
                                const Color(0xFFF59E0B).withOpacity(0.3),
                                const Color(0xFF8B5CF6).withOpacity(0.3),
                              ]
                            : [
                                const Color(0xFFFB923C).withOpacity(0.2),
                                const Color(0xFFF59E0B).withOpacity(0.2),
                              ],
                      ),
                      boxShadow: [
                        BoxShadow(
                          color:
                              (isDark
                                      ? const Color(0xFFF59E0B)
                                      : const Color(0xFFFB923C))
                                  .withOpacity(0.3),
                          blurRadius: 15,
                          spreadRadius: 3,
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),

          // Main Content - Welcome Back
          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const SizedBox(height: 60),

                  // Welcome Back Icon
                  Container(
                        padding: const EdgeInsets.all(32),
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: LinearGradient(
                            colors: isDark
                                ? [
                                    const Color(0xFF06B6D4),
                                    const Color(0xFF8B5CF6),
                                  ]
                                : [
                                    const Color(0xFFFB7185),
                                    const Color(0xFFFB923C),
                                  ],
                          ),
                          boxShadow: [
                            BoxShadow(
                              color:
                                  (isDark
                                          ? const Color(0xFF06B6D4)
                                          : const Color(0xFFFB7185))
                                      .withOpacity(0.4),
                              blurRadius: 30,
                              spreadRadius: 5,
                              offset: const Offset(0, 8),
                            ),
                          ],
                        ),
                        child: const Icon(
                          Icons.waving_hand,
                          size: 80,
                          color: Colors.white,
                        ),
                      )
                      .animate()
                      .fadeIn(duration: 800.ms)
                      .scale(
                        begin: const Offset(0.8, 0.8),
                        end: const Offset(1.0, 1.0),
                      )
                      .then()
                      .shimmer(duration: 2000.ms),

                  const SizedBox(height: 40),

                  // Welcome Back Title
                  ShaderMask(
                        shaderCallback: (bounds) => LinearGradient(
                          colors: isDark
                              ? [
                                  const Color(0xFF06B6D4),
                                  const Color(0xFF8B5CF6),
                                ]
                              : [
                                  const Color(0xFFFB7185),
                                  const Color(0xFFFB923C),
                                ],
                        ).createShader(bounds),
                        child: Text(
                          localeProvider.translate('welcomeBack'),
                          style: theme.textTheme.displayMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                            height: 1.2,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      )
                      .animate()
                      .fadeIn(duration: 800.ms, delay: 200.ms)
                      .slideY(begin: -0.2, end: 0),

                  const SizedBox(height: 16),

                  // User Greeting
                  Text(
                        '${localeProvider.translate('welcome.greeting')} ${authProvider.user?.displayName?.split(' ').first ?? 'User'}!',
                        style: theme.textTheme.headlineSmall?.copyWith(
                          color: theme.textTheme.bodyLarge?.color?.withOpacity(
                            0.9,
                          ),
                          fontWeight: FontWeight.w500,
                        ),
                        textAlign: TextAlign.center,
                      )
                      .animate()
                      .fadeIn(duration: 800.ms, delay: 400.ms)
                      .slideY(begin: -0.2, end: 0),

                  const SizedBox(height: 60),

                  // Quick Stats Cards
                  Container(
                        padding: EdgeInsets.symmetric(
                          horizontal: MediaQuery.of(context).size.width < 600
                              ? 10
                              : 20,
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                          children: [
                            Expanded(
                              child: _buildStatCard(
                                '12',
                                'Applications',
                                Icons.assignment,
                                isDark,
                                MediaQuery.of(context).size.width < 400,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: _buildStatCard(
                                '₹2.5L',
                                'Disbursed',
                                Icons.account_balance_wallet,
                                isDark,
                                MediaQuery.of(context).size.width < 400,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: _buildStatCard(
                                '3',
                                'Pending',
                                Icons.pending,
                                isDark,
                                MediaQuery.of(context).size.width < 400,
                              ),
                            ),
                          ],
                        ),
                      )
                      .animate()
                      .fadeIn(duration: 800.ms, delay: 600.ms)
                      .slideY(begin: 0.2, end: 0),

                  const SizedBox(height: 60),

                  // Continue to Dashboard Button
                  Container(
                        width: double.infinity,
                        height: 64,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(16),
                          gradient: LinearGradient(
                            colors: isDark
                                ? [
                                    const Color(0xFF06B6D4),
                                    const Color(0xFF8B5CF6),
                                  ]
                                : [
                                    const Color(0xFFFB7185),
                                    const Color(0xFFFB923C),
                                  ],
                          ),
                          boxShadow: [
                            BoxShadow(
                              color:
                                  (isDark
                                          ? const Color(0xFF06B6D4)
                                          : const Color(0xFFFB7185))
                                      .withOpacity(0.3),
                              blurRadius: 20,
                              spreadRadius: 2,
                              offset: const Offset(0, 8),
                            ),
                          ],
                        ),
                        child: ElevatedButton(
                          onPressed: () {
                            // Navigate to dashboard - this will be handled by the app's navigation
                            Navigator.of(
                              context,
                            ).pushReplacementNamed('/dashboard');
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.transparent,
                            shadowColor: Colors.transparent,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                            ),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                'Continue to Dashboard',
                                style: const TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.w600,
                                  color: Colors.white,
                                ),
                              ),
                              const SizedBox(width: 8),
                              const Icon(
                                Icons.arrow_forward,
                                color: Colors.white,
                              ),
                            ],
                          ),
                        ),
                      )
                      .animate()
                      .fadeIn(duration: 800.ms, delay: 800.ms)
                      .slideY(begin: 0.2, end: 0),

                  const SizedBox(height: 32),

                  // Sign Out Option
                  TextButton(
                        onPressed: () async {
                          await authProvider.signOut();
                        },
                        child: Text(
                          'Sign Out',
                          style: TextStyle(
                            color: theme.primaryColor,
                            fontSize: 16,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      )
                      .animate()
                      .fadeIn(duration: 800.ms, delay: 1000.ms)
                      .slideY(begin: 0.2, end: 0),

                  const SizedBox(height: 40),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFeatureCard({
    required IconData icon,
    required String title,
    required String description,
    required bool isDark,
    required ThemeData theme,
  }) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: theme.cardColor.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: theme.dividerColor.withOpacity(0.2),
          width: 1,
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              color:
                  (isDark ? const Color(0xFF06B6D4) : const Color(0xFFFB7185))
                      .withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              icon,
              color: isDark ? const Color(0xFF06B6D4) : const Color(0xFFFB7185),
              size: 24,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                    color: theme.textTheme.bodyLarge?.color,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  description,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: theme.textTheme.bodyMedium?.color?.withOpacity(0.7),
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard(
    String value,
    String label,
    IconData icon,
    bool isDark,
    bool isSmallScreen,
  ) {
    return Container(
      padding: EdgeInsets.all(isSmallScreen ? 12 : 16),
      decoration: BoxDecoration(
        color: (isDark ? Colors.white : Colors.black).withOpacity(0.05),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: (isDark ? Colors.white : Colors.black).withOpacity(0.1),
          width: 1,
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            color: isDark ? const Color(0xFF06B6D4) : const Color(0xFFFB7185),
            size: isSmallScreen ? 24 : 28,
          ),
          SizedBox(height: isSmallScreen ? 6 : 8),
          Text(
            value,
            style: TextStyle(
              fontSize: isSmallScreen ? 18 : 22,
              fontWeight: FontWeight.bold,
              color: isDark ? Colors.white : Colors.black,
            ),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: isSmallScreen ? 4 : 6),
          Text(
            label,
            style: TextStyle(
              fontSize: isSmallScreen ? 12 : 14,
              color: (isDark ? Colors.white : Colors.black).withOpacity(0.7),
            ),
            textAlign: TextAlign.center,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}

// Custom Grid Painter for subtle background pattern
class GridPainter extends CustomPainter {
  final bool isDark;

  GridPainter({required this.isDark});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 0.5
      ..color = (isDark ? Colors.white : Colors.black).withOpacity(0.03);

    const double spacing = 30;

    // Draw vertical lines
    for (double x = 0; x < size.width; x += spacing) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), paint);
    }

    // Draw horizontal lines
    for (double y = 0; y < size.height; y += spacing) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

// Custom Particle Painter for animated background particles
class ParticlePainter extends CustomPainter {
  final Animation<double> animation;
  final bool isDark;

  ParticlePainter({required this.animation, required this.isDark});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..style = PaintingStyle.fill
      ..color = (isDark ? const Color(0xFF06B6D4) : const Color(0xFFFB7185))
          .withOpacity(0.2);

    final random = Random(42); // Fixed seed for consistent pattern
    for (int i = 0; i < 50; i++) {
      final x =
          (random.nextDouble() * size.width + animation.value * 100) %
          size.width;
      final y =
          (random.nextDouble() * size.height + animation.value * 50) %
          size.height;
      final radius = random.nextDouble() * 3 + 1;
      canvas.drawCircle(Offset(x, y), radius, paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
