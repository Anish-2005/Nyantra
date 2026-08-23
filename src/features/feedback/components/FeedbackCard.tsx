"use client";
import { Pencil, Star, Trash2 } from 'lucide-react';
import type { Feedback, TranslateFn } from '../helpers';
import { getStatusPillClass } from '../helpers';

/** Single past-feedback card: subject, status pill, rating stars, message and edit/delete actions. */
export default function FeedbackCard({
  feedback,
  onEdit,
  onDelete,
  t,
}: {
  feedback: Feedback;
  onEdit: (feedback: Feedback) => void;
  onDelete: (id: string) => void;
  t: TranslateFn;
}) {
  const getRatingStars = (value: number) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-3.5 h-3.5 ${star <= value ? 'fill-current text-amber-400' : 'theme-text-muted'}`}
        />
      ))}
      <span className="ml-1 text-[11px] theme-text-muted tabular-nums">{value}/5</span>
    </div>
  );

  return (
    <div className="theme-bg-card theme-border-glass border rounded-lg p-3.5">
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-sm theme-text-primary truncate leading-tight">
              {feedback.subject}
            </h4>
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide shrink-0 ${getStatusPillClass(feedback.status)}`}>
              {(feedback.status ?? '').replace('-', ' ')}
            </span>
          </div>
          <div className="mt-1.5">
            {getRatingStars(feedback.rating)}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onEdit(feedback)}
            className="p-1.5 rounded-md theme-text-muted hover:theme-bg-hover hover:theme-text-primary transition-colors"
            title={t('extracted.edit') || 'Edit'}
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(feedback.id)}
            className="p-1.5 rounded-md theme-text-muted hover:bg-red-500/10 hover:text-red-500 transition-colors"
            title={t('extracted.delete') || 'Delete'}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <p className="text-[13px] theme-text-secondary leading-relaxed">
        {feedback.message}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-2 mt-2.5 pt-2.5 border-t theme-border-glass">
        <span className="text-[11px] theme-text-muted tabular-nums">
          {t('extracted.created') || 'Created'}: {feedback.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
          {feedback.updatedAt && feedback.updatedAt.toDate?.().getTime() !== feedback.createdAt?.toDate?.().getTime() && (
            <span className="ml-2">
              • {t('extracted.updated') || 'Updated'}: {feedback.updatedAt.toDate?.().toLocaleDateString()}
            </span>
          )}
        </span>
        <span className="text-[11px] theme-text-muted font-mono">
          #{feedback.id.slice(-6)}
        </span>
      </div>
    </div>
  );
}
