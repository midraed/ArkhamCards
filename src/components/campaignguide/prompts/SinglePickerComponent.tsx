import React from 'react';

import PickerComponent, { PickerProps } from './PickerComponent';

interface Props extends PickerProps {
  onChoiceChange: (index: number) => void;
  selectedIndex?: number;
}

export default function SinglePickerComponent({ onChoiceChange, selectedIndex, ...otherProps }: Props) {
  return (
    <PickerComponent
      {...otherProps}
      config={{
        mode: 'single',
        onChoiceChange,
        selectedIndex,
      }}
    />
  );
}
