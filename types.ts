import React from 'react';

export interface Session {
  id: string;
  slug: string;
  title: string;
  author: string;
  role: string;
  duration: string;
  durationSec: number; // For progress bar logic
  category: string;
  color: 'indigo' | 'teal' | 'orange' | 'rose' | 'blue' | 'emerald' | 'purple';
  description: string;
  fullContent: string;
  relatedSessions: string[];
  createdAt?: string;
  updatedAt?: string;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'iconify-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        icon: string;
        width?: string | number;
        'stroke-width'?: string | number;
      };
    }
  }
}