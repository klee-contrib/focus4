import {useCallback, useEffect, useRef, useState} from "react";
import {TIME_PICKER} from "react-toolbox/lib/identifiers";
import {TimePickerTheme} from "react-toolbox/lib/time_picker";
import timeUtils from "react-toolbox/lib/utils/time";
import {CSSTransition, TransitionGroup} from "react-transition-group";

import {CSSProp, cssTransitionProps, fromBem, useTheme} from "@focus4/styling";
import rtTimePickerTheme from "react-toolbox/components/time_picker/theme.css";
const timePickerTheme: TimePickerTheme = rtTimePickerTheme;
export {timePickerTheme, TimePickerTheme};

import {Hours} from "./hours";
import {Minutes} from "./minutes";

export interface ClockProps {
    display?: "hours" | "minutes";
    format?: "24hr" | "ampm";
    onChange?: (date: Date) => void;
    onHandMoved?: () => void;
    theme?: CSSProp<TimePickerTheme>;
    time?: Date;
}

export function Clock({
    display = "hours",
    format = "24hr",
    onChange,
    onHandMoved,
    theme: pTheme,
    time = new Date()
}: ClockProps) {
    const theme = useTheme(TIME_PICKER, timePickerTheme, pTheme);

    const placeholderNode = useRef<HTMLDivElement | null>(null);
    const [center, setCenter] = useState({x: 0, y: 0});
    const [radius, setRadius] = useState(0);

    useEffect(() => {
        const handleCalculateShape = () => {
            const {top, left, width} = placeholderNode.current!.getBoundingClientRect();
            setCenter({
                x: left + (width / 2 - window.pageXOffset),
                y: top + (width / 2 - window.pageXOffset)
            });
            setRadius(width / 2);
        };
        setTimeout(handleCalculateShape);

        const scrollParent = getScrollParent(placeholderNode.current!);
        window.addEventListener("resize", handleCalculateShape);
        window.addEventListener("scroll", handleCalculateShape);
        scrollParent.addEventListener("scroll", handleCalculateShape);
        return () => {
            window.removeEventListener("resize", handleCalculateShape);
            window.removeEventListener("scroll", handleCalculateShape);
            scrollParent.removeEventListener("scroll", handleCalculateShape);
        };
    }, []);

    const adaptHourToFormat = useCallback(
        (hour: number) => {
            if (format === "ampm") {
                if (timeUtils.getTimeMode(time) === "pm") {
                    return hour < 12 ? hour + 12 : hour;
                }
                return hour === 12 ? 0 : hour;
            }
            return hour;
        },
        [format, time]
    );

    const handleHourChange = useCallback(
        (hours: number) => {
            if (time.getHours() !== hours) {
                onChange?.(timeUtils.setHours(time, adaptHourToFormat(hours)));
            }
        },
        [adaptHourToFormat, onChange, time]
    );

    const handleMinuteChange = useCallback(
        (minutes: number) => {
            if (time.getMinutes() !== minutes) {
                onChange?.(timeUtils.setMinutes(time, minutes));
            }
        },
        [onChange, time]
    );

    const css = fromBem(theme) as any;
    return (
        <div data-react-toolbox="clock" className={theme.clock()}>
            <div className={theme.placeholder()} style={{height: radius * 2}} ref={placeholderNode}>
                <TransitionGroup component={null}>
                    <CSSTransition
                        key={display}
                        {...cssTransitionProps(
                            display === "hours"
                                ? {
                                      enter: css.zoomOutEnter,
                                      enterActive: css.zoomOutEnterActive,
                                      exit: css.zoomOutLeave,
                                      exitActive: css.zoomOutLeaveActive
                                  }
                                : {
                                      enter: css.zoomInEnter,
                                      enterActive: css.zoomInEnterActive,
                                      exit: css.zoomInLeave,
                                      exitActive: css.zoomInLeaveActive
                                  }
                        )}
                    >
                        <div className={theme.clockWrapper()} style={{height: radius * 2}}>
                            {display === "hours" ? (
                                <Hours
                                    center={center}
                                    format={format}
                                    onChange={handleHourChange}
                                    onHandMoved={onHandMoved}
                                    radius={radius}
                                    selected={time.getHours()}
                                    spacing={radius * 0.18}
                                    theme={theme}
                                />
                            ) : (
                                <Minutes
                                    center={center}
                                    onChange={handleMinuteChange}
                                    onHandMoved={onHandMoved}
                                    radius={radius}
                                    selected={time.getMinutes()}
                                    spacing={radius * 0.18}
                                    theme={theme}
                                />
                            )}
                        </div>
                    </CSSTransition>
                </TransitionGroup>
            </div>
        </div>
    );
}

/** Retourne le parent le plus proche qui est scrollable. */
function getScrollParent(element: Element, includeHidden = false) {
    let style = getComputedStyle(element);
    const excludeStaticParent = style.position === "absolute";
    const overflowRegex = includeHidden ? /(auto|scroll|hidden)/ : /(auto|scroll)/;

    if (style.position === "fixed") {
        return document.body;
    }
    for (let parent: Element | null = element; (parent = parent.parentElement); ) {
        style = getComputedStyle(parent);
        if (excludeStaticParent && style.position === "static") {
            continue;
        }
        if (overflowRegex.test(style.overflow! + style.overflowY + style.overflowX)) {
            return parent;
        }
    }

    return document.body;
}
