// ignore_for_file: depend_on_referenced_packages

import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import 'package:path_provider/path_provider.dart';
import 'dart:io';
import '../models/user_model.dart';
import '../models/application_model.dart';
import '../models/beneficiary_model.dart';
import '../models/disbursement_model.dart';
import '../models/grievance_model.dart';
import '../models/feedback_model.dart';
import '../models/report_model.dart';

class DatabaseHelper {
  static final DatabaseHelper _instance = DatabaseHelper._internal();
  static Database? _database;

  factory DatabaseHelper() => _instance;

  DatabaseHelper._internal();

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDatabase();
    return _database!;
  }

  Future<Database> _initDatabase() async {
    Directory documentsDirectory = await getApplicationDocumentsDirectory();
    String path = join(documentsDirectory.path, 'nyantara.db');
    return await openDatabase(
      path,
      version: 2,
      onCreate: _onCreate,
      onUpgrade: _onUpgrade,
    );
  }

  Future<void> _onUpgrade(Database db, int oldVersion, int newVersion) async {
    if (oldVersion < 2) {
      // Add sync tracking columns to existing tables
      await db.execute('ALTER TABLE users ADD COLUMN synced INTEGER DEFAULT 0');
      await db.execute('ALTER TABLE users ADD COLUMN lastModified TEXT');
      await db.execute(
        'ALTER TABLE users ADD COLUMN needsSync INTEGER DEFAULT 0',
      );

      await db.execute(
        'ALTER TABLE applications ADD COLUMN synced INTEGER DEFAULT 0',
      );
      await db.execute('ALTER TABLE applications ADD COLUMN lastModified TEXT');
      await db.execute(
        'ALTER TABLE applications ADD COLUMN needsSync INTEGER DEFAULT 0',
      );

      await db.execute(
        'ALTER TABLE beneficiaries ADD COLUMN synced INTEGER DEFAULT 0',
      );
      await db.execute(
        'ALTER TABLE beneficiaries ADD COLUMN lastModified TEXT',
      );
      await db.execute(
        'ALTER TABLE beneficiaries ADD COLUMN needsSync INTEGER DEFAULT 0',
      );

      await db.execute(
        'ALTER TABLE disbursements ADD COLUMN synced INTEGER DEFAULT 0',
      );
      await db.execute(
        'ALTER TABLE disbursements ADD COLUMN lastModified TEXT',
      );
      await db.execute(
        'ALTER TABLE disbursements ADD COLUMN needsSync INTEGER DEFAULT 0',
      );

      await db.execute(
        'ALTER TABLE grievances ADD COLUMN synced INTEGER DEFAULT 0',
      );
      await db.execute('ALTER TABLE grievances ADD COLUMN lastModified TEXT');
      await db.execute(
        'ALTER TABLE grievances ADD COLUMN needsSync INTEGER DEFAULT 0',
      );

      await db.execute(
        'ALTER TABLE feedback ADD COLUMN synced INTEGER DEFAULT 0',
      );
      await db.execute('ALTER TABLE feedback ADD COLUMN lastModified TEXT');
      await db.execute(
        'ALTER TABLE feedback ADD COLUMN needsSync INTEGER DEFAULT 0',
      );

      await db.execute(
        'ALTER TABLE reports ADD COLUMN synced INTEGER DEFAULT 0',
      );
      await db.execute('ALTER TABLE reports ADD COLUMN lastModified TEXT');
      await db.execute(
        'ALTER TABLE reports ADD COLUMN needsSync INTEGER DEFAULT 0',
      );
    }
  }

  Future<void> _onCreate(Database db, int version) async {
    // Users table
    await db.execute('''
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        email TEXT,
        displayName TEXT,
        role TEXT,
        createdAt TEXT,
        updatedAt TEXT,
        synced INTEGER DEFAULT 0,
        lastModified TEXT,
        needsSync INTEGER DEFAULT 0
      )
    ''');

    // Applications table
    await db.execute('''
      CREATE TABLE applications (
        id TEXT PRIMARY KEY,
        ownerId TEXT,
        beneficiaryId TEXT,
        schemeId TEXT,
        status TEXT,
        applicationDate TEXT,
        approvalDate TEXT,
        disbursementDate TEXT,
        amount REAL,
        documents TEXT,
        notes TEXT,
        createdAt TEXT,
        updatedAt TEXT,
        synced INTEGER DEFAULT 0,
        lastModified TEXT,
        needsSync INTEGER DEFAULT 0
      )
    ''');

    // Beneficiaries table
    await db.execute('''
      CREATE TABLE beneficiaries (
        id TEXT PRIMARY KEY,
        ownerId TEXT,
        name TEXT,
        dateOfBirth TEXT,
        gender TEXT,
        address TEXT,
        phone TEXT,
        email TEXT,
        aadhaarNumber TEXT,
        bankAccountNumber TEXT,
        ifscCode TEXT,
        certificateUrl TEXT,
        createdAt TEXT,
        updatedAt TEXT,
        synced INTEGER DEFAULT 0,
        lastModified TEXT,
        needsSync INTEGER DEFAULT 0
      )
    ''');

    // Disbursements table
    await db.execute('''
      CREATE TABLE disbursements (
        id TEXT PRIMARY KEY,
        applicationId TEXT,
        amount REAL,
        status TEXT,
        disbursementDate TEXT,
        method TEXT,
        referenceNumber TEXT,
        notes TEXT,
        createdAt TEXT,
        updatedAt TEXT,
        synced INTEGER DEFAULT 0,
        lastModified TEXT,
        needsSync INTEGER DEFAULT 0
      )
    ''');

    // Grievances table
    await db.execute('''
      CREATE TABLE grievances (
        id TEXT PRIMARY KEY,
        userId TEXT,
        beneficiaryId TEXT,
        title TEXT,
        description TEXT,
        category TEXT,
        status TEXT,
        priority TEXT,
        assignedTo TEXT,
        resolution TEXT,
        createdAt TEXT,
        updatedAt TEXT,
        resolvedAt TEXT,
        synced INTEGER DEFAULT 0,
        lastModified TEXT,
        needsSync INTEGER DEFAULT 0
      )
    ''');

    // Feedback table
    await db.execute('''
      CREATE TABLE feedback (
        id TEXT PRIMARY KEY,
        userId TEXT,
        rating INTEGER,
        comment TEXT,
        category TEXT,
        createdAt TEXT,
        synced INTEGER DEFAULT 0,
        lastModified TEXT,
        needsSync INTEGER DEFAULT 0
      )
    ''');

    // Reports table
    await db.execute('''
      CREATE TABLE reports (
        id TEXT PRIMARY KEY,
        name TEXT,
        type TEXT,
        category TEXT,
        frequency TEXT,
        status TEXT,
        fileSize TEXT,
        fileFormat TEXT,
        generatedDate TEXT,
        generatedBy TEXT,
        schedule TEXT,
        lastRun TEXT,
        nextRun TEXT,
        recordCount INTEGER,
        description TEXT,
        parameters TEXT,
        downloadCount INTEGER,
        isScheduled INTEGER,
        recipients TEXT,
        columns TEXT,
        createdAt TEXT,
        updatedAt TEXT,
        synced INTEGER DEFAULT 0,
        lastModified TEXT,
        needsSync INTEGER DEFAULT 0
      )
    ''');
  }

  // Generic CRUD operations
  Future<int> insert(String table, Map<String, dynamic> data) async {
    Database db = await database;
    return await db.insert(
      table,
      data,
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  Future<List<Map<String, dynamic>>> query(
    String table, {
    String? where,
    List<dynamic>? whereArgs,
  }) async {
    Database db = await database;
    return await db.query(table, where: where, whereArgs: whereArgs);
  }

  Future<int> update(
    String table,
    Map<String, dynamic> data,
    String where,
    List<dynamic> whereArgs,
  ) async {
    Database db = await database;
    return await db.update(table, data, where: where, whereArgs: whereArgs);
  }

  Future<int> delete(
    String table,
    String where,
    List<dynamic> whereArgs,
  ) async {
    Database db = await database;
    return await db.delete(table, where: where, whereArgs: whereArgs);
  }

  // Specific methods for each model
  Future<void> insertUser(UserModel user) async {
    await insert('users', user.toJson());
  }

  Future<List<UserModel>> getUsers() async {
    List<Map<String, dynamic>> maps = await query('users');
    return maps.map((map) => UserModel.fromJson(map)).toList();
  }

  Future<void> insertApplication(ApplicationModel application) async {
    await insert('applications', application.toJson());
  }

  Future<List<ApplicationModel>> getApplications() async {
    List<Map<String, dynamic>> maps = await query('applications');
    return maps.map((map) => ApplicationModel.fromJson(map)).toList();
  }

  Future<void> insertBeneficiary(BeneficiaryModel beneficiary) async {
    await insert('beneficiaries', beneficiary.toJson());
  }

  Future<List<BeneficiaryModel>> getBeneficiaries() async {
    List<Map<String, dynamic>> maps = await query('beneficiaries');
    return maps.map((map) => BeneficiaryModel.fromJson(map)).toList();
  }

  Future<void> insertDisbursement(DisbursementModel disbursement) async {
    await insert('disbursements', disbursement.toJson());
  }

  Future<List<DisbursementModel>> getDisbursements() async {
    List<Map<String, dynamic>> maps = await query('disbursements');
    return maps.map((map) => DisbursementModel.fromJson(map)).toList();
  }

  Future<void> insertGrievance(GrievanceModel grievance) async {
    await insert('grievances', grievance.toJson());
  }

  Future<List<GrievanceModel>> getGrievances() async {
    List<Map<String, dynamic>> maps = await query('grievances');
    return maps.map((map) => GrievanceModel.fromJson(map)).toList();
  }

  Future<void> insertFeedback(FeedbackModel feedback) async {
    await insert('feedback', feedback.toJson());
  }

  Future<List<FeedbackModel>> getFeedback() async {
    List<Map<String, dynamic>> maps = await query('feedback');
    return maps.map((map) => FeedbackModel.fromJson(map)).toList();
  }

  Future<void> insertReport(Report report) async {
    await insert('reports', report.toJson());
  }

  Future<List<Report>> getReports() async {
    List<Map<String, dynamic>> maps = await query('reports');
    final reports = maps
        .map((map) => Report.fromJson(map, map['id']?.toString() ?? 'unknown'))
        .toList();

    // Remove duplicates based on name (since IDs might be different for same content)
    final seenNames = <String>{};
    final uniqueReports = <Report>[];

    for (final report in reports) {
      if (!seenNames.contains(report.name)) {
        seenNames.add(report.name);
        uniqueReports.add(report);
      }
    }

    return uniqueReports;
  }

  // Sync methods
  Future<void> syncFromFirestore() async {
    // This will be called when online to sync data from Firestore to local DB
    // Implementation will be added in sync service
  }

  Future<void> syncToFirestore() async {
    // This will be called when online to sync local changes to Firestore
    // Implementation will be added in sync service
  }

  // Mark record as needing sync
  Future<void> markForSync(String table, String id) async {
    await update(
      table,
      {'needsSync': 1, 'lastModified': DateTime.now().toIso8601String()},
      'id = ?',
      [id],
    );
  }

  // Mark record as synced
  Future<void> markAsSynced(String table, String id) async {
    await update(
      table,
      {
        'synced': 1,
        'needsSync': 0,
        'lastModified': DateTime.now().toIso8601String(),
      },
      'id = ?',
      [id],
    );
  }

  // Get records that need syncing
  Future<List<Map<String, dynamic>>> getRecordsNeedingSync(String table) async {
    return await query(table, where: 'needsSync = ?', whereArgs: [1]);
  }

  // Get all records for a table
  Future<List<Map<String, dynamic>>> getAllRecords(String table) async {
    return await query(table);
  }

  // Insert or update with sync tracking
  Future<void> upsertWithSync(
    String table,
    Map<String, dynamic> data, {
    bool markForSync = false,
  }) async {
    final id = data['id'];
    if (id == null) return;

    // Check if record exists
    final existing = await query(table, where: 'id = ?', whereArgs: [id]);

    if (existing.isNotEmpty) {
      // Update existing record
      data['lastModified'] = DateTime.now().toIso8601String();
      if (markForSync) {
        data['needsSync'] = 1;
      }
      await update(table, data, 'id = ?', [id]);
    } else {
      // Insert new record
      data['synced'] = markForSync ? 0 : 1;
      data['needsSync'] = markForSync ? 1 : 0;
      data['lastModified'] = DateTime.now().toIso8601String();
      await insert(table, data);
    }
  }
}
