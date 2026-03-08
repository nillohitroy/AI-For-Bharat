import 'package:flutter/material.dart';
import 'dart:math';
import '../services/api_service.dart';
import 'literacy_details_screen.dart';

class LiteracyModuleScreen extends StatefulWidget {
  const LiteracyModuleScreen({super.key});

  @override
  State<LiteracyModuleScreen> createState() => _LiteracyModuleScreenState();
}

class _LiteracyModuleScreenState extends State<LiteracyModuleScreen> {
  int _exp = 0;
  int _level = 1;
  List<dynamic> _customLessons = [];
  List<dynamic> _completedLessons = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadDashboardData();
  }

  Future<void> _loadDashboardData() async {
    setState(() => _isLoading = true);
    final data = await ApiService().fetchLiteracyDashboard();

    if (mounted && data != null) {
      setState(() {
        _exp = data['xp'] ?? 0;
        _level =
            (_exp ~/ 500) + 1; // Assuming 500 XP per level based on your JSON
        _customLessons = data['custom_lessons'] ?? [];
        _completedLessons = data['completed_lessons'] ?? [];
        _isLoading = false;
      });
    } else {
      setState(() => _isLoading = false);
    }
  }

  // ==========================================
  // NEW: Random Quiz Generator Logic
  // ==========================================
  void _startRandomQuiz() {
    // A list of common scams targeting everyday users
    final commonThreats = [
      {"title": "UPI Payment Request Scam", "category": "Financial Fraud"},
      {
        "title": "Electricity Bill Disconnection",
        "category": "Social Engineering",
      },
      {"title": "WhatsApp Pink / Malicious APK", "category": "Malware"},
      {"title": "Telegram Work From Home Tasks", "category": "Job Fraud"},
      {"title": "Fake Delivery KYC Update", "category": "Phishing"},
      {"title": "Aadhaar / PAN Card Blocked", "category": "Identity Theft"},
      {"title": "Fake Customer Care Number", "category": "Vishing"},
    ];

    // Pick a random threat
    final random = Random();
    final selectedThreat = commonThreats[random.nextInt(commonThreats.length)];

    // Create dynamic lesson data.
    // We use the current timestamp as the ID so it's always unique,
    // allowing the user to grind endless random quizzes for EXP!
    final dynamicLessonData = {
      "id": DateTime.now().millisecondsSinceEpoch,
      "title": selectedThreat["title"],
      "category": selectedThreat["category"],
      "reward": 50, // Standard reward for random practice
      "description": "A dynamic practice scenario based on real-world reports.",
    };

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => LiteracyDetailsScreen(
          lessonData: dynamicLessonData,
          isAlreadyCompleted: false, // Always false so they can earn the reward
          isPractice: true,
        ),
      ),
    ).then((_) => _loadDashboardData()); // Refresh EXP when they return
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    // Calculate progress
    final int expIntoCurrentLevel = _exp % 500;
    final double progressPercent = expIntoCurrentLevel / 500;

    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.surface,
      appBar: AppBar(
        title: const Text('Cyber Academy'),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Colors.teal))
          : RefreshIndicator(
              onRefresh: _loadDashboardData,
              color: Colors.teal,
              child: CustomScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                slivers: [
                  // 1. Level & EXP Header
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.all(20.0),
                      child: Container(
                        padding: const EdgeInsets.all(24),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: isDark
                                ? [
                                    const Color(0xFF0F766E),
                                    const Color(0xFF064E3B),
                                  ]
                                : [Colors.teal.shade400, Colors.teal.shade700],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          borderRadius: BorderRadius.circular(24),
                        ),
                        child: Column(
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text(
                                      "Guardian Level",
                                      style: TextStyle(
                                        color: Colors.white70,
                                        fontSize: 14,
                                      ),
                                    ),
                                    Text(
                                      "Level $_level",
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 32,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ],
                                ),
                                Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: Colors.white.withOpacity(0.2),
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Icon(
                                    Icons.school,
                                    color: Colors.white,
                                    size: 32,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 24),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  "$_exp Total EXP",
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                Text(
                                  "${500 - expIntoCurrentLevel} to Level ${_level + 1}",
                                  style: const TextStyle(color: Colors.white70),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            LinearProgressIndicator(
                              value: progressPercent,
                              backgroundColor: Colors.white.withOpacity(0.2),
                              valueColor: const AlwaysStoppedAnimation<Color>(
                                Colors.white,
                              ),
                              minHeight: 8,
                              borderRadius: BorderRadius.circular(4),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),

                  // ==========================================
                  // NEW: Random Practice Button
                  // ==========================================
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 20.0,
                        vertical: 8.0,
                      ),
                      child: InkWell(
                        onTap: _startRandomQuiz,
                        borderRadius: BorderRadius.circular(20),
                        child: Container(
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            color: isDark
                                ? Colors.blueAccent.withOpacity(0.15)
                                : Colors.blue.shade50,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: Colors.blueAccent.withOpacity(0.3),
                              width: 2,
                            ),
                          ),
                          child: Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(12),
                                decoration: const BoxDecoration(
                                  color: Colors.blueAccent,
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(
                                  Icons.shuffle_rounded,
                                  color: Colors.white,
                                ),
                              ),
                              const SizedBox(width: 16),
                              const Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      "Quick Practice",
                                      style: TextStyle(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 18,
                                      ),
                                    ),
                                    SizedBox(height: 4),
                                    Text(
                                      "Test your skills against common threats. +50 EXP",
                                      style: TextStyle(
                                        fontSize: 13,
                                        color: Colors.blueAccent,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const Icon(
                                Icons.arrow_forward_ios_rounded,
                                color: Colors.blueAccent,
                                size: 16,
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),

                  const SliverToBoxAdapter(
                    child: Padding(
                      padding: EdgeInsets.only(
                        left: 20.0,
                        right: 20.0,
                        top: 24.0,
                        bottom: 8.0,
                      ),
                      child: Text(
                        "Syllabus Modules",
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),

                  // 2. Custom Lessons List
                  SliverList(
                    delegate: SliverChildBuilderDelegate((context, index) {
                      final lesson = _customLessons[index];
                      final isCompleted = _completedLessons.contains(
                        lesson['id'],
                      );
                      final isLocked = _exp < (lesson['requiredXp'] ?? 0);

                      return Padding(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 20.0,
                          vertical: 8.0,
                        ),
                        child: InkWell(
                          onTap: isLocked
                              ? null
                              : () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (context) =>
                                          LiteracyDetailsScreen(
                                            lessonData: lesson,
                                            isAlreadyCompleted: isCompleted,
                                          ),
                                    ),
                                  ).then((_) => _loadDashboardData());
                                },
                          borderRadius: BorderRadius.circular(16),
                          child: Container(
                            decoration: BoxDecoration(
                              color: isDark
                                  ? const Color(0xFF1E293B)
                                  : Colors.white,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(
                                color: isCompleted
                                    ? Colors.green.withOpacity(0.5)
                                    : (isDark
                                          ? const Color(0xFF334155)
                                          : Colors.grey.shade300),
                              ),
                            ),
                            child: ListTile(
                              contentPadding: const EdgeInsets.all(16),
                              leading: CircleAvatar(
                                backgroundColor: isLocked
                                    ? Colors.grey.withOpacity(0.2)
                                    : (isCompleted
                                          ? Colors.green.withOpacity(0.2)
                                          : Colors.teal.withOpacity(0.2)),
                                child: Icon(
                                  isLocked
                                      ? Icons.lock
                                      : (isCompleted
                                            ? Icons.check_rounded
                                            : Icons.play_arrow_rounded),
                                  color: isLocked
                                      ? Colors.grey
                                      : (isCompleted
                                            ? Colors.green
                                            : Colors.teal),
                                ),
                              ),
                              title: Text(
                                lesson['title'] ?? 'Lesson',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  color: isLocked ? Colors.grey : null,
                                ),
                              ),
                              subtitle: Padding(
                                padding: const EdgeInsets.only(top: 4.0),
                                child: Text(
                                  isLocked
                                      ? 'Unlocks at ${lesson['requiredXp']} XP'
                                      : (isCompleted
                                            ? 'Completed'
                                            : '+${lesson['reward']} EXP Available'),
                                  style: TextStyle(
                                    color: isLocked
                                        ? Colors.grey
                                        : (isCompleted
                                              ? Colors.green
                                              : Colors.teal),
                                    fontWeight: FontWeight.w600,
                                    fontSize: 12,
                                  ),
                                ),
                              ),
                              trailing: isLocked
                                  ? null
                                  : const Icon(Icons.chevron_right),
                            ),
                          ),
                        ),
                      );
                    }, childCount: _customLessons.length),
                  ),

                  const SliverToBoxAdapter(child: SizedBox(height: 40)),
                ],
              ),
            ),
    );
  }
}
