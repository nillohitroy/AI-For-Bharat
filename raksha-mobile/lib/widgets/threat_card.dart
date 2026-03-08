import 'package:flutter/material.dart';
import '../screens/threat_details_screen.dart';

class ThreatCard extends StatelessWidget {
  final Map<String, dynamic> threatData;

  const ThreatCard({super.key, required this.threatData});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final String sender = threatData['sender'] ?? 'Unknown Sender';
    final String content = threatData['content'] ?? 'No content available';

    // Grabbing the risk score from your Bedrock backend JSON
    final String severity =
        threatData['riskScore'] ?? threatData['severity'] ?? 'HIGH';
    final bool isHighRisk = severity == 'HIGH' || severity == 'CRITICAL';
    final bool isSafe = severity == 'LOW' || severity == 'SAFE';

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
      child: Container(
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
          ),
          boxShadow: [
            BoxShadow(
              color: isDark ? Colors.black26 : Colors.black12,
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Material(
          color: Colors.transparent,
          borderRadius: BorderRadius.circular(16),
          child: InkWell(
            borderRadius: BorderRadius.circular(16),
            onTap: () {
              // Navigate to the full, separate screen
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => ThreatDetailsScreen(threat: threatData),
                ),
              );
            },
            child: ListTile(
              contentPadding: const EdgeInsets.all(16),
              leading: Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: isDark
                      ? (isSafe
                            ? Colors.green.withOpacity(0.2)
                            : (isHighRisk
                                  ? const Color(0xFF7F1D1D).withOpacity(0.4)
                                  : Colors.orange.withOpacity(0.2)))
                      : (isSafe
                            ? Colors.green.shade100
                            : (isHighRisk
                                  ? const Color(0xFFFEE2E2)
                                  : Colors.orange.shade100)),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  isSafe
                      ? Icons.verified_user_rounded
                      : (isHighRisk
                            ? Icons.warning_rounded
                            : Icons.info_outline_rounded),
                  color: isDark
                      ? (isSafe
                            ? Colors.greenAccent
                            : (isHighRisk
                                  ? const Color(0xFFF87171)
                                  : Colors.orangeAccent))
                      : (isSafe
                            ? Colors.green
                            : (isHighRisk
                                  ? const Color(0xFFDC2626)
                                  : Colors.orange)),
                ),
              ),
              title: Text(
                isSafe
                    ? 'Safe Message'
                    : (isHighRisk
                          ? 'High Risk SMS Blocked'
                          : 'Suspicious SMS Detected'),
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: isDark ? Colors.white : const Color(0xFF0F172A),
                ),
              ),
              subtitle: Padding(
                padding: const EdgeInsets.only(top: 8.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'From: $sender',
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        color: isDark
                            ? Colors.white70
                            : const Color(0xFF475569),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '"$content"',
                      style: TextStyle(
                        color: isDark
                            ? Colors.white54
                            : const Color(0xFF64748B),
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
