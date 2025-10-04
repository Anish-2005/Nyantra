"use client";
import dynamic from 'next/dynamic';
import React from 'react';

const Cursor = dynamic(() => import('./Cursor'), { ssr: false });

export default function ClientCursor() {
  return <Cursor />;
}
