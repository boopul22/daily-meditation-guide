import React from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
}

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
  featuredImage: string;
  audioUrl: string;
  fullContent: string;
  relatedSessions: string[];
  createdAt?: string;
  updatedAt?: string;
}

// Global augmentation
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'iconify-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        icon: string;
        width?: string | number;
        height?: string | number;
        rotate?: string | number;
        flip?: string;
        mode?: string;
        inline?: boolean;
        'stroke-width'?: string | number;
        [key: string]: any;
      };
    }
  }
}

// Module augmentation for React 18+ / React 19
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'iconify-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        icon: string;
        width?: string | number;
        height?: string | number;
        rotate?: string | number;
        flip?: string;
        mode?: string;
        inline?: boolean;
        'stroke-width'?: string | number;
        [key: string]: any;
      };
    }
  }
}
