import 'package:firebase_core/firebase_core.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';

class FirebaseService {
  static FirebaseAuth? _auth;
  static FirebaseFirestore? _firestore;

  static FirebaseAuth get auth {
    _auth ??= FirebaseAuth.instance;
    return _auth!;
  }

  static FirebaseFirestore get firestore {
    _firestore ??= FirebaseFirestore.instance;
    return _firestore!;
  }

  static Future<void> initialize() async {
    await Firebase.initializeApp(
      options: const FirebaseOptions(
        apiKey: 'AIzaSyD8TI9q43-YJSEZ3sGiq5vDOXY7DIHLKOI',
        authDomain: 'nyantara-388dd.firebaseapp.com',
        projectId: 'nyantara-388dd',
        storageBucket: 'nyantara-388dd.firebasestorage.app',
        messagingSenderId: '680451659563',
        appId: '1:680451659563:web:0ee90690456e61b219976e',
        measurementId: 'G-NV8KH8EKNX',
      ),
    );

    // Enable offline persistence for Firestore
    FirebaseFirestore.instance.settings = const Settings(
      persistenceEnabled: true,
    );
  }

  static Future<UserCredential> signInWithGoogle() async {
    // Create a new provider
    GoogleAuthProvider googleProvider = GoogleAuthProvider();

    // Add scopes if needed (optional)
    googleProvider.addScope('email');
    googleProvider.addScope('profile');

    // For web, use signInWithPopup
    return await FirebaseAuth.instance.signInWithPopup(googleProvider);
  }
}
