import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../navigation_shell.dart';
import 'auth_screen.dart';
import '../main.dart'; // To access the global themeNotifier

class LoadingSplashScreen extends StatefulWidget {
  const LoadingSplashScreen({super.key});

  @override
  State<LoadingSplashScreen> createState() => _LoadingSplashScreenState();
}

class _LoadingSplashScreenState extends State<LoadingSplashScreen>
    with TickerProviderStateMixin {
  late AnimationController _logoController;
  late Animation<double> _logoScale;
  late Animation<double> _logoOpacity;

  @override
  void initState() {
    super.initState();
    _setStatusBarTransparency();

    // Setup the elegant entrance animation for the logo
    _logoController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    );

    _logoOpacity = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _logoController,
        curve: const Interval(0.0, 0.5, curve: Curves.easeIn),
      ),
    );

    _logoScale = Tween<double>(begin: 0.8, end: 1.0).animate(
      CurvedAnimation(
        parent: _logoController,
        curve: const Interval(0.0, 0.5, curve: Curves.easeOutBack),
      ),
    );

    _logoController.forward();

    // Start the app initialization logic
    _initializeApp();
  }

  void _setStatusBarTransparency() {
    SystemChrome.setSystemUIOverlayStyle(
      const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.light,
      ),
    );
  }

  @override
  void dispose() {
    _logoController.dispose();
    super.dispose();
  }

  Future<void> _initializeApp() async {
    final startTime = DateTime.now();

    final bool isSessionActive =
        Supabase.instance.client.auth.currentSession != null;

    final endTime = DateTime.now();
    final elapsed = endTime.difference(startTime);

    const minSplashDuration = Duration(milliseconds: 2500);
    if (elapsed < minSplashDuration) {
      await Future.delayed(minSplashDuration - elapsed);
    }

    if (mounted) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (context) => isSessionActive
              ? MainNavigationShell(themeNotifier: themeNotifier)
              : const AuthScreen(),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    const Color initialBootColor = Color(0xFF0F172A);

    return Scaffold(
      backgroundColor: initialBootColor,
      body: Stack(
        children: [
          // 1. Top Section: Centered Logo with Entrance Animation
          Center(
            child: ScaleTransition(
              scale: _logoScale,
              child: FadeTransition(
                opacity: _logoOpacity,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 120,
                      height: 120,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFF00F0FF).withOpacity(0.3),
                            blurRadius: 30,
                            offset: const Offset(0, 8),
                          ),
                        ],
                      ),
                      child: Image.asset(
                        'assets/app_logo.png',
                        fit: BoxFit.contain,
                      ),
                    ),
                    const SizedBox(height: 32),
                    const Text(
                      "Raksha AI",
                      style: TextStyle(
                        fontSize: 36,
                        fontWeight: FontWeight.w900,
                        color: Colors.white,
                        letterSpacing: -1.0,
                      ),
                    ),
                    const Text(
                      "Guardian Portal",
                      style: TextStyle(
                        fontSize: 16,
                        color: Colors.white60,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // 2. Bottom Section: Minimalist Loading indicator
          Align(
            alignment: Alignment.bottomCenter,
            child: Padding(
              padding: const EdgeInsets.only(bottom: 80.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: const [
                  SizedBox(
                    width: 40,
                    child: LinearProgressIndicator(
                      color: Color(0xFF00F0FF),
                      backgroundColor: Colors.white10,
                    ),
                  ),
                  SizedBox(height: 16),
                  // THE FIX: Removed textTransform and just typed it in ALL CAPS
                  Text(
                    "ESTABLISHING NEURAL LINK...",
                    style: TextStyle(
                      fontFamily: 'RobotoMono',
                      fontSize: 10,
                      color: Colors.white24,
                      letterSpacing: 1.5,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
