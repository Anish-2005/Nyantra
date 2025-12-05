import 'package:flutter/material.dart';
import 'overview_page.dart';
import 'applications_page.dart';
import 'beneficiaries_page.dart';
import 'disbursements_page.dart';
import 'reports_page.dart';
import 'grievance_page.dart';
import 'feedback_page.dart';

class DashboardContent extends StatelessWidget {
  final int selectedIndex;
  final Function(int)? onNavigate;

  const DashboardContent({
    super.key,
    required this.selectedIndex,
    this.onNavigate,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.transparent,
      child: IndexedStack(
        index: selectedIndex,
        children: [
          OverviewPage(onNavigate: onNavigate),
          ApplicationsPage(),
          BeneficiariesPage(),
          DisbursementsPage(),
          ReportsPage(),
          GrievancePage(),
          FeedbackPage(),
        ],
      ),
    );
  }
}
