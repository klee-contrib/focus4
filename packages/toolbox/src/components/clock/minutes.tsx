import {range} from "lodash";
import {useCallback, useRef} from "react";
import {TimePickerTheme} from "react-toolbox/lib/time_picker";

import {ToBem} from "@focus4/styling";

import {Face} from "./face";
import {Hand, HandRef} from "./hand";

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
    theme: ToBem<TimePickerTheme>;
}

export function Minutes({center, onChange, onHandMoved, radius, selected, spacing, theme}: MinutesProps) {
    const handNode = useRef<HandRef | null>(null);

    const handleHandMove = useCallback(
        (degrees: number) => {
            onChange(degrees / step);
        },
        [onChange]
    );

    const handleMouseDown = useCallback(event => {
        handNode.current?.mouseStart(event);
    }, []);

    const handleTouchStart = useCallback(event => {
        handNode.current?.touchStart(event);
    }, []);

    return (
        <div>
            <Face
                onTouchStart={handleTouchStart}
                onMouseDown={handleMouseDown}
                numbers={minutes}
                spacing={spacing}
                radius={radius}
                active={selected}
                theme={theme}
                twoDigits
            />
            <Hand
                ref={handNode}
                className={minutes.indexOf(selected) === -1 ? theme.small() : ""}
                angle={selected * step}
                length={radius - spacing}
                onMove={handleHandMove}
                onMoved={onHandMoved}
                origin={center}
                theme={theme}
                step={step}
            />
        </div>
    );
}
