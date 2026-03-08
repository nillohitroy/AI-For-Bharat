import 'package:flutter/material.dart';

class ReportThreatScreen extends StatelessWidget {
  const ReportThreatScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.surface,
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.surface,
        title: const Text(
          'Report Suspicious Activity',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
        ),
        centerTitle: false,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Help protect the network by reporting suspicious numbers, messages, or links. Our AI will analyze it immediately.',
              style: TextStyle(
                color: isDark ? Colors.white70 : const Color(0xFF64748B),
                fontSize: 15,
                height: 1.5,
              ),
            ),
            const SizedBox(height: 24),

            _buildTextField(
              isDark,
              'Sender Number / ID',
              'e.g., +91 98765 43210',
              Icons.phone,
            ),
            const SizedBox(height: 16),
            _buildTextField(
              isDark,
              'Message Content',
              'Paste the suspicious text here...',
              Icons.message,
              maxLines: 4,
            ),
            const SizedBox(height: 24),

            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: () {
                  // Submit logic here
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: isDark
                      ? const Color(0xFF00F0FF)
                      : const Color(0xFF2563EB),
                  foregroundColor: isDark
                      ? const Color(0xFF0F172A)
                      : Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                  elevation: 0,
                ),
                child: const Text(
                  'Analyze & Report',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTextField(
    bool isDark,
    String label,
    String hint,
    IconData icon, {
    int maxLines = 1,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            fontWeight: FontWeight.bold,
            color: isDark ? Colors.white : const Color(0xFF334155),
          ),
        ),
        const SizedBox(height: 8),
        TextField(
          maxLines: maxLines,
          style: TextStyle(color: isDark ? Colors.white : Colors.black),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: TextStyle(
              color: isDark ? Colors.white30 : Colors.black38,
            ),
            prefixIcon: maxLines == 1
                ? Icon(icon, color: isDark ? Colors.white54 : Colors.black54)
                : null,
            filled: true,
            fillColor: isDark ? const Color(0xFF1E293B) : Colors.white,
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(
                color: isDark
                    ? const Color(0xFF334155)
                    : const Color(0xFFE2E8F0),
              ),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(
                color: isDark
                    ? const Color(0xFF00F0FF)
                    : const Color(0xFF2563EB),
                width: 2,
              ),
            ),
          ),
        ),
      ],
    );
  }
}
