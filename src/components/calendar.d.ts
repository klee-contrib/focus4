
declare module "react-toolbox/lib/date_picker/theme.css";

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
