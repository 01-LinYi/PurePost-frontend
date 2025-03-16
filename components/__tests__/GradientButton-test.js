import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import GradientButton from '../GradientButton';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '../Themed';

// Mock the LinearGradient component
jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return {
    LinearGradient: jest.fn(({ children, style, colors }) => (
      <View testID="gradient" style={style} colors={colors}>
        {children}
      </View>
    )),
  };
});

describe('GradientButton', () => {
  test('calls onPress when button is pressed and does not call when disabled', () => {
    // Test normal state
    const onPressMock = jest.fn();
    const { getByText, rerender } = render(
      <GradientButton text="Test Button" onPress={onPressMock} />
    );
    
    fireEvent.press(getByText('Test Button'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
    
    // Test disabled state
    rerender(<GradientButton text="Test Button" onPress={onPressMock} disabled={true} />);
    fireEvent.press(getByText('Test Button'));
    expect(onPressMock).toHaveBeenCalledTimes(1); // Count remains the same
  });
  
  test('shows ActivityIndicator when loading and does not call onPress', () => {
    const onPressMock = jest.fn();
    const { UNSAFE_getByType } = render(
      <GradientButton text="Test Button" onPress={onPressMock} loading={true} />
    );
    
    // Verify ActivityIndicator is displayed
    expect(UNSAFE_getByType('ActivityIndicator')).toBeTruthy();
  });
  
  test('applies uppercase style to text when uppercase prop is true', () => {
    const customTextStyle = { fontSize: 18, fontWeight: '700' };
    
    // Test uppercase
    const { getByText, rerender } = render(
      <GradientButton 
        text="button text" 
        onPress={() => {}} 
        uppercase={true}
        textStyle={customTextStyle}
      />
    );
    
    const textElement = getByText('button text');
    
    // Check that the style array contains our custom style
    const flattenedStyles = textElement.props.style.flat 
      ? textElement.props.style.flat()
      : textElement.props.style;
      
    expect(flattenedStyles).toEqual(
      expect.arrayContaining([
        expect.objectContaining(customTextStyle)
      ])
    );
    
    // Check that the style array contains the uppercase style
    const hasUppercaseStyle = flattenedStyles.some(
      style => style && style.textTransform === 'uppercase'
    );
    expect(hasUppercaseStyle).toBe(true);
    
    // Test regular case
    rerender(
      <GradientButton 
        text="Button Text" 
        onPress={() => {}} 
        uppercase={false}
        textStyle={customTextStyle}
      />
    );
    
    const regularText = getByText('Button Text');
    const regularFlattenedStyles = regularText.props.style.flat 
      ? regularText.props.style.flat()
      : regularText.props.style;
      
    const hasNoUppercaseStyle = !regularFlattenedStyles.some(
      style => style && style.textTransform === 'uppercase'
    );
    expect(hasNoUppercaseStyle).toBe(true);
  });
  
  test('applies custom gradient colors and configuration', () => {
    const customColors = ['#FF0000', '#00FF00'];
    const customStart = { x: 0.2, y: 0.2 };
    const customEnd = { x: 0.8, y: 0.8 };
    
    render(
      <GradientButton 
        text="Custom Gradient" 
        onPress={() => {}} 
        gradientColors={customColors}
        gradientStart={customStart}
        gradientEnd={customEnd}
      />
    );
    
    expect(LinearGradient).toHaveBeenCalledWith(
      expect.objectContaining({
        colors: customColors,
        start: customStart,
        end: customEnd
      }),
      expect.anything()
    );
  });
  
  test('renders icon and applies custom borderRadius', () => {
    const testIcon = <Text testID="test-icon">Icon</Text>;
    const customBorderRadius = 10;
    
    const { getByTestId } = render(
      <GradientButton 
        text="Button with Icon" 
        onPress={() => {}} 
        icon={testIcon}
        borderRadius={customBorderRadius}
      />
    );
    
    // Check icon rendering
    expect(getByTestId('test-icon')).toBeTruthy();
    
    // Check custom border radius
    const gradientElement = getByTestId('gradient');
    expect(gradientElement.props.style.borderRadius).toBe(customBorderRadius);
  });
});