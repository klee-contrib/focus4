import {forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState} from "react";
import {TimePickerTheme} from "react-toolbox/lib/time_picker";
import events from "react-toolbox/lib/utils/events";
import prefixer from "react-toolbox/lib/utils/prefixer";
import {angle360FromPositions} from "react-toolbox/lib/utils/utils";

import {ToBem} from "@focus4/styling";

export interface HandProps {
    angle: number;
    className?: string;
    length: number;
    onMove: (angle: number, radius: number) => void;
    onMoved?: () => void;
    origin: {
        x: number;
        y: number;
    };
    step: number;
    theme: ToBem<TimePickerTheme>;
}

export interface HandRef {
    mouseStart(event: MouseEvent): void;
    touchStart(event: TouchEvent): void;
}

export const Hand = forwardRef<HandRef, HandProps>(function RTHand(
    {angle, className = "", length = 0, onMove, onMoved, origin, step, theme},
    ref
) {
    const [knobWidth, setKnobWidth] = useState(0);
    const knobNode = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        setTimeout(() => setKnobWidth(knobNode.current!.offsetWidth));
    }, []);

    const move = useCallback(
        position => {
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
                move(events.getMousePosition(event));
            },
            touchStart(event) {
                setTouched(true);
                move(events.getTouchPosition(event));
                events.pauseEvent(event);
            }
        }),
        [move]
    );

    useEffect(() => {
        if (moused) {
            const onMouseMove = (event: MouseEvent) => {
                move(events.getMousePosition(event));
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
            const onTouchMove = (event: TouchEvent) => {
                move(events.getTouchPosition(event));
            };
            const onTouchEnd = () => {
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

    const _className = `${theme.hand()} ${className}`;
    const handStyle = prefixer({
        height: length - knobWidth / 2,
        transform: `rotate(${angle}deg)`
    });

    return (
        <div className={_className} style={handStyle}>
            <div ref={knobNode} className={theme.knob()} />
        </div>
    );
});
