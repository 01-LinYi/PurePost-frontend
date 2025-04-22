// components/CachedImage.tsx
// This component is used to display an image with a cache mechanism.
// This is a warpper around the expo-image
import React from "react";
import { Image as ExpoImage, ImageProps as ExpoImageProps } from "expo-image";

export const Image: React.FC<ExpoImageProps> = (props) => {
  return <ExpoImage {...props} cachePolicy={props.cachePolicy || "memory-disk"} />;
};
