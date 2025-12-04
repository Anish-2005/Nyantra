// ignore_for_file: file_names, deprecated_member_use

import 'package:flutter/material.dart';
import 'dart:math';

class AnimatedBackground extends StatefulWidget {
  final bool isDark;

  const AnimatedBackground({super.key, required this.isDark});

  @override
  State<AnimatedBackground> createState() => _AnimatedBackgroundState();
}

class _AnimatedBackgroundState extends State<AnimatedBackground>
    with TickerProviderStateMixin {
  late AnimationController _particleController;
  late AnimationController _backgroundController;

  @override
  void initState() {
    super.initState();
    _particleController = AnimationController(
      duration: const Duration(seconds: 20),
      vsync: this,
    )..repeat();

    _backgroundController = AnimationController(
      duration: const Duration(seconds: 10),
      vsync: this,
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _particleController.dispose();
    _backgroundController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // Animated Background
        AnimatedBuilder(
          animation: _backgroundController,
          builder: (context, child) {
            return Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: widget.isDark
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

        // Background decorative gradients (dark mode only)
        if (widget.isDark) ...[
          Positioned.fill(
            child: Opacity(
              opacity: 0.1,
              child: Container(
                decoration: BoxDecoration(
                  gradient: RadialGradient(
                    center: Alignment.topLeft,
                    radius: 1.5,
                    colors: [const Color(0xFF06B6D4), Colors.transparent],
                  ),
                ),
              ),
            ),
          ),
          Positioned.fill(
            child: Opacity(
              opacity: 0.1,
              child: Container(
                decoration: BoxDecoration(
                  gradient: RadialGradient(
                    center: Alignment.bottomRight,
                    radius: 1.5,
                    colors: [const Color(0xFF8B5CF6), Colors.transparent],
                  ),
                ),
              ),
            ),
          ),
        ],

        // Animated Particles Background
        AnimatedBuilder(
          animation: _particleController,
          builder: (context, child) {
            return CustomPaint(
              painter: ParticlePainter(
                animation: _particleController,
                isDark: widget.isDark,
              ),
              size: MediaQuery.of(context).size,
            );
          },
        ),

        // Floating Decorative Elements
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
                      colors: widget.isDark
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
                            (widget.isDark
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

        // Additional floating element
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
                      colors: widget.isDark
                          ? [
                              const Color(0xFF8B5CF6).withOpacity(0.3),
                              const Color(0xFF06B6D4).withOpacity(0.3),
                            ]
                          : [
                              const Color(0xFFFB923C).withOpacity(0.2),
                              const Color(0xFFFB7185).withOpacity(0.2),
                            ],
                    ),
                    boxShadow: [
                      BoxShadow(
                        color:
                            (widget.isDark
                                    ? const Color(0xFF8B5CF6)
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
      ],
    );
  }
}

class ParticlePainter extends CustomPainter {
  final Animation<double> animation;
  final bool isDark;

  ParticlePainter({required this.animation, required this.isDark});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..style = PaintingStyle.fill
      ..color = (isDark ? const Color(0xFF06B6D4) : const Color(0xFFFB7185))
          .withOpacity(0.1);

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
