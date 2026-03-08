import 'package:flutter/material.dart';
import 'services/sms_service.dart';

// Import all your newly created screens
// Make sure this path matches where your live feed actually is!
import 'screens/live_threat_feed.dart'; // <-- I updated this to match your file name

// 1. SWAP THIS IMPORT:
// import 'screens/digital_literacy.dart';
import 'screens/literacy_module_screen.dart';

import 'screens/report_threat.dart';
import 'screens/guardian_portal.dart';

class MainNavigationShell extends StatefulWidget {
  final ValueNotifier<ThemeMode> themeNotifier;

  const MainNavigationShell({super.key, required this.themeNotifier});

  @override
  State<MainNavigationShell> createState() => _MainNavigationShellState();
}

class _MainNavigationShellState extends State<MainNavigationShell> {
  int _currentIndex = 0;
  late final List<Widget> _screens;

  @override
  void initState() {
    super.initState();
    _screens = [
      LiveThreatFeedScreen(themeNotifier: widget.themeNotifier),

      // 2. SWAP THE WIDGET HERE:
      const LiteracyModuleScreen(),

      const ReportThreatScreen(),
      const GuardianPortalScreen(),
    ];

    // Trigger the SMS permission request and start the background listener
    _startSmsMonitor();
  }

  // Quick helper function to run the async initialization
  Future<void> _startSmsMonitor() async {
    final smsService = SmsService();
    await smsService.initializeAndRequestPermissions();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      // Displays the screen based on the currently selected tab
      body: _screens[_currentIndex],

      // Modern Material 3 Navigation Bar
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) => setState(() => _currentIndex = index),
        backgroundColor: Theme.of(context).colorScheme.surface,
        elevation: 8,
        shadowColor: isDark ? Colors.black : Colors.black12,

        // The highlight pill changes color based on the theme
        indicatorColor: isDark
            ? const Color(0xFF00F0FF).withOpacity(0.2)
            : const Color(0xFFDBEAFE),

        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.shield_outlined),
            selectedIcon: Icon(Icons.shield),
            label: 'Feed',
          ),
          NavigationDestination(
            icon: Icon(Icons.menu_book_outlined),
            selectedIcon: Icon(Icons.menu_book),
            label: 'Literacy', // This now opens the dynamic Academy Hub!
          ),
          NavigationDestination(
            icon: Icon(Icons.report_problem_outlined),
            selectedIcon: Icon(Icons.report_problem),
            label: 'Report',
          ),
          NavigationDestination(
            icon: Icon(Icons.security_outlined),
            selectedIcon: Icon(Icons.security),
            label: 'Guardian',
          ),
        ],
      ),
    );
  }
}
