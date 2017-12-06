// Définitions de styles manquants de libraries externes pour pouvoir compiler certains composants.

declare module "smoothscroll-polyfill";

declare module "react-toolbox/lib/date_picker/theme.css";
declare module "react-toolbox/lib/time_picker/theme.css";

declare module "react-toolbox/lib/date_picker/Calendar" {

    interface CalendarProps {
        disabledDates?: Date[];
        display?: "months" | "years";
        enabledDates?: Date[];
        handleSelect?: Function
        locale?: string | {};
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
