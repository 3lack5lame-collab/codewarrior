import { useState, useCallback } from 'react';

interface UseRefreshParams {
  onRefresh: () => Promise<void>;
}

export const useRefresh = ({ onRefresh }: UseRefreshParams) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh]);

  return {
    isRefreshing,
    handleRefresh
  };
};