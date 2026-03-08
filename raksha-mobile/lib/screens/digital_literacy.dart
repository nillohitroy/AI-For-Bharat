import 'package:flutter/material.dart';

class DigitalLiteracyScreen extends StatelessWidget {
  const DigitalLiteracyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.surface,
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.surface,
        title: const Text(
          'Security Training',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        centerTitle: false,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        physics: const BouncingScrollPhysics(),
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF1E293B) : Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: isDark
                    ? const Color(0xFF334155)
                    : const Color(0xFFE2E8F0),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Your Progress',
                  style: TextStyle(
                    color: isDark ? Colors.white70 : Colors.black54,
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Beginner Level',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                        color: isDark ? Colors.white : Colors.black,
                      ),
                    ),
                    Text(
                      '2/5 Modules',
                      style: TextStyle(
                        color: isDark
                            ? const Color(0xFF00F0FF)
                            : const Color(0xFF2563EB),
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                LinearProgressIndicator(
                  value: 0.4,
                  backgroundColor: isDark
                      ? const Color(0xFF334155)
                      : const Color(0xFFE2E8F0),
                  valueColor: AlwaysStoppedAnimation<Color>(
                    isDark ? const Color(0xFF00F0FF) : const Color(0xFF2563EB),
                  ),
                  borderRadius: BorderRadius.circular(8),
                  minHeight: 8,
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'Available Modules',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: isDark ? Colors.white : const Color(0xFF334155),
            ),
          ),
          const SizedBox(height: 16),

          _buildCourseCard(
            context,
            'Recognizing UPI Scams',
            'Learn how to identify fake payment requests.',
            Icons.qr_code_scanner,
            1.0,
            isDark,
          ),
          _buildCourseCard(
            context,
            'Phishing Links 101',
            'Spot dangerous URLs in SMS and WhatsApp.',
            Icons.link_off,
            0.0,
            isDark,
          ),
          _buildCourseCard(
            context,
            'Social Engineering',
            'Understand how scammers manipulate emotions.',
            Icons.psychology,
            0.0,
            isDark,
          ),
        ],
      ),
    );
  }

  Widget _buildCourseCard(
    BuildContext context,
    String title,
    String subtitle,
    IconData icon,
    double progress,
    bool isDark,
  ) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
        ),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.all(16),
        leading: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: progress == 1.0
                ? (isDark ? const Color(0xFF065F46) : const Color(0xFFD1FAE5))
                : (isDark ? const Color(0xFF1E3A8A) : const Color(0xFFDBEAFE)),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(
            icon,
            color: progress == 1.0
                ? (isDark ? const Color(0xFF34D399) : const Color(0xFF059669))
                : (isDark ? const Color(0xFF60A5FA) : const Color(0xFF2563EB)),
          ),
        ),
        title: Text(
          title,
          style: TextStyle(
            fontWeight: FontWeight.bold,
            color: isDark ? Colors.white : const Color(0xFF0F172A),
          ),
        ),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 4.0),
          child: Text(
            subtitle,
            style: TextStyle(
              color: isDark ? Colors.white70 : const Color(0xFF64748B),
              fontSize: 13,
            ),
          ),
        ),
        trailing: progress == 1.0
            ? const Icon(Icons.check_circle, color: Colors.green)
            : const Icon(Icons.play_circle_fill, color: Colors.grey),
      ),
    );
  }
}
