// ignore_for_file: deprecated_member_use

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/providers/sync_status_provider.dart';

class SyncStatusWidget extends StatelessWidget {
  const SyncStatusWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<SyncStatusProvider?>(
      builder: (context, syncProvider, child) {
        if (syncProvider == null) {
          return const SizedBox.shrink();
        }

        return InkWell(
          onTap: syncProvider.status == SyncStatus.error
              ? () => _showErrorDialog(context, syncProvider)
              : syncProvider.hasPendingSync
              ? () => _triggerManualSync(context)
              : null,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: syncProvider.getStatusColor().withOpacity(0.1),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: syncProvider.getStatusColor(),
                width: 1,
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  syncProvider.getStatusIcon(),
                  size: 16,
                  color: syncProvider.getStatusColor(),
                ),
                const SizedBox(width: 6),
                Text(
                  syncProvider.getStatusText(),
                  style: TextStyle(
                    color: syncProvider.getStatusColor(),
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                if (syncProvider.status == SyncStatus.syncing)
                  Container(
                    margin: const EdgeInsets.only(left: 6),
                    width: 12,
                    height: 12,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(
                        syncProvider.getStatusColor(),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        );
      },
    );
  }

  void _showErrorDialog(BuildContext context, SyncStatusProvider syncProvider) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Sync Error'),
        content: Text(syncProvider.lastError ?? 'Unknown error occurred'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Dismiss'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(context).pop();
              _triggerManualSync(context);
            },
            child: const Text('Retry'),
          ),
        ],
      ),
    );
  }

  void _triggerManualSync(BuildContext context) {
    // This would trigger a manual sync - implementation depends on how sync is called
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(const SnackBar(content: Text('Manual sync triggered')));
  }
}
