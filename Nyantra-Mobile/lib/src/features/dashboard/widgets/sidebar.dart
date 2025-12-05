// ignore_for_file: deprecated_member_use

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/providers/locale_provider.dart';
import '../../../core/providers/theme_provider.dart';
import '../../../core/providers/auth_provider.dart';

class Sidebar extends StatefulWidget {
  final int selectedIndex;
  final Function(int) onItemSelected;
  final bool isOpen;
  final Function(bool)? onToggle;

  const Sidebar({
    super.key,
    required this.selectedIndex,
    required this.onItemSelected,
    this.isOpen = true,
    this.onToggle,
  });

  @override
  State<Sidebar> createState() => _SidebarState();
}

class _SidebarState extends State<Sidebar> with TickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
    _animation = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeInOut),
    );

    if (widget.isOpen) {
      _animationController.value = 1.0;
    }
  }

  @override
  void didUpdateWidget(Sidebar oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isOpen != oldWidget.isOpen) {
      if (widget.isOpen) {
        _animationController.forward();
      } else {
        _animationController.reverse();
      }
    }
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final localeProvider = context.watch<LocaleProvider>();
    final themeProvider = context.watch<ThemeProvider>();
    final authProvider = context.watch<AuthProvider>();
    final isDark = theme.brightness == Brightness.dark;

    final List<Map<String, dynamic>> menuItems = [
      {'icon': Icons.home, 'label': localeProvider.translate('nav.dashboard')},
      {
        'icon': Icons.file_copy,
        'label': localeProvider.translate('nav.applications'),
      },
      {
        'icon': Icons.people,
        'label': localeProvider.translate('nav.beneficiaries'),
      },
      {
        'icon': Icons.account_balance_wallet,
        'label': localeProvider.translate('nav.disbursements'),
      },
      {
        'icon': Icons.bar_chart,
        'label': localeProvider.translate('nav.reports'),
      },
      {
        'icon': Icons.message,
        'label': localeProvider.translate('nav.grievance'),
      },
      {
        'icon': Icons.feedback,
        'label': localeProvider.translate('nav.feedback'),
      },
    ];

    // Mobile Overlay Sidebar
    if (MediaQuery.of(context).size.width < 1024) {
      return AnimatedBuilder(
        animation: _animation,
        builder: (context, child) {
          return Stack(
            children: [
              // Backdrop
              if (widget.isOpen)
                GestureDetector(
                  onTap: () => widget.onToggle?.call(false),
                  child: Container(
                    color: Colors.black.withOpacity(0.5 * _animation.value),
                  ),
                ),

              // Sidebar
              Positioned(
                top: 0,
                left: 0,
                bottom: 0,
                child: Transform.translate(
                  offset: Offset(-300 * (1 - _animation.value), 0),
                  child: Container(
                    width: MediaQuery.of(context).size.width * 0.85,
                    height: MediaQuery.of(context).size.height,
                    constraints: const BoxConstraints(maxWidth: 280),
                    decoration: BoxDecoration(
                      color: theme.cardColor.withOpacity(0.95),
                      borderRadius: const BorderRadius.only(
                        topRight: Radius.circular(16),
                        bottomRight: Radius.circular(16),
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.2),
                          blurRadius: 20,
                          offset: const Offset(4, 0),
                        ),
                      ],
                    ),
                    child: Column(
                      children: [
                        // Header
                        Container(
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            border: Border(
                              bottom: BorderSide(
                                color: theme.dividerColor.withOpacity(0.1),
                                width: 1,
                              ),
                            ),
                          ),
                          child: Row(
                            children: [
                              // Logo
                              Container(
                                width: 40,
                                height: 40,
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(12),
                                  image: DecorationImage(
                                    image: AssetImage(
                                      isDark
                                          ? 'assets/images/Logo-Dark.png'
                                          : 'assets/images/Logo-Light.png',
                                    ),
                                    fit: BoxFit.contain,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      localeProvider.translate('nav.brandName'),
                                      style: theme.textTheme.titleMedium
                                          ?.copyWith(
                                            fontWeight: FontWeight.bold,
                                            color: theme
                                                .textTheme
                                                .bodyLarge
                                                ?.color,
                                          ),
                                    ),
                                    Text(
                                      localeProvider.translate(
                                        'auth.your_portal',
                                      ),
                                      style: theme.textTheme.bodySmall
                                          ?.copyWith(
                                            color: theme
                                                .textTheme
                                                .bodyMedium
                                                ?.color
                                                ?.withOpacity(0.7),
                                          ),
                                    ),
                                  ],
                                ),
                              ),
                              IconButton(
                                onPressed: () => widget.onToggle?.call(false),
                                icon: Icon(
                                  Icons.chevron_left,
                                  color: theme.textTheme.bodyMedium?.color,
                                ),
                                padding: EdgeInsets.zero,
                                constraints: const BoxConstraints(),
                              ),
                            ],
                          ),
                        ),

                        // Menu Items
                        Expanded(
                          child: ListView.builder(
                            padding: const EdgeInsets.symmetric(vertical: 8),
                            itemCount: menuItems.length,
                            itemBuilder: (context, index) {
                              final item = menuItems[index];
                              final isSelected = widget.selectedIndex == index;

                              return Container(
                                margin: const EdgeInsets.symmetric(
                                  horizontal: 12,
                                  vertical: 4,
                                ),
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(12),
                                  gradient: isSelected
                                      ? LinearGradient(
                                          colors: isDark
                                              ? [
                                                  const Color(0xFF06B6D4),
                                                  const Color(0xFF8B5CF6),
                                                ]
                                              : [
                                                  const Color(0xFFFB7185),
                                                  const Color(0xFFFB923C),
                                                ],
                                        )
                                      : null,
                                  color: isSelected ? null : Colors.transparent,
                                ),
                                child: ListTile(
                                  leading: Icon(
                                    item['icon'],
                                    color: isSelected
                                        ? Colors.white
                                        : theme.textTheme.bodyMedium?.color,
                                    size: 20,
                                  ),
                                  title: Text(
                                    item['label'],
                                    style: TextStyle(
                                      color: isSelected
                                          ? Colors.white
                                          : theme.textTheme.bodyMedium?.color,
                                      fontWeight: isSelected
                                          ? FontWeight.w600
                                          : FontWeight.w500,
                                    ),
                                  ),
                                  onTap: () {
                                    widget.onItemSelected(index);
                                  },
                                  dense: true,
                                  contentPadding: const EdgeInsets.symmetric(
                                    horizontal: 16,
                                    vertical: 8,
                                  ),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                ),
                              );
                            },
                          ),
                        ),

                        // Footer
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            border: Border(
                              top: BorderSide(
                                color: theme.dividerColor.withOpacity(0.1),
                                width: 1,
                              ),
                            ),
                          ),
                          child: Column(
                            children: [
                              // Theme and Language toggles
                              Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  // Theme Toggle
                                  IconButton(
                                    onPressed: () =>
                                        themeProvider.toggleTheme(),
                                    icon: Icon(
                                      isDark
                                          ? Icons.light_mode
                                          : Icons.dark_mode,
                                      color: theme.textTheme.bodyMedium?.color,
                                      size: 20,
                                    ),
                                    tooltip: isDark
                                        ? 'Light Mode'
                                        : 'Dark Mode',
                                  ),
                                  // Language Toggle
                                  IconButton(
                                    onPressed: () => localeProvider.setLocale(
                                      localeProvider.locale == AppLocale.en
                                          ? AppLocale.hi
                                          : AppLocale.en,
                                    ),
                                    icon: Icon(
                                      Icons.language,
                                      color: theme.textTheme.bodyMedium?.color,
                                      size: 20,
                                    ),
                                    tooltip: 'Change Language',
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              // Sign Out Button
                              SizedBox(
                                width: double.infinity,
                                child: ElevatedButton.icon(
                                  onPressed: () async {
                                    await authProvider.signOut();
                                  },
                                  icon: const Icon(Icons.logout, size: 16),
                                  label: Text(
                                    localeProvider.translate('auth.sign_out'),
                                  ),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.red.shade50,
                                    foregroundColor: Colors.red.shade700,
                                    elevation: 0,
                                    padding: const EdgeInsets.symmetric(
                                      vertical: 12,
                                    ),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(8),
                                      side: BorderSide(
                                        color: Colors.red.shade200,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          );
        },
      );
    }

    // Desktop Sidebar
    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      width: widget.isOpen ? 280 : 80,
      decoration: BoxDecoration(
        color: theme.cardColor.withOpacity(0.95),
        border: Border(
          right: BorderSide(
            color: theme.dividerColor.withOpacity(0.1),
            width: 1,
          ),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(2, 0),
          ),
        ],
      ),
      child: Column(
        children: [
          // Header
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              border: Border(
                bottom: BorderSide(
                  color: theme.dividerColor.withOpacity(0.1),
                  width: 1,
                ),
              ),
            ),
            child: widget.isOpen
                ? Row(
                    children: [
                      // Logo
                      Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(12),
                          image: DecorationImage(
                            image: AssetImage(
                              isDark
                                  ? 'assets/images/Logo-Dark.png'
                                  : 'assets/images/Logo-Light.png',
                            ),
                            fit: BoxFit.contain,
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              localeProvider.translate('nav.brandName'),
                              style: theme.textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.bold,
                                color: theme.textTheme.bodyLarge?.color,
                              ),
                            ),
                            Text(
                              localeProvider.translate('auth.your_portal'),
                              style: theme.textTheme.bodySmall?.copyWith(
                                color: theme.textTheme.bodyMedium?.color
                                    ?.withOpacity(0.7),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  )
                : Center(
                    child: Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(12),
                        image: DecorationImage(
                          image: AssetImage(
                            isDark
                                ? 'assets/images/Logo-Dark.png'
                                : 'assets/images/Logo-Light.png',
                          ),
                          fit: BoxFit.contain,
                        ),
                      ),
                    ),
                  ),
          ),

          // Menu Items
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(vertical: 8),
              itemCount: menuItems.length,
              itemBuilder: (context, index) {
                final item = menuItems[index];
                final isSelected = widget.selectedIndex == index;

                return Container(
                  margin: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(12),
                    gradient: isSelected
                        ? LinearGradient(
                            colors: isDark
                                ? [
                                    const Color(0xFF06B6D4),
                                    const Color(0xFF8B5CF6),
                                  ]
                                : [
                                    const Color(0xFFFB7185),
                                    const Color(0xFFFB923C),
                                  ],
                          )
                        : null,
                    color: isSelected ? null : Colors.transparent,
                  ),
                  child: widget.isOpen
                      ? ListTile(
                          leading: Icon(
                            item['icon'],
                            color: isSelected
                                ? Colors.white
                                : theme.textTheme.bodyMedium?.color,
                            size: 20,
                          ),
                          title: Text(
                            item['label'],
                            style: TextStyle(
                              color: isSelected
                                  ? Colors.white
                                  : theme.textTheme.bodyMedium?.color,
                              fontWeight: isSelected
                                  ? FontWeight.w600
                                  : FontWeight.w500,
                            ),
                          ),
                          onTap: () => widget.onItemSelected(index),
                          dense: true,
                          contentPadding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 8,
                          ),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        )
                      : IconButton(
                          onPressed: () => widget.onItemSelected(index),
                          icon: Icon(
                            item['icon'],
                            color: isSelected
                                ? theme.primaryColor
                                : theme.textTheme.bodyMedium?.color,
                            size: 20,
                          ),
                          tooltip: item['label'],
                        ),
                );
              },
            ),
          ),

          // Footer
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              border: Border(
                top: BorderSide(
                  color: theme.dividerColor.withOpacity(0.1),
                  width: 1,
                ),
              ),
            ),
            child: widget.isOpen
                ? Column(
                    children: [
                      // Theme and Language toggles
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          // Theme Toggle
                          IconButton(
                            onPressed: () => themeProvider.toggleTheme(),
                            icon: Icon(
                              isDark ? Icons.light_mode : Icons.dark_mode,
                              color: theme.textTheme.bodyMedium?.color,
                              size: 20,
                            ),
                            tooltip: isDark
                                ? localeProvider.translate('ui.lightMode')
                                : localeProvider.translate('ui.darkMode'),
                          ),
                          // Language Toggle
                          IconButton(
                            onPressed: () => localeProvider.setLocale(
                              localeProvider.locale == AppLocale.en
                                  ? AppLocale.hi
                                  : AppLocale.en,
                            ),
                            icon: Icon(
                              Icons.language,
                              color: theme.textTheme.bodyMedium?.color,
                              size: 20,
                            ),
                            tooltip: localeProvider.translate(
                              'ui.changeLanguage',
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      // Sign Out Button
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: () async {
                            await authProvider.signOut();
                          },
                          icon: const Icon(Icons.logout, size: 16),
                          label: Text(
                            localeProvider.translate('auth.sign_out'),
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.red.shade50,
                            foregroundColor: Colors.red.shade700,
                            elevation: 0,
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                              side: BorderSide(color: Colors.red.shade200),
                            ),
                          ),
                        ),
                      ),
                    ],
                  )
                : Column(
                    children: [
                      // Theme Toggle
                      IconButton(
                        onPressed: () => themeProvider.toggleTheme(),
                        icon: Icon(
                          isDark ? Icons.light_mode : Icons.dark_mode,
                          color: theme.textTheme.bodyMedium?.color,
                          size: 20,
                        ),
                        tooltip: isDark
                            ? localeProvider.translate('ui.lightMode')
                            : localeProvider.translate('ui.darkMode'),
                      ),
                      // Language Toggle
                      IconButton(
                        onPressed: () => localeProvider.setLocale(
                          localeProvider.locale == AppLocale.en
                              ? AppLocale.hi
                              : AppLocale.en,
                        ),
                        icon: Icon(
                          Icons.language,
                          color: theme.textTheme.bodyMedium?.color,
                          size: 20,
                        ),
                        tooltip: localeProvider.translate('ui.changeLanguage'),
                      ),
                      const SizedBox(height: 8),
                      // Sign Out Button
                      IconButton(
                        onPressed: () async {
                          await authProvider.signOut();
                        },
                        icon: const Icon(
                          Icons.logout,
                          color: Colors.red,
                          size: 20,
                        ),
                        tooltip: localeProvider.translate('ui.signOut'),
                      ),
                    ],
                  ),
          ),
        ],
      ),
    );
  }
}
