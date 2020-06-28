import * as React from "react";
import {SLIDER} from "react-toolbox/lib/identifiers";
import {
    Slider as SliderType,
    sliderFactory,
    SliderProps as RTSliderProps,
    SliderTheme
} from "react-toolbox/lib/slider/Slider";

import {CSSProp, fromBem, useTheme} from "@focus4/styling";
import rtSliderTheme from "react-toolbox/components/slider/theme.css";
const sliderTheme: SliderTheme = rtSliderTheme;
export {sliderTheme};

import {Input} from "./input";
import {ProgressBar} from "./progress-bar";

const RTSlider = sliderFactory(ProgressBar as any, Input as any);
type SliderProps = Omit<RTSliderProps, "theme"> & {theme?: CSSProp<SliderTheme>};
export const Slider = React.forwardRef<SliderType, SliderProps>((props, ref) => {
    const theme = useTheme(SLIDER, sliderTheme, props.theme);
    return <RTSlider ref={ref} {...props} theme={fromBem(theme)} />;
});

export {SliderProps, SliderTheme};
