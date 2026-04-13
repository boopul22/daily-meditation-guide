export interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
  isAdmin: boolean;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface Author {
  id: string;
  slug: string;
  name: string;
  role: string;
  picture: string;
  bio: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Session {
  id: string;
  slug: string;
  title: string;
  author: string;
  role: string;
  authorId?: string | null;
  authorPicture?: string;
  authorSlug?: string;
  duration: string;
  durationSec: number; // For progress bar logic
  category: string;
  color: string;
  description: string;
  featuredImage: string;
  audioUrl: string;
  fullContent: string;
  relatedSessions: string[];
  faqItems: FAQItem[];
  status: 'draft' | 'published';
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  version?: number;
  lastUpdatedBy?: string | null;
}

export interface Infographic {
  id: string;
  slug: string;
  title: string;
  description: string;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  altText: string;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  status: 'draft' | 'published';
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  version?: number;
  lastUpdatedBy?: string | null;
}

// Global augmentation for Astro
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'iconify-icon': Record<string, any>;
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
