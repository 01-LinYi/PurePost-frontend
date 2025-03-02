import React, { memo } from 'react';
import { TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Text } from './Themed';

export interface ActionButtonProps {
  onPress: () => void;
  icon?: React.ReactNode;
  text?: string;
  disabled?: boolean;
  loading?: boolean;
  style?: any;
  textStyle?: any;
}

const ActionButton = memo(
  ({ onPress, icon, text, disabled, loading, style, textStyle }: ActionButtonProps) => {
    return (
      <TouchableOpacity
        style={[styles.actionButton, style, disabled && styles.buttonDisabled]}
        onPress={onPress}
        disabled={disabled || loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" size="small" />
        ) : (
          <>
            {icon && icon}
            {text && <Text style={[styles.buttonText, textStyle]}>{text}</Text>}
          </>
        )}
      </TouchableOpacity>
    );
  }
);

ActionButton.displayName = 'ActionButton';

const styles = StyleSheet.create({
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    padding: 12,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontWeight: '500',
  },
});

export default ActionButton;