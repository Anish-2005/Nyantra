"use client";
import dynamic from 'next/dynamic';
import React from 'react';

const BackgroundFollow = dynamic(() => import('./BackgroundFollow'), { ssr: false });

export default function ClientBackgroundCursor() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <BackgroundFollow />
    </div>
  );
}
