import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import EditButton from "../EditButton"; // 假设按钮组件位于上级目录
import { jest, describe, it, expect } from '@jest/globals';

describe("EditButton Component", () => {
  it("renders correctly", () => {
    const { getByText } = render(<EditButton onPress={() => {}} />);
    expect(getByText("Edit Profile")).toBeTruthy();
  });

  it("calls onPress when pressed", () => {
    const onPressMock = jest.fn();
    const { getByText } = render(<EditButton onPress={onPressMock} />);

    fireEvent.press(getByText("Edit Profile"));


    expect(onPressMock).toHaveBeenCalled();
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it("renders with the correct styles", () => {
    const { getByText } = render(<EditButton onPress={() => {}} />);
    const buttonText = getByText("Edit Profile");


    expect(buttonText.props.style).toEqual(
      expect.objectContaining({
        fontSize: 13,
        fontWeight: "500",
        color: "#fff",
        textTransform: "uppercase",
      })
    );
  });
});
