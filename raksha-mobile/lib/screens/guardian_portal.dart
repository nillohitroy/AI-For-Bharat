import 'package:flutter/material.dart';

class GuardianPortalScreen extends StatelessWidget {
  const GuardianPortalScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.surface,
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.surface,
        title: const Text(
          'Guardian Network',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        centerTitle: false,
        actions: [
          IconButton(
            icon: const Icon(Icons.person_add_alt_1),
            onPressed: () {},
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        physics: const BouncingScrollPhysics(),
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: isDark
                    ? [const Color(0xFF1E293B), const Color(0xFF0F172A)]
                    : [const Color(0xFF1E3A8A), const Color(0xFF2563EB)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
              boxShadow: const [
                BoxShadow(
                  color: Colors.black12,
                  blurRadius: 10,
                  offset: Offset(0, 4),
                ),
              ],
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _StatColumn(
                  title: 'Protected',
                  value: '3',
                  subtitle: 'Family Members',
                ),
                Container(height: 40, width: 1, color: Colors.white24),
                _StatColumn(
                  title: 'Threats Blocked',
                  value: '12',
                  subtitle: 'This Month',
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          Text(
            'Protected Accounts',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: isDark ? Colors.white : const Color(0xFF334155),
            ),
          ),
          const SizedBox(height: 16),

          _buildFamilyMember(context, 'Mom', 'Active • Secure', true, isDark),
          _buildFamilyMember(
            context,
            'Dad',
            'Needs Attention • 1 Alert',
            false,
            isDark,
          ),
        ],
      ),
    );
  }

  Widget _buildFamilyMember(
    BuildContext context,
    String name,
    String status,
    bool isSecure,
    bool isDark,
  ) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
        ),
      ),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: isDark
              ? const Color(0xFF334155)
              : const Color(0xFFE2E8F0),
          child: Icon(
            Icons.person,
            color: isDark ? Colors.white54 : Colors.black54,
          ),
        ),
        title: Text(
          name,
          style: TextStyle(
            fontWeight: FontWeight.bold,
            color: isDark ? Colors.white : Colors.black,
          ),
        ),
        subtitle: Text(
          status,
          style: TextStyle(
            color: isSecure
                ? (isDark ? Colors.green[300] : Colors.green[700])
                : (isDark ? Colors.red[300] : Colors.red[700]),
            fontSize: 13,
          ),
        ),
        trailing: const Icon(Icons.chevron_right, color: Colors.grey),
      ),
    );
  }
}

class _StatColumn extends StatelessWidget {
  final String title;
  final String value;
  final String subtitle;

  const _StatColumn({
    required this.title,
    required this.value,
    required this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          value,
          style: const TextStyle(
            fontSize: 28,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        Text(
          title,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          subtitle,
          style: const TextStyle(fontSize: 12, color: Colors.white70),
        ),
      ],
    );
  }
}
