import 'package:firebase_core/firebase_core.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';

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
    // For mobile platforms, use Google Sign-In plugin
    final GoogleSignIn googleSignIn = GoogleSignIn();

    // Attempt to sign in
    final GoogleSignInAccount? googleUser = await googleSignIn.signIn();

    if (googleUser == null) {
      throw FirebaseAuthException(
        code: 'ERROR_ABORTED_BY_USER',
        message: 'Sign in aborted by user',
      );
    }

    // Obtain the auth details from the request
    final GoogleSignInAuthentication googleAuth =
        await googleUser.authentication;

    // Create a new credential
    final credential = GoogleAuthProvider.credential(
      accessToken: googleAuth.accessToken,
      idToken: googleAuth.idToken,
    );

    // Sign in to Firebase with the credential
    return await FirebaseAuth.instance.signInWithCredential(credential);
  }
}
