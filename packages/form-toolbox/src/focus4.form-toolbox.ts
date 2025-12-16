import {registerFieldComponent, registerFormComponent} from "@focus4/forms";

import {Field, fieldCss, Form, formCss} from "./field";

registerFieldComponent(Field);
registerFormComponent(Form);

export {
    AutocompleteChips,
    AutocompleteSearch,
    BooleanRadio,
    booleanRadioCss,
    Display,
    displayCss,
    FormCheckbox,
    FormSwitch,
    Input,
    InputDate,
    inputDateCss,
    InputFile,
    inputFileCss,
    Label,
    labelCss,
    Select,
    SelectAutocomplete,
    SelectCheckbox,
    selectCheckboxCss,
    SelectChips,
    selectChipsCss,
    SelectRadio,
    selectRadioCss
} from "./components";
export {domain} from "./domain";
export {i18nFormToolbox} from "./translation";
export {Field, fieldCss, Form, formCss};

export {
    AutocompleteChipsProps,
    AutocompleteSearchProps,
    BooleanRadioCss,
    BooleanRadioProps,
    DisplayCss,
    DisplayProps,
    FormCheckboxProps,
    FormSwitchProps,
    InputDateProps,
    InputFileCss,
    InputFileProps,
    InputProps,
    LabelCss,
    LabelProps,
    SelectAutocompleteProps,
    SelectCheckboxCss,
    SelectCheckboxProps,
    SelectChipsCss,
    SelectChipsProps,
    SelectProps,
    SelectRadioCss,
    SelectRadioProps
} from "./components";
export type {FieldCss, FormCss} from "./field";
