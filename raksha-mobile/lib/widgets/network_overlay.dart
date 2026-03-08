import 'dart:async';
import 'package:flutter/material.dart';
import 'package:connectivity_plus/connectivity_plus.dart';

class NetworkOverlay extends StatefulWidget {
  final Widget child;
  const NetworkOverlay({super.key, required this.child});

  @override
  State<NetworkOverlay> createState() => _NetworkOverlayState();
}

class _NetworkOverlayState extends State<NetworkOverlay> {
  bool _hasConnection = true;
  late StreamSubscription<List<ConnectivityResult>> _subscription;

  @override
  void initState() {
    super.initState();
    // Listen to network changes in real-time
    _subscription = Connectivity().onConnectivityChanged.listen((
      List<ConnectivityResult> results,
    ) {
      setState(() {
        // If the result contains 'none', we have no internet
        _hasConnection = !results.contains(ConnectivityResult.none);
      });
    });
  }

  @override
  void dispose() {
    _subscription.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // 1. Your actual app goes here
        widget.child,

        // 2. The YouTube-style floating banner
        AnimatedPositioned(
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeInOut,
          top: _hasConnection ? -100 : 0, // Slides down when disconnected
          left: 0,
          right: 0,
          child: SafeArea(
            bottom: false,
            child: Material(
              color: Colors.redAccent.shade700,
              elevation: 4,
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 6),
                alignment: Alignment.center,
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.wifi_off_rounded, color: Colors.white, size: 14),
                    SizedBox(width: 8),
                    Text(
                      "No internet connection",
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
