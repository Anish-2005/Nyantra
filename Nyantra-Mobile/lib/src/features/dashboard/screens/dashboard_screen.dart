import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/providers/locale_provider.dart';
import '../../../core/providers/auth_provider.dart';
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
    final screenWidth = MediaQuery.of(context).size.width;
    final isMobile = screenWidth < 1024;

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      appBar: AppBar(
        backgroundColor: theme.appBarTheme.backgroundColor?.withOpacity(0.95),
        elevation: 0,
        leading: IconButton(
          icon: Icon(
            _sidebarOpen ? Icons.close : Icons.menu,
            color: theme.appBarTheme.foregroundColor,
          ),
          onPressed: _toggleSidebar,
        ),
        title: Text(
          _getPageTitle(localeProvider),
          style: TextStyle(
            color: theme.appBarTheme.foregroundColor,
            fontWeight: FontWeight.w600,
          ),
        ),
        actions: [
          // User Menu
          PopupMenuButton<String>(
            onSelected: (value) {
              if (value == 'logout') {
                context.read<AuthProvider>().signOut();
              }
            },
            itemBuilder: (context) => [
              const PopupMenuItem(value: 'profile', child: Text('Profile')),
              const PopupMenuItem(value: 'settings', child: Text('Settings')),
              const PopupMenuDivider(),
              const PopupMenuItem(value: 'logout', child: Text('Logout')),
            ],
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Icon(
                Icons.account_circle,
                color: theme.appBarTheme.foregroundColor,
              ),
            ),
          ),
        ],
      ),
      body: Stack(
        children: [
          // Main Content - positioned to account for sidebar
          Container(
            margin: EdgeInsets.only(
              left: isMobile ? 0 : (_sidebarOpen ? 280 : 80),
            ),
            child: DashboardContent(selectedIndex: _selectedIndex),
          ),

          // Sidebar
          Sidebar(
            selectedIndex: _selectedIndex,
            onItemSelected: _onItemSelected,
            isOpen: _sidebarOpen,
            onToggle: (bool value) => _toggleSidebar(),
          ),
        ],
      ),
    );
  }

  String _getPageTitle(LocaleProvider localeProvider) {
    switch (_selectedIndex) {
      case 0:
        return localeProvider.translate('nav.dashboard');
      case 1:
        return localeProvider.translate('nav.applications');
      case 2:
        return localeProvider.translate('nav.beneficiaries');
      case 3:
        return localeProvider.translate('nav.disbursements');
      case 4:
        return localeProvider.translate('nav.grievance');
      case 5:
        return localeProvider.translate('nav.feedback');
      default:
        return 'Dashboard';
    }
  }
}
