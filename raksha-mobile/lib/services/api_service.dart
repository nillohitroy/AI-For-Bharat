import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  // Your active Ngrok URL
  static const String baseUrl = "http://65.2.171.17:8000/api";

  Future<List<dynamic>> fetchRecentThreats() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final guardianId = prefs.getString('guardian_id');

      if (guardianId == null) {
        print("❌ Error: No user logged in!");
        return []; // MUST be an empty list [], not null!
      }

      final response = await http.get(
        Uri.parse("$baseUrl/guardian/$guardianId/threats"),
        headers: {"Content-Type": "application/json"},
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        print("❌ Failed to fetch threats: ${response.statusCode}");
        return [];
      }
    } catch (e) {
      print("❌ Network error: $e");
      return [];
    }
  }

  // ==========================================
  // Fetch AI Analysis for a Specific Threat
  // ==========================================
  Future<Map<String, dynamic>?> getThreatAnalysis(String threatId) async {
    try {
      final response = await http.get(
        Uri.parse("$baseUrl/guardian/threat/$threatId/analyze"),
        headers: {"Content-Type": "application/json"},
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        print(
          "❌ Failed to fetch analysis: ${response.statusCode} - ${response.body}",
        );
        return null;
      }
    } catch (e) {
      print("❌ Network error fetching analysis: $e");
      return null;
    }
  }

  // ==========================================
  // Fetch the AI gamified literacy module (For Threat Details)
  // ==========================================
  Future<Map<String, dynamic>?> fetchContextualModule(String threatId) async {
    try {
      final response = await http.get(
        Uri.parse("$baseUrl/literacy/contextual?threat_id=$threatId"),
        headers: {"Content-Type": "application/json"},
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        print("❌ Failed to fetch module: ${response.body}");
        return null;
      }
    } catch (e) {
      print("❌ Network error: $e");
      return null;
    }
  }

  // ==========================================
  // Claim EXP for completing the contextual module
  // ==========================================
  Future<bool> claimModuleExp(String moduleId) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final guardianId = prefs.getString('guardian_id');

      if (guardianId == null) {
        print("❌ Error: No user logged in!");
        return false; // MUST be false, not null!
      }

      final response = await http.post(
        Uri.parse("$baseUrl/literacy/claim"),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({"module_id": moduleId, "guardian_id": guardianId}),
      );

      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }

  // ==========================================
  // Fetch the Literacy Dashboard Data
  // ==========================================
  Future<Map<String, dynamic>?> fetchLiteracyDashboard() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final guardianId = prefs.getString('guardian_id');

      if (guardianId == null) {
        print("❌ Error: No user logged in!");
        return null;
      }

      final response = await http.get(
        Uri.parse("$baseUrl/literacy/dashboard/$guardianId"),
        headers: {"Content-Type": "application/json"},
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        print("❌ Failed to fetch dashboard: ${response.body}");
        return null;
      }
    } catch (e) {
      print("❌ Network error fetching dashboard: $e");
      return null;
    }
  }

  // ==========================================
  // NEW: Fetch Interactive Quiz from Bedrock
  // ==========================================
  Future<Map<String, dynamic>?> fetchQuiz(String title, String category) async {
    try {
      // Encode URL parameters so spaces and special characters don't break the request
      final encodedTitle = Uri.encodeComponent(title);
      final encodedCategory = Uri.encodeComponent(category);

      final response = await http.get(
        Uri.parse(
          "$baseUrl/literacy/generate-quiz?title=$encodedTitle&category=$encodedCategory",
        ),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        print("❌ Failed to fetch quiz: ${response.statusCode}");
        return null;
      }
    } catch (e) {
      print("❌ Network error fetching quiz: $e");
      return null;
    }
  }

  // ==========================================
  // NEW: Submit Quiz Completion & Claim JSON EXP
  // ==========================================
  Future<bool> completeQuiz({
    required int lessonId,
    required int reward,
    required bool isPractice,
    String? title,
    String? category,
    String? description,
  }) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final guardianId = prefs.getString('guardian_id');

      if (guardianId == null) {
        print("❌ Error: No user logged in!");
        return false; // MUST be false, not null!
      }

      final response = await http.post(
        Uri.parse("$baseUrl/literacy/complete-quiz"),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({
          "guardian_id": guardianId,
          "lesson_id": lessonId,
          "reward": reward,
          "is_practice": isPractice,
          "title": title,
          "category": category,
          "description": description,
        }),
      );

      return response.statusCode == 200;
    } catch (e) {
      print("❌ Network error claiming quiz EXP: $e");
      return false;
    }
  }
}
