'use client';

import { useEffect } from 'react';
import { track } from '@vercel/analytics';

interface Props {
  event: string;
  data?: Record<string, any>;
}

export default function AnalyticsTracker({ event, data }: Props) {
  useEffect(() => {
    track(event, data);
  }, [event, data]);

  return null;
}
