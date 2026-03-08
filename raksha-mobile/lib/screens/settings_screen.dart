import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api_service.dart';
import 'auth_screen.dart'; // Make sure this path is correct

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _isLoading = true;
  String _email = "Loading...";
  String _fullName = "Guardian";
  int _exp = 0;
  int _completedCount = 0;
  int _level = 1;

  @override
  void initState() {
    super.initState();
    _loadProfileData();
  }

  Future<void> _loadProfileData() async {
    setState(() => _isLoading = true);

    // 1. Get Base Auth Info from Supabase
    final user = Supabase.instance.client.auth.currentUser;
    if (user != null) {
      _email = user.email ?? "Unknown Email";

      // Attempt to grab full name from metadata, otherwise fallback to email prefix
      final metadata = user.userMetadata;
      if (metadata != null && metadata.containsKey('full_name')) {
        _fullName = metadata['full_name'];
      } else {
        _fullName = _email.split('@').first.toUpperCase();
      }
    }

    // 2. Get Gamification Stats from Python API
    final dashData = await ApiService().fetchLiteracyDashboard();
    if (dashData != null) {
      _exp = dashData['xp'] ?? 0;
      final completed = dashData['completed_lessons'] as List<dynamic>? ?? [];
      _completedCount = completed.length;
      _level = (_exp ~/ 500) + 1;
    }

    if (mounted) {
      setState(() => _isLoading = false);
    }
  }

  // ==========================================
  // LOGOUT LOGIC
  // ==========================================
  Future<void> _logout() async {
    // Show loading indicator
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) =>
          const Center(child: CircularProgressIndicator(color: Colors.teal)),
    );

    try {
      // 1. End Supabase session
      await Supabase.instance.client.auth.signOut();

      // 2. Wipe local SharedPreferences
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('guardian_id');

      // 3. Destroy all routes and go to AuthScreen
      if (mounted) {
        Navigator.of(context).pushAndRemoveUntil(
          MaterialPageRoute(builder: (context) => const AuthScreen()),
          (Route<dynamic> route) => false,
        );
      }
    } catch (e) {
      if (mounted) {
        Navigator.pop(context); // Remove loading dialog
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text("Logout failed: $e"),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile & Settings'),
        backgroundColor: Theme.of(context).colorScheme.surface,
        elevation: 0,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Colors.teal))
          : RefreshIndicator(
              onRefresh: _loadProfileData,
              color: Colors.teal,
              child: ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                children: [
                  // --- AVATAR ---
                  CircleAvatar(
                    radius: 50,
                    backgroundColor: const Color(0xFF1E293B),
                    child: Text(
                      _fullName.isNotEmpty ? _fullName[0].toUpperCase() : 'G',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 32,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // --- NAME & EMAIL ---
                  Center(
                    child: Column(
                      children: [
                        Text(
                          _fullName,
                          style: const TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          _email,
                          style: const TextStyle(
                            fontSize: 14,
                            color: Colors.grey,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 32),

                  // --- STATS CARDS ---
                  Row(
                    children: [
                      Expanded(
                        child: _buildStatCard(
                          "Level",
                          "$_level",
                          Icons.star_rounded,
                          Colors.orange,
                          isDark,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: _buildStatCard(
                          "Total EXP",
                          "$_exp",
                          Icons.bolt_rounded,
                          Colors.blue,
                          isDark,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  _buildStatCard(
                    "Modules Conquered",
                    "$_completedCount",
                    Icons.verified_user_rounded,
                    Colors.green,
                    isDark,
                  ),

                  const SizedBox(height: 32),

                  // --- YOUR ORIGINAL LIST TILES ---
                  ListTile(
                    leading: const Icon(Icons.person_outline),
                    title: const Text('Edit Profile'),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () {
                      // Navigate to Edit Profile screen later
                    },
                  ),
                  const Divider(),
                  ListTile(
                    leading: const Icon(Icons.privacy_tip_outlined),
                    title: const Text('SMS Permissions'),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () {
                      // Handle Permissions
                    },
                  ),
                  const Divider(),

                  // --- LOGOUT TILE ---
                  const SizedBox(height: 16),
                  ListTile(
                    leading: const Icon(
                      Icons.logout_rounded,
                      color: Colors.redAccent,
                    ),
                    title: const Text(
                      'Log Out',
                      style: TextStyle(
                        color: Colors.redAccent,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    onTap: _logout,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    tileColor: Colors.redAccent.withOpacity(0.1),
                  ),
                  const SizedBox(height: 32),
                ],
              ),
            ),
    );
  }

  // Helper widget to draw the stat cards
  Widget _buildStatCard(
    String title,
    String value,
    IconData icon,
    Color color,
    bool isDark,
  ) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E293B) : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withOpacity(0.3), width: 1.5),
        boxShadow: [
          if (!isDark)
            BoxShadow(
              color: color.withOpacity(0.1),
              blurRadius: 8,
              offset: const Offset(0, 4),
            ),
        ],
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 28),
          const SizedBox(height: 8),
          Text(
            value,
            style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 2),
          Text(
            title,
            style: const TextStyle(fontSize: 12, color: Colors.grey),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
