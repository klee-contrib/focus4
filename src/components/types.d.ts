// Définitions de styles manquants de libraries externes pour pouvoir compiler certains composants.

declare module "smoothscroll-polyfill";
declare module "react-toolbox/lib/date_picker/theme.css";
declare module "react-toolbox/lib/time_picker/theme.css";

declare module "react-toolbox/lib/date_picker/Calendar" {
    import {DatePickerLocale} from "react-toolbox/lib/date_picker";

    interface CalendarProps {
        disabledDates?: Date[];
        display?: "months" | "years";
        enabledDates?: Date[];
        handleSelect?: Function;
        locale?: string | DatePickerLocale;
        maxDate?: Date;
        minDate?: Date;
        onChange: Function;
        selectedDate?: Date;
        sundayFirstDayOfWeek?: boolean;
        theme?: {};
    }

    function calendarFactory(IconButton: any): React.ComponentClass<CalendarProps>;

    export default calendarFactory;
}

declare module "react-toolbox/lib/time_picker/Clock" {
    interface ClockProps {
        display?: "hours" | "minutes";
        format?: "24hr" | "ampm";
        onChange?: Function;
        onHandMoved?: Function;
        theme?: {};
        time?: Date;
    }

    const Clock: React.ComponentClass<ClockProps>;
    export default Clock;
}

declare module "inputmask-core" {
    interface InputMaskSelection {
        start?: number;
        end?: number;
    }

    interface InputMaskFormatOptions {
        transform: (char: string) => string;
        validate: (char: string) => boolean;
    }

    interface InputMaskOptions {
        pattern: string;
        formatCharacters?: {[key: string]: InputMaskFormatOptions | null};
        placeholderChar?: string;
        value?: string;
        selection?: InputMaskSelection;
        isRevealingMask?: boolean;
    }

    export default class {
        emptyValue: string;
        selection: InputMaskSelection;

        constructor(options: InputMaskOptions);

        getRawValue(): string | undefined;
        getValue(): string | undefined;

        setPattern(pattern: string, options?: {selection?: InputMaskSelection; value?: string | undefined}): void;
        setSelection(selection: InputMaskSelection): void;
        setValue(value: string | undefined): void;

        backspace(): boolean;
        input(char: string): boolean;
        paste(input: string): boolean;
        redo(): boolean;
        undo(): boolean;
    }
}
