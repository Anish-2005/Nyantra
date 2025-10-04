"use client";
import React, { useEffect, useRef, ReactNode } from 'react';
import { createPortal } from 'react-dom';

type Props = {
  anchorRef: React.RefObject<HTMLElement | null>;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  width?: number | string;
  offsetY?: number;
};

export default function NotificationDropdown({ anchorRef, isOpen, onClose, children, width = 320, offsetY = 12 }: Props) {
  const portalRootRef = useRef<HTMLElement | null>(null);
  const elRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    portalRootRef.current = document.body;
    if (!elRef.current) {
      elRef.current = document.createElement('div');
      elRef.current.style.position = 'fixed';
      elRef.current.style.zIndex = '2147483647'; // max safe z-index
      portalRootRef.current.appendChild(elRef.current);
    }
    return () => {
      if (elRef.current && portalRootRef.current) {
        portalRootRef.current.removeChild(elRef.current);
        elRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!elRef.current) return;
      if (elRef.current.contains(target)) return;
      if (anchorRef.current && anchorRef.current.contains(target)) return;
      onClose();
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const handleScrollOrResize = () => {
      // force re-render/position update by toggling a data attribute
      if (elRef.current) elRef.current.dataset.r = String(Date.now());
    };

    window.addEventListener('mousedown', handleClick);
    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('keydown', handleKey);

    return () => {
      window.removeEventListener('mousedown', handleClick);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('keydown', handleKey);
    };
  }, [isOpen, anchorRef, onClose]);

  if (!isOpen || !elRef.current || !portalRootRef.current) return null;

  const anchorRect = anchorRef.current?.getBoundingClientRect();
  const right = anchorRect ? window.innerWidth - anchorRect.right : 24;
  const top = anchorRect ? anchorRect.bottom + offsetY : 80;

  const content = (
    <div
      style={{ right: `${right}px`, top: `${top}px`, position: 'fixed', width: typeof width === 'number' ? `${width}px` : width }}
      className="theme-bg-card theme-border-glass border rounded-2xl shadow-xl p-4 backdrop-blur-xl"
    >
      {children}
    </div>
  );

  return createPortal(content, elRef.current);
}
