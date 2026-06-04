'use client';

import { PROPERTY_LABELS } from './propertyLabels';

export function renderPropertyInterestTags(
  interest: string | null,
  properties: Array<{ name: string; slug: string }> = []
) {
  if (!interest) return null;
  const items = interest.split(',').map((item) => {
    const trimmed = item.trim();
    const found = properties.find((p) => p.slug === trimmed);
    if (found) return found.name;
    if (PROPERTY_LABELS[trimmed]) return PROPERTY_LABELS[trimmed];
    return trimmed
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  });

  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item, idx) => (
        <span
          key={idx}
          className="inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-[10px] font-medium text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-300"
        >
          {item}
        </span>
      ))}
    </div>
  );
}
