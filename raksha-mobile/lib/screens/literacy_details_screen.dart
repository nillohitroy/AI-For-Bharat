import 'package:flutter/material.dart';
import '../services/api_service.dart';

class LiteracyDetailsScreen extends StatefulWidget {
  final Map<String, dynamic> lessonData;
  final bool isAlreadyCompleted;
  final bool isPractice;

  const LiteracyDetailsScreen({
    super.key,
    required this.lessonData,
    required this.isAlreadyCompleted,
    this.isPractice = false, // Defaults to false for normal syllabus items
  });

  @override
  State<LiteracyDetailsScreen> createState() => _LiteracyDetailsScreenState();
}

class _LiteracyDetailsScreenState extends State<LiteracyDetailsScreen> {
  Map<String, dynamic>? _quizData;
  bool _isLoading = true;
  int? _selectedOption;
  bool _isClaiming = false;

  @override
  void initState() {
    super.initState();
    _loadQuiz();
  }

  Future<void> _loadQuiz() async {
    final title = widget.lessonData['title'] ?? '';
    final category = widget.lessonData['category'] ?? '';

    final data = await ApiService().fetchQuiz(title, category);

    if (mounted) {
      setState(() {
        _quizData = data;
        _isLoading = false;
      });
    }
  }

  Future<void> _submitAnswer() async {
    if (_selectedOption == null) return;

    final correctIndex = _quizData!['correctIndex'] as int;

    if (_selectedOption == correctIndex) {
      // Correct Answer!
      if (widget.isAlreadyCompleted) {
        // Just show success, don't claim EXP again
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text("Correct! You've already mastered this lesson."),
            backgroundColor: Colors.green,
          ),
        );
        Navigator.pop(context);
        return;
      }

      setState(() => _isClaiming = true);

      // Call updated ApiService that takes the full lesson map and the practice flag
      final success = await ApiService().completeQuiz(
        lessonId: widget.lessonData['id'],
        reward: widget.lessonData['reward'] ?? 50,
        isPractice: widget.isPractice,
        title: widget.lessonData['title'],
        category: widget.lessonData['category'],
        description: widget.lessonData['description'],
      );

      if (mounted) {
        setState(() => _isClaiming = false);
        if (success) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                "🎉 +${widget.lessonData['reward'] ?? 50} EXP Claimed!",
              ),
              backgroundColor: Colors.green,
            ),
          );
          Navigator.pop(context);
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text("Failed to save progress."),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    } else {
      // Wrong Answer
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            "Incorrect. Read the scenario carefully and try again!",
          ),
          backgroundColor: Colors.orange,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    if (_isLoading) {
      return Scaffold(
        backgroundColor: Theme.of(context).colorScheme.surface,
        appBar: AppBar(backgroundColor: Colors.transparent, elevation: 0),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const CircularProgressIndicator(color: Colors.tealAccent),
              const SizedBox(height: 24),
              Text("Generating ${widget.lessonData['title']} Scenario..."),
            ],
          ),
        ),
      );
    }

    if (_quizData == null) {
      return Scaffold(
        appBar: AppBar(backgroundColor: Colors.transparent, elevation: 0),
        body: const Center(
          child: Text("Failed to load quiz. Please try again."),
        ),
      );
    }

    final options = _quizData!['options'] as List<dynamic>;

    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.surface,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(widget.lessonData['title'] ?? 'Training'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Scenario Box
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF1E293B) : Colors.grey.shade100,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: Colors.teal.withOpacity(0.3),
                  width: 2,
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    "SCENARIO",
                    style: TextStyle(
                      color: Colors.teal,
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                      letterSpacing: 1.2,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _quizData!['scenario'] ?? '',
                    style: const TextStyle(fontSize: 16, height: 1.5),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 32),

            // Question
            Text(
              _quizData!['question'] ?? 'What is the red flag?',
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),

            const SizedBox(height: 24),

            // Options
            ...List.generate(options.length, (index) {
              final isSelected = _selectedOption == index;
              return Padding(
                padding: const EdgeInsets.only(bottom: 12.0),
                child: InkWell(
                  onTap: () {
                    setState(() => _selectedOption = index);
                  },
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: isSelected
                          ? Colors.teal.withOpacity(0.1)
                          : (isDark ? Colors.transparent : Colors.white),
                      border: Border.all(
                        color: isSelected
                            ? Colors.teal
                            : (isDark ? Colors.white24 : Colors.grey.shade300),
                        width: isSelected ? 2 : 1,
                      ),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          isSelected
                              ? Icons.radio_button_checked
                              : Icons.radio_button_off,
                          color: isSelected ? Colors.teal : Colors.grey,
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Text(
                            options[index].toString(),
                            style: TextStyle(
                              fontWeight: isSelected
                                  ? FontWeight.bold
                                  : FontWeight.normal,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            }),

            const SizedBox(height: 40),

            // Submit Button
            SizedBox(
              width: double.infinity,
              height: 55,
              child: ElevatedButton(
                onPressed: _selectedOption == null || _isClaiming
                    ? null
                    : _submitAnswer,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.teal,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: _isClaiming
                    ? const CircularProgressIndicator(color: Colors.white)
                    : Text(
                        widget.isAlreadyCompleted
                            ? "Check Answer"
                            : "Submit Answer & Claim EXP",
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
              ),
            ),

            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }
}
