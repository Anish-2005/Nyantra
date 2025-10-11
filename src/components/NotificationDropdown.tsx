"use client";
import React, { useEffect, useRef, ReactNode } from 'react';
import { createPortal } from 'react-dom';

type Props = {
  anchorRef?: React.RefObject<HTMLElement | null>;
  // Some callers use triggerRef naming; accept either
  triggerRef?: React.RefObject<HTMLElement | null>;
  isOpen: boolean;
  onClose: () => void;
  children?: ReactNode;
  width?: number | string;
  offsetY?: number;
};

export default function NotificationDropdown({ anchorRef, triggerRef, isOpen, onClose, children = null, width = 320, offsetY = 12 }: Props) {
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
      const ref = triggerRef ?? anchorRef;
      if (ref && ref.current && ref.current.contains(target)) return;
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
  }, [isOpen, anchorRef, triggerRef, onClose]);

  if (!isOpen || !elRef.current || !portalRootRef.current) return null;

  const ref = triggerRef ?? anchorRef;
  const anchorRect = ref?.current?.getBoundingClientRect();
  const right = anchorRect ? window.innerWidth - anchorRect.right : 24;
  const top = anchorRect ? anchorRect.bottom + offsetY : 80;

  // Choose a slightly stronger background to reduce transparency and improve legibility
  const styleRoot = getComputedStyle(document.documentElement);
  const dropdownBgVar = styleRoot.getPropertyValue('--card-bg')?.trim();
  const borderVar = styleRoot.getPropertyValue('--card-border')?.trim();
  const textVar = styleRoot.getPropertyValue('--text-primary')?.trim();

  // Fallbacks when CSS vars are missing or too transparent
  const isDark = (document.documentElement.getAttribute('data-theme') || '').trim() === 'dark';
  const bgFallback = isDark ? 'rgba(15, 23, 42, 0.98)' : 'rgba(255,255,255,0.98)';
  const borderFallback = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const textFallback = isDark ? '#f1f5f9' : '#0f172a';

  const content = (
    <div
      style={{
        right: `${right}px`,
        top: `${top}px`,
        position: 'fixed',
        width: typeof width === 'number' ? `${width}px` : width,
        background: dropdownBgVar || bgFallback,
        border: `1px solid ${borderVar || borderFallback}`,
        color: textVar || textFallback,
        WebkitBackdropFilter: 'blur(8px)',
        backdropFilter: 'blur(8px)'
      }}
      className="rounded-2xl shadow-xl p-4"
    >
      {children}
    </div>
  );

  return createPortal(content, elRef.current);
}
