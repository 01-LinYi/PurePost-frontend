import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import ActionButton from "../ActionButton";
import { Text } from "../Themed";

describe("ActionButton", () => {
  test("calls onPress when button is pressed", () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <ActionButton text="Test Button" onPress={onPressMock} />
    );

    const button = getByText("Test Button");
    fireEvent.press(button);

    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  test("does not call onPress when disabled", () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <ActionButton text="Test Button" onPress={onPressMock} disabled={true} />
    );

    const button = getByText("Test Button");
    fireEvent.press(button);

    expect(onPressMock).not.toHaveBeenCalled();
  });

  test("shows ActivityIndicator when loading", () => {
    const { UNSAFE_getByType } = render(
      <ActionButton text="Test Button" onPress={() => {}} loading={true} />
    );

    expect(UNSAFE_getByType("ActivityIndicator")).toBeTruthy();
  });

  test("renders text correctly", () => {
    const { getByText } = render(
      <ActionButton text="Custom Text" onPress={() => {}} />
    );

    expect(getByText("Custom Text")).toBeTruthy();
  });

  test("renders icon when provided", () => {
    const testIcon = <Text testID="test-icon">Icon</Text>;
    const { getByTestId } = render(
      <ActionButton icon={testIcon} onPress={() => {}} />
    );

    expect(getByTestId("test-icon")).toBeTruthy();
  });
});
