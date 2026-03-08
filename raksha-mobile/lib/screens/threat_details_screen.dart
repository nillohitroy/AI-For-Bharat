import 'package:flutter/material.dart';
import '../services/api_service.dart';

class ThreatDetailsScreen extends StatefulWidget {
  final Map<String, dynamic> threat;

  const ThreatDetailsScreen({super.key, required this.threat});

  @override
  State<ThreatDetailsScreen> createState() => _ThreatDetailsScreenState();
}

class _ThreatDetailsScreenState extends State<ThreatDetailsScreen> {
  bool _isAnalyzing = false;

  late String _explanation;
  late String _culturalContext;
  late String _severity;

  @override
  void initState() {
    super.initState();
    _severity =
        widget.threat['riskScore'] ?? widget.threat['severity'] ?? 'HIGH';
    _culturalContext =
        widget.threat['culturalContextFlag'] ?? 'Uncategorized Threat';
    _explanation =
        widget.threat['explanation'] ?? widget.threat['ai_explanation'] ?? '';
  }

  Future<void> _generateAnalysis() async {
    setState(() => _isAnalyzing = true);

    final threatId = widget.threat['id'].toString();
    final result = await ApiService().getThreatAnalysis(threatId);

    if (result != null && mounted) {
      setState(() {
        _explanation =
            result['explanation'] ??
            result['ai_explanation'] ??
            'Analysis failed to generate.';
        _culturalContext = result['culturalContextFlag'] ?? _culturalContext;
        _severity = result['riskScore'] ?? _severity;
        _isAnalyzing = false;
      });
    } else {
      if (mounted) {
        setState(() => _isAnalyzing = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text("Failed to connect to Raksha AI Engine."),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  // --- NEW: The Point-Form Formatter ---
  Widget _buildFormattedExplanation(
    String text,
    bool isDark,
    Color brandColor,
  ) {
    // Split the text by newlines so we can render them as separate paragraphs/points
    final lines = text.split(RegExp(r'\r?\n'));

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: lines.map((line) {
        final cleanLine = line.trim();

        // If it's just an empty line break, add spacing
        if (cleanLine.isEmpty) return const SizedBox(height: 12);

        // Detect if the AI generated a bullet point (- or * or •)
        final isBullet =
            cleanLine.startsWith('-') ||
            cleanLine.startsWith('*') ||
            cleanLine.startsWith('•');

        // Remove the raw bullet character so we can use a beautiful Flutter Icon instead
        final textContent = isBullet
            ? cleanLine.substring(1).trim()
            : cleanLine;

        return Padding(
          padding: const EdgeInsets.only(bottom: 16.0),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (isBullet)
                Padding(
                  padding: const EdgeInsets.only(top: 4.0, right: 12.0),
                  child: Icon(
                    Icons.lens, // A clean, modern dot
                    size: 8,
                    color: brandColor,
                  ),
                ),
              Expanded(
                child: Text(
                  textContent,
                  style: TextStyle(
                    fontSize: 15,
                    height: 1.6, // Breathable line height
                    letterSpacing: 0.2,
                    color: isDark ? Colors.white70 : const Color(0xFF334155),
                  ),
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final String sender = widget.threat['sender'] ?? 'Unknown Sender';
    final String content = widget.threat['content'] ?? 'No content available';

    final bool isHighRisk = _severity == 'HIGH' || _severity == 'CRITICAL';
    final bool isSafe = _severity == 'LOW' || _severity == 'SAFE';

    final Color primaryBrandColor = isDark
        ? const Color(0xFF00F0FF)
        : const Color(0xFF2563EB);
    final Color headerColor = isSafe
        ? Colors.green
        : (isHighRisk ? Colors.redAccent : Colors.orange);
    final IconData headerIcon = isSafe
        ? Icons.shield_rounded
        : (isHighRisk ? Icons.gpp_bad_rounded : Icons.privacy_tip_rounded);

    final bool hasExplanation =
        _explanation.isNotEmpty &&
        _explanation !=
            'Analysis is currently processing. Please check back in a moment.';

    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.surface,
      appBar: AppBar(
        title: const Text(
          'Threat Intelligence',
          style: TextStyle(fontWeight: FontWeight.w600),
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // --- 1. The Verdict Card ---
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: headerColor.withOpacity(isDark ? 0.15 : 0.08),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: headerColor.withOpacity(0.3),
                  width: 1.5,
                ),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: headerColor.withOpacity(0.2),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(headerIcon, color: headerColor, size: 32),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          isSafe ? "Inbox Secured" : "Threat Intercepted",
                          style: TextStyle(
                            color: headerColor,
                            fontWeight: FontWeight.bold,
                            fontSize: 13,
                            letterSpacing: 1.2,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          _culturalContext,
                          style: TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w900,
                            letterSpacing: -0.5,
                            color: isDark
                                ? Colors.white
                                : const Color(0xFF0F172A),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 36),

            // --- 2. The Original Message ---
            Text(
              "Intercepted Payload",
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 14,
                letterSpacing: 1.2,
                color: isDark ? Colors.white54 : Colors.black45,
              ),
            ),
            const SizedBox(height: 12),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: isDark
                    ? const Color(0xFF1E293B)
                    : const Color(0xFFF1F5F9),
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(20),
                  topRight: Radius.circular(20),
                  bottomRight: Radius.circular(20),
                  bottomLeft: Radius.circular(4),
                ),
                border: Border.all(
                  color: isDark
                      ? const Color(0xFF334155)
                      : const Color(0xFFE2E8F0),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(
                        Icons.person_outline,
                        size: 16,
                        color: isDark ? Colors.white54 : Colors.black54,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        sender,
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: isDark ? Colors.white70 : Colors.black87,
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    content,
                    style: TextStyle(
                      fontSize: 16,
                      height: 1.5,
                      color: isDark ? Colors.white : Colors.black87,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 40),

            // --- 3. Bedrock AI Explanation ---
            Row(
              children: [
                Icon(Icons.auto_awesome, color: primaryBrandColor, size: 24),
                const SizedBox(width: 12),
                Text(
                  "Raksha AI Insights",
                  style: TextStyle(
                    fontWeight: FontWeight.w900,
                    fontSize: 20,
                    letterSpacing: -0.5,
                    color: isDark ? Colors.white : const Color(0xFF0F172A),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            if (hasExplanation)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF0F172A) : Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: primaryBrandColor.withOpacity(0.3),
                    width: 1.5,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: primaryBrandColor.withOpacity(isDark ? 0.05 : 0.1),
                      blurRadius: 20,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                // Uses the new custom formatter to build the points!
                child: _buildFormattedExplanation(
                  _explanation,
                  isDark,
                  primaryBrandColor,
                ),
              )
            else
              SizedBox(
                width: double.infinity,
                height: 60,
                child: FilledButton.icon(
                  style: FilledButton.styleFrom(
                    backgroundColor: primaryBrandColor.withOpacity(0.1),
                    foregroundColor: primaryBrandColor,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                    elevation: 0,
                  ),
                  onPressed: _isAnalyzing ? null : _generateAnalysis,
                  icon: _isAnalyzing
                      ? SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: primaryBrandColor,
                          ),
                        )
                      : const Icon(Icons.psychology_alt_rounded),
                  label: Text(
                    _isAnalyzing
                        ? "Analyzing Threat Signature..."
                        : "Generate AI Explanation",
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),

            const SizedBox(height: 48),

            // --- 4. Educational Defense Steps ---
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: isDark
                    ? const Color(0xFF1E293B)
                    : const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: isDark
                      ? const Color(0xFF334155)
                      : const Color(0xFFE2E8F0),
                ),
              ),
              child: Row(
                children: [
                  Icon(
                    isSafe
                        ? Icons.check_circle_rounded
                        : Icons.do_not_disturb_on_rounded,
                    color: isSafe ? Colors.green : Colors.grey,
                    size: 32,
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Text(
                      isSafe
                          ? "You can safely interact with this message. No malicious intent was detected."
                          : "Do not click any links, call numbers, or reply. Raksha has secured your inbox.",
                      style: TextStyle(
                        fontSize: 15,
                        color: isDark
                            ? Colors.white70
                            : const Color(0xFF475569),
                        fontWeight: FontWeight.w600,
                        height: 1.5,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }
}
