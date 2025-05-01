import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  LayoutChangeEvent,
  LayoutRectangle,
  Dimensions,
} from 'react-native';
import { colors, spacing, typography, elevation } from '../constants/theme';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({
  text,
  children,
  position = 'top'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [childLayout, setChildLayout] = useState<LayoutRectangle | null>(null);
  const [tooltipLayout, setTooltipLayout] = useState<LayoutRectangle | null>(null);

  const handleChildLayout = (event: LayoutChangeEvent) => {
    setChildLayout(event.nativeEvent.layout);
  };

  const handleTooltipLayout = (event: LayoutChangeEvent) => {
    setTooltipLayout(event.nativeEvent.layout);
  };

  const calculatePosition = () => {
    if (!childLayout || !tooltipLayout) return {};

    const screenWidth = Dimensions.get('window').width;
    const screenHeight = Dimensions.get('window').height;
    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = childLayout.y - tooltipLayout.height - spacing.sm;
        left = childLayout.x + (childLayout.width - tooltipLayout.width) / 2;
        break;
      case 'bottom':
        top = childLayout.y + childLayout.height + spacing.sm;
        left = childLayout.x + (childLayout.width - tooltipLayout.width) / 2;
        break;
      case 'left':
        top = childLayout.y + (childLayout.height - tooltipLayout.height) / 2;
        left = childLayout.x - tooltipLayout.width - spacing.sm;
        break;
      case 'right':
        top = childLayout.y + (childLayout.height - tooltipLayout.height) / 2;
        left = childLayout.x + childLayout.width + spacing.sm;
        break;
    }

    // Ensure tooltip stays within screen bounds
    left = Math.max(spacing.sm, Math.min(left, screenWidth - tooltipLayout.width - spacing.sm));
    top = Math.max(spacing.sm, Math.min(top, screenHeight - tooltipLayout.height - spacing.sm));

    return { top, left };
  };

  return (
    <View onLayout={handleChildLayout}>
      <TouchableOpacity
        onPress={() => setIsVisible(true)}
        activeOpacity={0.8}
      >
        {children}
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsVisible(false)}>
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.tooltip,
                calculatePosition(),
              ]}
              onLayout={handleTooltipLayout}
            >
              <Text style={styles.tooltipText}>{text}</Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: spacing.sm,
    maxWidth: 200,
    ...elevation.medium,
  },
  tooltipText: {
    ...typography.body2,
    color: colors.text.primary,
  },
});