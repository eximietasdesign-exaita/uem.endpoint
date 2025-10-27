import React from 'react';

export function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, index) =>
    regex.test(part)
      ? React.createElement(
          'mark',
          {
            key: index,
            className:
              'bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100 px-0.5 rounded font-medium',
          },
          part
        )
      : part
  );
}