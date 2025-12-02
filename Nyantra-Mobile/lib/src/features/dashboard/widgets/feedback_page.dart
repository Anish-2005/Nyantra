import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:user_dashboard_app/src/core/services/data_service.dart';
import 'package:user_dashboard_app/src/core/models/feedback_model.dart';

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

  Future<void> _submitFeedback() async {
    if (!_formKey.currentState!.validate()) return;

    final user = FirebaseAuth.instance.currentUser;
    if (user == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please log in to submit feedback')),
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
          const SnackBar(content: Text('Thank you for your feedback!')),
        );
        _subjectController.clear();
        _feedbackController.clear();
        setState(() => _rating = 0);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to submit feedback: $e')),
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

    return Container(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Feedback',
            style: theme.textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Help us improve by sharing your experience',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.textTheme.bodyMedium?.color?.withOpacity(0.7),
            ),
          ),
          const SizedBox(height: 24),
          TabBar(
            controller: _tabController,
            tabs: const [
              Tab(text: 'Submit Feedback'),
              Tab(text: 'My Feedback'),
            ],
          ),
          const SizedBox(height: 24),
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _buildSubmitFeedbackTab(theme),
                _buildMyFeedbackTab(theme),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSubmitFeedbackTab(ThemeData theme) {
    return SingleChildScrollView(
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Rate your experience',
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
              'Subject',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _subjectController,
              decoration: InputDecoration(
                hintText: 'Brief description of your feedback...',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                filled: true,
                fillColor: theme.cardColor,
              ),
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Please enter a subject';
                }
                return null;
              },
            ),
            const SizedBox(height: 32),
            Text(
              'Your feedback',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _feedbackController,
              maxLines: 5,
              decoration: InputDecoration(
                hintText: 'Tell us what you think...',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                filled: true,
                fillColor: theme.cardColor,
              ),
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Please enter your feedback';
                }
                return null;
              },
            ),
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: _isSubmitting ? null : _submitFeedback,
                style: ElevatedButton.styleFrom(
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: _isSubmitting
                    ? const CircularProgressIndicator()
                    : const Text('Submit Feedback'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMyFeedbackTab(ThemeData theme) {
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
              'Please log in to view your feedback',
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
                  'Error loading feedback',
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
                  'No feedback submitted yet',
                  style: theme.textTheme.titleMedium,
                ),
                const SizedBox(height: 8),
                Text(
                  'Your submitted feedback will appear here',
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
                            _getStatusText(feedback.status),
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

  String _getStatusText(String status) {
    switch (status) {
      case 'open':
        return 'Open';
      case 'in-review':
        return 'In Review';
      case 'resolved':
        return 'Resolved';
      default:
        return status;
    }
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }
}
