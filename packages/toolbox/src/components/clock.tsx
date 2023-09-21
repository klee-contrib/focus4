import {range} from "lodash";
import {
    forwardRef,
    MouseEvent,
    MouseEventHandler,
    TouchEvent,
    TouchEventHandler,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState
} from "react";
import {CSSTransition, TransitionGroup} from "react-transition-group";

import {CSSProp, cssTransitionProps, fromBem, ToBem, useTheme} from "@focus4/styling";

import clockCss, {ClockCss} from "./__style__/clock.css";
export {clockCss, ClockCss};

export interface ClockProps {
    display?: "hours" | "minutes";
    format?: "24hr" | "ampm";
    onChange?: (date: Date) => void;
    onHandMoved?: () => void;
    theme?: CSSProp<ClockCss>;
    time?: Date;
}

/**
 * Affiche une horloge. Utilisé par l'[`InputTime`](components/forms.md#inputdate).
 */
export function Clock({
    display = "hours",
    format = "24hr",
    onChange,
    onHandMoved,
    theme: pTheme,
    time = new Date()
}: ClockProps) {
    const theme = useTheme("RTClock", clockCss, pTheme);

    const placeholderNode = useRef<HTMLDivElement | null>(null);
    const [center, setCenter] = useState({x: 0, y: 0});
    const [radius, setRadius] = useState(0);

    useEffect(() => {
        const handleCalculateShape = () => {
            const {top, left, width, height} = placeholderNode.current!.getBoundingClientRect();
            setCenter({
                x: left + (width / 2 - window.pageXOffset),
                y: top + (height / 2 - window.pageXOffset)
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
                if (time.getHours() >= 12) {
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
                const newTime = new Date(time.getTime());
                newTime.setHours(adaptHourToFormat(hours));
                onChange?.(newTime);
            }
        },
        [adaptHourToFormat, onChange, time]
    );

    const handleMinuteChange = useCallback(
        (minutes: number) => {
            if (time.getMinutes() !== minutes) {
                const newTime = new Date(time.getTime());
                newTime.setMinutes(minutes);
                onChange?.(newTime);
            }
        },
        [onChange, time]
    );

    const css = fromBem(theme);
    return (
        <div className={theme.clock()} data-react-toolbox="clock">
            <div ref={placeholderNode} className={theme.placeholder()}>
                <TransitionGroup component={null}>
                    <CSSTransition
                        key={display}
                        {...cssTransitionProps(
                            display === "hours"
                                ? {
                                      enter: css.zoomOutEnter!,
                                      enterActive: css.zoomOutEnterActive!,
                                      exit: css.zoomOutLeave!,
                                      exitActive: css.zoomOutLeaveActive!
                                  }
                                : {
                                      enter: css.zoomInEnter!,
                                      enterActive: css.zoomInEnterActive!,
                                      exit: css.zoomInLeave!,
                                      exitActive: css.zoomInLeaveActive!
                                  }
                        )}
                    >
                        <div className={theme.clockWrapper()}>
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
        if (overflowRegex.test(style.overflow + style.overflowY + style.overflowX)) {
            return parent;
        }
    }

    return document.body;
}

const outerNumbers = [0, ...range(13, 24)];
const innerNumbers = [12, ...range(1, 12)];
const innerSpacing = 1.7;

interface HoursProps {
    center: {
        x: number;
        y: number;
    };
    format: "24hr" | "ampm";
    onChange: (value: number) => void;
    onHandMoved?: () => void;
    radius: number;
    selected: number;
    spacing: number;
    theme: ToBem<ClockCss>;
}

function Hours({center, format, onChange, onHandMoved, radius, selected, spacing, theme}: HoursProps) {
    const step = 360 / 12;

    const [inner, setInner] = useState(format === "24hr" && selected > 0 && selected <= 12);
    const handNode = useRef<HandRef | null>(null);

    const valueFromDegrees = useCallback(
        (degrees: number, newInner?: boolean) => {
            if (format === "ampm" || (format === "24hr" && (newInner ?? inner))) {
                return innerNumbers[degrees / step];
            }
            return outerNumbers[degrees / step];
        },
        [format, inner]
    );

    const handleHandMove = useCallback(
        (degrees: number, r: number) => {
            const currentInner = r < radius - spacing * innerSpacing;
            if (format === "24hr" && inner !== currentInner) {
                setInner(currentInner);
                onChange(valueFromDegrees(degrees, currentInner));
            } else {
                onChange(valueFromDegrees(degrees));
            }
        },
        [format, inner, onChange, radius, spacing, valueFromDegrees]
    );

    const handleMouseDown = useCallback((event: MouseEvent) => {
        handNode.current?.mouseStart(event);
    }, []);

    const handleTouchStart = useCallback((event: TouchEvent) => {
        handNode.current?.touchStart(event);
    }, []);

    const is24hr = format === "24hr";
    return (
        <div>
            <Face
                active={is24hr ? selected : selected % 12 || 12}
                numbers={is24hr ? outerNumbers : innerNumbers}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                radius={radius}
                spacing={spacing}
                theme={theme}
                twoDigits={is24hr}
            />
            {format !== "24hr" ? null : (
                <Face
                    active={selected}
                    numbers={innerNumbers}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleTouchStart}
                    radius={radius - spacing * innerSpacing}
                    spacing={spacing}
                    theme={theme}
                />
            )}
            <Hand
                ref={handNode}
                angle={selected * step}
                length={(inner ? radius - spacing * innerSpacing : radius) - spacing}
                onMove={handleHandMove}
                onMoved={onHandMoved}
                origin={center}
                step={step}
                theme={theme}
            />
        </div>
    );
}

const minutes = range(0, 12).map(i => i * 5);

interface MinutesProps {
    center: {
        x: number;
        y: number;
    };
    onChange: (value: number) => void;
    onHandMoved?: () => void;
    radius: number;
    selected: number;
    spacing: number;
    theme: ToBem<ClockCss>;
}

function Minutes({center, onChange, onHandMoved, radius, selected, spacing, theme}: MinutesProps) {
    const step = 360 / 60;

    const handNode = useRef<HandRef | null>(null);

    const handleHandMove = useCallback(
        (degrees: number) => {
            onChange(degrees / step);
        },
        [onChange]
    );

    const handleMouseDown = useCallback((event: MouseEvent) => {
        handNode.current?.mouseStart(event);
    }, []);

    const handleTouchStart = useCallback((event: TouchEvent) => {
        handNode.current?.touchStart(event);
    }, []);

    return (
        <div>
            <Face
                active={selected}
                numbers={minutes}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                radius={radius}
                spacing={spacing}
                theme={theme}
                twoDigits
            />
            <Hand
                ref={handNode}
                angle={selected * step}
                length={radius - spacing}
                onMove={handleHandMove}
                onMoved={onHandMoved}
                origin={center}
                small={!minutes.includes(selected)}
                step={step}
                theme={theme}
            />
        </div>
    );
}

interface HandProps {
    angle: number;
    length: number;
    onMove: (angle: number, radius: number) => void;
    onMoved?: () => void;
    origin: {
        x: number;
        y: number;
    };
    small?: boolean;
    step: number;
    theme: ToBem<ClockCss>;
}

interface HandRef {
    mouseStart(event: MouseEvent): void;
    touchStart(event: TouchEvent): void;
}

const Hand = forwardRef<HandRef, HandProps>(function RTHand(
    {angle, length = 0, onMove, onMoved, origin, small, step, theme},
    ref
) {
    const [knobWidth, setKnobWidth] = useState(0);
    const knobNode = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        setTimeout(() => knobNode.current && setKnobWidth(knobNode.current.offsetWidth));
    }, []);

    const move = useCallback(
        (position: {x: number; y: number}) => {
            const degrees = step * Math.round(angle360FromPositions(origin.x, origin.y, position.x, position.y) / step);
            const x = origin.x - position.x;
            const y = origin.y - position.y;
            const radius = Math.sqrt(x * x + y * y);
            onMove?.(degrees === 360 ? 0 : degrees, radius);
        },
        [onMove, origin, step]
    );

    const [moused, setMoused] = useState(false);
    const [touched, setTouched] = useState(false);
    useImperativeHandle(
        ref,
        () => ({
            mouseStart(event) {
                setMoused(true);
                move({
                    x: event.pageX - (window.scrollX || window.pageXOffset),
                    y: event.pageY - (window.scrollY || window.pageYOffset)
                });
            },
            touchStart(event) {
                setTouched(true);
                move({
                    x: event.touches[0].pageX - (window.scrollX || window.pageXOffset),
                    y: event.touches[0].pageY - (window.scrollY || window.pageYOffset)
                });
            }
        }),
        [move]
    );

    useEffect(() => {
        if (moused) {
            const onMouseMove = (event: globalThis.MouseEvent) => {
                move({
                    x: event.pageX - (window.scrollX || window.pageXOffset),
                    y: event.pageY - (window.scrollY || window.pageYOffset)
                });
            };
            const onMouseUp = () => {
                setMoused(false);
                onMoved?.();
            };
            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
            return () => {
                document.removeEventListener("mousemove", onMouseMove);
                document.removeEventListener("mouseup", onMouseUp);
            };
        }
    }, [moused, move, onMoved]);

    useEffect(() => {
        if (touched) {
            const onTouchMove = (event: globalThis.TouchEvent) => {
                move({
                    x: event.touches[0].pageX - (window.scrollX || window.pageXOffset),
                    y: event.touches[0].pageY - (window.scrollY || window.pageYOffset)
                });
            };
            const onTouchEnd = (event: globalThis.TouchEvent) => {
                event.preventDefault();
                setTouched(false);
                onMoved?.();
            };
            document.addEventListener("touchmove", onTouchMove);
            document.addEventListener("touchend", onTouchEnd);
            return () => {
                document.removeEventListener("touchmove", onTouchMove);
                document.removeEventListener("touchend", onTouchEnd);
            };
        }
    }, [move, onMoved, touched]);

    const handStyle = {
        height: length - knobWidth / 2,
        transform: `rotate(${angle}deg)`
    };

    return (
        <div className={theme.hand({small})} style={handStyle}>
            <div ref={knobNode} className={theme.knob()} />
        </div>
    );
});

function angle360FromPositions(cx: number, cy: number, ex: number, ey: number) {
    const angle = angleFromPositions(cx, cy, ex, ey);
    return angle < 0 ? 360 + angle : angle;
}

function angleFromPositions(cx: number, cy: number, ex: number, ey: number) {
    const theta = Math.atan2(ey - cy, ex - cx) + Math.PI / 2;
    return (theta * 180) / Math.PI;
}

interface FaceProps {
    active: number;
    numbers: number[];
    onMouseDown?: MouseEventHandler<HTMLDivElement>;
    onTouchStart?: TouchEventHandler<HTMLDivElement>;
    radius: number;
    spacing: number;
    theme: ToBem<ClockCss>;
    twoDigits?: boolean;
}

function Face({active, numbers, onMouseDown, onTouchStart, radius, spacing, theme, twoDigits = false}: FaceProps) {
    const numberStyle = useCallback(
        (rad: number, num: number) => ({
            position: "absolute" as const,
            left: rad + rad * Math.sin((((Math.PI / 180) * 360) / 12) * (num - 1)) + spacing,
            top: rad - rad * Math.cos((((Math.PI / 180) * 360) / 12) * (num - 1)) + spacing
        }),
        [spacing]
    );

    const faceStyle = useMemo(
        () => ({
            height: radius * 2,
            width: radius * 2
        }),
        [radius]
    );

    const renderNumber = useCallback(
        (n: number, idx: number) => (
            <span
                key={n}
                className={theme.number({active: n === active})}
                style={numberStyle(radius - spacing, idx + 1)}
            >
                {twoDigits ? `0${n}`.slice(-2) : n}
            </span>
        ),
        [active, numberStyle, radius, spacing, theme, twoDigits]
    );

    return (
        <div className={theme.face()} onMouseDown={onMouseDown} onTouchStart={onTouchStart} style={faceStyle}>
            {numbers.map(renderNumber)}
        </div>
    );
}
