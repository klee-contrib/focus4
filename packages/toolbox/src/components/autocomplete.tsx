import * as React from "react";
import {
    Autocomplete as AutocompleteType,
    autocompleteFactory,
    AutocompleteProps as RTAutocompleteProps,
    AutocompleteTheme
} from "react-toolbox/lib/autocomplete/Autocomplete";
import {AUTOCOMPLETE} from "react-toolbox/lib/identifiers";

import {CSSProp, fromBem, useTheme} from "@focus4/styling";
import rtAutocompleteTheme from "react-toolbox/components/autocomplete/theme.css";
const autocompleteTheme: AutocompleteTheme & InputTheme = rtAutocompleteTheme;
export {autocompleteTheme};

import {Chip} from "./chip";
import {Input, InputTheme} from "./input";

const RTAutocomplete = autocompleteFactory(Chip as any, Input as any);
type AutocompleteProps = Omit<RTAutocompleteProps, "theme"> & {theme?: CSSProp<AutocompleteTheme & InputTheme>};
export const Autocomplete: React.ForwardRefExoticComponent<
    AutocompleteProps & React.RefAttributes<AutocompleteType>
> = React.forwardRef((props, ref) => {
    const theme = useTheme(AUTOCOMPLETE, autocompleteTheme, props.theme);
    return <RTAutocomplete ref={ref} {...props} theme={fromBem(theme)} />;
});

export {AutocompleteProps, AutocompleteTheme};
