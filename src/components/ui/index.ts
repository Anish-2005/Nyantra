/**
 * Shared design-system barrel.
 * Import UI primitives from '@/components/ui'.
 */
export { Button, type ButtonProps, type ButtonSize, type ButtonVariant } from './Button';
export { IconButton, type IconButtonProps } from './IconButton';
export { Input, type InputProps } from './Input';
export { Select, type SelectOption, type SelectProps } from './Select';
export { Card, type CardProps } from './Card';
export { Modal, type ModalProps } from './Modal';
export {
  StatusPill,
  pillToneClasses,
  type PillTone,
  type StatusPillProps,
} from './StatusPill';
export { StatCard, type StatCardProps } from './StatCard';
export { ProgressBar, type ProgressBarProps } from './ProgressBar';
export { EmptyState, type EmptyStateProps } from './EmptyState';
export { Skeleton } from './Skeleton';
export { ConfirmDialog, type ConfirmDialogProps } from './ConfirmDialog';
export { ToastProvider, useToast, type ToastKind } from './Toast';
export { Tabs, type TabsProps } from './Tabs';
