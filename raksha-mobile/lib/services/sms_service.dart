import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:another_telephony/telephony.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'api_service.dart'; // <-- IMPORT THIS to use your Ngrok URL!

// =========================================================================
// 1. TOP-LEVEL BACKGROUND HANDLER
// =========================================================================
@pragma('vm:entry-point')
backgroundMessageHandler(SmsMessage message) async {
  print("Background SMS received from: ${message.address}");
  await _sendToRakshaBackend(message);
}

// Helper function that actually makes the HTTP request to your FastAPI
Future<void> _sendToRakshaBackend(SmsMessage message) async {
  // THE FIX: Use your active API Base URL so it hits Ngrok and goes to Python
  final String apiUrl = "${ApiService.baseUrl}/guardian/analyze";

  try {
    final prefs = await SharedPreferences.getInstance();
    final guardianId = prefs.getString('guardian_id');

    // THE FIX: If no user is logged in, do not upload anonymous data
    if (guardianId == null) {
      print("❌ Error: No user logged in to attribute this threat to.");
      return;
    }

    final response = await http.post(
      Uri.parse(apiUrl),
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({
        "sender": message.address ?? "Unknown",
        "content": message.body ?? "",
        "guardian_id": guardianId,
        // Backend handles passing this exact string to Bedrock for analysis
      }),
    );

    if (response.statusCode == 200) {
      print("✅ Successfully analyzed and uploaded SMS as a Threat!");
    } else {
      print("❌ Failed to send SMS: ${response.statusCode} - ${response.body}");
    }
  } catch (e) {
    print("❌ Network error sending SMS to backend: $e");
  }
}

// =========================================================================
// 2. THE SERVICE CLASS
// =========================================================================
class SmsService {
  final Telephony telephony = Telephony.instance;

  Future<void> initializeAndRequestPermissions() async {
    PermissionStatus status = await Permission.sms.request();

    if (status.isGranted) {
      print("SMS Permissions Granted. Starting listener...");

      telephony.listenIncomingSms(
        onNewMessage: (SmsMessage message) {
          print("Foreground SMS received from: ${message.address}");
          _sendToRakshaBackend(message);
        },
        onBackgroundMessage: backgroundMessageHandler,
      );
    } else if (status.isPermanentlyDenied) {
      print(
        "SMS permissions permanently denied. User must enable in settings.",
      );
      openAppSettings();
    } else {
      print("User denied SMS permissions.");
    }
  }
}
