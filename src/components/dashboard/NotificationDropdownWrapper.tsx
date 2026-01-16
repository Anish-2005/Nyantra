"use client";
import React from 'react';
import { AnimatePresence } from 'framer-motion';
import NotificationDropdonw from './NotificationDropdown';

interface NotificationDropdownWrapperProps {
  isNotificationOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLElement>;
}

const NotificationDropdownWrapper: React.FC<NotificationDropdownWrapperProps> = ({
  isNotificationOpen,
  onClose,
  triggerRef
}) => {
  return (
    <AnimatePresence>
      {isNotificationOpen && (
        <NotificationDropdown
          isOpen={isNotificationOpen}
          onClose={onClose}
          triggerRef={triggerRef}
        />
      )}
    </AnimatePresence>
  );
};

export default NotificationDropdownWrapper;