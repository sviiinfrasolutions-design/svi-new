'use client';

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import type { DraftData } from '../types';
import { getAllDrafts, deleteDraft as deleteDraftHelper } from '../helpers';

interface UseDraftsReturn {
  drafts: DraftData[];
  loading: boolean;
  refreshDrafts: () => void;
  deleteDraft: (id: string) => Promise<boolean>;
  openDraft: (id: string) => DraftData | null;
}

export function useDrafts(): UseDraftsReturn {
  const [drafts, setDrafts] = useState<DraftData[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshDrafts = useCallback(() => {
    setLoading(true);
    getAllDrafts()
      .then((allDrafts) => {
        setDrafts(allDrafts);
      })
      .catch((error) => {
        console.error('Failed to load drafts:', error);
        toast.error('Failed to load drafts');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    refreshDrafts();
  }, [refreshDrafts]);

  const deleteDraft = useCallback(async (id: string): Promise<boolean> => {
    try {
      const success = await deleteDraftHelper(id);
      if (success) {
        setDrafts((prev) => prev.filter((d) => d.id !== id));
        toast.success('Draft deleted');
      } else {
        toast.error('Failed to delete draft');
      }
      return success;
    } catch (error) {
      console.error('Failed to delete draft:', error);
      toast.error('Failed to delete draft');
      return false;
    }
  }, []);

  const openDraft = useCallback(
    (id: string): DraftData | null => {
      const draft = drafts.find((d) => d.id === id);
      return draft || null;
    },
    [drafts]
  );

  return {
    drafts,
    loading,
    refreshDrafts,
    deleteDraft,
    openDraft,
  };
}
