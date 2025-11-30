import 'package:flutter/material.dart';
import 'overview_page.dart';
import 'applications_page.dart';
import 'beneficiaries_page.dart';
import 'disbursements_page.dart';
import 'grievance_page.dart';
import 'feedback_page.dart';

class DashboardContent extends StatelessWidget {
  final int selectedIndex;

  const DashboardContent({super.key, required this.selectedIndex});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      color: theme.scaffoldBackgroundColor,
      child: IndexedStack(
        index: selectedIndex,
        children: const [
          OverviewPage(),
          ApplicationsPage(),
          BeneficiariesPage(),
          DisbursementsPage(),
          GrievancePage(),
          FeedbackPage(),
        ],
      ),
    );
  }
}
