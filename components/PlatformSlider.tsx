import { Platform } from 'react-native';
import React from 'react';

let Slider: any;
if (Platform.OS === 'web') {
  const RcSlider = require('rc-slider').default;
  require('rc-slider/assets/index.css');
  Slider = (props: any) => {
    const { onValueChange, value, minimumValue, maximumValue, ...rest } = props;
    return (
      <RcSlider
        value={value}
        min={minimumValue}
        max={maximumValue}
        onChange={onValueChange}
        {...rest}
      />
    );
  };
} else {
  Slider = require('@react-native-community/slider').default;
}

export default Slider; 