// ignore_for_file: deprecated_member_use

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/providers/locale_provider.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/providers/connectivity_provider.dart';
import '../../../core/providers/theme_provider.dart';
import '../../../components/AnimatedBackground.dart';
import '../widgets/sidebar.dart';
import '../widgets/dashboard_content.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  int _selectedIndex = 0;
  bool _sidebarOpen = false;

  @override
  void initState() {
    super.initState();
    // Set initial sidebar state based on screen size
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _updateSidebarState();
    });
  }

  void _updateSidebarState() {
    if (mounted) {
      final screenWidth = MediaQuery.of(context).size.width;
      setState(() {
        // On desktop (lg+), sidebar is open by default
        // On mobile/tablet, sidebar is closed by default
        _sidebarOpen = screenWidth >= 1024;
      });
    }
  }

  void _onItemSelected(int index) {
    setState(() {
      _selectedIndex = index;
      // On mobile, close sidebar after selection
      if (MediaQuery.of(context).size.width < 1024) {
        _sidebarOpen = false;
      }
    });
  }

  void _toggleSidebar() {
    setState(() {
      _sidebarOpen = !_sidebarOpen;
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final localeProvider = context.watch<LocaleProvider>();
    final themeProvider = context.watch<ThemeProvider>();
    final screenWidth = MediaQuery.of(context).size.width;
    final isMobile = screenWidth < 1024;
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: Colors.transparent, // Make scaffold transparent
      body: Stack(
        children: [
          // Animated Background
          AnimatedBackground(isDark: isDark),
          // Rest of the UI
          Column(
            children: [
              // AppBar equivalent
              Container(
                height: kToolbarHeight + MediaQuery.of(context).padding.top,
                color: theme.appBarTheme.backgroundColor?.withOpacity(0.95),
                child: AppBar(
                  backgroundColor: Colors.transparent,
                  elevation: 0,
                  leading: isMobile
                      ? IconButton(
                          icon: Icon(
                            _sidebarOpen ? Icons.close : Icons.menu,
                            color: theme.appBarTheme.foregroundColor,
                          ),
                          onPressed: _toggleSidebar,
                        )
                      : null,
                  title: Row(
                    children: [
                      const SizedBox(width: 12),
                      // Title
                      Expanded(
                        child: Text(
                          _getPageTitle(localeProvider),
                          style: TextStyle(
                            color: theme.appBarTheme.foregroundColor,
                            fontWeight: FontWeight.w600,
                          ),
                          overflow: TextOverflow.ellipsis,
                          maxLines: 1,
                        ),
                      ),
                    ],
                  ),
                  actions: [
                    // Connectivity Indicator
                    Consumer<ConnectivityProvider>(
                      builder: (context, connectivityProvider, child) {
                        return Container(
                          margin: const EdgeInsets.only(right: 8),
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: connectivityProvider.isOnline
                                ? Colors.green.withOpacity(0.1)
                                : Colors.red.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: connectivityProvider.isOnline
                                  ? Colors.green
                                  : Colors.red,
                              width: 1,
                            ),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                connectivityProvider.isOnline
                                    ? Icons.wifi
                                    : Icons.wifi_off,
                                size: 16,
                                color: connectivityProvider.isOnline
                                    ? Colors.green
                                    : Colors.red,
                              ),
                              const SizedBox(width: 4),
                              Text(
                                connectivityProvider.isOnline
                                    ? 'Online'
                                    : 'Offline',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: connectivityProvider.isOnline
                                      ? Colors.green
                                      : Colors.red,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                    // User Menu
                    PopupMenuButton<String>(
                      onSelected: (value) {
                        if (value == 'logout') {
                          context.read<AuthProvider>().signOut();
                        }
                      },
                      itemBuilder: (context) => [
                        const PopupMenuItem(
                          value: 'profile',
                          child: Text('Profile'),
                        ),
                        const PopupMenuItem(
                          value: 'settings',
                          child: Text('Settings'),
                        ),
                        const PopupMenuDivider(),
                        const PopupMenuItem(
                          value: 'logout',
                          child: Text('Logout'),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              // Body
              Expanded(
                child: Stack(
                  children: [
                    Row(
                      children: [
                        if (!isMobile && _sidebarOpen) ...[
                          Sidebar(
                            selectedIndex: _selectedIndex,
                            onItemSelected: _onItemSelected,
                          ),
                        ],
                        Expanded(
                          child: DashboardContent(
                            selectedIndex: _selectedIndex,
                          ),
                        ),
                      ],
                    ),
                    // Mobile sidebar overlay
                    if (isMobile && _sidebarOpen)
                      Sidebar(
                        selectedIndex: _selectedIndex,
                        onItemSelected: _onItemSelected,
                        isOpen: _sidebarOpen,
                        onToggle: (bool value) => _toggleSidebar(),
                      ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  String _getPageTitle(LocaleProvider localeProvider) {
    switch (_selectedIndex) {
      case 0:
        return localeProvider.translate('nav.dashboardTitle');
      case 1:
        return localeProvider.translate('nav.applications');
      case 2:
        return localeProvider.translate('nav.beneficiaries');
      case 3:
        return localeProvider.translate('nav.disbursements');
      case 4:
        return localeProvider.translate('nav.reports');
      case 5:
        return localeProvider.translate('nav.grievance');
      case 6:
        return localeProvider.translate('nav.feedback');
      default:
        return localeProvider.translate('nav.dashboardTitle');
    }
  }
}
