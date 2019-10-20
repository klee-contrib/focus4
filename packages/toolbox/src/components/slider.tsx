import * as React from "react";
import {SLIDER} from "react-toolbox/lib/identifiers";
import {Slider as SliderType, sliderFactory, SliderProps, SliderTheme} from "react-toolbox/lib/slider/Slider";

import {useTheme} from "@focus4/styling";
import rtSliderTheme from "react-toolbox/components/slider/theme.css";
const sliderTheme: SliderTheme = rtSliderTheme;
export {sliderTheme};

import {Input} from "./input";
import {ProgressBar} from "./progress-bar";

const RTSlider = sliderFactory(ProgressBar, Input);
export const Slider = React.forwardRef<SliderType, SliderProps>((props, ref) => {
    const theme = useTheme(SLIDER, sliderTheme, props.theme);
    return <RTSlider ref={ref} {...props} theme={theme} />;
});

export {SliderProps, SliderTheme};
