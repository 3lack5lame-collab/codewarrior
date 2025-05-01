import { useState, useCallback } from 'react';

interface DialogConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'default' | 'warning' | 'danger';
  icon?: string;
}

interface UseDialogReturn {
  isVisible: boolean;
  dialogConfig: DialogConfig;
  showDialog: (config: DialogConfig) => Promise<boolean>;
  hideDialog: () => void;
}

export const useDialog = (): UseDialogReturn => {
  const [isVisible, setIsVisible] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<DialogConfig>({
    title: '',
    message: '',
  });
  const [resolveRef, setResolveRef] = useState<((value: boolean) => void) | null>(null);

  const showDialog = useCallback((config: DialogConfig) => {
    setDialogConfig(config);
    setIsVisible(true);

    return new Promise<boolean>((resolve) => {
      setResolveRef(() => resolve);
    });
  }, []);

  const hideDialog = useCallback(() => {
    setIsVisible(false);
    setDialogConfig({ title: '', message: '' });
    if (resolveRef) {
      resolveRef(false);
      setResolveRef(null);
    }
  }, [resolveRef]);

  const handleConfirm = useCallback(() => {
    if (resolveRef) {
      resolveRef(true);
      setResolveRef(null);
    }
    setIsVisible(false);
  }, [resolveRef]);

  return {
    isVisible,
    dialogConfig: {
      ...dialogConfig,
      onConfirm: handleConfirm,
      onCancel: hideDialog,
    },
    showDialog,
    hideDialog,
  };
};