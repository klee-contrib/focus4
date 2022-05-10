import {range} from "lodash";
import {MouseEvent, TouchEvent, useCallback, useRef} from "react";

import {ToBem} from "@focus4/styling";

import {Face} from "./face";
import {Hand, HandRef} from "./hand";

import {ClockCss} from "../__style__/clock.css";

const minutes = range(0, 12).map(i => i * 5);
const step = 360 / 60;

export interface MinutesProps {
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

export function Minutes({center, onChange, onHandMoved, radius, selected, spacing, theme}: MinutesProps) {
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
