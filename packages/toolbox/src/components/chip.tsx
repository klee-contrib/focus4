import * as React from "react";
import {Chip as ChipType, chipFactory, ChipProps as RTChipProps, ChipTheme} from "react-toolbox/lib/chip/Chip";
import {CHIP} from "react-toolbox/lib/identifiers";

import {CSSProp, fromBem, useTheme} from "@focus4/styling";
import rtChipTheme from "react-toolbox/components/chip/theme.css";
const chipTheme: ChipTheme = rtChipTheme;
export {chipTheme};

import {Avatar} from "./avatar";

const RTChip = chipFactory(Avatar);
type ChipProps = Omit<RTChipProps, "theme"> & {theme?: CSSProp<ChipTheme>};
export const Chip = React.forwardRef<ChipType, ChipProps>((props, ref) => {
    const theme = useTheme(CHIP, chipTheme, props.theme);
    return <RTChip ref={ref} {...props} theme={fromBem(theme)} />;
});

export {ChipProps, ChipTheme};
