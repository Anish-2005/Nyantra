import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:provider/provider.dart';
import '../../../core/services/data_service.dart';
import '../../../core/models/feedback_model.dart';
import '../../../core/providers/locale_provider.dart';

class FeedbackPage extends StatefulWidget {
  const FeedbackPage({super.key});

  @override
  State<FeedbackPage> createState() => _FeedbackPageState();
}

class _FeedbackPageState extends State<FeedbackPage>
    with SingleTickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final _subjectController = TextEditingController();
  final _feedbackController = TextEditingController();
  double _rating = 0;
  bool _isSubmitting = false;
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _subjectController.dispose();
    _feedbackController.dispose();
    super.dispose();
  }

  Future<void> _submitFeedback(LocaleProvider localeProvider) async {
    if (!_formKey.currentState!.validate()) return;

    final user = FirebaseAuth.instance.currentUser;
    if (user == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            localeProvider.translate('feedback.loginRequiredSubmit'),
          ),
        ),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      await DataService.submitFeedback(
        userId: user.uid,
        subject: _subjectController.text.trim(),
        message: _feedbackController.text.trim(),
        rating: _rating.toInt(),
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(localeProvider.translate('feedback.submitSuccess')),
          ),
        );
        _subjectController.clear();
        _feedbackController.clear();
        setState(() => _rating = 0);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              '${localeProvider.translate('feedback.submitError')}: $e',
            ),
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final localeProvider = context.watch<LocaleProvider>();

    return Container(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            localeProvider.translate('nav.feedback'),
            style: theme.textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            localeProvider.translate('feedback.helpImprove'),
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.textTheme.bodyMedium?.color?.withOpacity(0.7),
            ),
          ),
          const SizedBox(height: 24),
          TabBar(
            controller: _tabController,
            tabs: [
              Tab(text: localeProvider.translate('feedback.submitTab')),
              Tab(text: localeProvider.translate('feedback.myFeedbackTab')),
            ],
          ),
          const SizedBox(height: 24),
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _buildSubmitFeedbackTab(theme, localeProvider),
                _buildMyFeedbackTab(theme, localeProvider),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSubmitFeedbackTab(ThemeData theme, localeProvider) {
    return SingleChildScrollView(
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              localeProvider.translate('feedback.rateExperience'),
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(5, (index) {
                return IconButton(
                  onPressed: () {
                    setState(() => _rating = index + 1);
                  },
                  icon: Icon(
                    index < _rating ? Icons.star : Icons.star_border,
                    size: 32,
                    color: Colors.amber,
                  ),
                );
              }),
            ),
            const SizedBox(height: 32),
            Text(
              localeProvider.translate('feedback.subject'),
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _subjectController,
              decoration: InputDecoration(
                hintText: localeProvider.translate('feedback.subjectHint'),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                filled: true,
                fillColor: theme.cardColor,
              ),
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return localeProvider.translate('feedback.subjectRequired');
                }
                return null;
              },
            ),
            const SizedBox(height: 32),
            Text(
              localeProvider.translate('feedback.yourFeedback'),
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _feedbackController,
              maxLines: 5,
              decoration: InputDecoration(
                hintText: localeProvider.translate('feedback.feedbackHint'),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                filled: true,
                fillColor: theme.cardColor,
              ),
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return localeProvider.translate('feedback.feedbackRequired');
                }
                return null;
              },
            ),
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: _isSubmitting
                    ? null
                    : () => _submitFeedback(localeProvider),
                style: ElevatedButton.styleFrom(
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: _isSubmitting
                    ? const CircularProgressIndicator()
                    : Text(localeProvider.translate('feedback.submitButton')),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMyFeedbackTab(ThemeData theme, LocaleProvider localeProvider) {
    final user = FirebaseAuth.instance.currentUser;

    if (user == null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.account_circle,
              size: 64,
              color: theme.textTheme.bodyMedium?.color?.withOpacity(0.5),
            ),
            const SizedBox(height: 16),
            Text(
              localeProvider.translate('feedback.loginRequired'),
              style: theme.textTheme.titleMedium,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      );
    }

    return StreamBuilder<List<FeedbackModel>>(
      stream: DataService.getUserFeedbacks(user.uid),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }

        if (snapshot.hasError) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.error_outline,
                  size: 64,
                  color: theme.colorScheme.error,
                ),
                const SizedBox(height: 16),
                Text(
                  localeProvider.translate('feedback.errorLoading'),
                  style: theme.textTheme.titleMedium,
                ),
                const SizedBox(height: 8),
                Text(
                  snapshot.error.toString(),
                  style: theme.textTheme.bodyMedium,
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          );
        }

        final feedbacks = snapshot.data ?? [];

        if (feedbacks.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.feedback_outlined,
                  size: 64,
                  color: theme.textTheme.bodyMedium?.color?.withOpacity(0.5),
                ),
                const SizedBox(height: 16),
                Text(
                  localeProvider.translate('feedback.noFeedback'),
                  style: theme.textTheme.titleMedium,
                ),
                const SizedBox(height: 8),
                Text(
                  localeProvider.translate('feedback.noFeedbackDesc'),
                  style: theme.textTheme.bodyMedium,
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          );
        }

        return ListView.builder(
          itemCount: feedbacks.length,
          itemBuilder: (context, index) {
            final feedback = feedbacks[index];
            return Card(
              margin: const EdgeInsets.only(bottom: 16),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            feedback.subject,
                            style: theme.textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: _getStatusColor(
                              feedback.status,
                            ).withOpacity(0.1),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: _getStatusColor(feedback.status),
                            ),
                          ),
                          child: Text(
                            _getStatusText(feedback.status, localeProvider),
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: _getStatusColor(feedback.status),
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        ...List.generate(5, (starIndex) {
                          return Icon(
                            starIndex < feedback.rating
                                ? Icons.star
                                : Icons.star_border,
                            size: 16,
                            color: Colors.amber,
                          );
                        }),
                        const SizedBox(width: 8),
                        Text(
                          '${feedback.rating}/5',
                          style: theme.textTheme.bodySmall?.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text(feedback.message, style: theme.textTheme.bodyMedium),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Icon(
                          Icons.access_time,
                          size: 16,
                          color: theme.textTheme.bodySmall?.color,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          _formatDate(feedback.createdAt),
                          style: theme.textTheme.bodySmall,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'open':
        return Colors.orange;
      case 'in-review':
        return Colors.blue;
      case 'resolved':
        return Colors.green;
      default:
        return Colors.grey;
    }
  }

  String _getStatusText(String status, LocaleProvider localeProvider) {
    switch (status) {
      case 'open':
        return localeProvider.translate('feedback.status.open');
      case 'in-review':
        return localeProvider.translate('feedback.status.inReview');
      case 'resolved':
        return localeProvider.translate('feedback.status.resolved');
      default:
        return status;
    }
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }
}
